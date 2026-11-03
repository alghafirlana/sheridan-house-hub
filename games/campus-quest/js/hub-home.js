import levels from '../levels/manifest.js';
import { initQuestShell, createQuestProgressStore } from './hub-integration.js';

const { store, user, getQuestPoints } = await initQuestShell();
const available = levels.filter((item) => item.implemented).sort((a,b) => a.id-b.id);
const progress = createQuestProgressStore(store, available.map((item) => item.id));
const el = (id) => document.getElementById(id);
el('howToPlayButton').addEventListener('click', () => el('howToPlayDialog').showModal());
el('settingsDialog')?.remove();

function render() {
  const state = progress.getSnapshot();
  const completed = available.filter((lv) => state.levels[lv.id]?.completed);
  const next = available.find((lv) => state.levels[lv.id]?.unlocked && !state.levels[lv.id]?.completed)
    || available.find((lv) => state.levels[lv.id]?.unlocked);
  const highest = available.filter((lv) => state.levels[lv.id]?.unlocked).at(-1);
  const locked = available.find((lv) => !state.levels[lv.id]?.unlocked);
  el('heroPlayerName').textContent = user.name;
  el('heroBestScore').textContent = `${getQuestPoints()} / 100`;
  el('completedStat').textContent = String(completed.length);
  el('completedStatLabel').textContent = 'Levels completed';
  el('unlockedStat').textContent = highest ? `Level ${highest.id}` : '—';
  el('unlockedStatLabel').textContent = 'Highest unlocked';
  el('attemptStat').textContent = String(available.reduce((n,lv) => n + (state.levels[lv.id]?.attempts || 0),0));
  el('attemptStatLabel').textContent = 'Attempts on this device';
  el('progressKicker').textContent = 'YOUR CAMPUS QUEST PROGRESS';
  if (locked) {
    el('progressTitle').textContent = `${locked.title} is next to unlock`;
    el('progressMessage').textContent = 'Finish the previous level to unlock the next. Your saved scores and unlocked levels follow your four-digit player code.';
    el('progressStatusLabel').textContent = 'NEXT UNLOCK';
    el('progressStatusValue').textContent = `Level ${locked.id}`;
    el('progressStatusNote').textContent = `Finish Level ${available.findIndex((lv) => lv.id === locked.id)}`;
  } else {
    el('progressTitle').textContent = 'All available levels unlocked!';
    el('progressMessage').textContent = 'Replay any level to improve your best score. Both levels together count for up to 100 Sheridan Points.';
    el('progressStatusLabel').textContent = 'YOUR QUEST SCORE';
    el('progressStatusValue').textContent = `${getQuestPoints()} / 100`;
    el('progressStatusNote').textContent = 'Best score from each level counts.';
  }
  el('levelsHeading').textContent = 'Choose your campus challenge';
  el('levelsDescription').textContent = 'Levels unlock in order. Your best result for each level is saved in the shared Game Hub.';
  if (next) {
    el('continueButton').href = next.href;
    el('continueEyebrow').textContent = state.levels[next.id].completed ? 'PLAY AGAIN' : 'CONTINUE YOUR QUEST';
    el('continueLabel').textContent = next.title;
  }
  const grid = el('levelGrid');
  grid.replaceChildren();
  available.forEach((lv,index) => {
    const saved = state.levels[lv.id], prev = available[index-1];
    const card = document.createElement('article');
    card.className = `level-card ${saved.unlocked ? 'unlocked' : 'locked'}`;
    card.innerHTML = `<div class="level-card-image"><img src="${lv.image}" alt="${lv.title} preview" loading="lazy"><span class="level-number">LEVEL ${lv.id}</span><span class="level-lock">${saved.completed ? 'COMPLETED' : saved.unlocked ? 'UNLOCKED' : 'LOCKED'}</span></div>
      <div class="level-card-body"><div class="level-card-top"><h3>${lv.title}</h3><span class="difficulty-pill">${lv.difficulty}</span></div><p>${lv.description}</p>
      <div class="level-meta"><div><span>BEST SCORE</span><strong>${saved.completed ? saved.bestScore + ' / 100' : '—'}</strong></div>
      <div><span>STATUS</span><strong>${saved.completed ? 'Finished' : saved.unlocked ? 'Ready' : 'Locked'}</strong></div>
      <div><span>ATTEMPTS HERE</span><strong>${saved.attempts}</strong></div></div>
      ${saved.unlocked ? `<a class="level-action play" href="${lv.href}">${saved.completed ? 'Play Again' : 'Play Level'}</a>` : `<span class="level-action locked">Complete Level ${prev?.id ?? 1} to unlock</span>`}</div>`;
    grid.appendChild(card);
  });
}
store.listenBoard(render);
render();
