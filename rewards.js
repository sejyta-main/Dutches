'use strict';
/* Perfect-score rewards. Works with the existing Rekenreis PWA and saved results. */
(function(){
 const DATA='rekenreis-progress-v1',SEEN='rekenreis-last-reward-v1',MEDALS='rekenreis-earned-medals-v1';
 const WORLD_IDS=['blocks','place','words','line','compare'];
 const root=document.getElementById('app');
 let overlay=null,catches=0,starAt=-1,prizeReady=false,newChampion=false;
 function sessions(){try{const d=JSON.parse(localStorage.getItem(DATA)||'{}');return Array.isArray(d.sessions)?d.sessions:[]}catch(e){return []}}
 function mastered(list){return WORLD_IDS.filter(id=>list.some(s=>s.topic===id&&s.mode==='practice'&&s.total===10&&s.correct===10))}
 function sessionKey(s,index){return [index,s.date,s.topic,s.correct,s.total].join('|')}
 function check(){
  if(overlay||!root.querySelector('#home-summary'))return;
  const all=sessions(),last=all[all.length-1];
  if(!last||last.mode!=='practice'||last.total!==10||last.correct!==10)return;
  const key=sessionKey(last,all.length);
  if(localStorage.getItem(SEEN)===key)return;
  try{localStorage.setItem(SEEN,key)}catch(e){}
  const before=mastered(all.slice(0,-1)),after=mastered(all);
  newChampion=before.length<4&&after.length>=4;
  catches=0;prizeReady=false;
  open();
 }
 function open(){
  if(!overlay){
   overlay=document.createElement('div');
   overlay.id='reken-reward-overlay';
   overlay.setAttribute('role','dialog');
   overlay.setAttribute('aria-modal','true');
   document.body.appendChild(overlay);
  }
  stage();
 }
 function close(){
  if(overlay){overlay.remove();overlay=null}
 }
 function btn(label,id){return '<button type="button" class="btn primary" id="'+id+'">'+label+'</button>'}
 function stage(){
  if(!overlay)return;
  if(prizeReady){finish();return}
  starAt=Math.floor(Math.random()*9);
  let tiles=Array.from({length:9},(_,i)=>'<button class="reward-tile" type="button" data-star="'+i+'" aria-label="'+(i===starAt?'Gouden ster':'Wolkje')+'">'+(i===starAt?'🌟':'☁️')+'</button>').join('');
  overlay.innerHTML='<div class="reward-window"><div class="reward-confetti">✨ 🎉 ✨</div><div class="reward-kicker">🏆 10 OP 10!</div>'+
   '<h1>Wat knap, rekenheld!</h1><p>Je hebt alle tien vragen goed. Speel nu je verdiende <strong>sterrenspel!</strong></p>'+
   '<div class="reward-score">🌟 Gevangen sterren: '+catches+' / 5</div>'+
   '<div class="reward-grid">'+tiles+'</div>'+
   '<p class="reward-hint">Tik op de gouden ster. Kun je ze alle vijf vangen?</p>'+
   '<button class="reward-later" id="reward-close" type="button">Later spelen</button></div>';
  overlay.querySelectorAll('[data-star]').forEach(b=>b.addEventListener('click',()=>{
   if(Number(b.dataset.star)===starAt){
    catches++;
    if(catches>=5){prizeReady=true;try{localStorage.setItem(MEDALS,String((Number(localStorage.getItem(MEDALS))||0)+1))}catch(e){}}
    stage();
   }else{b.classList.add('reward-oops');b.textContent='💨'}
  }));
  overlay.querySelector('#reward-close').onclick=close;
 }
 function finish(){
  const count=Number(localStorage.getItem(MEDALS))||1;
  overlay.innerHTML='<div class="reward-window reward-finish"><div class="reward-confetti">🎊 🏅 🎊</div>'+
   '<h1>Je bent een sterrenkampioen!</h1><p>Vijf sterren gevangen. Je verdient een nieuwe gouden medaille!</p>'+
   '<div class="reward-trophy">🏅</div><p><strong>Medaille '+count+' verdiend!</strong></p>'+
   (newChampion?'<div class="reward-special"><h2>🔓 Extra verrassing!</h2><p>Vier verschillende rekenwerelden met 10/10! Het magische memorybos is nu vrijgespeeld.</p>'+
    btn('🦄 Speel het speciale memoryspel','reward-special-game')+'</div>':'<p>Blijf oefenen voor het geheime bonusspel na vier perfecte werelden.</p>')+
   '<button type="button" id="reward-done" class="btn outline">🏠 Terug naar mijn resultaten</button></div>';
  overlay.querySelector('#reward-done').onclick=close;
  const play=overlay.querySelector('#reward-special-game');
  if(play)play.onclick=()=>{
   close();
   if(window.RekenBonus){
    window.RekenBonus.open({onBack:()=>window.location.reload(),onReward:()=>{}});
   }else alert('Het memoryspel is nog niet geladen. Open het via het startscherm.');
  };
 }
 new MutationObserver(check).observe(root,{childList:true});
 check();
 window.RekenRewards={mastered,check};
})();