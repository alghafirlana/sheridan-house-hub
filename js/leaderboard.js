import { CONFIG } from "./config.js";
import { initStore } from "./store.js";
import { toast } from "./ui.js";
function render(board) {
  document.querySelector("#statPlayers").textContent =
    board.length.toLocaleString();
  document.querySelector("#statCompletions").textContent = board
    .reduce((sum, p) => sum + p.games, 0)
    .toLocaleString();
  document.querySelector("#statTotal").textContent = board
    .reduce((sum, p) => sum + p.total, 0)
    .toLocaleString();
  const list = board.filter((p) => p.games > 0).slice(0, 15);
  const root = document.querySelector("#rankingRows");
  root.replaceChildren();
  if (!list.length) {
    const p = document.createElement("p");
    p.className = "board-empty";
    p.textContent = "No completed games yet. Be the first to score!";
    root.appendChild(p);
    return;
  }
  for (const [index, player] of list.entries()) {
    const row = document.createElement("div");
    row.className = `ranking-row ${index < 3 ? "ranking-top ranking-top-" + index : ""}`;
    const rank = document.createElement("div");
    rank.className = "rank-number";
    rank.textContent = String(index + 1).padStart(2, "0");
    const name = document.createElement("div");
    name.className = "rank-player";
    const avatar = document.createElement("span");
    avatar.className = "rank-avatar";
    avatar.textContent = player.name[0]?.toUpperCase() || "?";
    const label = document.createElement("strong");
    label.textContent = player.name;
    name.append(avatar, label);
    const games = document.createElement("span");
    games.className = "rank-games";
    games.textContent = String(player.games).padStart(2, "0");
    const points = document.createElement("strong");
    points.className = "rank-score";
    points.textContent = player.total.toLocaleString();
    row.append(rank, name, games, points);
    root.appendChild(row);
  }
}
async function main() {
  document.querySelector("#eventCaption").textContent = `${CONFIG.eventName}`;
  document.querySelector("#fullscreenButton").addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  });
  try {
    const store = await initStore({ fullBoard: true });
    if (store.mode === "demo") {
      const notice = document.querySelector("#modeNotice");
      notice.hidden = false;
      notice.textContent =
        "DEMO MODE — Same-browser only. Connect Firebase for live updates on multiple computers.";
    }
    store.listenBoard(render);
    window.addEventListener("hub-error", (e) => toast(e.detail, "error"));
  } catch (error) {
    const notice = document.querySelector("#modeNotice");
    notice.hidden = false;
    notice.textContent = `Leaderboard disconnected: ${error.message}`;
  }
}
main();
