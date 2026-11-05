import { CONFIG } from "./config.js";
import { icon } from "./icons.js";
import { cleanName } from "./scoring-core.js";
import { markSessionActivity, clearSessionActivity } from "./store.js";
const $ = (sel) => document.querySelector(sel);
const hubHomeUrl = new URL("../index.html", import.meta.url).href;
const joinAfterSwitchKey = "sheridan-hub:join-after-switch";
let uiStore;
let idleTimer;
let gameplayActive = false;
let lastActivity = Date.now();
export function toast(message, type = "info") {
  const root = $("#toastRoot");
  if (!root) return;
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => el.remove(), 4800);
}
function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function renderWidget() {
  const widget = $("#playerWidget");
  if (!widget || !uiStore) return;
  const player = uiStore.player;
  if (!player) {
    widget.innerHTML = `<button class="header-join" id="joinButton" type="button">${icon("user", 17)} <span>Join to Play</span></button>`;
    widget.querySelector("button").addEventListener("click", () => openJoin());
  } else {
    const score = uiStore.currentTotal();
    widget.innerHTML = `<span class="header-score">${icon("trophy", 16)} <b>${score}</b> <span>PTS</span></span><button type="button" class="header-profile" id="profileButton" aria-label="Player menu">${icon("user", 16)} <b>${escapeHtml(player.displayName)}</b> <span class="profile-caret">⌄</span></button><button type="button" class="header-switch" id="switchPlayerButton" aria-label="Switch player">${icon("users", 16)} <span>Switch player</span></button>`;
    widget.querySelector("#profileButton").addEventListener("click", openProfile);
    widget.querySelector("#switchPlayerButton").addEventListener("click", () => switchCurrentPlayer());
  }
}
/** Safely switch identities without interrupting active games without confirmation. */
export async function switchCurrentPlayer() {
  if (!uiStore?.player) return false;
  if (gameplayActive && !window.confirm("Leave this unfinished challenge and switch players? Your saved scores will stay safe, but this attempt will not be saved.")) return false;
  const buttons = document.querySelectorAll("#switchPlayerButton, #switchUser");
  buttons.forEach((button) => { button.disabled = true; });
  try {
    await uiStore.switchPlayer();
    clearSessionActivity();
    gameplayActive = false;
    closeModal();
    if (document.body.classList.contains("game-page")) {
      sessionStorage.setItem(joinAfterSwitchKey, "1");
      window.location.assign(`${hubHomeUrl}#games`);
    } else {
      toast("Player switched. Previous scores are saved.", "success");
      openJoin();
    }
    return true;
  } catch (error) {
    toast(error?.message || "Could not switch players. Please try again.", "error");
    buttons.forEach((button) => { button.disabled = false; });
    return false;
  }
}
/** Show the join screen when a switch occurred inside a game. */
export function resumeJoinAfterSwitch() {
  if (sessionStorage.getItem(joinAfterSwitchKey) !== "1") return;
  sessionStorage.removeItem(joinAfterSwitchKey);
  openJoin();
}
export function setGameplayActive(value) {
  gameplayActive = Boolean(value);
  lastActivity = Date.now();
  markSessionActivity();
}
export function initChrome(store) {
  uiStore = store;
  const notice = $("#modeNotice");
  if (notice && store.mode === "demo") {
    notice.hidden = false;
    notice.textContent =
      "DEMO MODE — Scores are saved on this browser only. Connect Firebase to go live across computers.";
  }
  store.listenPlayer(renderWidget);
  store.listenBoard(renderWidget);
  window.addEventListener("hub-error", (e) =>
    toast(e.detail || "Connection error", "error"),
  );
  const handleActivity = () => {
    const now = Date.now();
    if (now - lastActivity > 20_000) markSessionActivity();
    lastActivity = now;
  };
  for (const event of ["pointerdown", "keydown", "touchstart"])
    document.addEventListener(event, handleActivity, { passive: true });
  clearInterval(idleTimer);
  idleTimer = setInterval(async () => {
    if (
      !gameplayActive &&
      store.player &&
      Date.now() - lastActivity >= CONFIG.inactivityMinutes * 60_000
    ) {
      lastActivity = Date.now();
      await store.switchPlayer();
      clearSessionActivity();
      toast("Session ended after inactivity. Your scores are saved.");
      if (document.body.classList.contains("game-page"))
        window.location.assign(`${hubHomeUrl}#games`);
    }
  }, 15_000);
}
function overlayFrame(title, body, foot = "") {
  const root = $("#modalRoot");
  root.innerHTML = `<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><button class="modal-close" aria-label="Close dialog" type="button">${icon("close", 20)}</button><div class="modal-brand">${icon("sparkle", 18)} SHERIDAN GAME HUB</div><h2 id="modalTitle">${title}</h2>${body}${foot}</div></div>`;
  root.querySelector(".modal-close").addEventListener("click", closeModal);
  root.querySelector(".modal-backdrop").addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-backdrop")) closeModal();
  });
  document.addEventListener("keydown", modalEscape);
  root.querySelector("input,button:not(.modal-close)")?.focus();
  return root;
}
function modalEscape(e) {
  if (e.key === "Escape") closeModal();
}
export function closeModal() {
  const root = $("#modalRoot");
  if (root) root.replaceChildren();
  document.removeEventListener("keydown", modalEscape);
}
function showError(form, error) {
  const node = form.querySelector(".form-error");
  node.textContent = error?.message || String(error);
  node.hidden = false;
}
function busy(button, isBusy) {
  button.disabled = isBusy;
  button.dataset.label ||= button.textContent;
  button.textContent = isBusy ? "Please wait…" : button.dataset.label;
}

export function openJoin({ onJoined = () => {}, context = "" } = {}) {
  if (!uiStore) return;

  let tab = "new";

  // Show this screen only when a nickname already exists.
  // Names do not automatically identify players.
  function showExistingName(name) {
    const safeName = escapeHtml(name);

    const root = overlayFrame(
      `Hey, ${safeName}! ✳`,
      `
      <p class="modal-intro">
        Looks like someone has joined with this nickname before.
        Was that you?
      </p>

      <div class="returning-highlight">
        <span class="returning-highlight-icon">
          ${icon("sparkle", 22)}
        </span>

        <div>
          <strong>Already played at another station?</strong>
          <p>
            Enter your 4-digit code to keep your scores
            and continue the adventure.
          </p>
        </div>
      </div>

      <form id="joinForm" novalidate>
        <label for="joinInput">
          YOUR 4-DIGIT PLAYER CODE
        </label>

        <input
          id="joinInput"
          name="entry"
          inputmode="numeric"
          pattern="[0-9]{4}"
          maxlength="4"
          autocomplete="off"
          placeholder="e.g. 4827"
          required
        >

        <p class="form-error" hidden></p>

        <button
          class="button button-primary full-width"
          type="submit"
        >
          Continue my adventure ${icon("arrow", 17)}
        </button>
      </form>

      <div class="returning-divider">
        <span>FORGOT YOUR CODE?</span>
      </div>

      <p class="fresh-note">
        No worries! You can still join the fun.
        Start fresh with a new code and earn points from zero.
      </p>

      <button
        class="button button-light full-width"
        id="freshStart"
        type="button"
      >
        Start a fresh challenge ${icon("arrow", 17)}
      </button>

      <p class="form-error" id="freshError" hidden></p>

      <button
        class="change-name"
        id="changeName"
        type="button"
      >
        Use a different name
      </button>

      <p class="modal-note">
        ${icon("info", 16)}
        <span>
          Names can be shared. Your 4-digit code is what
          connects you to your previous scores.
        </span>
      </p>
    `,
    );

    const input = root.querySelector("#joinInput");

    input.addEventListener("input", () => {
      input.value = input.value.replace(/\D/g, "").slice(0, 4);
    });

    // Continue using the existing player code.
    root
      .querySelector("#joinForm")
      .addEventListener("submit", async (event) => {
        event.preventDefault();

        const form = event.currentTarget;
        const button = form.querySelector('[type="submit"]');

        busy(button, true);

        try {
          const player = await uiStore.resumePlayer(input.value);

          closeModal();

          toast(`Welcome back, ${player.displayName}!`, "success");

          onJoined(player);
        } catch (error) {
          showError(form, error);
          busy(button, false);
        }
      });

    // Start a completely new player profile.
    root
      .querySelector("#freshStart")
      .addEventListener("click", async (event) => {
        const button = event.currentTarget;

        busy(button, true);

        try {
          const player = await uiStore.createPlayer(name);

          showCode(player, true, onJoined);
        } catch (error) {
          const message = root.querySelector("#freshError");

          message.textContent = error?.message || String(error);
          message.hidden = false;

          busy(button, false);
        }
      });

    // Let visitors change their nickname.
    root.querySelector("#changeName").addEventListener("click", () => {
      tab = "new";
      view(name);
    });
  }

  function view(prefill = "") {
    const root = overlayFrame(
      "Let’s get you playing.",
      `
      <p class="modal-intro">
        ${context ? escapeHtml(context) + " · " : ""}
        Enter a nickname to join, or use your code
        if you’ve played already.
      </p>

      <div class="join-tabs" role="tablist">
        <button
          class="join-tab ${tab === "new" ? "selected" : ""}"
          data-tab="new"
          type="button"
        >
          New player
        </button>

        <button
          class="join-tab ${tab === "return" ? "selected" : ""}"
          data-tab="return"
          type="button"
        >
          Returning player
        </button>
      </div>

      <form id="joinForm" novalidate>
        <label for="joinInput">
          ${
            tab === "new"
              ? "FIRST NAME OR NICKNAME"
              : "YOUR 4-DIGIT PLAYER CODE"
          }
        </label>

        <input
          id="joinInput"
          name="entry"
          ${
            tab === "return"
              ? 'inputmode="numeric" maxlength="4" pattern="[0-9]{4}"'
              : 'maxlength="24"'
          }
          autocomplete="off"
          placeholder="${tab === "new" ? "e.g. Alex" : "e.g. 4827"}"
          required
        >

        <p class="form-error" hidden></p>

        <button
          class="button button-primary full-width"
          type="submit"
        >
          ${tab === "new" ? "Continue" : "Continue playing"}
          ${icon("arrow", 17)}
        </button>
      </form>

      <div class="modal-note">
        ${icon("info", 16)}
        <span>
          Your nickname may appear on the public event
          leaderboard. Please do not use your full name.
        </span>
      </div>
    `,
    );

    // Allow visitors to use either original entry method.
    root.querySelectorAll("[data-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        tab = button.dataset.tab;
        view();
      });
    });

    const input = root.querySelector("#joinInput");

    if (tab === "new") {
      input.value = prefill;
    }

    if (tab === "return") {
      input.addEventListener("input", () => {
        input.value = input.value.replace(/\D/g, "").slice(0, 4);
      });
    }

    root
      .querySelector("#joinForm")
      .addEventListener("submit", async (event) => {
        event.preventDefault();

        const form = event.currentTarget;
        const button = form.querySelector('[type="submit"]');

        busy(button, true);

        try {
          // Existing returning-player tab remains supported.
          if (tab === "return") {
            const player = await uiStore.resumePlayer(input.value);

            closeModal();

            toast(`Welcome back, ${player.displayName}!`, "success");

            onJoined(player);
            return;
          }

          const name = cleanName(input.value);

          // Check existing nicknames before registration.
          const nameExists = await uiStore.hasExistingName(name);

          if (nameExists) {
            showExistingName(name);
            return;
          }

          // New nickname: register normally.
          const player = await uiStore.createPlayer(name);

          showCode(player, true, onJoined);
        } catch (error) {
          showError(form, error);
          busy(button, false);
        }
      });
  }

  view();
}

function showCode(player, newPlayer = false, onContinue = () => {}) {
  const root = overlayFrame(
    newPlayer ? "You’re in! ✳" : "Your player code",
    `<p class="modal-intro">${newPlayer ? `Welcome, <strong>${escapeHtml(player.displayName)}</strong>! Save these four digits so your points follow you across stations.` : "Use this code to play as you on another computer."}</p><div class="pin-card"><div class="pin-label">YOUR PLAYER CODE</div><strong class="pin-number">${escapeHtml(player.pin)}</strong><span>4 digits · No password needed</span></div><p class="modal-note">${icon("shield", 16)} <span>Keep your code to yourself. Anyone who knows it could access your event score.</span></p><button class="button button-primary full-width" id="finishJoin">${newPlayer ? "Got it, let’s play" : "Back to games"} ${icon("arrow", 17)}</button>`,
  );
  root.querySelector("#finishJoin").addEventListener("click", () => {
    closeModal();
    if (newPlayer) onContinue(player);
  });
}
export function openProfile() {
  if (!uiStore?.player) return openJoin();
  const player = uiStore.player;
  const root = overlayFrame(
    "Your player card",
    `<div class="profile-modal-summary"><div class="profile-avatar">${escapeHtml(player.displayName.slice(0, 1).toUpperCase())}</div><div><strong>${escapeHtml(player.displayName)}</strong><span>${uiStore.currentTotal()} Sheridan Points</span></div></div><div class="player-menu-actions"><button type="button" class="menu-action" id="viewCode">${icon("lock")} <span>Show my player code</span> ${icon("chevron", 16)}</button><button type="button" class="menu-action" id="switchUser">${icon("users")} <span>Finish &amp; switch player</span> ${icon("chevron", 16)}</button></div>`,
  );
  root
    .querySelector("#viewCode")
    .addEventListener("click", () => showCode(player));
  root.querySelector("#switchUser").addEventListener("click", () => switchCurrentPlayer());
}
export function navigateToGame(game) {
  if (uiStore.player) {
    window.location.href = game.href;
    return;
  }
  openJoin({
    context: game.title,
    onJoined: () => (window.location.href = game.href),
  });
}
export function requirePlayer(context) {
  return new Promise((resolve) => {
    if (uiStore?.player) return resolve(uiStore.player);
    openJoin({ context, onJoined: resolve });
  });
}
