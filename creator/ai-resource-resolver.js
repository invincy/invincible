const HISTORY_SOURCE='https://github.com/Seshat-Global-History-Databank/cliopatria/releases/tag/v0.2.1';
const normalize=value=>String(value??'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu,' ').trim();
const boundedYear=value=>Number.isInteger(Number(value))&&Number(value)>=-3400&&Number(value)<=2100?Number(value):0;

export function matchHistoricalRecords(records,{year,names=[]}={}){
 const at=boundedYear(year),wanted=[...new Set((Array.isArray(names)?names:[]).map(normalize).filter(Boolean))];
 if(!at||!wanted.length)return[];
 const matches=(Array.isArray(records)?records:[]).filter(row=>Number(row.start)<=at&&at<=Number(row.end)&&wanted.some(name=>{
  const candidate=normalize(row.name);return candidate===name||candidate.includes(name)||name.includes(candidate);
 }));
 const seen=new Set();return matches.filter(row=>{const key=`${row.name}|${row.start}|${row.end}`;if(seen.has(key))return false;seen.add(key);return true;}).slice(0,12);
}

export function historicalLocatorAnimation(records,duration,title='Historical context'){
 const rows=(Array.isArray(records)?records:[]).filter(row=>Array.isArray(row.locator)&&row.locator.length===2&&row.locator.every(Number.isFinite)).slice(0,8);
 if(!rows.length||!Number.isFinite(duration)||duration<1)return null;
 const longitude=rows.map(row=>row.locator[0]),latitude=rows.map(row=>row.locator[1]),span=Math.max(Math.max(...longitude)-Math.min(...longitude),Math.max(...latitude)-Math.min(...latitude),1);
 const center=[(Math.min(...longitude)+Math.max(...longitude))/2,(Math.min(...latitude)+Math.max(...latitude))/2],zoom=Math.max(1.5,Math.min(5.5,Math.log2(82/span)));
 return{format:'invincible-map-animation',version:1,title:String(title).slice(0,200),duration,aspectRatio:'9:16',basemap:'terrain',terrain:false,overlayPreset:'documentary',camera:[{time:0,center,zoom,pitch:0,bearing:0,easing:'smooth'},{time:duration,center,zoom:Math.min(12,zoom+.18),pitch:0,bearing:0,easing:'smooth'}],assets:[],layers:rows.map((row,index)=>({id:`historical-locator-${index+1}`,type:'label',name:`${row.name} · approximate extent`,start:0,end:duration,position:row.locator,color:'#F4F5F7',scale:1}))};
}

function requestResolution(request,{matches,assets,year}){
 const type=String(request.type||''),query=String(request.query||'').trim(),importance=String(request.importance||'required-visual'),fallback=String(request.fallback||'documentary-card');
 if(type==='historical-territory')return{id:`history-${normalize(query)||year}`,type,query,importance,fallback,status:matches.length?'review':'missing',action:'map',message:matches.length?`${matches.length} Cliopatria outline(s) found for ${year}. Review the approximate geometry in Map Editor before using it as a factual boundary.`:`No matching reviewed territory is available for ${year}. The safe locator treatment remains in the draft.`};
 if(['image','portrait','flag','video','audio','model'].includes(type)){
  const found=assets.some(asset=>normalize(`${asset.id} ${asset.name}`).includes(normalize(query)));
  return{id:`asset-${normalize(query)||type}`,type,query,importance,fallback,status:found?'ready':'missing',action:'assets',message:found?'A matching project asset is available.':'Choose an existing asset, upload one, generate an illustration, or keep the safe fallback.'};
 }
 return{id:`resource-${normalize(query)||type}`,type,query,importance,fallback,status:'missing',action:type.includes('historical')?'map':'assets',message:`${query||type} is not verified yet. The scene remains editable with its declared safe fallback.`};
}

export function resolveCreatorPlanResources(payload,{territoryRecords=[],availableAssets=[]}={}){
 const out=structuredClone(payload),analysis=out?.analysis?.scenes||[],studio=new Map((out?.creatorStudio?.scenes||[]).map(scene=>[scene.id,scene]));
 for(const scene of analysis){
  const semantic=scene.semanticPlan||{},year=boundedYear(semantic.historicalYear),names=semantic.polityNames||[],matches=matchHistoricalRecords(territoryRecords,{year,names}),requests=[...(semantic.resourceRequests||[])];
  if(year&&names.length&&!requests.some(request=>request.type==='historical-territory'))requests.unshift({type:'historical-territory',query:names.join(', '),importance:'required-factual',fallback:'dated-location-context'});
  const resolutions=requests.map(request=>requestResolution(request,{matches,assets:availableAssets,year}));
  if(year&&names.length&&!matches.length)resolutions.unshift({id:`history-${year}`,type:'historical-territory',query:names.join(', '),importance:'required-factual',fallback:'dated-location-context',status:'missing',action:'map',message:`No matching ${year} outline was found in the connected South Asia pack. Add sourced GeoJSON or retain the labelled locator fallback.`});
  if(matches.length&&!scene.mapAnimation){scene.mapAnimation=historicalLocatorAnimation(matches,scene.durationSeconds,scene.visual||semantic.title);}
  if(matches.length){scene.missingInfo=[...new Set([...(scene.missingInfo||[]),`${matches.length} dated territory outline(s) are available from Cliopatria v0.2.1 but require visual source review before boundary import.`])];scene.contextSources=matches.map(row=>({name:row.name,source:HISTORY_SOURCE,year,start:row.start,end:row.end}));}
  scene.resourceResolutions=resolutions;scene.clarifications=semantic.clarifications||[];
  const target=studio.get(scene.id);if(target){target.mapAnimation=scene.mapAnimation||target.mapAnimation||null;target.missingInfo=scene.missingInfo;target.resourceResolutions=resolutions;target.clarifications=scene.clarifications;if(scene.contextSources)target.contextSources=scene.contextSources;}
 }
 out.mapAnimations=analysis.filter(scene=>scene.mapAnimation).map(scene=>({sceneId:scene.id,voiceoverTimestamp:scene.voiceoverTimestamp,plan:scene.mapAnimation,missingInfo:scene.missingInfo||[]}));
 return out;
}

export async function resolveCreatorPlanResourcesFromLibrary(payload,{catalogUrl=new URL('./history-data/cliopatria-south-asia-v021.json',import.meta.url),availableAssets=[]}={}){
 const needsHistory=(payload?.analysis?.scenes||[]).some(scene=>Number(scene.semanticPlan?.historicalYear));let territoryRecords=[];
 if(needsHistory){const response=await fetch(catalogUrl);if(!response.ok)throw Error('The historical territory library could not be loaded. Safe fallbacks remain available.');territoryRecords=(await response.json()).records||[];}
 return resolveCreatorPlanResources(payload,{territoryRecords,availableAssets});
}
