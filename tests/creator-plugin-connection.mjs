import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../creator/plugin-connect.js', import.meta.url), 'utf8').replace(/^import .*;\r?\n/gm, '');
const home = fs.readFileSync(new URL('../creator/index.html', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../creator/plugin-connect.html', import.meta.url), 'utf8');

function fixture(search = '', authorize = async () => ({data: {redirectUrl: 'https://chatgpt.com/callback'}})) {
  const elements = new Map();
  for (const [, id] of html.matchAll(/id="([^"]+)"/g)) {
    elements.set(id, {hidden: false, disabled: false, textContent: '', classList: {toggle() {}},
      addEventListener(event, handler) {this[event] = handler;}, focus() {this.focused = true;}});
  }
  let authListener;
  let redirected;
  const context = {
    document: {getElementById: id => elements.get(id)},
    location: {search, assign: value => {redirected = value;}},
    navigator: {clipboard: {writeText: async () => {throw Error('blocked');}}},
    URLSearchParams, atob, escape, decodeURIComponent,
    firebaseApp: {}, getFunctions: () => ({}), httpsCallable: () => authorize,
    observeAuth: listener => {authListener = listener;},
  };
  vm.runInNewContext(source, context);
  return {elements, auth: user => authListener(user), redirect: () => redirected};
}

test('Creator Studio exposes the connection page', () => {
  assert.match(home, /href="plugin-connect.html">Connect ChatGPT/);
});

test('setup stays visible with signed-out and signed-in accounts', () => {
  const f = fixture();
  f.auth(null);
  assert.equal(f.elements.get('connectionSetup').hidden, false);
  assert.equal(f.elements.get('signInLink').hidden, false);
  assert.equal(f.elements.get('connectButton').hidden, true);
  f.auth({uid: 'owner', email: 'owner@example.com'});
  assert.equal(f.elements.get('connectionSetup').hidden, false);
  assert.equal(f.elements.get('signInLink').hidden, true);
  assert.equal(f.elements.get('connectButton').hidden, true);
});

test('malformed OAuth stays an error after account restore', () => {
  for (const search of ['?oauth=bad', '?oauth=', '?oauth=bnVsbA', '?oauth=W10']) {
    const f = fixture(search);
    f.auth({uid: 'owner'});
    assert.match(f.elements.get('message').textContent, /invalid/);
    assert.equal(f.elements.get('connectButton').hidden, true);
    assert.equal(f.elements.get('connectionSetup').hidden, false);
  }
});

test('valid OAuth preserves server-authorized callback', async () => {
  const request = Buffer.from(JSON.stringify({clientId: 'client'})).toString('base64url');
  const f = fixture('?oauth=' + request);
  f.auth({uid: 'owner'});
  assert.equal(f.elements.get('connectButton').hidden, false);
  assert.equal(f.elements.get('connectionSetup').hidden, true);
  await f.elements.get('connectButton').click();
  assert.equal(f.redirect(), 'https://chatgpt.com/callback');
});

test('account change during authorization prevents callback', async () => {
  let resolve;
  const f = fixture('?oauth=eyJjbGllbnRJZCI6ImNsaWVudCJ9', () => new Promise(r => {resolve = r;}));
  f.auth({uid: 'owner'});
  const pending = f.elements.get('connectButton').click();
  f.auth({uid: 'other'});
  resolve({data: {redirectUrl: 'https://chatgpt.com/callback'}});
  await pending;
  assert.equal(f.redirect(), undefined);
  assert.match(f.elements.get('message').textContent, /account changed/);
});

test('clipboard rejection exposes a selectable address', async () => {
  const f = fixture();
  await f.elements.get('copyAddress').click();
  assert.equal(f.elements.get('manualSetup').open, true);
  assert.equal(f.elements.get('connectionAddress').focused, true);
});
