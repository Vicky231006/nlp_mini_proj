export const ITEM_BANK = [
  // -------------------------------------------------------------
  // TIER 1: LINEAR PROGRESSIONS & ALTERNATIONS (Items 1 - 10)
  // -------------------------------------------------------------
  {
    id: "Q01",
    tier: 1,
    construct: "pattern_completion",
    format: "1x4",
    ruleDescription: "Alternation: Dot followed by Triangle (● -> ▲ -> ● -> [▲])",
    stimulus: [
      { shapes: [{ type: "dot", count: 1, fill: "solid" }] },
      { shapes: [{ type: "triangle", fill: "solid" }] },
      { shapes: [{ type: "dot", count: 1, fill: "solid" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "triangle", fill: "solid" }], correct: true, rationale: "Correct alternation item" },
      { id: "opt_b", shapes: [{ type: "dot", count: 1, fill: "solid" }], correct: false, rationale: "Direct perseveration of preceding dot" },
      { id: "opt_c", shapes: [{ type: "square", fill: "solid" }], correct: false, rationale: "Unrelated shape distractor" },
      { id: "opt_d", shapes: [{ type: "diamond", fill: "solid" }], correct: false, rationale: "Unrelated shape distractor" }
    ]
  },
  {
    id: "Q02",
    tier: 1,
    construct: "pattern_completion",
    format: "1x4",
    ruleDescription: "Traffic Light Sequence: Red -> Yellow -> Green -> [Red cycle repeat]",
    stimulus: [
      { shapes: [{ type: "traffic_light", active: "red" }] },
      { shapes: [{ type: "traffic_light", active: "yellow" }] },
      { shapes: [{ type: "traffic_light", active: "green" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "traffic_light", active: "red" }], correct: true, rationale: "Traffic safety loop reboot (Stop)" },
      { id: "opt_b", shapes: [{ type: "traffic_light", active: "yellow" }], correct: false, rationale: "Reverse cycle error" },
      { id: "opt_c", shapes: [{ type: "traffic_light", active: "green" }], correct: false, rationale: "Perseveration of green light" },
      { id: "opt_d", shapes: [{ type: "traffic_light", active: "none" }], correct: false, rationale: "Unpowered light distractor" }
    ]
  },
  {
    id: "Q03",
    tier: 1,
    construct: "spatial_transformation",
    format: "1x4",
    ruleDescription: "Clockwise 90-degree arrow step: Up -> Right -> Down -> [Left]",
    stimulus: [
      { shapes: [{ type: "arrow", rot: 0, fill: "solid" }] },
      { shapes: [{ type: "arrow", rot: 90, fill: "solid" }] },
      { shapes: [{ type: "arrow", rot: 180, fill: "solid" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "arrow", rot: 270, fill: "solid" }], correct: true, rationale: "Completes 90-deg clockwise rotation (pointing Left)" },
      { id: "opt_b", shapes: [{ type: "arrow", rot: 0, fill: "solid" }], correct: false, rationale: "Reversion to step 1" },
      { id: "opt_c", shapes: [{ type: "arrow", rot: 180, fill: "solid" }], correct: false, rationale: "Perseveration of step 3" },
      { id: "opt_d", shapes: [{ type: "arrow", rot: 90, fill: "solid" }], correct: false, rationale: "Incorrect reversal" }
    ]
  },
  {
    id: "Q04",
    tier: 1,
    construct: "pattern_completion",
    format: "1x4",
    ruleDescription: "Addition of elements: 1 Dot -> 2 Dots -> 3 Dots -> [4 Dots]",
    stimulus: [
      { shapes: [{ type: "dot", count: 1, fill: "solid" }] },
      { shapes: [{ type: "dot", count: 2, fill: "solid" }] },
      { shapes: [{ type: "dot", count: 3, fill: "solid" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "dot", count: 4, fill: "solid" }], correct: true, rationale: "Linear increment (+1 dot)" },
      { id: "opt_b", shapes: [{ type: "dot", count: 3, fill: "solid" }], correct: false, rationale: "Failure to add element" },
      { id: "opt_c", shapes: [{ type: "dot", count: 5, fill: "solid" }], correct: false, rationale: "Over-extension (+2 jump)" },
      { id: "opt_d", shapes: [{ type: "square", count: 4, fill: "solid" }], correct: false, rationale: "Shape substitution error" }
    ]
  },
  {
    id: "Q05",
    tier: 1,
    construct: "pattern_completion",
    format: "1x4",
    ruleDescription: "Shape cycle: Circle -> Triangle -> Square -> [Circle]",
    stimulus: [
      { shapes: [{ type: "circle", fill: "outline" }] },
      { shapes: [{ type: "triangle", fill: "outline" }] },
      { shapes: [{ type: "square", fill: "outline" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "circle", fill: "outline" }], correct: true, rationale: "Cycle restart" },
      { id: "opt_b", shapes: [{ type: "triangle", fill: "outline" }], correct: false, rationale: "Premature skip" },
      { id: "opt_c", shapes: [{ type: "square", fill: "outline" }], correct: false, rationale: "Perseveration of previous square" },
      { id: "opt_d", shapes: [{ type: "diamond", fill: "outline" }], correct: false, rationale: "Novel shape outside rule" }
    ]
  },
  {
    id: "Q06",
    tier: 1,
    construct: "spatial_transformation",
    format: "1x4",
    ruleDescription: "Analog Clock 90-degree step: 12:00 -> 3:00 -> 6:00 -> [9:00]",
    stimulus: [
      { shapes: [{ type: "clock", hourAngle: 0 }] },
      { shapes: [{ type: "clock", hourAngle: 90 }] },
      { shapes: [{ type: "clock", hourAngle: 180 }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "clock", hourAngle: 270 }], correct: true, rationale: "Quarter-turn forward (9:00)" },
      { id: "opt_b", shapes: [{ type: "clock", hourAngle: 0 }], correct: false, rationale: "Loopback to 12:00" },
      { id: "opt_c", shapes: [{ type: "clock", hourAngle: 180 }], correct: false, rationale: "Identical to step 3" },
      { id: "opt_d", shapes: [{ type: "clock", hourAngle: 45 }], correct: false, rationale: "Fractional angle error" }
    ]
  },
  {
    id: "Q07",
    tier: 1,
    construct: "pattern_completion",
    format: "1x4",
    ruleDescription: "Progressive Assembly: Foundation -> +Walls -> +Roof -> [+Garden]",
    stimulus: [
      { shapes: [{ type: "house", stage: 1 }] },
      { shapes: [{ type: "house", stage: 2 }] },
      { shapes: [{ type: "house", stage: 3 }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "house", stage: 4 }], correct: true, rationale: "Completed building with garden/base landscape" },
      { id: "opt_b", shapes: [{ type: "house", stage: 3 }], correct: false, rationale: "Stalled at roof" },
      { id: "opt_c", shapes: [{ type: "house", stage: 2 }], correct: false, rationale: "Regression to walls" },
      { id: "opt_d", shapes: [{ type: "house", stage: 1 }], correct: false, rationale: "Foundation only" }
    ]
  },
  {
    id: "Q08",
    tier: 1,
    construct: "pattern_completion",
    format: "1x4",
    ruleDescription: "Binary fill alternation: Solid Square -> Outline Square -> Solid Square -> [Outline Square]",
    stimulus: [
      { shapes: [{ type: "square", fill: "solid" }] },
      { shapes: [{ type: "square", fill: "outline" }] },
      { shapes: [{ type: "square", fill: "solid" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "square", fill: "outline" }], correct: true, rationale: "Correct fill alternation continuation" },
      { id: "opt_b", shapes: [{ type: "square", fill: "solid" }], correct: false, rationale: "Failure to alternate fill" },
      { id: "opt_c", shapes: [{ type: "circle", fill: "outline" }], correct: false, rationale: "Wrong shape category" },
      { id: "opt_d", shapes: [{ type: "square", fill: "shaded" }], correct: false, rationale: "Intruder fill mode" }
    ]
  },
  {
    id: "Q09",
    tier: 1,
    construct: "spatial_transformation",
    format: "1x4",
    ruleDescription: "Linear horizontal movement: Left -> Mid-Left -> Mid-Right -> [Right]",
    stimulus: [
      { shapes: [{ type: "dot", pos: "left", fill: "solid" }] },
      { shapes: [{ type: "dot", pos: "midleft", fill: "solid" }] },
      { shapes: [{ type: "dot", pos: "midright", fill: "solid" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "dot", pos: "right", fill: "solid" }], correct: true, rationale: "Arrives at right boundary" },
      { id: "opt_b", shapes: [{ type: "dot", pos: "left", fill: "solid" }], correct: false, rationale: "Bounceback error" },
      { id: "opt_c", shapes: [{ type: "dot", pos: "center", fill: "solid" }], correct: false, rationale: "Centered error" },
      { id: "opt_d", shapes: [{ type: "dot", pos: "midright", fill: "solid" }], correct: false, rationale: "Stalled position" }
    ]
  },
  {
    id: "Q10",
    tier: 1,
    construct: "pattern_completion",
    format: "1x4",
    ruleDescription: "Monotonic size expansion: Small Circle -> Medium Circle -> Large Circle -> [Extra-Large Circle]",
    stimulus: [
      { shapes: [{ type: "circle", scale: "small", fill: "outline" }] },
      { shapes: [{ type: "circle", scale: "med", fill: "outline" }] },
      { shapes: [{ type: "circle", scale: "large", fill: "outline" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "circle", scale: "xlarge", fill: "outline" }], correct: true, rationale: "Max scale completion" },
      { id: "opt_b", shapes: [{ type: "circle", scale: "small", fill: "outline" }], correct: false, rationale: "Inverted scale restart" },
      { id: "opt_c", shapes: [{ type: "circle", scale: "large", fill: "outline" }], correct: false, rationale: "Identical duplicate" },
      { id: "opt_d", shapes: [{ type: "square", scale: "xlarge", fill: "outline" }], correct: false, rationale: "Shape confusion" }
    ]
  },

  // -------------------------------------------------------------
  // TIER 2: 2x2 ANALOGICAL MATRICES & ANGLE SHIFTS (Items 11 - 20)
  // -------------------------------------------------------------
  {
    id: "Q11",
    tier: 2,
    construct: "analogical_mapping",
    format: "2x2",
    ruleDescription: "Hollow Star : Solid Star :: Hollow Diamond : [Solid Diamond]",
    stimulus: [
      { shapes: [{ type: "star", fill: "outline" }] }, { shapes: [{ type: "star", fill: "solid" }] },
      { shapes: [{ type: "diamond", fill: "outline" }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "diamond", fill: "solid" }], correct: true, rationale: "Applies fill transformation to diamond" },
      { id: "opt_b", shapes: [{ type: "diamond", fill: "outline" }], correct: false, rationale: "Identity / no transformation" },
      { id: "opt_c", shapes: [{ type: "star", fill: "solid" }], correct: false, rationale: "Row 1 answer copied" },
      { id: "opt_d", shapes: [{ type: "square", fill: "solid" }], correct: false, rationale: "Extraneous shape" }
    ]
  },
  {
    id: "Q12",
    tier: 2,
    construct: "spatial_transformation",
    format: "2x2",
    ruleDescription: "T-Shape 0° : T-Shape 90° :: L-Shape 0° : [L-Shape 90°]",
    stimulus: [
      { shapes: [{ type: "t_shape", rot: 0, fill: "solid" }] }, { shapes: [{ type: "t_shape", rot: 90, fill: "solid" }] },
      { shapes: [{ type: "l_shape", rot: 0, fill: "solid" }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "l_shape", rot: 90, fill: "solid" }], correct: true, rationale: "Correct 90-degree clockwise rotation of L-shape" },
      { id: "opt_b", shapes: [{ type: "l_shape", rot: 180, fill: "solid" }], correct: false, rationale: "180-deg reversal" },
      { id: "opt_c", shapes: [{ type: "l_shape", rot: 270, fill: "solid" }], correct: false, rationale: "Counter-clockwise slip" },
      { id: "opt_d", shapes: [{ type: "t_shape", rot: 90, fill: "solid" }], correct: false, rationale: "Perseveration from row 1" }
    ]
  },
  {
    id: "Q13",
    tier: 2,
    construct: "analogical_mapping",
    format: "2x2",
    ruleDescription: "Element insertion: Base geometry acquires central kernel dot",
    stimulus: [
      { shapes: [{ type: "circle", count: 1, fill: "outline" }] },
      { shapes: [{ type: "circle", count: 1, fill: "outline" }, { type: "dot", pos: "center", fill: "solid" }] },
      { shapes: [{ type: "square", count: 1, fill: "outline" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "square", count: 1, fill: "outline" }, { type: "dot", pos: "center", fill: "solid" }], correct: true, rationale: "Correct central kernel insertion" },
      { id: "opt_b", shapes: [{ type: "square", count: 1, fill: "outline" }], correct: false, rationale: "No operator applied" },
      { id: "opt_c", shapes: [{ type: "circle", count: 1, fill: "outline" }, { type: "dot", pos: "center", fill: "solid" }], correct: false, rationale: "Copied top cell" },
      { id: "opt_d", shapes: [{ type: "square", count: 1, fill: "solid" }], correct: false, rationale: "Filled entire shape instead of adding dot" }
    ]
  },
  {
    id: "Q14",
    tier: 2,
    construct: "spatial_transformation",
    format: "2x2",
    ruleDescription: "Vertical axis flip: Triangle 0° : Triangle 180° :: Arrow 0° : [Arrow 180°]",
    stimulus: [
      { shapes: [{ type: "triangle", rot: 0, fill: "solid" }] }, { shapes: [{ type: "triangle", rot: 180, fill: "solid" }] },
      { shapes: [{ type: "arrow", rot: 0, fill: "solid" }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "arrow", rot: 180, fill: "solid" }], correct: true, rationale: "Vertical reflection (pointing downward)" },
      { id: "opt_b", shapes: [{ type: "arrow", rot: 0, fill: "solid" }], correct: false, rationale: "Unchanged arrow" },
      { id: "opt_c", shapes: [{ type: "arrow", rot: 90, fill: "solid" }], correct: false, rationale: "Rotated rather than flipped" },
      { id: "opt_d", shapes: [{ type: "triangle", rot: 180, fill: "solid" }], correct: false, rationale: "Shape error" }
    ]
  },
  {
    id: "Q15",
    tier: 2,
    construct: "spatial_transformation",
    format: "2x2",
    ruleDescription: "Clock hand 45-degree angle shift: 12:00 -> 1:30 :: 3:00 -> [4:30]",
    stimulus: [
      { shapes: [{ type: "clock", hourAngle: 0 }] }, { shapes: [{ type: "clock", hourAngle: 45 }] },
      { shapes: [{ type: "clock", hourAngle: 90 }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "clock", hourAngle: 135 }], correct: true, rationale: "45-degree shift forward (4:30 position)" },
      { id: "opt_b", shapes: [{ type: "clock", hourAngle: 180 }], correct: false, rationale: "90-degree over-rotation" },
      { id: "opt_c", shapes: [{ type: "clock", hourAngle: 45 }], correct: false, rationale: "Copied previous angle" },
      { id: "opt_d", shapes: [{ type: "clock", hourAngle: 90 }], correct: false, rationale: "Stalled hand" }
    ]
  },
  {
    id: "Q16",
    tier: 2,
    construct: "analogical_mapping",
    format: "2x2",
    ruleDescription: "Scale Inversion: Large Outline + Small Solid -> Small Outline + Large Solid",
    stimulus: [
      { shapes: [{ type: "square", scale: "large", fill: "outline" }, { type: "circle", scale: "small", fill: "solid" }] },
      { shapes: [{ type: "square", scale: "small", fill: "outline" }, { type: "circle", scale: "large", fill: "solid" }] },
      { shapes: [{ type: "triangle", scale: "large", fill: "outline" }, { type: "star", scale: "small", fill: "solid" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "triangle", scale: "small", fill: "outline" }, { type: "star", scale: "large", fill: "solid" }], correct: true, rationale: "Correct scale swap" },
      { id: "opt_b", shapes: [{ type: "triangle", scale: "large", fill: "outline" }, { type: "star", scale: "small", fill: "solid" }], correct: false, rationale: "No scale swap" },
      { id: "opt_c", shapes: [{ type: "square", scale: "small", fill: "outline" }, { type: "circle", scale: "large", fill: "solid" }], correct: false, rationale: "Row 1 perseveration" },
      { id: "opt_d", shapes: [{ type: "triangle", scale: "small", fill: "solid" }, { type: "star", scale: "large", fill: "outline" }], correct: false, rationale: "Swapped fills instead of scales" }
    ]
  },
  {
    id: "Q17",
    tier: 2,
    construct: "spatial_transformation",
    format: "2x2",
    ruleDescription: "Diagonal translation: Top-Left -> Center :: Center -> [Bottom-Right]",
    stimulus: [
      { shapes: [{ type: "dot", pos: "corner_tl", fill: "solid" }] }, { shapes: [{ type: "dot", pos: "center", fill: "solid" }] },
      { shapes: [{ type: "dot", pos: "center", fill: "solid" }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "dot", pos: "corner_br", fill: "solid" }], correct: true, rationale: "Continues downward-right trajectory" },
      { id: "opt_b", shapes: [{ type: "dot", pos: "corner_tr", fill: "solid" }], correct: false, rationale: "Perpendicular detour" },
      { id: "opt_c", shapes: [{ type: "dot", pos: "corner_tl", fill: "solid" }], correct: false, rationale: "Loopback to start" },
      { id: "opt_d", shapes: [{ type: "dot", pos: "corner_bl", fill: "solid" }], correct: false, rationale: "Wrong corner" }
    ]
  },
  {
    id: "Q18",
    tier: 2,
    construct: "pattern_completion",
    format: "2x2",
    ruleDescription: "Concentric expansion: 1 Ring : 2 Rings :: 2 Rings : [3 Rings]",
    stimulus: [
      { shapes: [{ type: "concentric_rings", count: 1, fill: "outline" }] },
      { shapes: [{ type: "concentric_rings", count: 2, fill: "outline" }] },
      { shapes: [{ type: "concentric_rings", count: 2, fill: "outline" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "concentric_rings", count: 3, fill: "outline" }], correct: true, rationale: "Correct incremental expansion" },
      { id: "opt_b", shapes: [{ type: "concentric_rings", count: 2, fill: "outline" }], correct: false, rationale: "No growth" },
      { id: "opt_c", shapes: [{ type: "concentric_rings", count: 4, fill: "outline" }], correct: false, rationale: "Over-extension (+2)" },
      { id: "opt_d", shapes: [{ type: "concentric_rings", count: 1, fill: "outline" }], correct: false, rationale: "Regression to 1" }
    ]
  },
  {
    id: "Q19",
    tier: 2,
    construct: "pattern_completion",
    format: "2x2",
    ruleDescription: "Vehicular color transfer: Red Car : Blue Car :: Blue Car : [Yellow Car]",
    stimulus: [
      { shapes: [{ type: "car", color: "red" }] }, { shapes: [{ type: "car", color: "blue" }] },
      { shapes: [{ type: "car", color: "blue" }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "car", color: "yellow" }], correct: true, rationale: "Follows Red -> Blue -> Yellow fleet cycle" },
      { id: "opt_b", shapes: [{ type: "car", color: "red" }], correct: false, rationale: "Cycle reversal" },
      { id: "opt_c", shapes: [{ type: "car", color: "blue" }], correct: false, rationale: "Duplicate blue car" },
      { id: "opt_d", shapes: [{ type: "car", color: "green" }], correct: false, rationale: "Color outside set" }
    ]
  },
  {
    id: "Q20",
    tier: 2,
    construct: "spatial_transformation",
    format: "2x2",
    ruleDescription: "Cross reflection: Diagonal Slash : Backslash :: Vertical Line : [Horizontal Line]",
    stimulus: [
      { shapes: [{ type: "diagonal_slash", fill: "solid" }] }, { shapes: [{ type: "backslash", fill: "solid" }] },
      { shapes: [{ type: "line_vert", fill: "solid" }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "line_horiz", fill: "solid" }], correct: true, rationale: "Orthogonal 90-degree complement" },
      { id: "opt_b", shapes: [{ type: "line_vert", fill: "solid" }], correct: false, rationale: "Unchanged line" },
      { id: "opt_c", shapes: [{ type: "plus_composite", fill: "solid" }], correct: false, rationale: "Superposition of both" },
      { id: "opt_d", shapes: [{ type: "diagonal_slash", fill: "solid" }], correct: false, rationale: "Top cell perseveration" }
    ]
  },

  // -------------------------------------------------------------
  // TIER 3: 3x3 ORTHOGONAL & LATIN SQUARE MATRICES (Items 21 - 30)
  // -------------------------------------------------------------
  {
    id: "Q21",
    tier: 3,
    construct: "pattern_completion",
    format: "3x3",
    ruleDescription: "Checkerboard Fill Alternation: Row 1 (○ ● ○), Row 2 (● ○ ●), Row 3 (○ ● [○])",
    stimulus: [
      { shapes: [{ type: "circle", fill: "outline" }] }, { shapes: [{ type: "circle", fill: "solid" }] }, { shapes: [{ type: "circle", fill: "outline" }] },
      { shapes: [{ type: "circle", fill: "solid" }] }, { shapes: [{ type: "circle", fill: "outline" }] }, { shapes: [{ type: "circle", fill: "solid" }] },
      { shapes: [{ type: "circle", fill: "outline" }] }, { shapes: [{ type: "circle", fill: "solid" }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "circle", fill: "outline" }], correct: true, rationale: "Maintains alternating checkerboard fill parity" },
      { id: "opt_b", shapes: [{ type: "circle", fill: "solid" }], correct: false, rationale: "Duplicate solid fill" },
      { id: "opt_c", shapes: [{ type: "square", fill: "outline" }], correct: false, rationale: "Shape substitution error" },
      { id: "opt_d", shapes: [{ type: "circle", fill: "shaded" }], correct: false, rationale: "Incorrect shading mode" }
    ]
  },
  {
    id: "Q22",
    tier: 3,
    construct: "pattern_completion",
    format: "3x3",
    ruleDescription: "Cyclic row shift: R1 (○ △ □), R2 (△ □ ○), R3 (□ ○ [△])",
    stimulus: [
      { shapes: [{ type: "circle", fill: "outline" }] }, { shapes: [{ type: "triangle", fill: "outline" }] }, { shapes: [{ type: "square", fill: "outline" }] },
      { shapes: [{ type: "triangle", fill: "outline" }] }, { shapes: [{ type: "square", fill: "outline" }] }, { shapes: [{ type: "circle", fill: "outline" }] },
      { shapes: [{ type: "square", fill: "outline" }] }, { shapes: [{ type: "circle", fill: "outline" }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "triangle", fill: "outline" }], correct: true, rationale: "Cyclic shift completes Latin permutation" },
      { id: "opt_b", shapes: [{ type: "circle", fill: "outline" }], correct: false, rationale: "Duplicate circle in row" },
      { id: "opt_c", shapes: [{ type: "square", fill: "outline" }], correct: false, rationale: "Duplicate square in column" },
      { id: "opt_d", shapes: [{ type: "diamond", fill: "outline" }], correct: false, rationale: "Intruder shape" }
    ]
  },
  {
    id: "Q23",
    tier: 3,
    construct: "pattern_completion",
    format: "3x3",
    ruleDescription: "Vehicle Parking Latin Square: Red, Blue, Yellow vehicles shift cyclically across rows",
    stimulus: [
      { shapes: [{ type: "car", color: "red" }] }, { shapes: [{ type: "car", color: "blue" }] }, { shapes: [{ type: "car", color: "yellow" }] },
      { shapes: [{ type: "car", color: "blue" }] }, { shapes: [{ type: "car", color: "yellow" }] }, { shapes: [{ type: "car", color: "red" }] },
      { shapes: [{ type: "car", color: "yellow" }] }, { shapes: [{ type: "car", color: "red" }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "car", color: "blue" }], correct: true, rationale: "Completes unique parking grid constraint" },
      { id: "opt_b", shapes: [{ type: "car", color: "red" }], correct: false, rationale: "Duplicate red car in row 3" },
      { id: "opt_c", shapes: [{ type: "car", color: "yellow" }], correct: false, rationale: "Duplicate yellow car in col 3" },
      { id: "opt_d", shapes: [{ type: "car", color: "green" }], correct: false, rationale: "Color outside established palette" }
    ]
  },
  {
    id: "Q24",
    tier: 3,
    construct: "pattern_completion",
    format: "3x3",
    ruleDescription: "Row governs base shape (Circle, Square, Triangle). Column governs count (1, 2, 3). Target: 3 Triangles.",
    stimulus: [
      { shapes: [{ type: "circle", count: 1, fill: "solid" }] }, { shapes: [{ type: "circle", count: 2, fill: "solid" }] }, { shapes: [{ type: "circle", count: 3, fill: "solid" }] },
      { shapes: [{ type: "square", count: 1, fill: "solid" }] }, { shapes: [{ type: "square", count: 2, fill: "solid" }] }, { shapes: [{ type: "square", count: 3, fill: "solid" }] },
      { shapes: [{ type: "triangle", count: 1, fill: "solid" }] }, { shapes: [{ type: "triangle", count: 2, fill: "solid" }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "triangle", count: 3, fill: "solid" }], correct: true, rationale: "Correct Row (Triangle) and Col (3 items) confluence" },
      { id: "opt_b", shapes: [{ type: "triangle", count: 2, fill: "solid" }], correct: false, rationale: "Col count stalled at 2" },
      { id: "opt_c", shapes: [{ type: "square", count: 3, fill: "solid" }], correct: false, rationale: "Row shape missed" },
      { id: "opt_d", shapes: [{ type: "triangle", count: 4, fill: "solid" }], correct: false, rationale: "Over-counting arithmetic error" }
    ]
  },
  {
    id: "Q25",
    tier: 3,
    construct: "pattern_completion",
    format: "3x3",
    ruleDescription: "Row governs shape (Diamond, Star, Hexagon). Column governs fill (Hollow, Shaded, Solid). Target: Solid Hexagon.",
    stimulus: [
      { shapes: [{ type: "diamond", fill: "outline" }] }, { shapes: [{ type: "diamond", fill: "shaded" }] }, { shapes: [{ type: "diamond", fill: "solid" }] },
      { shapes: [{ type: "star", fill: "outline" }] }, { shapes: [{ type: "star", fill: "shaded" }] }, { shapes: [{ type: "star", fill: "solid" }] },
      { shapes: [{ type: "hexagon", fill: "outline" }] }, { shapes: [{ type: "hexagon", fill: "shaded" }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "hexagon", fill: "solid" }], correct: true, rationale: "Correct Solid Hexagon intersection" },
      { id: "opt_b", shapes: [{ type: "hexagon", fill: "shaded" }], correct: false, rationale: "Perseverated column 2 shading" },
      { id: "opt_c", shapes: [{ type: "star", fill: "solid" }], correct: false, rationale: "Row 2 shape perseveration" },
      { id: "opt_d", shapes: [{ type: "diamond", fill: "solid" }], correct: false, rationale: "Row 1 shape perseveration" }
    ]
  },
  {
    id: "Q26",
    tier: 3,
    construct: "spatial_transformation",
    format: "3x3",
    ruleDescription: "Row governs primitive. Column governs rotation (0, 90, 180 deg). Target: Crescent 180 deg.",
    stimulus: [
      { shapes: [{ type: "arrow", rot: 0, fill: "solid" }] }, { shapes: [{ type: "arrow", rot: 90, fill: "solid" }] }, { shapes: [{ type: "arrow", rot: 180, fill: "solid" }] },
      { shapes: [{ type: "cross", rot: 0, fill: "solid" }] }, { shapes: [{ type: "cross", rot: 90, fill: "solid" }] }, { shapes: [{ type: "cross", rot: 180, fill: "solid" }] },
      { shapes: [{ type: "crescent", rot: 0, fill: "solid" }] }, { shapes: [{ type: "crescent", rot: 90, fill: "solid" }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "crescent", rot: 180, fill: "solid" }], correct: true, rationale: "Satisfies crescent row and 180 deg column rotation" },
      { id: "opt_b", shapes: [{ type: "crescent", rot: 270, fill: "solid" }], correct: false, rationale: "Excessive rotation (270 deg)" },
      { id: "opt_c", shapes: [{ type: "crescent", rot: 90, fill: "solid" }], correct: false, rationale: "Stalled rotation at 90 deg" },
      { id: "opt_d", shapes: [{ type: "cross", rot: 180, fill: "solid" }], correct: false, rationale: "Row shape missed" }
    ]
  },
  {
    id: "Q27",
    tier: 3,
    construct: "spatial_transformation",
    format: "3x3",
    ruleDescription: "Coordinate tracking: Row specifies Y (Top, Mid, Bottom), Col specifies X (Left, Center, Right). Target: Bottom-Right.",
    stimulus: [
      { shapes: [{ type: "dot", pos: "grid_tl", fill: "solid" }] }, { shapes: [{ type: "dot", pos: "grid_tc", fill: "solid" }] }, { shapes: [{ type: "dot", pos: "grid_tr", fill: "solid" }] },
      { shapes: [{ type: "dot", pos: "grid_ml", fill: "solid" }] }, { shapes: [{ type: "dot", pos: "grid_mc", fill: "solid" }] }, { shapes: [{ type: "dot", pos: "grid_mr", fill: "solid" }] },
      { shapes: [{ type: "dot", pos: "grid_bl", fill: "solid" }] }, { shapes: [{ type: "dot", pos: "grid_bc", fill: "solid" }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "dot", pos: "grid_br", fill: "solid" }], correct: true, rationale: "Reaches terminal Bottom-Right coordinate" },
      { id: "opt_b", shapes: [{ type: "dot", pos: "grid_bc", fill: "solid" }], correct: false, rationale: "Stalled at Bottom-Center" },
      { id: "opt_c", shapes: [{ type: "dot", pos: "grid_tr", fill: "solid" }], correct: false, rationale: "Top-Right column perseveration" },
      { id: "opt_d", shapes: [{ type: "dot", pos: "grid_mc", fill: "solid" }], correct: false, rationale: "Center point error" }
    ]
  },
  {
    id: "Q28",
    tier: 3,
    construct: "pattern_completion",
    format: "3x3",
    ruleDescription: "Outer geometry by Row (Square, Circle, Triangle), Inner emblem by Column (Dot, Cross, Dash). Target: Triangle + Dash.",
    stimulus: [
      { shapes: [{ type: "square", fill: "outline" }, { type: "dot", pos: "center", fill: "solid" }] },
      { shapes: [{ type: "square", fill: "outline" }, { type: "cross_sm", pos: "center", fill: "solid" }] },
      { shapes: [{ type: "square", fill: "outline" }, { type: "dash_sm", pos: "center", fill: "solid" }] },
      { shapes: [{ type: "circle", fill: "outline" }, { type: "dot", pos: "center", fill: "solid" }] },
      { shapes: [{ type: "circle", fill: "outline" }, { type: "cross_sm", pos: "center", fill: "solid" }] },
      { shapes: [{ type: "circle", fill: "outline" }, { type: "dash_sm", pos: "center", fill: "solid" }] },
      { shapes: [{ type: "triangle", fill: "outline" }, { type: "dot", pos: "center", fill: "solid" }] },
      { shapes: [{ type: "triangle", fill: "outline" }, { type: "cross_sm", pos: "center", fill: "solid" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "triangle", fill: "outline" }, { type: "dash_sm", pos: "center", fill: "solid" }], correct: true, rationale: "Exact orthogonal intersection" },
      { id: "opt_b", shapes: [{ type: "triangle", fill: "outline" }, { type: "cross_sm", pos: "center", fill: "solid" }], correct: false, rationale: "Copied preceding column badge" },
      { id: "opt_c", shapes: [{ type: "circle", fill: "outline" }, { type: "dash_sm", pos: "center", fill: "solid" }], correct: false, rationale: "Copied preceding row container" },
      { id: "opt_d", shapes: [{ type: "triangle", fill: "outline" }, { type: "dot", pos: "center", fill: "solid" }], correct: false, rationale: "Column 1 badge slip" }
    ]
  },
  {
    id: "Q29",
    tier: 3,
    construct: "spatial_transformation",
    format: "3x3",
    ruleDescription: "Clock hour hands rotate 90-deg along columns. Target: 6:00 Hand in Col 3.",
    stimulus: [
      { shapes: [{ type: "clock", hourAngle: 0 }] }, { shapes: [{ type: "clock", hourAngle: 90 }] }, { shapes: [{ type: "clock", hourAngle: 180 }] },
      { shapes: [{ type: "clock", hourAngle: 90 }] }, { shapes: [{ type: "clock", hourAngle: 180 }] }, { shapes: [{ type: "clock", hourAngle: 270 }] },
      { shapes: [{ type: "clock", hourAngle: 180 }] }, { shapes: [{ type: "clock", hourAngle: 270 }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "clock", hourAngle: 0 }], correct: true, rationale: "Cycle completes back to 12:00 (0 deg)" },
      { id: "opt_b", shapes: [{ type: "clock", hourAngle: 270 }], correct: false, rationale: "Stalled at 9:00" },
      { id: "opt_c", shapes: [{ type: "clock", hourAngle: 180 }], correct: false, rationale: "Opposite 6:00 error" },
      { id: "opt_d", shapes: [{ type: "clock", hourAngle: 90 }], correct: false, rationale: "Reverse rotation" }
    ]
  },
  {
    id: "Q30",
    tier: 3,
    construct: "pattern_completion",
    format: "3x3",
    ruleDescription: "Cyclic house-stage pattern shifts by one stage across rows and columns. The final cell restarts at stage 1.",
    stimulus: [
      { shapes: [{ type: "house", stage: 1 }] }, { shapes: [{ type: "house", stage: 2 }] }, { shapes: [{ type: "house", stage: 3 }] },
      { shapes: [{ type: "house", stage: 2 }] }, { shapes: [{ type: "house", stage: 3 }] }, { shapes: [{ type: "house", stage: 4 }] },
      { shapes: [{ type: "house", stage: 3 }] }, { shapes: [{ type: "house", stage: 4 }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "house", stage: 1 }], correct: true, rationale: "Restores unique cyclic sequence (Stage 1)" },
      { id: "opt_b", shapes: [{ type: "house", stage: 4 }], correct: false, rationale: "Duplicate stage 4" },
      { id: "opt_c", shapes: [{ type: "house", stage: 3 }], correct: false, rationale: "Duplicate stage 3" },
      { id: "opt_d", shapes: [{ type: "house", stage: 2 }], correct: false, rationale: "Premature stage 2" }
    ]
  },

  // -------------------------------------------------------------
  // TIER 4: DUAL INTERACTING RULES & SUPERPOSITION (Items 31 - 40)
  // -------------------------------------------------------------
  {
    id: "Q31",
    tier: 4,
    construct: "multi_rule_reasoning",
    format: "3x3",
    ruleDescription: "Dual rule: Clockwise rotation (+90°) AND fill toggling (Solid <-> Outline)",
    stimulus: [
      { shapes: [{ type: "arrow", rot: 0, fill: "solid" }] }, { shapes: [{ type: "arrow", rot: 90, fill: "outline" }] }, { shapes: [{ type: "arrow", rot: 180, fill: "solid" }] },
      { shapes: [{ type: "arrow", rot: 90, fill: "outline" }] }, { shapes: [{ type: "arrow", rot: 180, fill: "solid" }] }, { shapes: [{ type: "arrow", rot: 270, fill: "outline" }] },
      { shapes: [{ type: "arrow", rot: 180, fill: "solid" }] }, { shapes: [{ type: "arrow", rot: 270, fill: "outline" }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "arrow", rot: 0, fill: "solid" }], correct: true, rationale: "Rotates to 0/360° and flips to solid fill" },
      { id: "opt_b", shapes: [{ type: "arrow", rot: 0, fill: "outline" }], correct: false, rationale: "Correct rotation, missed fill rule" },
      { id: "opt_c", shapes: [{ type: "arrow", rot: 270, fill: "solid" }], correct: false, rationale: "Missed rotation step" },
      { id: "opt_d", shapes: [{ type: "arrow", rot: 90, fill: "solid" }], correct: false, rationale: "Reverse rotation" }
    ]
  },
  {
    id: "Q32",
    tier: 4,
    construct: "multi_rule_reasoning",
    format: "3x3",
    ruleDescription: "Simultaneous shape shift (Circle -> Square -> Triangle) and count increment (1 -> 2 -> 3). Target: 3 Triangles.",
    stimulus: [
      { shapes: [{ type: "circle", count: 1, fill: "solid" }] }, { shapes: [{ type: "circle", count: 2, fill: "solid" }] }, { shapes: [{ type: "circle", count: 3, fill: "solid" }] },
      { shapes: [{ type: "square", count: 1, fill: "solid" }] }, { shapes: [{ type: "square", count: 2, fill: "solid" }] }, { shapes: [{ type: "square", count: 3, fill: "solid" }] },
      { shapes: [{ type: "triangle", count: 1, fill: "solid" }] }, { shapes: [{ type: "triangle", count: 2, fill: "solid" }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "triangle", count: 3, fill: "solid" }], correct: true, rationale: "Both shape and count progression satisfied" },
      { id: "opt_b", shapes: [{ type: "triangle", count: 2, fill: "solid" }], correct: false, rationale: "Count failed to increment" },
      { id: "opt_c", shapes: [{ type: "square", count: 3, fill: "solid" }], correct: false, rationale: "Row shape missed" },
      { id: "opt_d", shapes: [{ type: "triangle", count: 4, fill: "solid" }], correct: false, rationale: "Over-count" }
    ]
  },
  {
    id: "Q33",
    tier: 4,
    construct: "multi_rule_reasoning",
    format: "3x3",
    ruleDescription: "Inverse dual progression: Outer shape count decrements (3 -> 2 -> 1) while center dots increment (1 -> 2 -> 3). Target: 1 Circle + 3 Dots.",
    stimulus: [
      { shapes: [{ type: "hexagon", count: 3, fill: "outline" }, { type: "dot", count: 1, fill: "solid" }] },
      { shapes: [{ type: "hexagon", count: 2, fill: "outline" }, { type: "dot", count: 2, fill: "solid" }] },
      { shapes: [{ type: "hexagon", count: 1, fill: "outline" }, { type: "dot", count: 3, fill: "solid" }] },
      { shapes: [{ type: "square", count: 3, fill: "outline" }, { type: "dot", count: 1, fill: "solid" }] },
      { shapes: [{ type: "square", count: 2, fill: "outline" }, { type: "dot", count: 2, fill: "solid" }] },
      { shapes: [{ type: "square", count: 1, fill: "outline" }, { type: "dot", count: 3, fill: "solid" }] },
      { shapes: [{ type: "circle", count: 3, fill: "outline" }, { type: "dot", count: 1, fill: "solid" }] },
      { shapes: [{ type: "circle", count: 2, fill: "outline" }, { type: "dot", count: 2, fill: "solid" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "circle", count: 1, fill: "outline" }, { type: "dot", count: 3, fill: "solid" }], correct: true, rationale: "Correct 1 outer circle and 3 inner dots" },
      { id: "opt_b", shapes: [{ type: "circle", count: 1, fill: "outline" }, { type: "dot", count: 2, fill: "solid" }], correct: false, rationale: "Inner dot count stalled" },
      { id: "opt_c", shapes: [{ type: "circle", count: 2, fill: "outline" }, { type: "dot", count: 3, fill: "solid" }], correct: false, rationale: "Outer circle count failed to decrement" },
      { id: "opt_d", shapes: [{ type: "square", count: 1, fill: "outline" }, { type: "dot", count: 3, fill: "solid" }], correct: false, rationale: "Wrong outer shape" }
    ]
  },
  {
    id: "Q34",
    tier: 4,
    construct: "spatial_transformation",
    format: "3x3",
    ruleDescription: "Corner Orbit: Token orbits clockwise around four corners (TL -> TR -> BR -> BL). Target: Top-Left.",
    stimulus: [
      { shapes: [{ type: "dot", pos: "corner_tl", fill: "solid" }] }, { shapes: [{ type: "dot", pos: "corner_tr", fill: "solid" }] }, { shapes: [{ type: "dot", pos: "corner_br", fill: "solid" }] },
      { shapes: [{ type: "dot", pos: "corner_tr", fill: "solid" }] }, { shapes: [{ type: "dot", pos: "corner_br", fill: "solid" }] }, { shapes: [{ type: "dot", pos: "corner_bl", fill: "solid" }] },
      { shapes: [{ type: "dot", pos: "corner_br", fill: "solid" }] }, { shapes: [{ type: "dot", pos: "corner_bl", fill: "solid" }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "dot", pos: "corner_tl", fill: "solid" }], correct: true, rationale: "Completes cyclic orbit back to Top-Left" },
      { id: "opt_b", shapes: [{ type: "dot", pos: "corner_bl", fill: "solid" }], correct: false, rationale: "Perseveration of previous state" },
      { id: "opt_c", shapes: [{ type: "dot", pos: "corner_tr", fill: "solid" }], correct: false, rationale: "Diagonal skip" },
      { id: "opt_d", shapes: [{ type: "dot", pos: "corner_br", fill: "solid" }], correct: false, rationale: "Reverse rotation" }
    ]
  },
  {
    id: "Q35",
    tier: 4,
    construct: "multi_rule_reasoning",
    format: "3x3",
    ruleDescription: "Row Superposition: Col 1 + Col 2 = Col 3 (Union of visual parts)",
    stimulus: [
      { shapes: [{ type: "line_vert", fill: "solid" }] },
      { shapes: [{ type: "line_horiz", fill: "solid" }] },
      { shapes: [{ type: "plus_composite", fill: "solid" }] },
      { shapes: [{ type: "circle", scale: "med", fill: "outline" }] },
      { shapes: [{ type: "dot", pos: "center", fill: "solid" }] },
      { shapes: [{ type: "circle", scale: "med", fill: "outline" }, { type: "dot", pos: "center", fill: "solid" }] },
      { shapes: [{ type: "square", scale: "med", fill: "outline" }] },
      { shapes: [{ type: "diagonal_slash", fill: "solid" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "square", scale: "med", fill: "outline" }, { type: "diagonal_slash", fill: "solid" }], correct: true, rationale: "Correct union composition of square + diagonal" },
      { id: "opt_b", shapes: [{ type: "square", scale: "med", fill: "outline" }], correct: false, rationale: "Col 1 element only" },
      { id: "opt_c", shapes: [{ type: "diagonal_slash", fill: "solid" }], correct: false, rationale: "Col 2 element only" },
      { id: "opt_d", shapes: [{ type: "circle", scale: "med", fill: "outline" }, { type: "diagonal_slash", fill: "solid" }], correct: false, rationale: "Base shape error" }
    ]
  },
  {
    id: "Q36",
    tier: 4,
    construct: "multi_rule_reasoning",
    format: "3x3",
    ruleDescription: "Element Subtraction / Cancellation: Col 1 minus Col 2 = Col 3 remainder",
    stimulus: [
      { shapes: [{ type: "circle", scale: "large", fill: "outline" }, { type: "dot", pos: "center", fill: "solid" }] },
      { shapes: [{ type: "dot", pos: "center", fill: "solid" }] },
      { shapes: [{ type: "circle", scale: "large", fill: "outline" }] },
      { shapes: [{ type: "square", scale: "large", fill: "outline" }, { type: "cross_sm", pos: "center", fill: "solid" }] },
      { shapes: [{ type: "cross_sm", pos: "center", fill: "solid" }] },
      { shapes: [{ type: "square", scale: "large", fill: "outline" }] },
      { shapes: [{ type: "triangle", scale: "large", fill: "outline" }, { type: "dash_sm", pos: "center", fill: "solid" }] },
      { shapes: [{ type: "dash_sm", pos: "center", fill: "solid" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "triangle", scale: "large", fill: "outline" }], correct: true, rationale: "Correct remainder (outer triangle only)" },
      { id: "opt_b", shapes: [{ type: "dash_sm", pos: "center", fill: "solid" }], correct: false, rationale: "Subtracted outer shape instead of inner badge" },
      { id: "opt_c", shapes: [{ type: "triangle", scale: "large", fill: "outline" }, { type: "dash_sm", pos: "center", fill: "solid" }], correct: false, rationale: "No subtraction applied" },
      { id: "opt_d", shapes: [{ type: "circle", scale: "large", fill: "outline" }], correct: false, rationale: "Row shape error" }
    ]
  },
  {
    id: "Q37",
    tier: 4,
    construct: "multi_rule_reasoning",
    format: "3x3",
    ruleDescription: "Scale Reduction (Large -> Med -> Small) with simultaneous segment doubling (1 -> 2 -> 4)",
    stimulus: [
      { shapes: [{ type: "circle", scale: "large", seg: 1, fill: "outline" }] },
      { shapes: [{ type: "circle", scale: "med", seg: 2, fill: "outline" }] },
      { shapes: [{ type: "circle", scale: "small", seg: 4, fill: "outline" }] },
      { shapes: [{ type: "square", scale: "large", seg: 1, fill: "outline" }] },
      { shapes: [{ type: "square", scale: "med", seg: 2, fill: "outline" }] },
      { shapes: [{ type: "square", scale: "small", seg: 4, fill: "outline" }] },
      { shapes: [{ type: "diamond", scale: "large", seg: 1, fill: "outline" }] },
      { shapes: [{ type: "diamond", scale: "med", seg: 2, fill: "outline" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "diamond", scale: "small", seg: 4, fill: "outline" }], correct: true, rationale: "Small diamond with 4 divided segments" },
      { id: "opt_b", shapes: [{ type: "diamond", scale: "small", seg: 2, fill: "outline" }], correct: false, rationale: "Segment doubling missed" },
      { id: "opt_c", shapes: [{ type: "diamond", scale: "med", seg: 4, fill: "outline" }], correct: false, rationale: "Scale reduction missed" },
      { id: "opt_d", shapes: [{ type: "square", scale: "small", seg: 4, fill: "outline" }], correct: false, rationale: "Row shape error" }
    ]
  },
  {
    id: "Q38",
    tier: 4,
    construct: "spatial_transformation",
    format: "3x3",
    ruleDescription: "Clock Hour & Minute Coordination: Minute hand advances 90° while Hour hand advances 30°",
    stimulus: [
      { shapes: [{ type: "clock", hourAngle: 0, minuteAngle: 0 }] },
      { shapes: [{ type: "clock", hourAngle: 30, minuteAngle: 90 }] },
      { shapes: [{ type: "clock", hourAngle: 60, minuteAngle: 180 }] },
      { shapes: [{ type: "clock", hourAngle: 30, minuteAngle: 90 }] },
      { shapes: [{ type: "clock", hourAngle: 60, minuteAngle: 180 }] },
      { shapes: [{ type: "clock", hourAngle: 90, minuteAngle: 270 }] },
      { shapes: [{ type: "clock", hourAngle: 60, minuteAngle: 180 }] },
      { shapes: [{ type: "clock", hourAngle: 90, minuteAngle: 270 }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "clock", hourAngle: 120, minuteAngle: 0 }], correct: true, rationale: "Hour hand at 120°, minute hand at 360/0°" },
      { id: "opt_b", shapes: [{ type: "clock", hourAngle: 90, minuteAngle: 0 }], correct: false, rationale: "Hour hand stalled" },
      { id: "opt_c", shapes: [{ type: "clock", hourAngle: 120, minuteAngle: 270 }], correct: false, rationale: "Minute hand stalled" },
      { id: "opt_d", shapes: [{ type: "clock", hourAngle: 60, minuteAngle: 0 }], correct: false, rationale: "Hour hand reversed" }
    ]
  },
  {
    id: "Q39",
    tier: 4,
    construct: "multi_rule_reasoning",
    format: "3x3",
    ruleDescription: "Dual Orthogonal Line Progression: Vertical lines increment (1 -> 2 -> 3) while Horizontal lines decrement (3 -> 2 -> 1)",
    stimulus: [
      { shapes: [{ type: "lines_combo", vert: 1, horiz: 3 }] },
      { shapes: [{ type: "lines_combo", vert: 2, horiz: 2 }] },
      { shapes: [{ type: "lines_combo", vert: 3, horiz: 1 }] },
      { shapes: [{ type: "lines_combo", vert: 1, horiz: 3 }] },
      { shapes: [{ type: "lines_combo", vert: 2, horiz: 2 }] },
      { shapes: [{ type: "lines_combo", vert: 3, horiz: 1 }] },
      { shapes: [{ type: "lines_combo", vert: 1, horiz: 3 }] },
      { shapes: [{ type: "lines_combo", vert: 2, horiz: 2 }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "lines_combo", vert: 3, horiz: 1 }], correct: true, rationale: "Satisfies dual line count progression" },
      { id: "opt_b", shapes: [{ type: "lines_combo", vert: 2, horiz: 2 }], correct: false, rationale: "Perseveration of middle state" },
      { id: "opt_c", shapes: [{ type: "lines_combo", vert: 3, horiz: 2 }], correct: false, rationale: "Horizontal decrement missed" },
      { id: "opt_d", shapes: [{ type: "lines_combo", vert: 1, horiz: 1 }], correct: false, rationale: "Vertical increment missed" }
    ]
  },
  {
    id: "Q40",
    tier: 4,
    construct: "spatial_transformation",
    format: "3x3",
    ruleDescription: "Rotational orbit of composite marker around perimeter (0° -> 90° -> 180° -> 270°)",
    stimulus: [
      { shapes: [{ type: "arrow", rot: 0, fill: "solid" }] }, { shapes: [{ type: "arrow", rot: 90, fill: "solid" }] }, { shapes: [{ type: "arrow", rot: 180, fill: "solid" }] },
      { shapes: [{ type: "arrow", rot: 90, fill: "solid" }] }, { shapes: [{ type: "arrow", rot: 180, fill: "solid" }] }, { shapes: [{ type: "arrow", rot: 270, fill: "solid" }] },
      { shapes: [{ type: "arrow", rot: 180, fill: "solid" }] }, { shapes: [{ type: "arrow", rot: 270, fill: "solid" }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "arrow", rot: 0, fill: "solid" }], correct: true, rationale: "Completes cycle back to 0° (pointing up)" },
      { id: "opt_b", shapes: [{ type: "arrow", rot: 270, fill: "solid" }], correct: false, rationale: "Stalled at 270°" },
      { id: "opt_c", shapes: [{ type: "arrow", rot: 180, fill: "solid" }], correct: false, rationale: "Reversal" },
      { id: "opt_d", shapes: [{ type: "arrow", rot: 90, fill: "solid" }], correct: false, rationale: "Orthogonal slip" }
    ]
  },

  // -------------------------------------------------------------
  // TIER 5: COMPOSITIONAL & MULTI-RULE SYNTHESES (Items 41 - 50)
  // -------------------------------------------------------------
  {
    id: "Q41",
    tier: 5,
    construct: "multi_rule_reasoning",
    format: "3x3",
    ruleDescription: "Boolean XOR / Overlap Cancellation: Elements appearing in both Col 1 and Col 2 cancel out in Col 3",
    stimulus: [
      { shapes: [{ type: "line_vert", fill: "solid" }, { type: "line_horiz", fill: "solid" }] },
      { shapes: [{ type: "line_vert", fill: "solid" }] },
      { shapes: [{ type: "line_horiz", fill: "solid" }] },
      { shapes: [{ type: "circle", scale: "med", fill: "outline" }, { type: "dot", pos: "center", fill: "solid" }] },
      { shapes: [{ type: "circle", scale: "med", fill: "outline" }] },
      { shapes: [{ type: "dot", pos: "center", fill: "solid" }] },
      { shapes: [{ type: "square", scale: "med", fill: "outline" }, { type: "diagonal_slash", fill: "solid" }] },
      { shapes: [{ type: "square", scale: "med", fill: "outline" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "diagonal_slash", fill: "solid" }], correct: true, rationale: "Square cancels out, leaving diagonal slash" },
      { id: "opt_b", shapes: [{ type: "square", scale: "med", fill: "outline" }], correct: false, rationale: "Failed cancellation" },
      { id: "opt_c", shapes: [{ type: "square", scale: "med", fill: "outline" }, { type: "diagonal_slash", fill: "solid" }], correct: false, rationale: "Col 1 perseveration" },
      { id: "opt_d", shapes: [{ type: "circle", scale: "med", fill: "outline" }], correct: false, rationale: "Wrong shape" }
    ]
  },
  {
    id: "Q42",
    tier: 5,
    construct: "multi_rule_reasoning",
    format: "3x3",
    ruleDescription: "Double Latin Square: Permutation of 3 Shapes (Circle, Square, Diamond) AND 3 Fills (Solid, Shaded, Outline)",
    stimulus: [
      { shapes: [{ type: "circle", fill: "solid" }] }, { shapes: [{ type: "square", fill: "shaded" }] }, { shapes: [{ type: "diamond", fill: "outline" }] },
      { shapes: [{ type: "square", fill: "outline" }] }, { shapes: [{ type: "diamond", fill: "solid" }] }, { shapes: [{ type: "circle", fill: "shaded" }] },
      { shapes: [{ type: "diamond", fill: "shaded" }] }, { shapes: [{ type: "circle", fill: "outline" }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "square", fill: "solid" }], correct: true, rationale: "Completes both shape and fill Latin conditions" },
      { id: "opt_b", shapes: [{ type: "square", fill: "outline" }], correct: false, rationale: "Duplicate outline fill in column" },
      { id: "opt_c", shapes: [{ type: "diamond", fill: "solid" }], correct: false, rationale: "Duplicate diamond in row" },
      { id: "opt_d", shapes: [{ type: "circle", fill: "solid" }], correct: false, rationale: "Duplicate circle in column" }
    ]
  },
  {
    id: "Q43",
    tier: 5,
    construct: "multi_rule_reasoning",
    format: "3x3",
    ruleDescription: "Triple Operator: Concentric Ring Count (+1), 90° Clockwise Rotation, and Center Dot Fill Toggle",
    stimulus: [
      { shapes: [{ type: "concentric_rings", count: 1, rot: 0, dotFill: "solid" }] },
      { shapes: [{ type: "concentric_rings", count: 2, rot: 90, dotFill: "outline" }] },
      { shapes: [{ type: "concentric_rings", count: 3, rot: 180, dotFill: "solid" }] },
      { shapes: [{ type: "concentric_rings", count: 1, rot: 90, dotFill: "outline" }] },
      { shapes: [{ type: "concentric_rings", count: 2, rot: 180, dotFill: "solid" }] },
      { shapes: [{ type: "concentric_rings", count: 3, rot: 270, dotFill: "outline" }] },
      { shapes: [{ type: "concentric_rings", count: 1, rot: 180, dotFill: "solid" }] },
      { shapes: [{ type: "concentric_rings", count: 2, rot: 270, dotFill: "outline" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "concentric_rings", count: 3, rot: 0, dotFill: "solid" }], correct: true, rationale: "All 3 rules satisfied (3 rings, 0° rotation, solid dot)" },
      { id: "opt_b", shapes: [{ type: "concentric_rings", count: 3, rot: 0, dotFill: "outline" }], correct: false, rationale: "Dot fill alternation missed" },
      { id: "opt_c", shapes: [{ type: "concentric_rings", count: 2, rot: 0, dotFill: "solid" }], correct: false, rationale: "Ring count stalled at 2" },
      { id: "opt_d", shapes: [{ type: "concentric_rings", count: 3, rot: 270, dotFill: "solid" }], correct: false, rationale: "Rotation stalled at 270°" }
    ]
  },
  {
    id: "Q44",
    tier: 5,
    construct: "multi_rule_reasoning",
    format: "3x3",
    ruleDescription: "Dual-Token Orbit: Solid dot moves CW around corners, Hollow dot moves CCW",
    stimulus: [
      { shapes: [{ type: "dot", pos: "corner_tl", fill: "solid" }, { type: "dot", pos: "corner_br", fill: "outline" }] },
      { shapes: [{ type: "dot", pos: "corner_tr", fill: "solid" }, { type: "dot", pos: "corner_tr", fill: "outline" }] },
      { shapes: [{ type: "dot", pos: "corner_br", fill: "solid" }, { type: "dot", pos: "corner_tl", fill: "outline" }] },
      { shapes: [{ type: "dot", pos: "corner_tr", fill: "solid" }, { type: "dot", pos: "corner_tr", fill: "outline" }] },
      { shapes: [{ type: "dot", pos: "corner_br", fill: "solid" }, { type: "dot", pos: "corner_tl", fill: "outline" }] },
      { shapes: [{ type: "dot", pos: "corner_bl", fill: "solid" }, { type: "dot", pos: "corner_bl", fill: "outline" }] },
      { shapes: [{ type: "dot", pos: "corner_br", fill: "solid" }, { type: "dot", pos: "corner_tl", fill: "outline" }] },
      { shapes: [{ type: "dot", pos: "corner_bl", fill: "solid" }, { type: "dot", pos: "corner_bl", fill: "outline" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "dot", pos: "corner_tl", fill: "solid" }, { type: "dot", pos: "corner_br", fill: "outline" }], correct: true, rationale: "Solid advances to TL, Hollow advances to BR" },
      { id: "opt_b", shapes: [{ type: "dot", pos: "corner_tl", fill: "solid" }, { type: "dot", pos: "corner_tl", fill: "outline" }], correct: false, rationale: "Hollow token direction error" },
      { id: "opt_c", shapes: [{ type: "dot", pos: "corner_bl", fill: "solid" }, { type: "dot", pos: "corner_br", fill: "outline" }], correct: false, rationale: "Solid token stalled" },
      { id: "opt_d", shapes: [{ type: "dot", pos: "corner_br", fill: "solid" }, { type: "dot", pos: "corner_tl", fill: "outline" }], correct: false, rationale: "Both reversed" }
    ]
  },
  {
    id: "Q45",
    tier: 5,
    construct: "multi_rule_reasoning",
    format: "3x3",
    ruleDescription: "Additive dot composition: Col 1 dots + Col 2 dots = Col 3 dots (e.g. 1 + 2 = 3)",
    stimulus: [
      { shapes: [{ type: "dot", count: 1, fill: "solid" }] }, { shapes: [{ type: "dot", count: 1, fill: "solid" }] }, { shapes: [{ type: "dot", count: 2, fill: "solid" }] },
      { shapes: [{ type: "dot", count: 1, fill: "solid" }] }, { shapes: [{ type: "dot", count: 2, fill: "solid" }] }, { shapes: [{ type: "dot", count: 3, fill: "solid" }] },
      { shapes: [{ type: "dot", count: 2, fill: "solid" }] }, { shapes: [{ type: "dot", count: 2, fill: "solid" }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "dot", count: 4, fill: "solid" }], correct: true, rationale: "2 + 2 = 4 dots" },
      { id: "opt_b", shapes: [{ type: "dot", count: 3, fill: "solid" }], correct: false, rationale: "Under-addition" },
      { id: "opt_c", shapes: [{ type: "dot", count: 5, fill: "solid" }], correct: false, rationale: "Over-addition" },
      { id: "opt_d", shapes: [{ type: "dot", count: 2, fill: "solid" }], correct: false, rationale: "No addition" }
    ]
  },
  {
    id: "Q46",
    tier: 5,
    construct: "multi_rule_reasoning",
    format: "3x3",
    ruleDescription: "Shape Nesting Morph: Col 1 Inner becomes Col 2 Outer, Col 2 Inner becomes Col 3 Outer",
    stimulus: [
      { shapes: [{ type: "square", scale: "large", fill: "outline" }, { type: "circle", scale: "small", fill: "solid" }] },
      { shapes: [{ type: "circle", scale: "large", fill: "outline" }, { type: "triangle", scale: "small", fill: "solid" }] },
      { shapes: [{ type: "triangle", scale: "large", fill: "outline" }, { type: "square", scale: "small", fill: "solid" }] },
      { shapes: [{ type: "circle", scale: "large", fill: "outline" }, { type: "triangle", scale: "small", fill: "solid" }] },
      { shapes: [{ type: "triangle", scale: "large", fill: "outline" }, { type: "square", scale: "small", fill: "solid" }] },
      { shapes: [{ type: "square", scale: "large", fill: "outline" }, { type: "circle", scale: "small", fill: "solid" }] },
      { shapes: [{ type: "triangle", scale: "large", fill: "outline" }, { type: "square", scale: "small", fill: "solid" }] },
      { shapes: [{ type: "square", scale: "large", fill: "outline" }, { type: "circle", scale: "small", fill: "solid" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "circle", scale: "large", fill: "outline" }, { type: "triangle", scale: "small", fill: "solid" }], correct: true, rationale: "Square's inner circle becomes outer, encloses triangle" },
      { id: "opt_b", shapes: [{ type: "circle", scale: "large", fill: "outline" }, { type: "square", scale: "small", fill: "solid" }], correct: false, rationale: "Inner kernel error" },
      { id: "opt_c", shapes: [{ type: "triangle", scale: "large", fill: "outline" }, { type: "circle", scale: "small", fill: "solid" }], correct: false, rationale: "Outer frame error" },
      { id: "opt_d", shapes: [{ type: "square", scale: "large", fill: "outline" }, { type: "triangle", scale: "small", fill: "solid" }], correct: false, rationale: "Stalled shape morph" }
    ]
  },
  {
    id: "Q47",
    tier: 5,
    construct: "spatial_transformation",
    format: "3x3",
    ruleDescription: "Vertical mirror line: Col 3 is the left-right reflection of Col 1 across the Col 2 divider",
    stimulus: [
      { shapes: [{ type: "arrow", rot: 90, fill: "solid" }] }, { shapes: [{ type: "line_vert", fill: "solid" }] }, { shapes: [{ type: "arrow", rot: 270, fill: "solid" }] },
      { shapes: [{ type: "l_shape", rot: 0, fill: "solid" }] }, { shapes: [{ type: "line_vert", fill: "solid" }] }, { shapes: [{ type: "l_shape_reflected", fill: "solid" }] },
      { shapes: [{ type: "crescent", rot: 0, fill: "solid" }] }, { shapes: [{ type: "line_vert", fill: "solid" }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "crescent", rot: 180, fill: "solid" }], correct: true, rationale: "Mirror reflection across vertical spine" },
      { id: "opt_b", shapes: [{ type: "crescent", rot: 0, fill: "solid" }], correct: false, rationale: "Unreflected identical copy" },
      { id: "opt_c", shapes: [{ type: "crescent", rot: 90, fill: "solid" }], correct: false, rationale: "Rotated rather than mirrored" },
      { id: "opt_d", shapes: [{ type: "arrow", rot: 270, fill: "solid" }], correct: false, rationale: "Wrong shape" }
    ]
  },
  {
    id: "Q48",
    tier: 5,
    construct: "multi_rule_reasoning",
    format: "3x3",
    ruleDescription: "Polygon Vertex Progression: 3 sides (Triangle) -> 4 (Square) -> 5 (Pentagon); continue increasing the vertex count",
    stimulus: [
      { shapes: [{ type: "triangle", fill: "outline" }] }, { shapes: [{ type: "square", fill: "outline" }] }, { shapes: [{ type: "pentagon", fill: "outline" }] },
      { shapes: [{ type: "square", fill: "outline" }] }, { shapes: [{ type: "pentagon", fill: "outline" }] }, { shapes: [{ type: "hexagon", fill: "outline" }] },
      { shapes: [{ type: "pentagon", fill: "outline" }] }, { shapes: [{ type: "hexagon", fill: "outline" }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "heptagon", fill: "outline" }], correct: true, rationale: "Continues the sequence with a seven-sided polygon" },
      { id: "opt_b", shapes: [{ type: "square", fill: "outline" }], correct: false, rationale: "Regression to 4 sides" },
      { id: "opt_c", shapes: [{ type: "triangle", fill: "outline" }], correct: false, rationale: "Regression to 3 sides" },
      { id: "opt_d", shapes: [{ type: "circle", fill: "outline" }], correct: false, rationale: "Non-polygonal intruder" }
    ]
  },
  {
    id: "Q49",
    tier: 5,
    construct: "multi_rule_reasoning",
    format: "3x3",
    ruleDescription: "Traffic Signal Fleet Latin Square: Columns and Rows contain exactly 1 Red, 1 Yellow, and 1 Green signal state",
    stimulus: [
      { shapes: [{ type: "traffic_light", active: "red" }] }, { shapes: [{ type: "traffic_light", active: "yellow" }] }, { shapes: [{ type: "traffic_light", active: "green" }] },
      { shapes: [{ type: "traffic_light", active: "yellow" }] }, { shapes: [{ type: "traffic_light", active: "green" }] }, { shapes: [{ type: "traffic_light", active: "red" }] },
      { shapes: [{ type: "traffic_light", active: "green" }] }, { shapes: [{ type: "traffic_light", active: "red" }] }, null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "traffic_light", active: "yellow" }], correct: true, rationale: "Completes Latin square for traffic signals" },
      { id: "opt_b", shapes: [{ type: "traffic_light", active: "red" }], correct: false, rationale: "Duplicate red signal in column" },
      { id: "opt_c", shapes: [{ type: "traffic_light", active: "green" }], correct: false, rationale: "Duplicate green signal in row" },
      { id: "opt_d", shapes: [{ type: "traffic_light", active: "none" }], correct: false, rationale: "Blank signal error" }
    ]
  },
  {
    id: "Q50",
    tier: 5,
    construct: "multi_rule_reasoning",
    format: "3x3",
    ruleDescription: "Ultimate Latin Hypercube: Simultaneous Latin Square for Shapes (Circle, Square, Diamond), Sizes, and Fills",
    stimulus: [
      { shapes: [{ type: "circle", scale: "large", fill: "solid" }] },
      { shapes: [{ type: "square", scale: "med", fill: "shaded" }] },
      { shapes: [{ type: "diamond", scale: "small", fill: "outline" }] },
      { shapes: [{ type: "square", scale: "small", fill: "outline" }] },
      { shapes: [{ type: "diamond", scale: "large", fill: "solid" }] },
      { shapes: [{ type: "circle", scale: "med", fill: "shaded" }] },
      { shapes: [{ type: "diamond", scale: "med", fill: "shaded" }] },
      { shapes: [{ type: "circle", scale: "small", fill: "outline" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "square", scale: "large", fill: "solid" }], correct: true, rationale: "Satisfies all 3 dimensional Latin constraints simultaneously" },
      { id: "opt_b", shapes: [{ type: "square", scale: "small", fill: "solid" }], correct: false, rationale: "Size conflict with row 3" },
      { id: "opt_c", shapes: [{ type: "diamond", scale: "large", fill: "solid" }], correct: false, rationale: "Duplicate diamond in row 3" },
      { id: "opt_d", shapes: [{ type: "square", scale: "large", fill: "outline" }], correct: false, rationale: "Duplicate outline fill in column 3" }
    ]
  },
  {
    id: "Q51",
    tier: 2,
    construct: "analogical_mapping",
    format: "2x2",
    ruleDescription: "Add one mark: one dot becomes two; one triangle becomes two.",
    stimulus: [
      { shapes: [{ type: "dot", count: 1, fill: "solid" }] },
      { shapes: [{ type: "dot", count: 2, fill: "solid" }] },
      { shapes: [{ type: "triangle", fill: "solid" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "triangle", fill: "solid" }, { type: "triangle", fill: "solid", pos: "right" }], correct: true, rationale: "Applies the one-to-two quantity change to the triangle." },
      { id: "opt_b", shapes: [{ type: "triangle", fill: "solid" }], correct: false, rationale: "Does not add the second mark." },
      { id: "opt_c", shapes: [{ type: "square", fill: "solid" }, { type: "square", fill: "solid", pos: "right" }], correct: false, rationale: "Adds a mark but changes the base shape." },
      { id: "opt_d", shapes: [{ type: "triangle", fill: "solid" }, { type: "triangle", fill: "solid", pos: "right" }, { type: "triangle", fill: "solid", pos: "left" }], correct: false, rationale: "Adds two marks instead of one." }
    ]
  },
  {
    id: "Q52",
    tier: 2,
    construct: "analogical_mapping",
    format: "2x2",
    ruleDescription: "Change outline to solid fill while preserving the shape.",
    stimulus: [
      { shapes: [{ type: "pentagon", fill: "outline" }] },
      { shapes: [{ type: "pentagon", fill: "solid" }] },
      { shapes: [{ type: "hexagon", fill: "outline" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "hexagon", fill: "solid" }], correct: true, rationale: "Applies the outline-to-solid change to the hexagon." },
      { id: "opt_b", shapes: [{ type: "hexagon", fill: "outline" }], correct: false, rationale: "Leaves the fill unchanged." },
      { id: "opt_c", shapes: [{ type: "pentagon", fill: "solid" }], correct: false, rationale: "Copies the transformed example instead of preserving the new shape." },
      { id: "opt_d", shapes: [{ type: "hexagon", fill: "shaded" }], correct: false, rationale: "Changes to a different fill state." }
    ]
  },
  {
    id: "Q53",
    tier: 2,
    construct: "analogical_mapping",
    format: "2x2",
    ruleDescription: "Turn each shape one quarter-turn clockwise.",
    stimulus: [
      { shapes: [{ type: "arrow", rot: 0, fill: "solid" }] },
      { shapes: [{ type: "arrow", rot: 90, fill: "solid" }] },
      { shapes: [{ type: "t_shape", rot: 0, fill: "solid" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "t_shape", rot: 90, fill: "solid" }], correct: true, rationale: "Applies the same clockwise quarter-turn to the T-shape." },
      { id: "opt_b", shapes: [{ type: "t_shape", rot: 0, fill: "solid" }], correct: false, rationale: "Leaves the T-shape unchanged." },
      { id: "opt_c", shapes: [{ type: "t_shape", rot: 270, fill: "solid" }], correct: false, rationale: "Turns the shape counterclockwise." },
      { id: "opt_d", shapes: [{ type: "arrow", rot: 90, fill: "solid" }], correct: false, rationale: "Repeats the example shape rather than transforming the new shape." }
    ]
  },
  {
    id: "Q54",
    tier: 3,
    construct: "analogical_mapping",
    format: "2x2",
    ruleDescription: "Increase polygon sides by one: triangle to square; pentagon to hexagon.",
    stimulus: [
      { shapes: [{ type: "triangle", fill: "outline" }] },
      { shapes: [{ type: "square", fill: "outline" }] },
      { shapes: [{ type: "pentagon", fill: "outline" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "hexagon", fill: "outline" }], correct: true, rationale: "Adds one side to the pentagon, producing a hexagon." },
      { id: "opt_b", shapes: [{ type: "pentagon", fill: "outline" }], correct: false, rationale: "Does not increase the number of sides." },
      { id: "opt_c", shapes: [{ type: "heptagon", fill: "outline" }], correct: false, rationale: "Adds two sides rather than one." },
      { id: "opt_d", shapes: [{ type: "hexagon", fill: "solid" }], correct: false, rationale: "Changes the fill as well as the side count." }
    ]
  },
  {
    id: "Q55",
    tier: 3,
    construct: "analogical_mapping",
    format: "2x2",
    ruleDescription: "Move the shape from the left position to the right position.",
    stimulus: [
      { shapes: [{ type: "dot", pos: "left", fill: "solid" }] },
      { shapes: [{ type: "dot", pos: "right", fill: "solid" }] },
      { shapes: [{ type: "diamond", pos: "left", fill: "outline" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "diamond", pos: "right", fill: "outline" }], correct: true, rationale: "Moves the diamond to the right and preserves its appearance." },
      { id: "opt_b", shapes: [{ type: "diamond", pos: "left", fill: "outline" }], correct: false, rationale: "Leaves the diamond in its original position." },
      { id: "opt_c", shapes: [{ type: "diamond", pos: "right", fill: "solid" }], correct: false, rationale: "Moves it but changes its fill." },
      { id: "opt_d", shapes: [{ type: "dot", pos: "right", fill: "solid" }], correct: false, rationale: "Copies the example shape." }
    ]
  },
  {
    id: "Q56",
    tier: 3,
    construct: "analogical_mapping",
    format: "2x2",
    ruleDescription: "Add a small solid dot at the center of the shape.",
    stimulus: [
      { shapes: [{ type: "circle", fill: "outline" }] },
      { shapes: [{ type: "circle", fill: "outline" }, { type: "dot", pos: "center", fill: "solid" }] },
      { shapes: [{ type: "triangle", fill: "outline" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "triangle", fill: "outline" }, { type: "dot", pos: "center", fill: "solid" }], correct: true, rationale: "Adds the same central dot while preserving the triangle." },
      { id: "opt_b", shapes: [{ type: "triangle", fill: "outline" }], correct: false, rationale: "Does not add the central dot." },
      { id: "opt_c", shapes: [{ type: "circle", fill: "outline" }, { type: "dot", pos: "center", fill: "solid" }], correct: false, rationale: "Repeats the example rather than applying the change to the triangle." },
      { id: "opt_d", shapes: [{ type: "triangle", fill: "solid" }], correct: false, rationale: "Fills the whole triangle instead of adding a separate dot." }
    ]
  },
  {
    id: "Q57",
    tier: 3,
    construct: "analogical_mapping",
    format: "2x2",
    ruleDescription: "Exchange the left and right positions of the two shapes.",
    stimulus: [
      { shapes: [{ type: "circle", pos: "left", fill: "outline" }, { type: "square", pos: "right", fill: "solid" }] },
      { shapes: [{ type: "circle", pos: "right", fill: "outline" }, { type: "square", pos: "left", fill: "solid" }] },
      { shapes: [{ type: "triangle", pos: "left", fill: "solid" }, { type: "diamond", pos: "right", fill: "outline" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "triangle", pos: "right", fill: "solid" }, { type: "diamond", pos: "left", fill: "outline" }], correct: true, rationale: "Exchanges the positions while preserving both shapes and fills." },
      { id: "opt_b", shapes: [{ type: "triangle", pos: "left", fill: "solid" }, { type: "diamond", pos: "right", fill: "outline" }], correct: false, rationale: "Leaves both shapes in their original positions." },
      { id: "opt_c", shapes: [{ type: "triangle", pos: "right", fill: "outline" }, { type: "diamond", pos: "left", fill: "solid" }], correct: false, rationale: "Swaps the fills instead of only the positions." },
      { id: "opt_d", shapes: [{ type: "circle", pos: "right", fill: "outline" }, { type: "square", pos: "left", fill: "solid" }], correct: false, rationale: "Copies the example shapes." }
    ]
  },
  {
    id: "Q58",
    tier: 3,
    construct: "analogical_mapping",
    format: "2x2",
    ruleDescription: "Replace each circle with a square, leaving the count and fill unchanged.",
    stimulus: [
      { shapes: [{ type: "circle", fill: "outline" }] },
      { shapes: [{ type: "square", fill: "outline" }] },
      { shapes: [{ type: "dot", count: 3, fill: "solid" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "square", pos: "left", fill: "solid" }, { type: "square", pos: "center", fill: "solid" }, { type: "square", pos: "right", fill: "solid" }], correct: true, rationale: "Changes all three marks to squares and preserves count and fill." },
      { id: "opt_b", shapes: [{ type: "circle", pos: "left", fill: "solid" }, { type: "circle", pos: "center", fill: "solid" }, { type: "circle", pos: "right", fill: "solid" }], correct: false, rationale: "Leaves the original shape type unchanged." },
      { id: "opt_c", shapes: [{ type: "square", pos: "left", fill: "solid" }, { type: "square", pos: "right", fill: "solid" }], correct: false, rationale: "Changes the shape but loses one mark." },
      { id: "opt_d", shapes: [{ type: "square", pos: "left", fill: "outline" }, { type: "square", pos: "center", fill: "outline" }, { type: "square", pos: "right", fill: "outline" }], correct: false, rationale: "Changes the fill as well as the shape." }
    ]
  },
  {
    id: "Q59",
    tier: 4,
    construct: "analogical_mapping",
    format: "2x2",
    ruleDescription: "Swap the sizes of the outline and solid shapes.",
    stimulus: [
      { shapes: [{ type: "square", scale: "large", fill: "outline" }, { type: "circle", scale: "small", fill: "solid" }] },
      { shapes: [{ type: "square", scale: "small", fill: "outline" }, { type: "circle", scale: "large", fill: "solid" }] },
      { shapes: [{ type: "triangle", scale: "large", fill: "outline" }, { type: "star", scale: "small", fill: "solid" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "triangle", scale: "small", fill: "outline" }, { type: "star", scale: "large", fill: "solid" }], correct: true, rationale: "Exchanges the two sizes and preserves shape and fill." },
      { id: "opt_b", shapes: [{ type: "triangle", scale: "large", fill: "outline" }, { type: "star", scale: "small", fill: "solid" }], correct: false, rationale: "Leaves both sizes unchanged." },
      { id: "opt_c", shapes: [{ type: "triangle", scale: "small", fill: "solid" }, { type: "star", scale: "large", fill: "outline" }], correct: false, rationale: "Swaps fills instead of sizes." },
      { id: "opt_d", shapes: [{ type: "square", scale: "small", fill: "outline" }, { type: "circle", scale: "large", fill: "solid" }], correct: false, rationale: "Copies the example pair." }
    ]
  },
  {
    id: "Q60",
    tier: 4,
    construct: "analogical_mapping",
    format: "2x2",
    ruleDescription: "Increase polygon sides by one and change outline fill to solid.",
    stimulus: [
      { shapes: [{ type: "triangle", fill: "outline" }] },
      { shapes: [{ type: "square", fill: "solid" }] },
      { shapes: [{ type: "pentagon", fill: "outline" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "hexagon", fill: "solid" }], correct: true, rationale: "Adds one side and applies the outline-to-solid fill change." },
      { id: "opt_b", shapes: [{ type: "hexagon", fill: "outline" }], correct: false, rationale: "Adds one side but omits the fill change." },
      { id: "opt_c", shapes: [{ type: "heptagon", fill: "solid" }], correct: false, rationale: "Adds two sides rather than one." },
      { id: "opt_d", shapes: [{ type: "pentagon", fill: "solid" }], correct: false, rationale: "Applies the fill change but not the side-count change." }
    ]
  },
  {
    id: "Q61",
    tier: 4,
    construct: "analogical_mapping",
    format: "2x2",
    ruleDescription: "Rotate both shapes 90 degrees clockwise and exchange their left-right positions.",
    stimulus: [
      { shapes: [{ type: "arrow", rot: 0, pos: "left", fill: "solid" }, { type: "triangle", rot: 0, pos: "right", fill: "outline" }] },
      { shapes: [{ type: "arrow", rot: 90, pos: "right", fill: "solid" }, { type: "triangle", rot: 90, pos: "left", fill: "outline" }] },
      { shapes: [{ type: "arrow", rot: 180, pos: "left", fill: "solid" }, { type: "triangle", rot: 180, pos: "right", fill: "outline" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "arrow", rot: 270, pos: "right", fill: "solid" }, { type: "triangle", rot: 270, pos: "left", fill: "outline" }], correct: true, rationale: "Rotates both shapes clockwise and exchanges their positions." },
      { id: "opt_b", shapes: [{ type: "arrow", rot: 270, pos: "left", fill: "solid" }, { type: "triangle", rot: 270, pos: "right", fill: "outline" }], correct: false, rationale: "Rotates the shapes but does not exchange positions." },
      { id: "opt_c", shapes: [{ type: "arrow", rot: 90, pos: "right", fill: "solid" }, { type: "triangle", rot: 90, pos: "left", fill: "outline" }], correct: false, rationale: "Uses the earlier rotation rather than the next quarter-turn." },
      { id: "opt_d", shapes: [{ type: "arrow", rot: 270, pos: "left", fill: "outline" }, { type: "triangle", rot: 270, pos: "right", fill: "solid" }], correct: false, rationale: "Changes fill states and does not exchange positions as required." }
    ]
  },
  {
    id: "Q62",
    tier: 4,
    construct: "analogical_mapping",
    format: "2x2",
    ruleDescription: "Add one dot to the count and move the group one position to the right.",
    stimulus: [
      { shapes: [{ type: "dot", count: 1, pos: "left", fill: "solid" }] },
      { shapes: [{ type: "dot", count: 2, pos: "right", fill: "solid" }] },
      { shapes: [{ type: "dot", count: 2, pos: "left", fill: "solid" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "dot", count: 3, pos: "right", fill: "solid" }], correct: true, rationale: "Adds one dot and moves the group from left to right." },
      { id: "opt_b", shapes: [{ type: "dot", count: 3, pos: "left", fill: "solid" }], correct: false, rationale: "Adds a dot but does not move the group." },
      { id: "opt_c", shapes: [{ type: "dot", count: 2, pos: "right", fill: "solid" }], correct: false, rationale: "Moves the group but does not add a dot." },
      { id: "opt_d", shapes: [{ type: "dot", count: 4, pos: "right", fill: "solid" }], correct: false, rationale: "Adds two dots rather than one." }
    ]
  },
  {
    id: "Q63",
    tier: 4,
    construct: "analogical_mapping",
    format: "2x2",
    ruleDescription: "Exchange the shapes' fills and increase each polygon by one side.",
    stimulus: [
      { shapes: [{ type: "triangle", fill: "outline" }, { type: "pentagon", fill: "solid", pos: "right" }] },
      { shapes: [{ type: "square", fill: "solid" }, { type: "hexagon", fill: "outline", pos: "right" }] },
      { shapes: [{ type: "square", fill: "outline" }, { type: "hexagon", fill: "solid", pos: "right" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "pentagon", fill: "solid" }, { type: "heptagon", fill: "outline", pos: "right" }], correct: true, rationale: "Increases each polygon's side count and exchanges the two fills." },
      { id: "opt_b", shapes: [{ type: "pentagon", fill: "outline" }, { type: "heptagon", fill: "solid", pos: "right" }], correct: false, rationale: "Increases side counts but leaves fills unchanged." },
      { id: "opt_c", shapes: [{ type: "hexagon", fill: "solid" }, { type: "heptagon", fill: "outline", pos: "right" }], correct: false, rationale: "Increases the first polygon by two sides, not one." },
      { id: "opt_d", shapes: [{ type: "pentagon", fill: "solid" }, { type: "hexagon", fill: "outline", pos: "right" }], correct: false, rationale: "Transforms the first polygon but leaves the second side count unchanged." }
    ]
  },
  {
    id: "Q64",
    tier: 3,
    construct: "spatial_transformation",
    format: "2x2",
    ruleDescription: "Reflect each shape across a vertical line so right-facing shapes become left-facing.",
    stimulus: [
      { shapes: [{ type: "arrow", rot: 90, fill: "solid" }] },
      { shapes: [{ type: "arrow", rot: 270, fill: "solid" }] },
      { shapes: [{ type: "triangle", rot: 90, fill: "outline" }] },
      null
    ],
    options: [
      { id: "opt_a", shapes: [{ type: "triangle", rot: 270, fill: "outline" }], correct: true, rationale: "Mirrors the right-facing triangle so it faces left." },
      { id: "opt_b", shapes: [{ type: "triangle", rot: 90, fill: "outline" }], correct: false, rationale: "Leaves the triangle facing right." },
      { id: "opt_c", shapes: [{ type: "triangle", rot: 180, fill: "outline" }], correct: false, rationale: "Turns the triangle downward rather than reflecting it." },
      { id: "opt_d", shapes: [{ type: "arrow", rot: 270, fill: "solid" }], correct: false, rationale: "Copies the reflected example shape." }
    ]
  }
];