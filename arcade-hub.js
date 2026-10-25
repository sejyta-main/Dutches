'use strict';
/* Rotating arcade rewards for dictation. Never serves the same game twice in a row.
   Existing dictation history and pet wallet are untouched. */
(function(){
 const KEY='rekenreis-dictee-arcade-cycle-v1';
 const MEDALS='rekenreis-dictee-arcade-medals-v1';
 const GAMES=[
  {id:'invaders',icon:'👾',name:'Pixel Ruimtemissie',desc:'Beweeg je raket, ontwijk lasers en versla 12 ruimtewezentjes.',style:'Atari arcade'},
  {id:'breakout',icon:'🧱',name:'Blokkenbreker',desc:'Kaats een bal met je batje en breek 18 blokken.',style:'Atari klassieker'},
  {id:'forest',icon:'🌲',name:'Pixel Bosavontuur',desc:'Ren en spring over boomstammen naar het geheime kasteel.',style:'Game Boy platform'}
 ];
 function read(){try{const n=Number(localStorage.getItem(KEY));return Number.isFinite(n)&&n>=0?Math.floor(n):0}catch(e){return 0}}
 let fallback=0;
 function index(){try{return read()}catch(e){return fallback}}
 function peek(){return GAMES[index()%GAMES.length].id}
 function next(){
  const id=peek(),n=index()+1;
  fallback=n;
  try{localStorage.setItem(KEY,String(n))}catch(e){}
  return id;
 }
 function medalCount(){try{const n=Number(localStorage.getItem(MEDALS));return Number.isFinite(n)&&n>=0?Math.floor(n):0}catch(e){return 0}}
 function award(){const n=medalCount()+1;try{localStorage.setItem(MEDALS,String(n))}catch(e){}return n}
 function offerHTML(recommended){
  return '<div class="arcade-v3-offer"><div class="arcade-v3-offer-title">🕹️ KIES JE RETROSPEL!</div>'+
   '<p>Je hebt je dictee geoefend. Vandaag mag je een ander arcade-avontuur spelen!</p>'+
   '<div class="arcade-v3-gamecards">'+GAMES.map(game=>
    '<button type="button" class="arcade-v3-gamecard '+(game.id===recommended?'arcade-v3-featured':'')+'" data-arcade-game="'+game.id+'">'+
    '<span class="arcade-v3-game-icon">'+game.icon+'</span>'+
    '<strong>'+game.name+'</strong><small>'+game.style+'</small><span>'+game.desc+'</span>'+
    (game.id===recommended?'<b>⭐ VANDAAG AANBEVOLEN</b>':'')+
    '</button>').join('')+'</div><p class="arcade-v3-foot">Elk spel heeft een echt speelbaar level, hartjes en een doel. Klaar om te beginnen?</p></div>';
 }
 function open(gameId,options={}){
  const games={invaders:window.RekenInvaders,breakout:window.RekenBreakout,forest:window.RekenForest};
  const implementation=games[gameId];
  if(!implementation?.open)return false;
  let awarded=false;
  implementation.open({pack:options.pack||1,name:options.name||'Rekenheld',
   onBack:options.onBack||(()=>location.reload()),onComplete:result=>{
    if(!awarded){awarded=true;award();options.onComplete?.({...result,game:gameId})}
   }});
  return true;
 }
 window.RekenArcade=Object.freeze({games:Object.freeze(GAMES),peek,next,offerHTML,open,medalCount});
})();