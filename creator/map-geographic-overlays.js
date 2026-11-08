import {overlayFrame} from './map-presets.js';
import {timeOf} from './history-model.js';
import {locationVisible} from './map-globe.js';
const prefix='appearance-',data=name=>new URL('./history-data/'+name+'.geojson',import.meta.url).href;
const palette=['#d4a34a','#629b86','#ac82ad','#ce8b68','#7a9dbb','#b9b56b','#bb7888'];
export function createGeographicOverlays(map){
 let spec,owned=[];
 const native=!!map.removeLayer;
 function clear(){for(const id of [...owned].reverse())if(map.getLayer(id))map.removeLayer(id);for(const name of ['countries','india-states'])if(map.getSource(prefix+name))map.removeSource(prefix+name);owned=[];}
 function setSpec(next){spec=next;if(!native)return;if(!spec.mapPreset&&!spec.overlays&&!spec.overlayKeys){clear();return;}if(owned.length&&map.getLayer(prefix+'fill'))return;clear();if(!spec.mapPreset&&!spec.overlays&&!spec.overlayKeys)return;
  for(const name of ['countries','india-states'])map.addSource(prefix+name,{type:'geojson',data:data(name),attribution:'Modern reference: Natural Earth (public domain; generalized boundaries)'});
  const before=map.getStyle().layers.find(l=>l.id==='territory'||l.type==='symbol')?.id;
  const add=(id,type,source,paint,layout={})=>{owned.push(prefix+id);map.addLayer({id:prefix+id,type,source:prefix+source,paint,layout},before);};
  add('fill','fill','countries',{'fill-color':'#d4a34a','fill-opacity':0,'fill-opacity-transition':{duration:0},'fill-color-transition':{duration:0}});
  add('state-fill','fill','india-states',{'fill-color':'#d4a34a','fill-opacity':0,'fill-opacity-transition':{duration:0},'fill-color-transition':{duration:0}});
  add('border','line','countries',{'line-color':'#ffffff','line-width':2,'line-opacity':1,'line-opacity-transition':{duration:0},'line-color-transition':{duration:0}});
  add('state-border','line','india-states',{'line-color':'#ffffff','line-width':1,'line-opacity':0,'line-opacity-transition':{duration:0}});
  // Canvas labels share the existing export compositor and need no external glyph service.
 }
 const expression=(overrides,key,fallback)=>{const entries=Object.entries(overrides).filter(([,v])=>v[key]!==undefined||key==='opacity'&&v.enabled===false);return entries.length?['match',['get','id'],...entries.flatMap(([id,v])=>[id,key==='opacity'&&v.enabled===false?0:v[key]]),fallback]:fallback;};
 function frame(time){if(!native||!map.getLayer(prefix+'fill'))return;const o=overlayFrame(nullProject,spec,time,timeOf);
  const political=spec.mapPreset==='india-political'&&o.countryFill.color.toLowerCase()==='#d4a34a',fill=political?['match',['get','palette'],...palette.flatMap((c,i)=>[i+1,c]),o.countryFill.color]:o.countryFill.color;
  const paint=(id,key,v)=>map.setPaintProperty(prefix+id,key,v);
  paint('fill','fill-color',expression(o.countries,'color',fill));paint('fill','fill-opacity',o.countryFill.enabled?expression(o.countries,'opacity',o.countryFill.opacity):0);
  paint('state-fill','fill-color',expression(o.states,'color',o.countryFill.color));paint('state-fill','fill-opacity',o.countryFill.enabled?expression(o.states,'opacity',0):0);
  for(const [id,v] of [['border',o.countryBorders],['state-border',o.stateBorders]]){paint(id,'line-color',v.color);paint(id,'line-width',v.width);paint(id,'line-opacity',v.enabled?v.opacity:0);}
 }
 let nullProject={scenes:[]},labelData;
 async function prepare(project){nullProject=project;if(!labelData)labelData=await Promise.all(['countries-labels','india-states-labels'].map(async name=>{const r=await fetch(data(name));if(!r.ok)throw Error('Geographic labels could not load.');return r.json();}));}
 function overlay(ctx,time){if(!spec||(!spec.mapPreset&&!spec.overlays&&!spec.overlayKeys))return;const o=overlayFrame(nullProject,spec,time,timeOf);
  if(o.labels.enabled&&labelData){ctx.save();ctx.font='600 11px system-ui';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#102331';ctx.fillStyle='#fff5dd';const occupied=[];for(const f of [...labelData[0].features,...(o.stateBorders.enabled?labelData[1].features:[])]){const c=f.geometry.coordinates;if(!locationVisible(map,c,spec.projection))continue;const p=map.project(c),w=ctx.measureText(f.properties.name).width;if(p.x<0||p.y<20||p.x>map.getCanvas().clientWidth||p.y>map.getCanvas().clientHeight-45||occupied.some(r=>Math.abs(p.x-r.x)<(w+r.w)/2+8&&Math.abs(p.y-r.y)<18))continue;occupied.push({...p,w});ctx.strokeText(f.properties.name,p.x,p.y);ctx.fillText(f.properties.name,p.x,p.y);}ctx.restore();}
  const c=o.ashokaChakra;if(!c.enabled||!locationVisible(map,[c.longitude,c.latitude],spec.projection))return;
  const p=map.project([c.longitude,c.latitude]),edge=map.project([c.longitude+1.2,c.latitude]),r=Math.hypot(edge.x-p.x,edge.y-p.y);ctx.save();ctx.translate(p.x,p.y);ctx.strokeStyle=c.color;ctx.globalAlpha=c.opacity;ctx.lineWidth=Math.max(1,r/15);ctx.beginPath();ctx.arc(0,0,r,0,2*Math.PI);ctx.stroke();ctx.beginPath();ctx.arc(0,0,r*0.13,0,2*Math.PI);for(let i=0;i<24;i++){const a=i*Math.PI/12;ctx.moveTo(Math.cos(a)*r*0.13,Math.sin(a)*r*0.13);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.stroke();ctx.restore();
 }
 return {setSpec,prepare,frame,overlay,destroy(){if(native)clear();}};
}
