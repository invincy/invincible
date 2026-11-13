import {observeAuth} from '../shared/firebase-client.js';
import {loadVoices,generateVoiceover,retimeVoiceover,runCreatorOpenAi} from './tts-api.js';
import {createVoiceDemoPlayer} from './tts-voice-demo-player.js?v=2026111113';
import {createTtsHistoryClient} from './tts-history-api.js?v=2026111004';
import {savePendingAiDraft,saveScriptSyncCheckpoint,loadScriptSyncCheckpoint,clearScriptSyncCheckpoint} from './ai-draft.js?v=2026111312';
import {createLocalImageClient} from '../shared/local-image-client.js?v=2026111112';
const $=id=>document.getElementById(id),fields=['title','script','creativeInstructions','mode','engine','model','direction','language','gender','family','voice','preset','speed','pitch','volume','pause'];
let user=null,voices=[],busy=false,loading=false,epoch=0,voiceEpoch=0,audioUrl=null,audioBytes=null,sourceAudioBytes=null,sourceDuration=0,sourceFilename='',recordingLabel='',appliedSpeed=1,audioIsPreview=true,speedBusy=false,saveTimer;
let timedTranscript=null,analysisBusy=false,scenePlanBusy=false,scenePlanSaved=false,scenePlanProgressTimer=null;
const aiProviderKey='invincible.ai.provider.v1';
let aiProvider=localStorage.getItem(aiProviderKey)==='local'?'local':'cloud';
let scriptSyncSaveTimer=null;
let historyClient=null,historyEntries=[],historyCursor=null,historyEpoch=0,historyLoading=false;
const localWorker=createLocalImageClient({getAccountId:()=>user?.uid||null,requireAccount:true});
let pendingHistory=new Map(),historyWrites=new Set();
const controls=['sample','title','script','mode','reloadVoices','preview','generate'];
const encoder=new TextEncoder();
// One settings form and one transport across layouts. Remember the phone's
// disclosure choice when rotating or moving back from a desktop-sized window.
const desktopLayout=matchMedia('(min-width:901px)'),voiceSettings=$('voiceSettings');
const basicVoiceover=document.documentElement.classList.contains('ai-voiceover-embed');
const embedParams=new URLSearchParams(location.search);
const projectVoiceoverId=document.documentElement.classList.contains('project-voiceover-embed')
 ? embedParams.get('project') : null;
if(projectVoiceoverId){
 const scriptPanel=document.querySelector('.script-panel');
 const direction=$('expressiveControls');
 const directionOptions=document.createElement('details');
 directionOptions.className='project-voice-direction';
 directionOptions.innerHTML='<summary>Voice direction <span class="optional">optional</span></summary>';
 directionOptions.append(...direction.children);
 direction.append(directionOptions);
 $('voiceFields').append(direction);
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
  $('sample')
 );
 scriptPanel.append(options);
 const flow=document.querySelector('.ai-script-flow'),instructionsCard=$('timingInstructionsCard');
 instructionsCard.append(scriptPanel.querySelector('label[for="creativeInstructions"]'),$('creativeInstructions'));
 $('workspace').insertBefore(flow,document.querySelector('.controls-panel'));
 $('scriptHeading').textContent='Script';
 const scriptLabel=scriptPanel.querySelector('label[for="script"]');
 scriptLabel.classList.add('sr-only');
 $('script').before(scriptLabel);
 $('script').placeholder='Paste your narration here…';
 $('voiceHeading').textContent='Voice';
 $('resultHeading').textContent='Recording';
 $('analyzeLocal').textContent='Next · Script & scenes';
 $('preview').textContent='Preview';
 $('inputHelp').textContent='Paragraph breaks can become pauses.';
}
window.addEventListener('message',event=>{if(!projectVoiceoverId||event.origin!==location.origin||event.source!==window.parent||event.data?.type!=='invincible-project-script-view')return;document.documentElement.classList.toggle('project-timing-view',event.data.view==='timing');});
let mobileSettingsOpen=false;
function arrangeSettings(){voiceSettings.open=basicVoiceover||desktopLayout.matches||mobileSettingsOpen;}
voiceSettings.addEventListener('toggle',()=>{if(!desktopLayout.matches)mobileSettingsOpen=voiceSettings.open;});
desktopLayout.addEventListener('change',arrangeSettings);
arrangeSettings();
const voiceDemo=createVoiceDemoPlayer({button:$('voiceDemo'),audio:$('voiceDemoAudio'),message:$('voiceDemoStatus'),recording:$('player'),getVoice:()=>$('voice').value,getSpeed:()=>$('speed').value,canPlay:()=>!!user&&!busy&&!loading});
function status(message,error=false){$('generationStatus').textContent=message;$('generationStatus').classList.toggle('error',error);}
function providerName(){return aiProvider==='cloud'?'OpenAI':'Local AI';}
function updateProviderUi(){
 const input=document.querySelector(`[name="aiProvider"][value="${aiProvider}"]`);if(input)input.checked=true;
 $('timingProviderLabel').textContent=aiProvider==='cloud'?'OpenAI timing':'Whisper timing';
 $('retryAnalysis').textContent=aiProvider==='cloud'?'Retry OpenAI timing':'Retry Whisper timing';
 if(!timedTranscript&&!analysisBusy)$('localAnalysisStatus').textContent=`Generate the final MP3, then let ${aiProvider==='cloud'?'OpenAI':'local Whisper'} create its transcript and timestamps.`;
}
function setOptions(select,options,value){select.replaceChildren(...options.map(o=>{const el=document.createElement('option');el.value=o.value;el.textContent=o.label;return el;}));if(options.some(o=>o.value===value))select.value=value;}
function selectedVoice(){return voices.find(v=>v.name===$('voice').value);}
function expressive(){return $('engine').value==='gemini';}
function refreshAvailability(){
 const voice=selectedVoice(),ready=!!user&&!busy&&!loading&&!!voice?.capabilities.supported;
 for(const id of controls)$(id).disabled=busy||loading||!user;
 $('reloadVoices').disabled=busy||loading||!user;
 $('voiceDemo').disabled=busy||loading||!user||!voiceDemo.available();
 $('voiceFields').disabled=busy||loading||!user||!voices.length;
 $('generate').disabled=!ready||!$('script').value.trim();$('analyzeLocal').disabled=!audioBytes||audioIsPreview||busy||loading||speedBusy||analysisBusy||scenePlanBusy||!user;
 $('retryAnalysis').disabled=$('analyzeLocal').disabled;
 $('playbackSpeed').disabled=!audioBytes||busy||loading||speedBusy;
 $('download').setAttribute('aria-disabled',String(!audioBytes||busy||loading||speedBusy));
 $('generateScenePlan').disabled=!timedTranscript||!validTimedTranscript().valid||!$('creativeInstructions').value.trim()||analysisBusy||scenePlanBusy||!user;
 $('generateScenePlan').textContent=scenePlanBusy?'Generating sync plan…':'Next · Generate sync plan';
 $('openMotionStudio').setAttribute('aria-disabled',String(!scenePlanSaved));
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
 $('speedHelp').textContent=projectVoiceoverId
  ? (expressive()?'Approximate pace for the next recording. Playback speed is exact.':'Applies to the next preview or MP3.')
  : (expressive()?'Applies to your next preview or MP3. Gemini aims for this pace, so the result may be slower or faster. Use Playback speed to hear an exact speed change.':'Applies to the Google sample and to your next preview or MP3. Use Playback speed for the current recording.');
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
 $('voiceHelp').textContent=cap.direction?(projectVoiceoverId?'Preview this voice with your settings.':'Use Preview opening to hear this voice with your directions.'):cap.supported
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
function updateAiFlow(){
 const audioReady=!!audioBytes&&!audioIsPreview,timingReady=!!timedTranscript,planReady=!$('scenePlanReview').hidden;
 const states={audio:{done:audioReady,current:!audioReady},timing:{done:timingReady,current:audioReady&&!timingReady},plan:{done:planReady,current:timingReady&&!planReady}};
 document.querySelectorAll('[data-ai-flow]').forEach(item=>{const state=states[item.dataset.aiFlow];item.classList.toggle('done',state.done);item.classList.toggle('current',state.current);if(state.current)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');});
}
function resetAiFlow(){timedTranscript=null;analysisBusy=false;scenePlanBusy=false;scenePlanSaved=false;clearInterval(scenePlanProgressTimer);scenePlanProgressTimer=null;document.querySelector('.ai-script-flow').classList.remove('plan-generating','plan-review-active');$('scenePlanProgress').hidden=true;$('transcriptReview').hidden=true;$('transcriptSegments').replaceChildren();$('scenePlanReview').hidden=true;$('scenePlanScenes').replaceChildren();$('localAnalysisResult').hidden=true;$('localAnalysisResult').textContent='';$('localAnalysisStatus').textContent='Generate the final MP3, then let Whisper create its transcript and timestamps.';updateAiFlow();}
function clearAudio(){if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=null;audioBytes=null;sourceAudioBytes=null;sourceDuration=0;sourceFilename='';recordingLabel='';appliedSpeed=1;audioIsPreview=true;speedBusy=false;$('player').pause();$('player').removeAttribute('src');$('player').load();$('download').removeAttribute('href');$('recording').hidden=true;resetAiFlow();}
function friendly(error){
 if(error?.code==='functions/not-found')return 'Voiceover generation has not been deployed to Invincible yet. Your script is kept here.';
 if(/unauthenticated/.test(error?.code||''))return 'Sign in to Invincible again. Your script is kept here.';
 return error?.message||'The request failed. Your script is kept here. Please retry when ready.';
}
function localVoiceoverError(error,step){
 if(error?.status===404||/^not found\.?$/i.test(error?.message||''))return 'The laptop video service is out of date. Restart Invincible Video Studio on this laptop, then click '+step+' again. Your MP3 is still here.';
 if(error?.code==='LOCAL_WORKER_UNREACHABLE')return 'The laptop video service is not running. Start Invincible Video Studio, then click '+step+' again. Your MP3 is still here.';
 return error?.message||step+' failed. Your MP3 and script are still here.';
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
  if(!preview&&projectVoiceoverId)clearScriptSyncCheckpoint(owner,projectVoiceoverId);
  clearAudio();audioBytes=buffer;sourceAudioBytes=buffer;sourceDuration=result.durationSeconds;sourceFilename=result.filename;appliedSpeed=1;audioIsPreview=preview;audioUrl=URL.createObjectURL(new Blob([buffer],{type:result.mimeType}));
  $('player').src=audioUrl;applyPlaybackSpeed();$('download').href=audioUrl;$('download').download=result.filename;
  recordingLabel=result.voiceName+(preview?' · opening preview':'')+(data.engine==='gemini'?' · '+data.delivery+' · requested pace ≈ '+data.speed+'×':'');
  $('recording').hidden=false;$('recordingInfo').textContent=result.durationSeconds.toFixed(1)+' sec · '+recordingLabel;
  status(preview?'Preview ready. Listen, adjust, then generate the full recording.':'MP3 ready. Choose the final speed, then Download or continue to Script & scenes.');updateAiFlow();
  if(!preview)saveHistory({id:crypto.randomUUID(),version:1,createdAt:Date.now(),settings,request:data,filename:result.filename,voiceName:result.voiceName,durationSeconds:result.durationSeconds});
 }catch(error){if(current===epoch)status(friendly(error),true);}
 finally{if(current===epoch){busy=false;refreshAvailability();}}
}
function bytesBase64(bytes){let binary='';for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(binary);}
function audioBase64(){return bytesBase64(audioBytes);}
function scriptSyncSnapshot(){return{script:$('script').value,title:$('title').value,creativeInstructions:$('creativeInstructions').value,transcript:structuredClone(timedTranscript),aiProvider,appliedSpeed,playbackSpeed:$('playbackSpeed').value,sourceDuration,sourceFilename,recordingLabel,finalDuration:Number(timedTranscript?.duration)||0,downloadFilename:$('download').download||sourceFilename};}
async function persistScriptSync({includeAudio=false}={}){
 if(!projectVoiceoverId||!user||!timedTranscript)return;
 const finalAudio=includeAudio&&audioBytes?new Blob([audioBytes],{type:'audio/mpeg'}):null,sourceAudio=includeAudio&&sourceAudioBytes?new Blob([sourceAudioBytes],{type:'audio/mpeg'}):null;
 return saveScriptSyncCheckpoint({accountId:user.uid,projectId:projectVoiceoverId,checkpoint:scriptSyncSnapshot(),finalAudio,sourceAudio});
}
function scheduleScriptSyncSave(){
 if(!projectVoiceoverId||!user||!timedTranscript)return;clearTimeout(scriptSyncSaveTimer);const owner=user.uid,current=epoch;
 scriptSyncSaveTimer=setTimeout(()=>{scriptSyncSaveTimer=null;if(user?.uid!==owner||epoch!==current)return;persistScriptSync().catch(error=>{$('localAnalysisStatus').textContent='Your changes are still on this page, but the Script & scenes checkpoint could not update: '+error.message;});},300);
}
async function restoreScriptSync(){
 if(!projectVoiceoverId||!user)return;const owner=user.uid,current=epoch;
 try{
  const checkpoint=await loadScriptSyncCheckpoint(owner,projectVoiceoverId);if(!checkpoint||user?.uid!==owner||epoch!==current)return;
  const currentScript=$('script').value.trim();if(currentScript&&checkpoint.script?.trim()&&currentScript!==checkpoint.script.trim()){$('localAnalysisStatus').textContent='A saved Whisper timing belongs to an earlier script. Open Script to review it or generate a new final MP3.';return;}
  const finalBytes=new Uint8Array(await checkpoint.finalAudio.arrayBuffer()),sourceBytes=new Uint8Array(await checkpoint.sourceAudio.arrayBuffer());if(!finalBytes.length||!sourceBytes.length)throw Error('The saved final MP3 is empty.');
  clearAudio();$('script').value=checkpoint.script||$('script').value;$('title').value=checkpoint.title||$('title').value;$('creativeInstructions').value=checkpoint.creativeInstructions||'';
  audioBytes=finalBytes;sourceAudioBytes=sourceBytes;sourceDuration=Number(checkpoint.sourceDuration)||Number(checkpoint.finalDuration)||Number(checkpoint.transcript.duration);sourceFilename=checkpoint.sourceFilename||'voiceover.mp3';recordingLabel=checkpoint.recordingLabel||'saved voiceover';appliedSpeed=Number(checkpoint.appliedSpeed)||1;audioIsPreview=false;
  const wanted=String(checkpoint.playbackSpeed||appliedSpeed);if([...$('playbackSpeed').options].some(option=>option.value===wanted))$('playbackSpeed').value=wanted;
  audioUrl=URL.createObjectURL(new Blob([audioBytes],{type:'audio/mpeg'}));$('player').src=audioUrl;$('download').href=audioUrl;$('download').download=checkpoint.downloadFilename||sourceFilename;$('recording').hidden=false;$('recordingInfo').textContent=`${Number(checkpoint.finalDuration||checkpoint.transcript.duration).toFixed(1)} sec · ${recordingLabel} · restored checkpoint`;applyPlaybackSpeed();
  timedTranscript=structuredClone(checkpoint.transcript);if(checkpoint.aiProvider==='cloud'||checkpoint.aiProvider==='local'){aiProvider=checkpoint.aiProvider;localStorage.setItem(aiProviderKey,aiProvider);}updateProviderUi();renderTranscript();status('Final MP3 restored from this project.');$('localAnalysisStatus').textContent=`${providerName()} timing and animation instructions restored. You can generate the sync plan directly.`;meters();
 }catch(error){if(user?.uid===owner&&epoch===current)$('localAnalysisStatus').textContent='The saved Script & scenes checkpoint could not be restored: '+error.message;}
}
async function ensureFinalSpeed(){
 const target=Number($('playbackSpeed').value);if(!audioBytes||!sourceAudioBytes||target===appliedSpeed)return;
 speedBusy=true;refreshAvailability();status('Preparing the final '+target.toFixed(2)+'× MP3…');
 try{
  let bytes=sourceAudioBytes,filename=sourceFilename,duration=sourceDuration;
  if(target!==1){const result=await retimeVoiceover({audioBase64:bytesBase64(sourceAudioBytes),speed:target,durationSeconds:sourceDuration,filename:sourceFilename});const decoded=atob(result.audioBase64);bytes=Uint8Array.from(decoded,c=>c.charCodeAt(0));filename=result.filename;duration=result.durationSeconds;}
  if(audioUrl)URL.revokeObjectURL(audioUrl);audioBytes=bytes;appliedSpeed=target;audioUrl=URL.createObjectURL(new Blob([bytes],{type:'audio/mpeg'}));$('player').src=audioUrl;$('download').href=audioUrl;$('download').download=filename;$('recordingInfo').textContent=duration.toFixed(1)+' sec · '+recordingLabel+' · final '+target.toFixed(2)+'×';applyPlaybackSpeed();status('Final '+target.toFixed(2)+'× MP3 ready. Download it or continue to Script & scenes.');
 }catch(error){status(friendly(error),true);throw error;}
 finally{speedBusy=false;refreshAvailability();}
}
function clock(seconds){const value=Math.max(0,Number(seconds)||0),minutes=Math.floor(value/60),rest=(value-minutes*60).toFixed(3).padStart(6,'0');return `${String(minutes).padStart(2,'0')}:${rest}`;}
function validTimedTranscript(){
 if(!timedTranscript?.segments?.length)return{valid:false,message:'AI timing is not ready.'};
 let previous=0;
 for(const [index,segment] of timedTranscript.segments.entries()){
  if(!segment.text.trim())return{valid:false,message:`Segment ${index+1} needs transcript text.`};
  if(!Number.isFinite(segment.start)||!Number.isFinite(segment.end)||segment.start<previous||segment.end<=segment.start)return{valid:false,message:`Segment ${index+1} has invalid timing.`};
  previous=segment.end;
 }
 const difference=Math.abs(Number(timedTranscript.duration)-previous);
 if(!Number.isFinite(timedTranscript.duration)||difference>.25)return{valid:false,message:`The final timestamp differs from the ${clock(timedTranscript.duration)} MP3 duration by ${difference.toFixed(3)} seconds.`};
 return{valid:true,message:`${timedTranscript.segments.length} segments · ${clock(timedTranscript.duration)} · timing locked`};
}
function updateScenePlanGate(){const check=validTimedTranscript();$('scenePlanGate').textContent=!check.valid?check.message:!$('creativeInstructions').value.trim()?'Paste animation instructions to continue.':check.message;refreshAvailability();}
function renderTranscript(){
 $('transcriptReview').hidden=false;$('transcriptDuration').textContent=`${clock(timedTranscript.duration)} total`;
 $('transcriptSegments').replaceChildren(...timedTranscript.segments.map((segment,index)=>{
  const row=document.createElement('label');row.className='transcript-segment';
  const time=document.createElement('span');time.textContent=`${clock(segment.start)}–${clock(segment.end)}`;
  const input=document.createElement('textarea');input.rows=2;input.value=segment.text;input.setAttribute('aria-label',`Transcript segment ${index+1}`);input.addEventListener('input',()=>{segment.text=input.value;timedTranscript.text=timedTranscript.segments.map(item=>item.text.trim()).filter(Boolean).join(' ');updateScenePlanGate();scheduleScriptSyncSave();});
  row.append(time,input);return row;
 }));updateScenePlanGate();updateAiFlow();
}
function sceneEngine(scene){return scene.mapAnimation?'Map':scene.canvasScene||scene.contextCard?'Canvas':'Needs selection';}
function safeText(value){return String(value??'').replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));}
function renderScenePlan(payload){
 scenePlanSaved=false;
 const flow=document.querySelector('.ai-script-flow');flow.classList.remove('plan-generating');flow.classList.add('plan-review-active');$('scenePlanProgress').hidden=true;
 const scenes=payload.analysis.scenes;$('scenePlanReview').hidden=false;$('scenePlanSummary').textContent=`${scenes.length} scenes · ${clock(payload.analysis.transcript.duration)}`;
 $('scenePlanScenes').replaceChildren(...scenes.map((scene,index)=>{const card=document.createElement('article');card.innerHTML=`<header><strong>Scene ${index+1}</strong><span>${clock(scene.startSeconds)}–${clock(scene.endSeconds)}</span></header><p>${safeText(scene.voiceover)}</p><dl><div><dt>Visual</dt><dd>${safeText(scene.visual||'Not specified')}</dd></div><div><dt>Engine</dt><dd>${safeText(sceneEngine(scene))}</dd></div><div><dt>Assets</dt><dd>${safeText(scene.assets||'None selected')}</dd></div><div><dt>Missing / unverified</dt><dd>${safeText(scene.missingInfo?.join(' ')||'None reported')}</dd></div></dl>`;return card;}));
 $('localAnalysisResult').textContent=JSON.stringify(payload.creatorStudio,null,2);
 const link=$('openMotionStudio');link.href=projectVoiceoverId?`project.html?${new URLSearchParams({id:projectVoiceoverId,area:'Storyboard'})}`:'./';
 updateAiFlow();requestAnimationFrame(()=>$('scenePlanReview').scrollIntoView({behavior:'smooth',block:'start'}));
}
function safeScenePlanFallback(transcript,title){
 const scenes=transcript.segments.map((segment,index)=>({id:`scene-${index+1}`,startSeconds:segment.start,endSeconds:segment.end,durationSeconds:Number((segment.end-segment.start).toFixed(3)),voiceover:segment.text,voiceoverTimestamp:`${segment.start.toFixed(3)}-${segment.end.toFixed(3)}s`,visual:segment.text,animation:'hold',assets:'',assetIds:[],assetReferences:'',sourceSegmentIds:[segment.id],missingInfo:['Qwen returned an unsupported animation intent; a safe Canvas scene was created for review.'],mapAnimation:null,contextCard:true}));
 const analysis={format:'invincible-voiceover-analysis',version:1,transcript:structuredClone(transcript),scenes,errors:[],valid:true};
 return{analysis,creatorStudio:{schemaVersion:1,title:title||'Voiceover sync plan',aspectRatio:'9:16',assets:[],audio:null,scenes:scenes.map(scene=>({id:scene.id,timeline:`${scene.startSeconds.toFixed(3)}-${scene.endSeconds.toFixed(3)}s`,voiceover:scene.voiceover,voiceoverTimestamp:scene.voiceoverTimestamp,visual:scene.visual,assets:'',assetReferences:'',mapAnimation:null,contextCard:true,technicalNotes:'Suggested animation: hold'}))},mapAnimations:[]};
}
async function analyzeLocal(){
 if(!audioBytes||audioIsPreview||speedBusy||analysisBusy||scenePlanBusy)return;
 try{await ensureFinalSpeed();}catch{return;}
 if(projectVoiceoverId){window.parent.postMessage({type:'invincible-sync-project-script',script:$('script').value,creativeInstructions:$('creativeInstructions').value},location.origin);window.parent.postMessage({type:'invincible-open-script-timing'},location.origin);}
 analysisBusy=true;$('retryAnalysis').hidden=true;$('localAnalysisStatus').textContent=`${providerName()} is analysing the voiceover and creating timestamps…`;$('transcriptReview').hidden=true;$('scenePlanReview').hidden=true;updateAiFlow();refreshAvailability();
 requestAnimationFrame(()=>$('timingHeading').scrollIntoView({behavior:'smooth',block:'start'}));
 try{const payload=aiProvider==='cloud'?await runCreatorOpenAi({action:'transcribe',projectId:projectVoiceoverId,audioBase64:audioBase64(),script:$('script').value}):await localWorker.request('/api/voiceover/transcribe',{audioBase64:audioBase64()},{timeoutMs:180000});timedTranscript=payload.transcript;renderTranscript();$('localAnalysisStatus').textContent=`${providerName()} timing is ready. Saving this project checkpoint…`;try{await persistScriptSync({includeAudio:true});$('localAnalysisStatus').textContent=`${providerName()} timing is saved. Review the words, add animation instructions, or return here later.`;}catch(saveError){$('localAnalysisStatus').textContent=`${providerName()} timing is ready, but its project checkpoint could not be saved: ${saveError.message}`;}}
 catch(error){timedTranscript=null;$('retryAnalysis').hidden=false;$('localAnalysisStatus').textContent=localVoiceoverError(error,'Scripting · Step 2');}
 finally{analysisBusy=false;updateScenePlanGate();updateAiFlow();}
}
async function generateScenePlan(){
 const check=validTimedTranscript();if(!check.valid||!$('creativeInstructions').value.trim()||scenePlanBusy)return;scenePlanBusy=true;scenePlanSaved=false;$('scenePlanReview').hidden=true;const started=Date.now(),flow=document.querySelector('.ai-script-flow');flow.classList.remove('plan-review-active');flow.classList.add('plan-generating');$('scenePlanProgress').hidden=false;
 const showProgress=()=>{const seconds=Math.max(1,Math.round((Date.now()-started)/1000));$('localAnalysisStatus').textContent=`${providerName()} is creating the sync plan. Review will open automatically when it is ready.`;$('scenePlanProgressTime').textContent=`Matching ${timedTranscript.segments.length} locked timestamp${timedTranscript.segments.length===1?'':'s'} · ${seconds} sec elapsed`;};showProgress();scenePlanProgressTimer=setInterval(showProgress,1000);$('scenePlanProgress').scrollIntoView({behavior:'smooth',block:'start'});refreshAvailability();
 try{
  await persistScriptSync();
  const planRequest={title:$('title').value,creativeInstructions:$('creativeInstructions').value,transcript:timedTranscript,production:true};
  const payload=aiProvider==='cloud'?await runCreatorOpenAi({action:'plan',projectId:projectVoiceoverId,...planRequest}):await localWorker.request('/api/voiceover/plan',planRequest,{timeoutMs:180000});
  clearInterval(scenePlanProgressTimer);scenePlanProgressTimer=null;renderScenePlan(payload);$('localAnalysisStatus').textContent='Sync plan generated. Saving it with the final MP3…';refreshAvailability();
  await savePendingAiDraft({title:$('title').value,creativeInstructions:$('creativeInstructions').value,analysis:payload.analysis,creatorStudio:payload.creatorStudio},new Blob([audioBytes],{type:'audio/mpeg'}));
  scenePlanSaved=true;$('localAnalysisStatus').textContent='Sync plan ready. Review every scene, then apply it to the project and open Motion Studio.';
 }
 catch(error){
  scenePlanSaved=false;
  if(aiProvider==='local'&&/unsupported intent/i.test(String(error?.message||error))){
   try{const payload=safeScenePlanFallback(timedTranscript,$('title').value);renderScenePlan(payload);$('localAnalysisStatus').textContent='Qwen used an unsupported animation label. A safe scene was loaded for every locked timestamp and is being saved…';await savePendingAiDraft({title:$('title').value,creativeInstructions:$('creativeInstructions').value,analysis:payload.analysis,creatorStudio:payload.creatorStudio},new Blob([audioBytes],{type:'audio/mpeg'}));scenePlanSaved=true;$('localAnalysisStatus').textContent=`Safe ${payload.analysis.scenes.length}-scene sync plan ready. Review it, then apply it to Motion Studio.`;}catch(fallbackError){flow.classList.remove('plan-review-active');$('scenePlanReview').hidden=true;$('localAnalysisStatus').textContent='The safe sync plan could not be saved: '+fallbackError.message+' Your transcript and animation instructions are still here.';}
  }else{flow.classList.remove('plan-generating');$('scenePlanProgress').hidden=true;$('localAnalysisStatus').textContent=localVoiceoverError(error,'Generate sync plan')+' Your transcript and animation instructions are still here; retry when ready.';}
 }
 finally{clearInterval(scenePlanProgressTimer);scenePlanProgressTimer=null;scenePlanBusy=false;updateAiFlow();refreshAvailability();}
}
function applyPlaybackSpeed(){
 const speed=Number($('playbackSpeed').value),rate=speed/appliedSpeed;
 $('player').defaultPlaybackRate=rate;
 $('player').playbackRate=rate;
}
$('playbackSpeed').addEventListener('change',()=>{applyPlaybackSpeed();if(timedTranscript){if(projectVoiceoverId&&user)clearScriptSyncCheckpoint(user.uid,projectVoiceoverId);resetAiFlow();}if(audioBytes)status('Final speed set to '+Number($('playbackSpeed').value).toFixed(2)+'×. Download or Next will prepare this exact-speed MP3.');});
$('player').addEventListener('loadedmetadata',applyPlaybackSpeed);
$('download').addEventListener('click',async event=>{event.preventDefault();if(!audioBytes||speedBusy)return;try{await ensureFinalSpeed();const link=document.createElement('a');link.href=$('download').href;link.download=$('download').download;link.click();}catch{}});
$('generate').addEventListener('click',()=>record(false));$('preview').addEventListener('click',()=>record(true));
$('analyzeLocal').addEventListener('click',analyzeLocal);
$('retryAnalysis').addEventListener('click',analyzeLocal);
$('generateScenePlan').addEventListener('click',generateScenePlan);
$('aiProviderChoice').addEventListener('change',event=>{if(!event.target.matches('[name="aiProvider"]'))return;aiProvider=event.target.value==='local'?'local':'cloud';localStorage.setItem(aiProviderKey,aiProvider);scenePlanSaved=false;updateProviderUi();scheduleScriptSyncSave();if(!$('scenePlanReview').hidden){$('scenePlanReview').hidden=true;document.querySelector('.ai-script-flow').classList.remove('plan-review-active');$('localAnalysisStatus').textContent=`AI mode changed to ${providerName()}. Generate the sync plan again with the saved timing.`;}refreshAvailability();});
$('editTimingPlan').addEventListener('click',()=>{document.querySelector('.ai-script-flow').classList.remove('plan-review-active');$('timingHeading').scrollIntoView({behavior:'smooth',block:'start'});});
$('openMotionStudio').addEventListener('click',event=>{if(!scenePlanSaved){event.preventDefault();$('localAnalysisStatus').textContent='Wait for the generated sync plan and MP3 to finish saving, then open Motion Studio.';return;}if(!projectVoiceoverId)return;event.preventDefault();window.parent.postMessage({type:'invincible-apply-ai-draft'},location.origin);});
$('reloadVoices').addEventListener('click',()=>fetchVoices());
 $('engine').addEventListener('change',()=>{voiceDemo.stop();languages();families();remember();});
 for(const id of ['model','direction','creativeInstructions'])$(id).addEventListener('input',()=>{remember();if(id==='creativeInstructions'){scenePlanSaved=false;scheduleScriptSyncSave();if(!$('scenePlanReview').hidden){$('scenePlanReview').hidden=true;document.querySelector('.ai-script-flow').classList.remove('plan-review-active');$('localAnalysisStatus').textContent='Animation instructions changed. Generate the sync plan again.';}updateScenePlanGate();}});
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
 epoch++;voiceEpoch++;clearTimeout(saveTimer);clearTimeout(scriptSyncSaveTimer);scriptSyncSaveTimer=null;voiceDemo.stop();busy=false;loading=false;voices=[];clearAudio();user=next;
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
 meters();fetchVoices({initial:true}).finally(()=>restoreScriptSync());
});
updateProviderUi();
window.addEventListener('beforeunload',()=>{voiceDemo.stop();clearTimeout(scriptSyncSaveTimer);if(timedTranscript)persistScriptSync().catch(()=>{});if(audioUrl)URL.revokeObjectURL(audioUrl);});
