'use strict';
/* iPad-safe scroll reset for navigation between Rekenreis main screens. */
(function(){
 function top(){
  try{window.scrollTo({top:0,left:0,behavior:'instant'})}catch(e){try{window.scrollTo(0,0)}catch(x){}}
  try{document.documentElement.scrollTop=0;document.body.scrollTop=0}catch(e){}
  // iOS Safari sometimes restores the previous scroll position after DOM replacement.
  if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>{
   try{window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0}catch(e){}
  });
 }
 window.RekenNavigation=Object.freeze({top});
})();
