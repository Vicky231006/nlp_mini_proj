const QUESTION_BANK_SIZE = 64;
const SESSION_SIZE = 25;
const OPTION_LABELS = ["A", "B", "C", "D"];
const CONSTRUCTS = {
  pattern_completion: {
    key: "pattern",
    label: "Pattern & Alternation"
  },
  spatial_transformation: {
    key: "spatial",
    label: "Spatial Transformation"
  },
  analogical_mapping: {
    key: "analogy",
    label: "Analogical Mapping"
  },
  multi_rule_reasoning: {
    key: "multirule",
    label: "Multi-Rule Integration"
  }
};
const SUPPORTED_SHAPES = new Set([
  "arrow", "backslash", "car", "circle", "clock", "concentric_rings", "crescent",
  "cross", "cross_sm", "dash_sm", "diagonal_slash", "diamond", "dot", "hexagon",
  "heptagon", "house", "l_shape", "l_shape_reflected", "line_horiz", "line_vert", "lines_combo",
  "pentagon", "plus_composite", "square", "star", "t_shape", "traffic_light", "triangle"
]);
const SUPPORTED_POSITIONS = new Set([
  "left", "midleft", "center", "midright", "right", "top", "bottom",
  "corner_tl", "corner_tr", "corner_br", "corner_bl",
  "grid_tl", "grid_tc", "grid_tr", "grid_ml", "grid_mc", "grid_mr", "grid_bl", "grid_bc", "grid_br"
]);

const state = {
  grade: 2,
  index: 0,
  items: [],
  answers: [],
  latencies: [],
  elapsedByItem: [],
  optionOrders: [],
  itemStartedAt: null,
  startedAt: null,
  timerId: null,
  finishedAt: null
};

const $ = (selector) => document.querySelector(selector);
const screens = [$("#screen-welcome"), $("#screen-test"), $("#screen-results")];

function validateItemBank() {
  if (!Array.isArray(window.ITEM_BANK) || window.ITEM_BANK.length !== QUESTION_BANK_SIZE) {
    throw new Error(`Expected ${QUESTION_BANK_SIZE} assessment questions.`);
  }

  const seenIds = new Set();
  for (const [index, item] of window.ITEM_BANK.entries()) {
    const expectedId = `Q${String(index + 1).padStart(2, "0")}`;
    if (item.id !== expectedId || seenIds.has(item.id)) {
      throw new Error(`Question ${index + 1} has a missing, duplicate, or out-of-order ID.`);
    }
    seenIds.add(item.id);
    if (!CONSTRUCTS[item.construct] || ![1, 2, 3, 4, 5].includes(item.tier)) {
      throw new Error(`${item.id} has an unsupported tier or reasoning construct.`);
    }
    const expectedCells = item.format === "1x4" ? 4 : item.format === "2x2" ? 4 : item.format === "3x3" ? 9 : 0;
    if (item.stimulus.length !== expectedCells || item.stimulus.at(-1) !== null) {
      throw new Error(`${item.id} has an invalid matrix format or missing-cell position.`);
    }
    if (item.options.length !== OPTION_LABELS.length
      || new Set(item.options.map((option) => option.id)).size !== OPTION_LABELS.length
      || item.options.some((option) => typeof option.rationale !== "string" || option.rationale.length === 0)
      || item.options.filter((option) => option.correct).length !== 1) {
      throw new Error(`${item.id} must have four choices and exactly one answer key.`);
    }
    for (const shape of [...item.stimulus.filter(Boolean).flatMap((cell) => cell.shapes), ...item.options.flatMap((option) => option.shapes)]) {
      if (!SUPPORTED_SHAPES.has(shape.type)) {
        throw new Error(`${item.id} uses an unsupported visual shape: ${shape.type}`);
      }
      if (shape.pos && !SUPPORTED_POSITIONS.has(shape.pos)) {
        throw new Error(`${item.id} uses an unsupported visual position: ${shape.pos}`);
      }
      const minimumItemsPerConstruct = Math.ceil(SESSION_SIZE / Object.keys(CONSTRUCTS).length);
      for (const construct of Object.keys(CONSTRUCTS)) {
        const count = window.ITEM_BANK.filter((item) => item.construct === construct).length;
        if (count < minimumItemsPerConstruct) {
          throw new Error(`${construct} needs at least ${minimumItemsPerConstruct} questions for balanced sessions.`);
        }
      }
    }
  }
}

function showScreen(screen) {
  for (const current of screens) current.classList.toggle("active", current === screen);
}

function startAssessment() {
  state.index = 0;
  const itemGroups = Object.keys(CONSTRUCTS).map((construct) => ({
    construct,
    items: shuffle(window.ITEM_BANK.filter((item) => item.construct === construct))
  }));
  const groupOrder = shuffle(itemGroups);
  const baseQuota = Math.floor(SESSION_SIZE / groupOrder.length);
  const extraQuotas = new Set(groupOrder.slice(0, SESSION_SIZE % groupOrder.length).map((group) => group.construct));
  state.items = shuffle(groupOrder.flatMap((group) =>
    group.items.slice(0, baseQuota + Number(extraQuotas.has(group.construct)))
  ));
  state.answers = Array(SESSION_SIZE).fill(null);
  state.latencies = Array(SESSION_SIZE).fill(null);
  state.elapsedByItem = Array(SESSION_SIZE).fill(0);
  const correctPositions = Array.from({ length: SESSION_SIZE }, (_, index) => index % OPTION_LABELS.length);
  shuffle(correctPositions);
  state.optionOrders = state.items.map((item, index) => {
    const correct = item.options.find((option) => option.correct);
    const distractors = shuffle(item.options.filter((option) => !option.correct));
    const options = [...distractors];
    options.splice(correctPositions[index], 0, correct);
    return options;
  });
  state.startedAt = Date.now();
  state.finishedAt = null;
  state.itemStartedAt = Date.now();
  showScreen($("#screen-test"));
  renderQuestion();
  updateTimer();
  state.timerId = window.setInterval(updateTimer, 1000);
}

function updateTimer() {
  const end = state.finishedAt || Date.now();
  const totalSeconds = Math.floor((end - state.startedAt) / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  $("#session-timer").textContent = `${minutes}:${seconds}`;
}

function renderQuestion() {
  const item = state.items[state.index];
  const options = state.optionOrders[state.index] || item.options;
  $("#item-header-counter").textContent = `Item ${state.index + 1} of ${SESSION_SIZE}`;
  $("#item-tier-badge").textContent = `Tier ${item.tier}`;
  $("#item-construct-badge").textContent = CONSTRUCTS[item.construct].label;

  const progress = ((state.index + 1) / SESSION_SIZE) * 100;
  $("#assessment-progress").style.width = `${progress}%`;
  $("#progress-thumb").style.left = `${progress}%`;
  $("#progress-track").setAttribute("aria-valuenow", String(state.index + 1));

  const matrix = $("#matrix-render-target");
  matrix.className = `matrix-display grid-${item.format}`;
  matrix.setAttribute("aria-label", `${item.format.replace("x", " by ")} reasoning matrix`);
  matrix.replaceChildren(...item.stimulus.map((cell, cellIndex) => {
    const element = document.createElement("div");
    element.className = `matrix-cell${cell === null ? " target-missing" : ""}`;
    element.setAttribute("aria-label", cell === null ? "Missing cell" : `Matrix cell ${cellIndex + 1}`);
    if (cell === null) {
      element.innerHTML = '<span class="q-mark" aria-hidden="true">?</span>';
    } else {
      element.append(renderVisual(cell.shapes));
    }
    return element;
  }));

  const selected = state.answers[state.index];
  $("#options-render-target").replaceChildren(...options.map((option, optionIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `option-card${selected === option.id ? " selected" : ""}`;
    button.setAttribute("aria-pressed", String(selected === option.id));
    button.setAttribute("aria-label", `Option ${OPTION_LABELS[optionIndex]}`);
    button.dataset.optionId = option.id;
    button.addEventListener("click", () => selectAnswer(option.id));

    const badge = document.createElement("span");
    badge.className = "option-badge";
    badge.textContent = OPTION_LABELS[optionIndex];
    const visual = document.createElement("span");
    visual.className = "option-svg-wrapper";
    visual.append(renderVisual(option.shapes));
    button.append(badge, visual);
    return button;
  }));

  $("#prev-btn").disabled = state.index === 0;
  $("#next-btn").disabled = false;
  $("#next-btn").textContent = state.index === SESSION_SIZE - 1 ? "Finish Assessment" : "Confirm & Next →";
  renderNavigator();
}

function selectAnswer(optionId) {
  if (state.latencies[state.index] === null) {
    state.latencies[state.index] = state.elapsedByItem[state.index]
      + Math.max(0, (Date.now() - state.itemStartedAt) / 1000);
  }
  state.answers[state.index] = optionId;
  renderQuestion();
}

function moveTo(index) {
  if (state.latencies[state.index] === null) {
    state.elapsedByItem[state.index] += Math.max(0, (Date.now() - state.itemStartedAt) / 1000);
  }
  state.index = index;
  state.itemStartedAt = Date.now();
  renderQuestion();
}

function nextQuestion() {
  if (state.answers[state.index] === null && !window.confirm("This question is unanswered. Continue without an answer?")) {
    return;
  }
  if (state.index === SESSION_SIZE - 1) {
    finishAssessment();
    return;
  }
  moveTo(state.index + 1);
}

function renderNavigator() {
  $("#nav-jump-container").replaceChildren(...state.items.map((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `jump-btn${index === state.index ? " active" : ""}${state.answers[index] ? " answered" : ""}`;
    button.textContent = String(index + 1);
    button.setAttribute("aria-label", `Go to question ${index + 1}${state.answers[index] ? ", answered" : ", unanswered"}`);
    if (index === state.index) button.setAttribute("aria-current", "step");
    button.addEventListener("click", () => {
      moveTo(index);
      closeNavigator();
    });
    return button;
  }));
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

function openNavigator() {
  $("#nav-modal").classList.add("open");
  $("#close-nav-btn").focus();
}

function closeNavigator() {
  $("#nav-modal").classList.remove("open");
  $("#open-nav-btn").focus();
}

function finishAssessment() {
  state.finishedAt = Date.now();
  window.clearInterval(state.timerId);
  state.timerId = null;
  updateTimer();
  renderResults();
  showScreen($("#screen-results"));
}

function calculateResults() {
  const totals = {};
  for (const [key, construct] of Object.entries(CONSTRUCTS)) {
    totals[key] = {
      ...construct,
      total: state.items.filter((item) => item.construct === key).length,
      correct: 0
    };
  }
  let correct = 0;
  let answered = 0;
  const responseTimes = state.latencies.filter((value) => value !== null);
  state.items.forEach((item, index) => {
    const answer = state.answers[index];
    if (answer === null) return;
    answered += 1;
    const isCorrect = item.options.find((option) => option.id === answer)?.correct === true;
    if (isCorrect) {
      correct += 1;
      totals[item.construct].correct += 1;
    }
  });
  return {
    correct,
    answered,
    unanswered: SESSION_SIZE - answered,
    total: SESSION_SIZE,
    totals,
    elapsedSeconds: Math.floor((state.finishedAt - state.startedAt) / 1000),
    averageFirstResponseTimeSeconds: responseTimes.length
      ? responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length
      : null
  };
}

function renderResults() {
  const results = calculateResults();
  $("#res-score").textContent = `${results.correct}/${results.total}`;
  $("#res-latency").textContent = results.averageFirstResponseTimeSeconds === null
    ? "—"
    : `${results.averageFirstResponseTimeSeconds.toFixed(1)}s`;
  $("#res-answered").textContent = `Answered ${results.answered}/${results.total} · ${results.unanswered} unanswered`;

  for (const values of Object.values(results.totals)) {
    const percent = values.total ? Math.round((values.correct / values.total) * 100) : 0;
    $(`#meter-val-${values.key}`).textContent = values.total ? `${values.correct}/${values.total} · ${percent}%` : "Not sampled";
    const bar = $(`#meter-bar-${values.key}`);
    bar.style.width = `${percent}%`;
    const track = bar.parentElement;
    track.hidden = values.total === 0;
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-label", `${values.label} observed correct items`);
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "100");
    track.setAttribute("aria-valuenow", String(percent));
  }
  $("#tutor-rec-step").textContent = "Review a missed or uncertain item and ask the learner to explain the rule they noticed.";
  $("#tutor-rec-visual").textContent = "Try a similar puzzle together using familiar shapes, counters, or a simple grid.";
  renderReview();
}

function renderReview() {
  const detail = $("#review-detail-box");
  detail.replaceChildren();
  detail.hidden = true;
  $("#review-chips-container").replaceChildren(...state.items.map((item, index) => {
    const correctOption = item.options.find((option) => option.correct);
    const selectedOption = item.options.find((option) => option.id === state.answers[index]);
    const button = document.createElement("button");
    button.type = "button";
    const status = selectedOption?.correct ? "correct" : selectedOption ? "incorrect" : "unanswered";
    button.className = `review-chip ${status}`;
    button.textContent = String(index + 1);
    button.setAttribute("aria-label", `Question ${index + 1}: ${status}`);
    button.addEventListener("click", () => {
      const detail = $("#review-detail-box");
      const selectedText = selectedOption
        ? `Your answer: ${selectedOption.id.slice(-1).toUpperCase()}. ${selectedOption.rationale}`
        : "Your answer: not answered.";
      detail.replaceChildren();
      const heading = document.createElement("strong");
      heading.textContent = `Question ${index + 1} · ${status}`;
      const body = document.createElement("span");
      body.textContent = `${selectedText} Correct answer: ${correctOption.id.slice(-1).toUpperCase()}. ${correctOption.rationale}`;
      detail.append(heading, document.createElement("br"), body);
      detail.hidden = false;
    });
    return button;
  }));
}

function renderVisual(shapes) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("class", "visual-unit");
  svg.setAttribute("aria-hidden", "true");
  const dotGroups = new Map();
  shapes.forEach((shape, shapeIndex) => {
    if (shape.type !== "dot") return;
    const key = shape.pos || "center";
    if (!dotGroups.has(key)) dotGroups.set(key, []);
    dotGroups.get(key).push(shapeIndex);
  });
  const dotOffsets = new Map();
  for (const indexes of dotGroups.values()) {
    indexes.forEach((shapeIndex, index) => {
      dotOffsets.set(shapeIndex, indexes.length > 1 ? (index - (indexes.length - 1) / 2) * 14 : 0);
    });
  }
  svg.innerHTML = `<defs><pattern id="shade-${renderVisual.nextId}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="6" height="6" fill="#e2e8f0"/><line x1="0" y1="0" x2="0" y2="6" stroke="#64748b" stroke-width="2"/></pattern></defs>${shapes.map((shape, shapeIndex) => renderShape(shape, renderVisual.nextId, shapeIndex, dotOffsets.get(shapeIndex) || 0)).join("")}`;
  renderVisual.nextId += 1;
  return svg;
}
renderVisual.nextId = 0;

function renderShape(shape, id, shapeIndex, dotOffset) {
  const fill = shape.fill === "outline" ? "white" : shape.fill === "shaded" ? `url(#shade-${id})` : "#334155";
  const stroke = "#334155";
  const scale = { small: 0.55, med: 0.74, large: 0.92, xlarge: 1.08 }[shape.scale] || 0.82;
  const position = {
    left: [27, 50], midleft: [39, 50], center: [50, 50], midright: [61, 50], right: [73, 50],
    top: [50, 27], bottom: [50, 73], corner_tl: [25, 25], corner_tr: [75, 25],
    corner_br: [75, 75], corner_bl: [25, 75],
    grid_tl: [25, 25], grid_tc: [50, 25], grid_tr: [75, 25],
    grid_ml: [25, 50], grid_mc: [50, 50], grid_mr: [75, 50],
    grid_bl: [25, 75], grid_bc: [50, 75], grid_br: [75, 75]
  }[shape.pos] || [50, 50];
  const common = `fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
  const polygon = (sides, rotation = -90) => {
    const points = Array.from({ length: sides }, (_, index) => {
      const angle = ((rotation + index * 360 / sides) * Math.PI) / 180;
      return `${50 + 37 * Math.cos(angle)},${50 + 37 * Math.sin(angle)}`;
    }).join(" ");
    return `<polygon points="${points}" ${common}/>`;
  };
  let graphic;
  switch (shape.type) {
    case "circle": graphic = `<circle cx="50" cy="50" r="34" ${common}/>`; break;
    case "dot": {
      const count = Math.max(1, Math.min(shape.count || 1, 9));
      if (count === 1) {
        graphic = `<circle cx="50" cy="50" r="9" ${common}/>`;
      } else {
        const coords = count <= 4 ? [[38, 38], [62, 38], [38, 62], [62, 62]] : [[50, 32], [68, 43], [61, 63], [39, 63], [32, 43], [50, 50], [50, 80], [20, 50], [80, 50]];
        graphic = coords.slice(0, count).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${count > 4 ? 6 : 7}" ${common}/>`).join("");
      }
      break;
    }
    case "square": graphic = polygon(4, -45); break;
    case "triangle": graphic = polygon(3); break;
    case "diamond": graphic = polygon(4); break;
    case "pentagon": graphic = polygon(5); break;
    case "hexagon": graphic = polygon(6); break;
    case "heptagon": graphic = polygon(7); break;
    case "star": {
      const points = Array.from({ length: 10 }, (_, index) => {
        const radius = index % 2 === 0 ? 38 : 17;
        const angle = ((-90 + index * 36) * Math.PI) / 180;
        return `${50 + radius * Math.cos(angle)},${50 + radius * Math.sin(angle)}`;
      }).join(" ");
      graphic = `<polygon points="${points}" ${common}/>`;
      break;
    }
    case "arrow": graphic = `<path d="M50 8 L86 52 H65 V92 H35 V52 H14 Z" ${common}/>`; break;
    case "cross":
    case "cross_sm": graphic = `<path d="M42 12 H58 V42 H88 V58 H58 V88 H42 V58 H12 V42 H42 Z" ${common}/>`; break;
    case "plus_composite": graphic = `<path d="M44 12 H56 V44 H88 V56 H56 V88 H44 V56 H12 V44 H44 Z" ${common}/>`; break;
    case "line_horiz": graphic = `<path d="M12 50 H88" fill="none" stroke="${stroke}" stroke-width="6"/>`; break;
    case "line_vert": graphic = `<path d="M50 12 V88" fill="none" stroke="${stroke}" stroke-width="6"/>`; break;
    case "diagonal_slash": graphic = `<path d="M20 80 L80 20" fill="none" stroke="${stroke}" stroke-width="6"/>`; break;
    case "backslash": graphic = `<path d="M20 20 L80 80" fill="none" stroke="${stroke}" stroke-width="6"/>`; break;
    case "dash_sm": graphic = `<path d="M34 50 H66" fill="none" stroke="${stroke}" stroke-width="7"/>`; break;
    case "l_shape":
    case "l_shape_reflected": graphic = shape.type === "l_shape"
      ? `<path d="M32 16 V72 H80" fill="none" stroke="${stroke}" stroke-width="12" stroke-linecap="square"/>`
      : `<path d="M68 16 V72 H20" fill="none" stroke="${stroke}" stroke-width="12" stroke-linecap="square"/>`;
      break;
    case "t_shape": graphic = `<path d="M16 25 H84 M50 25 V84" fill="none" stroke="${stroke}" stroke-width="12" stroke-linecap="square"/>`; break;
    case "crescent": graphic = `<path d="M68 16 A38 38 0 1 0 68 84 A27 38 0 0 1 68 16 Z" ${common}/>`; break;
    case "clock": {
      const hour = shape.hourAngle || 0;
      const minute = shape.minuteAngle;
      const hand = (angle, length, width) => {
        const radians = (angle * Math.PI) / 180;
        return `<line x1="50" y1="50" x2="${50 + Math.sin(radians) * length}" y2="${50 - Math.cos(radians) * length}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>`;
      };
      graphic = `<circle cx="50" cy="50" r="38" fill="white" stroke="${stroke}" stroke-width="4"/>${Array.from({ length: 12 }, (_, index) => `<circle cx="${50 + 31 * Math.sin(index * Math.PI / 6)}" cy="${50 - 31 * Math.cos(index * Math.PI / 6)}" r="1.8" fill="${stroke}"/>`).join("")}${hand(hour, 20, 4)}${hand(minute === undefined ? hour : minute, 29, 3)}<circle cx="50" cy="50" r="3" fill="${stroke}"/>`;
      break;
    }
    case "concentric_rings": {
      const count = Math.max(1, Math.min(shape.count || 1, 5));
      const rings = Array.from({ length: count }, (_, index) => `<circle cx="50" cy="50" r="${38 - index * 9}" fill="none" stroke="${stroke}" stroke-width="3"/>`).join("");
      const angle = ((shape.rot || 0) * Math.PI) / 180;
      const marker = `<line x1="50" y1="50" x2="${50 + 34 * Math.sin(angle)}" y2="${50 - 34 * Math.cos(angle)}" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>`;
      const dotFill = shape.dotFill === "outline" ? "white" : stroke;
      graphic = `${rings}${marker}<circle cx="50" cy="50" r="6" fill="${dotFill}" stroke="${stroke}" stroke-width="3"/>`;
      break;
    }
    case "lines_combo": {
      const vertical = Math.max(1, Math.min(shape.vert || 1, 4));
      const horizontal = Math.max(1, Math.min(shape.horiz || 1, 4));
      const verticalLines = Array.from({ length: vertical }, (_, index) => {
        const x = 50 + (index - (vertical - 1) / 2) * 18;
        return `<line x1="${x}" y1="18" x2="${x}" y2="82" stroke="${stroke}" stroke-width="4"/>`;
      }).join("");
      const horizontalLines = Array.from({ length: horizontal }, (_, index) => {
        const y = 50 + (index - (horizontal - 1) / 2) * 18;
        return `<line x1="18" y1="${y}" x2="82" y2="${y}" stroke="${stroke}" stroke-width="4"/>`;
      }).join("");
      graphic = verticalLines + horizontalLines;
      break;
    }
    case "traffic_light": {
      const colors = { red: "#ef4444", yellow: "#facc15", green: "#22c55e" };
      graphic = `<rect x="30" y="8" width="40" height="84" rx="15" fill="#1e293b"/>${["red", "yellow", "green"].map((color, index) => `<circle cx="50" cy="${27 + index * 23}" r="8" fill="${shape.active === color ? colors[color] : "#64748b"}" stroke="${shape.active === color ? "white" : "#334155"}" stroke-width="2"/>`).join("")}`;
      break;
    }
    case "car": {
      const colors = { red: "#ef4444", blue: "#3b82f6", yellow: "#eab308", green: "#22c55e" };
      graphic = `<path d="M18 62 L25 42 H39 L47 28 H68 L80 44 L87 50 V70 H18 Z" fill="${colors[shape.color] || "#64748b"}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/><path d="M43 42 L49 32 H64 L72 44 Z" fill="#dbeafe" stroke="${stroke}" stroke-width="2"/><circle cx="34" cy="70" r="8" fill="#1e293b"/><circle cx="72" cy="70" r="8" fill="#1e293b"/>`;
      break;
    }
    case "house": {
      const stage = shape.stage || 1;
      graphic = `<path d="M12 78 H88" stroke="#475569" stroke-width="4"/>${stage >= 1 ? '<rect x="30" y="56" width="40" height="22" fill="#fef3c7" stroke="#334155" stroke-width="3"/>' : ""}${stage >= 2 ? '<rect x="30" y="38" width="40" height="40" fill="#fef3c7" stroke="#334155" stroke-width="3"/>' : ""}${stage >= 3 ? '<path d="M24 39 L50 16 L76 39 Z" fill="#ef4444" stroke="#334155" stroke-width="3"/>' : ""}${stage >= 4 ? '<path d="M15 76 Q20 64 25 76 M75 76 Q80 64 85 76" fill="none" stroke="#22c55e" stroke-width="4"/>' : ""}`;
      break;
    }
    default: throw new Error(`No visual renderer exists for shape "${shape.type}".`);
  }

  const [baseX, baseY] = position;
  const x = baseX + (shape.type === "dot" ? dotOffset : 0);
  const y = baseY;
  const rotation = shape.rot || 0;
  const symbolGroup = shape.count > 1 && shape.type !== "dot"
    ? Array.from({ length: Math.min(shape.count, 9) }, (_, index) => {
      const coords = [[36, 36], [64, 36], [36, 64], [64, 64], [50, 50], [50, 22], [78, 50], [50, 78], [22, 50]];
      const [cx, cy] = coords[index];
      return `<g transform="translate(${cx - 50} ${cy - 50}) scale(0.45)">${graphic}</g>`;
    }).join("")
    : graphic;
  const segments = Math.max(0, Math.min(shape.seg || 0, 8));
  let segmentOverlay = "";
  if (segments > 1 && ["circle", "square", "diamond", "triangle", "pentagon", "hexagon", "heptagon", "star"].includes(shape.type)) {
    const clipId = `segment-clip-${id}-${shapeIndex}`;
    const rays = Array.from({ length: segments }, (_, index) => {
      const angle = (index * 2 * Math.PI) / segments;
      return `<line x1="50" y1="50" x2="${50 + 45 * Math.cos(angle)}" y2="${50 + 45 * Math.sin(angle)}" stroke="${stroke}" stroke-width="2"/>`;
    }).join("");
    segmentOverlay = `<defs><clipPath id="${clipId}">${graphic}</clipPath></defs><g clip-path="url(#${clipId})">${rays}</g>`;
  }
  return `<g transform="translate(${x - 50} ${y - 50})"><g transform="translate(50 50) rotate(${rotation}) scale(${scale}) translate(-50 -50)">${symbolGroup}${segmentOverlay}</g></g>`;
}

function exportResults() {
  const results = calculateResults();
  const payload = {
    activity: "Visual Matrix Reasoning Activity",
    grade: state.grade,
    completedAt: new Date(state.finishedAt).toISOString(),
    elapsedSeconds: results.elapsedSeconds,
    score: { correct: results.correct, total: results.total, answered: results.answered, unanswered: results.unanswered },
    itemTagSummaries: Object.fromEntries(Object.entries(results.totals).map(([key, value]) => [
      key, {
        correct: value.correct,
        total: value.total,
        percent: value.total ? Math.round((value.correct / value.total) * 100) : null
      }
    ])),
    averageFirstResponseTimeSeconds: results.averageFirstResponseTimeSeconds === null
      ? null
      : Number(results.averageFirstResponseTimeSeconds.toFixed(2)),
    sampleSize: SESSION_SIZE,
    questionBankSize: QUESTION_BANK_SIZE,
    sampledQuestionIds: state.items.map((item) => item.id),
    answers: state.items.map((item, index) => ({
      sessionQuestionNumber: index + 1,
      questionId: item.id,
      itemTag: item.construct,
      selectedOption: state.answers[index],
      correct: item.options.find((option) => option.id === state.answers[index])?.correct || false,
      firstResponseTimeSeconds: state.latencies[index] === null ? null : Number(state.latencies[index].toFixed(2))
    }))
  };
  const file = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.className = "download-link";
  link.setAttribute("aria-hidden", "true");
  link.tabIndex = -1;
  link.download = "visual-reasoning-results.json";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

$("#grade-selector").addEventListener("click", (event) => {
  const button = event.target.closest("[data-grade]");
  if (!button) return;
  state.grade = Number(button.dataset.grade);
  for (const gradeButton of $("#grade-selector").querySelectorAll("[data-grade]")) {
    const selected = gradeButton === button;
    gradeButton.classList.toggle("selected", selected);
    gradeButton.setAttribute("aria-pressed", String(selected));
  }
});
$("#start-btn").addEventListener("click", startAssessment);
$("#prev-btn").addEventListener("click", () => moveTo(Math.max(0, state.index - 1)));
$("#next-btn").addEventListener("click", nextQuestion);
$("#open-nav-btn").addEventListener("click", openNavigator);
$("#close-nav-btn").addEventListener("click", closeNavigator);
$("#nav-modal").addEventListener("click", (event) => {
  if (event.target === $("#nav-modal")) closeNavigator();
});
$("#restart-btn").addEventListener("click", () => {
  if (state.timerId) window.clearInterval(state.timerId);
  state.timerId = null;
  showScreen($("#screen-welcome"));
});
$("#export-json-btn").addEventListener("click", exportResults);
document.addEventListener("keydown", (event) => {
  if ($("#nav-modal").classList.contains("open")) {
    if (event.key === "Escape") closeNavigator();
    return;
  }
  if (!$("#screen-test").classList.contains("active")) return;
  const answerIndex = /^[1-4]$/.test(event.key) ? Number(event.key) - 1 : "abcd".indexOf(event.key.toLowerCase());
  if (answerIndex >= 0 && answerIndex < OPTION_LABELS.length) {
    event.preventDefault();
    selectAnswer(state.optionOrders[state.index][answerIndex].id);
  } else if (event.key === "ArrowLeft" && state.index > 0) {
    moveTo(state.index - 1);
  } else if (event.key === "ArrowRight" && state.index < SESSION_SIZE - 1 && state.answers[state.index] !== null) {
    moveTo(state.index + 1);
  } else if (event.key === "Enter" && !$("#next-btn").disabled) {
    nextQuestion();
  }
});

validateItemBank();
for (const button of $("#grade-selector").querySelectorAll("[data-grade]")) {
  button.setAttribute("aria-pressed", String(Number(button.dataset.grade) === state.grade));
}
$("#progress-track").setAttribute("role", "progressbar");
$("#progress-track").setAttribute("aria-label", "Assessment progress");
$("#progress-track").setAttribute("aria-valuemin", "1");
$("#progress-track").setAttribute("aria-valuemax", String(SESSION_SIZE));
$("#res-answered").textContent = `Answered 0/${SESSION_SIZE}`;
