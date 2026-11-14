const { getFirestore } = require('firebase-admin/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { claimNextTask, completeTask, createAgentPairing, enqueueTask, failTask, expireLeases, resolveAgentToken } = require('./task-bridge');

const db = getFirestore();
const CREATOR_TIMING_TASK_PREFIX = 'invincible:creator-timing:v1:';
function requireAuth(request) { if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Sign in to Invincible first.'); return request.auth.uid; }
function bridgeError(error) { if (error instanceof HttpsError) return error; return new HttpsError('failed-precondition', error.message || 'Local AI task bridge rejected the request.'); }
async function requireAgent(request) {
  if (request.auth?.uid) return { uid: request.auth.uid, agentId: String(request.data?.agentId || '').trim() };
  return resolveAgentToken({ db, token: request.data?.agentToken });
}

exports.createInvincibleAgentPairing = onCall({ region: 'asia-south1' }, async request => {
  const uid = requireAuth(request), agentId = String(request.data?.agentId || '').trim();
  try { return await createAgentPairing({ db, uid, agentId }); } catch (error) { throw bridgeError(error); }
});
exports.getInvincibleAgentStatus = onCall({ region: 'asia-south1' }, async request => {
  try { return await resolveAgentToken({ db, token: request.data?.agentToken }); } catch (error) { throw bridgeError(error); }
});

exports.enqueueInvincibleAiTask = onCall({ region: 'asia-south1' }, async request => {
  const uid = requireAuth(request), data = request.data || {};
  try { return await enqueueTask({ db, uid, workspaceId: data.workspaceId || uid, command: data.command, idempotencyKey: data.idempotencyKey }); } catch (error) { throw bridgeError(error); }
});

exports.claimInvincibleAiTask = onCall({ region: 'asia-south1' }, async request => {
  try { const agent = await requireAgent(request); return await claimNextTask({ db, uid: agent.uid, agentId: agent.agentId }); } catch (error) { throw bridgeError(error); }
});

exports.completeInvincibleAiTask = onCall({ region: 'asia-south1' }, async request => {
  const data = request.data || {};
  try {
    const agent = await requireAgent(request),taskSnap=await db.collection('users').doc(agent.uid).collection('aiTasks').doc(String(data.taskId||'')).get(),task=taskSnap.data();
    if(String(task?.command||'').startsWith(CREATOR_TIMING_TASK_PREFIX))await saveCreatorTiming(agent.uid,{...task,id:taskSnap.id},data.result);
    return await completeTask({ db, uid: agent.uid, taskId: data.taskId, agentId: agent.agentId, result: data.result });
  } catch (error) { throw bridgeError(error); }
});

async function saveCreatorTiming(uid,task,result){
 const command=JSON.parse(String(task.command).slice(CREATOR_TIMING_TASK_PREFIX.length)),transcript=result?.transcript,segments=Array.isArray(transcript?.segments)?transcript.segments.slice(0,100):[];
 if(!/^[A-Za-z0-9_-]{1,100}$/.test(command.projectId)||!/^cloud-[a-f0-9]{64}$/.test(command.audioAssetId)||!segments.length)throw Error('Local Whisper returned an invalid Creator timing result.');
 let previous=0;const clean=segments.map((segment,index)=>{const start=Number(segment.start),end=Number(segment.end),text=String(segment.text||'').trim().slice(0,4000);if(!Number.isFinite(start)||!Number.isFinite(end)||start<previous||end<=start||!text)throw Error(`Local Whisper segment ${index+1} is invalid.`);previous=end;return{id:String(segment.id||`segment-${index+1}`).slice(0,100),start,end,text};});
 const duration=Number(transcript.duration)||previous;if(Math.abs(duration-previous)>.75)throw Error('Local Whisper duration does not match its final timestamp.');const ref=db.collection('creatorProjects').doc(command.projectId);
 await db.runTransaction(async tx=>{const snap=await tx.get(ref),project=snap.data();if(!project||project.ownerUid!==uid)throw Error('Creator project is unavailable to this laptop account.');if(project.scriptWorkspace?.audio?.cloudAssetId!==command.audioAssetId)throw Error('The project voiceover changed while timing was running.');if(project.scriptWorkspace?.timingTaskId===task.id)return;const revision=Number.isInteger(project.writeRevision)?project.writeRevision:0,workspace={...(project.scriptWorkspace||{}),transcript:{language:String(transcript.language||'').slice(0,40),duration,text:String(transcript.text||clean.map(item=>item.text).join(' ')).slice(0,30000),segments:clean},timingProvider:'local-whisper',timingTaskId:task.id,updatedAtMs:Date.now()};tx.update(ref,{scriptWorkspace:workspace,writeRevision:revision+1,writtenBy:uid,writtenAt:new Date(),updatedAt:new Date()});});
}

exports.failInvincibleAiTask = onCall({ region: 'asia-south1' }, async request => {
  const data = request.data || {};
  try { const agent = await requireAgent(request); return await failTask({ db, uid: agent.uid, taskId: data.taskId, agentId: agent.agentId, error: data.error }); } catch (error) { throw bridgeError(error); }
});

exports.recoverInvincibleAiTasks = onCall({ region: 'asia-south1' }, async request => {
  const uid = requireAuth(request);
  try { return { recovered: await expireLeases({ db, uid }) }; } catch (error) { throw bridgeError(error); }
});
