// One persistent media element keeps playback authorised after Start on mobile.
export function createNarrator({schedule,onStatus}){
 const audio=new Audio();audio.preload='auto';audio.setAttribute('playsinline','');
 audio.id='storyNarration';audio.hidden=true;document.body.append(audio);
 let clips={},active=0,muted=false,paused=false,finish=null,failActive=null,loadTimer=null;
 const ready=fetch(new URL('./audio/manifest.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('manifest');return r.json();}).then(data=>{clips=data.clips;if(clips['intro.dreams'])audio.src=new URL('./audio/'+clips['intro.dreams'].file,import.meta.url).href;}).catch(()=>{});
 function status(value){onStatus({value,muted,paused});}
 function cancel(){active++;clearTimeout(loadTimer);loadTimer=null;audio.onended=audio.onerror=audio.onplaying=null;audio.pause();paused=false;finish=null;failActive=null;status('idle');}
 function cue(key,done,fallback=4800){
  cancel();const token=active,clip=clips[key];let settled=false;
  const complete=()=>{if(token!==active||settled)return;settled=true;clearTimeout(loadTimer);finish=null;status('idle');if(done)schedule(400,done);};
  const fail=()=>{if(token!==active||settled)return;settled=true;clearTimeout(loadTimer);finish=null;failActive=null;audio.pause();status('unavailable');if(done)schedule(fallback,done);};
  finish=complete;failActive=fail;if(!clip){fail();return;}
  audio.src=new URL('./audio/'+clip.file,import.meta.url).href;audio.muted=muted;
  audio.onended=complete;audio.onerror=fail;audio.onplaying=()=>{clearTimeout(loadTimer);if(paused){audio.pause();return;}status('playing');};
  loadTimer=setTimeout(fail,12000);status('loading');
  if(!paused)audio.play().catch(fail);
 }
 function pause(){paused=true;clearTimeout(loadTimer);audio.pause();status('paused');}
 function resume(){paused=false;if(finish&&!audio.ended){if(audio.readyState<3)loadTimer=setTimeout(()=>failActive?.(),12000);audio.play().catch(()=>failActive?.());status('loading');}}
 function toggle(){muted=!muted;audio.muted=muted;status(audio.paused?'idle':'playing');}
 return{ready,cue,cancel,pause,resume,toggle,get muted(){return muted;}};
}
