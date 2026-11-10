const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');

const root = path.resolve(__dirname, '..');
const css = file => fs.readFileSync(path.join(root, file), 'utf8');
const card = (title, expanded = false) => `<div class="reminder-wrap"><article class="reminder-card${expanded ? ' expanded' : ''}"><time class="time"><span class="overdue-date">Wednesday, 30 Sep</span>9:00 am</time><div class="copy"><strong>${title}</strong><div class="meta"><span class="repeat">↻ Daily</span></div></div><button class="complete-button" aria-label="Mark done">✓</button><button class="expand" aria-label="Reminder details">⌄</button><div class="details"><button>Edit</button><button>Snooze 1h</button><button>Delete</button></div></article></div>`;
const markup = `<div class="react-app-shell"><header class="react-topbar"></header><main><div class="reminder-shell"><header class="page-head"><div><span class="date-line">Wednesday, 10 November</span><h1>Reminders</h1><p>2 things left</p><p class="sync-status cloud">Cloud synced</p></div><button class="notify-button" aria-label="Enable notifications">◌</button></header><div class="reminder-skeletons" role="status"><span></span><span></span><span></span></div><section class="overdue-block"><div class="section-heading">Overdue <b>2</b></div><div class="reminder-list">${card('A very long reminder '.repeat(7), true)}${card('Another overdue reminder')}</div></section><div class="section-heading">Today <b>0</b></div><section class="reminder-list today-list"></section><section class="empty-state"><span>✓</span><h2>Nothing scheduled today</h2><p>Your overdue reminders are listed above.</p></section><section class="upcoming-block"><div class="section-heading">Upcoming <b>3</b></div><div class="upcoming-list"><section class="date-group"><h3>Tomorrow</h3>${card('A'.repeat(160))}${card('Another future reminder')}${card('Last future reminder')}</section></div></section></div><button class="fab" aria-label="Add reminder">+</button></main><div class="invincible-ai-dock"><button class="ai-dock-avatar ai-orb" aria-label="AI assistant"></button></div><nav class="react-mobile-tabs" aria-label="Primary navigation"></nav></div>`;

(async () => {
 const browser = await chromium.launch({headless:true, executablePath:process.env.CHROMIUM_EXECUTABLE || undefined, args:['--no-sandbox']});
 try {
  const page = await browser.newPage();
  await page.setContent(`<meta name="viewport" content="width=device-width,initial-scale=1"><body class="reminders-page">${markup}</body>`);
  await page.addStyleTag({content:css('reminders/reminders.css')});
  await page.addStyleTag({content:css('react/src/app-shell.css').replace('@import "../../shared/app-theme.css";', '')});
  await page.addStyleTag({content:css('react/src/features/invincible-ai/invincible-ai-dock.css')});
  for (const [width, height] of [[320,568],[360,640],[393,852],[700,900],[960,540],[1280,720],[1920,1080]]) {
   await page.setViewportSize({width,height});
   await page.evaluate(() => window.scrollTo(0,0));
   const state = await page.evaluate(() => {
    const box = selector => document.querySelector(selector).getBoundingClientRect();
    const shell = box('.reminder-shell'), fab = box('.fab'), ai = box('.ai-dock-avatar');
    const cards = [...document.querySelectorAll('.overdue-block .reminder-wrap')].map(el => el.getBoundingClientRect());
    const expanded = box('.details button');
    const point = document.elementFromPoint(fab.x + fab.width/2, fab.y + fab.height/2);
    return {scrollWidth:document.documentElement.scrollWidth, shellWidth:shell.width, fab:{left:fab.left,right:fab.right,top:fab.top,bottom:fab.bottom}, ai:{left:ai.left,right:ai.right,top:ai.top,bottom:ai.bottom}, cards:cards.map(r => ({left:r.left,top:r.top,width:r.width})), expandedWidth:expanded.width, fabHit:!!point?.closest('.fab')};
   });
   assert.ok(state.scrollWidth <= width + 1, `${width}: horizontal overflow ${state.scrollWidth}`);
   assert.ok(state.shellWidth >= Math.min(width,1600) - 1, `${width}: workspace too narrow`);
   assert.ok(state.fab.right <= state.ai.left || state.ai.right <= state.fab.left || state.fab.bottom <= state.ai.top || state.ai.bottom <= state.fab.top, `${width}: add and AI buttons overlap`);
   assert.ok(state.fabHit, `${width}: add button is obscured`);
   assert.ok(state.expandedWidth >= 44, `${width}: expanded action is too narrow`);
   if (width >= 960) assert.ok(Math.abs(state.cards[0].top - state.cards[1].top) < 1 && state.cards[1].left > state.cards[0].left, `${width}: cards did not use two columns`);
   else assert.ok(state.cards[1].top > state.cards[0].top, `${width}: phone cards should stack`);
   await page.locator('.date-group .reminder-wrap').last().scrollIntoViewIfNeeded();
   assert.ok(await page.evaluate(() => window.scrollY > 0), `${width}: content should remain scrollable`);
   assert.equal(await page.locator('.empty-state h2').textContent(), 'Nothing scheduled today');
  }
  console.log('Reminders responsive fixture passed for loading, overdue, expanded, empty and upcoming states.');
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });