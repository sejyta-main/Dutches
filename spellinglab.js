'use strict';
/* Five-stage phonics + spelling transfer training. Dutch-first, optional English, parent Spanish.
   No APIs or child-specific inputs are sent to a server. Local results persist on device. */
(function(){
 const D=window.RekenSpellingData,root=document.getElementById('app'),KEY='rekenreis-spellinglab-v1';
 if(!D||!root)return;
 const STAGES=Object.freeze([
  {id:'sound',icon:'👂',name:'Hoorlab',en:'Hear the vowel',goal:'Hoor je een korte of lange klank?',desc:'Leer het verschil horen zonder de spelling eerst te zien.'},
  {id:'build',icon:'🧩',name:'Klankgroepen',en:'Build the word',goal:'Bouw twee klankgroepen.',desc:'Kies de juiste letterstukjes. Is de eerste klankgroep open of dicht?'},
  {id:'rule',icon:'🔍',name:'Regeldetective',en:'Explain the rule',goal:'Welke spellingsregel hoort bij dit woord?',desc:'Herken de regel en vertel aan iemand waarom die klopt.'},
  {id:'transfer',icon:'✏️',name:'Nieuwe woorden',en:'Unseen words',goal:'Schrijf het woord dat je hoort.',desc:'Schrijf woorden die niet in je schoolwoordpakket staan.'},
  {id:'exam',icon:'🏆',name:'Slimme mengtoets',en:'Mixed assessment',goal:'Laat zien wat je zelf kunt!',desc:'Luisteren, regels en nieuwe woorden. Score per vaardigheid.'}
 ]);
 const sz=word=>String(word||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const bi=(nl,en)=>window.RekenTaal?.pair(nl,en)||'<span lang="nl-BE">'+sz(nl)+'</span><small lang="en">'+sz(en)+'</small>';
 const button=(id,text,variant='outline')=>'<button type="button" class="btn '+variant+'" id="'+id+'">'+text+'</button>';
 const get=(id)=>root.querySelector('#'+id);
 const bind=(id,fn)=>{const el=get(id);if(el)el.addEventListener('click',fn)};
 const read=()=>{
  try{const x=JSON.parse(localStorage.getItem(KEY)||'null');
   return {attempts:Array.isArray(x?.attempts)?x.attempts:[],sessions:Array.isArray(x?.sessions)?x.sessions:[],seenWords:Array.isArray(x?.seenWords)?x.seenWords:[]};
  }catch(e){return {attempts:[],sessions:[],seenWords:[]}}
 };
 let saved=read(),screen='menu',session=null,onBack=()=>location.reload(),spanish=false,review=false;
 let lastScreen='',soundError='';
 const write=()=>{try{localStorage.setItem(KEY,JSON.stringify(saved))}catch(e){}};
 const stage=id=>STAGES.find(x=>x.id===id);
 const schoolWords=()=>window.RekenWoordpakketten?.all?.map(w=>w.word)||[];
 const allNovel=()=>D.eligible(schoolWords());
 const current=()=>session?.questions?.[session.index];
 const isNovel=q=>q.type==='spell'&&!saved.seenWords.includes(q.item.word);
 const stageLabel=()=>stage(session?.phase)?.name||'Spellinglab';
 const questionAudio=q=>q.type==='sound'?
  {id:'lab-'+q.pair.id+'-'+(q.rule==='short'?'s':'l'),word:q.word,phrase:q.word,example:q.word}:
  {id:'lab-'+q.item.id,word:q.item.word,phrase:q.item.word,example:q.item.word};
 function speak(mode='normal'){
  const q=current();if(!q)return;
  soundError='';
  if(window.RekenVoice){
   window.RekenVoice.speak(questionAudio(q),mode,msg=>{soundError=msg||'';let el=get('lab-voice');if(el)el.textContent=soundError});
  }else if('speechSynthesis'in window){
   speechSynthesis.cancel();
   const u=new SpeechSynthesisUtterance(q.word||q.item.word);u.lang='nl-BE';u.rate=mode==='slow'?.72:.98;speechSynthesis.speak(u);
  }else{
   const el=get('lab-voice');if(el)el.textContent='⚠️ Er is geen voorleesstem beschikbaar. / Audio unavailable.';
  }
 }
 const stopAudio=()=>{try{window.RekenVoice?.stop()}catch(e){}};
 const up=()=>window.RekenNavigation?.top();
 function shell(html,nav=true){
  root.innerHTML='<main class="shell lab-shell"><header class="lab-topbar"><button id="lab-home" class="lab-logo">🦊 Rekenreis <span>›</span> ✏️ Spellinglab</button>'+
   '<span class="lab-wallet">🐾 🪙 '+(window.RekenPetCore?.snapshot().coins??'—')+'</span></header>'+html+
   '<footer class="footer">🇧🇪 '+bi('Nederlands eerst. Engels is een hulp. Je resultaten blijven op dit apparaat.','Dutch first. English is extra help. Your scores stay on this device.')+'</footer></main>';
  bind('lab-home',exit);
  if(nav)up();
 }
 function open(config={}){
  onBack=typeof config.onBack==='function'?config.onBack:()=>location.reload();
  saved=read();session=null;screen='menu';lastScreen='';render();
 }
 function exit(){stopAudio();session=null;onBack?.()}
 function goMenu(){stopAudio();session=null;screen='menu';render()}
 function dashboard(){
  const stats=saved.sessions.slice(-8).reverse();
  const unknown=allNovel().filter(item=>!saved.seenWords.includes(item.word)).length;
  const due=saved.attempts.filter(a=>a.word&&!a.correct&&Date.now()-Date.parse(a.at)>=18*3600000)
   .map(a=>a.word).filter((word,index,list)=>list.indexOf(word)===index).length;
  shell('<section class="lab-hero"><div class="lab-hero-icon">🧠 🎧 ✨</div><h1>Spellinglab</h1>'+
   '<p>'+bi('Van klanken luisteren tot zelf nieuwe woorden schrijven. Leer de regel, niet alleen de woordenlijst.','From hearing sounds to spelling new words yourself. Learn the rule, not just the word list.')+'</p>'+
   '<div class="lab-dash-badges"><span>✏️ '+saved.sessions.length+' oefenrondes</span><span>🌱 '+unknown+' nieuwe oefenwoorden</span><span>🔁 '+due+' foutjes voor herhaling</span></div></section>'+
   '<div class="lab-phase-grid">'+STAGES.map((s,i)=>{
    const last=saved.sessions.filter(x=>x.phase===s.id).slice(-1)[0];
    return '<button type="button" class="lab-phase" data-stage="'+s.id+'"><span class="lab-phase-icon">'+s.icon+'</span>'+
    '<span class="lab-phase-number">FASE '+(i+1)+'</span><strong>'+s.name+'</strong><small>'+s.en+'</small><span>'+s.desc+'</span>'+
    '<b>'+(last?'🏅 '+last.correct+'/'+last.total+' laatste keer':'▶ Begin hier')+'</b></button>';
   }).join('')+'</div>'+
   '<section class="lab-parent"><div><h2>👨‍👩‍👧 Hulp voor ouders</h2><p>'+bi('Luister samen en vraag waarom een woord zo geschreven wordt. Je hoeft de Vlaamse klanken niet zelf perfect te kunnen uitspreken.','Listen together and ask why a word is spelled this way. Parents do not need perfect Flemish pronunciation.')+'</p></div>'+
   button('lab-parent-toggle',spanish?'🇪🇸 Ocultar ayuda':'🇪🇸 Ayuda para padres')+
   (spanish?'<div class="lab-spanish" lang="es"><strong>Guía en español</strong><p>1. Escuchen la grabación sin mirar la palabra. 2. Pidan a Elena que identifique la primera sílaba. 3. Pregunten: ¿vocal corta o larga? ¿Se duplica la consonante o se escribe una sola vocal? 4. Usen palabras nuevas para comprobar la regla. 5. Repasen los errores después de uno o varios días.</p><p>La distinción neerlandesa incluye diferencias de calidad vocálica, no solamente duración. «Man-nen» conserva la vocal corta con doble n; «ma-nen» usa una sola a en la sílaba abierta.</p></div>':'')+'</section>'+
   (stats.length?'<section class="lab-history"><h2>📊 Mijn vooruitgang / My progress</h2>'+stats.map(s=>
     '<div class="lab-history-row"><span>'+stage(s.phase)?.icon+' '+(stage(s.phase)?.name||s.phase)+'</span><strong>'+s.correct+'/'+s.total+'</strong><small>'+new Date(s.date).toLocaleDateString('nl-BE')+'</small></div>').join('')+'</section>':'')+
   '<div class="lab-actions">'+button('lab-exit','← Terug naar dictee')+'</div>');
  root.querySelectorAll('[data-stage]').forEach(el=>el.onclick=()=>start(el.dataset.stage));
  bind('lab-parent-toggle',()=>{spanish=!spanish;dashboard()});
  bind('lab-exit',exit);
 }
 function selectItems(count,{novel=false}={}){
  let pool=novel?allNovel():D.items;
  // Newly introduced vocabulary has priority; previously missed items are spaced back in.
  const ordered=D.priority(pool,saved.attempts,saved.seenWords);
  const short=ordered.filter(x=>x.rule==='short'),long=ordered.filter(x=>x.rule==='long');
  const half=Math.floor(count/2);
  let chosen=D.shuffle([...short.slice(0,half),...long.slice(0,count-half)]);
  if(chosen.length<count){
   const used=new Set(chosen.map(x=>x.id));
   chosen=chosen.concat(ordered.filter(x=>!used.has(x.id)).slice(0,count-chosen.length));
  }
  return chosen;
 }
 function questionItem(item,type){return {type,item,rule:item.rule,word:item.word,answer:type==='spell'?item.word:item.rule,skill:type==='spell'?'spelling':type==='build'?'syllables':'rules'}}
 function makeQuestions(which){
  if(which==='sound')return D.shuffle(D.pairs).slice(0,8).map((pair,i)=>({type:'sound',skill:'hearing',pair,rule:i%2===0?'short':'long',
   word:i%2===0?pair.short:pair.long,answer:i%2===0?'short':'long'}));
  if(which==='build')return selectItems(8).map(x=>questionItem(x,'build'));
  if(which==='rule')return selectItems(8).map(x=>questionItem(x,'rule'));
  if(which==='transfer')return selectItems(10,{novel:true}).map(x=>questionItem(x,'spell'));
  const sounds=D.shuffle(D.pairs).slice(0,4).map((pair,i)=>({type:'sound',skill:'hearing',pair,rule:i%2===0?'short':'long',
    word:i%2===0?pair.short:pair.long,answer:i%2===0?'short':'long'}));
  const rules=selectItems(4).map(x=>questionItem(x,'rule'));
  const spell=selectItems(8,{novel:true}).map(x=>questionItem(x,'spell'));
  return D.shuffle([...sounds,...rules,...spell]);
 }
 function start(phase){
  if(!stage(phase))return;
  const questions=makeQuestions(phase);
  if(!questions.length){shell('<section class="lab-card"><h2>🌟 Alle woorden geoefend!</h2><p>Geen nieuwe woorden beschikbaar. Probeer een andere fase.</p>'+button('lab-no-items','← Terug')+'</section>');bind('lab-no-items',goMenu);return}
  stopAudio();session={phase,questions,index:0,results:[],selected:[],answered:false,done:false,
   chosen:'',novelAtStart:new Set(saved.seenWords)};
  screen='question';render();
  // Audio starts from the button used to enter the phase. iOS can require tapping replay.
  speak();
 }
 function ruleText(rule){
  return rule==='short'?{
   nl:'Korte klank: dubbele medeklinker, bijvoorbeeld bom-men.',
   en:'Short vowel: double the consonant, e.g. bom-men.'}:{
   nl:'Lange klank: één klinker in een open klankgroep, bijvoorbeeld bo-men.',
   en:'Long vowel: use one vowel in an open syllable, e.g. bo-men.'};
 }
 function buildTiles(q){
  const a=q.item.segments[0],b=q.item.segments[1];
  const wrongA=q.item.rule==='short'?a.slice(0,-1):a+b[0];
  const wrongB=b[0]==='m'?'nen':b[0]==='n'?'men':b[0]==='t'?'den':b[0]==='k'?'ten':b[0]==='p'?'ten':b[0]==='l'?'men':b[0]==='s'?'len':'ren';
  // keep each tile unique even if a segment happens to equal a distractor
  return D.shuffle([...new Set([a,b,wrongA,wrongB])]);
 }
 function question(){
  const q=current(),s=session,step=s.index+1,total=s.questions.length;
  const intro=D.intro[s.phase],before=!s.answered;
  const identity=q.type==='sound'?'👂 '+bi('Wat hoor je?', 'What do you hear?'):
    q.type==='build'?'🧩 '+bi('Bouw het woord.', 'Build the word.'):
    q.type==='rule'?'🔍 '+bi('Welke regel past?', 'Which rule applies?'):
    '✏️ '+bi('Schrijf het woord.', 'Spell the word.');
  const sound='<div class="lab-sound"><button type="button" id="lab-hear" class="lab-audio">🔊 Luister / Listen</button>'+
   '<button type="button" id="lab-slow" class="lab-audio slow">🐢 Langzaam / Slowly</button>'+
   '<small id="lab-voice" aria-live="polite">🇧🇪 Vlaamse uitspraak / Flemish pronunciation</small></div>';
  let interaction='';
  if(q.type==='sound'){
   interaction='<div class="lab-choice-grid"><button class="lab-choice" data-answer="short">🟢 <strong>Korte klank</strong><small>Short vowel</small></button>'+
   '<button class="lab-choice" data-answer="long">🔴 <strong>Lange klank</strong><small>Long vowel</small></button></div>';
  }else if(q.type==='rule'){
   interaction='<div class="lab-target-word">'+sz(q.item.word)+'<span> '+sz(q.item.syllables)+'</span></div>'+
    '<div class="lab-choice-grid"><button class="lab-choice" data-answer="short">🟢 <strong>Verdubbelen</strong><small>Korte klank: dubbele medeklinker</small><small>Short vowel → double consonant</small></button>'+
    '<button class="lab-choice" data-answer="long">🔴 <strong>Verenkelen</strong><small>Lange klank: één klinker</small><small>Long vowel → one vowel</small></button></div>';
  }else if(q.type==='build'){
   const selected=s.selected;
   interaction='<div class="lab-building"><p>'+bi('Tik twee stukjes in de juiste volgorde.','Tap two tiles in the right order.')+'</p>'+
    '<div class="lab-building-preview">'+(selected.length?selected.map(x=>'<span>'+sz(x)+'</span>').join(''):'<span class="lab-placeholder">▢ ▢</span>')+'</div>'+
    '<div class="lab-tile-bank">'+buildTiles(q).map(t=>'<button type="button" class="lab-tile" data-tile="'+sz(t)+'" '+(selected.includes(t)?'disabled':'')+'>'+sz(t)+'</button>').join('')+'</div>'+
    '<div class="lab-controls">'+button('lab-undo','↶ Opnieuw / Reset')+button('lab-check','✅ Controleer / Check','primary')+'</div></div>';
  }else{
   const fresh=!s.novelAtStart.has(q.item.word);
   interaction='<form id="lab-form" class="lab-type"><label for="lab-typed">'+bi('Wat hoor je? Schrijf het zonder hulp.','What do you hear? Spell it without looking.')+'</label>'+
    '<input type="text" lang="nl-BE" id="lab-typed" name="answer" maxlength="38" autocapitalize="off" autocorrect="off" spellcheck="false" autocomplete="off" required placeholder="Schrijf hier / Write here" />'+
    '<button class="btn primary" type="submit">✅ Controleer / Check</button></form>'+
    '<p class="lab-fresh">'+(fresh?'✨ '+bi('Een nieuw oefenwoord!','An unseen practice word!'):'🔁 '+bi('Herhaalwoord: controleer of je de regel nog kent.','Review: can you still use the rule?')+'</p>');
  }
  if(!before)interaction=feedback(q);
  shell('<section class="lab-session-top"><div class="lab-session-label">'+stage(s.phase).icon+' <strong>'+stageLabel()+'</strong> · '+step+'/'+total+'</div>'+
   button('lab-quit','← Fasen / Phases')+'</section>'+
   '<div class="lab-progress"><div style="width:'+(100*(s.index)/total)+'%"></div></div>'+
   '<section class="lab-card"><h1>'+identity+'</h1><p class="lab-prompt">'+bi(intro.nl,intro.en)+'</p>'+
   sound+interaction+'</section>');
  bind('lab-quit',goMenu);bind('lab-hear',()=>speak());bind('lab-slow',()=>speak('slow'));
  if(s.answered){bind('lab-next',next);return}
  root.querySelectorAll('[data-answer]').forEach(el=>el.onclick=()=>answer(el.dataset.answer));
  root.querySelectorAll('[data-tile]').forEach(el=>el.onclick=()=>{if(s.selected.length>=2)return;s.selected.push(el.dataset.tile);question(false)});
  bind('lab-undo',()=>{s.selected=[];question(false)});
  bind('lab-check',()=>answer(s.selected.join('')));
  const form=get('lab-form');if(form)form.addEventListener('submit',e=>{e.preventDefault();answer(get('lab-typed').value)});
 }
 function feedback(q){
  const r=session.results[session.results.length-1],good=r.correct,spelling=q.word||q.item.word;
  const explain=q.type==='sound'?ruleText(q.rule):D.explain(q.item);
  const meaning=q.type==='sound'?(q.rule==='short'?q.pair.sMeaning:q.pair.lMeaning):'';
  const rule=q.rule==='short'?'🟢 Korte klank / Short vowel':'🔴 Lange klank / Long vowel';
  const full='<div class="lab-answer-word">'+sz(spelling)+'</div>'+
   (q.item?'<p class="lab-syllable">'+sz(q.item.syllables)+'</p>':'')+
   (meaning?'<p>🇧🇪 '+sz(meaning)+'</p>':'')+
   (q.type==='spell'?'<p>'+bi('Jij schreef: '+(r.given||'—'),'You wrote: '+(r.given||'—'))+'</p>':'')+
   '<p class="lab-rule">'+bi(explain.nl,explain.en)+'</p>';
  const reflection=q.type==='rule'?'<p class="lab-reflect">'+bi('Vertel hardop: waarom is de eerste klankgroep open of dicht?', 'Say aloud: why is the first syllable open or closed?')+'</p>':'';
  return '<div class="lab-feedback '+(good?'lab-correct':'lab-incorrect')+'" aria-live="polite"><h2>'+(good?'🌟 '+bi('Goed gedaan!','Well done!'):'💡 '+bi('Dit gaan we oefenen.','Let’s learn from this.'))+'</h2>'+
   '<div class="lab-answer-label">'+rule+'</div>'+full+reflection+
   '<p class="lab-retry-hint">'+(good?'⭐ +1 juist':'💪 '+bi('Je ziet hoe de spelling werkt. Probeer dit later opnieuw.','Now you can see how the spelling works. Try again later.'))+'</p>'+
   button('lab-next',session.index+1>=session.questions.length?'🏆 Mijn resultaat / My score':'➡️ Volgende / Next','primary')+'</div>';
 }
 function answer(value){
  if(!session||session.answered||screen!=='question')return;
  const q=current(),given=String(value||'').trim(),expect=q.answer;
  if(!given){const node=get('lab-voice');if(node)node.textContent='✏️ Vul eerst je antwoord in. / Please answer first.';return}
  const correct=q.type==='spell'?D.normalize(given)===D.normalize(expect):given===expect;
  const record={at:new Date().toISOString(),phase:session.phase,type:q.type,skill:q.skill,word:q.word||q.item.word,
   rule:q.rule,correct,given,expected:expect,novel:q.type==='spell'&&!session.novelAtStart.has(q.item.word)};
  session.results.push(record);session.answered=true;
  saved.attempts.push(record);saved.attempts=saved.attempts.slice(-1500);
  if(q.type==='spell'&&!saved.seenWords.includes(q.item.word))saved.seenWords.push(q.item.word);
  write();stopAudio();question(false);
 }
 function next(){
  if(!session||!session.answered||session.done)return;
  if(session.index+1>=session.questions.length){complete();return}
  session.index++;session.answered=false;session.selected=[];screen='question';render();speak();
 }
 function complete(){
  if(!session||session.done)return;
  session.done=true;const scores=score(session.results);
  const row={date:new Date().toISOString(),phase:session.phase,total:session.results.length,correct:scores.correct,
   bySkill:scores.bySkill,novelCorrect:scores.novelCorrect,novelTotal:scores.novelTotal,bonusCoins:25};
  saved.sessions.push(row);saved.sessions=saved.sessions.slice(-160);write();
  screen='summary';render();
 }
 function score(results){
  const bySkill={hearing:{good:0,total:0},syllables:{good:0,total:0},rules:{good:0,total:0},spelling:{good:0,total:0}};
  for(const result of results){const s=bySkill[result.skill];if(s){s.total++;if(result.correct)s.good++}}
  const novel=results.filter(x=>x.type==='spell'&&x.novel);
  return {correct:results.filter(x=>x.correct).length,bySkill,novelCorrect:novel.filter(x=>x.correct).length,novelTotal:novel.length};
 }
 function results(){
  const row=saved.sessions[saved.sessions.length-1];if(!row)return goMenu();
  const percent=Math.round(row.correct/Math.max(1,row.total)*100),nextPhase=STAGES[(STAGES.findIndex(x=>x.id===row.phase)+1)%STAGES.length];
  const names={hearing:'👂 Klanken horen',syllables:'🧩 Klankgroepen',rules:'🔍 Regels herkennen',spelling:'✏️ Woorden schrijven'};
  const assessments=Object.entries(row.bySkill).filter(([,v])=>v.total);
  shell('<section class="lab-card lab-summary"><div class="lab-result-big">🏆</div><h1>'+bi('Oefenronde afgerond!','Practice complete!')+'</h1>'+
   '<div class="lab-result-score">'+row.correct+' / '+row.total+' <small>('+percent+'%)</small></div>'+
   '<div class="lab-coins">🪙 +25 '+bi('muntjes voor je huisdier','coins for your pet')+'</div>'+
   '<h2>'+bi('Wat gaat al goed?','Your skills')+'</h2><div class="lab-skill-grid">'+assessments.map(([skill,count])=>
    '<div class="lab-skill"><span>'+names[skill]+'</span><strong>'+count.good+'/'+count.total+'</strong><div class="lab-skill-bar"><i style="width:'+(100*count.good/count.total)+'%"></i></div></div>').join('')+'</div>'+
   (row.novelTotal?'<p class="lab-transfer-result">'+bi('Niet eerder geoefende woorden: '+row.novelCorrect+'/'+row.novelTotal+' juist.','Previously unseen words: '+row.novelCorrect+'/'+row.novelTotal+' correct.')+'</p>':'')+
   '<p>'+bi('Foutjes worden later nog eens aangeboden. Een nieuw woord goed schrijven is belangrijker dan alleen een lijstje onthouden.','Mistakes come back later. Spelling unfamiliar words matters more than memorizing a list.')+'</p>'+
   (window.RekenArcade?window.RekenArcade.offerHTML(window.RekenArcade.peek()):'<p>🎮 Speel na het oefenen!</p>')+
   '<div class="lab-actions">'+button('lab-next-phase','➡️ '+nextPhase.name,'primary')+
   button('lab-finish','📚 Alle fasen / All phases')+
   button('lab-to-dictee','🎧 Dictee-eiland')+'</div></section>');
  root.querySelectorAll('[data-arcade-game]').forEach(el=>el.onclick=()=>{
   if(!window.RekenArcade)return;
   const ok=window.RekenArcade.open(el.dataset.arcadeGame,{name:'Rekenheld',
    onBack:()=>{screen='summary';render()}});
   if(ok)up();
  });
  bind('lab-next-phase',()=>start(nextPhase.id));
  bind('lab-finish',goMenu);bind('lab-to-dictee',exit);
 }
 function render(){
  if(screen==='menu')dashboard();
  else if(screen==='question')question();
  else if(screen==='summary')results();
 }
 window.RekenSpellingLab=Object.freeze({open,getProgress:()=>read(),phases:STAGES.map(s=>s.id)});
})();
