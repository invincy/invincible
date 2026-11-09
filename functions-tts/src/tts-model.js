const {DOMParser,XMLSerializer}=require('@xmldom/xmldom');
const MAX_INPUT_BYTES=30000,CHUNK_BYTES=4400,SAMPLE_RATE=24000;
const bytes=value=>Buffer.byteLength(value,'utf8');
const escapeXml=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function capabilities(name){
 if(/-(Neural2|Wavenet|Standard|News)-/.test(name))return {supported:true,ssml:true,pitch:true,speed:true,emphasis:true};
 if(/-Chirp3-HD-/.test(name))return {supported:true,ssml:true,pitch:false,speed:true,emphasis:false};
 if(/-Studio-/.test(name))return {supported:true,ssml:true,pitch:true,speed:true,emphasis:false};
 return {supported:false,ssml:false,pitch:false,speed:false,emphasis:false};
}
function normalizeVoices(voices){
 return voices.filter(v=>typeof v.name==='string'&&Array.isArray(v.languageCodes)).map(v=>({
  name:v.name,languageCodes:v.languageCodes,gender:v.ssmlGender||'SSML_VOICE_GENDER_UNSPECIFIED',
  family:v.name.replace(/^[a-z]{2,3}-[A-Za-z0-9]+-/,'').replace(/-[^-]+$/,''),
  capabilities:capabilities(v.name)
 })).sort((a,b)=>a.name.localeCompare(b.name));
}
function number(value,fallback,min,max,label){
 const result=value===undefined?fallback:value;
 if(typeof result!=='number'||!Number.isFinite(result)||result<min||result>max)throw Error(label+' is outside the supported range.');
 return result;
}
function parseInput(data,voice){
 if(!data||typeof data!=='object'||typeof data.text!=='string'||!data.text.trim())throw Error('Paste narration first.');
 if(bytes(data.text)>MAX_INPUT_BYTES)throw Error('Narration exceeds 30,000 UTF-8 bytes. Split it into separate recordings.');
 if(!voice?.capabilities?.supported)throw Error('This voice family is not supported in this workspace yet.');
 if(typeof data.languageCode!=='string'||!voice.languageCodes.includes(data.languageCode))throw Error('Choose a language supported by this voice.');
 const mode=data.mode||'text';
 if(!['text','ssml'].includes(mode))throw Error('Choose plain text or SSML.');
 const speed=number(data.speed,1,.25,2,'Speed'),pitch=number(data.pitch,0,-20,20,'Pitch');
 const volume=number(data.volume,0,-12,6,'Volume'),pause=number(data.paragraphPause,0,0,1500,'Paragraph pause');
 if(!voice.capabilities.pitch&&pitch!==0)throw Error('Pitch control is unavailable for this voice.');
 if(!voice.capabilities.speed&&speed!==1)throw Error('Speed control is unavailable for this voice.');
 if(mode==='ssml'&&!voice.capabilities.ssml)throw Error('This voice does not support SSML.');
 if(mode==='ssml'&&pause!==0)throw Error('Use break tags for pauses in SSML mode.');
 if(pause&&!voice.capabilities.ssml)throw Error('Paragraph pauses are unavailable for this voice.');
 const title=typeof data.title==='string'?data.title:'voiceover';
 const filename=(title.normalize('NFKC').replace(/[\u0000-\u001f<>:"/\\|?*]/g,'').trim().slice(0,100)||'voiceover')+'.mp3';
 return {text:data.text,mode,speed,pitch,volume,pause,filename,languageCode:data.languageCode,voiceName:voice.name};
}
function splitText(text,limit=CHUNK_BYTES){
 // Keep whitespace and every Unicode code point. Prefer punctuation/word boundaries.
 const chunks=[];let current='';
 for(const token of text.match(/\S+\s*|\s+/gu)||[]){
  if(bytes(current+token)<=limit){current+=token;continue;}
  if(current){chunks.push(current);current='';}
  if(bytes(token)<=limit){current=token;continue;}
  for(const char of token){if(bytes(current+char)>limit){chunks.push(current);current='';}current+=char;}
 }
 if(current)chunks.push(current);
 return chunks;
}
const attributes={
 speak:[],p:[],s:[],break:['time','strength'],emphasis:['level'],
 prosody:['rate','pitch','volume'],'say-as':['interpret-as','format','detail'],
 sub:['alias'],phoneme:['alphabet','ph']
};
function splitSsml(source,voice){
 if(/<!|<\?/.test(source))throw Error('SSML declarations, comments and entities are not supported.');
 let doc;
 try{doc=new DOMParser({onError:()=>{throw Error('Malformed SSML.');}}).parseFromString(source,'application/xml');}
 catch{throw Error('SSML is not valid XML. Check opening and closing tags.');}
 const root=doc.documentElement,serializer=new XMLSerializer();
 if(!root||root.tagName!=='speak'||Array.from(doc.childNodes).some(n=>n!==root&&n.nodeType!==3))throw Error('SSML must have one speak root.');
 function validate(node,depth=0){
  if(depth>16)throw Error('SSML nesting is too deep.');
  if(node.nodeType===3)return;
  if(node.nodeType!==1||!Object.hasOwn(attributes,node.tagName))throw Error('Unsupported SSML element. Use speech, pronunciation and pause tags only.');
  for(const attr of Array.from(node.attributes))if(!attributes[node.tagName].includes(attr.name))throw Error('Unsupported attribute on '+node.tagName+'.');
  if(node.tagName==='speak'&&node!==root)throw Error('Only one speak root is allowed.');
  if(node.tagName==='emphasis'&&!voice.capabilities.emphasis)throw Error('This voice does not support emphasis tags.');
  if(/-Studio-/.test(voice.name)&&node.tagName==='prosody')throw Error('Studio voices do not support prosody tags.');
  if(node.tagName==='break'){
   if(node.childNodes.length)throw Error('A break tag must be empty.');
   if(node.hasAttribute('time')){
    const match=node.getAttribute('time').match(/^(\d+(?:\.\d+)?)(ms|s)$/);
    if(!match||Number(match[1])*(match[2]==='s'?1000:1)>10000)throw Error('Break time must be at most 10 seconds.');
   }
  }
  for(const child of Array.from(node.childNodes))validate(child,depth+1);
 }
 validate(root);
 const wrap=(value,ancestors)=>'<speak>'+ancestors.map(n=>serializer.serializeToString(n.cloneNode(false)).replace(/\/>$/,'>')).join('')+value+ancestors.slice().reverse().map(n=>'</'+n.tagName+'>').join('')+'</speak>';
 const fragments=[];
 function emit(node,ancestors){
  const raw=serializer.serializeToString(node);
  if(bytes(wrap(raw,ancestors))<=CHUNK_BYTES){fragments.push(wrap(raw,ancestors));return;}
  if(node.nodeType===3){
   let current='';
   for(const char of node.data){if(bytes(wrap(escapeXml(current+char),ancestors))>CHUNK_BYTES){if(!current)throw Error('SSML wrapper is too large.');fragments.push(wrap(escapeXml(current),ancestors));current='';}current+=char;}
   if(current)fragments.push(wrap(escapeXml(current),ancestors));return;
  }
  if(['sub','phoneme','say-as','break'].includes(node.tagName)||!node.childNodes.length)throw Error('A pronunciation fragment exceeds the request limit.');
  for(const child of Array.from(node.childNodes))emit(child,[...ancestors,node]);
 }
 for(const node of Array.from(root.childNodes))emit(node,[]);
 // Combine independent fragments under one speak root, avoiding needless requests.
 const chunks=[];let inner='';
 for(const fragment of fragments){
  const body=fragment.slice(7,-8);
  if(bytes('<speak>'+inner+body+'</speak>')>CHUNK_BYTES){if(inner)chunks.push({ssml:'<speak>'+inner+'</speak>'});inner=body;}else inner+=body;
 }
 if(inner)chunks.push({ssml:'<speak>'+inner+'</speak>'});
 if(!chunks.length||!root.textContent.trim())throw Error('SSML contains no narration.');
 return chunks;
}
function prepareRequests(input,voice){
 if(input.mode==='ssml')return splitSsml(input.text,voice);
 if(input.pause){
  const ssml='<speak>'+input.text.split(/(\n\s*\n)/).map(part=>/^\n\s*\n$/.test(part)?'<break time="'+input.pause+'ms"/>':escapeXml(part)).join('')+'</speak>';
  return splitSsml(ssml,voice);
 }
 return splitText(input.text).map(text=>({text}));
}
function readWav(buffer){
 if(buffer.length<44||buffer.toString('ascii',0,4)!=='RIFF'||buffer.toString('ascii',8,12)!=='WAVE')throw Error('Google returned invalid WAV audio.');
 let format,pcm;
 for(let offset=12;offset+8<=buffer.length;){
  const name=buffer.toString('ascii',offset,offset+4),size=buffer.readUInt32LE(offset+4),start=offset+8;
  if(start+size>buffer.length)throw Error('Truncated WAV audio.');
  if(name==='fmt '){if(size<16)throw Error('Invalid WAV format.');format={encoding:buffer.readUInt16LE(start),channels:buffer.readUInt16LE(start+2),rate:buffer.readUInt32LE(start+4),bits:buffer.readUInt16LE(start+14)};}
  if(name==='data')pcm=buffer.subarray(start,start+size);
  offset=start+size+(size%2);
 }
 if(!format||format.encoding!==1||format.channels!==1||format.rate!==SAMPLE_RATE||format.bits!==16||!pcm?.length||pcm.length%2)throw Error('Unexpected PCM format.');
 return pcm;
}
function makeWav(chunks){
 const pcm=Buffer.concat(chunks),header=Buffer.alloc(44);
 header.write('RIFF');header.writeUInt32LE(36+pcm.length,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);
 header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);header.writeUInt32LE(SAMPLE_RATE,24);
 header.writeUInt32LE(SAMPLE_RATE*2,28);header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);
 return Buffer.concat([header,pcm]);
}
module.exports={MAX_INPUT_BYTES,CHUNK_BYTES,SAMPLE_RATE,capabilities,normalizeVoices,parseInput,splitText,splitSsml,prepareRequests,readWav,makeWav};
