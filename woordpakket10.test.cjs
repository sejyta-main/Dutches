'use strict';
/* Actual learning flow for teacher's WP10: 6 words, 2 sentences, money, reward and mixed test. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const storage=new Map(),nodes=new Map();
let html='',spoken=null,gameCount=0,gameBack=()=>{},scrolls=0;
const mem={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v))};
class Element{
 constructor(id){this.id=id;this.listeners={};this.disabled=false;this.value='';}
 addEventListener(type,fn){this.listeners[type]=fn}
 click(){const fn=this.onclick||this.listeners.click;assert.equal(typeof fn,'function','Missing button callback '+this.id);fn()}
 remove(){html=html.replace(/<div[^>]*id="dict2-bonus-overlay"[\s\S]+<\/div><\/div>\s*$/,'')}
 focus(){}
}
const root={
 get innerHTML(){return html},
 set innerHTML(v){html=v;nodes.clear()},
 querySelector(selector){
  if(!selector.startsWith('#'))return null;
  const id=selector.slice(1);
  if(!html.includes('id="'+id+'"'))return null;
  if(!nodes.has(id))nodes.set(id,new Element(id));
  return nodes.get(id);
 },
 querySelectorAll(){return []}
};
const window={
 RekenVoice:{voiceInfo:()=>'🇧🇪 Vlaams',stop(){},speak:(w)=>{spoken=w}},
 RekenNavigation:{top(){scrolls++}},
 RekenArcade:{next:()=> 'invaders',peek:()=> 'invaders',
  offerHTML:()=>'<div class="arcade-v3-offer">3 arcadespellen</div>',
  open:(name,opts)=>{gameCount++;gameBack=opts.onBack;return true}},
 RekenPetCore:{snapshot:()=>({coins:250})}
};
const context={window,document:{getElementById:id=>id==='app'?root:null},localStorage:mem,
 Math,Number,JSON,Array,Set,Map,Date,String,Object,console,location:{reload(){}}};
vm.runInNewContext(fs.readFileSync('woordpakketten.js','utf8'),context);
vm.runInNewContext(fs.readFileSync('dictee-v2.js','utf8'),context);
const dict=window.RekenDictee;
assert.ok(dict.packs.includes(10));assert.ok(!dict.packs.includes(9));
function goRound(id,expected,errors=0){
 spoken=null;
 root.querySelector(id).click();
 for(let i=0;i<expected;i++){
  assert.ok(spoken,'A Flemish voice item is spoken on every question');
  assert.equal(spoken.pack,10,'Single pack contains only WP10 items');
  if(spoken.isSentence){
   assert.match(html,/Welke zin hoor je\?/);
   assert.match(html,/Typ de hele zin/);
   assert.match(html,/vraagteken of uitroepteken/);
  }else assert.match(html,/Welk woord hoor je\?/);
  const entry=root.querySelector('#dict2-write');
  entry.value=i<errors?'xyz':spoken.phrase;
  const form=root.querySelector('#dict2-form');
  assert.equal(typeof form.onsubmit,'function');
  form.onsubmit({preventDefault(){}});
  root.querySelector('#dict2-next').click();
 }
 assert.match(html,new RegExp('id="dict2-bonus-overlay"'),'Reward is visible even for short six-word or two-sentence lessons');
 const sessions=JSON.parse(storage.get('rekenreis-dictee-v1')).sessions;
 const last=sessions.at(-1);
 assert.equal(last.total,expected);
 assert.equal(last.correct,expected-errors);
 assert.equal(last.bonusCoins,25,'Exactly one 25-coin completion bonus');
 root.querySelector('#dict2-bonus-start').click();
 assert.ok(gameCount>=1,'Real arcade starts from every completed training');
 gameBack();
 dict.open({pack:10});
}
dict.open({pack:10});
assert.match(html,/Woordpakket 10/);
assert.match(html,/6 woorden/);
assert.match(html,/Alle 8 opdrachten/);
assert.match(html,/2 zinnen/);
assert.ok(!html.includes('Pakket 9'),'No fabricated WP9 button');
goRound('#dict2-20',8,1);
goRound('#dict2-10',6,0);
goRound('#dict2-sentences',2,0);
assert.ok(scrolls>4,'New pages reset scroll on iPad');
const strings=fs.readFileSync('dictee-v2.js','utf8');
assert.match(strings,/book\.packs\.flatMap\(p=>shuffle\(p\.words\)\.slice\(0,5\)\)/);
dict.open({pack:10});
root.querySelector('#dict2-exam').click();
const count=5*window.RekenWoordpakketten.packs.length;
let seen10=0,played=0;
while(played<count){
 assert.ok(spoken);
 if(spoken.pack===10)seen10++;
 root.querySelector('#dict2-write').value=spoken.phrase;
 root.querySelector('#dict2-form').onsubmit({preventDefault(){}});
 root.querySelector('#dict2-next').click();
 played++;
}
assert.equal(count,45,'Mixed exam includes 9 available packages at 5 questions each');
assert.equal(seen10,5,'Mixed exam contains five authentic WP10 exercises');
assert.match(html,/Woordpakket 10/);
assert.match(html,/Per woordpakket/);
assert.equal(JSON.parse(storage.get('rekenreis-dictee-v1')).sessions.at(-1).total,45);
console.log('PASS: WP10 six words, two full sentences, sentence spelling, 8/6/2 bonuses, 45-task mixed exam and 5 WP10 items.');
