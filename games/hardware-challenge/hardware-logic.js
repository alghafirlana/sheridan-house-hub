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
  return [...unseen, ...seen].slice(0, limit).map(target => {
    const prompts = target.questionVariants?.length
      ? target.questionVariants : [target.question];
    const index = Math.min(prompts.length - 1, Math.floor(rng() * prompts.length));
    return { ...target, question: prompts[index] };
  });
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

/**
 * Photo and hotspot geometry for a contain-fitted stage (in original pixels).
 * Rotate the entire stage, never just the bitmap, so original SVG polygons
 * remain exactly on their components. Rotation is expressed in CSS degrees.
 */
export function fittedPhotoGeometry(imageWidth, imageHeight, viewportWidth, viewportHeight, rotation = 0) {
  if (![imageWidth, imageHeight, viewportWidth, viewportHeight].every(n => Number.isFinite(n) && n > 0)) {
    return { width: 0, height: 0, fitWidth: 0, fitHeight: 0 };
  }
  const sideways = ((rotation % 180) + 180) % 180 !== 0;
  const orientedWidth = sideways ? imageHeight : imageWidth;
  const orientedHeight = sideways ? imageWidth : imageHeight;
  const scale = Math.min(viewportWidth / orientedWidth, viewportHeight / orientedHeight);
  return {
    width: imageWidth * scale,
    height: imageHeight * scale,
    fitWidth: orientedWidth * scale,
    fitHeight: orientedHeight * scale,
  };
}

/** Restore a round after Live Server refreshes the current browser tab. */
export function recoverHardwareRound(saved, level, playerId) {
  if (!saved || saved.version !== 1 || saved.playerId !== playerId || !level) return null;
  const ids = saved.questionIds;
  if (!Array.isArray(ids) || !ids.length || ids.length > (level.questionsPerRound || 4) ||
      new Set(ids).size !== ids.length ||
      !Number.isInteger(saved.step) || saved.step < 0 || saved.step >= ids.length ||
      !Number.isInteger(saved.tries) || saved.tries < 0 || saved.tries > 2 ||
      !Number.isInteger(saved.earned) || saved.earned < 0 || saved.earned > 10 * (saved.step + 1)) return null;
  const questions = ids.map((id, i) => {
    const target = level.targets.find(t => t.id === id);
    if (!target) return null;
    const chosen = saved.questionPrompts?.[i];
    const prompt = target.questionVariants?.includes(chosen) ? chosen : target.question;
    return { ...target, question: prompt };
  });
  if (questions.some(q => !q)) return null;
  return {
    playerId, level, mode: saved.mode === 'quick' ? 'quick' : 'explore',
    questions, step: saved.step, tries: saved.tries, earned: saved.earned,
    feedback: saved.feedback?.finished ? saved.feedback : null,
    saveError: typeof saved.saveError === 'string' ? saved.saveError : null,
    finished: false,
  };
}
