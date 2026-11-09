import {observeAuth} from '../shared/firebase-client.js';
import {loadVoices,generateVoiceover} from './tts-api.js';
import {createVoiceDemoPlayer} from './tts-voice-demo-player.js';
const $=id=>document.getElementById(id),fields=['title','script','mode','engine','model','direction','language','gender','family','voice','preset','speed','pitch','volume','pause'];
let user=null,voices=[],busy=false,loading=false,epoch=0,voiceEpoch=0,audioUrl=null,saveTimer;
const controls=['sample','title','script','mode','reloadVoices','preview','generate'];
const encoder=new TextEncoder();
const voiceDemo=createVoiceDemoPlayer({button:$('voiceDemo'),audio:$('voiceDemoAudio'),message:$('voiceDemoStatus'),recording:$('player'),getVoice:()=>$('voice').value,canPlay:()=>!!user&&!busy&&!loading});
function status(message,error=false){$('generationStatus').textContent=message;$('generationStatus').classList.toggle('error',error);}
function setOptions(select,options,value){select.replaceChildren(...options.map(o=>{const el=document.createElement('option');el.value=o.value;el.textContent=o.label;return el;}));if(options.some(o=>o.value===value))select.value=value;}
function selectedVoice(){return voices.find(v=>v.name===$('voice').value);}
function expressive(){return $('engine').value==='gemini';}
function refreshAvailability(){
 const voice=selectedVoice(),ready=!!user&&!busy&&!loading&&!!voice?.capabilities.supported;
 for(const id of controls)$(id).disabled=busy||loading||!user;
 $('reloadVoices').disabled=busy||loading||!user;
 $('voiceDemo').disabled=busy||loading||!user||!voiceDemo.available();
 $('voiceFields').disabled=busy||loading||!user||!voices.length;
 $('generate').disabled=!ready||!$('script').value.trim();
 $('preview').disabled=!ready||!$('script').value.trim()||$('mode').value==='ssml';
 $('pitch').disabled=!voice?.capabilities.pitch;
 $('speed').disabled=!voice?.capabilities.speed;
 $('pause').disabled=!voice?.capabilities.ssml||$('mode').value==='ssml';
 $('mode').querySelector('[value=ssml]').disabled=!voice?.capabilities.ssml;
 $('expressiveControls').hidden=!expressive();
 $('modelRow').hidden=!expressive();
 $('voiceDemo').hidden=expressive();
 $('voiceDemoStatus').hidden=expressive();
 $('deliveryHelp').hidden=expressive();
 $('familyRow').hidden=expressive();
 $('pitchRow').hidden=expressive();
 $('pauseRow').hidden=expressive();
 $('ssmlGuide').hidden=expressive();
 $('deliveryHelp').textContent=expressive()?'Style and voice direction are sent to Gemini as performance instructions.':'These presets adjust speed and pitch only.';
 $('speedHelp').textContent=expressive()?'Directed speaking pace. The resulting timing can vary.':'Changes the voice’s synthesis speed.';
 for(const value of ['sales','calm'])$('preset').querySelector('[value='+value+']').disabled=!expressive();
 $('preset').querySelector('[value=custom]').disabled=expressive();
}
function meters(){
 $('speedValue').textContent=(expressive()?'≈ ':'')+Number($('speed').value).toFixed(2)+'×';
 $('pitchValue').textContent=$('pitch').value+' semitones';$('volumeValue').textContent=$('volume').value+' dB';
 $('count').textContent=encoder.encode($('script').value).length.toLocaleString()+' / 30,000 bytes';
 $('count').classList.toggle('error',encoder.encode($('script').value).length>30000);
 $('inputHelp').textContent=expressive()?'Keep narration here and performance notes in Voice direction.':$('mode').value==='ssml'?'Your SSML controls the pauses and pronunciation. Use a speak root.':'Paragraph breaks can become pauses. Your wording stays unchanged.';
 refreshAvailability();
}
function voiceDetails(){
 voiceDemo.refresh();
 const voice=selectedVoice();
 if(!voice){$('voiceHelp').textContent='No voices match these filters.';refreshAvailability();return;}
 const cap=voice.capabilities;
 if(!cap.pitch)$('pitch').value=0;
 if(!cap.speed)$('speed').value=1;
 if(!cap.ssml&&$('mode').value==='ssml')$('mode').value='text';
 if(!cap.ssml||$('mode').value==='ssml')$('pause').value='0';
 if(!expressive()&&['sales','calm'].includes($('preset').value))$('preset').value='natural';
 if(expressive()&&$('preset').value==='custom')$('preset').value='natural';
 $('voiceHelp').textContent=cap.direction?'Use Preview opening to hear this voice with your directions.':cap.supported
  ?[cap.speed?'Speed':'',cap.pitch?'pitch':'',cap.ssml?'SSML':'',cap.emphasis?'emphasis':''].filter(Boolean).join(' · ')+(cap.pitch?'':' · Direct pitch control unavailable.')
  :'This Google voice family is listed, but generation is not supported here yet.';
 meters();
}
function filterVoices(preferred=$('voice').value){
 const matching=voices.filter(v=>(v.family==='Gemini')===expressive()&&v.languageCodes.includes($('language').value)&&(!$('gender').value||v.gender===$('gender').value)&&(expressive()||!$('family').value||v.family===$('family').value));
 setOptions($('voice'),matching.map(v=>({value:v.name,label:(v.speaker||v.name)+(v.capabilities.supported?'':' · unavailable here')})),preferred);
 voiceDetails();
}
function families(preferred=$('family').value){
 const matching=voices.filter(v=>(v.family==='Gemini')===expressive()&&v.languageCodes.includes($('language').value)&&(!$('gender').value||v.gender===$('gender').value));
 const values=[...new Set(matching.map(v=>v.family))];
 setOptions($('family'),[{value:'',label:'All families'},...values.map(value=>({value,label:value}))],preferred);
 filterVoices();
}
function key(){return 'invincible.creator.tts.draft.v1.'+user.uid;}
function remember(){
 if(!user)return;
 const snapshot=Object.fromEntries(fields.map(id=>[id,$(id).value]));
 const uid=user.uid,storageKey=key();
 clearTimeout(saveTimer);saveTimer=setTimeout(()=>{if(user?.uid!==uid)return;try{localStorage.setItem(storageKey,JSON.stringify(snapshot));$('draftStatus').textContent='Draft saved on this device';}catch{$('draftStatus').textContent='Draft could not be saved on this device';}},250);
}
function restore(){
 let draft={};try{draft=JSON.parse(localStorage.getItem(key())||'{}');}catch{}
 $('title').value=draft.title||'My voiceover';$('script').value=draft.script||'';$('mode').value=draft.mode==='ssml'?'ssml':'text';
 const hasGemini=voices.some(v=>v.family==='Gemini');
 $('engine').querySelector('[value=gemini]').disabled=!hasGemini;
 $('engine').value=hasGemini?(draft.engine||(draft.voice?'classic':'gemini')):'classic';
 $('model').value=['gemini-2.5-flash-tts','gemini-2.5-pro-tts'].includes(draft.model)?draft.model:'gemini-2.5-flash-tts';
 $('direction').value=draft.direction||'';
 for(const id of ['speed','pitch','volume','pause','preset'])if(typeof draft[id]==='string')$(id).value=draft[id];
 languages(draft.language||'hi-IN');
 $('gender').value=draft.gender??'MALE';
 families(draft.family??'Neural2');
 if(draft.voice&&Array.from($('voice').options).some(o=>o.value===draft.voice))$('voice').value=draft.voice;
 voiceDetails();
}
function languages(preferred=$('language').value){
 const matching=voices.filter(v=>(v.family==='Gemini')===expressive());
 setOptions($('language'),[...new Set(matching.flatMap(v=>v.languageCodes))].sort().map(value=>({value,label:new Intl.DisplayNames(['en'],{type:'language'}).of(value)+' · '+value+(expressive()&&value==='gu-IN'?' · Preview':'')})),preferred);
}
function clearAudio(){if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=null;$('player').pause();$('player').removeAttribute('src');$('player').load();$('download').removeAttribute('href');$('recording').hidden=true;}
function friendly(error){
 if(error?.code==='functions/not-found')return 'Voiceover generation has not been deployed to Invincible yet. Your script is kept here.';
 if(/unauthenticated/.test(error?.code||''))return 'Sign in to Invincible again. Your script is kept here.';
 return error?.message||'The request failed. Your script is kept here. Please retry when ready.';
}
async function fetchVoices({initial=false}={}){
 const current=epoch,version=++voiceEpoch;loading=true;refreshAvailability();$('accountStatus').textContent='Loading available Google voices…';$('accountStatus').classList.remove('error');
 try{
  const next=await loadVoices();
  if(current!==epoch||version!==voiceEpoch)return;
  voices=next;
  if(initial)restore();
  else {const available=voices.some(v=>v.family==='Gemini');$('engine').querySelector('[value=gemini]').disabled=!available;if(!available)$('engine').value='classic';languages();families();}
  $('accountStatus').textContent='Signed in · '+voices.length+' Google voices available';
 }catch(error){if(current!==epoch||version!==voiceEpoch)return;$('accountStatus').textContent=friendly(error);$('accountStatus').classList.add('error');}
 finally{if(current===epoch&&version===voiceEpoch){loading=false;meters();}}
}
function requestData(preview){
 const voice=selectedVoice(),text=$('script').value;
 let opening=text;
 if(preview){const short=Array.from(text).slice(0,220).join('');opening=short.length<text.length?short.replace(/\s+\S*$/u,''):short;}
 return {title:$('title').value+(preview?' - preview':''),text:opening,mode:$('mode').value,
  engine:$('engine').value,voiceName:voice.name,languageCode:$('language').value,speed:Number($('speed').value),pitch:Number($('pitch').value),volume:Number($('volume').value),paragraphPause:Number($('pause').value),
  ...(expressive()?{modelName:$('model').value,delivery:$('preset').value==='custom'?'natural':$('preset').value,direction:$('direction').value}:{})};
}
async function record(preview){
 if(busy||!user||!selectedVoice())return;
 const data=requestData(preview);
 if(!data.text.trim())return;
 if(encoder.encode(data.text).length>30000){status('The script is too long. Split it into recordings of at most 30,000 UTF-8 bytes.',true);return;}
 if(data.engine==='gemini'&&encoder.encode(data.direction).length>2000){status('Shorten Voice direction to at most 2,000 UTF-8 bytes.',true);return;}
 if(data.engine==='gemini'&&/^\s*<speak[\s>]/i.test(data.text)){status('Gemini needs plain narration. Use a classic voice for this SSML script.',true);return;}
 if(data.mode==='ssml'){const parsed=new DOMParser().parseFromString(data.text,'application/xml');if(parsed.querySelector('parsererror')||parsed.documentElement.nodeName!=='speak'){status('Check the SSML: it needs valid XML with a speak root.',true);return;}}
 const current=epoch,owner=user.uid;
 voiceDemo.stop();
 busy=true;refreshAvailability();status(preview?'Generating an opening preview…':'Generating your MP3… Long scripts can take a few minutes.');
 try{
  const result=await generateVoiceover(data);
  if(current!==epoch||user?.uid!==owner)return;
  if(typeof result.audioBase64!=='string'||result.mimeType!=='audio/mpeg')throw Error('The server returned no MP3.');
  const decoded=atob(result.audioBase64),buffer=Uint8Array.from(decoded,c=>c.charCodeAt(0));
  clearAudio();audioUrl=URL.createObjectURL(new Blob([buffer],{type:result.mimeType}));
  $('player').src=audioUrl;$('download').href=audioUrl;$('download').download=result.filename;
  $('recording').hidden=false;$('recordingInfo').textContent=result.durationSeconds.toFixed(1)+' sec · '+result.voiceName+(preview?' · opening preview':'');
  if(data.engine==='gemini')$('recordingInfo').textContent+=' · '+data.delivery+' · directed pace '+data.speed+'×';
  status(preview?'Preview ready. Listen, adjust, then generate the full recording.':'MP3 ready. Listen before downloading.');
 }catch(error){if(current===epoch)status(friendly(error),true);}
 finally{if(current===epoch){busy=false;refreshAvailability();}}
}
$('generate').addEventListener('click',()=>record(false));$('preview').addEventListener('click',()=>record(true));
$('reloadVoices').addEventListener('click',()=>fetchVoices());
 $('engine').addEventListener('change',()=>{voiceDemo.stop();languages();families();remember();});
 for(const id of ['model','direction'])$(id).addEventListener('input',remember);
$('language').addEventListener('change',()=>{families();remember();});
$('gender').addEventListener('change',()=>{families();remember();});
$('family').addEventListener('change',()=>{filterVoices();remember();});
$('voice').addEventListener('change',()=>{voiceDetails();remember();});
$('mode').addEventListener('change',()=>{voiceDetails();remember();});
$('preset').addEventListener('change',()=>{
 const settings={natural:[1,0],documentary:[.95,-1],energetic:[1.15,1],dramatic:[.9,-2]}[$('preset').value];
 if(settings&&!expressive()){$('speed').value=settings[0];$('pitch').value=selectedVoice()?.capabilities.pitch?settings[1]:0;}
 meters();remember();
});
for(const id of ['speed','pitch','volume'])$(id).addEventListener('input',()=>{if(!expressive())$('preset').value='custom';meters();remember();});
for(const id of ['title','script','pause'])$(id).addEventListener('input',()=>{meters();remember();});
$('sample').addEventListener('click',()=>{
 if($('script').value.trim()&&!confirm('Replace the current narration with a short sample?'))return;
 $('mode').value='text';$('script').value='21 अप्रैल, 1526! पानीपत के मैदान में आमने-सामने थीं दो सेनाएँ।\n\nइस कहानी में जानिए बाबर की Military Strategy और उसकी निर्णायक चाल।';
 meters();remember();
});
observeAuth(next=>{
 epoch++;voiceEpoch++;clearTimeout(saveTimer);voiceDemo.stop();busy=false;loading=false;voices=[];clearAudio();user=next;
 $('workspace').hidden=!next;$('signedOut').hidden=!!next;
 $('script').value='';$('title').value='My voiceover';
 for(const id of ['language','family','voice'])$(id).replaceChildren();
 $('mode').value='text';$('gender').value='MALE';$('preset').value='natural';$('speed').value='1';$('pitch').value='0';$('volume').value='0';$('pause').value='0';
 $('direction').value='';$('engine').value='classic';$('model').value='gemini-2.5-flash-tts';
 status('Your recording will appear here.');meters();
 if(!next){$('accountStatus').textContent='Signed out';return;}
 // Restore narration even if the backend has not been activated yet.
 try{const draft=JSON.parse(localStorage.getItem(key())||'{}');$('script').value=draft.script||'';$('title').value=draft.title||'My voiceover';}catch{}
 meters();fetchVoices({initial:true});
});
window.addEventListener('beforeunload',()=>{voiceDemo.stop();if(audioUrl)URL.revokeObjectURL(audioUrl);});
