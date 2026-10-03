// Lazy chunks must import the exact same entry URL as HTML (no query-version aliases).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const assets=fs.readdirSync(path.join(root,'react-dist/assets'));
const entry=assets.find(name=>/^invincible-app-[\w-]+\.js$/.test(name));
const css=assets.filter(name=>name.endsWith('.css'));
if(!entry||css.length!==1)throw Error('Expected one hashed React entry and one shared CSS asset');
for(const file of ['index.html','ai/index.html','task/index.html','workday/index.html','journal/finance.html','reminders/index.html']){
 const target=path.join(root,file),source=fs.readFileSync(target,'utf8');
 const next=source.replace(/(react-dist\/assets\/)[^"'<>]+\.(js|css)(?:\?[^"'<>]*)?/g,(_,prefix,type)=>prefix+(type==='js'?entry:css[0]));
 fs.writeFileSync(target,next);
}
console.log('React HTML entries refreshed with content-hashed assets.');
