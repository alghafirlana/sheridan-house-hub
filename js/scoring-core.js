/** Two Campus Quest levels are scored as ONE 0–100-point game for this event.
 * Add a level ID here and to Firestore rules only when that level goes live.
 * Keeping this list fixed during an event prevents mid-event score changes.
 */
export const CAMPUS_QUEST_LEVEL_IDS = Object.freeze([1, 2]);
export const campusQuestLevelGameId = (id) => `campus-quest-level-${id}`;

/** Match the global leaderboard exactly, including its whole-point rounding. */
export function campusQuestPoints(levelScores = {}) {
  const sum = CAMPUS_QUEST_LEVEL_IDS.reduce((total, id) => {
    const score = levelScores[id];
    return total + (Number.isInteger(score) && score >= 0 && score <= 100 ? score : 0);
  }, 0);
  return Math.round(sum / CAMPUS_QUEST_LEVEL_IDS.length);
}

export const isCampusQuestLevelGame = (id) =>
  typeof id === "string" && CAMPUS_QUEST_LEVEL_IDS.some(
    (n) => id === campusQuestLevelGameId(n),
  );

/** Pure helpers: easy to test without Firebase or a browser. */
export function scoreSummary(profiles, scoreDocs) {
  const result = new Map();
  for (const profile of profiles) {
    result.set(profile.id, {
      id: profile.id,
      name: profile.displayName,
      total: 0,
      games: 0,
      best: {},
      questLevels: {},
      createdAt: profile.createdAt ?? 0,
    });
  }
  for (const score of scoreDocs) {
    const player = result.get(score.playerId);
    if (
      !player ||
      !Number.isInteger(score.points) ||
      score.points < 0 ||
      score.points > 100 ||
      typeof score.gameId !== "string"
    )
      continue;
    if (isCampusQuestLevelGame(score.gameId)) {
      const levelId = Number(score.gameId.slice("campus-quest-level-".length));
      player.questLevels[levelId] = Math.max(
        player.questLevels[levelId] ?? -1,
        score.points,
      );
    } else {
      player.best[score.gameId] = Math.max(
        player.best[score.gameId] ?? -1,
        score.points,
      );
    }
  }
  for (const player of result.values()) {
    // All live Quest levels together contribute AT MOST 100 Sheridan Points.
    // Completing one perfect level of two yields 50; completing both yields 100.
    if (Object.keys(player.questLevels).length) {
      player.best["campus-quest"] = campusQuestPoints(player.questLevels);
    }
    player.games = Object.keys(player.best).length;
    player.total = Object.values(player.best).reduce((sum, n) => sum + n, 0);
  }
  return [...result.values()].sort(
    (a, b) =>
      b.total - a.total ||
      b.games - a.games ||
      a.name.localeCompare(b.name) ||
      String(a.id).localeCompare(String(b.id)),
  );
}
export function normalizeScore(points) {
  if (!Number.isInteger(points) || points < 0 || points > 100)
    throw new Error("Scores must be whole numbers between 0 and 100.");
  return points;
}
export function formatPin(input) {
  return String(input || "")
    .replace(/\D/g, "")
    .slice(0, 4);
}
export function cleanName(input) {
  const name = String(input || "")
    .normalize("NFC")
    .replace(/[<>\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (name.length < 2 || name.length > 24)
    throw new Error(
      "Please enter a name or nickname between 2 and 24 characters.",
    );
  return name;
}
export function nextPin() {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(1000 + (bytes[0] % 9000));
}
