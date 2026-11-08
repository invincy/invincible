// Pure, additive adapter for Panipat Historical Atlas V2 Storyboard.
// Compiles the external Panipat storyboard specification into the canonical Invincible project schema.

import {productionId, emptyMap, validateMap} from './history-model.js';
import {visualMap} from './map-editor-model.js';
import {defaultTerrain} from './map-style-library.js';

export const PANIPAT_DOC_TYPE = 'invincible.mapEditor.panipatStoryboard';
export const PANIPAT_VERSION = '2.0';
export const MASTER_AUDIO_DURATION = 151.248938;

// Verified audio phrase and silence boundaries aligned to Panipat.MP3
export const SYNCED_SCENE_BOUNDARIES = [
  {id: 'panipat_01_hook', start: 0.000, end: 9.800, cue: '1526, 1556, 1761 — three battles, one location'},
  {id: 'panipat_02_question', start: 9.800, end: 22.800, cue: 'Why was power repeatedly contested at Panipat? Kurukshetra nearby'},
  {id: 'panipat_03_geography', start: 22.800, end: 32.400, cue: 'Coincidence or geography? Look at northwest India'},
  {id: 'panipat_04_mountains', start: 32.400, end: 43.600, cue: 'Hindu Kush, Himalayas and Khyber Pass routes'},
  {id: 'panipat_05_commanders', start: 43.600, end: 53.000, cue: 'Babur in 1526 and Ahmad Shah Abdali in 1761'},
  {id: 'panipat_06_corridor', start: 53.000, end: 63.200, cue: 'Punjab to Delhi routes through Haryana and Panipat'},
  {id: 'panipat_07_constraints', start: 63.200, end: 75.200, cue: 'Yamuna and southwest arid terrain affected routes and logistics'},
  {id: 'panipat_08_gangetic', start: 75.200, end: 93.200, cue: 'Beyond Delhi: Ganga–Yamuna Doab and Gangetic Plains'},
  {id: 'panipat_09_logistics', start: 93.200, end: 105.400, cue: 'Large armies needed food, water, fodder, supplies'},
  {id: 'panipat_10_terrain', start: 105.400, end: 118.200, cue: 'Open terrain suitable for cavalry infantry artillery'},
  {id: 'panipat_11_delhi', start: 118.200, end: 127.600, cue: 'Panipat about 90 km north of Delhi; strategic position'},
  {id: 'panipat_12_three_battles', start: 127.600, end: 141.200, cue: 'Different rulers, armies and politics; Delhi and North India'},
  {id: 'panipat_13_conclusion', start: 141.200, end: 151.249, cue: 'Strategic corridor, geography and history brought armies together'}
];

// Verify if an input JSON is a Panipat Storyboard V2 spec
export function isPanipatStoryboard(data) {
  if (!data || typeof data !== 'object') return false;
  return data.documentType === PANIPAT_DOC_TYPE && String(data.version) === PANIPAT_VERSION;
}

// Inspect and validate the Panipat Storyboard
export function validatePanipatStoryboard(spec) {
  if (!isPanipatStoryboard(spec)) {
    throw new Error(`Expected documentType '${PANIPAT_DOC_TYPE}' version '${PANIPAT_VERSION}'.`);
  }
  if (!Array.isArray(spec.scenes) || spec.scenes.length !== 13) {
    throw new Error('Panipat storyboard must contain exactly 13 scenes.');
  }
  if (!spec.audio || Math.abs((spec.audio.durationSec || 0) - MASTER_AUDIO_DURATION) > 0.05) {
    throw new Error(`Master audio duration must be verified ${MASTER_AUDIO_DURATION}s.`);
  }
  if (spec.output?.aspectRatio !== '9:16' || spec.output?.orientation !== 'portrait') {
    throw new Error('Panipat storyboard deliverable requires 9:16 portrait orientation.');
  }
  return true;
}

// Build the compiled Invincible project from Panipat Storyboard V2
export function adaptPanipatStoryboard(spec, {assetPrefix = '/creator/history-data/panipat/'} = {}) {
  validatePanipatStoryboard(spec);

  const scenes = SYNCED_SCENE_BOUNDARIES.map((sync, index) => {
    const rawScene = spec.scenes[index] || {};
    const duration = Number((sync.end - sync.start).toFixed(3));
    return {
      id: sync.id,
      duration,
      voiceover: rawScene.narrationCue || sync.cue,
      visual: rawScene.visualIntent || sync.cue,
      productionMethods: ['Animated Maps'],
      voiceoverTimestamp: `${sync.start.toFixed(1)}–${sync.end.toFixed(1)}s`,
      completed: false,
      panipatSceneIndex: index + 1,
      designId: rawScene.designId || 'scene_' + (index + 1),
      cardPreset: rawScene.cardPreset || 'default',
      visualMode: rawScene.visualMode || 'geographic',
      unitFormationOverlay: !!rawScene.unitFormationOverlay,
      commanderRefs: rawScene.commanderRefs || [],
      battlePresets: rawScene.battlePresets || []
    };
  });

  const baseMap = {
    ...emptyMap(),
    theme: 'night',
    projection: 'mercator',
    basemap: {
      id: 'terrain',
      labels: false,
      borders: false,
      saturation: 0.15,
      contrast: 0.05
    }
  };

  // Camera presets tuned for 9:16 portrait viewport, strictly North-up
  const cameraConfigs = [
    // S1: Hook - Panipat close
    {sceneId: scenes[0].id, offset: 0, center: [76.97, 29.39], zoom: 7.2, bearing: 0, pitch: 20, easing: 'smooth'},
    {sceneId: scenes[0].id, offset: 6.0, center: [76.97, 29.39], zoom: 7.0, bearing: 0, pitch: 20, easing: 'smooth'},
    // S2: Question - pull out north to Kurukshetra
    {sceneId: scenes[1].id, offset: 0, center: [76.85, 29.75], zoom: 6.6, bearing: 0, pitch: 15, easing: 'smooth'},
    {sceneId: scenes[1].id, offset: 8.0, center: [76.85, 29.85], zoom: 6.4, bearing: 0, pitch: 15, easing: 'smooth'},
    // S3: Geography - widen to NW subcontinent
    {sceneId: scenes[2].id, offset: 0, center: [73.5, 31.0], zoom: 4.8, bearing: 0, pitch: 20, easing: 'smooth'},
    // S4: Mountains - Hindu Kush / Himalayas / Khyber approaches
    {sceneId: scenes[3].id, offset: 0, center: [70.8, 33.6], zoom: 5.2, bearing: 0, pitch: 25, easing: 'smooth'},
    {sceneId: scenes[3].id, offset: 6.0, center: [71.2, 33.8], zoom: 5.5, bearing: 0, pitch: 25, easing: 'smooth'},
    // S5: Commanders - Punjab wide previewing invader approaches
    {sceneId: scenes[4].id, offset: 0, center: [74.5, 31.5], zoom: 5.6, bearing: 0, pitch: 20, easing: 'smooth'},
    // S6: Strategic corridor Punjab - Haryana - Panipat - Delhi
    {sceneId: scenes[5].id, offset: 0, center: [76.5, 30.0], zoom: 6.0, bearing: 0, pitch: 15, easing: 'smooth'},
    // S7: Constraints - Yamuna & southwest arid terrain
    {sceneId: scenes[6].id, offset: 0, center: [76.8, 29.2], zoom: 6.2, bearing: 0, pitch: 15, easing: 'smooth'},
    // S8: Ganga-Yamuna Doab & Gangetic Plain fertile basin
    {sceneId: scenes[7].id, offset: 0, center: [79.5, 27.5], zoom: 5.4, bearing: 0, pitch: 20, easing: 'smooth'},
    {sceneId: scenes[7].id, offset: 10.0, center: [80.5, 26.8], zoom: 5.2, bearing: 0, pitch: 20, easing: 'smooth'},
    // S9: Logistics & Supplies
    {sceneId: scenes[8].id, offset: 0, center: [77.0, 29.5], zoom: 6.2, bearing: 0, pitch: 15, easing: 'smooth'},
    // S10: Battlefield Terrain & Formation morph demonstration
    {sceneId: scenes[9].id, offset: 0, center: [76.97, 29.39], zoom: 8.0, bearing: 0, pitch: 25, easing: 'smooth'},
    // S11: Delhi & Panipat Distance (~90 km)
    {sceneId: scenes[10].id, offset: 0, center: [77.10, 29.00], zoom: 6.8, bearing: 0, pitch: 15, easing: 'smooth'},
    // S12: Three battles comparison (Schematic mode)
    {sceneId: scenes[11].id, offset: 0, center: [76.97, 29.39], zoom: 7.0, bearing: 0, pitch: 0, easing: 'hold'},
    // S13: Outro - Pull back to corridor, resolve on Panipat
    {sceneId: scenes[12].id, offset: 0, center: [75.5, 30.0], zoom: 5.0, bearing: 0, pitch: 15, easing: 'smooth'},
    {sceneId: scenes[12].id, offset: 6.0, center: [76.97, 29.39], zoom: 6.8, bearing: 0, pitch: 15, easing: 'smooth'}
  ];

  baseMap.camera = cameraConfigs;

  // Relief lighting keys
  baseMap.lighting = [
    {sceneId: scenes[0].id, offset: 0, direction: 315, intensity: 0.45},
    {sceneId: scenes[3].id, offset: 0, direction: 330, intensity: 0.50},
    {sceneId: scenes[7].id, offset: 0, direction: 310, intensity: 0.40},
    {sceneId: scenes[12].id, offset: 0, direction: 315, intensity: 0.45}
  ];

  // Sourced historical event pins (official sources)
  const panipatGovSource = 'https://panipat.gov.in/first-battle/';
  const secondBattleSource = 'https://panipat.gov.in/second-battle/';
  const thirdBattleSource = 'https://panipat.gov.in/third-battle/';
  const asiSource = 'https://ignca.gov.in/Asi_data/38167.pdf';

  baseMap.events = [
    {
      id: 'panipat_locator',
      sceneId: scenes[0].id,
      offset: 0.5,
      label: 'Panipat',
      date: '1526 · 1556 · 1761',
      coordinates: [76.97, 29.39],
      sourceUrl: panipatGovSource,
      sourceNote: 'Government of Haryana Panipat Portal. Strategic focal point north of Delhi.'
    },
    {
      id: 'kurukshetra_locator',
      sceneId: scenes[1].id,
      offset: 0.5,
      label: 'Kurukshetra',
      date: 'Traditional epic & historic battlefield',
      coordinates: [76.85, 29.97],
      sourceUrl: panipatGovSource,
      sourceNote: 'Traditional association with historical contested plains north of Delhi.'
    },
    {
      id: 'khyber_locator',
      sceneId: scenes[3].id,
      offset: 0.5,
      label: 'Khyber Pass',
      date: 'Historic northwestern gateway',
      coordinates: [71.15, 34.10],
      sourceUrl: asiSource,
      sourceNote: 'Primary mountain corridor through the Safed Koh range connecting Kabul basin to Punjab.'
    },
    {
      id: 'delhi_locator',
      sceneId: scenes[5].id,
      offset: 0.5,
      label: 'Delhi',
      date: 'Imperial capital & political prize',
      coordinates: [77.21, 28.61],
      sourceUrl: panipatGovSource,
      sourceNote: 'Seat of Delhi Sultanate and Mughal Empire, approximately 90 km south of Panipat.'
    },
    {
      id: 'yamuna_locator',
      sceneId: scenes[6].id,
      offset: 0.5,
      label: 'Yamuna River',
      date: 'Eastern natural flank',
      coordinates: [77.05, 29.40],
      sourceUrl: thirdBattleSource,
      sourceNote: 'Major river acting as eastern boundary of the corridor and crucial water supply.'
    },
    {
      id: 'doab_locator',
      sceneId: scenes[7].id,
      offset: 0.5,
      label: 'Ganga–Yamuna Doab',
      date: 'Agricultural heartland',
      coordinates: [78.50, 27.80],
      sourceUrl: asiSource,
      sourceNote: 'Alluvial fertile plain between Ganga and Yamuna with dense population and revenue base.'
    }
  ];

  // Sourced GeoJSON features for illustrative corridors (routes & distance arc)
  baseMap.features = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          // Northwest invader route corridor: Kabul -> Peshawar -> Lahore -> Panipat -> Delhi
          coordinates: [
            [69.17, 34.53],
            [71.15, 34.10],
            [71.52, 34.01],
            [73.04, 33.68],
            [74.35, 31.52],
            [75.85, 30.90],
            [76.85, 29.97],
            [76.97, 29.39],
            [77.21, 28.61]
          ]
        },
        properties: {
          id: 'northwest_strategic_corridor',
          sceneId: scenes[3].id,
          offset: 0.2,
          duration: 9.0,
          label: 'Northwest Strategic Corridor (Illustrative)',
          date: '1526–1761',
          sourceUrl: asiSource,
          sourceNote: 'Broad historical communication corridor connecting Kabul to Delhi via Punjab. Illustrative path, not a singular road.',
          reviewed: true
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          // River Yamuna course through Haryana / Delhi
          coordinates: [
            [77.30, 30.40],
            [77.18, 29.95],
            [77.08, 29.40],
            [77.23, 28.65],
            [77.40, 28.15],
            [77.70, 27.50]
          ]
        },
        properties: {
          id: 'yamuna_river_line',
          sceneId: scenes[6].id,
          offset: 0.2,
          duration: 8.0,
          label: 'River Yamuna Course',
          date: 'Natural flank',
          sourceUrl: thirdBattleSource,
          sourceNote: 'Hydrological course of the Yamuna River bounding the Panipat battlefield corridor.',
          reviewed: true
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          // Panipat to Delhi direct distance arc (~90 km)
          coordinates: [
            [76.97, 29.39],
            [77.03, 29.20],
            [77.09, 29.00],
            [77.15, 28.80],
            [77.21, 28.61]
          ]
        },
        properties: {
          id: 'panipat_delhi_distance_arc',
          sceneId: scenes[10].id,
          offset: 0.2,
          duration: 6.0,
          label: 'Panipat–Delhi Distance (~90 km)',
          date: 'Strategic Buffer',
          sourceUrl: panipatGovSource,
          sourceNote: 'Direct route distance between Panipat battlefield and the imperial seat at Delhi.',
          reviewed: true
        }
      }
    ]
  };

  // Register commander and troop assets into visual.assets
  const rawCommanders = spec.assets?.commanders || {};
  const rawTroops = spec.assets?.troopIcons || {};

  const visualAssets = [];

  // Register commanders
  const commanderIds = {
    babur: {name: 'Babur (1526)', file: 'Panipat_Commanders/1526_Babur.png', facing: 'right'},
    ibrahim_lodi: {name: 'Ibrahim Lodi (1526)', file: 'Panipat_Commanders/1526_Ibrahim_Lodi.png', facing: 'left'},
    bairam_khan: {name: 'Bairam Khan (1556)', file: 'Panipat_Commanders/1556_Bairam_Khan.png', facing: 'right'},
    hemu: {name: 'Hemu (1556)', file: 'Panipat_Commanders/1556_Hemu.png', facing: 'left'},
    ahmad_shah_abdali: {name: 'Ahmad Shah Abdali (1761, Preview)', file: 'Panipat_Commanders/1761_Ahmad_Shah_Abdali_PREVIEW.png', facing: 'right', quality: 'preview'},
    sadashivrao_bhau: {name: 'Sadashivrao Bhau (1761)', file: 'Panipat_Commanders/1761_Sadashivrao_Bhau.png', facing: 'left'}
  };

  for (const [id, info] of Object.entries(commanderIds)) {
    const url = assetPrefix + info.file;
    visualAssets.push({
      id: 'commander_' + id,
      name: info.name,
      type: 'image',
      url,
      credit: 'Historical artistic interpretation, not verified likeness',
      quality: info.quality || 'standard',
      facing: info.facing
    });
  }

  // Register 13 troops & equipment
  const troopList = [
    {id: 'infantry_sword', name: 'Infantry (Sword)', file: 'Historical_Army_Assets/Infantry/infantry_sword.png', category: 'infantry'},
    {id: 'infantry_shield', name: 'Infantry (Shield)', file: 'Historical_Army_Assets/Infantry/infantry_shield.png', category: 'infantry'},
    {id: 'infantry_spear', name: 'Infantry (Spear)', file: 'Historical_Army_Assets/Infantry/infantry_spear.png', category: 'infantry'},
    {id: 'archer', name: 'Archer', file: 'Historical_Army_Assets/Infantry/archer.png', category: 'infantry'},
    {id: 'matchlock', name: 'Matchlock Gunner', file: 'Historical_Army_Assets/Infantry/matchlock.png', category: 'infantry'},
    {id: 'cavalry_sword', name: 'Cavalry (Sword)', file: 'Historical_Army_Assets/Cavalry/cavalry_sword.png', category: 'cavalry'},
    {id: 'cavalry_lancer', name: 'Cavalry (Lancer)', file: 'Historical_Army_Assets/Cavalry/cavalry_lancer.png', category: 'cavalry'},
    {id: 'cavalry_archer', name: 'Cavalry (Horse Archer)', file: 'Historical_Army_Assets/Cavalry/cavalry_archer.png', category: 'cavalry'},
    {id: 'war_elephant', name: 'War Elephant', file: 'Historical_Army_Assets/Elephants/war_elephant.png', category: 'equipment'},
    {id: 'command_elephant', name: 'Command Elephant', file: 'Historical_Army_Assets/Elephants/command_elephant.png', category: 'equipment'},
    {id: 'field_cannon', name: 'Field Cannon', file: 'Historical_Army_Assets/Artillery/field_cannon.png', category: 'equipment'},
    {id: 'heavy_cannon', name: 'Heavy Cannon', file: 'Historical_Army_Assets/Artillery/heavy_cannon.png', category: 'equipment'},
    {id: 'camel_zamburak', name: 'Camel Zamburak (Swivel Gun)', file: 'Historical_Army_Assets/Artillery/camel_zamburak.png', category: 'equipment'}
  ];

  for (const t of troopList) {
    visualAssets.push({
      id: 'troop_' + t.id,
      name: t.name,
      type: 'image',
      url: assetPrefix + t.file,
      credit: 'Panipat stylized 2D military miniature icon',
      category: t.category
    });
  }

  // Create visual layers
  const visualLayers = [];

  // Corridors & features in visual layers
  visualLayers.push({
    id: 'layer_northwest_corridor',
    kind: 'feature',
    ref: 'northwest_strategic_corridor',
    name: 'Northwest Strategic Corridor',
    visible: true,
    opacity: 0.9,
    color: '#D9B76E',
    sceneId: scenes[3].id,
    offset: 0.2,
    duration: 9.0,
    lineWidth: 3.5,
    dash: [4, 2],
    arrowhead: true,
    revealDuration: 7.0
  });

  visualLayers.push({
    id: 'layer_yamuna_river',
    kind: 'feature',
    ref: 'yamuna_river_line',
    name: 'River Yamuna (Eastern Flank)',
    visible: true,
    opacity: 0.85,
    color: '#72B7C8',
    sceneId: scenes[6].id,
    offset: 0.2,
    duration: 8.0,
    lineWidth: 3.0,
    dash: [],
    arrowhead: false,
    revealDuration: 5.0
  });

  visualLayers.push({
    id: 'layer_delhi_distance_arc',
    kind: 'feature',
    ref: 'panipat_delhi_distance_arc',
    name: 'Distance Arc: Panipat–Delhi',
    visible: true,
    opacity: 0.9,
    color: '#D9B76E',
    sceneId: scenes[10].id,
    offset: 0.2,
    duration: 6.0,
    lineWidth: 2.5,
    dash: [3, 2],
    arrowhead: true,
    revealDuration: 4.5
  });

  baseMap.visual = {
    version: 1,
    terrain: defaultTerrain(),
    assets: visualAssets,
    layers: visualLayers
  };

  // Attach rich Panipat Atlas metadata
  const panipatMetadata = {
    version: '2.0',
    audioFile: spec.audio?.file || 'Panipat.MP3',
    audioDuration: MASTER_AUDIO_DURATION,
    visualSystem: spec.visualSystem || {},
    formationRules: spec.formationRules || {
      subUnit: {icons: 4},
      mainUnit: {subUnits: 4, icons: 16},
      presets: {square: {rows: 4, columns: 4}, line: {rows: 2, columns: 8}}
    },
    militaryVisualModes: spec.militaryVisualModes || {},
    unitRendering: spec.unitRendering || {},
    battlePresets: spec.battlePresets || [],
    historicalCaveats: spec.historicalCaveats || [],
    historicalSourceNotes: spec.historicalSourceNotes || []
  };

  baseMap.panipat = panipatMetadata;

  const project = {
    title: 'Panipat — Three Battles That Shaped India',
    aspectRatio: '9:16',
    audio: {
      file: 'Panipat.MP3',
      path: assetPrefix + 'Panipat.MP3',
      duration: MASTER_AUDIO_DURATION
    },
    scenes,
    historicalMap: baseMap,
    productionClips: [],
    assets: visualAssets.map(a => ({
      id: a.id,
      name: a.name,
      type: 'Historical Asset',
      path: a.url,
      sceneIds: scenes.map(s => s.id),
      groupIds: [],
      status: 'Ready',
      notes: a.credit + (a.quality === 'preview' ? ' · PREVIEW QUALITY' : '')
    }))
  };

  validateMap(project.historicalMap, project);
  return project;
}
