const {createHash}=require('node:crypto');
const TYPES={'image/png':'image','image/jpeg':'image','image/webp':'image','video/mp4':'video','video/webm':'video','audio/mpeg':'audio','audio/wav':'audio','audio/x-wav':'audio','model/gltf-binary':'glb'};
const assetId=v=>{if(typeof v!=='string'||!/^cloud-[a-f0-9]{64}$/.test(v))throw Error('Invalid cloud asset ID.');return v;};
const projectId=v=>{if(typeof v!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(v))throw Error('Invalid project ID.');return v;};
function metadata(input){
 const id=assetId(input.id),kind=TYPES[input.mimeType];
 if(!kind||!Number.isInteger(input.size)||input.size<12||input.size>100*1024*1024)throw Error('Use a supported image, audio, video or GLB up to 100 MB.');
 if(typeof input.name!=='string'||!input.name.trim()||input.name.length>200)throw Error('Give the file a name under 200 characters.');
 const out={id,name:input.name,kind,mimeType:input.mimeType,size:input.size,credit:String(input.credit||'').slice(0,2000)};
 for(const p of ['width','height','duration'])if(input[p]!==undefined){if(!Number.isFinite(input[p])||input[p]<=0||input[p]>(p==='duration'?600:40000))throw Error('Invalid media dimensions or duration.');out[p]=input[p];}
 return out;
}
function verifyBytes(bytes,record){
 if(bytes.length!==record.size||'cloud-'+createHash('sha256').update(bytes).digest('hex')!==record.id)throw Error('Uploaded bytes do not match the original file.');
 const mime=record.mimeType,b=bytes;
 const good=mime==='image/png'?b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):mime==='image/jpeg'?b[0]===255&&b[1]===216&&b[2]===255:mime==='image/webp'?b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP':mime==='video/mp4'?b.toString('ascii',4,8)==='ftyp':mime==='video/webm'?b.subarray(0,4).equals(Buffer.from([26,69,223,163])):mime==='audio/mpeg'?b.toString('ascii',0,3)==='ID3'||b[0]===255&&(b[1]&224)===224:mime==='audio/wav'||mime==='audio/x-wav'?b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WAVE':b.toString('ascii',0,4)==='glTF'&&b.readUInt32LE(4)===2&&b.readUInt32LE(8)===b.length;
 if(!good)throw Error('File content does not match its media type.');
 if(mime==='model/gltf-binary'){const n=b.readUInt32LE(12);if(n+20>b.length||b.readUInt32LE(16)!==0x4e4f534a)throw Error('Invalid GLB.');const g=JSON.parse(b.toString('utf8',20,20+n));if([...(g.buffers||[]),...(g.images||[])].some(x=>x.uri))throw Error('GLB resources must be embedded.');}
}
module.exports={assetId,projectId,metadata,verifyBytes};
