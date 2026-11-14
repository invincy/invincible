import { setTimeout as pause } from 'node:timers/promises';
import { IMAGE_PROMPT_TASK_PREFIX } from '../shared/image-prompt-task.mjs';

const functionsOrigin = process.env.INVINCIBLE_FIREBASE_FUNCTIONS_ORIGIN || 'https://asia-south1-life-by-adichimp.cloudfunctions.net';
const token = String(process.env.INVINCIBLE_FIREBASE_AGENT_TOKEN || '').trim();
const workerToken = String(process.env.INVINCIBLE_IMAGE_WORKER_TOKEN || '').trim();
const localAgentOrigin = new URL(process.env.INVINCIBLE_LOCAL_AGENT_ORIGIN || 'http://127.0.0.1:8788');
const pollMs = Math.max(2000, Number(process.env.INVINCIBLE_AGENT_POLL_MS || 5000));
const CREATOR_TIMING_TASK_PREFIX='invincible:creator-timing:v1:';
if (!token || !workerToken) throw new Error('Start Invincible AI to load the saved laptop connection.');
if (localAgentOrigin.protocol !== 'http:' || localAgentOrigin.hostname !== '127.0.0.1') {
  throw new Error('The Invincible worker must use IPv4 loopback.');
}

async function call(name, data = {}) {
  const response = await fetch(`${functionsOrigin}/${name}`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ data: { ...data, agentToken: token } }),
    signal: AbortSignal.timeout(12000), redirect: 'error',
  });
  const payload = await response.json();
  if (!response.ok || payload.error) throw new Error(payload.error?.message || `Firebase bridge call failed: ${name}`);
  if (Object.prototype.hasOwnProperty.call(payload, 'data')) return payload.data;
  if (Object.prototype.hasOwnProperty.call(payload, 'result')) return payload.result;
  return payload;
}

async function local(path, uid, body,timeoutMs=body?100000:3000) {
  const response = await fetch(new URL(path, localAgentOrigin), {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: 'Bearer ' + workerToken, 'X-Invincible-Account': uid, 'Content-Type': 'application/json' },
    body: body && JSON.stringify(body), redirect: 'error',
    signal: AbortSignal.timeout(timeoutMs),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Local agent rejected the task.');
  return payload;
}

async function execute(task, uid) {
  if (task.ownerUid !== uid || task.workspaceId !== uid) throw new Error('This task belongs to another workspace.');
  if (task.command.startsWith(IMAGE_PROMPT_TASK_PREFIX)) {
    const idea = task.command.slice(IMAGE_PROMPT_TASK_PREFIX.length).trim();
    if (!idea || idea.length > 1500) throw new Error('Enter an idea up to 1,500 characters.');
    const { prompt } = await local('/api/image-prompt', uid, { idea });
    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 1500) throw new Error('Qwen returned an invalid prompt.');
    return { prompt };
  }
  if(task.command.startsWith(CREATOR_TIMING_TASK_PREFIX)){
    const job=JSON.parse(task.command.slice(CREATOR_TIMING_TASK_PREFIX.length)),url=new URL(job.audioUrl);
    if(url.protocol!=='https:'||!url.hostname.endsWith('googleapis.com')||!/^cloud-[a-f0-9]{64}$/.test(job.audioAssetId)||!/^[A-Za-z0-9_-]{1,100}$/.test(job.projectId))throw new Error('Creator timing task is invalid.');
    const response=await fetch(url,{signal:AbortSignal.timeout(60000),redirect:'error'});if(!response.ok)throw new Error('The private voiceover download expired. Retry the timing job.');const bytes=new Uint8Array(await response.arrayBuffer());if(!bytes.length||bytes.length>15*1024*1024)throw new Error('The private voiceover is empty or too large.');
    const timed=await local('/api/voiceover/transcribe',uid,{audioBase64:Buffer.from(bytes).toString('base64')},200000);if(!timed.transcript?.segments?.length)throw new Error('Local Whisper returned no timing segments.');
    return{kind:'creator-voiceover-timing',projectId:job.projectId,audioAssetId:job.audioAssetId,transcript:timed.transcript,verified:true};
  }
  const payload = await local('/api/command', uid, { message: task.command, idempotencyKey: task.id });
  if (payload.job) return { text: 'Open Images to track image generation.', actions: [], verified: false };
  const action = payload.result?.result?.action;
  if (action && (!payload.verified || action.status !== 'completed')) throw new Error('Local action did not complete.');
  const text = payload.text || payload.result?.result?.text || action?.summary;
  if (!text) throw new Error('The local agent returned no reply.');
  return { text, actions: action ? [action] : [], verified: payload.verified === true };
}

let lastError;
while (true) {
  try {
    const { uid } = await call('getInvincibleAgentStatus');
    if (!uid) throw new Error('The saved laptop connection could not be authenticated.');
    const session = await local('/api/session', uid);
    if (session.uid !== uid || !session.storage?.available) throw new Error('The laptop workspace does not match the signed-in account.');
    const task = await call('claimInvincibleAiTask');
    if (lastError !== null) console.log('Invincible mobile Qwen relay is ready.');
    lastError = null;
    if (task?.id) {
      let result;
      try { result = await execute(task, uid); }
      catch (error) { await call('failInvincibleAiTask', { taskId: task.id, error: error.message }); }
      if (result) {
        await call('completeInvincibleAiTask', { taskId: task.id, result });
        console.log(`[bridge] completed ${task.id}`);
      }
    }
  } catch (error) {
    if (lastError !== error.message) console.error(`[bridge] ${error.message}`);
    lastError = error.message;
  }
  await pause(pollMs);
}
