import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FirestoreStore } from '../js/store.js';

function fakeFirestore() {
  const watchers = [];
  return {
    watchers,
    api: {
      collection(_db, ...path) {
        return { type: 'collection', path };
      },
      where(field, op, value) {
        return { field, op, value };
      },
      query(source, condition) {
        return { type: 'query', source, condition };
      },
      onSnapshot(source, onData, onError) {
        const watcher = { source, onData, onError, stopped: false };
        watchers.push(watcher);
        return () => { watcher.stopped = true; };
      },
    },
  };
}
const docs = (...items) => ({ docs: items.map((item) => ({ data: () => item })) });

test('ordinary game pages subscribe only to current player scores and switch safely', async () => {
  const f = fakeFirestore();
  const store = new FirestoreStore();
  store.db = {};
  store.live = f.api;
  store.profiles = [{ id: 'p1', displayName: 'Alex' }, { id: 'p2', displayName: 'Jess' }];
  store.snapshotsStarted = true;

  store.setPlayer({ id: 'p1', displayName: 'Alex' });
  assert.equal(f.watchers.length, 1);
  assert.deepEqual(f.watchers[0].source.condition, { field: 'playerId', op: '==', value: 'p1' });
  f.watchers[0].onData(docs({ playerId: 'p1', gameId: 'tech-sprint', points: 77 }));
  assert.equal(store.currentTotal(), 77);
  await store.waitForScores();

  store.setPlayer({ id: 'p2', displayName: 'Jess' });
  assert.equal(f.watchers[0].stopped, true);
  assert.deepEqual(f.watchers[1].source.condition, { field: 'playerId', op: '==', value: 'p2' });
  f.watchers[0].onData(docs({ playerId: 'p1', gameId: 'tech-sprint', points: 99 }));
  assert.equal(store.currentTotal(), 0, 'stale callbacks must not affect newly selected player');
  f.watchers[1].onData(docs({ playerId: 'p2', gameId: 'tech-sprint', points: 54 }));
  assert.equal(store.currentTotal(), 54);

  store.setPlayer(null);
  assert.equal(f.watchers[1].stopped, true);
  assert.equal(f.watchers.length, 2, 'do not open scores listener for anonymous/unjoined player');
});

test('leaderboard keeps one complete scores listener while players change', async () => {
  const f = fakeFirestore();
  const store = new FirestoreStore({ fullBoard: true });
  store.db = {};
  store.live = f.api;
  store.profiles = [{ id: 'p1', displayName: 'Alex' }, { id: 'p2', displayName: 'Jess' }];
  store.snapshotsStarted = true;
  store.watchScores();
  assert.equal(f.watchers.length, 1);
  assert.equal(f.watchers[0].source.type, 'collection');
  f.watchers[0].onData(docs(
    { playerId: 'p1', gameId: 'tech-sprint', points: 75 },
    { playerId: 'p2', gameId: 'tech-sprint', points: 40 },
  ));
  await store.waitForScores();
  assert.deepEqual(store.board.map((p) => p.total), [75, 40]);
  store.setPlayer({ id: 'p1', displayName: 'Alex' });
  store.setPlayer({ id: 'p2', displayName: 'Jess' });
  assert.equal(f.watchers.length, 1, 'player changes must not restart full leaderboard listener');
});

// Profile reads are separate from score reads: games should not subscribe to
// all player profiles, but they must still show current-player totals.
test('game pages use only selected profile; homepage and leaderboard watch all', async () => {
  const f = fakeFirestore();
  const game = new FirestoreStore();
  game.db = {};
  game.live = { ...f.api,
    getDocs: async () => ({ docs: [
      { data: () => ({ displayName: 'Alex' }) },
      { data: () => ({ displayName: 'Jess' }) },
    ] }),
  };
  game.watchProfiles();
  assert.equal(f.watchers.length, 0, 'game pages should not watch profiles');
  game.setPlayer({ id: 'p1', displayName: 'Alex' });
  game.scores = [{ playerId: 'p1', gameId: 'tech-sprint', points: 71 }];
  game.refresh();
  assert.equal(game.currentTotal(), 71);
  assert.equal(await game.hasExistingName('JESS'), true,
    'game-page join dialog still performs a one-time nickname check');
  game.setPlayer(null);
  assert.equal(game.board.length, 0);

  const home = new FirestoreStore({ fullProfiles: true });
  home.db = {};
  home.live = f.api;
  home.watchProfiles();
  assert.equal(f.watchers.length, 1);
  assert.equal(f.watchers[0].source.type, 'collection');

  const board = new FirestoreStore({ fullBoard: true });
  board.db = {};
  board.live = f.api;
  board.watchProfiles();
  assert.equal(f.watchers.length, 2, 'leaderboard still watches all profiles');
});
