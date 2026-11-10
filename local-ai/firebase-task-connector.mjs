import process from 'node:process';

const functionsOrigin = process.env.INVINCIBLE_FIREBASE_FUNCTIONS_ORIGIN || 'https://asia-south1-life-by-adichimp.cloudfunctions.net';
const token = String(process.env.INVINCIBLE_FIREBASE_AGENT_TOKEN || '').trim();
const localAgentOrigin = process.env.INVINCIBLE_LOCAL_AGENT_ORIGIN || 'http://127.0.0.1:8787';
const pollMs = Math.max(2000, Number(process.env.INVINCIBLE_AGENT_POLL_MS || 5000));
if (!token) throw new Error('Set INVINCIBLE_FIREBASE_AGENT_TOKEN before starting the connector.');

async function call(name, data = {}) {
  const response = await fetch(`${functionsOrigin}/${name}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ data: { ...data, agentToken: token } }) });
  const payload = await response.json();
  if (!response.ok || payload.error) throw new Error(payload.error?.message || `Firebase bridge call failed: ${name}`);
  return payload.data;
}

async function execute(task) {
  const response = await fetch(`${localAgentOrigin}/api/command`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: task.command, idempotencyKey: task.id }), signal: AbortSignal.timeout(120000) });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Local agent rejected the task.');
  const action = payload.result?.result?.action;
  const text = payload.result?.result?.text;
  return { text: text || action?.summary || 'Local action completed.', actions: action ? [action] : [], verified: payload.verified === true };
}

async function poll() {
  try {
    const task = await call('claimInvincibleAiTask');
    if (!task) return;
    console.log(`[bridge] claimed ${task.id}: ${task.command}`);
    try {
      console.log(`[bridge] executing ${task.id} through local agent`);
      const result = await execute(task);
      await call('completeInvincibleAiTask', { taskId: task.id, result });
      console.log(`[bridge] completed ${task.id} (verified=${result.verified === true})`);
    } catch (error) {
      console.error(`[bridge] execution failed ${task.id}: ${error.message}`);
      await call('failInvincibleAiTask', { taskId: task.id, error: error.message });
    }
  } catch (error) { console.error(`[bridge] ${error.message}`); }
}

console.log(`Invincible Firebase connector polling every ${pollMs}ms; local agent ${localAgentOrigin}`);
setInterval(poll, pollMs);
poll();
