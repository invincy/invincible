import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { askOllama } from './invincible-local-controller.mjs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { createUniversalAgent } = require('../functions/src/local-ai/universal-agent-api.js');
const { executeInvincibleTool } = require('../functions/src/tools/invincible-tools.js');

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(root, '.test-data');
const projectsPath = path.join(dataDir, 'projects.json');
const port = Number(process.env.INVINCIBLE_LOCAL_AI_PORT || 8787);
const host = '127.0.0.1';
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
  response.writeHead(status, { 'content-type': `${type}; charset=utf-8`, 'cache-control': 'no-store' });
  response.end(type === 'application/json' ? JSON.stringify(body) : body);
}

async function readBody(request) {
  let body = ''; for await (const chunk of request) body += chunk;
  if (body.length > 12000) throw new Error('Request too large.');
  return JSON.parse(body || '{}');
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${host}:${port}`);
    if (request.method === 'GET' && url.pathname === '/api/projects') return send(response, 200, { projects: await readProjects() });
    if (request.method === 'POST' && url.pathname === '/api/command') {
      const body = await readBody(request);
      const message = String(body.message || '').trim();
      if (!message || message.length > 4000) return send(response, 400, { error: 'Message must be between 1 and 4,000 characters.' });
      const command = await askOllama({ message, model: 'qwen3:4b' });
      if (command?.kind === 'chat') return send(response, 200, { command, result: { result: { text: String(command.text || '').slice(0, 4000) } }, verified: true });
      const idempotencyKey = String(body.idempotencyKey || `browser-${crypto.createHash('sha256').update(message).digest('hex').slice(0, 24)}`);
      const result = await universalAgent.execute({ principal: { uid: 'local-test-user', workspaceIds: ['local-test-user'] }, workspaceId: 'local-test-user', idempotencyKey, tool: command.tool, arguments: command.arguments });
      return send(response, 200, { command, result, verified: result.verified });
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
