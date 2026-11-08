// Readable cartographic labels shared by preview and export.
export function drawMapLabel(ctx,text,x,y,{width,height,color='#ffffff',size=21,offset=[0,0],marker=false,occupied=[]}={}){
 if(x<0||x>width||y<0||y>height-54)return;
 ctx.save();ctx.font=`700 ${size}px Bahnschrift, Arial, sans-serif`;ctx.textBaseline='middle';ctx.textAlign='left';
 const pad=10,w=Math.min(width-20,ctx.measureText(text).width+pad*2+5),h=size+18;
 const left=Math.max(10,Math.min(width-w-10,x+offset[0]-w/2));let top=Math.max(8,Math.min(height-h-62,y+offset[1]-h/2));const initial=top;for(let i=0;i<8&&occupied.some(r=>left<r.left+r.width+4&&left+w+4>r.left&&top<r.top+r.height+4&&top+h+4>r.top);i++)top=Math.max(8,Math.min(height-h-62,initial+(i%2?-1:1)*Math.ceil((i+1)/2)*(h+5)));occupied.push({left,top,width:w,height:h});
 if(marker||offset.some(n=>n!==0)||top!==initial){ctx.strokeStyle='#ffffffb0';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(left+w/2,top+h/2);ctx.stroke();if(marker){ctx.fillStyle='#ff584a';ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#101820';ctx.lineWidth=2;ctx.stroke();}}
 ctx.fillStyle='#09121deb';ctx.strokeStyle='#dce8f080';ctx.lineWidth=1;
 ctx.beginPath();if(ctx.roundRect)ctx.roundRect(left,top,w,h,3);else ctx.rect(left,top,w,h);ctx.fill();ctx.stroke();ctx.fillStyle=color;ctx.fillRect(left,top+3,3,h-6);ctx.fillText(text,left+pad+3,top+h/2,w-pad*2-5);ctx.restore();
}
