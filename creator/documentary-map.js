// Default modern regional look, reused from the approved border-video v4.
// Geographic source notes and claim/administration distinctions stay in the data.
export const documentaryFlags = [
 {
  "id": "india-flag-map",
  "file": "india-map.png",
  "name": "India flag overlay",
  "corners": [
   [
    68.143403,
    37.054484
   ],
   [
    97.362253,
    37.054484
   ],
   [
    97.362253,
    6.745551
   ],
   [
    68.143403,
    6.745551
   ]
  ],
  "opacity": 0.18,
  "credit": "Government of India; Public domain; https://commons.wikimedia.org/wiki/File:Flag_of_India.svg; editorial geographic clipping, see Sources."
 },
 {
  "id": "pakistan-flag-map",
  "file": "pakistan-map.png",
  "name": "Pakistan flag overlay",
  "corners": [
   [
    65.5,
    34.5
   ],
   [
    75.359048,
    34.5
   ],
   [
    75.359048,
    23.694525
   ],
   [
    65.5,
    23.694525
   ]
  ],
  "opacity": 0.24,
  "credit": "User:Zscout370; Public domain; https://commons.wikimedia.org/wiki/File:Flag_of_Pakistan.svg; editorial geographic clipping, see Sources."
 },
 {
  "id": "china-flag-map",
  "file": "china-map.png",
  "name": "China flag overlay",
  "corners": [
   [
    77.5,
    38.8
   ],
   [
    84.5,
    38.8
   ],
   [
    84.5,
    33.3
   ],
   [
    77.5,
    33.3
   ]
  ],
  "opacity": 0.23,
  "credit": "Zeng Liansong; Public domain; https://commons.wikimedia.org/wiki/File:Flag_of_the_People%27s_Republic_of_China.svg; editorial geographic clipping, see Sources."
 },
 {
  "id": "bangladesh-flag-map",
  "file": "bangladesh-map.png",
  "name": "Bangladesh flag overlay",
  "corners": [
   [
    88.02179,
    26.623544
   ],
   [
    92.642851,
    26.623544
   ],
   [
    92.642851,
    20.738715
   ],
   [
    88.02179,
    20.738715
   ]
  ],
  "opacity": 0.23,
  "credit": "See File history below for details.; Public domain; https://commons.wikimedia.org/wiki/File:Flag_of_Bangladesh.svg; editorial geographic clipping, see Sources."
 },
 {
  "id": "myanmar-flag-map",
  "file": "myanmar-map.png",
  "name": "Myanmar flag overlay",
  "corners": [
   [
    92.17828,
    28.538466
   ],
   [
    99.2,
    28.538466
   ],
   [
    99.2,
    18.5
   ],
   [
    92.17828,
    18.5
   ]
  ],
  "opacity": 0.22,
  "credit": "Unknown authorUnknown author; Public domain; https://commons.wikimedia.org/wiki/File:Flag_of_Myanmar.svg; editorial geographic clipping, see Sources."
 }
];
export const documentaryLabels = [
 {
  "name": "India",
  "position": [
   80.5,
   22
  ],
  "scale": 0.95
 },
 {
  "name": "Pakistan",
  "position": [
   69.5,
   29.5
  ],
  "scale": 0.55
 },
 {
  "name": "China",
  "position": [
   88.5,
   35.5
  ],
  "scale": 0.65
 },
 {
  "name": "Nepal",
  "position": [
   84.3,
   28.5
  ],
  "scale": 0.5
 },
 {
  "name": "Bhutan",
  "position": [
   90.5,
   27.7
  ],
  "scale": 0.5
 },
 {
  "name": "Bangladesh",
  "position": [
   90.4,
   24
  ],
  "scale": 0.5
 },
 {
  "name": "Myanmar",
  "position": [
   94.5,
   21.8
  ],
  "scale": 0.5
 }
];
export const defaultBasemap = () => ({id:'documentary',labels:true,borders:true,saturation:0.3,contrast:0.12});
export async function addDocumentaryReference(style,{labels=true,borders=true}={}){
 for(const flag of documentaryFlags){
  const id='reference-'+flag.id;
  style.sources[id]={type:'image',url:new URL('./history-data/border-flags-v3/'+flag.file,import.meta.url).href,coordinates:flag.corners};
  style.layers.push({id,source:id,type:'raster',paint:{'raster-opacity':flag.opacity,'raster-fade-duration':0}});
 }
 if(borders){
  const response=await fetch(new URL('./history-data/documentary-borders.geojson',import.meta.url));
  if(!response.ok)throw Error('The default reference borders could not load.');
  const data=await response.json();
  for(const [i,feature] of data.features.entries()){
   const id='reference-border-'+i,p=feature.properties;
   style.sources[id]={type:'geojson',data:feature};
   style.layers.push({id,source:id,type:'line',paint:{'line-color':p.color,'line-width':p.width,'line-opacity':p.opacity,...(p.dash.length?{'line-dasharray':p.dash}:{})}});
  }
 }
 return style;
}
