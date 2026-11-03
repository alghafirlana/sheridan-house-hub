import test from 'node:test';
import assert from 'node:assert/strict';
import {initStore} from '../js/store.js';
class Storage { constructor(){this.map=new Map();} getItem(k){return this.map.get(k)??null;} setItem(k,v){this.map.set(k,String(v));} removeItem(k){this.map.delete(k);} clear(){this.map.clear();} }
globalThis.localStorage=new Storage();
globalThis.sessionStorage=new Storage();
globalThis.window={addEventListener(){}};
test('registration, best attempts, switching and returning by four digits',async()=>{
 localStorage.clear();sessionStorage.clear();
 const store=await initStore({forceDemo:true});
 assert.equal(store.mode,'demo');
 const player=await store.createPlayer('Alex');
 assert.match(player.pin,/^[0-9]{4}$/);
 assert.equal(store.player.displayName,'Alex');
 let first=await store.submitScore('tech-sprint',60);
 assert.deepEqual([first.gained,first.total],[60,60]);
 let lower=await store.submitScore('tech-sprint',40);
 assert.deepEqual([lower.gained,lower.total],[0,60]);
 let higher=await store.submitScore('tech-sprint',100);
 assert.deepEqual([higher.gained,higher.total],[40,100]);
 await store.switchPlayer();assert.equal(store.player,null);
 await store.resumePlayer(player.pin);
 assert.equal(store.player.displayName,'Alex');assert.equal(store.currentTotal(),100);
 assert.equal(store.player.pin,player.pin);
 assert.rejects(()=>store.resumePlayer('ab12'),/four-digit/);
 assert.rejects(()=>store.submitScore('unregistered-game',80),/not available/);
});
test('player code survives page restore in demo mode',async()=>{
 const store=await initStore({forceDemo:true});
 const player=await store.createPlayer('Sofia');
 const nextPage=await initStore({forceDemo:true});
 assert.equal(nextPage.player.pin,player.pin);
 assert.equal(nextPage.player.displayName,'Sofia');
});
