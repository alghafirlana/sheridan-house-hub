import { initStore } from "./store.js";
import { icon } from "./icons.js";
import { initChrome, requirePlayer, setGameplayActive, toast } from "./ui.js";
const QUESTIONS = [
  {
    question: "Which component is often called the brain of a computer?",
    options: ["RAM", "CPU", "SSD", "Power supply"],
    answer: 1,
    note: "The CPU executes instructions and processes data.",
  },
  {
    question: "What does RAM primarily help a computer do?",
    options: [
      "Store files permanently",
      "Connect to Wi-Fi",
      "Temporarily hold active data",
      "Display images",
    ],
    answer: 2,
    note: "RAM temporarily holds data programs need while running.",
  },
  {
    question: "Which part is designed for long-term file storage?",
    options: ["SSD", "CPU cooler", "Motherboard", "Case fan"],
    answer: 0,
    note: "An SSD stores files even when the computer is off.",
  },
  {
    question: "What is a GPU especially good at processing?",
    options: [
      "Sound from a microphone",
      "Graphics and parallel calculations",
      "Keyboard clicks",
      "Battery charging",
    ],
    answer: 1,
    note: "GPUs accelerate graphics workloads and many parallel computations.",
  },
  {
    question: "Where do components like the CPU and RAM connect?",
    options: ["Monitor", "Router", "Mouse", "Motherboard"],
    answer: 3,
    note: "The motherboard connects and lets core components communicate.",
  },
];
let store,
  step = 0,
  correct = 0,
  chosen = null,
  selectedAnswers = [],
  saving = false;
const container = document.querySelector("#gameContent");
function showIntro() {
  container.innerHTML = `<div class="game-panel"><div class="mini-eyebrow">READY WHEN YOU ARE</div><h2>Think fast.<br>Stay curious.</h2><p>Answer five questions about the technology that powers everyday life. Each correct answer earns <strong>20 Sheridan Points</strong>.</p><div class="game-checklist"><span>${icon("check", 18)} 5 questions</span><span>${icon("check", 18)} No time pressure</span><span>${icon("check", 18)} Highest score counts</span></div><button id="startGame" class="button button-primary button-lg" type="button">Start challenge ${icon("arrow", 18)}</button></div>`;
  container.querySelector("#startGame").addEventListener("click", async () => {
    try {
      await requirePlayer("Tech Sprint");
      step = 0;
      correct = 0;
      chosen = null;
      selectedAnswers = [];
      setGameplayActive(true);
      showQuestion();
    } catch (error) {
      toast(error.message, "error");
    }
  });
}
function showQuestion() {
  chosen = null;
  const q = QUESTIONS[step],
    progress = Math.round((step / QUESTIONS.length) * 100);
  container.innerHTML = `<div class="question-panel"><div class="question-top"><span>QUESTION <strong>${String(step + 1).padStart(2, "0")} / 05</strong></span><span>${correct * 20} PTS EARNED</span></div><div class="progress-track"><div class="progress-bar" style="width:${progress}%"></div></div><h2>${q.question}</h2><p class="question-prompt">Choose the best answer.</p><div class="options-list">${q.options.map((o, i) => `<button class="option" data-answer="${i}" type="button"><span class="option-letter">${String.fromCharCode(65 + i)}</span><span>${o}</span><span class="option-indicator">○</span></button>`).join("")}</div><div class="feedback-zone" id="feedbackZone" aria-live="polite"></div><button type="button" class="button button-primary next-button" id="nextQuestion" disabled>${step === QUESTIONS.length - 1 ? "See results" : "Next question"} ${icon("arrow", 17)}</button></div>`;
  container
    .querySelectorAll("[data-answer]")
    .forEach((btn) =>
      btn.addEventListener("click", () => answer(Number(btn.dataset.answer))),
    );
  container.querySelector("#nextQuestion").addEventListener("click", () => {
    step++;
    if (step === QUESTIONS.length) complete();
    else showQuestion();
  });
}
function answer(index) {
  if (chosen !== null) return;
  chosen = index;
  const q = QUESTIONS[step];
  const right = index === q.answer;
  if (right) correct++;
  selectedAnswers.push(index);
  container.querySelectorAll("[data-answer]").forEach((btn) => {
    btn.disabled = true;
    const n = Number(btn.dataset.answer);
    if (n === q.answer) btn.classList.add("correct");
    else if (n === index) btn.classList.add("incorrect");
  });
  container.querySelector("#feedbackZone").innerHTML =
    `<div class="answer-feedback ${right ? "answer-right" : "answer-wrong"}"><strong>${right ? "✓ Correct! +20 points" : "Not quite — keep going!"}</strong><span>${q.note}</span></div>`;
  container.querySelector("#nextQuestion").disabled = false;
}
async function complete() {
  if (saving) return;
  saving = true;
  setGameplayActive(false);
  const points = correct * 20;
  container.innerHTML = `<div class="game-panel"><div class="mini-eyebrow">CHALLENGE COMPLETE</div><h2>Nice work!</h2><p>Saving your score to the shared leaderboard…</p><div class="spinner"></div></div>`;
  try {
    const result = await store.submitScore("tech-sprint", points);
    showResult(result);
  } catch (error) {
    container.innerHTML = `<div class="game-panel"><div class="mini-eyebrow">COULDN'T SAVE YOUR SCORE</div><h2>Let's try that again.</h2><p>Your answers are still here. Check your connection and retry so your points count.</p><p class="form-error visible-error" id="saveError"></p><button type="button" class="button button-primary" id="retrySave">Retry save ${icon("refresh", 17)}</button></div>`;
    container.querySelector("#saveError").textContent = error.message;
    container.querySelector("#retrySave").addEventListener("click", complete);
  } finally {
    saving = false;
  }
}
function showResult(result) {
  container.innerHTML = `<div class="game-panel result-panel"><div class="result-icon">${icon("trophy", 34)}</div><div class="mini-eyebrow">CHALLENGE COMPLETE</div><h2>${correct === 5 ? "Perfect score!" : correct >= 3 ? "Nicely done!" : "Keep exploring!"}</h2><p>You answered ${correct} of 5 questions correctly.</p><div class="result-stats"><div><span>THIS ROUND</span><strong>${result.points}<small>/100</small></strong></div><div><span>YOUR BEST</span><strong>${result.best}<small>/100</small></strong></div><div><span>POINTS GAINED</span><strong>+${result.gained}</strong></div></div><div class="result-actions"><button type="button" class="button button-primary" id="replay">Play again ${icon("refresh", 17)}</button><a class="button button-light" href="../../index.html">Back to Game Hub ${icon("arrow", 17)}</a></div></div>`;
  container.querySelector("#replay").addEventListener("click", () => {
    step = 0;
    correct = 0;
    chosen = null;
    showIntro();
  });
}
async function main() {
  try {
    store = await initStore();
    initChrome(store);
    showIntro();
  } catch (error) {
    container.textContent =
      "Could not connect. Check Firebase configuration and reload the page.";
    toast(error.message, "error");
  }
}
main();
