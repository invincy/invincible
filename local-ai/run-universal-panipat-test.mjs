import { askOllama } from './invincible-local-controller.mjs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { createUniversalAgent } = require('../functions/src/local-ai/universal-agent-api.js');
const { executeInvincibleTool } = require('../functions/src/tools/invincible-tools.js');

const created = [];
const repository = { createProject: async args => { const project = { id: 'panipat-universal-test', title: args.title, steps: args.stages.map((title, index) => ({ id: String(index), title })) }; created.push(project); return project; } };
const api = createUniversalAgent({ workspaceRoot: 'E:\\Invincible\\AgentWorkspace', workspaceOwner: (workspaceId, principal) => workspaceId === principal.uid, toolExecutor: (_context, tool, args) => executeInvincibleTool(repository, tool, args) });
const command = await askOllama({ message: 'Invincible, create a new Panipat project.' });
const result = await api.execute({ principal: { uid: 'user_1', workspaceIds: ['user_1'] }, workspaceId: 'user_1', idempotencyKey: 'qwen-panipat-universal-001', tool: command.tool, arguments: command.arguments });
if (!result.verified || created[0]?.title !== 'Panipat') throw new Error('Universal Panipat verification failed.');
console.log(JSON.stringify({ command, result, createdProject: created[0], logs: api.logs }, null, 2));
