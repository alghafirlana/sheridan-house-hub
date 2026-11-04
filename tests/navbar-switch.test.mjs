import test from 'node:test';
import assert from 'node:assert/strict';
import {initChrome, setGameplayActive, switchCurrentPlayer} from '../js/ui.js';

// Isolated browser-shell test: switching mid-challenge requires confirmation.
test('Switch player protects unfinished challenges and safely returns to the join screen', async () => {
  const originalInterval=globalThis.setInterval;
  const originalClearInterval=globalThis.clearInterval;
  globalThis.setInterval=()=>1234;
  globalThis.clearInterval=()=>{};
  const data=new Map();
  let confirmed=false, switched=0, destination='';
  globalThis.sessionStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
  globalThis.window={addEventListener(){},confirm:()=>confirmed,location:{assign:where=>destination=where}};
  globalThis.document={body:{classList:{contains:cls=>cls==='game-page'}},querySelector(sel){return sel==='#modalRoot'?{replaceChildren(){}}:null},querySelectorAll(){return []},addEventListener(){},removeEventListener(){}};
  const store={mode:'demo',player:{id:'p',displayName:'Player'},listenPlayer(){},listenBoard(){},async switchPlayer(){switched++;this.player=null;}};
  try{
    initChrome(store);
    setGameplayActive(true);
    assert.equal(await switchCurrentPlayer(),false);
    assert.equal(switched,0,'declining must not end the current player session');
    confirmed=true;
    assert.equal(await switchCurrentPlayer(),true);
    assert.equal(switched,1);
    assert.match(destination,/\/index\.html#games$/);
    assert.equal(data.get('sheridan-hub:join-after-switch'),'1');
  } finally {
    globalThis.setInterval=originalInterval;
    globalThis.clearInterval=originalClearInterval;
  }
});
