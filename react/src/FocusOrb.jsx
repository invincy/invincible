import {dashboardStartupMotion,startupMotion} from './startup-motion.mjs';
import{useEffect,useRef}from'react';
import{createOrbParticles,orbParticleTier}from'./orb-particles';

// A planet-like field made from irregular particle spirals, rendered without a 3D framework.
function shader(gl,type,source){const value=gl.createShader(type);gl.shaderSource(value,source);gl.compileShader(value);if(!gl.getShaderParameter(value,gl.COMPILE_STATUS)){gl.deleteShader(value);throw Error('Orb shader could not compile')}return value}
function program(gl,vertex,fragment){
 const value=gl.createProgram();let vs,fs;
 try{vs=shader(gl,gl.VERTEX_SHADER,vertex);fs=shader(gl,gl.FRAGMENT_SHADER,fragment);gl.attachShader(value,vs);gl.attachShader(value,fs);gl.linkProgram(value);if(!gl.getProgramParameter(value,gl.LINK_STATUS))throw Error('Orb program could not link');return value}
 catch(error){gl.deleteProgram(value);throw error}
 finally{if(vs)gl.deleteShader(vs);if(fs)gl.deleteShader(fs)}
}
// Every visible mark belongs to the particle field; there is no solid mesh or orbit ring.
const particleVertex=`attribute vec3 position;attribute vec2 appearance;uniform mat4 projection;uniform float pixelRatio;uniform float pointScale;uniform float time;uniform float style;uniform float expressive;uniform float spin;uniform vec2 rotation;uniform vec3 influence;varying float opacity;
vec3 rotateByGesture(vec3 p){
 float cx=cos(rotation.y),sx=sin(rotation.y),cy=cos(rotation.x),sy=sin(rotation.x);
 p=vec3(p.x,p.y*cx-p.z*sx,p.y*sx+p.z*cx);
 return vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);
}
void main(){
 // The added flecks need only a slow drift and the shared globe rotation.
 if(appearance.y<0.0){
  float angle=time*.09;
  float c=cos(angle),s=sin(angle);
  vec3 p=rotateByGesture(vec3(position.x*c+position.z*s,position.y,-position.x*s+position.z*c));
  vec4 projected=projection*vec4(p,1.0);
  gl_Position=projected;
  float minimumSize=1.5+.35*step(1.75,appearance.x)+.42*step(2.4,appearance.x);
  gl_PointSize=max(minimumSize,appearance.x*pixelRatio*pointScale*4.6/projected.w);
  opacity=-appearance.y*(.18+.82*smoothstep(-.75,1.0,p.z));
  return;
 }

float travel=fract(position.x+time*position.z);float rawLane=position.y;float cell=step(3.5,rawLane);float ring=step(1.5,rawLane)*(1.0-cell);float lane=fract(rawLane);float tau=6.2831853;
float hash=fract(sin(lane*913.73)*43758.5453);float angle=travel*tau+hash*tau;
float latitude=asin(clamp(lane*2.0-1.0,-.98,.98));
float irregularLatitude=latitude+sin(angle*(1.0+floor(hash*3.0))+hash*tau)*(.09+.17*hash);
float ringLatitude=latitude*.72+.055*sin(angle*2.0+hash*tau);
latitude=mix(irregularLatitude,ringLatitude,ring);
float cellLatitude=.56*sin(angle*(1.0+floor(hash*2.0))+hash*tau)+.14*sin(angle*3.0+hash*21.0);
latitude=mix(latitude,cellLatitude,cell);
float longitude=angle+mix(.28,.075,ring)*sin(angle*(2.0+floor(hash*2.0))+lane*17.0)+time*.025;
longitude=mix(longitude,angle+.34*sin(angle*2.0+hash*tau)+time*.025,cell);
float radius=1.03+.055*sin(angle*3.0+lane*31.0)+.035*sin(angle*7.0-time*.7+hash*19.0);
radius=mix(radius,1.09+.026*sin(angle*3.0+hash*13.0),ring);
radius=mix(radius,1.075+.035*sin(angle*4.0+hash*27.0-time*.3),cell);
radius+=step(.5,style)*(1.0-step(1.5,style))*.045*sin(angle*11.0+time*1.8+hash*43.0);
// Cyan flows as broad aurora bands; emerald grows twisting, organic filaments.
float cyan=1.0-step(.5,style),emerald=step(.5,style)*(1.0-step(1.5,style));
latitude+=expressive*(cyan*.20*sin(longitude*2.0+time*.4)+emerald*.16*sin(longitude*4.0-time*.65+hash*tau));
radius+=expressive*(cyan*.065*sin(longitude*3.0+time*.5)+emerald*.10*sin(longitude*5.0-time*.8+lane*17.0));
longitude+=expressive*(cyan*.12*sin(latitude*4.0+time*.3)+emerald*.20*sin(latitude*3.0-time*.5));
vec3 p=vec3(radius*cos(latitude)*cos(longitude),radius*sin(latitude),radius*cos(latitude)*sin(longitude));
float tilt=(hash-.5)*mix(1.45,2.1,max(ring,cell)),ct=cos(tilt),st=sin(tilt);p=vec3(p.x,p.y*ct-p.z*st,p.y*st+p.z*ct);
float edge=smoothstep(0.0,.075,travel)*(1.0-smoothstep(.925,1.0,travel));
float center=mix(.48,1.0,smoothstep(.0,.42,length(p.xy)));
float packetWave=.5+.5*sin(angle*5.0-time*.82+hash*tau);
float packet=pow(packetWave,7.0);
float secondary=pow(.5+.5*sin(angle*3.0-time*.54+hash*19.0),10.0);
p*=1.0+.035*packet+.018*secondary;
vec3 resting=p;
float disturbance=.040*sin(time*.67+resting.y*3.2+resting.z*1.4)+.026*sin(time*.43+resting.x*4.0-resting.z*2.1);
p*=1.0+disturbance;
p+=vec3(.050*sin(time*.58+resting.y*2.35)+.014*sin(time*.31+resting.z*4.1),.043*sin(time*.49+resting.z*2.55)+.012*sin(time*.36+resting.x*3.8),.050*sin(time*.55+resting.x*2.4)+.014*sin(time*.29+resting.y*4.0));
// Independent rigid rotation of the entire particle globe, after surface motion.
// Gently vary both the sideways tilt and depth of the rotation axis.
float globeTilt=.5235988+.14*sin(time*.16)+.035*sin(time*.09+1.2);
vec3 globeAxis=normalize(vec3(-sin(globeTilt),cos(globeTilt),.55+.10*sin(time*.12+.7)));
float globeAngle=-time*.28*spin,globeCos=cos(globeAngle),globeSin=sin(globeAngle);
p=p*globeCos+cross(globeAxis,p)*globeSin+globeAxis*dot(globeAxis,p)*(1.0-globeCos);
p=rotateByGesture(p);
vec2 delta=p.xy-influence.xy;float pull=exp(-dot(delta,delta)*2.7)*influence.z;
p.xy+=delta*pull*mix(.13,.30,expressive);p.z+=pull*mix(.16,.28,expressive);
// A slow planet-like pulse: six seconds inward, six seconds back; never expand.
float planetPulse=.5-.5*cos(time*.5235988);
p*=1.0-.015*planetPulse;
vec4 projected=projection*vec4(p,1.0);gl_Position=projected;float size=mix(1.0,1.22,step(.5,style)*(1.0-step(1.5,style)));size*=1.0+.26*packet+.12*secondary;gl_PointSize=max(1.0,appearance.x*size*pixelRatio*pointScale*4.6/projected.w);opacity=appearance.y*edge*center*(0.35+0.65*smoothstep(-1.0,1.0,p.z));opacity*=.48+1.05*packet+.48*secondary;opacity*=mix(1.0,.68,step(1.5,style)*(1.0-step(.76,appearance.y)));}`;
const particleFragment=`precision mediump float;uniform vec3 colorA;uniform vec3 colorB;uniform float particleBrightness;varying float opacity;void main(){float radius=length(gl_PointCoord-vec2(0.5))*2.0;if(radius>1.0)discard;float core=1.0-smoothstep(0.0,1.0,radius);gl_FragColor=vec4(mix(colorA,colorB,core),core*opacity*particleBrightness);}`;
function perspective(aspect){const f=1/Math.tan(Math.PI/8),near=.1,far=30,distance=4.6;return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,(far+near)/(near-far)*-distance+2*far*near/(near-far),distance])}
const palettes={cyan:{style:0,a:[.08,.55,.78],b:[.55,1,1]},emerald:{style:1,a:[.03,.32,.12],b:[.46,1,.62]},gold:{style:2,a:[.42,.16,.025],b:[1,.85,.38]}};
export function FocusOrb({theme='cyan',spin=true,allowDrag=true,richParticles=false,followPagePointer=false,dashboardMotion=false,interactionSurface}){
 const canvas=useRef(null),host=useRef(null);
 useEffect(()=>{
  const c=canvas.current,container=host.current,surface=container.parentElement;
  const eventSurface=interactionSurface?.current||surface;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:1024px)');
  const lightweight=(navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4)||(navigator.deviceMemory>0&&navigator.deviceMemory<=4);
  const palette=palettes[theme]||palettes.cyan;
  let gl,dots,particleBuffer,uniforms,frame=null,timer=null,resizeObserver,intersectionObserver;
  let disposed=false,inView=true,contextLost=false,start=performance.now(),last=0,particleCount=0,particleTier=null;
  let drag=null,hoverSample=null,directCoast=false,yaw=0,pitch=0,velocityX=0,velocityY=0,hoverX=0,hoverY=0,hoverStrength=0,targetX=0,targetY=0,targetStrength=0;
  const stop=()=>{if(timer!==null)clearTimeout(timer);if(frame!==null)cancelAnimationFrame(frame);timer=frame=null};
  const canDraw=()=>!disposed&&(dashboardMotion||!contextLost)&&!document.hidden&&inView;
  const coasting=()=>Math.hypot(velocityX,velocityY)>.015;
  const interactive=()=>drag||targetStrength>0||hoverStrength>.015||coasting();
  const initialize=()=>{
   dots=program(gl,particleVertex,particleFragment);particleBuffer=gl.createBuffer();particleTier=null;
   uniforms=Object.fromEntries(['projection','pixelRatio','pointScale','time','spin','rotation','influence','style','expressive','colorA','colorB','particleBrightness'].map(name=>[name,gl.getUniformLocation(dots,name)]));
   gl.useProgram(dots);gl.bindBuffer(gl.ARRAY_BUFFER,particleBuffer);
   for(const [name,size,offset]of[['position',3,0],['appearance',2,12]]){const location=gl.getAttribLocation(dots,name);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,size,gl.FLOAT,false,20,offset)}
   gl.clearColor(0,0,0,0);gl.disable(gl.DEPTH_TEST);gl.depthMask(false);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
   gl.uniform1f(uniforms.particleBrightness,dashboardMotion?.9:1);
   gl.uniform1f(uniforms.style,palette.style);gl.uniform1f(uniforms.expressive,richParticles ? 1 : 0);gl.uniform1f(uniforms.spin,spin ? 1 : 0);gl.uniform3fv(uniforms.colorA,palette.a);gl.uniform3fv(uniforms.colorB,palette.b);
  };
  // A timer waits for the next due frame; rAF only aligns that frame with presentation.
  const schedule=renderedAt=>{
   if(!canDraw()||(reduced.matches&&!(directCoast&&coasting())))return;
   const fps=interactive()?(mobile.matches?30:40):24;
   timer=setTimeout(()=>{timer=null;if(canDraw())frame=requestAnimationFrame(render)},Math.max(0,1000/fps-(performance.now()-renderedAt)));
  };
  const render=timestamp=>{
   frame=null;if(!canDraw())return;const renderedAt=performance.now();
   const dt=Math.min(Math.max(0,(timestamp-last)/1000)||1/45,.05);last=timestamp;
   const elapsed=(timestamp-start)/1000;
   const motion=(dashboardMotion?dashboardStartupMotion:startupMotion)(elapsed,reduced.matches),time=motion.phase;
   const smoothing=reduced.matches?1:1-Math.exp(-dt*9);
   hoverX+=(targetX-hoverX)*smoothing;hoverY+=(targetY-hoverY)*smoothing;hoverStrength+=(targetStrength-hoverStrength)*smoothing;
   if(!drag&&(!reduced.matches||directCoast)){
    const damping=dashboardMotion?1.35:5;
    const decay=Math.exp(-dt*damping);
    const travel=(1-decay)/damping;
    yaw=(yaw+velocityX*travel)%(2*Math.PI);pitch=(pitch+velocityY*travel)%(2*Math.PI);
    velocityX*=decay;velocityY*=decay;
   }
   const autoInfluenceX=Math.cos(time*.43)*.78+Math.sin(time*.19+1.2)*.18,autoInfluenceY=Math.sin(time*.37)*.65+Math.cos(time*.23+.4)*.16,manualMix=Math.min(1,hoverStrength),influenceX=autoInfluenceX*(1-manualMix)+hoverX*manualMix,influenceY=autoInfluenceY*(1-manualMix)+hoverY*manualMix,influenceStrength=1+(richParticles?.9:.4)*manualMix;
   if(!gl||contextLost){
    container.style.setProperty('--fallback-turn',`${yaw+pitch*.55+motion.turn}rad`);
    schedule(renderedAt);
    return;
   }
   gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(uniforms.time,time);gl.uniform2f(uniforms.rotation,yaw+motion.turn+influenceX*influenceStrength*(richParticles?.24:.16),pitch-influenceY*influenceStrength*(richParticles?.24:.16));gl.uniform3f(uniforms.influence,influenceX,influenceY,influenceStrength);gl.drawArrays(gl.POINTS,0,particleCount);
   container.dataset.ready='true';schedule(renderedAt);
  };
  const resume=()=>{stop();if(canDraw())render(performance.now())};
  const capture=event=>{if(!canDraw())return;resume();event.detail.url=c.toDataURL('image/png')};
  const resize=()=>{
   const rect=container.getBoundingClientRect();if(!rect.width||!rect.height||disposed||contextLost)return;
   stop();const ratio=Math.min(devicePixelRatio||1,mobile.matches?1:1.25);
   c.width=Math.round(rect.width*ratio);c.height=Math.round(rect.height*ratio);
   gl.viewport(0,0,c.width,c.height);gl.uniformMatrix4fv(uniforms.projection,false,perspective(rect.width/rect.height));gl.uniform1f(uniforms.pixelRatio,ratio);gl.uniform1f(uniforms.pointScale,1.5);
   const compact=rect.width<100;
   const tier=orbParticleTier(mobile.matches||compact,lightweight||compact,richParticles&&!compact,dashboardMotion&&!compact);
   tier.highlightTrails=dashboardMotion&&!compact&&theme==='gold';
   const key=JSON.stringify(tier);
   if(particleTier!==key){const particles=createOrbParticles(tier);particleCount=particles.length/5;gl.bufferData(gl.ARRAY_BUFFER,particles,gl.STATIC_DRAW);particleTier=key}
   // Resizing clears a canvas, so replace its contents immediately rather than waiting for a paced frame.
   resume();
  };
  const clamp=(value,limit)=>Math.max(-limit,Math.min(limit,value));
  const isGlobePoint=(event,rect)=>Math.hypot((event.clientX-rect.left)/rect.width-.5,(event.clientY-rect.top)/rect.height-.5)<.49;
  const pointerLocation=(event,rect=surface.getBoundingClientRect())=>{
   targetX=clamp(((event.clientX-rect.left)/rect.width-.5)*2.5,1.7);
   targetY=clamp((.5-(event.clientY-rect.top)/rect.height)*2.5,1.7);
   targetStrength=1;
  };
  const samplePointer=(event,rect,previous,sensitivity)=>{
   const sample={x:event.clientX,y:event.clientY,time:event.timeStamp};
   if(previous){
    const elapsed=(sample.time-previous.time)/1000;
    const dx=(sample.x-previous.x)/rect.width*sensitivity;
    const dy=(sample.y-previous.y)/rect.height*sensitivity;
    if(drag){yaw+=dx;pitch+=dy}
    if((!reduced.matches||(dashboardMotion&&drag))&&elapsed>=0&&(dx||dy)){
     const dt=Math.max(.008,elapsed);
     const mix=previous.time===drag?.start||elapsed>.10?1:1-Math.exp(-dt*45);
     const boost=dashboardMotion&&drag?1.75:1, limit=dashboardMotion&&drag?24:13;
     velocityX+=(clamp(dx/dt*boost,limit)-velocityX)*mix;
     velocityY+=(clamp(dy/dt*boost,limit)-velocityY)*mix;
    }
   }
   return sample;
  };
  const pointerDown=event=>{
   if(!allowDrag||!event.isPrimary||event.button!==0||drag||event.target.closest('button,a'))return;
   const grab=event.target.closest('.v2-orb-grab');
   if(dashboardMotion&&!grab)return;
   const rect=(grab||surface).getBoundingClientRect();
   drag={id:event.pointerId,start:event.timeStamp,sample:samplePointer(event,rect),rect};
   directCoast=false;hoverSample=null;velocityX=velocityY=0;
   event.preventDefault();
   eventSurface.setPointerCapture(event.pointerId);surface.dataset.dragging='true';pointerLocation(event,rect);resume();
  };
  const pointerMove=event=>{
   if(drag&&event.pointerId!==drag.id)return;
   const wasInteractive=interactive(),rect=drag?.rect||surface.getBoundingClientRect();
   if(drag){
    pointerLocation(event,rect);
    drag.sample=samplePointer(event,rect,drag.sample,3.5);
   }else if(event.pointerType==='mouse'){
    if(!dashboardMotion||(!surface.classList.contains('is-compact')&&isGlobePoint(event,rect))){
     pointerLocation(event,rect);
     if(dashboardMotion&&!reduced.matches)hoverSample=samplePointer(event,rect,hoverSample,.62);
    }else if(targetStrength>0||hoverSample)pointerLeave();
   }
   if(reduced.matches||(!wasInteractive&&interactive()))resume();
  };
  const pointerUp=event=>{
   if(!drag||event.pointerId!==drag.id)return;
   const rect=drag.rect;
   if(event.type==='pointerup'&&(drag.sample.x!==event.clientX||drag.sample.y!==event.clientY)){
    drag.sample=samplePointer(event,rect,drag.sample,3.5);
   }
   const idle=Math.max(0,(event.timeStamp-drag.sample.time)/1000);
   directCoast=dashboardMotion&&event.type==='pointerup';
   const release=event.type==='pointercancel'||(reduced.matches&&!directCoast)?0:Math.exp(-Math.max(0,idle-.10)*18);
   velocityX*=release;velocityY*=release;
   drag=null;delete surface.dataset.dragging;
   if(eventSurface.hasPointerCapture(event.pointerId))eventSurface.releasePointerCapture(event.pointerId);
   if(event.pointerType!=='mouse'||(dashboardMotion&&!isGlobePoint(event,rect)))targetStrength=0;
   resume();
  };
  const pointerLeave=()=>{
   hoverSample=null;
   if(!drag&&!followPagePointer){targetStrength=0;if(reduced.matches)resume()}
  };
  const pagePointerMove=event=>{if(reduced.matches||event.pointerType!=='mouse'||drag)return;pointerLocation(event)};
  const pageBlur=()=>{hoverSample=null;targetStrength=0;if(reduced.matches)resume()};
  const lostCapture=event=>{if(drag?.id===event.pointerId){drag=null;velocityX=velocityY=0;targetStrength=0;delete surface.dataset.dragging;resume()}};
  const events={pointerdown:pointerDown,pointermove:pointerMove,pointerup:pointerUp,pointercancel:pointerUp,pointerleave:pointerLeave,lostpointercapture:lostCapture};
  const visibility=()=>resume(),preferences=()=>gl?resize():resume();
  const lost=event=>{event.preventDefault();contextLost=true;delete container.dataset.ready;resume()};
  const restored=()=>{
   if(disposed)return;
   try{contextLost=false;initialize();resize()}catch(error){contextLost=true;stop();delete container.dataset.ready;console.warn('3D orb recovery unavailable; keeping the particle fallback.',error)}
  };
  const cleanup=()=>{
   disposed=true;stop();for(const[name,handler]of Object.entries(events))eventSurface.removeEventListener(name,handler);
   if(drag&&eventSurface.hasPointerCapture(drag.id))eventSurface.releasePointerCapture(drag.id);delete surface.dataset.dragging;
   resizeObserver?.disconnect();intersectionObserver?.disconnect();document.removeEventListener('visibilitychange',visibility);document.removeEventListener('pointermove',pagePointerMove);window.removeEventListener('blur',pageBlur);reduced.removeEventListener('change',preferences);mobile.removeEventListener('change',preferences);c.removeEventListener('invincible-capture',capture);c.removeEventListener('webglcontextlost',lost);c.removeEventListener('webglcontextrestored',restored);
   if(gl){if(particleBuffer)gl.deleteBuffer(particleBuffer);if(dots)gl.deleteProgram(dots)}
  };
  try{
   gl=c.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false,powerPreference:'low-power'});
   if(gl){
    try{initialize();resizeObserver=new ResizeObserver(resize);resizeObserver.observe(container)}
    catch(error){contextLost=true;console.warn('3D orb unavailable; keeping the particle fallback.',error)}
   }
   if(!gl&&!dashboardMotion)return;
   // V2's Orb is fixed and moves between the Dashboard and header. Observing it
   // during that transition can mark it offscreen while resize clears the canvas.
   if(!followPagePointer&&!dashboardMotion&&typeof IntersectionObserver!=='undefined'){intersectionObserver=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;resume()});intersectionObserver.observe(container)}
   document.addEventListener('visibilitychange',visibility);if(followPagePointer)document.addEventListener('pointermove',pagePointerMove,{passive:true});if(followPagePointer||dashboardMotion)window.addEventListener('blur',pageBlur);reduced.addEventListener('change',preferences);mobile.addEventListener('change',preferences);c.addEventListener('invincible-capture',capture);c.addEventListener('webglcontextlost',lost);c.addEventListener('webglcontextrestored',restored);for(const[name,handler]of Object.entries(events))eventSurface.addEventListener(name,handler);if(gl&&!contextLost)resize();else resume();
   return cleanup;
  }catch(error){console.warn('3D orb unavailable; keeping the particle fallback.',error);cleanup()}
 },[theme,spin,allowDrag,richParticles,followPagePointer,dashboardMotion,interactionSurface]);
 return <div ref={host} className={'focus-orb-3d orb-theme-'+theme} aria-hidden="true"><div className="orb-3d-fallback"/><canvas ref={canvas}/></div>;
}
