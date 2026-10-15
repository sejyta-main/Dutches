'use strict';
document.addEventListener('DOMContentLoaded',()=>{
 const root=document.getElementById('app');
 const observer=new MutationObserver(()=>{
   const worlds=root.querySelector('.worlds');
   if(!worlds||document.getElementById('dictee-entry'))return;
   const btn=document.createElement('button');
   btn.id='dictee-entry';btn.className='btn violet';
   btn.textContent='🎧 Dictee · Woordpakket 7';
   btn.onclick=()=>window.RekenDictee.open({onBack:()=>location.reload()});
   worlds.insertAdjacentElement('afterend',btn);
 });
 observer.observe(root,{childList:true});
});