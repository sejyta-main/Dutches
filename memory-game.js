'use strict';
(function(){
 let back=()=>{}, reward=()=>{}, cards=[],seen=[],matched=new Set(),moves=0,earned=false;
 const icons=['🦊','🐼','🦋','🐻','🐸','🦄'];
 function newGame(){
  cards=icons.concat(icons).map((icon,i)=>({icon,id:i}));
  for(let i=cards.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]]}
  seen=[];matched=new Set();moves=0;earned=false;draw();
 }
 function open(config){back=config.onBack;reward=config.onReward;newGame();window.RekenNavigation?.top()}
 function flip(i){
  if(seen.length>=2||seen.includes(i)||matched.has(i))return;
  seen.push(i);
  draw();
  if(seen.length===2){
   moves++;
   let [a,b]=seen;
   if(cards[a].icon===cards[b].icon){
    matched.add(a);matched.add(b);seen=[];
    if(matched.size===cards.length&&!earned){earned=true;reward(50)}
    draw();
   }else{setTimeout(()=>{seen=[];draw()},850)}
  }
 }
 function draw(){
  const won=matched.size===cards.length;
  const tiles=cards.map((c,i)=>'<button class="memory-card '+(matched.has(i)?'memory-matched':'')+'" data-flip="'+i+'" type="button" aria-label="Geheugenkaart '+(i+1)+'">'+(seen.includes(i)||matched.has(i)?c.icon:'❔')+'</button>').join('');
  document.getElementById('app').innerHTML='<main class="shell"><header class="topbar"><button class="logo" id="mem-home"><span class="logo-badge">🦊</span><span><strong>Rekenreis</strong><small>Magisch bos</small></span></button><span class="pill star">⭐ Bonusspel</span></header><section class="bonus-hero"><h1>🦄 Het magische memorybos</h1><p>Je hebt vier werelden perfect uitgespeeld! Zoek nu zes gelijke dierenparen.</p></section><section class="bonus-card">'+(won?'<div class="center"><div class="bonus-big">🏆</div><h2>Geweldig gedaan!</h2><p>Je vond alle zes dierenparen in '+moves+' pogingen.</p><div class="bonus-prize">🏅 Een gouden memorymedaille verdiend!</div><button id="mem-repeat" class="btn violet">🔁 Speel nog een keer</button></div>':'<div class="bonus-head"><span>🌟 Paren: '+(matched.size/2)+' / 6</span><span>🧩 Pogingen: '+moves+'</span></div><p class="center">Draai twee kaarten om. Onthoud goed waar elk dier zit!</p><div class="memory-grid">'+tiles+'</div>')+'<div class="result-actions"><button class="btn outline" id="mem-back">← Terug naar de werelden</button></div></section></main>';
  document.getElementById('mem-home').onclick=back;
  document.getElementById('mem-back').onclick=back;
  if(won)document.getElementById('mem-repeat').onclick=newGame;
  else document.querySelectorAll('[data-flip]').forEach(el=>el.onclick=()=>flip(Number(el.dataset.flip)));
 }
 window.RekenBonus={open};
})();