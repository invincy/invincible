const encoder=new TextEncoder();
const digest=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value))),byte=>byte.toString(16).padStart(2,'0')).join('');
function mp3Blob(result){
 if(!result||result.mimeType!=='audio/mpeg'||typeof result.audioBase64!=='string')throw Error('Google TTS did not return an MP3.');
 const binary=atob(result.audioBase64),bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
 if(!bytes.length||bytes.length>15*1024*1024)throw Error('Generated MP3 must be under 15 MB for local analysis.');
 return new Blob([bytes],{type:'audio/mpeg'});
}
function executableScenes(payload){return Array.isArray(payload?.creatorStudio?.scenes)&&payload.creatorStudio.scenes.length>0&&payload.creatorStudio.scenes.every(scene=>scene.mapAnimation||scene.contextCard===true);}
function missingMapDetails(payload){return [...new Set((payload?.analysis?.scenes||[]).flatMap(scene=>scene.missingInfo||[]).filter(message=>/geometry|placement|route|mapAnimation/i.test(message)))];}

/** Runs the existing TTS → paired local analysis → native Video Studio export path. */
export async function runAiProduction({
 uid,projectId,title,script,creativeInstructions='',voiceRequest,loadCheckpoint,loadAudio,saveCheckpoint,
 generateVoiceover,analyzeVoiceover,importProduction,saveVideo,exportVideo,onProgress=()=>{}
}){
 if(!uid||!projectId)throw Error('Sign in and open a Creator project before generating a video.');
 const narration=String(script||'').trim();if(!narration)throw Error('Add narration to this Creator project first.');
 if(!voiceRequest||voiceRequest.text!==narration)throw Error('The selected Google voice settings do not match this narration.');
 const name=String(title||'Invincible AI video').slice(0,200),instructions=String(creativeInstructions||'').trim();
 const audioFingerprint=await digest(JSON.stringify({uid,projectId,narration,voiceRequest}));
 const planFingerprint=await digest(JSON.stringify({audioFingerprint,instructions,plannerVersion:'invincible-local-plan-v2'}));
 let checkpoint=await loadCheckpoint(),audio=null,payload=null;
 if(checkpoint?.audioFingerprint===audioFingerprint&&checkpoint.audioAvailable)audio=await loadAudio();
 if(!audio){
  onProgress({stage:'voiceover',message:'Generating narration with Google TTS…'});
  audio=mp3Blob(await generateVoiceover(voiceRequest));
  await saveCheckpoint({title:name,creativeInstructions:instructions,audioFingerprint,planFingerprint,stage:'voiceover-ready'},audio);
 }
 if(checkpoint?.planFingerprint===planFingerprint&&checkpoint.analysis&&checkpoint.creatorStudio){
  payload={analysis:checkpoint.analysis,creatorStudio:checkpoint.creatorStudio};
 }else{
  onProgress({stage:'analysis',message:'Whisper is timing the narration; Qwen is planning scenes…'});
  payload=await analyzeVoiceover({title:name,creativeInstructions:instructions,audio});
  if(!payload?.analysis?.valid||!Array.isArray(payload.creatorStudio?.scenes)||!payload.creatorStudio.scenes.length)throw Error(payload?.analysis?.errors?.join(' ')||'Local AI did not return a valid Creator Studio scene plan.');
  checkpoint={title:name,creativeInstructions:instructions,audioFingerprint,planFingerprint,stage:'plan-ready',audioAvailable:true,analysis:payload.analysis,creatorStudio:payload.creatorStudio};
  await saveCheckpoint(checkpoint,audio);
 }
 if(!executableScenes(payload))return{status:'blocked',payload,missingInfo:missingMapDetails(payload),audioFingerprint,planFingerprint};
 onProgress({stage:'import',message:'Importing approved animations and the original narration…'});
 await importProduction(payload.creatorStudio.scenes,audio,{title:name,allowContextCards:true});
 onProgress({stage:'save',message:'Saving the editable video draft…'});
 await saveVideo();
 onProgress({stage:'render',message:'Rendering the MP4 with synchronized narration…'});
 const video=await exportVideo();
 if(!(video instanceof Blob)||video.size<16||video.type!=='video/mp4')throw Error('The renderer did not return a verified MP4 file.');
 const head=new Uint8Array(await video.slice(0,64).arrayBuffer());
 if(!new TextDecoder().decode(head).includes('ftyp'))throw Error('The rendered file is missing the MP4 container signature.');
 const complete={...checkpoint,title:name,creativeInstructions:instructions,audioFingerprint,planFingerprint,stage:'completed',completedAt:Date.now(),analysis:payload.analysis,creatorStudio:payload.creatorStudio};
 await saveCheckpoint(complete,audio);
 onProgress({stage:'complete',message:'Video exported and the editable Creator Studio draft was saved.'});
 return{status:'completed',payload,video,audioFingerprint,planFingerprint};
}
