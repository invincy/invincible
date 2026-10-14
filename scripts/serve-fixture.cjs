// Controlled test fixture server for local interactive demonstration
const path = require('node:path');
const http = require('node:http');
const fs = require('node:fs');
const esbuild = require(path.join(__dirname, '../react/node_modules/esbuild'));

const root = path.resolve(__dirname, '..');
const output = path.join(root, '.test-output/v2');
const buildDirectory = 'v2-dist';

const authMock = `
let observer, current={uid:'alice'};
export const db={};
export async function observeAuth(next) {
  await new Promise(resolve=>setTimeout(resolve,80)); observer=next;next(current);
  return ()=>{if(observer===next)observer=null;};
}
export const loginWithGoogle=async()=>{current={uid:'alice'};observer?.(current);};
export const logout=async()=>{current=null;observer?.(null);};
window.switchAccount=uid=>{current=uid?{uid}:null;observer?.(current);};
`;

const firestoreMock = `
export const collection=(_,...parts)=>({path:parts.join('/')});
export const doc=collection;
const listeners=new Set();
window.reads=[];window.writes=0;
const tasks=Array.from({length:24},(_,i)=>({
  id:'t'+i,
  title:i===0?'Build the living workspace':'Project '+i+' — Research, review and prepare the next meaningful action',
  status:['In Progress','Backlog','Today','Done'][i%4],
  steps:[
    {id:'s1',title:'Review the spatial canvas',notes:'Keep the original data.\\nVerify all user journeys.',done:false},
    {id:'s2',title:'Inspect existing records',done:true}
  ]
}));

function snapshot(ref) {
  const owner=ref.path.split('/')[1];
  if(ref.path.endsWith('/tasks')) return {metadata:{fromCache:false},docs:owner==='alice'?tasks.map(task=>({id:task.id,data:()=>({...task})})):[]};
  return {metadata:{fromCache:false},exists:()=>owner==='alice',data:()=>({activeItemId:'q',items:[{id:'q',taskId:'t0',stepId:'s1'}]})};
}

export function onSnapshot(ref, options, next, error) {
  const listener={ref,next,error};listeners.add(listener);window.reads.push(ref.path);
  const clock=setTimeout(()=>next(snapshot(ref)),35);
  return ()=>{clearTimeout(clock);listeners.delete(listener);};
}
window.emitTaskTitle=title=>{tasks[0].title=title;for(const entry of listeners)entry.next(snapshot(entry.ref));};
window.failSync=()=>{for(const entry of listeners)entry.error(Error('permission-denied'));};
window.listenerCount=()=>listeners.size;
`;

(async () => {
  fs.mkdirSync(output, {recursive: true});
  await esbuild.build({
    entryPoints: [path.join(root, 'react/v2/main.jsx')],
    bundle: true,
    outfile: path.join(output, 'fixture.js'),
    jsx: 'automatic',
    plugins: [{
      name: 'read-only-fixture',
      setup(build) {
        build.onResolve({filter: /firebase$/}, args => args.path === '../src/firebase' || args.path === './firebase' ? {path: 'auth', namespace: 'fixture'} : null);
        build.onResolve({filter: /^firebase\/firestore$/}, () => ({path: 'firestore', namespace: 'fixture'}));
        build.onLoad({filter: /.*/, namespace: 'fixture'}, args => ({contents: args.path === 'auth' ? authMock : firestoreMock, loader: 'js'}));
      }
    }],
  });

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost:4174');
    if (url.pathname === '/' || url.pathname === '/fixture') {
      res.setHeader('Content-Type', 'text/html');
      res.end('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Invincible V2 — Demonstration Fixture</title><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script src="/fixture.js"></script></body></html>');
      return;
    }
    const file = url.pathname === '/fixture.js' || url.pathname === '/fixture.css' ? path.join(output, url.pathname.slice(1)) :
      url.pathname.startsWith('/invincible/v2/') ? path.join(root, buildDirectory, url.pathname.slice('/invincible/v2/'.length) || 'index.html') : null;
    if (!file || !fs.existsSync(file)) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html');
    res.end(fs.readFileSync(file));
  });

  server.listen(4174, '127.0.0.1', () => {
    console.log('Invincible V2 Demonstration Fixture running at: http://localhost:4174/fixture');
  });
})();
