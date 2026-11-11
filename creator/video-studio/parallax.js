// Camera offsets are fractions of the frame. Depth 0 pins a layer to the screen.
export const DEFAULT_PARALLAX = Object.freeze({panX:.12, panY:0, zoom:1.08});

export function parallaxTransform(camera, depth, time, duration) {
 if (!camera || !depth) return {x:0, y:0, scale:1};
 const progress = Math.min(1, Math.max(0, time / duration));
 const travel = progress * progress * (3 - 2 * progress) * depth;
 return {x:-camera.panX * travel, y:-camera.panY * travel, scale:1 + (camera.zoom - 1) * travel};
}

export function projectLayer(pose, transform) {
 const {x,y,scale} = transform;
 if (x===0 && y===0 && scale===1) return pose;
 return {...pose, x:.5 + (pose.x - .5) * scale + x,
  y:.5 + (pose.y - .5) * scale + y, scale:pose.scale * scale};
}

export function trainTemplate(duration) {
 const layers = [];
 function shape(id,type,color,x,y,width,height,depth,travel=0) {
  const layer = {id,type,color,x,y,width,height,depth};
  if (travel) layer.keyframes = [{timeSeconds:0,x,easing:'smooth'},{timeSeconds:duration,x:x+travel}];
  layers.push(layer);
 }
 const oval = (id,...values) => shape(id,'circle',...values);
 const rect = (id,...values) => shape(id,'rectangle',...values);
 oval('sun','#fff1c6',.72,.24,.22,.124,.08);
 oval('far-hill','#7497ad',.18,.57,1.05,.36,.18);
 oval('ridge','#527f91',.75,.57,1.2,.31,.28);
 oval('near-hill','#476d77',.32,.69,1.45,.29,.46);
 rect('ground','#203f47',.5,.87,2,.47,.7);
 rect('ballast','#192b38',.5,.686,2,.043,.9);
 rect('rail','#91aab5',.5,.675,2,.006,.9);
 const travel = .84;
 const train = (id,type,color,x,y,w,h) => shape(id,type,color,x,y,w,h,.9,travel);
 train('nose','circle','#eef4f1',.001,.637,.24,.062);
 train('body','rectangle','#eef4f1',-.145,.637,.294,.062);
 train('stripe','rectangle','#336985',-.104,.649,.376,.007);
 for (let i=0;i<5;i++) train('window-'+i,'rectangle','#173547',-.264+i*.055,.631,.034,.014);
 train('cab','circle','#173547',.049,.625,.077,.018);
 oval('foreground-left','#142e38',.08,1,1.2,.23,1);
 oval('foreground-right','#183540',.93,1.04,.85,.25,1);
 return layers;
}
