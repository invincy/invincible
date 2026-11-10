// Declarative Canvas scenes share the Studio compositor and clock with maps.
export const CANVAS_FONTS=['system-ui','Invincible Sans','Invincible Hindi','serif','monospace'];
export function validateCanvas(data,assets){
 const allowed=['background','backgroundStyle','gridColor','gridSpacing','backgroundAssetId','backgroundFit'];
 if(!data||typeof data!=='object'||Array.isArray(data)||Object.keys(data).some(k=>!allowed.includes(k)))throw Error('Unsupported canvas background field.');
 for(const key of ['background','gridColor'])if(data[key]!==undefined&&!/^#[a-f\d]{6}$/i.test(data[key]))throw Error('Canvas colors must be #rrggbb.');
 if(data.backgroundStyle!==undefined&&!['plain','grid','blueprint','image'].includes(data.backgroundStyle))throw Error('Choose plain, grid, blueprint or image.');
 if(data.gridSpacing!==undefined&&(!Number.isFinite(data.gridSpacing)||data.gridSpacing<16||data.gridSpacing>240))throw Error('Grid spacing must be 16–240 reference pixels.');
 if(data.backgroundFit!==undefined&&!['contain','cover'].includes(data.backgroundFit))throw Error('Choose contain or cover.');
 if(data.backgroundAssetId!==undefined&&!assets.has(data.backgroundAssetId))throw Error('Missing background artwork.');
 if(data.backgroundStyle==='image'&&!data.backgroundAssetId)throw Error('Choose background artwork.');
}
export function drawCanvasBackground(ctx,data,images){
 const {width:w,height:h}=ctx.canvas,unit=Math.min(w,h)/1080;
 if(data.backgroundStyle==='image'){
  const image=images.get(data.backgroundAssetId);if(!image)throw Error('Background artwork did not load.');
  const k=(data.backgroundFit==='contain'?Math.min:Math.max)(w/image.width,h/image.height);ctx.drawImage(image,(w-image.width*k)/2,(h-image.height*k)/2,image.width*k,image.height*k);return;
 }
 if(!['grid','blueprint'].includes(data.backgroundStyle))return;
 const spacing=(data.gridSpacing??48)*unit;ctx.save();ctx.strokeStyle=data.gridColor||'#6388a8';
 for(const major of [false,true]){ctx.globalAlpha*=major?.35:.15;ctx.lineWidth=(major?1.5:1)*unit;ctx.beginPath();
  for(let i=0;i*spacing<=w;i++)if((i%5===0)===major){ctx.moveTo(i*spacing,0);ctx.lineTo(i*spacing,h);}
  for(let i=0;i*spacing<=h;i++)if((i%5===0)===major){ctx.moveTo(0,i*spacing);ctx.lineTo(w,i*spacing);}
  ctx.stroke();ctx.globalAlpha/=(major?.35:.15);
 }ctx.restore();
}
export function drawCanvasLayer(ctx,l,brand,images){
 const {width,height}=ctx.canvas,unit=Math.min(width,height)/1080;
 ctx.save();ctx.globalAlpha*=l.opacity;ctx.translate(l.x*width,l.y*height);ctx.rotate(l.rotation*Math.PI/180);ctx.scale(l.scale,l.scale);ctx.fillStyle=l.color||brand.foreground;ctx.strokeStyle=l.color||brand.foreground;
 const w=(l.width??.8)*width,h=(l.height??.3)*height;
 if(l.type==='text'){const size=(l.fontSize??56)*unit;ctx.textAlign=l.textAlign||'center';ctx.textBaseline='middle';ctx.font=`${l.fontWeight??600} ${size}px ${l.fontFamily?(l.fontFamily.startsWith("Invincible")?`"${l.fontFamily}"`:l.fontFamily):brand.font}`;const x=l.textAlign==='left'?-w/2:l.textAlign==='right'?w/2:0;const lines=l.text.split('\n');lines.forEach((line,i)=>ctx.fillText(line,x,(i-(lines.length-1)/2)*size*1.3,w));}
 if(l.type==='rectangle')ctx.fillRect(-w/2,-h/2,w,h);
 if(l.type==='circle'){ctx.beginPath();ctx.ellipse(0,0,w/2,h/2,0,0,Math.PI*2);ctx.fill();}
 if(l.type==='arrow'||l.type==='line'){ctx.lineWidth=(l.lineWidth??5)*unit;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-w/2,0);ctx.lineTo(w/2,0);ctx.stroke();if(l.type==='arrow'){const tip=Math.min(w/3,24*unit);ctx.beginPath();ctx.moveTo(w/2,0);ctx.lineTo(w/2-tip,-tip*.45);ctx.lineTo(w/2-tip,tip*.45);ctx.closePath();ctx.fill();}}
 if(l.type==='image'){const image=images.get(l.assetId);if(!image)throw Error('Overlay artwork did not load.');const scale=Math.min(w/image.width,h/image.height);ctx.drawImage(image,-image.width*scale/2,-image.height*scale/2,image.width*scale,image.height*scale);}
 ctx.restore();
}
