/**
 * Sheridan Hardware Challenge — Level 5: Inside a Server.
 * Source photo: assets/hc5.png, 1448 x 1086.
 *
 * Coordinates are mapped to this exact image.
 * This AI-generated image is an educational illustration,
 * not a verified server schematic.
 *
 * Level 5 remains digital-only for the current event.
 * RAM and heat-pipe hotspots are preserved unchanged.
 */

const rect = (left, top, right, bottom) => [
  [left, top],
  [right, top],
  [right, bottom],
  [left, bottom],
];

const rows = (left, right, ranges) =>
  ranges.map(([top, bottom]) => rect(left, top, right, bottom));

const p = (id, label, questions, fact, regions) => ({
  id,
  label,
  question: questions[0],
  questionVariants: questions,
  fact,
  regions,
});

export const SERVER_LEVEL = {
  id: 5,
  title: "Inside a Server",
  subtitle: "Rack server · internal components",
  description:
    "Explore processors, memory, cooling, drive bays and serviceable modules.",
  image: "assets/hc5.png",
  width: 1448,
  height: 1086,
  displayRotation: 0,
  availability: "digital",
  enabled: true,
  questionsPerRound: 6,

  targets: [
    // 1. Upper processor — restored
    p(
      "cpu-upper",
      "Upper processor",
      [
        "Find the upper processor in the server.",
        "Tap the square processor area above the centre.",
      ],
      "Servers often use processors to handle many concurrent workloads.",
      [rect(729, 340, 843, 422)],
    ),

    // 2. Lower processor — restored
    p(
      "cpu-lower",
      "Lower processor",
      [
        "Find the lower processor.",
        "Tap the second square processor area near the bottom.",
      ],
      "This image depicts two separate processor positions in the server.",
      [rect(729, 656, 843, 746)],
    ),

    // 3. Upper RAM — unchanged
    p(
      "ram-upper",
      "Upper memory bank",
      [
        "Tap the row of memory modules above the first processor.",
        "Find the top group of long RAM modules.",
      ],
      "Server memory holds data actively being used by programs.",
      rows(665, 898, [
        [219, 237],
        [244, 261],
        [267, 284],
        [290, 306],
      ]),
    ),

    // 4. Middle RAM — unchanged
    p(
      "ram-middle",
      "Centre memory banks",
      [
        "Find the memory modules between the two processors.",
        "Tap the long RAM sticks in the middle of the server.",
      ],
      "Servers may contain many memory modules for demanding workloads.",
      rows(665, 898, [
        [452, 469],
        [476, 494],
        [499, 517],
        [525, 542],
        [559, 577],
        [583, 601],
        [608, 627],
      ]),
    ),

    // 5. Lower RAM — unchanged
    p(
      "ram-lower",
      "Lower memory bank",
      [
        "Find the row of memory modules below the second processor.",
        "Tap the bottom RAM bank.",
      ],
      "More memory can help a server run more applications and tasks.",
      rows(665, 898, [
        [775, 783],
        [790, 807],
        [812, 830],
        [835, 854],
      ]),
    ),

    // 6. Fan bank — separate visible fan housings
    p(
      "fan-bank",
      "Cooling fan bank",
      [
        "Find the vertical stack of black cooling fans.",
        "Tap the column of fans beside the memory.",
      ],
      "Fans move air through the server to cool its components.",
      [
        rect(468, 210, 593, 315),
        rect(468, 318, 593, 424),
        rect(468, 426, 593, 530),
        rect(468, 532, 593, 634),
        rect(468, 637, 593, 741),
        rect(468, 744, 593, 845),
        rect(468, 846, 593, 869),
      ],
    ),

    // 7. Upper silver finned heatsink
    p(
      "heatsink-upper",
      "Upper finned heatsink",
      [
        "Tap the tall silver finned heatsink near the upper CPU.",
        "Find the upper vertical metal cooling fins.",
      ],
      "Heatsinks help move heat away from busy processors and chips.",
      [rect(608, 228, 642, 517)],
    ),

    // 8. Lower silver finned heatsink
    p(
      "heatsink-lower",
      "Lower finned heatsink",
      [
        "Find the second vertical finned heatsink.",
        "Tap the lower silver heatsink beside the fans.",
      ],
      "Cooling hardware dissipates heat to maintain safe operating temperatures.",
      [rect(608, 573, 642, 854)],
    ),

    // 9. Upper copper heat pipes — unchanged
    p(
      "heat-pipes-upper",
      "Upper copper heat pipes",
      [
        "Find the copper-coloured heat pipes beside the upper processor.",
        "Tap the orange copper pipes near the upper CPU.",
      ],
      "Heat pipes transfer heat between hot components and cooling surfaces.",
      [
        [
          [636, 356],
          [669, 356],
          [683, 359],
          [692, 364],
          [695, 371],
          [688, 374],
          [677, 369],
          [635, 368],
        ],
        [
          [636, 370],
          [666, 370],
          [683, 375],
          [693, 381],
          [695, 386],
          [685, 388],
          [674, 382],
          [636, 382],
        ],
        [
          [635, 384],
          [668, 384],
          [684, 389],
          [693, 396],
          [694, 402],
          [682, 402],
          [672, 396],
          [636, 397],
        ],
        [
          [636, 398],
          [667, 398],
          [680, 404],
          [693, 408],
          [690, 414],
          [675, 412],
          [662, 409],
          [635, 410],
        ],
      ],
    ),

    // 10. Lower copper heat pipes — unchanged
    p(
      "heat-pipes-lower",
      "Lower copper heat pipes",
      [
        "Find the lower set of copper heat pipes.",
        "Tap the copper pipes beside the lower processor.",
      ],
      "Copper pipes are often used to carry heat toward heatsinks.",
      [
        [
          [636, 671],
          [666, 671],
          [677, 673],
          [691, 670],
          [696, 676],
          [689, 682],
          [673, 681],
          [635, 684],
        ],
        [
          [637, 685],
          [667, 685],
          [680, 685],
          [692, 683],
          [695, 690],
          [684, 697],
          [670, 696],
          [636, 697],
        ],
        [
          [637, 699],
          [668, 699],
          [681, 699],
          [692, 697],
          [694, 704],
          [684, 711],
          [670, 709],
          [635, 710],
        ],
        [
          [637, 713],
          [667, 713],
          [681, 711],
          [691, 710],
          [693, 718],
          [679, 725],
          [665, 724],
          [635, 726],
        ],
      ],
    ),

    // 11. Upper silver bay and attached side support
    p(
      "drive-bays",
      "Upper drive bay covers",
      [
        "Find the large silver bay assembly at the upper right.",
        "Tap the large silver cover or its attached side support.",
      ],
      "Servers often organize replaceable storage devices in dedicated bays.",
      [
        [
          [1014, 195],
          [1218, 195],
          [1218, 389],
          [1219, 392],
          [1218, 461],
          [1014, 461],
        ],
        [
          [1218, 393],
          [1270, 393],
          [1277, 400],
          [1307, 395],
          [1315, 404],
          [1315, 462],
          [1281, 468],
          [1218, 467],
        ],
      ],
    ),

    // 12. Upper module: blue tab, silver face, end section
    p(
      "drive-module-upper",
      "Upper removable module",
      [
        "Find the upper silver module with a blue release tab.",
        "Tap the upper removable-looking module and its end handle.",
      ],
      "Tool-less latches can make server modules easier to service.",
      [
        [
          [1008, 474],
          [1024, 471],
          [1044, 475],
          [1057, 486],
          [1057, 527],
          [1045, 531],
          [1016, 526],
          [1008, 517],
        ],
        rect(1061, 481, 1216, 540),
        [
          [1218, 474],
          [1253, 474],
          [1254, 531],
          [1218, 537],
        ],
      ],
    ),

    // 13. Lower module: blue tab, silver face, end section
    p(
      "drive-module-lower",
      "Lower removable module",
      [
        "Find the lower silver module with a blue release tab.",
        "Tap the lower module and its end handle.",
      ],
      "Servers use modular parts to simplify maintenance.",
      [
        [
          [1009, 678],
          [1025, 676],
          [1045, 683],
          [1058, 696],
          [1058, 735],
          [1048, 743],
          [1016, 737],
          [1009, 728],
        ],
        rect(1062, 688, 1216, 744),
        rect(1218, 692, 1274, 746),
      ],
    ),

    // 14. Red circuit boards — unchanged
    p(
      "rear-red-boards",
      "Red circuit boards",
      [
        "Find the tall red circuit-board area near the left side.",
        "Tap the red electronics behind the cooling fans.",
      ],
      "A server contains several circuit boards linking hardware subsystems.",
      [rect(375, 290, 452, 798)],
    ),

    // 15. Lower-right vented metal enclosure
    p(
      "power-module",
      "Lower-right vented module",
      [
        "Find the vented silver enclosure at the lower right.",
        "Tap the metal box with ventilation holes near the bottom.",
      ],
      "Vented enclosures allow air to flow around internal electronics.",
      [
        [
          [1100, 760],
          [1216, 760],
          [1230, 754],
          [1257, 764],
          [1257, 845],
          [1235, 868],
          [1099, 868],
          [1096, 843],
          [1096, 759],
        ],
      ],
    ),
  ],
};
