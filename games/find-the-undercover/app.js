import { initStore } from '../../js/store.js';
import { initChrome, requirePlayer, setGameplayActive, toast } from '../../js/ui.js';
import { loadWordBank } from './word-bank.js';

const MAX_ATTEMPTS = 5;
const TOTAL_ROUNDS = 3;
const CLUE_LIMIT = 5;
const NPC_IMAGES = Array.from({ length: 8 }, (_, index) => `./src/assets/img_npc${index + 1}.png`);
const app = document.getElementById('app');
let store;

const state = {
  words: [],
  game: null,
  status: 'IDLE',
  round: 1,
  cluesRevealed: 1,
  selectedNpcId: null,
  attemptsLeft: MAX_ATTEMPTS,
  score: 0,
  roundsWon: 0,
  scoreSettled: false,
  scoreResult: null,
  scoreError: '',
  pendingStatus: null,
  roundOutcome: null,
  timeLeft: null,
  timerId: null,
  feedbackId: null,
  feedback: ''
};

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function playSound(id) {
  const audio = document.getElementById(id);
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function stopClock() {
  if (state.timerId !== null) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
  document.getElementById('ClockTicking')?.pause();
}

function createGame() {
  const pair = state.words[Math.floor(Math.random() * state.words.length)];
  const undercoverUsesWord1 = Math.random() < 0.5;
  const civilianWord = undercoverUsesWord1 ? pair.word2 : pair.word1;
  const undercoverWord = undercoverUsesWord1 ? pair.word1 : pair.word2;
  const civilianClues = shuffle(undercoverUsesWord1 ? pair['word2-clue'] : pair['word1-clue']);
  const undercoverClues = shuffle(undercoverUsesWord1 ? pair['word1-clue'] : pair['word2-clue']).slice(0, 5);
  const civilianCluePacks = [
    civilianClues.slice(0, 5),
    civilianClues.slice(5, 10),
    civilianClues.slice(10, 15)
  ];
  const undercoverIndex = Math.floor(Math.random() * 4);
  const npcImages = shuffle(NPC_IMAGES).slice(0, 4);
  let civilianIndex = 0;

  const npcs = Array.from({ length: 4 }, (_, index) => {
    const undercover = index === undercoverIndex;
    const allClues = undercover ? undercoverClues : civilianCluePacks[civilianIndex++];
    return {
      id: index + 1,
      image: npcImages[index],
      role: undercover ? 'UNDERCOVER' : 'CIVILIAN',
      word: undercover ? undercoverWord : civilianWord,
      allClues,
      displayedClues: allClues.slice(0, state.cluesRevealed)
    };
  });

  return { civilianWord, undercoverWord, conclusion: pair.conclusion, npcs };
}

async function startGame() {
  await requirePlayer('Find the Undercover');
  setGameplayActive(true);
  stopClock();
  clearTimeout(state.feedbackId);
  state.status = 'PLAYING';
  state.round = 1;
  state.cluesRevealed = 1;
  state.selectedNpcId = null;
  state.attemptsLeft = MAX_ATTEMPTS;
  state.score = 0;
  state.roundsWon = 0;
  state.scoreSettled = false;
  state.scoreResult = null;
  state.scoreError = '';
  state.pendingStatus = null;
  state.roundOutcome = null;
  state.timeLeft = null;
  state.feedback = '';
  state.game = createGame();
  render();
}

function revealMoreClues() {
  if (state.status !== 'PLAYING' || state.cluesRevealed >= CLUE_LIMIT) return;
  state.cluesRevealed += 1;
  state.game.npcs.forEach(npc => {
    npc.displayedClues = npc.allClues.slice(0, state.cluesRevealed);
  });
  state.selectedNpcId = null;
  state.feedback = '';

  if (state.cluesRevealed === CLUE_LIMIT) {
    state.timeLeft = 60;
    playSound('ClockTicking');
    state.timerId = setInterval(() => {
      if (state.status !== 'PLAYING') return;
      state.timeLeft -= 1;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        state.roundOutcome = 'FAILED';
        if (state.round < TOTAL_ROUNDS && state.attemptsLeft > 0) {
          state.status = 'ROUND_RESULT';
          stopClock();
          render();
        } else {
          finishGame('LOST');
        }
        playSound('FailedGame');
      } else {
        render();
      }
    }, 1000);
  }
  render();
}

async function submitFinalScore() {
  state.status = 'SAVING';
  state.scoreError = '';
  render();
  try {
    state.scoreResult = await store.submitScore('find-undercover', state.score);
    state.status = state.pendingStatus;
  } catch (error) {
    state.scoreError = error?.message || 'Could not save your score.';
    state.status = state.pendingStatus;
  }
  render();
}

function finishGame(status) {
  state.pendingStatus = status;
  state.status = 'SAVING';
  if (!state.scoreSettled) {
    state.score += state.attemptsLeft * 2;
    state.scoreSettled = true;
  }
  state.selectedNpcId = null;
  state.feedback = '';
  stopClock();
  setGameplayActive(false);
  submitFinalScore();
}

function nextRound() {
  if (state.status !== 'ROUND_RESULT' || state.round >= TOTAL_ROUNDS) return;
  state.round += 1;
  state.cluesRevealed = 1;
  state.timeLeft = null;
  state.game = createGame();
  state.status = 'PLAYING';
  state.roundOutcome = null;
  state.selectedNpcId = null;
  state.feedback = '';
  render();
}

function submitVote() {
  if (state.status !== 'PLAYING' || state.selectedNpcId === null) return;
  const npc = state.game.npcs.find(item => item.id === state.selectedNpcId);
  if (npc?.role === 'UNDERCOVER') {
    state.roundOutcome = 'FOUND';
    playSound('CorrectAnswer');
    if (state.round === TOTAL_ROUNDS) {
      state.score += 30;
      state.roundsWon += 1;
      finishGame('WON');
    } else {
      state.score += 30;
      state.roundsWon += 1;
      state.status = 'ROUND_RESULT';
      state.selectedNpcId = null;
      state.feedback = '';
      stopClock();
      render();
    }
    return;
  }

  state.attemptsLeft -= 1;
  state.selectedNpcId = null;
  if (state.attemptsLeft <= 0) {
    state.roundOutcome = 'FAILED';
    finishGame('LOST');
    playSound('FailedGame');
  } else {
    state.feedback = 'That is not the undercover. Try again!';
    playSound('WrongAnswer');
    render();
    clearTimeout(state.feedbackId);
    state.feedbackId = setTimeout(() => {
      state.feedback = '';
      render();
    }, 2000);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function renderIntro() {
  state.status = 'IDLE';
  state.game = createGame();
  render();
}

function render() {
  if (!state.game) {
    app.innerHTML = `<div class="top-bar"><h1>Find the Undercover</h1></div><p class="loading-msg">Loading game...</p>`;
    return;
  }

  const finalResult = state.status === 'WON' || state.status === 'LOST';
  const settled = finalResult || state.status === 'SAVING' || state.status === 'ROUND_RESULT';
  const npcCards = state.game.npcs.map(npc => `
    <article class="npc-card ${state.selectedNpcId === npc.id ? 'active' : ''}" data-npc-id="${npc.id}" role="button" tabindex="0" aria-pressed="${state.selectedNpcId === npc.id}">
      <div class="npc-word">${settled ? escapeHtml(npc.word) : '<span aria-label="Word hidden">？？？</span>'}</div>
      <img class="npc-image" src="${npc.image}" alt="NPC ${npc.id}" />
      <ul>${npc.displayedClues.map((clue, index) => `<li><strong>Clue ${index + 1}:</strong> ${escapeHtml(clue)}</li>`).join('')}</ul>
    </article>`).join('');

  const showRoundResult = state.status === 'ROUND_RESULT' || finalResult || state.status === 'SAVING';
  const foundRound = state.roundOutcome === 'FOUND';
  const result = showRoundResult ? `
    <div class="round-result-backdrop">
      <section class="round-result-dialog" role="dialog" aria-modal="true" aria-labelledby="roundResultTitle" aria-live="assertive">
        <div class="mini-eyebrow">ROUND ${state.round} / ${TOTAL_ROUNDS} RESULT</div>
        <h2 id="roundResultTitle">${foundRound ? '🎉 You found the undercover!' : '💥 The undercover got away.'}</h2>
        <p class="round-result-words">Civilian: <strong>${escapeHtml(state.game.civilianWord)}</strong><br>Undercover: <strong>${escapeHtml(state.game.undercoverWord)}</strong></p>
        <div class="round-conclusion"><span>CONCLUSION</span><p>${escapeHtml(state.game.conclusion || 'No conclusion is available for this word pair.')}</p></div>
        ${finalResult || state.status === 'SAVING' ? `<div class="final-score"><span>FINAL SCORE</span><strong>${state.score}<small>PTS</small></strong></div>${state.status === 'SAVING' ? '<p class="leaderboard-message">Sending your score to the leaderboard…</p>' : state.scoreResult ? `<p class="leaderboard-message">Your best: ${state.scoreResult.best}</p><div class="score-actions"><button class="primary-button" data-action="play-again">Play Again</button></div>` : `<p class="error-msg">${escapeHtml(state.scoreError)} Your score has not been saved yet.</p><div class="score-actions"><button class="primary-button" data-action="play-again">Play Again</button></div>`}` : '<div class="score-actions"><button class="primary-button" data-action="next-round">Continue</button></div>'}
      </section>
    </div>` : '';
  const intro = state.status === 'IDLE' ? `
    <div class="game-intro-backdrop">
      <section class="game-intro-dialog" role="dialog" aria-modal="true" aria-labelledby="introTitle">
        <div class="section-kicker light">FIND THE UNDERCOVER</div>
        <h1 id="introTitle">How to play</h1>
        <p class="game-intro-copy">One person has a different word from the others. Read their clues and figure out who the undercover is.</p>
        <button class="primary-button" type="button" data-action="start-game">Start Game</button>
      </section>
    </div>` : '';

  app.innerHTML = `
    <div class="top-bar"><h1>Find the Undercover</h1></div>
    <header class="game-header">
      <span>Round: ${state.round} / ${TOTAL_ROUNDS}</span>
      <span>Attempts: ${state.attemptsLeft} / ${MAX_ATTEMPTS}</span>
      <span>Score: ${state.score}</span>
    </header>
    <section class="npc-grid">${npcCards}</section>
    ${state.feedback ? `<p class="vote-feedback" role="status">${escapeHtml(state.feedback)}</p>` : ''}
    ${state.status === 'PLAYING' ? `
      <div class="game-actions">
        <button class="primary-button" data-action="vote" ${state.selectedNpcId === null ? 'disabled' : ''}>Vote for Undercover</button>
        <button class="secondary-button" data-action="more-clues" ${state.cluesRevealed >= CLUE_LIMIT ? 'disabled' : ''}>${state.cluesRevealed >= CLUE_LIMIT ? 'All Clues Revealed' : 'More Clues'}</button>
      </div>
      ${state.cluesRevealed === CLUE_LIMIT && state.timeLeft !== null ? `<p class="countdown" role="timer">All clues revealed! Find the undercover in ${state.timeLeft}s</p>` : ''}
    ` : ''}
    ${result}
    ${intro}`;
}

app.addEventListener('click', event => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'start-game') startGame();
  if (action === 'vote') submitVote();
  if (action === 'more-clues') revealMoreClues();
  if (action === 'next-round') nextRound();
  if (action === 'play-again') startGame();

  const npcCard = event.target.closest('[data-npc-id]');
  if (npcCard && state.status === 'PLAYING') {
    state.selectedNpcId = Number(npcCard.dataset.npcId);
    state.feedback = '';
    render();
  }
});

app.addEventListener('keydown', event => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-npc-id]')) {
    event.preventDefault();
    event.target.click();
  }
});

async function initialize() {
  try {
    store = await initStore();
    initChrome(store);
    state.words = await loadWordBank();
    renderIntro();
  } catch (error) {
    console.error(error);
    if (!store) {
      app.innerHTML = `<div class="top-bar"><h1>Find the Undercover</h1></div><p class="error-msg">Could not connect to the Game Hub. Please reload the page.</p>`;
      toast(error.message || 'Could not initialize Game Hub.', 'error');
    } else {
      app.innerHTML = `<div class="top-bar"><h1>Find the Undercover</h1></div><p class="error-msg">Could not load word pairs from Firebase: ${escapeHtml(error.message || 'Unknown error')}</p>`;
      toast(error.message || 'Could not load the word bank from Firebase.', 'error');
    }
  }
}
initialize();
