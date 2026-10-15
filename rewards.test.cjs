const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const src=fs.readFileSync('rewards.js','utf8');
function scenario(sessions){
 const store=new Map([['rekenreis-progress-v1',JSON.stringify({sessions})]]);
 let dialog=null,bonusCalls=0;
 const root={querySelector:()=>({})};
 class Element{
  constructor(){this.html='';this.buttons=[];this.onclick=null}
  set innerHTML(value){
   this.html=value;
   this.buttons=Array.from({length:9},(_,i)=>({dataset:{star:String(i)},addEventListener:(name,cb)=>{this.buttons[i].click=cb},classList:{add(){}},textContent:''}));
  }
  querySelectorAll(){return this.buttons}
  querySelector(key){return {set onclick(fn){if(key==='#reward-close')dialog.later=fn;if(key==='#reward-done')dialog.done=fn;if(key==='#reward-special-game')dialog.special=fn}}}
  setAttribute(){}
  remove(){dialog=null}
 }
 const document={
  getElementById:()=>root,
  createElement:()=>new Element(),
  body:{appendChild:el=>{dialog=el}}
 };
 const storage={getItem:key=>store.get(key)||null,setItem:(key,val)=>store.set(key,val)};
 const ctx={window:{RekenBonus:{open:()=>bonusCalls++},location:{reload(){}}},document,localStorage:storage,MutationObserver:class{constructor(fn){this.fn=fn}observe(){}},Math,console};
 vm.runInNewContext(src,ctx);
 return {dialog:()=>dialog,bonusCalls:()=>bonusCalls,storage,check:ctx.window.RekenRewards.check};
}
function entry(topic,n=10,c=10,date='now'){return {mode:'practice',topic,total:n,correct:c,date}}
let no=scenario([entry('blocks',10,9)]);
assert.equal(no.dialog(),null,'9/10 must not trigger a minigame');
let one=scenario([entry('blocks')]);
assert.ok(one.dialog()?.html.includes('10 OP 10'),'First 10/10 must immediately show the minigame');
for(let n=0;n<5;n++){
 const d=one.dialog(),index=Number(d.html.match(/data-star="(\d+)" aria-label="Gouden ster"/)[1]);
 d.buttons[index].click();
}
assert.ok(one.dialog().html.includes('gouden medaille'),'Minigame completion must reward a medal');
assert.equal(one.dialog().html.includes('Extra verrassing'),false,'One world must not unlock the special prize');
let four=scenario([entry('blocks',10,10,'a'),entry('place',10,10,'b'),entry('words',10,10,'c'),entry('line',10,10,'d')]);
for(let n=0;n<5;n++){
 const d=four.dialog(),index=Number(d.html.match(/data-star="(\d+)" aria-label="Gouden ster"/)[1]);
 d.buttons[index].click();
}
assert.ok(four.dialog().html.includes('Extra verrassing'),'Fourth different world unlocks the special reward');
four.dialog().special();
assert.equal(four.bonusCalls(),1,'The special-prize button opens memory');
console.log('Reward checks passed: normal score, every perfect round, four-world unlock and special game');
