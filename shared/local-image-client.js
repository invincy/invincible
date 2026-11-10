export function createLocalImageClient({ origin = window.__INVINCIBLE_LOCAL_AI_ORIGIN__ || 'http://127.0.0.1:8788', getAccountId = () => null, requireAccount = false } = {}) {
  const parsed = new URL(origin);
  if (!['127.0.0.1', 'localhost'].includes(parsed.hostname) || parsed.protocol !== 'http:' || parsed.origin !== origin) throw Error('Choose a loopback local worker address.');
  const key = 'invincible.local-worker.' + origin;
  const fragment = new URLSearchParams(location.hash.slice(1)), paired = fragment.get('pair');
  if (paired) { sessionStorage.setItem(key, paired); history.replaceState(null, '', location.pathname + location.search); }
  async function request(route, body, { binary = false } = {}) {
    const account = getAccountId(), token = sessionStorage.getItem(key);
    if (requireAccount && !account) throw Error('Sign in before using the local image worker.');
    if (!token) throw Object.assign(Error('Connect this laptop to generate images.'), {status:401,code:'LOCAL_PAIRING_REQUIRED',definitive:true});
    let response;
    try { response = await fetch(origin + route, { method: body === undefined ? 'GET' : 'POST', headers: { Authorization: 'Bearer ' + token, ...(account ? { 'X-Invincible-Account': account } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(route === '/api/command' ? 120000 : 15000), redirect: 'error', targetAddressSpace: 'loopback' }); }
    catch { throw Error('Cannot reach this laptop. Start Image Studio and allow the browser’s local connection, then retry the same request.'); }
    if (getAccountId() !== account) throw Error('Your account changed. Reopen the image panel.');
    if (!response.ok) { const data = await response.json(); if (response.status === 401) sessionStorage.removeItem(key); throw Object.assign(Error(data.error || 'Local worker rejected this request.'), { definitive: true, status: response.status, code: data.code }); }
    return binary ? response.blob() : response.json();
  }
  return { origin, request,
    pairInBrowser() {
      const uid = getAccountId();
      if (!uid) return Promise.reject(Error('Sign in to Invincible before connecting this laptop.'));
      const nonce = crypto.randomUUID();
      return new Promise((resolve, reject) => {
        let popup, timer, closed;
        function cleanup() { clearTimeout(timer); clearInterval(closed); window.removeEventListener('message', receive); }
        async function receive(event) {
          const message = event.data;
          if (event.origin !== origin || event.source !== popup || message?.type !== 'invincible-local-pair' || message.nonce !== nonce || message.uid !== uid || !/^[A-Za-z0-9_-]{32,100}$/.test(message.token || '')) return;
          cleanup();
          if (getAccountId() !== uid) { reject(Error('Your account changed. Connect again.')); return; }
          sessionStorage.setItem(key, message.token);
          try { const result = await request('/api/session'); if (result.uid !== uid) throw Error('The local worker belongs to another account.'); window.dispatchEvent(new Event('invincible-local-connected')); resolve(result); } catch (error) { sessionStorage.removeItem(key); reject(error); }
        }
        window.addEventListener('message', receive);
        popup = window.open(origin + '/connect?' + new URLSearchParams({ origin: location.origin, nonce, uid }), 'invincible-local-connect', 'popup,width=560,height=440');
        if (!popup) { cleanup(); reject(Error('Allow the connection popup, then try again.')); return; }
        timer = setTimeout(() => { cleanup(); reject(Error('Connection was not confirmed. Start the laptop service and try again.')); }, 120000);
        closed = setInterval(() => { if (popup.closed) { cleanup(); reject(Error('The connection window closed before confirmation.')); } }, 500);
      });
    },
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
