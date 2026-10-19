import {looksLikeStoryboard,makeScene,parseStoryboard,storyboardDuration} from './storyboard-model.js?v=2';
const columns=[['voiceover','Voiceover'],['visual','Visual/Animation'],['assets','Assets'],['duration','Duration (sec)']];
const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function createStoryboardEditor(root,{getScenes,onChange,onImport=()=>{},onFocus=()=>{},onDraft=()=>{},showProduction=false,saveHint='Changes save automatically.',title='Storyboard',intro='Plan each shot. Your full voiceover stays separate.',initialImportOpen=false}) {
  root.classList.add('storyboard');
  root.innerHTML='<div class="storyboard-heading"><div><h3>'+escape(title)+'</h3><p>'+escape(intro)+'</p></div><button type="button" data-add>+ Add shot</button></div><details class="storyboard-import"><summary>Paste a table from ChatGPT</summary><p>Paste tab-separated columns Voiceover, Visual/Animation, Assets or Assets Required, and Duration or Timeline (for example 0–4s). A preview appears automatically. Check it, then import the shots.</p><label>Paste storyboard<textarea data-paste rows="5" spellcheck="false" placeholder="Voiceover&#9;Visual / Animation&#9;Assets Required&#9;Timeline"></textarea></label><div class="storyboard-tools"><button type="button" data-review>Preview table</button><label>Import mode<select data-mode><option value="append">Append shots</option><option value="replace">Replace shots</option></select></label><button type="button" data-import hidden>Add reviewed shots</button></div><div data-preview hidden></div></details><p data-feedback role="status" aria-live="polite"></p><div data-rows></div><p data-empty>No shots yet. Add one or paste your table above.</p>';
  const find=selector=>root.querySelector(selector); let pending=[],pendingSource=null,firstRender=true,newlyImportedId='';
  const message=text=>find('[data-feedback]').textContent=text;
  const clearPreview=()=>{message('');pending=[];find('[data-preview]').hidden=true;find('[data-import]').hidden=true;};
  function productionFields(scene,index,openIds){
    if(!showProduction)return '';
    const count=['characterPrompt','imagePrompt','videoPrompt'].filter(field=>scene[field]?.trim()).length;
    const fields=[['characterPrompt','Character','Reusable person or subject reference'],['imagePrompt','Image','Still frame, composition and style'],['videoPrompt','Video','Motion, camera and transition']];
    return '<details class="storyboard-production" data-scene-id="'+escape(scene.id)+'" '+(openIds.has(scene.id)||newlyImportedId===scene.id?'open':'')+'><summary><strong>Scene production</strong><span>Character · Image · Video</span><small>'+count+' of 3 prompts ready'+(scene.completed?' · Complete':'')+'</small></summary><div class="storyboard-production-body"><div class="storyboard-production-actions"><button type="button" data-action="draft">Draft prompts from plan</button><button type="button" data-action="focus">Open focused scene</button></div><div class="storyboard-production-fields">'+fields.map(([key,label,hint])=>'<label>'+label+' prompt<small>'+hint+'</small><textarea rows="4" data-shot-field="'+key+'" aria-label="Shot '+(index+1)+' '+label+' prompt">'+escape(scene[key])+'</textarea></label>').join('')+'</div></div></details>';
  }
  function render() {
    if(firstRender){find('.storyboard-import').open=Boolean(typeof initialImportOpen==='function'?initialImportOpen():initialImportOpen);firstRender=false;}
    const openIds=new Set([...find('[data-rows]').querySelectorAll('.storyboard-production[open]')].map(element=>element.dataset.sceneId));
    const scenes=getScenes();find('[data-empty]').hidden=!!scenes.length;
    find('[data-rows]').innerHTML=scenes.map((scene,index)=>'<article class="storyboard-shot" data-index="'+index+'"><div class="storyboard-shot-head"><strong>Shot '+(index+1)+'</strong><div><button type="button" data-action="up" aria-label="Move shot '+(index+1)+' up" '+(!index?'disabled':'')+'>↑</button><button type="button" data-action="down" aria-label="Move shot '+(index+1)+' down" '+(index===scenes.length-1?'disabled':'')+'>↓</button><button type="button" data-action="remove" aria-label="Remove shot '+(index+1)+'">Remove</button></div></div><div class="storyboard-cells">'+columns.map(([key,label])=>'<label>'+label+(key==='duration'?'<input type="number" min="1" max="60" step="any" data-shot-field="duration" aria-label="Shot '+(index+1)+' '+label+'" value="'+escape(scene.duration)+'">'+(scene.timeline?'<small>Source timeline: '+escape(scene.timeline)+'</small>':''):'<textarea rows="4" data-shot-field="'+key+'" aria-label="Shot '+(index+1)+' '+label+'">'+escape(scene[key])+'</textarea>')+'</label>').join('')+'</div>'+productionFields(scene,index,openIds)+'</article>').join('');
    newlyImportedId='';
  }
  function review() {
    clearPreview();
    try {
      pending=parseStoryboard(find('[data-paste]').value);
      find('[data-preview]').innerHTML='<p>'+pending.length+' shots · '+pending.reduce((n,s)=>n+s.duration,0)+' seconds. Check the columns before importing.</p><div class="storyboard-preview-scroll"><table><thead><tr>'+columns.map(([,label])=>'<th scope="col">'+label+'</th>').join('')+'</tr></thead><tbody>'+pending.map(scene=>'<tr>'+columns.map(([key])=>'<td>'+escape(key==='duration'&&scene.timeline?scene.timeline+' ('+scene.duration+' sec)':scene[key])+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
      find('[data-preview]').hidden=false;find('[data-import]').hidden=false;message('Preview ready. Your shots have not changed.');
      return true;
    } catch(error){message(error.message);return false;}
  }
  find('[data-paste]').addEventListener('input',()=>{
    clearPreview();
    const text=find('[data-paste]').value;
    if(text.includes('\t')&&text.includes('\n'))review();
  });
  find('[data-review]').onclick=review;
  find('[data-import]').onclick=()=>{
    if(!pending.length)return;
    const replace=find('[data-mode]').value==='replace';
    if(replace&&getScenes().length&&!confirm('Replace all existing shots, including their prompts and production progress?'))return;
    const added=pending.length,narration=pending.map(scene=>scene.voiceover).filter(Boolean).join('\n\n');
    if(showProduction)newlyImportedId=pending[0]?.id||'';
    onChange(replace?pending:[...getScenes(),...pending]);
    onImport(pending);
    if(pendingSource){pendingSource.value=narration;pendingSource.dispatchEvent(new Event('input',{bubbles:true}));}
    pendingSource=null;clearPreview();find('[data-paste]').value='';render();message(added+' shot'+(added===1?'':'s')+' added to the storyboard. '+saveHint);
  };
  find('[data-add]').onclick=()=>{onChange([...getScenes(),makeScene()]);render();find('[data-rows]').lastElementChild.querySelector('textarea').focus();};
  find('[data-rows]').addEventListener('input',event=>{
    const field=event.target.dataset.shotField;if(!field)return;
    const index=Number(event.target.closest('[data-index]').dataset.index);let value=event.target.value;
    if(field==='duration') {
      try {value=storyboardDuration(value);if(value===null)throw Error('Enter a duration from 1 to 60 seconds.');event.target.setCustomValidity('');}
      catch(error){event.target.setCustomValidity(error.message);message(error.message);return;}
    }
    onChange(getScenes().map((scene,i)=>i===index?{...scene,[field]:value,...(field==='duration'?{timeline:''}:{})}:scene));
    if(field.endsWith('Prompt')){
      const count=['characterPrompt','imagePrompt','videoPrompt'].filter(key=>getScenes()[index][key]?.trim()).length;
      const summary=event.target.closest('.storyboard-production')?.querySelector('summary small');
      if(summary)summary.textContent=count+' of 3 prompts ready'+(getScenes()[index].completed?' · Complete':'');
    }
    message('');
  });
  find('[data-rows]').addEventListener('click',event=>{
    const button=event.target.closest('[data-action]');if(!button)return;
    const index=Number(button.closest('[data-index]').dataset.index),scenes=[...getScenes()],action=button.dataset.action;
    if(action==='focus'){onFocus(scenes[index].id);return;}
    if(action==='draft'){onDraft(scenes[index].id);render();message('Blank prompts drafted from this shot and the project settings.');return;}
    let next=index;
    if(action==='remove'){if(!confirm('Remove this shot, including its prompts and production progress?'))return;scenes.splice(index,1);}
    else {next=index+(action==='up'?-1:1);if(next<0||next>=scenes.length)return;[scenes[index],scenes[next]]=[scenes[next],scenes[index]];}
    onChange(scenes);render();find('[data-index="'+Math.min(next,scenes.length-1)+'"] button:not(:disabled)')?.focus();
  });
  function watchSource(source) {
    const notice=document.createElement('div');notice.className='storyboard-source-notice';notice.hidden=true;
    notice.innerHTML='<span>This looks like a storyboard table.</span> <button type="button">Preview it as shots</button>';
    (source.closest('label')||source).insertAdjacentElement('afterend',notice);
    const refresh=()=>notice.hidden=!looksLikeStoryboard(source.value);
    source.addEventListener('input',()=>{if(pendingSource===source)pendingSource=null;refresh();});
    notice.querySelector('button').onclick=()=>{
      find('.storyboard-import').open=true;
      find('[data-paste]').value=source.value;
      if(review())pendingSource=source;
      find('[data-import]').focus();
    };
    refresh();return refresh;
  }
  return {render,watchSource,reset(){pendingSource=null;clearPreview();find('[data-paste]').value='';render();}};
}
