import {makeScene,parseStoryboard,storyboardDuration} from './storyboard-model.js';
const columns=[['voiceover','Voiceover'],['visual','Visual/Animation'],['assets','Assets'],['duration','Duration (sec)']];
const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function createStoryboardEditor(root,{getScenes,onChange}) {
  root.classList.add('storyboard');
  root.innerHTML='<div class="storyboard-heading"><div><h3>Storyboard</h3><p>Plan each shot. Your full voiceover stays separate.</p></div><button type="button" data-add>+ Add shot</button></div><details class="storyboard-import"><summary>Paste a table from ChatGPT</summary><p>Copy a tab-separated table with Voiceover, Visual/Animation, Assets, Duration. Headers are optional; without headers use this order. Leave duration blank to estimate it. Use 1–60 seconds per shot.</p><label>Paste storyboard<textarea data-paste rows="5" spellcheck="false" placeholder="Voiceover&#9;Visual/Animation&#9;Assets&#9;Duration"></textarea></label><div class="storyboard-tools"><button type="button" data-review>Preview table</button><label>Import mode<select data-mode><option value="append">Append shots</option><option value="replace">Replace shots</option></select></label></div><div data-preview hidden></div><button type="button" data-import hidden>Add reviewed shots</button></details><p data-feedback role="status" aria-live="polite"></p><div class="storyboard-columns" aria-hidden="true"><span>Voiceover</span><span>Visual/Animation</span><span>Assets</span><span>Duration</span></div><div data-rows></div><p data-empty>No shots yet. Add one or paste your table above.</p>';
  const find=selector=>root.querySelector(selector); let pending=[];
  const message=text=>find('[data-feedback]').textContent=text;
  const clearPreview=()=>{message('');pending=[];find('[data-preview]').hidden=true;find('[data-import]').hidden=true;};
  function render() {
    const scenes=getScenes();find('[data-empty]').hidden=!!scenes.length;
    find('[data-rows]').innerHTML=scenes.map((scene,index)=>'<article class="storyboard-shot" data-index="'+index+'"><div class="storyboard-shot-head"><strong>Shot '+(index+1)+'</strong><div><button type="button" data-action="up" aria-label="Move shot '+(index+1)+' up" '+(!index?'disabled':'')+'>↑</button><button type="button" data-action="down" aria-label="Move shot '+(index+1)+' down" '+(index===scenes.length-1?'disabled':'')+'>↓</button><button type="button" data-action="remove" aria-label="Remove shot '+(index+1)+'">Remove</button></div></div><div class="storyboard-cells">'+columns.map(([key,label])=>'<label>'+label+(key==='duration'?'<input type="number" min="1" max="60" step="any" data-shot-field="duration" aria-label="Shot '+(index+1)+' '+label+'" value="'+escape(scene.duration)+'">':'<textarea rows="4" data-shot-field="'+key+'" aria-label="Shot '+(index+1)+' '+label+'">'+escape(scene[key])+'</textarea>')+'</label>').join('')+'</div></article>').join('');
  }
  find('[data-paste]').addEventListener('input',clearPreview);
  find('[data-review]').onclick=()=>{
    clearPreview();
    try {
      pending=parseStoryboard(find('[data-paste]').value);
      find('[data-preview]').innerHTML='<p>'+pending.length+' shots · '+pending.reduce((n,s)=>n+s.duration,0)+' seconds. Check the columns before importing.</p><div class="storyboard-preview-scroll"><table><thead><tr>'+columns.map(([,label])=>'<th scope="col">'+label+'</th>').join('')+'</tr></thead><tbody>'+pending.map(scene=>'<tr>'+columns.map(([key])=>'<td>'+escape(scene[key])+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
      find('[data-preview]').hidden=false;find('[data-import]').hidden=false;message('Preview ready. Your shots have not changed.');
    } catch(error){message(error.message);}
  };
  find('[data-import]').onclick=()=>{
    if(!pending.length)return;
    const replace=find('[data-mode]').value==='replace';
    if(replace&&getScenes().length&&!confirm('Replace all existing shots, including their prompts and production progress?'))return;
    onChange(replace?pending:[...getScenes(),...pending]);clearPreview();find('[data-paste]').value='';render();message('Storyboard updated. Full voiceover unchanged.');
  };
  find('[data-add]').onclick=()=>{onChange([...getScenes(),makeScene()]);render();find('[data-rows]').lastElementChild.querySelector('textarea').focus();};
  find('[data-rows]').addEventListener('input',event=>{
    const field=event.target.dataset.shotField;if(!field)return;
    const index=Number(event.target.closest('[data-index]').dataset.index);let value=event.target.value;
    if(field==='duration') {
      try {value=storyboardDuration(value);if(value===null)throw Error('Enter a duration from 1 to 60 seconds.');event.target.setCustomValidity('');}
      catch(error){event.target.setCustomValidity(error.message);message(error.message);return;}
    }
    onChange(getScenes().map((scene,i)=>i===index?{...scene,[field]:value}:scene));message('');
  });
  find('[data-rows]').addEventListener('click',event=>{
    const button=event.target.closest('[data-action]');if(!button)return;
    const index=Number(button.closest('[data-index]').dataset.index),scenes=[...getScenes()],action=button.dataset.action;
    let next=index;
    if(action==='remove'){if(!confirm('Remove this shot, including its prompts and production progress?'))return;scenes.splice(index,1);}
    else {next=index+(action==='up'?-1:1);if(next<0||next>=scenes.length)return;[scenes[index],scenes[next]]=[scenes[next],scenes[index]];}
    onChange(scenes);render();find('[data-index="'+Math.min(next,scenes.length-1)+'"] button:not(:disabled)')?.focus();
  });
  return {render,reset(){clearPreview();find('[data-paste]').value='';message('');render();}};
}
