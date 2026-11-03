import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SCORED_LEVEL_COUNTS } from "../js/config.js";
import { scoredLevelIds, scoredGamePoints, scoreSummary, submitLevelResult, levelGameInfo } from "../js/scoring-core.js";
import { HARDWARE_LEVELS } from "../games/hardware-challenge/hardware-data.js";
import { chooseQuestions, chooseQuickLevel, roundScore, validHotspots } from "../games/hardware-challenge/hardware-logic.js";
import { initStore } from "../js/store.js";

class Storage { constructor(){this.map=new Map()} getItem(k){return this.map.get(k)??null} setItem(k,v){this.map.set(k,String(v))} removeItem(k){this.map.delete(k)} clear(){this.map.clear()} }
globalThis.localStorage=new Storage(); globalThis.sessionStorage=new Storage(); globalThis.window={addEventListener(){}};

test('one configured count per game; every scored level contributes equally',()=>{
  assert.deepEqual(scoredLevelIds('campus-quest'),[1,2]);
  assert.deepEqual(scoredLevelIds('hardware-challenge'),[1,2,3,4]);
  assert.equal(scoredGamePoints('hardware-challenge',{1:80,2:100,3:60}),60);
  assert.equal(scoredGamePoints('hardware-challenge',{1:100}),25);
  assert.equal(scoredGamePoints('campus-quest',{1:100}),50);
  assert.equal(scoredGamePoints('campus-quest',{1:100,2:80}),90);
  assert.equal(levelGameInfo('hardware-challenge-level-5').valid,false);
  assert.equal(levelGameInfo('hardware-challenge-level-1').valid,true);
});

test('both multi-level games count as one each on the global leaderboard',()=>{
  const profiles=[{id:'p',displayName:'Player'}];
  const scores=[{playerId:'p',gameId:'campus-quest-level-1',points:90},{playerId:'p',gameId:'hardware-challenge-level-1',points:100},{playerId:'p',gameId:'hardware-challenge-level-2',points:70},{playerId:'p',gameId:'tech-sprint',points:60}];
  const [p]=scoreSummary(profiles,scores);
  assert.equal(p.best['campus-quest'],45);
  assert.equal(p.best['hardware-challenge'],43);
  assert.equal(p.best['tech-sprint'],60);
  assert.equal(p.total,148);
  assert.equal(p.games,3);
  const invalid=scoreSummary(profiles,[...scores,{playerId:'p',gameId:'hardware-challenge-level-99',points:100}]);
  assert.equal(invalid[0].total,148,'future levels must not affect the current event');
});

test('both modes share each level best attempt and never lower a leaderboard total',async()=>{
  localStorage.clear(); sessionStorage.clear();
  const store=await initStore({forceDemo:true});
  await store.createPlayer('HardwareTester');
  assert.rejects(()=>store.submitScore('hardware-challenge',100),/Submit a scored level/);
  const first=await submitLevelResult(store,'hardware-challenge',1,90);
  assert.deepEqual([first.levelScore,first.pointsAdded,first.gamePoints],[90,23,23]);
  const level2=await submitLevelResult(store,'hardware-challenge',2,80);
  assert.deepEqual([level2.pointsAdded,level2.gamePoints],[20,43]);
  const replay=await submitLevelResult(store,'hardware-challenge',1,50);
  assert.deepEqual([replay.bestScore,replay.pointsAdded,replay.gamePoints],[90,0,43]);
  const improve=await submitLevelResult(store,'hardware-challenge',1,100);
  assert.deepEqual([improve.bestScore,improve.pointsAdded,improve.gamePoints],[100,2,45]);
  assert.equal(store.currentTotal(),45);
  await store.switchPlayer();
  await assert.rejects(()=>store.submitScore('hardware-challenge-level-5',20),/not available/);
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
  const line=rules.split('\n').find(s=>s.includes('&& request.resource.data.gameId in ['));
  assert.ok(line);
  const ids=[...line.matchAll(/'([^']+)'/g)].map(m=>m[1]);
  const expected=['tech-sprint',...Object.entries(SCORED_LEVEL_COUNTS).flatMap(([game,n])=>Array.from({length:n},(_,i)=>`${game}-level-${i+1}`))];
  assert.deepEqual(ids,expected);
});
