const {onCall,onRequest,HttpsError}=require('firebase-functions/v2/https');
const {getFirestore,Timestamp}=require('firebase-admin/firestore');
const {getStorage}=require('firebase-admin/storage');
const {defineString}=require('firebase-functions/params');
const crypto=require('node:crypto');
const {McpServer}=require('@modelcontextprotocol/sdk/server/mcp.js');
const {StreamableHTTPServerTransport}=require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const z=require('zod/v4');
const {assertAccess}=require('./access');
const {plannerPack}=require('./semantic-plan');
const {buildPlan,projectCatalog}=require('./openai-video-callables');
const oauth=require('./plugin-oauth');
const {enqueueTask}=require('../local-ai/task-bridge');

const REGION='asia-south1';
const creatorStorageBucket=defineString('CREATOR_STORAGE_BUCKET',{default:''});
const CREATOR_TIMING_TASK_PREFIX='invincible:creator-timing:v1:';
const AUTH_BASE=`https://${REGION}-life-by-adichimp.cloudfunctions.net/creatorPluginAuth`;
const MCP_BASE=`https://${REGION}-life-by-adichimp.cloudfunctions.net/creatorPluginMcp`;
const MCP_RESOURCE=`${MCP_BASE}/mcp`;
const CONSENT_URL='https://invincy.github.io/invincible/creator/plugin-connect.html';
const db=()=>getFirestore();
const oauthCollection=name=>db().collection(`_creatorPluginOAuth${name}`);
const json=(response,status,body)=>response.status(status).set('Cache-Control','no-store').json(body);
const form=request=>request.body&&typeof request.body==='object'?request.body:{};
const nowSeconds=()=>Math.floor(Date.now()/1000);
const expiresAt=seconds=>Timestamp.fromMillis(Date.now()+seconds*1000);
const hasExpired=value=>!value?.toMillis||value.toMillis()<=Date.now();
function pathOf(request){return new URL(request.originalUrl||request.url,'https://invincible.invalid').pathname.replace(/^\/creatorPlugin(?:Auth|Mcp)/,'')||'/';}
function bearer(request){const match=String(request.get('authorization')||'').match(/^Bearer\s+(.+)$/i);return match?.[1]||'';}
function publicClient(data){return{redirectUris:data.redirectUris,clientName:data.clientName,grantTypes:data.grantTypes,responseTypes:data.responseTypes,scope:data.scope};}

async function registerClient(request,response){
 try{
  const parsed=oauth.validateClientRegistration(form(request)),clientId=`inv_${oauth.token(18)}`,record={...parsed,createdAt:Timestamp.now()};
  await oauthCollection('Clients').doc(clientId).set(record);
  return json(response,201,{client_id:clientId,client_id_issued_at:nowSeconds(),redirect_uris:parsed.redirectUris,client_name:parsed.clientName,grant_types:parsed.grantTypes,response_types:parsed.responseTypes,token_endpoint_auth_method:'none',scope:parsed.scope});
 }catch(error){return json(response,400,{error:'invalid_client_metadata',error_description:error.message});}
}
async function authorizationRequest(request,response){
 try{
  const query=request.query||{},clientId=oauth.clean(query.client_id,200),snap=await oauthCollection('Clients').doc(clientId).get(),client=snap.exists?publicClient(snap.data()):null;
  const validated=oauth.validateAuthorizationRequest(query,{client,resourceUrl:MCP_RESOURCE});
  const packed=Buffer.from(JSON.stringify(validated)).toString('base64url');
  return response.redirect(302,`${CONSENT_URL}?oauth=${encodeURIComponent(packed)}`);
 }catch(error){return json(response,400,{error:'invalid_request',error_description:error.message});}
}
async function exchangeCode(data,response){
 const rawCode=oauth.clean(data.code,500),verifier=oauth.clean(data.code_verifier,500),clientId=oauth.clean(data.client_id,200),redirectUri=oauth.clean(data.redirect_uri,1000),resource=oauth.clean(data.resource,1000);
 if(!rawCode||!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier))return json(response,400,{error:'invalid_grant',error_description:'A valid authorization code and PKCE verifier are required.'});
 const codeRef=oauthCollection('Codes').doc(oauth.digest(rawCode));
 try{
  const issued=await db().runTransaction(async transaction=>{
   const snap=await transaction.get(codeRef);if(!snap.exists)throw Error('Authorization code is invalid or already used.');
   const code=snap.data();if(hasExpired(code.expiresAt))throw Error('Authorization code expired.');
   if(code.clientId!==clientId||code.redirectUri!==redirectUri||code.resource!==resource||resource!==MCP_RESOURCE||!oauth.safeEqual(oauth.challenge(verifier),code.codeChallenge))throw Error('Authorization code validation failed.');
   const accessToken=oauth.token(32),refreshToken=oauth.token(40),base={uid:code.uid,email:code.email||'',emailVerified:code.emailVerified===true,clientId,scope:code.scope,resource,createdAt:Timestamp.now()};
   transaction.delete(codeRef);
   transaction.set(oauthCollection('Tokens').doc(oauth.digest(accessToken)),{...base,kind:'access',expiresAt:expiresAt(oauth.ACCESS_TTL_SECONDS)});
   transaction.set(oauthCollection('Tokens').doc(oauth.digest(refreshToken)),{...base,kind:'refresh',expiresAt:expiresAt(oauth.REFRESH_TTL_SECONDS)});
   return{accessToken,refreshToken,scope:code.scope};
  });
  return json(response,200,{access_token:issued.accessToken,token_type:'Bearer',expires_in:oauth.ACCESS_TTL_SECONDS,refresh_token:issued.refreshToken,scope:issued.scope});
 }catch(error){return json(response,400,{error:'invalid_grant',error_description:error.message});}
}
async function refreshAccess(data,response){
 const raw=oauth.clean(data.refresh_token,1000),clientId=oauth.clean(data.client_id,200),resource=oauth.clean(data.resource,1000),ref=oauthCollection('Tokens').doc(oauth.digest(raw));
 try{
  const issued=await db().runTransaction(async transaction=>{
   const snap=await transaction.get(ref);if(!snap.exists)throw Error('Refresh token is invalid.');
   const current=snap.data();if(current.kind!=='refresh'||current.clientId!==clientId||current.resource!==resource||resource!==MCP_RESOURCE||hasExpired(current.expiresAt))throw Error('Refresh token validation failed.');
   const accessToken=oauth.token(32),refreshToken=oauth.token(40),base={uid:current.uid,email:current.email||'',emailVerified:current.emailVerified===true,clientId,scope:current.scope,resource,createdAt:Timestamp.now()};
   transaction.delete(ref);
   transaction.set(oauthCollection('Tokens').doc(oauth.digest(accessToken)),{...base,kind:'access',expiresAt:expiresAt(oauth.ACCESS_TTL_SECONDS)});
   transaction.set(oauthCollection('Tokens').doc(oauth.digest(refreshToken)),{...base,kind:'refresh',expiresAt:expiresAt(oauth.REFRESH_TTL_SECONDS)});
   return{accessToken,refreshToken,scope:current.scope};
  });
  return json(response,200,{access_token:issued.accessToken,token_type:'Bearer',expires_in:oauth.ACCESS_TTL_SECONDS,refresh_token:issued.refreshToken,scope:issued.scope});
 }catch(error){return json(response,400,{error:'invalid_grant',error_description:error.message});}
}
async function tokenRequest(request,response){
 const data=form(request);if(data.grant_type==='authorization_code')return exchangeCode(data,response);if(data.grant_type==='refresh_token')return refreshAccess(data,response);
 return json(response,400,{error:'unsupported_grant_type'});
}
async function revokeToken(request,response){
 const value=oauth.clean(form(request).token,1000);if(value)await oauthCollection('Tokens').doc(oauth.digest(value)).delete();return response.status(200).end();
}

exports.creatorPluginAuth=onRequest({region:REGION,timeoutSeconds:30,memory:'256MiB',maxInstances:4},async(request,response)=>{
 const path=pathOf(request);
 if(request.method==='GET'&&(path==='/.well-known/oauth-authorization-server'||path==='/.well-known/openid-configuration'))return json(response,200,oauth.authorizationServerMetadata(AUTH_BASE));
 if(request.method==='GET'&&path==='/authorize')return authorizationRequest(request,response);
 if(request.method==='POST'&&path==='/register')return registerClient(request,response);
 if(request.method==='POST'&&path==='/token')return tokenRequest(request,response);
 if(request.method==='POST'&&path==='/revoke')return revokeToken(request,response);
 return json(response,404,{error:'not_found'});
});

exports.creatorPluginAuthorize=onCall({region:REGION,timeoutSeconds:30,memory:'256MiB'},async request=>{
 if(!request.auth)throw new HttpsError('unauthenticated','Sign in to Invincible first.');
 try{
  const input=request.data?.oauth||{},clientId=oauth.clean(input.clientId,200),snap=await oauthCollection('Clients').doc(clientId).get(),client=snap.exists?publicClient(snap.data()):null;
  const validated=oauth.validateAuthorizationRequest({response_type:input.responseType,client_id:clientId,redirect_uri:input.redirectUri,state:input.state,code_challenge:input.codeChallenge,code_challenge_method:'S256',resource:input.resource,scope:input.scope},{client,resourceUrl:MCP_RESOURCE});
  const code=oauth.token(32);
  await oauthCollection('Codes').doc(oauth.digest(code)).set({uid:request.auth.uid,email:String(request.auth.token.email||'').toLowerCase(),emailVerified:request.auth.token.email_verified===true,clientId,redirectUri:validated.redirectUri,resource:validated.resource,scope:validated.scope,codeChallenge:validated.codeChallenge,createdAt:Timestamp.now(),expiresAt:expiresAt(oauth.CODE_TTL_SECONDS)});
  const redirect=new URL(validated.redirectUri);redirect.searchParams.set('code',code);redirect.searchParams.set('state',validated.state);redirect.searchParams.set('iss',AUTH_BASE);
  return{redirectUrl:redirect.toString()};
 }catch(error){throw new HttpsError('invalid-argument',error.message);}
});

async function authenticate(request){
 const raw=bearer(request);if(!raw)return null;
 const snap=await oauthCollection('Tokens').doc(oauth.digest(raw)).get();if(!snap.exists)return null;
 const data=snap.data();if(data.kind!=='access'||data.resource!==MCP_RESOURCE||hasExpired(data.expiresAt))return null;
 return{uid:data.uid,email:data.email||'',emailVerified:data.emailVerified===true,scope:String(data.scope||'').split(/\s+/)};
}
function contract(){const pack=plannerPack();return{workflow:['Read this contract','Read the selected project context','Create exactly one semantic scene per locked segment','Compile the complete semantic plan','Show the compiled result for review','Apply only after explicit user confirmation, using the exact project revision'],...pack};}
function textResult(data,summary){return{content:[{type:'text',text:summary}],structuredContent:data};}
function toolMeta(scopes,extra={}){return{...extra,securitySchemes:[{type:'oauth2',scopes}]};}
function authenticationRequired(scopes){
 const challenge=`Bearer resource_metadata="${MCP_BASE}/.well-known/oauth-protected-resource", scope="${scopes.join(' ')}", error="invalid_token", error_description="Connect your Invincible account to continue"`;
 return{isError:true,content:[{type:'text',text:'Connect your Invincible account to use this tool.'}],_meta:{'mcp/www_authenticate':[challenge]}};
}
function requireScope(identity,scope){if(!identity.scope.includes(scope))throw Error(`Reconnect the Invincible plugin and grant ${scope} permission.`);}
function timestamp(value){return value?.toDate?.().toISOString?.()||value||null;}
function projectSummary(doc){const value=doc.data();return{id:doc.id,title:String(value.title||'Untitled project'),stage:String(value.stage||'Ideas'),format:String(value.format||''),sceneCount:Array.isArray(value.scenes)?value.scenes.length:0,updatedAt:timestamp(value.updatedAt)};}
function projectContext(id,project){
 const timedScenes=(project.scenes||[]).filter(scene=>Number.isFinite(Number(scene.startSeconds))&&Number.isFinite(Number(scene.endSeconds))&&Number(scene.endSeconds)>Number(scene.startSeconds));
 const derivedTranscript=timedScenes.length?{duration:Number(timedScenes.at(-1).endSeconds),text:timedScenes.map(scene=>String(scene.voiceover||'')).join(' '),segments:timedScenes.map((scene,index)=>({id:String(scene.sourceSegmentIds?.[0]||`segment-${index+1}`),start:Number(scene.startSeconds),end:Number(scene.endSeconds),text:String(scene.voiceover||'')}))}:null;
 const transcript=project.voiceoverAnalysis?.transcript||project.aiDraft?.analysis?.transcript||project.scriptWorkspace?.transcript||derivedTranscript;
 return{id,title:String(project.title||'Untitled project'),instructions:String(project.instructions||project.notes||'').slice(0,12000),script:String(project.script||'').slice(0,30000),transcript,audio:project.scriptWorkspace?.audio||null,aspectRatio:String(project.aspectRatio||'9:16'),catalog:projectCatalog(project),existingSceneCount:Array.isArray(project.scenes)?project.scenes.length:0,writeRevision:Number.isInteger(project.writeRevision)?project.writeRevision:0,workflow:workflowStatus(id,project,transcript),readOnly:false};
}
async function listProjects(identity){
 const projects=db().collection('creatorProjects'),owned=await projects.where('ownerUid','==',identity.uid).get(),shared=identity.email&&identity.emailVerified?await projects.where('editorEmails','array-contains',identity.email).get():{docs:[]},all=new Map();
 for(const doc of [...owned.docs,...shared.docs])all.set(doc.id,projectSummary(doc));return[...all.values()].sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||''))).slice(0,100);
}
async function readProject(identity,projectId){
 if(!/^[A-Za-z0-9_-]{1,100}$/.test(projectId))throw Error('Invalid project ID.');
 const snap=await db().collection('creatorProjects').doc(projectId).get(),project=snap.exists?snap.data():null;
 assertAccess({uid:identity.uid,token:{email:identity.email,email_verified:identity.emailVerified}},project);return projectContext(projectId,project);
}
const compileInput=z.object({title:z.string().trim().min(1).max(200),transcript:z.object({duration:z.number().positive().max(36000),language:z.string().max(40).optional(),text:z.string().max(30000).optional(),segments:z.array(z.object({id:z.string().regex(/^[A-Za-z0-9_-]{1,100}$/),start:z.number().min(0),end:z.number().positive(),text:z.string().trim().min(1).max(4000),words:z.array(z.object({word:z.string(),start:z.number(),end:z.number()})).optional()})).min(1).max(100)}),semanticPlan:z.record(z.string(),z.unknown()),projectId:z.string().regex(/^[A-Za-z0-9_-]{1,100}$/).optional()});
const applyInput=compileInput.extend({projectId:z.string().regex(/^[A-Za-z0-9_-]{1,100}$/),expectedRevision:z.number().int().min(0),confirmed:z.literal(true),replaceExisting:z.boolean().default(false),creativeInstructions:z.string().max(12000).optional()});
const projectIdSchema=z.string().regex(/^[A-Za-z0-9_-]{1,100}$/);
const briefFields={title:z.string().trim().min(1).max(200),narration:z.string().trim().min(1).max(30000),creativeInstructions:z.string().trim().min(1).max(12000),aspectRatio:z.enum(['9:16','16:9','1:1']).default('9:16'),format:z.enum(['Short','Long-form','Course','Ad']).default('Short'),language:z.string().trim().max(40).optional()};
const createProjectInput=z.object({...briefFields,idempotencyKey:z.string().regex(/^[A-Za-z0-9._:-]{8,160}$/)});
const updateBriefInput=z.object({...briefFields,projectId:projectIdSchema,expectedRevision:z.number().int().min(0)});

function workflowStatus(id,project,transcript){
 const script=String(project.script||'').trim(),instructions=String(project.instructions||project.notes||project.scriptWorkspace?.creativeInstructions||'').trim(),scenes=Array.isArray(project.scenes)?project.scenes:[];
 const timingReady=Boolean(transcript?.segments?.length&&Number(transcript.duration)>0),briefReady=Boolean(script&&instructions),scenePlanApplied=scenes.length>0;
 let phase='brief',nextAction='complete_brief',summary='Add narration and animation instructions.';
 if(briefReady&&!timingReady){phase='audio_timing';nextAction='generate_mp3_and_run_local_whisper';summary='Open the single local checkpoint to generate or reuse the final MP3 and run free local Whisper timing.';}
 if(timingReady&&!scenePlanApplied){phase='semantic_plan';nextAction='compile_and_apply_scene_plan';summary='Timing is locked. Continue directly with Director planning, compilation, review and application.';}
 if(scenePlanApplied){phase='native_review_export';nextAction='review_maps_preview_and_export';summary='Scenes are applied. Review native maps, preview the continuous Motion Studio timeline and export the MP4.';}
 const area=phase==='audio_timing'?'Voiceover':phase==='native_review_export'?'Studio':'Storyboard';
 const audioReady=/^cloud-[a-f0-9]{64}$/.test(String(project.scriptWorkspace?.audio?.cloudAssetId||''));if(phase==='audio_timing'&&audioReady){nextAction='start_private_local_whisper';summary='The final MP3 is privately stored. Start the paired laptop timing job directly; browser control is not required.';}
 return{phase,nextAction,summary,briefReady,audioReady,timingReady,scenePlanApplied,sceneCount:scenes.length,localCheckpointRequired:(phase==='audio_timing'&&!audioReady)||phase==='native_review_export',localCheckpointReason:phase==='audio_timing'&&!audioReady?'Generate or choose the final MP3 once so it can be saved privately.':phase==='native_review_export'?'Native map review and MP4 rendering run on the paired laptop.':'',openUrl:`https://invincy.github.io/invincible/creator/project.html?id=${encodeURIComponent(id)}&area=${encodeURIComponent(area)}`,costPolicy:{localWhisper:'free',cloudTranscription:'disabled-by-default',ordinaryCreatorPlanner:'disabled',directorPlanning:'uses the active ChatGPT session'}};
}
async function startLocalTiming(identity,{projectId,expectedRevision}){
 requireScope(identity,'creator.write');const context=await readProject(identity,projectId);if(context.writeRevision!==expectedRevision)throw Error(`Project changed since review (expected revision ${expectedRevision}, current revision ${context.writeRevision}).`);if(context.transcript?.segments?.length)return{alreadyComplete:true,workflow:context.workflow};const assetId=String(context.audio?.cloudAssetId||'');if(!/^cloud-[a-f0-9]{64}$/.test(assetId))throw Error('The final MP3 has not been saved to the private Creator library yet.');if(!creatorStorageBucket.value())throw Error('Private Creator storage is not configured.');const asset=await db().collection('_creatorMedia').doc(identity.uid).collection('assets').doc(assetId).get();if(!asset.exists||asset.data().kind!=='audio')throw Error('The private voiceover asset is unavailable.');const [audioUrl]=await getStorage().bucket(creatorStorageBucket.value()).file(`creatorMedia/${identity.uid}/originals/${assetId}`).getSignedUrl({action:'read',expires:Date.now()+15*60*1000});const command=CREATOR_TIMING_TASK_PREFIX+JSON.stringify({projectId,audioAssetId:assetId,audioUrl});const task=await enqueueTask({db:db(),uid:identity.uid,workspaceId:identity.uid,command,idempotencyKey:`creator-timing:${projectId}:${expectedRevision}:${assetId.slice(-12)}`});return{taskId:task.id,status:task.status,deduplicated:task.deduplicated===true,projectId,audioAssetId:assetId};
}
async function localTimingStatus(identity,taskId){const snap=await db().collection('users').doc(identity.uid).collection('aiTasks').doc(taskId).get();if(!snap.exists)throw Error('Timing job was not found.');const task=snap.data();if(task.ownerUid!==identity.uid||!String(task.command||'').startsWith(CREATOR_TIMING_TASK_PREFIX))throw Error('Timing job is not available to this account.');const projectId=task.result?.projectId||JSON.parse(String(task.command).slice(CREATOR_TIMING_TASK_PREFIX.length)).projectId;const context=await readProject(identity,projectId);return{taskId,status:task.status,error:task.error||'',projectId,writeRevision:context.writeRevision,workflow:context.workflow};}
function projectIdFor(uid,key){return`plugin_${crypto.createHash('sha256').update(`${uid}:${key}`).digest('hex').slice(0,32)}`;}
function briefWorkspace(input){return{version:1,script:input.narration,creativeInstructions:input.creativeInstructions,transcript:null,timingProvider:'local-whisper',audio:{sourceFilename:'',finalDuration:0,appliedSpeed:1},updatedAtMs:Date.now()};}
async function createCreatorProject(identity,input){
 requireScope(identity,'creator.write');const parsed=createProjectInput.parse(input),id=projectIdFor(identity.uid,parsed.idempotencyKey),ref=db().collection('creatorProjects').doc(id),stamp=Timestamp.now();
 const result=await db().runTransaction(async transaction=>{const snap=await transaction.get(ref);if(snap.exists){assertAccess({uid:identity.uid,token:{email:identity.email,email_verified:identity.emailVerified}},snap.data());return{project:snap.data(),deduplicated:true};}
  const project={id,title:parsed.title,format:parsed.format,stage:'Ideas',aspectRatio:parsed.aspectRatio,language:parsed.language||'',script:parsed.narration,notes:parsed.creativeInstructions,instructions:parsed.creativeInstructions,scriptWorkspace:briefWorkspace(parsed),visualStyle:'',scenes:[],assets:[],productionClips:[],animationGroups:[],ownerUid:identity.uid,ownerEmail:identity.email||'',editorEmails:[],writeRevision:1,writtenBy:identity.uid,writtenAt:stamp,createdAt:stamp,updatedAt:stamp};transaction.set(ref,project);return{project,deduplicated:false};});
 return{id,deduplicated:result.deduplicated,writeRevision:Number(result.project.writeRevision)||1,workflow:workflowStatus(id,result.project,result.project.scriptWorkspace?.transcript)};
}
async function updateCreatorBrief(identity,input){
 requireScope(identity,'creator.write');const parsed=updateBriefInput.parse(input),ref=db().collection('creatorProjects').doc(parsed.projectId);
 return db().runTransaction(async transaction=>{const snap=await transaction.get(ref),project=snap.exists?snap.data():null;assertAccess({uid:identity.uid,token:{email:identity.email,email_verified:identity.emailVerified}},project);const revision=Number.isInteger(project.writeRevision)?project.writeRevision:0;if(revision!==parsed.expectedRevision)throw Error(`Project changed since review (expected revision ${parsed.expectedRevision}, current revision ${revision}). Read it again before updating.`);if(project.scriptWorkspace?.transcript?.segments?.length||project.voiceoverAnalysis?.transcript?.segments?.length)throw Error('Timing is already locked. Change narration in Creator Studio so the final MP3 and timestamps cannot become mismatched.');if(Array.isArray(project.scenes)&&project.scenes.length)throw Error('This project already has scenes. Updating its production brief requires a separately confirmed replacement workflow.');const nextRevision=revision+1,stamp=Timestamp.now(),workspace=briefWorkspace(parsed),next={...project,title:parsed.title,format:parsed.format,aspectRatio:parsed.aspectRatio,language:parsed.language||project.language||'',script:parsed.narration,notes:parsed.creativeInstructions,instructions:parsed.creativeInstructions,scriptWorkspace:workspace,writeRevision:nextRevision,writtenBy:identity.uid,writtenAt:stamp,updatedAt:stamp};transaction.update(ref,{title:next.title,format:next.format,aspectRatio:next.aspectRatio,language:next.language,script:next.script,notes:next.notes,instructions:next.instructions,scriptWorkspace:workspace,writeRevision:nextRevision,writtenBy:identity.uid,writtenAt:stamp,updatedAt:stamp});return{projectId:parsed.projectId,writeRevision:nextRevision,workflow:workflowStatus(parsed.projectId,next,null)};});
}
function creatorScenes(compiled){return compiled.creatorStudio.scenes.map(scene=>({...scene,duration:Math.max(1,Math.min(60,Number(scene.durationSeconds)||1)),completed:false,sceneState:'Planned',voiceoverReady:false,editingDone:false,productionMethods:[],checklist:[]}));}
async function applyCompiledDraft(identity,input){
 requireScope(identity,'creator.write');const ref=db().collection('creatorProjects').doc(input.projectId);
 return db().runTransaction(async transaction=>{
  const snap=await transaction.get(ref),project=snap.exists?snap.data():null;assertAccess({uid:identity.uid,token:{email:identity.email,email_verified:identity.emailVerified}},project);
  const revision=Number.isInteger(project.writeRevision)?project.writeRevision:0;if(revision!==input.expectedRevision)throw Error(`Project changed since review (expected revision ${input.expectedRevision}, current revision ${revision}). Read it again before applying.`);
  const existing=Array.isArray(project.scenes)?project.scenes:[];if(existing.length&&!input.replaceExisting)throw Error(`This project already has ${existing.length} scenes. Set replaceExisting only after the user explicitly confirms replacement.`);
  const compiled=buildPlan(input.semanticPlan,input.transcript,input.title,projectCatalog(project)),scenes=creatorScenes(compiled),nextRevision=revision+1,stamp=Timestamp.now();
  const pluginDraft={version:1,accountId:identity.uid,projectId:input.projectId,title:input.title,creativeInstructions:String(input.creativeInstructions||project.scriptWorkspace?.creativeInstructions||project.notes||'').slice(0,12000),analysis:compiled.analysis,creatorStudio:compiled.creatorStudio,createdAtMs:Date.now(),source:'invincible-video-director-plugin'};
  transaction.update(ref,{scenes,pluginDraft,script:project.script||input.transcript.text||input.transcript.segments.map(item=>item.text).join(' '),writeRevision:nextRevision,writtenBy:identity.uid,writtenAt:stamp,updatedAt:stamp});
  return{compiled,nextRevision,replacedSceneCount:existing.length};
 });
}
function createServer(identity){
 const server=new McpServer({name:'invincible-video-director-cloud',version:'0.6.0'},{instructions:'Own the complete Creator workflow. Create or update the full brief in one call, inspect workflow status, and continue automatically through every available tool. Never ask the user to repeat supplied narration or instructions. When a private final MP3 exists, start_creator_local_timing sends it directly to the paired laptop Whisper worker without browser control or paid transcription. Never invent timing, geography, asset IDs or renderer internals. Compile first. Apply only after review; replacing existing scenes requires separate explicit confirmation.'});
 const readScopes=['creator.read'],compileScopes=['creator.read','creator.compile'],writeScopes=['creator.read','creator.compile','creator.write'];
 server.registerTool('get_my_profile',{title:'Get Invincible profile',description:'Confirm which Invincible Firebase account authorized this private connection.',inputSchema:{},annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false},_meta:toolMeta(readScopes,{'openai/profile':true})},async()=>identity?textResult({id:identity.uid,email:identity.email,privateConnection:true,scopes:identity.scope},`Connected privately as ${identity.email||'an Invincible user'}.`):authenticationRequired(readScopes));
 server.registerTool('get_creator_contract',{title:'Get Creator visual contract',description:'Read the authoritative Invincible planning schema, style presets and renderer capabilities.',inputSchema:{},annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false},_meta:toolMeta(readScopes)},async()=>identity?textResult(contract(),'Loaded the Invincible visual contract.'):authenticationRequired(readScopes));
 server.registerTool('list_creator_projects',{title:'List my Creator projects',description:'List the Creator Studio projects available to the signed-in Invincible account.',inputSchema:{},annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false},_meta:toolMeta(readScopes)},async()=>{if(!identity)return authenticationRequired(readScopes);const projects=await listProjects(identity);return textResult({projects,readOnly:true},`Found ${projects.length} available Creator Studio project${projects.length===1?'':'s'}.`);});
 server.registerTool('get_creator_project_context',{title:'Read Creator project context',description:'Read bounded script, timing, instructions and verified asset context for one accessible project.',inputSchema:{projectId:z.string().regex(/^[A-Za-z0-9_-]{1,100}$/)},annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false},_meta:toolMeta(readScopes)},async({projectId})=>{if(!identity)return authenticationRequired(readScopes);try{return textResult(await readProject(identity,projectId),'Loaded the project context without changing it.');}catch(error){return{isError:true,content:[{type:'text',text:error.message}]};}});
 server.registerTool('create_creator_project',{title:'Create complete Creator project',description:'Create one fresh Creator Studio project with its full narration and animation instructions in a single idempotent operation. Use only when the user requested a new project.',inputSchema:createProjectInput.shape,annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false},_meta:toolMeta(writeScopes)},async raw=>{if(!identity)return authenticationRequired(writeScopes);try{const result=await createCreatorProject(identity,raw);return textResult({...result,mutatedProject:!result.deduplicated},result.deduplicated?'Reused the project created by this request. Continue from its saved workflow state.':'Created the complete project brief. Continue automatically; use the single local audio-and-timing checkpoint when required.');}catch(error){return{isError:true,content:[{type:'text',text:`The Creator project was not created: ${error.message}`}]};}});
 server.registerTool('update_creator_project_brief',{title:'Update empty Creator project brief',description:'Save narration and animation instructions into an existing empty, untimed project without opening Creator Studio. Refuses to invalidate locked timing or existing scenes.',inputSchema:updateBriefInput.shape,annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false},_meta:toolMeta(writeScopes)},async raw=>{if(!identity)return authenticationRequired(writeScopes);try{const result=await updateCreatorBrief(identity,raw);return textResult({...result,mutatedProject:true},'Saved the complete production brief. Continue from the returned workflow state without asking for the same input again.');}catch(error){return{isError:true,content:[{type:'text',text:`The production brief was not updated: ${error.message}`}]};}});
 server.registerTool('get_creator_workflow_status',{title:'Resume Creator video workflow',description:'Inspect the saved project and return the exact next phase, one consolidated local checkpoint when unavoidable, and the cost policy. Use this instead of asking the user what comes next.',inputSchema:{projectId:projectIdSchema},annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false},_meta:toolMeta(readScopes)},async({projectId})=>{if(!identity)return authenticationRequired(readScopes);try{const context=await readProject(identity,projectId);return textResult({projectId,writeRevision:context.writeRevision,...context.workflow},context.workflow.summary);}catch(error){return{isError:true,content:[{type:'text',text:error.message}]};}});
 server.registerTool('start_creator_local_timing',{title:'Run free local Whisper timing',description:'Queue the project’s privately stored final MP3 for the paired laptop Whisper worker. Does not use browser control or paid OpenAI transcription.',inputSchema:{projectId:projectIdSchema,expectedRevision:z.number().int().min(0)},annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false},_meta:toolMeta(writeScopes)},async raw=>{if(!identity)return authenticationRequired(writeScopes);try{return textResult(await startLocalTiming(identity,raw),'Queued the private MP3 for free local Whisper timing. Continue by checking this job; do not open Creator Studio.');}catch(error){return{isError:true,content:[{type:'text',text:`Local timing was not started: ${error.message}`}]};}});
 server.registerTool('get_creator_local_timing_status',{title:'Check local Whisper timing',description:'Check the paired laptop timing job and return the project’s updated workflow state.',inputSchema:{taskId:z.string().regex(/^localai_[a-f0-9]{32}$/)},annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false},_meta:toolMeta(readScopes)},async({taskId})=>{if(!identity)return authenticationRequired(readScopes);try{const result=await localTimingStatus(identity,taskId);return textResult(result,result.status==='completed'?'Local Whisper timing is saved to the project. Continue directly with Director planning.':`Local Whisper timing is ${result.status}.`);}catch(error){return{isError:true,content:[{type:'text',text:error.message}]};}});
 server.registerTool('compile_creator_plan',{title:'Compile Creator scene plan',description:'Compile a semantic scene plan into existing Creator Studio, Map Editor and Motion Studio formats without saving it.',inputSchema:compileInput.shape,annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false},_meta:toolMeta(compileScopes)},async raw=>{if(!identity)return authenticationRequired(compileScopes);try{requireScope(identity,'creator.compile');const input=compileInput.parse(raw),catalog=input.projectId?(await readProject(identity,input.projectId)).catalog:{assets:[],locations:[],routes:[]},compiled=buildPlan(input.semanticPlan,input.transcript,input.title,catalog);return textResult({...compiled,compiler:'invincible-deterministic-v1',mutatedProject:false},`Compiled ${compiled.analysis.scenes.length} locked scenes. No project was changed.`);}catch(error){return{isError:true,content:[{type:'text',text:`Invincible compiler rejected the plan: ${error.message}`} ]};}});
 server.registerTool('apply_creator_plan',{title:'Apply reviewed plan to Creator Studio',description:'Recompile and save a reviewed plan into the selected Creator project. Requires explicit confirmation and the exact project revision; replacing existing scenes must also be explicitly confirmed.',inputSchema:applyInput.shape,annotations:{readOnlyHint:false,destructiveHint:true,openWorldHint:false},_meta:toolMeta(writeScopes)},async raw=>{if(!identity)return authenticationRequired(writeScopes);try{const input=applyInput.parse(raw),result=await applyCompiledDraft(identity,input),url=`https://invincy.github.io/invincible/creator/project.html?id=${encodeURIComponent(input.projectId)}&area=Storyboard`;return textResult({projectId:input.projectId,writeRevision:result.nextRevision,sceneCount:result.compiled.analysis.scenes.length,replacedSceneCount:result.replacedSceneCount,openUrl:url,mutatedProject:true},`Applied ${result.compiled.analysis.scenes.length} reviewed scenes to Creator Studio. Open the project to review maps and continue to Motion Studio.`);}catch(error){return{isError:true,content:[{type:'text',text:`The reviewed plan was not applied: ${error.message}`} ]};}});
 return server;
}
function challengeResponse(response){response.set('WWW-Authenticate',`Bearer resource_metadata="${MCP_BASE}/.well-known/oauth-protected-resource"`);return json(response,401,{error:'invalid_token'});}

exports.creatorPluginMcp=onRequest({region:REGION,timeoutSeconds:120,memory:'512MiB',maxInstances:8},async(request,response)=>{
 const path=pathOf(request);
 if(request.method==='GET'&&(path==='/.well-known/oauth-protected-resource'||path==='/mcp/.well-known/oauth-protected-resource'))return json(response,200,oauth.protectedResourceMetadata(MCP_RESOURCE,AUTH_BASE));
 if(path==='/health')return json(response,200,{ok:true,name:'invincible-video-director-cloud',version:'0.6.0',private:true,readOnly:false});
 if(path!=='/mcp')return json(response,404,{error:'not_found'});
 if(request.method!=='POST')return response.status(405).set('Allow','POST').end();
 const identity=await authenticate(request);
 const server=createServer(identity),transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined});
 try{await server.connect(transport);await transport.handleRequest(request,response,request.body);}
 catch(error){if(!response.headersSent)json(response,500,{jsonrpc:'2.0',error:{code:-32603,message:'Invincible plugin request failed.'},id:null});}
 finally{await transport.close().catch(()=>{});await server.close().catch(()=>{});}
});

Object.defineProperties(exports,{createServer:{value:createServer},creatorScenes:{value:creatorScenes},applyInput:{value:applyInput},createProjectInput:{value:createProjectInput},updateBriefInput:{value:updateBriefInput},workflowStatus:{value:workflowStatus},MCP_RESOURCE:{value:MCP_RESOURCE},AUTH_BASE:{value:AUTH_BASE}});
