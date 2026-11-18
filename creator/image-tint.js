// A white/missing image colour preserves the original artwork. A chosen colour
// marks allegiance while retaining highlights, shadows and the original alpha.
const bitmaps=new WeakMap(),urls=new Map();
const tintable=color=>/^#[\da-f]{6}$/i.test(color||'')&&color.toLowerCase()!=='#ffffff';
export function tintPixelBuffer(pixels,color){
 const out=new Uint8ClampedArray(pixels);if(!tintable(color))return out;
 const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)),light=.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
 for(let i=0;i<out.length;i+=4){if(!out[i+3])continue;const y=.2126*out[i]+.7152*out[i+1]+.0722*out[i+2];
  for(let c=0;c<3;c++){const shade=y<=light?rgb[c]*y/Math.max(light,1):rgb[c]+(255-rgb[c])*(y-light)/Math.max(255-light,1);out[i+c]=out[i+c]*.28+shade*.72;}
 }
 return out;
}
export function tintedArtwork(image,color){
 if(!tintable(color))return image;
 const key=color.toLowerCase();let variants=bitmaps.get(image);if(!variants){variants=new Map();bitmaps.set(image,variants);}if(variants.has(key))return variants.get(key);
 const canvas=document.createElement('canvas');canvas.width=image.naturalWidth||image.width;canvas.height=image.naturalHeight||image.height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);const data=ctx.getImageData(0,0,canvas.width,canvas.height);data.data.set(tintPixelBuffer(data.data,key));ctx.putImageData(data,0,0);
 if(variants.size>=8)variants.delete(variants.keys().next().value);variants.set(key,canvas);return canvas;
}
export async function tintedArtworkUrl(url,color){
 if(!tintable(color))return url;const key=url+'|'+color.toLowerCase();if(urls.has(key))return urls.get(key);
 const result=(async()=>{const image=new Image();image.crossOrigin='anonymous';image.src=url;await image.decode();return tintedArtwork(image,color).toDataURL('image/png');})();
 if(urls.size>=64)urls.delete(urls.keys().next().value);urls.set(key,result);
 try{return await result;}catch(error){urls.delete(key);throw error;}
}
