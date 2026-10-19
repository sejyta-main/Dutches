'use strict';
/* Fetch-the-ball game: play with your pet rather than repeatedly pressing a care button.
   No timers or penalties, no purchasable currency, and fully touch accessible. */
(function(){
const app=document.getElementById('app');
const glyphs={fox:'🦊',cat:'🐱',dog:'🐶',rabbit:'🐰'};
const reactions=['🐾 Goed gevangen!','💗 Wat leuk!','✨ Nog een keer!','🌈 Super gedaan!','🎾 Mijn bal!','⭐ Jij bent geweldig!'];
let state=null,timer=null;
function clean(){if(timer){clearTimeout(timer);timer=null}}
function escapeText(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function randomSpot(previous){
 let next=previous;
 while(next===previous)next=Math.floor(Math.random()*9);
 return next;
}
function open(config={}){
 clean();state={name:String(config.name||'Milo').slice(0,20),pet:glyphs[config.pet]||'🦊',onBack:config.onBack||(()=>location.reload()),onComplete:config.onComplete||(()=>{}),
  score:0,target:6,spot:Math.floor(Math.random()*9),busy:false,finished:false,comment:'🎾 Gooi mij de bal!',completed:false};
 draw();
}
function exit(){const callback=state?.onBack;clean();state=null;if(callback)callback()}
function play(index){
 if(!state||state.finished||state.busy||index!==state.spot)return;
 state.busy=true;state.score++;
 state.comment=reactions[(state.score-1)%reactions.length];
 const pet=app.querySelector('#fetch-pet'),ball=app.querySelector('[data-fetch="'+index+'"]'),line=app.querySelector('#fetch-message');
 if(ball){ball.textContent='✨';ball.classList.add('fetch-hit')}
 if(pet){pet.classList.add('fetch-jump');pet.textContent=state.pet+'💖'}
 if(line)line.textContent=state.comment;
 const counter=app.querySelector('#fetch-score');
 if(counter)counter.textContent='⭐ '+state.score+'/'+state.target;
 timer=setTimeout(()=>{
  if(!state)return;
  state.busy=false;
  if(state.score>=state.target){
   state.finished=true;
   if(!state.completed){state.completed=true;state.onComplete()}
  }else state.spot=randomSpot(state.spot);
  draw();
 },640);
}
function draw(){
 if(!state)return;
 const s=state,finish=s.finished,buttons=Array.from({length:9},(_,i)=>
 '<button type="button" class="fetch-spot '+(s.spot===i?'fetch-hot':'')+'" '+(s.spot===i&&!s.busy?'data-fetch="'+i+'"':'disabled')+
 ' aria-label="'+(s.spot===i?'Gooi de bal naar je dier':'Lege plek')+'">'+(s.spot===i?'🎾':'·')+'</button>').join('');
 app.innerHTML='<main class="shell"><header class="topbar"><button id="fetch-top" class="logo"><span class="logo-badge">🐾</span><span><strong>Rekenreis</strong><small>Een spelletje met '+escapeText(s.name)+'</small></span></button>'+
 '<span class="pill star" id="fetch-score">⭐ '+s.score+'/'+s.target+'</span></header>'+
 '<div class="pet-fetch-card"><div class="pet-fetch-header"><span class="eyebrow">🎾 PET-SPEL</span><h1>Gooi de bal!</h1>'+
 '<p>Je dier rent achter de bal aan. Tik op de bal om hem te gooien. Kun je zes keer samen spelen?</p></div>'+
 (finish?'<div class="fetch-finale"><div class="fetch-dancing">'+s.pet+'💖</div><h2>Wat een leuk spel!</h2>'+
 '<p>'+escapeText(s.name)+' is superblij! Jullie hebben zes keer samen de bal opgehaald.</p>'+
 '<div class="result-actions"><button id="fetch-again" class="btn primary">🎾 Nog een rondje</button><button id="fetch-done" class="btn violet">🏡 Terug naar huis</button></div></div>':
 '<div class="fetch-playfield"><div class="fetch-sky">☁️ ☀️ ☁️</div>'+
 '<div id="fetch-message" class="fetch-message" aria-live="polite">'+escapeText(s.comment)+'</div>'+
 '<div class="fetch-grid" role="group" aria-label="Balspel met negen plekken">'+buttons+'</div>'+
 '<div class="fetch-ground"><div class="fetch-pet" id="fetch-pet">'+s.pet+'</div><span>🌷 🌿 🌼 🌿 🌷</span></div></div>'+
 '<p class="center fetch-instructions">💛 Geen tijdslimiet. Veel plezier samen!</p>'+
 '<div class="result-actions"><button id="fetch-quit" class="btn outline">🏡 Naar het huisje</button></div>')+
 '</div></main>';
 const bind=(id,fn)=>{const e=app.querySelector('#'+id);if(e)e.addEventListener('click',fn)};
 bind('fetch-top',exit);bind('fetch-quit',exit);bind('fetch-done',exit);
 bind('fetch-again',()=>{const config={name:s.name,pet:Object.keys(glyphs).find(id=>glyphs[id]===s.pet),onBack:s.onBack,onComplete:s.onComplete};open(config)});
 app.querySelectorAll('[data-fetch]').forEach(el=>el.addEventListener('click',()=>play(Number(el.dataset.fetch))));
}
window.RekenPetPlay=Object.freeze({open});
})();