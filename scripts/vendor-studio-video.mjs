import {build} from 'esbuild';
// Keep Map Editor's pinned bundle byte-for-byte unchanged.
await build({stdin:{contents:"export {Output,Mp4OutputFormat,BufferTarget,CanvasSource,AudioSampleSource,AudioSample,canEncodeVideo,canEncodeAudio} from 'mediabunny';",resolveDir:process.cwd()},bundle:true,format:'esm',platform:'browser',minify:true,outfile:'creator/vendor/studio-video.mjs'});
