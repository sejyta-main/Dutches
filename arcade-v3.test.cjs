'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const memory=new Map(),calls=[];
const storage={getItem:key=>memory.has(key)?memory.get(key):null,setItem:(key,value)=>memory.set(key,String(value))};
function stub(game){return {open(config){calls.push({game,config})}}}
const ctx={window:{RekenInvaders:stub('invaders'),RekenBreakout:stub('breakout'),RekenForest:stub('forest')},localStorage:storage,console};
vm.runInNewContext(fs.readFileSync('arcade-hub.js','utf8'),ctx);
const hub=ctx.window.RekenArcade;
assert.equal(hub.games.length,3,'Exactly three DIFFERENT playable reward engines');
assert.equal(hub.peek(),'invaders');
const first=[hub.next(),hub.next(),hub.next(),hub.next(),hub.next(),hub.next()];
assert.deepEqual(first,['invaders','breakout','forest','invaders','breakout','forest'],'No game should repeat in adjacent rounds');
assert.equal(hub.peek(),'invaders','Choice persists across completed rounds');
for(const game of hub.games){const html=hub.offerHTML(game.id);
 for(const option of hub.games)assert.ok(html.includes('data-arcade-game="'+option.id+'"'),'Each game can be chosen');
 assert.ok(html.includes('VANDAAG AANBEVOLEN'),'Rotating recommendation is highlighted');
}
const before=hub.medalCount();let completed=0;
assert.equal(hub.open('invaders',{pack:7,onBack:()=>{},onComplete:()=>completed++}),true);
assert.equal(calls.at(-1).game,'invaders');assert.equal(calls.at(-1).config.pack,7);
calls.at(-1).config.onComplete({score:12});
calls.at(-1).config.onComplete({score:12});
assert.equal(completed,1,'Winning repeatedly cannot double-award the same game');
assert.equal(hub.medalCount(),before+1);
assert.equal(hub.open('breakout',{pack:3}),true);
assert.equal(calls.at(-1).game,'breakout');
assert.equal(hub.open('forest',{pack:2}),true);
assert.equal(calls.at(-1).game,'forest');
assert.equal(hub.open('unknown',{}),false);
const dict=fs.readFileSync('dictee-v2.js','utf8');
assert.ok(dict.includes('window.RekenArcade?.next()'),'Next reward chosen on completion');
assert.ok(dict.includes('offerHTML(session.arcadeGame)'),'Reward game choice displayed with session results');
assert.ok(dict.includes("page=from;show()"),'Game returns to existing summary without discarding results');
assert.ok(dict.includes("session.arcadeGame=window.RekenArcade?.next()"),'Round re-render does not generate another choice');
assert.ok(!dict.includes('window.RekenLetterblaster.open'),'Old static word-choice game no longer launched from dictee');
const paths=['arcade-invaders.js','arcade-breakout.js','forest-game.js'];
for(const path of paths){
 const source=fs.readFileSync(path,'utf8');
 assert.match(source,/requestAnimationFrame/,'Actual rendered gameplay animation in '+path);
 assert.match(source,/pointerdown/,'Touch controls in '+path);
 assert.match(source,/onComplete/,'Win callback in '+path);
}
assert.match(fs.readFileSync('arcade-invaders.js','utf8'),/enemyShots/,'Enemies must actually shoot');
assert.match(fs.readFileSync('arcade-breakout.js','utf8'),/b\.vy\*=-1/,'Ball must bounce off bricks');
console.log('PASS: 3 real games alternate, all selectable, arcade win medal once, touch controls and no lost dictation.');
