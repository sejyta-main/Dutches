'use strict';
/* Original fixed-level arcade shooter inspired by 1980s cabinets; no copyrighted sprites. */
(function(){
 const bi=(nl,en)=>window.RekenTaal?window.RekenTaal.pair(nl,en):nl;
 const root=document.getElementById('app');
 const W=480,H=340;
 let g=null,raf=0,prev=0;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function stop(){if(raf)cancelAnimationFrame(raf);raf=0;if(g?.dispose)g.dispose();g=null}
 function open(options={}){
  stop();
  g={back:options.onBack||(()=>location.reload()),done:options.onComplete||(()=>{}),pack:options.pack||1,
   ship:W/2,keys:{left:false,right:false,fire:false},shots:[],enemyShots:[],enemies:[],sparks:[],
   wave:0,dir:1,levelTime:0,fireCooldown:0,enemyCooldown:1.5,kills:0,lives:4,freeze:0,finished:false,won:false,awarded:false};
  for(let r=0;r<2;r++)for(let c=0;c<6;c++)g.enemies.push({x:60+c*66,y:63+r*38,alive:true,glow:r%2});
  render();prev=0;raf=requestAnimationFrame(loop);
 }
 function render(){
  root.innerHTML='<main class="shell arcade-v3-shell"><header class="topbar"><button id="inv-back" class="logo"><span class="logo-badge">👾</span><span><strong>Rekenreis Arcade</strong><small>Pixel Ruimtemissie</small></span></button><span class="pill star">🎮 LEVEL 1</span></header>'+
  '<section class="arcade-v3-panel"><h1>👾 Pixel Ruimtemissie</h1><p>'+bi('Vlieg naar links en rechts, ontwijk laserstralen en versla de ruimtewezentjes!','Fly left and right, dodge lasers and defeat the space invaders!')+'</p>'+
  '<div class="arcade-v3-score"><span id="inv-score">⭐ 0 / 12</span><span id="inv-hearts">❤️❤️❤️❤️</span></div>'+
  '<div class="arcade-v3-screen"><canvas id="inv-canvas" width="480" height="340" aria-label="Ruimtearcade met raket, vijanden en lasers"></canvas><div class="arcade-v3-finish" id="inv-finish" hidden></div></div>'+
  '<div class="arcade-v3-controls"><button type="button" data-control="left">◀</button><button type="button" class="shoot" data-control="fire">🔴 VUUR!</button><button type="button" data-control="right">▶</button></div>'+
  '<p class="arcade-v3-instruction">'+bi('Houd de pijlen en VUUR ingedrukt. Computer: ← → en spatie.','Hold the arrows and FIRE to play. On a computer, use ← → and Space.')+'</p><button id="inv-exit" class="btn outline">← Naar het dictee</button></section></main>';
  const canvas=root.querySelector('#inv-canvas'),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;g.ctx=ctx;
  const quit=()=>{let cb=g?.back;stop();cb?.()};
  root.querySelector('#inv-back').onclick=quit;root.querySelector('#inv-exit').onclick=quit;
  const keydown=e=>{if(!g||g.finished)return;if(['ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
   if(e.code==='ArrowLeft')g.keys.left=true;if(e.code==='ArrowRight')g.keys.right=true;if(e.code==='Space')g.keys.fire=true};
  const keyup=e=>{if(!g)return;if(e.code==='ArrowLeft')g.keys.left=false;if(e.code==='ArrowRight')g.keys.right=false;if(e.code==='Space')g.keys.fire=false};
  window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);
  for(const button of root.querySelectorAll('[data-control]')){
   const key=button.dataset.control;
   button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture?.(e.pointerId);g.keys[key]=true});
   for(const type of ['pointerup','pointercancel','lostpointercapture'])
    button.addEventListener(type,()=>{if(g)g.keys[key]=false});
  }
  g.dispose=()=>{window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup)};
 }
 function finish(win){
  if(!g||g.finished)return;
  g.finished=true;g.won=win;
  if(raf)cancelAnimationFrame(raf);
  const box=root.querySelector('#inv-finish');
  box.hidden=false;
  box.innerHTML='<div class="arcade-v3-trophy">'+(win?'🏆':'💫')+'</div>'+
  '<h2>'+(win?'MISSIE GESLAAGD!':'NOG EEN KEER?')+'</h2><p>'+
  (win?'Alle 12 ruimtewezentjes verslagen! Goed gedaan!':'Je raakte '+g.kills+' van de 12. Je kunt het!')+'</p>'+
  '<button id="inv-retry" class="btn primary">🔁 Probeer opnieuw</button><button id="inv-done" class="btn outline">🏠 Klaar</button>';
  const snapshot={pack:g.pack,onBack:g.back,onComplete:g.done};
  root.querySelector('#inv-retry').onclick=()=>open(snapshot);
  root.querySelector('#inv-done').onclick=()=>{const cb=g?.back;stop();cb?.()};
  if(win&&!g.awarded){g.awarded=true;g.done({game:'invaders',pack:g.pack,score:g.kills})}
 }
 function blast(x,y,color){
  for(let j=0;j<8;j++)g.sparks.push({x,y,vx:(Math.random()-.5)*125,vy:(Math.random()-.5)*125,life:.55,color});
 }
 function tick(dt){
  const s=g;
  s.levelTime+=dt;s.freeze=Math.max(0,s.freeze-dt);
  s.ship=clamp(s.ship+(Number(s.keys.right)-Number(s.keys.left))*260*dt,20,W-20);
  s.fireCooldown-=dt;
  if(s.keys.fire&&s.fireCooldown<=0){s.shots.push({x:s.ship,y:281});s.fireCooldown=.25}
  for(const b of s.shots)b.y-=320*dt;
  for(const b of s.enemyShots)b.y+=155*dt;
  s.enemyCooldown-=dt;
  const alive=s.enemies.filter(e=>e.alive);
  if(s.enemyCooldown<=0&&alive.length){
   const enemy=alive[Math.floor(Math.random()*alive.length)];
   s.enemyShots.push({x:enemy.x,y:enemy.y+12});s.enemyCooldown=1.2+Math.random()*.9;
  }
  const speed=24+s.kills*2.3,extreme=alive.some(e=>e.x<22||e.x>W-22);
  if(extreme)s.dir*=-1;
  for(const e of alive){e.x+=s.dir*speed*dt;e.y+=.55*dt;
   if(e.y>=260){finish(false);return}
  }
  for(const b of s.shots)for(const e of alive){
   if(e.alive&&Math.abs(b.x-e.x)<19&&Math.abs(b.y-e.y)<16){
    e.alive=false;b.y=-100;s.kills++;blast(e.x,e.y,'#ffe58f');
   }
  }
  if(s.freeze===0)for(const b of s.enemyShots){
   if(Math.abs(b.x-s.ship)<19&&Math.abs(b.y-290)<18){
    b.y=H+100;s.lives--;s.freeze=1.25;blast(s.ship,290,'#ff9bad');
   }
  }
  for(const p of s.sparks){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}
  s.sparks=s.sparks.filter(p=>p.life>0);
  s.shots=s.shots.filter(b=>b.y>0);
  s.enemyShots=s.enemyShots.filter(b=>b.y<H);
  if(s.kills>=12){finish(true);return}
  if(s.lives<=0){finish(false);return}
  const a=root.querySelector('#inv-score'),b=root.querySelector('#inv-hearts');
  if(a)a.textContent='⭐ '+s.kills+' / 12';
  if(b)b.textContent='❤️'.repeat(s.lives)||'💔';
 }
 function box(x,y,w,h,color){const c=g.ctx;c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h)}
 function paint(){
  const s=g,ctx=s.ctx;ctx.fillStyle='#10162d';ctx.fillRect(0,0,W,H);
  for(let i=0;i<55;i++){
   const x=(i*97+11)%W,y=(i*53+Math.floor(s.levelTime*12))%H;
   box(x,y,(i%3)+1,(i%3)+1,'#677ca6');
  }
  for(const e of s.enemies){if(!e.alive)continue;
   box(e.x-13,e.y-9,26,19,e.glow?'#a5cfff':'#a5f0be');
   box(e.x-20,e.y-1,7,11,'#5a87c4');box(e.x+13,e.y-1,7,11,'#5a87c4');
   box(e.x-7,e.y-2,4,4,'#132642');box(e.x+4,e.y-2,4,4,'#132642');
   box(e.x-11,e.y+12,6,5,'#6c91e6');box(e.x+5,e.y+12,6,5,'#6c91e6');
  }
  if(s.freeze===0||Math.floor(s.levelTime*12)%2===0){
   box(s.ship-15,290,30,16,'#d2abff');box(s.ship-7,278,14,21,'#f3e7ff');
   box(s.ship-18,301,7,10,'#a09bf4');box(s.ship+11,301,7,10,'#a09bf4');
   box(s.ship-3,283,6,9,'#77e4ff');
  }
  for(const b of s.shots)box(b.x-2,b.y-9,5,13,'#ffeb76');
  for(const b of s.enemyShots)box(b.x-3,b.y,6,11,'#ff94ba');
  for(const p of s.sparks)box(p.x,p.y,5,5,p.color);
  box(0,326,W,7,'#4b6c9a');
 }
 function loop(time){
  if(!g||g.finished)return;
  const dt=prev?Math.min(.035,(time-prev)/1000):.016;prev=time;
  tick(dt);if(g)paint();
  if(g&&!g.finished)raf=requestAnimationFrame(loop);
 }
 window.RekenInvaders=Object.freeze({open});
})();