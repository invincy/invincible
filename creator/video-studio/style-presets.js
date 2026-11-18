import {DEFAULT_PRESENTATION} from '../map-defaults.js?v=2026110903';
import {tintedArtwork} from '../image-tint.js?v=2026111813';

const deepFreeze=value=>{if(value&&typeof value==='object'){Object.freeze(value);for(const child of Object.values(value))deepFreeze(child);}return value;};
const clone=value=>structuredClone(value);
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const color=value=>typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value);
const bounded=(value,min,max)=>Number.isFinite(value)&&value>=min&&value<=max;
const ALLOWED_ROLES=new Set(['auto','title','subtitle','date','label','body','number','portrait','ornament','divider']);

export const BUILTIN_STYLE_PRESETS=deepFreeze([
 {
  id:'history-archive-gold',name:'Historical Archive',category:'History',description:'Warm archival type, grounded portraits, high-contrast labels and clean gold corner brackets.',
  tokens:{palette:{background:'#090F18',foreground:'#F4EAD7',muted:'#AEB5BC',accent:'#D6B25E',plate:'#101B2B',shadow:'#02060A'},typography:{fontFamily:'Invincible Sans',titleSize:86,subtitleSize:48,labelSize:52,dateSize:42,titleWeight:700,bodyWeight:600,uppercaseTitles:true,letterSpacing:1.1},plate:{enabled:true,opacity:.88,borderColor:'#D6B25E',borderWidth:1.5,radius:18,paddingX:22,paddingY:13},ornament:{kind:'corner-brackets',color:'#D6B25E',opacity:.78,inset:42,length:104,lineWidth:3},image:{kind:'grounded-portrait',borderColor:'#D6B25E',borderWidth:1.5,radius:18,shadowBlur:30,groundOpacity:.34},motion:{entrance:'fade-rise',duration:.36,easing:'smooth'},map:{saturation:-.18,contrast:.24,labelStyle:'card',cardColor:'#101B2B',textColor:'#F4EAD7',accentColor:'#D6B25E',reliefStrength:.48,terrainTint:'#6E765C',cameraEasing:'smooth'}}
 },
 {
  id:'geography-field-atlas',name:'Field Atlas',category:'Geography',description:'Natural terrain, blue geographic accents, crisp labels and restrained survey marks.',
  tokens:{palette:{background:'#071319',foreground:'#EDF5F2',muted:'#A8C1BE',accent:'#65B7E6',plate:'#10252B',shadow:'#02090C'},typography:{fontFamily:'Invincible Sans',titleSize:82,subtitleSize:46,labelSize:52,dateSize:40,titleWeight:700,bodyWeight:600,uppercaseTitles:false,letterSpacing:.6},plate:{enabled:true,opacity:.86,borderColor:'#65B7E6',borderWidth:1.25,radius:16,paddingX:20,paddingY:12},ornament:{kind:'survey-corners',color:'#65B7E6',opacity:.48,inset:40,length:76,lineWidth:2},image:{kind:'grounded-portrait',borderColor:'#65B7E6',borderWidth:1,radius:16,shadowBlur:24,groundOpacity:.25},motion:{entrance:'fade-rise',duration:.32,easing:'smooth'},map:{saturation:.02,contrast:.18,labelStyle:'card',cardColor:'#10252B',textColor:'#EDF5F2',accentColor:'#65B7E6',reliefStrength:.55,terrainTint:'#617A68',cameraEasing:'smooth'}}
 },
 {
  id:'science-signal-blueprint',name:'Signal Blueprint',category:'Science',description:'Precise cyan hierarchy, quiet grid cues and diagram-friendly motion.',
  tokens:{palette:{background:'#071B39',foreground:'#F3FAFF',muted:'#A8C7D8',accent:'#42D6D0',plate:'#0C2946',shadow:'#020A18'},typography:{fontFamily:'Invincible Sans',titleSize:82,subtitleSize:46,labelSize:50,dateSize:40,titleWeight:700,bodyWeight:600,uppercaseTitles:true,letterSpacing:.8},plate:{enabled:true,opacity:.84,borderColor:'#42D6D0',borderWidth:1.25,radius:14,paddingX:20,paddingY:12},ornament:{kind:'technical-corners',color:'#42D6D0',opacity:.45,inset:38,length:68,lineWidth:2},image:{kind:'framed',borderColor:'#42D6D0',borderWidth:1.25,radius:14,shadowBlur:22,groundOpacity:.18},motion:{entrance:'fade-rise',duration:.28,easing:'smooth'},map:{saturation:-.08,contrast:.2,labelStyle:'halo',cardColor:'#0C2946',textColor:'#F3FAFF',accentColor:'#42D6D0',reliefStrength:.4,terrainTint:'#527B78',cameraEasing:'smooth'}}
 },
 {
  id:'finance-ledger-green',name:'Executive Ledger',category:'Finance',description:'Calm deep-green surfaces, clear numeric emphasis and disciplined dividers.',
  tokens:{palette:{background:'#071A16',foreground:'#F2F7F2',muted:'#AEC0B5',accent:'#D4B96B',plate:'#102820',shadow:'#020806'},typography:{fontFamily:'Invincible Sans',titleSize:78,subtitleSize:44,labelSize:48,dateSize:38,titleWeight:700,bodyWeight:600,uppercaseTitles:false,letterSpacing:.4},plate:{enabled:true,opacity:.9,borderColor:'#D4B96B',borderWidth:1,radius:14,paddingX:20,paddingY:12},ornament:{kind:'ledger-corners',color:'#D4B96B',opacity:.4,inset:42,length:62,lineWidth:2},image:{kind:'framed',borderColor:'#D4B96B',borderWidth:1,radius:14,shadowBlur:20,groundOpacity:.18},motion:{entrance:'fade-rise',duration:.3,easing:'smooth'},map:{saturation:-.16,contrast:.2,labelStyle:'card',cardColor:'#102820',textColor:'#F2F7F2',accentColor:'#D4B96B',reliefStrength:.38,terrainTint:'#58705E',cameraEasing:'smooth'}}
 }
]);

export const STYLE_PRESET_IDS=Object.freeze(BUILTIN_STYLE_PRESETS.map(item=>item.id));
const BUILTIN_BY_ID=new Map(BUILTIN_STYLE_PRESETS.map(item=>[item.id,item]));

function assertKeys(value,allowed,label){if(!object(value))throw Error(`${label} must be an object.`);for(const key of Object.keys(value))if(!allowed.includes(key))throw Error(`Unsupported ${label} setting: ${key}.`);}
function validateTokens(tokens,{partial=false}={}){
 assertKeys(tokens,['palette','typography','plate','ornament','image','motion','map'],'style tokens');
 const need=(section,keys)=>{if(!partial&&!object(tokens[section]))throw Error(`Style tokens need ${section}.`);if(tokens[section])assertKeys(tokens[section],keys,section);};
 need('palette',['background','foreground','muted','accent','plate','shadow']);
 need('typography',['fontFamily','titleSize','subtitleSize','labelSize','dateSize','titleWeight','bodyWeight','uppercaseTitles','letterSpacing']);
 need('plate',['enabled','opacity','borderColor','borderWidth','radius','paddingX','paddingY']);
 need('ornament',['kind','color','opacity','inset','length','lineWidth']);
 need('image',['kind','borderColor','borderWidth','radius','shadowBlur','groundOpacity']);
 need('motion',['entrance','duration','easing']);
 need('map',['saturation','contrast','labelStyle','cardColor','textColor','accentColor','reliefStrength','terrainTint','cameraEasing']);
 for(const value of Object.values(tokens.palette||{}))if(!color(value))throw Error('Style palette values must be #rrggbb.');
 const type=tokens.typography||{};if(type.fontFamily!==undefined&&(!['Invincible Sans','Invincible Hindi','system-ui','serif','monospace'].includes(type.fontFamily)))throw Error('Choose a bundled style font.');
 for(const key of ['titleSize','subtitleSize','labelSize','dateSize'])if(type[key]!==undefined&&!bounded(type[key],16,180))throw Error(`Invalid typography ${key}.`);
 for(const key of ['titleWeight','bodyWeight'])if(type[key]!==undefined&&!bounded(type[key],100,900))throw Error(`Invalid typography ${key}.`);
 if(type.uppercaseTitles!==undefined&&typeof type.uppercaseTitles!=='boolean')throw Error('uppercaseTitles must be boolean.');if(type.letterSpacing!==undefined&&!bounded(type.letterSpacing,0,8))throw Error('Invalid letter spacing.');
 const plate=tokens.plate||{},ornament=tokens.ornament||{},image=tokens.image||{},motion=tokens.motion||{},map=tokens.map||{};
 for(const key of ['borderColor'])if(plate[key]!==undefined&&!color(plate[key]))throw Error('Invalid plate color.');if(plate.enabled!==undefined&&typeof plate.enabled!=='boolean')throw Error('plate.enabled must be boolean.');
 for(const [value,min,max,label] of [[plate.opacity,0,1,'plate opacity'],[plate.borderWidth,0,12,'plate border width'],[plate.radius,0,80,'plate radius'],[plate.paddingX,0,80,'plate padding'],[plate.paddingY,0,80,'plate padding'],[ornament.opacity,0,1,'ornament opacity'],[ornament.inset,0,240,'ornament inset'],[ornament.length,10,300,'ornament length'],[ornament.lineWidth,.5,12,'ornament line width'],[image.borderWidth,0,12,'image border width'],[image.radius,0,80,'image radius'],[image.shadowBlur,0,100,'image shadow'],[image.groundOpacity,0,1,'image ground opacity'],[motion.duration,0,3,'motion duration'],[map.saturation,-1,1,'map saturation'],[map.contrast,-1,1,'map contrast'],[map.reliefStrength,0,1,'map relief']])if(value!==undefined&&!bounded(value,min,max))throw Error(`Invalid ${label}.`);
 for(const value of [ornament.color,image.borderColor,map.cardColor,map.textColor,map.accentColor,map.terrainTint])if(value!==undefined&&!color(value))throw Error('Style colors must be #rrggbb.');
 if(ornament.kind!==undefined&&!['none','corner-brackets','survey-corners','technical-corners','ledger-corners'].includes(ornament.kind))throw Error('Unsupported ornament.');
 if(image.kind!==undefined&&!['none','framed','grounded-portrait'].includes(image.kind))throw Error('Unsupported image treatment.');
 if(motion.entrance!==undefined&&!['none','fade','fade-rise'].includes(motion.entrance))throw Error('Unsupported entrance.');if(motion.easing!==undefined&&!['linear','smooth'].includes(motion.easing))throw Error('Unsupported style easing.');
 if(map.labelStyle!==undefined&&!['halo','card','callout'].includes(map.labelStyle))throw Error('Unsupported map label style.');if(map.cameraEasing!==undefined&&!['linear','smooth'].includes(map.cameraEasing))throw Error('Unsupported map camera easing.');
 return tokens;
}

function merge(base,override){const out=clone(base);for(const [key,value] of Object.entries(override||{})){if(object(value)&&object(out[key]))out[key]=merge(out[key],value);else out[key]=clone(value);}return out;}
export function validateStylePreset(input,{custom=false}={}){
 const preset=clone(input);assertKeys(preset,custom?['id','name','category','description','baseId','tokens']:['id','name','category','description','tokens'],'style preset');
 if(typeof preset.id!=='string'||!(/^[a-z][a-z0-9-]{2,79}$/).test(preset.id))throw Error('Style preset IDs use lowercase letters, numbers and hyphens.');
 for(const key of ['name','category','description'])if(typeof preset[key]!=='string'||!preset[key].trim()||preset[key].length>(key==='description'?300:80))throw Error(`Invalid style preset ${key}.`);
 if(custom){if(!preset.id.startsWith('user-'))throw Error('Saved preset IDs must start with user-.');if(!BUILTIN_BY_ID.has(preset.baseId))throw Error('Saved presets need a built-in baseId.');validateTokens(preset.tokens,{partial:true});}
 else validateTokens(preset.tokens);
 return preset;
}
export function validateStyleLibrary(manifest){
 if(manifest.visualStylePresetId!==undefined&&typeof manifest.visualStylePresetId!=='string')throw Error('visualStylePresetId must be a string.');
 if(manifest.visualStylePresets!==undefined){if(!Array.isArray(manifest.visualStylePresets)||manifest.visualStylePresets.length>20)throw Error('Use up to 20 saved visual presets.');const ids=new Set();for(const preset of manifest.visualStylePresets){validateStylePreset(preset,{custom:true});if(ids.has(preset.id)||BUILTIN_BY_ID.has(preset.id))throw Error('Visual preset IDs must be unique.');ids.add(preset.id);}}
 const known=new Set([...STYLE_PRESET_IDS,...(manifest.visualStylePresets||[]).map(item=>item.id)]);if(manifest.visualStylePresetId&&!known.has(manifest.visualStylePresetId))throw Error('Unknown video visual preset.');
 for(const scene of manifest.scenes||[]){if(scene.visualStylePresetId&&!known.has(scene.visualStylePresetId))throw Error(`Unknown scene visual preset: ${scene.visualStylePresetId}`);if(scene.styleOverrides)validateTokens(scene.styleOverrides,{partial:true});for(const layer of scene.overlays||[]){if(layer.styleRole!==undefined&&!ALLOWED_ROLES.has(layer.styleRole))throw Error('Unsupported layer styleRole.');if(layer.visualStylePresetId&&!known.has(layer.visualStylePresetId))throw Error(`Unknown layer visual preset: ${layer.visualStylePresetId}`);if(layer.styleOverrides)validateTokens(layer.styleOverrides,{partial:true});}}
 return manifest;
}
export function listStylePresets(manifest={}){return [...BUILTIN_STYLE_PRESETS,...(manifest.visualStylePresets||[]).map(item=>{const base=BUILTIN_BY_ID.get(item.baseId);return{...item,tokens:merge(base.tokens,item.tokens),custom:true};})].map(clone);}
export function getStylePreset(manifest,id){const preset=listStylePresets(manifest).find(item=>item.id===id);if(!preset)throw Error('Unknown visual style preset: '+id);return preset;}
export function resolveSceneStyle(manifest,scene,layer=null){const id=layer?.visualStylePresetId||scene?.visualStylePresetId||manifest.visualStylePresetId;if(!id)return null;let preset=getStylePreset(manifest,id);let tokens=preset.tokens;tokens=merge(tokens,scene?.styleOverrides);tokens=merge(tokens,layer?.styleOverrides);return{...preset,id,tokens};}
export function applyStylePreset(manifest,presetId,{sceneId=null}={}){getStylePreset(manifest,presetId);const next=clone(manifest);if(sceneId){const scene=next.scenes.find(item=>item.id===sceneId);if(!scene)throw Error('Scene does not exist: '+sceneId);scene.visualStylePresetId=presetId;}else next.visualStylePresetId=presetId;return validateStyleLibrary(next);}
export function updateSavedStylePreset(manifest,preset){const next=clone(manifest),value=validateStylePreset(preset,{custom:true});next.visualStylePresets??=[];const index=next.visualStylePresets.findIndex(item=>item.id===value.id);if(index<0)next.visualStylePresets.push(value);else next.visualStylePresets[index]=value;return validateStyleLibrary(next);}

const rgba=(hex,alpha)=>{const value=parseInt(hex.slice(1),16);return `rgba(${value>>16},${value>>8&255},${value&255},${alpha})`;};
const roundRect=(ctx,x,y,w,h,r)=>{const radius=Math.min(r,w/2,h/2);ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,radius):(ctx.rect(x,y,w,h));};
export function inferStyleRole(layer){if(layer.styleRole&&layer.styleRole!=='auto')return layer.styleRole;if(layer.type==='image')return 'portrait';if(layer.type==='line'||layer.type==='arrow')return 'divider';if(layer.type!=='text')return 'body';const id=String(layer.id||'').toLowerCase();if(/date|year|time/.test(id))return 'date';if(/sub|deck|kicker/.test(id))return 'subtitle';if(/title|headline|heading/.test(id)||Number(layer.fontSize)>=72)return 'title';if(/number|stat|amount/.test(id)||/^\s*[₹$€£]?\d/.test(layer.text||''))return 'number';return Number(layer.fontSize)>=42?'label':'body';}
export function styledLayerFrame(layer,pose,time,style){if(!style||layer.keyframes?.length)return pose;const motion=style.tokens.motion,start=layer.startSeconds??0,duration=motion.duration||0;if(!duration||motion.entrance==='none')return pose;let u=Math.max(0,Math.min(1,(time-start)/duration));if(motion.easing==='smooth')u=u*u*(3-2*u);const next={...pose,opacity:pose.opacity*u};if(motion.entrance==='fade-rise')next.y+=(1-u)*.018;return next;}
export function drawStyleFrame(ctx,style){if(!style)return;const {width:w,height:h}=ctx.canvas,unit=Math.min(w,h)/1080,{palette,ornament}=style.tokens;if(ornament.kind==='none')return;const inset=ornament.inset*unit,length=ornament.length*unit;ctx.save();ctx.strokeStyle=ornament.color;ctx.globalAlpha=ornament.opacity;ctx.lineWidth=ornament.lineWidth*unit;ctx.lineCap='square';ctx.lineJoin='miter';const corners=[[inset,inset,1,1],[w-inset,inset,-1,1],[inset,h-inset,1,-1],[w-inset,h-inset,-1,-1]];for(const [x,y,sx,sy]of corners){ctx.beginPath();ctx.moveTo(x+sx*length,y);ctx.lineTo(x,y);ctx.lineTo(x,y+sy*length);ctx.stroke();}ctx.globalAlpha=.16;const g=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.2,w/2,h/2,Math.max(w,h)*.72);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,palette.shadow);ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.restore();}
export function drawStyledLayer(ctx,layer,pose,style,images,drawBase){
 if(!style)return drawBase();const role=inferStyleRole(layer),t=style.tokens,{width,height}=ctx.canvas,unit=Math.min(width,height)/1080,w=(pose.width??.8)*width,h=(pose.height??.3)*height;
 ctx.save();ctx.globalAlpha*=pose.opacity;ctx.translate(pose.x*width,pose.y*height);ctx.rotate(pose.rotation*Math.PI/180);ctx.scale(pose.scale,pose.scale);
 if(layer.type==='text'){
  const type=t.typography,size=(layer.fontSize??({title:type.titleSize,subtitle:type.subtitleSize,label:type.labelSize,date:type.dateSize,number:type.titleSize}[role]||type.labelSize))*unit,family=layer.fontFamily||(type.fontFamily==='Invincible Sans'?'"Invincible Sans"':type.fontFamily),weight=layer.fontWeight??(role==='title'||role==='number'?type.titleWeight:type.bodyWeight),align=layer.textAlign||'center',text=type.uppercaseTitles&&role==='title'?String(layer.text).toUpperCase():String(layer.text),lines=text.split('\n'),lineHeight=size*1.28;
  ctx.font=`${weight} ${size}px ${family}`;const measured=Math.min(w,Math.max(...lines.map(line=>ctx.measureText(line).width),1)),plate=t.plate;if(plate.enabled&&['title','subtitle','date','label','number'].includes(role)){const pw=measured+plate.paddingX*2*unit,ph=lines.length*lineHeight+plate.paddingY*2*unit;roundRect(ctx,-pw/2,-ph/2,pw,ph,plate.radius*unit);ctx.fillStyle=rgba(t.palette.plate,plate.opacity);ctx.fill();if(plate.borderWidth){ctx.strokeStyle=plate.borderColor;ctx.lineWidth=plate.borderWidth*unit;ctx.stroke();}}
  ctx.fillStyle=layer.color||t.palette.foreground;ctx.textAlign=align;ctx.textBaseline='middle';const x=align==='left'?-w/2:align==='right'?w/2:0;lines.forEach((line,index)=>ctx.fillText(line,x,(index-(lines.length-1)/2)*lineHeight,w));ctx.restore();return;
 }
 if(layer.type==='image'){
  const image=images.get(layer.assetId);if(!image){ctx.restore();throw Error('Overlay artwork did not load.');}const treatment=t.image,scale=Math.min(w/image.width,h/image.height),dw=image.width*scale,dh=image.height*scale;if(treatment.kind==='grounded-portrait'){ctx.save();ctx.globalAlpha*=treatment.groundOpacity;ctx.fillStyle=t.palette.shadow;ctx.filter=`blur(${Math.max(1,treatment.shadowBlur*.5*unit)}px)`;ctx.beginPath();ctx.ellipse(0,dh*.42,dw*.42,Math.max(5,dh*.055),0,0,Math.PI*2);ctx.fill();ctx.restore();}
  ctx.save();ctx.shadowColor=rgba(t.palette.shadow,.72);ctx.shadowBlur=treatment.shadowBlur*unit;roundRect(ctx,-dw/2,-dh/2,dw,dh,treatment.radius*unit);ctx.clip();ctx.drawImage(tintedArtwork(image,layer.tintColor),-dw/2,-dh/2,dw,dh);ctx.restore();if(treatment.borderWidth){roundRect(ctx,-dw/2,-dh/2,dw,dh,treatment.radius*unit);ctx.strokeStyle=treatment.borderColor;ctx.lineWidth=treatment.borderWidth*unit;ctx.stroke();}ctx.restore();return;
 }
 ctx.restore();drawBase();
}
export function applyStyleToMapProject(project,style){if(!style)return project;const next=clone(project),map=next.historicalMap,t=style.tokens;map.basemap={...(map.basemap||{}),saturation:t.map.saturation,contrast:t.map.contrast};const p={...DEFAULT_PRESENTATION,...(map.presentation||{}),presetId:'documentary-terrain',presetVersion:2,fontFamily:'"Invincible Sans", "Invincible Hindi", sans-serif',textColor:t.map.textColor,cardColor:t.map.cardColor,accentColor:t.map.accentColor,labelStyle:t.map.labelStyle,reliefStrength:t.map.reliefStrength,reliefAccent:t.map.terrainTint};map.presentation=p;map.cameraDefaults={...(map.cameraDefaults||{}),easing:t.map.cameraEasing};return next;}
