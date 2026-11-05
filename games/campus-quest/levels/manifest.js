const levels = [
  {
    id: 1,

    title: "Campus Discovery",

    description:
      "Explore a busy Davis Campus scene, interpret challenging clues, protect your score, and uncover six randomly selected campus objects.",

    difficulty: "Medium",

    implemented: true,

    image: new URL(
      "../assets/images/levels/level-1/background.png",
      import.meta.url,
    ).href,

    href: "game/game.html?level=1",
  },

  {
    id: 2,

    title: "Innovation Lab",

    description:
      "Step into a busy engineering and technology lab, solve six technical clues, and locate the correct equipment before time runs out.",

    difficulty: "Medium–Hard",

    implemented: true,

    image: new URL(
      "../assets/images/levels/level-2/background.png",
      import.meta.url,
    ).href,

    href: "game/game.html?level=2",
  },

  {
    id: 3,
    title: "Library Mystery",
    description: "Search a vibrant library study area, decode six practical clues and find the right objects before time runs out.",
    difficulty: "Medium",
    implemented: true,
    image: new URL("../assets/images/levels/level-3/background.png", import.meta.url).href,
    href: "game/game.html?level=3",
  },

  {
    id: 4,
    title: "Creative Studio",
    description: "Explore a photographic and animation studio, interpret six creative-workflow clues and find the correct equipment.",
    difficulty: "Medium–Hard",
    implemented: true,
    image: new URL("../assets/images/levels/level-4/background.png", import.meta.url).href,
    href: "game/game.html?level=4",
  },

  {
    id: 5,
    title: "Student Life Adventure",
    description: "Explore the student commons, decode six clues about campus life and find the right places or belongings.",
    difficulty: "Medium",
    implemented: true,
    image: new URL("../assets/images/levels/level-5/background.png", import.meta.url).href,
    href: "game/game.html?level=5",
  },
];

export default levels;
