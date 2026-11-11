export const BUILTIN_MODELS = ['train','rocket','tree','box'];
export const MAX_MODELS = 6;
export const MAX_MODEL_BYTES = 8 * 1024 * 1024;
export const MAX_TRIANGLES = 20_000;
export const CAMERA_FIELDS = {yaw:[-180,180],tilt:[10,80],zoom:[.6,2]};
export const MODEL_FIELDS = {x:[-5,5],z:[-5,5],y:[0,5],yaw:[-360,360],scale:[.1,3]};

export function modelMotion(id, source) {
 const pose = {x:0,z:0,y:0,yaw:0,scale:1};
 return {id, ...source, from:{...pose}, to:{...pose}};
}

export function trainStage() {
 const train = modelMotion('train',{preset:'train'});
 train.from.x = -1.3;
 train.to.x = 1.3;
 const tree = modelMotion('tree',{preset:'tree'});
 Object.assign(tree.from,{x:1.8,z:-2,scale:.55});
 Object.assign(tree.to,tree.from);
 return {background:'#b8d6e1',ground:'#688c7e',
  camera:{from:{yaw:27,tilt:19,zoom:1},to:{yaw:49,tilt:42,zoom:1.12}},
  models:[train,tree]};
}

function fields(value, expected, label) {
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!expected.includes(k))) throw Error('Invalid '+label+'.');
}

function pose(value, limits, label) {
 fields(value,Object.keys(limits),label);
 for(const [key,[min,max]] of Object.entries(limits)){
  if(!Number.isFinite(value[key])||value[key]<min||value[key]>max) throw Error(label+' '+key+' must be between '+min+' and '+max+'.');
 }
}

export function validateThreeScene(data, assets) {
 fields(data,['background','ground','camera','models'],'3D scene');
 for(const color of [data.background,data.ground]) if(typeof color!=='string'||!/^#[0-9a-f]{6}$/i.test(color)) throw Error('Choose valid 3D stage colors.');
 fields(data.camera,['from','to'],'3D camera');
 for(const end of ['from','to']) pose(data.camera[end],CAMERA_FIELDS,'Camera');
 if(!Array.isArray(data.models)||data.models.length>MAX_MODELS) throw Error('Use up to '+MAX_MODELS+' models per 3D scene.');
 const ids=new Set();
 for(const model of data.models){
  fields(model,['id','preset','assetId','from','to'],'3D model');
  if(typeof model.id!=='string'||!model.id||model.id.length>150||ids.has(model.id)) throw Error('3D model IDs must be unique.');
  ids.add(model.id);
  if(model.assetId!==undefined){
   if(model.preset!==undefined||!assets.has(model.assetId)) throw Error('Choose one registered GLB model.');
  }else if(!BUILTIN_MODELS.includes(model.preset)) throw Error('Choose a supported 3D model.');
  for(const end of ['from','to']) pose(model[end],MODEL_FIELDS,'Model');
 }
}

export function stagePose(motion,time,duration) {
 const p=Math.min(1,Math.max(0,time/duration));
 const eased=p*p*(3-2*p);
 return Object.fromEntries(Object.entries(motion.from).map(([key,start])=>[key,start+(motion.to[key]-start)*eased]));
}

// Allow static, self-contained GLB only. Check limits before the loader allocates GPU resources.
export function checkStudioGlb(buffer) {
 if(buffer.byteLength<20||buffer.byteLength>MAX_MODEL_BYTES) throw Error('Use a self-contained GLB up to 8 MB.');
 const view=new DataView(buffer);
 const length=view.getUint32(12,true);
 if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||
    view.getUint32(8,true)!==buffer.byteLength||view.getUint32(16,true)!==0x4e4f534a||
    length>buffer.byteLength-20||length>1024*1024) throw Error('Invalid GLB file.');
 const data=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,20,length)));
 const {nodes=[],accessors=[],meshes=[],images=[],buffers=[]}=data;
 if(![nodes,accessors,meshes,images,buffers].every(Array.isArray)) throw Error('Invalid GLB structure.');
 if(data.animations?.length||data.skins?.length||data.extensionsRequired?.length||
    nodes.length>128||meshes.length>64||images.length>4||buffers.length!==1||
    buffers.some(buffer=>buffer.uri!==undefined)||images.some(image=>image.uri!==undefined||image.bufferView===undefined)){
  throw Error('Use a static GLB with embedded textures and no required extensions.');
 }
 const parents=new Set(),visited=new Set();
 for(const node of nodes){
  for(const child of node.children??[]){
   if(!Number.isInteger(child)||!nodes[child]||parents.has(child)) throw Error('Use a simple GLB model hierarchy.');
   parents.add(child);
  }
 }
 function visit(index){
  visited.add(index);
  for(const child of nodes[index].children??[])visit(child);
 }
 nodes.forEach((_,index)=>{if(!parents.has(index))visit(index);});
 if(visited.size!==nodes.length) throw Error('GLB model hierarchy contains a cycle.');
 let triangles=0;
 for(const node of nodes){
  if(node.mesh===undefined) continue;
  const primitives=meshes[node.mesh]?.primitives;
  if(!primitives?.length) throw Error('GLB mesh has no triangles.');
  for(const primitive of primitives){
   const positions=accessors[primitive.attributes?.POSITION]?.count;
   const count=accessors[primitive.indices??primitive.attributes?.POSITION]?.count;
   if(!Number.isSafeInteger(positions)||positions<3||positions>MAX_TRIANGLES*3)throw Error('GLB vertex count is outside the lightweight budget.');
   if((primitive.mode??4)!==4||!Number.isSafeInteger(count)||count<3||count%3||primitive.targets?.length) throw Error('Use static triangle meshes.');
   triangles+=count/3;
  }
 }
 if(!triangles||triangles>MAX_TRIANGLES) throw Error('Use a GLB with at most 20,000 triangles.');
 return triangles;
}
