// Preset metadata is opt-in: absent fields never restyle a legacy session.
export const presetTerrain=()=>({enabled:true,tiles:['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],encoding:'terrarium',exaggeration:1.3,attribution:'Terrain: Mapzen / AWS · USGS SRTM/GMTED2010 · NOAA ETOPO1'});
export const INDIA_ANCHOR=[78.5,23.5];
export const INDIA_BOUNDS=[[68,6.5],[97.5,37.5]];
const base={countryFill:{enabled:true,opacity:0.85,color:'#D4A34A'},countryBorders:{enabled:true,opacity:1,color:'#FFFFFF',width:2},stateBorders:{enabled:false,opacity:0.65,color:'#F5EAD2',width:1},labels:{enabled:true},ashokaChakra:{enabled:true,longitude:78.5,latitude:23.5,opacity:1,color:'#142D63'},countries:{},states:{}};
export const mapPresets={
 'india-satellite':{name:'India Satellite',basemap:'satellite',terrain:true,overlays:base},
 'india-political':{name:'India Political',basemap:'physical',terrain:false,overlays:{...base,ashokaChakra:{...base.ashokaChakra,enabled:false}}},
 'india-topographic':{name:'India Topographic',basemap:'terrain',terrain:true,overlays:{...base,countryFill:{...base.countryFill,opacity:0.25},ashokaChakra:{...base.ashokaChakra,enabled:false}}},
 custom:{name:'Custom',basemap:'physical',terrain:false,overlays:{...base,countryFill:{...base.countryFill,enabled:false},countryBorders:{...base.countryBorders,enabled:false},labels:{enabled:false},ashokaChakra:{...base.ashokaChakra,enabled:false}}}
};
export function mergeAppearance(a,b={}){const out=structuredClone(a);for(const [k,v] of Object.entries(b)){if(['__proto__','prototype','constructor'].includes(k))throw Error('Invalid appearance key.');out[k]=v&&typeof v==='object'&&!Array.isArray(v)?mergeAppearance(out[k]||{},v):v;}return out;}
export function resolvedOverlays(map){return mergeAppearance(mapPresets[map.mapPreset||'custom'].overlays,map.overlays);}
export function initialCamera(map){return {center:[...INDIA_ANCHOR],bearing:0,pitch:0,aspectRatio:'9:16',fitBounds:map.initialCamera?.center?undefined:INDIA_BOUNDS,...map.initialCamera};}
// Mercator fit is derived from the actual viewport, independent of the Chakra anchor.
export function fitIndia(camera,width,height){
 if(!camera.fitBounds)return camera;
 const [[west,south],[east,north]]=camera.fitBounds,merc=lat=>Math.log(Math.tan(Math.PI/4+lat*Math.PI/360)),lo=merc(south),hi=merc(north),pad=0.88;
 return {...camera,center:[(west+east)/2,Math.atan(Math.sinh((lo+hi)/2))*180/Math.PI],zoom:Math.max(0,Math.min(12,Math.log2(Math.min(width*pad/(512*(east-west)/360),height*pad/(512*(hi-lo)/(2*Math.PI))))))};
}
export function applyPreset(map,id){
 const preset=mapPresets[id];if(!preset)throw Error('Unknown map preset.');
 const next=structuredClone(map);next.mapPreset=id;next.overlays=structuredClone(preset.overlays);next.overlayKeys=[];
 if(id!=='custom'){next.basemap={id:preset.basemap,labels:false,borders:false};next.projection='mercator';next.initialCamera=initialCamera({});}
 if(next.visual?.terrain)next.visual.terrain.enabled=preset.terrain;
 return resolvePreset(next);
}
const finite=(n,a,b)=>typeof n==='number'&&Number.isFinite(n)&&n>=a&&n<=b;
const color=v=>/^#[0-9a-f]{6}$/i.test(v);
export function validateAppearance(map,project){
 if(map.mapPreset!==undefined&&!Object.hasOwn(mapPresets,map.mapPreset))throw Error('Unknown map preset.');
 const validate=o=>{
  if(!o||typeof o!=='object'||Array.isArray(o))throw Error('Overlays must be an object.');
  for(const [name,v] of Object.entries(o)){
   if(!Object.hasOwn(base,name))throw Error('Unknown overlay: '+name);
   if(!v||typeof v!=='object'||Array.isArray(v))throw Error('Invalid overlay settings.');
   if(['countries','states'].includes(name)){if(Object.keys(v).length>250)throw Error('Too many region overrides.');for(const [id,override] of Object.entries(v)){if(['__proto__','prototype','constructor'].includes(id)||!/^[A-Za-z0-9_-]{1,80}$/.test(id)||!override||typeof override!=='object'||Array.isArray(override))throw Error('Invalid region override.');for(const [k,val] of Object.entries(override))if(!['enabled','opacity','color'].includes(k)||(k==='enabled'?typeof val!=='boolean':k==='color'?!color(val):!finite(val,0,1)))throw Error('Invalid region appearance.');}continue;}
   for(const [k,val] of Object.entries(v)){
    if(!Object.hasOwn(base[name],k))throw Error('Unknown overlay property: '+k);
    if(k==='enabled'?typeof val!=='boolean':k==='color'?!color(val):k==='longitude'?!finite(val,-180,180):k==='latitude'?!finite(val,-85,85):k==='width'?!finite(val,0,20):!finite(val,0,1))throw Error('Invalid overlay property: '+k);
   }
  }
 };
 if(map.overlays!==undefined)validate(map.overlays);
 if(map.initialCamera!==undefined){const c=map.initialCamera;if(!c||!Array.isArray(c.center)||c.center.length!==2||!finite(c.center[0],-180,180)||!finite(c.center[1],-85,85)||!finite(c.bearing??0,-180,180)||!finite(c.pitch??0,0,60)||!['9:16','16:9'].includes(c.aspectRatio??'9:16')||(c.zoom!==undefined&&!finite(c.zoom,0,12)))throw Error('Invalid initial camera.');if(c.fitBounds!==undefined&&(!Array.isArray(c.fitBounds)||c.fitBounds.length!==2||!c.fitBounds.every(p=>Array.isArray(p)&&p.length===2&&finite(p[0],-180,180)&&finite(p[1],-85,85))||c.fitBounds[0][0]>=c.fitBounds[1][0]||c.fitBounds[0][1]>=c.fitBounds[1][1]))throw Error('Invalid camera fit bounds.');}
 if(map.overlayKeys!==undefined){if(!Array.isArray(map.overlayKeys)||map.overlayKeys.length>150)throw Error('Use up to 150 overlay keys.');for(const k of map.overlayKeys){const s=project.scenes.find(s=>s.id===k.sceneId);if(!s||!finite(k.offset,0,s.duration)||!['smooth','linear','hold'].includes(k.easing??'smooth'))throw Error('Invalid overlay key timing.');validate(k.overlays);}}
}
function interpolate(a,b,t){const out=structuredClone(a);for(const [k,v] of Object.entries(b)){const old=a[k]??v;out[k]=typeof v==='number'?old+(v-old)*t:typeof v==='string'&&color(v)?'#'+[1,3,5].map(i=>Math.round(parseInt(old.slice(i,i+2),16)+(parseInt(v.slice(i,i+2),16)-parseInt(old.slice(i,i+2),16))*t).toString(16).padStart(2,'0')).join(''):v&&typeof v==='object'?interpolate(old,v,t):t===1?v:old;}return out;}
export function overlayFrame(project,map,time,timeOf){
 let state=resolvedOverlays(map),start=0,easing='smooth';
 for(const key of map.overlayKeys||[])for(const group of ['countries','states'])for(const id of Object.keys(key.overlays[group]||{}))state[group][id]??={enabled:true,opacity:group==='states'?0:state.countryFill.opacity,color:state.countryFill.color};
 const keys=[...(map.overlayKeys||[])].sort((a,b)=>timeOf(project,a)-timeOf(project,b));
 for(const key of keys){const end=timeOf(project,key),next=mergeAppearance(state,key.overlays);if(time<end){let t=end>start?Math.max(0,(time-start)/(end-start)):0;t=easing==='hold'?0:easing==='linear'?t:t*t*(3-2*t);return interpolate(state,next,t);}state=next;start=end;easing=key.easing??'smooth';}
 return state;
}
export function resolvePreset(map){
 if(!map?.mapPreset)return map;
 const out=structuredClone(map),p=Object.hasOwn(mapPresets,map.mapPreset)?mapPresets[map.mapPreset]:null;if(!p)throw Error('Unknown map preset.');
 out.basemap??={id:p.basemap,labels:false,borders:false};
 if(p.terrain){out.visual??={version:1,layers:[],assets:[]};out.visual.terrain??=presetTerrain();}
 return out;
}
