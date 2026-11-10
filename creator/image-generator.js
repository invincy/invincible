import { createLocalImageClient, waitForImage } from '../local-ai/image-client.js';

export function mountImageGenerator(root, { client = createLocalImageClient(), getAccountId = () => null, getProjectId = () => null, onAttach } = {}) {
  root.classList.add('image-generator');
  root.innerHTML = `<div data-image-form><header><div><small>ON THIS LAPTOP</small><h3>Create an image</h3></div><span>SD 1.5</span></header>
    <label>Prompt<textarea data-image-prompt rows="4" maxlength="1500" required placeholder="Describe the image you want…"></textarea></label>
    <fieldset><legend>Frame</legend><label><input type="radio" name="image-frame" value="square" checked>Square <small>512 × 512</small></label><label><input type="radio" name="image-frame" value="portrait">Portrait <small>384 × 640</small></label><label><input type="radio" name="image-frame" value="landscape">Landscape <small>640 × 384</small></label></fieldset>
    <details><summary>Advanced settings</summary><label>Seed <small>Leave empty for a new variation</small><input data-image-seed type="number" min="0" max="4294967295" step="1"></label><details><summary>Local connection</summary><label>Pairing code<input data-image-token type="password" autocomplete="off"></label><button type="button" data-image-connect>Connect</button><p data-image-connection></p></details></details>
    <div class="image-actions"><button type="button" data-image-generate>Generate</button><button type="button" data-image-regenerate hidden>Regenerate</button></div></div>
    <p role="status" aria-live="polite" data-image-status>Ready · usually about 32 seconds</p>
    <figure hidden><img data-image-preview alt="Generated image"><figcaption data-image-caption></figcaption></figure>
    <div class="image-actions"><button type="button" data-image-download hidden>Download PNG</button><button type="button" data-image-attach hidden>Attach to current project</button></div>`;
  const $ = selector => root.querySelector(selector), actor = getAccountId(), controller = new AbortController();
  let job, preview, busy = false, disposed = false, pending = null;
  const storageKey = 'invincible.image-request.' + client.origin + '.' + (actor || 'local');
  const current = () => !disposed && getAccountId() === actor;
  const status = text => { if (current()) $('[data-image-status]').textContent = text; };
  const lock = value => { busy = value; root.setAttribute('aria-busy', String(value)); root.querySelectorAll('textarea,input[type=radio],input[type=number],[data-image-generate],[data-image-regenerate]').forEach(control => control.disabled = value); };
  function clearPreview() { if (preview) URL.revokeObjectURL(preview); preview = null; $('figure').hidden = true; $('[data-image-download]').hidden = true; $('[data-image-attach]').hidden = true; }
  async function complete(next) {
    job = await waitForImage(client, next, value => status(value.status === 'queued' ? 'Queued · waiting for the GPU' : value.stage === 'unloading' ? 'Running · finishing and releasing GPU memory' : 'Running · generating your image'), controller.signal);
    const blob = await client.image(job.id); if (!current()) return;
    const decoded = await createImageBitmap(blob);
    if (decoded.width !== job.image.width || decoded.height !== job.image.height) { decoded.close(); throw Error('Preview dimensions do not match the verified PNG.'); } decoded.close();
    clearPreview(); preview = URL.createObjectURL(blob); $('[data-image-preview]').src = preview;
    $('figure').hidden = false; $('[data-image-caption]').textContent = `${job.image.width} × ${job.image.height} · seed ${job.seed}`;
    $('[data-image-download]').hidden = false; $('[data-image-attach]').hidden = !onAttach || !getProjectId(); $('[data-image-regenerate]').hidden = false;
    status(`Completed · ${job.generationSeconds?.toFixed(1) || '—'} seconds`); sessionStorage.removeItem(storageKey); pending = null;
  }
  async function generate(event) {
    event?.preventDefault(); event?.stopPropagation(); if (busy || !current()) return;
    if (!pending) {
      const prompt = $('[data-image-prompt]').value.trim(), preset = $('input[name=image-frame]:checked').value, text = $('[data-image-seed]').value;
      if (!prompt) return;
      pending = { args: { prompt, preset, ...(text === '' ? {} : { seed: Number(text) }) }, key: crypto.randomUUID() }; sessionStorage.setItem(storageKey, JSON.stringify(pending));
    }
    lock(true); clearPreview(); status('Submitting…');
    try { const result = await client.generate(pending.args, pending.key); if (current()) await complete(result.job); }
    catch (error) { if (current()) { clearPreview(); status('Failed · ' + error.message); if (error.job?.status === 'failed' || error.definitive) { pending = null; sessionStorage.removeItem(storageKey); } $('[data-image-regenerate]').hidden = !error.job; $('[data-image-generate]').textContent = pending ? 'Retry request' : 'Generate'; } }
    finally { if (current()) { lock(false); if (!pending) $('[data-image-generate]').textContent = 'Generate'; } }
  }
  $('[data-image-generate]').addEventListener('click', generate);
  $('[data-image-regenerate]').onclick = () => { pending = null; void generate(); };
  $('[data-image-connect]').onclick = async () => { try { const session = await client.connect($('[data-image-token]').value); $('[data-image-token]').value = ''; if (actor && session.uid !== actor) throw Error('This worker belongs to another account.'); $('[data-image-connection]').textContent = session.storage.available ? 'Connected' : session.storage.error; } catch (error) { $('[data-image-connection]').textContent = error.message; } };
  $('[data-image-download]').onclick = async () => { try { const blob = await client.image(job.id, true); if (!current()) return; const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = 'invincible-' + job.id + '.png'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); } catch (error) { status('Download failed · ' + error.message); } };
  $('[data-image-attach]').onclick = async () => { if (busy || !current()) return; const projectId = getProjectId(); lock(true); $('[data-image-attach]').disabled = true;
    try { const blob = await client.image(job.id); if (!current() || getProjectId() !== projectId) throw Error('The current project changed.'); await onAttach(new File([blob], 'generated-' + job.id + '.png', { type: 'image/png' }), job); if (current() && getProjectId() === projectId) status('Attached to current project'); }
    catch (error) { status('Attachment failed · ' + error.message); } finally { if (current()) { lock(false); $('[data-image-attach]').disabled = false; } }
  };
  async function showKnown(id) {
    if (busy || !current() || !/^agent_[a-f0-9]{32}$/.test(id || '')) return;
    lock(true);clearPreview();try { await complete((await client.job(id)).job); } catch(error) { status('Failed · '+error.message); } finally { if(current())lock(false); }
  }
  const notification = event => { const data=event.detail || event.data;if(event.type==='message'&&event.origin!==location.origin)return;if(data?.type==='invincible-image-job'&&data.origin===client.origin)void showKnown(data.jobId); };
  window.addEventListener('message',notification);window.addEventListener('invincible-image-job',notification);
  const ready = client.connect().then(async session => {
    if (!current()) return; if (actor && session.uid !== actor) throw Error('This worker belongs to another account.');
    $('[data-image-connection]').textContent = session.storage.available ? 'Connected' : session.storage.error;
    if (!session.storage.available) status('Unavailable · ' + session.storage.error);
    const saved = sessionStorage.getItem(storageKey);if(!saved){const last=sessionStorage.getItem('invincible.image-last.'+client.origin+'.'+(actor||'local'));if(last)void showKnown(last);} if (saved) { pending = JSON.parse(saved); $('[data-image-prompt]').value = pending.args.prompt; status('An earlier request may still be active. Retry request to reconnect.'); $('[data-image-generate]').textContent = 'Retry request'; }
  }).catch(error => { if (current()) $('[data-image-connection]').textContent = error.message; });
  return { ready, async showJob(next) { lock(true); clearPreview(); try { await complete(next); } catch (error) { status('Failed · ' + error.message); } finally { if (current()) lock(false); } }, destroy() { window.removeEventListener('message',notification);window.removeEventListener('invincible-image-job',notification);disposed = true; controller.abort(); clearPreview(); } };
}
