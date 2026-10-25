'use strict';
/* End-to-end minimal DOM exercise of 8/10 saved dictation -> immediately-visible bonus -> return -> redeem later. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let markup='',lastSpoken=null,opened=0,onGameBack=null;
const elements=new Map(),store=new Map();
class Stub{
 constructor(id){this.id=id;this.listeners=new Map();this.value='';this.disabled=false;}
 addEventListener(event,fn){this.listeners.set(event,fn)}
 click(){const fn=this.listeners.get('click')||this.onclick;assert.equal(typeof fn,'function','Click handler bound to '+this.id);fn()}
 remove(){markup=markup.replace(new RegExp('<div[^>]+id="'+this.id+'"[\\s\\S]*?<[\\/]div>'),'')}
 focus(){}
}
const app={
 get innerHTML(){return markup},
 set innerHTML(html){markup=html;elements.clear()},
 querySelector(selector){
  if(!selector.startsWith('#'))return null;
  const id=selector.slice(1);
  if(!markup.includes('id="'+id+'"'))return null;
  if(!elements.has(id))elements.set(id,new Stub(id));
  return elements.get(id);
 },
 querySelectorAll(selector){return []}
};
const ctx={
 window:{RekenVoice:{voiceInfo:()=> '🇧🇪 Flemish audio',speak:item=>{lastSpoken=item},stop:()=>{}},
    RekenArcade:{next:()=> 'invaders',peek:()=> 'invaders',
      offerHTML:()=>'<div class="arcade-v3-offer">Arcade options!</div>',
      open:(game,opts)=>{opened++;onGameBack=opts.onBack;return true}}},
 document:{getElementById:id=>id==='app'?app:null},
 localStorage:{getItem:key=>store.has(key)?store.get(key):null,setItem:(key,val)=>store.set(key,String(val))},
 Math,Number,JSON,Array,String,Set,Map,Date,console,
 location:{reload:()=>{}}
};
vm.runInNewContext(fs.readFileSync('woordpakketten.js','utf8'),ctx);
vm.runInNewContext(fs.readFileSync('dictee-v2.js','utf8'),ctx);
ctx.window.RekenDictee.open({pack:2});
assert.ok(markup.includes('Woordpakket 2'),'Wordpack menu loaded');
app.querySelector('#dict2-10').click();
for(let i=0;i<10;i++){
 const word=lastSpoken;
 assert.ok(word,'Word actually spoken in question '+(i+1));
 app.querySelector('#dict2-write').value=i<8?word.word:'zzz';
 const form=app.querySelector('#dict2-form');
 assert.equal(typeof form.onsubmit,'function','Can submit word');
 form.onsubmit({preventDefault(){}});
 app.querySelector('#dict2-next').click();
}
assert.match(markup,/8 \/ 10 GOED!/,'Eight correct out of ten grants immediate full-screen bonus');
assert.ok(app.querySelector('#dict2-bonus-overlay'),'Full screen reward overlay should be visible, not under the fold');
assert.ok(app.querySelector('#dict2-bonus-start'),'Play immediately visible');
const saved=JSON.parse(store.get('rekenreis-dictee-v1'));
assert.equal(saved.sessions.at(-1).correct,8,'8/10 is faithfully stored');
assert.equal(saved.sessions.at(-1).total,10);
app.querySelector('#dict2-bonus-start').click();
assert.equal(opened,1,'Play launches real game');
onGameBack();
assert.ok(!markup.includes('dict2-bonus-overlay'),'Dismissed overlay does not loop after returning from game');
assert.ok(markup.includes('dict2-arcade-now'),'Visible manual game replay remains');
ctx.window.RekenDictee.open({pack:2});
assert.match(markup,/Je arcadebonus wacht op je!/,'Completed 8/10 reward remains recoverable');
app.querySelector('#dict2-past-bonus').click();
assert.match(markup,/8 van 10 juist/,'Past score retained and shown on bonus recovery');
app.querySelector('#dict2-bonus-back').click();
assert.match(markup,/Woordpakket 2/);
assert.equal(JSON.parse(store.get('rekenreis-dictee-v1')).sessions.at(-1).correct,8,'Bonus use must not modify results');
console.log('PASS: completed 8/10 grants instant bonus, launches game, returns safely and previous bonus is redeemable.');
