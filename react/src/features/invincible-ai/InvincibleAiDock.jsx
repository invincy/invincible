import{useEffect,useRef,useState}from'react';
import{useAiConversation}from'./hooks/useAiConversation';
import'./invincible-ai-dock.css';

const MicIcon=()=> <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.3a3.8 3.8 0 0 0 3.8-3.8V6.8a3.8 3.8 0 1 0-7.6 0v4.7a3.8 3.8 0 0 0 3.8 3.8Z"/><path d="M5.8 11.2a6.2 6.2 0 0 0 12.4 0M12 17.4V21M8.7 21h6.6"/></svg>;
const ChatIcon=()=> <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 18.1 3.7 21l4.1-1.2c1.2.6 2.6.9 4.2.9 5 0 9-3.6 9-8.1s-4-8.1-9-8.1-9 3.6-9 8.1c0 2.1.8 4 2.2 5.5Z"/><path d="M8 12.5h.1M12 12.5h.1M16 12.5h.1"/></svg>;

function DockMessage({message}){
 const assistant=message.role==='assistant';
 return <article className={'ai-dock-message '+(assistant?'assistant':'user')}><span>{assistant?'I':'YOU'}</span><div><p>{message.content}</p>{assistant&&message.actions?.map((action,index)=><small key={`${action.tool}-${index}`} className={action.status==='failed'?'failed':''}>{action.status==='failed'?'!':'✓'} {action.summary}</small>)}</div></article>;
}

export function InvincibleAiDock({pageTitle,embedded=false}){
 const{messages,pending,actions,sending,error,send}=useAiConversation();
 const[mode,setMode]=useState('closed'),[draft,setDraft]=useState(''),[listening,setListening]=useState(false),[voiceText,setVoiceText]=useState(''),[voiceStatus,setVoiceStatus]=useState('Tap the orb and speak naturally.');
 const stream=useRef(null),recognition=useRef(null),voiceBuffer=useRef(''),waitingForReply=useRef(false),previousReply=useRef('');
 const speechRecognition=typeof window!=='undefined'&&(window.SpeechRecognition||window.webkitSpeechRecognition);
 const lastAssistant=[...messages].reverse().find(message=>message.role==='assistant');

 useEffect(()=>{if(embedded)window.parent.postMessage({type:'invincible-ai-widget',mode},location.origin)},[embedded,mode]);
 useEffect(()=>{if(mode==='chat')stream.current?.scrollTo({top:stream.current.scrollHeight,behavior:'smooth'})},[mode,messages,pending,sending]);
 useEffect(()=>()=>{recognition.current?.abort();window.speechSynthesis?.cancel()},[]);
 useEffect(()=>{
  if(!waitingForReply.current||sending||!lastAssistant||lastAssistant.id===previousReply.current)return;
  waitingForReply.current=false;previousReply.current=lastAssistant.id;setVoiceStatus('Reply received. Tap again for another command.');
  if('speechSynthesis'in window){window.speechSynthesis.cancel();const reply=new SpeechSynthesisUtterance(String(lastAssistant.content||'').replace(/[*_#`]/g,''));reply.lang='en-IN';reply.rate=1;window.speechSynthesis.speak(reply)}
 },[lastAssistant?.id,sending]);
 useEffect(()=>{if(error&&waitingForReply.current){waitingForReply.current=false;setVoiceStatus('That request stopped. Open Chat to see the error or try again.')}},[error]);

 const close=()=>{recognition.current?.abort();setListening(false);setMode('closed')};
 const submit=event=>{event?.preventDefault();const text=draft.trim();if(!text||sending)return;setDraft('');send(text)};
 const sendVoice=async text=>{if(!text||sending)return;previousReply.current=lastAssistant?.id||'';waitingForReply.current=true;setVoiceStatus('Invincible is working on it…');await send(text)};
 const startListening=()=>{
  if(!speechRecognition){setVoiceStatus('Voice input is not supported in this browser. Use Chat instead.');return}
  window.speechSynthesis?.cancel();voiceBuffer.current='';setVoiceText('');setVoiceStatus('Listening…');
  const listener=new speechRecognition();recognition.current=listener;listener.lang='en-IN';listener.interimResults=true;listener.continuous=false;
  listener.onstart=()=>setListening(true);
  listener.onresult=event=>{let text='';for(let index=event.resultIndex;index<event.results.length;index++)text+=event.results[index][0].transcript;voiceBuffer.current=text.trim();setVoiceText(text.trim())};
  listener.onerror=event=>{setListening(false);setVoiceStatus(event.error==='not-allowed'?'Microphone permission is blocked. Allow it in the browser settings.':'I could not hear that clearly. Tap and try again.')};
  listener.onend=()=>{setListening(false);const text=voiceBuffer.current.trim();if(text)sendVoice(text);else setVoiceStatus('Tap the orb and speak naturally.')};
  listener.start();
 };
 const stopListening=()=>recognition.current?.stop();
 const openMode=next=>{setMode(next);if(next==='voice')setVoiceStatus(speechRecognition?'Tap the orb and speak naturally.':'Voice input is not supported here. Use Chat instead.')};

 return <aside className={'invincible-ai-dock mode-'+mode+(embedded?' embedded':'')} aria-label="Invincible AI assistant">
  {mode==='menu'&&<div className="ai-dock-choices" role="menu">
   <button type="button" onClick={()=>openMode('voice')} role="menuitem"><span><MicIcon/></span><b>Speak</b></button>
   <button type="button" onClick={()=>openMode('chat')} role="menuitem"><span><ChatIcon/></span><b>Chat</b></button>
  </div>}
  {mode==='chat'&&<section className="ai-dock-panel ai-dock-chat" role="dialog" aria-label="Chat with Invincible AI">
   <header><div className="ai-dock-mini-avatar">I</div><div><strong>Invincible AI</strong><small>{pageTitle} context</small></div><a href="/invincible/ai/" aria-label="Open full Invincible AI page">↗</a><button type="button" onClick={close} aria-label="Close Invincible AI">×</button></header>
   <div className="ai-dock-stream" ref={stream} aria-live="polite">
    {!messages.length&&!sending&&<div className="ai-dock-empty"><span>✦</span><strong>What should I handle?</strong><p>Create tasks, update projects, or choose your next action.</p></div>}
    {messages.slice(-30).map(message=><DockMessage key={message.id} message={message}/>)}
    {pending&&<DockMessage message={{role:'user',content:pending}}/>}
    {sending&&<div className="ai-dock-thinking"><i/><i/><i/><span>Checking Invincible…</span></div>}
    {!sending&&actions.map((action,index)=><div className="ai-dock-action" key={`${action.tool}-${index}`}>✓ {action.summary}</div>)}
    {error&&<div className="ai-dock-error">{error}</div>}
   </div>
   <form onSubmit={submit}><textarea rows="1" value={draft} onChange={event=>setDraft(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();submit()}}} placeholder="Tell Invincible what to do…" maxLength="4000"/><button type="submit" disabled={!draft.trim()||sending} aria-label="Send">↑</button></form>
  </section>}
  {mode==='voice'&&<section className="ai-dock-panel ai-dock-voice" role="dialog" aria-label="Speak to Invincible AI">
   <header><div className="ai-dock-mini-avatar">I</div><div><strong>Voice command</strong><small>{pageTitle}</small></div><button type="button" onClick={()=>openMode('chat')} aria-label="Switch to chat"><ChatIcon/></button><button type="button" onClick={close} aria-label="Close Invincible AI">×</button></header>
   <div className="ai-voice-body"><button type="button" className={'ai-voice-orb '+(listening?'listening':'')+(sending?' thinking':'')} onClick={listening?stopListening:startListening} disabled={sending} aria-label={listening?'Stop listening':'Start speaking'}><span><MicIcon/></span><i/><i/><i/></button><strong>{listening?'Listening':sending?'Thinking':'Speak to Invincible'}</strong><p>{voiceText||voiceStatus}</p>{error&&<small className="ai-dock-error">{error}</small>}</div>
   <footer><span>Replies play aloud in voice mode.</span><button type="button" onClick={()=>openMode('chat')}>Open chat</button></footer>
  </section>}
  <button type="button" className="ai-dock-avatar" onClick={()=>mode==='closed'?setMode('menu'):close()} aria-expanded={mode!=='closed'} aria-label={mode==='closed'?'Open Invincible AI':mode==='menu'?'Close Invincible AI menu':'Close Invincible AI'}><span>I</span><i/><b>{mode==='closed'?'AI':'×'}</b></button>
 </aside>;
}
