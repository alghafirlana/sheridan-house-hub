/** Campus Quest Level 3: photo-style scene. All polygons are in the native 1672x941 coordinate space. */
const level3 = {
  id: 3,
  gameTitle: "Sheridan Campus Quest",
  roomName: "Library Mystery",
  mission:
    "Search a vibrant library study area, decode six practical clues and find the right objects before time runs out.",
  tip: "Look across the foreground table, group-study space and reading area. Only six objects are chosen from twelve each round.",
  settings: {
    timer: true,
    questions: false,
    audio: false,
    scoring: true,
    randomizeObjects: true,
    randomClueCount: 6,
  },
  scoring: {
    maxScore: 100,
    wrongClickPenalty: 5,
    maxTimePenalty: 20,
    chancesPerClue: 3,
  },
  timer: { durationSeconds: 300, perfectTimeSeconds: 180 },
  room: {
    width: 1672,
    height: 941,
    backgroundUrl: new URL(
      "../../assets/images/levels/level-3/background.png",
      import.meta.url,
    ).href,
  },
  completion: {
    title: "Library Mystery Solved! 🎉",
    prompt: "QUEST COMPLETE",
    message:
      "You solved the Library Mystery. Replay to discover a fresh set of study-space clues.",
  },
  steps: [
    {
      id: "laptop",
      prompt: "FIND THE OBJECT",
      hint: "Find the portable computer open in front of the student who is working alone.",
      helpHint: "Look to the far-left side of the round foreground table.",
      foundLabel: "Open Laptop",
      title: "Open Laptop found!",
      story:
        "Correct! Laptops let students work on coursework from shared study spaces.",
      clueType: "text",
    },
    {
      id: "notebook",
      prompt: "FIND THE OBJECT",
      hint: "Find the spiral-bound pages ready for handwritten notes.",
      helpHint: "Look on the front-left part of the round table.",
      foundLabel: "Spiral Notebook",
      title: "Spiral Notebook found!",
      story:
        "Correct! Paper notes are useful when you want to sketch an idea or study without a screen.",
      clueType: "text",
    },
    {
      id: "student-id",
      prompt: "FIND THE OBJECT",
      hint: "Find the small card that helps identify a student.",
      helpHint:
        "Look near the front edge of the round table, just left of the paper map.",
      foundLabel: "Student ID Card",
      title: "Student ID Card found!",
      story:
        "Correct! An identification card can help confirm membership in a campus community.",
      clueType: "text",
    },
    {
      id: "water-bottle",
      prompt: "FIND THE OBJECT",
      hint: "Find the tall blue drink container with a metal cap.",
      helpHint: "Look just behind the tablet on the foreground study table.",
      foundLabel: "Reusable Water Bottle",
      title: "Reusable Water Bottle found!",
      story:
        "Correct! Refillable bottles help students stay hydrated throughout a long study day.",
      clueType: "text",
    },
    {
      id: "tablet",
      prompt: "FIND THE OBJECT",
      hint: "Find the touch-screen device propped upright without a physical keyboard.",
      helpHint: "Look near the middle of the large foreground table.",
      foundLabel: "Tablet Computer",
      title: "Tablet Computer found!",
      story:
        "Correct! Tablets are often used for reading, annotating and reviewing course materials.",
      clueType: "text",
    },
    {
      id: "textbook",
      prompt: "FIND THE OBJECT",
      hint: "Find the thick hardcover book with a dark-blue cover lying flat.",
      helpHint:
        "Look behind the headphones toward the right-hand side of the table.",
      foundLabel: "Thick Textbook",
      title: "Thick Textbook found!",
      story:
        "Correct! Course books can provide detailed examples and reference material.",
      clueType: "text",
    },
    {
      id: "headphones",
      prompt: "FIND THE OBJECT",
      hint: "Find the over-ear audio accessory resting on the table.",
      helpHint: "Look to the right of the thick book on the foreground table.",
      foundLabel: "Headphones",
      title: "Headphones found!",
      story:
        "Correct! Headphones can be useful for listening to recorded lectures in a shared space.",
      clueType: "text",
    },
    {
      id: "backpack",
      prompt: "FIND THE OBJECT",
      hint: "Find the large black bag resting on the right chair.",
      helpHint: "Look along the far-right edge of the big foreground table.",
      foundLabel: "Black Backpack",
      title: "Black Backpack found!",
      story:
        "Correct! A backpack helps students carry equipment, books and personal supplies.",
      clueType: "text",
    },
    {
      id: "campus-map",
      prompt: "FIND THE OBJECT",
      hint: "Find the unfolded colour map that could help a new visitor find their way.",
      helpHint: "Look across the open pages at the front-right of the table.",
      foundLabel: "Folded Campus Guide",
      title: "Folded Campus Guide found!",
      story:
        "Correct! A campus map can help visitors plan routes between buildings and services.",
      clueType: "text",
    },
    {
      id: "power-adapter",
      prompt: "FIND THE OBJECT",
      hint: "Find the small white charging block at the end of a cable.",
      helpHint:
        "Look near the tablet, on the tabletop slightly left of the folded map.",
      foundLabel: "Power Adapter",
      title: "Power Adapter found!",
      story:
        "Correct! A power adapter converts electricity for a device; it is not a battery.",
      clueType: "text",
    },
    {
      id: "potted-plant",
      prompt: "FIND THE OBJECT",
      hint: "Find the tiny leafy plant sitting on the students’ shared table in the background.",
      helpHint: "Look at the centre group-study table, between the people.",
      foundLabel: "Small Potted Plant",
      title: "Small Potted Plant found!",
      story:
        "Correct! Plants can make shared study spaces feel more welcoming.",
      clueType: "text",
    },
    {
      id: "reading-book",
      prompt: "FIND THE OBJECT",
      hint: "Find the open book being read by someone on the lounge sofa.",
      helpHint: "Look at the seated student on the couch at the far right.",
      foundLabel: "Open Reading Book",
      title: "Open Reading Book found!",
      story:
        "Correct! Reading can be part of both classwork and independent learning.",
      clueType: "text",
    },
  ],
  hotspots: [
    {
      type: "polygon",
      object: "laptop",
      points:
        "614,413 612,416 620,427 621,443 619,464 540,609 521,621 509,612 514,594 556,499",
    },
    {
      type: "polygon",
      object: "laptop",
      points:
        "378,602 394,596 485,594 513,599 525,607 520,624 401,635 379,631 375,616",
    },
    {
      type: "polygon",
      object: "notebook",
      points:
        "307,700 472,644 503,645 590,661 685,704 644,721 629,732 472,773 325,739 304,720",
    },
    {
      type: "polygon",
      object: "student-id",
      points: "648,750 777,755 762,764 759,784 752,799 653,796 639,787",
    },
    {
      type: "polygon",
      object: "water-bottle",
      /*
      points:
        "640,389 668,386 680,392 686,408 687,431 687,584 681,599 629,599 623,586 623,434 625,412 630,397", */
      points:
        "650,389 678,386 690,392 696,408 697,431 697,584 691,599 639,599 633,586 633,434 635,412 640,397",
    },
    {
      type: "polygon",
      object: "tablet",
      points:
        "828,462 921,471 928,469 950,474 960,490 907,617 889,633 872,638 747,612 730,607 740,598 746,583 810,460",
    },
    {
      type: "polygon",
      object: "textbook",
      points:
        "1015,500 1153,481 1251,497 1271,505 1271,521 1266,544 1257,550 1250,576 1235,576 992,580 986,567 986,533",
    },

    {
      type: "polygon",
      object: "headphones",
      points:
        "1174,624 1175,609 1182,594 1192,588 1206,586 1221,590 1236,600 1244,619 1244,648 1235,666 1217,676 1198,672 1184,661 1177,644",
    },
    {
      type: "polygon",
      object: "headphones",
      points:
        "1224,639 1228,623 1238,608 1252,599 1270,596 1288,600 1303,610 1311,626 1315,643 1310,663 1298,681 1280,690 1257,690 1239,679 1228,663",
    },
    {
      type: "polygon",
      object: "headphones",
      points:
        "1234,594 1242,590 1257,592 1282,592 1314,595 1346,601 1365,607 1379,617 1382,630 1380,646 1373,656 1357,664 1334,671 1318,671 1312,663 1316,651 1337,654 1357,648 1367,638 1367,627 1356,617 1330,609 1294,605 1255,606 1240,606",
    },

    {
      type: "polygon",
      object: "backpack",
      points:
        "1419,465 1440,445 1475,439 1518,449 1557,474 1580,499 1593,533 1600,586 1600,658 1597,711 1588,765 1570,780 1490,781 1480,774 1481,727 1481,675 1462,643 1440,617 1417,592 1391,575 1369,555 1383,522 1401,487",
    },
    {
      type: "polygon",
      object: "campus-map",
      points:
        "905,648 969,650 1026,663 1099,678 1163,691 1301,696 1310,809 1293,815 1214,813 1154,799 1103,785 1045,795 990,791 930,773 870,763 877,716",
    },
    {
      type: "polygon",
      object: "power-adapter",
      points:
        "787,679 799,660 827,664 832,659 839,668 868,695 861,697 869,714 848,715 796,708 777,694",
    },
    {
      type: "polygon",
      object: "potted-plant",
      points:
        "843,278 850,266 858,267 863,257 871,267 886,265 891,278 904,282 900,299 892,304 890,325 845,324 839,312 840,298",
    },
    {
      type: "polygon",
      object: "reading-book",
      points:
        "1317,242 1327,236 1346,237 1363,246 1385,254 1406,271 1405,281 1389,280 1369,269 1356,268 1341,255 1321,256",
    },
  ],
};
export default level3;
