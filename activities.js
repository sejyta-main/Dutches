'use strict';
(function(){
const root=document.getElementById('app');
function mastery(){try{const s=JSON.parse(localStorage.getItem('rekenreis-progress-v1')||'{}').sessions||[];return ['blocks','place','words','line','compare'].filter(id=>s.some(x=>x.mode==='practice'&&x.topic===id&&x.total===10&&x.correct===10))}catch(e){return []}}
function back(){location.reload()}
function openDictee(page){window.RekenDictee.open({onBack:back,page})}
function openMemory(){if(mastery().length>=4)window.RekenBonus.open({onBack:back,onReward:()=>{}})}
function update(){
 const worlds=root.querySelector('section.worlds');
 if(worlds&&!document.getElementById('extra-activities')){
  const n=mastery().length;
  const el=document.createElement('section');el.id='extra-activities';el.className='extra-activities';
  el.innerHTML='<div class="section-heading"><h2>🎧 Dictee & bonus</h2></div><div class="dict-home-tile"><div class="dict-home-symbol">🎙️</div><div><strong>Dictee-eiland · Woordpakket 1–8</strong><p>160 woorden, 8 schoolpakketten en een retrospel na elk pakket.</p></div><button class="btn violet" id="start-dictee">🎧 Start dictee</button></div>'+
  (n>=4?'<div class="dict-home-tile bonus-unlocked"><div class="dict-home-symbol">🦄</div><div><strong>Het magische memorybos</strong><p>Vier rekenwerelden met 10/10: het bonusspel is open!</p></div><button class="btn primary" id="start-memory">Speel memory!</button></div>':
  '<div class="dict-home-tile"><div class="dict-home-symbol">🔒</div><div><strong>Bonusspel</strong><p>Behaal 10 op 10 in vier verschillende werelden: '+n+'/4 behaald.</p></div></div>');
  worlds.insertAdjacentElement('afterend',el);
 }
 const dash=root.querySelector('#back-dashboard');
 if(dash&&!document.getElementById('dict-results')){
  const btn=document.createElement('button');btn.id='dict-results';btn.className='btn outline';btn.textContent='🎧 Dictee-resultaten';
  dash.closest('.dashboard').querySelector('.question-card').appendChild(btn);
 }
}
root.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.id==='start-dictee')openDictee();
 if(b.id==='start-memory')openMemory();
 if(b.id==='dict-results')openDictee('report');
});
new MutationObserver(update).observe(root,{childList:true});
update();
})();