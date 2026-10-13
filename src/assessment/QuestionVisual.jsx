import React, { useId } from 'react';

const positions = {
  left: [27, 50], midleft: [39, 50], center: [50, 50], midright: [61, 50], right: [73, 50],
  top: [50, 27], bottom: [50, 73], corner_tl: [25, 25], corner_tr: [75, 25],
  corner_br: [75, 75], corner_bl: [25, 75],
  grid_tl: [25, 25], grid_tc: [50, 25], grid_tr: [75, 25],
  grid_ml: [25, 50], grid_mc: [50, 50], grid_mr: [75, 50],
  grid_bl: [25, 75], grid_bc: [50, 75], grid_br: [75, 75]
};

const polygonSides = {
  square: 4,
  triangle: 3,
  diamond: 4,
  pentagon: 5,
  hexagon: 6,
  heptagon: 7
};

function renderShape(shape, id, shapeIndex, dotOffset) {
  const fill = shape.fill === 'outline'
    ? 'white'
    : shape.fill === 'shaded'
      ? `url(#shade-${id})`
      : '#334155';
  const stroke = '#334155';
  const scale = { small: 0.55, med: 0.74, large: 0.92, xlarge: 1.08 }[shape.scale] || 0.82;
  const [baseX, baseY] = positions[shape.pos] || [50, 50];
  const common = `fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
  const polygon = (sides, rotation = -90) => {
    const points = Array.from({ length: sides }, (_, index) => {
      const angle = ((rotation + index * 360 / sides) * Math.PI) / 180;
      return `${50 + 37 * Math.cos(angle)},${50 + 37 * Math.sin(angle)}`;
    }).join(' ');
    return `<polygon points="${points}" ${common}/>`;
  };

  let graphic;
  if (shape.type === 'circle') {
    graphic = `<circle cx="50" cy="50" r="34" ${common}/>`;
  } else if (shape.type === 'dot') {
    const count = Math.max(1, Math.min(shape.count || 1, 9));
    const coords = count <= 1
      ? [[50, 50]]
      : count <= 4
        ? [[38, 38], [62, 38], [38, 62], [62, 62]]
        : [[50, 32], [68, 43], [61, 63], [39, 63], [32, 43], [50, 50], [50, 80], [20, 50], [80, 50]];
    graphic = coords.slice(0, count)
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${count > 4 ? 6 : count === 1 ? 9 : 7}" ${common}/>`).join('');
  } else if (polygonSides[shape.type]) {
    const rotation = shape.type === 'square' ? -45 : shape.type === 'diamond' ? -90 : -90;
    graphic = polygon(polygonSides[shape.type], rotation);
  } else {
    switch (shape.type) {
      case 'star': {
        const points = Array.from({ length: 10 }, (_, index) => {
          const radius = index % 2 === 0 ? 38 : 17;
          const angle = ((-90 + index * 36) * Math.PI) / 180;
          return `${50 + radius * Math.cos(angle)},${50 + radius * Math.sin(angle)}`;
        }).join(' ');
        graphic = `<polygon points="${points}" ${common}/>`;
        break;
      }
      case 'arrow': graphic = `<path d="M50 8 L86 52 H65 V92 H35 V52 H14 Z" ${common}/>`; break;
      case 'cross':
      case 'cross_sm': graphic = `<path d="M42 12 H58 V42 H88 V58 H58 V88 H42 V58 H12 V42 H42 Z" ${common}/>`; break;
      case 'plus_composite': graphic = `<path d="M44 12 H56 V44 H88 V56 H56 V88 H44 V56 H12 V44 H44 Z" ${common}/>`; break;
      case 'line_horiz': graphic = `<path d="M12 50 H88" fill="none" stroke="${stroke}" stroke-width="6"/>`; break;
      case 'line_vert': graphic = `<path d="M50 12 V88" fill="none" stroke="${stroke}" stroke-width="6"/>`; break;
      case 'diagonal_slash': graphic = `<path d="M20 80 L80 20" fill="none" stroke="${stroke}" stroke-width="6"/>`; break;
      case 'backslash': graphic = `<path d="M20 20 L80 80" fill="none" stroke="${stroke}" stroke-width="6"/>`; break;
      case 'dash_sm': graphic = `<path d="M34 50 H66" fill="none" stroke="${stroke}" stroke-width="7"/>`; break;
      case 'l_shape':
      case 'l_shape_reflected':
        graphic = shape.type === 'l_shape'
          ? `<path d="M32 16 V72 H80" fill="none" stroke="${stroke}" stroke-width="12" stroke-linecap="square"/>`
          : `<path d="M68 16 V72 H20" fill="none" stroke="${stroke}" stroke-width="12" stroke-linecap="square"/>`;
        break;
      case 't_shape': graphic = `<path d="M16 25 H84 M50 25 V84" fill="none" stroke="${stroke}" stroke-width="12" stroke-linecap="square"/>`; break;
      case 'crescent': graphic = `<path d="M68 16 A38 38 0 1 0 68 84 A27 38 0 0 1 68 16 Z" ${common}/>`; break;
      case 'clock': {
        const hand = (angle, length, width) => {
          const radians = (angle * Math.PI) / 180;
          return `<line x1="50" y1="50" x2="${50 + Math.sin(radians) * length}" y2="${50 - Math.cos(radians) * length}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>`;
        };
        graphic = `<circle cx="50" cy="50" r="38" fill="white" stroke="${stroke}" stroke-width="4"/>${Array.from({ length: 12 }, (_, index) => `<circle cx="${50 + 31 * Math.sin(index * Math.PI / 6)}" cy="${50 - 31 * Math.cos(index * Math.PI / 6)}" r="1.8" fill="${stroke}"/>`).join('')}${hand(shape.hourAngle || 0, 20, 4)}${hand(shape.minuteAngle === undefined ? shape.hourAngle || 0 : shape.minuteAngle, 29, 3)}<circle cx="50" cy="50" r="3" fill="${stroke}"/>`;
        break;
      }
      case 'concentric_rings': {
        const count = Math.max(1, Math.min(shape.count || 1, 5));
        const rings = Array.from({ length: count }, (_, index) => `<circle cx="50" cy="50" r="${38 - index * 9}" fill="none" stroke="${stroke}" stroke-width="3"/>`).join('');
        const angle = ((shape.rot || 0) * Math.PI) / 180;
        const marker = `<line x1="50" y1="50" x2="${50 + 34 * Math.sin(angle)}" y2="${50 - 34 * Math.cos(angle)}" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>`;
        const dotFill = shape.dotFill === 'outline' ? 'white' : stroke;
        graphic = `${rings}${marker}<circle cx="50" cy="50" r="6" fill="${dotFill}" stroke="${stroke}" stroke-width="3"/>`;
        break;
      }
      case 'lines_combo': {
        const vertical = Math.max(1, Math.min(shape.vert || 1, 4));
        const horizontal = Math.max(1, Math.min(shape.horiz || 1, 4));
        const verticalLines = Array.from({ length: vertical }, (_, index) => {
          const x = 50 + (index - (vertical - 1) / 2) * 18;
          return `<line x1="${x}" y1="18" x2="${x}" y2="82" stroke="${stroke}" stroke-width="4"/>`;
        }).join('');
        const horizontalLines = Array.from({ length: horizontal }, (_, index) => {
          const y = 50 + (index - (horizontal - 1) / 2) * 18;
          return `<line x1="18" y1="${y}" x2="82" y2="${y}" stroke="${stroke}" stroke-width="4"/>`;
        }).join('');
        graphic = verticalLines + horizontalLines;
        break;
      }
      case 'traffic_light': {
        const colors = { red: '#ef4444', yellow: '#facc15', green: '#22c55e' };
        graphic = `<rect x="30" y="8" width="40" height="84" rx="15" fill="#1e293b"/>${['red', 'yellow', 'green'].map((color, index) => `<circle cx="50" cy="${27 + index * 23}" r="8" fill="${shape.active === color ? colors[color] : '#64748b'}" stroke="${shape.active === color ? 'white' : '#334155'}" stroke-width="2"/>`).join('')}`;
        break;
      }
      case 'car': {
        const colors = { red: '#ef4444', blue: '#3b82f6', yellow: '#eab308', green: '#22c55e' };
        graphic = `<path d="M18 62 L25 42 H39 L47 28 H68 L80 44 L87 50 V70 H18 Z" fill="${colors[shape.color] || '#64748b'}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/><path d="M43 42 L49 32 H64 L72 44 Z" fill="#dbeafe" stroke="${stroke}" stroke-width="2"/><circle cx="34" cy="70" r="8" fill="#1e293b"/><circle cx="72" cy="70" r="8" fill="#1e293b"/>`;
        break;
      }
      case 'house': {
        const stage = shape.stage || 1;
        graphic = `<path d="M12 78 H88" stroke="#475569" stroke-width="4"/>${stage >= 1 ? '<rect x="30" y="56" width="40" height="22" fill="#fef3c7" stroke="#334155" stroke-width="3"/>' : ''}${stage >= 2 ? '<rect x="30" y="38" width="40" height="40" fill="#fef3c7" stroke="#334155" stroke-width="3"/>' : ''}${stage >= 3 ? '<path d="M24 39 L50 16 L76 39 Z" fill="#ef4444" stroke="#334155" stroke-width="3"/>' : ''}${stage >= 4 ? '<path d="M15 76 Q20 64 25 76 M75 76 Q80 64 85 76" fill="none" stroke="#22c55e" stroke-width="4"/>' : ''}`;
        break;
      }
      default: throw new Error(`No visual renderer exists for shape "${shape.type}".`);
    }
  }

  const x = baseX + (shape.type === 'dot' ? dotOffset : 0);
  const y = baseY;
  const rotation = shape.rot || 0;
  const symbolGroup = shape.count > 1 && shape.type !== 'dot'
    ? Array.from({ length: Math.min(shape.count, 9) }, (_, index) => {
      const coords = [[36, 36], [64, 36], [36, 64], [64, 64], [50, 50], [50, 22], [78, 50], [50, 78], [22, 50]];
      const [cx, cy] = coords[index];
      return `<g transform="translate(${cx - 50} ${cy - 50}) scale(0.45)">${graphic}</g>`;
    }).join('')
    : graphic;
  const segments = Math.max(0, Math.min(shape.seg || 0, 8));
  let segmentOverlay = '';
  if (segments > 1 && ['circle', 'square', 'diamond', 'triangle', 'pentagon', 'hexagon', 'heptagon', 'star'].includes(shape.type)) {
    const clipId = `segment-clip-${id}-${shapeIndex}`;
    const rays = Array.from({ length: segments }, (_, index) => {
      const angle = (index * 2 * Math.PI) / segments;
      return `<line x1="50" y1="50" x2="${50 + 45 * Math.cos(angle)}" y2="${50 + 45 * Math.sin(angle)}" stroke="${stroke}" stroke-width="2"/>`;
    }).join('');
    segmentOverlay = `<defs><clipPath id="${clipId}">${graphic}</clipPath></defs><g clip-path="url(#${clipId})">${rays}</g>`;
  }

  return `<g transform="translate(${x - 50} ${y - 50})"><g transform="translate(50 50) rotate(${rotation}) scale(${scale}) translate(-50 -50)">${symbolGroup}${segmentOverlay}</g></g>`;
}

function renderVisual(shapes, id) {
  const dotGroups = new Map();
  shapes.forEach((shape, shapeIndex) => {
    if (shape.type !== 'dot') return;
    const key = shape.pos || 'center';
    if (!dotGroups.has(key)) dotGroups.set(key, []);
    dotGroups.get(key).push(shapeIndex);
  });
  const dotOffsets = new Map();
  for (const indexes of dotGroups.values()) {
    indexes.forEach((shapeIndex, index) => {
      dotOffsets.set(shapeIndex, indexes.length > 1 ? (index - (indexes.length - 1) / 2) * 14 : 0);
    });
  }
  return `<defs><pattern id="shade-${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="6" height="6" fill="#e2e8f0"/><line x1="0" y1="0" x2="0" y2="6" stroke="#64748b" stroke-width="2"/></pattern></defs>${shapes.map((shape, shapeIndex) =>
    renderShape(shape, id, shapeIndex, dotOffsets.get(shapeIndex) || 0)
  ).join('')}`;
}

export function QuestionVisual({ shapes, label }) {
  const generatedId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const svgId = `visual-${generatedId}`;
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full"
      role="img"
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: renderVisual(shapes, svgId) }}
    />
  );
}
