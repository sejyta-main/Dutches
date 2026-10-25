'use strict';
/* Original Atari-inspired brick breaker with physics, touch drag and keyboard. */
(function(){
 const root=document.getElementById('app'),W=480,H=340;
 let g=null,raf=0,prev=0;
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 function stop(){if(raf)cancelAnimationFrame(raf);raf=0;g?.dispose?.();g=null}
 function open(opts={}){
  stop();
  const bricks=[];
  for(let row=0;row<3;row++)for(let col=0;col<6;col++)bricks.push({x:24+col*74,y:50+row*30,alive:true,row});
  g={pack:opts.pack||1,back:opts.onBack||(()=>location.reload()),done:opts.onComplete||(()=>{}),
   x:W/2,ball:{x:W/2,y:257,vx:130,vy:-174},paddle:120,bricks,lives:4,hit:0,started:false,finished:false,awarded:false,
   keys:{left:false,right:false},spark:[],elapsed:0};
  render();prev=0;raf=requestAnimationFrame(loop);
 }
 function render(){
  root.innerHTML='<main class="shell arcade-v3-shell"><header class="topbar"><button class="logo" id="brick-back"><span class="logo-badge">🧱</span><strong>Rekenreis Arcade</strong></button><span class="pill star">🎮 LEVEL 1</span></header>'+
  '<section class="arcade-v3-panel"><h1>🧱 Blokkenbreker</h1><p>Beweeg je batje, kaats de bal terug en breek alle kleurrijke blokken!</p>'+
  '<div class="arcade-v3-score"><span id="brick-score">🧱 0 / 18</span><span id="brick-lives">❤️❤️❤️❤️</span></div>'+
  '<div class="arcade-v3-screen"><canvas id="brick-canvas" width="480" height="340" aria-label="Arcadespel met bal, batje en blokken"></canvas><div class="arcade-v3-finish" id="brick-finish" hidden></div></div>'+
  '<div class="arcade-v3-controls"><button data-brick="left">◀</button><button data-brick="start" class="shoot">🏓 START / BAL</button><button data-brick="right">▶</button></div>'+
  '<p class="arcade-v3-instruction">Schuif je vinger over het speelveld of houd ◀ ▶ ingedrukt. Breek 18 blokken!</p>'+
  '<button id="brick-exit" class="btn outline">← Naar het dictee</button></section></main>';
  const c=root.querySelector('#brick-canvas');g.ctx=c.getContext('2d');g.ctx.imageSmoothingEnabled=false;
  const quit=()=>{const cb=g?.back;stop();cb?.()};
  root.querySelector('#brick-back').onclick=quit;root.querySelector('#brick-exit').onclick=quit;
  const down=e=>{
   if(!g||g.finished)return;
   if(['ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
   if(e.code==='ArrowLeft')g.keys.left=true;
   if(e.code==='ArrowRight')g.keys.right=true;
   if(e.code==='Space')g.started=true;
  };
  const up=e=>{if(!g)return;if(e.code==='ArrowLeft')g.keys.left=false;if(e.code==='ArrowRight')g.keys.right=false};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);
  for(const b of root.querySelectorAll('[data-brick]')){
   const which=b.dataset.brick;
   b.addEventListener('pointerdown',e=>{
    e.preventDefault();b.setPointerCapture?.(e.pointerId);
    if(which==='start')g.started=true;else g.keys[which]=true;
   });
   for(const ev of ['pointerup','pointercancel','lostpointercapture'])
    b.addEventListener(ev,()=>{if(g&&which!=='start')g.keys[which]=false});
  }
  const locate=e=>{
   if(!g||g.finished)return;
   const bounds=c.getBoundingClientRect();
   g.x=clamp((e.clientX-bounds.left)/bounds.width*W,60,W-60);
  };
  c.addEventListener('pointerdown',e=>{e.preventDefault();g.started=true;locate(e);c.setPointerCapture?.(e.pointerId)});
  c.addEventListener('pointermove',e=>{if(e.buttons||e.pointerType==='touch')locate(e)});
  g.dispose=()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)};
 }
 function finish(won){
  if(!g||g.finished)return;
  g.finished=true;if(raf)cancelAnimationFrame(raf);
  const box=root.querySelector('#brick-finish');box.hidden=false;
  box.innerHTML='<div class="arcade-v3-trophy">'+(won?'🏆':'💫')+'</div><h2>'+(won?'ALLE BLOKKEN WEG!':'BIJNA!')+'</h2>'+
   '<p>'+(won?'Je brak alle 18 blokken, wat een kampioen!':'Je brak '+g.hit+' blokken. Probeer nog een keer!')+'</p>'+
   '<button id="brick-again" class="btn primary">🔁 Speel opnieuw</button> <button id="brick-done" class="btn outline">🏠 Klaar</button>';
  const cfg={pack:g.pack,onBack:g.back,onComplete:g.done};
  root.querySelector('#brick-again').onclick=()=>open(cfg);
  root.querySelector('#brick-done').onclick=()=>{let cb=g?.back;stop();cb?.()};
  if(won&&!g.awarded){g.awarded=true;g.done({game:'breakout',pack:g.pack,score:g.hit})}
 }
 function bounce(dt){
  const s=g,b=s.ball;
  s.elapsed+=dt;
  s.x=clamp(s.x+(Number(s.keys.right)-Number(s.keys.left))*280*dt,60,W-60);
  if(!s.started){b.x=s.x;b.y=277;return}
  let prevY=b.y;
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.x<9){b.x=9;b.vx=Math.abs(b.vx)}
  if(b.x>W-9){b.x=W-9;b.vx=-Math.abs(b.vx)}
  if(b.y<13){b.y=13;b.vy=Math.abs(b.vy)}
  if(b.vy>0&&prevY<=294&&b.y>=294&&Math.abs(b.x-s.x)<69){
   b.y=289;const offset=clamp((b.x-s.x)/70,-.96,.96);
   b.vx=offset*245;b.vy=-Math.sqrt(Math.max(145*145,265*265-b.vx*b.vx));
  }
  if(b.y>H+4){
   s.lives--;s.started=false;b.vx=130;b.vy=-174;
   if(s.lives<=0){finish(false);return}
  }
  for(const tile of s.bricks){
   if(!tile.alive)continue;
   if(b.x>tile.x-6&&b.x<tile.x+68+6&&b.y>tile.y-6&&b.y<tile.y+21+6){
    tile.alive=false;s.hit++;b.vy*=-1;b.y+=(b.vy>0?9:-9);s.spark.push({x:b.x,y:b.y,life:.7});
    if(s.hit>=18){finish(true);return}break;
   }
  }
  for(const p of s.spark)p.life-=dt;
  s.spark=s.spark.filter(p=>p.life>0);
  const a=root.querySelector('#brick-score'),l=root.querySelector('#brick-lives');
  if(a)a.textContent='🧱 '+s.hit+' / 18';
  if(l)l.textContent='❤️'.repeat(s.lives)||'💔';
 }
 function rect(x,y,w,h,color){const c=g.ctx;c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
 function draw(){
  const s=g,c=s.ctx;c.fillStyle='#171930';c.fillRect(0,0,W,H);
  for(let i=0;i<35;i++)rect((i*143)%W,(i*53)%H,2,2,'#434574');
  const palette=['#ffad9f','#f9d47b','#86e4d2'];
  for(const t of s.bricks){
   if(!t.alive)continue;
   rect(t.x+3,t.y+5,68,21,'#34365f');
   rect(t.x,t.y,68,21,palette[t.row]);rect(t.x+5,t.y+5,58,5,'#ffffff55');
  }
  rect(s.x-68,299,136,12,'#9ed5ff');rect(s.x-50,297,100,6,'#ebfaff');
  const b=s.ball;rect(b.x-6,b.y-6,12,12,'#fff3a5');rect(b.x-3,b.y-3,6,6,'#fff');
  for(const p of s.spark){rect(p.x-19,p.y-9,11,11,'#fff79a');rect(p.x+13,p.y+6,8,8,'#dfffa6')}
  if(!s.started){c.fillStyle='#fce9a6';c.font='bold 18px monospace';c.fillText('DRUK OP START / TIK',113,255)}
  rect(0,H-9,W,9,'#414269');
 }
 function loop(t){
  if(!g||g.finished)return;
  const dt=prev?Math.min(.032,(t-prev)/1000):.016;prev=t;
  bounce(dt);if(g)draw();
  if(g&&!g.finished)raf=requestAnimationFrame(loop);
 }
 window.RekenBreakout=Object.freeze({open});
})();