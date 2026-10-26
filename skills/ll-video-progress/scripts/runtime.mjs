import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
export const skillDir=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const resolveProjectRoot=async()=>{
  const candidates=[process.env.LL_VIDEO_PROGRESS_PROJECT];
  const file=resolve(skillDir,'runtime.local.json');
  if(existsSync(file))candidates.push(JSON.parse((await readFile(file,'utf8')).replace(/^\uFEFF/,'' )).projectRoot);
  candidates.push(resolve(skillDir,'../..'),process.cwd());
  for(const candidate of candidates.filter(Boolean)){
    let path=resolve(candidate);
    while(true){
      if(existsSync(resolve(path,'playground/index.html'))&&existsSync(resolve(path,'scripts/playground_server.mjs')))return path;
      const parent=dirname(path);if(parent===path)break;path=parent;
    }
  }
  throw new Error('找不到共用 Playground 项目；配置 runtime.local.json 或 LL_VIDEO_PROGRESS_PROJECT。');
};
