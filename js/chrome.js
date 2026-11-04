/** Shared player navbar on pages that have no other game-store initializer. */
import { initStore } from "./store.js";
import { initChrome, toast } from "./ui.js";
try {
  const store = await initStore();
  initChrome(store);
} catch (error) {
  const widget = document.querySelector("#playerWidget");
  if (widget) widget.textContent = "Player connection unavailable";
  toast(error?.message || "Could not connect to Game Hub", "error");
}
