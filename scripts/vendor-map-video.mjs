import {build} from 'esbuild';
import {copyFile,mkdir} from 'node:fs/promises';
await mkdir('creator/vendor',{recursive:true});
await build({stdin:{contents:"export {Output,Mp4OutputFormat,BufferTarget,CanvasSource,canEncodeVideo} from 'mediabunny';",resolveDir:process.cwd()},bundle:true,format:'esm',platform:'browser',minify:true,outfile:'creator/vendor/map-video.mjs'});
await copyFile('node_modules/mediabunny/LICENSE','creator/vendor/MEDIABUNNY-LICENSE.txt');
