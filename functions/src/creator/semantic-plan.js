const manifest=require('./planner-pack/manifest.json');
const schema=require('./planner-pack/semantic-plan.schema.json');
const styleProfile=require('./planner-pack/style-profile.json');
const rendererCapabilities=require('./planner-pack/renderer-capabilities.json');
const approvedExamples=require('./planner-pack/approved-examples.json');

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

function plannerSchemaForRequest({segmentIds=[],assetIds=[],locationIds=[],routeIds=[]}={}){
 const value=structuredClone(schema),sceneList=value.properties.scenes,properties=sceneList.items.properties;
 const unique=items=>[...new Set(items.map(item=>String(item)).filter(Boolean))];
 const segments=unique(segmentIds),assets=unique(assetIds),locations=unique(locationIds),routes=unique(routeIds);
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
 const segments=new Set(segmentIds.map(String)),assets=new Set(assetIds.map(String)),locations=new Set(locationIds.map(String)),routes=new Set(routeIds.map(String)),seen=new Set();
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
 const compactLocations=locations.map(({id,name,precisionNote})=>({id,name,precisionNote:text(precisionNote,160)}));
 const compactRoutes=routes.map(({id,name,precisionNote})=>({id,name,precisionNote:text(precisionNote,160)}));
 return[
  'Return JSON only, matching creator-semantic-plan-v1 exactly.',
  'Create exactly one scene for every locked transcript segment, in the same order. Never alter or create timing.',
  'Choose editorial intent only. Never output coordinates, colours, font sizes, boundaries, keyframes or renderer internals.',
  'Use only supplied assetIds, locationId and routeId values. Use an empty string or empty array when none is grounded.',
  'Map scenes require a supplied locationId or routeId, or a dated historicalYear with relevant polityNames. Do not convert illustrative atmospheric flow into a factual route.',
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

function semanticCanvasScene(scene){
 const motion={hold:'hold','slow-push':'zoom-in','slow-pull':'hold','pan-left':'pan-left','pan-right':'pan-right','follow-route':'pan-right','global-to-local':'zoom-in'}[scene.cameraIntent]||'hold';
 const backgroundStyle=scene.sceneKind==='documentary-diagram'||scene.sceneKind==='atmospheric-system'?'blueprint':scene.sceneKind==='comparison'?'grid':'plain';
 const accentColor=scene.emphasis.includes('wind')||scene.emphasis.includes('moisture')?styleProfile.palette.coolFlow:scene.emphasis.includes('pressure')||scene.emphasis.includes('temperature')?styleProfile.palette.warmZone:styleProfile.palette.accent;
 return{title:scene.title||'Documentary scene',subtitle:scene.sceneKind.replaceAll('-',' '),visual:scene.visualIntent,backgroundStyle,accentColor,motion,presetId:scene.presetId,labelTreatment:scene.labelTreatment,emphasis:scene.emphasis};
}

module.exports={plannerPack,plannerSchemaForRequest,normalizeSemanticPlan,buildSemanticPlannerPrompt,semanticCanvasScene};
