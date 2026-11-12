import {observeAuth} from '../shared/firebase-client.js';
import {loadVoices,generateVoiceover} from './tts-api.js';
import {createVoiceDemoPlayer} from './tts-voice-demo-player.js?v=2026111113';
import {createTtsHistoryClient} from './tts-history-api.js?v=2026111004';
import {savePendingAiDraft} from './ai-draft.js?v=2026111112';
import {createLocalImageClient} from '../shared/local-image-client.js?v=2026111112';
const $=id=>document.getElementById(id),fields=['title','script','creativeInstructions','mode','engine','model','direction','language','gender','family','voice','preset','speed','pitch','volume','pause'];
let user=null,voices=[],busy=false,loading=false,epoch=0,voiceEpoch=0,audioUrl=null,audioBytes=null,saveTimer;
let historyClient=null,historyEntries=[],historyCursor=null,historyEpoch=0,historyLoading=false;
const localWorker=createLocalImageClient({getAccountId:()=>user?.uid||null,requireAccount:true});
let pendingHistory=new Map(),historyWrites=new Set();
const controls=['sample','title','script','mode','reloadVoices','preview','generate'];
const encoder=new TextEncoder();
// One settings form and one transport across layouts. Remember the phone's
// disclosure choice when rotating or moving back from a desktop-sized window.
const desktopLayout=matchMedia('(min-width:901px)'),voiceSettings=$('voiceSettings');
const basicVoiceover=document.documentElement.classList.contains('ai-voiceover-embed');
const projectVoiceoverId=document.documentElement.classList.contains('project-voiceover-embed')
 ? new URLSearchParams(location.search).get('project') : null;
if(projectVoiceoverId){
 const scriptPanel=document.querySelector('.script-panel');
 const history=$('voiceoverHistory');
 const historyDialog=document.createElement('dialog');
 historyDialog.className='project-script-history';
 historyDialog.setAttribute('aria-labelledby','historyHeading');
 const closeForm=document.createElement('form');
 closeForm.method='dialog';
 closeForm.innerHTML='<button type="submit" aria-label="Close voiceover history">Close</button>';
 history.querySelector('.history-heading-actions').append(closeForm);
 historyDialog.append(history);
 document.body.append(historyDialog);

 const historyButton=document.createElement('button');
 historyButton.type='button';
 historyButton.className='quiet';
 historyButton.textContent='History';
 historyButton.onclick=()=>historyDialog.showModal();
 scriptPanel.querySelector('.script-heading-actions').append(historyButton);

 const options=document.createElement('details');
 options.className='project-script-options';
 options.innerHTML='<summary>Script options</summary>';
 options.append(
  scriptPanel.querySelector('label[for="title"]'),$('title'),
  scriptPanel.querySelector('.mode-label'),$('ssmlGuide'),
  scriptPanel.querySelector('label[for="creativeInstructions"]'),$('creativeInstructions'),
  $('sample'),$('analyzeLocal'),$('localAnalysisStatus'),$('localAnalysisResult')
 );
 scriptPanel.append(options);
 $('scriptHeading').textContent='Script';
 const scriptLabel=scriptPanel.querySelector('label[for="script"]');
 scriptLabel.classList.add('sr-only');
 $('script').before(scriptLabel);
 $('script').placeholder='Paste your narration here…';
 $('voiceHeading').textContent='Voice';
 $('resultHeading').textContent='Recording';
 $('preview').textContent='Preview';
 $('inputHelp').textContent='Paragraph breaks can become pauses.';
}
let mobileSettingsOpen=false;
function arrangeSettings(){voiceSettings.open=basicVoiceover||desktopLayout.matches||mobileSettingsOpen;}
voiceSettings.addEventListener('toggle',()=>{if(!desktopLayout.matches)mobileSettingsOpen=voiceSettings.open;});
desktopLayout.addEventListener('change',arrangeSettings);
arrangeSettings();
const voiceDemo=createVoiceDemoPlayer({button:$('voiceDemo'),audio:$('voiceDemoAudio'),message:$('voiceDemoStatus'),recording:$('player'),getVoice:()=>$('voice').value,getSpeed:()=>$('speed').value,canPlay:()=>!!user&&!busy&&!loading});
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
 $('generate').disabled=!ready||!$('script').value.trim();$('analyzeLocal').disabled=!audioBytes||busy||loading||!user;
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
 $('speedLabel').textContent=expressive()?'Gemini pace request':'Generation speed';
 $('speedHelp').textContent=expressive()?'Applies to your next preview or MP3. Gemini aims for this pace, so the result may be slower or faster. Use Playback speed to hear an exact speed change.':'Applies to the Google sample and to your next preview or MP3. Use Playback speed for the current recording.';
 for(const value of ['sales','social','empathetic','calm'])$('preset').querySelector('[value='+value+']').disabled=!expressive();
 $('preset').querySelector('[value=custom]').disabled=expressive();
 for(const button of $('historyList').querySelectorAll('button'))button.disabled=busy||loading||historyLoading||!user||(historyWrites.has(button.dataset.id)&&!['restore','export'].includes(button.dataset.action));
 $('historyRefresh').disabled=historyLoading||!user;
 $('historyMore').disabled=historyLoading||!user;
}
function meters(){
 voiceDemo.updateSpeed();
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
 if(!expressive()&&['sales','social','empathetic','calm'].includes($('preset').value))$('preset').value='natural';
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
function key(){
 const prefix=basicVoiceover?'invincible.ai.tts.draft.v1.':'invincible.creator.tts.draft.v1.';
 return prefix+user.uid+(projectVoiceoverId?'.project.'+projectVoiceoverId:'');
}
function remember(){
 if(!user)return;
 const snapshot=Object.fromEntries(fields.map(id=>[id,$(id).value]));
 const uid=user.uid,storageKey=key();
 clearTimeout(saveTimer);saveTimer=setTimeout(()=>{if(user?.uid!==uid)return;try{localStorage.setItem(storageKey,JSON.stringify(snapshot));$('draftStatus').textContent='Draft saved on this device';}catch{$('draftStatus').textContent='Draft could not be saved on this device';}},250);
}
function restore(saved){
 let draft=saved||{};if(!saved)try{draft=JSON.parse(localStorage.getItem(key())||'{}');}catch{}
 $('title').value=draft.title||'My voiceover';$('script').value=draft.script||'';$('mode').value=!basicVoiceover&&draft.mode==='ssml'?'ssml':'text';
 const hasGemini=voices.some(v=>v.family==='Gemini');
 $('engine').querySelector('[value=gemini]').disabled=!hasGemini;
 $('engine').value=hasGemini?(draft.engine||(draft.voice?'classic':'gemini')):'classic';
 $('model').value=['gemini-2.5-flash-tts','gemini-2.5-pro-tts'].includes(draft.model)?draft.model:'gemini-2.5-flash-tts';
 $('direction').value=basicVoiceover?'':draft.direction||'';$('creativeInstructions').value=basicVoiceover?'':draft.creativeInstructions||'';
 for(const id of ['speed','pitch','volume','pause','preset'])if(typeof draft[id]==='string')$(id).value=draft[id];
 languages(draft.language||'hi-IN');
 $('gender').value=basicVoiceover?'':draft.gender??'MALE';
 families(basicVoiceover?'':draft.family??'Neural2');
 if(draft.voice&&Array.from($('voice').options).some(o=>o.value===draft.voice))$('voice').value=draft.voice;
 for(const id of ['speed','pitch','volume','pause','preset'])if(typeof draft[id]==='string')$(id).value=draft[id];
 voiceDetails();
}
function pendingKey(uid){return 'invincible.creator.tts.history.pending.v1.'+uid;}
function rememberPending(){
 if(!user)return;
 try{if(pendingHistory.size)localStorage.setItem(pendingKey(user.uid),JSON.stringify([...pendingHistory.values()]));else localStorage.removeItem(pendingKey(user.uid));}
 catch{$('historyStatus').textContent='Device backup unavailable. Export unsaved scripts and settings before leaving.';}
}
function exportRecipe(entry){
 const url=URL.createObjectURL(new Blob([JSON.stringify({format:'invincible-voiceover-recipe',version:1,...entry},null,2)],{type:'application/json'}));
 const link=document.createElement('a');link.href=url;link.download=(entry.filename||'voiceover.mp3').replace(/\.mp3$/i,'')+'-settings.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function renderHistory(){
 const entries=new Map(historyEntries.map(e=>[e.id,e]));for(const entry of pendingHistory.values())entries.set(entry.id,entry);
 const rows=[...entries.values()].sort((a,b)=>b.createdAt-a.createdAt);
 $('historyList').replaceChildren();$('historyEmpty').hidden=!!rows.length;
 for(const entry of rows){
  const row=document.createElement('article');row.className='history-entry';
  const heading=document.createElement('h3');heading.textContent=entry.settings.title||'Voiceover';
  const detail=document.createElement('p');detail.className='help';detail.textContent=new Date(entry.createdAt).toLocaleString()+' · '+entry.voiceName+' · '+Number(entry.durationSeconds).toFixed(1)+' sec'+(pendingHistory.has(entry.id)?' · Not saved to account':'');
  const text=document.createElement('p');text.className='history-excerpt';text.textContent=entry.settings.script.slice(0,180);
  const full=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Script & settings';
  const script=document.createElement('p');script.className='history-script';script.textContent=entry.settings.script;
  const settings=document.createElement('p');settings.className='help';
  const r=entry.request;settings.textContent=[r.engine==='gemini'?'Gemini':'Google classic',r.languageCode,r.voiceName,r.modelName,r.delivery,(r.engine==='gemini'?'Requested pace ≈ ':'Generation speed ')+r.speed+'×','Pitch '+r.pitch,'Volume '+r.volume+' dB','Paragraph pause '+r.paragraphPause+' ms',r.mode==='ssml'?'SSML':'Plain text',r.direction].filter(Boolean).join(' · ');
  full.append(summary,script,settings);
  const actions=document.createElement('div');actions.className='history-actions';
  for(const [action,label] of [['restore','Use again'],['export','Export settings'],...(pendingHistory.has(entry.id)?[['retry','Retry save']]:[]),['delete','Delete']]){
   const button=document.createElement('button');button.type='button';button.className='quiet';button.textContent=label;button.dataset.action=action;button.dataset.id=entry.id;actions.append(button);
  }
  row.append(heading,detail,text,full,actions);$('historyList').append(row);
 }
 $('historyMore').hidden=!historyCursor;refreshAvailability();
}
async function loadHistory(more=false){
 if(!historyClient||historyLoading)return;
 const current=epoch,version=++historyEpoch,client=historyClient,cursor=more?historyCursor:null,startedAt=Date.now();
 historyLoading=true;refreshAvailability();$('historyStatus').textContent='Loading history…';
 try{
  const page=await client.list(cursor);
  if(current!==epoch||version!==historyEpoch)return;
  const addedWhileLoading=historyEntries.filter(e=>e.createdAt>=startedAt);
  historyEntries=[...new Map([...(more?historyEntries:[]),...page.entries,...addedWhileLoading].map(e=>[e.id,e])).values()];historyCursor=page.cursor;
  $('historyStatus').textContent='Scripts and settings saved to your account. MP3 files stay in your downloads.';
 }catch(error){if(current===epoch&&version===historyEpoch)$('historyStatus').textContent='Could not load account history. '+friendly(error);}
 finally{if(current===epoch&&version===historyEpoch){historyLoading=false;renderHistory();}}
}
async function saveHistory(entry){
 if(!historyClient||historyWrites.has(entry.id))return;
 const current=epoch,client=historyClient;
 pendingHistory.set(entry.id,entry);rememberPending();historyWrites.add(entry.id);renderHistory();
 $('historyStatus').textContent='Saving script and settings…';
 try{
  await client.save(entry);if(current!==epoch)return;
  pendingHistory.delete(entry.id);rememberPending();
  historyEntries=[entry,...historyEntries.filter(e=>e.id!==entry.id)];
  $('historyStatus').textContent='Script and settings saved to your account. Audio stays in your downloads.';
 }catch(error){if(current===epoch)$('historyStatus').textContent='History not saved to your account. Retry save or export settings. '+friendly(error);}
 finally{if(current===epoch){historyWrites.delete(entry.id);renderHistory();}}
}
$('historyRefresh').addEventListener('click',()=>loadHistory());
$('historyMore').addEventListener('click',()=>loadHistory(true));
$('historyList').addEventListener('click',async event=>{
 const button=event.target.closest('button[data-action]');if(!button||busy||loading||historyLoading||!user||(historyWrites.has(button.dataset.id)&&!['restore','export'].includes(button.dataset.action)))return;
 const entry=pendingHistory.get(button.dataset.id)||historyEntries.find(e=>e.id===button.dataset.id);if(!entry)return;
 const action=button.dataset.action;
 if(action==='export'){exportRecipe(entry);return;}
 if(action==='retry'){saveHistory(entry);return;}
 if(action==='restore'){
  if(($('script').value.trim()&&$('script').value!==entry.settings.script)&&!confirm('Replace your current script and settings with this recording?'))return;
  voiceDemo.stop();clearAudio();restore(entry.settings);
  // Never silently substitute an unavailable historical voice or engine.
  const exact=$('voice').value===entry.settings.voice&&$('engine').value===entry.settings.engine;
  if(!exact){$('voice').selectedIndex=-1;refreshAvailability();}
  remember();$('script').focus();
  status(exact?'Script and settings restored. Generate MP3 when you are ready.':'Script restored. The saved voice is unavailable; choose a voice before generating.',!exact);return;
 }
 if(action==='delete'){
  if(!confirm('Delete this saved script and settings? Downloaded MP3 files will stay on your device.'))return;
  const current=epoch,client=historyClient;historyWrites.add(entry.id);renderHistory();
  try{
   // Even an unsaved entry may have reached the server before an interrupted reply.
   await client.remove(entry.id);if(current!==epoch)return;
   pendingHistory.delete(entry.id);rememberPending();historyEntries=historyEntries.filter(e=>e.id!==entry.id);$('historyStatus').textContent='History entry deleted.';
  }catch(error){if(current===epoch)$('historyStatus').textContent='Could not delete this entry. '+friendly(error);}
  finally{if(current===epoch){historyWrites.delete(entry.id);renderHistory();}}
 }
});
function languages(preferred=$('language').value){
 const matching=voices.filter(v=>(v.family==='Gemini')===expressive());
 setOptions($('language'),[...new Set(matching.flatMap(v=>v.languageCodes))].sort().map(value=>({value,label:new Intl.DisplayNames(['en'],{type:'language'}).of(value)+' · '+value+(expressive()&&value==='gu-IN'?' · Preview':'')})),preferred);
}
function clearAudio(){if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=null;audioBytes=null;$('player').pause();$('player').removeAttribute('src');$('player').load();$('download').removeAttribute('href');$('recording').hidden=true;$('localAnalysisResult').hidden=true;$('localAnalysisResult').textContent='';$('localAnalysisStatus').textContent='';}
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
 const settings=Object.fromEntries(fields.map(id=>[id,$(id).value]));
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
  clearAudio();audioBytes=buffer;audioUrl=URL.createObjectURL(new Blob([buffer],{type:result.mimeType}));
  $('player').src=audioUrl;applyPlaybackSpeed();$('download').href=audioUrl;$('download').download=result.filename;
  $('recording').hidden=false;$('recordingInfo').textContent=result.durationSeconds.toFixed(1)+' sec · '+result.voiceName+(preview?' · opening preview':'');
  if(data.engine==='gemini')$('recordingInfo').textContent+=' · '+data.delivery+' · requested pace ≈ '+data.speed+'×';
  status(preview?'Preview ready. Listen, adjust, then generate the full recording.':'MP3 ready. Listen before downloading.');
  if(!preview)saveHistory({id:crypto.randomUUID(),version:1,createdAt:Date.now(),settings,request:data,filename:result.filename,voiceName:result.voiceName,durationSeconds:result.durationSeconds});
 }catch(error){if(current===epoch)status(friendly(error),true);}
 finally{if(current===epoch){busy=false;refreshAvailability();}}
}
async function analyzeLocal(){
 if(!audioBytes||busy||loading)return; const started=Date.now();$('analyzeLocal').disabled=true;$('localAnalysisStatus').textContent='Sending MP3 to the local Whisper/Qwen pipeline…';$('localAnalysisResult').hidden=true;
 try { let binary='';for(let i=0;i<audioBytes.length;i+=0x8000)binary+=String.fromCharCode(...audioBytes.subarray(i,i+0x8000)); const payload=await localWorker.request('/api/voiceover/analyze',{title:$('title').value,creativeInstructions:$('creativeInstructions').value,audioBase64:btoa(binary)},{timeoutMs:180000});await savePendingAiDraft({title:$('title').value,creativeInstructions:$('creativeInstructions').value,analysis:payload.analysis,creatorStudio:payload.creatorStudio},new Blob([audioBytes],{type:'audio/mpeg'}));$('localAnalysisResult').textContent=JSON.stringify(payload.creatorStudio,null,2);$('localAnalysisResult').hidden=false;$('localAnalysisStatus').textContent=`Local analysis ready: ${payload.analysis.scenes.length} scenes in ${((Date.now()-started)/1000).toFixed(1)}s. Open Creator Studio and choose “Review AI draft” to inspect and import it.`; }
 catch(error){$('localAnalysisStatus').textContent=error.message||'Local analysis failed.';}
 finally{refreshAvailability();}
}
function applyPlaybackSpeed(){
 const speed=Number($('playbackSpeed').value);
 $('player').defaultPlaybackRate=speed;
 $('player').playbackRate=speed;
}
$('playbackSpeed').addEventListener('change',applyPlaybackSpeed);
$('player').addEventListener('loadedmetadata',applyPlaybackSpeed);
$('generate').addEventListener('click',()=>record(false));$('preview').addEventListener('click',()=>record(true));
$('analyzeLocal').addEventListener('click',analyzeLocal);
$('reloadVoices').addEventListener('click',()=>fetchVoices());
 $('engine').addEventListener('change',()=>{voiceDemo.stop();languages();families();remember();});
 for(const id of ['model','direction','creativeInstructions'])$(id).addEventListener('input',remember);
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
 historyEpoch++;historyClient=null;historyEntries=[];historyCursor=null;historyLoading=false;pendingHistory=new Map();historyWrites=new Set();
 $('historyStatus').textContent='';renderHistory();
 $('workspace').hidden=!next;$('signedOut').hidden=!!next;
 $('voiceoverHistory').hidden=!next;
 $('script').value='';$('title').value='My voiceover';
 for(const id of ['language','family','voice'])$(id).replaceChildren();
 $('mode').value='text';$('gender').value='MALE';$('preset').value='natural';$('speed').value='1';$('pitch').value='0';$('volume').value='0';$('pause').value='0';
 $('direction').value='';$('engine').value='classic';$('model').value='gemini-2.5-flash-tts';
 status('Your recording will appear here.');meters();
 if(!next){$('accountStatus').textContent='Signed out';return;}
 historyClient=createTtsHistoryClient(next.uid);
 try{for(const entry of JSON.parse(localStorage.getItem(pendingKey(next.uid))||'[]'))if(entry?.id&&entry.settings?.script)pendingHistory.set(entry.id,entry);}catch{}
 renderHistory();loadHistory();
 // Restore narration even if the backend has not been activated yet.
 try{const draft=JSON.parse(localStorage.getItem(key())||'{}');$('script').value=draft.script||'';$('title').value=draft.title||'My voiceover';}catch{}
 meters();fetchVoices({initial:true});
});
window.addEventListener('beforeunload',()=>{voiceDemo.stop();if(audioUrl)URL.revokeObjectURL(audioUrl);});
