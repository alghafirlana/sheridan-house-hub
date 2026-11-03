/** Edit this file to configure the Open House. Browser-side Firebase config is public by design. */
export const CONFIG = Object.freeze({
  eventId: "fall-2026-open-house",
  eventName: "Fall Open House 2026",
  inactivityMinutes: 10,
  maxPointsPerGame: 100,
  firebase: {
    apiKey: "AIzaSyBNwRnMZRqY2SM442AC18fFRJmIOnkV-nU",
    authDomain: "sheridangamehub.firebaseapp.com",
    projectId: "sheridangamehub",
    appId: "1:200090252133:web:e8bf7ddaccde3ace09e78c",
  },
});

/** Add new games here. A new competitive game must ALSO be added to firestore.rules. */
export const GAMES = [
  {
    id: "tech-sprint",
    title: "Tech Sprint",
    category: "Quick Challenge",
    description: "Five fast questions. Put your tech knowledge to the test.",
    icon: "zap",
    accent: "sky",
    status: "playable",
    competitive: true,
    href: "games/tech-sprint/index.html",
    duration: "2 min",
    featured: true,
  },
  {
    id: "campus-quest",
    title: "Sheridan Campus Quest",
    category: "Explore & Discover",
    description:
      "Discover the campus through clues, exploration and surprises.",
    icon: "compass",
    accent: "violet",
    status: "playable",
    competitive: true,
    href: "games/campus-quest/home.html",
    duration: "5–10 min",
  },
  {
    id: "hardware-challenge",
    title: "Hardware Challenge",
    category: "Identify & Learn",
    description: "Explore computer components and recognize the right parts.",
    icon: "cpu",
    accent: "mint",
    status: "soon",
    competitive: true,
    duration: "Coming soon",
  },
  {
    id: "undercover",
    title: "Find the Undercover",
    category: "Mystery & Logic",
    description:
      "Follow the clues, trust your instincts and find the undercover.",
    icon: "search",
    accent: "amber",
    status: "soon",
    competitive: true,
    duration: "Coming soon",
  },
  {
    id: "program-discovery",
    title: "Discover Your Program",
    category: "Explore Your Future",
    description: "Explore the programs and pathways that spark your interest.",
    icon: "graduation",
    accent: "coral",
    status: "playable",
    competitive: false,
    href: "games/program-explorer/index.html",
    duration: "5–10 min",
  },
  {
    id: "kahoot",
    title: "Sheridan Quiz Night",
    category: "Team Quiz",
    description: "A future in-portal quiz experience for curious minds.",
    icon: "layers",
    accent: "indigo",
    status: "soon",
    competitive: false,
    duration: "Coming soon",
  },
];

export const getGame = (id) => GAMES.find((game) => game.id === id);
export const firebaseIsConfigured = () =>
  ["apiKey", "authDomain", "projectId", "appId"].every((key) =>
    Boolean(CONFIG.firebase[key]?.trim()),
  );
