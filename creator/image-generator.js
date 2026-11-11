import { createLocalImageClient, waitForImage } from '../shared/local-image-client.js';
import { createRemoteImageClient } from '../shared/remote-image-client.js?v=2026111205';
import { imageHistory } from '../shared/image-history.js';
import { isPhoneOrTablet } from '../shared/laptop-device.js';

async function prepareReference(file) {
  if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 10 * 1024 * 1024) {
    throw Error('Choose a PNG or JPEG up to 10 MB.');
  }
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const context = canvas.getContext('2d', { alpha: false });
  const side = Math.min(bitmap.width, bitmap.height);
  try {
    context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 512, 512);
    return canvas.toDataURL('image/png');
  } finally { bitmap.close(); }
}

export function mountConnectedImageGenerator(root, { getAccountId, callRelay, draftPrompt, clientFactory = createLocalImageClient, ...options }) {
  const local = clientFactory({ getAccountId, requireAccount: true });
  const remote = createRemoteImageClient({ getAccountId, call: callRelay, draftPrompt });
  const preference = 'invincible.image-connection.' + getAccountId();
  let selected;
  try { selected = sessionStorage.getItem(preference); } catch {}
  const loopbackPage = ['127.0.0.1', 'localhost'].includes(location.hostname);
  const remoteOnly = isPhoneOrTablet() && !loopbackPage;
  let client = remoteOnly || selected === 'remote' || (!selected && !loopbackPage && !local.hasPairing?.()) ? remote : local;
  let panel;
  function mount() {
    panel = mountImageGenerator(root, { ...options, getAccountId, client, onSwitch: remoteOnly ? undefined : () => {
      const prompt = root.querySelector('[data-image-prompt]').value;
      const frame = root.querySelector('input[name=image-frame]:checked').value;
      const seed = root.querySelector('[data-image-seed]').value;
      const idea = root.querySelector('[data-image-idea]').value;
      panel.destroy();
      client = client === local ? remote : local;
      try { sessionStorage.setItem(preference, client.remote ? 'remote' : 'local'); } catch {}
      mount();
      root.querySelector('[data-image-prompt]').value = prompt;
      root.querySelector('input[value=' + frame + ']').checked = true;
      root.querySelector('[data-image-seed]').value = seed;
      root.querySelector('[data-image-idea]').value = idea;
      const primary = root.querySelector('[data-image-pair]');
      (primary.hidden ? root.querySelector('[data-image-advanced] summary') : primary).focus();
    } });
  }
  mount();
  return { destroy: () => panel.destroy(), refresh: () => panel.refresh() };
}

export function mountImageGenerator(root, { client = createLocalImageClient(), getAccountId = () => null, getProjectId = () => null, onAttach, onReveal = () => {}, onSwitch, statusOnlyConnection = false, onConnectionChange } = {}) {
  const remote = client.remote === true;
  root.classList.add('image-generator','space-panels');
  root.tabIndex=0;
  root.setAttribute('aria-label','Image generator panels');
  root.innerHTML = `<div data-image-form class="space-panel"><header><h3>Create image</h3></header>
    <div class="image-connection-bar" ${statusOnlyConnection ? 'hidden' : ''} data-connection-state="checking">
      <div class="image-laptop-status"><span class="image-laptop-icon" aria-hidden="true"></span><p data-image-connection role="status">Checking laptop…</p></div>
      <div class="image-laptop-actions">
        <button type="button" data-image-pair hidden>Retry</button>
        <button type="button" data-image-new-pair aria-label="Pair this browser" title="Pair this browser" hidden>＋</button>
      </div>
    </div>
    <section class="image-prompt-assistant" data-image-assistant ${client.draftPrompt ? '' : 'hidden'}>
      <label>Describe your idea<textarea data-image-idea rows="3" maxlength="1500" placeholder="Describe the image you want…"></textarea></label>
      <button type="button" data-image-draft disabled>Generate prompt</button>
      <p data-image-draft-status role="status"></p>
    </section>
    <label>Prompt<textarea data-image-prompt rows="4" maxlength="1500" required placeholder="A hill fortress at sunrise…"></textarea></label>
    <button type="button" data-image-clear aria-label="Clear prompt">Clear</button>
    <div class="image-reference" ${client.supportsReference ? '' : 'hidden'}>
      <label>Reference image <input type="file" accept="image/png,image/jpeg" data-image-reference></label>
      <p data-image-reference-status role="status">Optional · square crop · keep close to reference</p>
      <img data-image-reference-preview alt="Square crop of the reference" hidden>
      <button type="button" data-image-reference-remove hidden>Remove reference</button>
    </div>
    <fieldset><legend>Frame</legend><label><input type="radio" name="image-frame" value="square" checked>Square <small>512 × 512</small></label><label><input type="radio" name="image-frame" value="portrait">Portrait <small>384 × 640</small></label><label><input type="radio" name="image-frame" value="landscape">Landscape <small>640 × 384</small></label></fieldset>
    <details data-image-advanced><summary>Advanced settings</summary><label>Seed <small>Leave empty for a new variation</small><input data-image-seed type="number" min="0" max="4294967295" step="1"></label><div class="image-connection-options" ${statusOnlyConnection ? 'hidden' : ''}><button type="button" data-image-switch ${onSwitch ? '' : 'hidden'}>${remote ? 'Set up on this laptop' : 'Use saved laptop'}</button><button type="button" data-image-forget hidden>Forget laptop</button></div><details ${remote || statusOnlyConnection ? 'hidden' : ''}><summary>Manual pairing</summary><label>Pairing code<input data-image-token type="password" autocomplete="off"></label><button type="button" data-image-connect>Connect</button></details></details>
    <div class="image-actions"><button type="button" data-image-generate disabled>Generate</button><button type="button" data-image-regenerate hidden>Regenerate</button></div></div>
    <div class="space-panel image-preview-panel"><p role="status" aria-live="polite" data-image-status></p>
    <figure hidden><img data-image-preview alt="Generated image"><figcaption data-image-caption></figcaption></figure>
    <div class="image-empty" data-image-empty><span aria-hidden="true">✦</span><strong>A space for your next idea</strong><p>Your generated image will appear here.</p></div>
    <div class="image-actions"><button type="button" data-image-download hidden>Download PNG</button><button type="button" data-image-attach hidden>Attach to current project</button></div>
    </div><details class="space-panel image-history"><summary>Image history</summary><p data-image-history-status role="status"></p><ul data-image-history></ul></details>`;
  const $ = selector => root.querySelector(selector), actor = getAccountId(), project = getProjectId(), controller = new AbortController();
  const history = imageHistory(JSON.stringify([actor, project]));
  const lastKey = 'invincible.image-last.' + client.origin + '.' + (actor || 'local');
  const storageKey = 'invincible.image-request.' + client.origin + '.' + (actor || 'local') + (project ? '.' + project : '');
  let job, preview, png, reference, capabilities, preparingReference = false, busy = false, drafting = false, disposed = false, pending = null, connected = false, pairing = false, checking = false;
  const current = () => !disposed && getAccountId() === actor && getProjectId() === project;
  const status = text => { if (current()) $('[data-image-status]').textContent = text; };
  const lock = value => {
    busy = value;
    root.setAttribute('aria-busy', String(busy || drafting));
    root.querySelectorAll('textarea,input[type=radio],input[type=number],[data-image-clear],[data-image-regenerate],[data-image-forget],[data-image-switch],[data-image-reference],[data-image-reference-remove],.image-history button').forEach(control => control.disabled = busy);
    for (const input of root.querySelectorAll('input[name=image-frame]')) input.disabled = busy || (!!reference && input.value !== 'square');
    $('[data-image-generate]').disabled = busy || drafting || preparingReference || !connected || pairing;
    $('[data-image-regenerate]').disabled = busy || drafting || preparingReference;
    $('[data-image-draft]').disabled = busy || drafting || pairing || !connected || !capabilities?.draftPrompt || !client.draftPrompt || !$('[data-image-idea]').value.trim();
    $('[data-image-reference]').disabled = busy || !capabilities?.referenceImage;
    $('[data-image-generate]').disabled ||= !!reference && !capabilities?.referenceImage;
  };
  function connection(session, error) {
    if (!current()) return;
    if (session && actor && session.uid !== actor) throw Error('This worker belongs to another account.');
    connected = !!session?.storage?.available;
    capabilities = session?.capabilities;
    const saved = !!client.hasPairing?.();
    const state = connected ? 'online' : !remote && !saved ? 'unpaired' : error || session ? 'offline' : 'checking';
    onConnectionChange?.({ accountId: actor, connected, remote, state });
    $('.image-connection-bar').dataset.connectionState = state;
    $('[data-image-connection]').textContent = {
      online: 'Laptop online', offline: 'Laptop offline', unpaired: 'Pair a laptop', checking: 'Checking laptop…'
    }[state];
    $('[data-image-pair]').hidden = state === 'checking';
    $('[data-image-pair]').textContent = state === 'unpaired' ? 'Pair' : state === 'online' ? 'Refresh' : 'Retry';
    $('[data-image-new-pair]').hidden = remote || !saved || state === 'checking';
    $('[data-image-forget]').hidden = !saved;
    if (connected && !remote && !capabilities?.referenceImage) {
      $('[data-image-reference-status]').textContent = 'Update the laptop worker to use a reference.';
    }
    lock(busy);
  }
  function clearPreview() { if (preview) URL.revokeObjectURL(preview); preview = null; png = null; $('figure').hidden = true; $('[data-image-empty]').hidden = false; $('[data-image-download]').hidden = true; $('[data-image-attach]').hidden = true; }
  async function showImage(result, blob) {
    const decoded = await createImageBitmap(blob);
    const matches = decoded.width === result.image.width && decoded.height === result.image.height;
    decoded.close();
    if (!matches) throw Error('Preview dimensions do not match the verified PNG.');
    if (!current()) return;
    clearPreview(); job = result; png = blob; preview = URL.createObjectURL(blob); $('[data-image-preview]').src = preview;
    $('figure').hidden = false; $('[data-image-empty]').hidden = true; $('[data-image-caption]').textContent = `${job.image.width} × ${job.image.height} · seed ${job.seed}`;
    $('[data-image-download]').hidden = false; $('[data-image-attach]').hidden = !onAttach || !getProjectId(); $('[data-image-regenerate]').hidden = false;
  }
  function forgetPending() {
    pending = null;
    sessionStorage.removeItem(storageKey);
    $('[data-image-generate]').textContent = 'Generate';
  }
  async function complete(next) {
    const result = await waitForImage(client, next, value => status(value.status === 'queued' ? 'Queued · waiting for the GPU' : value.stage === 'unloading' ? 'Running · finishing and releasing GPU memory' : 'Running · generating your image'), controller.signal);
    const blob = await client.image(result.id); if (!current()) return;
    await showImage(result, blob); if (!current()) return;
    const prompt = pending?.args.prompt ?? result.prompt;
    if (prompt) {
      try {
        await history.save({ id: result.id, image: result.image, seed: result.seed, prompt,
          idea: pending?.idea || '', preset: pending?.args.preset ?? result.preset,
          usedReference: !!result.referenceSha256, date: Date.now() }, blob);
        await renderHistory();
      } catch { historyStatus('Could not save to this browser’s history. You can still download the PNG.'); }
    }
    if (!current()) return;
    status(`Completed · ${job.generationSeconds?.toFixed(1) || '—'} seconds`); forgetPending();
  }
  const historyStatus = message => { if (current()) $('[data-image-history-status]').textContent = message; };
  async function renderHistory() {
    const entries = await history.list();
    if (!current()) return;
    const list = $('[data-image-history]');
    list.replaceChildren();
    historyStatus(entries.length ? 'Saved in this browser.' : 'Finished images will appear here.');
    for (const entry of entries.sort((a, b) => b.date - a.date)) {
      const row = document.createElement('li');
      const description = document.createElement('span');
      description.textContent = entry.prompt;
      const date = document.createElement('small');
      date.textContent = new Date(entry.date).toLocaleString();
      const edit = document.createElement('button'), remove = document.createElement('button');
      edit.type = remove.type = 'button';
      edit.textContent = 'Edit creation';
      remove.textContent = 'Delete';
      edit.onclick = async () => {
        if (!current() || busy) return;
        editVersion++;
        lock(true);
        try {
          const image = await history.image(entry.id);
          if (!image) throw Error('This image has been removed.');
          if (!current()) return;
          await showImage(entry, image);
          if (!current()) return;
          forgetPending();
          clearReference();
          $('[data-image-idea]').value = entry.idea;
          $('[data-image-prompt]').value = entry.prompt;
          for (const input of root.querySelectorAll('input[name=image-frame]')) input.checked = input.value === (entry.preset || 'square');
          $('[data-image-seed]').value = entry.seed;
          status(entry.usedReference ? 'Editing a saved creation. Reattach its reference to use it again.' : 'Editing a saved creation. Generate to make a new version.');
        } catch (error) { historyStatus(error.message); }
        finally { if (current()) { lock(false); $('[data-image-prompt]').focus(); } }
      };
      remove.onclick = async () => {
        if (!current() || busy || !window.confirm('Delete this creation from this browser’s history?')) return;
        lock(true);
        try {
          await history.remove(entry.id);
          if (!current()) return;
          if (sessionStorage.getItem(lastKey) === entry.id) sessionStorage.removeItem(lastKey);
          if (job?.id === entry.id) { clearPreview(); job = null; $('[data-image-regenerate]').hidden = true; status('Creation removed from history.'); }
          await renderHistory();
        } catch { historyStatus('Could not delete this creation.'); }
        finally { if (current()) lock(false); }
      };
      row.append(description, date, edit, remove);
      list.append(row);
    }
    lock(busy);
  }
  void renderHistory().catch(() => historyStatus('Image history is unavailable in this browser.'));
  const draftStatus = message => { if (current()) $('[data-image-draft-status]').textContent = message; };
  let editVersion = 0;
  const changed = () => { editVersion++; if (pending) forgetPending(); lock(busy); };
  let referenceVersion = 0;
  function setReference(value) {
    reference = value;
    const image = $('[data-image-reference-preview]');
    if (reference) {
      image.src = reference;
      $('input[name=image-frame][value=square]').checked = true;
    } else image.removeAttribute('src');
    image.hidden = !reference;
    $('[data-image-reference-remove]').hidden = !reference;
    changed();
  }
  $('[data-image-reference]').onchange = async event => {
    const file = event.target.files[0];
    if (!file || !current() || busy) return;
    const version = ++referenceVersion;
    preparingReference = true;
    lock(busy);
    const message = $('[data-image-reference-status]');
    try {
      const png = await prepareReference(file);
      if (!current() || version !== referenceVersion) return;
      setReference(png);
      message.textContent = 'Reference ready · 512 × 512';
    } catch (error) {
      if (current() && version === referenceVersion) {
        setReference(undefined);
        message.textContent = error.message;
      }
    } finally {
      if (current() && version === referenceVersion) { preparingReference = false; lock(busy); }
    }
  };
  function clearReference() {
    referenceVersion++;
    preparingReference = false;
    setReference(undefined);
    $('[data-image-reference]').value = '';
    $('[data-image-reference-status]').textContent = 'Optional · square crop · keep close to reference';
  }
  $('[data-image-reference-remove]').onclick = clearReference;
  root.querySelectorAll('[data-image-idea],[data-image-prompt],[data-image-seed],input[name=image-frame]').forEach(control => control.addEventListener('input', changed));
  $('[data-image-clear]').onclick = () => { $('[data-image-prompt]').value = ''; changed(); $('[data-image-prompt]').focus(); };
  $('[data-image-draft]').onclick = async () => {
    if (!current() || drafting || busy || !connected || !capabilities?.draftPrompt || !client.draftPrompt) return;
    const idea = $('[data-image-idea]').value.trim(), version = editVersion;
    if (!idea) return;
    drafting = true; lock(busy); draftStatus('Drafting with Qwen…');
    try {
      const { prompt } = await client.draftPrompt(idea, controller.signal);
      if (!current()) return;
      if (version !== editVersion) { draftStatus('Your edits were kept. Click Generate prompt to draft again.'); return; }
      if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 1500) throw Error('Qwen returned an invalid prompt.');
      $('[data-image-prompt]').value = prompt.trim();
      changed();
      draftStatus('Prompt ready. Edit it or click Generate.');
    } catch (error) { draftStatus(error.status === 404 ? 'Update and reopen the laptop image worker to draft prompts.' : error.message); }
    finally { drafting = false; if (current()) lock(busy); }
  };
  async function generate(event) {
    event?.preventDefault(); event?.stopPropagation(); if (busy || drafting || preparingReference || !current()) return;
    if(!connected){status('Connect this laptop before generating.');return;}
    if(reference&&!capabilities?.referenceImage){status('Update the laptop image worker or remove the reference.');return;}
    if (!pending) {
      const prompt = $('[data-image-prompt]').value.trim(), preset = $('input[name=image-frame]:checked').value, text = $('[data-image-seed]').value;
      if (!prompt) return;
      pending = { args: { prompt, preset, ...(text === '' ? {} : { seed: Number(text) }) }, key: crypto.randomUUID(), idea: $('[data-image-idea]').value.trim() };
      if (!reference) sessionStorage.setItem(storageKey, JSON.stringify(pending));
    }
    lock(true); clearPreview(); status('Submitting…');
    try { const result = await client.generate(pending.args, pending.key, reference?.split(',')[1]); if (current()) await complete(result.job); }
    catch (error) { if (current()) { clearPreview(); status(error.status===401?'Connect this laptop to continue.':error.code==='LOCAL_WORKER_UNREACHABLE'?'Laptop worker unavailable. Your request can be retried.':'Failed · ' + error.message); if(error.status===401||error.code==='LOCAL_WORKER_UNREACHABLE'||error.code==='functions/unavailable')connection(null,error); if (error.job?.status === 'failed' || error.definitive) { pending = null; sessionStorage.removeItem(storageKey); } $('[data-image-regenerate]').hidden = !error.job; $('[data-image-generate]').textContent = pending ? 'Retry request' : 'Generate'; } }
    finally { if (current()) { lock(false); if (!pending) $('[data-image-generate]').textContent = 'Generate'; } }
  }
  $('[data-image-generate]').addEventListener('click', generate);
  $('[data-image-regenerate]').onclick = () => { pending = null; void generate(); };
  $('[data-image-switch]').onclick = () => { if (!busy) onSwitch?.(); };
  async function connectLaptop({ pairBrowser = false } = {}) {
    if (pairing) return;
    pairing = true;
    $('[data-image-pair]').disabled = true;
    $('[data-image-new-pair]').disabled = true;
    lock(busy);
    const refresh = !pairBrowser && (remote || client.hasPairing?.());
    const previousStatus = $('[data-image-connection]').textContent;
    $('[data-image-connection]').textContent = refresh ? 'Checking laptop…' : 'Confirm in the popup';
    status('');
    try {
      const session = await (refresh ? client.connect() : client.pairInBrowser());
      if (!current()) return;
      connection(session);
      if (!connected) status(session.storage.error);
    } catch (error) {
      if (!pairBrowser) connection(null, error);
      else if (current()) $('[data-image-connection]').textContent = previousStatus;
      status(error.message);
    } finally {
      pairing = false;
      if (current()) {
        $('[data-image-pair]').disabled = false;
        $('[data-image-new-pair]').disabled = false;
        lock(busy);
      }
    }
  }
  $('[data-image-pair]').onclick = () => connectLaptop();
  $('[data-image-new-pair]').onclick = () => connectLaptop({ pairBrowser: true });
  $('[data-image-forget]').onclick=()=>{
    if (!window.confirm('Forget the saved laptop connection in this browser? You’ll need to connect it again to use this laptop here.')) return;
    client.forget();
    clearPreview();
    connection();
    status('Laptop forgotten on this browser.');
  };
  $('[data-image-connect]').onclick = async () => { try { const session = await client.connect($('[data-image-token]').value); $('[data-image-token]').value = '';connection(session);status(connected?'':session.storage.error); } catch (error) { connection(null,error);status(error.message); } };
  $('[data-image-download]').onclick = async () => { try { const blob = png || await client.image(job.id, true); if (!current()) return; const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = 'invincible-' + job.id + '.png'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); } catch (error) { status('Download failed · ' + error.message); } };
  $('[data-image-attach]').onclick = async () => { if (busy || !current()) return; const projectId = getProjectId(); lock(true); $('[data-image-attach]').disabled = true;
    try { const blob = png || await client.image(job.id); if (!current() || getProjectId() !== projectId) throw Error('The current project changed.'); await onAttach(new File([blob], 'generated-' + job.id + '.png', { type: 'image/png' }), job); if (current() && getProjectId() === projectId) status('Attached to current project'); }
    catch (error) { status('Attachment failed · ' + error.message); } finally { if (current()) { lock(false); $('[data-image-attach]').disabled = false; } }
  };
  async function showKnown(id) {
    if (busy || !current() || !(remote ? /^remote_[a-f0-9]{32}$/ : /^agent_[a-f0-9]{32}$/).test(id || '')) return;
    lock(true);clearPreview();try { await complete((await client.job(id)).job); } catch(error) { status('Failed · '+error.message); } finally { if(current())lock(false); }
  }
  const notification = event => { const data=event.detail || event.data;if(event.type==='message'&&event.origin!==location.origin)return;if(current()&&data?.type==='invincible-image-job'&&data.origin===client.origin){onReveal();void showKnown(data.jobId);} };
  window.addEventListener('message',notification);window.addEventListener('invincible-image-job',notification);
  async function refreshPairing(){if(!current()||pairing||checking)return;if(!remote&&!client.hasPairing?.()){connection();clearPreview();return;}checking=true;try{connection(await client.connect());}catch(error){connection(null,error);}finally{checking=false;}}
  const storageChanged=event=>{if(event.key===null||event.key===client.pairingKey)void refreshPairing();};
  const focusChanged=()=>{if(!connected&&(remote||client.hasPairing?.()))void refreshPairing();};
  const disconnected=event=>{if(event.detail?.origin===client.origin&&event.detail?.account===actor)void refreshPairing();};
  window.addEventListener('storage',storageChanged);window.addEventListener('focus',focusChanged);window.addEventListener('invincible-local-disconnected',disconnected);
  if (remote) connection();
  const ready = client.connect().then(async session => {
    if (!current()) return; if (actor && session.uid !== actor) throw Error('This worker belongs to another account.');
    connection(session);
    if (!session.storage.available) status('Unavailable · ' + session.storage.error);
    const saved = sessionStorage.getItem(storageKey);
    if (!saved && !project) { const last = sessionStorage.getItem(lastKey); if (last) void showKnown(last); }
    if (saved) {
      pending = JSON.parse(saved);
      $('[data-image-idea]').value = pending.idea || '';
      $('[data-image-prompt]').value = pending.args.prompt;
      for (const input of root.querySelectorAll('input[name=image-frame]')) input.checked = input.value === pending.args.preset;
      $('[data-image-seed]').value = pending.args.seed ?? '';
      status('An earlier request may still be active. Retry request to reconnect.');
      $('[data-image-generate]').textContent = 'Retry request';
      lock(busy);
    }
  }).catch(error => { connection(null,error); });
  return { ready, refresh: refreshPairing, async showJob(next) { lock(true); clearPreview(); try { await complete(next); } catch (error) { status('Failed · ' + error.message); } finally { if (current()) lock(false); } }, destroy() { window.removeEventListener('message',notification);window.removeEventListener('invincible-image-job',notification);window.removeEventListener('storage',storageChanged);window.removeEventListener('focus',focusChanged);window.removeEventListener('invincible-local-disconnected',disconnected);disposed = true; controller.abort(); clearPreview(); } };
}
