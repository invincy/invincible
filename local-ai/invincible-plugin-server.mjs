import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import * as z from 'zod/v4';
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {createMcpExpressApp} from '@modelcontextprotocol/sdk/server/express.js';

const require=createRequire(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {plannerPack}=require('../functions/src/creator/semantic-plan.js');
const {buildPlan,projectCatalog}=require('../functions/src/creator/openai-video-callables.js');

const segmentSchema=z.object({
 id:z.string().regex(/^[A-Za-z0-9_-]{1,100}$/),
 start:z.number().min(0).max(36_000),
 end:z.number().positive().max(36_000),
 text:z.string().trim().min(1).max(4000),
 words:z.array(z.object({word:z.string().trim().min(1).max(200),start:z.number().min(0),end:z.number().min(0)})).max(2000).optional(),
});
const transcriptSchema=z.object({
 duration:z.number().positive().max(36_000),
 language:z.string().max(40).optional(),
 text:z.string().max(30_000).optional(),
 segments:z.array(segmentSchema).min(1).max(100),
});
const assetSchema=z.object({id:z.string().trim().min(1).max(160),name:z.string().trim().min(1).max(160),type:z.string().trim().max(80).default('asset'),description:z.string().trim().max(300).optional()});
const locationSchema=z.object({id:z.string().trim().min(1).max(160),name:z.string().trim().min(1).max(160),coordinates:z.tuple([z.number().min(-180).max(180),z.number().min(-90).max(90)]),sourceUrl:z.url(),sourceDate:z.string().trim().min(1).max(80),precisionNote:z.string().trim().min(1).max(300),reviewed:z.literal(true)});
const routeSchema=z.object({id:z.string().trim().min(1).max(160),name:z.string().trim().min(1).max(160),coordinates:z.array(z.tuple([z.number().min(-180).max(180),z.number().min(-90).max(90)])).min(2).max(500),sourceUrl:z.url(),sourceDate:z.string().trim().min(1).max(80),precisionNote:z.string().trim().min(1).max(300),reviewed:z.literal(true)});
const catalogSchema=z.object({assets:z.array(assetSchema).max(50).default([]),locations:z.array(locationSchema).max(50).default([]),routes:z.array(routeSchema).max(50).default([])}).default({assets:[],locations:[],routes:[]});

function verifiedCatalog(input={}){
 const catalog=catalogSchema.parse(input);
 return projectCatalog({
  assets:catalog.assets,
  historicalMap:{
   events:catalog.locations.map(item=>({id:item.id,label:item.name,coordinates:item.coordinates,sourceUrl:item.sourceUrl,date:item.sourceDate,sourceNote:item.precisionNote})),
   features:{features:catalog.routes.map(item=>({geometry:{type:'LineString',coordinates:item.coordinates},properties:{id:item.id,label:item.name,reviewed:true,sourceUrl:item.sourceUrl,date:item.sourceDate,sourceNote:item.precisionNote}}))},
  },
 });
}

export function creatorContract(){
 const pack=plannerPack();
 return{
  schemaVersion:pack.manifest.schemaVersion,
  workflow:['Read this contract','Create exactly one semantic scene per locked transcript segment','Compile and inspect the result','Revise semantic choices when validation or visual diagnostics fail','Return the reviewed Creator Studio draft for the existing Apply flow'],
  rules:[
   'Never author timestamps, coordinates, colours, font sizes, political boundaries, keyframes or renderer internals.',
   'Use only the engines, presets, asset IDs, location IDs and route IDs supplied by the contract and current project catalog.',
   'Choose the smallest verified geographic context containing every named place. Request missing factual resources instead of inventing geometry.',
   'The transcript timing is locked. Missing assets keep a safe fallback and must not delete, merge or retime a scene.',
  ],
  ...pack,
 };
}

export function compileCreatorPlan(input){
 const title=z.string().trim().min(1).max(200).parse(input?.title);
 const transcript=transcriptSchema.parse(input?.transcript);
 let previous=0;
 for(const [index,segment] of transcript.segments.entries()){
  if(segment.start<previous||segment.end<=segment.start)throw Error(`Transcript segment ${index+1} has invalid or overlapping timing.`);
  previous=segment.end;
 }
 if(Math.abs(transcript.duration-previous)>.75)throw Error('The transcript duration must agree with the final locked timestamp within 0.75 seconds.');
 const semanticPlan=z.record(z.string(),z.unknown()).parse(input?.semanticPlan);
 const catalog=verifiedCatalog(input?.catalog);
 const payload=buildPlan(semanticPlan,transcript,title,catalog);
 const diagnostics=payload.analysis.scenes.map((scene,index)=>({
  scene:index+1,
  sourceSegmentId:scene.semanticPlan.sourceSegmentId,
  engine:scene.semanticPlan.engine,
  presetId:scene.semanticPlan.presetId,
  executableMap:Boolean(scene.mapAnimation),
  executableCanvas:Boolean(scene.canvasScene),
  missingInfo:scene.missingInfo,
  resourceRequests:scene.semanticPlan.resourceRequests,
 }));
 return{...payload,diagnostics,compiler:'invincible-deterministic-v1',mutatedProject:false};
}

function result(data,summary){
 return{content:[{type:'text',text:summary}],structuredContent:data};
}

function createMcpServer(){
 const server=new McpServer({name:'invincible-video-director',version:'0.1.0'},{instructions:'Use get_creator_contract before planning. Produce exactly one semantic scene for each locked segment, then call compile_creator_plan. Never invent coordinates, assets, routes, timestamps or renderer JSON. Compilation is read-only; applying a draft remains an explicit Invincible project action.'});
 server.registerTool('get_creator_contract',{
  title:'Get Creator visual contract',
  description:'Read the authoritative Invincible scene vocabulary, visual style, examples and renderer capabilities before planning a video.',
  inputSchema:{},
  annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false},
 },async()=>result(creatorContract(),'Loaded the Invincible semantic planning contract. Use only its registered vocabulary, then compile the complete plan.'));
 server.registerTool('compile_creator_plan',{
  title:'Compile Creator scene plan',
  description:'Validate a complete semantic plan against locked voiceover timing and compile it into the existing Creator Studio, Map Editor and Motion Studio formats without changing a project.',
  inputSchema:{
   title:z.string().trim().min(1).max(200),
   transcript:transcriptSchema,
   semanticPlan:z.record(z.string(),z.unknown()),
   catalog:catalogSchema.optional(),
  },
  annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false},
 },async input=>{
  try{const compiled=compileCreatorPlan(input);const maps=compiled.mapAnimations.length,missing=compiled.diagnostics.reduce((sum,item)=>sum+item.missingInfo.length,0);return result(compiled,`Compiled ${compiled.analysis.scenes.length} locked scenes: ${maps} native map scene${maps===1?'':'s'}, ${missing} review note${missing===1?'':'s'}. No project was changed.`);}
  catch(error){return{isError:true,content:[{type:'text',text:`Invincible compiler rejected the plan: ${error.message}`} ]};}
 });
 return server;
}

export function createInvinciblePluginServer({port=8791,host='127.0.0.1'}={}){
 const app=createMcpExpressApp();
 app.get('/health',(_request,response)=>response.json({ok:true,name:'invincible-video-director',version:'0.1.0',readOnly:true}));
 app.post('/mcp',async(request,response)=>{
  const server=createMcpServer();
  const transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined});
  try{await server.connect(transport);await transport.handleRequest(request,response,request.body);}
  catch(error){if(!response.headersSent)response.status(500).json({jsonrpc:'2.0',error:{code:-32603,message:'Invincible plugin request failed.'},id:null});}
  finally{response.on('close',()=>{transport.close().catch(()=>{});server.close().catch(()=>{});});}
 });
 app.get('/mcp',(_request,response)=>response.status(405).json({jsonrpc:'2.0',error:{code:-32000,message:'Method not allowed.'},id:null}));
 app.delete('/mcp',(_request,response)=>response.status(405).json({jsonrpc:'2.0',error:{code:-32000,message:'Method not allowed.'},id:null}));
 let listener=null;
 return{
  origin:`http://${host}:${port}`,
  async listen(){if(listener)return;await new Promise((resolve,reject)=>{listener=app.listen(port,host,resolve);listener.once('error',reject);});},
  async close(){if(!listener)return;const current=listener;listener=null;await new Promise((resolve,reject)=>current.close(error=>error?reject(error):resolve()));},
 };
}

if(path.resolve(process.argv[1]||'')===fileURLToPath(import.meta.url)){
 const service=createInvinciblePluginServer({port:Number(process.env.INVINCIBLE_PLUGIN_PORT||8791)});
 await service.listen();
 console.log(`Invincible Video Director MCP: ${service.origin}/mcp`);
 process.on('SIGINT',async()=>{await service.close();process.exit(0);});
}
