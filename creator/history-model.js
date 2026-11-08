// Pure, additive production metadata. Master storyboard IDs and order remain canonical.
import {validateVisual,layerActive} from './map-editor-model.js';
import {validateAppearance,initialCamera,resolvePreset} from './map-presets.js';
import {validateBasemap} from './map-style-library.js';
export const productionId=()=>globalThis.crypto?.randomUUID?.()||'clip-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
export const emptyMap=()=>({version:1,theme:'parchment',events:[],features:{type:'FeatureCollection',features:[]},camera:[]});
const finite=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
export const safeUrl=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch{return '';}};
export function sceneTimeline(project){let at=0;return (project.scenes||[]).map(scene=>{const start=at;at+=Number(scene.duration)||0;return {sceneId:scene.id,start,end:at,scene};});}
export const durationOf=project=>sceneTimeline(project).at(-1)?.end||0;
export function timeOf(project,item){const row=sceneTimeline(project).find(row=>row.sceneId===item.sceneId);return row?row.start+(item.offset||0):Infinity;}
function position(p){if(!Array.isArray(p)||p.length!==2||!finite(p[0],-180,180)||!finite(p[1],-85,85))throw Error('Coordinates must be [longitude, latitude] in valid map bounds.');}
export function validateMap(map,project){
 map=resolvePreset(map);
 if(!map||map.version!==1||!['parchment','night'].includes(map.theme))throw Error('Use map version 1 and parchment or night theme.');
 if(map.projection!==undefined&&!['mercator','globe'].includes(map.projection))throw Error('Projection must be mercator or globe.');
 validateBasemap(map);validateAppearance(map,project);
 if(new TextEncoder().encode(JSON.stringify(map)).length>240000)throw Error('Map metadata exceeds 240 KB; simplify geometry or split the project.');
 const ids=new Set((project.scenes||[]).map(s=>s.id)),seen=new Set();
 function anchor(item){if(!ids.has(item.sceneId))throw Error('An event, feature or camera refers to a missing scene.');const scene=project.scenes.find(s=>s.id===item.sceneId);if(!finite(item.offset??0,0,scene.duration))throw Error('Offset must be within the associated scene.');}
 function sourced(item){if(!item.id||seen.has(item.id))throw Error('Event and feature IDs must be unique.');seen.add(item.id);anchor(item);if(!String(item.label||'').trim()||!String(item.date||'').trim()||!safeUrl(item.sourceUrl)||!String(item.sourceNote||'').trim())throw Error('Every event and geometry needs a label, historical date, HTTPS source and provenance note.');}
 if(!Array.isArray(map.events)||map.events.length>150)throw Error('Use at most 150 events.');
 for(const event of map.events){sourced(event);position(event.coordinates);}
 if(map.features?.type!=='FeatureCollection'||!Array.isArray(map.features.features)||map.features.features.length>100)throw Error('Use a GeoJSON FeatureCollection with at most 100 features.');
 for(const f of map.features.features){
  if(f.type!=='Feature'||!f.geometry||!f.properties)throw Error('Invalid GeoJSON feature.');sourced(f.properties);
  const g=f.geometry;if(!['Polygon','MultiPolygon','LineString'].includes(g.type))throw Error('Only Polygon, MultiPolygon and LineString are supported.');
  if(f.properties.reviewed!==true)throw Error('Review source geometry and set reviewed: true before displaying it.');
  const line=coords=>{if(!Array.isArray(coords)||coords.length<2)throw Error('A route needs at least two positions.');coords.forEach(position);};
  const polygon=rings=>{if(!Array.isArray(rings)||!rings.length)throw Error('A polygon needs rings.');rings.forEach(r=>{line(r);if(r.length<4||JSON.stringify(r[0])!==JSON.stringify(r.at(-1)))throw Error('Polygon rings must be closed with at least four positions.');});};
  if(g.type==='LineString'){line(g.coordinates);if(!finite(f.properties.duration,0.1,3600))throw Error('Routes need a positive animation duration.');}
  else if(g.type==='Polygon')polygon(g.coordinates);else {if(!Array.isArray(g.coordinates)||!g.coordinates.length)throw Error('Empty MultiPolygon.');g.coordinates.forEach(polygon);}
 }
 if(!Array.isArray(map.camera)||map.camera.length>150)throw Error('Use at most 150 camera keyframes.');
 for(const c of map.camera){if(c.easing!==undefined&&!['smooth','linear','hold'].includes(c.easing))throw Error('Camera easing must be smooth, linear or hold.');anchor(c);position(c.center);if(!finite(c.zoom,0,12)||!finite(c.bearing??0,-180,180)||!finite(c.pitch??0,0,60))throw Error('Invalid camera zoom, bearing or pitch.');}
 if(map.lighting!==undefined){if(!Array.isArray(map.lighting)||map.lighting.length>150)throw Error('Use up to 150 relief-light keys.');for(const c of map.lighting){anchor(c);if(!finite(c.direction,0,360)||!finite(c.intensity,0,1))throw Error('Relief lighting needs direction 0–360 and intensity 0–1.');}}
 validateVisual(map,project);
 return structuredClone(map);
}
export function routeAt(coordinates,progress){
 const t=Math.max(0,Math.min(1,progress))*(coordinates.length-1),i=Math.min(coordinates.length-2,Math.floor(t)),f=t-i;
 const result=coordinates.slice(0,i+1),point=coordinates[i].map((n,k)=>n+(coordinates[i+1][k]-n)*f);
 if(f===0&&i>0)return result;
 return [...result,point];
}
export function lightingFrame(project,map,time){
 const keys=[...(map.lighting||[])].sort((a,b)=>timeOf(project,a)-timeOf(project,b));
 let a={direction:315,intensity:0.45},b=a;
 for(const key of keys){if(timeOf(project,key)<=time)a=key;else {b=key;break;}b=key;}
 const start=timeOf(project,a),end=timeOf(project,b),t=end>start?Math.max(0,Math.min(1,(time-start)/(end-start))):0;
 const turn=((b.direction-a.direction+540)%360)-180;
 return {direction:(a.direction+turn*t+360)%360,intensity:a.intensity+(b.intensity-a.intensity)*t};
}
export function mapFrame(project,map,time){
 const active=(kind,id)=>{const l=map.visual?.layers.find(l=>l.kind===kind&&l.ref===id);return l?.visible!==false&&(!l?.sceneId||layerActive(project,l,time));};
 const events=map.events.filter(e=>timeOf(project,e)<=time&&active('event',e.id)).sort((a,b)=>timeOf(project,a)-timeOf(project,b)),features=map.features.features.filter(f=>timeOf(project,f.properties)<=time&&active('feature',f.properties.id)).map(f=>f.geometry.type==='LineString'?{...f,geometry:{...f.geometry,coordinates:routeAt(f.geometry.coordinates,(time-timeOf(project,f.properties))/f.properties.duration)}}:f);
 const frames=[...map.camera].sort((a,b)=>timeOf(project,a)-timeOf(project,b));
 let a=map.mapPreset||map.initialCamera?{zoom:3.2,...initialCamera(map)}:{center:[80,23],zoom:3.2,bearing:0,pitch:0},b=a;
 for(const c of frames){if(timeOf(project,c)<=time)a=c;else {b=c;break;}b=c;}
 const start=timeOf(project,a),end=timeOf(project,b),t=end>start?Math.max(0,Math.min(1,(time-start)/(end-start))):0,u=a.easing==='hold'?(t===1?1:0):a.easing==='linear'?t:t*t*(3-2*t);
 const mix=(x,y)=>x+(y-x)*u,wrap=n=>((n+180)%360+360)%360-180,angle=(x,y)=>wrap(x+wrap(y-x)*u);
 return {events,features:{type:'FeatureCollection',features},camera:{...(a.fitBounds?{fitBounds:a.fitBounds}:{}),center:a.center.map((n,i)=>i===0&&map.projection==='globe'?angle(n,b.center[i]):mix(n,b.center[i])),zoom:mix(a.zoom,b.zoom),bearing:angle(a.bearing||0,b.bearing||0),pitch:mix(a.pitch||0,b.pitch||0)}};
}
export function createClip(project,sceneIds,name){
 const rows=sceneTimeline(project).filter(row=>sceneIds.includes(row.sceneId));
 if(!rows.length||new Set(sceneIds).size!==sceneIds.length||rows.length!==sceneIds.length)throw Error('Select existing scenes once each.');
 const indices=rows.map(r=>project.scenes.findIndex(s=>s.id===r.sceneId));if(indices.some((n,i)=>i&&n!==indices[i-1]+1))throw Error('Production Clips require adjacent storyboard scenes.');
 if(!String(name).trim())throw Error('Name the Production Clip.');
 return {id:productionId(),name:String(name).trim(),sceneIds:rows.map(r=>r.sceneId),versions:[],prompt:'',imagePrompt:'',keyframes:{start:'',middle:'',end:''}};
}
export function clipTiming(project,clip){const rows=sceneTimeline(project).filter(r=>clip.sceneIds.includes(r.sceneId));return {start:rows[0]?.start||0,end:rows.at(-1)?.end||0,duration:rows.reduce((n,r)=>n+r.end-r.start,0),valid:rows.length===clip.sceneIds.length&&rows.every((r,i)=>r.sceneId===clip.sceneIds[i]&&(!i||r.start===rows[i-1].end))};}
export function exportManifest(project){return {version:1,title:project.title,aspectRatio:project.aspectRatio||'9:16',scenes:sceneTimeline(project).map(({scene,start,end})=>({id:scene.id,start,end,voiceover:scene.voiceover,voiceoverTimestamp:scene.voiceoverTimestamp||'',voiceoverAssetId:scene.voiceoverAssetId||'',assetReferences:scene.assetReferences||''})),clips:(project.productionClips||[]).map(clip=>({...clip,timing:clipTiming(project,clip)})),assets:project.assets||[],historicalMap:project.historicalMap||null};}
