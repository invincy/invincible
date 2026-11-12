import {dashboardStartupMotion} from '../src/startup-motion.mjs';
import React, {useEffect, useRef} from 'react';

// A viewport-sized, bounded network independent of the square orb stage.
export default function AmbientParticles({theme = 'gold', intensity = 'full'}) {
  const canvasRef = useRef(null), born = useRef(performance.now());
  useEffect(() => {
    const canvas = canvasRef.current, scene = canvas.parentElement, pointerSurface = canvas.closest('.v2-shell') || scene, context = canvas.getContext('2d');
    if (!context) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const colour = {gold:'118, 153, 202', cyan:'115, 221, 244', emerald:'112, 230, 175'}[theme] || '118, 153, 202';
    let width=0, height=0, frame=0, last=0, particles=[], inView=true;
    const pointer={x:0,y:0,active:false};
    const fractional=value=>value-Math.floor(value);
    const hash=(index,salt)=>fractional(Math.sin(index*127.1+salt*311.7)*43758.5453);
    const makeParticle=index=>({x:hash(index,1),y:hash(index,2),vx:Math.sin(index*2.17)*(4+index%4),vy:Math.cos(index*1.73)*(3+index%3),size:index%9===0?1.8:1+index%3*.2,dx:0,dy:0});
    const draw=seconds=>{
      if(!width||!height)return;
      context.clearRect(0,0,width,height);
      const motion=dashboardStartupMotion((performance.now()-born.current)/1000,reduced.matches);
      canvas.dataset.startupStorm=String(motion.storm);
      const interactive=pointer.active&&!reduced.matches, smoothing=1-Math.exp(-seconds*9), radius=190;
      const motionScale=intensity==='subtle'?.3:1;
      const angle=seconds*4*motion.storm*motionScale,cos=Math.cos(angle),sin=Math.sin(angle);
      for(const p of particles){
        const x=p.x-.5,y=p.y-.5;
        p.x=(.5+x*cos-y*sin+p.vx*seconds*motion.speed*motionScale/width+2)%1;p.y=(.5+x*sin+y*cos+p.vy*seconds*motion.speed*motionScale/height+2)%1;
        const dx=p.x*width-pointer.x,dy=p.y*height-pointer.y,distance=Math.hypot(dx,dy),push=interactive?Math.max(0,1-distance/radius)*34:0;
        p.dx+=((dx/Math.max(1,distance))*push-p.dx)*smoothing;p.dy+=((dy/Math.max(1,distance))*push-p.dy)*smoothing;
      }
      const reach=width<700?125:165,points=particles.map(p=>({x:p.x*width+p.dx,y:p.y*height+p.dy,size:p.size}));
      let links=0,mouseLinks=0;
      for(let i=0;i<points.length;i++){
        const p=points[i];
        for(let j=i+1;j<points.length;j++){
          const q=points[j],distance=Math.hypot(p.x-q.x,p.y-q.y);if(distance>=reach)continue;
          context.strokeStyle=`rgba(${colour},${(.29*(1-distance/reach)*motion.links).toFixed(3)})`;context.lineWidth=.55;
          context.beginPath();context.moveTo(p.x,p.y);context.lineTo(q.x,q.y);context.stroke();links++;
        }
        const distance=Math.hypot(p.x-pointer.x,p.y-pointer.y),near=interactive&&distance<radius;
        if(near&&mouseLinks<12){context.strokeStyle=`rgba(${colour},${(.5*(1-distance/radius)).toFixed(3)})`;context.lineWidth=.65;context.beginPath();context.moveTo(p.x,p.y);context.lineTo(pointer.x,pointer.y);context.stroke();mouseLinks++;}
        context.fillStyle=`rgba(${colour},${near?.9:p.size>1.5?.7:.48})`;context.beginPath();context.arc(p.x,p.y,p.size+(near?.7:0),0,Math.PI*2);context.fill();
      }
      canvas.dataset.linkCount=String(links);canvas.dataset.mouseLinks=String(mouseLinks);canvas.dataset.pointerActive=String(interactive);
    };
    const resize=()=>{
      const rect=scene.getBoundingClientRect();width=rect.width;height=rect.height;canvas.dataset.fieldWidth=String(width);canvas.dataset.fieldHeight=String(height);if(!width||!height)return;
      const ratio=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);context.setTransform(ratio,0,0,ratio,0,0);
      const count=Math.round(.75*(intensity==='subtle'?.55:1)*Math.min(width<700?90:260,Math.max(width<700?64:140,Math.round(width*height/7500))));
      particles=Array.from({length:count},(_,i)=>particles[i]||makeParticle(i));canvas.dataset.particleCount=String(count);draw(0);
    };
    const stop=()=>{cancelAnimationFrame(frame);frame=0;};
    const schedule=()=>{if(intensity!=='off'&&!frame&&!document.hidden&&inView&&!reduced.matches)frame=requestAnimationFrame(tick);};
    const tick=timestamp=>{
      frame=0;
      if(reduced.matches){visibility();return;}
      if(timestamp-last>=33){const seconds=Math.min((timestamp-last)/1000||0,.05);last=timestamp;draw(seconds);}
      schedule();
    };
    const visibility=()=>{stop();last=performance.now();if(reduced.matches||intensity==='off'){pointer.active=false;draw(0);}else schedule();};
    const move=event=>{if(event.pointerType!=='mouse'||reduced.matches)return;const rect=scene.getBoundingClientRect();pointer.x=event.clientX-rect.left;pointer.y=event.clientY-rect.top;pointer.active=pointer.x>=0&&pointer.x<=width&&pointer.y>=0&&pointer.y<=height;};
    const leave=()=>{pointer.active=false;};
    const resizeObserver=new ResizeObserver(resize),intersection=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;visibility();});
    resizeObserver.observe(scene);intersection.observe(scene);pointerSurface.addEventListener('pointermove',move,{passive:true});pointerSurface.addEventListener('pointerleave',leave);window.addEventListener('blur',leave);document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',visibility);resize();schedule();
    return()=>{stop();resizeObserver.disconnect();intersection.disconnect();pointerSurface.removeEventListener('pointermove',move);pointerSurface.removeEventListener('pointerleave',leave);window.removeEventListener('blur',leave);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',visibility);};
  }, [theme,intensity]);
  return <canvas ref={canvasRef} className="v2-guide-particles" aria-hidden="true"/>;
}
