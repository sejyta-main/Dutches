'use strict';
/* Stable, backward-compatible record of completed maths worlds.
   A world is finished only after one perfect 10/10 PRACTICE round. */
(function(){
 const IDS=Object.freeze(['blocks','place','words','line','compare']);
 function mastered(data){
  const d=data&&typeof data==='object'?data:{};
  const permanent=Array.isArray(d.masteredWorlds)?d.masteredWorlds:[];
  const sessions=Array.isArray(d.sessions)?d.sessions:[];
  return IDS.filter(id=>permanent.includes(id)||sessions.some(s=>
   s.mode==='practice'&&s.topic===id&&s.total===10&&s.correct===10
  ));
 }
 function isCompleted(data,id){return mastered(data).includes(id)}
 function remaining(data){const complete=mastered(data);return IDS.filter(id=>!complete.includes(id))}
 function remember(data){
  const all=mastered(data);
  if(data&&typeof data==='object')data.masteredWorlds=all;
  return all;
 }
 window.RekenWorldProgress=Object.freeze({ids:IDS,mastered,isCompleted,remaining,remember});
})();
