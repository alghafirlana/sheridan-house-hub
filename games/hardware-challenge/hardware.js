import { CONFIG } from "../../js/config.js";
import { initStore } from "../../js/store.js";
import { initChrome, requirePlayer, setGameplayActive, toast } from "../../js/ui.js";
import { scoredLevelIds, submitLevelResult } from "../../js/scoring-core.js";
import { HARDWARE_LEVELS, activeHardware, getHardwareLevel } from "./hardware-data.js";
import { chooseQuestions, chooseQuickLevel, roundScore, validHotspots } from "./hardware-logic.js";

const GAME_ID = "hardware-challenge";
const app = document.querySelector("#hardwareApp");
const debug = new URLSearchParams(location.search).get("debug") === "hotspots";
const escape = s => String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const savedKey = type => `hardware:${type}:${CONFIG.eventId}:${store.player?.id ?? 'guest'}`;
const readLocal = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const writeLocal = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage can be disabled */ } };
let store;
let round = null;
let busy = false;
let zoom = 1;

const scored = () => new Set(scoredLevelIds(GAME_ID));
const playable = () => activeHardware().filter(h => scored().has(h.id) && h.targets.length);
const scores = () => store.levelScoresFor(GAME_ID);
const hubPoints = () => store.board.find(p => p.id === store.player?.id)?.best?.[GAME_ID] ?? 0;
const hasScore = id => Object.hasOwn(scores(), String(id));
const allScoresCount = () => scoredLevelIds(GAME_ID).filter(id => hasScore(id)).length;

function header(title, sub, nav = "home") {
  const back = nav === "home" ? "" : `<button class="hc-back" type="button" id="backBtn">← ${nav === 'library' ? 'All hardware' : 'Choose mode'}</button>`;
  return `<div class="hc-topline"><div class="hc-crumb">GAME HUB <span>/</span> HARDWARE CHALLENGE</div>${back}</div><div class="hc-page-head"><div><div class="hc-eyebrow">✳ LEARN • IDENTIFY • EARN POINTS</div><h1>${escape(title)}</h1><p>${escape(sub)}</p></div>${store.player ? `<div class="hc-score-chip"><span>HARDWARE POINTS</span><strong>${hubPoints()}<small> / 100</small></strong><em>${allScoresCount()} of ${scoredLevelIds(GAME_ID).length} levels played</em></div>` : ''}</div>`;
}
function wireBack(nav) {
  app.querySelector('#backBtn')?.addEventListener('click', () => {
    if (round && !round.finished && !confirm('Exit this level? This unfinished round will not be saved.')) return;
    round = null; setGameplayActive(false);
    nav === 'library' ? showLibrary() : showHome();
  });
}
function showHome() {
  round = null; setGameplayActive(false);
  const total = scoredLevelIds(GAME_ID).length;
  app.innerHTML = `${header('Hardware Challenge', 'Explore real computer parts, then test yourself with interactive photo missions.')}
    <section class="hc-hero" aria-label="Choose a way to play"><div class="hc-hero-copy"><span class="hc-label">YOUR HARDWARE ADVENTURE</span><h2>Every component has a story. <em>Find it!</em></h2><p>Choose a piece of hardware or let us surprise you. Both modes earn Sheridan Points for the same levels.</p><div class="hc-hero-stats"><span>✓ Best level scores saved</span><span>✓ Maximum 100 points</span><span>✓ No time pressure</span></div></div><div class="hc-hero-orb" aria-hidden="true">⚙</div></section>
    <section class="hc-modes" aria-label="Game modes"><article class="hc-mode"><span class="hc-mode-icon">🧭</span><span class="hc-tag">CHOOSE YOUR LEVEL</span><h3>Explore Hardware</h3><p>Pick any hardware photo and find its components. Discover what each part does as you earn points.</p><button id="exploreBtn" class="hc-btn hc-btn-outline" type="button">Explore levels <span>→</span></button></article><article class="hc-mode hc-mode-primary"><span class="hc-mode-icon">⚡</span><span class="hc-tag">SURPRISE LEVEL</span><h3>Quick Challenge</h3><p>We'll choose a hardware level for you. Questions are randomized, and your best score still counts.</p><button id="quickBtn" class="hc-btn hc-btn-mint" type="button">Surprise me <span>→</span></button></article></section>
    <div class="hc-tip"><strong>How the leaderboard works</strong><p>Your score is the rounded average across ${total} scored levels (up to ${Math.round(100 / total)} points per level, with small rounding differences). Unplayed levels count as zero. Your best attempt on each level stays saved, so trying again never removes points.</p></div>`;
  app.querySelector('#exploreBtn').addEventListener('click', showLibrary);
  app.querySelector('#quickBtn').addEventListener('click', async () => {
    try {
      await requirePlayer('Hardware Challenge');
      const candidates = playable();
      const last = readLocal(savedKey('last-quick'), null);
      const level = chooseQuickLevel(candidates, scores(), last);
      if (!level) throw Error('There are no scored hardware levels available yet.');
      writeLocal(savedKey('last-quick'), level.id);
      startLevel(level, 'quick');
    } catch (e) { toast(e.message, 'error'); }
  });
}
function showLibrary() {
  round = null; setGameplayActive(false);
  const active = activeHardware();
  app.innerHTML = `${header('Explore the hardware', 'Pick any available photo mission. Play and replay levels to build your leaderboard score.', 'home')}
    <section class="hc-library-head"><h2>Choose a hardware level</h2><span>${active.length} photo missions</span></section>
    <section class="hc-level-grid">${active.map(level => {
      const eligible = scored().has(level.id);
      const best = scores()[level.id];
      return `<article class="hc-level-card"><div class="hc-level-image"><img src="${escape(level.image)}" alt="${escape(level.subtitle)}" loading="lazy"/><span class="hc-level-number">LEVEL ${level.id}</span></div><div class="hc-level-body"><div class="hc-level-tags"><span>${eligible ? 'SCORED LEVEL' : 'PREVIEW ONLY'}</span><span>${typeof best === 'number' ? '✓ COMPLETED' : 'NOT PLAYED'}</span></div><h3>${escape(level.title)}</h3><p>${escape(level.description)}</p><div class="hc-level-foot"><div><small>BEST SCORE</small><strong>${typeof best === 'number' ? `${best} / 100` : '—'}</strong></div><button data-level="${level.id}" class="hc-btn hc-btn-dark" type="button" ${eligible ? '' : 'disabled title="This level joins scoring at a future event"'}>${!eligible ? 'Next event' : typeof best === 'number' ? 'Play again' : 'Play level'} →</button></div></div></article>`;
    }).join('')}</section><p class="hc-footnote">You can add more hardware later. Only levels activated in this event’s scoring configuration contribute to the leaderboard.</p>`;
  wireBack('home');
  app.querySelectorAll('button[data-level]').forEach(btn => btn.addEventListener('click', async () => {
    try { await requirePlayer('Hardware Challenge'); startLevel(getHardwareLevel(btn.dataset.level), 'explore'); }
    catch (e) { toast(e.message, 'error'); }
  }));
}
function startLevel(level, mode) {
  if (!level?.enabled || !validHotspots(level)) return toast('This level needs its image or hotspots checked.', 'error');
  if (!scored().has(level.id)) return toast('This is a preview level; activate it for a future event first.', 'error');
  const recent = readLocal(savedKey(`recent-${level.id}`), []);
  const questions = chooseQuestions(level, recent);
  if (!questions.length) return toast('No questions are available for this hardware yet.', 'error');
  round = { level, mode, questions, step: 0, tries: 0, earned: 0, finished: false, feedback: null };
  zoom = 1; setGameplayActive(true); showQuestion();
}
function questionSvg(level, activeQuestion, reveal) {
  const polygons = level.targets.map((t,index) => {
    const pts = t.points.map(x=>x.join(',')).join(' ');
    const state = t.id === activeQuestion.id && reveal ? `hc-target-answer ${round.feedback?.correct ? 'hc-target-correct' : ''}` : '';
    const debugLabel = debug ? `data-title="${escape(t.label)}"` : '';
    return `<polygon data-target="${escape(t.id)}" ${debugLabel} class="hc-hit ${state}" points="${pts}" tabindex="0" role="button" aria-label="Select hardware region ${index+1}" />`;
  }).join('');
  return `<svg class="hc-overlay ${debug ? 'hc-debug' : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${level.width} ${level.height}" preserveAspectRatio="none" role="group" aria-label="Tap a hardware region, or use Tab and Enter to select a region">${polygons}</svg>`;
}
function showQuestion() {
  const {level, mode, questions, step, tries, feedback} = round;
  const q = questions[step]; const resolved = Boolean(feedback?.finished);
  const pct = Math.round(100*(step + (resolved ? 1 : 0))/questions.length);
  app.innerHTML = `${header(level.title, mode === 'quick' ? 'Quick Challenge · randomized hardware mission' : 'Explore Hardware · learn as you play', 'library')}
    <section class="hc-play-grid"><div class="hc-visual"><div class="hc-visual-top"><div><span class="hc-small-label">HARDWARE PHOTO</span><strong>${escape(level.subtitle)}</strong></div><div class="hc-zoom-tools" aria-label="Image zoom controls"><button type="button" id="zoomOut" aria-label="Zoom out">−</button><span id="zoomLabel">100%</span><button type="button" id="zoomIn" aria-label="Zoom in">+</button></div></div><div class="hc-image-scroller" id="imageScroller"><div class="hc-picture" id="photoWrap" style="width:100%"><img draggable="false" src="${escape(level.image)}" width="${level.width}" height="${level.height}" alt="${escape(level.subtitle)}"/>${questionSvg(level,q,resolved)}</div></div><div class="hc-photo-tip">${debug ? 'HOTSPOT DEBUG MODE · outlines visible' : 'Tap a part · Zoom with + · Keyboard: Tab through regions and Enter to select'}</div></div>
    <div class="hc-play-side"><div class="hc-question-bar"><span>QUESTION ${step+1} / ${questions.length}</span><strong>${roundScore(round.earned,10*questions.length)} / 100</strong></div><div class="hc-progress"><span style="width:${pct}%"></span></div><span class="hc-label">FIND THE COMPONENT</span><h2>${escape(q.question)}</h2><p>${resolved ? 'You can now see the correct location outlined on the photo.' : tries === 1 ? 'Not quite! Take another look. You have one more try.' : 'Look carefully at the actual hardware image. Tap the matching part.'}</p><div class="hc-attempts"><span class="${tries >=1?'used':''}">●</span><span class="${tries >=2?'used':''}">●</span><small>${resolved ? 'Question finished' : `${2-tries} ${2-tries===1?'try':'tries'} remaining`}</small></div>
      ${resolved ? `<div class="hc-feedback ${feedback.correct?'hc-feedback-good':'hc-feedback-neutral'}"><strong>${feedback.correct ? '✓ Nice work!' : 'The answer is highlighted.'} ${feedback.earned > 0 ? `+${feedback.earned} question points` : ''}</strong><p>${escape(q.fact)}</p></div><button id="nextQuestion" type="button" class="hc-btn hc-btn-mint hc-wide">${step+1===questions.length ? 'Finish & save score' : 'Next question'} →</button>` : `<div class="hc-prompt-note">No timer. Accuracy matters more than speed.<br/>Correct first try: 10 · Second try: 5</div>`}
      <button type="button" class="hc-quit" id="quitRound">Exit this level</button></div></section>`;
  wireBack('library');
  const imageScroller = app.querySelector('#imageScroller');
  const wrap = app.querySelector('#photoWrap');
  function updateZoom(change) {
    zoom = Math.min(3, Math.max(1, +(zoom+change).toFixed(2)));
    const oldW=wrap.getBoundingClientRect().width;
    const centerX=(imageScroller.scrollLeft+imageScroller.clientWidth/2)/oldW;
    const centerY=(imageScroller.scrollTop+imageScroller.clientHeight/2)/Math.max(1,wrap.getBoundingClientRect().height);
    wrap.style.width = `${zoom * 100}%`;
    app.querySelector('#zoomLabel').textContent = `${Math.round(zoom*100)}%`;
    imageScroller.scrollLeft=Math.max(0,centerX*wrap.getBoundingClientRect().width-imageScroller.clientWidth/2);
    imageScroller.scrollTop=Math.max(0,centerY*wrap.getBoundingClientRect().height-imageScroller.clientHeight/2);
  }
  app.querySelector('#zoomIn').addEventListener('click',()=>updateZoom(0.5));
  app.querySelector('#zoomOut').addEventListener('click',()=>updateZoom(-0.5));
  if (zoom>1) { const current=zoom; zoom=1; updateZoom(current-1); }
  if (!resolved) {
    const overlay = app.querySelector('.hc-overlay');
    overlay.addEventListener('click',e=>{
      const hit=e.target.closest('polygon[data-target]');
      answer(hit?.dataset.target ?? null);
    });
    overlay.addEventListener('keydown',e=>{
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('polygon[data-target]')) {
        e.preventDefault(); answer(e.target.dataset.target);
      }
    });
  }
  app.querySelector('#nextQuestion')?.addEventListener('click', nextQuestion);
  app.querySelector('#quitRound').addEventListener('click',()=>{
    if (!confirm('Leave this level? Your unfinished round will not be saved.')) return;
    showLibrary();
  });
}
function answer(clicked) {
  if (!round || round.feedback?.finished || busy) return;
  round.tries++;
  const correct = clicked === round.questions[round.step].id;
  const finished = correct || round.tries >= 2;
  if (!finished) { showQuestion(); return; }
  const earned = correct ? (round.tries === 1 ? 10 : 5) : 0;
  round.earned += earned;
  round.feedback = { correct, earned, finished: true };
  showQuestion();
}
async function nextQuestion() {
  if (!round || busy) return;
  if (round.step + 1 < round.questions.length) {
    round.step++; round.tries=0; round.feedback=null; zoom=1; showQuestion(); return;
  }
  busy = true;
  app.querySelector('#nextQuestion').disabled = true;
  app.querySelector('#nextQuestion').textContent = 'Saving your score…';
  const { level, questions, earned, mode } = round;
  const score = roundScore(earned,10*questions.length);
  try {
    const result = await submitLevelResult(store,GAME_ID,level.id,score);
    const recentKey=savedKey(`recent-${level.id}`);
    const recent=readLocal(recentKey,[]);
    const latest=questions.map(q=>q.id);
    writeLocal(recentKey,[...new Set([...latest,...recent])].slice(0,level.targets.length));
    round.finished=true;
    setGameplayActive(false);
    showResult(level,mode,result);
  } catch(e) {
    toast(`Score not saved: ${e.message}`, 'error');
    app.querySelector('#nextQuestion').disabled = false;
    app.querySelector('#nextQuestion').textContent = 'Try saving again';
  } finally { busy=false; }
}
function showResult(level, mode, result) {
  const finished=result.levelsCompleted;
  const left=scoredLevelIds(GAME_ID).length-finished;
  const message = result.pointsAdded>0 ?
    `You just added ${result.pointsAdded} Sheridan ${result.pointsAdded===1?'Point':'Points'} to your Game Hub leaderboard score! ${left?`Play ${left} more ${left===1?'level':'levels'} or improve your personal best to earn more.`:'You have played every level! Replay to improve your personal best.'}` :
    `Your best score is safe, and no points were lost. ${left?'Try another hardware level to build your leaderboard score.':'Replay a level to try for a higher score.'}`;
  app.innerHTML = `${header('Level complete!', 'Your hardware knowledge is growing. Here is how your result affects the shared leaderboard.', 'library')}
    <section class="hc-results"><div class="hc-results-icon" aria-hidden="true">🏆</div><span class="hc-label">${escape(level.title.toUpperCase())}</span><h2>${result.personalBest?'New personal best!':'Great effort!'}</h2><p>${escape(message)}</p><div class="hc-result-stats"><div><span>THIS LEVEL</span><strong>${result.levelScore}<small>/100</small></strong></div><div><span>LEADERBOARD POINTS ADDED</span><strong class="mint">+${result.pointsAdded}</strong></div><div><span>HARDWARE CHALLENGE TOTAL</span><strong>${result.gamePoints}<small>/100</small></strong></div></div><div class="hc-save ${result.savedToLeaderboard?'hc-save-live':''}">${result.savedToLeaderboard?'✓ Score saved to the live leaderboard!':'✓ Result saved in demo mode on this browser.'}<small>${finished} of ${scoredLevelIds(GAME_ID).length} scored levels completed. Your highest level score is always protected.</small></div><div class="hc-result-actions"><button class="hc-btn hc-btn-mint" id="anotherLevel" type="button">Explore another level →</button><button class="hc-btn hc-btn-outline" id="replay" type="button">Replay this level</button><button class="hc-btn hc-btn-dark" id="againQuick" type="button">Surprise me again ⚡</button></div><a class="hc-home-link" href="../../index.html#games">← Back to Sheridan Game Hub</a></section>`;
  wireBack('library');
  app.querySelector('#anotherLevel').addEventListener('click',showLibrary);
  app.querySelector('#replay').addEventListener('click',()=>startLevel(level,mode));
  app.querySelector('#againQuick').addEventListener('click',()=>{
    const next=chooseQuickLevel(playable(),scores(),level.id);
    if (next) { writeLocal(savedKey('last-quick'),next.id); startLevel(next,'quick'); }
  });
}
async function main() {
  try {
    store=await initStore();
    await store.waitForScores();
    initChrome(store);
    // A shared store listener keeps the displayed points current while browsing.
    store.listenBoard(()=>{ if (!round && app.querySelector('.hc-score-chip')) {
      app.querySelector('.hc-score-chip strong').innerHTML = `${hubPoints()}<small> / 100</small>`;
      app.querySelector('.hc-score-chip em').textContent = `${allScoresCount()} of ${scoredLevelIds(GAME_ID).length} levels played`;
    }});
    store.listenPlayer(()=>{ if (!round) showHome(); });
    showHome();
  } catch(e) {
    app.innerHTML=`<section class="hc-error"><h1>Could not load Hardware Challenge</h1><p>Please check the connection and try again. Your previous scores are safe.</p><a class="hc-btn hc-btn-dark" href="../../index.html">Back to Game Hub</a></section>`;
    console.error(e);
  }
}
main();
