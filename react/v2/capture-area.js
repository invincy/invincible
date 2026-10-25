// Loaded only when taking a snapshot. No screen-sharing or remote capture service.
export async function captureArea(rect) {
  const {toCanvas}=await import('html-to-image');
  const root=document.querySelector('.v2-shell'),bounds=root.getBoundingClientRect(),restore=[];
  try {
    // WebGL clears its drawing buffer between frames. Capture a fresh frame into
    // a temporary image without enabling permanent preserveDrawingBuffer.
    for(const canvas of root.querySelectorAll('canvas')) {
      const detail={};canvas.dispatchEvent(new CustomEvent('invincible-capture',{detail}));
      if(!detail.url)continue;
      const image=new Image();image.src=detail.url;await image.decode();
      image.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
      canvas.after(image);const visibility=canvas.style.visibility;canvas.style.visibility='hidden';
      restore.push(()=>{image.remove();canvas.style.visibility=visibility;});
    }
    let timeout;
    const render=toCanvas(root,{width:bounds.width,height:bounds.height,pixelRatio:1,skipFonts:true,
      backgroundColor:'#080e16',filter:node=>!node.hasAttribute?.('data-capture-exclude')});
    let image;try{image=await Promise.race([render,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('Capture took too long. Try a smaller area.')),15000);})]);}finally{clearTimeout(timeout);}
    const result=document.createElement('canvas'),scale=Math.min(1,1100/Math.max(rect.width,rect.height));
    result.width=Math.max(1,Math.round(rect.width*scale));result.height=Math.max(1,Math.round(rect.height*scale));
    result.getContext('2d').drawImage(image,rect.x-bounds.left,rect.y-bounds.top,rect.width,rect.height,0,0,result.width,result.height);
    for(const quality of [.86,.7,.5,.3]) {const url=result.toDataURL('image/webp',quality);if(url.length<=180000)return url;}
    throw Error('This area is too detailed. Select a smaller area and try again.');
  } finally {restore.reverse().forEach(clean=>clean());}
}
