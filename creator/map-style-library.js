import {addDocumentaryReference} from './documentary-map.js';
// Physical imagery and modern reference cartography are deliberately distinct.
export const mapStyles = [
 {id:'documentary',name:'Our default map',description:'Satellite map with country overlays, white reference borders and country names.',credit:'NASA GIBS · Blue Marble / Natural Earth',detail:'Modern regional reference · claims and administration differ',preview:'documentary.png',raster:'BlueMarble_ShadedRelief_Bathymetry',level:8,modern:true,documentary:true},
 {id:'physical',name:'Clean physical',description:'Simple coastline. Best for uncluttered historical overlays.',credit:'Natural Earth (public domain)',detail:'Generalized 1:110m coastline',preview:'physical.png'},
 {id:'terrain',name:'Vivid topography',description:'Detailed coloured elevation and mountain relief. No political borders.',credit:'NASA GIBS · ASTER GDEM / NASA–METI',detail:'ASTER relief tiles · up to zoom 12',preview:'terrain.png',raster:'ASTER_GDEM_Color_Shaded_Relief',level:12},
 {id:'satellite',name:'Natural Earth imagery',description:'Natural-colour global imagery for regional and country views.',credit:'NASA GIBS · Blue Marble',detail:'Global composite · up to zoom 8; not live imagery',preview:'satellite.png',raster:'BlueMarble_ShadedRelief_Bathymetry',level:8},
 {id:'atlas',name:'Detailed atlas',description:'Sharp vector roads and places. Modern reference cartography.',credit:'OpenFreeMap · © OpenMapTiles · © OpenStreetMap contributors',detail:'Modern vector tiles; labels and borders optional',preview:'atlas.png',styleUrl:'https://tiles.openfreemap.org/styles/liberty',modern:true}
];
export const styleFor = spec => mapStyles.find(s=>s.id===(spec.basemap?.id||'physical'));
export const defaultTerrain = () => ({enabled:true,tiles:['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],encoding:'terrarium',exaggeration:1.3,attribution:'Terrain: Mapzen / AWS · USGS SRTM/GMTED2010 · NOAA ETOPO1'});
export function validateBasemap(map){
 if(map.basemap===undefined)return;
 const b=map.basemap;
 if(!b||!mapStyles.some(s=>s.id===b.id)||typeof b.labels!=='boolean'||typeof b.borders!=='boolean')throw Error('Choose a library map and explicit label/border visibility.');
 for(const key of ['saturation','contrast'])if(b[key]!==undefined&&!(typeof b[key]==='number'&&Number.isFinite(b[key])&&b[key]>=-1&&b[key]<=1))throw Error('Map saturation/contrast must be between −1 and 1.');
}
export async function baseStyle(spec){
 const preset=styleFor(spec);if(!preset)throw Error('Unknown map-library style.');
 if(preset.styleUrl){
  const response=await fetch(preset.styleUrl);if(!response.ok)throw Error('The atlas provider could not load. Choose another map or retry.');
  const style=await response.json();
  // Never silently present modern labels/borders as historical geography.
  style.layers=style.layers.filter(l=>(spec.basemap.labels||l.type!=='symbol')&&(spec.basemap.borders||!/(boundary|admin)/i.test(l.id+' '+(l['source-layer']||''))));
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
 return preset.documentary?addDocumentaryReference(style,spec.basemap):style;
}
