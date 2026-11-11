import fs from 'node:fs/promises';
import path from 'node:path';
import { readAnimation } from '../creator/map-animation-import.js?v=2026111112';

const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav']);

export function validateAudioPath(filePath, { workspaceRoot } = {}) {
  if (!filePath || typeof filePath !== 'string') throw new Error('Audio file path is required.');
  const ext = path.extname(filePath).toLowerCase();
  if (!AUDIO_EXTENSIONS.has(ext)) throw new Error('Only MP3 and WAV voiceovers are supported.');
  const resolved = path.resolve(filePath);
  if (workspaceRoot) {
    const root = path.resolve(workspaceRoot);
    const relative = path.relative(root, resolved);
    if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Audio must be inside the restricted agent workspace.');
  }
  return resolved;
}

export async function inspectAudio(filePath, options = {}) {
  const resolved = validateAudioPath(filePath, options);
  const stat = await fs.stat(resolved);
  if (!stat.isFile()) throw new Error('Audio path must point to a file.');
  if (!stat.size) throw new Error('Audio file is empty.');
  return { path: resolved, filename: path.basename(resolved), extension: path.extname(resolved).slice(1).toLowerCase(), bytes: stat.size };
}

export async function loadCreatorAssetCatalog(repoRoot) {
  const root = path.resolve(repoRoot);
  const readJson = async relative => JSON.parse(await fs.readFile(path.join(root, relative), 'utf8'));
  const army = await readJson('creator/asset-libraries/historical-army-commanders-v1.json');
  const flags = await readJson('creator/history-data/border-flags-v3/manifest.json');
  const styleProfile = await readJson('creator/creative-style-profile.json');
  const verifiedExample = await readJson('creator/map-animation-example.json');
  const assets = [
    ...(Array.isArray(army.assets) ? army.assets : []),
    ...(Array.isArray(flags) ? flags : [])
  ].map(asset => ({ id: String(asset.id), name: String(asset.name ?? ''), type: String(asset.type ?? 'map-overlay'), description: String(asset.description ?? asset.credit ?? ''), path: asset.path || asset.url || asset.file || '' }));
  return {
    version: 1,
    assets,
    styleProfile,
    verifiedExample,
    animationPresets: [
      { id: 'documentary', description: 'Documentary map overlay and typography preset.' },
      { id: 'legacy', description: 'Legacy map overlay preset.' },
      { id: 'fade', description: 'Short scene fade transition.' },
      { id: 'slow-pan', description: 'Slow camera pan.' },
      { id: 'slow-zoom', description: 'Slow camera zoom.' }
    ]
  };
}

export function normalizeCreativeInstructions(value) {
  const text = String(value ?? '').trim();
  if (text.length > 4000) throw new Error('Creative instructions must be 4,000 characters or fewer.');
  return text;
}

export async function transcribeWithWhisper(audio, { endpoint = process.env.INVINCIBLE_WHISPER_URL } = {}) {
  if (!endpoint) throw new Error('Local Whisper is not configured. Set INVINCIBLE_WHISPER_URL to a private local Whisper service.');
  const url = new URL(endpoint);
  if (!['127.0.0.1', 'localhost'].includes(url.hostname)) throw new Error('Whisper endpoint must remain on localhost.');
  const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ audioPath: audio.path, wordTimestamps: true, segmentTimestamps: true }) });
  if (!response.ok) throw new Error(`Whisper request failed (${response.status}).`);
  return normalizeTranscript(await response.json());
}

export async function analyzeVoiceover({ audioPath, workspaceRoot, assetCatalog = [], creativeInstructions = '', transcribe = transcribeWithWhisper, plan }) {
  const audio = await inspectAudio(audioPath, { workspaceRoot });
  const transcript = normalizeTranscript(await transcribe(audio));
  if (typeof plan !== 'function') throw new Error('A local Qwen planner is required.');
  const qwenDraft = await plan(buildQwenPrompt(transcript, assetCatalog, creativeInstructions));
  return assembleSceneDraft(transcript, qwenDraft, assetCatalog);
}

export function buildCreativePlanPrompt(transcript, assetCatalog, creativeInstructions = '') {
  const t=normalizeTranscript(transcript), assets=(assetCatalog.assets||[]).filter(a=>/commander|troop|infantry|cavalry|elephant|cannon/i.test(a.name)).map(({id,name,type})=>({id,name,type}));
  const locations=Array.isArray(assetCatalog.verifiedLocations)?assetCatalog.verifiedLocations:[],routes=Array.isArray(assetCatalog.verifiedRoutes)?assetCatalog.verifiedRoutes:[];
  return `Return JSON only. Choose one compact animation intention for each segment. Never invent positions, routes or asset IDs. Use only the verified locations and routes supplied here; if the catalog has no suitable geometry, keep the intent descriptive and explain what is missing. Output {"scenes":[{"sourceSegmentId":"segment-1","intent":"advance|reveal|hold|title","assetId":"catalog id or empty","locationId":"verified location ID or empty","routeId":"verified route ID or empty","title":"short label"}]}. Segments: ${JSON.stringify(t.segments.map(s=>({id:s.id,text:s.text,start:s.start,end:s.end})))}. Verified locations: ${JSON.stringify(locations.map(({id,name,coordinates,sourceUrl,sourceDate,precisionNote})=>({id,name,coordinates,sourceUrl,sourceDate,precisionNote})))}. Verified routes: ${JSON.stringify(routes.map(({id,name,coordinates,sourceUrl,sourceDate,precisionNote,reviewed})=>({id,name,coordinates,sourceUrl,sourceDate,precisionNote,reviewed})))}. Approved assets: ${JSON.stringify(assets)}. Creative direction: ${normalizeCreativeInstructions(creativeInstructions)}`;
}

export function compileCreativePlan(transcript, plan, assetCatalog) {
  const t=normalizeTranscript(transcript),segments=new Map(t.segments.map(s=>[s.id,s])),assets=catalogMap(assetCatalog),rows=Array.isArray(plan?.scenes)?plan.scenes:[];
  if(rows.length!==t.segments.length)throw Error(`Creative pass must return one plan per segment; expected ${t.segments.length}, received ${rows.length}.`);
  const locations=new Map((assetCatalog.verifiedLocations||[]).map(item=>[String(item.id),item])),routes=new Map((assetCatalog.verifiedRoutes||[]).filter(item=>item.reviewed===true).map(item=>[String(item.id),item]));
  const scenes=rows.map((row,i)=>{
    const seg=segments.get(String(row.sourceSegmentId));if(!seg)throw Error(`Plan ${i+1} references an unknown segment.`);
    const assetId=String(row.assetId||'');if(assetId&&!assets.has(assetId))throw Error(`Plan ${i+1} selected an unregistered asset.`);
    if(!['advance','reveal','hold','title'].includes(row.intent))throw Error(`Plan ${i+1} has an unsupported intent.`);
    const duration=Number((seg.end-seg.start).toFixed(3)),route=routes.get(String(row.routeId||'')),location=locations.get(String(row.locationId||''));let mapAnimation=null;const missingInfo=[];
    if(row.intent==='advance'){
      const coordinates=route?.coordinates;
      const sourced=route&&String(route.sourceUrl||'').startsWith('https://')&&String(route.sourceDate||'').trim()&&String(route.precisionNote||'').trim()&&Array.isArray(coordinates)&&coordinates.length>=2&&coordinates.every(point=>Array.isArray(point)&&point.length===2&&point.every(Number.isFinite)&&Math.abs(point[0])<=180&&Math.abs(point[1])<=90);
      if(sourced){const first=coordinates[0],last=coordinates.at(-1);mapAnimation={format:'invincible-map-animation',version:1,title:String(route.name||row.title||'Verified route'),duration,aspectRatio:'9:16',basemap:'terrain',terrain:false,overlayPreset:'documentary',camera:[{time:0,center:first,zoom:5,pitch:0,bearing:0,easing:'smooth'},{time:duration,center:last,zoom:5.35,pitch:0,bearing:0,easing:'smooth'}],assets:[],layers:[{id:`route-${i+1}`,type:'route',name:`${String(route.name||'Verified route')} · ${String(route.precisionNote)}`,start:0,end:duration,coordinates,color:'#E1C65B',lineWidth:3.5,revealDuration:Math.min(1.8,duration*.6),fadeIn:.2,fadeOut:.2,arrowhead:true}]};}
      else missingInfo.push('No reviewed, sourced route geometry is available for this movement; no route was invented.');
    }else if(location&&Array.isArray(location.coordinates)&&location.coordinates.length===2&&location.coordinates.every(Number.isFinite)&&String(location.sourceUrl||'').startsWith('https://')&&String(location.sourceDate||'').trim()&&String(location.precisionNote||'').trim()){
      const center=location.coordinates;mapAnimation={format:'invincible-map-animation',version:1,title:String(row.title||location.name||row.intent),duration,aspectRatio:'9:16',basemap:'terrain',terrain:false,overlayPreset:'documentary',camera:[{time:0,center,zoom:4.9,pitch:0,bearing:0,easing:'smooth'},{time:duration,center,zoom:5.25,pitch:0,bearing:0,easing:'smooth'}],assets:[],layers:[{id:`label-${i+1}`,type:'label',name:String(location.name),start:0,end:duration,position:center,color:'#F4F5F7',scale:1}]};
    }else missingInfo.push('No reviewed, sourced location geometry is available for this scene; no coordinates were invented.');
    if(assetId)missingInfo.push(`Selected asset ${assets.get(assetId).name} has no verified map placement in this catalog.`);
    const checked=mapAnimation?readAnimation(mapAnimation):null;return {id:`scene-${i+1}`,sourceSegmentIds:[seg.id],visual:String(row.title||seg.text),animation:String(row.intent),assetIds:assetId?[assetId]:[],missingInfo,mapAnimation:checked};
  });return {scenes};
}

function finite(value) { return typeof value === 'number' && Number.isFinite(value); }

export function normalizeTranscript(input) {
  if (!input || typeof input !== 'object') throw new Error('Whisper transcript must be an object.');
  const segments = Array.isArray(input.segments) ? input.segments : [];
  if (!segments.length) throw new Error('Whisper transcript has no timestamped segments.');
  const normalizedSegments = segments.map((segment, index) => {
    const start = Number(segment.start), end = Number(segment.end);
    if (!finite(start) || !finite(end) || start < 0 || end <= start) throw new Error(`Invalid segment timing at segment ${index + 1}.`);
    const text = String(segment.text ?? '').trim();
    if (!text) throw new Error(`Segment ${index + 1} has no transcript text.`);
    const words = Array.isArray(segment.words) ? segment.words.map((word, wordIndex) => {
      const wordStart = Number(word.start), wordEnd = Number(word.end);
      if (!finite(wordStart) || !finite(wordEnd) || wordStart < start || wordEnd > end || wordEnd <= wordStart) throw new Error(`Invalid word timing at segment ${index + 1}, word ${wordIndex + 1}.`);
      return { word: String(word.word ?? '').trim(), start: wordStart, end: wordEnd };
    }).filter(word => word.word) : [];
    return { id: String(segment.id ?? `segment-${index + 1}`), start, end, text, words };
  });
  for (let i = 1; i < normalizedSegments.length; i++) {
    if (normalizedSegments[i].start < normalizedSegments[i - 1].start) throw new Error('Whisper segments are not ordered by start time.');
  }
  const duration = Number(input.duration ?? normalizedSegments.at(-1).end);
  if (!finite(duration) || duration < normalizedSegments.at(-1).end) throw new Error('Transcript duration is shorter than its final timestamp.');
  return { text: String(input.text ?? normalizedSegments.map(segment => segment.text).join(' ')).trim(), language: input.language || '', duration, segments: normalizedSegments };
}

export function buildQwenPrompt(transcript, assetCatalog = [], creativeInstructions = '') {
  const normalized = normalizeTranscript(transcript);
  const direction = normalizeCreativeInstructions(creativeInstructions);
  const catalog = Array.isArray(assetCatalog) ? { assets: assetCatalog, animationPresets: [] } : assetCatalog;
  const assets = (catalog.assets || []).map(asset => ({ id: String(asset.id), name: String(asset.name ?? ''), type: String(asset.type ?? ''), description: String(asset.description ?? asset.notes ?? '') }));
  const styleProfile = catalog.styleProfile || { id: 'invincible-documentary-v1', composition: { aspectRatio: '9:16', safeMargin: 64 }, palette: { background: '#071426', foreground: '#F4F5F7', accent: '#E1C65B' }, camera: { movement: 'continuous-subtle', preferredEasing: 'smooth', minimumKeys: 2 }, animation: { overlayPreset: 'documentary', troopMovement: 'sequential-timed-layers' }, historicalIntegrity: { useVerifiedAssetsOnly: true, doNotInventCoordinates: true } };
  return [
    'You are Invincible Voiceover Analysis. Return JSON only.',
    'Create a draft scene plan from the supplied transcript.',
    'Do not create timestamps: use only sourceSegmentIds. Do not invent asset IDs; choose only IDs from the supplied catalog. If no asset fits, return an empty assetIds array and add a missingInfo item.',
    'Required JSON shape: {"scenes":[{"id":"scene-1","sourceSegmentIds":["segment-1"],"visual":"...","animation":"...","assetIds":[],"missingInfo":[],"mapAnimation":null}]}',
    'When the narration or creative instructions contain map, troop, army, route, camera or movement language, mapAnimation must be an invincible-map-animation version 1 object for that scene. Use only supported layer types (symbol,label,route,image,glb), increasing camera times starting at 0, and registered libraryId values. Image and GLB layers require position, scale, rotation, altitude; image layers also require four geographic corners. The engine does not support arbitrary layer keyframes: represent troop movement only with sequential timed layers at verified positions, or use a revealed route. If locations, geometry or assets are not supplied or cannot be verified, set mapAnimation to null and explain the missingInfo instead of guessing.',
    'Follow the supplied Invincible creative style profile exactly: premium minimalist documentary, dark navy/black backgrounds, restrained gold accents, clean readable labels, portrait-safe margins, continuous subtle camera motion through narration and gaps, no abrupt jumps, and historically cautious sourcing.',
    JSON.stringify({ transcript: normalized, creativeInstructions: direction, styleProfile, verifiedExample: catalog.verifiedExample || null, assetCatalog: assets, animationPresets: catalog.animationPresets || [] })
  ].join('\n');
}

export function validateMapAnimation(plan, { duration, assetCatalog = [] } = {}) {
  if (plan == null) return { valid: false, errors: ['No map animation was supplied.'] };
  const errors = [];
  try {
    const normalized = readAnimation(plan);
    if (normalized.aspectRatio !== '9:16') errors.push('Invincible documentary maps must use the 9:16 portrait composition.');
    if (normalized.overlayPreset !== 'documentary') errors.push('Invincible documentary maps must use the documentary overlay preset.');
    if (Number(normalized.duration) > 1 && (!Array.isArray(normalized.camera) || normalized.camera.length < 2)) errors.push('Camera movement must include at least a start and end keyframe.');
    if (Array.isArray(normalized.camera) && normalized.camera.length > 1) {
      for (let i = 1; i < normalized.camera.length; i++) {
        const previous = normalized.camera[i - 1], current = normalized.camera[i], span = current.time - previous.time;
        if (span > 0) {
          const zoomDelta = Math.abs(Number(current.zoom || 0) - Number(previous.zoom || 0));
          const bearingDelta = Math.abs(Number(current.bearing || 0) - Number(previous.bearing || 0));
          if (zoomDelta / span > 0.8) errors.push('Camera zoom changes too quickly for the documentary style.');
          if (bearingDelta / span > 20) errors.push('Camera bearing changes too quickly for the documentary style.');
        }
      }
    }
    if (duration != null && Math.abs(Number(normalized.duration) - Number(duration)) > 0.02) errors.push('Map animation duration must match the narration scene duration.');
    const assets = new Map((Array.isArray(assetCatalog) ? assetCatalog : assetCatalog?.assets || []).map(asset => [String(asset.id), asset]));
    for (const asset of normalized.assets || []) {
      const ref = asset.libraryId || asset.libraryName;
      if (ref && !assets.has(String(ref)) && ![...assets.values()].some(item => String(item.name).trim().toLowerCase() === String(ref).trim().toLowerCase())) errors.push(`Map animation references an unavailable library asset: ${ref}.`);
    }
  } catch (error) { errors.push(error.message); }
  return { valid: errors.length === 0, errors };
}

function catalogMap(assetCatalog) {
  const assets = Array.isArray(assetCatalog) ? assetCatalog : (assetCatalog?.assets || []);
  return new Map(assets.map(asset => [String(asset.id), asset]));
}

export function assembleSceneDraft(transcript, qwenDraft, assetCatalog = []) {
  const normalized = normalizeTranscript(transcript);
  if (!qwenDraft || !Array.isArray(qwenDraft.scenes)) throw new Error('Qwen response must contain a scenes array.');
  const assets = catalogMap(assetCatalog);
  const segments = new Map(normalized.segments.map(segment => [segment.id, segment]));
  const used = new Set();
  const errors = [];
  const scenes = qwenDraft.scenes.map((draft, index) => {
    const sourceIds = Array.isArray(draft.sourceSegmentIds) ? draft.sourceSegmentIds.map(String) : [];
    const source = sourceIds.map(id => segments.get(id)).filter(Boolean);
    sourceIds.filter(id => !segments.has(id)).forEach(id => errors.push(`Scene ${index + 1} references unknown transcript segment ${id}.`));
    if (!source.length) errors.push(`Scene ${index + 1} has no valid transcript segments.`);
    source.forEach(segment => used.add(segment.id));
    const assetIds = Array.isArray(draft.assetIds) ? draft.assetIds.map(String) : [];
    assetIds.filter(id => !assets.has(id)).forEach(id => errors.push(`Scene ${index + 1} references unknown asset ${id}.`));
    const start = source.length ? Math.min(...source.map(segment => segment.start)) : 0;
    const end = source.length ? Math.max(...source.map(segment => segment.end)) : 0;
    const voiceover = source.map(segment => segment.text).join(' ').trim();
    const missingInfo = Array.isArray(draft.missingInfo) ? draft.missingInfo.map(String) : [];
    const mapAnimation = draft.mapAnimation || null;
    if (mapAnimation) {
      const mapValidation = validateMapAnimation(mapAnimation, { duration: end - start, assetCatalog });
      if (!mapValidation.valid) mapValidation.errors.forEach(error => { missingInfo.push(`mapAnimation: ${error}`); errors.push(`Scene ${index + 1} mapAnimation: ${error}`); });
    }
    if (!String(draft.visual ?? '').trim()) missingInfo.push('visual description');
    if (!assetIds.length) missingInfo.push('verified asset reference');
    return {
      id: String(draft.id || `scene-${index + 1}`), startSeconds: start, endSeconds: end, durationSeconds: Number((end - start).toFixed(3)),
      voiceover, voiceoverTimestamp: `${start.toFixed(3)}-${end.toFixed(3)}s`, visual: String(draft.visual ?? '').trim(), mapAnimation,
      animation: String(draft.animation ?? '').trim(), assets: assetIds.map(id => assets.get(id)?.name || id).join('; '), assetIds,
      assetReferences: assetIds.join('; '), sourceSegmentIds: source.map(segment => segment.id), missingInfo: [...new Set(missingInfo)]
    };
  });
  normalized.segments.filter(segment => !used.has(segment.id)).forEach(segment => errors.push(`Transcript segment ${segment.id} was not assigned to a scene.`));
  return { format: 'invincible-voiceover-analysis', version: 1, transcript: normalized, scenes, errors: [...new Set(errors)], valid: errors.length === 0 };
}

export function validateCreatorStudioDraft(result) {
  const errors = [...(result?.errors || [])];
  if (!result || result.format !== 'invincible-voiceover-analysis' || result.version !== 1) errors.push('Unsupported voiceover analysis format.');
  if (!Array.isArray(result?.scenes) || !result.scenes.length) errors.push('At least one scene is required.');
  let previousEnd = 0;
  for (const [index, scene] of (result?.scenes || []).entries()) {
    if (!(scene.startSeconds >= previousEnd) || !(scene.endSeconds > scene.startSeconds) || scene.durationSeconds !== Number((scene.endSeconds - scene.startSeconds).toFixed(3))) errors.push(`Scene ${index + 1} has invalid or overlapping timing.`);
    if (!scene.voiceover) errors.push(`Scene ${index + 1} has no narration.`);
    previousEnd = scene.endSeconds;
  }
  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}

export function toCreatorStudioImport(result, title = 'Voiceover analysis draft') {
  const validation = validateCreatorStudioDraft(result);
  if (!validation.valid) throw new Error(`Draft is not importable: ${validation.errors.join(' ')}`);
  // `animation` is kept in technicalNotes because Creator Studio's importer
  // aliases both `animation` and `visual` to the same field.
  return { schemaVersion: 1, title, aspectRatio: '9:16', assets: [], audio: null, scenes: result.scenes.map(scene => ({ id: scene.id, timeline: `${scene.startSeconds.toFixed(3)}-${scene.endSeconds.toFixed(3)}s`, voiceover: scene.voiceover, voiceoverTimestamp: scene.voiceoverTimestamp, visual: scene.visual, assets: scene.assets, assetReferences: scene.assetReferences, mapAnimation: scene.mapAnimation || null, technicalNotes: scene.animation ? `Suggested animation: ${scene.animation}` : '' })) };
}
