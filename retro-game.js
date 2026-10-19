'use strict';
/* Original 8-bit-inspired single-level arcade mini-game for completing a word pack. */
(function(){
 const root=document.getElementById('app'),W=360,H=440;
 let back=()=>{},done=()=>{},pack=1,raf=0,previous=0,running=false,level=null,canvas=null,ctx=null,pressed={left:false,right:false},lastShot=0;
 const emojis=['🌳','💫','🏰','🦊','🌺','🏖️','🌈','🌟'];
 const colors=['#57eeb6','#f9b65b','#7fd6ff','#e8a1fc','#ffa6a2','#fff178','#9bf5ef','#d0b4ff'];
 function rand(a,b){return Math.random()*(b-a)+a}
 function start(opts={}){
  quit(false);
  back=typeof opts.onBack==='function'?opts.onBack:()=>location.reload();
  done=typeof opts.onComplete==='function'?opts.onComplete:()=>{};
  pack=Math.max(1,Math.min(8,Number(opts.pack)||1));
  pressed={left:false,right:false};lastShot=0;
  level={x:W/2,y:H-49,hits:0,lives:3,balls:[],targets:[],particles:[],time:0,ended:false,win:false,stars:[],bonus:0};
  for(let i=0;i<36;i++)level.stars.push({x:rand(5,W-5),y:rand(4,H-4),size:rand(1,3)});
  for(let row=0;row<3;row++)for(let col=0;col<6;col++)level.targets.push({x:35+col*58,y:68+row*44,alive:true,dir:col%2?1:-1});
  drawShell();running=true;previous=0;raf=requestAnimationFrame(frame);
 }
 function drawShell(){
  const hue=colors[(pack-1)%8];
  root.innerHTML='<main class="shell"><header class="topbar"><button class="logo" id="retro-back"><span class="logo-badge">🦊</span><span><strong>Rekenreis</strong><small>Retro Arcade • Woordpakket '+pack+'</small></span></button><span class="pill star">🎮 BONUSNIVEAU</span></header>'+
   '<section class="arcade-shell"><div class="arcade-head"><div><div class="eyebrow">✨ Woordpakket '+pack+' uitgespeeld</div><h1>🚀 Sterrenraket</h1><p>Vang de sterren met je raket! Schiet en haal 12 sterren om dit bonusniveau te winnen.</p></div><span class="arcade-logo">'+emojis[pack-1]+'</span></div>'+
   '<div class="arcade-status"><span id="arcade-score">⭐ 0/12</span><span id="arcade-lives">❤️❤️❤️</span><span id="arcade-time">⏳ 60s</span></div>'+
   '<div class="arcade-screen"><canvas id="arcade-canvas" width="360" height="440" aria-label="Retrospel met raket en sterren"></canvas>'+
   '<div class="arcade-message" id="arcade-result" hidden></div></div>'+
   '<div class="arcade-controls"><button id="arcade-left" class="arcade-control" aria-label="Naar links">◀</button><button id="arcade-fire" class="arcade-control arcade-fire" aria-label="Schieten">✦ SCHIET</button><button id="arcade-right" class="arcade-control" aria-label="Naar rechts">▶</button></div>'+
   '<div class="arcade-instructions">📱 Houd ◀ of ▶ ingedrukt om te bewegen. Tik op SCHIET. Op computer: pijltjes en spatie.</div>'+
   '<div class="result-actions"><button id="arcade-exit" class="btn outline">← Naar mijn dictee</button></div></section></main>';
  canvas=root.querySelector('#arcade-canvas');ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
  root.querySelector('#arcade-back').onclick=()=>quit(true);
  root.querySelector('#arcade-exit').onclick=()=>quit(true);
  for(const [id,key] of [['arcade-left','left'],['arcade-right','right']]){
    const b=root.querySelector('#'+id);
    b.addEventListener('pointerdown',e=>{e.preventDefault();pressed[key]=true;b.setPointerCapture?.(e.pointerId)});
    const release=()=>{pressed[key]=false};
    b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);
  }
  const f=root.querySelector('#arcade-fire');f.addEventListener('pointerdown',e=>{e.preventDefault();shot()});
  const keydown=e=>{if(!running)return;if(['ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.code==='ArrowLeft')pressed.left=true;if(e.code==='ArrowRight')pressed.right=true;if(e.code==='Space')shot()};
  const keyup=e=>{if(e.code==='ArrowLeft')pressed.left=false;if(e.code==='ArrowRight')pressed.right=false};
  window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);
  level.dispose=()=>{window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup)};
  level.color=hue;
 }
 function quit(callBack){
  running=false;if(raf)cancelAnimationFrame(raf);raf=0;
  if(level?.dispose){level.dispose();level.dispose=null}
  if(callBack)back();
 }
 function shot(){
  if(!running||level.ended)return;
  if(level.time-lastShot<.21)return;
  lastShot=level.time;level.balls.push({x:level.x,y:level.y-26});
 }
 function frame(timestamp){
  if(!running)return;
  let dt=previous?Math.min(.035,(timestamp-previous)/1000):.016;previous=timestamp;
  let s=level;if(!s.ended)update(dt);
  paint();
  if(running&&!s.ended)raf=requestAnimationFrame(frame);
 }
 function update(dt){
  let s=level;s.time+=dt;
  if(pressed.left)s.x-=230*dt;if(pressed.right)s.x+=230*dt;s.x=Math.max(20,Math.min(W-20,s.x));
  for(let b of s.balls)b.y-=420*dt;
  s.balls=s.balls.filter(b=>b.y>-10);
  for(const t of s.targets){
   if(!t.alive)continue;
   t.x+=Math.sin(s.time*(1+pack*.055)+t.y*.038)*13*dt;
   t.y+=dt*(5+pack*.65);
   if(t.y>=H-92){t.y=68; t.x=rand(20,W-20);s.lives=Math.max(0,s.lives-1)}
  }
  for(const b of s.balls){
   for(const t of s.targets){if(t.alive&&Math.abs(b.x-t.x)<19&&Math.abs(b.y-t.y)<20){
    t.alive=false;b.y=-50;s.hits++;for(let i=0;i<8;i++)s.particles.push({x:t.x,y:t.y,vx:rand(-90,90),vy:rand(-100,20),life:.8});
    break
   }}
  }
  for(const p of s.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=180*dt;p.life-=dt}
  s.particles=s.particles.filter(p=>p.life>0);
  if(s.hits>=12)end(true);
  else if(s.lives<=0||s.time>=60)end(false);
  const sc=root.querySelector('#arcade-score'),lv=root.querySelector('#arcade-lives'),tm=root.querySelector('#arcade-time');
  if(sc)sc.textContent='⭐ '+s.hits+'/12';if(lv)lv.textContent='❤️'.repeat(s.lives)||'💔';if(tm)tm.textContent='⏳ '+Math.max(0,60-Math.floor(s.time))+'s';
 }
 function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
 function paint(){
  const s=level;ctx.fillStyle='#121532';ctx.fillRect(0,0,W,H);
  for(const star of s.stars){rect(star.x,star.y,star.size,star.size,'#666bb8')}
  for(let k=0;k<7;k++){let y=(H-20-k*21+Math.floor(s.time*15))%H;rect(0,y,W,1,'#222c54')}
  for(const t of s.targets){
   if(!t.alive)continue;
   // Original pixel crystal sprite.
   rect(t.x-5,t.y-17,10,5,s.color);rect(t.x-14,t.y-12,28,8,s.color);rect(t.x-19,t.y-4,38,8,'#f4d96d');
   rect(t.x-12,t.y+4,24,9,s.color);rect(t.x-5,t.y+13,10,5,'#ffffff');
  }
  // Original smiling pixel rocket sprite.
  rect(s.x-9,s.y-25,18,13,'#c5bcff');rect(s.x-15,s.y-12,30,18,'#f6f6ff');
  rect(s.x-20,s.y-5,8,19,'#9d65d4');rect(s.x+12,s.y-5,8,19,'#9d65d4');
  rect(s.x-6,s.y-4,12,11,'#79c4f7');rect(s.x-5,s.y+7,10,12,'#f7a948');
  for(const b of s.balls)rect(b.x-3,b.y-8,6,13,'#f9ef7e');
  for(const p of s.particles)rect(p.x,p.y,5,5,s.color);
 }
 function end(won){
  if(level.ended)return;
  level.ended=true;level.win=won;running=false;
  const box=root.querySelector('#arcade-result');
  if(box){box.hidden=false;box.innerHTML='<div class="arcade-victory">'+(won?'🏆':'💫')+'</div>'+
   '<h2>'+(won?'NIVEAU GEHAALD!':'NOG EEN KEER?')+'</h2><p>'+(won?'Wat een fantastische sterrenpiloot! Je vond alle 12 sterren.':'Je vond '+level.hits+' van de 12 sterren. Probeer het opnieuw!')+'</p>'+
   '<div class="result-actions"><button id="arcade-again" class="btn primary">🔁 Speel opnieuw</button><button id="arcade-done" class="btn outline">🏠 Klaar</button></div>';
   root.querySelector('#arcade-again').onclick=()=>{const opts={pack,onBack:back,onComplete:done};start(opts)};
   root.querySelector('#arcade-done').onclick=()=>quit(true);
  }
  if(won)try{done({pack,score:level.hits})}catch(e){}
 }
 window.RekenRetro=Object.freeze({open:start});
})();