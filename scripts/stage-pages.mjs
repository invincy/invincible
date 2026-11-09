// Publish tracked runtime files without development fixtures or server source.
import {execFileSync} from 'node:child_process';
import {cp,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const target=process.argv[2]&&path.resolve(process.argv[2]);
if(!target||target===root||target.startsWith(root+path.sep))throw Error('Choose a separate empty staging directory.');
await mkdir(target,{recursive:false});
const excluded=new Set(['.agents','.github','tests','scripts','react','functions','functions-tts']);
const files=execFileSync('git',['ls-files','--cached','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
let count=0;
for(const file of files){
 if(file.startsWith('.')||excluded.has(file.split('/')[0])||/^(?:AGENTS\.md|package(?:-lock)?\.json|firebase[^/]*\.json|firestore[^/]*|storage\.rules)$/.test(file))continue;
 const output=path.join(target,file);await mkdir(path.dirname(output),{recursive:true});
 await cp(path.join(root,file),output);count++;
}
console.log('Prepared '+count+' public files; development fixtures excluded.');
