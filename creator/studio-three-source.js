import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {checkStudioGlb, MAX_TRIANGLES, stagePose} from './video-studio/three-scene.js';

function primitives(preset) {
 const model=new THREE.Group();
 function part(geometry,color,x,y,z){
  const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.8}));
  mesh.position.set(x,y,z);model.add(mesh);return mesh;
 }
 const box=(w,h,d,c,x,y,z)=>part(new THREE.BoxGeometry(w,h,d),c,x,y,z);
 const cylinder=(r1,r2,h,c,x,y,z)=>part(new THREE.CylinderGeometry(r1,r2,h,12),c,x,y,z);
 if(preset==='train'){
  box(2.45,.52,.66,0xeff7f5,-.15,.41,0);
  const nose=part(new THREE.SphereGeometry(.36,12,8),0xeff7f5,1.05,.39,0);
  nose.scale.set(1.12,.72,.92);
  box(2.4,.06,.67,0x1c6584,-.15,.31,0);
  for(const side of [-1,1]){
   for(let i=0;i<6;i++)box(.23,.14,.024,0x19384c,-1.13+i*.36,.49,side*.332);
   for(const x of [-.88,.72])cylinder(.14,.14,.10,0x202b39,x,.14,side*.26).rotation.x=Math.PI/2;
  }
  box(.26,.15,.59,0x28536a,1.04,.52,0);
 }else if(preset==='rocket'){
  cylinder(.26,.26,1.62,0xeaf1ef,0,1.13,0);
  cylinder(0,.26,.59,0xdb7949,0,2.23,0);
  cylinder(.26,.26,.13,0x274c63,0,1.46,0);
  for(let i=0;i<3;i++){
   const angle=i*2*Math.PI/3;
   box(.42,.43,.09,0x396c85,Math.cos(angle)*.33,.26,Math.sin(angle)*.33).rotation.y=-angle;
  }
 }else if(preset==='tree'){
  cylinder(.07,.11,.64,0x695444,0,.32,0);
  cylinder(0,.51,1.11,0x3d7663,0,1.0,0);
  cylinder(0,.38,.86,0x579176,0,1.4,0);
 }else box(1,1,1,0x568dad,0,.5,0);
 return model;
}

function disposeScene(root) {
 const resources=new Set();
 root.traverse(o=>{
  if(o.geometry)resources.add(o.geometry);
  for(const material of [o.material].flat().filter(Boolean)){
   resources.add(material);
   for(const value of Object.values(material))if(value?.isTexture)resources.add(value);
  }
 });
 for(const resource of resources){
  if(resource.isTexture)resource.source.data?.close?.();
  resource.dispose();
 }
}

async function importedModel(buffer) {
 checkStudioGlb(buffer);
 const {scene}=await new GLTFLoader().parseAsync(buffer,'');
 try{
  let triangles=0;
  scene.traverse(o=>{
   if(o.isLight){o.visible=false;return;}
   if(!o.isMesh)return;
   triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;
   for(const material of [o.material].flat()){
    for(const texture of Object.values(material).filter(value=>value?.isTexture)){
     if(Math.max(texture.image?.width??0,texture.image?.height??0)>2048) throw Error('Use GLB textures up to 2048 pixels.');
    }
   }
  });
  const bounds=new THREE.Box3().setFromObject(scene),size=bounds.getSize(new THREE.Vector3());
  if(!triangles||triangles>MAX_TRIANGLES||!Number.isFinite(size.length())||size.length()===0) throw Error('GLB exceeds the lightweight model budget or has no visible geometry.');
  const center=bounds.getCenter(new THREE.Vector3()),factor=2/Math.max(size.x,size.y,size.z);
  scene.position.sub(new THREE.Vector3(center.x,bounds.min.y,center.z));
  const model=new THREE.Group();model.add(scene);model.scale.setScalar(factor);
  return model;
 }catch(error){disposeScene(scene);throw error;}
}

export async function createStudioThree(data,width,height,loadModel,signal) {
 const stage=new THREE.Scene();
 const models=[];
 let renderer,keyLight;
 function destroy(){
  disposeScene(stage);
  keyLight?.shadow.dispose();
  renderer?.dispose();
  renderer?.forceContextLoss();
 }
 try{
  stage.background=new THREE.Color(data.background);
  stage.add(new THREE.HemisphereLight(0xf0f7ff,0x655949,2.15));
  keyLight=new THREE.DirectionalLight(0xffefd8,2.7);
  keyLight.position.set(-4,8,5);keyLight.castShadow=true;
  keyLight.shadow.mapSize.set(1024,1024);
  Object.assign(keyLight.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.1,far:26});
  keyLight.shadow.camera.updateProjectionMatrix();
  keyLight.shadow.bias=-.0004;keyLight.shadow.normalBias=.025;keyLight.shadow.intensity=.65;
  stage.add(keyLight);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(16,16),new THREE.MeshStandardMaterial({color:data.ground,roughness:1}));
  ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;stage.add(ground);
  for(const definition of data.models){
   signal?.throwIfAborted();
   const object=definition.preset?primitives(definition.preset):await importedModel(await loadModel(definition.assetId));
   const anchor=new THREE.Group();anchor.add(object);stage.add(anchor);
   signal?.throwIfAborted();
   object.traverse(mesh=>{if(mesh.isMesh){mesh.castShadow=true;mesh.receiveShadow=true;}});
   models.push({anchor,definition});
  }
  renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});
  renderer.setSize(width,height,false);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  const aspect=width/height,halfHeight=Math.max(3,2.7/aspect);
  const camera=new THREE.OrthographicCamera(-halfHeight*aspect,halfHeight*aspect,halfHeight,-halfHeight,.1,70);
  const radians=Math.PI/180;
  return {destroy,frame(time,duration){
   if(renderer.getContext().isContextLost())throw Error('The 3D renderer lost its graphics context. Try again after closing other heavy tabs.');
   const {yaw,tilt,zoom}=stagePose(data.camera,time,duration);
   const angle=yaw*radians,elevation=tilt*radians,reach=12*Math.cos(elevation);
   camera.position.set(Math.sin(angle)*reach,Math.sin(elevation)*12+.55,Math.cos(angle)*reach);
   camera.lookAt(0,.55,0);camera.zoom=zoom;camera.updateProjectionMatrix();
   for(const {anchor,definition} of models){
    const pose=stagePose(definition,time,duration);
    anchor.position.set(pose.x,pose.y,pose.z);anchor.rotation.y=pose.yaw*radians;anchor.scale.setScalar(pose.scale);
   }
   renderer.render(stage,camera);
   return renderer.domElement;
  }};
 }catch(error){destroy();throw error;}
}
