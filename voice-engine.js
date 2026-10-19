'use strict';
/* Pre-recorded nl-BE neural voice if deployed; otherwise device nl-BE voice.
   No personal or child input is uploaded. Speech reads school words only. */
(function(){
 let manifest=new Set(),ready=false,audio=null,synthToken=0,preferred='';
 const getVoices=()=>('speechSynthesis' in window)?speechSynthesis.getVoices():[];
 function options(){return getVoices().filter(v=>/^nl([-_]BE|[-_]NL)?$/i.test(v.lang)||/^nl-/i.test(v.lang))}
 function best(){
  const vs=options();
  return vs.find(v=>v.voiceURI===preferred)||
   vs.find(v=>/^nl[-_]BE$/i.test(v.lang))||
   vs.find(v=>/belgi|vlaams|flemish/i.test(v.name))||
   vs[0]||null;
 }
 function loadManifest(){
  fetch('./audio/nl-BE/manifest.json',{cache:'no-store'}).then(r=>r.ok?r.json():null)
   .then(v=>{if(v&&Array.isArray(v.files)){manifest=new Set(v.files);ready=true}}).catch(()=>{});
 }
 try{preferred=localStorage.getItem('rekenreis-voice-id')||''}catch(e){}
 function stop(){
  synthToken++;
  try{audio?.pause();if(audio){audio.currentTime=0;audio=null}}catch(e){}
  try{window.speechSynthesis?.cancel()}catch(e){}
 }
 function voiceInfo(){const v=best();return ready?'🇧🇪 Vlaamse opname: Dena (natuurlijkere stem)':
  v&&/^nl[-_]BE$/i.test(v.lang)?'🇧🇪 Toestelstem: '+v.name:
  '⚠️ Geen Vlaamse stemopname beschikbaar. De iPad gebruikt een toestelstem.'}
 function fallback(text,mode,report){
  if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)){report?.('🔇 Geen voorleesstem beschikbaar.');return}
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.lang='nl-BE';const v=best();if(v)utterance.voice=v;
  utterance.rate=mode==='slow'?0.66:mode==='chunks'?0.72:0.97;
  utterance.pitch=1;utterance.volume=1;
  utterance.onerror=()=>report?.('Geluid werkt niet. Probeer een Vlaamse systeemstem op het toestel.');
  utterance.onstart=()=>report?.(voiceInfo()+(mode==='slow'?' · Langzaam':''));
  try{window.speechSynthesis.speak(utterance)}catch(e){report?.('De stem kon niet starten.')}
 }
 // Child-friendly auditory chunks; not an authoritative phonetic syllable parser.
 function chunks(word){
  let term=word.word||String(word),cue=word.cue||'';
  const divide={
   'babbelen':'bab-be-len','winkelen':'win-ke-len','knutselen':'knut-se-len',
   'oefenen':'oe-fe-nen','kinderen':'kin-de-ren','bladeren':'bla-de-ren',
   'regen en':'re-ge-nen','gisteren':'gis-te-ren','paddenstoel':'pad-den-stoel',
   'glaasje':'glaas-je','blaadjes':'blaad-jes'
  };
  const raw=divide[term]||term.replace(/([bcdfghjklmnpqrstvwxyz])([aeiou])(?=[bcdfghjklmnpqrstvwxyz])/ig,'$1-$2');
  return (cue?cue+', ':'')+raw.split('-').join(' ... ');
 }
 function speak(word,mode='normal',report=()=>{}){
  stop();
  const key=(word.id||''),text=mode==='example'?word.example:word.phrase;
  const suffix=mode==='example'?'example':'word';
  const path=key+'-'+suffix+'.mp3';
  // A cached high-quality audio file is preferred for all voice modes.
  if(ready&&manifest.has(path)){
   const player=new Audio('./audio/nl-BE/'+path);
   audio=player;player.preload='auto';
   player.playbackRate=mode==='slow'?.76:mode==='chunks'?.70:1;
   player.preservesPitch=true;
   player.onerror=()=>{if(audio!==player)return;audio=null;fallback(mode==='chunks'?chunks(word):text,mode,report)};
   try{
    const p=player.play();
    if(p&&typeof p.catch==='function')p.catch(()=>{if(audio===player){audio=null;fallback(mode==='chunks'?chunks(word):text,mode,report)}});
    report('🇧🇪 Vlaamse opnamestem Dena'+(mode==='slow'?' · Langzaam':''));
    return;
   }catch(e){audio=null}
  }
  const readable=mode==='chunks'?chunks(word):mode==='slow'?word.phrase.replace(' ',' ... '):text;
  fallback(readable,mode,report);
 }
 function setVoice(id){preferred=String(id||'');try{localStorage.setItem('rekenreis-voice-id',preferred)}catch(e){}}
 if('speechSynthesis'in window)window.speechSynthesis.addEventListener?.('voiceschanged',()=>{});
 loadManifest();
 window.RekenVoice=Object.freeze({speak,stop,options,voiceInfo,setVoice,available:()=>ready});
})();