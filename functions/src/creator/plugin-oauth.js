const {createHash,randomBytes,timingSafeEqual}=require('node:crypto');

const SCOPES=Object.freeze(['creator.read','creator.compile']);
const DEFAULT_SCOPE=SCOPES.join(' ');
const ACCESS_TTL_SECONDS=60*60;
const REFRESH_TTL_SECONDS=90*24*60*60;
const CODE_TTL_SECONDS=5*60;

function clean(value,max=4000){return String(value||'').trim().slice(0,max);}
function token(bytes=32){return randomBytes(bytes).toString('base64url');}
function digest(value){return createHash('sha256').update(String(value)).digest('base64url');}
function challenge(value){return digest(value);}
function safeEqual(left,right){
 const a=Buffer.from(String(left)),b=Buffer.from(String(right));
 return a.length===b.length&&timingSafeEqual(a,b);
}
function normalizeScope(value=DEFAULT_SCOPE){
 const requested=[...new Set(clean(value,500).split(/\s+/).filter(Boolean))];
 if(!requested.length||requested.some(item=>!SCOPES.includes(item)))throw Error('Unsupported OAuth scope.');
 return requested.join(' ');
}
function allowedRedirectUri(value){
 try{
  const url=new URL(value);
  const host=url.hostname.toLowerCase();
  if(url.protocol==='http:'&&['127.0.0.1','[::1]','localhost'].includes(host))return true;
  if(url.protocol!=='https:')return false;
  return host==='chatgpt.com'||host.endsWith('.chatgpt.com')||host==='openai.com'||host.endsWith('.openai.com');
 }catch{return false;}
}
function validateClientRegistration(input={}){
 const redirectUris=Array.isArray(input.redirect_uris)?input.redirect_uris.map(value=>clean(value,1000)):[];
 if(!redirectUris.length||redirectUris.length>10||redirectUris.some(value=>!allowedRedirectUri(value)))throw Error('Only supported OpenAI HTTPS or local Codex callback URLs may be registered.');
 if(input.token_endpoint_auth_method&&input.token_endpoint_auth_method!=='none')throw Error('Only public PKCE clients are supported.');
 const grantTypes=input.grant_types||['authorization_code','refresh_token'];
 if(!Array.isArray(grantTypes)||grantTypes.some(value=>!['authorization_code','refresh_token'].includes(value)))throw Error('Unsupported grant type.');
 const responseTypes=input.response_types||['code'];
 if(!Array.isArray(responseTypes)||responseTypes.length!==1||responseTypes[0]!=='code')throw Error('Only authorization code response type is supported.');
 return{redirectUris,clientName:clean(input.client_name||'ChatGPT',120),grantTypes:[...new Set(grantTypes)],responseTypes:['code'],scope:normalizeScope(input.scope||DEFAULT_SCOPE)};
}
function validateAuthorizationRequest(input,{client,resourceUrl}={}){
 const responseType=clean(input.response_type,40),clientId=clean(input.client_id,200),redirectUri=clean(input.redirect_uri,1000),state=clean(input.state,1000),codeChallenge=clean(input.code_challenge,200),method=clean(input.code_challenge_method,20),resource=clean(input.resource,1000);
 if(responseType!=='code'||!clientId||!client)throw Error('Invalid OAuth authorization request.');
 if(!client.redirectUris?.includes(redirectUri))throw Error('OAuth redirect URL does not match the registered client.');
 if(!state)throw Error('OAuth state is required.');
 if(method!=='S256'||!/^[A-Za-z0-9_-]{43,128}$/.test(codeChallenge))throw Error('PKCE S256 is required.');
 if(resource!==resourceUrl)throw Error('OAuth resource does not match the Invincible plugin.');
 return{responseType,clientId,redirectUri,state,codeChallenge,resource,scope:normalizeScope(input.scope||DEFAULT_SCOPE)};
}
function authorizationServerMetadata(issuer){return{
 issuer,authorization_endpoint:`${issuer}/authorize`,token_endpoint:`${issuer}/token`,registration_endpoint:`${issuer}/register`,revocation_endpoint:`${issuer}/revoke`,
 response_types_supported:['code'],grant_types_supported:['authorization_code','refresh_token'],token_endpoint_auth_methods_supported:['none'],code_challenge_methods_supported:['S256'],scopes_supported:SCOPES,authorization_response_iss_parameter_supported:true,
};}
function protectedResourceMetadata(resource,issuer){return{resource,authorization_servers:[issuer],scopes_supported:SCOPES,bearer_methods_supported:['header'],resource_name:'Invincible Video Director'};}

module.exports={SCOPES,DEFAULT_SCOPE,ACCESS_TTL_SECONDS,REFRESH_TTL_SECONDS,CODE_TTL_SECONDS,clean,token,digest,challenge,safeEqual,normalizeScope,allowedRedirectUri,validateClientRegistration,validateAuthorizationRequest,authorizationServerMetadata,protectedResourceMetadata};
