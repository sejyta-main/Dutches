'use strict';
/* Eight photographed school word packs; spelling, study, quizzes, and arcade. */
(function(){
const book=window.RekenWoordpakketten;
if(!book)return;
const app=document.getElementById('app'),KEY='rekenreis-dictee-v1',STUDY='rekenreis-dictee-studied-v1';
let saved=read(KEY,{history:[],sessions:[]}),checked=read(STUDY,{}),pack=1,page='menu',session=null,last=null,returnHome=()=>location.reload();
let voice=null,voiceInfo='';
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=xs=>{let a=xs.slice();for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const button=(id,label,style='violet')=>'<button type="button" class="btn '+style+'" id="'+id+'">'+label+'</button>';
function read(key,fallback){try{const s=JSON.parse(localStorage.getItem(key)||'null');return s&&typeof s==='object'?s:fallback}catch(e){return fallback}}
function write(key,obj){try{localStorage.setItem(key,JSON.stringify(obj))}catch(e){}}
function reportPack(row){return Number(row.pack)||(book.getWord(7,row.word)?7:0)}
function packStats(n){
 const list=(saved.history||[]).filter(x=>reportPack(x)===n);
 return {total:list.length,correct:list.filter(x=>x.correct).length,unique:new Set(list.map(x=>x.word)).size,pct:list.length?Math.round(list.filter(x=>x.correct).length/list.length*100):0};
}
function studies(n){return new Set(Array.isArray(checked[n])?checked[n]:[])}
function hardWords(n){
 let latest=new Map();
 (saved.history||[]).forEach(r=>{if(reportPack(r)===n)latest.set(r.word,r)});
 return book.getPack(n).words.filter(w=>latest.get(w.word)?.correct===false);
}
function closeVoice(){try{window.speechSynthesis.cancel()}catch(e){}}
function voiceSelect(){
 const voices=typeof speechSynthesis==='undefined'?[]:speechSynthesis.getVoices();
 voice=voices.find(v=>/^nl[-_]BE$/i.test(v.lang))||voices.find(v=>/^nl/i.test(v.lang)&&/vlaams|belg|flemish/i.test(v.name))||null;
 voiceInfo=voice?'🇧🇪 Vlaamse stem: '+voice.name:'🇧🇪 nl-BE gevraagd. Een Vlaamse stem is niet gegarandeerd op dit toestel.';
}
function speak(item,slow=false,example=false){
 if(!('speechSynthesis' in window)){message('Er is geen voorleesstem beschikbaar.');return}
 voiceSelect();
 try{
   closeVoice();
   const u=new SpeechSynthesisUtterance(example?item.example:item.phrase);
   u.lang='nl-BE';if(voice)u.voice=voice;
   u.rate=slow?.68:.86;u.pitch=1;
   u.onerror=()=>message('Geluid niet beschikbaar. Kijk de steminstellingen van het toestel na.');
   speechSynthesis.speak(u);message(voiceInfo);
 }catch(e){message('De voorleesstem werkt niet op dit toestel.')}
}
function message(s){const el=app.querySelector('#dict2-voice');if(el)el.textContent=s}
function bind(id,fn){let el=app.querySelector('#'+id);if(el)el.addEventListener('click',fn)}
function shell(inner){
 app.innerHTML='<main class="shell dict2-app"><header class="topbar">'+
 '<button id="dict2-back-home" class="logo"><span class="logo-badge">🦊</span><span><strong>Rekenreis</strong><small>Dictee-eiland · Woordpakket 1–8</small></span></button><span class="pill star">🇧🇪 160 woorden</span></header>'+
 inner+'<footer class="footer">✏️ Dictee-eiland • Vlaamse uitspraak waar beschikbaar • Je resultaten blijven op dit apparaat</footer></main>';
 bind('dict2-back-home',leave);
}
function leave(){closeVoice();session=null;page='menu';returnHome()}
function show(){if(page==='menu')menu();if(page==='study')study();if(page==='play')play();if(page==='answer')answerScreen();if(page==='finish')finish();if(page==='report')report()}
function open(config={}){
 returnHome=typeof config.onBack==='function'?config.onBack:()=>location.reload();
 const p=Number(config.pack);if(p>=1&&p<=8)pack=p;
 page=config.page==='report'?'report':'menu';session=null;last=null;show();
}
function menu(){
 const p=book.getPack(pack),attempts=(saved.history||[]).length;
 shell('<section class="dict-hero"><div><div class="eyebrow">🎓 Klaar voor de spellingtoets?</div><h1>🎧 Dictee-eiland</h1>'+
 '<p>Oefen alle acht woordpakketten. Luister, schrijf en leer op jouw tempo!</p>'+
 '<span class="dict-chip">8 woordpakketten</span><span class="dict-chip">160 woorden</span><span class="dict-chip">🎮 8-bit bonusspel</span></div><div class="dict-hero-art">🦊✏️</div></section>'+
 '<div class="section-heading"><h2>📚 Kies jouw woordpakket</h2></div>'+
 '<div class="dict2-packs">'+book.packs.map(x=>{
  const s=packStats(x.number),stud=studies(x.number).size;
  return '<button class="dict2-pack '+(pack===x.number?'active':'')+'" data-pack="'+x.number+'" type="button" aria-pressed="'+(pack===x.number)+'">'+
  '<span class="dict2-pack-number">'+x.icon+' Pakket '+x.number+'</span><strong>'+safe(x.title)+'</strong>'+
  '<small>✏️ '+(s.total?s.correct+'/'+s.total+' juist':'Nog niet geoefend')+' · 📖 '+stud+'/20 geleerd</small>'+
  '<span class="dict2-progress"><span style="width:'+(stud*5)+'%"></span></span></button>';
 }).join('')+'</div>'+
 '<article class="panel dict2-action-panel"><h2>'+p.icon+' Woordpakket '+pack+': '+safe(p.title)+'</h2>'+
 '<p>'+safe(p.summary)+'</p><div class="tip">💡 '+safe(p.tip)+'</div>'+
 '<div class="dict2-modes">'+button('dict2-10','⚡ 10 woorden','violet')+button('dict2-20','✏️ Alle 20 woorden','green')+
 button('dict2-learn','📖 Leren & uitleg','outline')+button('dict2-errors','💪 Mijn foutjes','outline')+'</div>'+
 '<div class="dict2-mega"><div><strong>🏆 Groot proefdictee</strong><p>40 vragen: vijf woorden uit elk pakket, zoals bij een examen.</p></div>'+
 button('dict2-exam','🎯 Start proefdictee','primary')+'</div>'+
 '<div class="result-actions">'+button('dict2-report','📊 Resultaten','outline')+button('dict2-exit','🏠 Rekenreis','outline')+'</div>'+
 '<p class="privacy">'+attempts+' antwoorden geregistreerd • De resultaten van Woordpakket 7 blijven behouden. Je hoort de volledige woordgroep, maar je mag ook alleen het gevraagde woord typen.</p></article>');
 app.querySelectorAll('[data-pack]').forEach(b=>b.onclick=()=>{pack=Number(b.dataset.pack);show()});
 bind('dict2-10',()=>begin('short'));bind('dict2-20',()=>begin('full'));
 bind('dict2-errors',()=>begin('wrong'));bind('dict2-exam',()=>begin('exam'));
 bind('dict2-learn',()=>{page='study';show()});
 bind('dict2-report',()=>{page='report';show()});bind('dict2-exit',leave);
}
function begin(mode){
 let order;
 if(mode==='exam')order=shuffle(book.packs.flatMap(p=>shuffle(p.words).slice(0,5)));
 else if(mode==='wrong')order=shuffle(hardWords(pack));
 else order=shuffle(book.getPack(pack).words).slice(0,mode==='short'?10:20);
 if(!order.length){alert('Er zijn geen openstaande foutjes. Goed gedaan!');return}
 session={mode,pack:mode==='exam'?null:pack,questions:order,idx:0,results:[]};
 page='play';show();speak(order[0]);
}
function equalTo(item,raw){
 const val=String(raw).normalize('NFC').trim().toLocaleLowerCase('nl-BE').replace(/\s+/g,' ');
 return val===item.word.toLocaleLowerCase('nl-BE')||val===item.phrase.toLocaleLowerCase('nl-BE');
}
function play(){
 const q=session.questions[session.idx],p=book.getPack(q.pack);
 voiceSelect();
 shell('<section class="game"><div class="game-head">'+button('dict2-stop','← Stoppen','outline')+
 '<div class="game-label"><strong>🎧 '+(session.mode==='exam'?'Proefdictee':'Woordpakket '+q.pack)+'</strong><small>Woord '+(session.idx+1)+' van '+session.questions.length+'</small></div>'+
 '<div class="counter">⭐ '+session.results.filter(r=>r.correct).length+'</div></div>'+
 '<div class="step-progress"><div style="width:'+(session.idx/session.questions.length*100)+'%"></div></div>'+
 '<article class="question-card dict2-question"><div class="question-eyebrow">'+p.icon+' Luister en schrijf</div><h2>Welk woord hoor je?</h2>'+
 '<p class="hint">Luister naar het woord en schrijf het juist.</p><div class="dict-listening"><div class="dict-speaker">🎧</div>'+
 '<div class="dict-audio-buttons">'+button('dict2-hear','🔊 Luister')+button('dict2-slow','🐢 Langzaam','outline')+'</div>'+
 '<p class="dict-note" id="dict2-voice" aria-live="polite">'+safe(voiceInfo)+'</p></div>'+
 '<form id="dict2-form"><label class="dict-label" for="dict2-write">✏️ Schrijf hier je antwoord</label>'+
 '<input id="dict2-write" class="dict-input" type="text" lang="nl-BE" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" required maxlength="80" placeholder="Typ het woord…">'+
 '<p class="dict-note center">Je mag het woord of de hele uitdrukking schrijven.</p><div class="center"><button type="submit" class="btn green">✅ Controleer</button></div></form></article></section>');
 bind('dict2-stop',()=>{if(confirm('Wil je stoppen met dit dictee?')){closeVoice();page='menu';session=null;show()}});
 bind('dict2-hear',()=>speak(q));bind('dict2-slow',()=>speak(q,true));
 app.querySelector('#dict2-form').onsubmit=e=>{
  e.preventDefault();let input=app.querySelector('#dict2-write').value.trim();if(!input)return;
  closeVoice();last={word:q,typed:input,correct:equalTo(q,input)};
  const record={date:new Date().toISOString(),pack:q.pack,word:q.word,given:input,correct:last.correct};
  saved.history.push(record);saved.history=saved.history.slice(-3000);
  session.results.push(record);write(KEY,saved);page='answer';show();
 };
}
const roots={
 'aapjes':'aap + jes','dorpje':'dorp + je','kaartje':'kaart + je','snoepjes':'snoep + jes',
 'briefje':'brief + je','groepje':'groep + je','kijkje':'kijk + je','vriendje':'vriend + je',
 'broodjes':'brood + jes','hartje':'hart + je','liedje':'lied + je','buikje':'buik + je',
 'heksje':'heks + je','pakjes':'pak + jes','dansje':'dans + je','hondjes':'hond + jes',
 'pootje':'poot + je','blaadjes':'blad → blaadje + s','gaatje':'gat → gaatje','glaasje':'glas → glaasje'
};
function specific(item){
 const p=book.getPack(item.pack);
 if(item.pack===7){
  const ending=['eren','elen','enen','ere'].find(e=>item.word.endsWith(e));
  return 'Je hoort een doffe e. Bij '+item.word+' schrijf je '+(ending?'-'+ending:'de letter e')+'. '+p.example;
 }
 if(item.pack===8)return 'Zoek het grondwoord: '+(roots[item.word]||item.word)+'. '+p.summary;
 return p.example+' '+p.tip;
}
function answerScreen(){
 const w=last.word,p=book.getPack(w.pack);
 shell('<section class="game"><article class="question-card dict-feedback dict2-answer">'+
 '<div class="feedback-icon">'+(last.correct?'🌟':'💡')+'</div><h2>'+(last.correct?'Helemaal juist!':'Goed geprobeerd!')+'</h2>'+
 (last.correct?'<p>Super! Jij hebt het goed geschreven.</p>':'<p>Bekijk even het juiste woord. Daar leer je van!</p><p>Je schreef: <strong>'+safe(last.typed)+'</strong></p>')+
 '<div class="dict-answer"><div class="dict-bigword">'+safe(w.word)+'</div><p>'+safe(w.phrase)+'</p></div>'+
 '<div class="dict-definition"><strong>📖 Betekenis</strong><p>'+safe(w.meaning)+'</p><small>🇪🇸 '+safe(w.es)+'</small></div>'+
 '<div class="dict-definition"><strong>💬 Voorbeeldzin</strong><p>'+safe(w.example)+'</p></div>'+
 '<div class="result-actions">'+button('dict2-repeat','🔊 Hoor opnieuw','outline')+
 button('dict2-example','💬 Hoor voorbeeld','outline')+button('dict2-rule','🧠 Spellingregel','outline')+'</div>'+
 '<div id="dict2-rule-panel" class="dict-rulebox" hidden><strong>'+p.icon+' '+safe(p.title)+'</strong><p>'+safe(p.summary)+'</p><p>'+safe(specific(w))+'</p></div>'+
 '<div class="result-actions">'+button('dict2-next',session.idx+1===session.questions.length?'🏆 Bekijk mijn score':'Volgende woord →')+'</div></article></section>');
 bind('dict2-repeat',()=>speak(w));bind('dict2-example',()=>speak(w,false,true));
 bind('dict2-rule',()=>{let panel=app.querySelector('#dict2-rule-panel');panel.hidden=!panel.hidden});
 bind('dict2-next',()=>{
  session.idx++;
  if(session.idx<session.questions.length){page='play';show();speak(session.questions[session.idx])}
  else{
   saved.sessions.push({date:new Date().toISOString(),mode:session.mode,pack:session.pack,total:session.results.length,correct:session.results.filter(r=>r.correct).length});
   saved.sessions=saved.sessions.slice(-200);write(KEY,saved);
   page='finish';show();
  }
 });
}
function arcade(){
 if(!window.RekenRetro){alert('Het bonusspel is niet beschikbaar. Open de app opnieuw.');return}
 closeVoice();window.RekenRetro.open({pack:session?.pack||pack,onBack:()=>{page='menu';show()}});
}
function finish(){
 const correct=session.results.filter(r=>r.correct).length,total=session.results.length,pct=Math.round(correct/total*100),wrongs=session.results.filter(x=>!x.correct);
 shell('<section class="game"><article class="question-card feedback dict2-finish"><div class="feedback-icon">🏆</div>'+
 '<h2>Dictee afgerond!</h2><div class="summary-score">'+pct+'%</div>'+
 '<p>Je schreef <strong>'+correct+' van '+total+'</strong> woorden juist.</p><div class="stars-big">'+(pct===100?'⭐⭐⭐':pct>=70?'⭐⭐':'⭐')+'</div>'+
 (wrongs.length?'<div class="dict-definition"><strong>💪 Nog wat oefenen</strong><p>'+safe(wrongs.map(x=>x.word).join(', '))+'</p></div>':'<p>🎉 Alles juist, fantastisch!</p>')+
 (session.pack?'<div class="dict2-arcade-offer"><strong>🎮 BONUSNIVEAU VRIJ!</strong><p>Je hebt dit woordpakket afgerond. Speel nu één spannend 8-bit sterrenniveau!</p>'+
 button('dict2-arcade','🚀 Speel Sterrenraket','primary')+'</div>':
 '<p>🌈 Je hebt woorden uit alle acht pakketten geoefend!</p>')+
 '<div class="result-actions">'+button('dict2-retry','🔁 Opnieuw oefenen','outline')+button('dict2-done','📚 Woordpakketten','outline')+'</div></article></section>');
 bind('dict2-arcade',arcade);
 bind('dict2-retry',()=>begin(session.mode));bind('dict2-done',()=>{session=null;page='menu';show()});
}
function study(){
 const p=book.getPack(pack),marks=studies(pack),count=marks.size;
 shell('<section class="game dict2-study"><div class="game-head">'+button('dict2-study-back','← Pakketten','outline')+
 '<div class="game-label"><strong>📖 Woordpakket '+pack+'</strong><small>Woorden lezen en oefenen</small></div>'+
 '<span class="counter">'+count+'/20 geleerd</span></div>'+
 '<article class="question-card"><div class="dict2-rule-summary"><h2>'+p.icon+' '+safe(p.title)+'</h2><p>'+safe(p.summary)+'</p>'+
 '<div class="tip">💡 '+safe(p.tip)+'</div><p><strong>Voorbeeld:</strong> '+safe(p.example)+'</p></div>'+
 '<p class="hint">Luister naar elk woord, lees wat het betekent en vink het aan als je het geoefend hebt.</p>'+
 '<div class="dict2-study-list">'+p.words.map(w=>'<div class="dict2-study-item">'+
 '<button type="button" class="dict2-hear" data-hear="'+w.id+'" aria-label="Luister naar '+safe(w.word)+'">🔊</button>'+
 '<div class="dict2-study-copy"><strong>'+safe(w.phrase)+'</strong><small>🇪🇸 '+safe(w.es)+' • '+safe(w.meaning)+'</small><span>'+safe(w.example)+'</span></div>'+
 '<label class="dict2-studied"><input type="checkbox" data-mark="'+w.id+'" '+(marks.has(w.id)?'checked':'')+'><span>Geleerd</span></label></div>').join('')+'</div>'+
 (count===20?'<div class="dict2-arcade-offer"><h3>🏆 Alle 20 woorden geleerd!</h3><p>Jij hebt het hele woordpakket bestudeerd. Tijd voor je bonusniveau!</p>'+
 button('dict2-study-arcade','🚀 Speel je retrospel','primary')+'</div>':'<div class="dict2-progress-words">📖 '+count+' van de 20 woorden geleerd • Na 20/20 krijg je het 8-bit bonusspel.</div>')+
 '<div class="result-actions">'+button('dict2-study-quiz','✍️ Oefen het dictee','violet')+
 button('dict2-study-return','📚 Terug naar de pakketten','outline')+'</div></article></section>');
 bind('dict2-study-back',()=>{page='menu';show()});bind('dict2-study-return',()=>{page='menu';show()});
 bind('dict2-study-quiz',()=>begin('full'));
 bind('dict2-study-arcade',()=>{session={pack};arcade()});
 app.querySelectorAll('[data-hear]').forEach(b=>b.onclick=()=>speak(p.words.find(w=>w.id===b.dataset.hear)));
 app.querySelectorAll('[data-mark]').forEach(b=>b.onchange=()=>{
  let now=studies(pack);if(b.checked)now.add(b.dataset.mark);else now.delete(b.dataset.mark);
  checked[pack]=[...now];write(STUDY,checked);show();
 });
}
function report(){
 const total=saved.history.length,good=saved.history.filter(r=>r.correct).length;
 shell('<section class="dashboard"><div class="game-head">'+button('dict2-report-back','← Woordpakketten','outline')+
 '<div class="game-label"><strong>📊 Dictee-resultaten</strong><small>Woordpakket 1–8</small></div></div>'+
 '<article class="question-card"><div class="score-grid"><div class="score-tile"><strong>'+total+'</strong><small>Antwoorden</small></div>'+
 '<div class="score-tile"><strong>'+(total?Math.round(good/total*100):0)+'%</strong><small>Juist</small></div>'+
 '<div class="score-tile"><strong>'+saved.sessions.length+'</strong><small>Oefenrondes</small></div></div>'+
 '<div class="report-list">'+book.packs.map(p=>{
  const r=packStats(p.number),n=studies(p.number).size;
  return '<button class="dict2-report-line" data-report-pack="'+p.number+'"><strong>'+p.icon+' Woordpakket '+p.number+'</strong>'+
  '<span>'+r.correct+'/'+r.total+' juist · '+r.pct+'% · '+n+'/20 geleerd</span></button>';
 }).join('')+'</div><div class="result-actions">'+button('dict2-csv','⬇️ Download CSV','violet')+
 button('dict2-report-done','🏠 Startscherm','outline')+'</div>'+
 '<p class="privacy">Je oude resultaten van Woordpakket 7 zijn behouden. Alles blijft op dit toestel.</p></article></section>');
 bind('dict2-report-back',()=>{page='menu';show()});bind('dict2-report-done',leave);
 app.querySelectorAll('[data-report-pack]').forEach(b=>b.onclick=()=>{pack=Number(b.dataset.reportPack);page='menu';show()});
 bind('dict2-csv',()=>{
  const rows=saved.history.map(r=>[r.date,reportPack(r),r.word,r.given,r.correct?'ja':'nee'].map(v=>'"'+String(v||'').replace(/"/g,'""')+'"').join(';'));
  const csv='\ufeffDatum;Woordpakket;Woord;Geschreven;Juist\n'+rows.join('\n'),blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  let link=document.createElement('a'),url=URL.createObjectURL(blob);
  link.href=url;link.download='Rekenreis-dictee-1-tot-8.csv';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
 });
}
if('speechSynthesis' in window){voiceSelect();window.speechSynthesis.addEventListener?.('voiceschanged',voiceSelect)}
window.RekenDictee=Object.freeze({open,openReport:c=>open({...c,page:'report'}),words:book.all.map(w=>w.word),packs:book.packs.map(p=>p.number)});
})();