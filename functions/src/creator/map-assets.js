const {createHash}=require('node:crypto');
const id=v=>{if(typeof v!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(v))throw Error('Invalid record ID.');return v;};
function decodeAsset(data){
 if(typeof data.base64!=='string'||!data.base64.length||data.base64.length>7000000||data.base64.length%4||!/^[A-Za-z0-9+/]*={0,2}$/.test(data.base64))throw Error('Use an image or GLB up to 5 MB.');
 const b=Buffer.from(data.base64,'base64');if(b.length<12||b.length>5*1024*1024)throw Error('Invalid or oversized asset.');
 const mime=data.mimeType;
 if(mime==='image/png'){if(!b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||b.length<24||b.toString('ascii',12,16)!=='IHDR'||!b.readUInt32BE(16)||!b.readUInt32BE(20)||b.readUInt32BE(16)*b.readUInt32BE(20)>40000000)throw Error('Invalid PNG dimensions/header.');}
 else if(mime==='image/jpeg'){if(b[0]!==255||b[1]!==216||b[2]!==255||b.at(-2)!==255||b.at(-1)!==217)throw Error('Invalid JPEG header.');}
 else if(mime==='image/webp'){if(b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP'||b.readUInt32LE(4)+8!==b.length)throw Error('Invalid WebP header.');}
 else if(mime==='model/gltf-binary'){
  if(b.toString('ascii',0,4)!=='glTF'||b.readUInt32LE(4)!==2||b.readUInt32LE(8)!==b.length||b.length<20||b.readUInt32LE(16)!==0x4e4f534a)throw Error('Use a GLB version 2 model.');
  const n=b.readUInt32LE(12);if(n%4||n+20>b.length)throw Error('Invalid GLB JSON chunk.');let g;try{g=JSON.parse(b.toString('utf8',20,20+n));}catch{throw Error('Invalid GLB JSON.');}
  if(g.asset?.version!=='2.0'||[...(g.buffers||[]),...(g.images||[])].some(x=>x.uri))throw Error('GLB resources must be embedded as buffer views, without external URLs.');
 }else throw Error('Use PNG, JPEG, WebP or GLB.');
 return {bytes:b,type:mime==='model/gltf-binary'?'glb':'image',hash:createHash('sha256').update(b).digest('hex')};
}
function storagePath(projectId,assetId){return `creatorProjects/${id(projectId)}/mapAssets/${id(assetId)}`;}
function assetRecord(data,projectId,decoded){return {id:id(data.assetId),name:String(data.name||'Custom map asset').slice(0,150),credit:String(data.credit||'').slice(0,1000),type:decoded.type,mimeType:data.mimeType,storageProjectId:id(projectId),storagePath:storagePath(projectId,data.assetId),sha256:decoded.hash,createdAt:new Date().toISOString()};}
module.exports={id,decodeAsset,storagePath,assetRecord};
