'use strict';
/* Interactive cartoon pet: pet-specific SVG sprites and visual caregiving scenes. */
(function(){
 const root=document.getElementById('app');
 const pets={
 fox:{fur:'#f19a47',light:'#fff1dc',edge:'#c77037',ears:'point'},
 cat:{fur:'#d4a8f1',light:'#fff2ff',edge:'#9970bf',ears:'point'},
 dog:{fur:'#c99a6a',light:'#fff1df',edge:'#996c4b',ears:'flop'},
 rabbit:{fur:'#e2d9f3',light:'#fff',edge:'#a6a0c2',ears:'long'}
 };
 const escaped=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const animalNames={fox:'Vosje',cat:'Katje',dog:'Hondje',rabbit:'Konijntje'};
 function sprite(type='fox',mood='happy'){
  const p=pets[type]||pets.fox;
  const ears=p.ears==='long'
   ?'<ellipse cx="102" cy="45" rx="20" ry="53" fill="'+p.edge+'"/><ellipse cx="178" cy="45" rx="20" ry="53" fill="'+p.edge+'"/><ellipse cx="102" cy="44" rx="11" ry="43" fill="#ffc5d7"/><ellipse cx="178" cy="44" rx="11" ry="43" fill="#ffc5d7"/>'
   :p.ears==='flop'
   ?'<ellipse cx="77" cy="105" rx="29" ry="56" transform="rotate(23 77 105)" fill="'+p.edge+'"/><ellipse cx="203" cy="105" rx="29" ry="56" transform="rotate(-23 203 105)" fill="'+p.edge+'"/>'
   :'<path d="M67 112 L80 17 L121 75 M160 76 L205 17 L218 111Z" fill="'+p.edge+'"/><path d="M85 86 L90 42 L115 82 M166 83 L191 42 L198 85" fill="#ffd4c9"/>';
  const sleeping=mood==='sleep';
  return '<svg class="pet-svg pet-svg-'+type+' '+(sleeping?'pet-svg-asleep':'')+'" viewBox="0 0 280 300" aria-label="'+animalNames[type]+'" role="img" xmlns="http://www.w3.org/2000/svg">'+
   '<ellipse cx="140" cy="275" rx="84" ry="18" fill="#5c4e9470"/>'+
   '<path d="M76 232 Q55 180 97 151 Q140 127 183 151 Q224 181 204 232 Q196 268 141 267 Q91 263 76 232" fill="'+p.fur+'" stroke="'+p.edge+'" stroke-width="5"/>'+
   '<ellipse cx="142" cy="211" rx="45" ry="47" fill="'+p.light+'"/>'+
   '<path d="M198 220q64 9 26-44" fill="none" stroke="'+p.edge+'" stroke-width="15" stroke-linecap="round"/>'+
   ears+'<ellipse cx="140" cy="126" rx="86" ry="82" fill="'+p.fur+'" stroke="'+p.edge+'" stroke-width="6"/>'+
   '<path d="M67 159 Q84 135 102 162 Q140 195 176 162 Q196 135 214 158 Q210 207 139 211 Q69 201 67 159" fill="'+p.light+'"/>'+
   '<g class="pet-eyes">'+(sleeping?'<path d="M97 129q16 17 31 0M151 129q16 17 31 0" fill="none" stroke="#49385c" stroke-width="8" stroke-linecap="round"/>':
   '<ellipse cx="111" cy="131" rx="9" ry="15" fill="#423451"/><ellipse cx="169" cy="131" rx="9" ry="15" fill="#423451"/><circle cx="113" cy="125" r="3" fill="white"/><circle cx="171" cy="125" r="3" fill="white"/>')+'</g>'+
   '<ellipse cx="140" cy="166" rx="13" ry="9" fill="'+p.edge+'"/>'+
   '<path class="pet-smile" d="M140 174Q127 191 117 181M140 174Q153 191 163 181" stroke="#664e67" stroke-width="5" fill="none" stroke-linecap="round"/>'+
   '<ellipse cx="85" cy="163" rx="15" ry="8" fill="#f58f8f" opacity=".65"/><ellipse cx="195" cy="163" rx="15" ry="8" fill="#f58f8f" opacity=".65"/>'+
   '<path d="M99 242Q90 260 79 253M181 242Q192 260 204 253" fill="none" stroke="'+p.edge+'" stroke-width="11" stroke-linecap="round"/>'+
   '<g class="pet-bath-dirt"><ellipse cx="80" cy="105" rx="12" ry="7" fill="#997654" opacity=".7"/><ellipse cx="170" cy="211" rx="14" ry="8" fill="#997654" opacity=".75"/><ellipse cx="208" cy="148" rx="11" ry="9" fill="#997654" opacity=".6"/></g>'+
   '</svg>';
 }
 let current=null,completed=false;
 function open(action,config){
  if(!['food','wash','dance','rest'].includes(action))return;
  current={action,pet:config.pet||'fox',name:config.name||'Milo',onBack:config.onBack,onComplete:config.onComplete,progress:0,done:false,timer:null,food:'🍎',stage:action==='wash'?'scrub':'start'};
  completed=false;render();
 }
 function finish(){
  if(current?.done)return;
  current.done=true;
  if(!completed){completed=true;current.onComplete?.()}
  render();
 }
 function back(){
  const callback=current?.onBack;
  if(current?.timer)clearTimeout(current.timer);
  current=null;
  if(callback)callback();
 }
 const info={
  food:{title:'🥕 Etenstijd!',help:'Kies iets lekkers en geef drie hapjes aan je vriendje.',emoji:'🥕'},
  wash:{title:'🛁 Tijd voor een bad!',help:'Maak je vriendje proper: was de vlekjes en spoel het schuim weg.',emoji:'🫧'},
  dance:{title:'💃 Dansfeest!',help:'Volg de gekleurde pijltjes in de juiste volgorde.',emoji:'🎶'},
  rest:{title:'🌙 Slaap lekker!',help:'Doe het licht uit. Laat je diertje rustig dromen.',emoji:'💤'}
 };
 function controls(){
  const a=current.action,n=current.progress;
  if(a==='food')return '<div class="studio-food">'+['🍎','🥕','🍓'].map(x=>'<button data-food="'+x+'" class="studio-item '+(current.food===x?'active':'')+'">'+x+'</button>').join('')+
    '</div><button class="btn primary" id="studio-feed">🫴 Geef '+current.food+' aan '+escaped(current.name)+'</button><p class="studio-steps">Hapjes: '+n+' / 3</p>';
  if(a==='wash')return '<button class="btn primary" id="studio-scrub">'+(current.stage==='scrub'?'🧽 Wrijf zachtjes met de spons ('+n+'/5)':'🚿 Spoel het schuim weg')+'</button>'+
   '<p class="studio-steps">'+(current.stage==='scrub'?'Maak de vijf vlekjes schoon!':'Nu is je vriendje helemaal ingezeept!')+'</p>';
  if(a==='dance'){
    const seq=['⬅️','⬆️','➡️','⬇️','⬅️','➡️'];
    return '<p class="studio-steps">Dansstap '+n+' / 6</p><div class="studio-dance-cue">Volg: <strong>'+seq[n]+'</strong></div>'+
    '<div class="studio-arrows">'+['⬅️','⬆️','⬇️','➡️'].map(x=>'<button class="studio-arrow" data-step="'+x+'" aria-label="Dans '+x+'">'+x+'</button>').join('')+'</div>';
  }
  return '<button class="btn primary" id="studio-sleep">'+(n===0?'🌙 Doe het licht uit':'💤 Laat je vriendje uitrusten')+'</button>'+
   '<p class="studio-steps">'+(n===0?'Klik op de lamp om rustig te gaan slapen.':'Kijk hoe je vriendje droomt...')+'</p>';
 }
 function render(){
  if(!current)return;
  const s=current,a=s.action,night=a==='rest'&&s.progress>0,bathe=a==='wash'&&s.progress<5;
  root.innerHTML='<main class="shell studio-shell"><header class="topbar"><button class="logo" id="studio-back"><span class="logo-badge">🐾</span><strong>'+escaped(s.name)+'s huisje</strong></button><span class="pill star">'+info[a].emoji+' Interactief</span></header>'+
  '<section class="studio-card"><h1>'+info[a].title+'</h1><p>'+info[a].help+'</p>'+
  '<div class="studio-stage studio-'+a+' '+(night?'studio-night ':'')+(bathe?'studio-dirty ':'')+(s.done?'studio-done':'')+'">'+
  '<div class="studio-scene-top">'+(night?'🌟 🌙 ⭐':'☀️ ☁️ ☁️')+'</div><div class="studio-sprite '+(s.stage==='washdone'?'studio-bubbles':'')+'">'+sprite(s.pet,night?'sleep':'happy')+'</div>'+
  '<div class="studio-effects">'+(a==='food'?'🍏':a==='wash'?'🫧 🧼 🫧':a==='dance'?'🎵 🎼 🎵':'💤 Zzz')+'</div>'+
  '<div class="studio-floor"></div></div>'+
  (s.done?'<div class="studio-win"><h2>🎉 Goed gedaan!</h2><p>'+escaped(s.name)+' is '+({food:'lekker verzadigd',wash:'heerlijk proper',dance:'heel blij',rest:'helemaal uitgerust'}[a])+'!</p>'+
  '<button class="btn primary" id="studio-finish">🏠 Terug naar het huisje</button></div>':'<div class="studio-controls">'+controls()+'</div>')+
  '<button class="btn outline" id="studio-quit">← Terug</button></section></main>';
  const bind=(id,cb)=>{const b=root.querySelector('#'+id);if(b)b.addEventListener('click',cb)};
  bind('studio-back',back);bind('studio-quit',back);bind('studio-finish',back);
  root.querySelectorAll('[data-food]').forEach(b=>b.onclick=()=>{s.food=b.dataset.food;render()});
  bind('studio-feed',()=>{s.progress++;if(s.progress>=3)finish();else render()});
  bind('studio-scrub',()=>{if(s.stage==='scrub'){s.progress++;if(s.progress>=5)s.stage='rinse';render()}else{s.stage='washdone';finish()}});
  root.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{
   const seq=['⬅️','⬆️','➡️','⬇️','⬅️','➡️'];
   if(b.dataset.step===seq[s.progress]){s.progress++;if(s.progress===6)finish();else render()}
   else{const cue=root.querySelector('.studio-dance-cue');if(cue)cue.textContent='🎵 Bijna! Probeer de pijl hierboven.'}
  });
  bind('studio-sleep',()=>{
   s.progress++;
   if(s.progress===1){render();s.timer=setTimeout(()=>{if(current===s)finish()},2100)}
   else finish();
  });
 }
 window.RekenPetStudio=Object.freeze({sprite,open});
})();