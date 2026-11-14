export function directorDraftMatchesManifest(manifest,scenes){
 if(!manifest||!Array.isArray(manifest.scenes)||!Array.isArray(scenes)||manifest.scenes.length!==scenes.length)return false;
 const close=(a,b)=>Number.isFinite(Number(a))&&Number.isFinite(Number(b))&&Math.abs(Number(a)-Number(b))<.002;
 return scenes.every((source,index)=>{
  const saved=manifest.scenes[index],start=Number(source.startSeconds),end=Number(source.endSeconds),expectedEngine=source.mapAnimation?'map':(source.canvasScene||source.contextCard===true)?'graphic':null;
  return !!saved&&String(saved.id)===String(source.id)&&expectedEngine===saved.engineType&&close(saved.startSeconds,start)&&close(saved.durationSeconds,end-start);
 });
}
