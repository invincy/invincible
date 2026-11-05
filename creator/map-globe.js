// Public project/unproject round trips distinguish the front surface from its far side.
// Canvas fallback has no unproject and remains a flat preview.
export function locationVisible(map,position,projection){
 if(projection!=='globe'||!map.unproject)return true;
 const p=map.project(position);if(!Number.isFinite(p.x)||!Number.isFinite(p.y))return false;
 const actual=map.unproject(p),delta=((actual.lng-position[0]+180)%360+360)%360-180;
 return Math.abs(delta)<0.01&&Math.abs(actual.lat-position[1])<0.01;
}
export function surfacePosition(map,point,projection){
 const position=map.unproject(point);
 if(projection==='globe'){
  const p=map.project(position);
  if(Math.hypot(p.x-point[0],p.y-point[1])>2)throw Error('Choose a point on the globe surface.');
 }
 return position.toArray().map(n=>Number(n.toFixed(6)));
}
export function cameraPreset(project,map,sceneId,camera,kind){
 const scene=project.scenes.find(s=>s.id===sceneId);if(!scene||scene.duration<0.1)throw Error('Select a storyboard scene first.');
 const duration=scene.duration,wrap=n=>((n+180)%360+360)%360-180;
 const base={sceneId,center:[...camera.center],zoom:camera.zoom,bearing:camera.bearing,pitch:camera.pitch};
 const frames=kind==='orbit'?[0,1,2,3].map(i=>({...base,offset:duration*i/3,bearing:wrap(camera.bearing+i*120),easing:'linear'})):
 [{...base,offset:0,zoom:0,pitch:0,easing:'smooth'},{...base,offset:duration,zoom:Math.max(3,camera.zoom),pitch:Math.max(35,camera.pitch)}];
 const next=structuredClone(map);if(kind==='fly-in')next.projection='globe';next.camera=next.camera.filter(c=>c.sceneId!==sceneId);next.camera.push(...frames);return next;
}
