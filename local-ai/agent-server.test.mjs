import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createLocalAgentServer } from './agent-server.mjs';
import { fakeGpu, fixturePng } from '../tests/fixtures/imagegen-service.mjs';
const TOKEN='fixture-only-local-worker-pairing-token-12345';
async function setup(t, options={}) {
  const directory=await fs.mkdtemp(path.join(process.env.INVINCIBLE_IMAGE_TEST_ROOT||os.tmpdir(),'invincible-http-fixture-'));
  const backend=fakeGpu(options),service=await createLocalAgentServer({ownerUid:'test-owner',token:TOKEN,port:18889,workspaceRoot:directory,fetchImpl:backend.fetchImpl,appOrigin:'https://invincy.github.io',workerOptions:{pollMs:1},ask:async()=>({kind:'tool',tool:'generate_image',arguments:{prompt:'Fixture fortress illustration',preset:'square',seed:42}}),...(options.serverOptions||{})});
  await service.listen();t.after(async()=>{await service.close();await fs.rm(directory,{recursive:true,force:true,maxRetries:3});});
  const call=async(route,body,headers={})=>fetch(service.origin+route,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+TOKEN,'Content-Type':'application/json',...headers},...(body?{body:JSON.stringify(body)}:{})});
  return{service,backend,call};
}
test('HTTP requires pairing, account ownership, exact origin and strict arguments',async t=>{
 const{service,call}=await setup(t);
 assert.equal((await fetch(service.origin+'/api/projects')).status,401);
 assert.equal((await call('/api/projects',null,{'X-Invincible-Account':'other-user'})).status,403);
 assert.equal((await call('/api/session',null,{Origin:'https://untrusted.example'})).status,403);
 assert.equal((await call('/api/generations',{arguments:{prompt:'hi',preset:'square',workflow:{}},idempotencyKey:'invalid-001'})).status,400);
 assert.equal((await call('/api/generations',{arguments:{prompt:'hi',preset:'square'},idempotencyKey:'invalid-001',outputPath:'C:\\out'})).status,400);
 const reference = { arguments: { prompt: 'hi', preset: 'square' }, idempotencyKey: 'invalid-002' };
 assert.equal((await call('/api/generations',{...reference, referencePng:'YWJj'})).status,400);
 assert.equal((await call('/api/generations',{...reference, referencePng:fixturePng(384,640).toString('base64')})).status,400);
 assert.equal((await call('/api/generations',{...reference, arguments:{...reference.arguments,preset:'portrait'}, referencePng:fixturePng(512,512).toString('base64')})).status,400);
 assert.equal((await call('/api/generations/agent_00000000000000000000000000000000')).status,404);
});
test('manual and Qwen routes invoke the same tool, attach once, and serve verified downloads',async t=>{
 const{service,call,backend}=await setup(t);
 const project=(await(await call('/api/projects',{title:'Isolated test project',idempotencyKey:'project-001'})).json()).project;
 const response=await call('/api/command',{message:'Generate a square fortress image',idempotencyKey:'qwen-image-001'}),queued=await response.json();
 assert.equal(queued.verified,false);assert.equal(queued.command.tool,'generate_image');assert.ok(queued.job.id);
 await service.images.drain();const done=await(await call('/api/generations/'+queued.job.id)).json();assert.equal(done.verified,true);assert.equal(done.job.status,'completed');
 const download=await call('/api/generations/'+queued.job.id+'/image?download=1');assert.equal(download.headers.get('Content-Type'),'image/png');assert.match(download.headers.get('Content-Disposition'),/attachment/);assert.ok((await download.arrayBuffer()).byteLength>100);
 for(let n=0;n<2;n++)assert.equal((await call('/api/projects/'+project.id+'/assets',{generationId:queued.job.id})).status,200);
 const rows=await(await call('/api/projects')).json();assert.equal(rows.projects[0].assets.length,1);
 assert.ok(service.api.logs.some(entry=>entry.tool==='generate_image'&&entry.status==='completed'));
 assert.equal((await call('/api/projects/local-00000000-0000-0000-0000-000000000000/assets',{generationId:queued.job.id})).status,403);
 const repeated=await(await call('/api/command',{message:'Generate a square fortress image',idempotencyKey:'qwen-image-001'})).json();assert.equal(repeated.job.id,queued.job.id);assert.equal(backend.loads,1);
});
test('failed ComfyUI jobs never have a successful image or attachment route',async t=>{
 const{service,call}=await setup(t,{failed:true});
 const queued=await(await call('/api/generations',{arguments:{prompt:'Fixture',preset:'square'},idempotencyKey:'failure-http-001'})).json();await service.images.drain();
 const done=await(await call('/api/generations/'+queued.job.id)).json();assert.equal(done.verified,false);assert.equal(done.job.status,'failed');assert.equal((await call('/api/generations/'+queued.job.id+'/image')).status,400);
});
test('published-site pairing requires the configured origin, owner and explicit popup confirmation',async t=>{
 const{service,call}=await setup(t);
 const preflight=await fetch(service.origin+'/api/session',{method:'OPTIONS',headers:{Origin:'https://invincy.github.io','Access-Control-Request-Method':'GET','Access-Control-Request-Headers':'authorization,x-invincible-account','Access-Control-Request-Private-Network':'true'}});
 assert.equal(preflight.status,204);assert.equal(preflight.headers.get('Access-Control-Allow-Origin'),'https://invincy.github.io');assert.equal(preflight.headers.get('Access-Control-Allow-Private-Network'),'true');
 assert.equal((await call('/api/session',null,{Origin:'https://invincy.github.io'})).status,200);
 const query=new URLSearchParams({origin:'https://invincy.github.io',uid:'test-owner',nonce:'12345678-1234-1234-1234-123456789012'});
 const page=await fetch(service.origin+'/connect?'+query,{headers:{'Sec-Fetch-Dest':'document'}});assert.equal(page.status,200);const html=await page.text();
 assert.match(html,/Connect Invincible/);assert.match(html,/postMessage/);assert.ok(page.headers.get('Content-Security-Policy').includes("frame-ancestors 'none'"));
 query.set('uid','other-owner');assert.equal((await fetch(service.origin+'/connect?'+query)).status,403);query.set('uid','test-owner');query.set('origin','https://evil.example');assert.equal((await fetch(service.origin+'/connect?'+query)).status,403);
 assert.equal((await fetch(service.origin+'/api/session',{headers:{Origin:'https://invincy.github.io'}})).status,401,'CORS never substitutes for authentication');
});
test('voiceover analysis requires pairing, confines MP3 to the workspace, and returns an importable draft',async t=>{
 let transcribedPath='',catalogPath='',planned=0;
 const transcript={text:'Hello world.',language:'en',duration:1,segments:[{id:'segment-1',start:0,end:1,text:'Hello world.',words:[{word:'Hello',start:0,end:.5},{word:'world.',start:.5,end:1}]}]};
 const {service,call}=await setup(t,{serverOptions:{transcribeVoiceover:async audio=>{transcribedPath=audio.path;assert.equal(audio.workspaceRoot,serviceWorkspace);assert.deepEqual([...await fs.readFile(audio.path)].slice(0,3),[73,68,51]);return transcript;},loadVoiceoverCatalog:async location=>{catalogPath=location;return{assets:[],verifiedLocations:[],verifiedRoutes:[]};},askVoiceoverJson:async()=>{planned++;return{scenes:[{sourceSegmentId:'segment-1',intent:'hold',title:'Hello',assetId:'',locationId:'',routeId:''}]};}}});
 const serviceWorkspace=service.images.directory.split(path.sep).slice(0,-2).join(path.sep);
 const audioBase64=Buffer.from('ID3fixture-audio').toString('base64');
 assert.equal((await fetch(service.origin+'/api/voiceover/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({audioBase64})})).status,401);
 const response=await call('/api/voiceover/analyze',{audioBase64,title:'Fixture voiceover',creativeInstructions:'Keep it restrained.'});
 assert.equal(response.status,200,JSON.stringify(await response.clone().json()));const result=await response.json();assert.equal(result.analysis.valid,true);assert.equal(result.creatorStudio.title,'Fixture voiceover');assert.equal(result.analysis.transcript.segments[0].words.length,2);assert.equal(planned,1);assert.equal(catalogPath,path.resolve(import.meta.dirname,'..'));
 const workspace=path.join(serviceWorkspace,'voiceover-analysis');assert.deepEqual((await fs.readdir(workspace)).filter(name=>name.endsWith('.mp3')),[]);assert.equal(path.dirname(transcribedPath),workspace);
});
