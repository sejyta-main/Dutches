'use strict';
/* Add Pet World entry points without changing any existing maths exercises. */
(function(){
 const root=document.getElementById('app');
 function open(tab){if(window.RekenPet)window.RekenPet.open(tab)}
 function upgrade(){
  const top=root.querySelector('header.topbar');
  if(top&&!top.querySelector('#pet-shortcut')){
   const div=top.querySelector('.top-actions');
   if(div){const b=document.createElement('button');b.type='button';b.className='pill';b.id='pet-shortcut';b.innerText='🐾 Huisje';b.onclick=()=>open('home');div.appendChild(b)}
  }
  const worlds=root.querySelector('section.worlds');
  if(worlds&&!document.getElementById('pet-home-entry')){
   const s=window.RekenPetCore.snapshot(),chosen=window.RekenPetCore.pets.find(p=>p.id===s.pet.pet),next=s.chapters.find(c=>!c.unlocked);
   const div=document.createElement('section');div.className='pet-home-entry';div.id='pet-home-entry';
   div.innerHTML='<div class="pet-entry-mascot" aria-hidden="true">'+chosen.icon+'</div>'+
    '<div class="pet-entry-info"><span class="pet-entry-eyebrow">🐾 NIEUW: JOUW EIGEN DIERENWERELD</span>'+
    '<h2>Op bezoek bij '+s.pet.name.replace(/[<>]/g,'')+'!</h2>'+
    '<p>Verzorg je vriendje, kleed het aan en versier je huis met verdiende muntjes.</p>'+
    '<div class="pet-entry-stats"><span>🪙 '+s.coins+' muntjes</span><span>⭐ Niveau '+s.level+'</span><span>🗺️ '+s.chapters.filter(c=>c.unlocked).length+'/5 werelden</span></div></div>'+
    '<div class="pet-entry-buttons"><button class="btn primary" type="button" id="pet-open-home">🏡 Naar mijn huisje</button>'+
    '<button class="btn secondary" type="button" id="pet-open-map">🗺️ Avonturenkaart</button></div>';
   const hero=root.querySelector('.hero');
   if(hero)hero.insertAdjacentElement('afterend',div);else worlds.insertAdjacentElement('beforebegin',div);
   div.querySelector('#pet-open-home').onclick=()=>open('home');
   div.querySelector('#pet-open-map').onclick=()=>open('map');
  }
  if(worlds){
   let pending;
   try{pending=sessionStorage.getItem('rekenreis-next-world')}catch(e){}
   if(pending){
    const el=[...worlds.querySelectorAll('[data-world]')].find(b=>b.dataset.world===pending);
    if(el){try{sessionStorage.removeItem('rekenreis-next-world')}catch(e){}el.click()}
   }
  }
 }
 new MutationObserver(upgrade).observe(root,{childList:true});
 upgrade();
})();