import {presentationAt} from './map-documentary.js?v=2026110903';
import {locationVisible} from './map-globe.js';
import {resolveMapAsset} from './map-assets-client.js';
import {icons,layerActive,layerStart,layerAlpha,transformedCorners} from './map-editor-model.js?v=2026110903';
import {routeAt,timeOf,lightingFrame} from './history-model.js?v=2026110903';
import {resolveOverlayPolicy} from './map-overlay-presets.js?v=2026110903';
// Each geographic object gets its own style layer, in the saved bottom-to-top order.
export function createVisualRenderer(map,project,onError,initialPolicy=null){
 let spec=null,policy=resolveOverlayPolicy(project,null,initialPolicy),revision=0,owned=[],images=[],disposed=false,assetErrors=[];const models=new Map(),geometryCache=new Map();
 const native=!!map.removeLayer;
 const id=l=>'visual-'+l.id;
 function paint(key,property,value){if(map.getPaintProperty&&map.getPaintProperty(key,property)===value)return;map.setPaintProperty(key,property,value);}
 function clear(){geometryCache.clear();for(const key of [...owned].reverse()){if(map.getLayer(key))map.removeLayer(key);if(map.getSource(key))map.removeSource(key);}for(const key of images)if(map.hasImage(key))map.removeImage(key);owned=[];images=[];models.clear();}
 async function setSpec(next,nextPolicy=null){
  spec=next;policy=resolveOverlayPolicy(project,next,nextPolicy??initialPolicy);assetErrors=[];const rev=++revision;if(!native)return;if(disposed)return;clear();
  if(map.getLayer('map-relief'))map.removeLayer('map-relief');
  if(map.getTerrain())map.setTerrain(null);if(map.getSource('visual-dem'))map.removeSource('visual-dem');
  const terrain=spec.visual?.terrain,relief=policy.renderer.relief,sym=policy.renderer.symbol;if(terrain?.enabled){map.addSource('visual-dem',{type:'raster-dem',...(terrain.tiles?{tiles:terrain.tiles,minzoom:0,maxzoom:15}:{url:terrain.url}),encoding:terrain.encoding,attribution:terrain.attribution,tileSize:256});map.setTerrain({source:'visual-dem',exaggeration:terrain.exaggeration});map.addLayer({id:'map-relief',type:'hillshade',source:'visual-dem',paint:{'hillshade-illumination-anchor':'map','hillshade-exaggeration':relief.exaggeration,'hillshade-shadow-color':relief.shadowColor,'hillshade-highlight-color':relief.highlightColor,'hillshade-accent-color':relief.accentColor}});}
  for(const l of spec.visual?.layers||[]){
   if(l.kind==='event'||spec.presentation&&['label','icon'].includes(l.kind))continue;const key=id(l);owned.push(key);
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
     map.addLayer({id:key,type:line?'line':'fill',source:key,...(line&&spec.presentation?.presetVersion===2?{layout:{'line-cap':'round','line-join':'round'}}:{}),paint:line?{'line-color':l.color,'line-width':l.lineWidth??3,'line-opacity':l.opacity,...(spec.presentation?.presetVersion===2?l.dash?.length?{'line-dasharray':l.dash}:{}:{'line-dasharray':l.dash?.length?l.dash:[1,0]}),'line-opacity-transition':{duration:0}}:{'fill-color':l.color,'fill-opacity':l.opacity,'fill-opacity-transition':{duration:0}}});
    }else{
     const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.font=sym.font;ctx.fillStyle=l.color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineWidth=sym.lineWidth;ctx.strokeStyle=sym.strokeColor;ctx.strokeText(l.kind==='icon'?icons[l.icon]:l.name,256,48,500);ctx.fillText(l.kind==='icon'?icons[l.icon]:l.name,256,48,500);
     map.addImage(key,ctx.getImageData(0,0,c.width,c.height));images.push(key);
     map.addLayer({id:key,type:'symbol',source:key,layout:{'icon-image':key,'icon-size':Math.min(l.scale,10)*0.5,'icon-rotate':l.rotation,'icon-allow-overlap':true},paint:{'icon-opacity':l.opacity,'icon-opacity-transition':{duration:0}}});
    }
   }catch(e){assetErrors.push(l.name+': '+e.message);onError(l.name+': '+e.message);}
  }
 }
 function frame(time){
  if(!spec)return;
  const presentation=presentationAt(project,spec,time),doc=presentation?.presetVersion===2,scale=doc?Math.min(map.getContainer?.().clientWidth||1080,map.getContainer?.().clientHeight||1920)/1080:1;
  if(native&&map.getLayer('map-relief')){const light=lightingFrame(project,spec,time);paint('map-relief','hillshade-illumination-direction',light.direction);map.setPaintProperty('map-relief','hillshade-exaggeration',spec.lighting?.length?light.intensity:doc?presentation.reliefStrength:policy.renderer.relief.exaggeration);}
  if(doc&&native&&map.getLayer('map-relief'))for(const [key,value]of [['hillshade-shadow-color',presentation.reliefShadow],['hillshade-highlight-color',presentation.reliefHighlight],['hillshade-accent-color',presentation.reliefAccent]])map.setPaintProperty('map-relief',key,value);
  for(const l of spec.visual?.layers||[]){
   const key=id(l);if(l.kind==='event')continue;
   const historical=spec.features.features.find(f=>f.properties.id===l.ref),alpha=layerAlpha(project,l,time),active=l.kind==='feature'?l.visible&&timeOf(project,historical?.properties||{})<=time&&(l.sceneId===undefined||layerActive(project,l,time)):layerActive(project,l,time);
   if(!native||!map.getLayer(key))continue;
   if(l.kind==='glb'){models.get(key).visible=active;models.get(key).opacity=alpha;continue;}
   map.setLayoutProperty(key,'visibility',active&&!(presentation&&['label','icon'].includes(l.kind))?'visible':'none');if(!active)continue;
   const type=map.getLayer(key).type,property=type==='line'?'line-opacity':type==='fill'?'fill-opacity':type==='raster'?'raster-opacity':'icon-opacity';map.setPaintProperty(key,property,alpha);if(type==='line'){if(l.inheritRouteColor)map.setPaintProperty(key,'line-color',doc?presentation.accentColor:l.color);map.setPaintProperty(key,'line-width',(doc?(l.inheritRouteWidth?presentation.routeWidth:(l.lineWidth??presentation.routeWidth)):(l.lineWidth??3))*scale);}if(l.kind==='image')continue;
   let geometry;
   if(l.kind==='feature')geometry=historical.geometry.type==='LineString'?{type:'LineString',coordinates:routeAt(historical.geometry.coordinates,(time-timeOf(project,historical.properties))/historical.properties.duration)}:historical.geometry;
   else if(l.kind==='route')geometry={type:'LineString',coordinates:routeAt(l.coordinates,(time-layerStart(project,l))/(l.revealDuration??l.duration))};
   else geometry={type:'Point',coordinates:l.position};
   const data=JSON.stringify(geometry);if(geometryCache.get(key)!==data){geometryCache.set(key,data);map.getSource(key)?.setData({type:'Feature',properties:{},geometry});}
  }
 }
 function overlay(ctx,time,viewport={width:1080,height:1920}){
  if(!spec)return;
  const sym=policy.renderer.symbol,presentation=presentationAt(project,spec,time),doc=presentation?.presetVersion===2,scale=doc?Math.min(viewport.width,viewport.height)/1080:1;
  for(const l of spec.visual?.layers||[]){
   if(!layerActive(project,l,time))continue;
   if(l.kind==='route'){const points=routeAt(l.coordinates,(time-layerStart(project,l))/(l.revealDuration??l.duration)),alpha=layerAlpha(project,l,time);if(points.length<2||alpha<=0.01)continue;if(!locationVisible(map,points.at(-1),spec.projection)||!locationVisible(map,points.at(-2),spec.projection))continue;const a=map.project(points.at(-2)),b=map.project(points.at(-1));ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=doc&&l.inheritRouteColor?presentation.accentColor:l.color;if(!native){ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=(l.lineWidth??presentation?.routeWidth??3)*scale;ctx.setLineDash((l.dash||[]).map(n=>n*ctx.lineWidth));ctx.beginPath();points.forEach((c,i)=>{const p=map.project(c);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);});ctx.stroke();}if(l.arrowhead!==false&&(!doc||l.arrowhead===true)){ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.y-a.y,b.x-a.x));ctx.scale(scale,scale);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-12,-5);ctx.lineTo(-12,5);ctx.fill();}ctx.restore();}
   if(!presentation&&!native&&['icon','label'].includes(l.kind)){const p=map.project(l.position);ctx.save();ctx.globalAlpha=layerAlpha(project,l,time);ctx.fillStyle=l.color;ctx.font=`${(sym.fallbackBasePx||24)*Math.min(l.scale,10)}px ${sym.fallbackFontFamily||'system-ui'}`;ctx.fillText(l.kind==='icon'?icons[l.icon]:l.name,p.x,p.y);ctx.restore();}
  }
 }
 return {setSpec,frame,overlay,native,get assetErrors(){return [...assetErrors];},get assetsReady(){return [...models.values()].every(m=>m.loaded);},destroy(){disposed=true;revision++;if(native){clear();map.setTerrain(null);if(map.getLayer('map-relief'))map.removeLayer('map-relief');if(map.getSource('visual-dem'))map.removeSource('visual-dem');}}};
}
