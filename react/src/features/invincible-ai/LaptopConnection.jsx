import {useEffect,useState} from 'react';
import {checkLaptopConnection,connectThisLaptop,createLocalAgentPairing,mobileLaptop} from './services/aiService';
import './laptop-connection.css';

export function LaptopConnection({allowReset=false}) {
 const [state,setState]=useState('checking'),[attempt,setAttempt]=useState(0);
 const [settingUp,setSettingUp]=useState(false),[pairing,setPairing]=useState(null),[error,setError]=useState('');
 useEffect(()=>{
  let active=true;
  checkLaptopConnection().then(online=>{
   if(active)setState(online?'online':'offline');
  }).catch(()=>{
   if(active)setState('offline');
  });
  return()=>{active=false};
 },[attempt]);
 const refresh=()=>{setState('checking');setAttempt(value=>value+1)};
 async function setup(){
  setSettingUp(true);setError('');
  try{await connectThisLaptop();refresh()}catch(e){setError(e.message)}
  finally{setSettingUp(false)}
 }
 async function replaceKey(){
  if(!window.confirm('Create a new remote key? This disables the saved remote key. You’ll need to save the new key on the laptop.'))return;
  setSettingUp(true);setError('');setPairing(null);
  try{setPairing(await createLocalAgentPairing(`laptop-${Date.now().toString(36)}`))}
  catch(e){setError(e.message)}
  finally{setSettingUp(false)}
 }
 return <div className="ai-laptop-connection" data-state={state}>
  <div className="ai-laptop-bar">
   <span className="ai-laptop-dot" aria-hidden="true"/>
   <span role="status">{{online:'Laptop online',offline:'Laptop offline',checking:'Checking laptop…'}[state]}</span>
   <button type="button" onClick={refresh} disabled={state==='checking'} title="Refresh laptop connection" aria-label="Refresh laptop connection">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.4 6M20 4v7h-7"/></svg>
   </button>
   {!mobileLaptop&&<details><summary>Laptop settings</summary>
    <button type="button" onClick={setup} disabled={settingUp}>Set up this laptop</button>
    {allowReset&&<button type="button" onClick={replaceKey} disabled={settingUp}>Replace remote key</button>}
    {pairing&&<div className="ai-pairing-card"><strong>New remote key</strong><p>Save it on the laptop using the token setup script.</p><code>{pairing.token}</code></div>}
   </details>}
  </div>
  {error&&<p role="alert">{error}</p>}
 </div>;
}
