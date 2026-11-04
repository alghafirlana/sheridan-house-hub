/**
 * Install Server Explorer WITHOUT replacing the user's manually tuned HC1-HC4
 * hotspot coordinates or other game files. Run from the repository root:
 *   node scripts/install-hc5.mjs
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const dataPath = resolve('games/hardware-challenge/hardware-data.js');
const gamePath = resolve('games/hardware-challenge/hardware.js');
const levelPath = resolve('games/hardware-challenge/hardware-server-level.js');
const imagePath = resolve('games/hardware-challenge/assets/hc5.png');
for(const file of [dataPath,gamePath,levelPath,imagePath]) if(!existsSync(file)) throw Error('Missing '+file+'; run this installer at the repository root after extracting the ZIP.');
const replaceOnce = (source, before, after, what) => {
  if(source.includes(after)) return source;
  if(!source.includes(before)) throw Error(`Cannot find ${what}; stopped without changing your project.`);
  return source.replace(before,after);
};
let data=readFileSync(dataPath,'utf8');
let game=readFileSync(gamePath,'utf8');
const importLine='import { SERVER_LEVEL } from "./hardware-server-level.js";';
if(!data.includes(importLine)) data=importLine+'\n'+data;
if(!data.includes('HARDWARE_LEVELS.push(SERVER_LEVEL)')){
  const before='export const activeHardware = () => HARDWARE_LEVELS.filter((h) => h.enabled);';
  data=replaceOnce(data,before,'// The optional digital-only Server Explorer level. Existing hotspots are unchanged.\nHARDWARE_LEVELS.push(SERVER_LEVEL);\n\n'+before,'activeHardware export');
}
game=replaceOnce(game,'!level?.enabled || !scored().has(level.id) || !validHotspots(level)','!level?.enabled || !validHotspots(level)','restoreRound guard');
game=replaceOnce(game,'"SCORED LEVEL" : "PREVIEW ONLY"','"SCORED LEVEL" : "DIGITAL PRACTICE"','library badge');
const oldButton='${eligible ? "" : \'disabled title="This level joins scoring at a future event"\'}>${!eligible ? "Next event" : typeof best === "number" ? "Play again" : "Play level"} →';
const newButton='>${!eligible ? "Practice level" : typeof best === "number" ? "Play again" : "Play level"} →';
game=replaceOnce(game,oldButton,newButton,'level button');
game=replaceOnce(game,'Pick any available photo mission. Play and replay levels to build your leaderboard score.','Choose a hardware photo. The first four levels earn leaderboard points; the new server level is digital practice until the next scoring event.','library introduction');
const previewStartGuard = '  if (!scored().has(level.id))\n    return toast(\n      "This is a preview level; activate it for a future event first.",\n      "error",\n    );\n';
if (game.includes(previewStartGuard)) game = game.replace(previewStartGuard, '');
const oldSave='    const result = await submitLevelResult(store, GAME_ID, level.id, score);';
const newSave=`    if (!scored().has(level.id)) {
      const recentKey = savedKey(\`recent-\${level.id}\`);
      const recent = readLocal(recentKey, []);
      writeLocal(recentKey, [...new Set([...questions.map(q => q.id), ...recent])].slice(0, level.targets.length));
      round.finished = true;
      clearSavedRound();
      setGameplayActive(false);
      showPracticeResult(level, mode, score);
      return;
    }
    const result = await submitLevelResult(store, GAME_ID, level.id, score);`;
game=replaceOnce(game,oldSave,newSave,'practice completion path');
const resultMarker='function showResult(level, mode, result) {';
const practiceResult=`function showPracticeResult(level, mode, score) {
  clearSavedRound();
  leaveQuestionView();
  round = null;
  app.dataset.view = "result";
  app.innerHTML = \`\${header("Server mission complete!", "Digital practice — your existing leaderboard score is unchanged.", "library")}
    <section class="hc-results">
      <div class="hc-results-icon" aria-hidden="true">🖥️</div>
      <span class="hc-label">DIGITAL PRACTICE • \${escape(level.title.toUpperCase())}</span>
      <h2>Great exploring!</h2>
      <p>You answered questions about the inside of a server. This optional level is for learning and does not change your Sheridan Points for the current event.</p>
      <div class="hc-result-stats"><div><span>YOUR PRACTICE SCORE</span><strong>\${score}<small>/100</small></strong></div><div><span>LEADERBOARD POINTS ADDED</span><strong class="mint">+0</strong></div><div><span>HARDWARE CHALLENGE TOTAL</span><strong>\${hubPoints()}<small>/100</small></strong></div></div>
      <div class="hc-save">Practice complete — no Firebase score was submitted. <small>This server mission can become scored at a future event by updating the central scoring-level count and publishing new Firestore rules.</small></div>
      <div class="hc-result-actions">
        <button class="hc-btn hc-btn-mint" id="anotherLevel" type="button">Explore another level →</button>
        <button class="hc-btn hc-btn-outline" id="replay" type="button">Replay this level</button>
        <button class="hc-btn hc-btn-dark" id="returnChallenge" type="button">← Back to Hardware Challenge</button>
      </div>
    </section>\`;
  wireBack("library");
  app.querySelector("#anotherLevel").addEventListener("click", showLibrary);
  app.querySelector("#replay").addEventListener("click", () => startLevel(level, mode));
  app.querySelector("#returnChallenge").addEventListener("click", showHome);
}
`;
if(!game.includes('function showPracticeResult(')) game=replaceOnce(game,resultMarker,practiceResult+resultMarker,'practice result function');
// Only save after every required edit was verified. Backups retain the exact
// user files and manually calibrated hotspots.
for(const file of [dataPath,gamePath]) copyFileSync(file,file+'.before-hc5.bak');
writeFileSync(dataPath,data);
writeFileSync(gamePath,game);
// Update only obsolete test assumptions that there can never be more than four
// hardware photos. Keep any user-added assertions in that test file intact.
const testPath=resolve('tests/hardware-challenge.test.mjs');
if(existsSync(testPath)) {
  let testSource=readFileSync(testPath,'utf8');
  let updated=testSource
    .replace("const expected=['hc2.png','hc4.png','hc3.png','hc1.png'];",
             "const expected=['hc2.png','hc4.png','hc3.png','hc1.png','hc5.png'];")
    .replace('assert.equal(level.width,1122);\n    assert.equal(level.height,1402);',
             'assert.equal(level.width,i === 4 ? 1448 : 1122);\n    assert.equal(level.height,i === 4 ? 1086 : 1402);')
    .replace('HARDWARE_LEVELS.map(level=>level.targets.length),[12,12,10,8]',
             'HARDWARE_LEVELS.map(level=>level.targets.length),[12,12,10,8,15]')
    .replace('HARDWARE_LEVELS.map(level=>level.questionsPerRound),[5,5,5,4]',
             'HARDWARE_LEVELS.map(level=>level.questionsPerRound),[5,5,5,4,6]');
  if(updated !== testSource) {
    copyFileSync(testPath,testPath+'.before-hc5.bak');
    writeFileSync(testPath,updated);
  }
}
console.log('Server Explorer installed. Existing HC1–HC4 hotspot coordinates and current 4-level score configuration were preserved.');
