
'use strict';
(function(){
const STORE='rekenreis-progress-v1';
const TOPICS=[
 {id:'blocks',name:'Getallen herkennen',emoji:'🧱',short:'Honderdtallen, tientallen en eenheden',color:'#438ee8'},
 {id:'place',name:'Plaatswaarde',emoji:'🏰',short:'D, H, T en E begrijpen',color:'#16b885'},
 {id:'words',name:'Lezen en schrijven',emoji:'📚',short:'Getallen en getalwoorden',color:'#f0a12c'},
 {id:'line',name:'Getallen ordenen',emoji:'🚂',short:'Getallenlijn, sprongen en volgorde',color:'#a364ef'},
 {id:'compare',name:'Vergelijken',emoji:'⚖️',short:'<, >, =, ≤, ≥ en ≠',color:'#e85d89'}
];
const BELOW20=['nul','een','twee','drie','vier','vijf','zes','zeven','acht','negen','tien','elf','twaalf','dertien','veertien','vijftien','zestien','zeventien','achttien','negentien'];
const TENS=['','','twintig','dertig','veertig','vijftig','zestig','zeventig','tachtig','negentig'];
const appRoot=document.getElementById('app');
let data=load();
let state={screen:'home',session:null,answer:null,sort:[],installed:window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true};
let installPrompt=null;
const random=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
const pick=a=>a[random(0,a.length-1)];
const shuffle=a=>a.slice().sort(()=>Math.random()-.5);
const htmlSafe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function load(){try{let v=JSON.parse(localStorage.getItem(STORE)||'{}');return {name:typeof v.name==='string'?v.name:'Elena',sound:v.sound!==false,coins:Math.max(0,Number(v.coins)||0),history:Array.isArray(v.history)?v.history:[],sessions:Array.isArray(v.sessions)?v.sessions:[]};}catch(e){return {name:'Elena',sound:true,coins:0,history:[],sessions:[]}}}
function save(){try{localStorage.setItem(STORE,JSON.stringify(data))}catch(e){/* private browsing may block storage */}}
function dutch(n){
 if(n===1000)return 'duizend';
 if(n>=100){let h=Math.floor(n/100),r=n%100;return (h===1?'honderd':BELOW20[h]+'honderd')+(r?dutch(r):'')}
 if(n<20)return BELOW20[n];
 let t=Math.floor(n/10),u=n%10;
 if(!u)return TENS[t];
 return (u===2?'tweeën':u===3?'drieën':BELOW20[u]+'en')+TENS[t];
}
function scoreFor(id){let xs=data.history.filter(e=>e.topic===id);return {total:xs.length,correct:xs.filter(e=>e.correct).length,percent:xs.length?Math.round(100*xs.filter(e=>e.correct).length/xs.length):0}}
function topic(id){return TOPICS.find(x=>x.id===id)||TOPICS[0]}
function button(id,text,cls){return '<button class="btn '+(cls||'violet')+'" id="'+id+'" type="button">'+text+'</button>'}
function escapeAttr(s){return htmlSafe(s)}
function header(){
 return '<header class="topbar">'+
 '<button class="logo" id="logo" aria-label="Naar het startscherm"><span class="logo-badge">🦊</span><span><strong>Rekenreis</strong><small>Getallen tot 1.000 • Op avontuur!</small></span></button>'+
 '<div class="top-actions"><span class="pill star" title="Verdiende sterren">⭐ '+data.coins+'</span>'+
 '<button class="pill icon-btn" id="sound" aria-label="'+(data.sound?'Geluid uitzetten':'Geluid aanzetten')+'">'+(data.sound?'🔊':'🔇')+'</button>'+
 '<button class="pill" id="parents">👨‍👩‍👧 Resultaten</button></div></header>';
}
function render(){
 let body='';
 if(state.screen==='home')body=home();
 if(state.screen==='game')body=game();
 if(state.screen==='feedback')body=feedback();
 if(state.screen==='summary')body=summary();
 if(state.screen==='dashboard')body=dashboard();
 if(state.screen==='install')body=install();
 appRoot.innerHTML='<main class="shell">'+header()+body+'<footer class="footer">✨ Rekenreis • Speel, leer en groei • Je resultaten blijven op dit apparaat</footer></main>';
 connect('logo',()=>goHome());
 connect('parents',()=>{state.screen='dashboard';render()});
 connect('sound',()=>{data.sound=!data.sound;save();tone(true);render()});
 if(state.screen==='home')bindHome();
 if(state.screen==='game')bindGame();
 if(state.screen==='feedback')connect('next',advance);
 if(state.screen==='summary')bindSummary();
 if(state.screen==='dashboard')bindDashboard();
 if(state.screen==='install')connect('install-now',installNow);
}
function connect(id,callback){let x=document.getElementById(id);if(x)x.addEventListener('click',callback)}
function goHome(){if(state.screen==='game'&&state.session&&!confirm('Wil je stoppen met deze oefenronde?'))return;state.screen='home';state.session=null;state.sort=[];render()}
function totalPlayed(){return data.sessions.reduce((n,s)=>n+s.total,0)}
function home(){
 const count=data.sessions.length;
 let worlds=TOPICS.map((t,i)=>{
 const s=scoreFor(t.id);
 return '<button class="world" data-world="'+t.id+'" style="--world:'+t.color+'"><span class="num">WERELD '+(i+1)+'</span><span class="world-emoji">'+t.emoji+'</span>'+
 '<strong>'+t.name+'</strong><span class="descr">'+t.short+'</span>'+
 '<span class="world-foot"><span>'+(s.total?s.percent+'% goed':'Nog te ontdekken')+'</span><span class="mini-bar"><i style="width:'+s.percent+'%"></i></span></span></button>';
 }).join('');
 const total=data.history.length,correct=data.history.filter(x=>x.correct).length,pct=total?Math.round(correct/total*100):0;
 return '<section class="hero"><div class="copy"><div class="eyebrow">🌈 Welkom in het getallenrijk</div><h1>Hoi '+htmlSafe(data.name)+'! Klaar voor een rekenavontuur?</h1>'+
 '<p>Ontdek vijf leuke werelden, verzamel sterren en word een echte getallenheld!</p>'+button('start-exam','🎯 Start de oefentoets','primary')+'</div><div class="mascot" role="img" aria-label="Vrolijk vosje">🦊</div></section>'+
 '<div class="section-heading"><h2>🗺️ Kies jouw wereld</h2><span class="muted">5 avonturen</span></div><section class="worlds">'+worlds+'</section>'+
 '<section class="bottom-panels"><div class="panel"><h3>🏆 Mijn avontuur</h3><p>Je hebt al '+totalPlayed()+' vragen gespeeld in '+count+' oefenrondes.</p>'+
 '<div class="progress-track"><div style="width:'+pct+'%"></div></div><p style="margin-top:9px">'+(total?pct+'% goed beantwoord':'Begin je eerste avontuur!')+'</p>'+button('weak-practice','🪄 Oefen wat lastig is','outline')+'</div>'+
 '<div class="panel"><h3>📲 Ook op je iPad!</h3><p>Zet Rekenreis op je beginscherm. Daarna kun je zelfs zonder internet spelen.</p>'+button('installation','📱 Zo installeer je de app','outline')+'</div></section>';
}
function bindHome(){
 document.querySelectorAll('[data-world]').forEach(el=>el.addEventListener('click',()=>start('practice',el.getAttribute('data-world'))));
 connect('start-exam',()=>start('exam'));
 connect('weak-practice',()=>start('weak'));
 connect('installation',()=>{state.screen='install';render()});
}
function start(mode,id){
 let ids=[];
 if(mode==='practice')ids=Array(10).fill(id);
 else if(mode==='exam')ids=shuffle(TOPICS.flatMap(t=>Array(4).fill(t.id)));
 else{
 let ranked=TOPICS.slice().sort((a,b)=>{
  let x=scoreFor(a.id),y=scoreFor(b.id);
  return (x.total?x.percent:101)-(y.total?y.percent:101);
 });
 ids=Array(10).fill(null).map((_,i)=>ranked[i%3].id);
 ids=shuffle(ids);
 }
 let questions=ids.map(i=>generate(i));
 state.session={mode,topic:id||null,questions,idx:0,results:[],started:Date.now()};
 state.screen='game';state.answer=null;state.sort=[];render();
}
function generate(id){
 if(id==='blocks'){
 let n=Math.random()<.08?1000:random(101,998);
 let q={topic:id,kind:'number',n:n,answer:String(n),title:'Hoeveel is dit samen?',subtitle:'Tel de blauwe, groene en gele blokjes.',visual:'blocks'};
 q.explain=n===1000?'1 duizendtal = 1.000.':Math.floor(n/100)+' H = '+Math.floor(n/100)*100+' • '+Math.floor(n%100/10)+' T = '+Math.floor(n%100/10)*10+' • '+n%10+' E = '+n%10+'. Samen is dat '+n+'.';
 return q;
 }
 if(id==='place'){
 let n=random(101,999),kind=pick(['expanded','value','count','expanded']);
 let h=Math.floor(n/100),t=Math.floor(n%100/10),e=n%10;
 if(kind==='expanded')return {topic:id,kind:'number',answer:String(n),title:'Welk getal hoort hierbij?',subtitle:h+' H + '+t+' T + '+e+' E',visual:'expanded',h,t,e,n,explain:h+' honderdtallen, '+t+' tientallen en '+e+' eenheden = '+n+'.'};
 if(kind==='value'){let pos=pick(['H','T','E']);let val=pos==='H'?h*100:pos==='T'?t*10:e;return {topic:id,kind:'number',answer:String(val),title:'Wat is de waarde van de '+pos+'?',subtitle:'Kijk naar het getal '+n+'.',n,visual:'place',explain:'De '+pos+' staat voor '+(pos==='H'?'honderdtallen':pos==='T'?'tientallen':'eenheden')+'. De waarde is '+val+'.'};}
 let pos=pick(['H','T','E']),val=pos==='H'?h:pos==='T'?t:e;
 return {topic:id,kind:'number',answer:String(val),title:'Hoeveel '+(pos==='H'?'honderdtallen':pos==='T'?'tientallen':'eenheden')+' zijn er?',subtitle:'Bekijk het getal '+n+'.',n,visual:'place',explain:'In '+n+' staat bij de '+pos+' het cijfer '+val+'.'};
 }
 if(id==='words'){
 let n=Math.random()<.05?1000:random(0,999),word=dutch(n),kind=pick(['number','word']);
 if(kind==='number')return {topic:id,kind:'number',answer:String(n),title:'Welk getal lees je?',subtitle:word,visual:'word',word,explain:word+' = '+n+'.'};
 let wrong=[];
 while(wrong.length<3){let k=Math.max(0,Math.min(1000,n+pick([-100,-10,-9,-2,-1,1,2,9,10,100])));let w=dutch(k);if(k!==n&&!wrong.includes(w))wrong.push(w)}
 return {topic:id,kind:'choices',answer:word,choices:shuffle([word].concat(wrong)),title:'Hoe schrijf je dit getal?',subtitle:String(n),visual:'number',n,explain:n+' schrijf je als '+word+'.'};
 }
 if(id==='line'){
 let kind=pick(['sequence','sequence','neighbor','sort']);
 if(kind==='sequence'){
 let step=pick([1,2,5,10,50,100]),start=random(0,Math.floor((1000-6*step)/step))*step,slot=random(1,5);
 let arr=Array(7).fill(0).map((_,i)=>start+i*step);
 return {topic:id,kind:'number',answer:String(arr[slot]),title:'Welk getal ontbreekt op de getallenlijn?',subtitle:'Tel met sprongen van '+step+'.',visual:'line',arr,slot,explain:'Elke sprong is '+step+'. Het ontbrekende getal is '+arr[slot]+'.'};
 }
 if(kind==='neighbor'){
 let n=random(1,999),dir=pick([-1,1,0]),answer=n+dir;
 let title=dir===-1?'Welk getal komt juist vóór '+n+'?':dir===1?'Welk getal komt juist na '+n+'?':'Welk getal staat tussen '+(n-1)+' en '+(n+1)+'?';
 return {topic:id,kind:'number',answer:String(answer),title,subtitle:'Denk aan de volgorde van de getallen.',visual:'number',n,explain:dir===-1?n+' - 1 = '+answer+'.':dir===1?n+' + 1 = '+answer+'.':'Tussen '+(n-1)+' en '+(n+1)+' staat '+n+'.'};
 }
 let nums=[];while(nums.length<4){let n=random(10,1000);if(!nums.includes(n))nums.push(n)}
 let asc=Math.random()<.5,solution=nums.slice().sort((a,b)=>asc?a-b:b-a);
 return {topic:id,kind:'sort',answer:solution.join(','),nums,solution,title:asc?'Zet de getallen van klein naar groot.':'Zet de getallen van groot naar klein.',subtitle:'Tik de getallen in de juiste volgorde.',visual:'sort',explain:'De juiste volgorde is '+solution.join(' → ')+'.'};
 }
 let a=random(0,1000),b=Math.random()<.20?a:random(0,1000);
 let kind=Math.random()<.65?'relation':'truth';
 if(kind==='relation')return {topic:id,kind:'choices',choices:['<','=','>'],answer:a<b?'<':a>b?'>':'=',title:'Welk teken hoort ertussen?',subtitle:a+'   ?   '+b,visual:'compare',a,b,explain:a+(a<b?' is kleiner dan ':a>b?' is groter dan ':' is gelijk aan ')+b+'.'};
 let op=pick(['<','>','=','≤','≥','≠']),valid={'<':a<b,'>':a>b,'=':a===b,'≤':a<=b,'≥':a>=b,'≠':a!==b}[op];
 return {topic:id,kind:'choices',choices:['Waar','Niet waar'],answer:valid?'Waar':'Niet waar',title:'Is deze vergelijking waar?',subtitle:a+' '+op+' '+b,visual:'compare',a,b,explain:'“'+a+' '+op+' '+b+'” is '+(valid?'waar':'niet waar')+'.'};
}
function visual(q){
 if(q.visual==='blocks'){
 let n=q.n,h=Math.floor(n/100),t=Math.floor(n%100/10),e=n%10;
 if(n===1000)return '<div class="block-col"><div class="thousand">1.000</div><small>1 D</small></div>';
 return '<div class="block-grid"><div class="block-col"><div class="block-group">'+Array(h).fill('<span class="hundred"></span>').join('')+'</div><small>H (100)</small></div>'+
 '<div class="block-col"><div class="block-group">'+Array(t).fill('<span class="ten"></span>').join('')+'</div><small>T (10)</small></div>'+
 '<div class="block-col"><div class="block-group">'+Array(e).fill('<span class="one"></span>').join('')+'</div><small>E (1)</small></div></div>';
 }
 if(q.visual==='place')return '<div style="width:100%">'+placeStrip(q.n)+'<p class="place-caption">D = duizendtal • H = honderdtal • T = tiental • E = eenheid</p></div>';
 if(q.visual==='expanded')return '<div style="width:100%">'+placeStrip(q.n)+'<p class="place-caption">'+q.h+' × 100 + '+q.t+' × 10 + '+q.e+' × 1 = ?</p></div>';
 if(q.visual==='word')return '<div class="math-word">'+htmlSafe(q.word)+'</div>';
 if(q.visual==='number')return '<div class="math-number">'+q.n+'</div>';
 if(q.visual==='compare')return '<div class="math-number">'+q.a+' <span style="color:#c89a21">?</span> '+q.b+'</div>';
 if(q.visual==='sort')return '<span class="hint">🔢 Welke volgorde klopt?</span>';
 if(q.visual==='line')return '<div class="numberline">'+q.arr.map((n,i)=>'<div class="line-tick '+(i===q.slot?'selected':'')+'">'+(i===q.slot?'❓':n)+'</div>').join('')+'</div>';
 return '';
}
function placeStrip(n){
 let d=Math.floor(n/1000),h=Math.floor(n%1000/100),t=Math.floor(n%100/10),e=n%10;
 return '<div class="place-strip">'+[['D',d],['H',h],['T',t],['E',e]].map(x=>'<div class="place-cell"><strong>'+x[0]+'</strong><span>'+x[1]+'</span></div>').join('')+'</div>';
}
function game(){
 let s=state.session,q=s.questions[s.idx],currentTopic=topic(q.topic);
 let result='';
 if(q.kind==='number'){
 result='<form id="answer-form" class="answer-area"><label class="center" for="answer" style="display:block;font-weight:900">Jouw antwoord</label><input id="answer" class="answer-number" type="number" min="0" max="1000" inputmode="numeric" autocomplete="off" required aria-label="Jouw antwoord"><p class="error-text center" id="error" aria-live="polite"></p><div class="center"><button class="btn violet" type="submit">✅ Controleer</button></div></form>';
 }
 if(q.kind==='choices')result='<div class="choices '+(q.choices.length===3?'compare-options':'')+'">'+q.choices.map((val,i)=>'<button class="choice" data-answer="'+i+'">'+htmlSafe(val)+'</button>').join('')+'</div>';
 if(q.kind==='sort'){
 let available=q.nums.map((v,i)=>state.sort.includes(i)?'':'<button class="token" data-sort="'+i+'">'+v+'</button>').join('');
 let selected=state.sort.map(i=>'<span class="token done">'+q.nums[i]+'</span>').join(' ');
 result='<div class="answer-area"><div class="sorted-list">'+(selected||'👆 Kies eerst het eerste getal')+'</div><div class="sort-tokens">'+available+'</div><div class="result-actions">'+button('undo-sort','↶ Opnieuw','outline')+button('send-sort','✅ Controleer','violet')+'</div></div>';
 }
 return '<section class="game"><div class="game-head">'+button('back-game','← Terug','outline')+'<div class="game-label"><strong>'+currentTopic.emoji+' '+(s.mode==='exam'?'Oefentoets':s.mode==='weak'?'Extra oefenen':currentTopic.name)+'</strong><small>Vraag '+(s.idx+1)+' van '+s.questions.length+'</small></div><div class="counter">⭐ '+s.results.filter(r=>r.correct).length+' / '+s.idx+'</div></div>'+
 '<div class="step-progress"><div style="width:'+(s.idx/s.questions.length*100)+'%"></div></div>'+
 '<article class="question-card"><div class="question-eyebrow">✨ '+currentTopic.name+'</div><h2>'+htmlSafe(q.title)+'</h2><p class="hint">'+htmlSafe(q.subtitle)+'</p><div class="visual-area">'+visual(q)+'</div>'+result+'</article></section>';
}
function bindGame(){
 connect('back-game',goHome);
 const q=state.session.questions[state.session.idx];
 if(q.kind==='number'){
 const form=document.getElementById('answer-form');
 form.addEventListener('submit',e=>{
 e.preventDefault();let inp=document.getElementById('answer'),v=inp.value.trim();
 if(v===''||!/^\d+$/.test(v)||Number(v)>1000){document.getElementById('error').textContent='Vul een getal tussen 0 en 1.000 in.';return}
 answer(v);
 });
 }
 if(q.kind==='choices')document.querySelectorAll('[data-answer]').forEach(x=>x.addEventListener('click',()=>answer(q.choices[Number(x.getAttribute('data-answer'))])));
 if(q.kind==='sort'){
 document.querySelectorAll('[data-sort]').forEach(x=>x.addEventListener('click',()=>{state.sort.push(Number(x.getAttribute('data-sort')));render()}));
 connect('undo-sort',()=>{state.sort=[];render()});
 connect('send-sort',()=>{if(state.sort.length===q.nums.length)answer(state.sort.map(i=>q.nums[i]).join(','));else{let out=document.querySelector('.sorted-list');if(out)out.setAttribute('aria-label','Kies alle vier de getallen')}})
 }
}
function answer(value){
 if(state.screen!=='game')return;
 let s=state.session,q=s.questions[s.idx];
 let correct=String(value)===String(q.answer);
 s.results.push({topic:q.topic,correct,question:q.title,expected:q.answer,given:String(value)});
 data.history.push({date:new Date().toISOString(),topic:q.topic,correct,question:q.title,expected:q.answer,given:String(value)});
 if(data.history.length>1000)data.history=data.history.slice(-1000);
 if(correct)data.coins+=10;
 save();tone(correct);state.answer={correct,value,q};state.screen='feedback';render();
}
function tone(ok){
 if(!data.sound)return;
 try{
 let AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
 let ctx=new AC();
 [0,.11].forEach((delay,i)=>{let o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=ok?[660,880][i]:[300,250][i];g.gain.setValueAtTime(.0001,ctx.currentTime+delay);g.gain.exponentialRampToValueAtTime(.07,ctx.currentTime+delay+.01);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+delay+.14);o.connect(g);g.connect(ctx.destination);o.start(ctx.currentTime+delay);o.stop(ctx.currentTime+delay+.16)});setTimeout(()=>ctx.close(),650);
 }catch(e){/* sound is optional */}
}
function feedback(){
 let a=state.answer,s=state.session;
 return '<section class="game"><article class="question-card feedback">'+
 '<div class="feedback-icon confetti">'+(a.correct?'🌟':'💡')+'</div>'+
 '<h2>'+(a.correct?'Supergoed gedaan!':'Dat geeft niet!')+'</h2>'+
 '<p>'+(a.correct?'Je verdient 10 sterren! Ga zo door, rekenheld!':'Van proberen word je slimmer. Bekijk het goede antwoord.')+'</p>'+
 '<div class="explain"><strong>'+(a.correct?'✅ Goed antwoord!':'✅ Het goede antwoord: '+htmlSafe(a.q.answer))+'</strong><p>'+htmlSafe(a.q.explain)+'</p></div>'+
 button('next',s.idx+1===s.questions.length?'🏆 Bekijk mijn score':'Volgende vraag →','violet')+
 '</article></section>';
}
function advance(){
 const s=state.session;
 if(s.idx+1<s.questions.length){s.idx++;state.sort=[];state.answer=null;state.screen='game';render();return}
 let correct=s.results.filter(r=>r.correct).length,percent=Math.round(100*correct/s.questions.length);
 data.sessions.push({date:new Date().toISOString(),mode:s.mode,topic:s.topic||'mixed',total:s.questions.length,correct,percent});
 data.sessions=data.sessions.slice(-100);save();state.screen='summary';render();
}
function summary(){
 const s=state.session,correct=s.results.filter(r=>r.correct).length,percent=Math.round(100*correct/s.results.length);
 let stars=percent>=90?'⭐⭐⭐':percent>=65?'⭐⭐':'⭐';
 let misses=s.results.filter(x=>!x.correct);
 return '<section class="game"><article class="question-card feedback">'+
 '<div class="feedback-icon">🏆</div><h2>Avontuur afgerond!</h2><div class="stars-big">'+stars+'</div>'+
 '<div class="summary-score">'+percent+'%</div>'+
 '<p>Je had <strong>'+correct+' van de '+s.results.length+'</strong> vragen goed. '+(percent>=80?'Fantastisch gewerkt!':'Elke oefening maakt je sterker!')+'</p>'+
 '<div class="score-grid" style="width:100%"><div class="score-tile"><strong>'+correct+'</strong><small>Goed</small></div><div class="score-tile"><strong>'+misses.length+'</strong><small>Bijleren</small></div><div class="score-tile"><strong>+'+(correct*10)+'</strong><small>Sterren</small></div></div>'+
 (misses.length?'<div class="explain"><strong>💡 Dit kun je nog oefenen:</strong><p>'+htmlSafe([...new Set(misses.map(m=>topic(m.topic).name))].join(', '))+'.</p></div>':'<div class="explain">🎉 Alles goed! Jij bent een echte getallenkampioen!</div>')+
 '<div class="result-actions">'+button('redo','🔁 Nog een rondje','violet')+button('dash-summary','📊 Mijn resultaten','outline')+button('home-summary','🏠 Startscherm','outline')+'</div></article></section>';
}
function bindSummary(){
 connect('redo',()=>start(state.session.mode,state.session.topic));
 connect('dash-summary',()=>{state.screen='dashboard';render()});
 connect('home-summary',()=>goHome());
}
function dashboard(){
 let total=data.history.length,correct=data.history.filter(x=>x.correct).length,pct=total?Math.round(correct/total*100):0;
 let rows=TOPICS.map(t=>{let s=scoreFor(t.id);return '<div class="report-row"><div class="round-emoji">'+t.emoji+'</div><div><strong>'+t.name+'</strong><small>'+(s.total?s.correct+' van '+s.total+' goed':'Nog niet geoefend')+'</small><div class="mini-bar"><i style="width:'+s.percent+'%;background:'+t.color+'"></i></div></div><div class="stat">'+(s.total?s.percent+'%':'–')+'</div></div>'}).join('');
 let sessions=data.sessions.slice(-5).reverse().map(s=>'<div class="report-row"><div class="round-emoji">🎯</div><div><strong>'+htmlSafe(s.mode==='exam'?'Oefentoets':s.topic==='mixed'?'Extra oefenen':topic(s.topic).name)+'</strong><small>'+new Date(s.date).toLocaleDateString('nl-BE')+' • '+s.correct+'/'+s.total+' juist</small></div><div class="stat">'+s.percent+'%</div></div>').join('');
 return '<section class="dashboard"><div class="game-head">'+button('back-dashboard','← Terug','outline')+'<div class="game-label"><strong>👨‍👩‍👧 Resultaten voor ouders</strong><small>Overzicht van de voortgang</small></div></div>'+
 '<article class="question-card"><h2>📊 '+htmlSafe(data.name)+'s resultaten</h2>'+
 '<div class="score-grid"><div class="score-tile"><strong>'+total+'</strong><small>Vragen</small></div><div class="score-tile"><strong>'+pct+'%</strong><small>Goed</small></div><div class="score-tile"><strong>'+data.sessions.length+'</strong><small>Oefenrondes</small></div></div>'+
 '<h3>Per onderwerp</h3><div class="report-list">'+rows+'</div>'+
 '<h3>Laatste oefenrondes</h3><div class="report-list">'+(sessions||'<div class="empty">Nog geen oefenrondes. Begin je eerste avontuur!</div>')+'</div>'+
 '<div class="result-actions">'+button('export-results','⬇️ Download rapport','violet')+button('share-results','↗ Deel resultaten','outline')+'</div>'+
 '<div class="panel" style="margin-top:24px;background:#fafaff"><h3>⚙️ Instellingen</h3><label for="child-name" class="muted">Voornaam / bijnaam</label><input id="child-name" maxlength="24" style="display:block;width:100%;max-width:300px;margin:9px 0;padding:12px;border:2px solid #deddf8;border-radius:13px" value="'+escapeAttr(data.name)+'">'+button('save-name','Naam bewaren','outline')+
 '<p class="privacy" style="margin-top:13px">🔒 Alles blijft lokaal op dit toestel. Een ander apparaat heeft een eigen voortgang. Alleen als je het rapport zelf deelt, worden resultaten gedeeld.</p></div></article></section>';
}
function reportText(){
 let total=data.history.length,c=data.history.filter(x=>x.correct).length;
 return 'REKENREIS – RAPPORT\nLeerling: '+data.name+'\nDatum: '+new Date().toLocaleDateString('nl-BE')+'\nTotaal: '+c+' / '+total+'\n'+TOPICS.map(t=>{let x=scoreFor(t.id);return t.name+': '+x.correct+'/'+x.total+' ('+x.percent+'%)'}).join('\n');
}
function bindDashboard(){
 connect('back-dashboard',goHome);
 connect('save-name',()=>{let name=document.getElementById('child-name').value.trim().slice(0,24);data.name=name||'Rekenheld';save();render()});
 connect('export-results',()=>{
 const header='Datum;Onderwerp;Goed;Vraag;Gegeven antwoord;Juist antwoord';
 const rows=data.history.map(h=>[h.date,topic(h.topic).name,h.correct?'ja':'nee',h.question,h.given,h.expected].map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';'));
 const csv='\ufeff'+[header].concat(rows).join('\r\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='Rekenreis-resultaten.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 connect('share-results',async()=>{
 const text=reportText();
 try{if(navigator.share)await navigator.share({title:'Rekenreis resultaten',text});else if(navigator.clipboard){await navigator.clipboard.writeText(text);alert('Het rapport is gekopieerd!')}else{alert(text)}}catch(e){if(e.name!=='AbortError')alert('Delen is niet gelukt. Gebruik Download rapport.')}
 });
}
function install(){
 let installed=state.installed;
 return '<section class="dashboard"><div class="game-head">'+button('back-install','← Terug','outline')+'</div><article class="question-card"><h2>📲 Zet Rekenreis op je iPad</h2>'+
 '<p class="hint">Speel als een echte app, vanaf je beginscherm. Geen App Store nodig!</p>'+
 '<ol class="install-steps"><li>Open de website in <strong>Safari</strong> op je iPad.</li><li>Tik op <strong>Delen</strong> (vierkant met een pijltje omhoog).</li><li>Kies <strong>Zet op beginscherm</strong> / <strong>Add to Home Screen</strong>.</li><li>Tik op <strong>Voeg toe</strong>. Het Rekenreis-icoon staat nu op je iPad!</li></ol>'+
 '<div class="tip">'+(installed?'✅ Je gebruikt Rekenreis al als een geïnstalleerde app.':'💡 Open de app één keer met internet om alle oefeningen offline beschikbaar te maken.')+'</div>'+
 '<div class="result-actions">'+button('install-now','✨ Installeer wanneer mogelijk','violet')+button('home-install','🏠 Startscherm','outline')+'</div></article></section>';
}
function installNow(){if(installPrompt){installPrompt.prompt();installPrompt.userChoice.then(()=>{installPrompt=null;render()})}else alert('Op je iPad: open in Safari, tik op Delen en kies Zet op beginscherm.')}
document.addEventListener('click',e=>{if(e.target&&e.target.id==='back-install')goHome();if(e.target&&e.target.id==='home-install')goHome()});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e});
if('serviceWorker'in navigator && /^https?:$/.test(location.protocol))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
})();