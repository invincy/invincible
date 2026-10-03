// Verify the published site's local assets and the standalone navigation entry points.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function list(directory){return fs.readdirSync(directory,{withFileTypes:true}).flatMap(item=>(['node_modules','.git','.test-output'].includes(item.name)||item.name.startsWith('layout-check.'))?[]:item.isDirectory()?list(path.join(directory,item.name)):[path.join(directory,item.name)])}
const files=list(root),errors=[];
function checkReference(file,reference){
 if(!reference||/^(?:https?:|data:|app:|mailto:|#)/.test(reference)||reference.startsWith('//'))return;
 const raw=reference.split(/[?#]/)[0];
 if(!raw||(!raw.startsWith('/')&&!raw.startsWith('.')&&/\.jsx?$/.test(file)))return;
 const target=raw.startsWith('/invincible/')?path.join(root,raw.slice('/invincible/'.length)):raw.startsWith('/')?path.join(root,raw.slice(1)):path.resolve(path.dirname(file),raw);
 const found=[target,target+'.js',target+'.jsx',path.join(target,'index.html')].some(candidate=>fs.existsSync(candidate)&&fs.statSync(candidate).isFile());
 if(!found)errors.push(`${path.relative(root,file)} refers to missing ${reference}`);
}
for(const file of files){
 const extension=path.extname(file);if(!['.html','.js','.jsx','.css','.webmanifest'].includes(extension))continue;
 const source=fs.readFileSync(file,'utf8');
 if(extension==='.html'){
  for(const match of source.matchAll(/<(?:script|link)\b([^>]+)>/g)){const ref=match[1].match(/(?:src|href)=["']([^"']+)["']/);if(ref){checkReference(file,ref[1]);if(ref[1].includes('site-nav.js')&&!/type=["']module["']/.test(match[1]))errors.push(`${path.relative(root,file)} loads module navigation as a classic script`)}}
 }
 if(extension==='.js'||extension==='.jsx'){
  // Bundled SDK text can contain example import strings; the active Journal has one real adapter import.
  const moduleSource=file.includes(path.sep+'journal'+path.sep+'assets'+path.sep)?source.split('\n')[0]:source;
  for(const match of moduleSource.matchAll(/\b(?:import|export)\s*(?:[^;'"\n]+?\s*from\s*)?["']([^"']+)["']/g))checkReference(file,match[1]);
  for(const match of moduleSource.matchAll(/\bimport\(\s*["']([^"']+)["']/g))checkReference(file,match[1]);
 }
 if(extension==='.css')for(const match of source.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g))checkReference(file,match[1].trim());
 if(extension==='.webmanifest'){const manifest=JSON.parse(source);for(const icon of manifest.icons||[])checkReference(file,icon.src)}
}
const reactEntries=fs.readdirSync(path.join(root,'react-dist/assets')).filter(file=>/^invincible-app-[\w-]+\.js$/.test(file));
if(reactEntries.length!==1)errors.push('Expected one content-hashed React entry.');
for(const file of ['index.html','ai/index.html','task/index.html','workday/index.html','journal/finance.html','reminders/index.html']){
 const source=fs.readFileSync(path.join(root,file),'utf8');
 const entry=source.match(/src=["']([^"']*react-dist\/assets\/[^"']+)["']/)?.[1];
 if(!entry||entry.split('/').pop()!==reactEntries[0])errors.push(`${file} must load the hashed React entry without a query alias.`);
}
const journalScripts=fs.readdirSync(path.join(root,'journal/assets')).filter(file=>file.endsWith('.js'));
if(journalScripts.length!==1)errors.push('Journal assets should contain one active application bundle, with older versions kept in Git history.');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log(`Site reference check passed (${files.length} files; one active Journal bundle).`);
