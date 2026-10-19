import {estimateSeconds} from './scene-tools.js?v=2';

// Additive scene fields: retain IDs, production progress, links and unknown metadata.
export function makeScene(data={}) {
  return {...data, id:data.id||(crypto.randomUUID?.()||String(Date.now()+Math.random())),
    duration:Math.max(1,Math.min(60,Number(data.duration)||estimateSeconds(data.voiceover))),
    voiceover:data.voiceover||'', visual:data.visual||'', assets:data.assets||'',
    characterPrompt:data.characterPrompt||'', imagePrompt:data.imagePrompt||'', videoPrompt:data.videoPrompt||'',
    characterDone:!!data.characterDone, imageDone:!!data.imageDone, videoDone:!!data.videoDone,
    characterAssetUrl:data.characterAssetUrl||'', imageAssetUrl:data.imageAssetUrl||'', videoAssetUrl:data.videoAssetUrl||'',
    completed:!!data.completed, skipped:!!data.skipped};
}

export function storyboardDuration(value) {
  const text=String(value).trim();
  if(!text) return null;
  const clock=text.match(/^(\d+):([0-5]\d)$/);
  const seconds=clock?Number(clock[1])*60+Number(clock[2]):/^(?:\d+(?:\.\d+)?)(?:\s*(?:s|sec|secs|second|seconds))?$/i.test(text)?parseFloat(text):NaN;
  if(!Number.isFinite(seconds)||seconds<1||seconds>60) throw Error('Use a duration from 1 to 60 seconds (for example 8, 8 sec or 0:08).');
  return seconds;
}

// Spreadsheet-style quoted TSV, including embedded tabs/newlines and doubled quotes.
export function parseTsv(input) {
  const text=String(input).replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
  const rows=[]; let row=[],cell='',quoted=false,closed=false;
  for(let i=0;i<text.length;i++) {
    const char=text[i];
    if(quoted) {
      if(char==='"'&&text[i+1]==='"'){cell+='"';i++;}
      else if(char==='"'){quoted=false;closed=true;}
      else cell+=char;
    } else if(char==='"'&&!cell&&!closed) quoted=true;
    else if(char==='\t'||char==='\n') {
      row.push(cell);cell='';closed=false;
      if(char==='\n'){rows.push(row);row=[];}
    } else {
      if(closed&&!/\s/.test(char)) throw Error('Unexpected text after a quoted cell. Check the pasted table.');
      cell+=char;
    }
  }
  if(quoted) throw Error('A quoted cell is incomplete. Copy the complete table and try again.');
  row.push(cell);rows.push(row);
  return rows.filter(row=>row.some(cell=>cell.trim()));
}

const columns=['voiceover','visual','assets','duration'];
const header=value=>String(value).toLowerCase().replace(/[^a-z]/g,'');
const names={voiceover:['voiceover','narration','vo'],visual:['visualanimation','visual','animation'],assets:['assets','asset'],duration:['duration','durationseconds','seconds']};
export function parseStoryboard(input) {
  const text=String(input).replace(/^```(?:tsv|text)?\s*\n([\s\S]*?)\n```$/i,'$1');
  const rows=parseTsv(text);
  if(!rows.length) throw Error('Paste your tab-separated storyboard first.');
  const indexes=columns.map(key=>rows[0].findIndex(cell=>names[key].includes(header(cell))));
  const hasHeader=indexes.some(index=>index>=0);
  if(hasHeader&&indexes.some(index=>index<0)) throw Error('Use all four headers: Voiceover, Visual/Animation, Assets, Duration.');
  if(hasHeader&&rows[0].length!==4) throw Error('Use exactly four columns: Voiceover, Visual/Animation, Assets, Duration.');
  const data=hasHeader?rows.slice(1):rows;
  if(!data.length) throw Error('Add at least one shot below the headers.');
  return data.map((row,index)=>{
    if(row.length!==4) throw Error('Shot '+(index+1)+': expected four tab-separated columns. Blank cells still need a tab.');
    const values=Object.fromEntries(columns.map((key,i)=>[key,row[hasHeader?indexes[i]:i]]));
    try { values.duration=storyboardDuration(values.duration)||estimateSeconds(values.voiceover); }
    catch(error) {throw Error('Shot '+(index+1)+': '+error.message);}
    return makeScene(values);
  });
}
