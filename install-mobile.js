'use strict';
/* iPad Safari and Android Chrome installation assistance for Rekenreis PWA. */
(function(){
 const root=document.getElementById('app');
 let promptEvent=null;
 const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptEvent=e;update()});
 window.addEventListener('appinstalled',()=>{promptEvent=null;update()});
 function help(){
  const isAndroid=/Android/i.test(navigator.userAgent),isIOS=/iPad|iPhone|iPod/i.test(navigator.userAgent);
  return '<h2>📲 Installeer Rekenreis op iPad én Android</h2>'+
  '<p class="hint">Je krijgt het vosje als app-icoon op het beginscherm. Geen App Store of Play Store nodig.</p>'+
  (standalone()?'<div class="tip">✅ Rekenreis is al geïnstalleerd als app op dit toestel.</div>':'')+
  '<div class="install-guides">'+
  '<section class="install-guide '+(isAndroid?'install-device':'')+'"><h3>🤖 Android – Google Chrome</h3>'+
  '<ol class="install-steps"><li>Open <strong>Rekenreis</strong> in <strong>Chrome</strong>.</li>'+
  '<li>Tik op <strong>⋮</strong> rechtsboven, of kies de knop hieronder als die beschikbaar is.</li>'+
  '<li>Kies <strong>App installeren</strong> of <strong>Toevoegen aan startscherm</strong>.</li>'+
  '<li>Bevestig met <strong>Installeren</strong> of <strong>Toevoegen</strong>.</li></ol>'+
  '<button id="android-install" type="button" class="btn violet" '+(!promptEvent||standalone()?'disabled':'')+'>'+
  (standalone()?'✅ Al geïnstalleerd':promptEvent?'📲 Installeer de app':'📲 Via het Chrome-menu')+'</button>'+
  '<p class="privacy">De installatieknop verschijnt als Chrome dit aanbiedt. Zo niet, gebruik het menu ⋮.</p></section>'+
  '<section class="install-guide '+(isIOS?'install-device':'')+'"><h3>🍎 iPad – Safari</h3>'+
  '<ol class="install-steps"><li>Open <strong>Rekenreis</strong> in <strong>Safari</strong>.</li>'+
  '<li>Tik op <strong>Delen</strong> (het vierkant met een pijltje omhoog).</li>'+
  '<li>Kies <strong>Zet op beginscherm</strong> (of <strong>Add to Home Screen</strong>).</li>'+
  '<li>Tik op <strong>Voeg toe</strong>. Je vosje verschijnt op je beginscherm.</li></ol>'+
  '<p class="privacy">In Safari op iPad is de installatie via Delen; er verschijnt niet altijd een installatieknop.</p></section></div>'+
  '<p class="tip">💡 Open Rekenreis de eerste keer met internet. De oefen- en huisjesbestanden worden dan opgeslagen voor offline gebruik. De Vlaamse voorleesstem van het dictee kan afhankelijk blijven van de stemmen op je toestel.</p>'+
  '<div class="result-actions"><button class="btn outline" id="install-return" type="button">🏠 Naar het startscherm</button></div>';
 }
 function update(){
  const panels=root.querySelectorAll('.bottom-panels .panel');
  panels.forEach(panel=>{const heading=panel.querySelector('h3');if(heading&&heading.textContent==='📲 Ook op je iPad!')heading.textContent='📲 Ook op iPad & Android!';});
  const old=root.querySelector('#back-install');
  if(!old||root.querySelector('#install-android-guide'))return;
  const card=old.closest('.dashboard')?.querySelector('article.question-card');
  if(!card)return;
  card.innerHTML='<div id="install-android-guide">'+help()+'</div>';
  const btn=card.querySelector('#android-install');
  if(btn)btn.onclick=async()=>{
   if(!promptEvent)return;
   const p=promptEvent;promptEvent=null;try{await p.prompt();await p.userChoice}catch(e){}
   updateButtons();
  };
  card.querySelector('#install-return').onclick=()=>old.click();
 }
 function updateButtons(){
  const btn=root.querySelector('#android-install');
  if(btn){btn.disabled=!promptEvent||standalone();const label=standalone()?'✅ Al geïnstalleerd':promptEvent?'📲 Installeer de app':'📲 Via het Chrome-menu';if(btn.textContent!==label)btn.textContent=label}
 }
 const observer=new MutationObserver(()=>{update();updateButtons()});
 observer.observe(root,{childList:true});
 update();
})();
