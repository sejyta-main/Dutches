'use strict';
/* Math world link requested from pet adventure map; do not inject duplicate hub panels. */
(function(){
 const root=document.getElementById('app');
 function upgrade(){
  const top=root.querySelector('header.topbar');
  if(top&&!top.querySelector('#pet-shortcut')){
   const div=top.querySelector('.top-actions');
   if(div){
    const b=document.createElement('button');b.type='button';b.className='pill';b.id='pet-shortcut';
    b.textContent='🐾 Huisje';
    b.onclick=()=>{window.RekenPet?.open('home');window.RekenNavigation?.top()};
    div.appendChild(b);
   }
  }
  const worlds=root.querySelector('section.worlds');
  if(!worlds)return;
  let pending;
  try{pending=sessionStorage.getItem('rekenreis-next-world')}catch(e){}
  if(pending){
   const el=[...worlds.querySelectorAll('[data-world]')].find(b=>b.dataset.world===pending&&!b.disabled);
   if(el){try{sessionStorage.removeItem('rekenreis-next-world')}catch(e){}el.click()}
  }
 }
 new MutationObserver(upgrade).observe(root,{childList:true});
 upgrade();
})();
