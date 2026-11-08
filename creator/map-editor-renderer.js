import {drawMapLabel} from './map-label-card.js';
import {locationVisible} from './map-globe.js';
import {resolveMapAsset} from './map-assets-client.js';
import {icons,layerActive,layerStart,layerAlpha,transformedCorners} from './map-editor-model.js';
import {routeAt,timeOf,lightingFrame} from './history-model.js';
// Each geographic object gets its own style layer, in the saved bottom-to-top order.
export function createVisualRenderer(map,project,onError){
 let spec=null,revision=0,owned=[],images=[],disposed=false,assetErrors=[];const models=new Map();
 const native=!!map.removeLayer;
 const id=l=>'visual-'+l.id;
 function clear(){for(const key of [...owned].reverse()){if(map.getLayer(key))map.removeLayer(key);if(map.getSource(key))map.removeSource(key);}for(const key of images)if(map.hasImage(key))map.removeImage(key);owned=[];images=[];models.clear();}
 async function setSpec(next){
  spec=next;assetErrors=[];const rev=++revision;if(!native)return;if(disposed)return;clear();
  if(map.getLayer('map-relief'))map.removeLayer('map-relief');
  if(map.getTerrain())map.setTerrain(null);if(map.getSource('visual-dem'))map.removeSource('visual-dem');
  const terrain=spec.visual?.terrain;if(terrain?.enabled){map.addSource('visual-dem',{type:'raster-dem',...(terrain.tiles?{tiles:terrain.tiles,minzoom:0,maxzoom:15}:{url:terrain.url}),encoding:terrain.encoding,attribution:terrain.attribution,tileSize:256});map.setTerrain({source:'visual-dem',exaggeration:terrain.exaggeration});map.addLayer({id:'map-relief',type:'hillshade',source:'visual-dem',paint:{'hillshade-illumination-anchor':'map','hillshade-exaggeration':0.45,'hillshade-shadow-color':'#273c58','hillshade-highlight-color':'#fff1ca','hillshade-accent-color':'#4e705b'}});}
  for(const l of spec.visual?.layers||[]){
   if(l.kind==='event'||l.kind==='label')continue;const key=id(l);owned.push(key);
   try{
    if(l.kind==='glb'){
     if(spec.projection==='globe'){onError('3D models are retained but hidden in Globe view. Switch to Flat map to preview them.');continue;}
     const {createModelLayer}=await import('./vendor/map-model.mjs');if(disposed||rev!==revision)return;
     const asset=spec.visual.assets.find(a=>a.id===l.assetId),model=createModelLayer(key,l,await resolveMapAsset(asset),message=>{assetErrors.push(message);onError(message);});if(disposed||rev!==revision)return;models.set(key,model);map.addLayer(model);continue;
    }
    if(l.kind==='image'){const a=spec.visual.assets.find(a=>a.id===l.assetId),url=await resolveMapAsset(a);if(disposed||rev!==revision)return;map.addSource(key,{type:'image',url,coordinates:transformedCorners(l)});map.addLayer({id:key,type:'raster',source:key,paint:{'raster-opacity':l.opacity,'raster-fade-duration':0}});continue;}
    map.addSource(key,{type:'geojson',data:{type:'FeatureCollection',features:[]}});
    if(l.kind==='feature'||l.kind==='route'){
     const f=spec.features.features.find(f=>f.properties.id===l.ref),line=l.kind==='route'||f?.geometry.type==='LineString';
     map.addLayer({id:key,type:line?'line':'fill',source:key,paint:line?{'line-color':l.color,'line-width':l.lineWidth??3,'line-opacity':l.opacity,'line-dasharray':l.dash?.length?l.dash:[1,0],'line-opacity-transition':{duration:0}}:{'fill-color':l.color,'fill-opacity':l.opacity,'fill-opacity-transition':{duration:0}}});
    }else{
     const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.font='600 42px system-ui';ctx.fillStyle=l.color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineWidth=5;ctx.strokeStyle='#071923';ctx.strokeText(l.kind==='icon'?icons[l.icon]:l.name,256,48,500);ctx.fillText(l.kind==='icon'?icons[l.icon]:l.name,256,48,500);
     map.addImage(key,ctx.getImageData(0,0,c.width,c.height));images.push(key);
     map.addLayer({id:key,type:'symbol',source:key,layout:{'icon-image':key,'icon-size':Math.min(l.scale,10)*0.5,'icon-rotate':l.rotation,'icon-allow-overlap':true},paint:{'icon-opacity':l.opacity,'icon-opacity-transition':{duration:0}}});
    }
   }catch(e){assetErrors.push(l.name+': '+e.message);onError(l.name+': '+e.message);}
  }
 }
 function frame(time){
  if(!spec)return;
  if(native&&map.getLayer('map-relief')){const light=lightingFrame(project,spec,time);map.setPaintProperty('map-relief','hillshade-illumination-direction',light.direction);map.setPaintProperty('map-relief','hillshade-exaggeration',light.intensity);}
  for(const l of spec.visual?.layers||[]){
   const key=id(l);if(l.kind==='event')continue;
   const historical=spec.features.features.find(f=>f.properties.id===l.ref),alpha=layerAlpha(project,l,time),active=l.kind==='feature'?l.visible&&timeOf(project,historical?.properties||{})<=time&&(l.sceneId===undefined||layerActive(project,l,time)):layerActive(project,l,time);
   if(!native||!map.getLayer(key))continue;
   if(l.kind==='glb'){models.get(key).visible=active;models.get(key).opacity=alpha;continue;}
   map.setLayoutProperty(key,'visibility',active?'visible':'none');if(!active)continue;
   const type=map.getLayer(key).type,property=type==='line'?'line-opacity':type==='fill'?'fill-opacity':type==='raster'?'raster-opacity':'icon-opacity';map.setPaintProperty(key,property,alpha);if(l.kind==='image')continue;
   let geometry;
   if(l.kind==='feature')geometry=historical.geometry.type==='LineString'?{type:'LineString',coordinates:routeAt(historical.geometry.coordinates,(time-timeOf(project,historical.properties))/historical.properties.duration)}:historical.geometry;
   else if(l.kind==='route')geometry={type:'LineString',coordinates:routeAt(l.coordinates,(time-layerStart(project,l))/(l.revealDuration??l.duration))};
   else geometry={type:'Point',coordinates:l.position};
   map.getSource(key)?.setData({type:'Feature',properties:{},geometry});
  }
 }
 function overlay(ctx,time,occupied=[]){
  if(!spec)return;
  for(const l of spec.visual?.layers||[]){
   if(!layerActive(project,l,time))continue;
   if(l.kind==='route'){const points=routeAt(l.coordinates,(time-layerStart(project,l))/(l.revealDuration??l.duration));if(!locationVisible(map,points.at(-1),spec.projection)||!locationVisible(map,points.at(-2),spec.projection))continue;const a=map.project(points.at(-2)),b=map.project(points.at(-1));ctx.save();ctx.globalAlpha=layerAlpha(project,l,time);ctx.fillStyle=l.color;if(!native){ctx.strokeStyle=l.color;ctx.lineWidth=l.lineWidth??3;ctx.setLineDash((l.dash||[]).map(n=>n*ctx.lineWidth));ctx.beginPath();points.forEach((c,i)=>{const p=map.project(c);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);});ctx.stroke();}if(l.arrowhead!==false){ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.y-a.y,b.x-a.x));ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-12,-5);ctx.lineTo(-12,5);ctx.fill();}ctx.restore();}
   if(l.kind==='label'){if(!locationVisible(map,l.position,spec.projection))continue;const p=map.project(l.position),host=map.getContainer?.()||map.host;ctx.save();ctx.globalAlpha=layerAlpha(project,l,time);drawMapLabel(ctx,l.name,p.x,p.y,{width:host.clientWidth,height:host.clientHeight,color:l.color,size:Math.max(17,28*l.scale),offset:l.labelOffset||[0,0],marker:!!l.marker,occupied});ctx.restore();}
   if(!native&&l.kind==='icon'){const p=map.project(l.position);ctx.save();ctx.globalAlpha=layerAlpha(project,l,time);ctx.fillStyle=l.color;ctx.font=`${24*Math.min(l.scale,10)}px system-ui`;ctx.fillText(l.kind==='icon'?icons[l.icon]:l.name,p.x,p.y);ctx.restore();}
  }
 }
 return {setSpec,frame,overlay,native,get assetErrors(){return [...assetErrors];},get assetsReady(){return [...models.values()].every(m=>m.loaded);},destroy(){disposed=true;revision++;if(native){clear();map.setTerrain(null);if(map.getLayer('map-relief'))map.removeLayer('map-relief');if(map.getSource('visual-dem'))map.removeSource('visual-dem');}}};
}
