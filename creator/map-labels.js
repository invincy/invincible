import {locationVisible} from './map-globe.js';
import {icons,layerActive,layerAlpha,layerStart} from './map-editor-model.js?v=2026110903';
import {mapFrame,timeOf} from './history-model.js?v=2026110903';
// Reference units are pixels at a 1080-pixel short edge. Preview and export share this compositor.
function wrap(ctx,text,maxWidth){
 const lines=[];let line='';const graphemes=new Intl.Segmenter(undefined,{granularity:'grapheme'});
 for(const word of String(text).split(/\s+/)){const next=line?line+' '+word:word;if(ctx.measureText(next).width<=maxWidth){line=next;continue;}if(line)lines.push(line);line='';for(const {segment} of graphemes.segment(word)){if(line&&ctx.measureText(line+segment).width>maxWidth){lines.push(line);line='';}line+=segment;}}
 if(line)lines.push(line);return lines;
}
export function drawDefaultLabels(ctx,{map,project,spec,time,width,height}){
 const p=spec.presentation;if(!p)return [];
 const factor=Math.min(width,height)/1080,w=width/factor,h=height/factor,margin=p.safeMargin,bottom=h-Math.max(margin,108),occupied=[];
 ctx.save();ctx.scale(factor,factor);
 const frame=mapFrame(project,spec,time),items=frame.events.map(e=>({event:e,layer:spec.visual?.layers.find(l=>l.kind==='event'&&l.ref===e.id)}));
 for(const layer of spec.visual?.layers||[])if(['label','icon'].includes(layer.kind)&&layerActive(project,layer,time))items.push({layer});
 for(const {event,layer:l} of items){
  if(l?.visible===false)continue;const position=event?.coordinates||l.position;if(!locationVisible(map,position,spec.projection))continue;
  const at=map.project(position),x=at.x/factor,y=at.y/factor;if(x<0||x>w||y<0||y>h)continue;
  const text=event?(l?.name||event.label):l.kind==='icon'?icons[l.icon]:l.name,size=(l?.fontSize??p.labelSize)*(l?.scale??1),padding=p.padding;
  ctx.font='600 '+size+'px '+p.fontFamily;ctx.textBaseline='middle';ctx.textAlign='left';
  const lines=wrap(ctx,text,Math.max(size,w-2*margin-2*padding)),lineHeight=size*1.22,bw=Math.max(...lines.map(s=>ctx.measureText(s).width),0)+2*padding,bh=lines.length*lineHeight+2*padding;
  const rotation=(l?.rotation||0)*Math.PI/180,rw=Math.abs(Math.cos(rotation))*bw+Math.abs(Math.sin(rotation))*bh,rh=Math.abs(Math.sin(rotation))*bw+Math.abs(Math.cos(rotation))*bh;
  let bx=Math.max(margin,Math.min(w-margin-rw,x+24)),by=Math.max(margin,Math.min(bottom-rh,y-rh/2));
  let tries=0;while(occupied.some(r=>bx<r.x+r.w+12&&bx+rw+12>r.x&&by<r.y+r.h+12&&by+rh+12>r.y)&&tries++<10)by+=rh+12;
  if(rw>w-2*margin||by+rh>bottom)continue;occupied.push({x:bx,y:by,w:rw,h:rh,text,fontSize:size});
  let alpha=l?layerAlpha(project,l,time):1;const elapsed=event?time-timeOf(project,event):time-layerStart(project,l);
  if(l?.fadeIn===undefined&&p.fadeSeconds)alpha*=Math.min(1,Math.max(0,elapsed/p.fadeSeconds));if(l?.fadeOut===undefined&&l?.sceneId&&p.fadeSeconds)alpha*=Math.min(1,Math.max(0,(l.duration-elapsed)/p.fadeSeconds));ctx.globalAlpha=alpha;
  ctx.strokeStyle=p.accentColor;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(bx,by+rh/2);ctx.stroke();
  ctx.fillStyle=l?.inheritTextColor?p.textColor:(l?.color||p.textColor);ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.translate(bx+rw/2,by+rh/2);ctx.rotate(rotation);
  ctx.globalAlpha=alpha*p.cardOpacity;ctx.fillStyle=p.cardColor;ctx.beginPath();ctx.roundRect(-bw/2,-bh/2,bw,bh,p.cardRadius);ctx.fill();ctx.globalAlpha=alpha;ctx.stroke();
  ctx.fillStyle=l?.inheritTextColor?p.textColor:(l?.color||p.textColor);lines.forEach((s,i)=>ctx.fillText(s,-bw/2+padding,-bh/2+padding+lineHeight*(i+.5)));ctx.restore();
 }
 ctx.restore();return occupied;
}
export function drawDefaultCredits(ctx,{spec,width,height,credit,date}){
 const p=spec.presentation;if(!p)return;const scale=Math.min(width,height)/1080,w=width/scale,h=height/scale;
 ctx.save();ctx.scale(scale,scale);ctx.font='500 22px '+p.fontFamily;ctx.textBaseline='bottom';ctx.fillStyle=p.textColor;ctx.strokeStyle=p.cardColor;ctx.lineWidth=4;ctx.lineJoin='round';
 const text=[credit,spec.visual?.terrain?.enabled?spec.visual.terrain.attribution:''].filter(Boolean).join(' · '),lines=wrap(ctx,text,w-64);
 lines.forEach((s,i)=>{const y=h-20-(lines.length-1-i)*28;ctx.strokeText(s,32,y);ctx.fillText(s,32,y);});
 if(p.showDates&&date){ctx.font='600 '+p.secondaryLabelSize+'px '+p.fontFamily;ctx.strokeText(date,p.safeMargin,p.safeMargin+p.secondaryLabelSize);ctx.fillText(date,p.safeMargin,p.safeMargin+p.secondaryLabelSize);}
 ctx.restore();
}
