import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SCORED_LEVEL_COUNTS, GAMES } from "../js/config.js";
import { scoredLevelIds, scoredGamePoints, scoreSummary, submitLevelResult, levelGameInfo } from "../js/scoring-core.js";
import { HARDWARE_LEVELS } from "../games/hardware-challenge/hardware-data.js";
import { chooseQuestions, chooseQuickLevel, roundScore, validHotspots, fittedPhotoGeometry, recoverHardwareRound } from "../games/hardware-challenge/hardware-logic.js";
import { initStore } from "../js/store.js";

class Storage { constructor(){this.map=new Map()} getItem(k){return this.map.get(k)??null} setItem(k,v){this.map.set(k,String(v))} removeItem(k){this.map.delete(k)} clear(){this.map.clear()} }
globalThis.localStorage=new Storage(); globalThis.sessionStorage=new Storage(); globalThis.window={addEventListener(){}};

test('one configured count per game; every scored level contributes equally',()=>{
  assert.deepEqual(scoredLevelIds('campus-quest'),[1,2,3,4,5]);
  assert.deepEqual(scoredLevelIds('hardware-challenge'),[1,2,3,4,5,6,7]);
  assert.equal(scoredGamePoints('hardware-challenge',{1:80,2:100,3:60}),34);
  assert.equal(scoredGamePoints('hardware-challenge',{1:100}),14);
  assert.equal(scoredGamePoints('campus-quest',{1:100}),20);
  assert.equal(scoredGamePoints('campus-quest',{1:100,2:80}),36);
  assert.equal(levelGameInfo('hardware-challenge-level-5').valid,true);
  assert.equal(levelGameInfo('hardware-challenge-level-6').valid,true);
  assert.equal(levelGameInfo('hardware-challenge-level-7').valid,true);
  assert.equal(levelGameInfo('hardware-challenge-level-8').valid,false);
  assert.equal(levelGameInfo('hardware-challenge-level-1').valid,true);
});

test('both multi-level games count as one each on the global leaderboard',()=>{
  const profiles=[{id:'p',displayName:'Player'}];
  const scores=[{playerId:'p',gameId:'campus-quest-level-1',points:90},{playerId:'p',gameId:'hardware-challenge-level-1',points:100},{playerId:'p',gameId:'hardware-challenge-level-2',points:70},{playerId:'p',gameId:'tech-sprint',points:60}];
  const [p]=scoreSummary(profiles,scores);
  assert.equal(p.best['campus-quest'],18);
  assert.equal(p.best['hardware-challenge'],24);
  assert.equal(p.best['tech-sprint'],60);
  assert.equal(p.total,102);
  assert.equal(p.games,3);
  const invalid=scoreSummary(profiles,[...scores,{playerId:'p',gameId:'hardware-challenge-level-99',points:100}]);
  assert.equal(invalid[0].total,102,'future levels must not affect the current event');
});

test('both modes share each level best attempt and never lower a leaderboard total',async()=>{
  localStorage.clear(); sessionStorage.clear();
  const store=await initStore({forceDemo:true});
  await store.createPlayer('HardwareTester');
  assert.rejects(()=>store.submitScore('hardware-challenge',100),/Submit a scored level/);
  const first=await submitLevelResult(store,'hardware-challenge',1,90);
  assert.deepEqual([first.levelScore,first.pointsAdded,first.gamePoints],[90,13,13]);
  const level2=await submitLevelResult(store,'hardware-challenge',2,80);
  assert.deepEqual([level2.pointsAdded,level2.gamePoints],[11,24]);
  const replay=await submitLevelResult(store,'hardware-challenge',1,50);
  assert.deepEqual([replay.bestScore,replay.pointsAdded,replay.gamePoints],[90,0,24]);
  const improve=await submitLevelResult(store,'hardware-challenge',1,100);
  assert.deepEqual([improve.bestScore,improve.pointsAdded,improve.gamePoints],[100,2,26]);
  assert.equal(store.currentTotal(),26);
  // Both new levels are eligible and preserve best attempts in shared scoring.
  const laptop=await submitLevelResult(store,'hardware-challenge',6,100);
  assert.deepEqual([laptop.levelScore,laptop.pointsAdded,laptop.gamePoints],[100,14,40]);
  const ports=await submitLevelResult(store,'hardware-challenge',7,70);
  assert.deepEqual([ports.levelScore,ports.pointsAdded,ports.gamePoints],[70,10,50]);
  const worseReplay=await submitLevelResult(store,'hardware-challenge',6,60);
  assert.deepEqual([worseReplay.bestScore,worseReplay.pointsAdded,worseReplay.gamePoints],[100,0,50]);
  assert.equal(store.currentTotal(),50);
  await store.switchPlayer();
  await assert.rejects(()=>store.submitScore('hardware-challenge-level-8',20),/not available/);
});

test('randomization is unique within round and prioritizes unseen questions',()=>{
  for(const level of HARDWARE_LEVELS){
    assert.equal(validHotspots(level),true,`geometry in ${level.title}`);
    const selected=chooseQuestions(level,[],()=>0.42);
    assert.equal(selected.length,Math.min(level.questionsPerRound,level.targets.length));
    assert.equal(new Set(selected.map(t=>t.id)).size,selected.length);
    if(level.targets.length>level.questionsPerRound){
      const seen=level.targets.slice(0,2).map(t=>t.id);
      const q=chooseQuestions(level,seen,()=>0.3);
      assert.equal(q.filter(x=>seen.includes(x.id)).length,0);
    }
  }
  const quick=chooseQuickLevel(HARDWARE_LEVELS,{1:95},null,()=>0);
  assert.notEqual(quick.id,1);
  assert.equal(roundScore(20,40),50);
  assert.equal(roundScore(35,40),88);
});

test('Firestore generated score IDs match the single configured counts',()=>{
  const rules=readFileSync(new URL('../firestore.rules',import.meta.url),'utf8');
  const block=rules.match(/&& request\.resource\.data\.gameId in \[([\s\S]*?)\]/)?.[1];
  assert.ok(block);
  const ids=[...block.matchAll(/'([^']+)'/g)].map(m=>m[1]);
  const expected=[...GAMES.filter(g=>g.status==='playable' && g.competitive && !Object.hasOwn(SCORED_LEVEL_COUNTS,g.id)).map(g=>g.id),...Object.entries(SCORED_LEVEL_COUNTS).flatMap(([game,n])=>Array.from({length:n},(_,i)=>`${game}-level-${i+1}`))];
  assert.deepEqual(ids,expected);
  assert.equal((rules.match(/request\.resource\.data\.gameId\s+in\s+\[/g)||[]).length,1,"a second ANDed allowlist would silently reject scores");
});


test('launch levels reference the exact approved HC images and image geometry',()=>{
  const expected=['hc2.png','hc4.png','hc3.png','hc1.png','hc5.png'];
  for(const [i,level] of HARDWARE_LEVELS.slice(0,5).entries()){
    assert.equal(level.image,`assets/${expected[i]}`);
    const data=readFileSync(new URL(`../games/hardware-challenge/${level.image}`,import.meta.url));
    assert.equal(data.toString('ascii',1,4),'PNG');
    assert.equal(data.readUInt32BE(16),level.width);
    assert.equal(data.readUInt32BE(20),level.height);
    assert.equal(level.width,i === 4 ? 1448 : 1122);
    assert.equal(level.height,i === 4 ? 1086 : 1402);
    assert.equal(validHotspots(level),true);
  }
  const [two,four,dell,wifi]=HARDWARE_LEVELS;
  assert.equal(two.targets.find(t=>t.id==='ram').regions.length,2);
  assert.equal(four.targets.find(t=>t.id==='ram').regions.length,4);
  assert.equal(dell.targets.find(t=>t.id==='ram').regions.length,4);
  assert.equal(wifi.targets.find(t=>t.id==='contacts').regions.length,3);
});

test('direct return to Hardware Challenge is available on the level and result views',()=>{
  const code=readFileSync(new URL('../games/hardware-challenge/hardware.js',import.meta.url),'utf8');
  assert.match(code,/id=\"hardwareHomeBtn\"/);
  assert.match(code,/id=\"returnChallenge\"/);
  assert.match(code,/if \(!allowLeave\(\)\) return/);
});

test('horizontal photo display uses the correct contain geometry and does not alter hotspots',()=>{
  const [two,four,dell,wifi]=HARDWARE_LEVELS;
  assert.deepEqual([two.displayRotation,four.displayRotation,dell.displayRotation,wifi.displayRotation],[90,90,90,0]);
  // Questions must stay correct whether the visitor rotates the photo or not.
  assert.ok(HARDWARE_LEVELS.every(level => level.targets.every(target =>
    !/\b(?:on the (?:left|right)|at the (?:top|bottom))\b/i.test(target.question))));
  const horizontal=fittedPhotoGeometry(1122,1402,620,455,90);
  const vertical=fittedPhotoGeometry(1122,1402,620,455,0);
  assert.ok(horizontal.fitWidth<=620.000001 && horizontal.fitHeight<=455.000001);
  assert.ok(vertical.fitWidth<=620.000001 && vertical.fitHeight<=455.000001);
  assert.ok(horizontal.fitWidth>vertical.fitWidth,'horizontal orientation should make larger use of the photo column');
  assert.ok(Math.abs(horizontal.fitWidth/horizontal.fitHeight-(1402/1122))<1e-9);
  const code=readFileSync(new URL('../games/hardware-challenge/hardware.js',import.meta.url),'utf8');
  assert.match(code,/stage\.style\.transform = `translate\(-50%, -50%\).*rotate\(\$\{rotation\}deg\)/);
  assert.match(code,/id="rotateImage"/);
  assert.match(code,/hc-mobile-prompt-meta/);
});


test('expanded hardware question bank has unique targets and randomized prompt variants',()=>{
  assert.deepEqual(HARDWARE_LEVELS.map(level=>level.targets.length),[12,12,10,8,15,11,8]);
  assert.deepEqual(HARDWARE_LEVELS.map(level=>level.questionsPerRound),[5,5,5,4,6,6,6]);
  for(const level of HARDWARE_LEVELS){
    assert.ok(validHotspots(level));
    assert.equal(new Set(level.targets.map(t=>t.id)).size,level.targets.length);
    for(const target of level.targets){
      assert.ok(target.questionVariants.length >= 2, `${level.id}/${target.id} should have more than one question`);
      assert.equal(new Set(target.questionVariants).size,target.questionVariants.length);
      assert.ok(target.questionVariants.every(p=>typeof p==='string' && p.length>10));
    }
  }
  const stub={questionsPerRound:1,targets:[{id:'a',question:'Prompt one',questionVariants:['Prompt one','Prompt two']}]};
  assert.equal(chooseQuestions(stub,[],()=>0.01)[0].question,'Prompt one');
  assert.equal(chooseQuestions(stub,[],()=>0.99)[0].question,'Prompt two');
  assert.equal(stub.targets[0].question,'Prompt one','question selection should not mutate source targets');
});

test('unfinished round survives a development-server reload without affecting Firebase scoring',()=>{
  const source=readFileSync(new URL('../games/hardware-challenge/hardware.js',import.meta.url),'utf8');
  assert.match(source,/function persistRound\(\)/);
  assert.match(source,/function restoreRound\(\)/);
  assert.match(source,/sessionStorage\.setItem\(\s*roundStorageKey/);
  assert.match(source,/sessionStorage\.removeItem\(roundStorageKey/);
  assert.match(source,/if \(!restoreRound\(\)\) showHome\(\)/);
  assert.match(source,/if \(saved\.expanded\) app\.querySelector\(\"#expandImage\"\)\?\.click\(\)/);
  assert.match(source,/round\.finished = true;\s+clearSavedRound\(\)/);
  assert.match(source,/round\.playerId !== store\.player\?\.id/);
});


test('restoring a round preserves question, progress and current player, rejecting stale data',()=>{
  const level=HARDWARE_LEVELS[0];
  const qs=chooseQuestions(level,[],()=>0.3);
  const saved={
    version:1,playerId:'player-A',levelId:1,mode:'explore',
    questionIds:qs.map(q=>q.id),questionPrompts:qs.map(q=>q.question),
    step:2,tries:1,earned:15,feedback:null,saveError:null,
  };
  const round=recoverHardwareRound(saved,level,'player-A');
  assert.ok(round);
  assert.equal(round.step,2);
  assert.equal(round.tries,1);
  assert.equal(round.questions.length,5);
  assert.deepEqual(round.questions.map(q=>q.question),qs.map(q=>q.question));
  assert.equal(round.finished,false);
  assert.equal(recoverHardwareRound(saved,level,'player-B'),null);
  assert.equal(recoverHardwareRound({...saved,questionIds:['missing']},level,'player-A'),null);
  assert.equal(recoverHardwareRound({...saved,earned:100},level,'player-A'),null);
  assert.equal(recoverHardwareRound({...saved,questionIds:[qs[0].id,qs[0].id]},level,'player-A'),null);
  assert.equal(recoverHardwareRound({...saved,step:42},level,'player-A'),null);
});
