// Physical-map fallback for browsers without WebGL2. Same scene clock and export canvas.
const mercator=([lng,lat])=>[(lng+180)/360,(1-Math.log(Math.tan(Math.PI/4+Math.max(-85,Math.min(85,lat))*Math.PI/360))/Math.PI)/2];
export class CanvasHistoricalMap {
 constructor(host,{night=false}={}){this.host=host;this.night=night;this.center=[80,23];this.zoom=3.2;this.bearing=0;this.pitch=0;this.handlers={};this.data={features:[]};this.canvas=document.createElement('canvas');Object.assign(this.canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%'});host.append(this.canvas);this.ctx=this.canvas.getContext('2d');this.ready=fetch(new URL('./history-data/land.geojson',import.meta.url)).then(r=>{if(!r.ok)throw Error('Physical coastline could not be loaded.');return r.json();}).then(data=>{this.land=data;this.resize();this.emit('load');}).catch(error=>this.emit('error',{error}));}
 on(name,fn){(this.handlers[name]||=[]).push(fn);}once(name,fn){this.on(name,fn);}emit(name,arg){for(const fn of this.handlers[name]||[])fn(arg);}
 addSource(name,{data}){if(name==='history')this.data=data;}addLayer(){}getSource(){return {setData:data=>{this.data=data;this.draw();}};}
 getCanvas(){return this.canvas;}getCenter(){return {toArray:()=>[...this.center]};}getZoom(){return this.zoom;}getBearing(){return this.bearing;}getPitch(){return this.pitch;}
 jumpTo(camera){Object.assign(this,camera);this.draw();}resize(){this.canvas.width=Math.round(this.host.clientWidth*devicePixelRatio);this.canvas.height=Math.round(this.host.clientHeight*devicePixelRatio);this.draw();}
 project(point){const p=mercator(point),c=mercator(this.center),scale=512*2**this.zoom,dx=(p[0]-c[0])*scale,dy=(p[1]-c[1])*scale,angle=-this.bearing*Math.PI/180;return {x:this.host.clientWidth/2+dx*Math.cos(angle)-dy*Math.sin(angle),y:this.host.clientHeight/2+(dx*Math.sin(angle)+dy*Math.cos(angle))*Math.cos(this.pitch*Math.PI/180)};}
 draw(){const ctx=this.ctx,w=this.host.clientWidth,h=this.host.clientHeight;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);ctx.fillStyle=this.night?'#101e2b':'#d8caaa';ctx.fillRect(0,0,w,h);
 const path=coords=>{coords.forEach((c,i)=>{const p=this.project(c);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);});};
 const polygon=rings=>{ctx.beginPath();rings.forEach(r=>{path(r);ctx.closePath();});ctx.fill('evenodd');};
 const feature=f=>{if(f.geometry.type==='Polygon')polygon(f.geometry.coordinates);if(f.geometry.type==='MultiPolygon')f.geometry.coordinates.forEach(polygon);if(f.geometry.type==='LineString'){ctx.beginPath();path(f.geometry.coordinates);ctx.stroke();}};
 ctx.fillStyle=this.night?'#273f4e':'#a99f7f';for(const f of this.land?.features||[])feature(f);ctx.fillStyle='#b26b4a80';ctx.strokeStyle='#ae4b33';ctx.lineWidth=3;for(const f of this.data?.features||[])feature(f);this.emit('render');}
 remove(){this.handlers={};this.canvas.remove();}
}
