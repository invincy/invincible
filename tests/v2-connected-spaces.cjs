const assert=require('node:assert/strict');
const path=require('node:path');
// Isolated documents exercise the shell bridge. Native editors have their own
// actual-page browser suites; this fixture never contacts production Firebase.
exports.serve=(url,res)=>{
  if(!/^\/invincible\/(ai\/(index.html)?|creator\/(index.html|tts.html|images.html|project.html)?|journal\/finance.html)$/.test(url.pathname))return false;
  res.setHeader('Content-Type','text/html');
  res.end(`<!doctype html><html><head><link rel="stylesheet" href="/invincible/shared/spatial-workspace.css"></head><body><nav class="global-nav">Duplicate navigation</nav><main class="space-panels" style="padding:24px"><section class="space-panel"><h1>Projects</h1><a href="/invincible/creator/tts.html">Voiceover</a><button id="project" onclick="location.href='/invincible/creator/project.html?id=fixture-project'">Open project</button></section><section class="space-panel"><h2>Create</h2><label>Draft<textarea rows="8"></textarea></label><a href="/invincible/ai/?tool=images">AI images</a></section><section class="space-panel"><h2>Review</h2><div id="timeline" style="width:200px;overflow-x:auto"><div style="width:900px;height:90px">Timeline</div></div><p>Current route ${url.pathname}</p></section></main></body></html>`);
  return true;
};
exports.check=async({browser,base,output,name})=>{
  const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));await page.route('https://**/*',route=>route.abort());
  try{
    await page.goto(base+'/fixture');await page.locator('.v2-guide-mission h2').waitFor();
    const ids=await page.locator('.v2-canvas>.v2-region').evaluateAll(nodes=>nodes.map(node=>node.id.replace('v2-region-','')));
    assert.deepEqual(ids.slice(ids.indexOf('finance'),ids.indexOf('ai')+1),['finance','dashboard','workspace','creator','voiceover','images','ai']);
    assert.equal(await page.locator('.v2-connected-space iframe').count(),0,'Only visited tools load');
    await page.getByRole('button',{name:'Previous space — Finance',exact:true}).click();
    const finance=page.frameLocator('iframe[title="Finance workspace"]');await page.locator('#v2-region-finance:not([inert])').waitFor();await finance.getByLabel('Draft').click();await finance.getByLabel('Draft').fill('Unsaved finance draft');assert.equal(await finance.getByLabel('Draft').inputValue(),'Unsaved finance draft');
    await finance.locator('html.connected-space-document').waitFor();
    assert.equal(await finance.locator('.global-nav').isVisible(),false,'One navigation bar');
    const widths=await finance.locator('.space-panel').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().width));
    assert.ok(Math.max(...widths)-Math.min(...widths)<1,'Three equal panels');
    await page.getByRole('button',{name:'Next space — Main Dashboard',exact:true}).click();
    await page.getByRole('navigation',{name:'Explore spaces'}).getByRole('link',{name:'Creator Studio',exact:true}).click();
    const creator=page.frameLocator('iframe[title="Creator Studio workspace"]');await page.locator('#v2-region-creator:not([inert])').waitFor();await creator.locator('html.connected-space-document').waitFor();await creator.getByLabel('Draft').click();await creator.getByLabel('Draft').fill('Creator draft');assert.equal(await creator.getByLabel('Draft').inputValue(),'Creator draft','Draft entered before navigation');
    const beforeWheel=await page.locator('.v2-canvas').evaluate(node=>node.scrollLeft);
    await creator.locator('#timeline').hover();await page.mouse.wheel(140,0);
    await creator.locator('#timeline').evaluate(node=>new Promise(resolve=>requestAnimationFrame(()=>resolve(node.scrollLeft))));
    assert.equal(await page.locator('.v2-canvas').evaluate(node=>node.scrollLeft),beforeWheel,'Nested timeline retains horizontal wheel gestures');
    await creator.getByRole('heading',{name:'Projects',exact:true}).hover();await page.mouse.wheel(160,0);
    await page.waitForFunction(before=>document.querySelector('.v2-canvas').scrollLeft>before+50,beforeWheel);
    await page.getByRole('navigation',{name:'Explore spaces'}).getByRole('link',{name:'Creator Studio',exact:true}).click();
    await creator.getByRole('link',{name:'Voiceover',exact:true}).click();await page.waitForURL(/#voiceover/);
    await page.locator('#v2-region-voiceover:not([inert])').waitFor();await page.frameLocator('iframe[title="Voiceover workspace"]').getByLabel('Draft').fill('Voiceover draft');
    await page.getByRole('button',{name:'Previous space — Creator Studio',exact:true}).click();
    assert.equal(await creator.getByLabel('Draft').inputValue(),'Creator draft','Cross-space navigation keeps live drafts');
    await creator.getByRole('button',{name:'Open project'}).click();
    await page.waitForURL(/path=.*fixture-project/);
    await page.getByRole('navigation',{name:'Explore spaces'}).getByRole('link',{name:'Finance',exact:true}).click();
    assert.equal(await finance.getByLabel('Draft').inputValue(),'Unsaved finance draft');
    await page.getByRole('navigation',{name:'Explore spaces'}).getByRole('link',{name:'Creator Studio',exact:true}).click();
    await page.reload();await page.frameLocator('iframe[title="Creator Studio workspace"]').getByText('Current route /invincible/creator/project.html',{exact:true}).waitFor();
    await page.getByRole('navigation',{name:'Explore spaces'}).getByRole('link',{name:'02 My Workspace',exact:true}).click();
    await page.locator('.v2-work-slab').first().waitFor();assert.equal(await page.locator('.v2-work-slab').count(),3);
    assert.equal(await page.locator('.v2-lane').count(),4,'All task statuses remain available');
    const slabs=await page.locator('.v2-work-slab').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().width));
    assert.ok(Math.max(...slabs)-Math.min(...slabs)<1);
    await page.screenshot({path:path.join(output,name+'-three-workspace-panels.png')});
    await page.getByRole('navigation',{name:'Explore spaces'}).getByRole('link',{name:'Creator Studio',exact:true}).click();
    const frame=page.frameLocator('iframe[title="Creator Studio workspace"]');
    await frame.getByLabel('Draft').click();await frame.getByLabel('Draft').fill('Account private draft');assert.equal(await frame.getByLabel('Draft').inputValue(),'Account private draft');
    await page.evaluate(()=>window.switchAccount('bob'));await page.waitForTimeout(200);
    assert.equal(await frame.getByLabel('Draft').inputValue(),'','Account change remounts embedded tools');
    await page.setViewportSize({width:393,height:852});await page.getByRole('navigation',{name:'Explore spaces'}).getByRole('link',{name:'01 Main Dashboard'}).waitFor();
    assert.equal(await page.locator('.v2-canvas>.v2-region').count(),2,'Mobile retains its current two spaces');
    assert.equal(await page.locator('.v2-connected-space iframe').count(),0);
    assert.deepEqual(errors,[]);
    console.log(name+' connected spaces: order, lazy loading, equal panels, drafts, project reload, account isolation and mobile passed');
  }catch(error){await page.screenshot({path:path.join(output,name+'-connected-failure.png')}).catch(()=>{});throw error;}finally{await context.close();}
};
