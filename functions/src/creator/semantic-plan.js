const manifest=require('./planner-pack/manifest.json');
const schema=require('./planner-pack/semantic-plan.schema.json');
const styleProfile=require('./planner-pack/style-profile.json');
const rendererCapabilities=require('./planner-pack/renderer-capabilities.json');
const approvedExamples=require('./planner-pack/approved-examples.json');

const BUILTIN_GEOGRAPHY_CONTEXTS=[
 {id:'context-global-equator',name:'Global Equator',coordinates:[0,0],sourceUrl:'https://www.naturalearthdata.com/downloads/110m-cultural-vectors/',sourceDate:'Natural Earth 5.1.2',precisionNote:'Generalized global reference context; the Equator is compiler-defined at 0° latitude.'},
 {id:'context-india-indian-ocean',name:'India and the Indian Ocean',coordinates:[78,8],sourceUrl:'https://www.naturalearthdata.com/downloads/110m-cultural-vectors/',sourceDate:'Natural Earth 5.1.2',precisionNote:'Generalized regional reference context for explanatory maps; not a political-boundary claim.'},
 {id:'context-south-asia',name:'South Asia',coordinates:[78,22],sourceUrl:'https://www.naturalearthdata.com/downloads/110m-cultural-vectors/',sourceDate:'Natural Earth 5.1.2',precisionNote:'Generalized regional reference center for explanatory maps.'}
];

const sceneProperties=schema.properties.scenes.items.properties;
const allowed=Object.fromEntries(Object.entries(sceneProperties).filter(([,value])=>Array.isArray(value.enum)).map(([key,value])=>[key,new Set(value.enum)]));
allowed.emphasis=new Set(sceneProperties.emphasis.items.enum);
const resourceProperties=sceneProperties.resourceRequests.items.properties,clarificationProperties=sceneProperties.clarifications.items.properties;
const resourceEnums=Object.fromEntries(['type','importance','fallback'].map(key=>[key,new Set(resourceProperties[key].enum)]));
const text=(value,max)=>String(value??'').trim().slice(0,max);
const list=(value,max)=>Array.isArray(value)?value.slice(0,max).map(item=>String(item).trim()).filter(Boolean):[];

function plannerPack(){
 return{manifest,schema,styleProfile,rendererCapabilities,approvedExamples};
}

function geographyLocations(locations=[]){
 const rows=[...BUILTIN_GEOGRAPHY_CONTEXTS,...(Array.isArray(locations)?locations:[])],seen=new Set();
 return rows.filter(item=>item&&item.id&&!seen.has(String(item.id))&&seen.add(String(item.id)));
}

function plannerSchemaForRequest({segmentIds=[],assetIds=[],locationIds=[],routeIds=[]}={}){
 const value=structuredClone(schema),sceneList=value.properties.scenes,properties=sceneList.items.properties;
 const unique=items=>[...new Set(items.map(item=>String(item)).filter(Boolean))];
 const segments=unique(segmentIds),assets=unique(assetIds),locations=unique([...BUILTIN_GEOGRAPHY_CONTEXTS.map(item=>item.id),...locationIds]),routes=unique(routeIds);
 if(segments.length){sceneList.minItems=segments.length;sceneList.maxItems=segments.length;properties.sourceSegmentId={type:'string',enum:segments};}
 properties.assetIds={...properties.assetIds,maxItems:Math.min(12,assets.length)};
 if(assets.length)properties.assetIds.items={type:'string',enum:assets};
 properties.locationId={type:'string',enum:['',...locations]};
 properties.routeId={type:'string',enum:['',...routes]};
 return value;
}

function normalizeSemanticScene(row,index){
 if(!row||Array.isArray(row)||typeof row!=='object')throw Error(`Scene ${index+1} must be an object.`);
 const normalized={
  sourceSegmentId:text(row.sourceSegmentId,100),
  engine:text(row.engine,40),
  sceneKind:text(row.sceneKind,80),
  presetId:text(row.presetId,80),
  title:text(row.title,120),
  visualIntent:text(row.visualIntent,600),
  labelTreatment:text(row.labelTreatment,80),
  cameraIntent:text(row.cameraIntent,80),
  assetIds:list(row.assetIds,12),
  locationId:text(row.locationId,160),
  routeId:text(row.routeId,160),
  historicalYear:Number.isInteger(Number(row.historicalYear))&&Number(row.historicalYear)>=-3400&&Number(row.historicalYear)<=2100?Number(row.historicalYear):0,
  regionId:text(row.regionId,40),
  polityNames:list(row.polityNames,12).map(item=>item.slice(0,120)),
  emphasis:list(row.emphasis,6),
  missingInfo:list(row.missingInfo,8).map(item=>item.slice(0,240)),
  resourceRequests:(Array.isArray(row.resourceRequests)?row.resourceRequests:[]).slice(0,12).map((request,requestIndex)=>{
   if(!request||Array.isArray(request)||typeof request!=='object')throw Error(`Scene ${index+1} resource request ${requestIndex+1} must be an object.`);
   const value={type:text(request.type,80),query:text(request.query,240),importance:text(request.importance,40),fallback:text(request.fallback,80)};
   if(!value.query)throw Error(`Scene ${index+1} resource request ${requestIndex+1} needs a query.`);
   for(const key of Object.keys(resourceEnums))if(!resourceEnums[key].has(value[key]))throw Error(`Scene ${index+1} resource request ${requestIndex+1} has unsupported ${key}.`);
   return value;
  }),
  clarifications:(Array.isArray(row.clarifications)?row.clarifications:[]).slice(0,6).map((item,itemIndex)=>{
   if(!item||Array.isArray(item)||typeof item!=='object')throw Error(`Scene ${index+1} clarification ${itemIndex+1} must be an object.`);
   const value={question:text(item.question,clarificationProperties.question.maxLength),default:text(item.default,clarificationProperties.default.maxLength),reason:text(item.reason,clarificationProperties.reason.maxLength)};
   if(!value.question||!value.default||!value.reason)throw Error(`Scene ${index+1} clarification ${itemIndex+1} is incomplete.`);return value;
  })
 };
 if(!normalized.sourceSegmentId)throw Error(`Scene ${index+1} has no sourceSegmentId.`);
 if(!normalized.visualIntent)throw Error(`Scene ${index+1} has no visualIntent.`);
 for(const key of ['engine','sceneKind','presetId','labelTreatment','cameraIntent','regionId'])if(!allowed[key].has(normalized[key]))throw Error(`Scene ${index+1} has unsupported ${key}: ${normalized[key]||'empty'}.`);
 for(const value of normalized.emphasis)if(!allowed.emphasis.has(value))throw Error(`Scene ${index+1} has unsupported emphasis: ${value}.`);
 return normalized;
}

function normalizeSemanticPlan(plan,{segmentIds=[],assetIds=[],locationIds=[],routeIds=[]}={}){
 if(!plan||Array.isArray(plan)||typeof plan!=='object'||!Array.isArray(plan.scenes))throw Error('Planner response must contain a scenes array.');
 if(plan.schemaVersion!=='creator-semantic-plan-v1')throw Error('Planner returned an unsupported semantic schema version.');
 const segments=new Set(segmentIds.map(String)),assets=new Set(assetIds.map(String)),locations=new Set([...BUILTIN_GEOGRAPHY_CONTEXTS.map(item=>item.id),...locationIds.map(String)]),routes=new Set(routeIds.map(String)),seen=new Set();
 if(segments.size&&plan.scenes.length!==segments.size)throw Error(`Planner must return one scene per segment; expected ${segments.size}, received ${plan.scenes.length}.`);
 const scenes=plan.scenes.map((row,index)=>{
  const scene=normalizeSemanticScene(row,index);
  if(segments.size&&!segments.has(scene.sourceSegmentId))throw Error(`Scene ${index+1} references an unknown segment.`);
  if(seen.has(scene.sourceSegmentId))throw Error(`Planner returned more than one scene for ${scene.sourceSegmentId}.`);
  seen.add(scene.sourceSegmentId);
  for(const id of scene.assetIds)if(!assets.has(id))throw Error(`Scene ${index+1} selected an unavailable asset: ${id}.`);
  if(scene.locationId&&!locations.has(scene.locationId))throw Error(`Scene ${index+1} selected an unavailable location: ${scene.locationId}.`);
  if(scene.routeId&&!routes.has(scene.routeId))throw Error(`Scene ${index+1} selected an unavailable route: ${scene.routeId}.`);
  return scene;
 });
 return{schemaVersion:'creator-semantic-plan-v1',scenes};
}

function buildSemanticPlannerPrompt({segments,creativeInstructions='',assets=[],locations=[],routes=[]}){
 const compactAssets=assets.map(({id,name,type,description})=>({id,name,type,description:text(description,160)}));
 const compactLocations=geographyLocations(locations).map(({id,name,precisionNote})=>({id,name,precisionNote:text(precisionNote,160)}));
 const compactRoutes=routes.map(({id,name,precisionNote})=>({id,name,precisionNote:text(precisionNote,160)}));
 return[
  'Return JSON only, matching creator-semantic-plan-v1 exactly.',
  'Create exactly one scene for every locked transcript segment, in the same order. Never alter or create timing.',
  'Choose editorial intent only. Never output coordinates, colours, font sizes, boundaries, keyframes or renderer internals.',
  'Use only supplied assetIds, locationId and routeId values. Use an empty string or empty array when none is grounded.',
  'Map scenes require a supplied locationId or routeId, or a dated historicalYear with relevant polityNames. Do not convert illustrative atmospheric flow into a factual route.',
  'When the instructions explicitly request a real geographic map and a supplied generic context matches, choose engine map and that locationId. For atmospheric maps use pressure-driven-flow or shifting-zone; the deterministic compiler creates illustrative flow and zone layers without model-authored coordinates.',
  'Use context-india-indian-ocean for India/Indian Ocean monsoon or ITCZ explanations, context-global-equator for global Equator explanations, and context-south-asia for regional South Asia context. Do not request these built-in contexts as missing resources.',
  'For dated history, set historicalYear, regionId and only the narration-relevant polityNames. Use historical-year-map when a dated political context is editorially necessary. Use 0, an empty region and an empty polity list when they do not apply.',
  'Use resourceRequests for every missing factual or visual input. Choose a safe fallback so the rest of the video can compile; never drop a locked segment because an asset is missing.',
  'Use clarifications only when an answer would materially change a factual claim. Supply a conservative default so production can continue without waiting. Use an empty list when no clarification is needed.',
  'Use missingInfo for facts, geography or assets that still require verification. Do not hide uncertainty or invent a resource to avoid reporting it.',
  'Follow the reference-film style and renderer capability rules. Prefer a reusable generic preset rather than a topic-named preset.',
  JSON.stringify({
   schemaVersion:manifest.schemaVersion,
   lockedSegments:segments,
   creativeInstructions:text(creativeInstructions,12000),
   styleProfile,
   rendererCapabilities,
   approvedExamples:approvedExamples.examples,
   catalog:{assets:compactAssets,locations:compactLocations,routes:compactRoutes}
  })
 ].join('\n');
}

function routeLayer({id,name,start=0,end,coordinates,color='#65B7E6',lineWidth=4,opacity=1,arrowhead=false,revealDuration,fadeIn=.2,fadeOut=.2}){
 return{id,type:'route',name,start,end,coordinates,color,lineWidth,opacity,arrowhead,revealDuration:revealDuration??Math.min(1.6,end*.45),fadeIn:Math.min(fadeIn,end/3),fadeOut:Math.min(fadeOut,end/3)};
}

function atmosphericMap(scene,duration,context){
 if(!['pressure-driven-flow','shifting-zone'].includes(scene.presetId))return null;
 const end=Math.max(1,Number(duration)||1),india=context.id==='context-india-indian-ocean'||context.id==='context-south-asia';
 const west=india?25:-135,east=india?135:135,center=india?[78,6]:[0,0],layers=[
  routeLayer({id:'equator',name:'Equator',end,coordinates:[[west,0],[east,0]],color:'#F4F5F7',lineWidth:2,opacity:.75,arrowhead:false,revealDuration:Math.min(.8,end*.25),fadeOut:0}),
  {id:'equator-label',type:'label',name:'EQUATOR',start:0,end,position:[india?42:-35,0],color:'#F4F5F7',scale:.9,fadeIn:.2,fadeOut:.2}
 ];
 if(scene.presetId==='pressure-driven-flow'){
  layers.push(
   routeLayer({id:'itcz-band',name:'ITCZ · illustrative convergence zone',end,coordinates:[[west,-1],[east,-1]],color:'#E2B75D',lineWidth:16,opacity:.42,arrowhead:false,revealDuration:Math.min(1.2,end*.35)}),
   {id:'itcz-label',type:'label',name:'ITCZ',start:Math.min(.35,end*.1),end,position:[india?82:8,1.6],color:'#F4F5F7',scale:1.15,fadeIn:.25,fadeOut:.2},
   routeLayer({id:'trade-nw',name:'North-East Trade Winds · illustrative',end,coordinates:[[india?42:-100,22],[india?58:-55,11],[india?74:-10,1]],arrowhead:true}),
   routeLayer({id:'trade-ne',name:'North-East Trade Winds · illustrative',end,coordinates:[[india?118:100,22],[india?100:55,11],[india?84:10,1]],arrowhead:true}),
   routeLayer({id:'trade-sw',name:'South-East Trade Winds · illustrative',end,coordinates:[[india?42:-100,-22],[india?58:-55,-11],[india?74:-10,-1]],arrowhead:true}),
   routeLayer({id:'trade-se',name:'South-East Trade Winds · illustrative',end,coordinates:[[india?118:100,-22],[india?100:55,-11],[india?84:10,-1]],arrowhead:true})
  );
  return{format:'invincible-map-animation',version:1,title:scene.title||'Atmospheric convergence',duration:end,aspectRatio:'9:16',basemap:'satellite',terrain:false,overlayPreset:'documentary',camera:[{time:0,center,zoom:india?2.25:1.35,pitch:0,bearing:0,easing:'smooth'},{time:end,center:[center[0],center[1]+2],zoom:india?2.55:1.55,pitch:0,bearing:0,easing:'hold'}],assets:[],layers};
 }
 const phase=Math.max(.3,end*.28),late=Math.max(phase+.2,end*.58);
 layers.push(
  routeLayer({id:'itcz-start',name:'ITCZ · initial illustrative position',start:0,end:Math.max(phase+.25,end*.52),coordinates:[[west,1],[east,1]],color:'#E2B75D',lineWidth:16,opacity:.3,arrowhead:false,revealDuration:Math.min(.7,end*.2)}),
  routeLayer({id:'itcz-middle',name:'ITCZ · illustrative northward shift',start:phase,end:Math.max(late+.2,end*.82),coordinates:[[west,8],[east,8]],color:'#E2B75D',lineWidth:16,opacity:.36,arrowhead:false,revealDuration:Math.min(.7,end*.2)}),
  routeLayer({id:'itcz-north',name:'ITCZ · northern summer position',start:late,end,coordinates:[[west,15],[east,15]],color:'#E2B75D',lineWidth:16,opacity:.46,arrowhead:false,revealDuration:Math.min(.7,end*.2)}),
  {id:'itcz-shift-label',type:'label',name:'ITCZ shifts north',start:late,end,position:[india?78:5,17],color:'#F4F5F7',scale:1.05,fadeIn:.25,fadeOut:.2}
 );
 if(india)layers.push({id:'india-label',type:'label',name:'INDIA',start:late,end,position:[78.9,21],color:'#F4F5F7',scale:1,fadeIn:.25,fadeOut:.2});
 return{format:'invincible-map-animation',version:1,title:scene.title||'Northward atmospheric shift',duration:end,aspectRatio:'9:16',basemap:'satellite',terrain:false,overlayPreset:'documentary',camera:[{time:0,center,zoom:india?2.25:1.35,pitch:0,bearing:0,easing:'smooth'},{time:end,center:[center[0],india?16:12],zoom:india?3.05:1.65,pitch:0,bearing:0,easing:'smooth'}],assets:[],layers};
}

function compileSemanticMap(scene,duration,{locations=[],routes=[]}={}){
 const seconds=Number(duration);if(scene?.engine!=='map'||!Number.isFinite(seconds)||seconds<1)return null;
 const allLocations=geographyLocations(locations),location=allLocations.find(item=>String(item.id)===String(scene.locationId||''));
 const atmospheric=location&&atmosphericMap(scene,seconds,location);if(atmospheric)return atmospheric;
 const route=(routes||[]).find(item=>String(item.id)===String(scene.routeId||'')&&item.reviewed===true);
 if(route?.coordinates?.length>=2)return{format:'invincible-map-animation',version:1,title:scene.title||route.name,duration:seconds,aspectRatio:'9:16',basemap:'terrain',terrain:false,overlayPreset:'documentary',camera:[{time:0,center:route.coordinates[0],zoom:4.4,pitch:0,bearing:0,easing:'smooth'},{time:seconds,center:route.coordinates.at(-1),zoom:4.9,pitch:0,bearing:0,easing:'smooth'}],assets:[],layers:[routeLayer({id:'verified-route',name:route.name||'Reviewed route',end:seconds,coordinates:route.coordinates,color:'#E1C65B',lineWidth:4,arrowhead:true})]};
 if(location?.coordinates?.length===2)return{format:'invincible-map-animation',version:1,title:scene.title||location.name,duration:seconds,aspectRatio:'9:16',basemap:'satellite',terrain:false,overlayPreset:'documentary',camera:[{time:0,center:location.coordinates,zoom:3.4,pitch:0,bearing:0,easing:'smooth'},{time:seconds,center:location.coordinates,zoom:3.8,pitch:0,bearing:0,easing:'hold'}],assets:[],layers:[{id:'context-label',type:'label',name:location.name,start:0,end:seconds,position:location.coordinates,color:'#F4F5F7',scale:1,fadeIn:.25,fadeOut:.2}]};
 return null;
}

function semanticCanvasScene(scene){
 const motion={hold:'hold','slow-push':'zoom-in','slow-pull':'hold','pan-left':'pan-left','pan-right':'pan-right','follow-route':'pan-right','global-to-local':'zoom-in'}[scene.cameraIntent]||'hold';
 const backgroundStyle=scene.sceneKind==='documentary-diagram'||scene.sceneKind==='atmospheric-system'?'blueprint':scene.sceneKind==='comparison'?'grid':'plain';
 const accentColor=scene.emphasis.includes('wind')||scene.emphasis.includes('moisture')?styleProfile.palette.coolFlow:scene.emphasis.includes('pressure')||scene.emphasis.includes('temperature')?styleProfile.palette.warmZone:styleProfile.palette.accent;
 return{title:scene.title||'Documentary scene',subtitle:scene.sceneKind.replaceAll('-',' '),visual:scene.visualIntent,backgroundStyle,accentColor,motion,presetId:scene.presetId,labelTreatment:scene.labelTreatment,emphasis:scene.emphasis};
}

module.exports={plannerPack,plannerSchemaForRequest,normalizeSemanticPlan,buildSemanticPlannerPrompt,semanticCanvasScene,compileSemanticMap,geographyLocations,BUILTIN_GEOGRAPHY_CONTEXTS};
