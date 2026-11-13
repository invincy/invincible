import test from 'node:test';
import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {compileCreatorPlan,creatorContract,createInvinciblePluginServer} from './invincible-plugin-server.mjs';

const semantic=sourceSegmentId=>({sourceSegmentId,engine:'map',sceneKind:'atmospheric-system',presetId:'shifting-zone',title:'ITCZ shift',visualIntent:'Show the convergence belt moving north toward India.',labelTreatment:'map-label',cameraIntent:'global-to-local',assetIds:[],locationId:'context-india-indian-ocean',routeId:'',historicalYear:0,regionId:'',polityNames:[],emphasis:['geography','pressure','wind'],missingInfo:[],resourceRequests:[],clarifications:[]});

test('plugin contract exposes the same semantic schema and renderer vocabulary',()=>{
 const contract=creatorContract();
 assert.equal(contract.schemaVersion,'creator-semantic-plan-v1');
 assert.ok(contract.rendererCapabilities.automaticPresets.includes('shifting-zone'));
 assert.match(contract.rules.join(' '),/Never author timestamps/);
});

test('plugin compiler produces an executable native map without changing a project',()=>{
 const compiled=compileCreatorPlan({title:'ITCZ',transcript:{duration:3,segments:[{id:'segment-1',start:0,end:3,text:'The ITCZ shifts north in summer.'}]},semanticPlan:{schemaVersion:'creator-semantic-plan-v1',scenes:[semantic('segment-1')]}});
 assert.equal(compiled.mutatedProject,false);
 assert.equal(compiled.mapAnimations.length,1);
 assert.equal(compiled.diagnostics[0].executableMap,true);
});

test('streamable MCP advertises and runs the read-only compiler tools',async t=>{
 const port=19000+Math.floor(Math.random()*1000),service=createInvinciblePluginServer({port});
 await service.listen();t.after(()=>service.close());
 const client=new Client({name:'invincible-plugin-test',version:'1.0.0'}),transport=new StreamableHTTPClientTransport(new URL(`${service.origin}/mcp`));
 await client.connect(transport);t.after(()=>client.close());
 const tools=await client.listTools();assert.deepEqual(tools.tools.map(tool=>tool.name),['get_creator_contract','compile_creator_plan']);
 const output=await client.callTool({name:'get_creator_contract',arguments:{}});assert.equal(output.structuredContent.schemaVersion,'creator-semantic-plan-v1');
});
