'use strict';
/* Display instructional content in fixed order: Belgian Dutch first, English help second.
   Never rely on a browser or device language to decide which teaching language is primary. */
(function(){
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function pair(nl,en,compact=false){
  return '<div class="lesson-bilingual'+(compact?' lesson-bilingual-compact':'')+'">'+
   '<span class="lesson-nl" lang="nl-BE" translate="no"><span class="lesson-lang">🇧🇪 Nederlands</span>'+esc(nl)+'</span>'+
   '<span class="lesson-en" lang="en" translate="no"><span class="lesson-lang">🇬🇧 English</span>'+esc(en)+'</span></div>';
 }
 function mathQuestion(q){
  const title=q.title,topic=q.topic,visual=q.visual;
  let en='',help='';
  if(topic==='blocks'){en='How many is this altogether?';help='Count the blue, green and yellow blocks.'}
  else if(topic==='place'){
   const pos=title.match(/\b([HTE])\?/),label=pos?.[1]||'';
   if(visual==='expanded'){en='Which number do these place values make?';help=q.subtitle.replace(/\bH\b/g,'hundreds').replace(/\bT\b/g,'tens').replace(/\bE\b/g,'ones')}
   else if(title.startsWith('Wat is de waarde')){en='What is the value of '+(label||'the highlighted digit')+'?';help='Look at the number '+q.n+'. H = hundreds, T = tens, E = ones.'}
   else{en='How many '+(label==='H'?'hundreds':label==='T'?'tens':'ones')+' are there?';help='Look at the number '+q.n+'.'}
  }else if(topic==='words'){
   en=visual==='word'?'Which number can you read?':'How do you write this number in Dutch?';
   help=visual==='word'?'Read the Dutch number word.':q.subtitle;
  }else if(topic==='line'){
   if(visual==='line'){en='Which number is missing on the number line?';help='Count forward in steps of '+q.subtitle.replace(/\D+/g,'')+'.'}
   else if(visual==='sort'){en=title.includes('klein naar groot')?'Put the numbers from smallest to largest.':'Put the numbers from largest to smallest.';help='Tap the numbers in the correct order.'}
   else{en=title.includes('juist vóór')?'Which number comes just before '+q.n+'?':title.includes('juist na')?'Which number comes just after '+q.n+'?':'Which number goes between '+(q.n-1)+' and '+(q.n+1)+'?';help='Think about the order of the numbers.'}
  }else if(topic==='compare'){
   en=title.includes('Welk teken')?'Which comparison symbol belongs between the numbers?':'Is this comparison true or false?';
   help='Look at both numbers. Think about greater than, less than and equal to.';
  }
  return {title:en||'Solve this question.',subtitle:help||'Think carefully, then choose your answer.'};
 }
 window.RekenLanguage=Object.freeze({pair,mathQuestion});
})();
