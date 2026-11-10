export function createLocalImageClient({ origin = window.__INVINCIBLE_LOCAL_AI_ORIGIN__ || 'http://127.0.0.1:8788', getAccountId = () => null, requireAccount = false } = {}) {
  const parsed = new URL(origin);
  if (!['127.0.0.1', 'localhost'].includes(parsed.hostname) || parsed.protocol !== 'http:' || parsed.origin !== origin) throw Error('Choose a loopback local worker address.');
  const key = 'invincible.local-worker.' + origin;
  const fragment = new URLSearchParams(location.hash.slice(1)), paired = fragment.get('pair');
  if (paired) { sessionStorage.setItem(key, paired); history.replaceState(null, '', location.pathname + location.search); }
  async function request(route, body, { binary = false } = {}) {
    const account = getAccountId(), token = sessionStorage.getItem(key);
    if (requireAccount && !account) throw Error('Sign in before using the local image worker.');
    if (!token) throw Error('Connect to your local worker in Advanced settings.');
    let response;
    try { response = await fetch(origin + route, { method: body === undefined ? 'GET' : 'POST', headers: { Authorization: 'Bearer ' + token, ...(account ? { 'X-Invincible-Account': account } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(route === '/api/command' ? 120000 : 15000), redirect: 'error' }); }
    catch { throw Error('Local worker unavailable or request interrupted. Retry with the same request key.'); }
    if (getAccountId() !== account) throw Error('Your account changed. Reopen the image panel.');
    if (!response.ok) { const data = await response.json(); throw Object.assign(Error(data.error || 'Local worker rejected this request.'), { definitive: true }); }
    return binary ? response.blob() : response.json();
  }
  return { origin, request,
    async connect(token) { if (token) sessionStorage.setItem(key, token.trim()); return request('/api/session'); },
    generate: (args, idempotencyKey) => request('/api/generations', { arguments: args, idempotencyKey }),
    job: id => request('/api/generations/' + encodeURIComponent(id)),
    image: (id, download = false) => request('/api/generations/' + encodeURIComponent(id) + '/image' + (download ? '?download=1' : ''), undefined, { binary: true }),
    command: (message, idempotencyKey) => request('/api/command', { message, idempotencyKey }),
  };
}

export async function waitForImage(client, initial, onStatus = () => {}, signal) {
  let job = initial;
  for (let n = 0; n < 900; n++) {
    if (signal?.aborted) throw Error('Image panel closed. The local job may still finish.');
    onStatus(job);
    if (job.status === 'failed') throw Object.assign(Error(job.error?.message || 'Image generation failed.'), { job });
    if (job.status === 'completed') { if (!job.verified || !job.image) throw Error('The worker did not verify this PNG.'); return job; }
    if (!['queued', 'running'].includes(job.status)) throw Error('Unknown generation status.');
    await new Promise(resolve => setTimeout(resolve, 1000)); job = (await client.job(job.id)).job;
  }
  throw Error('Still waiting for the worker. Reconnect to check the existing generation.');
}
