'use strict';
/* Dutch-first bilingual instructions throughout Rekenreis. Explicit EN translations
   are intentionally separate from school Dutch; never machine translate question data. */
(function(){
 const escape=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 function pair(nl,en){
  return '<span class="reken-taal"><span class="reken-taal-nl" lang="nl-BE" translate="no">'+escape(nl)+'</span>'+
   (en?'<span class="reken-taal-en" lang="en" translate="no">'+escape(en)+'</span>':'')+'</span>';
 }
 function note(nl,en){return '<p class="reken-help-pair">'+pair(nl,en)+'</p>'}
 function math(q){
  let title='Solve the question.',subtitle='Read the question carefully.';
  const n=q.n,topic=q.topic;
  if(topic==='blocks'){title='How many blocks are there altogether?';subtitle='Count the blue, green and yellow blocks.'}
  else if(topic==='place'){
   const place=q.pos==='H'?'hundreds':q.pos==='T'?'tens':'ones';
   if(q.visual==='expanded'){title='Which number does this make?';subtitle='H means hundreds, T tens and E ones.'}
   else if(q.kind==='number'&&q.title?.startsWith('Wat is de waarde')){title='What is the value of the indicated digit?';subtitle='Look at the number '+n+'. H = hundreds, T = tens, E = ones.'}
   else{title='How many hundreds, tens or ones are there?';subtitle='Look at the number '+n+'.'}
  }
  else if(topic==='words'){
   if(q.kind==='choices'){title='How do you write this number in Dutch?';subtitle='Choose the correctly spelled number word.'}
   else{title='Which number do you read?';subtitle='Listen in your head to the Dutch number word, then write the digits.'}
  }
  else if(topic==='line'){
   if(q.visual==='line'){title='Which number is missing on the number line?';subtitle='Count in steps of '+(q.arr?.length>1?Math.abs(q.arr[1]-q.arr[0]):'the given size')+'.'}
   else if(q.kind==='sort'){title=q.title?.includes('klein naar groot')?'Put the numbers from smallest to largest.':'Put the numbers from largest to smallest.';subtitle='Tap the numbers in the correct order.'}
   else if(q.title?.includes('vóór')){title='Which number comes immediately before '+n+'?';subtitle='Think about the order of the numbers.'}
   else if(q.title?.includes('na ')){title='Which number comes immediately after '+n+'?';subtitle='Think about the order of the numbers.'}
   else{title='Which number is between the two numbers?';subtitle='Think about the order of the numbers.'}
  }
  else if(topic==='compare'){
   if(q.kind==='choices'&&Array.isArray(q.choices)&&q.choices.includes('Waar')){title='Is this comparison true?';subtitle='Decide whether the statement is true or false.'}
   else{title='Which comparison sign belongs between the numbers?';subtitle='Choose <, = or >.'}
  }
  return {title,subtitle};
 }
 window.RekenTaal=Object.freeze({pair,note,math});
})();
