export const planes = ['background', 'midground-back', 'midground-front', 'foreground'];
export const slots = {
 'top-banner': [.5,.13,.84,.09],
 'top-subtitle': [.5,.19,.8,.07],
 'bottom-left-stage': [.25,.66,.36,.32],
 'bottom-right-stage': [.75,.66,.36,.32],
 'center-stage': [.5,.5,.72,.48],
 'bottom-caption-safe': [.5,.76,.82,.08]
};
const definitions = {
 rain: {intensity:[.1,1],angle:[-89,89],speed:[.5,3]},
 lightning: {intensity:[.1,1]},
 'water-rise': {startProgress:[0,1],endProgress:[0,1],waveAmplitude:[0,.05],waveFrequency:[0,10]}
};
export function validateWeatherLayer(layer) {
 if(layer.slot!==undefined&&!Object.hasOwn(slots,layer.slot))throw Error('Unknown layout slot.');
 if(layer.zPlane!==undefined&&!planes.includes(layer.zPlane))throw Error('Unknown depth plane.');
 if(layer.type!=='effect'){
  if(layer.effectType!==undefined||layer.params!==undefined||layer.seed!==undefined)throw Error('Effect properties require an effect layer.');
  return;
 }
 if(!Object.hasOwn(definitions,layer.effectType))throw Error('Unknown procedural effect.');
 if(layer.seed!==undefined&&(!Number.isSafeInteger(layer.seed)||layer.seed<0||layer.seed>4294967295))throw Error('Effect seed must be an unsigned 32-bit integer.');
 const params=layer.params??{}, ranges=definitions[layer.effectType];
 if(typeof params!=='object'||Array.isArray(params))throw Error('Effect params must be an object.');
 for(const [key,value] of Object.entries(params)){
  if(Object.hasOwn(ranges,key)&&Number.isFinite(value)&&value>=ranges[key][0]&&value<=ranges[key][1])continue;
  if(key==='crestColor'&&layer.effectType==='water-rise'&&typeof value==='string'&&/^#[a-f0-9]{6}$/i.test(value))continue;
  throw Error('Invalid effect parameter: '+key);
 }
}
export function resolveOverlayLayout(layer) {
 if(!layer.slot)return layer;
 const [x,y,width,height]=slots[layer.slot];
 return {x,y,width,height,...layer};
}
export function orderOverlays(overlays) {
 if(!overlays.some(layer=>layer.zPlane||layer.type==='effect'))return overlays;
 const rank=layer=>planes.indexOf(layer.zPlane??(layer.effectType==='lightning'?'background':layer.type==='effect'?'midground-front':layer.type==='text'?'foreground':'midground-back'));
 return [...overlays].sort((a,b)=>rank(a)-rank(b));
}
const wrap = value => value-Math.floor(value);
function random(seed,index) {
 let value=Math.imul((seed+index+1)>>>0,0x9e3779b1);
 value=Math.imul(value^(value>>>16),0x85ebca6b);
 return ((value^(value>>>13))>>>0)/4294967296;
}
export function drawWeatherEffect(ctx,layer,time,duration) {
 const {width,height}=ctx.canvas, params=layer.params??{}, seed=layer.seed??0;
 const w=(layer.width??1)*width,h=(layer.height??1)*height;
 const elapsed=Math.max(0,time-(layer.startSeconds??0));
 ctx.save();
 try{
  ctx.globalAlpha*=layer.opacity;
  ctx.translate(layer.x*width,layer.y*height);
  ctx.rotate(layer.rotation*Math.PI/180);
  ctx.scale(layer.scale,layer.scale);
  ctx.translate(-w/2,-h/2);
  ctx.beginPath();ctx.rect(0,0,w,h);ctx.clip();
  if(layer.effectType==='water-rise'){
   const progress=Math.min(1,elapsed/((layer.endSeconds??duration)-(layer.startSeconds??0)));
   const start=params.startProgress??0,end=params.endProgress??1;
   const fill=start+(end-start)*progress;
   if(fill<=0)return;
   const wave=(params.waveAmplitude??.012)*h*Math.min(1,fill*10,(1-fill)*10);
   ctx.globalAlpha*=.58;
   ctx.beginPath();
   for(let i=0;i<=64;i++){
    const x=w*i/64,y=h*(1-fill)+wave*Math.sin(i/64*Math.PI*4-elapsed*(params.waveFrequency??2.5)*Math.PI*2);
    if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
   }
   ctx.strokeStyle=params.crestColor??'#65B7E6';ctx.lineWidth=4;ctx.stroke();
   ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();
   ctx.fillStyle=layer.color??'#1D9BF0';ctx.fill();
  }else if(layer.effectType==='rain'){
   const angle=(params.angle??-12)*Math.PI/180,speed=params.speed??1;
   const count=Math.round(60+120*((params.intensity??.65)-.1)/.9);
   const alpha=ctx.globalAlpha;
   ctx.strokeStyle=layer.color??'#93C5FD';
   for(let i=0;i<count;i++){
    const depth=random(seed,i*3), length=h*(.016+.045*depth);
    const drift=elapsed*speed*(.36+.48*depth);
    const x=wrap(random(seed,i*3+1)+drift*Math.sin(angle)*h/w)*w;
    const y=wrap(random(seed,i*3+2)+drift*Math.cos(angle))*h;
    ctx.globalAlpha=alpha*(.2+.55*depth);ctx.lineWidth=1+2*depth;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.sin(angle)*length,y+Math.cos(angle)*length);ctx.stroke();
   }
  }else{
   const phase=wrap(elapsed/2.8+random(seed,0)*.05)*2.8;
   if(phase>=.2)return;
   ctx.globalAlpha*=(1-phase/.2)*(params.intensity??.65);
   const glow=ctx.createRadialGradient(w*.5,0,0,w*.5,0,h*.85);
   glow.addColorStop(0,layer.color??'#E0F2FE');glow.addColorStop(1,'transparent');
   ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  }
 }finally{ctx.restore();}
}
