const level1 = {
  /* ---------------------------------------------------------
     BASIC LEVEL INFORMATION
  --------------------------------------------------------- */

  id: 1,

  gameTitle: "Sheridan Campus Quest",

  roomName: "Campus Discovery",

  mission:
    "Explore the campus scene, interpret six challenging clues, and find the correct objects before time runs out.",

  tip: "The clues describe how an object is used rather than naming it directly. Think first, then search carefully.",

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
      "../../assets/images/levels/level-1/background.png",

      import.meta.url,
    ).href,
  },

  /* ---------------------------------------------------------
     LEVEL COMPLETION
  --------------------------------------------------------- */

  completion: {
    title: "Campus Discovery Complete! 🎉",

    prompt: "QUEST COMPLETE",

    message:
      "You completed Campus Discovery. Your score is ready, and your next campus challenge can now begin.",
  },

  /* ---------------------------------------------------------
     RANDOM CHALLENGE POOL
  --------------------------------------------------------- */

  steps: [
    /* =====================================================
       LAPTOP
    ===================================================== */

    {
      id: "laptop",

      prompt: "FIND THE OBJECT",

      hint: "Coursework does not always end when class does. Find the portable device often opened when assignments still need work.",

      helpHint:
        "Focus on the round study table in the left foreground. Look for the open computer.",

      foundLabel: "Laptop",

      title: "Laptop found!",

      story:
        "Correct. Familiar objects can still be difficult to notice when the campus around them is busy.",

      clueType: "text",
    },

    /* =====================================================
       NOTEBOOK
    ===================================================== */

    {
      id: "notebook",

      prompt: "FIND THE OBJECT",

      hint: "When every battery is empty, this can still capture an idea without needing electricity.",

      helpHint:
        "Inspect the left side of the round study table for a spiral-bound writing pad.",

      foundLabel: "Notebook",

      title: "Notebook found!",

      story:
        "Correct. Some reliable study tools do not need a screen, battery, or internet connection.",

      clueType: "text",
    },

    /* =====================================================
       STUDENT ID CARD
    ===================================================== */

    {
      id: "student-id-card",

      prompt: "FIND THE OBJECT",

      hint: "This small item can confirm that its owner belongs on campus without needing them to explain who they are.",

      helpHint:
        "Look near the front edge of the round study table for a small identification card lying flat.",

      foundLabel: "Student ID Card",

      title: "Student ID card found!",

      story:
        "Correct. Small everyday objects are easy to overlook when surrounded by larger distractions.",

      clueType: "text",
    },

    /* =====================================================
       EARBUDS CASE
    ===================================================== */

    {
      id: "earbuds-case",

      prompt: "FIND THE OBJECT",

      hint: "A noisy campus can feel much quieter after opening this small container.",

      helpHint:
        "Search the round study table for a small white case near the identification card.",

      foundLabel: "Earbuds Case",

      title: "Earbuds case found!",

      story:
        "Correct. Sometimes the smallest item in the scene can completely change someone's study environment.",

      clueType: "text",
    },

    /* =====================================================
       POWER ADAPTER
    ===================================================== */

    {
      id: "power-adapter",

      prompt: "FIND THE OBJECT",

      hint: "This small block helps move electricity from an outlet toward a device, but it does not store the power itself.",

      helpHint:
        "Look beside the coiled charging cable on the round study table for a small white power block.",

      foundLabel: "Power Adapter",

      title: "Power adapter found!",

      story:
        "Correct. Devices may get the attention, but the accessories supporting them are just as important.",

      clueType: "text",
    },

    /* =====================================================
       SMARTPHONE
    ===================================================== */

    {
      id: "smartphone",

      prompt: "FIND THE OBJECT",

      hint: "Messages, schedules, directions, and reminders can all travel inside something small enough to fit in a pocket.",

      helpHint:
        "Inspect the right side of the round study table for a dark rectangular device lying flat.",

      foundLabel: "Smartphone",

      title: "Smartphone found!",

      story:
        "Correct. A large part of modern campus life can fit inside something remarkably small.",

      clueType: "text",
    },

    /* =====================================================
       READING BOOK
    ===================================================== */

    {
      id: "reading-book",

      prompt: "FIND THE OBJECT",

      hint: "Not every student studies by scrolling. Find the printed material currently being read by hand.",

      helpHint:
        "Look at the seated student in the centre-right portion of the scene. The target is open in his hands.",

      foundLabel: "Reading Book",

      title: "Reading material found!",

      story:
        "Correct. Printed material still has a place even in a campus filled with digital devices.",

      clueType: "text",
    },

    /* =====================================================
       WATER BOTTLE
    ===================================================== */

    {
      id: "water-bottle",

      prompt: "FIND THE OBJECT",

      hint: "A full schedule becomes harder when this everyday item has been forgotten and there is nothing to drink.",

      helpHint:
        "Search beside the seated reader in the centre-right area for a tall dark bottle standing upright.",

      foundLabel: "Water Bottle",

      title: "Water bottle found!",

      story:
        "Correct. Being prepared for a long day involves more than bringing books and technology.",

      clueType: "text",
    },

    /* =====================================================
       BIKE HELMET
    ===================================================== */

    {
      id: "bike-helmet",

      prompt: "FIND THE OBJECT",

      hint: "Someone who arrived on two wheels may have worn this before locking up and continuing on foot.",

      helpHint:
        "Inspect the bicycle racks on the right side of the campus scene.",

      foundLabel: "Bike Helmet",

      title: "Bike helmet found!",

      story:
        "Correct. A commuter campus leaves clues about the many different ways students arrive each day.",

      clueType: "text",
    },

    /* =====================================================
       CAMPUS MAP
    ===================================================== */

    {
      id: "campus-map",

      prompt: "FIND THE OBJECT",

      hint: "A first-time visitor could fold this portable guide and carry it while trying to reach the right building.",

      helpHint:
        "Look along the concrete ledge in the lower-right foreground for an unfolded paper guide.",

      foundLabel: "Campus Map",

      title: "Campus map found!",

      story:
        "Correct. Knowing where you are going can be just as important as knowing what you are looking for.",

      clueType: "text",
    },

    /* =====================================================
       TRANSIT CARD
    ===================================================== */

    {
      id: "transit-card",

      prompt: "FIND THE OBJECT",

      hint: "For a commuter, this small card may be used before the first lecture of the day has even started.",

      helpHint:
        "Search the lower-right concrete ledge near the folded campus guide.",

      foundLabel: "Transit Card",

      title: "Transit card found!",

      story:
        "Correct. For many students, the journey to campus begins long before they enter a classroom.",

      clueType: "text",
    },

    /* =====================================================
       SAFETY GOGGLES
    ===================================================== */

    {
      id: "safety-goggles",

      prompt: "FIND THE OBJECT",

      hint: "Some hands-on learning environments require this protection before the real work can safely begin.",

      helpHint:
        "Inspect the far-right end of the foreground concrete ledge for transparent protective eyewear.",

      foundLabel: "Safety Goggles",

      title: "Safety goggles found!",

      story:
        "Correct. Practical learning begins with using the right protection for the task ahead.",

      clueType: "text",
    },
  ],

  /* ---------------------------------------------------------
     CLICKABLE HOTSPOTS
  --------------------------------------------------------- */

  hotspots: [
    /* =====================================================
       LAPTOP
    ===================================================== */

    {
      type: "polygon",

      object: "laptop",

      points: "414,529 516,511 513,525 479,637 470,647 389,671 384,665 403,563",
    },

    {
      type: "polygon",

      object: "laptop",

      points: "369,641 388,637 394,666 472,647 479,663 391,681 369,678",
    },

    /* =====================================================
       NOTEBOOK
    ===================================================== */

    {
      type: "polygon",

      object: "notebook",

      points: "124,698 169,688 252,678 350,696 347,710 212,739 150,730 124,718",
    },

    /* =====================================================
       STUDENT ID CARD
    ===================================================== */

    {
      type: "polygon",

      object: "student-id-card",

      points: "405,746 440,732 495,736 481,754 436,758 405,751",
    },

    /* =====================================================
       EARBUDS CASE
    ===================================================== */

    {
      type: "polygon",

      object: "earbuds-case",

      points:
        "373,716 382,710 396,707 419,707 430,712 434,719 431,726 423,730 397,731 382,728 373,723",
    },

    /* =====================================================
       POWER ADAPTER
    ===================================================== */

    {
      type: "polygon",

      object: "power-adapter",

      points:
        "452,675 478,670 494,672 501,680 500,694 489,701 458,700 448,694 447,682",
    },

    /* =====================================================
       SMARTPHONE
    ===================================================== */

    {
      type: "polygon",

      object: "smartphone",

      points:
        "541,668 625,670 634,675 631,682 618,689 541,688 528,683 527,678 533,672",
    },

    /* =====================================================
       READING BOOK
    ===================================================== */

    {
      type: "polygon",

      object: "reading-book",

      points: "878,433 886,428 909,432 916,440 910,448 891,446 883,452 878,448",
    },

    {
      type: "polygon",

      object: "reading-book",

      points: "909,432 923,433 954,448 952,455 930,454 914,448 916,440",
    },

    /* =====================================================
       WATER BOTTLE
    ===================================================== */

    {
      type: "polygon",

      object: "water-bottle",

      points: "1028,445 1044,445 1048,450 1046,454 1027,454 1025,450",
    },

    {
      type: "polygon",

      object: "water-bottle",

      points:
        "1028,454 1045,454 1050,462 1051,501 1047,508 1029,508 1025,503 1025,463",
    },

    /* =====================================================
       BIKE HELMET
    ===================================================== */

    {
      type: "polygon",

      object: "bike-helmet",

      points:
        "1410,500 1422,493 1438,490 1455,491 1474,498 1488,507 1499,516 1498,531 1486,543 1464,550 1438,550 1419,542 1407,531 1403,516",
    },

    /* =====================================================
       CAMPUS MAP
    ===================================================== */

    {
      type: "polygon",

      object: "campus-map",

      points: "1185,713 1205,710 1237,712 1238,732 1228,739 1208,735 1193,726",
    },

    {
      type: "polygon",

      object: "campus-map",

      points:
        "1235,708 1343,702 1367,706 1408,726 1422,756 1408,763 1275,766 1240,746 1234,728",
    },

    /* =====================================================
       TRANSIT CARD
    ===================================================== */

    {
      type: "polygon",

      object: "transit-card",

      points: "1351,788 1362,779 1418,784 1427,790 1421,799 1368,798 1353,793",
    },

    /* =====================================================
       SAFETY GOGGLES
    ===================================================== */

    {
      type: "polygon",

      object: "safety-goggles",

      points:
        "1438,740 1498,735 1530,738 1558,748 1575,762 1574,772 1564,774 1552,764 1531,757 1494,751 1460,749 1443,754 1438,750",
    },

    {
      type: "polygon",

      object: "safety-goggles",

      points:
        "1443,750 1477,753 1517,763 1514,779 1499,789 1477,798 1452,798 1442,784 1440,763",
    },

    {
      type: "polygon",

      object: "safety-goggles",

      points:
        "1517,763 1548,770 1578,780 1580,797 1568,807 1548,812 1523,807 1515,792",
    },
  ],
};

export default level1;
