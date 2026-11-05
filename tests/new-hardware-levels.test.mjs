import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HARDWARE_LEVELS } from '../games/hardware-challenge/hardware-data.js';
import { validHotspots, chooseQuestions } from '../games/hardware-challenge/hardware-logic.js';
import { scoredLevelIds } from '../js/scoring-core.js';
import { LAPTOP_LEVEL } from '../games/hardware-challenge/hardware-laptop-level.js';
import { PORTS_LEVEL } from '../games/hardware-challenge/hardware-ports-level.js';

const asset = (filename) => new URL(`../games/hardware-challenge/assets/${filename}`, import.meta.url);
const map = JSON.parse(readFileSync(new URL('../games/hardware-challenge/new-level-hotspot-map.json',import.meta.url),'utf8'));

test('new hardware missions are included in the seven-level scoring roster',()=>{
  assert.deepEqual(HARDWARE_LEVELS.map(l=>l.id),[1,2,3,4,5,6,7]);
  assert.equal(HARDWARE_LEVELS[5],LAPTOP_LEVEL);
  assert.equal(HARDWARE_LEVELS[6],PORTS_LEVEL);
  assert.deepEqual(scoredLevelIds('hardware-challenge'),[1,2,3,4,5,6,7]);
  for (const level of [LAPTOP_LEVEL,PORTS_LEVEL]) {
    assert.ok(level.enabled);
    assert.equal(level.availability,'digital');
    assert.equal(level.questionsPerRound,6);
    assert.ok(validHotspots(level));
    const questions=chooseQuestions(level,[],()=>0.42);
    assert.equal(questions.length,6);
    assert.equal(new Set(questions.map(q=>q.id)).size,6);
  }
});

test('new image assets are native-resolution PNGs with stable matching dimensions',()=>{
  for (const level of [LAPTOP_LEVEL,PORTS_LEVEL]) {
    const data=readFileSync(asset(`hc${level.id}.png`));
    assert.equal(data.toString('hex',0,8),'89504e470d0a1a0a');
    assert.equal(data.readUInt32BE(16),level.width);
    assert.equal(data.readUInt32BE(20),level.height);
    assert.deepEqual([level.width,level.height],[1448,1086]);
    assert.ok(readFileSync(asset(`hc${level.id}-source.svg`),'utf8').includes('<svg'));
  }
});

test('all laptop and ports hotspots match the polygons generated alongside the image artwork',()=>{
  for (const level of [LAPTOP_LEVEL,PORTS_LEVEL]) {
    assert.deepEqual(Object.keys(map[level.id]).sort(),level.targets.map(t=>t.id).sort());
    for (const target of level.targets) {
      assert.deepEqual(target.regions,map[level.id][target.id],`level ${level.id}: ${target.id} hotspot drifted from original art`);
      assert.equal(target.questionVariants.length,2);
      assert.ok(target.questionVariants.every(q=>q.length>15));
    }
  }
});

test('the two new missions use the scored results flow',()=>{
  const src=readFileSync(new URL('../games/hardware-challenge/hardware.js',import.meta.url),'utf8');
  assert.match(src,/submitLevelResult\(store, GAME_ID, level.id, score\)/);
  assert.match(src,/const eligible = scored\(\)\.has\(level.id\)/);
  assert.match(src,/Score saved to the live leaderboard!/);
  assert.equal(scoredLevelIds('hardware-challenge').length,7);
});
