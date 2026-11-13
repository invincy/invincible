import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { askOllama, detectLocalIntent, draftImagePrompt, imagePromptText } from './invincible-local-controller.mjs';
import { createGpuCoordinator } from './gpu-coordinator.mjs';
import { createImageWorker, safeDirectory, WORKSPACE_ROOT } from './image-worker.mjs';
import { buildCreativePlanPrompt, compileCreativePlan, assembleSceneDraft, loadCreatorAssetCatalog, normalizeTranscript, toCreatorStudioImport, transcribeWithWhisper, whisperEndpoint } from './voiceover-analysis.mjs';
const require = createRequire(import.meta.url);
const { createUniversalAgent } = require('../functions/src/local-ai/universal-agent-api.js');
const { executeInvincibleTool } = require('../functions/src/tools/invincible-tools.js');
const { imageSchema, IMAGE_PRESETS } = require('../functions/src/local-ai/image-generation.js');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json', '.ico': 'image/x-icon' };

export async function createLocalAgentServer({ ownerUid, token = crypto.randomBytes(32).toString('base64url'), port = 8787, workspaceRoot = WORKSPACE_ROOT, fetchImpl = fetch, ask = askOllama, askVoiceoverJson, transcribeVoiceover = transcribeWithWhisper, loadVoiceoverCatalog = loadCreatorAssetCatalog, appOrigin = null, workerOptions = {} } = {}) {
  if (!/^[A-Za-z0-9_-]{3,120}$/.test(ownerUid || '')) throw Error('Configure the local owner UID before starting the worker.');
  if (token.length < 32) throw Error('Local pairing token is too short.');
  const origin = `http://127.0.0.1:${port}`;
  if (appOrigin) { const u = new URL(appOrigin); const local = ['127.0.0.1','localhost'].includes(u.hostname) && u.protocol === 'http:'; if ((!local && appOrigin !== 'https://invincy.github.io') || u.origin !== appOrigin) throw Error('App origin must be the Invincible website or an exact loopback origin.'); }
  const gpu = createGpuCoordinator();
  const images = createImageWorker({ ownerUid, gpu, workspaceRoot, fetchImpl, ...workerOptions });
  await images.init();
  const principal = { uid: ownerUid, workspaceIds: [ownerUid] };
  const projectsFile = path.join(images.directory, 'projects.json'); let projectTail = Promise.resolve();
  const voiceoverDirectory=path.join(workspaceRoot,'voiceover-analysis');
  function voiceoverAudio(body){
    const encoded=String(body.audioBase64||'').replace(/^data:audio\/[^;]+;base64,/i,'');
    if(!encoded||encoded.length>20*1024*1024||!/^[A-Za-z0-9+/]*={0,2}$/.test(encoded))throw Error('Audio must be a valid MP3 under 15 MB.');
    const bytes=Buffer.from(encoded,'base64'),isMp3=bytes.subarray(0,3).toString()==='ID3'||(bytes[0]===0xff&&(bytes[1]&0xe0)===0xe0);
    if(!bytes.length||bytes.length>15*1024*1024||!isMp3||bytes.toString('base64').replace(/=+$/,'')!==encoded.replace(/=+$/,''))throw Error('Only a valid MP3 under 15 MB is accepted.');
    return bytes;
  }
  async function transcribeBytes(bytes){
    await safeDirectory(workspaceRoot,voiceoverDirectory);
    const audioPath=path.join(voiceoverDirectory,'voiceover-'+crypto.randomUUID()+'.mp3');
    await fs.writeFile(audioPath,bytes,{flag:'wx'});
    try{return normalizeTranscript(await gpu.run(async()=>{await images.unloadImages();return transcribeVoiceover({path:audioPath,workspaceRoot});}));}
    finally{await fs.rm(audioPath,{force:true});}
  }
  async function planTranscript({transcript,title,creativeInstructions='',production=false,requireInstructions=false}){
    const timedTranscript=normalizeTranscript(transcript),direction=String(creativeInstructions||'').trim();
    if(direction.length>4000)throw Error('Creative instructions must be 4,000 characters or fewer.');
    if(requireInstructions&&!direction)throw Error('Add animation instructions before generating the scene plan.');
    if(requireInstructions&&Math.abs(timedTranscript.duration-timedTranscript.segments.at(-1).end)>.25)throw Error('The final transcript timestamp must agree with the MP3 duration within 0.25 seconds.');
    const catalog=await loadVoiceoverCatalog(root,{includeHistory:production===true});let draft,failure;
    for(let attempt=0;attempt<2;attempt++){
      try{const prompt=buildCreativePlanPrompt(timedTranscript,catalog,direction),intentions=await gpu.run(async()=>{await images.unloadImages();return structuredVoiceoverAsk(prompt,catalog.plannerPack?.schema);});draft=compileCreativePlan(timedTranscript,intentions,catalog,{production:production===true,creativeInstructions:direction});failure=null;break;}
      catch(error){failure=error;}
    }
    if(failure)throw Error('Map planning failed after 2 targeted attempts: '+failure.message);
    const analysis=assembleSceneDraft(timedTranscript,draft,catalog);
    return {status:analysis.valid?200:422,body:{analysis,creatorStudio:analysis.valid?toCreatorStudioImport(analysis,String(title||'AI voiceover draft').slice(0,200)):null,mapAnimations:analysis.valid?analysis.scenes.map(scene=>({sceneId:scene.id,voiceoverTimestamp:scene.voiceoverTimestamp,plan:scene.mapAnimation,missingInfo:scene.missingInfo.filter(item=>item.includes('geometry')||item.includes('placement'))})):[]}};
  }
  async function installedQwenModel(preferredModels = ['qwen3:4b-instruct', 'qwen3:4b']){
    const response=await fetchImpl('http://127.0.0.1:11434/api/tags',{signal:AbortSignal.timeout(3000),redirect:'error'});
    if(!response.ok)throw Error('Ollama did not report installed models.');
    const names=new Set((await response.json()).models?.map(model=>model.name));
    const model=preferredModels.find(name=>names.has(name));
    if(!model)throw Error('No installed Qwen3 4B model was found.');
    return model;
  }
  async function checkWhisper() {
    const response = await fetchImpl(new URL('/health', whisperEndpoint()), { signal: AbortSignal.timeout(3000), redirect: 'error' });
    if (!response.ok) throw Error('Local Whisper is offline.');
  }
  const structuredVoiceoverAsk=askVoiceoverJson|| (async (prompt,schema)=>{
    const model=await installedQwenModel();
    const response=await fetchImpl('http://127.0.0.1:11434/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({model,stream:false,think:false,format:schema||'json',options:{temperature:0},messages:[{role:'user',content:prompt}]}),signal:AbortSignal.timeout(120000),redirect:'error'});
    if(!response.ok)throw Error(`Ollama request failed (${response.status}).`);return JSON.parse((await response.json())?.message?.content||'{}');
  });
  async function projects() { try { if ((await fs.lstat(projectsFile)).isSymbolicLink()) throw Error('Project storage must not be a link.'); return JSON.parse(await fs.readFile(projectsFile, 'utf8')); } catch (error) { if (error.code === 'ENOENT') return []; throw error; } }
  async function updateProjects(operation) {
    const next = projectTail.then(async () => {
      if (!images.storage().available) throw Error(images.storage().error);
      await safeDirectory(workspaceRoot, images.directory);
      const rows = await projects(), result = await operation(rows), temporary = projectsFile + '.' + crypto.randomUUID() + '.tmp';
      await fs.writeFile(temporary, JSON.stringify(rows, null, 2), { flag: 'wx' }); await fs.rename(temporary, projectsFile); return result;
    }); projectTail = next.catch(() => {}); return next;
  }
  const repository = { createProject: args => updateProjects(rows => {
    const project = { id: 'local-' + crypto.randomUUID(), title: args.title, description: args.description, status: 'Not Started', currentStage: args.currentStage, steps: args.stages.map((title, index) => ({ id: 'stage-' + index, title, done: false })), assets: [], ownerUid, environment: 'isolated-local-ai-test', createdAt: new Date().toISOString() };
    rows.push(project); return project;
  }) };
  const api = createUniversalAgent({ workspaceRoot, workspaceOwner: (id, actor) => id === ownerUid && actor.uid === ownerUid,
    toolExecutor: (context, tool, args) => tool === 'generate_image' ? images.execute(context, args) : executeInvincibleTool(repository, tool, args) });
  function send(response, status, body, type = 'application/json') {
    response.writeHead(status, { 'content-type': type + (type.startsWith('text/') || type === 'application/json' ? '; charset=utf-8' : ''), 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer' });
    response.end(type === 'application/json' ? JSON.stringify(body) : body);
  }
  async function readBody(request, maxBytes = 12000) {
    const chunks = []; let size = 0;
    for await (const chunk of request) { size += chunk.length; if (size > maxBytes) throw Error('Request too large.'); chunks.push(chunk); }
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  }
  function strict(body, keys) { if (!body || Array.isArray(body) || typeof body !== 'object' || Object.keys(body).some(key => !keys.includes(key))) throw Error('Unexpected request fields.'); }
  function authenticate(request) {
    const candidate = Buffer.from(String(request.headers.authorization || '').replace(/^Bearer /, '')), expected = Buffer.from(token);
    if (candidate.length !== expected.length || !crypto.timingSafeEqual(candidate, expected)) throw Object.assign(Error('Connect this browser to your local worker.'), { code: 'UNAUTHENTICATED' });
    if (request.headers['x-invincible-account'] && request.headers['x-invincible-account'] !== ownerUid) throw Object.assign(Error('This worker is paired to another account.'), { code: 'WORKSPACE_FORBIDDEN' });
    return principal;
  }
  const view = job => { const { fingerprint, ownerUid: _owner, ...value } = job; return value; };
  const commandRequests = new Map();
  const server = http.createServer(async (request, response) => {
    try {
      if (request.headers.host !== new URL(origin).host) return send(response, 403, { error: 'Invalid local host.' });
      const from = request.headers.origin;
      if (from && from !== origin && from !== appOrigin) return send(response, 403, { error: 'Origin is not allowed.' });
      if (appOrigin && from === appOrigin) { response.setHeader('Access-Control-Allow-Origin', appOrigin); response.setHeader('Vary', 'Origin'); response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Invincible-Account'); response.setHeader('Access-Control-Allow-Methods', 'GET, POST'); response.setHeader('Access-Control-Allow-Private-Network', 'true'); }
      if (request.method === 'OPTIONS') return send(response, 204, '', 'text/plain');
      const url = new URL(request.url, origin);
      if (request.method === 'GET' && url.pathname === '/connect') {
        const destination = url.searchParams.get('origin'), nonce = url.searchParams.get('nonce'), uid = url.searchParams.get('uid');
        if (!appOrigin || destination !== appOrigin || uid !== ownerUid) return send(response, 403, { error: 'This worker is paired to a different Invincible account.' });
        if (!/^[A-Za-z0-9-]{16,80}$/.test(nonce || '') || (request.headers['sec-fetch-dest'] && request.headers['sec-fetch-dest'] !== 'document')) return send(response, 400, { error: 'Open this connection from Invincible.' });
        const scriptNonce = crypto.randomBytes(16).toString('base64');
        response.setHeader('Content-Security-Policy', `default-src 'none'; script-src 'nonce-${scriptNonce}'; style-src 'nonce-${scriptNonce}'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'`);
        return send(response, 200, `<!doctype html><meta name="viewport" content="width=device-width"><title>Connect Invincible</title><style nonce="${scriptNonce}">body{background:#07171d;color:#e7f5f5;font:16px/1.6 system-ui;padding:40px;max-width:500px;margin:auto}button{background:#8ce4e9;color:#052029;border:0;border-radius:10px;padding:14px;font:600 16px system-ui;cursor:pointer}</style><h1>Connect this laptop</h1><p>Allow your signed-in Invincible account to generate images on this laptop. ComfyUI stays private.</p><button id="connect">Connect Invincible</button><p id="status"></p><script nonce="${scriptNonce}">const message=${JSON.stringify({ type: 'invincible-local-pair', nonce, uid: ownerUid, token })};document.querySelector('#connect').onclick=()=>{if(!window.opener){document.querySelector('#status').textContent='Open Connect this laptop from Invincible.';return;}window.opener.postMessage(message,${JSON.stringify(appOrigin)});window.close();};</script>`, 'text/html');
      }
      if (url.pathname.startsWith('/api/')) {
        const actor = authenticate(request);
        if (request.method === 'GET' && url.pathname === '/api/session') return send(response, 200, { uid: ownerUid, workspaceId: ownerUid, storage: images.storage(), presets: IMAGE_PRESETS, capabilities: { draftPrompt: true, referenceImage: true } });
        if (request.method === 'GET' && url.pathname === '/api/service-status') {
          const [whisper, qwen, imagesReady] = await Promise.allSettled([checkWhisper(), installedQwenModel(['qwen3:4b']), images.checkConnection()]);
          return send(response, 200, {
            whisper: whisper.status === 'fulfilled',
            qwen: qwen.status === 'fulfilled',
            images: imagesReady.status === 'fulfilled' && imagesReady.value === true,
          });
        }
        if (request.method === 'GET' && url.pathname === '/api/projects') return send(response, 200, { projects: await projects() });
        if (request.method === 'GET' && url.pathname === '/api/voiceover/catalog-status') {
          const check=url.searchParams.get('check')==='production';
          const catalog=await loadVoiceoverCatalog(root,{includeHistory:check});
          if(check){
            try{await checkWhisper();}
            catch{throw Error('Local Whisper is offline. Start the laptop voiceover service before generating narration.');}
            try{await installedQwenModel();}catch{throw Error('Start Ollama with your installed Qwen3 4B model before generating narration.');}
          }
          return send(response,200,{automaticContext:true,verifiedLocations:Array.isArray(catalog.verifiedLocations)?catalog.verifiedLocations.length:0,verifiedRoutes:Array.isArray(catalog.verifiedRoutes)?catalog.verifiedRoutes.filter(route=>route.reviewed===true).length:0});
        }
        if (request.method === 'POST' && url.pathname === '/api/voiceover/analyze') {
          const body=await readBody(request,22*1024*1024);strict(body,['audioBase64','title','creativeInstructions','production']);
          if(body.production!==undefined&&typeof body.production!=='boolean')throw Error('Production must be a boolean.');
          const transcript=await transcribeBytes(voiceoverAudio(body));
          const result=await planTranscript({...body,transcript});
          return send(response,result.status,result.body);
        }
        if(request.method==='POST'&&url.pathname==='/api/voiceover/transcribe'){
          const body=await readBody(request,22*1024*1024);strict(body,['audioBase64']);
          return send(response,200,{transcript:await transcribeBytes(voiceoverAudio(body))});
        }
        if(request.method==='POST'&&url.pathname==='/api/voiceover/plan'){
          const body=await readBody(request,1_200_000);strict(body,['transcript','title','creativeInstructions','production']);
          if(body.production!==undefined&&typeof body.production!=='boolean')throw Error('Production must be a boolean.');
          const result=await planTranscript({...body,requireInstructions:true});
          return send(response,result.status,result.body);
        }
        if (request.method === 'POST' && url.pathname === '/api/projects') {
          const body = await readBody(request); strict(body, ['title','idempotencyKey']);
          const result = await api.execute({ principal: actor, workspaceId: ownerUid, tool: 'create_project', idempotencyKey: body.idempotencyKey, arguments: { title: body.title, description: 'Isolated local image-generation test', stages: ['Images'], current_stage: 'Images' } });
          return send(response, 200, { project: result.result.result, verified: result.verified });
        }
        if (request.method === 'POST' && url.pathname === '/api/image-prompt') {
          const body = await readBody(request);
          strict(body, ['idea']);
          const idea = imagePromptText(body.idea);
          const signal = AbortSignal.timeout(90000);
          const prompt = await gpu.run(async () => {
            signal.throwIfAborted();
            await images.unloadImages();
            try { return await draftImagePrompt({ idea, fetchImpl, signal }); }
            finally { await images.releaseQwen(); }
          });
          return send(response, 200, { prompt });
        }
        if (request.method === 'POST' && url.pathname === '/api/generations') {
          const body = await readBody(request, 1_512_000); strict(body, ['arguments', 'idempotencyKey', 'referencePng']);
          const job = await images.submit(api, actor, body.idempotencyKey, imageSchema.parse(body.arguments), body.referencePng);
          return send(response, 202, { job: view(job), verified: false });
        }
        const jobRoute = url.pathname.match(/^\/api\/generations\/(agent_[a-f0-9]{32})(\/image)?$/);
        if (request.method === 'GET' && jobRoute) {
          const job = images.get(jobRoute[1], actor.uid);
          if (!jobRoute[2]) return send(response, 200, { job: view(job), verified: job.verified === true && job.status === 'completed' });
          const bytes = await images.readImage(job.id, actor.uid);
          if (url.searchParams.get('download') === '1') response.setHeader('Content-Disposition', `attachment; filename="invincible-${job.id}.png"`);
          return send(response, 200, bytes, 'image/png');
        }
        const attachment = url.pathname.match(/^\/api\/projects\/(local-[a-f0-9-]{36})\/assets$/);
        if (request.method === 'POST' && attachment) {
          const body = await readBody(request); strict(body, ['generationId']); const job = images.get(body.generationId, actor.uid);
          await images.readImage(job.id, actor.uid);
          const project = await updateProjects(rows => {
            const project = rows.find(row => row.id === attachment[1] && row.ownerUid === actor.uid); if (!project) throw Object.assign(Error('Project not found or not owned by this account.'), { code: 'WORKSPACE_FORBIDDEN' });
            const id = 'cloud-' + job.image.sha256;
            if (!project.assets.some(asset => asset.id === id)) project.assets.push({ id, fileId: id, generationId: job.id, name: 'Generated image.png', kind: 'image', ...job.image });
            return project;
          });
          return send(response, 200, { project, attached: true });
        }
        if (request.method === 'POST' && url.pathname === '/api/command') {
          const body = await readBody(request); strict(body, ['message','idempotencyKey','conversationId']);
          const message = String(body.message || '').trim(), key = String(body.idempotencyKey || '');
          if (!message || message.length > 4000 || !/^[A-Za-z0-9._:-]{8,160}$/.test(key)) throw Error('Message and request key are required.');
          const old = commandRequests.get(key); if (old) { if (old.message !== message) throw Object.assign(Error('This request key was already used.'), { code: 'IDEMPOTENCY_CONFLICT' }); return send(response, 200, await old.promise); }
          const operation = (async () => {
            const intent = detectLocalIntent(message);
            if (intent.reason === 'greeting') return { command: { kind: 'chat' }, text: 'Hello! What are we working on?', verified: false };
            const command = await gpu.run(async () => {
              await images.unloadImages();
              const candidate = await ask({ message, model: 'qwen3:4b', fetchImpl, signal: AbortSignal.timeout(90000) });
              if (candidate.tool === 'generate_image') await images.releaseQwen();
              return candidate;
            });
            if (command.kind === 'chat') return { command: { kind: 'chat' }, text: String(command.text || '').slice(0, 4000), verified: false };
            if (command.tool === 'generate_image') return { command, job: view(await images.submit(api, actor, key, command.arguments)), verified: false };
            const result = await api.execute({ principal: actor, workspaceId: ownerUid, idempotencyKey: key, tool: command.tool, arguments: command.arguments });
            return { command, result, verified: result.verified === true };
          })();
          commandRequests.set(key, { message, promise: operation });
          return send(response, 200, await operation);
        }
        return send(response, 404, { error: 'Not found.', verified: false });
      }
      if (request.method !== 'GET') return send(response, 405, { error: 'Method not allowed.' });
      const requested = url.pathname === '/' ? '/local-ai/chat.html' : url.pathname.replace(/^\/invincible\//, '/');
      const decoded = decodeURIComponent(requested);
      if (!/^\/(local-ai\/(chat\.html|image-client\.js)|creator\/|shared\/|assets\/|react-dist\/|site-nav\.(js|css))/.test(decoded) || decoded.split(/[\\/]/).some(part => part === '..' || part.startsWith('.'))) return send(response, 404, { error: 'Not found.' });
      const location = path.resolve(root, '.' + decoded), real = await fs.realpath(location);
      if (!real.startsWith(root + path.sep)) return send(response, 403, { error: 'Invalid static path.' });
      return send(response, 200, await fs.readFile(real), TYPES[path.extname(real)] || 'application/octet-stream');
    } catch (error) {
      const code = error.code || 'REQUEST_FAILED', status = code === 'UNAUTHENTICATED' ? 401 : code === 'WORKSPACE_FORBIDDEN' ? 403 : code === 'NOT_FOUND' ? 404 : code === 'IDEMPOTENCY_CONFLICT' ? 409 : code === 'WORKSPACE_PERMISSION_DENIED' || ['EPERM','EACCES'].includes(code) ? 503 : 400;
      send(response, status, { error: error.message, code, verified: false });
    }
  });
  return { server, api, images, origin, token, ownerUid, async listen() { await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); }); }, async close() { await images.shutdown(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); } };
}
