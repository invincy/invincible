export function normalizeProjectRoute(area='',tool=''){
 const name=String(area||'');
 if(name==='Studio')return{area:'Video Studio',tool:tool||'map-review'};
 if(['Script & scenes','Sync plan'].includes(name))return{area:'Storyboard',tool:''};
 if(name==='Motion Studio')return{area:'Video Studio',tool:''};
 return{area:name,tool:String(tool||'')};
}

export function defaultProjectRoute(project){
 const hasAppliedPlan=!!project?.scriptWorkspace?.transcript?.segments?.length||!!project?.pluginDraft?.creatorStudio?.scenes?.length;
 return{area:hasAppliedPlan?'Storyboard':'Voiceover',tool:''};
}
