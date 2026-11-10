import { createLocalImageClient, waitForImage } from '../shared/local-image-client.js';
import { createRemoteImageClient } from '../shared/remote-image-client.js';

export function mountConnectedImageGenerator(root, { getAccountId, callRelay, clientFactory = createLocalImageClient, ...options }) {
  const local = clientFactory({ getAccountId, requireAccount: true });
  const remote = createRemoteImageClient({ getAccountId, call: callRelay });
  const preference = 'invincible.image-connection.' + getAccountId();
  let selected;
  try { selected = sessionStorage.getItem(preference); } catch {}
  const loopbackPage = ['127.0.0.1', 'localhost'].includes(location.hostname);
  let client = selected === 'remote' || (!selected && !loopbackPage && !local.hasPairing?.()) ? remote : local;
  let panel;
  function mount() {
    panel = mountImageGenerator(root, { ...options, getAccountId, client, onSwitch: () => {
      const prompt = root.querySelector('[data-image-prompt]').value;
      const frame = root.querySelector('input[name=image-frame]:checked').value;
      const seed = root.querySelector('[data-image-seed]').value;
      panel.destroy();
      client = client === local ? remote : local;
      try { sessionStorage.setItem(preference, client.remote ? 'remote' : 'local'); } catch {}
      mount();
      root.querySelector('[data-image-prompt]').value = prompt;
      root.querySelector('input[value=' + frame + ']').checked = true;
      root.querySelector('[data-image-seed]').value = seed;
      root.querySelector('[data-image-switch]').focus();
    } });
  }
  mount();
  return { destroy: () => panel.destroy() };
}

export function mountImageGenerator(root, { client = createLocalImageClient(), getAccountId = () => null, getProjectId = () => null, onAttach, onReveal = () => {}, onSwitch } = {}) {
  const remote = client.remote === true;
  root.classList.add('image-generator');
  root.innerHTML = `<div data-image-form><header><div><h3>Create an image</h3></div><span>SD 1.5</span></header>
    <div class="image-connection-bar"><p data-image-connection role="status">Connect this laptop to start.</p><button type="button" data-image-pair>Connect this laptop</button></div>
    <button type="button" data-image-switch ${onSwitch ? '' : 'hidden'}>${remote ? 'Use this device’s local connection' : 'Use my laptop remotely'}</button>
    <label>Prompt<textarea data-image-prompt rows="4" maxlength="1500" required placeholder="Describe the image you want…"></textarea></label>
    <fieldset><legend>Frame</legend><label><input type="radio" name="image-frame" value="square" checked>Square <small>512 × 512</small></label><label><input type="radio" name="image-frame" value="portrait">Portrait <small>384 × 640</small></label><label><input type="radio" name="image-frame" value="landscape">Landscape <small>640 × 384</small></label></fieldset>
    <details><summary>Advanced settings</summary><label>Seed <small>Leave empty for a new variation</small><input data-image-seed type="number" min="0" max="4294967295" step="1"></label><button type="button" data-image-forget hidden>Forget this laptop</button><details ${remote ? 'hidden' : ''}><summary>Manual pairing</summary><label>Pairing code<input data-image-token type="password" autocomplete="off"></label><button type="button" data-image-connect>Connect</button></details></details>
    <div class="image-actions"><button type="button" data-image-generate disabled>Generate</button><button type="button" data-image-regenerate hidden>Regenerate</button></div></div>
    <p role="status" aria-live="polite" data-image-status>Ready · usually 30–60 seconds</p>
    <figure hidden><img data-image-preview alt="Generated image"><figcaption data-image-caption></figcaption></figure>
    <div class="image-empty" data-image-empty><span aria-hidden="true">✦</span><strong>A space for your next idea</strong><p>Your generated image will appear here.</p></div>
    <div class="image-actions"><button type="button" data-image-download hidden>Download PNG</button><button type="button" data-image-attach hidden>Attach to current project</button></div>`;
  const $ = selector => root.querySelector(selector), actor = getAccountId(), controller = new AbortController();
  let job, preview, png, busy = false, disposed = false, pending = null, connected = false, pairing = false, checking = false;
  const storageKey = 'invincible.image-request.' + client.origin + '.' + (actor || 'local');
  const current = () => !disposed && getAccountId() === actor;
  const status = text => { if (current()) $('[data-image-status]').textContent = text; };
  const lock = value => { busy = value; root.setAttribute('aria-busy', String(value)); root.querySelectorAll('textarea,input[type=radio],input[type=number],[data-image-generate],[data-image-regenerate],[data-image-forget],[data-image-switch]').forEach(control => control.disabled = value); $('[data-image-generate]').disabled=value||!connected||pairing; };
  function connection(session,error){if(!current())return;if(session&&actor&&session.uid!==actor)throw Error('This worker belongs to another account.');connected=!!session?.storage?.available;const saved=client.hasPairing?.();$('[data-image-pair]').hidden=connected;$('[data-image-pair]').textContent=saved||remote?'Check connection':'Connect this laptop';$('[data-image-forget]').hidden=!saved;$('[data-image-connection]').textContent=connected?(remote?'Laptop online · remote connection':session.remembered===false?'Connected for this tab':'Connected · laptop remembered'):error?.message||session?.storage?.error||(remote?'Checking your laptop…':'Connect this laptop to start.');lock(busy);}
  function clearPreview() { if (preview) URL.revokeObjectURL(preview); preview = null; png = null; $('figure').hidden = true; $('[data-image-empty]').hidden = false; $('[data-image-download]').hidden = true; $('[data-image-attach]').hidden = true; }
  async function complete(next) {
    job = await waitForImage(client, next, value => status(value.status === 'queued' ? 'Queued · waiting for the GPU' : value.stage === 'unloading' ? 'Running · finishing and releasing GPU memory' : 'Running · generating your image'), controller.signal);
    const blob = await client.image(job.id); if (!current()) return;
    const decoded = await createImageBitmap(blob);
    if (decoded.width !== job.image.width || decoded.height !== job.image.height) { decoded.close(); throw Error('Preview dimensions do not match the verified PNG.'); } decoded.close();
    clearPreview(); png = remote ? blob : null; preview = URL.createObjectURL(blob); $('[data-image-preview]').src = preview;
    $('figure').hidden = false; $('[data-image-empty]').hidden = true; $('[data-image-caption]').textContent = `${job.image.width} × ${job.image.height} · seed ${job.seed}`;
    $('[data-image-download]').hidden = false; $('[data-image-attach]').hidden = !onAttach || !getProjectId(); $('[data-image-regenerate]').hidden = false;
    status(`Completed · ${job.generationSeconds?.toFixed(1) || '—'} seconds`); sessionStorage.removeItem(storageKey); pending = null;
    if (remote) sessionStorage.setItem('invincible.image-last.' + client.origin + '.' + (actor || 'local'), job.id);
  }
  async function generate(event) {
    event?.preventDefault(); event?.stopPropagation(); if (busy || !current()) return;
    if(!connected){status('Connect this laptop before generating.');return;}
    if (!pending) {
      const prompt = $('[data-image-prompt]').value.trim(), preset = $('input[name=image-frame]:checked').value, text = $('[data-image-seed]').value;
      if (!prompt) return;
      pending = { args: { prompt, preset, ...(text === '' ? {} : { seed: Number(text) }) }, key: crypto.randomUUID() }; sessionStorage.setItem(storageKey, JSON.stringify(pending));
    }
    lock(true); clearPreview(); status('Submitting…');
    try { const result = await client.generate(pending.args, pending.key); if (current()) await complete(result.job); }
    catch (error) { if (current()) { clearPreview(); status(error.status===401?'Connect this laptop to continue.':error.code==='LOCAL_WORKER_UNREACHABLE'?'Laptop worker unavailable. Your request can be retried.':'Failed · ' + error.message); if(error.status===401||error.code==='LOCAL_WORKER_UNREACHABLE'||error.code==='functions/unavailable')connection(null,error); if (error.job?.status === 'failed' || error.definitive) { pending = null; sessionStorage.removeItem(storageKey); } $('[data-image-regenerate]').hidden = !error.job; $('[data-image-generate]').textContent = pending ? 'Retry request' : 'Generate'; } }
    finally { if (current()) { lock(false); if (!pending) $('[data-image-generate]').textContent = 'Generate'; } }
  }
  $('[data-image-generate]').addEventListener('click', generate);
  $('[data-image-regenerate]').onclick = () => { pending = null; void generate(); };
  $('[data-image-switch]').onclick = () => { if (!busy) onSwitch?.(); };
  $('[data-image-pair]').onclick = async () => { if(pairing)return;pairing=true;$('[data-image-pair]').disabled=true;lock(busy);try { const saved=remote||client.hasPairing?.();status(saved?'Checking the laptop connection…':'Confirm the connection in the laptop window.');const session=await (saved?client.connect():client.pairInBrowser());if(!current())return;connection(session);status(connected?'Connected · ready to generate':session.storage.error); } catch(error) { connection(null,error);status(error.message); } finally{pairing=false;if(current()){$('[data-image-pair]').disabled=false;lock(busy);}} };
  $('[data-image-forget]').onclick=()=>{client.forget();clearPreview();connection();status('Laptop forgotten on this browser.');};
  $('[data-image-connect]').onclick = async () => { try { const session = await client.connect($('[data-image-token]').value); $('[data-image-token]').value = '';connection(session);status(connected?'Connected · ready to generate':session.storage.error); } catch (error) { connection(null,error); } };
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
    const saved = sessionStorage.getItem(storageKey);if(!saved){const last=sessionStorage.getItem('invincible.image-last.'+client.origin+'.'+(actor||'local'));if(last)void showKnown(last);} if (saved) { pending = JSON.parse(saved); $('[data-image-prompt]').value = pending.args.prompt; status('An earlier request may still be active. Retry request to reconnect.'); $('[data-image-generate]').textContent = 'Retry request'; }
  }).catch(error => { connection(null,error); });
  return { ready, async showJob(next) { lock(true); clearPreview(); try { await complete(next); } catch (error) { status('Failed · ' + error.message); } finally { if (current()) lock(false); } }, destroy() { window.removeEventListener('message',notification);window.removeEventListener('invincible-image-job',notification);window.removeEventListener('storage',storageChanged);window.removeEventListener('focus',focusChanged);window.removeEventListener('invincible-local-disconnected',disconnected);disposed = true; controller.abort(); clearPreview(); } };
}
