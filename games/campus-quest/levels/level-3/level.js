const level3 = {
  /* ---------------------------------------------------------
     BASIC LEVEL INFORMATION
  --------------------------------------------------------- */

  id: 3,

  gameTitle: "Sheridan Campus Quest",

  roomName: "The Campus Green",
  mission:
    "Explore the outdoor scene and complete six randomly selected search challenges before time runs out.",

  tip: "Look carefully around the whole scene. Each replay can choose a different mix of six objects.",

  /* ---------------------------------------------------------
     LEVEL FEATURES
  --------------------------------------------------------- */

  settings: {
    timer: true,
    questions: false,
    audio: false,
    scoring: true,

    randomizeObjects: true,
    randomClueCount: 6,
  },

  /* ---------------------------------------------------------
     SCORING
  --------------------------------------------------------- */

  scoring: {
    maxScore: 100,
    wrongClickPenalty: 5,
    maxTimePenalty: 20,
    chancesPerClue: 3,
  },

  /* ---------------------------------------------------------
     TIMER
  --------------------------------------------------------- */

  timer: {
    durationSeconds: 300,
    perfectTimeSeconds: 180,
  },

  /* ---------------------------------------------------------
     ROOM / BACKGROUND
  --------------------------------------------------------- */

  room: {
    width: 1672,

    height: 941,

    backgroundUrl: new URL(
      "../../assets/images/levels/level-3/background.png",
      import.meta.url,
    ).href,
  },

  /* ---------------------------------------------------------
     LEVEL COMPLETION
  --------------------------------------------------------- */

  completion: {
    title: "Garden Adventure Complete! 🎉",

    prompt: "QUEST COMPLETE",

    message:
      "You completed all six randomized challenges in The Campus Green. Replay to get a different mix of objects.",
  },

  /* ---------------------------------------------------------
     RANDOM CLUE POOL
  --------------------------------------------------------- */

  steps: [
    /* =====================================================
       KITE
    ===================================================== */

    {
      id: "kite",

      prompt: "FIND THE OBJECT",

      hint: "Look up near the trees for something flying in the air.",

      foundLabel: "Kite",

      title: "You found the kite!",

      story:
        "The colorful kite dances above the garden. Great searching — another clue is waiting somewhere in the festival!",

      clueType: "text",
    },

    /* =====================================================
       BICYCLE
    ===================================================== */

    {
      id: "bicycle",

      prompt: "FIND THE OBJECT",

      hint: "Find something with two wheels that a child can ride.",

      foundLabel: "Bicycle",

      title: "You found the bicycle!",

      story:
        "You spotted the bicycle beside the garden path. Keep exploring carefully!",

      clueType: "text",
    },

    /* =====================================================
       BALL
    ===================================================== */

    {
      id: "ball",

      prompt: "FIND THE OBJECT",

      hint: "Find something round that children can roll, throw, or kick.",

      foundLabel: "Ball",

      title: "You found the ball!",

      story:
        "The little ball was hiding among the garden activities. Nice work!",

      clueType: "text",
    },

    /* =====================================================
       UMBRELLA
    ===================================================== */

    {
      id: "umbrella",

      prompt: "FIND THE OBJECT",

      hint: "Find something that can protect you from rain or bright sunshine.",

      foundLabel: "Umbrella",

      title: "You found the umbrella!",

      story:
        "You found the garden umbrella. Your observation skills are getting stronger!",

      clueType: "text",
    },

    /* =====================================================
       WATERING CAN
    ===================================================== */

    {
      id: "watering-can",

      prompt: "FIND THE OBJECT",

      hint: "Gardeners use this container to give water to plants.",

      foundLabel: "Watering Can",

      title: "You found the watering can!",

      story: "The watering can is ready for the flowers. Excellent searching!",

      clueType: "text",
    },

    /* =====================================================
       FLOWER POT
    ===================================================== */

    {
      id: "flower-pot",

      prompt: "FIND THE OBJECT",

      hint: "Find a container where flowers or plants can grow.",

      foundLabel: "Flower Pot",

      title: "You found the flower pot!",

      story:
        "You discovered the flower pot among the colorful garden decorations. Keep going!",

      clueType: "text",
    },

    /* =====================================================
       DRUM
    ===================================================== */

    {
      id: "drum",

      prompt: "FIND THE OBJECT",

      hint: "Find the musical instrument that you play by tapping or beating it.",

      foundLabel: "Drum",

      title: "You found the drum!",

      story:
        "You found one of the festival instruments. The garden celebration is full of surprises!",

      clueType: "text",
    },

    /* =====================================================
       PICNIC BASKET
    ===================================================== */

    {
      id: "picnic-basket",

      prompt: "FIND THE OBJECT",

      hint: "Look near the picnic area for something used to carry food.",

      foundLabel: "Picnic Basket",

      title: "You found the picnic basket!",

      story:
        "The picnic basket was tucked into the busy garden scene. Great job noticing it!",

      clueType: "text",
    },

    /* =====================================================
       LANTERN
    ===================================================== */

    {
      id: "lantern",

      prompt: "FIND THE OBJECT",

      hint: "Look around the pavilion for a hanging light.",

      foundLabel: "Lantern",

      title: "You found the lantern!",

      story:
        "The hanging lantern adds a warm glow to the festival. You found it!",

      clueType: "text",
    },

    /* =====================================================
       WHEELBARROW
    ===================================================== */

    {
      id: "wheelbarrow",

      prompt: "FIND THE OBJECT",

      hint: "Find the garden tool with one wheel that can be pushed to carry things.",

      foundLabel: "Wheelbarrow",

      title: "You found the wheelbarrow!",

      story:
        "You found the wheelbarrow used to move things around the garden. Well done!",

      clueType: "text",
    },

    /* =====================================================
       TOY BOAT
    ===================================================== */

    {
      id: "toy-boat",

      prompt: "FIND THE OBJECT",

      hint: "Look carefully at the pond for something floating on the water.",

      foundLabel: "Toy Boat",

      title: "You found the toy boat!",

      story:
        "The little boat floats peacefully on the pond. Excellent observation!",

      clueType: "text",
    },

    /* =====================================================
       BINOCULARS
    ===================================================== */

    {
      id: "binoculars",

      prompt: "FIND THE OBJECT",

      hint: "Find something you can look through to see things that are far away.",

      foundLabel: "Binoculars",

      title: "You found the binoculars!",

      story:
        "You discovered the binoculars among the festival items. Great eyes!",

      clueType: "text",
    },
  ],

  /* ---------------------------------------------------------
     CLICKABLE HOTSPOTS
  --------------------------------------------------------- */

  hotspots: [
    /* =========================================================
       KITE
    ========================================================= */

    {
      type: "polygon",

      object: "kite",

      points: "219,69 302,45 319,112 228,160",
    },

    /* =========================================================
       BICYCLE

       Two wheels + central frame/body.
    ========================================================= */

    {
      type: "circle",

      object: "bicycle",

      cx: 299,

      cy: 455,

      r: 51,
    },

    {
      type: "circle",

      object: "bicycle",

      cx: 460,

      cy: 449,

      r: 46,
    },

    {
      type: "polygon",

      object: "bicycle",

      points:
        "315,390 341,385 361,415 411,377 426,386 394,447 360,465 312,460 300,440 326,414",
    },

    /* =========================================================
       UMBRELLA

       Canopy + shaft / curved handle.
    ========================================================= */

    {
      type: "polygon",

      object: "umbrella",

      points:
        "17,670 21,641 34,608 52,575 77,547 107,524 143,505 181,492 234,486 289,494 294,507 282,539 261,568 230,608 193,637 153,653 111,660 63,661",
    },

    {
      type: "polygon",

      object: "umbrella",

      points:
        "137,553 147,556 218,681 228,680 235,687 235,696 229,704 219,705 211,699 212,690 218,687",
    },

    /* =========================================================
       PICNIC BASKET

       Lid + main basket body.
    ========================================================= */

    {
      type: "polygon",

      object: "picnic-basket",

      points: "240,610 401,608 410,626 399,642 257,647 236,632",
    },

    {
      type: "polygon",

      object: "picnic-basket",

      points: "244,636 405,634 405,698 382,712 307,718 255,704 241,687",
    },

    /* =========================================================
       BALL
    ========================================================= */

    {
      type: "circle",

      object: "ball",

      cx: 568,

      cy: 596,

      r: 39,
    },

    /* =========================================================
       DRUM
    ========================================================= */

    {
      type: "polygon",

      object: "drum",

      points:
        "684,423 739,423 749,438 744,496 736,504 738,530 730,536 688,536 680,528 681,503 675,494 676,438",
    },

    /* =========================================================
       LANTERN
    ========================================================= */

    {
      type: "polygon",

      object: "lantern",

      points:
        "955,176 969,176 975,193 988,201 982,251 975,260 967,261 966,270 959,270 958,262 944,260 937,252 936,204 947,195",
    },

    /* =========================================================
       FLOWER POT

       Flowers + physical pot kept as separate shapes.
    ========================================================= */

    {
      type: "polygon",

      object: "flower-pot",

      points:
        "1017,448 1024,430 1038,421 1052,414 1062,419 1071,416 1081,425 1090,433 1088,456 1078,468 1058,470 1045,468 1031,472 1019,461",
    },

    {
      type: "polygon",

      object: "flower-pot",

      points: "1033,466 1084,466 1078,504 1069,510 1043,509 1036,502",
    },

    /* =========================================================
       WATERING CAN

       Main body + spout + rose + upper handle.
    ========================================================= */

    {
      type: "polygon",

      object: "watering-can",

      points: "1218,521 1284,521 1287,574 1278,590 1227,590 1214,577 1214,539",
    },

    {
      type: "polygon",

      object: "watering-can",

      points:
        "1281,546 1300,531 1316,513 1328,493 1342,499 1331,520 1311,539 1290,562",
    },

    {
      type: "circle",

      object: "watering-can",

      cx: 1335,

      cy: 501,

      r: 15,
    },

    {
      type: "polygon",

      object: "watering-can",

      points:
        "1234,522 1236,491 1243,474 1252,468 1263,472 1271,489 1272,522 1263,522 1262,493 1257,480 1250,480 1245,493 1244,522",
    },

    /* =========================================================
       WHEELBARROW

       Tray + wheel + visible wooden handles/frame.
    ========================================================= */

    {
      type: "polygon",

      object: "wheelbarrow",

      points:
        "1382,434 1434,421 1505,413 1577,431 1568,468 1548,488 1502,504 1442,501 1399,481",
    },

    {
      type: "circle",

      object: "wheelbarrow",

      cx: 1433,

      cy: 526,

      r: 43,
    },

    {
      type: "polygon",

      object: "wheelbarrow",

      points: "1492,500 1571,468 1644,413 1655,411 1659,420 1581,483 1510,516",
    },

    {
      type: "polygon",

      object: "wheelbarrow",

      points: "1535,489 1606,430 1638,406 1654,405 1657,413 1615,444 1550,505",
    },

    /* =========================================================
       BINOCULARS
    ========================================================= */

    {
      type: "polygon",

      object: "binoculars",

      points:
        "916,721 929,708 949,701 972,697 994,701 1008,711 1014,730 1009,748 995,759 975,764 949,759 927,755 916,744",
    },

    /* =========================================================
       TOY BOAT / SAILBOAT

       Hull + left sail + right sail + flag.
    ========================================================= */

    {
      type: "polygon",

      object: "toy-boat",

      points: "1458,720 1560,719 1558,732 1545,744 1527,749 1483,749 1467,741",
    },

    {
      type: "polygon",

      object: "toy-boat",

      points: "1489,716 1515,675 1515,718",
    },

    {
      type: "polygon",

      object: "toy-boat",

      points: "1519,680 1541,716 1519,716",
    },

    {
      type: "polygon",

      object: "toy-boat",

      points: "1517,662 1534,667 1517,672",
    },
  ],
};

export default level3;
