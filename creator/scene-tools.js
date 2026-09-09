export function countWords(text){
  return String(text||"").trim().split(/\s+/).filter(Boolean).length;
}

export function estimateSeconds(text){
  return Math.max(5,Math.min(10,Math.round(countWords(text)/2.25)||5));
}

function cleanCell(value){
  return String(value??"")
    .replace(/<br\s*\/?\s*>/gi,"\n")
    .replace(/&vert;/gi,"|")
    .replace(/^\*\*(.*)\*\*$/,"$1")
    .trim();
}

function splitMarkdownRow(line){
  let text=line.trim();
  if(text.startsWith("|"))text=text.slice(1);
  if(text.endsWith("|"))text=text.slice(0,-1);
  const cells=[];
  let cell="",escaped=false;
  for(const char of text){
    if(escaped){cell+=char;escaped=false;}
    else if(char==="\\"){escaped=true;}
    else if(char==="|"){cells.push(cleanCell(cell));cell="";}
    else cell+=char;
  }
  cells.push(cleanCell(cell));
  return cells;
}

function normal(value){
  return String(value||"").replace(/([a-z0-9])([A-Z])/g,"$1 $2").toLowerCase().replace(/[_-]+/g," ").replace(/[^a-z0-9 ]/g,"").replace(/\s+/g," ").trim();
}

function findColumn(headers,aliases){
  return headers.findIndex(header=>aliases.some(alias=>header===alias||header.startsWith(alias+" ")||header.endsWith(" "+alias)));
}

const aliases={
  scene:["scene","scene number","shot","number","no"],
  duration:["duration","time","length","seconds","runtime"],
  voiceover:["voiceover","voice over","vo","narration","spoken line","audio","script"],
  characterPrompt:["character prompt","character reference","character reference prompt","subject prompt","cast prompt"],
  imagePrompt:["image prompt","image generation prompt","image gen prompt","visual prompt","still prompt","frame prompt"],
  videoPrompt:["video prompt","video generation prompt","motion prompt","animation prompt","animate prompt"]
};

function columnIndexes(headers){
  const normalized=headers.map(normal);
  return Object.fromEntries(Object.entries(aliases).map(([key,names])=>[key,findColumn(normalized,names)]));
}

function parseDuration(value){
  const text=String(value||"").trim();
  const clock=text.match(/^(\d+):([0-5]?\d)$/);
  if(clock)return Number(clock[1])*60+Number(clock[2]);
  return Number.parseFloat(text)||0;
}

function rowsToScenes(rows,makeScene){
  if(rows.length<2)throw new Error("Paste a table with a header and at least one scene.");
  const indexes=columnIndexes(rows[0]);
  if(indexes.voiceover<0&&indexes.characterPrompt<0&&indexes.imagePrompt<0&&indexes.videoPrompt<0){
    throw new Error("Could not find Voiceover, Character Prompt, Image Prompt or Video Prompt columns.");
  }
  const scenes=rows.slice(1).filter(row=>row.some(cell=>String(cell||"").trim())).map(row=>makeScene({
    duration:indexes.duration>=0?parseDuration(row[indexes.duration]):0,
    voiceover:indexes.voiceover>=0?cleanCell(row[indexes.voiceover]):"",
    characterPrompt:indexes.characterPrompt>=0?cleanCell(row[indexes.characterPrompt]):"",
    imagePrompt:indexes.imagePrompt>=0?cleanCell(row[indexes.imagePrompt]):"",
    videoPrompt:indexes.videoPrompt>=0?cleanCell(row[indexes.videoPrompt]):""
  }));
  if(!scenes.length)throw new Error("No scene rows were found in the table.");
  return scenes;
}

function unwrapFence(text){
  const fenced=String(text||"").trim().match(/^```(?:json|markdown|md)?\s*([\s\S]*?)\s*```$/i);
  return fenced?fenced[1].trim():String(text||"").trim();
}

function objectValue(object,key){
  const entries=Object.entries(object||{});
  const names=aliases[key];
  const match=entries.find(([candidate])=>names.includes(normal(candidate)));
  return match?.[1]??"";
}

function parseJsonScenes(text,makeScene){
  const parsed=JSON.parse(text);
  const rows=Array.isArray(parsed)?parsed:parsed?.scenes;
  if(!Array.isArray(rows)||!rows.length)throw new Error('JSON must contain a non-empty array or a "scenes" array.');
  return rows.map(row=>makeScene({
    duration:parseDuration(objectValue(row,"duration")),
    voiceover:cleanCell(objectValue(row,"voiceover")),
    characterPrompt:cleanCell(objectValue(row,"characterPrompt")),
    imagePrompt:cleanCell(objectValue(row,"imagePrompt")),
    videoPrompt:cleanCell(objectValue(row,"videoPrompt"))
  }));
}

export function parseSceneTable(input,makeScene){
  const text=unwrapFence(input);
  const markdownLines=text.split(/\r?\n/).filter(line=>line.trim()&&line.includes("|"));
  if(markdownLines.length>=2){
    const rows=markdownLines.map(splitMarkdownRow);
    const headerIndex=rows.findIndex(row=>{
      const indexes=columnIndexes(row);
      return indexes.voiceover>=0||indexes.imagePrompt>=0||indexes.videoPrompt>=0||indexes.characterPrompt>=0;
    });
    if(headerIndex>=0){
      const selected=rows.slice(headerIndex);
      if(selected[1]?.every(cell=>/^:?-{3,}:?$/.test(String(cell).replace(/\s/g,""))))selected.splice(1,1);
      return rowsToScenes(selected,makeScene);
    }
  }
  const tabRows=text.split(/\r?\n/).filter(Boolean).map(line=>line.split("\t").map(cleanCell));
  if(tabRows.length>=2&&tabRows[0].length>1)return rowsToScenes(tabRows,makeScene);
  throw new Error("Use a Markdown table, JSON scene array, or tab-separated spreadsheet rows.");
}

export function parseSceneInput(input,makeScene){
  const text=unwrapFence(input);
  if(!text)throw new Error("Paste the ChatGPT result first.");
  if(text.startsWith("[")||text.startsWith("{")){
    try{return parseJsonScenes(text,makeScene);}
    catch(error){
      if(error instanceof SyntaxError)throw new Error("The JSON is incomplete or invalid. Copy the complete ChatGPT response and try again.");
      throw error;
    }
  }
  return parseSceneTable(text,makeScene);
}

export function inspectScenes(scenes){
  const issues=[];
  scenes.forEach((scene,index)=>{
    const label="Scene "+(index+1);
    if(!scene.voiceover.trim())issues.push(label+": voiceover is missing.");
    if(!scene.imagePrompt.trim())issues.push(label+": image prompt is missing.");
    if(!scene.videoPrompt.trim())issues.push(label+": video prompt is missing.");
    if(!Number.isFinite(scene.duration)||scene.duration<1||scene.duration>60)issues.push(label+": duration must be between 1 and 60 seconds.");
  });
  return issues;
}

export function splitVoiceoverScript(text,makeScene){
  const sentences=(String(text||"").match(/[^.!?\n]+[.!?]?/g)||[]).map(x=>x.trim()).filter(Boolean),chunks=[];
  let current="";
  for(const sentence of sentences){
    const combined=(current+" "+sentence).trim();
    if(countWords(combined)<=22){current=combined;continue;}
    if(current)chunks.push(current);
    const words=sentence.split(/\s+/);
    while(words.length>22)chunks.push(words.splice(0,18).join(" "));
    current=words.join(" ");
  }
  if(current)chunks.push(current);
  return chunks.flatMap(chunk=>{
    const words=chunk.split(/\s+/);
    if(words.length<=23)return[chunk];
    const output=[];
    while(words.length)output.push(words.splice(0,18).join(" "));
    return output;
  }).map(voiceover=>makeScene({voiceover}));
}
