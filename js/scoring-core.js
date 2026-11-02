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
    player.best[score.gameId] = Math.max(
      player.best[score.gameId] ?? -1,
      score.points,
    );
  }
  for (const player of result.values()) {
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
