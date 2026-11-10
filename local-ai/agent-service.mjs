import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { askOllama, detectLocalIntent } from './invincible-local-controller.mjs';
import { assembleSceneDraft, buildQwenPrompt, loadCreatorAssetCatalog, toCreatorStudioImport, transcribeWithWhisper } from './voiceover-analysis.mjs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { createUniversalAgent } = require('../functions/src/local-ai/universal-agent-api.js');
const { executeInvincibleTool } = require('../functions/src/tools/invincible-tools.js');

const root = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(root, '..');
const dataDir = path.join(root, '.test-data');
const projectsPath = path.join(dataDir, 'projects.json');
const port = Number(process.env.INVINCIBLE_LOCAL_AI_PORT || 8787);
const host = '127.0.0.1';
const workspaceRoot = 'E:\\Invincible\\AgentWorkspace';
async function readProjects() {
  try { return JSON.parse(await fs.readFile(projectsPath, 'utf8')); } catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}

const repository = {
  async createProject(args) {
    const projects = await readProjects();
    const project = {
      id: `local-${Date.now().toString(36)}`,
      title: args.title,
      description: args.description,
      status: 'Not Started',
      currentStage: args.currentStage,
      steps: args.stages.map((title, index) => ({ id: `stage-${index + 1}`, title, done: false })),
      environment: 'isolated-local-ai-test',
      createdAt: new Date().toISOString(),
    };
    projects.push(project);
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(projectsPath, `${JSON.stringify(projects, null, 2)}\n`, 'utf8');
    return project;
  },
};
const universalAgent = createUniversalAgent({
  workspaceRoot: 'E:\\Invincible\\AgentWorkspace',
  workspaceOwner: (workspaceId, principal) => workspaceId === principal.uid,
  toolExecutor: (_context, tool, args) => executeInvincibleTool(repository, tool, args),
});

function send(response, status, body, type = 'application/json') {
  response.writeHead(status, { 'content-type': `${type}; charset=utf-8`, 'cache-control': 'no-store', 'access-control-allow-origin': 'https://invincy.github.io', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type' });
  response.end(type === 'application/json' ? JSON.stringify(body) : body);
}

async function readBody(request, maxBytes = 12000) {
  let body = '', bytes = 0; for await (const chunk of request) { bytes += chunk.length; if (bytes > maxBytes) throw new Error('Request too large.'); body += chunk; }
  return JSON.parse(body || '{}');
}

async function planVoiceover(prompt) {
  const response = await fetch('http://127.0.0.1:11434/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model: 'qwen3:4b-instruct', stream: false, think: false, format: 'json', options: { temperature: 0 }, messages: [{ role: 'user', content: `${prompt}\nCreate one scene for every transcript segment, in order. Return JSON only.` }] }) });
  if (!response.ok) throw new Error(`Ollama request failed (${response.status}).`);
  const payload = await response.json();
  return JSON.parse(payload?.message?.content || '{}');
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${host}:${port}`);
    if (request.method === 'OPTIONS') return send(response, 204, '');
    if (request.headers.origin && request.headers.origin !== 'https://invincy.github.io' && !/^https?:\/\/localhost(?::\d+)?$/i.test(request.headers.origin)) return send(response, 403, { error: 'Browser origin is not allowed.' });
    if (request.method === 'GET' && url.pathname === '/api/projects') return send(response, 200, { projects: await readProjects() });
    if (request.method === 'POST' && url.pathname === '/api/command') {
      const body = await readBody(request);
      const message = String(body.message || '').trim();
      if (!message || message.length > 4000) return send(response, 400, { error: 'Message must be between 1 and 4,000 characters.' });
      const intent = detectLocalIntent(message);
      if (intent.mode === 'chat' && /^(hi|hello|hey|good morning|good afternoon|good evening)\b[!.? ]*$/i.test(message)) return send(response, 200, { command: { kind: 'chat', text: 'Hello! What are we working on?' }, result: { result: { text: 'Hello! What are we working on?' } }, verified: true, intent });
      if (intent.mode === 'creator') return send(response, 200, { command: { kind: 'chat', text: 'Creator and media export tools are not enabled yet.' }, result: { result: { text: 'Creator and media export tools are not enabled yet.' } }, verified: true, intent, unsupported: true });
      const command = await askOllama({ message, model: 'qwen3:4b' });
      if (command?.kind === 'chat') return send(response, 200, { command, result: { result: { text: String(command.text || '').slice(0, 4000) } }, verified: true });
      const idempotencyKey = String(body.idempotencyKey || `browser-${crypto.createHash('sha256').update(message).digest('hex').slice(0, 24)}`);
      const result = await universalAgent.execute({ principal: { uid: 'local-test-user', workspaceIds: ['local-test-user'] }, workspaceId: 'local-test-user', idempotencyKey, tool: command.tool, arguments: command.arguments });
      return send(response, 200, { command, result, verified: result.verified });
    }
    if (request.method === 'POST' && url.pathname === '/api/voiceover/analyze') {
      const body = await readBody(request, 22 * 1024 * 1024);
      const audioBase64 = String(body.audioBase64 || '').replace(/^data:audio\/[^;]+;base64,/i, '');
      if (!audioBase64 || audioBase64.length > 20 * 1024 * 1024) return send(response, 400, { error: 'Audio must be a non-empty MP3 under 15 MB.' });
      const bytes = Buffer.from(audioBase64, 'base64');
      const mp3Header = bytes.subarray(0, 3).toString() === 'ID3' || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
      if (!bytes.length || bytes.length > 15 * 1024 * 1024 || !mp3Header) return send(response, 400, { error: 'Only a valid MP3 upload under 15 MB is accepted.' });
      const uploadDir = path.join(workspaceRoot, 'voiceover-analysis');
      const audioPath = path.join(uploadDir, `voiceover-${crypto.randomUUID()}.mp3`);
      await fs.mkdir(uploadDir, { recursive: true }); await fs.writeFile(audioPath, bytes, { flag: 'wx' });
      try {
        const transcript = await transcribeWithWhisper({ path: audioPath });
        const catalog = await loadCreatorAssetCatalog(repoRoot);
        const draft = await planVoiceover(buildQwenPrompt(transcript, catalog, String(body.creativeInstructions || '')));
        const analysis = assembleSceneDraft(transcript, draft, catalog);
        return send(response, analysis.valid ? 200 : 422, { analysis, creatorStudio: analysis.valid ? toCreatorStudioImport(analysis, String(body.title || 'AI voiceover draft')) : null });
      } finally { await fs.rm(audioPath, { force: true }); }
    }
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      return send(response, 200, await fs.readFile(path.join(root, 'chat.html'), 'utf8'), 'text/html');
    }
    return send(response, 404, { error: 'Not found.' });
  } catch (error) { return send(response, 400, { error: error.message }); }
});

server.listen(port, host, () => console.log(`Invincible Local AI: http://${host}:${port}`));

process.on('SIGINT', () => server.close(() => process.exit(0)));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
