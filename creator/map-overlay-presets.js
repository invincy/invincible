const isPlainObject = value => !!value && typeof value === 'object' && !Array.isArray(value);
const finite = (value, min, max) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const shortString = (value, max = 120) => typeof value === 'string' && value.length <= max;

export const OVERLAY_PRESETS = Object.freeze({
 legacy: Object.freeze({
  scaling: 'css',
  events: Object.freeze({
   visible: true,
   mode: 'legacy',
   font: '600 12px system-ui',
   dotRadius: 4,
   dotColor: '#b25f3d',
   leaderColor: '#7b6145',
   leaderWidth: 1,
   nightBg: '#102331e8',
   dayBg: '#eee4cde8',
   nightText: '#eee4cd',
   dayText: '#312c25',
   borderColor: '',
   borderWidth: 0,
   cardHeight: 25,
   stepY: 27,
   maxAttempts: 8,
   padX: 8,
   minY: 50,
   maxBottomMargin: 70,
   cornerRadius: 0
  }),
  dateBanner: Object.freeze({
   visible: true,
   mode: 'bar',
   height: 45,
   font: '600 15px system-ui',
   nightBg: '#102331e8',
   dayBg: '#eee4cde8',
   nightText: '#eee4cd',
   dayText: '#312c25',
   borderColor: '',
   borderWidth: 0,
   cornerRadius: 0,
   padX: 12,
   marginTop: 0
  }),
  attribution: Object.freeze({
   visible: true,
   mode: 'bar',
   height: 40,
   font: '9px system-ui',
   nightBg: '#102331e8',
   dayBg: '#eee4cde8',
   nightText: '#eee4cd',
   dayText: '#312c25',
   fallbackProvider: 'Natural Earth',
   suffix: 'Imported geography: see Sources',
   sourceCredit: ''
  }),
  renderer: Object.freeze({
   relief: Object.freeze({
    exaggeration: 0.45,
    shadowColor: '#273c58',
    highlightColor: '#fff1ca',
    accentColor: '#4e705b'
   }),
   symbol: Object.freeze({
    font: '600 42px system-ui',
    strokeColor: '#071923',
    lineWidth: 5,
    fallbackFontFamily: 'system-ui',
    fallbackBasePx: 24
   })
  })
 }),
 documentary: Object.freeze({
  scaling: 'shortEdge1080',
  events: Object.freeze({
   visible: true,
   mode: 'card',
   font: '600 48px "Noto Sans Devanagari", system-ui, sans-serif',
   dotRadius: 8,
   dotColor: '#d9b76e',
   leaderColor: 'rgba(217, 183, 110, 0.78)',
   leaderWidth: 2.5,
   nightBg: 'rgba(16, 27, 43, 0.86)',
   dayBg: 'rgba(242, 236, 222, 0.90)',
   nightText: '#f4efe2',
   dayText: '#14202b',
   borderColor: 'rgba(217, 183, 110, 0.45)',
   borderWidth: 1.5,
   cardHeight: 74,
   stepY: 88,
   maxAttempts: 8,
   padX: 22,
   minY: 110,
   maxBottomMargin: 100,
   cornerRadius: 18
  }),
  dateBanner: Object.freeze({
   visible: true,
   mode: 'pill',
   height: 66,
   font: '600 40px "Noto Sans Devanagari", system-ui, sans-serif',
   nightBg: 'rgba(16, 27, 43, 0.86)',
   dayBg: 'rgba(242, 236, 222, 0.90)',
   nightText: '#f4efe2',
   dayText: '#14202b',
   borderColor: 'rgba(217, 183, 110, 0.45)',
   borderWidth: 1.5,
   cornerRadius: 16,
   padX: 24,
   marginTop: 22
  }),
  attribution: Object.freeze({
   visible: true,
   mode: 'compact',
   height: 36,
   font: '500 15px "Noto Sans Devanagari", system-ui, sans-serif',
   nightBg: 'rgba(16, 27, 43, 0.62)',
   dayBg: 'rgba(242, 236, 222, 0.72)',
   nightText: 'rgba(184, 198, 209, 0.78)',
   dayText: 'rgba(24, 34, 46, 0.82)',
   fallbackProvider: 'Natural Earth',
   suffix: 'Imported geography: see Sources',
   sourceCredit: ''
  }),
  renderer: Object.freeze({
   relief: Object.freeze({
    exaggeration: 0.45,
    shadowColor: '#273c58',
    highlightColor: '#fff1ca',
    accentColor: '#4e705b'
   }),
   symbol: Object.freeze({
    font: '600 48px "Noto Sans Devanagari", system-ui, sans-serif',
    strokeColor: 'rgba(16, 27, 43, 0.92)',
    lineWidth: 6,
    fallbackFontFamily: '"Noto Sans Devanagari", system-ui, sans-serif',
    fallbackBasePx: 48
   })
  })
 })
});

function mergeSection(base, ...overrides) {
 const out = { ...base };
 for (const part of overrides) {
  if (!isPlainObject(part)) continue;
  for (const [key, value] of Object.entries(part)) {
   if (value !== undefined) out[key] = value;
  }
 }
 return out;
}

export function resolveOverlayPolicy(project = null, spec = null, pluginPolicy = null) {
 const p=spec?.presentation;
 const requestedPreset = spec?.overlayPreset ?? project?.overlayPreset ?? 'legacy';
 const presetId = p?p.presetId:Object.hasOwn(OVERLAY_PRESETS, requestedPreset) ? requestedPreset : 'legacy';
 const legacy=OVERLAY_PRESETS.legacy;
 const preset=p?{...legacy,scaling:'shortEdge1080',events:{...legacy.events,mode:'card',font:'600 '+p.labelSize+'px '+p.fontFamily,dotColor:p.accentColor,leaderColor:p.accentColor,nightBg:p.cardColor,dayBg:p.cardColor,nightText:p.textColor,dayText:p.textColor,borderColor:p.accentColor,cornerRadius:p.cardRadius,padX:p.padding,minY:p.safeMargin,cardHeight:p.labelSize*1.22+p.padding*2},dateBanner:{...legacy.dateBanner,visible:p.showDates,font:'600 '+p.secondaryLabelSize+'px '+p.fontFamily},attribution:{...legacy.attribution,mode:'compact',font:'500 22px '+p.fontFamily,suffix:''}}:OVERLAY_PRESETS[presetId];
 const sources = [pluginPolicy, project?.overlayPolicy, spec?.overlayPolicy].filter(isPlainObject);
 const resolved={
  presetId,
  scaling: sources.reduce((acc, s) => s.scaling ?? acc, preset.scaling),
  events: mergeSection(preset.events, ...sources.map(s => s.events)),
  dateBanner: mergeSection(preset.dateBanner, ...sources.map(s => s.dateBanner)),
  attribution: mergeSection(preset.attribution, ...sources.map(s => s.attribution)),
  renderer: {
   relief: mergeSection(preset.renderer.relief, ...sources.map(s => s.renderer?.relief)),
   symbol: mergeSection(preset.renderer.symbol, ...sources.map(s => s.renderer?.symbol))
  }
 };
 // New maps describe their actual saved presentation; older overlay policies are compatibility inputs.
 if(p){if(p.presetVersion===2)resolved.renderer.relief={exaggeration:p.reliefStrength,shadowColor:p.reliefShadow,highlightColor:p.reliefHighlight,accentColor:p.reliefAccent};resolved.scaling=preset.scaling;resolved.events={...resolved.events,...preset.events,visible:resolved.events.visible};resolved.dateBanner={...resolved.dateBanner,...preset.dateBanner};resolved.attribution={...resolved.attribution,...preset.attribution,visible:true,sourceCredit:resolved.attribution.sourceCredit};}
 return resolved;
}

function validateAllowedKeys(obj, allowed, label) {
 if (!isPlainObject(obj)) throw Error(`${label} must be an object.`);
 for (const key of Object.keys(obj)) {
  if (!allowed.includes(key)) throw Error(`Unsupported ${label} option: ${key}.`);
 }
}

export function validateOverlayConfig(map) {
 if (!isPlainObject(map)) return;
 if (map.overlayPreset !== undefined && !Object.hasOwn(OVERLAY_PRESETS, map.overlayPreset)) {
  throw Error(`Overlay preset must be one of: ${Object.keys(OVERLAY_PRESETS).join(', ')}.`);
 }
 if (map.overlayPlugin !== undefined) {
  if (typeof map.overlayPlugin === 'string') {
   if (!/^[a-zA-Z0-9._:-]{1,120}$/.test(map.overlayPlugin)) {
    throw Error('Overlay plugin ID must be a valid non-empty identifier up to 120 characters.');
   }
  } else if (isPlainObject(map.overlayPlugin)) {
   validateAllowedKeys(map.overlayPlugin, ['id', 'options'], 'overlayPlugin');
   if (typeof map.overlayPlugin.id !== 'string' || !/^[a-zA-Z0-9._:-]{1,120}$/.test(map.overlayPlugin.id)) {
    throw Error('Overlay plugin ID must be a valid non-empty identifier up to 120 characters.');
   }
   if (map.overlayPlugin.options !== undefined && !isPlainObject(map.overlayPlugin.options)) {
    throw Error('Overlay plugin options must be an object.');
   }
  } else {
   throw Error('Overlay plugin must be a plugin identifier string or {id, options} object.');
  }
 }
 const p = map.overlayPolicy;
 if (p === undefined) return;
 validateAllowedKeys(p, ['scaling', 'events', 'dateBanner', 'attribution', 'renderer'], 'overlayPolicy');
 if (p.scaling !== undefined && !['css', 'shortEdge1080'].includes(p.scaling)) {
  throw Error('Overlay scaling must be css or shortEdge1080.');
 }
 if (p.events !== undefined) {
  validateAllowedKeys(
   p.events,
   ['visible', 'mode', 'font', 'dotRadius', 'dotColor', 'leaderColor', 'leaderWidth', 'nightBg', 'dayBg', 'nightText', 'dayText', 'borderColor', 'borderWidth', 'cardHeight', 'stepY', 'maxAttempts', 'padX', 'minY', 'maxBottomMargin', 'cornerRadius'],
   'overlayPolicy.events'
  );
  if (p.events.visible !== undefined && typeof p.events.visible !== 'boolean') throw Error('overlayPolicy.events.visible must be boolean.');
  if (p.events.mode !== undefined && !['legacy', 'card'].includes(p.events.mode)) throw Error('overlayPolicy.events.mode must be legacy or card.');
  for (const key of ['font', 'dotColor', 'leaderColor', 'nightBg', 'dayBg', 'nightText', 'dayText', 'borderColor']) {
   if (p.events[key] !== undefined && !shortString(p.events[key], 120)) throw Error(`Invalid overlayPolicy.events.${key}.`);
  }
  const numBounds = {
   dotRadius: [0, 60],
   leaderWidth: [0, 20],
   borderWidth: [0, 20],
   cardHeight: [12, 300],
   stepY: [12, 400],
   maxAttempts: [1, 30],
   padX: [0, 120],
   minY: [0, 600],
   maxBottomMargin: [0, 600],
   cornerRadius: [0, 100]
  };
  for (const [key, [min, max]] of Object.entries(numBounds)) {
   if (p.events[key] !== undefined && !finite(p.events[key], min, max)) throw Error(`Invalid overlayPolicy.events.${key}.`);
  }
 }
 if (p.dateBanner !== undefined) {
  validateAllowedKeys(
   p.dateBanner,
   ['visible', 'mode', 'height', 'font', 'nightBg', 'dayBg', 'nightText', 'dayText', 'borderColor', 'borderWidth', 'cornerRadius', 'padX', 'marginTop'],
   'overlayPolicy.dateBanner'
  );
  if (p.dateBanner.visible !== undefined && typeof p.dateBanner.visible !== 'boolean') throw Error('overlayPolicy.dateBanner.visible must be boolean.');
  if (p.dateBanner.mode !== undefined && !['bar', 'pill'].includes(p.dateBanner.mode)) throw Error('overlayPolicy.dateBanner.mode must be bar or pill.');
  for (const key of ['font', 'nightBg', 'dayBg', 'nightText', 'dayText', 'borderColor']) {
   if (p.dateBanner[key] !== undefined && !shortString(p.dateBanner[key], 120)) throw Error(`Invalid overlayPolicy.dateBanner.${key}.`);
  }
  for (const [key, [min, max]] of Object.entries({ height: [12, 300], borderWidth: [0, 20], cornerRadius: [0, 100], padX: [0, 120], marginTop: [0, 300] })) {
   if (p.dateBanner[key] !== undefined && !finite(p.dateBanner[key], min, max)) throw Error(`Invalid overlayPolicy.dateBanner.${key}.`);
  }
 }
 if (p.attribution !== undefined) {
  validateAllowedKeys(
   p.attribution,
   ['visible', 'mode', 'height', 'font', 'nightBg', 'dayBg', 'nightText', 'dayText', 'fallbackProvider', 'suffix', 'sourceCredit'],
   'overlayPolicy.attribution'
  );
  if (p.attribution.visible !== undefined && typeof p.attribution.visible !== 'boolean') throw Error('overlayPolicy.attribution.visible must be boolean.');
  if (p.attribution.mode !== undefined && !['bar', 'compact'].includes(p.attribution.mode)) throw Error('overlayPolicy.attribution.mode must be bar or compact.');
  for (const key of ['font', 'nightBg', 'dayBg', 'nightText', 'dayText', 'fallbackProvider', 'suffix', 'sourceCredit']) {
   if (p.attribution[key] !== undefined && !shortString(p.attribution[key], 300)) throw Error(`Invalid overlayPolicy.attribution.${key}.`);
  }
  if (p.attribution.height !== undefined && !finite(p.attribution.height, 12, 200)) throw Error('Invalid overlayPolicy.attribution.height.');
 }
 if (p.renderer !== undefined) {
  validateAllowedKeys(p.renderer, ['relief', 'symbol'], 'overlayPolicy.renderer');
  if (p.renderer.relief !== undefined) {
   validateAllowedKeys(p.renderer.relief, ['exaggeration', 'shadowColor', 'highlightColor', 'accentColor'], 'overlayPolicy.renderer.relief');
   if (p.renderer.relief.exaggeration !== undefined && !finite(p.renderer.relief.exaggeration, 0, 5)) throw Error('Invalid overlayPolicy.renderer.relief.exaggeration.');
   for (const key of ['shadowColor', 'highlightColor', 'accentColor']) {
    if (p.renderer.relief[key] !== undefined && !shortString(p.renderer.relief[key], 64)) throw Error(`Invalid overlayPolicy.renderer.relief.${key}.`);
   }
  }
  if (p.renderer.symbol !== undefined) {
   validateAllowedKeys(p.renderer.symbol, ['font', 'strokeColor', 'lineWidth', 'fallbackFontFamily', 'fallbackBasePx'], 'overlayPolicy.renderer.symbol');
   for (const key of ['font', 'strokeColor', 'fallbackFontFamily']) {
    if (p.renderer.symbol[key] !== undefined && !shortString(p.renderer.symbol[key], 120)) throw Error(`Invalid overlayPolicy.renderer.symbol.${key}.`);
   }
   if (p.renderer.symbol.lineWidth !== undefined && !finite(p.renderer.symbol.lineWidth, 0, 20)) throw Error('Invalid overlayPolicy.renderer.symbol.lineWidth.');
   if (p.renderer.symbol.fallbackBasePx !== undefined && !finite(p.renderer.symbol.fallbackBasePx, 6, 200)) throw Error('Invalid overlayPolicy.renderer.symbol.fallbackBasePx.');
  }
 }
}
