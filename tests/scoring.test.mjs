import test from 'node:test';
import assert from 'node:assert/strict';
import {scoreSummary,cleanName,normalizeScore,formatPin} from '../js/scoring-core.js';
test('best score per game, combined total, deterministic ranking',()=>{
  const profiles=[{id:'a',displayName:'Alex'},{id:'b',displayName:'Bri'}];
  const scores=[{playerId:'a',gameId:'quiz',points:60},{playerId:'a',gameId:'quiz',points:80},{playerId:'a',gameId:'hardware',points:90},{playerId:'b',gameId:'quiz',points:100}];
  const board=scoreSummary(profiles,scores);
  assert.deepEqual(board.map(p=>[p.name,p.total,p.games]),[['Alex',170,2],['Bri',100,1]]);
});
test('invalid scores cannot contribute',()=>{
  const board=scoreSummary([{id:'a',displayName:'Alex'}],[{playerId:'a',gameId:'fake',points:999},{playerId:'a',gameId:'quiz',points:25}]);
  assert.equal(board[0].total,25);
  assert.throws(()=>normalizeScore(125));assert.throws(()=>normalizeScore(12.4));
});
test('clean names and four digit input',()=>{
  assert.equal(cleanName('  Alex   Reed  '),'Alex Reed');assert.throws(()=>cleanName('a'));
  assert.equal(formatPin('48-27'),'4827');assert.equal(formatPin('482791'),'4827');
});
