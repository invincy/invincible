const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const oauth=require('../src/creator/plugin-oauth');

// Exercise the production HTTP boundary without Firebase credentials or SDK startup.
// Tool/patch behavior remains covered by creator-plugin-oauth.test.js.
const source=fs.readFileSync(require.resolve('../src/creator/plugin-cloud'),'utf8');
const boundary=source.slice(source.indexOf('function challengeResponse('),source.indexOf('\nObject.defineProperties(exports,'));
const MCP_BASE='https://asia-south1-life-by-adichimp.cloudfunctions.net/creatorPluginMcp';
const MCP_RESOURCE=MCP_BASE+'/mcp';
const AUTH_BASE='https://asia-south1-life-by-adichimp.cloudfunctions.net/creatorPluginAuth';
function setup(identity=null,{failDispatch=false}={}){
 const calls=[];
 const server={async connect(){calls.push('connect');},async close(){calls.push('server.close');}};
 class Transport{
  constructor(){calls.push('transport');}
  async handleRequest(request,response,body){calls.push('dispatch');if(failDispatch)throw Error('internal secret');response.status(200).json({jsonrpc:'2.0',id:body?.id,result:{ok:true}});}
  async close(){calls.push('transport.close');}
 }
 const sandbox={exports:{},REGION:'asia-south1',MCP_BASE,MCP_RESOURCE,AUTH_BASE,oauth,URL,
  onRequest:(_options,handler)=>handler,
  pathOf:request=>new URL(request.url,'https://example.test').pathname.replace(/^\/creatorPlugin(?:Auth|Mcp)/,'')||'/',
  json:(response,status,body)=>response.status(status).set('Cache-Control','no-store').json(body),
  authenticate:async()=>{calls.push('authenticate');return identity;},
  createServer:value=>{assert.equal(value,identity);calls.push('server');return server;},
  StreamableHTTPServerTransport:Transport
 };
 vm.runInNewContext(boundary,sandbox,{filename:'plugin-cloud-http-boundary.js'});
 const response={statusCode:200,headers:{},headersSent:false,body:undefined,
  status(code){this.statusCode=code;return this;},
  set(name,value){this.headers[name.toLowerCase()]=value;return this;},
  json(body){this.body=body;this.headersSent=true;return this;},
  end(){this.headersSent=true;return this;}
 };
 return{handler:sandbox.exports.creatorPluginMcp,response,calls};
}
function request(method='POST',url='/mcp',authorization=''){
 return{method,url,body:{jsonrpc:'2.0',id:1,method:'initialize',params:{}},get:name=>name.toLowerCase()==='authorization'?authorization:undefined};
}
for(const [name,authorization]of [['missing token',''],['invalid token','Bearer invalid'],['expired token','Bearer expired']]){
 test('HTTP OAuth challenge for '+name+' precedes MCP startup',async()=>{
  const {handler,response,calls}=setup(null);
  await handler(request('POST','/mcp',authorization),response);
  assert.equal(response.statusCode,401);
  assert.equal(response.body.error,'invalid_token');
  assert.equal(response.headers['cache-control'],'no-store');
  assert.equal(response.headers['www-authenticate'],'Bearer resource_metadata="'+MCP_BASE+'/.well-known/oauth-protected-resource"');
  assert.deepEqual(calls,['authenticate']);
 });
}
test('public resource discovery still works without an account',async()=>{
 for(const path of ['/.well-known/oauth-protected-resource','/mcp/.well-known/oauth-protected-resource']){
  const {handler,response,calls}=setup();
  await handler(request('GET',path),response);
  assert.equal(response.statusCode,200);
  assert.equal(response.body.resource,MCP_RESOURCE);
  assert.equal(response.body.authorization_servers[0],AUTH_BASE);
  assert.deepEqual(calls,[]);
 }
});
test('public health remains available without account access',async()=>{
 const {handler,response,calls}=setup();
 await handler(request('GET','/health'),response);
 assert.equal(response.statusCode,200);assert.equal(response.body.ok,true);assert.deepEqual(calls,[]);
});
test('unknown paths and unsupported methods do not create an MCP server',async()=>{
 for(const [method,path,status]of [['POST','/unknown',404],['GET','/mcp',405]]){
  const {handler,response,calls}=setup();
  await handler(request(method,path),response);
  assert.equal(response.statusCode,status);assert.deepEqual(calls,[]);
 }
});
test('valid account dispatches normally and closes the transport',async()=>{
 const {handler,response,calls}=setup({uid:'owner',scope:['creator.read']});
 await handler(request(),response);
 assert.equal(response.statusCode,200);assert.equal(response.body.result.ok,true);
 assert.deepEqual(calls,['authenticate','server','transport','connect','dispatch','transport.close','server.close']);
 assert.equal(response.headers['www-authenticate'],undefined);
});
test('dispatch failures do not disclose internal errors and still close resources',async()=>{
 const {handler,response,calls}=setup({uid:'owner'},{failDispatch:true});
 await handler(request(),response);
 assert.equal(response.statusCode,500);
 assert.equal(response.body.error.message,'Invincible plugin request failed.');
 assert.equal(JSON.stringify(response.body).includes('internal secret'),false);
 assert.deepEqual(calls.slice(-2),['transport.close','server.close']);
});
