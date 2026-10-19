'use strict';
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const ctx={window:{},console,document:{getElementById:()=>({})},Math,JSON,Number,String,Array,Set,Map};
vm.runInNewContext(fs.readFileSync('woordpakketten.js','utf8'),ctx);
const book=ctx.window.RekenWoordpakketten;
assert.equal(book.packs.length,8,'Eight photographed word packs');
assert.equal(book.all.length,160,'Exactly 160 school spelling words');
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
book.packs.forEach((pack,i)=>{
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
assert.ok(data.includes("const KEY='rekenreis-dictee-v1'"),'Preserve prior WP7 progress key');
assert.ok(data.includes("const STUDY='rekenreis-dictee-studied-v1'"),'Study progress stored separately');
assert.ok(data.includes('mode===\'exam\''),'Mixed exam mode enabled');
assert.ok(data.includes("dictee")||data.length>10000,'Dictation module exists');
vm.runInNewContext(data,ctx);
assert.equal(ctx.window.RekenDictee.packs.length,8,'Updated dictee interface loads');
assert.equal(ctx.window.RekenDictee.words.length,160,'All words exposed to dictee');
console.log('PASS: 8 packs, 160 exact words, Dutch meanings/examples, exam, legacy progress and arcade module');
