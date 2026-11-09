const {mkdtemp,writeFile,readFile,rm}=require('node:fs/promises');
const path=require('node:path'),os=require('node:os'),{execFile}=require('node:child_process'),{promisify}=require('node:util');
const {getApp}=require('firebase-admin/app');
const {normalizeVoices,parseInput,prepareRequests,readWav,makeWav,SAMPLE_RATE}=require('./tts-model');
const {geminiVoices}=require('./tts-gemini');
const execute=promisify(execFile);
class GoogleTtsError extends Error{constructor(status){super('Google Text-to-Speech request failed.');this.status=status;}}
async function googleRequest(route,body,{fetcher=fetch,credential=getApp().options.credential}={}){
 const {access_token}=await credential.getAccessToken();
 const response=await fetcher('https://texttospeech.googleapis.com/v1/'+route,{
  method:body?'POST':'GET',headers:{Authorization:'Bearer '+access_token,...(body?{'Content-Type':'application/json'}:{})},
  ...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(90000)
 });
 if(!response.ok)throw new GoogleTtsError(response.status);
 return response.json();
}
let cachedVoices=null,voicesAt=0;
async function listVoices(request=googleRequest){
 if(request===googleRequest&&cachedVoices&&Date.now()-voicesAt<300000)return cachedVoices;
 const voices=[...normalizeVoices((await request('voices')).voices||[]),...geminiVoices()];
 if(request===googleRequest){cachedVoices=voices;voicesAt=Date.now();}
 return voices;
}
async function encodeMp3(wav,{ffmpeg=require('ffmpeg-static'),tempRoot=os.tmpdir()}={}){
 const tempBase=path.resolve(tempRoot),directory=await mkdtemp(path.join(tempBase,'invincible-tts-'));
 if(path.dirname(path.resolve(directory))!==tempBase||!path.basename(directory).startsWith('invincible-tts-'))throw Error('Unexpected temporary audio directory.');
 try{
  const input=path.join(directory,'voice.wav'),output=path.join(directory,'voice.mp3');
  await writeFile(input,wav);
  await execute(ffmpeg,['-v','error','-nostdin','-y','-i',input,'-codec:a','libmp3lame','-b:a','160k',output],{timeout:90000,maxBuffer:65536});
  await execute(ffmpeg,['-v','error','-xerror','-nostdin','-i',output,'-f','null','-'],{timeout:90000,maxBuffer:65536});
  const bytes=await readFile(output);
  if(!bytes.length)throw Error('MP3 encoding produced empty audio.');
  return bytes;
 }finally{await rm(directory,{recursive:true,force:true});}
}
async function generate(data,{voices,request=googleRequest,encoder=encodeMp3}={}){
 voices=voices||await listVoices(request);
 const voice=voices.find(v=>v.name===data?.voiceName),input=parseInput(data,voice),requests=prepareRequests(input,voice);
 const chunks=[];let pcmBytes=0;
 for(const part of requests){
  const audioConfig={audioEncoding:'LINEAR16',sampleRateHertz:SAMPLE_RATE,volumeGainDb:input.volume};
  if(voice.capabilities.speed&&voice.family!=='Gemini')audioConfig.speakingRate=input.speed;
  if(voice.capabilities.pitch)audioConfig.pitch=input.pitch;
  const response=await request('text:synthesize',{input:part,voice:{languageCode:input.languageCode,name:voice.speaker||voice.name,...(input.modelName?{modelName:input.modelName}:{})},audioConfig});
  if(typeof response.audioContent!=='string')throw Error('Google returned no audio.');
  const pcm=readWav(Buffer.from(response.audioContent,'base64'));
  pcmBytes+=pcm.length;
  if(pcmBytes>SAMPLE_RATE*2*600)throw Error('Audio exceeds the ten-minute recording limit. Split this narration.');
  chunks.push(pcm);
 }
 const mp3=await encoder(makeWav(chunks));
 if(mp3.length>15*1024*1024)throw Error('The MP3 is too large for one download. Split this narration.');
 return {audioBase64:mp3.toString('base64'),mimeType:'audio/mpeg',filename:input.filename,durationSeconds:pcmBytes/(SAMPLE_RATE*2),voiceName:voice.name,requests:requests.length};
}
module.exports={googleRequest,listVoices,encodeMp3,generate,GoogleTtsError};
