import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {resolveProjectRoot,skillDir} from './runtime.mjs';
const root=await resolveProjectRoot();
const registry=JSON.parse(await readFile(resolve(skillDir,'assets/progress/styles.json'),'utf8'));
const source=await readFile(resolve(root,'playground/index.html'),'utf8');
const rows=[...source.matchAll(/\{id:"([^"]+)", category:"progress"[^\n]*?src:"([^"]+)"[^\n]*?poster:"([^"]+)"([^\n]*)/g)];
const styles=registry.styles.filter(s=>s.status==='validated');
const problems=[];
const ids=styles.map(s=>s.id);
if(new Set(ids).size!==ids.length)problems.push('duplicate registry style');
for(const style of styles){
  if(rows.filter(row=>row[1]===style.id).length!==1)problems.push(style.id+': missing or duplicate Playground entry');
  for(const name of [style.previewImage,style.sampleVideo])if(!name||!existsSync(resolve(skillDir,'assets/progress',name)))problems.push(style.id+': missing asset '+name);
}
for(const row of rows){
  if(!ids.includes(row[1]))problems.push(row[1]+': unregistered');
  const files=[row[2],row[3],...Array.from(row[4].matchAll(/(?:download|thumbnail):"([^"]+)"/g),match=>match[1])];
  if(!row[4].includes('download:'))problems.push(row[1]+': missing download');
  for(const file of files)if(!existsSync(resolve(root,'playground',file)))problems.push('missing '+file);
}
if(rows.length!==styles.length)problems.push('registry / Playground count mismatch');
console.log(JSON.stringify({ok:problems.length===0,progressStyles:styles.length,displayItems:rows.length,problems},null,2));
if(problems.length)process.exitCode=1;
