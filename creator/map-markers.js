// Optional, resolution-independent location emblems. Unselected layers keep their saved dot.
export const LOCATION_MARKERS=['dot','city','battle'];
export function drawLocationMarker(ctx,{style,x,y,color='#d8b777',background='#101b2b',size=58}){
 if(!['city','battle'].includes(style))return false;
 ctx.save();ctx.translate(x,y);ctx.scale(size/58,size/58);ctx.lineJoin='round';ctx.lineCap='round';
 ctx.shadowColor='#000b';ctx.shadowBlur=8;ctx.fillStyle=background;ctx.strokeStyle=color;ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(0,-30);ctx.lineTo(27,-16);ctx.lineTo(27,16);ctx.lineTo(0,30);ctx.lineTo(-27,16);ctx.lineTo(-27,-16);ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;
 if(style==='city'){
  ctx.beginPath();ctx.moveTo(-17,15);ctx.lineTo(-17,-14);ctx.lineTo(-10,-14);ctx.lineTo(-10,-7);ctx.lineTo(-4,-7);ctx.lineTo(-4,-14);ctx.lineTo(4,-14);ctx.lineTo(4,-7);ctx.lineTo(10,-7);ctx.lineTo(10,-14);ctx.lineTo(17,-14);ctx.lineTo(17,15);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-5,15);ctx.lineTo(-5,6);ctx.quadraticCurveTo(0,-2,5,6);ctx.lineTo(5,15);ctx.stroke();
 }else for(const mirror of [-1,1]){
  ctx.save();ctx.scale(mirror,1);ctx.beginPath();ctx.moveTo(-13,18);ctx.lineTo(13,-12);ctx.lineTo(17,-20);ctx.lineTo(9,-16);ctx.lineTo(-17,14);ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-19,7);ctx.lineTo(-8,18);ctx.moveTo(-14,14);ctx.lineTo(-21,22);ctx.stroke();ctx.restore();
 }
 ctx.restore();return true;
}
