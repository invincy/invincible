import {copyFile,mkdir} from 'node:fs/promises';
await mkdir('creator/vendor',{recursive:true});
for(const name of ['maplibre-gl.mjs','maplibre-gl-worker.mjs','maplibre-gl-shared.mjs','maplibre-gl.css'])await copyFile('node_modules/maplibre-gl/dist/'+name,'creator/vendor/'+name);
await copyFile('node_modules/maplibre-gl/LICENSE.txt','creator/vendor/MAPLIBRE-LICENSE.txt');
