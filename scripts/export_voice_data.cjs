'use strict';
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const ctx={window:{},console,Math,JSON,String,Number,Array,Set};
vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../woordpakketten.js'),'utf8'),ctx);
const words=ctx.window.RekenWoordpakketten.all;
const entries=Array.from(words,w=>({id:w.id,word:w.phrase,example:w.example}));
vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../spellinglab-data.js'),'utf8'),ctx);
const lab=ctx.window.RekenSpellingData;
// Short and long vowels are spoken using the same nl-BE Dena neural voice as school dictations.
for(const p of lab.pairs){
 entries.push({id:'lab-'+p.id+'-s',word:p.short,only_word:true});
 entries.push({id:'lab-'+p.id+'-l',word:p.long,only_word:true});
}
for(const word of lab.items)entries.push({id:'lab-'+word.id,word:word.word,only_word:true});
const dir=path.resolve(__dirname,'../_audio_cache');
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'inputs.json'),JSON.stringify(entries,null,2));
console.log('Audio inputs exported:',entries.length,'Flemish words and examples');
