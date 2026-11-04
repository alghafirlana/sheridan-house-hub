/** Regenerate Firestore's allowed game IDs from the ONE scoring-level config.
 * Command: node scripts/sync-firestore-rules.mjs
 * Then copy/publish firestore.rules in Firebase Console (GitHub does not do it).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { SCORED_LEVEL_COUNTS, GAMES } from "../js/config.js";
const file = fileURLToPath(new URL("../firestore.rules", import.meta.url));
const source = readFileSync(file, "utf8");
const start = "// BEGIN GENERATED SCORE GAME IDS (edit js/config.js, not this block)";
const end = "// END GENERATED SCORE GAME IDS";
const standalone = GAMES.filter(g => g.status === "playable" && g.competitive && !Object.hasOwn(SCORED_LEVEL_COUNTS, g.id)).map(g => g.id);
const ids = [...standalone, ...Object.entries(SCORED_LEVEL_COUNTS).flatMap(([gameId, count]) => {
  if (!Number.isInteger(count) || count < 1 || count > 99) throw Error(`Invalid scored level count for ${gameId}`);
  return Array.from({length:count},(_,i)=>`${gameId}-level-${i+1}`);
})];
const block = `${start}\n          && request.resource.data.gameId in [${ids.map(id=>`'${id}'`).join(', ')}]\n          ${end}`;
const rx = new RegExp(`(?:${start.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})[\\s\\S]*?(?:${end.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`);
let updated;
if (source.includes(start) && source.includes(end)) updated=source.replace(rx,block);
else {
  const line = /^.*&& request\.resource\.data\.gameId in \[[^\n]*\].*$/m;
  if (!line.test(source)) throw Error("Expected original score game ID rule not found.");
  updated=source.replace(line,block);
}
if (!updated.includes(block)) throw Error('Could not update Firestore rule block.');
// Guard against a second, manually added `gameId in [...]` condition:
// two ANDed lists would silently reject games excluded from either one.
const checks = updated.match(/request\.resource\.data\.gameId\s+in\s+\[/g) ?? [];
if (checks.length !== 1) throw Error(`Expected exactly one game ID allowlist; found ${checks.length}. Remove extra manual checks.`);
if (source!==updated) writeFileSync(file,updated);
console.log(`Firestore rules synchronized: ${ids.length} game score IDs (${ids.join(', ')})`);
