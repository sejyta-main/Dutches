'use strict';
/* Offline, deterministic letter-by-letter coaching for children. No AI account needed. */
(function(){
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function normalize(s){return String(s||'').normalize('NFC').trim().toLocaleLowerCase('nl-BE').replace(/\s+/g,' ')}
 function answerPart(word,input){
  const phrase=normalize(word.phrase||word.word),written=normalize(input);
  const prefix=(word.cue||'').toLocaleLowerCase('nl-BE');
  return {typed:prefix&&written.startsWith(prefix+' ')?written.slice(prefix.length+1):written,correct:word.word.toLocaleLowerCase('nl-BE')};
 }
 function diff(expected,actual){
  let a=Array.from(expected),b=Array.from(actual),m=a.length,n=b.length;
  let dist=Array.from({length:m+1},()=>Array(n+1).fill(0));
  for(let i=1;i<=m;i++)dist[i][0]=i;
  for(let j=1;j<=n;j++)dist[0][j]=j;
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)
   dist[i][j]=Math.min(dist[i-1][j]+1,dist[i][j-1]+1,dist[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  let i=m,j=n,ops=[];
  while(i||j){
   if(i&&j&&a[i-1]===b[j-1]&&dist[i][j]===dist[i-1][j-1]){ops.push({type:'equal',expected:a[i-1],actual:b[j-1]});i--;j--}
   else if(i&&j&&dist[i][j]===dist[i-1][j-1]+1){ops.push({type:'change',expected:a[i-1],actual:b[j-1]});i--;j--}
   else if(i&&dist[i][j]===dist[i-1][j]+1){ops.push({type:'missing',expected:a[i-1],actual:''});i--}
   else {ops.push({type:'extra',expected:'',actual:b[j-1]});j--}
  }
  return {distance:dist[m][n],ops:ops.reverse()};
 }
 function hints(word,op){
  const pack=Number(word.pack),target=word.word.toLowerCase();
  const missing=op.ops.filter(x=>x.type==='missing').map(x=>x.expected).join('');
  const extra=op.ops.filter(x=>x.type==='extra').map(x=>x.actual).join('');
  let specific='';
  if(pack===2||pack===4||pack===6){
   if(/(.)\1/.test(target))specific='👂 Hak het woord in klankgroepen. Hoor je een korte klinker? Dan schrijf je vaak twee medeklinkers, zoals in bak-ken.';
  }
  if(pack===3||pack===4||pack===6||pack===5){
   if(!specific)specific='🔴 Let op de lange klank in een open klankgroep. Denk aan: a-pen, ko-pen, mu-ren.';
  }
  if(pack===7)specific='🟣 Hoor je de zachte, doffe e? Onthoud de uitgang: -enen, -elen, -eren of -ere.';
  if(pack===8)specific='🐣 Zoek eerst het grondwoord en schrijf daarna het verkleinwoord, bijvoorbeeld blad → blaadje of dorp → dorpje.';
  if(pack===1)specific='👂 Luister goed. Sommige eindletters hoor je duidelijker als je het woord langer maakt. Andere spellingen onthoud je.';
  const general=missing?'Je mist '+(missing.length===1?'de letter ':'de letters ')+'“'+missing+'”.':
   extra?'Je hebt '+(extra.length===1?'een extra letter':'extra letters')+' geschreven: “'+extra+'”.':
   op.ops.some(x=>x.type==='change')?'Een of meer letters zijn verwisseld. Vergelijk de gekleurde letters.':'Kijk goed naar de lettervolgorde.';
  return {general,specific};
 }
 function diagnose(word,written){
  const {typed,correct}=answerPart(word,written);
  const comparison=diff(correct,typed),guide=hints(word,comparison);
  const marked=comparison.ops.map(x=>{
   if(x.type==='equal')return '<span>'+esc(x.expected)+'</span>';
   if(x.type==='extra')return '<span class="coach-extra" aria-label="extra letter">'+esc(x.actual)+'</span>';
   if(x.type==='missing')return '<span class="coach-missing" aria-label="ontbrekende letter">'+esc(x.expected)+'</span>';
   return '<span class="coach-change" aria-label="andere letter">'+esc(x.expected)+'</span>';
  }).join('');
  return {distance:comparison.distance,typed,correct,html:
   '<div class="coach-panel"><h3>🧠 De spellingdetective helpt je!</h3>'+
   '<div class="coach-compare"><div><small>Jij schreef</small><strong>'+esc(typed)+'</strong></div>'+
   '<div><small>Zo schrijf je het</small><strong>'+marked+'</strong></div></div>'+
   '<p>🔎 '+esc(guide.general)+'</p><p>💡 '+esc(guide.specific)+'</p>'+
   '<p class="coach-gentle">Een foutje is een kans om iets nieuws te leren. Probeer het nog eens!</p></div>'};
 }
 window.RekenSpellingCoach=Object.freeze({diagnose,diff,normalize});
})();