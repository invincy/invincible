import{useEffect,useRef}from'react';

// A flowing 3D particle sphere, rendered without a 3D framework.
function shader(gl,type,source){const value=gl.createShader(type);gl.shaderSource(value,source);gl.compileShader(value);if(!gl.getShaderParameter(value,gl.COMPILE_STATUS)){gl.deleteShader(value);throw Error('Orb shader could not compile')}return value}
function program(gl,vertex,fragment){const value=gl.createProgram(),vs=shader(gl,gl.VERTEX_SHADER,vertex),fs=shader(gl,gl.FRAGMENT_SHADER,fragment);gl.attachShader(value,vs);gl.attachShader(value,fs);gl.linkProgram(value);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(value,gl.LINK_STATUS)){gl.deleteProgram(value);throw Error('Orb program could not link')}return value}
// Every visible mark belongs to the particle field; there is no solid mesh or orbit ring.
const particleVertex=`attribute vec3 position;attribute vec2 appearance;uniform mat4 projection;uniform float pixelRatio;varying float opacity;void main(){vec4 projected=projection*vec4(position,1.0);gl_Position=projected;gl_PointSize=max(1.0,appearance.x*pixelRatio*4.6/projected.w);opacity=appearance.y*(0.35+0.65*smoothstep(-1.0,1.0,position.z));}`;
const particleFragment=`precision mediump float;varying float opacity;void main(){float radius=length(gl_PointCoord-vec2(0.5))*2.0;if(radius>1.0)discard;float core=1.0-smoothstep(0.0,1.0,radius);gl_FragColor=vec4(mix(vec3(0.08,0.55,0.78),vec3(0.55,1.0,1.0),core),core*opacity);}`;
function perspective(aspect){const f=1/Math.tan(Math.PI/8),near=.1,far=30,distance=4.6;return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,(far+near)/(near-far)*-distance+2*far*near/(near-far),distance])}
function flowPosition(seed,phase,time){
 const latitude=seed*Math.PI+0.32*Math.sin(phase*2+seed*12),longitude=phase+0.55*Math.sin(seed*9+phase*2)+0.18*Math.sin(phase*5-seed*7);
 const radius=1.24+0.045*Math.sin(seed*17+phase*4+time*.3);
 const x=radius*Math.sin(latitude)*Math.cos(longitude),y=radius*Math.cos(latitude),z=radius*Math.sin(latitude)*Math.sin(longitude),turn=time*.075+.35;
 return[x*Math.cos(turn)+z*Math.sin(turn),y,-x*Math.sin(turn)+z*Math.cos(turn)];
}
export function FocusOrb(){
 const canvas=useRef(null),host=useRef(null);
 useEffect(()=>{
  const c=canvas.current,container=host.current;let gl,dots,particleBuffer,frame=null,resizeObserver,intersectionObserver;let disposed=false,inView=true,contextLost=false,start=performance.now(),last=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:1024px)');
  const stop=()=>{if(frame!==null)cancelAnimationFrame(frame);frame=null};
  try{
   gl=c.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'low-power'});if(!gl)return;
   dots=program(gl,particleVertex,particleFragment);particleBuffer=gl.createBuffer();
   const dotPosition=gl.getAttribLocation(dots,'position'),dotAppearance=gl.getAttribLocation(dots,'appearance'),dotProjection=gl.getUniformLocation(dots,'projection'),dotRatio=gl.getUniformLocation(dots,'pixelRatio');
   let projection,ratio=1;
   const render=timestamp=>{
    frame=null;if(disposed||contextLost||document.hidden||!inView)return;
    const interval=mobile.matches?1000/30:1000/45;if(!reduced.matches&&timestamp-last<interval){frame=requestAnimationFrame(render);return}last=timestamp;
    const time=reduced.matches?8:(timestamp-start)/1000;
    gl.viewport(0,0,c.width,c.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.disable(gl.DEPTH_TEST);
    const particles=[],streams=mobile.matches?72:120,trailCount=mobile.matches?72:140;
    for(let stream=0;stream<streams;stream++){
     const seed=(stream+.5)/streams,phase=stream*2.399963+time*(.10+.035*Math.sin(stream));
     for(let trail=0;trail<trailCount;trail++){
      const point=flowPosition(seed,phase-trail*.018,time),head=trail===0;
      particles.push(...point,head?5.5:4.2,(head?1.0:.85)*(1-trail/trailCount));
     }
    }
    // A scattered shell fills the dark gaps without drawing latitude or longitude lines.
    const flecks=mobile.matches?600:1400;
    for(let dot=0;dot<flecks;dot++){
     const seed=Math.acos(1-2*(dot+.5)/flecks)/Math.PI,phase=dot*2.399963+time*.045;
     particles.push(...flowPosition(seed,phase,time),dot%11===0?4.0:2.6,.40+.30*Math.sin(dot*7.13+time*.5)**2);
    }
    gl.useProgram(dots);gl.uniformMatrix4fv(dotProjection,false,projection);gl.uniform1f(dotRatio,ratio);gl.bindBuffer(gl.ARRAY_BUFFER,particleBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(particles),gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(dotPosition);gl.vertexAttribPointer(dotPosition,3,gl.FLOAT,false,20,0);gl.enableVertexAttribArray(dotAppearance);gl.vertexAttribPointer(dotAppearance,2,gl.FLOAT,false,20,12);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.depthMask(false);gl.drawArrays(gl.POINTS,0,particles.length/5);gl.depthMask(true);
    container.dataset.ready='true';if(!reduced.matches)frame=requestAnimationFrame(render);
   };
   const resume=()=>{stop();if(!disposed&&!contextLost&&!document.hidden&&inView)frame=requestAnimationFrame(render)};
   const resize=()=>{const rect=container.getBoundingClientRect();if(!rect.width||!rect.height)return;ratio=Math.min(devicePixelRatio||1,mobile.matches?1:1.5);delete container.dataset.ready;c.width=Math.round(rect.width*ratio);c.height=Math.round(rect.height*ratio);projection=perspective(rect.width/rect.height);resume()};
   resizeObserver=new ResizeObserver(resize);resizeObserver.observe(container);
   if(typeof IntersectionObserver!=='undefined'){intersectionObserver=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;resume()});intersectionObserver.observe(container)}
   const visibility=()=>resume(),preferences=()=>resize(),lost=event=>{event.preventDefault();contextLost=true;stop();delete container.dataset.ready};
   document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',preferences);mobile.addEventListener('change',preferences);c.addEventListener('webglcontextlost',lost);resize();
   return()=>{disposed=true;stop();resizeObserver.disconnect();intersectionObserver?.disconnect();document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',preferences);mobile.removeEventListener('change',preferences);c.removeEventListener('webglcontextlost',lost);gl.deleteBuffer(particleBuffer);gl.deleteProgram(dots)};
  }catch(error){console.warn('3D orb unavailable; keeping the particle fallback.',error);stop();resizeObserver?.disconnect();intersectionObserver?.disconnect();if(gl){if(particleBuffer)gl.deleteBuffer(particleBuffer);if(dots)gl.deleteProgram(dots)}}
 },[]);
 return <div ref={host} className="focus-orb-3d" aria-hidden="true"><div className="orb-3d-fallback"/><canvas ref={canvas}/></div>;
}
