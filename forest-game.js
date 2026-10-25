'use strict';
/* Original Game-Boy-inspired side-scrolling platform game; one short complete level. */
(function(){
 const bi=(nl,en)=>window.RekenTaal?window.RekenTaal.pair(nl,en):nl;
 const root=document.getElementById('app'),CW=480,CH=270,WORLD=1570,GROUND=218;
 const stones=[310,510,770,1010,1240],gems=[100,215,350,448,606,720,855,960,1112,1268,1380,1470];
 const pets={fox:'🦊',cat:'🐱',dog:'🐶',rabbit:'🐰'};
 let game=null,raf=0,prev=0,ctx=null;
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function cancel(){if(raf)cancelAnimationFrame(raf);raf=0;if(game?.dispose)game.dispose();game=null}
 function open(config={}){
  cancel();
  game={name:config.name||'Rekenheld',pet:pets[config.pet]||'🦊',onBack:config.onBack||(()=>location.reload()),onComplete:config.onComplete||(()=>{}),
   mode:config.mode||'bonus',x:35,y:GROUND-35,vx:0,vy:0,life:3,stars:new Set(),time:0,camera:0,grounded:true,hurt:0,done:false,win:false,
   buttons:{left:false,right:false,jump:false},particles:[],checkpoint:30};
  render();prev=0;raf=requestAnimationFrame(loop);
 }
 function render(){
  const g=game;if(!g)return;
  root.innerHTML='<main class="shell forest-app"><header class="topbar"><button class="logo" id="forest-back"><span class="logo-badge">🎮</span><span><strong>Rekenreis</strong><small>Pixel Bosavontuur · retro level 1</small></span></button>'+
  '<span class="pill star" id="forest-status">💎 0/8 | ❤️❤️❤️</span></header>'+
  '<section class="forest-shell"><div class="forest-intro"><h1>🌲 Pixel Bosavontuur</h1><p>'+bi('Ren, spring over boomstammen en verzamel minstens 8 kristallen. Bereik daarna het gouden kasteel!','Run, jump over logs and collect at least 8 crystals. Then reach the golden castle!')+'</p></div>'+
  '<div class="forest-screen"><canvas id="forest-canvas" width="480" height="270" aria-label="Zijwaarts scrollend bosspel"></canvas>'+
  '<div class="forest-overlay" id="forest-result" hidden></div></div>'+
  '<div class="forest-controls"><button class="forest-btn" data-control="left" aria-label="Links bewegen">◀</button>'+
  '<button class="forest-btn forest-jump" data-control="jump" aria-label="Springen">⬆ SPRING!</button>'+
  '<button class="forest-btn" data-control="right" aria-label="Rechts bewegen">▶</button></div>'+
  '<div class="forest-note">'+bi('Houd ◀ of ▶ ingedrukt en spring met ⬆. Je hebt 3 hartjes. Op computer: pijltjes en spatie.','Hold ◀ or ▶ to run and use ⬆ to jump. You have 3 hearts. On a computer, use arrow keys and Space.')+'</div>'+
  '<div class="result-actions"><button id="forest-quit" class="btn outline">🏠 Terug</button></div></section></main>';
  ctx=root.querySelector('#forest-canvas').getContext('2d');ctx.imageSmoothingEnabled=false;
  root.querySelector('#forest-back').onclick=()=>exit();root.querySelector('#forest-quit').onclick=()=>exit();
  root.querySelectorAll('[data-control]').forEach(b=>{
   const type=b.dataset.control;
   b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture?.(e.pointerId);g.buttons[type]=true});
   for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>{g.buttons[type]=false});
  });
  const down=e=>{if(!game||game!==g)return;if(['ArrowLeft','ArrowRight','ArrowUp','Space'].includes(e.code))e.preventDefault();if(e.code==='ArrowLeft')g.buttons.left=true;if(e.code==='ArrowRight')g.buttons.right=true;if(e.code==='ArrowUp'||e.code==='Space')g.buttons.jump=true};
  const up=e=>{if(e.code==='ArrowLeft')g.buttons.left=false;if(e.code==='ArrowRight')g.buttons.right=false;if(e.code==='ArrowUp'||e.code==='Space')g.buttons.jump=false};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);
  g.dispose=()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)};
 }
 function exit(){const cb=game?.onBack;cancel();cb?.()}
 function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
 function update(dt){
  let g=game;g.time+=dt;g.hurt=Math.max(0,g.hurt-dt);
  const right=Number(g.buttons.right),left=Number(g.buttons.left);
  g.vx=(right-left)*175;g.x=Math.max(20,Math.min(WORLD-20,g.x+g.vx*dt));
  if(g.buttons.jump&&g.grounded){g.vy=-345;g.grounded=false;g.buttons.jump=false}
  g.vy+=800*dt;g.y+=g.vy*dt;
  if(g.y>=GROUND-35){g.y=GROUND-35;g.vy=0;g.grounded=true}
  for(const x of stones){
   if(Math.abs(g.x-x)<30&&g.y>GROUND-67&&g.hurt===0){
    g.life--;g.hurt=1.5;g.vy=-210;
    if(g.life<=0){end(false);return}
   }
  }
  for(let i=0;i<gems.length;i++){
   if(!g.stars.has(i)&&Math.abs(g.x-gems[i])<24&&Math.abs(g.y-(GROUND-82-Math.sin(i)*11))<58){
    g.stars.add(i);g.particles.push({x:g.x,y:g.y-20,life:.5});
   }
  }
  for(const p of g.particles){p.life-=dt;p.y-=60*dt}
  g.particles=g.particles.filter(p=>p.life>0);
  g.camera=Math.min(WORLD-CW,Math.max(0,g.x-CW*.40));
  if(g.x>WORLD-75&&g.stars.size>=8)end(true);
  const bar=root.querySelector('#forest-status');if(bar)bar.textContent='💎 '+g.stars.size+'/8 | '+('❤️'.repeat(g.life)||'💔');
 }
 function draw(){
  const g=game;ctx.fillStyle='#8addf2';ctx.fillRect(0,0,CW,CH);
  // Pixellated parallax landscape.
  for(let i=0;i<10;i++){let x=i*102-(g.camera*.3)%102;
   rect(x,70+(i%3)*12,42,12,'#ffffff');rect(x+8,62+(i%3)*12,30,12,'#ffffff')}
  for(let i=0;i<16;i++){let x=i*115-(g.camera*.55)%115;
   rect(x+20,135,12,85,'#8bc9a9');rect(x-8,110,68,32,'#64b89d');rect(x,90,51,24,'#64b89d')}
  rect(0,GROUND,CW,CH-GROUND,'#75bb71');rect(0,GROUND+6,CW,5,'#a6d995');
  for(let i=0;i<20;i++){let x=i*88-g.camera%88;rect(x,GROUND+17,10,5,'#477d65');rect(x+25,GROUND+36,19,4,'#447b61')}
  for(const x of stones){const sx=x-g.camera;if(sx<-35||sx>CW+35)continue;
   rect(sx-18,GROUND-24,37,25,'#966a55');rect(sx-21,GROUND-20,38,18,'#b48656');rect(sx-10,GROUND-16,6,6,'#6d4f45');rect(sx+7,GROUND-11,5,4,'#6d4f45')}
  for(let i=0;i<gems.length;i++){if(g.stars.has(i))continue;const x=gems[i]-g.camera,y=GROUND-82-Math.sin(i)*11;
   if(x<-20||x>CW+20)continue;
   rect(x-4,y-14,8,6,'#fff5a1');rect(x-10,y-8,20,13,'#c7a5fc');rect(x-5,y+5,10,7,'#756ad2');rect(x-3,y-6,6,6,'#ffffff')}
  const castle=WORLD-55-g.camera;
  if(castle<CW+50){rect(castle-33,GROUND-110,67,112,'#ffc868');rect(castle-43,GROUND-120,25,30,'#ffdc80');rect(castle+21,GROUND-120,24,30,'#ffdc80');rect(castle-14,GROUND-43,29,43,'#75509a');rect(castle-8,GROUND-36,17,30,'#b9a3dc')}
  if(g.hurt===0||Math.floor(g.time*10)%2===0){
   const x=g.x-g.camera,y=g.y;
   // Original pixel explorer character.
   rect(x-11,y-19,22,20,'#8462de');rect(x-9,y-30,18,15,'#f3c390');
   rect(x-13,y-38,26,11,'#57477d');rect(x-14,y-6,12,7,'#42447d');rect(x+2,y-6,12,7,'#42447d');
   rect(x+2,y-25,3,3,'#403253');
  }
  for(const p of g.particles)rect(p.x-g.camera,p.y,14,14,'#ffd96c');
  ctx.fillStyle='#fff';ctx.font='bold 13px monospace';ctx.fillText('LEVEL 1  •  '+Math.min(100,Math.floor(g.x/WORLD*100))+'%',12,22);
 }
 function loop(t){
  if(!game||game.done)return;
  const dt=prev?Math.min(.038,(t-prev)/1000):.016;prev=t;
  update(dt);draw();
  if(game&&!game.done)raf=requestAnimationFrame(loop);
 }
 function end(win){
  const g=game;if(!g||g.done)return;
  g.done=true;g.win=win;if(raf)cancelAnimationFrame(raf);
  const box=root.querySelector('#forest-result');
  if(box){box.hidden=false;box.innerHTML='<div style="font-size:68px">'+(win?'🏆':'💫')+'</div>'+
   '<h2>'+(win?'LEVEL 1 UITGESPEELD!':'NOG EEN POGING?')+'</h2>'+
   '<p>'+(win?'Je hebt het magische kasteel bereikt met '+g.stars.size+' kristallen!':'Spring over de boomstammen en verzamel 8 kristallen.')+'</p>'+
   '<button id="forest-replay" class="btn primary">🔁 Opnieuw spelen</button> <button id="forest-finish" class="btn outline">🏠 Klaar</button>';
   root.querySelector('#forest-replay').onclick=()=>open({name:g.name,pet:Object.entries(pets).find(x=>x[1]===g.pet)?.[0],onBack:g.onBack,onComplete:g.onComplete,mode:g.mode});
   root.querySelector('#forest-finish').onclick=exit;
  }
  if(win)g.onComplete?.({score:g.stars.size});
 }
 window.RekenForest=Object.freeze({open});
})();