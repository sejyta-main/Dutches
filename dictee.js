'use strict';
/* Independent, offline-friendly Flemish dictation adventure for Wordpakket 7. */
(function(){
 const KEY='rekenreis-dictee-v1';
 const WORDS=[
  {word:'babbelen',cue:'we',ending:'elen',meaning:'gezellig met elkaar praten',es:'charlar',example:'We babbelen gezellig op de speelplaats.'},
  {word:'winkelen',cue:'we',ending:'elen',meaning:'in winkels rondkijken en soms iets kopen',es:'ir de compras',example:'We gaan zaterdag samen winkelen.'},
  {word:'knutselen',cue:'we',ending:'elen',meaning:'iets maken met je handen, papier en lijm',es:'hacer manualidades',example:'We knutselen een mooie papieren bloem.'},
  {word:'kriebelen',cue:'we',ending:'elen',meaning:'een tintelend of jeukend gevoel geven',es:'hacer cosquillas',example:'De veer kan op mijn arm kriebelen.'},
  {word:'rinkelen',cue:'we',ending:'elen',meaning:'een helder belgeluid maken',es:'sonar o tintinear',example:'De kleine belletjes rinkelen aan de fiets.'},
  {word:'wandelen',cue:'we',ending:'elen',meaning:'rustig te voet op stap gaan',es:'pasear',example:'We wandelen in het bos.'},
  {word:'openen',cue:'we',ending:'enen',meaning:'iets opendoen of openmaken',es:'abrir',example:'We openen voorzichtig de doos.'},
  {word:'oefenen',cue:'we',ending:'enen',meaning:'iets herhalen om het beter te kunnen',es:'practicar',example:'We oefenen de woorden voor het dictee.'},
  {word:'regenen',cue:'',ending:'enen',meaning:'als er water uit de wolken valt',es:'llover',example:'Morgen kan het weer regenen.'},
  {word:'anderen',cue:'de',ending:'eren',meaning:'andere mensen of andere dingen',es:'los demás',example:'De anderen spelen nog op het plein.'},
  {word:'fluisteren',cue:'we',ending:'eren',meaning:'heel zacht praten',es:'susurrar',example:'We fluisteren in de bibliotheek.'},
  {word:'bibberen',cue:'we',ending:'eren',meaning:'trillen omdat je het koud hebt of bang bent',es:'tiritar',example:'We bibberen in de koude wind.'},
  {word:'gisteren',cue:'',ending:'eren',meaning:'de dag vóór vandaag',es:'ayer',example:'Gisteren heb ik buiten gespeeld.'},
  {word:'bladeren',cue:'de',ending:'eren',meaning:'de platte groene delen van bomen en planten',es:'hojas',example:'In de herfst vallen de bladeren.'},
  {word:'kinderen',cue:'de',ending:'eren',meaning:'jonge mensen, jongens en meisjes',es:'niños',example:'De kinderen spelen op de speelplaats.'},
  {word:'donderen',cue:'',ending:'eren',meaning:'het zware geluid dat je bij onweer hoort',es:'tronar',example:'Bij een storm kan het luid donderen.'},
  {word:'eieren',cue:'de',ending:'eren',meaning:'voedsel dat onder andere door kippen wordt gelegd',es:'huevos',example:'De kip legt drie eieren.'},
  {word:'betere',cue:'',ending:'ere',meaning:'van een hogere kwaliteit, minder fouten',es:'mejor',example:'Ik heb een betere oplossing gevonden.'},
  {word:'dappere',cue:'',ending:'ere',meaning:'moedige; iemand die iets durft',es:'valiente',example:'De dappere brandweervrouw helpt de kat.'},
  {word:'iedere',cue:'',ending:'ere',meaning:'elk of elke persoon of zaak',es:'cada',example:'Iedere leerling krijgt een potlood.'}
 ];
 const WMAP=new Map(WORDS.map(w=>[w.word,w]));
 const shuffle=a=>{const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
 const clean=s=>String(s).normalize('NFC').trim().toLocaleLowerCase('nl-BE').replace(/\s+/g,' ').replace(/^(we|de)\s+/,'').trim();
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let store=load(),page='menu',session=null,current=null,onBack=()=>{},voices=[],voiceLabel='Stem wordt gezocht…',voiceAvailable=false;
 function load(){try{let d=JSON.parse(localStorage.getItem(KEY)||'{}');return {history:Array.isArray(d.history)?d.history:[],sessions:Array.isArray(d.sessions)?d.sessions:[]}}catch(e){return {history:[],sessions:[]}}}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(store))}catch(e){}}
 function findVoice(){
  voices=typeof speechSynthesis!=='undefined'?speechSynthesis.getVoices():[];
  const exact=voices.find(v=>/^nl[-_]BE$/i.test(v.lang))||
   voices.find(v=>(v.lang||'').toLowerCase().startsWith('nl-be'))||
   voices.find(v=>/vlaam|flemish|belg/i.test(v.name)&&/^nl/i.test(v.lang));
  voiceAvailable=Boolean(exact);
  voiceLabel=exact?'🇧🇪 Vlaamse stem: '+exact.name:'🇧🇪 Vlaamse uitspraak gevraagd (nl-BE); controleer de stem op dit toestel.';
  return exact;
 }
 function speechText(w){return (w.cue?w.cue+' ':'')+w.word}
 function speak(w,slow=false){
  if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)){status('Audio is niet beschikbaar in deze browser.');return}
  const voice=findVoice();
  try{
   speechSynthesis.cancel();
   const u=new SpeechSynthesisUtterance(speechText(w));
   // Always request Flemish. Never explicitly choose a Netherlands voice.
   u.lang='nl-BE';if(voice)u.voice=voice;
   u.rate=slow?.68:.86;u.pitch=1;u.volume=1;
   u.onerror=()=>status('Het geluid werkt niet. Controleer het volume en de Nederlandse (België) stem op je iPad.');
   speechSynthesis.speak(u);
   if(!voiceAvailable)status('Let op: geen Vlaamse stem gevonden in de stemlijst. Je iPad kiest mogelijk een andere uitspraak.');
   else status(voiceLabel);
  }catch(e){status('Het geluid kon niet worden afgespeeld.')}
 }
 function status(message){const el=document.getElementById('dict-voice-status');if(el)el.textContent=message}
 function btn(id,label,style='violet'){return '<button class="btn '+style+'" id="'+id+'" type="button">'+label+'</button>'}
 function shell(body){
  document.getElementById('app').innerHTML='<main class="shell dictee-shell"><header class="topbar">'+
  '<button class="logo" id="dictee-logo"><span class="logo-badge">🦊</span><span><strong>Rekenreis</strong><small>Dictee-eiland · Woordpakket 7</small></span></button>'+
  '<span class="pill star">✏️ Spellingpret</span></header>'+body+'<footer class="footer">🇧🇪 Woordpakket 7 • 20 woorden • Oefenen op je eigen tempo</footer></main>';
  bind('dictee-logo',exit);
 }
 function bind(id,fn){let el=document.getElementById(id);if(el)el.addEventListener('click',fn)}
 function exit(){try{speechSynthesis.cancel()}catch(e){}const back=onBack;page='menu';session=null;back()}
 function open(args={}){
  onBack=typeof args.onBack==='function'?args.onBack:()=>location.reload();
  page=args.page==='report'?'report':'menu';session=null;show();
 }
 function count(){return store.history.length}
 function wrongWords(){const stats=new Map();for(const row of store.history){const old=stats.get(row.word)||{wrong:0,right:0};if(row.correct)old.right++;else old.wrong++;stats.set(row.word,old)}return WORDS.filter(w=>{const s=stats.get(w.word);return s&&s.wrong>s.right}).map(w=>w.word)}
 function show(){if(page==='menu')menu();if(page==='play')play();if(page==='result')result();if(page==='finish')finish();if(page==='report')report()}
 function menu(){
  const played=count(),right=store.history.filter(a=>a.correct).length,percent=played?Math.round(right/played*100):0,errors=wrongWords();
  shell('<section class="dict-hero"><div><div class="eyebrow">🇧🇪 Nederlands · Woordpakket 7</div><h1>🎙️ Dictee-eiland</h1><p>Luister goed, schrijf het woord en verzamel schitterende sterren!</p><span class="dict-chip">✏️ 20 woorden</span> <span class="dict-chip">🔊 Vlaamse uitspraak</span></div><div class="dict-hero-art" aria-hidden="true">🎧✏️</div></section>'+
  '<section class="panel dict-panel"><div class="section-heading"><h2>🌟 Kies jouw dictee</h2></div>'+
  '<div class="dict-modes"><button class="dict-mode" data-mode="short"><span>⚡</span><strong>Korte oefenronde</strong><small>10 willekeurige woorden</small></button>'+
  '<button class="dict-mode" data-mode="full"><span>🏆</span><strong>Hele woordpakket</strong><small>Alle 20 woorden, in andere volgorde</small></button>'+
  '<button class="dict-mode" data-mode="mistakes"><span>💪</span><strong>Mijn moeilijke woorden</strong><small>'+(errors.length?errors.length+' woorden om extra te oefenen':'Eerst wat woorden oefenen')+'</small></button></div>'+
  '<div class="result-actions">'+btn('dict-report','📊 Mijn dictee-resultaten','outline')+btn('dict-home','🏠 Terug naar de werelden','outline')+'</div>'+
  '<p class="dict-note">📖 Je hoort de woorden eerst. Daarna typ je alleen het woord, niet “we” of “de”. Na je antwoord zie je de betekenis, een voorbeeldzin en optioneel de spellingregel.</p>'+
  '<p class="dict-note">🔈 <strong>Uitspraak:</strong> deze app vraagt Nederlands (België) aan. De uiteindelijke stem hangt af van de stemmen die op de iPad beschikbaar zijn.</p>'+
  '</section><div class="bottom-panels"><div class="panel"><h3>🎯 Dit heb je al geoefend</h3><p>'+played+' antwoorden • '+percent+'% juist</p><div class="progress-track"><div style="width:'+percent+'%"></div></div></div><div class="panel"><h3>👂 Luistertip</h3><p>Hoor je de zachte <strong>e</strong> in <strong>-enen, -elen, -eren</strong>? Die noem je een <em>doffe e</em>.</p></div></div>');
  document.querySelectorAll('[data-mode]').forEach(el=>el.addEventListener('click',()=>start(el.dataset.mode)));
  bind('dict-report',()=>{page='report';show()});bind('dict-home',exit);
 }
 function start(mode){
  const words=mode==='mistakes'?wrongWords():WORDS.map(w=>w.word);
  if(!words.length){status('Nog geen moeilijke woorden. Kies een oefenronde.');return}
  let order=shuffle(words);
  if(mode==='short')order=order.slice(0,10);
  session={mode,order,idx:0,results:[],started:new Date().toISOString()};
  page='play';show();speak(WMAP.get(order[0]));
 }
 function play(){
  let w=WMAP.get(session.order[session.idx]),pct=Math.round(session.idx/session.order.length*100);
  shell('<section class="game dict-game"><div class="game-head">'+btn('dict-back','← Stoppen','outline')+
  '<div class="game-label"><strong>🎧 Dictee · Woordpakket 7</strong><small>Woord '+(session.idx+1)+' van '+session.order.length+'</small></div><span class="counter">⭐ '+session.results.filter(r=>r.correct).length+'</span></div>'+
  '<div class="step-progress"><div style="width:'+pct+'%"></div></div><article class="question-card">'+
  '<div class="question-eyebrow">👂 Luister en schrijf</div><h2>Welk woord hoor je?</h2><p class="hint">Tik op de luidspreker. Schrijf daarna het woord dat je hoort.</p>'+
  '<div class="dict-listening"><div class="dict-speaker" aria-hidden="true">🎙️</div><div class="dict-audio-buttons">'+btn('dict-listen','🔊 Luister','violet')+btn('dict-slow','🐢 Langzaam','outline')+'</div>'+
  '<p class="dict-note" id="dict-voice-status" aria-live="polite">'+esc(voiceLabel)+'</p></div>'+
  '<form id="dict-form" class="answer-area"><label for="dict-input" class="dict-label">✏️ Schrijf het woord hier</label><input id="dict-input" class="dict-input" type="text" lang="nl-BE" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" enterkeyhint="done" maxlength="40" placeholder="Typ het woord…" required>'+
  '<p class="error-text center" id="dict-error" aria-live="polite"></p><div class="center"><button class="btn green" type="submit">✅ Controleer mijn woord</button></div></form>'+
  '</article></section>');
  bind('dict-back',()=>{if(confirm('Wil je dit dictee stoppen?')){try{speechSynthesis.cancel()}catch(e){}page='menu';session=null;show()}});
  bind('dict-listen',()=>speak(w));bind('dict-slow',()=>speak(w,true));
  document.getElementById('dict-form').addEventListener('submit',ev=>{
   ev.preventDefault();const input=document.getElementById('dict-input');const raw=input.value.trim();if(!raw){document.getElementById('dict-error').textContent='Typ eerst een woord.';return}
   const correct=clean(raw)===w.word;
   try{speechSynthesis.cancel()}catch(e){}
   current={word:w,correct,given:raw};
   const record={date:new Date().toISOString(),word:w.word,given:raw,correct};
   session.results.push(record);store.history.push(record);if(store.history.length>1500)store.history=store.history.slice(-1500);save();
   page='result';show();
  });
 }
 function highlight(w){
  const s=w.word,ending=w.ending,i=s.length-ending.length;
  return '<span>'+esc(s.slice(0,i))+'</span><mark>'+esc(s.slice(i))+'</mark>';
 }
 function rule(w){
  const ending=w.ending;
  const suffix=ending==='ere'?'de uitgang <strong>-ere</strong>':'de uitgang <strong>-'+ending+'</strong>';
  return '<p>In dit woord hoor je een <strong>doffe e</strong> (een zachte, onbeklemtoonde e). Je schrijft '+suffix+'.</p>'+
  '<p>Luister naar het volledige woord en oefen het goed onthouden. Voorbeelden uit dit woordpakket: <strong>kinderen</strong> (-eren), <strong>winkelen</strong> (-elen) en <strong>oefenen</strong> (-enen).</p>'+
  '<p><strong>Let op:</strong> “betere”, “dappere” en “iedere” eindigen op <strong>-ere</strong>; niet op -eren.</p>';
 }
 function result(){
  const w=current.word,other=current.correct?'':'<div class="dict-mistake">Je schreef: <strong>'+esc(current.given)+'</strong></div>';
  shell('<section class="game dict-game"><article class="question-card dict-feedback"><div class="feedback-icon">'+(current.correct?'🌈':'💜')+'</div>'+
  '<h2>'+(current.correct?'Helemaal juist!':'Goed geprobeerd!')+'</h2><p>'+(current.correct?'Wat knap! Je hebt het juist gespeld.':'Dit woord kun je nog een keer oefenen. Kijk goed hoe je het schrijft.')+'</p>'+
  '<div class="dict-answer">'+other+'<div class="dict-bigword">'+highlight(w)+'</div><p>Het woord is: <strong>'+esc(w.word)+'</strong></p></div>'+
  '<div class="dict-definition"><strong>📖 Betekenis</strong><p>'+esc(w.meaning)+'</p><small>🇪🇸 '+esc(w.es)+'</small></div>'+
  '<div class="dict-definition"><strong>💬 Voorbeeldzin</strong><p>'+esc(w.example)+'</p></div>'+
  '<div class="result-actions">'+btn('dict-hear','🔊 Beluister nog eens','outline')+btn('dict-rule','🧠 Leg de spellingregel uit','outline')+'</div>'+
  '<div class="dict-rulebox" id="dict-rulebox" hidden><strong>✨ Spellingregel: doffe e</strong>'+rule(w)+'</div>'+
  '<div class="result-actions">'+btn('dict-next',session.idx+1<session.order.length?'Volgend woord →':'🏆 Bekijk mijn score','violet')+'</div></article></section>');
  bind('dict-hear',()=>speak(w));bind('dict-rule',()=>{const x=document.getElementById('dict-rulebox');x.hidden=!x.hidden});
  bind('dict-next',()=>{
   session.idx++;
   if(session.idx<session.order.length){page='play';show();speak(WMAP.get(session.order[session.idx]))}
   else{const right=session.results.filter(r=>r.correct).length;store.sessions.push({date:new Date().toISOString(),mode:session.mode,total:session.results.length,correct:right});store.sessions=store.sessions.slice(-100);save();page='finish';show()}
  });
 }
 function finish(){
  const right=session.results.filter(r=>r.correct).length,total=session.results.length,pct=Math.round(right/total*100),wrong=session.results.filter(r=>!r.correct);
  shell('<section class="game dict-game"><article class="question-card feedback"><div class="feedback-icon">🏅</div><h2>Jouw dictee is klaar!</h2><div class="summary-score">'+pct+'%</div>'+
  '<p>Je schreef <strong>'+right+' van de '+total+'</strong> woorden helemaal juist!</p><div class="stars-big">'+(pct===100?'⭐⭐⭐':pct>=70?'⭐⭐':'⭐')+'</div>'+
  '<div class="dict-definition"><strong>'+(wrong.length?'💪 Nog eens oefenen':'🎉 Alles juist!')+'</strong><p>'+(wrong.length?'Deze woorden oefenen we nog: '+wrong.map(r=>r.word).join(', ')+'.':'Fantastisch! Jij bent een dictee-ster!')+'</p></div>'+
  '<div class="result-actions">'+btn('dict-again','🔁 Opnieuw oefenen','violet')+btn('dict-recap','📊 Mijn resultaten','outline')+btn('dict-finish-back','🏠 Naar de werelden','outline')+'</div></article></section>');
  bind('dict-again',()=>start(session.mode));bind('dict-recap',()=>{page='report';show()});bind('dict-finish-back',exit);
 }
 function report(){
  const entries=WORDS.map(w=>{
   const attempts=store.history.filter(r=>r.word===w.word),correct=attempts.filter(r=>r.correct).length;
   return {w,attempts:attempts.length,correct,percent:attempts.length?Math.round(100*correct/attempts.length):0};
  });
  const total=store.history.length,correct=store.history.filter(r=>r.correct).length,pct=total?Math.round(correct/total*100):0;
  shell('<section class="dashboard"><div class="game-head">'+btn('dict-report-back','← Terug','outline')+'<h2>📊 Dictee-resultaten</h2></div><article class="question-card"><div class="score-grid">'+
  '<div class="score-tile"><strong>'+total+'</strong><small>Woorden geoefend</small></div><div class="score-tile"><strong>'+pct+'%</strong><small>Correct</small></div><div class="score-tile"><strong>'+store.sessions.length+'</strong><small>Dictees gedaan</small></div></div>'+
  '<div class="report-list">'+entries.map(r=>'<div class="report-row dict-report-row"><span class="round-emoji">'+(r.attempts?r.percent===100?'✅':'📝':'▫️')+'</span><div><strong>'+esc(r.w.word)+'</strong><small>'+(r.attempts?r.correct+' van '+r.attempts+' juist':'Nog niet geoefend')+'</small><div class="mini-bar"><i style="width:'+r.percent+'%"></i></div></div><div class="stat">'+(r.attempts?r.percent+'%':'–')+'</div></div>').join('')+'</div>'+
  '<div class="result-actions">'+btn('dict-save-report','⬇️ Download CSV','violet')+btn('dict-report-home','🏠 Startscherm','outline')+'</div>'+
  '<p class="privacy">🔒 Je antwoorden worden alleen op dit apparaat bewaard. Andere apparaten hebben hun eigen resultaten.</p></article></section>');
  bind('dict-report-back',()=>{page='menu';show()});bind('dict-report-home',exit);
  bind('dict-save-report',()=>{
    const csv='\ufeffDatum;Woord;Geschreven;Goed\n'+store.history.map(row=>[row.date,row.word,row.given,row.correct?'ja':'nee'].map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')).join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='Rekenreis-dictee-woordpakket-7.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
 }
 if('speechSynthesis' in window){findVoice();speechSynthesis.addEventListener?.('voiceschanged',()=>{findVoice();const s=document.getElementById('dict-voice-status');if(s)s.textContent=voiceLabel})}
 window.RekenDictee=Object.freeze({open,openReport:args=>open({...args,page:'report'}),words:WORDS.map(w=>w.word)});
})();
