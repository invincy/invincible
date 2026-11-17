import test from 'node:test';
import assert from 'node:assert/strict';
import {newStudioVideo} from '../creator/video-studio/composition.js';
import {validateManifest} from '../creator/video-studio/model.js';
import {BUILTIN_STYLE_PRESETS,applyStylePreset,applyStyleToMapProject,getStylePreset,inferStyleRole,listStylePresets,resolveSceneStyle,updateSavedStylePreset} from '../creator/video-studio/style-presets.js';

const scene=()=>({id:'history-scene',name:'Panipat regression',startSeconds:0,durationSeconds:4,engineType:'map',engineData:{project:{scenes:[{id:'map-source',duration:4}],historicalMap:{version:1,theme:'night',projection:'mercator',events:[],features:{type:'FeatureCollection',features:[]},camera:[],basemap:{id:'satellite',labels:false,borders:false,saturation:-.55,contrast:-.1},visual:{version:1,assets:[],layers:[]}}},sourceStart:0},overlays:[{id:'commander-left',type:'image',assetId:'commander',x:.25,y:.64,width:.32,height:.36,styleRole:'portrait'},{id:'battle-title',type:'text',text:'SECOND BATTLE OF PANIPAT',x:.5,y:.16,width:.82,height:.12,styleRole:'title'}],transition:{type:'cut',durationSeconds:0}});
const manifest=()=>({...newStudioVideo(),assets:[{id:'commander',name:'Commander',url:'https://example.test/commander.png'}],scenes:[scene()]});

test('curated visual styles are small, coherent and led by History and Geography',()=>{
 assert.deepEqual(BUILTIN_STYLE_PRESETS.map(item=>item.category),['History','Geography','Science','Finance']);
 assert.equal(new Set(BUILTIN_STYLE_PRESETS.map(item=>item.id)).size,4);
 for(const preset of BUILTIN_STYLE_PRESETS){assert.match(preset.tokens.palette.accent,/^#[0-9A-F]{6}$/i);assert.ok(preset.tokens.typography.labelSize>=48);}
});

test('preset inheritance preserves map, timing, layout and renderer type',()=>{
 const original=manifest(),next=applyStylePreset(original,'history-archive-gold',{sceneId:'history-scene'});
 assert.equal(next.scenes[0].visualStylePresetId,'history-archive-gold');
 for(const key of ['id','startSeconds','durationSeconds','engineType','engineData','overlays'])assert.deepEqual(next.scenes[0][key],original.scenes[0][key]);
 const resolved=resolveSceneStyle(next,next.scenes[0],next.scenes[0].overlays[1]);assert.equal(resolved.id,'history-archive-gold');assert.equal(resolved.tokens.plate.enabled,true);
 assert.equal(inferStyleRole(next.scenes[0].overlays[0]),'portrait');assert.equal(inferStyleRole(next.scenes[0].overlays[1]),'title');
 assert.doesNotThrow(()=>validateManifest(next));
});

test('user presets validate, inherit a curated base and survive manifest validation',()=>{
 let value=manifest();value=updateSavedStylePreset(value,{id:'user-panipat-archive',name:'Panipat archive',category:'History',description:'Project-specific historical treatment.',baseId:'history-archive-gold',tokens:{palette:{accent:'#E0BC65'},map:{contrast:.3,labelStyle:'card'}}});
 value=applyStylePreset(value,'user-panipat-archive');assert.equal(value.visualStylePresetId,'user-panipat-archive');assert.equal(getStylePreset(value,'user-panipat-archive').tokens.palette.background,'#090F18');assert.equal(getStylePreset(value,'user-panipat-archive').tokens.palette.accent,'#E0BC65');assert.equal(listStylePresets(value).length,5);assert.doesNotThrow(()=>validateManifest(value));
 assert.throws(()=>updateSavedStylePreset(value,{id:'bad',name:'Bad',category:'History',description:'Bad preset',baseId:'history-archive-gold',tokens:{map:{contrast:2}}}),/start with user-|preset IDs/);
});

test('historical map treatment removes muddy contrast without changing geography',()=>{
 const value=applyStylePreset(manifest(),'history-archive-gold'),style=resolveSceneStyle(value,value.scenes[0]),source=value.scenes[0].engineData.project,styled=applyStyleToMapProject(source,style);
 assert.deepEqual(styled.scenes,source.scenes);assert.deepEqual(styled.historicalMap.features,source.historicalMap.features);assert.deepEqual(styled.historicalMap.camera,source.historicalMap.camera);
 assert.equal(styled.historicalMap.basemap.saturation,-.18);assert.equal(styled.historicalMap.basemap.contrast,.24);assert.equal(styled.historicalMap.presentation.labelStyle,'card');assert.equal(styled.historicalMap.presentation.cardColor,'#101B2B');assert.equal(styled.historicalMap.presentation.accentColor,'#D6B25E');
});

test('legacy manifests need no migration and render exactly as before until a preset is applied',()=>{
 const value=manifest();assert.equal(value.visualStylePresetId,undefined);assert.equal(resolveSceneStyle(value,value.scenes[0]),null);assert.doesNotThrow(()=>validateManifest(value));
});
