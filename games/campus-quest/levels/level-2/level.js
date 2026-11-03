const level2 = {
  /* ---------------------------------------------------------
     BASIC LEVEL INFORMATION
  --------------------------------------------------------- */

  id: 2,

  gameTitle: "Sheridan Campus Quest",

  roomName: "Innovation Lab",

  mission:
    "Explore the engineering lab, interpret six technical clues, and locate the correct equipment before time runs out.",

  tip: "The clues describe how each item is used rather than naming it directly. Some objects are small, so examine the entire lab carefully.",

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
      "../../assets/images/levels/level-2/background.png",
      import.meta.url,
    ).href,
  },

  /* ---------------------------------------------------------
     LEVEL COMPLETION
  --------------------------------------------------------- */

  completion: {
    title: "Innovation Lab Complete! 🎉",

    prompt: "QUEST COMPLETE",

    message:
      "You successfully worked your way through the Innovation Lab. Your next Sheridan Campus Quest challenge is now within reach.",
  },

  /* ---------------------------------------------------------
     RANDOM CHALLENGE POOL
  --------------------------------------------------------- */

  steps: [
    /* =====================================================
       MULTIMETER
    ===================================================== */

    {
      id: "multimeter",

      prompt: "FIND THE OBJECT",

      hint: "When an electrical circuit is behaving unexpectedly, this handheld instrument can reveal what its voltage or current is doing.",

      helpHint:
        "Inspect the electronics workstation in the left foreground. Look for a red-and-black handheld measuring instrument.",

      foundLabel: "Digital Multimeter",

      title: "Multimeter found!",

      story:
        "Correct. Diagnosing an electrical problem starts with measuring what the circuit is actually doing.",

      clueType: "text",
    },

    /* =====================================================
       SAFETY GLASSES
    ===================================================== */

    {
      id: "safety-glasses",

      prompt: "FIND THE OBJECT",

      hint: "A lab visitor may need a spare pair of these before beginning hands-on work. Find the protection that is not currently being worn.",

      helpHint:
        "Search the front-left workbench near the blue parts tray. A spare pair is resting flat on the table.",

      foundLabel: "Safety Glasses",

      title: "Safety glasses found!",

      story:
        "Correct. Good technical work begins with protecting yourself before touching the equipment.",

      clueType: "text",
    },

    /* =====================================================
       DIGITAL CALIPER
    ===================================================== */

    {
      id: "digital-caliper",

      prompt: "FIND THE OBJECT",

      hint: "A ruler may be close enough for ordinary measurements, but this tool is chosen when precision matters much more.",

      helpHint:
        "Look along the front edge of the nearest wooden workbench for a long digital measuring instrument with sliding jaws.",

      foundLabel: "Digital Caliper",

      title: "Digital caliper found!",

      story:
        "Correct. Engineering often depends on measurements far more precise than an ordinary ruler can provide.",

      clueType: "text",
    },

    /* =====================================================
       USB DRIVE
    ===================================================== */

    {
      id: "usb-drive",

      prompt: "FIND THE OBJECT",

      hint: "Something small enough to disappear into a pocket can still carry project files from one computer to another.",

      helpHint:
        "Inspect the front-right portion of the nearest wooden workbench for a small black-and-blue storage device.",

      foundLabel: "USB Drive",

      title: "USB drive found!",

      story:
        "Correct. Small devices can carry a surprising amount of work from one system to another.",

      clueType: "text",
    },

    /* =====================================================
       ROBOTIC ARM
    ===================================================== */

    {
      id: "robotic-arm",

      prompt: "FIND THE OBJECT",

      hint: "In automated manufacturing, this machine can repeat precise movements without getting tired or losing concentration.",

      helpHint:
        "Look toward the middle-left work area for the articulated mechanical arm mounted beside the whiteboard.",

      foundLabel: "Robotic Arm",

      title: "Robotic arm found!",

      story:
        "Correct. Automation combines mechanical precision with programmable control to repeat complex tasks.",

      clueType: "text",
    },

    /* =====================================================
       LAPTOP
    ===================================================== */

    {
      id: "laptop",

      prompt: "FIND THE OBJECT",

      hint: "A designer can move from an idea to a digital model using this portable workstation without being tied to one desk.",

      helpHint:
        "Inspect the central-right wooden workbench. Look for the open computer displaying a three-dimensional design.",

      foundLabel: "Laptop",

      title: "Laptop found!",

      story:
        "Correct. Digital design tools often connect an engineering idea to the physical object that comes next.",

      clueType: "text",
    },

    /* =====================================================
       PROTECTIVE GLOVES
    ===================================================== */

    {
      id: "protective-gloves",

      prompt: "FIND THE OBJECT",

      hint: "Hands may need an extra barrier when materials, tools, heat, or rough surfaces become part of the task.",

      helpHint:
        "Search the central-right workbench. Several grey-and-blue protective items are lying together beside the tablet.",

      foundLabel: "Protective Gloves",

      title: "Protective gloves found!",

      story:
        "Correct. The right protective equipment is part of the process, not an optional extra.",

      clueType: "text",
    },

    /* =====================================================
       TABLET
    ===================================================== */

    {
      id: "tablet",

      prompt: "FIND THE OBJECT",

      hint: "Technical drawings can be reviewed on this portable touchscreen without carrying a full computer around the workspace.",

      helpHint:
        "Look on the central-right workbench for the touchscreen propped upright beside the gloves.",

      foundLabel: "Tablet",

      title: "Tablet found!",

      story:
        "Correct. Portable displays make drawings, instructions, and technical information easier to move around a workspace.",

      clueType: "text",
    },

    /* =====================================================
       ETHERNET CABLE
    ===================================================== */

    {
      id: "ethernet-cable",

      prompt: "FIND THE OBJECT",

      hint: "When a wired network connection is preferred over wireless, this carries data directly between connected equipment.",

      helpHint:
        "Inspect the metal cart on the right side of the room. Look for a coiled blue cable.",

      foundLabel: "Ethernet Cable",

      title: "Ethernet cable found!",

      story:
        "Correct. Reliable communication between systems sometimes still depends on a physical connection.",

      clueType: "text",
    },

    /* =====================================================
       ADJUSTABLE WRENCH
    ===================================================== */

    {
      id: "adjustable-wrench",

      prompt: "FIND THE OBJECT",

      hint: "Different fasteners do not always require different tools when the jaws of this one can change width.",

      helpHint:
        "Look on the upper shelf of the metal cart at the right side of the lab for a silver hand tool.",

      foundLabel: "Adjustable Wrench",

      title: "Adjustable wrench found!",

      story:
        "Correct. A tool that adjusts to different sizes can save both time and space in a workshop.",

      clueType: "text",
    },

    /* =====================================================
       ID BADGE
    ===================================================== */

    {
      id: "id-badge",

      prompt: "FIND THE OBJECT",

      hint: "In a controlled technical space, this can identify who belongs there without requiring them to introduce themselves.",

      helpHint:
        "Search the far-right side of the scene near the 3D printer. The identification card is hanging vertically.",

      foundLabel: "ID Badge",

      title: "ID badge found!",

      story:
        "Correct. Controlled workspaces often depend on clear identification as much as they depend on technical equipment.",

      clueType: "text",
    },

    /* =====================================================
       3D-PRINTED PART
    ===================================================== */

    {
      id: "3d-printed-part",

      prompt: "FIND THE OBJECT",

      hint: "Instead of being carved from a solid block, this object was created gradually by building material one layer at a time.",

      helpHint:
        "Look inside the enclosed machine on the far-right side of the lab. A bright blue object is still sitting on the print bed.",

      foundLabel: "3D-Printed Part",

      title: "3D-printed part found!",

      story:
        "Correct. Additive manufacturing turns digital models into physical objects one layer at a time.",

      clueType: "text",
    },
  ],

  /* ---------------------------------------------------------
     CLICKABLE HOTSPOTS
  --------------------------------------------------------- */

  hotspots: [
    /* =====================================================
       MULTIMETER
    ===================================================== */

    {
      type: "polygon",

      object: "multimeter",

      points:
        "251,558 279,551 302,552 313,559 320,574 328,592 335,612 339,626 335,634 322,639 293,640 277,635 266,625 258,610 251,591 247,575",
    },

    /* =====================================================
       SAFETY GLASSES
    ===================================================== */

    {
      type: "polygon",

      object: "safety-glasses",

      points:
        "146,789 161,779 195,774 232,777 252,788 252,805 240,818 208,824 177,824 155,813",
    },

    {
      type: "polygon",

      object: "safety-glasses",

      points:
        "252,784 275,773 315,771 345,777 356,789 355,803 341,813 313,819 285,817 264,807 255,797",
    },

    {
      type: "polygon",

      object: "safety-glasses",

      points:
        "171,773 187,756 211,747 245,744 269,749 279,758 269,768 249,775 224,775 199,769 183,775",
    },

    /* =====================================================
       DIGITAL CALIPER
    ===================================================== */

    {
      type: "polygon",

      object: "digital-caliper",

      points:
        "323,833 336,828 353,830 361,842 361,859 356,877 346,882 337,873 338,856 325,851",
    },

    {
      type: "polygon",

      object: "digital-caliper",

      points: "350,818 382,812 393,821 392,836 383,846 365,846 359,837 361,827",
    },

    {
      type: "polygon",

      object: "digital-caliper",

      points: "386,804 463,798 482,805 488,820 484,839 470,846 402,846 386,838",
    },

    {
      type: "polygon",

      object: "digital-caliper",

      points: "470,801 624,783 637,790 636,799 624,806 486,827 480,818",
    },

    /* =====================================================
       USB DRIVE
    ===================================================== */

    {
      type: "polygon",

      object: "usb-drive",

      points:
        "710,824 718,819 736,817 754,813 771,808 780,808 785,813 784,827 777,837 759,840 737,843 717,844 711,838",
    },

    {
      type: "polygon",

      object: "usb-drive",

      points: "780,808 792,806 801,811 801,818 793,821 782,819",
    },

    /* =====================================================
       ROBOTIC ARM
    ===================================================== */

    {
      type: "polygon",

      object: "robotic-arm",

      points:
        "592,177 604,171 619,175 628,185 627,196 617,204 603,205 593,199 588,189",
    },

    {
      type: "polygon",

      object: "robotic-arm",

      points: "619,187 630,187 652,203 660,214 657,224 648,228 638,221 625,209",
    },

    {
      type: "polygon",

      object: "robotic-arm",

      points: "641,210 655,211 665,219 663,229 656,237 645,236 636,227 636,217",
    },

    {
      type: "polygon",

      object: "robotic-arm",

      points: "628,229 646,229 649,273 643,285 630,286 624,276",
    },

    {
      type: "polygon",

      object: "robotic-arm",

      points:
        "618,274 634,269 651,275 660,286 656,300 647,308 629,306 618,296 613,284",
    },

    {
      type: "polygon",

      object: "robotic-arm",

      points: "624,302 645,302 648,339 621,340",
    },

    /* =====================================================
       LAPTOP
    ===================================================== */

    {
      type: "polygon",

      object: "laptop",

      points:
        "1025,343 1137,348 1139,357 1127,427 1116,430 1009,416 1008,407 1020,352",
    },

    {
      type: "polygon",

      object: "laptop",

      points:
        "1004,417 1127,427 1120,439 1101,447 1033,448 993,444 979,439 981,429",
    },

    /* =====================================================
       PROTECTIVE GLOVES

    ===================================================== */

    {
      type: "polygon",

      object: "protective-gloves",

      points:
        "1080,477 1091,470 1110,469 1125,475 1131,485 1121,493 1097,493 1082,487",
    },

    {
      type: "polygon",

      object: "protective-gloves",

      points:
        "1110,462 1125,455 1147,457 1160,467 1159,478 1144,485 1124,480 1108,473",
    },

    {
      type: "polygon",

      object: "protective-gloves",

      points:
        "1148,461 1172,460 1198,469 1208,482 1203,494 1185,500 1163,497 1145,486 1140,476",
    },

    {
      type: "polygon",

      object: "protective-gloves",

      points:
        "1192,474 1211,470 1225,476 1230,487 1224,497 1209,501 1196,496 1189,487",
    },

    /* =====================================================
       TABLET
    ===================================================== */

    {
      type: "polygon",

      object: "tablet",

      points:
        "1184,399 1292,401 1305,413 1304,445 1294,470 1278,479 1193,472 1169,465 1164,456 1174,421",
    },

    {
      type: "polygon",

      object: "tablet",

      points: "1277,443 1299,449 1305,472 1287,477 1273,470",
    },

    /* =====================================================
       ETHERNET CABLE
    ===================================================== */

    {
      type: "polygon",

      object: "ethernet-cable",

      points:
        "1283,556 1298,545 1323,537 1360,534 1399,539 1417,547 1426,559 1418,570 1402,577 1377,581 1360,585 1336,581 1310,578 1289,570",
    },

    {
      type: "polygon",

      object: "ethernet-cable",

      points: "1361,578 1378,575 1402,578 1414,585 1408,590 1383,591 1363,586",
    },

    /* =====================================================
       ADJUSTABLE WRENCH
    ===================================================== */

    {
      type: "polygon",

      object: "adjustable-wrench",

      points:
        "1414,578 1427,571 1446,574 1460,584 1466,591 1461,600 1452,604 1443,600 1436,593 1427,599 1418,597 1411,589",
    },

    {
      type: "polygon",

      object: "adjustable-wrench",

      points: "1450,598 1497,606 1507,608 1573,640 1490,625 1477,617 1456,608",
    },

    /* =====================================================
       ID BADGE

       Clip/lanyard connection + identification card.
    ===================================================== */

    {
      type: "polygon",

      object: "id-badge",

      points: "1627,279 1635,281 1638,289 1633,300 1626,298 1623,291",
    },

    {
      type: "polygon",

      object: "id-badge",

      points:
        "1615,300 1654,300 1660,307 1659,360 1653,367 1615,367 1609,360 1609,307",
    },

    /* =====================================================
       3D-PRINTED PART

       Base + lower body + raised upper section.

       Only the blue printed object is clickable.
       The printer itself is excluded.
    ===================================================== */

    {
      type: "polygon",

      object: "3d-printed-part",

      points: "1544,318 1592,318 1600,322 1594,327 1546,327 1539,323",
    },

    {
      type: "polygon",

      object: "3d-printed-part",

      points: "1548,299 1587,299 1592,304 1592,319 1547,319 1544,315 1544,304",
    },

    {
      type: "polygon",

      object: "3d-printed-part",

      points: "1558,290 1580,290 1585,294 1587,300 1555,300 1555,295",
    },
  ],
};

export default level2;
