import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import levels from '../games/campus-quest/levels/manifest.js';
import { loadLevel } from '../games/campus-quest/game/js/LevelLoader.js';
import GameModel from '../games/campus-quest/game/js/models/GameModel.js';
import { SCORED_LEVEL_COUNTS } from '../js/config.js';
import { scoredLevelIds, scoredGamePoints } from '../js/scoring-core.js';

const expected = JSON.parse(readFileSync(new URL('../games/campus-quest/levels/photo-hotspot-map.json',import.meta.url),'utf8'));
const parsePoints = points => points.split(/\s+/).map(pair => pair.split(',').map(Number));
const photoIds = [3,4,5];
const loaded = await Promise.all(photoIds.map(loadLevel));

test('photo Campus Quest levels are registered, enabled and scored without altering Hardware Challenge',()=>{
  assert.deepEqual(levels.filter(l => l.implemented).map(l => l.id),[1,2,3,4,5]);
  assert.deepEqual(levels.slice(2).map(l => l.title),['Library Mystery','Creative Studio','Student Life Adventure']);
  assert.equal(SCORED_LEVEL_COUNTS['campus-quest'],5);
  assert.equal(SCORED_LEVEL_COUNTS['hardware-challenge'],7);
  assert.deepEqual(scoredLevelIds('campus-quest'),[1,2,3,4,5]);
  assert.equal(scoredGamePoints('campus-quest',{1:100,2:100,3:100,4:100,5:100}),100);
});

test('all three full-size photo backgrounds are 1672x941 PNGs',()=>{
  for(const level of loaded){
    const data=readFileSync(new URL(level.room.backgroundUrl));
    assert.equal(data.toString('ascii',1,4),'PNG');
    assert.equal(data.readUInt32BE(16),1672, `Level ${level.id} image width`);
    assert.equal(data.readUInt32BE(20),941, `Level ${level.id} image height`);
    assert.deepEqual([level.room.width,level.room.height],[1672,941]);
  }
});

test('36 photo targets have unique clues, valid native-coordinate polygons, and match reviewed reference maps',()=>{
  const all=[];
  for(const level of loaded){
    assert.equal(level.steps.length,12,`Level ${level.id} clue count`);
    assert.equal(new Set(level.steps.map(s => s.id)).size,12);
    assert.equal(level.settings.randomizeObjects,true);
    assert.equal(level.settings.randomClueCount,6);
    const expectedForLevel=expected[level.id];
    assert.deepEqual(Object.keys(expectedForLevel).sort(),level.steps.map(s=>s.id).sort());
    const actual={};
    for(const hotspot of level.hotspots){
      assert.equal(hotspot.type,'polygon');
      const xy=parsePoints(hotspot.points);
      assert.ok(xy.length>=3,`Level ${level.id} ${hotspot.object}: too few points`);
      assert.ok(xy.every(([x,y]) => Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&x<=1672&&y>=0&&y<=941),`Level ${level.id} ${hotspot.object}: outside photo`);
      (actual[hotspot.object]??=[]).push(xy);
    }
    assert.deepEqual(actual,expectedForLevel,`Level ${level.id}: game hotspot changed without updating its visual coordinate reference`);
    for(const s of level.steps){
      assert.ok(s.hint.length>30 && s.helpHint.length>25 && s.story.length>30,`Level ${level.id}: incomplete help for ${s.id}`);
      assert.ok(actual[s.id]?.length,`Level ${level.id}: no hotspot for ${s.id}`);
      all.push(s.id);
    }
  }
  assert.equal(all.length,36);
});

test('each photo round selects six different object clues from the same supported hotspot pool',()=>{
  for(const level of loaded){
    const ids=new Set(level.hotspots.map(h=>h.object));
    for(let i=0;i<80;i++){
      const model=new GameModel(level);
      assert.equal(model.steps.length,6);
      assert.equal(new Set(model.steps.map(s=>s.id)).size,6);
      assert.ok(model.steps.every(s=>ids.has(s.id)));
    }
  }
});
