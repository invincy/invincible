import React,{useEffect,useRef,useState} from 'react';
import {canvasView,homeView,selectionBox,zoomCanvas} from './canvas-model';
import {captureArea} from './capture-area';

const glyphs={home:'M3 11 12 3l9 8M5 10v11h5v-7h4v7h5V10',minus:'M4 12h16',plus:'M4 12h16M12 4v16',select:'M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5M8 8h8v8H8z',ideas:'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5'};
const Glyph=({name})=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={glyphs[name]}/></svg>;

export default function FreeDashboardCanvas({uid,children,onMove,onCapture,onIdeas,restoreView}) {
  const key='invincible.dashboard.camera.'+uid;
  const [view,setView]=useState(()=>{try{return canvasView(JSON.parse(sessionStorage.getItem(key)));}catch{return homeView;}});
  const [selecting,setSelecting]=useState(false),[box,setBox]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const root=useRef(null),gesture=useRef(null),camera=useRef(view),pointers=useRef(new Map()),latestMove=useRef(onMove);
  latestMove.current=onMove;
  const change=next=>{const updated=canvasView(typeof next==='function'?next(camera.current):next);camera.current=updated;setView(updated);};
  useEffect(()=>{camera.current=view;try{sessionStorage.setItem(key,JSON.stringify(view));}catch{}const frame=requestAnimationFrame(()=>latestMove.current?.());return()=>cancelAnimationFrame(frame);},[view,key]);
  useEffect(()=>{if(restoreView)change(restoreView);},[restoreView]);
  useEffect(()=>{
    const node=root.current;
    const wheel=event=>{
      if(busy||selecting||event.target.closest('input,textarea,select,[data-canvas-scroll]'))return;
      event.preventDefault();const r=node.getBoundingClientRect();
      change(current=>event.ctrlKey||event.metaKey?zoomCanvas(current,Math.exp(-event.deltaY*.002),{x:event.clientX-r.left,y:event.clientY-r.top}):{...current,x:current.x-event.deltaX-(event.shiftKey?event.deltaY:0),y:current.y-(event.shiftKey?0:event.deltaY)});
    };
    node.addEventListener('wheel',wheel,{passive:false});return()=>node.removeEventListener('wheel',wheel);
  },[busy,selecting]);
  const point=event=>{const r=root.current.getBoundingClientRect();return {x:Math.max(0,Math.min(r.width,event.clientX-r.left)),y:Math.max(0,Math.min(r.height,event.clientY-r.top))};};
  const start=event=>{
    if(busy||event.button!==0||event.target.closest('[data-canvas-tools]')||(!selecting&&event.target.closest('button,a,input,textarea,select,summary')))return;
    event.preventDefault();root.current.setPointerCapture(event.pointerId);pointers.current.set(event.pointerId,point(event));
    const points=[...pointers.current.values()];
    if(points.length===2&&!selecting){gesture.current={type:'pinch',distance:Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y),view:camera.current};return;}
    gesture.current={type:selecting?'select':'pan',start:point(event),view:camera.current};
    if(selecting)setBox(selectionBox(point(event),point(event)));
  };
  const move=event=>{
    if(!pointers.current.has(event.pointerId)||!gesture.current)return;
    const p=point(event);pointers.current.set(event.pointerId,p);const g=gesture.current,points=[...pointers.current.values()];
    if(g.type==='pinch'&&points.length===2){const mid={x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2};change(zoomCanvas(g.view,Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y)/Math.max(1,g.distance),mid));}
    else if(g.type==='select')setBox(selectionBox(g.start,p));
    else if(g.type==='pan')change({...g.view,x:g.view.x+p.x-g.start.x,y:g.view.y+p.y-g.start.y});
  };
  const end=event=>{pointers.current.delete(event.pointerId);gesture.current=null;if(root.current.hasPointerCapture(event.pointerId))root.current.releasePointerCapture(event.pointerId);};
  const snap=async()=>{
    if(!box||box.width<40||box.height<40){setError('Select an area at least 40 × 40 pixels.');return;}
    const r=root.current.getBoundingClientRect();setBusy(true);setError('');
    try{const image=await captureArea({...box,x:r.left+box.x,y:r.top+box.y});onCapture({image,view:camera.current,area:box});setSelecting(false);setBox(null);}
    catch(failure){setError(failure.message||'Could not capture this area. Try again.');}finally{setBusy(false);}
  };
  return <div ref={root} className={'v2-dashboard-body v2-free-canvas'+(selecting?' is-selecting':'')} aria-label="Free dashboard canvas" tabIndex={0}
    data-camera-x={view.x} data-camera-y={view.y} data-camera-zoom={view.zoom}
    onFocusCapture={event=>{if(!event.target.closest('.v2-free-world'))return;const r=root.current.getBoundingClientRect(),t=event.target.getBoundingClientRect();const dx=t.left<r.left+12?r.left+12-t.left:t.right>r.right-12?r.right-12-t.right:0,dy=t.top<r.top+52?r.top+52-t.top:t.bottom>r.bottom-12?r.bottom-12-t.bottom:0;if(dx||dy)change(current=>({...current,x:current.x+dx,y:current.y+dy}));}}
    onClickCapture={event=>{if(selecting&&!event.target.closest('[data-canvas-tools]')){event.preventDefault();event.stopPropagation();}}}
    onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}
    onKeyDown={event=>{if(event.target!==event.currentTarget)return;const shifts={ArrowLeft:[80,0],ArrowRight:[-80,0],ArrowUp:[0,80],ArrowDown:[0,-80]};if(shifts[event.key]){event.preventDefault();event.stopPropagation();change({...camera.current,x:view.x+shifts[event.key][0],y:view.y+shifts[event.key][1]});}else if(event.key==='Home'){event.preventDefault();event.stopPropagation();change(homeView);}else if(event.key==='Escape'){setSelecting(false);setBox(null);}}}>
    <div className="v2-free-world" style={{transform:`translate(${view.x}px,${view.y}px) scale(${view.zoom})`}}>{children}</div>
    <div className="v2-canvas-tools" data-canvas-tools data-capture-exclude>
      <button type="button" aria-label="Home canvas" title="Home" disabled={busy} onClick={()=>change(homeView)}><Glyph name="home"/></button>
      <button type="button" aria-label="Zoom out canvas" title="Zoom out" disabled={busy} onClick={()=>change(zoomCanvas(view,.8,{x:root.current.clientWidth/2,y:root.current.clientHeight/2}))}><Glyph name="minus"/></button>
      <output aria-label="Canvas zoom">{Math.round(view.zoom*100)}%</output>
      <button type="button" aria-label="Zoom in canvas" title="Zoom in" disabled={busy} onClick={()=>change(zoomCanvas(view,1.25,{x:root.current.clientWidth/2,y:root.current.clientHeight/2}))}><Glyph name="plus"/></button>
      <button type="button" aria-label="Select canvas area" title="Save an area as an idea" aria-pressed={selecting} disabled={busy} onClick={()=>{setSelecting(!selecting);setBox(null);setError('');}}><Glyph name="select"/></button>
      <button type="button" aria-label="Saved ideas" title="Saved ideas" disabled={busy} onClick={onIdeas}><Glyph name="ideas"/></button>
    </div>
    {selecting&&<div className="v2-canvas-selection-layer" data-capture-exclude>{box&&<div className="v2-canvas-selection" style={{left:box.x,top:box.y,width:box.width,height:box.height}}/>}</div>}
    {selecting&&<div className="v2-canvas-capture-actions" data-canvas-tools data-capture-exclude><span>Drag an area</span><button disabled={busy||!box} onClick={snap}>{busy?'Capturing…':'Save area'}</button><button disabled={busy} onClick={()=>{setSelecting(false);setBox(null);}}>Cancel</button></div>}
    {error&&<p className="v2-canvas-error" role="alert" data-capture-exclude>{error}</p>}
  </div>;
}
