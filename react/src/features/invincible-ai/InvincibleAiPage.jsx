import{useEffect,useRef,useState}from'react';
import{useAuth}from'../../AuthContext';
import{ImageStudio}from'./ImageStudio';
import{useAiConversation}from'./hooks/useAiConversation';
import{isLocalAiAvailable,PROVIDERS}from'./services/aiService';
import{ServiceConnections}from'./ServiceConnections';
import'./invincible-ai.css';

const tools = [['chat', 'Chat'], ['images', 'Images'], ['voiceover', 'Voiceover']];

const starterPrompts=[
 'Create a project for my next video',
 'What should I work on next?',
 'Show my active projects'
];

function ActionStatus({action}){
 const failed=action?.status==='failed',tool=typeof action?.tool==='string'?action.tool.split('_').join(' '):'app action',summary=typeof action?.summary==='string'?action.summary:'';return <div className={'ai-action-status '+(failed?'failed':'')}><span>{failed?'!':'✓'}</span><div><strong>{tool}</strong><small>{summary}</small></div></div>;
}

function Message({message}){
 const assistant=message.role==='assistant';return <article className={'ai-message '+(assistant?'assistant':'user')}><div className="ai-message-mark">{assistant?'I':'YOU'}</div><div className="ai-message-body"><p>{message.content}</p>{assistant&&Array.isArray(message.actions)&&message.actions.length>0&&<div className="ai-message-actions">{message.actions.map((action,index)=><ActionStatus key={`${action.tool}-${index}`} action={action}/>)}</div>}</div></article>;
}

export function InvincibleAiPage(){
 const{user}=useAuth(),[mode,setMode]=useState(()=>{const tool=new URLSearchParams(window.location.search).get('tool');return tools.some(([id])=>id===tool)?tool:'chat'});
 const imageConnectionRef=useRef(null),[imageConnection,setImageConnection]=useState(null);
 const{messages,pending,actions,sending,error,send,newConversation,provider,setProvider}=useAiConversation(),[draft,setDraft]=useState(''),end=useRef(null),input=useRef(null);
 useEffect(()=>{const stream=end.current?.parentElement;if(stream)stream.scrollTop=stream.scrollHeight},[messages,pending,sending]);
 useEffect(()=>{const showImages=()=>setMode('images');window.addEventListener('invincible-image-job',showImages);return()=>window.removeEventListener('invincible-image-job',showImages)},[]);
 const [voiceoverOpened,setVoiceoverOpened]=useState(mode==='voiceover');
 const selectTool=tool=>{
  if(tool==='voiceover')setVoiceoverOpened(true);
  setMode(tool);
 };
 const handleTabKey=(event,index)=>{
  const offsets={ArrowLeft:-1,ArrowRight:1};
  if(!(event.key in offsets)&&event.key!=='Home'&&event.key!=='End')return;
  event.preventDefault();
  const nextIndex=event.key==='Home'?0:event.key==='End'?tools.length-1:(index+offsets[event.key]+tools.length)%tools.length;
  const [next]=tools[nextIndex];
  selectTool(next);
  document.getElementById('ai-tool-'+next)?.focus();
 };
 const submit=event=>{event.preventDefault();const text=draft.trim();if(!text)return;setDraft('');send(text)};
 const ask=text=>{setDraft(text);if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>input.current?.focus());else input.current?.focus()};
 return <div className="invincible-ai-page">
  <div className="ai-ambient" aria-hidden="true"></div>
  <header className="ai-page-header"><div><h1>Invincible <em>AI</em></h1></div><div className="ai-page-actions" hidden={mode!=='chat'}><label className="ai-provider-picker">PROVIDER<select aria-label="AI provider" value={provider} onChange={event=>setProvider(event.target.value)}><option value={PROVIDERS.cloud}>Cloud · OpenAI</option><option value={PROVIDERS.local} disabled={!isLocalAiAvailable}>Local · Qwen3 4B</option></select></label><button type="button" onClick={newConversation} aria-label="New chat" title="New chat"><span aria-hidden="true">＋</span><span className="ai-action-label"> New chat</span></button></div></header>
  <ServiceConnections key={user?.uid} accountId={user?.uid} imageConnection={imageConnection?.accountId===user?.uid ? imageConnection : null} imageConnectionRef={imageConnectionRef}/>
  <nav className="ai-tool-tabs" role="tablist" aria-label="Invincible AI tools">
   {tools.map(([value,label],index)=><button key={value} type="button" id={'ai-tool-'+value} role="tab" aria-selected={mode===value} aria-controls={'ai-panel-'+value} tabIndex={mode===value?0:-1} onClick={()=>selectTool(value)} onKeyDown={event=>handleTabKey(event,index)}>{label}</button>)}
  </nav>
  <div id="ai-panel-images" className="ai-tool-panel" role="tabpanel" aria-labelledby="ai-tool-images" hidden={mode!=='images'}><ImageStudio accountId={user?.uid||null} connectionRef={imageConnectionRef} onConnectionChange={setImageConnection}/></div>
  <main id="ai-panel-chat" role="tabpanel" aria-labelledby="ai-tool-chat" className="ai-chat-panel" tabIndex={0} hidden={mode!=='chat'}>
   <div className="ai-chat-stream" aria-live="polite">
    {!messages.length&&!pending&&<section className="ai-welcome"><div className="ai-brain-orbit"><span>✦</span></div><h2>What are we moving forward?</h2><div>{starterPrompts.map(prompt=><button key={prompt} onClick={()=>ask(prompt)}>{prompt}<span>→</span></button>)}</div></section>}
    {messages.map(message=><Message key={message.id} message={message}/>)}
    {pending&&<Message message={{role:'user',content:pending}}/>}
    {sending&&<article className="ai-message assistant thinking"><div className="ai-message-mark">I</div><div className="ai-message-body"><div className="ai-thinking-dots" aria-hidden="true"><i/><i/><i/></div><span>Reading the relevant Invincible state…</span></div></article>}
    {!sending&&actions.length>0&&<div className="ai-latest-actions">{actions.map((action,index)=><ActionStatus key={`${action.tool}-${index}`} action={action}/>)}</div>}
    {error&&<div className="ai-error" role="alert"><strong>Request stopped</strong><span>{error}</span></div>}
    <div ref={end}/>
   </div>
   <form className="ai-composer" onSubmit={submit}><textarea aria-label="Message" ref={input} rows="1" value={draft} onChange={event=>setDraft(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();submit(event)}}} placeholder="Tell Invincible what you want to create, finish, or do next…" maxLength="4000"/><button type="submit" disabled={sending||!draft.trim()} aria-label="Send message"><span>Send</span>↗</button></form>
  </main>
  <div id="ai-panel-voiceover" className="ai-tool-panel" role="tabpanel" aria-labelledby="ai-tool-voiceover" hidden={mode!=='voiceover'}>
   {voiceoverOpened&&<iframe className="ai-voiceover-frame" title="Voiceover Studio" src="/invincible/creator/tts.html?embed=ai"/>}
  </div>
 </div>;
}
