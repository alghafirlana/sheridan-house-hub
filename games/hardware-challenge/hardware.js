import { CONFIG } from "../../js/config.js";
import { initStore } from "../../js/store.js";
import {
  initChrome,
  requirePlayer,
  setGameplayActive,
  toast,
} from "../../js/ui.js";
import { scoredLevelIds, submitLevelResult } from "../../js/scoring-core.js";
import {
  HARDWARE_LEVELS,
  activeHardware,
  getHardwareLevel,
} from "./hardware-data.js";
import {
  chooseQuestions,
  chooseQuickLevel,
  roundScore,
  validHotspots,
  fittedPhotoGeometry,
  recoverHardwareRound,
} from "./hardware-logic.js";

const GAME_ID = "hardware-challenge";
const app = document.querySelector("#hardwareApp");
const debug = new URLSearchParams(location.search).get("debug") === "hotspots";
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );
const savedKey = (type) =>
  `hardware:${type}:${CONFIG.eventId}:${store.player?.id ?? "guest"}`;
const readLocal = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const writeLocal = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage can be disabled */
  }
};
let store;
let round = null;
let busy = false;
let zoom = 1;
let panX = 0;
let panY = 0;
let cleanupViewer = () => {};
let rotationOverride = null; // null uses the level's preferred desktop orientation

// VS Code Live Server reloads the page whenever hardware-data.js changes.
// Preserve an unfinished round in this tab so development edits don't
// unexpectedly return the player to the Hardware Challenge homepage.
const roundStorageKey = (playerId = store?.player?.id) =>
  `hardware:unfinished-round:v1:${CONFIG.eventId}:${playerId ?? "guest"}`;
function clearSavedRound() {
  try {
    if (round?.playerId)
      sessionStorage.removeItem(roundStorageKey(round.playerId));
  } catch {
    /* storage can be disabled */
  }
}
function persistRound() {
  if (!round || round.finished) return;
  try {
    sessionStorage.setItem(
      roundStorageKey(round.playerId),
      JSON.stringify({
        version: 1,
        playerId: round.playerId,
        levelId: round.level.id,
        mode: round.mode,
        questionIds: round.questions.map((q) => q.id),
        questionPrompts: round.questions.map((q) => q.question),
        step: round.step,
        tries: round.tries,
        earned: round.earned,
        feedback: round.feedback,
        saveError: round.saveError,
        zoom,
        panX,
        panY,
        rotationOverride,
        expanded: Boolean(
          app.querySelector("#photoCard")?.classList.contains("is-expanded"),
        ),
      }),
    );
  } catch {
    /* storage can be disabled */
  }
}
function restoreRound() {
  if (!store.player?.id) return false;
  let saved;
  try {
    saved = JSON.parse(sessionStorage.getItem(roundStorageKey()));
  } catch {
    return false;
  }
  const level = getHardwareLevel(saved?.levelId);
  if (!level?.enabled || !validHotspots(level)) return false;
  const recovered = recoverHardwareRound(saved, level, store.player.id);
  if (!recovered) return false;
  round = recovered;
  zoom = Number.isFinite(saved.zoom)
    ? Math.min(3, Math.max(1, saved.zoom))
    : (level.defaultZoom ?? 1);
  panX = Number.isFinite(saved.panX) ? saved.panX : 0;
  panY = Number.isFinite(saved.panY) ? saved.panY : 0;
  rotationOverride = [0, 90, 180, 270].includes(saved.rotationOverride)
    ? saved.rotationOverride
    : null;
  setGameplayActive(true);
  showQuestion();
  if (saved.expanded) app.querySelector("#expandImage")?.click();
  return true;
}

const scored = () => new Set(scoredLevelIds(GAME_ID));
const playable = () =>
  activeHardware().filter((h) => scored().has(h.id) && h.targets.length);
const scores = () => store.levelScoresFor(GAME_ID);
const hubPoints = () =>
  store.board.find((p) => p.id === store.player?.id)?.best?.[GAME_ID] ?? 0;
const hasScore = (id) => Object.hasOwn(scores(), String(id));
const allScoresCount = () =>
  scoredLevelIds(GAME_ID).filter((id) => hasScore(id)).length;

function header(title, sub, nav = "") {
  // The game hub link remains in the site header. One clearly named back
  // action is sufficient here; the level screen also has its own exit link.
  const back =
    nav === "library"
      ? `<button class="hc-back hc-back-home" type="button" id="hardwareHomeBtn">← Hardware Challenge home</button>`
      : nav === "home"
        ? `<button class="hc-back hc-back-home" type="button" id="backBtn">← Hardware Challenge home</button>`
        : "";
  return `<div class="hc-topline"><div class="hc-crumb">GAME HUB <span>/</span> HARDWARE CHALLENGE</div><div class="hc-nav-actions">${back}</div></div><div class="hc-page-head"><div><div class="hc-eyebrow">✳ LEARN • IDENTIFY • EARN POINTS</div><h1>${escape(title)}</h1><p>${escape(sub)}</p></div>${store.player ? `<div class="hc-score-chip"><span>HARDWARE POINTS</span><strong>${hubPoints()}<small> / 100</small></strong><em>${allScoresCount()} of ${scoredLevelIds(GAME_ID).length} levels played</em></div>` : ""}</div>`;
}
function leaveQuestionView() {
  cleanupViewer();
  cleanupViewer = () => {};
}
function wireBack(nav) {
  function allowLeave() {
    return (
      !round ||
      round.finished ||
      confirm("Exit this level? This unfinished round will not be saved.")
    );
  }
  const goHome = () => {
    if (!allowLeave()) return;
    clearSavedRound();
    round = null;
    setGameplayActive(false);
    showHome();
  };
  app.querySelector("#backBtn")?.addEventListener("click", goHome);
  app.querySelector("#hardwareHomeBtn")?.addEventListener("click", goHome);
}
function showHome() {
  clearSavedRound();
  leaveQuestionView();
  app.dataset.view = "home";
  round = null;
  setGameplayActive(false);
  const total = scoredLevelIds(GAME_ID).length;
  app.innerHTML = `${header("Hardware Challenge", "Explore real computer parts and illustrated hardware missions, then test your knowledge.")}
    <section class="hc-hero" aria-label="Choose a way to play"><div class="hc-hero-copy"><span class="hc-label">YOUR HARDWARE ADVENTURE</span><h2>Every component has a story. <em>Find it!</em></h2><p>Choose a piece of hardware or let us surprise you. Both modes earn Sheridan Points for the same levels.</p><div class="hc-hero-stats"><span>✓ Best level scores saved</span><span>✓ Maximum 100 points</span><span>✓ No time pressure</span></div></div><div class="hc-hero-orb" aria-hidden="true">⚙</div></section>
    <section class="hc-modes" aria-label="Game modes"><article class="hc-mode"><span class="hc-mode-icon">🧭</span><span class="hc-tag">CHOOSE YOUR LEVEL</span><h3>Explore Hardware</h3><p>Pick any hardware photo and find its components. Discover what each part does as you earn points.</p><button id="exploreBtn" class="hc-btn hc-btn-outline" type="button">Explore levels <span>→</span></button></article><article class="hc-mode hc-mode-primary"><span class="hc-mode-icon">⚡</span><span class="hc-tag">SURPRISE LEVEL</span><h3>Quick Challenge</h3><p>We'll choose a hardware level for you. Questions are randomized, and your best score still counts.</p><button id="quickBtn" class="hc-btn hc-btn-mint" type="button">Surprise me <span>→</span></button></article></section>
    <div class="hc-tip"><strong>How the leaderboard works</strong><p>Your score is the rounded average across ${total} scored levels (up to ${Math.round(100 / total)} points per level, with small rounding differences). Unplayed levels count as zero. Your best attempt on each level stays saved, so trying again never removes points.</p></div>`;
  app.querySelector("#exploreBtn").addEventListener("click", showLibrary);
  app.querySelector("#quickBtn").addEventListener("click", async () => {
    try {
      await requirePlayer("Hardware Challenge");
      const candidates = playable();
      const last = readLocal(savedKey("last-quick"), null);
      const level = chooseQuickLevel(candidates, scores(), last);
      if (!level)
        throw Error("There are no scored hardware levels available yet.");
      writeLocal(savedKey("last-quick"), level.id);
      startLevel(level, "quick");
    } catch (e) {
      toast(e.message, "error");
    }
  });
}
function showLibrary() {
  clearSavedRound();
  leaveQuestionView();
  app.dataset.view = "library";
  round = null;
  setGameplayActive(false);
  const active = activeHardware();
  app.innerHTML = `${header("Explore the hardware", `Choose from ${active.length} hardware missions. Levels in the current scoring roster earn Sheridan Points; additional missions are free practice.`, "home")}
    <section class="hc-library-head"><h2>Choose a hardware level</h2><span>${active.length} hardware missions</span></section>
    <section class="hc-level-grid">${active
      .map((level) => {
        const eligible = scored().has(level.id);
        const best = scores()[level.id];
        return `<article class="hc-level-card"><div class="hc-level-image"><img src="${escape(level.thumbnail || level.image)}" alt="${escape(level.subtitle)}" loading="lazy"/><span class="hc-level-number">LEVEL ${level.id}</span></div><div class="hc-level-body"><div class="hc-level-tags"><span>${eligible ? "SCORED LEVEL" : "DIGITAL PRACTICE"}</span><span>${typeof best === "number" ? "✓ COMPLETED" : "NOT PLAYED"}</span></div><h3>${escape(level.title)}</h3><p>${escape(level.description)}</p><div class="hc-level-foot"><div><small>BEST SCORE</small><strong>${typeof best === "number" ? `${best} / 100` : "—"}</strong></div><button data-level="${level.id}" class="hc-btn hc-btn-dark" type="button" >${!eligible ? "Practice level" : typeof best === "number" ? "Play again" : "Play level"} →</button></div></div></article>`;
      })
      .join(
        "",
      )}</section><p class="hc-footnote">You can add more hardware later. Only levels activated in this event’s scoring configuration contribute to the leaderboard.</p>`;
  wireBack("home");
  app.querySelectorAll("button[data-level]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      try {
        await requirePlayer("Hardware Challenge");
        startLevel(getHardwareLevel(btn.dataset.level), "explore");
      } catch (e) {
        toast(e.message, "error");
      }
    }),
  );
}
function startLevel(level, mode) {
  if (!level?.enabled || !validHotspots(level))
    return toast("This level needs its image or hotspots checked.", "error");
  const recent = readLocal(savedKey(`recent-${level.id}`), []);
  const questions = chooseQuestions(level, recent);
  if (!questions.length)
    return toast("No questions are available for this hardware yet.", "error");
  round = {
    playerId: store.player?.id,
    level,
    mode,
    questions,
    step: 0,
    tries: 0,
    earned: 0,
    finished: false,
    feedback: null,
    saveError: null,
  };
  zoom = level.defaultZoom ?? 1;
  panX = 0;
  panY = 0;
  rotationOverride = null;
  setGameplayActive(true);
  showQuestion();
}
function questionSvg(level, activeQuestion, reveal) {
  const polygons = level.targets
    .flatMap((t, index) =>
      t.regions.map((region, regionIndex) => {
        const pts = region.map(([x, y]) => `${x},${y}`).join(" ");
        const state =
          t.id === activeQuestion.id && reveal
            ? `hc-target-answer ${round.feedback?.correct ? "hc-target-correct" : ""}`
            : "";
        const debugLabel = debug ? `data-title="${escape(t.label)}"` : "";
        return `<polygon data-target="${escape(t.id)}" ${debugLabel} class="hc-hit ${state}" points="${pts}" tabindex="0" role="button" aria-label="Select hardware region ${index + 1}${t.regions.length > 1 ? `, section ${regionIndex + 1}` : ""}" />`;
      }),
    )
    .join("");
  // A single shared contain geometry for the photo AND overlay is essential:
  // xMidYMid meet matches img { object-fit: contain } at every viewport size.
  return `<svg class="hc-overlay ${debug ? "hc-debug" : ""}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${level.width} ${level.height}" preserveAspectRatio="xMidYMid meet" role="group" aria-label="Tap a hardware region, or use Tab and Enter to select a region">${polygons}</svg>`;
}
function showQuestion() {
  // Remember if the player opened the expanded viewer.
  const wasExpanded =
    app.querySelector("#photoCard")?.classList.contains("is-expanded") ?? false;
  leaveQuestionView();
  app.dataset.view = "play";
  const { level, mode, questions, step, tries, feedback } = round;
  const q = questions[step];
  const resolved = Boolean(feedback?.finished);
  const pct = Math.round(
    (100 * (step + (resolved ? 1 : 0))) / questions.length,
  );
  const saveMsg = `Your ${roundScore(round.earned, 10 * questions.length)}/100 level result has NOT been saved to the leaderboard. Please check your connection and try again.${round.saveError ? ` Details: ${escape(round.saveError)}` : ""}`;
  app.innerHTML = `${header(level.title, mode === "quick" ? "Quick Challenge · randomized hardware mission" : "Explore Hardware · learn as you play", "library")}
    <section class="hc-play-grid"><div class="hc-visual" id="photoCard"><div class="hc-visual-top"><div><span class="hc-small-label">HARDWARE IMAGE</span><strong>${escape(level.subtitle)}</strong></div><div class="hc-zoom-tools" aria-label="Image zoom controls"><button type="button" id="zoomOut" aria-label="Zoom out" title="Zoom out">−</button><output id="zoomLabel" aria-live="off">${zoom === 1 ? "Fit" : "Zoom"} ${Math.round(zoom * 100)}%</output><button type="button" id="zoomIn" aria-label="Zoom in" title="Zoom in">+</button><button type="button" id="zoomFit" class="hc-zoom-fit" aria-label="Fit entire image" title="Fit entire image">Fit</button><button type="button" id="rotateImage" class="hc-rotate-image" aria-label="Rotate hardware photo 90 degrees" title="Rotate photo 90° clockwise">↻</button><button type="button" id="expandImage" class="hc-expand-image" aria-label="Expand photo viewer" title="Expand photo viewer">⛶</button></div></div>
      <div class="hc-mobile-prompt"><div class="hc-mobile-prompt-meta"><span>QUESTION ${step + 1} OF ${questions.length}</span><span class="hc-mobile-points">${roundScore(round.earned, 10 * questions.length)} / 100 POINTS</span></div><strong>${escape(q.question)}</strong></div>
      <div class="hc-photo-viewport" id="imageViewport" tabindex="0" aria-label="Interactive hardware photo. Use plus and minus to zoom, and arrow keys to pan while zoomed."><div class="hc-photo-stage" id="photoStage"><img draggable="false" src="${escape(level.image)}" width="${level.width}" height="${level.height}" alt="${escape(level.subtitle)}"/>${questionSvg(level, q, resolved)}</div></div>
      <div class="hc-photo-tip"><span id="photoHint">Entire hardware visible · Zoom in to inspect smaller parts</span>${resolved ? `<button type="button" class="hc-photo-next" id="photoNext">${step + 1 === questions.length ? "Finish & save score" : "Next question"} →</button>` : ""}</div></div>
    <div class="hc-play-side"><div class="hc-question-bar"><span>QUESTION ${step + 1} / ${questions.length}</span><strong>${roundScore(round.earned, 10 * questions.length)} / 100</strong></div><div class="hc-progress"><span style="width:${pct}%"></span></div><span class="hc-label">FIND THE COMPONENT</span><h2>${escape(q.question)}</h2><p>${resolved ? "You can now see the correct location outlined on the photo." : tries === 1 ? "Not quite! Take another look. You have one more try." : "Look closely at the hardware illustration or photo. Tap the matching part."}</p><div class="hc-attempts"><span class="${tries >= 1 ? "used" : ""}">●</span><span class="${tries >= 2 ? "used" : ""}">●</span><small>${resolved ? "Question finished" : `${2 - tries} ${2 - tries === 1 ? "try" : "tries"} remaining`}</small></div>
      ${resolved ? `<div class="hc-feedback ${feedback.correct ? "hc-feedback-good" : "hc-feedback-neutral"}"><strong>${feedback.correct ? "✓ Nice work!" : "The answer is highlighted."} ${feedback.earned > 0 ? `+${feedback.earned} question points` : ""}</strong><p>${escape(q.fact)}</p></div><div id="saveError" class="hc-save-warning" role="alert" ${round.saveError ? "" : "hidden"}>${saveMsg}</div><button id="nextQuestion" type="button" class="hc-btn hc-btn-mint hc-wide">${step + 1 === questions.length ? (round.saveError ? "Retry saving score" : "Finish & save score") : "Next question"} →</button>` : `<div class="hc-prompt-note">No timer. Accuracy matters more than speed.<br/>Correct first try: 10 · Second try: 5</div>`}
      <button type="button" class="hc-quit" id="quitRound">← Exit to all hardware levels</button></div></section>`;
  wireBack("library");
  const viewport = app.querySelector("#imageViewport");
  const stage = app.querySelector("#photoStage");
  const photoCard = app.querySelector("#photoCard");
  const zoomLabel = app.querySelector("#zoomLabel");
  let pointer = null;

  // Rotating the entire stage keeps the bitmap and its original SVG polygons
  // pixel-aligned. No images or coordinate data are modified.
  const rotationForView = () => {
    const defaultRotation =
      viewport.clientWidth < 540 ? 0 : Number(level.displayRotation) || 0;
    return (((rotationOverride ?? defaultRotation) % 360) + 360) % 360;
  };
  function refreshView() {
    const rotation = rotationForView();
    const { width, height, fitWidth, fitHeight } = fittedPhotoGeometry(
      level.width,
      level.height,
      viewport.clientWidth,
      viewport.clientHeight,
      rotation,
    );
    if (!width || !height) return;
    stage.style.width = `${width}px`;
    stage.style.height = `${height}px`;
    const limitX = Math.max(0, (fitWidth * zoom - viewport.clientWidth) / 2);
    const limitY = Math.max(0, (fitHeight * zoom - viewport.clientHeight) / 2);
    panX = Math.max(-limitX, Math.min(limitX, panX));
    panY = Math.max(-limitY, Math.min(limitY, panY));
    // Transform the shared image+overlay stage together. The default view is
    // always fully contained; zoomed panning is bounded in screen coordinates.
    stage.style.transform = `translate(-50%, -50%) translate(${panX}px, ${panY}px) scale(${zoom}) rotate(${rotation}deg)`;
    zoomLabel.value = `${zoom === 1 ? "Fit" : "Zoom"} ${Math.round(zoom * 100)}%`;
    app.querySelector("#zoomOut").disabled = zoom <= 1;
    app.querySelector("#zoomIn").disabled = zoom >= 3;
    app.querySelector("#zoomFit").disabled =
      zoom === 1 && panX === 0 && panY === 0;
    viewport.classList.toggle("is-zoomed", zoom > 1);
    const photoHint = app.querySelector("#photoHint");
    if (photoHint)
      photoHint.textContent =
        zoom > 1
          ? "Drag to pan · Fit returns to the full image · Tab + Enter selects a region"
          : "Entire hardware visible · Zoom in to inspect smaller parts";
  }
  function setZoom(value) {
    zoom = Math.min(3, Math.max(1, Math.round(value * 100) / 100));
    if (zoom === 1) {
      panX = 0;
      panY = 0;
    }
    refreshView();
    persistRound();
  }
  app
    .querySelector("#zoomIn")
    .addEventListener("click", () => setZoom(zoom + 0.5));
  app
    .querySelector("#zoomOut")
    .addEventListener("click", () => setZoom(zoom - 0.5));
  app.querySelector("#zoomFit").addEventListener("click", () => setZoom(1));
  app.querySelector("#rotateImage").addEventListener("click", () => {
    rotationOverride = (rotationForView() + 90) % 360;
    zoom = 1;
    panX = 0;
    panY = 0;
    refreshView();
    persistRound();
  });
  const expand = app.querySelector("#expandImage");
  function toggleExpand() {
    const isExpanded = photoCard.classList.toggle("is-expanded");
    document.body.classList.toggle("hc-viewer-open", isExpanded);
    expand.setAttribute(
      "aria-label",
      isExpanded ? "Close expanded viewer" : "Expand photo viewer",
    );
    expand.setAttribute(
      "title",
      isExpanded ? "Close expanded viewer" : "Expand photo viewer",
    );
    expand.textContent = isExpanded ? "✕" : "⛶";
    // The contain scaling is recomputed using the new viewport dimensions.
    requestAnimationFrame(refreshView);
    persistRound();
  }
  expand.addEventListener("click", toggleExpand);
  const onEsc = (e) => {
    if (e.key === "Escape" && photoCard.classList.contains("is-expanded"))
      toggleExpand();
  };
  window.addEventListener("keydown", onEsc);
  const resizeObserver =
    typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(refreshView)
      : null;
  resizeObserver?.observe(viewport);
  window.addEventListener("resize", refreshView);
  cleanupViewer = () => {
    resizeObserver?.disconnect();
    window.removeEventListener("resize", refreshView);
    window.removeEventListener("keydown", onEsc);
    document.body.classList.remove("hc-viewer-open");
  };

  // Pointer-based selection allows panning without accidentally answering.
  // No scroll bars at 100%. Touch page scrolling remains available until zoomed.
  viewport.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const target = e.target.closest("polygon[data-target]");
    pointer = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      startX: panX,
      startY: panY,
      target: target?.dataset.target ?? null,
      moved: false,
    };
    if (zoom > 1) viewport.setPointerCapture?.(e.pointerId);
  });
  viewport.addEventListener("pointermove", (e) => {
    if (!pointer || pointer.id !== e.pointerId || zoom <= 1) return;
    const dx = e.clientX - pointer.x,
      dy = e.clientY - pointer.y;
    if (Math.hypot(dx, dy) > 6) pointer.moved = true;
    if (pointer.moved) {
      panX = pointer.startX + dx;
      panY = pointer.startY + dy;
      refreshView();
    }
  });
  viewport.addEventListener("pointerup", (e) => {
    if (!pointer || pointer.id !== e.pointerId) return;
    const { target, moved } = pointer;
    pointer = null;
    if (!moved && target && !resolved) answer(target);
    else if (moved) persistRound();
  });
  viewport.addEventListener("pointercancel", () => {
    pointer = null;
  });
  viewport.addEventListener("keydown", (e) => {
    if (
      zoom <= 1 ||
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
    )
      return;
    e.preventDefault();
    const n = 45;
    if (e.key === "ArrowLeft") panX += n;
    if (e.key === "ArrowRight") panX -= n;
    if (e.key === "ArrowUp") panY += n;
    if (e.key === "ArrowDown") panY -= n;
    refreshView();
  });
  if (!resolved) {
    viewport.querySelector(".hc-overlay").addEventListener("keydown", (e) => {
      if (
        (e.key === "Enter" || e.key === " ") &&
        e.target.matches("polygon[data-target]")
      ) {
        e.preventDefault();
        answer(e.target.dataset.target);
      }
    });
  }
  app.querySelector("#nextQuestion")?.addEventListener("click", nextQuestion);
  app.querySelector("#photoNext")?.addEventListener("click", nextQuestion);
  app.querySelector("#quitRound").addEventListener("click", () => {
    if (!confirm("Leave this level? Your unfinished round will not be saved."))
      return;
    showLibrary();
  });
  refreshView();
  // Keep the viewer expanded after answering or moving to the next question.
  if (wasExpanded) {
    toggleExpand();
  } else {
    refreshView();
  }
  persistRound();
}
function answer(clicked) {
  if (!round || round.feedback?.finished || busy) return;
  round.tries++;
  const correct = clicked === round.questions[round.step].id;
  const finished = correct || round.tries >= 2;
  if (!finished) {
    showQuestion();
    return;
  }
  const earned = correct ? (round.tries === 1 ? 10 : 5) : 0;
  round.earned += earned;
  round.feedback = { correct, earned, finished: true };
  showQuestion();
}
async function nextQuestion() {
  if (!round || busy) return;
  if (round.step + 1 < round.questions.length) {
    round.step++;
    round.tries = 0;
    round.feedback = null;
    round.saveError = null;
    zoom = round.level.defaultZoom ?? 1;
    panX = 0;
    panY = 0;
    showQuestion();
    return;
  }
  busy = true;
  round.saveError = null;
  const saveButtons = [
    app.querySelector("#nextQuestion"),
    app.querySelector("#photoNext"),
  ].filter(Boolean);
  saveButtons.forEach((button) => {
    button.disabled = true;
    button.textContent = "Saving your score…";
  });
  const notice = app.querySelector("#saveError");
  if (notice) notice.hidden = true;
  const { level, questions, earned, mode } = round;
  const score = roundScore(earned, 10 * questions.length);
  try {
    if (!scored().has(level.id)) {
      const recentKey = savedKey(`recent-${level.id}`);
      const recent = readLocal(recentKey, []);
      writeLocal(
        recentKey,
        [...new Set([...questions.map((q) => q.id), ...recent])].slice(
          0,
          level.targets.length,
        ),
      );
      round.finished = true;
      clearSavedRound();
      setGameplayActive(false);
      showPracticeResult(level, mode, score);
      return;
    }
    const result = await submitLevelResult(store, GAME_ID, level.id, score);
    const recentKey = savedKey(`recent-${level.id}`);
    const recent = readLocal(recentKey, []);
    const latest = questions.map((q) => q.id);
    writeLocal(
      recentKey,
      [...new Set([...latest, ...recent])].slice(0, level.targets.length),
    );
    round.finished = true;
    clearSavedRound();
    setGameplayActive(false);
    showResult(level, mode, result);
  } catch (e) {
    round.saveError = e?.message || "Unknown error";
    const score = roundScore(round.earned, 10 * round.questions.length);
    const notice = app.querySelector("#saveError");
    if (notice) {
      notice.hidden = false;
      notice.textContent = `Your ${score}/100 level result has NOT been saved to the leaderboard. Please check your connection and retry. ${round.saveError}`;
    }
    toast("Score not saved. Please try again.", "error");
    saveButtons.forEach((button) => {
      button.disabled = false;
      button.textContent = "Retry saving score →";
    });
  } finally {
    busy = false;
  }
}
function showPracticeResult(level, mode, score) {
  clearSavedRound();
  leaveQuestionView();
  round = null;
  app.dataset.view = "result";
  app.innerHTML = `${header(`${level.title} complete!`, "Digital practice — your existing leaderboard score is unchanged.", "library")}
    <section class="hc-results">
      <div class="hc-results-icon" aria-hidden="true">🖥️</div>
      <span class="hc-label">DIGITAL PRACTICE • ${escape(level.title.toUpperCase())}</span>
      <h2>Great exploring!</h2>
      <p>You completed this optional learning mission. Practice rounds do not change your Sheridan Points or your leaderboard position.</p>
      <div class="hc-result-stats"><div><span>YOUR PRACTICE SCORE</span><strong>${score}<small>/100</small></strong></div><div><span>LEADERBOARD POINTS ADDED</span><strong class="mint">+0</strong></div><div><span>HARDWARE CHALLENGE TOTAL</span><strong>${hubPoints()}<small>/100</small></strong></div></div>
      <div class="hc-save">Practice complete — no Firebase score was submitted. <small>Additional missions can become scored in a future event by updating the central scoring-level count and publishing new Firestore rules.</small></div>
      <div class="hc-result-actions">
        <button class="hc-btn hc-btn-mint" id="anotherLevel" type="button">Explore another level →</button>
        <button class="hc-btn hc-btn-outline" id="replay" type="button">Replay this level</button>
        <button class="hc-btn hc-btn-dark" id="returnChallenge" type="button">← Back to Hardware Challenge</button>
      </div>
    </section>`;
  wireBack("library");
  app.querySelector("#anotherLevel").addEventListener("click", showLibrary);
  app
    .querySelector("#replay")
    .addEventListener("click", () => startLevel(level, mode));
  app.querySelector("#returnChallenge").addEventListener("click", showHome);
}
function showResult(level, mode, result) {
  clearSavedRound();
  leaveQuestionView();
  app.dataset.view = "result";
  const finished = result.levelsCompleted;
  const left = scoredLevelIds(GAME_ID).length - finished;
  const message =
    result.pointsAdded > 0
      ? `You just added ${result.pointsAdded} Sheridan ${result.pointsAdded === 1 ? "Point" : "Points"} to your Game Hub leaderboard score! ${left ? `Play ${left} more ${left === 1 ? "level" : "levels"} or improve your personal best to earn more.` : "You have played every level! Replay to improve your personal best."}`
      : `Your best score is safe, and no points were lost. ${left ? "Try another hardware level to build your leaderboard score." : "Replay a level to try for a higher score."}`;
  app.innerHTML = `${header("Level complete!", "Your hardware knowledge is growing. Here is how your result affects the shared leaderboard.", "library")}
    <section class="hc-results"><div class="hc-results-icon" aria-hidden="true">🏆</div><span class="hc-label">${escape(level.title.toUpperCase())}</span><h2>${result.personalBest ? "New personal best!" : "Great effort!"}</h2><p>${escape(message)}</p><div class="hc-result-stats"><div><span>THIS LEVEL</span><strong>${result.levelScore}<small>/100</small></strong></div><div><span>LEADERBOARD POINTS ADDED</span><strong class="mint">+${result.pointsAdded}</strong></div><div><span>HARDWARE CHALLENGE TOTAL</span><strong>${result.gamePoints}<small>/100</small></strong></div></div><div class="hc-save ${result.savedToLeaderboard ? "hc-save-live" : ""}">${result.savedToLeaderboard ? "✓ Score saved to the live leaderboard!" : "✓ Result saved in demo mode on this browser."}<small>${finished} of ${scoredLevelIds(GAME_ID).length} scored levels completed. Your highest level score is always protected.</small></div><div class="hc-result-actions"><button class="hc-btn hc-btn-mint" id="anotherLevel" type="button">Explore another level →</button><button class="hc-btn hc-btn-outline" id="replay" type="button">Replay this level</button><button class="hc-btn hc-btn-dark" id="againQuick" type="button">Surprise me again ⚡</button><button class="hc-btn hc-btn-outline" id="returnChallenge" type="button">← Back to Hardware Challenge</button></div><a class="hc-home-link" href="../../index.html#games">← Back to Sheridan Game Hub</a></section>`;
  wireBack("library");
  app.querySelector("#returnChallenge").addEventListener("click", showHome);
  app.querySelector("#anotherLevel").addEventListener("click", showLibrary);
  app
    .querySelector("#replay")
    .addEventListener("click", () => startLevel(level, mode));
  app.querySelector("#againQuick").addEventListener("click", () => {
    const next = chooseQuickLevel(playable(), scores(), level.id);
    if (next) {
      writeLocal(savedKey("last-quick"), next.id);
      startLevel(next, "quick");
    }
  });
}
async function main() {
  try {
    store = await initStore();
    await store.waitForScores();
    initChrome(store);
    // A shared store listener keeps the displayed points current while browsing.
    store.listenBoard(() => {
      if (!round && app.querySelector(".hc-score-chip")) {
        app.querySelector(".hc-score-chip strong").innerHTML =
          `${hubPoints()}<small> / 100</small>`;
        app.querySelector(".hc-score-chip em").textContent =
          `${allScoresCount()} of ${scoredLevelIds(GAME_ID).length} levels played`;
      }
    });
    // Restore the unfinished round before registering the listener.
    // Otherwise, the initial player callback clears the saved round.
    if (!restoreRound()) showHome();

    store.listenPlayer(() => {
      if (round && round.playerId !== store.player?.id) {
        clearSavedRound();
        round = null;
        showHome();
      } else if (!round) {
        showHome();
      }
    });
  } catch (e) {
    app.innerHTML = `<section class="hc-error"><h1>Could not load Hardware Challenge</h1><p>Please check the connection and try again. Your previous scores are safe.</p><a class="hc-btn hc-btn-dark" href="../../index.html">Back to Game Hub</a></section>`;
    console.error(e);
  }
}
main();
