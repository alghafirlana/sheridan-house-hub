import GameModel from "./models/GameModel.js";
import GameView from "./views/GameView.js";
import GameController from "./controllers/GameController.js";
import { loadLevel } from "./LevelLoader.js";
import levels from "../../levels/manifest.js";
import { initQuestShell, createQuestProgressStore } from "../../js/hub-integration.js";

const params = new URLSearchParams(window.location.search);
const levelNumber = params.get("level") || "1";

const { store, user, setGameplayActive } = await initQuestShell({ gameplay: true });
const implementedLevels = levels.filter((level) => level.implemented).sort((a, b) => a.id - b.id);
const progressStore = createQuestProgressStore(store, implementedLevels.map((level) => level.id));

const settingsDialog = document.querySelector("#settingsDialog");
const soundSetting = document.querySelector("#soundSetting");
const hintSetting = document.querySelector("#hintSetting");
const settingsKey = `sheridanQuest:settings:${store.player.id}`;
let savedSettings = {};
try { savedSettings = JSON.parse(localStorage.getItem(settingsKey) || "{}"); } catch { /* Ignore invalid stored settings. */ }
const settings = {
  soundEnabled: savedSettings.soundEnabled ?? true,
  showHints: savedSettings.showHints ?? true,
};
const settingsStore = {
  get() { return { ...settings }; },
  update(next) {
    Object.assign(settings, next);
    localStorage.setItem(settingsKey, JSON.stringify(settings));
    document.body.classList.toggle("hide-game-hints", !settings.showHints);
  },
};
function openSettings() {
  soundSetting.checked = settings.soundEnabled;
  hintSetting.checked = settings.showHints;
  settingsDialog.showModal();
}
document.querySelector("#questSettings").addEventListener("click", openSettings);
soundSetting.addEventListener("change", () => settingsStore.update({ soundEnabled: soundSetting.checked }));
hintSetting.addEventListener("change", () => settingsStore.update({ showHints: hintSetting.checked }));
document.body.classList.toggle("hide-game-hints", !settings.showHints);

async function startGame() {
  const view = new GameView();
  try {
    const levelData = await loadLevel(levelNumber);
    const manifestLevel = implementedLevels.find((level) => level.id === Number(levelData.id));
    if (!manifestLevel) {
      window.location.replace("../home.html#levels");
      return;
    }
    const state = progressStore.getSnapshot();
    if (!state.levels[levelData.id]?.unlocked) {
      window.location.replace("../home.html#levels");
      return;
    }
    await progressStore.startLevel(levelData.id);
    const model = new GameModel(levelData);
    new GameController(model, view, {
      user,
      progressStore,
      onFinished: () => setGameplayActive(false),
    });
  } catch (error) {
    console.error("Unable to load level:", error);
    setGameplayActive(false);
    view.showLoadError();
  }
}
await startGame();
