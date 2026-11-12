'use strict';
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const ctx={window:{},console,document:{getElementById:()=>({})},Math,JSON,Number,String,Array,Set,Map};
vm.runInNewContext(fs.readFileSync('woordpakketten.js','utf8'),ctx);
const book=ctx.window.RekenWoordpakketten;
assert.equal(book.packs.length,9,'Eight original school word packs plus teacher-provided WP10; no fabricated WP9');
assert.equal(book.all.length,168,'The original 160 items plus exactly 8 from WP10');
const examples=[
 ['bank','grond','kruipt','kooien','ouders','blauw','brandweer','donker','mooiste','schreeuwt','draaiden','hangt','lach','heb','vliegt','vrijdag','ingang','nieuw','weide','wacht'],
 ['bakken','blussen','domme','drukke','emmer','frisse','gillen','kapper','koppel','kudde','mannen','redden','slimme','spinnen','sterren','takken','trokken','tunnel','vlekken','volle'],
 ['aten','bleven','boze','duren','hele','kabels','keken','kopen','muziek','proper','pure','ruzie','spraken','sturen','tegen','toverde','tranen','vlogen','wereld','zaten'],
 ['dolle','felle','hadden','knuffel','lekker','lippen','midden','nummer','toffe','breken','brutaal','dode','hemel','kraken','meter','oven','probeer','slaven','katten','wapens'],
 ['boerin','boeven','brieven','hoeve','keuze','leuker','niemand','proeven','verliezen','vieren','alweer','raakte','beleefde','daardoor','gevoel','moorden','speelplaats','stroomde','verdiende','vreemd'],
 ['goudvissen','trekpaarden','paddenstoel','aantallen','vertrekken','jammer','aankleden','klaarmaken','muziekdoos','overval','zomerdag','slaapkamer','boekentas','brievenbus','grootmoeder','dierentuin','ziekenhuis','schatten','schoten','schrokken'],
 ['babbelen','winkelen','knutselen','kriebelen','rinkelen','wandelen','openen','oefenen','regenen','anderen','fluisteren','bibberen','gisteren','bladeren','kinderen','donderen','eieren','betere','dappere','iedere'],
 ['aapjes','dorpje','kaartje','snoepjes','briefje','groepje','kijkje','vriendje','broodjes','hartje','liedje','buikje','heksje','pakjes','dansje','hondjes','pootje','blaadjes','gaatje','glaasje']
];
book.packs.slice(0,8).forEach((pack,i)=>{
 assert.equal(pack.words.length,20,'20 words for school pack '+(i+1));
 assert.deepEqual(Array.from(pack.words,w=>w.word),examples[i],'Verbatim words of photographed pack '+(i+1));
 assert.ok(pack.summary&&pack.tip&&pack.example);
 pack.words.forEach(w=>{assert.equal(w.pack,i+1);assert.ok(w.id&&w.word&&w.phrase&&w.es&&w.meaning&&w.example,'Complete learning explanation for '+w.word)});
});
assert.equal(book.getWord(7,'kinderen').phrase,'de kinderen');
assert.equal(book.getWord(8,'glaasje').phrase,'het glaasje');
vm.runInNewContext(fs.readFileSync('retro-game.js','utf8'),ctx);
assert.equal(typeof ctx.window.RekenRetro.open,'function','Retro arcade exported');
const data=fs.readFileSync('dictee-v2.js','utf8');
assert.ok(data.includes("KEY='rekenreis-dictee-v1'"),'Preserve prior WP7 progress key');
assert.ok(data.includes("STUDY='rekenreis-dictee-studied-v1'"),'Study progress stored separately');
assert.ok(data.includes('mode===\'exam\''),'Mixed exam mode enabled');
assert.ok(data.includes("dictee")||data.length>10000,'Dictation module exists');
vm.runInNewContext(data,ctx);
assert.equal(ctx.window.RekenDictee.packs.length,9,'Updated dictation interface includes WP10');
assert.equal(ctx.window.RekenDictee.words.length,168,'Original entries and WP10 exposed to dictee');
const wp10=book.getPack(10);
assert.ok(wp10,'WP10 exists independently of the missing WP9');
assert.equal(book.getPack(9),undefined,'No fabricated school package 9');
assert.equal(wp10.words.length,8,'Six isolated words and two sentences');
assert.deepEqual(Array.from(wp10.words,w=>w.word),[
 'geheim','flauw','koud','weide','paus','stout',
 'Gaan je ouders op reis met de auto?','Mijn vijand krijgt nooit gelijk!'
],'Exact teacher WP10 list, in original sheet order');
assert.deepEqual(Array.from(wp10.words,w=>w.isSentence),[false,false,false,false,false,false,true,true]);
assert.equal(new Set(wp10.words.map(w=>w.id)).size,8,'Unique audio ids for all eight new tasks');
assert.ok(wp10.words.every(w=>w.pack===10&&w.es&&w.meaning&&w.example),'Translations and Dutch explanations for every item');
assert.equal(book.getWord(10,'stout').phrase,'stout');
assert.equal(book.getWord(10,'Mijn vijand krijgt nooit gelijk!').isSentence,true);
console.log('PASS: 160 original words unchanged, WP10 has 6 exact words + 2 sentences, no invented WP9, and legacy progress preserved');
