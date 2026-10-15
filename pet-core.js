'use strict';
/* Rekenreis Pet World: local progress, friendly economy, no accounts or purchases. */
(function(){
 const KEY='rekenreis-pet-v1',MATH='rekenreis-progress-v1',DICT='rekenreis-dictee-v1';
 const chapters=[
  {id:'blocks',name:'Het Tellenbos',icon:'🌳',xp:0,scene:'bos',desc:'Ontdek alle geheime getallen.'},
  {id:'place',name:'Het Cijferkasteel',icon:'🏰',xp:100,scene:'kasteel',desc:'De kamers van D, H, T en E.'},
  {id:'words',name:'De Woordenzee',icon:'⛵',xp:240,scene:'zee',desc:'Lees de woorden van de zee.'},
  {id:'line',name:'De Getallentrein',icon:'🚂',xp:420,scene:'trein',desc:'Reis over de getallenlijn.'},
  {id:'compare',name:'De Sterrenberg',icon:'⛰️',xp:650,scene:'berg',desc:'Welk getal is groter?'}
 ];
 const pets=[
  {id:'fox',name:'Vosje',icon:'🦊'}, {id:'cat',name:'Katje',icon:'🐱'},
  {id:'dog',name:'Hondje',icon:'🐶'}, {id:'rabbit',name:'Konijntje',icon:'🐰'}
 ];
 const catalog=[
  {id:'hat-bow',category:'hat',name:'Roze strik',icon:'🎀',price:35,level:1},
  {id:'hat-crown',category:'hat',name:'Gouden kroon',icon:'👑',price:120,level:4},
  {id:'hat-cap',category:'hat',name:'Coole pet',icon:'🧢',price:55,level:2},
  {id:'hat-flower',category:'hat',name:'Bloemenkrans',icon:'🌸',price:75,level:3},
  {id:'dress-scarf',category:'clothes',name:'Warme sjaal',icon:'🧣',price:40,level:1},
  {id:'dress-shirt',category:'clothes',name:'Blauw T-shirt',icon:'👕',price:60,level:2},
  {id:'dress-dress',category:'clothes',name:'Feestjurk',icon:'👗',price:95,level:3},
  {id:'dress-cape',category:'clothes',name:'Superheldencape',icon:'🦸',price:160,level:5},
  {id:'furn-lamp',category:'furniture',name:'Sterrenlamp',icon:'💡',price:45,level:1},
  {id:'furn-plant',category:'furniture',name:'Mooie plant',icon:'🪴',price:55,level:2},
  {id:'furn-chair',category:'furniture',name:'Zachte zetel',icon:'🛋️',price:90,level:3},
  {id:'furn-books',category:'furniture',name:'Boekenkast',icon:'📚',price:110,level:4},
  {id:'room-pink',category:'room',name:'Roze droomkamer',icon:'🩷',price:85,level:2},
  {id:'room-blue',category:'room',name:'Zeekamer',icon:'🌊',price:100,level:3},
  {id:'room-space',category:'room',name:'Sterrenkamer',icon:'🌌',price:170,level:5},
  {id:'toy-ball',category:'toy',name:'Speelbal',icon:'⚽',price:30,level:1},
  {id:'toy-bear',category:'toy',name:'Knuffelbeer',icon:'🧸',price:65,level:2},
  {id:'toy-rocket',category:'toy',name:'Speelraket',icon:'🚀',price:115,level:4}
 ];
 const limits={name:16};
 const cap=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
 const json=(key)=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch(e){return {}}};
 function load(){
  const v=json(KEY),pet=pets.some(p=>p.id===v.pet)?v.pet:'fox';
  const owned=Array.isArray(v.owned)?v.owned.filter(x=>catalog.some(c=>c.id===x)):[];
  const equip={},defaults={hat:null,clothes:null,room:null};
  for(const category of Object.keys(defaults))equip[category]=owned.includes(v.equip?.[category])?v.equip[category]:null;
  const placed=Array.isArray(v.placed)?v.placed.filter(x=>owned.includes(x)&&catalog.find(c=>c.id===x)?.category==='furniture'):[];
  return {pet,name:(typeof v.name==='string'?v.name:'Milo').slice(0,limits.name)||'Milo',
   owned:[...new Set(owned)],equip,placed:[...new Set(placed)],spent:cap(v.spent,0,1e7),
   mood:cap(v.mood===undefined?70:v.mood,0,100),energy:cap(v.energy===undefined?75:v.energy,0,100),
   clean:cap(v.clean===undefined?80:v.clean,0,100),careCount:cap(v.careCount,0,1e6)};
 }
 function save(d){try{localStorage.setItem(KEY,JSON.stringify(d));return true}catch(e){return false}}
 function numbers(){
  const m=json(MATH),d=json(DICT),history=Array.isArray(m.history)?m.history:[],dict=Array.isArray(d.history)?d.history:[];
  const mathCorrect=history.filter(x=>x.correct).length,dictCorrect=dict.filter(x=>x.correct).length;
  const xp=history.reduce((n,x)=>n+(x.correct?12:4),0)+dict.reduce((n,x)=>n+(x.correct?10:3),0);
  return {xp,mathCorrect,dictCorrect,earned:60+5*mathCorrect+7*dictCorrect,mathSessions:Array.isArray(m.sessions)?m.sessions:[]};
 }
 function levels(xp){const thresholds=[0,100,240,420,650,950,1300,1740,2250,2850,3550,4350];let level=1;
  thresholds.forEach((t,i)=>{if(xp>=t)level=i+1});
  if(xp>=thresholds[thresholds.length-1])level+=Math.floor((xp-thresholds[thresholds.length-1])/950);
  const cur=thresholds[Math.min(level-1,thresholds.length-1)]||0;
  const next=level>=thresholds.length?cur+950:thresholds[level];
  return {level,cur,next,percent:cap(Math.round((xp-cur)/(next-cur)*100),0,100)};
 }
 function snapshot(){
  const pet=load(),math=numbers(),level=levels(math.xp);
  const mastered=chapters.filter(c=>math.mathSessions.some(s=>s.topic===c.id&&s.mode==='practice'&&s.total===10&&s.correct===10)).map(c=>c.id);
  return {pet,...math,...level,coins:Math.max(0,math.earned-pet.spent),
   chapters:chapters.map((c,i)=>({...c,index:i+1,unlocked:math.xp>=c.xp,mastered:mastered.includes(c.id)})),
   mastered,bonusUnlocked:mastered.length>=4};
 }
 function rename(name){let d=load();const n=String(name||'').trim().replace(/[<>]/g,'').slice(0,16);if(!n)return {ok:false,reason:'Naam ontbreekt'};d.name=n;save(d);return {ok:true}}
 function choosePet(id){if(!pets.some(p=>p.id===id))return {ok:false,reason:'Onbekend dier'};const d=load();d.pet=id;save(d);return {ok:true}}
 function buy(id){
  const item=catalog.find(x=>x.id===id),s=snapshot();
  if(!item)return {ok:false,reason:'Onbekend voorwerp'};
  if(s.pet.owned.includes(id))return {ok:false,reason:'Dit heb je al'};
  if(s.level<item.level)return {ok:false,reason:'Nog niet vrijgespeeld'};
  if(s.coins<item.price)return {ok:false,reason:'Nog niet genoeg muntjes'};
  const d=s.pet;d.spent+=item.price;d.owned.push(id);save(d);
  return {ok:true,item};
 }
 function equip(id){
  const item=catalog.find(x=>x.id===id),d=load();
  if(!item||!d.owned.includes(id))return {ok:false,reason:'Koop dit eerst'};
  if(item.category==='furniture'){d.placed=d.placed.includes(id)?d.placed.filter(x=>x!==id):[...d.placed,id]}
  else if(['hat','clothes','room'].includes(item.category)){d.equip[item.category]=d.equip[item.category]===id?null:id}
  else if(item.category==='toy'){d.mood=cap(d.mood+15,0,100)}
  save(d);return {ok:true};
 }
 function care(action){
  const d=load();
  if(action==='food'){d.energy=cap(d.energy+20,0,100);d.mood=cap(d.mood+8,0,100)}
  else if(action==='wash'){d.clean=cap(d.clean+25,0,100);d.mood=cap(d.mood+5,0,100)}
  else if(action==='play'){d.mood=cap(d.mood+20,0,100);d.energy=cap(d.energy-5,0,100)}
  else if(action==='rest'){d.energy=cap(d.energy+25,0,100);d.mood=cap(d.mood+4,0,100)}
  else return {ok:false};
  d.careCount++;save(d);return {ok:true};
 }
 window.RekenPetCore=Object.freeze({snapshot,rename,choosePet,buy,equip,care,pets,chapters,catalog,levels});
})();