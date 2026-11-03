export async function loadLevel(levelNumber) {
  const level = String(levelNumber).trim();

  if (!/^[1-9]\d*$/.test(level)) {
    throw new Error("Invalid level number.");
  }

  const module = await import(`../../levels/level-${level}/level.js`);

  if (!module.default) {
    throw new Error("Level configuration is missing.");
  }

  return module.default;
}
