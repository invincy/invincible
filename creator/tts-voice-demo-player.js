import {voiceDemoUrl} from './tts-voice-demos.js';
/** Plays only Google's existing public demo files. Never calls synthesis. */
export function createVoiceDemoPlayer({button,audio,message,recording,getVoice,canPlay}){
 let version=0,activeVoice='';
 const initial='Listen to Google’s original sample. No narration needed.';
 function render(playing=false,waiting=false){
  button.setAttribute('aria-pressed',String(playing));
  button.setAttribute('aria-busy',String(waiting));
  button.querySelector('[data-demo-icon]').textContent=waiting?'…':playing?'Ⅱ':'▶';
  const voice=getVoice();
  button.setAttribute('aria-label',(playing?'Stop':'Play')+' Google sample'+(voice?' for '+voice:''));
 }
 function stop(){
  version++;activeVoice='';audio.pause();audio.removeAttribute('src');audio.load();message.textContent=initial;message.classList.remove('error');render();
 }
 function refresh(){
  stop();
  button.disabled=!canPlay()||!voiceDemoUrl(getVoice());
  message.textContent=voiceDemoUrl(getVoice())?initial:'Google has no ready-made sample for this voice.';
  message.classList.remove('error');
 }
 async function play(){
  const voice=getVoice(),url=voiceDemoUrl(voice);
  if(!canPlay()||!url)return;
  if(activeVoice===voice&&!audio.paused){stop();message.textContent=initial;return;}
  stop();recording.pause();
  const current=version;activeVoice=voice;audio.src=url;
  message.textContent='Loading Google’s voice sample…';message.classList.remove('error');render(false,true);
  try{
   await audio.play();
   if(version!==current)return;
   render(true);message.textContent='Playing Google’s original voice settings. Click again to stop.';
  }catch{
   if(version!==current)return;
   stop();message.textContent='This Google sample could not play. Try again or choose another voice.';message.classList.add('error');
  }
 }
 button.addEventListener('click',play);
 audio.addEventListener('ended',()=>{stop();message.textContent=initial;});
 audio.addEventListener('error',()=>{
  if(!activeVoice||!audio.error)return;
  stop();message.textContent='This Google sample is unavailable. Choose another voice or try again.';message.classList.add('error');
 });
 recording.addEventListener('play',stop);
 return {stop,refresh,available:()=>!!voiceDemoUrl(getVoice())};
}
