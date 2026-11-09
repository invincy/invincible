// Central configuration for NEW projects. Saved snapshots never inherit future changes.
import {defaultTerrain} from './map-style-library.js';
export const DEFAULT_PRESENTATION = Object.freeze({presetId:'creator-default',presetVersion:1,fontFamily:'"Noto Sans", system-ui, sans-serif',labelSize:56,secondaryLabelSize:48,textColor:'#F7F9FA',cardColor:'#101B2B',accentColor:'#D9B76E',cardOpacity:.86,cardRadius:20,padding:20,safeMargin:64,assetSize:220,fadeSeconds:.3,showDates:false});
export const DEFAULT_MAP_SETTINGS = Object.freeze({aspectRatio:'9:16',theme:'night',projection:'mercator',basemap:'satellite',saturation:-.18,contrast:.08,bearing:0,pitch:0,easing:'smooth'});
export function validatePresentation(p){
 if(p===undefined)return;
 if(!p||typeof p!=='object'||Array.isArray(p)||p.presetId!=='creator-default'||p.presetVersion!==1)throw Error('Unsupported map presentation preset.');
 for(const k of Object.keys(p))if(!Object.hasOwn(DEFAULT_PRESENTATION,k))throw Error('Unsupported map presentation setting: '+k);
 if(typeof p.fontFamily!=='string'||!p.fontFamily.trim()||p.fontFamily.length>200)throw Error('Choose a font family.');
 for(const k of ['textColor','cardColor','accentColor'])if(!/^#[a-f\d]{6}$/i.test(p[k]))throw Error('Presentation colors must be #rrggbb.');
 for(const [k,min,max] of [['labelSize',24,160],['secondaryLabelSize',24,160],['cardRadius',0,80],['padding',0,80],['safeMargin',0,200],['assetSize',32,600],['fadeSeconds',0,3],['cardOpacity',0,1]])if(!Number.isFinite(p[k])||p[k]<min||p[k]>max)throw Error('Invalid presentation setting: '+k);
 if(typeof p.showDates!=='boolean')throw Error('showDates must be boolean.');
}
export function createDefaultMap(overrides={}){
 const p={...DEFAULT_PRESENTATION,...overrides.presentation};validatePresentation(p);
 return {version:1,theme:DEFAULT_MAP_SETTINGS.theme,projection:DEFAULT_MAP_SETTINGS.projection,events:[],features:{type:'FeatureCollection',features:[]},camera:[],cameraDefaults:{center:[80,23],zoom:3.2,bearing:DEFAULT_MAP_SETTINGS.bearing,pitch:DEFAULT_MAP_SETTINGS.pitch,easing:DEFAULT_MAP_SETTINGS.easing},...structuredClone(overrides),basemap:{id:DEFAULT_MAP_SETTINGS.basemap,labels:false,borders:false,saturation:DEFAULT_MAP_SETTINGS.saturation,contrast:DEFAULT_MAP_SETTINGS.contrast,...overrides.basemap},presentation:p,visual:{version:1,assets:[],layers:[],...structuredClone(overrides.visual),terrain:structuredClone(overrides.visual?.terrain??defaultTerrain())}};
}
// Existing map JSON is never migrated.
export function initializeMapProject(project){if(project.historicalMap)return false;project.historicalMap=createDefaultMap();project.aspectRatio??=DEFAULT_MAP_SETTINGS.aspectRatio;return true;}
export function imagePlacementCorners(map,position,image,width,height,size=DEFAULT_PRESENTATION.assetSize){
 const factor=Math.min(width,height)/1080,fit=size*factor/Math.max(image.width,image.height),w=image.width*fit,h=image.height*fit,p=map.project(position);
 return [[p.x-w/2,p.y-h/2],[p.x+w/2,p.y-h/2],[p.x+w/2,p.y+h/2],[p.x-w/2,p.y+h/2]].map(v=>map.unproject(v).toArray());
}
