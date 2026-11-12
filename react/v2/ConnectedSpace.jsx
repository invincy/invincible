import React, {useEffect, useRef, useState} from 'react';
import {APP_BASE, spatialDestination} from '../../shared/navigation';

// Existing editors retain their runtime, auth adapter, recovery and export paths.
// Once visited, the frame stays mounted until account changes or the shell closes.
export default function ConnectedSpace({region, active, onNavigate, onLocation, onWheel, initialPath, requestedPath}) {
  const frame=useRef(null),cleanup=useRef(null),callbacks=useRef({onNavigate,onLocation,onWheel});
  callbacks.current={onNavigate,onLocation,onWheel};
  const [visited,setVisited]=useState(active),[loading,setLoading]=useState(true),[failed,setFailed]=useState(false);
  const [src,setSrc]=useState(()=>initialPath||region.href);
  useEffect(()=>{if(active&&!visited){setSrc(requestedPath||initialPath||region.href);setVisited(true);}},[active,visited,initialPath,requestedPath,region.href]);
  useEffect(()=>{if(visited&&requestedPath){setSrc(requestedPath);setLoading(true);}},[requestedPath]);
  useEffect(()=>()=>cleanup.current?.(),[]);
  const loaded=()=>{
    cleanup.current?.();
    try {
      const win=frame.current.contentWindow,doc=win.document;
      doc.documentElement.classList.add('connected-space-document');
      if(!doc.querySelector('[data-connected-style]')){
        const style=doc.createElement('link');style.rel='stylesheet';style.href=APP_BASE+'shared/spatial-desktop.css?v=1';style.dataset.connectedStyle='';doc.head.append(style);
      }
      const click=event=>{
        if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
        const link=event.target.closest('a[href]');
        if(!link||link.hasAttribute('download')||link.target&&link.target!=='_self')return;
        const destination=spatialDestination(link.href,location.href);
        if(!destination||destination.id===region.id)return;
        event.preventDefault();callbacks.current.onNavigate(destination.id,link.href);
      };
      const wheel=event=>{
        if(event.ctrlKey||doc.querySelector('dialog[open],[aria-modal="true"]'))return;
        const delta=event.shiftKey?event.deltaY:Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:0;
        if(!delta)return;
        // Timeline, map, canvas and any horizontal editor own their gestures.
        for(let node=event.target;node&&node!==doc.body;node=node.parentElement){
          if(node.matches?.('canvas,input,textarea,select,[role="slider"],.history-map,.maplibregl-map,.vs-timeline'))return;
          if(node.scrollWidth>node.clientWidth+2&&/auto|scroll/.test(win.getComputedStyle(node).overflowX))return;
        }
        event.preventDefault();callbacks.current.onWheel(delta);
      };
      const report=()=>{
        const url=new URL(win.location.href);
        if(spatialDestination(url.href,location.href)?.id===region.id)callbacks.current.onLocation(region.id,url.pathname+url.search+url.hash);
      };
      doc.addEventListener('click',click);doc.addEventListener('wheel',wheel,{passive:false});win.addEventListener('hashchange',report);
      cleanup.current=()=>{doc.removeEventListener('click',click);doc.removeEventListener('wheel',wheel);win.removeEventListener('hashchange',report);};
      report();setLoading(false);setFailed(false);
    } catch {setFailed(true);setLoading(false);}
  };
  return <div className="v2-connected-space">
    {loading&&active&&<p className="v2-space-loading" role="status">Opening {region.label}…{region.id==='finance'&&<> <a href={region.href} target="_blank" rel="noopener">Open Finance in a new tab ↗</a></>}</p>}
    {failed&&<p role="alert">This space could not open. <a href={region.href} target="_blank" rel="noopener">Open {region.label} in a new tab ↗</a></p>}
    {visited&&<iframe ref={frame} src={src} tabIndex={active?0:-1} style={{pointerEvents:active?undefined:'none'}} title={region.label+' workspace'} onLoad={loaded} allow="clipboard-write; microphone; fullscreen"/>}
  </div>;
}
