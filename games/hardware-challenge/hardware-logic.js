/** Pure selection and scoring helpers, shared by both ways to play. */
export function shuffled(items, rng = Math.random) {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
export function chooseQuestions(hardware, recentIds = [], rng = Math.random) {
  const limit = Math.min(hardware.questionsPerRound || 4, hardware.targets.length);
  const unseen = shuffled(hardware.targets.filter(t => !recentIds.includes(t.id)), rng);
  const seen = shuffled(hardware.targets.filter(t => recentIds.includes(t.id)), rng);
  return [...unseen, ...seen].slice(0, limit);
}
export function chooseQuickLevel(levels, savedScores = {}, lastLevelId = null, rng = Math.random) {
  const usable = levels.filter(l => l.enabled && l.targets.length > 0);
  const unplayed = usable.filter(l => !Object.hasOwn(savedScores, String(l.id)));
  const pool = unplayed.length ? unplayed : usable;
  const alternatives = pool.filter(l => l.id !== lastLevelId);
  const candidates = alternatives.length ? alternatives : pool;
  if (!candidates.length) return null;
  return candidates[Math.floor(rng() * candidates.length)];
}
export function roundScore(earned, possible) {
  return possible > 0 ? Math.max(0, Math.min(100, Math.round(100 * earned / possible))) : 0;
}
export function validHotspots(level) {
  return level.targets.length > 0 && level.targets.every(t =>
    Array.isArray(t.regions) && t.regions.length > 0 && t.regions.every(points =>
      points.length >= 3 && points.every(([x,y]) => Number.isFinite(x) && Number.isFinite(y)
        && x >= 0 && y >= 0 && x <= level.width && y <= level.height)));
}
