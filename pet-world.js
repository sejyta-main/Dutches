'use strict';
(function(){
 const bi=(nl,en)=>window.RekenTaal?window.RekenTaal.pair(nl,en):nl;
const root=document.getElementById('app'),core=window.RekenPetCore;
let tab='home',filter='alles',notice='',animalMenu=false,reaction='🐾 Aai mij of speel met mij!';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const symbol=id=>core.catalog.find(x=>x.id===id)?.icon||'';
function btn(id,title,variant='violet'){return '<button class="btn '+variant+'" type="button" id="'+id+'">'+title+'</button>'}
function goBack(){window.location.reload()}
function open(which='home'){tab=which;notice='';animalMenu=false;reaction='🐾 Aai mij of speel met mij!';render()}
function scene(s){
 const p=s.pet,face=window.RekenPetStudio?window.RekenPetStudio.sprite(p.pet):core.pets.find(x=>x.id===p.pet)?.icon||'🦊';
 let furn=p.placed.map(id=>'<span class="pet-furniture" aria-label="'+esc(core.catalog.find(i=>i.id===id)?.name||'')+'">'+symbol(id)+'</span>').join('');
 return '<div class="pet-scene pet-room-'+(p.equip.room||'default')+'">'+
 '<div class="pet-room-ceiling">✦ ✧ ⭐ ✦</div><div class="pet-house-window"><span>☀️</span></div>'+
 '<div class="pet-home-label">🏡 Het gezellige huis van '+esc(p.name)+'</div>'+
 '<div class="pet-talk" id="pet-talk" aria-live="polite">'+esc(reaction)+'</div>'+
 '<button type="button" id="pet-pat" class="pet-character pet-interactive" aria-label="Aai '+esc(p.name)+' en kijk hoe je huisdier reageert">'+
 '<span class="pet-hat" aria-hidden="true">'+(p.equip.hat?symbol(p.equip.hat):'')+'</span>'+
 '<span class="pet-face" aria-hidden="true">'+face+'</span>'+
 '<span class="pet-clothes" aria-hidden="true">'+(p.equip.clothes?symbol(p.equip.clothes):'')+'</span>'+
 '</button><div class="pet-furnishing">'+furn+'</div><div class="pet-floor"></div></div>';
}
function stat(title,value,icon,color){
 return '<div class="pet-stat"><div class="pet-stat-head"><span>'+icon+' '+title+'</span><b>'+value+'%</b></div><div class="pet-stat-track"><div style="width:'+value+'%;background:'+color+'"></div></div></div>';
}
function home(s){
 const p=s.pet;
 return '<div class="pet-layout"><div class="pet-big-card">'+scene(s)+
 '<div class="pet-stats">'+stat('Blij',p.mood,'💗','#f47ca0')+stat('Energie',p.energy,'⚡','#f1c350')+stat('Proper',p.clean,'🫧','#5bcadf')+'</div>'+
 '<div class="pet-actions">'+btn('pet-feed','🥕 Eten geven','outline')+btn('pet-play','🎮 Op avontuur!','green')+btn('pet-wash','🛁 Wassen','outline')+btn('pet-rest','💤 Slapen','outline')+btn('pet-dance','💃 Samen dansen!','outline')+'</div>'+
 '<p class="pet-care-note">'+bi('👆 Aai je vriendje of ga samen op avontuur. Eten, wassen, dansen en slapen zie je écht gebeuren!','Pet your friend or go on an adventure together. Watch your pet eat, bathe, dance and sleep!')+'</p></div>'+
 '<div class="pet-side"><div class="pet-card"><div class="pet-card-head"><span>🐾 Mijn vriendje</span><span>💖</span></div>'+
 '<label class="pet-label" for="pet-name">Hoe heet je vriendje?</label><div class="pet-rename-row"><input id="pet-name" maxlength="16" value="'+esc(p.name)+'" placeholder="Naam van je dier">'+btn('pet-rename','Bewaar','outline')+'</div>'+
 '<p class="pet-note">'+bi('Kies je lievelingsdier. Je kunt altijd veranderen.','Choose your favorite animal. You can change it anytime.')+'</p><div class="pet-animals">'+core.pets.map(x=>'<button class="pet-animal '+(p.pet===x.id?'chosen':'')+'" data-animal="'+x.id+'" aria-label="'+x.name+'" aria-pressed="'+(p.pet===x.id)+'">'+x.icon+'<small>'+x.name+'</small></button>').join('')+'</div></div>'+
 '<div class="pet-card"><h3>🪙 Muntjes verdienen</h3><p>Elke juiste rekenvraag geeft <b>5 muntjes</b>. Een juist dicteewoord geeft <b>7 muntjes</b>.</p>'+
 '<div class="pet-promo"><span>🛍️</span><div>In het winkeltje kun je kleding, meubels en kamers kopen!</div></div>'+btn('pet-shop-now','🛍️ Naar het winkeltje','violet')+'</div>'+
 '<div class="pet-card"><h3>🎒 Mijn avonturen</h3><p>Hoe meer je oefent, hoe hoger je niveau en hoe meer werelden open gaan.</p>'+btn('pet-map-now','🗺️ Open de avonturenkaart','outline')+'</div></div></div>';
}
const categories=[['alles','🌈 Alles'],['hat','🎩 Hoeden'],['clothes','👚 Kleding'],['furniture','🛋️ Meubels'],['room','🏡 Kamers'],['toy','🧸 Speelgoed']];
function shop(s){
 const owned=s.pet.owned,items=core.catalog.filter(i=>filter==='alles'||i.category===filter);
 return '<div class="pet-card"><h2>🛍️ Het vrolijke winkeltje</h2>'+
 '<p>Verdien muntjes door te leren. Je koopt hier alleen met <strong>speelmuntjes</strong>, nooit met echt geld.</p>'+
 '<div class="pet-filters">'+categories.map(([id,label])=>'<button class="pet-filter '+(filter===id?'active':'')+'" data-filter="'+id+'">'+label+'</button>').join('')+'</div>'+
 '<div class="pet-shop-grid">'+items.map(item=>{
 const bought=owned.includes(item.id),locked=s.level<item.level;
 const furnished=s.pet.placed.includes(item.id),equipped=s.pet.equip[item.category]===item.id;
 const selected=furnished||equipped,action=locked?'🔒 Niveau '+item.level:bought?(selected?'✓ Gebruikt':'Gebruik'):s.coins<item.price?'🪙 Te weinig muntjes':'🪙 Koop voor '+item.price;
 return '<div class="pet-shop-item '+(locked?'pet-locked':'')+'"><div class="pet-item-emoji">'+item.icon+'</div>'+
 '<strong>'+esc(item.name)+'</strong><span class="pet-item-level">'+(item.level===1?'Vanaf niveau 1':'Vanaf niveau '+item.level)+'</span>'+
 '<button class="btn small '+(bought?'outline':'violet')+'" data-buy="'+item.id+'" '+(locked?'disabled':'')+'>'+action+'</button></div>';
 }).join('')+'</div></div>';
}
function closet(s){
 const owned=core.catalog.filter(i=>s.pet.owned.includes(i.id));
 return '<div class="pet-layout"><div class="pet-big-card">'+scene(s)+'</div><div class="pet-card"><h2>👗 Mijn kleerkast</h2>'+
 '<p>'+bi('Tik op een voorwerp om het aan te doen, in de kamer te zetten of weer weg te halen.','Tap an item to wear it, place it in the room or remove it.')+'</p>'+
 (owned.length?'<div class="pet-inventory">'+owned.map(i=>{
 const using=i.category==='furniture'?s.pet.placed.includes(i.id):s.pet.equip[i.category]===i.id;
 return '<button class="pet-owned '+(using?'wearing':'')+'" data-wear="'+i.id+'"><span>'+i.icon+'</span><strong>'+esc(i.name)+'</strong><small>'+(using?'✓ In gebruik':'Gebruik')+'</small></button>';
 }).join('')+'</div>':'<div class="pet-empty">Je kleerkast is nog leeg. Koop iets leuks in het winkeltje!</div>')+
 '<div class="result-actions">'+btn('pet-closet-shop','🛍️ Ga naar de winkel','violet')+'</div></div></div>';
}
function map(s){
 const n=s.chapters.filter(c=>c.unlocked).length;
 return '<section class="pet-map"><h2>🗺️ De magische avonturenkaart</h2>'+
 '<p>Ontgrendel nieuwe werelden met XP. <b>Een wereld met 10/10 is voltooid en blijft dicht</b>, zodat je andere werelden kunt ontdekken. Je kunt altijd de gemengde toets oefenen.</p>'+
 '<div class="pet-world-count">✨ '+n+' van 5 avonturenwerelden geopend</div>'+
 '<div class="pet-map-path">'+s.chapters.map((c,i)=>{
  const next=s.chapters[i+1],locked=!c.unlocked,finished=!!c.mastered;
  const label=c.mastered?'🏅 Perfect uitgespeeld':locked?'🔒 Nog '+(c.xp-s.xp)+' XP':'🌟 Klaar om te spelen';
  return '<div class="pet-map-stage '+(locked?'locked':'unlocked')+'"><span class="pet-map-stop">'+c.icon+'</span>'+
   '<div class="pet-map-details"><span class="pet-map-chapter">WERELD '+c.index+'</span><h3>'+c.name+'</h3><p>'+c.desc+'</p><span class="pet-map-tag">'+label+'</span></div>'+
   '<button class="btn small '+(locked?'outline':'green')+'" data-quest="'+c.id+'" '+(locked?'disabled':'')+'>'+(locked?'🔒 Later':'▶ Speel wereld')+'</button></div>'+
  (next?'<div class="pet-map-connector">✧ ⋮ ✧</div>':'');
 }).join('')+'</div>'+
 '<div class="pet-endgame"><strong>🏆 Geheim eindavontuur</strong><p>Vier verschillende werelden met 10 op 10? Dan wacht het speciale memorybos.</p>'+
 (s.bonusUnlocked?btn('pet-memory','🦄 Speel memory','primary'):'<span>🔒 '+s.mastered.length+' / 4 perfecte werelden</span>')+'</div></section>';
}
function render(){
 const s=core.snapshot(),pct=s.percent,pet=s.pet,level=s.level;
 let view=tab==='home'?home(s):tab==='shop'?shop(s):tab==='closet'?closet(s):map(s);
 root.innerHTML='<main class="shell pet-app"><div class="pet-topbar"><button id="pet-back" class="back">← Rekenreis</button>'+
 '<div class="pet-heading">🐾 '+esc(pet.name)+'s Droomwereld</div><div class="pet-money">🪙 '+s.coins+'</div></div>'+
 '<section class="pet-level"><div class="pet-level-badge">⭐ Niveau '+level+'</div><div class="pet-level-track"><div style="width:'+pct+'%"></div></div><span>'+s.xp+' XP</span><small>'+Math.max(0,s.next-s.xp)+' XP tot niveau '+(level+1)+'</small></section>'+
 '<nav class="pet-nav" aria-label="Droomwereld"><button data-tab="home" class="'+(tab==='home'?'selected':'')+'">🐾 Huisje</button><button data-tab="shop" class="'+(tab==='shop'?'selected':'')+'">🛍️ Winkel</button><button data-tab="closet" class="'+(tab==='closet'?'selected':'')+'">👗 Kleerkast</button><button data-tab="map" class="'+(tab==='map'?'selected':'')+'">🗺️ Kaart</button></nav>'+
 (notice?'<div class="pet-toast" role="status">'+esc(notice)+'</div>':'')+view+
 '<p class="pet-privacy">🔒 Jouw muntjes, huisje en ontdekte werelden worden alleen op dit apparaat bewaard. Er zijn geen echte aankopen, advertenties of dagelijkse straffen.</p></main>';
 bind();
}
function bind(){
 const by=id=>root.querySelector('#'+id);
 by('pet-back').onclick=goBack;
 root.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;notice='';render()});
 const actions={feed:'food',wash:'wash',rest:'rest',dance:'dance'};
 Object.entries(actions).forEach(([buttonId,action])=>{
   const b=by('pet-'+buttonId);if(!b)return;
   b.onclick=()=>{
     if(!window.RekenPetStudio){notice='Ververs de pagina om de nieuwe dierenwereld te openen.';render();return}
     const p=core.snapshot().pet;
     window.RekenPetStudio.open(action,{pet:p.pet,name:p.name,
      onBack:()=>{reaction='💗 Wat fijn om samen te zijn!';render()},
      onComplete:()=>{
       core.care(action==='dance'?'play':action);
       reaction={food:'🥕 Mmm, lekker gegeten!',wash:'🫧 Nu ben ik proper!',rest:'💤 Heerlijk uitgerust!',dance:'💃 Wat een leuk dansfeest!'}[action];
      }
     });
   };
 });
 const playButton=by('pet-play');
 if(playButton)playButton.onclick=()=>{
   if(!window.RekenForest){notice='Het bosavontuur is nog niet geladen. Probeer opnieuw.';render();return}
   const pet=core.snapshot().pet;
   window.RekenForest.open({name:pet.name,pet:pet.pet,mode:'pet',
    onBack:()=>{reaction='💗 Wat was dat een avontuur!';render()},
    onComplete:()=>{core.care('play');reaction='🎮 Geweldig avontuur!'}
   });
 };
 const pat=by('pet-pat');
 if(pat)pat.onclick=()=>{
  const quotes=['💗 Dat kriebelt!','🐾 Nog een aai!','✨ Joepie!','🥰 Dat is lief!','🌈 Ik ben blij!'];
  reaction=quotes[Math.floor(Math.random()*quotes.length)];
  const text=by('pet-talk');if(text)text.textContent=reaction;
  pat.classList.remove('pet-petted');void pat.offsetWidth;pat.classList.add('pet-petted');
  const heart=document.createElement('span');heart.className='pet-floating-heart';heart.textContent='💗';pat.appendChild(heart);
  setTimeout(()=>{heart.remove();pat.classList.remove('pet-petted')},1200);
 };
 const rename=by('pet-rename');
 if(rename)rename.onclick=()=>{const r=core.rename(by('pet-name').value);notice=r.ok?'🌈 Mooie naam!':'Vul eerst een naam in.';render()};
 root.querySelectorAll('[data-animal]').forEach(b=>b.onclick=()=>{core.choosePet(b.dataset.animal);notice='💞 Wat een lief vriendje!';render()});
 root.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;render()});
 root.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{
  const id=b.dataset.buy,item=core.catalog.find(x=>x.id===id);
  const s=core.snapshot(),result=s.pet.owned.includes(id)?core.equip(id):core.buy(id);
  notice=result.ok?'🎉 '+item.name+'! '+(s.pet.owned.includes(id)?'Mooi gekozen!':'Nu van jou!'):result.reason;render();
 });
 root.querySelectorAll('[data-wear]').forEach(b=>b.onclick=()=>{const item=core.catalog.find(x=>x.id===b.dataset.wear);core.equip(item.id);notice='✨ '+item.name+'!';render()});
 [['pet-shop-now','shop'],['pet-map-now','map'],['pet-closet-shop','shop']].forEach(([id,to])=>{const b=by(id);if(b)b.onclick=()=>{tab=to;notice='';render()}});
 root.querySelectorAll('[data-quest]').forEach(b=>b.onclick=()=>{
  const c=core.snapshot().chapters.find(x=>x.id===b.dataset.quest);
  if(!c?.unlocked||c.mastered)return;
  try{sessionStorage.setItem('rekenreis-next-world',c.id)}catch(e){}
  goBack();
 });
 const memory=by('pet-memory');if(memory)memory.onclick=()=>{window.RekenBonus.open({onBack:()=>render(),onReward:()=>{}})};
}
window.RekenPet=Object.freeze({open});
})();