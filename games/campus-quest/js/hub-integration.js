/** Campus Quest uses the Game Hub's 4-digit player identity and live score store. */
import { initStore, markSessionActivity } from "../../../js/store.js";
import { CONFIG } from "../../../js/config.js";
import { CAMPUS_QUEST_LEVEL_IDS, submitLevelResult } from "../../../js/scoring-core.js";

const hubHome = new URL("../../../index.html", import.meta.url).href;
let gameActive = false;

function showHeader(store, gameplay) {
  const host = document.querySelector("#appHeader");
  host.innerHTML = `<header class="hub-quest-header">
    <a class="hub-quest-brand" href="${hubHome}"><span class="hub-quest-spark">✳</span><span><strong>SHERIDAN</strong><small>GAME HUB · CAMPUS QUEST</small></span></a>
    <div class="hub-quest-actions">
      <span class="hub-quest-points" id="questPoints"></span>
      <span class="hub-quest-name" id="questPlayerName"></span>
      ${gameplay ? '<button id="questSettings" class="hub-quest-action" type="button">Settings</button>' : ''}
      <a class="hub-quest-action" href="${gameplay ? '../home.html' : '../../index.html#games'}">${gameplay ? 'Quest Levels' : 'All Games'}</a>
      <button class="hub-quest-switch" id="questSwitch" type="button">Switch player</button>
    </div></header>`;
  function update() {
    host.querySelector("#questPoints").textContent = `${store.currentTotal()} Hub pts`;
    host.querySelector("#questPlayerName").textContent = store.player?.displayName || '';
  }
  store.listenBoard(update);
  update();
  host.querySelector("#questSwitch").addEventListener("click", async () => {
    if (gameActive && !window.confirm("Exit this game and switch players? Your unfinished challenge will not be saved.")) return;
    await store.switchPlayer();
    window.location.href = hubHome + '#games';
  });
}

export async function initQuestShell({ gameplay = false } = {}) {
  let store;
  try {
    store = await initStore();
    await store.waitForScores();
  } catch (error) {
    document.body.innerHTML = `<main class="hub-quest-error"><h1>Couldn't load Campus Quest</h1><p>Check your internet connection and try again.</p><a href="${hubHome}">Back to Game Hub</a></main>`;
    throw error;
  }
  if (!store.player) {
    window.location.replace(hubHome + '#games');
    throw Error('Join with a name or player code first.');
  }
  gameActive = gameplay;
  let lastActivity = Date.now();
  function activity() {
    lastActivity = Date.now();
    markSessionActivity();
  }
  for (const name of ['pointerdown', 'touchstart', 'keydown'])
    document.addEventListener(name, activity, { passive: true });
  activity();
  const interval = setInterval(async () => {
    if (gameActive) markSessionActivity();
    else if (Date.now() - lastActivity >= CONFIG.inactivityMinutes * 60000) {
      clearInterval(interval);
      await store.switchPlayer();
      window.location.replace(hubHome + '#games');
    }
  }, 15000);
  showHeader(store, gameplay);
  return {
    store,
    user: { id: store.player.id, name: store.player.displayName },
    getQuestPoints: () => store.board.find((p) => p.id === store.player.id)?.best?.['campus-quest'] ?? 0,
    setGameplayActive(active) { gameActive = Boolean(active); activity(); },
  };
}

/** Progress is reconstructed from the same saved best-score docs on every device. */
export function createQuestProgressStore(store, levelIds = CAMPUS_QUEST_LEVEL_IDS) {
  const ids = levelIds.filter((id) => CAMPUS_QUEST_LEVEL_IDS.includes(id));
  const localScores = new Map();
  const attemptsKey = `hub-quest:attempts:${CONFIG.eventId}:${store.player.id}`;
  function attempts() {
    try { return JSON.parse(sessionStorage.getItem(attemptsKey) || '{}'); }
    catch { return {}; }
  }
  function getSnapshot() {
    const saved = store.questLevelScores(), counts = attempts(), levels = {};
    ids.forEach((id, index) => {
      const prior = ids[index-1];
      levels[id] = {
        id, completed: Object.hasOwn(saved, String(id)) || localScores.has(id),
        unlocked: index === 0 || Object.hasOwn(saved, String(prior)) || localScores.has(prior),
        bestScore: Math.max(saved[id] ?? 0, localScores.get(id) ?? 0),
        bestTimeSeconds: null, attempts: counts[id] || 0,
      };
    });
    const highestUnlockedLevel = ids.filter((id) => levels[id].unlocked).at(-1) || ids[0];
    return {
      levels, highestUnlockedLevel,
      currentLevel: ids.find((id) => levels[id].unlocked && !levels[id].completed) || highestUnlockedLevel,
      totalScore: ids.reduce((total, id) => total + levels[id].bestScore, 0),
    };
  }
  async function startLevel(id) {
    if (!getSnapshot().levels[id]?.unlocked) throw Error('This level is locked.');
    const data = attempts();
    data[id] = (data[id] || 0) + 1;
    sessionStorage.setItem(attemptsKey, JSON.stringify(data));
    return getSnapshot();
  }
  async function completeLevel(id, { score = 0 } = {}) {
    const levelId = Number(id);
    if (!ids.includes(levelId)) throw Error('Invalid Quest level.');
    const points = Math.max(0, Math.min(100, Math.round(score)));
    const result = await submitLevelResult(store, "campus-quest", levelId, points);
    const saved = { best: result.bestScore };
    localScores.set(levelId, Math.max(localScores.get(levelId) ?? 0, saved.best));
    return {
      ...getSnapshot(),
      result: {
        ...result,
        previousQuestPoints: result.previousGamePoints,
        questPoints: result.gamePoints,
      },

    };
  }
  return { getSnapshot, startLevel, completeLevel };
}
