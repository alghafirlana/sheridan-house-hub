import { CONFIG, GAMES } from "./config.js";
import { icon } from "./icons.js";
import { initStore } from "./store.js";
import { initChrome, openJoin, navigateToGame, toast } from "./ui.js";
function card(game, index) {
  const playable = game.status === "playable";
  return `<article class="game-card accent-${game.accent} ${!playable ? "game-card-soon" : ""}" style="--card-order:${index}"><div class="card-top"><div class="card-icon">${icon(game.icon, 28)}</div><span class="card-status ${playable ? "card-live" : "card-soon"}">${playable ? "● PLAY NOW" : "COMING SOON"}</span></div><div class="card-art card-art-${game.icon}" aria-hidden="true"><div class="card-art-ring"></div><span>${icon(game.icon, 72)}</span><span class="card-spark-one">✦</span><span class="card-spark-two">✳</span></div><div class="card-info"><span class="card-category">${game.category}</span><h3>${game.title}</h3><p>${game.description}</p><div class="card-bottom"><span>${icon("clock", 15)} ${game.duration}</span>${playable ? `<button type="button" data-game="${game.id}" class="card-play" aria-label="Play ${game.title}">Play game ${icon("arrow", 18)}</button>` : `<span class="soon-label">In development ${icon("arrow", 17)}</span>`}</div></div></article>`;
}
async function main() {
  const grid = document.querySelector("#gamesGrid");
  grid.innerHTML = GAMES.map(card).join("");
  const count = GAMES.filter((g) => g.status === "playable").length;
  document.querySelector("#gameCount").textContent =
    `${count} playable · ${GAMES.length} experiences`;
  try {
    const store = await initStore();
    initChrome(store);
    grid.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-game]");
      if (!btn) return;
      const game = GAMES.find((g) => g.id === btn.dataset.game);
      if (game) navigateToGame(game);
    });
    document.querySelector("#heroJoin").addEventListener("click", () => {
      if (store.player) {
        document.querySelector("#games").scrollIntoView({ behavior: "smooth" });
      } else openJoin();
    });
  } catch (error) {
    grid
      .querySelectorAll("button[data-game]")
      .forEach((btn) => (btn.disabled = true));
    const widget = document.querySelector("#playerWidget");
    widget.textContent = "Connection unavailable";
    const notice = document.querySelector("#modeNotice");
    notice.hidden = false;
    notice.textContent =
      "Could not connect to Firebase. Check configuration and internet connection.";
    toast(error.message || "Could not initialize portal", "error");
  }
}
main();
