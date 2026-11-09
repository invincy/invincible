// Versioned snapshots: future defaults never rewrite saved projects.
import {defaultTerrain} from './map-style-library.js';
export const CLASSIC_PRESENTATION=Object.freeze({presetId:'creator-default',presetVersion:1,fontFamily:'"Noto Sans", system-ui, sans-serif',labelSize:56,secondaryLabelSize:48,textColor:'#F7F9FA',cardColor:'#101B2B',accentColor:'#D9B76E',cardOpacity:.86,cardRadius:20,padding:20,safeMargin:64,assetSize:220,fadeSeconds:.3,showDates:false});
export const DEFAULT_PRESENTATION=Object.freeze({...CLASSIC_PRESENTATION,presetId:'documentary-terrain',presetVersion:2,fontFamily:'"Invincible Sans", "Invincible Hindi", sans-serif',labelSize:56,secondaryLabelSize:48,regionalLabelSize:34,infoLabelSize:26,numberSize:80,cardColor:'#102027',accentColor:'#E1C65B',cardOpacity:.86,cardRadius:16,padding:14,safeMargin:64,safeTop:120,safeRight:172,safeBottom:330,fadeSeconds:.35,slidePixels:8,letterSpacing:1.2,routeWidth:3.5,routeSeconds:1.8,markerRadius:7,pulseSeconds:.65,haloWidth:3.5,labelStyle:'card',uppercase:true,captionsEnabled:false,autoCamera:true,reliefShadow:'#1B2A29',reliefHighlight:'#D6D8C1',reliefAccent:'#69774C',reliefStrength:.35});
export const PRESENTATION_PRESETS=Object.freeze({'creator-default':{name:'Classic cards',presentation:CLASSIC_PRESENTATION},'documentary-terrain':{name:'Documentary Terrain',presentation:DEFAULT_PRESENTATION}});
export const DEFAULT_MAP_SETTINGS=Object.freeze({aspectRatio:'9:16',theme:'night',projection:'mercator',basemap:'satellite',saturation:-.32,contrast:.10,bearing:0,pitch:0,easing:'smooth'});
export function validatePresentation(p){
 if(p===undefined)return;
 if(!p||typeof p!=='object'||Array.isArray(p)||!PRESENTATION_PRESETS[p.presetId]||p.presetVersion!==PRESENTATION_PRESETS[p.presetId].presentation.presetVersion)throw Error('Unsupported map presentation preset.');
 const keys=p.presetVersion===1?CLASSIC_PRESENTATION:DEFAULT_PRESENTATION;
 for(const k of Object.keys(p))if(!Object.hasOwn(keys,k))throw Error('Unsupported map presentation setting: '+k);
 if(typeof p.fontFamily!=='string'||!p.fontFamily.trim()||p.fontFamily.length>200)throw Error('Choose a font family.');
 for(const k of ['textColor','cardColor','accentColor',...(p.presetVersion===2?['reliefShadow','reliefHighlight','reliefAccent']:[])])if(!/^#[a-f\d]{6}$/i.test(p[k]))throw Error('Presentation colors must be #rrggbb.');
 const bounds=[['labelSize',24,160],['secondaryLabelSize',24,160],['cardRadius',0,80],['padding',0,80],['safeMargin',0,200],['assetSize',32,600],['fadeSeconds',0,3],['cardOpacity',0,1]];
 if(p.presetVersion===2)bounds.push(['regionalLabelSize',16,100],['infoLabelSize',16,100],['numberSize',32,160],['safeTop',0,400],['safeRight',0,300],['safeBottom',0,600],['slidePixels',0,40],['letterSpacing',0,6],['routeWidth',1,20],['routeSeconds',.1,10],['markerRadius',1,30],['pulseSeconds',0,2],['haloWidth',0,12],['reliefStrength',0,1]);
 for(const [k,min,max]of bounds)if(!Number.isFinite(p[k])||p[k]<min||p[k]>max)throw Error('Invalid presentation setting: '+k);
 for(const k of ['showDates',...(p.presetVersion===2?['uppercase','captionsEnabled','autoCamera']:[])])if(typeof p[k]!=='boolean')throw Error(k+' must be boolean.');
 if(p.presetVersion===2&&!['halo','card','callout'].includes(p.labelStyle))throw Error('Choose halo, card or callout labels.');
}
export function createDefaultMap(overrides={}){
 const base=PRESENTATION_PRESETS[overrides.presentation?.presetId]?.presentation||DEFAULT_PRESENTATION;const p={...base,...overrides.presentation};validatePresentation(p);
 return {version:1,theme:DEFAULT_MAP_SETTINGS.theme,projection:DEFAULT_MAP_SETTINGS.projection,events:[],features:{type:'FeatureCollection',features:[]},camera:[],cameraDefaults:{center:[80,23],zoom:3.2,bearing:DEFAULT_MAP_SETTINGS.bearing,pitch:DEFAULT_MAP_SETTINGS.pitch,easing:DEFAULT_MAP_SETTINGS.easing},...structuredClone(overrides),basemap:{id:DEFAULT_MAP_SETTINGS.basemap,labels:false,borders:false,saturation:DEFAULT_MAP_SETTINGS.saturation,contrast:DEFAULT_MAP_SETTINGS.contrast,...overrides.basemap},presentation:p,visual:{version:1,assets:[],layers:[],...structuredClone(overrides.visual),terrain:structuredClone(overrides.visual?.terrain??defaultTerrain())}};
}
export function applyPresentationPreset(map,id){if(!PRESENTATION_PRESETS[id])throw Error('Unknown presentation preset.');const next=structuredClone(map);next.presentation={...PRESENTATION_PRESETS[id].presentation};if(id==='documentary-terrain'){next.basemap={id:'satellite',labels:false,borders:false,saturation:DEFAULT_MAP_SETTINGS.saturation,contrast:DEFAULT_MAP_SETTINGS.contrast};next.visual??={version:1,layers:[],assets:[]};next.visual.terrain??=defaultTerrain();next.visual.terrain.enabled=true;}return next;}
// Existing map JSON is never migrated.
export function initializeMapProject(project){if(project.historicalMap)return false;project.historicalMap=createDefaultMap();project.aspectRatio??=DEFAULT_MAP_SETTINGS.aspectRatio;return true;}
export function imagePlacementCorners(map,position,image,width,height,size=DEFAULT_PRESENTATION.assetSize){
 const factor=Math.min(width,height)/1080,fit=size*factor/Math.max(image.width,image.height),w=image.width*fit,h=image.height*fit,p=map.project(position);
 return [[p.x-w/2,p.y-h/2],[p.x+w/2,p.y-h/2],[p.x+w/2,p.y+h/2],[p.x-w/2,p.y+h/2]].map(v=>map.unproject(v).toArray());
}
