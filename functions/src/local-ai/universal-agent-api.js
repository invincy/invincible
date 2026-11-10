const crypto = require('node:crypto');
const path = require('node:path');
const { definitions, executeInvincibleTool, schemas } = require('../tools/invincible-tools');

const REGISTERED_TOOLS = Object.freeze({
  create_project: Object.freeze({
    definition: definitions.find(tool => tool.name === 'create_project'),
    schema: schemas.create_project,
    permission: 'create',
    requiresApproval: false,
  }),
});

const PROTECTED_ROOTS = Object.freeze([
  'C:\\Users',
  'C:\\Windows',
  'C:\\Program Files',
  'C:\\Program Files (x86)',
  'E:\\Projects\\Invincible\\invincible',
  'E:\\Development\\Worktrees',
]);

function normalizePath(value) { return path.resolve(String(value)).replace(/[\\/]+$/, '').toLowerCase(); }
function isWithin(child, parent) { const c = normalizePath(child), p = normalizePath(parent); return c === p || c.startsWith(`${p}${path.sep}`); }
function assertSafeWorkspacePath(targetPath, workspaceRoot, protectedRoots = PROTECTED_ROOTS) {
  const target = normalizePath(targetPath), root = normalizePath(workspaceRoot);
  if (target === root || !target.startsWith(`${root}${path.sep}`)) throw new AgentError('PATH_OUTSIDE_WORKSPACE', 'Path must remain inside the dedicated agent workspace.');
  if (protectedRoots.some(protectedRoot => isWithin(target, protectedRoot))) throw new AgentError('PROTECTED_PATH', 'Path targets a protected system, personal, repository or worktree location.');
  return path.resolve(targetPath);
}

class AgentError extends Error {
  constructor(code, message, details = {}) { super(message); this.name = 'AgentError'; this.code = code; this.details = details; }
}

function taskIdFor(uid, workspaceId, idempotencyKey) { return `agent_${crypto.createHash('sha256').update(`${uid}:${workspaceId}:${idempotencyKey}`).digest('hex').slice(0, 32)}`; }
function cleanId(value, label) { const text = String(value || '').trim(); if (!/^[A-Za-z0-9._:-]{3,160}$/.test(text)) throw new AgentError('INVALID_IDENTIFIER', `${label} is invalid.`); return text; }
function cleanUid(value) { const text = String(value || '').trim(); if (!text) throw new AgentError('UNAUTHENTICATED', 'An authenticated user is required.'); return text; }

function createUniversalAgent({ workspaceRoot = 'E:\\Invincible\\AgentWorkspace', workspaceOwner, toolExecutor = executeInvincibleTool, protectedRoots = PROTECTED_ROOTS, timeoutMs = 120000, logStore = [] } = {}) {
  const completed = new Map();
  const ownerFor = workspaceOwner || ((workspaceId, principal) => workspaceId === principal.uid);
  const logs = logStore;
  const record = entry => { logs.push({ atMs: Date.now(), ...entry }); return logs.at(-1); };
  const authorize = (principal, workspaceId, toolName) => {
    const uid = cleanUid(principal?.uid), workspace = cleanId(workspaceId, 'Workspace ID'), registration = REGISTERED_TOOLS[toolName];
    if (!registration) throw new AgentError('TOOL_NOT_REGISTERED', `Tool is not registered: ${toolName}`);
    if (!ownerFor(workspace, { ...principal, uid })) throw new AgentError('WORKSPACE_FORBIDDEN', 'The authenticated user does not own this workspace.');
    if (principal.workspaceIds && !principal.workspaceIds.includes(workspace)) throw new AgentError('WORKSPACE_FORBIDDEN', 'The authenticated user is not a member of this workspace.');
    return { uid, workspace, registration };
  };
  async function execute({ principal, workspaceId, idempotencyKey, tool, arguments: rawArguments, approval = false, signal, timeout = timeoutMs }) {
    const auth = authorize(principal, workspaceId, tool), key = cleanId(idempotencyKey, 'Idempotency key'), taskId = taskIdFor(auth.uid, auth.workspace, key);
    if (completed.has(taskId)) return { ...completed.get(taskId), deduplicated: true };
    if (auth.registration.requiresApproval && !approval) throw new AgentError('APPROVAL_REQUIRED', 'This action requires explicit user approval.');
    let args;
    try { args = auth.registration.schema.parse(rawArguments); } catch (error) { throw new AgentError('INVALID_ARGUMENTS', error.message); }
    if (signal?.aborted) throw new AgentError('CANCELLED', 'Execution was cancelled before starting.');
    record({ taskId, uid: auth.uid, workspaceId: auth.workspace, tool, status: 'started' });
    const operation = Promise.resolve().then(() => toolExecutor({ uid: auth.uid, workspaceId: auth.workspace }, tool, args));
    const cancellation = signal ? new Promise((_, reject) => signal.addEventListener('abort', () => reject(new AgentError('CANCELLED', 'Execution was cancelled.')), { once: true })) : null;
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => { timeoutId = setTimeout(() => reject(new AgentError('TIMEOUT', 'Execution exceeded its time limit.')), Math.max(1, Number(timeout))); });
    try {
      const result = await Promise.race([operation, timeoutPromise, cancellation].filter(Boolean));
      const output = { taskId, status: 'completed', tool, result, verified: result?.action?.status === 'completed' };
      completed.set(taskId, output); record({ taskId, uid: auth.uid, workspaceId: auth.workspace, tool, status: 'completed' }); return output;
    } catch (error) {
      const structured = error instanceof AgentError ? error : new AgentError('EXECUTION_FAILED', error.message || 'Execution failed.');
      record({ taskId, uid: auth.uid, workspaceId: auth.workspace, tool, status: 'failed', errorCode: structured.code });
      throw structured;
    } finally { clearTimeout(timeoutId); }
  }
  return Object.freeze({ execute, authorize, logs, workspaceRoot, protectedRoots, registeredTools: REGISTERED_TOOLS, assertSafePath: target => assertSafeWorkspacePath(target, workspaceRoot, protectedRoots) });
}

module.exports = { AgentError, PROTECTED_ROOTS, REGISTERED_TOOLS, assertSafeWorkspacePath, createUniversalAgent, isWithin, taskIdFor };
