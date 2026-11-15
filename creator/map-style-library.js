// Physical imagery and modern reference cartography are deliberately distinct.
export const mapStyles = [
 {id:'physical',name:'Clean physical',description:'Simple coastline. Best for uncluttered historical overlays.',credit:'Natural Earth (public domain)',detail:'Generalized 1:110m coastline',preview:'physical.png'},
 {id:'terrain',name:'Vivid topography',description:'Detailed coloured elevation and mountain relief. No political borders.',credit:'NASA GIBS · ASTER GDEM / NASA–METI',detail:'ASTER relief tiles · up to zoom 12',preview:'terrain.png',raster:'ASTER_GDEM_Color_Shaded_Relief',level:12},
 {id:'satellite',name:'Natural Earth imagery',description:'Natural-colour global imagery for regional and country views.',credit:'NASA GIBS · Blue Marble',detail:'Global composite · up to zoom 8; not live imagery',preview:'satellite.png',raster:'BlueMarble_ShadedRelief_Bathymetry',level:8,referenceOverlay:true},
 {id:'atlas',name:'Detailed atlas',description:'Sharp vector roads and places. Modern reference cartography.',credit:'OpenFreeMap · © OpenMapTiles · © OpenStreetMap contributors',detail:'Modern vector tiles; labels and borders optional',preview:'atlas.png',styleUrl:'https://tiles.openfreemap.org/styles/liberty',modern:true}
];
export const styleFor = spec => mapStyles.find(s=>s.id===(spec.basemap?.id||'physical'));
export const defaultTerrain = () => ({enabled:true,tiles:['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],encoding:'terrarium',exaggeration:1.3,attribution:'Terrain: Mapzen / AWS · USGS SRTM/GMTED2010 · NOAA ETOPO1'});
async function loadAtlasStyle(){
 const preset=mapStyles.find(style=>style.id==='atlas');
 const response=await fetch(preset.styleUrl,{signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw Error('The atlas provider could not load. Choose another map or retry.');
 return response.json();
}
const isBoundary=layer=>/(boundary|admin)/i.test(layer.id+' '+(layer['source-layer']||''));
export function validateBasemap(map){
 if(map.basemap===undefined)return;
 const b=map.basemap;
 if(!b||!mapStyles.some(s=>s.id===b.id)||typeof b.labels!=='boolean'||typeof b.borders!=='boolean')throw Error('Choose a library map and explicit label/border visibility.');
 for(const key of ['saturation','contrast'])if(b[key]!==undefined&&!(typeof b[key]==='number'&&Number.isFinite(b[key])&&b[key]>=-1&&b[key]<=1))throw Error('Map saturation/contrast must be between −1 and 1.');
}
export async function baseStyle(spec){
 const preset=styleFor(spec);if(!preset)throw Error('Unknown map-library style.');
 if(preset.styleUrl){
  const style=await loadAtlasStyle();
  // Never silently present modern labels/borders as historical geography.
  style.layers=style.layers.filter(l=>(spec.basemap.labels||l.type!=='symbol')&&(spec.basemap.borders||!isBoundary(l)));
  style.projection={type:spec.projection||'mercator'};return style;
 }
 const night=spec.theme==='night',legacy=!spec.basemap;
 const style={version:8,projection:{type:spec.projection||'mercator'},sources:{},layers:[{id:'water',type:'background',paint:{'background-color':legacy?(night?'#101e2b':'#d8caaa'):(night?'#102d42':'#8dcce7')}}]};
 if(preset.raster){
  style.sources['library-imagery']={type:'raster',tiles:[`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${preset.raster}/default/GoogleMapsCompatible_Level${preset.level}/{z}/{y}/{x}.jpeg`],tileSize:256,minzoom:0,maxzoom:preset.level,attribution:preset.credit};
  style.layers.push({id:'library-imagery',type:'raster',source:'library-imagery',paint:{'raster-fade-duration':0,'raster-saturation':spec.basemap?.saturation??0.12,'raster-contrast':spec.basemap?.contrast??0.05}});
 }else{
  style.sources.land={type:'geojson',data:new URL('./history-data/land.geojson',import.meta.url).href,attribution:preset.credit};
  style.layers.push({id:'land',type:'fill',source:'land',paint:{'fill-color':legacy?(night?'#273f4e':'#a99f7f'):(night?'#487c86':'#9dcb8b')}});
 }
 if(preset.referenceOverlay&&(spec.basemap.labels||spec.basemap.borders)){
  const atlas=await loadAtlasStyle();
  const layers=atlas.layers.filter(layer=>layer.source&&(
   (spec.basemap.labels&&layer.type==='symbol'&&layer['source-layer']==='place')||
   (spec.basemap.borders&&layer.type==='line'&&isBoundary(layer))
  ));
  for(const sourceId of new Set(layers.map(layer=>layer.source)))style.sources[sourceId]=atlas.sources[sourceId];
  if(atlas.glyphs)style.glyphs=atlas.glyphs;
  if(atlas.sprite)style.sprite=atlas.sprite;
  style.layers.push(...layers.map(layer=>({...layer,id:'modern-reference-'+layer.id})));
 }
 return style;
}
