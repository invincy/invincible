import React, {useEffect, useRef} from 'react';

// A bounded, mouse-responsive network behind the fixed dashboard layout.
export default function AmbientParticles({theme = 'gold'}) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current, scene = canvas.parentElement, context = canvas.getContext('2d');
    if (!context) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const colour = {gold:'238, 200, 123', cyan:'115, 221, 244', emerald:'112, 230, 175'}[theme] || '238, 200, 123';
    let width=0, height=0, frame=0, last=0, particles=[], inView=true;
    const pointer={x:0,y:0,active:false};
    const fractional=value=>value-Math.floor(value);
    const makeParticle=index=>({x:fractional((index+1)*.61803398875),y:fractional((index+1)*.75487766625),vx:Math.sin(index*2.17)*(4+index%4),vy:Math.cos(index*1.73)*(3+index%3),size:index%9===0?1.8:1+index%3*.2,dx:0,dy:0});
    const draw=seconds=>{
      if(!width||!height)return;
      context.clearRect(0,0,width,height);
      const interactive=pointer.active&&!reduced.matches, smoothing=1-Math.exp(-seconds*9), radius=190;
      for(const p of particles){
        p.x=(p.x+p.vx*seconds/width+1)%1;p.y=(p.y+p.vy*seconds/height+1)%1;
        const dx=p.x*width-pointer.x,dy=p.y*height-pointer.y,distance=Math.hypot(dx,dy),push=interactive?Math.max(0,1-distance/radius)*34:0;
        p.dx+=((dx/Math.max(1,distance))*push-p.dx)*smoothing;p.dy+=((dy/Math.max(1,distance))*push-p.dy)*smoothing;
      }
      const reach=width<700?125:165,points=particles.map(p=>({x:p.x*width+p.dx,y:p.y*height+p.dy,size:p.size}));
      let links=0,mouseLinks=0;
      for(let i=0;i<points.length;i++){
        const p=points[i];
        for(let j=i+1;j<points.length;j++){
          const q=points[j],distance=Math.hypot(p.x-q.x,p.y-q.y);if(distance>=reach)continue;
          context.strokeStyle=`rgba(${colour},${(.29*(1-distance/reach)).toFixed(3)})`;context.lineWidth=.7;
          context.beginPath();context.moveTo(p.x,p.y);context.lineTo(q.x,q.y);context.stroke();links++;
        }
        const distance=Math.hypot(p.x-pointer.x,p.y-pointer.y),near=interactive&&distance<radius;
        if(near&&mouseLinks<12){context.strokeStyle=`rgba(${colour},${(.5*(1-distance/radius)).toFixed(3)})`;context.lineWidth=.9;context.beginPath();context.moveTo(p.x,p.y);context.lineTo(pointer.x,pointer.y);context.stroke();mouseLinks++;}
        context.fillStyle=`rgba(${colour},${near?.9:p.size>1.5?.7:.48})`;context.beginPath();context.arc(p.x,p.y,p.size+(near?.7:0),0,Math.PI*2);context.fill();
      }
      canvas.dataset.linkCount=String(links);canvas.dataset.mouseLinks=String(mouseLinks);canvas.dataset.pointerActive=String(interactive);
    };
    const resize=()=>{
      const rect=scene.getBoundingClientRect();width=rect.width;height=rect.height;if(!width||!height)return;
      const ratio=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);context.setTransform(ratio,0,0,ratio,0,0);
      const count=Math.min(width<700?90:170,Math.max(width<700?64:110,Math.round(width*height/7500)));
      particles=Array.from({length:count},(_,i)=>particles[i]||makeParticle(i));canvas.dataset.particleCount=String(count);draw(0);
    };
    const stop=()=>{cancelAnimationFrame(frame);frame=0;};
    const schedule=()=>{if(!frame&&!document.hidden&&inView&&!reduced.matches)frame=requestAnimationFrame(tick);};
    const tick=timestamp=>{frame=0;if(timestamp-last>=33){const seconds=Math.min((timestamp-last)/1000||0,.05);last=timestamp;draw(seconds);}schedule();};
    const visibility=()=>{stop();last=performance.now();if(reduced.matches){pointer.active=false;draw(0);}else schedule();};
    const move=event=>{if(event.pointerType!=='mouse'||reduced.matches)return;const rect=scene.getBoundingClientRect();pointer.x=event.clientX-rect.left;pointer.y=event.clientY-rect.top;pointer.active=pointer.x>=0&&pointer.x<=width&&pointer.y>=0&&pointer.y<=height;};
    const leave=()=>{pointer.active=false;};
    const resizeObserver=new ResizeObserver(resize),intersection=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;visibility();});
    resizeObserver.observe(scene);intersection.observe(scene);scene.addEventListener('pointermove',move,{passive:true});scene.addEventListener('pointerleave',leave);window.addEventListener('blur',leave);document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',visibility);resize();schedule();
    return()=>{stop();resizeObserver.disconnect();intersection.disconnect();scene.removeEventListener('pointermove',move);scene.removeEventListener('pointerleave',leave);window.removeEventListener('blur',leave);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',visibility);};
  }, [theme]);
  return <canvas ref={canvasRef} className="v2-guide-particles" aria-hidden="true"/>;
}
