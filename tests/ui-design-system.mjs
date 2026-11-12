import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {navigationPages, desktopSpaces} from '../shared/navigation.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

test('the shared navigation registry has complete, unique destinations', () => {
  assert.equal(new Set(navigationPages.map(page => page.id)).size, navigationPages.length);
  for (const page of navigationPages) {
    assert.match(page.id, /^[a-z][a-z0-9-]*$/);
    assert.ok(page.label?.trim(), `${page.id} needs a label`);
    assert.ok(page.href?.startsWith('/invincible/'), `${page.id} must keep an Invincible route`);
    assert.ok(page.icon?.trim(), `${page.id} needs a fallback icon`);
  }
  assert.equal(desktopSpaces.filter(page => !page).length, 0);
});

test('shared interaction tokens and consumers remain wired', () => {
  const theme = read('shared/app-theme.css');
  for (const token of ['--ui-control-min: 44px', '--ui-touch-min: 44px', '--ui-focus-ring', '--ui-space-4', '--ui-radius-card']) {
    assert.ok(theme.includes(token), `missing shared token ${token}`);
  }
  assert.match(read('site-nav.css'), /var\(--ui-control-min\)/);
  assert.match(read('react/src/app-shell.css'), /var\(--ui-focus-ring\)/);
  assert.match(read('react/src/dashboard-guide.css'), /var\(--ui-touch-min\)/);
});

test('the UI agent rule points to the complete review and verification contract', () => {
  const rule = read('.agents/rules/ui-ux-design.md');
  const guide = read('docs/ui-ux-design-system.md');
  assert.match(rule, /docs\/ui-ux-design-system\.md/);
  assert.match(rule, /npm run check:ui/);
  for (const heading of ['## Enforceable foundations', '## Responsive acceptance matrix', '## Iterative audit loop', '## Rollout order']) {
    assert.ok(guide.includes(heading), `missing guide section ${heading}`);
  }
  for (const viewport of ['320×568', '390×844', '768×1024', '1024×768', '1440×900']) {
    assert.ok(guide.includes(viewport), `missing responsive checkpoint ${viewport}`);
  }
});
