import { SCORED_LEVEL_COUNTS } from "./config.js";

/** A single shared scoring contract for EVERY multi-level competitive game. */
export function scoredLevelIds(gameId) {
  const count = SCORED_LEVEL_COUNTS[gameId];
  if (!Number.isInteger(count) || count < 1 || count > 99) return [];
  return Array.from({ length: count }, (_, i) => i + 1);
}
export const scoredLevelGameId = (gameId, levelId) => `${gameId}-level-${levelId}`;
export function levelGameInfo(scoreId) {
  if (typeof scoreId !== "string") return null;
  for (const gameId of Object.keys(SCORED_LEVEL_COUNTS)) {
    const prefix = `${gameId}-level-`;
    if (!scoreId.startsWith(prefix)) continue;
    const suffix = scoreId.slice(prefix.length);
    // Invalid level IDs are recognized as levels and NEVER count as standalone games.
    if (!/^[1-9][0-9]*$/.test(suffix)) return { gameId, levelId: null, valid: false };
    const levelId = Number(suffix);
    return { gameId, levelId, valid: scoredLevelIds(gameId).includes(levelId) };
  }
  return null;
}
export const isScoredLevelGame = (id) => Boolean(levelGameInfo(id)?.valid);
export function scoredGamePoints(gameId, levelScores = {}) {
  const ids = scoredLevelIds(gameId);
  if (!ids.length) return 0;
  const total = ids.reduce((sum, level) => {
    const raw = levelScores[level];
    return sum + (Number.isInteger(raw) && raw >= 0 && raw <= 100 ? raw : 0);
  }, 0);
  return Math.round(total / ids.length);
}

// Compatibility aliases used by existing Campus Quest files and tests.
export const CAMPUS_QUEST_LEVEL_IDS = Object.freeze(scoredLevelIds("campus-quest"));
export const campusQuestLevelGameId = (id) => scoredLevelGameId("campus-quest", id);
export const campusQuestPoints = (scores) => scoredGamePoints("campus-quest", scores);
export const isCampusQuestLevelGame = (id) => levelGameInfo(id)?.gameId === "campus-quest" && isScoredLevelGame(id);

/** Save the best score for a level and compute exactly the SAME rounded points
 * as the global leaderboard. Only report success after submitScore resolves.
 */
export async function submitLevelResult(store, gameId, levelId, score) {
  if (!scoredLevelIds(gameId).includes(levelId)) throw Error("Level is not currently scored.");
  const points = normalizeScore(score);
  const previousLevels = { ...store.levelScoresFor(gameId) };
  const saved = await store.submitScore(scoredLevelGameId(gameId, levelId), points);
  const before = { ...previousLevels, [levelId]: saved.previous };
  const after = { ...before, [levelId]: saved.best };
  const previousGamePoints = scoredGamePoints(gameId, before);
  const gamePoints = scoredGamePoints(gameId, after);
  const levelsCompleted = scoredLevelIds(gameId).filter(id => Object.hasOwn(after, String(id))).length;
  return {
    levelsCompleted,
    levelScore: points,
    previousBest: saved.previous,
    bestScore: saved.best,
    personalBest: saved.gained > 0,
    previousGamePoints,
    gamePoints,
    pointsAdded: Math.max(0, gamePoints - previousGamePoints),
    savedToLeaderboard: store.mode === "live",
  };
}

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
      hardwareLevels: {},
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
    const info = levelGameInfo(score.gameId);
    if (info) {
      if (!info.valid) continue;
      const levels = info.gameId === "campus-quest" ? player.questLevels : player.hardwareLevels;
      levels[info.levelId] = Math.max(levels[info.levelId] ?? -1, score.points);
    } else {
      player.best[score.gameId] = Math.max(
        player.best[score.gameId] ?? -1,
        score.points,
      );
    }
  }
  for (const player of result.values()) {
    // Each multi-level game is ONE game, capped at 100, regardless of level count.
    for (const gameId of Object.keys(SCORED_LEVEL_COUNTS)) {
      const levels = gameId === "campus-quest" ? player.questLevels : player.hardwareLevels;
      if (Object.keys(levels).length) {
        player.best[gameId] = scoredGamePoints(gameId, levels);
      }
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
