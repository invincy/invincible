// Additive visual metadata. Historical events/features remain in the original schema.
export const icons = {gold:'◆',diamond:'◇',ship:'⛵',fort:'♜',army:'⚑',bsf:'BSF',itbp:'ITBP',ssb:'SSB',assamRifles:'AR'};
export const uid = () => crypto.randomUUID();
export function assetLibrary(map){return {format:'invincible-map-assets',version:1,assets:structuredClone(map.visual?.assets||[])};}
export function importAssetLibrary(map,pkg){
 if(pkg?.format!=='invincible-map-assets'||pkg.version!==1||!Array.isArray(pkg.assets))throw Error('Use an Invincible asset library JSON file.');
 const out=structuredClone(map);
 for(const asset of pkg.assets){if(!out.visual.assets.some(a=>a.type===asset.type&&(asset.url?a.url===asset.url:a.storagePath===asset.storagePath)))out.visual.assets.push({...structuredClone(asset),id:uid()});}
 return out;
}
const finite=(v,a,b)=>typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b;
const https=v=>{try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}};
const point=p=>Array.isArray(p)&&p.length===2&&finite(p[0],-180,180)&&finite(p[1],-85,85);
export function validateVisual(map,project){
 const v=map.visual;if(v===undefined)return;
 if(v.version!==1||!Array.isArray(v.layers)||v.layers.length>100||!Array.isArray(v.assets)||v.assets.length>50)throw Error('Visual map requires version 1, up to 100 layers and 50 assets.');
 const ids=new Set(),assets=new Map();
 for(const a of v.assets){if(!a.id||assets.has(a.id)||!['image','glb'].includes(a.type)||!((https(a.url)&&!a.storagePath&&!a.storageProjectId)||(!a.url&&typeof a.storageProjectId==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(a.storageProjectId)&&typeof a.storagePath==='string'&&new RegExp('^creatorProjects/'+a.storageProjectId+'/mapAssets/[a-zA-Z0-9_-]{1,100}$').test(a.storagePath)))||!String(a.name||'').trim())throw Error('Assets need unique IDs, a name, image/GLB type and a durable HTTPS URL or a valid private storage reference.');assets.set(a.id,a);}
 for(const l of v.layers){
  if(!l.id||ids.has(l.id)||!String(l.name||'').trim()||!['feature','event','icon','image','glb','label','route'].includes(l.kind))throw Error('Layer IDs must be unique, with a name and supported type.');ids.add(l.id);
  if(typeof l.visible!=='boolean'||!finite(l.opacity,0,1)||!/^#[0-9a-f]{6}$/i.test(l.color))throw Error('Invalid visibility, opacity or layer color.');
  for(const key of ['fadeIn','fadeOut'])if(l[key]!==undefined&&!finite(l[key],0,l.duration??3600))throw Error('Layer fades must fit inside its duration.');
  if(l.lineWidth!==undefined&&!finite(l.lineWidth,1,20))throw Error('Line width must be between 1 and 20.');
  if(l.dash!==undefined&&(!Array.isArray(l.dash)||l.dash.length>4||!l.dash.every(n=>finite(n,0.1,20))))throw Error('Dash patterns need up to four positive lengths.');
  if(l.arrowhead!==undefined&&typeof l.arrowhead!=='boolean')throw Error('Arrowhead must be true or false.');
  if(l.revealDuration!==undefined&&!finite(l.revealDuration,0.1,l.duration??3600))throw Error('Reveal duration must fit inside the layer duration.');
  if(l.sceneId!==undefined){const s=project.scenes.find(s=>s.id===l.sceneId);if(!s||!finite(l.offset,0,s.duration)||!finite(l.duration,0.1,3600))throw Error('Layer timing must reference an existing scene and valid offset/duration.');}
  if(l.kind==='feature'||l.kind==='event'){
   const items=l.kind==='feature'?map.features.features.map(f=>f.properties):map.events;
   if(!items.some(i=>i.id===l.ref))throw Error('A layer references missing historical geography.');
   if(v.layers.some(other=>other!==l&&other.kind===l.kind&&other.ref===l.ref))throw Error('Historical layer references must be unique.');
   continue;
  }
  if(l.classification!=='illustrative')throw Error('Placed artwork and drawn routes must be marked illustrative. Import reviewed GeoJSON for historical geography.');
  const scene=project.scenes.find(s=>s.id===l.sceneId);
  if(!scene||!finite(l.offset,0,scene.duration)||!finite(l.duration,0.1,3600))throw Error('Layer timing must reference an existing scene and valid offset/duration.');
  if(l.kind==='route'){if(!Array.isArray(l.coordinates)||l.coordinates.length<2||!l.coordinates.every(point))throw Error('A drawn route needs two or more valid positions.');}
  else if(!point(l.position)||!finite(l.scale,0.1,100000)||!finite(l.rotation,-180,180)||!finite(l.altitude,-1000,100000))throw Error('Invalid asset position, scale, rotation or altitude.');
  if(l.kind==='icon'&&!Object.hasOwn(icons,l.icon))throw Error('Unknown icon.');
  if(['image','glb'].includes(l.kind)&&assets.get(l.assetId)?.type!==l.kind)throw Error('Layer needs a matching asset reference.');
  if(l.kind==='image'&&(!Array.isArray(l.corners)||l.corners.length!==4||!l.corners.every(point)||!transformedCorners(l).every(point)))throw Error('Image requires four in-bounds corners: top-left, top-right, bottom-right, bottom-left.');
 }
 if(v.terrain){const t=v.terrain,source=https(t.url)||(Array.isArray(t.tiles)&&t.tiles.length>0&&t.tiles.length<=4&&t.tiles.every(https));if(typeof t.enabled!=='boolean'||!source||!String(t.attribution||'').trim()||!['mapbox','terrarium'].includes(t.encoding)||!finite(t.exaggeration,0,5))throw Error('Terrain needs HTTPS DEM tiles or TileJSON, attribution, encoding and exaggeration 0–5.');}
}
export function visualMap(map){
 const copy=structuredClone(map);copy.visual??={version:1,layers:[],assets:[]};
 for(const [kind,items] of [['feature',copy.features.features.map(f=>f.properties)],['event',copy.events]])for(const item of items){
  if(!copy.visual.layers.some(l=>l.kind===kind&&l.ref===item.id))copy.visual.layers.push({id:uid(),kind,ref:item.id,name:item.label,visible:true,opacity:0.7,color:'#c5a15d'});
 }
 return copy;
}
export function layerStart(project,layer){let at=0;for(const s of project.scenes){if(s.id===layer.sceneId)return at+layer.offset;at+=Number(s.duration)||0;}return Infinity;}
export const layerActive=(project,l,time)=>l.visible&&time>=layerStart(project,l)&&time<layerStart(project,l)+l.duration;
export function layerAlpha(project,l,time){
 if(!l||l.visible===false)return 0;
 if(l.sceneId===undefined)return l.opacity;
 if(!layerActive(project,l,time))return 0;
 const elapsed=time-layerStart(project,l),remaining=l.duration-elapsed;
 return l.opacity*Math.min(1,l.fadeIn?elapsed/l.fadeIn:1,l.fadeOut?remaining/l.fadeOut:1);
}
export function imageCorners([x,y],size=0.4){return [[x-size,y+size],[x+size,y+size],[x+size,y-size],[x-size,y-size]];}
export function transformedCorners(layer){
 const [x,y]=layer.position,c=Math.cos(y*Math.PI/180),r=layer.rotation*Math.PI/180;
 return layer.corners.map(([lng,lat])=>{const dx=(lng-x)*c*layer.scale,dy=(lat-y)*layer.scale;return [x+(dx*Math.cos(r)-dy*Math.sin(r))/c,y+dx*Math.sin(r)+dy*Math.cos(r)];});
}
export function moveLayer(layer,position){
 const copy=structuredClone(layer),dx=position[0]-layer.position[0],dy=position[1]-layer.position[1];copy.position=position;
 if(copy.corners)copy.corners=copy.corners.map(([x,y])=>[x+dx,y+dy]);return copy;
}
export function scenePackage(project,map,sceneId,initialCamera){
 const scene=project.scenes.find(s=>s.id===sceneId);if(!scene)throw Error('Select a scene.');
 const out=structuredClone(map);out.events=out.events.filter(e=>e.sceneId===sceneId);out.features.features=out.features.features.filter(f=>f.properties.sceneId===sceneId);out.camera=out.camera.filter(c=>c.sceneId===sceneId);if(out.lighting)out.lighting=out.lighting.filter(c=>c.sceneId===sceneId);
 if(initialCamera&&!out.camera.some(c=>c.offset===0))out.camera.unshift({...structuredClone(initialCamera),sceneId,offset:0});
 const keep=new Set([...out.events.map(e=>e.id),...out.features.features.map(f=>f.properties.id)]);
 if(out.visual){out.visual.layers=out.visual.layers.filter(l=>['feature','event'].includes(l.kind)?keep.has(l.ref):l.sceneId===sceneId);const assets=new Set(out.visual.layers.map(l=>l.assetId));out.visual.assets=out.visual.assets.filter(a=>assets.has(a.id));}
 return {format:'invincible-map-scene',version:1,scene:structuredClone(scene),historicalMap:out};
}
export function appendScenePackage(project,pkg){
 if(pkg?.format!=='invincible-map-scene'||pkg.version!==1||!pkg.scene||!pkg.historicalMap)throw Error('Use an Invincible map scene package.');
 if(typeof pkg.scene.id!=='string'||!finite(pkg.scene.duration,0.1,3600))throw Error('A scene package needs an ID and a duration between 0.1 and 3600 seconds.');
 const p=structuredClone(project),scene=structuredClone(pkg.scene),old=scene.id;scene.id=uid();const incoming=structuredClone(pkg.historicalMap);
 const remap=new Map(),next=id=>{if(!remap.has(id))remap.set(id,uid());return remap.get(id);};
 const anchor=o=>{if(o.sceneId!==old)throw Error('Scene package contains an unrelated scene reference.');o.sceneId=scene.id;};
 for(const e of incoming.events){anchor(e);e.id=next(e.id);}for(const f of incoming.features.features){anchor(f.properties);f.properties.id=next(f.properties.id);}incoming.camera.forEach(anchor);incoming.lighting?.forEach(anchor);
 if(incoming.visual){for(const a of incoming.visual.assets)a.id=next(a.id);for(const l of incoming.visual.layers){l.id=uid();if(l.ref)l.ref=next(l.ref);else anchor(l);if(l.assetId)l.assetId=next(l.assetId);}}
 p.scenes.push(scene);
 if(!p.historicalMap)p.historicalMap=incoming;
 else {const m=visualMap(p.historicalMap);m.events.push(...incoming.events);m.features.features.push(...incoming.features.features);m.camera.push(...incoming.camera);if(incoming.lighting){m.lighting??=[];m.lighting.push(...incoming.lighting);}m.visual.layers.push(...(incoming.visual?.layers||[]));m.visual.assets.push(...(incoming.visual?.assets||[]));p.historicalMap=visualMap(m);}
 return p;
}
