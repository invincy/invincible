import {APP_BASE} from '../shared/navigation.js';

const api=()=>window.__journalApi;
const element=(tag,text,attrs={})=>Object.assign(document.createElement(tag),attrs,text===undefined?{}:{textContent:text});
const imageSource=value=>typeof value==='string'&&value.length<=2000000&&/^data:image\/(png|jpeg|webp);base64,/i.test(value)?value:'';

function open(){
 if(!api()?.watchIdeas||!window.__journalNotebook)return;
 window.dispatchEvent(new Event('journal-controls-dismiss'));
 const owner=api().context().uid,panel=window.__journalNotebook.panel('Saved ideas');panel.classList.add('journal-saved-ideas');
 let ideas=[],disposed=false,stop=()=>{},selected=null;
 panel.journalDispose=()=>{disposed=true;stop();ideas=[];};
 const search=element('input',undefined,{type:'search',placeholder:'Search saved ideas…'});search.setAttribute('aria-label','Search saved ideas');
 const scope=element('select');scope.setAttribute('aria-label','Saved idea dates');
 scope.append(element('option','All dates',{value:'all'}),element('option','This journal date',{value:'today'}),element('option','Trash',{value:'trash'}));
 const status=element('p','Loading saved ideas…');status.setAttribute('role','status');
 const content=element('div',undefined,{className:'journal-idea-content'}),fields=element('div',undefined,{className:'journal-idea-filters'});fields.append(search,scope);panel.append(fields,status,content);
 const current=()=>!disposed&&panel.isConnected&&api().context().uid===owner;
 const detail=idea=>{
  if(!current())return;selected=idea.id;fields.hidden=true;content.replaceChildren();status.textContent='';
  const back=element('button','← Saved ideas',{type:'button'});back.onclick=()=>{fields.hidden=false;render();};content.append(back);
  const source=imageSource(idea.image);if(source)content.append(element('img',undefined,{src:source,alt:idea.title||'Saved writing',className:'journal-idea-preview'}));
  content.append(element('h3',idea.title||'Untitled idea'),element('small',[idea.category,idea.journalDate].filter(Boolean).join(' · ')),element('p',idea.notes||''));
  if(idea.source==='journal'&&/^\d{4}-\d{2}-\d{2}$/.test(idea.journalDate||'')){
   const params=new URLSearchParams({date:idea.journalDate});if(idea.view)params.set('view',JSON.stringify(idea.view));
   content.append(element('a','Open journal area',{href:APP_BASE+'journal/?'+params}));
  }else content.append(element('a','Open dashboard',{href:APP_BASE}));
  const remove=element('button',idea.deletedAt?'Restore snapshot':'Delete snapshot',{type:'button'});remove.onclick=async()=>{remove.disabled=true;status.textContent='Saving…';try{if(!current())return;await api().setIdeaTrashed(idea.id,!idea.deletedAt);if(!current())return;ideas=ideas.map(row=>row.id===idea.id?{...row,deletedAt:idea.deletedAt?null:new Date().toISOString()}:row);render();status.textContent=idea.deletedAt?'Snapshot restored.':'Snapshot moved to Trash. Original journal writing is unchanged.';}catch(error){if(current()){status.textContent=(error.message||'Could not update snapshot.')+' Retry; your snapshot is kept.';remove.disabled=false;}}};content.append(remove);
  if(source)content.append(element('a','Download image',{href:source,download:(idea.title||'Saved idea').replace(/[^a-z0-9-]/gi,'_')+'.webp'}));
 };
 const render=()=>{
  if(!current())return;selected=null;fields.hidden=false;content.replaceChildren();const query=search.value.trim().toLocaleLowerCase();
  const matches=ideas.filter(idea=>(scope.value==='trash'?!!idea.deletedAt:!idea.deletedAt)&&(scope.value!=='today'||idea.source==='journal'&&idea.journalDate===api().context().dateKey)&&[idea.title,idea.category,idea.notes,idea.journalDate].join(' ').toLocaleLowerCase().includes(query));
  status.textContent=matches.length?matches.length+' saved '+(matches.length===1?'idea':'ideas'):scope.value==='trash'?'Trash is empty.':ideas.some(idea=>!idea.deletedAt)?'No matching ideas.':'No saved ideas yet. Use Snapshot to select and save some writing.';
  const grid=element('div',undefined,{className:'journal-idea-grid'});for(const idea of matches){const button=element('button',undefined,{type:'button'}),source=imageSource(idea.image);button.setAttribute('aria-label','View saved idea '+(idea.title||'Untitled'));if(source)button.append(element('img',undefined,{src:source,alt:'',loading:'lazy'}));button.append(element('strong',idea.title||'Untitled idea'),element('small',[idea.category,idea.journalDate].filter(Boolean).join(' · ')));button.onclick=()=>detail(idea);grid.append(button);}content.append(grid);
 };
 search.oninput=render;scope.onchange=render;
 const load=()=>{stop();status.textContent='Loading saved ideas…';content.replaceChildren();stop=api().watchIdeas(rows=>{if(!current())return;ideas=rows;const active=selected&&ideas.find(idea=>idea.id===selected);if(active)detail(active);else render();},error=>{if(!current())return;status.textContent=(error?.message||'Saved ideas could not sync.')+' Your saved ideas have not been changed.';const retry=element('button','Retry loading ideas',{type:'button'});retry.onclick=load;content.replaceChildren(retry);});};load();
}
window.__journalIdeas={open};
