'use strict';
/* Keep math results linked to spelling reports; entrance to each section is now the main hub. */
(function(){
 const root=document.getElementById('app');
 function update(){
  const report=root.querySelector('#back-dashboard');
  if(report&&!root.querySelector('#dict-results')){
   const card=report.closest('.dashboard')?.querySelector('.question-card');
   if(!card)return;
   const button=document.createElement('button');
   button.id='dict-results';button.type='button';button.className='btn outline';
   button.textContent='🎧 Dictee-resultaten';
   card.appendChild(button);
  }
 }
 root.addEventListener('click',e=>{
  if(e.target?.closest?.('#dict-results'))window.RekenDictee?.open({page:'report',onBack:()=>window.RekenMath?.open()});
 });
 new MutationObserver(update).observe(root,{childList:true});
 update();
})();
