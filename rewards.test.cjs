'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const progress=fs.readFileSync('rewards.js','utf8');
function simulate(sessions){
 const storage=new Map([['rekenreis-progress-v1',JSON.stringify({sessions})]]);
 let overlay=null,launched=0,special=0;
 const root={querySelector:id=>id==='#home-summary'?{}:null};
 class Element {
  constructor(){this.html='';this.actions={};this.className=''}
  set innerHTML(v){this.html=v}
  querySelector(id){return {set onclick(fn){overlay.actions[id]=fn}}}
  setAttribute(){}
  remove(){overlay=null}
 }
 const doc={getElementById:()=>root,createElement:()=>new Element(),body:{appendChild:el=>overlay=el}};
 const ctx={window:{RekenForest:{open:args=>{launched++;ctx.game=args}},RekenBonus:{open:()=>special++}},document:doc,
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v))},
  MutationObserver:class{observe(){}},location:{reload(){}},alert:()=>{},console};
 vm.runInNewContext(progress,ctx);
 return {get overlay(){return overlay},get launched(){return launched},get special(){return special},
  click:id=>{const action=overlay?.actions?.[id];assert.equal(typeof action,'function','Action '+id+' exists');action()},
  complete:()=>ctx.game.onComplete(), storage};
}
function s(topic,correct=10,date=topic){return {mode:'practice',topic,correct,total:10,date}}
assert.equal(simulate([s('blocks',9)]).overlay,null,'9/10 should not reward');
const one=simulate([s('blocks')]);
assert.match(one.overlay.html,/PIXEL BOSAVONTUUR/);
one.click('#pixel-reward-play');assert.equal(one.launched,1);
one.complete();assert.match(one.overlay.html,/pixelmedaille/);
const four=simulate([s('blocks'),s('place'),s('words'),s('line')]);
four.click('#pixel-reward-play');four.complete();
assert.match(four.overlay.html,/memorybos/);
four.click('#pixel-reward-memory');assert.equal(four.special,1);
console.log('PASS: 9/10 no minigame, 10/10 playable platform level, completion medal and four-world special.');
