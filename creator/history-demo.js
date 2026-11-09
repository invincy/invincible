import {makeScene} from './storyboard-model.js?v=3';
import {emptyMap} from './history-model.js?v=2026110901';
import {safeRelativeAssetPath} from './map-editor-model.js?v=2026110901';
import {registerMapOverlayPlugin} from './history-player.js?v=2026110901';

export const archiveSource='https://commons.wikimedia.org/wiki/File:India1765and1805b.jpg';
const exportIdentifierPattern=/^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
const dynamicImport=specifier=>import(specifier);

function resolveDemoAssetUrl(relativeOrSitePath){
 if(!safeRelativeAssetPath(relativeOrSitePath))throw Error('Demo catalog path must stay within this creator directory.');
 return new URL(relativeOrSitePath,import.meta.url).href;
}

export async function loadDemoCatalog(catalogUrl=new URL('./history-data/demos.json',import.meta.url)){
 const response=await fetch(catalogUrl);
 if(!response.ok)throw Error('Unable to load demo catalog.');
 const data=await response.json();
 if(data?.format!=='invincible-map-demos'||data.version!==1||!Array.isArray(data.demos))throw Error('Invalid map demo catalog format.');
 return data.demos;
}

export async function loadDemoProject(demoId,{catalogUrl}={}){
 const demos=await loadDemoCatalog(catalogUrl);
 const entry=demos.find(item=>item.id===demoId);
 if(!entry)throw Error(`Unknown demo project: ${demoId}`);
 if(entry.builtIn&&entry.id==='british-india')return {entry,project:britishIndiaDemo()};
 if(entry.pluginModule){
  const mod=await dynamicImport(resolveDemoAssetUrl(entry.pluginModule));
  const exportName=entry.pluginExport||'default';
  if(!exportIdentifierPattern.test(exportName)||!mod?.[exportName])throw Error('Invalid demo overlay plugin export.');
  registerMapOverlayPlugin(entry.pluginId||entry.id,mod[exportName]);
 }
 let raw=null;
 if(entry.projectUrl){
  const response=await fetch(resolveDemoAssetUrl(entry.projectUrl));
  if(!response.ok)throw Error(`Unable to load demo project data for ${entry.id}.`);
  raw=await response.json();
 }
 let project=raw;
 if(entry.adapterModule){
  const mod=await dynamicImport(resolveDemoAssetUrl(entry.adapterModule));
  const exportName=entry.adapterExport||'default';
  if(!exportIdentifierPattern.test(exportName)||typeof mod?.[exportName]!=='function')throw Error('Invalid demo adapter export.');
  project=await mod[exportName](raw,entry);
 }
 if(!project||!Array.isArray(project.scenes))throw Error(`Demo project ${entry.id} did not produce a valid storyboard.`);
 return {entry,project};
}

export function britishIndiaDemo(){
 const scenes=[
 ['Trading settlements','Company के trading bases थे Bombay, Madras और Calcutta।','1709–1756',[79,21],3.4],
 ['Plassey','1757 में Plassey की जीत ने Bengal में Company की power बढ़ाई।','23 June 1757',[88.25,23.8],6],
 ['Buxar','1764 में Buxar की जीत ने Company की position और मजबूत की।','1764',[83.98,25.56],6],
 ['Diwani grant','1765 में Diwani मिली — Bengal से revenue collect करने का अधिकार। यह पूरे India की sovereignty नहीं थी।','1765',[87,24],4.5]
 ].map(([title,voiceover,date,center,zoom])=>makeScene({duration:8,voiceover,visual:title,productionMethods:['Animated Maps'],demoDate:date,demoCenter:center,demoZoom:zoom}));
 const map=emptyMap();
 map.camera=scenes.map(s=>({sceneId:s.id,offset:0,center:s.demoCenter,zoom:s.demoZoom}));
 const event=(id,scene,label,date,coordinates,sourceUrl,sourceNote)=>({id,sceneId:scenes[scene].id,offset:0,label,date,coordinates,sourceUrl,sourceNote});
 const factories='https://searcharchives.bl.uk/catalog/032-000173250',plassey='https://www.nam.ac.uk/explore/battle-plassey';
 map.events=[
 event('bombay',0,'Bombay','1709–1756',[72.83,18.94],factories,'British Library IOR/G describes the three presidential bases during 1709–1765. Approximate city-centre locator, not factory footprint.'),
 event('madras',0,'Madras','1709–1756',[80.28,13.08],factories,'Same archival series; approximate city locator, not territorial boundary.'),
 event('calcutta',0,'Calcutta','1709–1756',[88.35,22.57],factories,'Same archival series; approximate city locator.'),
 event('plassey',1,'Battle of Plassey','23 June 1757',[88.25,23.8],plassey,'National Army Museum dates the battle to 23 June 1757. Approximate locality, not battlefield geometry.'),
 event('buxar',2,'Battle of Buxar','1764',[83.98,25.56],'https://censusindia.gov.in/nada/index.php/catalog/44092/download/47754/DH_10_2001_BHOJPUR.pdf','Census of India, Bhojpur district handbook, identifies the battle in 1764. Year precision retained; approximate Buxar city locator.'),
 event('diwani',3,'Diwani: revenue rights','1765',[87,24],plassey,'Museum describes the 1765 right to collect Bengal tax/customs revenue. Regional label anchor only; no claimed grant boundary.')
 ];
 return {title:'How the British Took Over India',scenes,historicalMap:map,productionClips:[],assets:[{id:'archive-1765-1805',name:'India, 1765 and 1805 — historical territorial reference',type:'Reference',path:archiveSource,sceneIds:[scenes[3].id],groupIds:[],status:'Ready',notes:'Imperial Gazetteer, 1907, Edinburgh Geographical Institute. Public domain scan. Retrospective colonial source, not an event-by-event GIS dataset. Boundaries must be reviewed and digitised before geographic animation.'}]};
}
