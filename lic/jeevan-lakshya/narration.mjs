export function createNarrator({schedule,onStatus}){
 const release=new URL(import.meta.url).search;
 const audio=new Audio();
 const defaultPlaybackSpeed=1.2;
 audio.defaultPlaybackRate=defaultPlaybackSpeed;
 audio.preservesPitch=true;
 audio.preload='auto';
 audio.setAttribute('playsinline','');
 audio.id='storyNarration';
 audio.hidden=true;
 document.body.append(audio);

 let clips={},active=0,muted=false,paused=false,loadTimer,retryBlocked,resumeClip;
 const ready=fetch(new URL('./audio/manifest.json'+release,import.meta.url))
  .then(response=>{
   if(!response.ok)throw Error('Narration manifest unavailable');
   return response.json();
  })
  .then(data=>{
   clips=data.clips;
   if(clips['intro.chime'])audio.src=clipUrl(clips['intro.chime']);
  })
  .catch(()=>{});

 function clipUrl(clip){return new URL('./audio/'+clip.file+release,import.meta.url).href;}
 function status(value){onStatus({value,muted,paused});}

 function cancel(){
  active++;
  clearTimeout(loadTimer);
  audio.onended=audio.onerror=audio.onplaying=null;
  audio.pause();
  paused=false;
  retryBlocked=resumeClip=null;
  status('idle');
 }

 function cue(key,done,fallback=4800,onStart){
  cancel();
  const token=active,clip=clips[key];
  const playbackSpeed=clip?.playbackRate??defaultPlaybackSpeed;
  let settled=false,started=false,attempt=0,lastFailedAttempt=-1;

  function startVisuals(){
   if(started)return;
   started=true;
   onStart?.();
  }

  function finish(){
   if(token!==active||settled)return;
   settled=true;
   clearTimeout(loadTimer);
   retryBlocked=resumeClip=null;
   status('idle');
   if(done)schedule(300,done);
  }

  function fail(error){
   if(token!==active||settled||lastFailedAttempt===attempt)return;
   lastFailedAttempt=attempt;
   clearTimeout(loadTimer);
   audio.pause();
   resumeClip=null;
   startVisuals();
   const blocked=error?.name==='NotAllowedError';
   retryBlocked=blocked?play:null;
   status(blocked?'blocked':'unavailable');
   const failedAttempt=attempt;
   if(done)schedule(fallback,()=>{
    if(token!==active||settled||attempt!==failedAttempt)return;
    settled=true;
    retryBlocked=null;
    done();
   });
  }

  function play(){
   const thisAttempt=++attempt;
   retryBlocked=null;
   resumeClip=play;
   clearTimeout(loadTimer);
   loadTimer=setTimeout(fail,5000);
   status('loading');
   audio.playbackRate=playbackSpeed;
   audio.play().catch(error=>{
    if(!paused&&attempt===thisAttempt)fail(error);
   });
  }

  if(!clip){fail();return;}
  const src=clipUrl(clip);
  if(audio.src!==src)audio.src=src;
  else audio.currentTime=0;
  audio.muted=muted;
  audio.onended=finish;
  audio.onerror=()=>fail();
  audio.onplaying=()=>{
   clearTimeout(loadTimer);
   if(paused){audio.pause();return;}
   status('playing');
   startVisuals();
  };
  play();
 }

 function pause(){
  paused=true;
  clearTimeout(loadTimer);
  audio.pause();
  status(retryBlocked?'blocked':'paused');
 }

 function resume(){
  paused=false;
  resumeClip?.();
 }

 function toggle(){
  if(retryBlocked&&!paused){retryBlocked();return;}
  muted=!muted;
  audio.muted=muted;
  status(retryBlocked?'blocked':audio.paused?'idle':'playing');
 }

 return{ready,cue,cancel,pause,resume,toggle};
}
