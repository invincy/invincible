import{useEffect,useRef,useState}from'react';
import{useTasks}from'../../useTasks';
import{chooseFocusTask,taskSteps}from'../../task-model';
import{useAiConversation}from'./hooks/useAiConversation';
import'./invincible-ai.css';

const starterPrompts=[
 'Create a project for my next video',
 'What should I work on next?',
 'Show my active projects'
];

function ActionStatus({action}){
 const failed=action.status==='failed';return <div className={'ai-action-status '+(failed?'failed':'')}><span>{failed?'!':'✓'}</span><div><strong>{action.tool.replaceAll('_',' ')}</strong><small>{action.summary}</small></div></div>;
}

function Message({message}){
 const assistant=message.role==='assistant';return <article className={'ai-message '+(assistant?'assistant':'user')}><div className="ai-message-mark">{assistant?'I':'YOU'}</div><div className="ai-message-body"><p>{message.content}</p>{assistant&&Array.isArray(message.actions)&&message.actions.length>0&&<div className="ai-message-actions">{message.actions.map((action,index)=><ActionStatus key={`${action.tool}-${index}`} action={action}/>)}</div>}</div></article>;
}

export function InvincibleAiPage(){
 const{tasks}=useTasks(),focus=chooseFocusTask(tasks),next=taskSteps(focus).find(step=>!step.done&&step.status!=='Done');
 const{messages,pending,actions,sending,error,send,newConversation}=useAiConversation(),[draft,setDraft]=useState(''),end=useRef(null),input=useRef(null);
 useEffect(()=>end.current?.scrollIntoView({behavior:'smooth',block:'end'}),[messages,pending,sending]);
 const submit=event=>{event.preventDefault();const text=draft.trim();if(!text)return;setDraft('');send(text)};
 const ask=text=>{setDraft(text);requestAnimationFrame(()=>input.current?.focus())};
 return <div className="invincible-ai-page">
  <div className="ai-ambient" aria-hidden="true"><i/><i/><i/></div>
  <header className="ai-page-header"><div><span className="ai-eyebrow">INTENT → ACTION</span><h1>Invincible <em>AI</em></h1><p>Tell it what you want. It maintains the operational structure.</p></div><button type="button" onClick={newConversation}>＋ New chat</button></header>
  <section className="ai-context-bar" aria-label="Current Invincible context"><div className="ai-core-pulse" aria-hidden="true"><span/></div><div><small>CURRENT FOCUS</small><strong>{focus?.title||'No active focus'}</strong></div><div><small>NEXT ACTION</small><strong>{next?.title||next?.text||(focus?'Add the first clear stage':'Create or choose a project')}</strong></div><a href={focus?`/invincible/task/?id=${encodeURIComponent(focus.id)}`:'/invincible/'}>{focus?'Open project':'Open dashboard'} →</a></section>
  <main className="ai-chat-panel">
   <div className="ai-chat-stream" aria-live="polite">
    {!messages.length&&!pending&&<section className="ai-welcome"><div className="ai-brain-orbit"><span>✦</span></div><span className="ai-eyebrow">PHASE 1 · SAFE APP ACTIONS</span><h2>What are we moving forward?</h2><p>I can create Dashboard projects, turn plans into stages, update tasks, and choose the next action using the same Firestore data as Invincible.</p><div>{starterPrompts.map(prompt=><button key={prompt} onClick={()=>ask(prompt)}>{prompt}<span>→</span></button>)}</div></section>}
    {messages.map(message=><Message key={message.id} message={message}/>)}
    {pending&&<Message message={{role:'user',content:pending}}/>}
    {sending&&<article className="ai-message assistant thinking"><div className="ai-message-mark">I</div><div className="ai-message-body"><div className="ai-thinking-dots"><i/><i/><i/></div><span>Reading the relevant Invincible state…</span></div></article>}
    {!sending&&actions.length>0&&<div className="ai-latest-actions">{actions.map((action,index)=><ActionStatus key={`${action.tool}-${index}`} action={action}/>)}</div>}
    {error&&<div className="ai-error" role="alert"><strong>Request stopped</strong><span>{error}</span></div>}
    <div ref={end}/>
   </div>
   <form className="ai-composer" onSubmit={submit}><textarea ref={input} rows="1" value={draft} onChange={event=>setDraft(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();submit(event)}}} placeholder="Tell Invincible what you want to create, finish, or do next…" maxLength="4000"/><button type="submit" disabled={sending||!draft.trim()} aria-label="Send message"><span>Send</span>↗</button><small>Invincible AI can change tasks and projects. Finance writes and destructive actions are disabled in Phase 1.</small></form>
  </main>
 </div>;
}
