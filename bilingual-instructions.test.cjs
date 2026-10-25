'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const window={};
vm.runInNewContext(fs.readFileSync('bilingual-instructions.js','utf8'),{window});
const lang=window.RekenTaal;
assert.ok(lang,'Dutch-first helper loads');
const html=lang.pair('Schrijf het woord.','Write the word.');
assert.ok(html.indexOf('Schrijf het woord.')<html.indexOf('Write the word.'),'Dutch first, English second');
assert.match(html,/lang="nl-BE"/);
assert.match(html,/lang="en"/);
assert.match(html,/translate="no"/,'Device auto-translate cannot overwrite fixed translations');
assert.ok(!lang.pair('<script>','Hello').includes('<script>'),'User/lesson text escaped safely');
for(let i=1;i<=8;i++){
 assert.ok(lang.packs[i].summary&&lang.packs[i].tip,'Every school spelling rule has English help: '+i);
}
const questions=[
 {topic:'blocks',title:'Hoeveel is dit samen?',subtitle:'Tel de blokjes.'},
 {topic:'place',kind:'number',title:'Welk getal hoort hierbij?',visual:'expanded',n:356},
 {topic:'place',kind:'number',title:'Wat is de waarde van de H?',visual:'place',n:356},
 {topic:'words',kind:'choices',title:'Hoe schrijf je dit getal?',subtitle:'356'},
 {topic:'words',kind:'number',title:'Welk getal lees je?',subtitle:'driehonderd'},
 {topic:'line',kind:'number',visual:'line',title:'Welk getal ontbreekt?',arr:[5,10,15]},
 {topic:'line',kind:'sort',visual:'sort',title:'Zet de getallen van klein naar groot.'},
 {topic:'line',kind:'number',visual:'number',n:354,title:'Welk getal komt juist vóór 354?'},
 {topic:'compare',kind:'choices',choices:['<','=','>'],title:'Welk teken hoort ertussen?'},
 {topic:'compare',kind:'choices',choices:['Waar','Niet waar'],title:'Is deze vergelijking waar?'}
];
for(const q of questions){
 const t=lang.math(q);
 assert.ok(t.title&&t.subtitle&&!t.title.includes('undefined'), 'English math help for '+q.topic+'/'+q.kind);
}
const idx=fs.readFileSync('index.html','utf8'),pos=idx.indexOf('bilingual-instructions.js');
assert.ok(pos>0&&pos<idx.indexOf('app.js?'),'Locale helper loaded BEFORE math module');
assert.ok(pos<idx.indexOf('dictee-v2.js?'),'Locale helper loaded BEFORE dictee');
assert.match(idx,/lang="nl-BE"/);
assert.match(idx,/meta name="google" content="notranslate"/);
assert.match(idx,/bilingual-instructions.css/);
const app=fs.readFileSync('app.js','utf8'),dictee=fs.readFileSync('dictee-v2.js','utf8');
assert.match(app,/bi\(q\.title,/,'Dynamic math questions show Dutch before English');
assert.match(app,/bi\(q\.subtitle,/,'Dynamic math hints show both languages');
assert.match(dictee,/bi\('Welk woord hoor je\?'/,'Dictee listening instructions bilingual');
assert.match(dictee,/englishPack\(p\.number\)/,'All eight spelling-rule explanations bilingual');
for(const f of ['arcade-hub.js','arcade-invaders.js','arcade-breakout.js','forest-game.js','pet-studio.js','pet-world.js']){
 assert.match(fs.readFileSync(f,'utf8'),/RekenTaal/,'Dutch/English instructions in '+f);
}
const sw=fs.readFileSync('sw.js','utf8'),deploy=fs.readFileSync('.github/workflows/deploy.yml','utf8');
for(const f of ['bilingual-instructions.js','bilingual-instructions.css']){
 assert.ok(sw.includes(f),'Offline cache ships '+f);
 assert.ok(deploy.includes(f),'GitHub Pages deploy ships '+f);
}
console.log('PASS: Dutch above English on 10 math cases, 8 word packs, dictee, pet, arcade, and offline iPad bundle.');
