// Bundled, licensed font faces with private aliases preserve older project font choices.
let ready;
export function ensureDocumentaryFonts(){
 return ready??=Promise.all([['Invincible Sans','noto-sans-600.ttf'],['Invincible Hindi','noto-devanagari-600.ttf']].map(async([family,file])=>{const face=new FontFace(family,'url('+new URL('./fonts/'+file,import.meta.url).href+')',{weight:'400 800'});await face.load();document.fonts.add(face);})).catch(error=>{ready=null;throw Error('Documentary fonts could not load. Retry before exporting: '+error.message);});
}
