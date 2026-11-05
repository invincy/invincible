import {build} from 'esbuild';
import {copyFile} from 'node:fs/promises';
await build({entryPoints:['creator/map-model-source.js'],bundle:true,format:'esm',minify:true,outfile:'creator/vendor/map-model.mjs'});
await copyFile('node_modules/three/LICENSE','creator/vendor/THREE-LICENSE.txt');
