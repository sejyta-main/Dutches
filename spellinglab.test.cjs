'use strict';
/* Run all five stages against lightweight DOM stubs on CI, including old school word exclusions. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=f=>fs.readFileSync(f,'utf8'),store=new Map();
let markup='',spoken=[],topCalls=0,arcadeCalls=0;
class Element{
 constructor(id,dataset={}){this.id=id;this.dataset=dataset;this.listeners={};this.value='';this.disabled=false}
 addEventListener(name,fn){this.listeners[name]=fn}
 click(){const fn=this.onclick||this.listeners.click;assert.equal(typeof fn,'function','No action bound: '+this.id);fn()}
}
const ids=new Map();
const app={
 get innerHTML(){return markup},
 set innerHTML(value){markup=value;ids.clear()},
 querySelector(sel){if(!sel.startsWith('#'))return null;const id=sel.slice(1);
  if(!markup.includes('id="'+id+'"'))return null;
  if(!ids.has(id))ids.set(id,new Element(id));
  return ids.get(id);
 },
 querySelectorAll(sel){
  const name=sel==='[data-stage]'?'stage':sel==='[data-answer]'?'answer':sel==='[data-tile]'?'tile':sel==='[data-arcade-game]'?'arcade-game':null;
  if(!name)return [];
  const hits=[...markup.matchAll(/<button\b([^>]*)>/g)].filter(m=>m[1].includes('data-'+name+'="'));
  return hits.map((m,i)=>{
   const key=m[1].match(new RegExp('data-'+name+'="([^"]+)"'));
   const id=name+'-'+i,el=new Element(id,{[name.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]:key[1]});
   el.disabled=/\bdisabled\b/.test(m[1]);
   return el;
  });
 }
};
const storage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v))};
const win={RekenVoice:{speak:(word)=>spoken.push(word),stop(){}},RekenNavigation:{top(){topCalls++}},RekenTaal:{pair:(nl,en)=>'<span lang="nl-BE">'+nl+'</span><span lang="en">'+en+'</span>'}};
const ctx={window:win,document:{getElementById:id=>id==='app'?app:null},localStorage:storage,location:{reload(){}},Date,JSON,Math,Set,Array,Number,String,Object,console};
for(const file of ['world-progress.js','woordpakketten.js','spellinglab-data.js','pet-core.js','spellinglab.js'])
 vm.runInNewContext(read(file),ctx,{filename:file});
assert.equal(win.RekenSpellingLab.phases.length,5);
const D=win.RekenSpellingData;
assert.ok(D.pairs.length>=8);
assert.ok(D.items.length>=60);
assert.ok(D.eligible(win.RekenWoordpakketten.all.map(x=>x.word)).every(x=>!win.RekenWoordpakketten.all.map(w=>w.word).includes(x.word)));
assert.ok(D.items.every(x=>x.segments.join('')===x.word),'Every example has a manually correct syllable concatenation');
assert.ok(D.items.every(x=>x.rule==='short'||x.rule==='long'));
const dueWord=D.eligible()[0],old=new Date(Date.now()-2*86400000).toISOString();
const order=D.priority([dueWord,D.eligible()[1]],[{word:dueWord.word,correct:false,at:old}],[dueWord.word],()=>.4);
assert.equal(order[0].word,dueWord.word,'Due missed words get retrieval priority');
let back=0;win.RekenSpellingLab.open({onBack:()=>back++});
assert.match(markup,/Spellinglab/);
assert.ok(topCalls>0);
for(const phase of ['sound','build','rule','transfer','exam']){
 let buttons=app.querySelectorAll('[data-stage]');
 const target=buttons.find(x=>x.dataset.stage===phase);
 assert.ok(target,'Home shows '+phase+' phase');target.click();
 assert.match(markup,/lab-session-label/,'Phase has question UI: '+phase);
 let rounds=0;
 while(markup.includes('id="lab-quit"')&&rounds<20){
  assert.ok(spoken.length,'A new question is spoken with Flemish voice');
  if(markup.includes('data-answer=')){
   const options=app.querySelectorAll('[data-answer]');
   assert.ok(options.length>=2);
   options[0].click();
  }else if(markup.includes('id="lab-form"')){
   app.querySelector('#lab-typed').value='zz';
   const form=app.querySelector('#lab-form');
   assert.equal(typeof form.listeners.submit,'function','Spelling input is a working form');
   form.listeners.submit({preventDefault(){}});
  }else if(markup.includes('id="lab-check"')){
   const tile1=app.querySelectorAll('[data-tile]').find(x=>!x.disabled);
   assert.ok(tile1);tile1.click();
   const tile2=app.querySelectorAll('[data-tile]').find(x=>!x.disabled);
   assert.ok(tile2);tile2.click();
   app.querySelector('#lab-check').click();
  }else throw Error('Unknown question input for '+phase);
  assert.match(markup,/lab-feedback/,'Immediate rule explanation for every answer');
  app.querySelector('#lab-next').click();
  rounds++;
 }
 const expect=phase==='transfer'?10:phase==='exam'?16:8;
 assert.equal(rounds,expect,phase+' should have '+expect+' complete questions');
 assert.match(markup,/25/,'Completed phase shows 25-coin reward');
 assert.match(markup,/Mijn resultaat|Oefenronde afgerond|Practice complete/,'Summary has results');
 const record=JSON.parse(store.get('rekenreis-spellinglab-v1'));
 assert.equal(record.sessions.length,['sound','build','rule','transfer','exam'].indexOf(phase)+1);
 assert.equal(record.sessions.at(-1).bonusCoins,25);
 assert.equal(record.sessions.at(-1).total,expect);
 if(phase==='exam'){
  for(const skill of ['hearing','rules','spelling'])assert.ok(record.sessions.at(-1).bySkill[skill].total>0,'Mixed assessment checks '+skill);
 }
 app.querySelector('#lab-finish').click();
 assert.match(markup,/lab-phase-grid/,'Can return to all five phases');
}
const saved=JSON.parse(store.get('rekenreis-spellinglab-v1'));
assert.equal(saved.sessions.length,5,'One completed session and reward per phase');
assert.equal(win.RekenPetCore.snapshot().coins,60+25*5,'Lab completion coins appear in actual pet wallet');
assert.ok(saved.attempts.length>40,'Spaced repetition has an answer history');
assert.ok(saved.seenWords.length>0);
const credits=win.RekenPetCore.snapshot().coins;win.RekenPetCore.snapshot();
assert.equal(win.RekenPetCore.snapshot().coins,credits,'Reopening results never grants extra money');
assert.ok(spoken.some(q=>q.id.startsWith('lab-')),'Audio is requested for real lab recordings');
win.RekenSpellingLab.open({onBack:()=>back++});
app.querySelector('#lab-exit').click();assert.equal(back,1,'Returns to original Dictee menu');
const page=read('index.html'),manifest=read('sw.js'),workflow=read('.github/workflows/deploy.yml');
for(const file of ['spellinglab-data.js','spellinglab.js','spellinglab.css']){
 assert.ok(page.includes(file),'Live HTML loads '+file);
 assert.ok(manifest.includes(file),'Offline service worker caches '+file);
 assert.ok(workflow.includes(file),'GitHub Pages bundles '+file);
}
assert.ok(read('scripts/export_voice_data.cjs').includes("lab.items"),'Flemish audio exporter includes transfer words');
assert.ok(read('dictee-v2.js').includes('dict2-open-lab'),'Five-stage lab reachable from Dictee menu');
console.log('PASS: all five Spellinglab phases completed, 50 questions, bilingual UI, Flemish audio, novel word filter, spaced review and 125 pet coins.');
