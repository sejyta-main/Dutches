'use strict';
/* Rotating arcade rewards for dictation. Never serves the same game twice in a row.
   Existing dictation history and pet wallet are untouched. */
(function(){
 const bi=(nl,en)=>window.RekenTaal?window.RekenTaal.pair(nl,en):nl;
 const KEY='rekenreis-dictee-arcade-cycle-v1';
 const MEDALS='rekenreis-dictee-arcade-medals-v1';
 const GAMES=[
  {id:'invaders',icon:'👾',name:'Pixel Ruimtemissie',desc:'Beweeg je raket, ontwijk lasers en versla 12 ruimtewezentjes.',style:'Atari arcade'},
  {id:'breakout',icon:'🧱',name:'Blokkenbreker',desc:'Kaats een bal met je batje en breek 18 blokken.',style:'Atari klassieker'},
  {id:'forest',icon:'🌲',name:'Pixel Bosavontuur',desc:'Ren en spring over boomstammen naar het geheime kasteel.',style:'Game Boy platform'}
 ];
 function read(){try{const raw=localStorage.getItem(KEY);if(raw===null)return fallback;const n=Number(raw);return Number.isFinite(n)&&n>=0?Math.floor(n):fallback}catch(e){return fallback}}
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
   '<p>'+bi('Je hebt je dictee geoefend. Vandaag mag je een ander arcade-avontuur spelen!','You finished practicing your dictation. Choose a fun arcade adventure!')+'</p>'+
   '<div class="arcade-v3-gamecards">'+GAMES.map(game=>
    '<button type="button" class="arcade-v3-gamecard '+(game.id===recommended?'arcade-v3-featured':'')+'" data-arcade-game="'+game.id+'">'+
    '<span class="arcade-v3-game-icon">'+game.icon+'</span>'+
    '<strong>'+game.name+'</strong><small>'+game.style+'</small><span>'+bi(game.desc,({invaders:'Move your spaceship, dodge lasers and defeat 12 enemies.',breakout:'Bounce the ball and break 18 bricks.',forest:'Run and jump over logs to reach the secret castle.'})[game.id])+'</span>'+
    (game.id===recommended?'<b>⭐ VANDAAG AANBEVOLEN</b>':'')+
    '</button>').join('')+'</div><p class="arcade-v3-foot">'+bi('Elk spel heeft een echt speelbaar level, hartjes en een doel. Klaar om te beginnen?','Each game has a playable level, lives and a goal. Ready to play?')+'</p></div>';
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