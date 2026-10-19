'use strict';
/* Perfect-world reward: a real one-level pixel platformer, not tap-a-star. */
(function(){
 const KEY='rekenreis-progress-v1',SEEN='rekenreis-last-pixel-reward-v1',MEDALS='rekenreis-earned-medals-v1';
 const root=document.getElementById('app');
 let overlay=null;
 function progress(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
 function mastery(sessions){return ['blocks','place','words','line','compare'].filter(id=>sessions.some(s=>s.mode==='practice'&&s.topic===id&&s.total===10&&s.correct===10))}
 function remove(){if(overlay){overlay.remove();overlay=null}}
 function panel(content){
  remove();overlay=document.createElement('section');overlay.className='pixel-reward-modal';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
  overlay.innerHTML='<div class="pixel-reward-card">'+content+'</div>';document.body.appendChild(overlay);
 }
 function check(){
  if(overlay||!root.querySelector('#home-summary'))return;
  const data=progress(),ss=Array.isArray(data.sessions)?data.sessions:[],last=ss[ss.length-1];
  if(!last||last.mode!=='practice'||last.total!==10||last.correct!==10)return;
  const key=[ss.length,last.date,last.topic,last.total,last.correct].join('|');
  if(localStorage.getItem(SEEN)===key)return;
  try{localStorage.setItem(SEEN,key)}catch(e){}
  const before=mastery(ss.slice(0,-1)).length,now=mastery(ss).length;
  const four=before<4&&now>=4;
  panel('<div class="pixel-reward-icon">🏅</div><h2>10 op 10! Fantastisch!</h2>'+
   '<p>Je hebt deze wereld perfect voltooid! Nu wacht een echt <strong>pixelavontuur</strong> met een bos, hindernissen en een kasteel.</p>'+
   '<button class="btn primary" id="pixel-reward-play">🎮 START PIXEL BOSAVONTUUR</button>'+
   '<button class="btn outline" id="pixel-reward-later">Later spelen</button>');
  overlay.querySelector('#pixel-reward-later').onclick=remove;
  overlay.querySelector('#pixel-reward-play').onclick=()=>{
   remove();
   if(!window.RekenForest){alert('Het pixelspel is nog niet geladen. Ververs Rekenreis.');return}
   window.RekenForest.open({mode:'math',onBack:()=>location.reload(),onComplete:()=>{
    try{localStorage.setItem(MEDALS,String((Number(localStorage.getItem(MEDALS))||0)+1))}catch(e){}
    const count=Number(localStorage.getItem(MEDALS))||1;
    panel('<div class="pixel-reward-icon">🏆</div><h2>LEVEL GEHAALD!</h2>'+
    '<p>Je hebt je gouden pixelmedaille verdiend! Totaal: <strong>'+count+'</strong>.</p>'+
    (four?'<div class="pixel-extra"><h3>🎉 GROOT GEHEIM ONTGRENDELD!</h3><p>Vier perfecte werelden. Het magische memorybos is nu beschikbaar!</p>'+
    '<button class="btn violet" id="pixel-reward-memory">🦄 Speel het memorybos</button></div>':'')+
    '<button class="btn outline" id="pixel-reward-finish">🏠 Naar de werelden</button>');
    overlay.querySelector('#pixel-reward-finish').onclick=()=>{remove();location.reload()};
    const special=overlay.querySelector('#pixel-reward-memory');
    if(special)special.onclick=()=>{
     remove();
     window.RekenBonus?.open({onBack:()=>location.reload(),onReward:()=>{}});
    };
   }});
  };
 }
 new MutationObserver(check).observe(root,{childList:true});
 check();
 window.RekenRewards=Object.freeze({check,mastered:mastery});
})();