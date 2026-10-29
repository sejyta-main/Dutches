'use strict';
/* Hand-curated Flemish Dutch examples; all model items are real words.
   Short/long refers to Dutch vowel quality and spelling patterns, not merely speaking speed. */
(function(){
 const PAIRS=Object.freeze([
  {id:'man-maan',short:'man',long:'maan',sMeaning:'een volwassen man',lMeaning:'de maan aan de hemel'},
  {id:'bom-boom',short:'bom',long:'boom',sMeaning:'een explosief',lMeaning:'een boom in het bos'},
  {id:'pot-poot',short:'pot',long:'poot',sMeaning:'een kookpot',lMeaning:'de poot van een dier'},
  {id:'zon-zoon',short:'zon',long:'zoon',sMeaning:'de zon aan de hemel',lMeaning:'een jongen van zijn ouders'},
  {id:'tak-taak',short:'tak',long:'taak',sMeaning:'een tak aan een boom',lMeaning:'een opdracht voor school'},
  {id:'zak-zaak',short:'zak',long:'zaak',sMeaning:'een zak om iets in te doen',lMeaning:'een belangrijke kwestie'},
  {id:'ram-raam',short:'ram',long:'raam',sMeaning:'een mannelijk schaap',lMeaning:'het raam van een huis'},
  {id:'bal-baal',short:'bal',long:'baal',sMeaning:'een bal om mee te spelen',lMeaning:'een grote pak stro'},
  {id:'kop-koop',short:'kop',long:'koop',sMeaning:'een hoofd of een kopje',lMeaning:'een aankoop'},
  {id:'mat-maat',short:'mat',long:'maat',sMeaning:'een mat op de vloer',lMeaning:'een grootte of een vriend'}
 ]);
 // Phoneme spelling patterns in two-syllable forms. Syllable divisions verified manually,
 // not inferred by regex; data curated to avoid misleading synthetic words.
 const ITEMS=[
  ['bommen','bom-men','short','bommen'],['bomen','bo-men','long','bomen'],
  ['potten','pot-ten','short','potten'],['poten','po-ten','long','poten'],
  ['zonnen','zon-nen','short','zonnen'],['zonen','zo-nen','long','zonen'],
  ['zakken','zak-ken','short','zakken'],['zaken','za-ken','long','zaken'],
  ['rammen','ram-men','short','rammen'],['ramen','ra-men','long','ramen'],
  ['ballen','bal-len','short','ballen'],['balen','ba-len','long','balen'],
  ['koppen','kop-pen','short','koppen'],['kopen','ko-pen','long','kopen'],
  ['mannen','man-nen','short','mannen'],['manen','ma-nen','long','manen'],
  ['takken','tak-ken','short','takken'],['taken','ta-ken','long','taken'],
  ['matten','mat-ten','short','matten'],['maten','ma-ten','long','maten'],
  ['pennen','pen-nen','short','pennen'],['stenen','ste-nen','long','stenen'],
  ['hakken','hak-ken','short','hakken'],['maken','ma-ken','long','maken'],
  ['tassen','tas-sen','short','tassen'],['schapen','scha-pen','long','schapen'],
  ['bekken','bek-ken','short','bekken'],['haken','ha-ken','long','haken'],
  ['bellen','bel-len','short','bellen'],['palen','pa-len','long','palen'],
  ['hekken','hek-ken','short','hekken'],['daken','da-ken','long','daken'],
  ['rennen','ren-nen','short','rennen'],['draden','dra-den','long','draden'],
  ['pikken','pik-ken','short','pikken'],['talen','ta-len','long','talen'],
  ['mikken','mik-ken','short','mikken'],['vazen','va-zen','long','vazen'],
  ['bokken','bok-ken','short','bokken'],['rozen','ro-zen','long','rozen'],
  ['rokken','rok-ken','short','rokken'],['noten','no-ten','long','noten'],
  ['mokken','mok-ken','short','mokken'],['sloten','slo-ten','long','sloten'],
  ['stoppen','stop-pen','short','stoppen'],['repen','re-pen','long','repen'],
  ['kippen','kip-pen','short','kippen'],['weken','we-ken','long','weken'],
  ['stappen','stap-pen','short','stappen'],['beren','be-ren','long','beren'],
  ['grappen','grap-pen','short','grappen'],['wegen','we-gen','long','wegen'],
  ['vlaggen','vlag-gen','short','vlaggen'],['spelen','spe-len','long','spelen'],
  ['brillen','bril-len','short','brillen'],['leven','le-ven','long','leven'],
  ['kussen','kus-sen','short','kussen'],['dromen','dro-men','long','dromen'],
  ['mussen','mus-sen','short','mussen'],['stromen','stro-men','long','stromen'],
  ['lussen','lus-sen','short','lussen'],['vogel','vo-gel','long','vogel'],
  ['slakken','slak-ken','short','slakken'],['boter','bo-ter','long','boter'],
  ['rekken','rek-ken','short','rekken'],['water','wa-ter','long','water'],
  ['klappen','klap-pen','short','klappen'],['laken','la-ken','long','laken'],
  ['sokken','sok-ken','short','sokken'],['vader','va-der','long','vader'],
  ['pakken','pak-ken','short','pakken'],['nemen','ne-men','long','nemen'],
  ['doppen','dop-pen','short','doppen'],['geven','ge-ven','long','geven'],
  ['pannen','pan-nen','short','pannen'],['halen','ha-len','long','halen']
 ].map(([word,syllables,rule,meaning],index)=>{
  const parts=syllables.split('-');
  return Object.freeze({id:'i'+index,word,syllables,segments:parts,rule,meaning});
 });
 const INTRO=Object.freeze({
  sound:{nl:'Luister eerst. Kies of je een korte of een lange klinker hoort. De schrijfwijze zie je pas na je antwoord.',en:'Listen first. Decide whether you hear a short or long vowel. The spelling appears after you answer.'},
  build:{nl:'Luister en bouw het woord met twee klankgroepen. Let op de klinker en de dubbele medeklinker.',en:'Listen and build the word using two syllable tiles. Watch the vowel and doubled consonant.'},
  rule:{nl:'Kijk naar de klankgroepen. Kies de regel en vertel waarom het zo geschreven wordt.',en:'Look at the syllables. Choose the rule and explain why the spelling works.'},
  transfer:{nl:'Schrijf nieuwe woorden zonder het woord te zien. De regels helpen ook bij woorden buiten je woordpakket.',en:'Spell unfamiliar words without seeing them. Use rules beyond your school word pack.'},
  exam:{nl:'Een slimme mengtoets: luisteren, de regel herkennen en nieuwe woorden schrijven. Je krijgt een score per vaardigheid.',en:'A mixed check: listening, recognizing rules and spelling unfamiliar words. Get scores for each skill.'}
 });
 const BY_ID=Object.freeze(Object.fromEntries(ITEMS.map(w=>[w.id,w])));
 const PAIR_BY_ID=Object.freeze(Object.fromEntries(PAIRS.map(p=>[p.id,p])));
 const normalize=s=>String(s||'').normalize('NFC').trim().toLocaleLowerCase('nl-BE').replace(/\s+/g,' ');
 const shuffle=(a,rng=Math.random)=>{let v=Array.from(a);for(let i=v.length-1;i>0;i--){let j=Math.floor(rng()*(i+1));[v[i],v[j]]=[v[j],v[i]]}return v};
 function eligible(known=[]){const school=new Set(Array.from(known,normalize));return ITEMS.filter(item=>!school.has(normalize(item.word)))}
 function priority(items,attempts,seen,rng=Math.random){
  // Previously missed but now due for retrieval, then unexposed items, then well-practiced.
  const latest=new Map();
  (attempts||[]).forEach(a=>{if(a.word)latest.set(a.word,a)});
  const now=Date.now(),day=86400000;
  const weight=item=>{
   const a=latest.get(item.word);
   if(a&&!a.correct&&now-Date.parse(a.at)>=day*.75)return -3;
   if(!seen.includes(item.word))return -2;
   if(a&&!a.correct)return -1;
   return 0;
  };
  return shuffle(items,rng).sort((a,b)=>weight(a)-weight(b));
 }
 function explain(item){
  return item.rule==='short'?
   {nl:'Korte klinker: de eerste klankgroep is dicht. Je schrijft de medeklinker dubbel: '+item.syllables+'.',en:'Short vowel: the first syllable is closed. Double the consonant: '+item.syllables+'.'}:
   {nl:'Lange klinker: de eerste klankgroep is open. Je schrijft de klinker één keer: '+item.syllables+'.',en:'Long vowel: the first syllable is open. Write one vowel: '+item.syllables+'.'};
 }
 window.RekenSpellingData=Object.freeze({pairs:PAIRS,items:Object.freeze(ITEMS),byId:BY_ID,pairById:PAIR_BY_ID,intro:INTRO,eligible,priority,explain,normalize,shuffle});
})();
