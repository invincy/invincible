import{useEffect,useRef}from'react';

// A planet-like field made from irregular particle spirals, rendered without a 3D framework.
function shader(gl,type,source){const value=gl.createShader(type);gl.shaderSource(value,source);gl.compileShader(value);if(!gl.getShaderParameter(value,gl.COMPILE_STATUS)){gl.deleteShader(value);throw Error('Orb shader could not compile')}return value}
function program(gl,vertex,fragment){const value=gl.createProgram(),vs=shader(gl,gl.VERTEX_SHADER,vertex),fs=shader(gl,gl.FRAGMENT_SHADER,fragment);gl.attachShader(value,vs);gl.attachShader(value,fs);gl.linkProgram(value);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(value,gl.LINK_STATUS)){gl.deleteProgram(value);throw Error('Orb program could not link')}return value}
// Every visible mark belongs to the particle field; there is no solid mesh or orbit ring.
const particleVertex=`attribute vec3 position;attribute vec2 appearance;uniform mat4 projection;uniform float pixelRatio;uniform float time;uniform float style;uniform vec2 rotation;uniform vec3 influence;varying float opacity;void main(){
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
vec3 p=vec3(radius*cos(latitude)*cos(longitude),radius*sin(latitude),radius*cos(latitude)*sin(longitude));
float tilt=(hash-.5)*mix(1.45,2.1,max(ring,cell)),ct=cos(tilt),st=sin(tilt);p=vec3(p.x,p.y*ct-p.z*st,p.y*st+p.z*ct);
float edge=smoothstep(0.0,.075,travel)*(1.0-smoothstep(.925,1.0,travel));
float center=mix(.48,1.0,smoothstep(.0,.42,length(p.xy)));
float packetWave=.5+.5*sin(angle*5.0-time*.82+hash*tau);
float packet=pow(packetWave,7.0);
float secondary=pow(.5+.5*sin(angle*3.0-time*.54+hash*19.0),10.0);
p*=1.0+.035*packet+.018*secondary;
vec3 resting=p;
float breathing=.018*sin(time*.52)+.012*sin(time*.31+1.7);
float disturbance=.022*sin(time*.67+resting.y*5.0+resting.z*2.0)+.014*sin(time*.43+resting.x*7.0-resting.z*3.0);
p*=1.0+breathing+disturbance;
p+=vec3(.018*sin(time*.58+resting.y*4.0),.015*sin(time*.49+resting.z*5.0),.018*sin(time*.55+resting.x*4.5));
float autoPitch=.09*sin(time*.28),autoYaw=time*.052,cap=cos(autoPitch),sap=sin(autoPitch),cay=cos(autoYaw),say=sin(autoYaw);
p=vec3(p.x,p.y*cap-p.z*sap,p.y*sap+p.z*cap);p=vec3(p.x*cay+p.z*say,p.y,-p.x*say+p.z*cay);
float cx=cos(rotation.y),sx=sin(rotation.y),cy=cos(rotation.x),sy=sin(rotation.x);
p=vec3(p.x,p.y*cx-p.z*sx,p.y*sx+p.z*cx);p=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);
vec2 delta=p.xy-influence.xy;float pull=exp(-dot(delta,delta)*3.0)*influence.z;
p.xy+=delta*pull*0.10;p.z+=pull*0.12;
vec4 projected=projection*vec4(p,1.0);gl_Position=projected;float size=mix(1.0,1.22,step(.5,style)*(1.0-step(1.5,style)));size*=1.0+.42*packet+.2*secondary;gl_PointSize=max(1.0,appearance.x*size*pixelRatio*4.6/projected.w);opacity=appearance.y*edge*center*(0.35+0.65*smoothstep(-1.0,1.0,p.z));opacity*=.48+1.05*packet+.48*secondary;opacity*=mix(1.0,.68,step(1.5,style)*(1.0-step(.76,appearance.y)));}`;
const particleFragment=`precision mediump float;uniform vec3 colorA;uniform vec3 colorB;varying float opacity;void main(){float radius=length(gl_PointCoord-vec2(0.5))*2.0;if(radius>1.0)discard;float core=1.0-smoothstep(0.0,1.0,radius);gl_FragColor=vec4(mix(colorA,colorB,core),core*opacity);}`;
function perspective(aspect){const f=1/Math.tan(Math.PI/8),near=.1,far=30,distance=4.6;return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,(far+near)/(near-far)*-distance+2*far*near/(near-far),distance])}
const palettes={cyan:{style:0,a:[.08,.55,.78],b:[.55,1,1]},emerald:{style:1,a:[.03,.32,.12],b:[.46,1,.62]},gold:{style:2,a:[.42,.16,.025],b:[1,.85,.38]}};
export function FocusOrb({theme='cyan'}){
 const canvas=useRef(null),host=useRef(null);
 useEffect(()=>{
  const c=canvas.current,container=host.current,surface=container.parentElement;let gl,dots,particleBuffer,frame=null,resizeObserver,intersectionObserver;let disposed=false,inView=true,contextLost=false,start=performance.now(),last=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:1024px)');
  const stop=()=>{if(frame!==null)cancelAnimationFrame(frame);frame=null};
  try{
   gl=c.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'low-power'});if(!gl)return;
   dots=program(gl,particleVertex,particleFragment);particleBuffer=gl.createBuffer();
   const dotPosition=gl.getAttribLocation(dots,'position'),dotAppearance=gl.getAttribLocation(dots,'appearance'),dotProjection=gl.getUniformLocation(dots,'projection'),dotRatio=gl.getUniformLocation(dots,'pixelRatio'),dotTime=gl.getUniformLocation(dots,'time');
   const dotRotation=gl.getUniformLocation(dots,'rotation'),dotInfluence=gl.getUniformLocation(dots,'influence'),dotStyle=gl.getUniformLocation(dots,'style'),dotColorA=gl.getUniformLocation(dots,'colorA'),dotColorB=gl.getUniformLocation(dots,'colorB');
   const palette=palettes[theme]||palettes.cyan;
   let particleCount=0,particleMobile=null;
   let projection,ratio=1,drag=null,yaw=0,pitch=0,velocityX=0,velocityY=0,hoverX=0,hoverY=0,hoverStrength=0,targetX=0,targetY=0,targetStrength=0;
   const pointerLocation=event=>{const rect=surface.getBoundingClientRect();targetX=((event.clientX-rect.left)/rect.width-.5)*2.5;targetY=(.5-(event.clientY-rect.top)/rect.height)*2.5;targetStrength=1};
   const pointerDown=event=>{if(!event.isPrimary||event.button!==0||drag||event.target.closest('button'))return;drag={id:event.pointerId,x:event.clientX,y:event.clientY};velocityX=velocityY=0;surface.setPointerCapture(event.pointerId);surface.dataset.dragging='true';pointerLocation(event);resume()};
   const pointerMove=event=>{
    if(drag&&event.pointerId!==drag.id)return;
    if(event.pointerType==='mouse'||drag)pointerLocation(event);
    if(drag){const rect=surface.getBoundingClientRect();velocityX=(event.clientX-drag.x)/rect.width*3.5;velocityY=(event.clientY-drag.y)/rect.height*3.5;yaw+=velocityX;pitch+=velocityY;drag.x=event.clientX;drag.y=event.clientY}
    if(reduced.matches)resume();
   };
   const pointerUp=event=>{if(!drag||event.pointerId!==drag.id)return;drag=null;delete surface.dataset.dragging;if(surface.hasPointerCapture(event.pointerId))surface.releasePointerCapture(event.pointerId);if(event.pointerType!=='mouse')targetStrength=0;if(event.type==='pointercancel'||reduced.matches)velocityX=velocityY=0;resume()};
   const pointerLeave=()=>{if(!drag){targetStrength=0;if(reduced.matches)resume()}};
   const lostCapture=event=>{if(drag?.id===event.pointerId){drag=null;velocityX=velocityY=0;targetStrength=0;delete surface.dataset.dragging;resume()}};
   const events={pointerdown:pointerDown,pointermove:pointerMove,pointerup:pointerUp,pointercancel:pointerUp,pointerleave:pointerLeave,lostpointercapture:lostCapture};
   const render=timestamp=>{
    frame=null;if(disposed||contextLost||document.hidden||!inView)return;
    const interval=mobile.matches?1000/30:1000/45;if(!reduced.matches&&timestamp-last<interval){frame=requestAnimationFrame(render);return}const dt=Math.min((timestamp-last)/1000||1/45,.05);last=timestamp;
    const time=reduced.matches?8:(timestamp-start)/1000;
    gl.viewport(0,0,c.width,c.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.disable(gl.DEPTH_TEST);
    const smoothing=reduced.matches?1:1-Math.exp(-dt*9);
    hoverX+=(targetX-hoverX)*smoothing;hoverY+=(targetY-hoverY)*smoothing;hoverStrength+=(targetStrength-hoverStrength)*smoothing;
    if(!drag&&!reduced.matches){const decay=Math.exp(-dt*5);yaw+=velocityX*dt*30;pitch+=velocityY*dt*30;velocityX*=decay;velocityY*=decay}
    if(particleMobile!==mobile.matches){
     particleMobile=mobile.matches;
     const streams=particleMobile?320:300,trailCount=particleMobile?120:140,wideStreams=18,wideTrailCount=320,cellStreams=18,cellTrailCount=420,flecks=3800;
     particleCount=streams*trailCount+wideStreams*wideTrailCount+cellStreams*cellTrailCount+flecks;
     const particles=new Float32Array(particleCount*5);let offset=0;
     for(let stream=0;stream<streams;stream++){
      const seed=(stream+.5)/streams,phase=(stream*.61803398875)%1,speed=.065+.02*(.5+.5*Math.sin(stream*1.71));
      for(let trail=0;trail<trailCount;trail++){
       particles.set([phase-trail*.0025,seed,speed,trail===0?5.5:3.6,(trail===0?1:.68)*(1-trail/trailCount)],offset);offset+=5;
      }
     }
     for(let stream=0;stream<wideStreams;stream++){
      const seed=(stream+.5)/wideStreams+2,phase=(stream*.754877666)%1,speed=.062+.018*(.5+.5*Math.sin(stream*2.13));
      for(let trail=0;trail<wideTrailCount;trail++){
       particles.set([phase-trail*.0028,seed,speed,trail===0?5.2:3.4,(trail===0?.95:.58)*(1-trail/wideTrailCount*.48)],offset);offset+=5;
      }
     }
     for(let stream=0;stream<cellStreams;stream++){
      const seed=(stream+.5)/cellStreams+4,phase=(stream*.569840291)%1,speed=.064+.016*(.5+.5*Math.sin(stream*1.93));
      for(let trail=0;trail<cellTrailCount;trail++){
       particles.set([phase-trail*.00215,seed,speed,trail===0?8.5:6.2,(trail===0?1:.76)*(1-trail/cellTrailCount*.38)],offset);offset+=5;
      }
     }
     for(let dot=0;dot<flecks;dot++){
      particles.set([(dot*.61803398875)%1,((dot+.5)*.754877666)%1,.064+.018*((dot*.41421356)%1),dot%11===0?4.0:2.8,.45+.30*Math.sin(dot*7.13)**2],offset);offset+=5;
     }
     gl.bindBuffer(gl.ARRAY_BUFFER,particleBuffer);gl.bufferData(gl.ARRAY_BUFFER,particles,gl.STATIC_DRAW);
    }
    const autoInfluenceX=Math.cos(time*.43)*.72,autoInfluenceY=Math.sin(time*.37)*.58,manualMix=Math.min(1,hoverStrength),influenceX=autoInfluenceX*(1-manualMix)+hoverX*manualMix,influenceY=autoInfluenceY*(1-manualMix)+hoverY*manualMix,influenceStrength=.52+.48*manualMix;
    gl.useProgram(dots);gl.uniformMatrix4fv(dotProjection,false,projection);gl.uniform1f(dotRatio,ratio);gl.uniform1f(dotTime,time);gl.uniform1f(dotStyle,palette.style);gl.uniform3fv(dotColorA,palette.a);gl.uniform3fv(dotColorB,palette.b);gl.uniform2f(dotRotation,yaw+hoverX*hoverStrength*.10,pitch-hoverY*hoverStrength*.10);gl.uniform3f(dotInfluence,influenceX,influenceY,influenceStrength);gl.bindBuffer(gl.ARRAY_BUFFER,particleBuffer);gl.enableVertexAttribArray(dotPosition);gl.vertexAttribPointer(dotPosition,3,gl.FLOAT,false,20,0);gl.enableVertexAttribArray(dotAppearance);gl.vertexAttribPointer(dotAppearance,2,gl.FLOAT,false,20,12);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.depthMask(false);gl.drawArrays(gl.POINTS,0,particleCount);gl.depthMask(true);
    container.dataset.ready='true';if(!reduced.matches)frame=requestAnimationFrame(render);
   };
   const resume=()=>{stop();if(!disposed&&!contextLost&&!document.hidden&&inView)frame=requestAnimationFrame(render)};
   const resize=()=>{const rect=container.getBoundingClientRect();if(!rect.width||!rect.height)return;ratio=Math.min(devicePixelRatio||1,mobile.matches?1:1.5);delete container.dataset.ready;c.width=Math.round(rect.width*ratio);c.height=Math.round(rect.height*ratio);projection=perspective(rect.width/rect.height);resume()};
   resizeObserver=new ResizeObserver(resize);resizeObserver.observe(container);
   if(typeof IntersectionObserver!=='undefined'){intersectionObserver=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;resume()});intersectionObserver.observe(container)}
   const visibility=()=>resume(),preferences=()=>resize(),lost=event=>{event.preventDefault();contextLost=true;stop();delete container.dataset.ready};
   document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',preferences);mobile.addEventListener('change',preferences);c.addEventListener('webglcontextlost',lost);for(const [name,handler]of Object.entries(events))surface.addEventListener(name,handler);resize();
   return()=>{disposed=true;stop();for(const [name,handler]of Object.entries(events))surface.removeEventListener(name,handler);if(drag&&surface.hasPointerCapture(drag.id))surface.releasePointerCapture(drag.id);delete surface.dataset.dragging;resizeObserver.disconnect();intersectionObserver?.disconnect();document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',preferences);mobile.removeEventListener('change',preferences);c.removeEventListener('webglcontextlost',lost);gl.deleteBuffer(particleBuffer);gl.deleteProgram(dots)};
  }catch(error){console.warn('3D orb unavailable; keeping the particle fallback.',error);stop();resizeObserver?.disconnect();intersectionObserver?.disconnect();if(gl){if(particleBuffer)gl.deleteBuffer(particleBuffer);if(dots)gl.deleteProgram(dots)}}
 },[theme]);
 return <div ref={host} className={'focus-orb-3d orb-theme-'+theme} aria-hidden="true"><div className="orb-3d-fallback"/><canvas ref={canvas}/></div>;
}
