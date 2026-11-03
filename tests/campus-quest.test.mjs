import test from 'node:test';
import assert from 'node:assert/strict';
import {
  scoreSummary,
  CAMPUS_QUEST_LEVEL_IDS,
  isCampusQuestLevelGame,
} from '../js/scoring-core.js';
import { initStore } from '../js/store.js';
import { createQuestProgressStore } from '../games/campus-quest/js/hub-integration.js';
class Storage {
  constructor() { this.items = new Map(); }
  getItem(k) { return this.items.get(k) ?? null; }
  setItem(k,v) { this.items.set(k,String(v)); }
  removeItem(k) { this.items.delete(k); }
  clear() { this.items.clear(); }
}
globalThis.localStorage = new Storage();
globalThis.sessionStorage = new Storage();
globalThis.window = { addEventListener() {} };
test('Quest levels are ONE competitive game worth 100 points maximum', () => {
  const board = scoreSummary([{id:'a',displayName:'Alex'}], [
    {playerId:'a',gameId:'campus-quest-level-1',points:100},
    {playerId:'a',gameId:'campus-quest-level-2',points:80},
    {playerId:'a',gameId:'tech-sprint',points:60},
  ]);
  assert.deepEqual(CAMPUS_QUEST_LEVEL_IDS,[1,2]);
  assert.equal(board[0].best['campus-quest'],90);
  assert.equal(board[0].total,150);
  assert.equal(board[0].games,2);
  assert.equal(board[0].questLevels[1],100);
  assert.equal(board[0].questLevels[2],80);
  assert.equal(isCampusQuestLevelGame('campus-quest-level-3'),false);
});
test('Quest progress unlocks across player sessions and preserves zero scores', async () => {
  localStorage.clear();sessionStorage.clear();
  const store = await initStore({forceDemo:true});
  const player = await store.createPlayer('CampusTester');
  let progress = createQuestProgressStore(store);
  assert.equal(progress.getSnapshot().levels[1].unlocked,true);
  assert.equal(progress.getSnapshot().levels[2].unlocked,false);
  await progress.startLevel(1);
  await progress.completeLevel(1,{score:0});
  assert.equal(progress.getSnapshot().levels[1].completed,true);
  assert.equal(progress.getSnapshot().levels[2].unlocked,true);
  assert.equal(store.currentTotal(),0);
  await progress.completeLevel(1,{score:80});
  assert.equal(store.currentTotal(),40);
  await store.switchPlayer();
  await store.resumePlayer(player.pin);
  progress = createQuestProgressStore(store);
  assert.equal(progress.getSnapshot().levels[2].unlocked,true);
  assert.equal(progress.getSnapshot().levels[1].bestScore,80);
  await progress.startLevel(2);
  await progress.completeLevel(2,{score:100});
  assert.equal(store.currentTotal(),90);
  assert.equal(store.board[0].games,1);
  await progress.completeLevel(1,{score:20});
  assert.equal(store.currentTotal(),90);
});

test('completion feedback matches the exact rounded leaderboard points, including replays', async () => {
  const store = await initStore({ forceDemo: true });
  await store.createPlayer('FeedbackTester');
  const progress = createQuestProgressStore(store);
  const first = (await progress.completeLevel(1, { score: 90 })).result;
  assert.deepEqual(
    [first.levelScore, first.previousBest, first.bestScore, first.pointsAdded, first.questPoints, first.personalBest],
    [90, 0, 90, 45, 45, true],
  );
  assert.equal(first.questPoints, store.board.find(x => x.id === store.player.id).best['campus-quest']);
  const second = (await progress.completeLevel(2, { score: 80 })).result;
  assert.deepEqual([second.pointsAdded, second.questPoints], [40, 85]);
  const lowerReplay = (await progress.completeLevel(1, { score: 70 })).result;
  assert.deepEqual([lowerReplay.previousBest, lowerReplay.bestScore, lowerReplay.pointsAdded, lowerReplay.questPoints, lowerReplay.personalBest], [90, 90, 0, 85, false]);
  const higherReplay = (await progress.completeLevel(2, { score: 81 })).result;
  // (90 + 80) / 2 = 85; (90 + 81) / 2 rounds to 86, not 85.5.
  assert.deepEqual([higherReplay.previousBest, higherReplay.bestScore, higherReplay.pointsAdded, higherReplay.questPoints, higherReplay.personalBest], [80, 81, 1, 86, true]);
  assert.equal(higherReplay.questPoints, store.board.find(x => x.id === store.player.id).best['campus-quest']);
  assert.equal(higherReplay.savedToLeaderboard, false); // Demo mode is deliberately labelled.
});
