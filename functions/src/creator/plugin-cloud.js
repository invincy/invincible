const {onCall,onRequest,HttpsError}=require('firebase-functions/v2/https');
const {getFirestore,Timestamp}=require('firebase-admin/firestore');
const {McpServer}=require('@modelcontextprotocol/sdk/server/mcp.js');
const {StreamableHTTPServerTransport}=require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const z=require('zod/v4');
const {assertAccess}=require('./access');
const {plannerPack}=require('./semantic-plan');
const {buildPlan,projectCatalog}=require('./openai-video-callables');
const oauth=require('./plugin-oauth');

const REGION='asia-south1';
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
function requireScope(identity,scope){if(!identity.scope.includes(scope))throw Error(`Reconnect the Invincible plugin and grant ${scope} permission.`);}
function timestamp(value){return value?.toDate?.().toISOString?.()||value||null;}
function projectSummary(doc){const value=doc.data();return{id:doc.id,title:String(value.title||'Untitled project'),stage:String(value.stage||'Ideas'),format:String(value.format||''),sceneCount:Array.isArray(value.scenes)?value.scenes.length:0,updatedAt:timestamp(value.updatedAt)};}
function projectContext(id,project){
 const timedScenes=(project.scenes||[]).filter(scene=>Number.isFinite(Number(scene.startSeconds))&&Number.isFinite(Number(scene.endSeconds))&&Number(scene.endSeconds)>Number(scene.startSeconds));
 const derivedTranscript=timedScenes.length?{duration:Number(timedScenes.at(-1).endSeconds),text:timedScenes.map(scene=>String(scene.voiceover||'')).join(' '),segments:timedScenes.map((scene,index)=>({id:String(scene.sourceSegmentIds?.[0]||`segment-${index+1}`),start:Number(scene.startSeconds),end:Number(scene.endSeconds),text:String(scene.voiceover||'')}))}:null;
 const transcript=project.voiceoverAnalysis?.transcript||project.aiDraft?.analysis?.transcript||project.scriptWorkspace?.transcript||derivedTranscript;
 return{id,title:String(project.title||'Untitled project'),instructions:String(project.instructions||project.notes||'').slice(0,12000),script:String(project.script||'').slice(0,30000),transcript,aspectRatio:String(project.aspectRatio||'9:16'),catalog:projectCatalog(project),existingSceneCount:Array.isArray(project.scenes)?project.scenes.length:0,writeRevision:Number.isInteger(project.writeRevision)?project.writeRevision:0,readOnly:false};
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
 const server=new McpServer({name:'invincible-video-director-cloud',version:'0.3.0'},{instructions:'Use the contract and selected project context. Never invent timing, geography, asset IDs or renderer internals. Compile first. Apply only after the user reviews the result and explicitly asks to apply it.'});
 server.registerTool('get_my_profile',{title:'Get Invincible profile',description:'Confirm which Invincible Firebase account authorized this private connection.',inputSchema:{},annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false},_meta:{'openai/profile':true}},async()=>textResult({email:identity.email,privateConnection:true,scopes:identity.scope},`Connected privately as ${identity.email||'an Invincible user'}.`));
 server.registerTool('get_creator_contract',{title:'Get Creator visual contract',description:'Read the authoritative Invincible planning schema, style presets and renderer capabilities.',inputSchema:{},annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}},async()=>textResult(contract(),'Loaded the Invincible visual contract.'));
 server.registerTool('list_creator_projects',{title:'List my Creator projects',description:'List the Creator Studio projects available to the signed-in Invincible account.',inputSchema:{},annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}},async()=>{const projects=await listProjects(identity);return textResult({projects,readOnly:true},`Found ${projects.length} available Creator Studio project${projects.length===1?'':'s'}.`);});
 server.registerTool('get_creator_project_context',{title:'Read Creator project context',description:'Read bounded script, timing, instructions and verified asset context for one accessible project.',inputSchema:{projectId:z.string().regex(/^[A-Za-z0-9_-]{1,100}$/)},annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}},async({projectId})=>{try{return textResult(await readProject(identity,projectId),'Loaded the project context without changing it.');}catch(error){return{isError:true,content:[{type:'text',text:error.message}]};}});
 server.registerTool('compile_creator_plan',{title:'Compile Creator scene plan',description:'Compile a semantic scene plan into existing Creator Studio, Map Editor and Motion Studio formats without saving it.',inputSchema:compileInput.shape,annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}},async raw=>{try{requireScope(identity,'creator.compile');const input=compileInput.parse(raw),catalog=input.projectId?(await readProject(identity,input.projectId)).catalog:{assets:[],locations:[],routes:[]},compiled=buildPlan(input.semanticPlan,input.transcript,input.title,catalog);return textResult({...compiled,compiler:'invincible-deterministic-v1',mutatedProject:false},`Compiled ${compiled.analysis.scenes.length} locked scenes. No project was changed.`);}catch(error){return{isError:true,content:[{type:'text',text:`Invincible compiler rejected the plan: ${error.message}`} ]};}});
 server.registerTool('apply_creator_plan',{title:'Apply reviewed plan to Creator Studio',description:'Recompile and save a reviewed plan into the selected Creator project. Requires explicit confirmation and the exact project revision; replacing existing scenes must also be explicitly confirmed.',inputSchema:applyInput.shape,annotations:{readOnlyHint:false,destructiveHint:true,openWorldHint:false}},async raw=>{try{const input=applyInput.parse(raw),result=await applyCompiledDraft(identity,input),url=`https://invincy.github.io/invincible/creator/project.html?id=${encodeURIComponent(input.projectId)}&area=Storyboard`;return textResult({projectId:input.projectId,writeRevision:result.nextRevision,sceneCount:result.compiled.analysis.scenes.length,replacedSceneCount:result.replacedSceneCount,openUrl:url,mutatedProject:true},`Applied ${result.compiled.analysis.scenes.length} reviewed scenes to Creator Studio. Open the project to review maps and continue to Motion Studio.`);}catch(error){return{isError:true,content:[{type:'text',text:`The reviewed plan was not applied: ${error.message}`} ]};}});
 return server;
}
function challengeResponse(response){response.set('WWW-Authenticate',`Bearer resource_metadata="${MCP_BASE}/.well-known/oauth-protected-resource"`);return json(response,401,{error:'invalid_token'});}

exports.creatorPluginMcp=onRequest({region:REGION,timeoutSeconds:120,memory:'512MiB',maxInstances:8},async(request,response)=>{
 const path=pathOf(request);
 if(request.method==='GET'&&(path==='/.well-known/oauth-protected-resource'||path==='/mcp/.well-known/oauth-protected-resource'))return json(response,200,oauth.protectedResourceMetadata(MCP_RESOURCE,AUTH_BASE));
 if(path==='/health')return json(response,200,{ok:true,name:'invincible-video-director-cloud',version:'0.3.0',private:true,readOnly:false});
 if(path!=='/mcp')return json(response,404,{error:'not_found'});
 const identity=await authenticate(request);if(!identity)return challengeResponse(response);
 if(request.method!=='POST')return response.status(405).set('Allow','POST').end();
 const server=createServer(identity),transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined});
 try{await server.connect(transport);await transport.handleRequest(request,response,request.body);}
 catch(error){if(!response.headersSent)json(response,500,{jsonrpc:'2.0',error:{code:-32603,message:'Invincible plugin request failed.'},id:null});}
 finally{await transport.close().catch(()=>{});await server.close().catch(()=>{});}
});

Object.defineProperties(exports,{createServer:{value:createServer},creatorScenes:{value:creatorScenes},applyInput:{value:applyInput},MCP_RESOURCE:{value:MCP_RESOURCE},AUTH_BASE:{value:AUTH_BASE}});
