import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
// Bundled locally; MapLibre supplies the shared WebGL context and projection.
export function createModelLayer(id,placement,url,onError){
 let renderer,scene,camera,model,removed=false;
 const materials=[];
 function dispose(root){root.traverse(o=>{o.geometry?.dispose();for(const m of (Array.isArray(o.material)?o.material:[o.material]).filter(Boolean)){for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose();}});}
 return {id,type:'custom',renderingMode:'3d',visible:false,opacity:placement.opacity,get loaded(){return !!model;},
  onAdd(map,gl){this.map=map;scene=new THREE.Scene();camera=new THREE.Camera();scene.add(new THREE.HemisphereLight(0xffffff,0x334455,3));renderer=new THREE.WebGLRenderer({canvas:map.getCanvas(),context:gl});renderer.autoClear=false;
   new GLTFLoader().load(url,gltf=>{if(removed){dispose(gltf.scene);return;}model=gltf.scene;model.traverse(o=>{for(const m of (Array.isArray(o.material)?o.material:[o.material]).filter(Boolean)){m.transparent=true;if(!materials.some(item=>item.material===m))materials.push({material:m,opacity:m.opacity});}});scene.add(model);map.triggerRepaint();},undefined,()=>{if(!removed)onError(placement.name+': GLB could not load. Check HTTPS URL, CORS and embedded textures.');});
  },
  render(gl,args){if(!this.visible||!model)return;
   for(const item of materials)item.material.opacity=item.opacity*this.opacity;
   const [lng,lat]=placement.position,latitude=lat*Math.PI/180,scale=placement.scale/(40075016.68557849*Math.cos(latitude));
   const x=(lng+180)/360,y=(1-Math.log(Math.tan(Math.PI/4+latitude/2))/Math.PI)/2;
   const elevation=this.map.queryTerrainElevation(placement.position)||0,z=(placement.altitude+elevation)/(40075016.68557849*Math.cos(latitude));
   const transform=new THREE.Matrix4().makeTranslation(x,y,z).scale(new THREE.Vector3(scale,-scale,scale)).multiply(new THREE.Matrix4().makeRotationX(Math.PI/2)).multiply(new THREE.Matrix4().makeRotationY(placement.rotation*Math.PI/180));
   camera.projectionMatrix=new THREE.Matrix4().fromArray(args.defaultProjectionData.mainMatrix).multiply(transform);renderer.resetState();renderer.render(scene,camera);
  },
  onRemove(){removed=true;if(model)dispose(model);renderer?.dispose();}
 };
}

export {createStudioThree} from './studio-three-source.js';
