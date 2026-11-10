import fs from 'node:fs/promises';
import path from 'node:path';

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

export async function transcribeWithWhisper(audio, { endpoint = process.env.INVINCIBLE_WHISPER_URL } = {}) {
  if (!endpoint) throw new Error('Local Whisper is not configured. Set INVINCIBLE_WHISPER_URL to a private local Whisper service.');
  const url = new URL(endpoint);
  if (!['127.0.0.1', 'localhost'].includes(url.hostname)) throw new Error('Whisper endpoint must remain on localhost.');
  const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ audioPath: audio.path, wordTimestamps: true, segmentTimestamps: true }) });
  if (!response.ok) throw new Error(`Whisper request failed (${response.status}).`);
  return normalizeTranscript(await response.json());
}

export async function analyzeVoiceover({ audioPath, workspaceRoot, assetCatalog = [], transcribe = transcribeWithWhisper, plan }) {
  const audio = await inspectAudio(audioPath, { workspaceRoot });
  const transcript = normalizeTranscript(await transcribe(audio));
  if (typeof plan !== 'function') throw new Error('A local Qwen planner is required.');
  const qwenDraft = await plan(buildQwenPrompt(transcript, assetCatalog));
  return assembleSceneDraft(transcript, qwenDraft, assetCatalog);
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

export function buildQwenPrompt(transcript, assetCatalog = []) {
  const normalized = normalizeTranscript(transcript);
  const assets = assetCatalog.map(asset => ({ id: String(asset.id), name: String(asset.name ?? ''), type: String(asset.type ?? ''), description: String(asset.description ?? asset.notes ?? '') }));
  return [
    'You are Invincible Voiceover Analysis. Return JSON only.',
    'Create a draft scene plan from the supplied transcript.',
    'Do not create timestamps: use only sourceSegmentIds. Do not invent asset IDs; choose only IDs from the supplied catalog. If no asset fits, return an empty assetIds array and add a missingInfo item.',
    'Required JSON shape: {"scenes":[{"id":"scene-1","sourceSegmentIds":["segment-1"],"visual":"...","animation":"...","assetIds":[],"missingInfo":[]}]}',
    JSON.stringify({ transcript: normalized, assetCatalog: assets })
  ].join('\n');
}

function catalogMap(assetCatalog) { return new Map(assetCatalog.map(asset => [String(asset.id), asset])); }

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
    if (!String(draft.visual ?? '').trim()) missingInfo.push('visual description');
    if (!assetIds.length) missingInfo.push('verified asset reference');
    return {
      id: String(draft.id || `scene-${index + 1}`), startSeconds: start, endSeconds: end, durationSeconds: Number((end - start).toFixed(3)),
      voiceover, voiceoverTimestamp: `${start.toFixed(3)}-${end.toFixed(3)}s`, visual: String(draft.visual ?? '').trim(),
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
  return { schemaVersion: 1, title, aspectRatio: '9:16', assets: [], audio: null, scenes: result.scenes.map(scene => ({ id: scene.id, timeline: `${scene.startSeconds.toFixed(3)}-${scene.endSeconds.toFixed(3)}s`, voiceover: scene.voiceover, voiceoverTimestamp: scene.voiceoverTimestamp, visual: scene.visual, assets: scene.assets, assetReferences: scene.assetReferences, technicalNotes: scene.animation ? `Suggested animation: ${scene.animation}` : '' })) };
}
