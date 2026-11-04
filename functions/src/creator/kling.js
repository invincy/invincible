// Official remote MCP. Credentials are supplied only by Functions Secret Manager.
const ENDPOINT='https://kling.ai/mcp';
function readable(result){if(result?.isError)throw Error('Kling rejected the read-only request.');return result;}
async function rpc(fetcher,token,method,params,session){
 const response=await fetcher(ENDPOINT,{method:'POST',headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json','Accept':'application/json, text/event-stream',...(session?{'Mcp-Session-Id':session,'MCP-Protocol-Version':'2025-03-26'}:{})},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error('Kling connection failed ('+response.status+'). Reauthorize the backend OAuth credential.');
 const body=await response.text();if(body.length>1000000)throw Error('Kling response exceeds the supported size.');
 let data;try{data=JSON.parse(body);}catch{data=body.split('\n').filter(l=>l.startsWith('data:')).map(l=>{try{return JSON.parse(l.slice(5));}catch{return null;}}).find(d=>d?.id===1);}
 if(!data||data.error)throw Error('Kling MCP protocol request failed.');return {result:readable(data.result),session:response.headers.get('mcp-session-id')||session};
}
async function discoverKling({token,fetcher=fetch}){
 if(!token)throw Error('Kling is not configured. Provision OAuth credentials in backend Secret Manager.');
 const init=await rpc(fetcher,token,'initialize',{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'invincible-creator',version:'1.0.0'}});
 // Required MCP initialized notification precedes capability discovery.
 const notification=await fetcher(ENDPOINT,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json','Accept':'application/json, text/event-stream',...(init.session?{'Mcp-Session-Id':init.session,'MCP-Protocol-Version':'2025-03-26'}:{})},body:JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'}),signal:AbortSignal.timeout(20000)});
 if(!notification.ok)throw Error('Kling MCP initialization was not accepted.');
 const listed=await rpc(fetcher,token,'tools/list',{},init.session),tools=listed.result?.tools||[];
 const identityTool=tools.find(t=>t.name==='who_am_i');if(!identityTool)throw Error('Official identity tool is unavailable.');
 if(identityTool.inputSchema?.required?.length)throw Error('Identity tool schema changed; review before enabling.');
 const identity=await rpc(fetcher,token,'tools/call',{name:'who_am_i',arguments:{}},init.session);
 const membership=tools.find(t=>t.name==='query_membership_and_credits');
 // Do not guess identity argument names or claim discovered tools establish eligibility.
 let credits=null;if(membership&&!(membership.inputSchema?.required?.length))credits=(await rpc(fetcher,token,'tools/call',{name:membership.name,arguments:{}},init.session)).result;
 return {generationEnabled:false,eligibility:'unverified',identity:identity.result,credits,tools:tools.map(t=>({name:t.name,inputSchema:t.inputSchema})),membershipCheckRequired:credits===null,notice:'Read-only discovery. Paid Personal credits only; bonus and Team credits are not assumed usable. Recheck model schemas before submission.'};
}
function assertAccess(auth,project){
 if(!auth)throw Error('Sign in to Creator Studio.');
 if(!project||!(project.ownerUid===auth.uid||(auth.token?.email_verified===true&&project.editorEmails?.includes(String(auth.token.email||'').toLowerCase()))))throw Error('Project access denied.');
}
function decodeVideo(data){
 if(!['video/mp4','video/webm'].includes(data.mimeType)||typeof data.base64!=='string'||data.base64.length>7000000||!data.base64.length||!/^[A-Za-z0-9+/]*={0,2}$/.test(data.base64)||data.base64.length%4)throw Error('Use an MP4 or WebM file up to 5 MB.');
 const bytes=Buffer.from(data.base64,'base64');if(bytes.length>5*1024*1024||bytes.length<12)throw Error('Invalid or oversized video.');
 if(data.mimeType==='video/mp4'&&bytes.toString('ascii',4,8)!=='ftyp')throw Error('Invalid MP4 file header.');
 if(data.mimeType==='video/webm'&&!bytes.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3])))throw Error('Invalid WebM file header.');return bytes;
}
module.exports={discoverKling,assertAccess,decodeVideo};
