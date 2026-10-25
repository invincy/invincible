export const homeView = {x:0, y:0, zoom:1};
export function canvasView(value) {
  return {x:Number.isFinite(value?.x)?value.x:0, y:Number.isFinite(value?.y)?value.y:0,
    zoom:Math.max(.25,Math.min(2,Number.isFinite(value?.zoom)?value.zoom:1))};
}
export function zoomCanvas(view, factor, point) {
  const zoom=canvasView({...view,zoom:view.zoom*factor}).zoom, ratio=zoom/view.zoom;
  return {zoom,x:point.x-(point.x-view.x)*ratio,y:point.y-(point.y-view.y)*ratio};
}
export function selectionBox(start,end) {
  return {x:Math.min(start.x,end.x),y:Math.min(start.y,end.y),width:Math.abs(end.x-start.x),height:Math.abs(end.y-start.y)};
}
export function validateIdea(idea) {
  if(!idea.title?.trim())throw Error('Give this idea a title.');
  if(idea.title.length>160||!idea.category?.trim()||idea.category.length>60||(idea.notes||'').length>5000)throw Error('Use a shorter title, category or note.');
  if(!/^data:image\/(webp|png|jpeg);base64,/.test(idea.image||'')||idea.image.length>180000)throw Error('The snapshot is too large. Capture a smaller area.');
  return {...idea,title:idea.title.trim(),category:idea.category.trim(),view:canvasView(idea.view)};
}
