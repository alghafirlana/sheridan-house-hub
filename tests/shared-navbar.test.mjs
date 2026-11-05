import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read = (path) => readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
test('every Hub page references the same approved Sheridan brand and favicon',()=>{
  const pages=['index.html','leaderboard.html','games/tech-sprint/index.html','games/hardware-challenge/index.html','games/program-explorer/index.html','games/find-the-undercover/index.html','games/campus-quest/home.html','games/campus-quest/game/game.html'];
  for(const page of pages){
    const html=read(page);
    assert.match(html,/assets\/favicon\.png/,page);
    if(!page.includes('campus-quest')) assert.match(html,/class="brand-logo"/,page);
    else assert.match(read('games/campus-quest/js/hub-integration.js'),/class="brand-logo"/,page);
  }
  assert.ok(existsSync(new URL('../assets/favicon.png',import.meta.url)));
  assert.ok(existsSync(new URL('../assets/sheridan-logo.webp',import.meta.url)));
});
test('every playable experience has an initialized shared navbar, and profile switch is retained',()=>{
  const ui=read('js/ui.js');
  assert.match(ui,/id="switchPlayerButton"/);
  assert.match(ui,/id="switchUser"/);
  assert.match(ui,/export async function switchCurrentPlayer/);
  assert.match(ui,/gameplayActive && !window\.confirm/);
  assert.match(ui,/hubHomeUrl/);
  assert.match(read('js/portal.js'),/resumeJoinAfterSwitch\(\)/);
  assert.match(read('games/program-explorer/index.html'),/js\/chrome\.js/);
  assert.match(read('games/campus-quest/js/hub-integration.js'),/initChrome\(store\)/);
  assert.match(read('games/campus-quest/js/hub-integration.js'),/setHubGameplayActive\(gameplay\)/);
  for(const page of ['games/campus-quest/home.html','games/campus-quest/game/game.html']) {
    const html=read(page);
    for(const id of ['appHeader','modalRoot','toastRoot']) assert.match(html,new RegExp(`id="${id}"`));
  }
});
