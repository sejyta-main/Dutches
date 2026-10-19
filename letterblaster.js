'use strict';
/* One-level original NES-inspired spelling arcade: pick and blast the correct word. */
(function(){
 const root=document.getElementById('app'),book=window.RekenWoordpakketten;
 let state=null,frame=0,raf=0;
 const variants=w=>{
  const text=w.word,alts=[];
  const propose=[text.replace(/(.)\1/g,'$1'),text.replace(/(.)e(?=.)/,'$1'),text.replace(/([aeiou])/,'$1$1'),text.replace(/ij/,'ei').replace(/ei/,'ij'),
    text.replace(/oe/,'eu'),text.replace(/aa/,'a'),text.slice(0,-1),text+'e'];
  for(let item of propose){if(item&&item!==text&&!alts.includes(item))alts.push(item)}
  let i=1;while(alts.length<2){const p=text.slice(0,Math.max(1,text.length-i))+'s';if(p!==text&&!alts.includes(p))alts.push(p);i++}
  return [text,alts[0],alts[1]].sort(()=>Math.random()-.5);
 };
 function start(opts={}){
  quit(false);
  const p=book.getPack(opts.pack||1),chosen=p?shuffle(p.words).slice(0,8):[];
  state={pack:opts.pack||1,onBack:opts.onBack||(()=>location.reload()),onComplete:opts.onComplete||(()=>{}),
   questions:chosen,wave:0,selected:1,lives:3,score:0,finished:false,win:false,feedback:'',burst:0,mouseLock:false};
  render();
  raf=requestAnimationFrame(loop);
 }
 function shuffle(a){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
 function quit(back=true){if(raf)cancelAnimationFrame(raf);raf=0;const c=state?.onBack;state=null;if(back)c?.()}
 function choose(i){if(!state||state.finished||i<0||i>2)return;state.selected=i;renderTarget()}
 function fire(){
  const s=state;if(!s||s.finished||s.mouseLock)return;
  s.mouseLock=true;
  const word=s.questions[s.wave];
  const ok=s.options[s.selected]===word.word;
  const blast=root.querySelector('.blaster-shot');if(blast){blast.hidden=false;blast.style.left=(16.5+s.selected*33.3)+'%'}
  s.feedback=ok?'✨ RAAK! Goed gespeld!':'💡 Oei! De juiste spelling was '+word.word+'.';
  if(ok)s.score++;else s.lives--;
  const status=root.querySelector('#blaster-feedback');if(status)status.textContent=s.feedback;
  const target=root.querySelectorAll('.blaster-target')[s.selected];if(target)target.classList.add(ok?'blaster-hit':'blaster-miss');
  state.timer=setTimeout(()=>{
   if(!state||state!==s)return;
   s.wave++;s.mouseLock=false;
   if(s.wave>=s.questions.length||s.lives<=0)finish(s.lives>0);
   else render();
  },850);
 }
 function finish(win){
  const s=state;if(!s||s.finished)return;s.finished=true;s.win=win;
  if(raf)cancelAnimationFrame(raf);
  const b=root.querySelector('#blaster-end');if(b){b.hidden=false;b.innerHTML='<div class="blaster-medal">'+(win?'🏆':'💜')+'</div>'+
  '<h2>'+(win?'LEVEL 1 GEHAALD!':'NOG EEN KEER?')+'</h2><p>Je hebt '+s.score+' van '+s.wave+' woorden goed geraakt.</p>'+
  '<button class="btn primary" id="blaster-again">🔁 Opnieuw spelen</button> <button class="btn outline" id="blaster-home">🏠 Klaar</button>';
  root.querySelector('#blaster-again').onclick=()=>start({pack:s.pack,onBack:s.onBack,onComplete:s.onComplete});
  root.querySelector('#blaster-home').onclick=()=>quit()}
  if(win)s.onComplete?.({pack:s.pack,correct:s.score});
 }
 function loop(t){
  if(!state||state.finished)return;
  frame=t;
  const targets=root.querySelectorAll('.blaster-target');
  targets.forEach((x,i)=>{x.style.transform='translateY('+(Math.sin(t/430+i)*6)+'px)'});
  raf=requestAnimationFrame(loop);
 }
 function renderTarget(){
  root.querySelectorAll('.blaster-target').forEach((e,i)=>{e.classList.toggle('blaster-selected',i===state.selected)});
  const ship=root.querySelector('.blaster-ship');if(ship)ship.style.left=(16.5+state.selected*33.3)+'%';
 }
 function render(){
  const s=state;if(!s||s.finished)return;
  const q=s.questions[s.wave];s.options=variants(q);s.feedback='';
  root.innerHTML='<main class="shell"><header class="topbar"><button class="logo" id="blaster-back"><span class="logo-badge">🎮</span><strong>Rekenreis Retro Arcade</strong></button>'+
  '<span class="pill star">⭐ '+s.score+' / '+s.questions.length+'</span></header>'+
  '<section class="blaster-shell"><h1>🚀 Letterblaster</h1><p>Zoek de juiste spelling! Verplaats de raket en schiet op het goede woord.</p>'+
  '<div class="blaster-hud"><span>WAVE '+(s.wave+1)+'/8</span><span>'+('❤️'.repeat(s.lives)||'💔')+'</span></div>'+
  '<div class="blaster-screen"><div class="blaster-stars">✦ · ✨ · ✦ · · ✦</div><h2>Welke spelling is juist?</h2>'+
  '<div class="blaster-targets">'+s.options.map((opt,i)=>'<button type="button" class="blaster-target '+(i===s.selected?'blaster-selected':'')+'" data-select="'+i+'"><span>👾</span>'+String(opt).replace(/[&<>]/g,'')+'</button>').join('')+'</div>'+
  '<div class="blaster-shot" hidden>⚡</div><div class="blaster-ship">🚀</div><div id="blaster-feedback" class="blaster-feedback" aria-live="polite"></div>'+
  '<div class="blaster-ground">▓▒░▓▒░▓▒░▓▒░▓▒░</div>'+
  '<div class="blaster-end" id="blaster-end" hidden></div></div>'+
  '<div class="blaster-controls"><button id="blaster-left" class="blaster-btn">◀</button><button id="blaster-fire" class="blaster-btn shoot">✦ SCHIET</button><button id="blaster-right" class="blaster-btn">▶</button></div>'+
  '<p class="blaster-tip">📱 Tik op een woord om te richten, of gebruik de pijltjes. Daarna: SCHIET!</p>'+
  '<div class="result-actions"><button class="btn outline" id="blaster-quit">🏠 Terug naar dictee</button></div></section></main>';
  root.querySelector('#blaster-back').onclick=()=>quit();root.querySelector('#blaster-quit').onclick=()=>quit();
  root.querySelector('#blaster-left').onclick=()=>choose((s.selected+2)%3);
  root.querySelector('#blaster-right').onclick=()=>choose((s.selected+1)%3);
  root.querySelector('#blaster-fire').onclick=fire;
  root.querySelectorAll('[data-select]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.select)));
  renderTarget();
 }
 window.RekenLetterblaster=Object.freeze({open:start});
})();