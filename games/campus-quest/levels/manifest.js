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

    title: "Coming Soon",

    description:
      "A new Sheridan Campus Quest challenge is currently being developed.",

    difficulty: "",

    implemented: false,

    image: "",

    href: "",
  },
];

export default levels;
