// Independent all-stream decode and sample-level checks of the actual exported files.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),ffmpeg=process.env.FFMPEG||'ffmpeg',report=[];
function run(args){const r=cp.spawnSync(ffmpeg,args,{cwd:root,maxBuffer:100*1024*1024,windowsHide:true});if(r.error)throw r.error;assert.equal(r.status,0,r.stderr.toString());return r;}
function pcm(file,duration){return run(['-v','error','-i',file,...(duration?['-t',String(duration)]:[]),'-vn','-ac','1','-ar','48000','-f','f32le','pipe:1']).stdout;}
for(const [name,seconds,frames] of [['two-maps',2,60],['multi-editor',5,150],['panipat-two-maps',620/30,620]]){
 const file='.test-output/creator-studio-'+name+'.mp4';if(!fs.existsSync(path.join(root,file))){if(name==='panipat-two-maps')continue;throw Error('Missing proof: '+file);}
 const decoded=run(['-hide_banner','-i',file,'-map','0','-f','null','-']),log=decoded.stderr.toString();assert.match(log,/1080x1920/);assert.match(log,/30 fps/);assert.match(log,/Audio: (aac|opus)/);assert.match(log,new RegExp('frame=\\s*'+frames+'\\b'));
 const audio=pcm(file),samples=audio.length/4;let energy=0,onset=-1;for(let i=0;i<samples;i+=240){let power=0;for(let n=i;n<Math.min(samples,i+240);n++){const a=audio.readFloatLE(n*4);power+=a*a;}energy+=power;if(onset<0&&Math.sqrt(power/240)>.05)onset=i/48000;}assert.ok(energy>100,'Audible exported track');if(name==='two-maps')assert.ok(Math.abs(onset-.3)<1/30,'Synthetic audio cue differs by more than one frame');
 const times=name==='panipat-two-maps'?[.5,3,9.5,10.5,15,20]:name==='two-maps'?[.1,.8,1.1,1.8]:[.1,1.1,1.8,2.1,3.2,4.2,4.7],hashes=times.map(t=>crypto.createHash('sha256').update(run(['-v','error','-ss',String(t),'-i',file,'-frames:v','1','-vf','scale=32:32','-pix_fmt','rgb24','-f','rawvideo','pipe:1']).stdout).digest('hex'));
 assert.equal(new Set(hashes).size,hashes.length,'Motion/scenes must decode to distinct frames');const entry={file,seconds,frames,width:1080,height:1920,fps:30,onset,energy,visualTimes:times,visualHashes:hashes};
 if(name==='panipat-two-maps'){
  const original=pcm('.test-output/panipat-original.mp3',20.66);let best={lag:0,correlation:-1};for(let lag=-1600;lag<=1600;lag+=4){let dot=0,aa=0,bb=0;for(let n=48000;n<Math.min(samples,original.length/4)-48000;n+=53){const idx=n+lag;if(idx<0||idx>=samples)continue;const a=original.readFloatLE(n*4),b=audio.readFloatLE(idx*4);dot+=a*b;aa+=a*a;bb+=b*b;}const correlation=dot/Math.sqrt(aa*bb);if(correlation>best.correlation)best={lag,correlation};}assert.ok(best.correlation>.95,'Narration must retain source content/speed');assert.ok(Math.abs(best.lag)<1600,'Narration alignment within one frame');entry.sourceComparison={...best,lagSeconds:best.lag/48000,originalSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'.test-output/panipat-original.mp3'))).digest('hex')};
 }
 report.push(entry);
}
fs.writeFileSync(path.join(root,'.test-output/creator-studio-decode-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.map(({file,frames,onset,sourceComparison})=>({file,frames,onset,sourceComparison})),null,2));
