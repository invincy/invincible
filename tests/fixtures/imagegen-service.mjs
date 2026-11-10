import { deflateSync } from 'node:zlib';
export function fixturePng(width, height) {
  function chunk(name, bytes) {
    const body = Buffer.concat([Buffer.from(name), bytes]); let crc = 0xffffffff;
    for (const byte of body) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0); }
    const result = Buffer.alloc(bytes.length + 12); result.writeUInt32BE(bytes.length); body.copy(result, 4); result.writeUInt32BE((crc ^ 0xffffffff) >>> 0, result.length - 4); return result;
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 2;
  const pixels = Buffer.alloc((width * 3 + 1) * height, 90); for (let y = 0; y < height; y++) pixels[y * (width * 3 + 1)] = 0;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]);
}
export function fakeGpu({ failed = false, wrongOutput = false, corrupt = false, unavailable = false, ollamaOffline = false } = {}) {
  const calls = []; let prompt, polls = 0, active = false, qwenLoaded = true, loads = 0, failNext = failed;
  const id = '12345678-1234-1234-1234-123456789012';
  const json = value => new Response(JSON.stringify(value), { headers: { 'content-type': 'application/json' } });
  const fetchImpl = async (url, options = {}) => {
    const u = new URL(url), route = u.pathname; calls.push({ route, port: u.port, body: options.body && JSON.parse(options.body) });
    if (u.port === '11434') {
      if (ollamaOffline) throw Object.assign(Error('offline'), { cause: { code: 'ECONNREFUSED' } });
      if (route === '/api/ps') return json({ models: qwenLoaded ? [{ name: 'qwen3:4b', size_vram: 2000000000 }] : [] });
      if (route === '/api/generate') { qwenLoaded = false; return json({ done: true }); }
      throw Error('Unexpected Ollama call: ' + route);
    }
    if (unavailable) throw Error('ComfyUI unavailable');
    if (route === '/prompt') { prompt = JSON.parse(options.body).prompt; polls = 0; active = true; loads++; return json({ prompt_id: id, node_errors: {} }); }
    if (route.startsWith('/history/')) {
      polls++; if (polls < 3) return json({}); active = false;
      return json({ [id]: { prompt: [0, id, prompt, {}, ['7']], status: { completed: true, status_str: failNext ? 'error' : 'success', messages: [] }, outputs: { '7': { images: [{ filename: wrongOutput ? 'unrelated.png' : prompt['7'].inputs.filename_prefix + '_00001_.png', subfolder: '', type: 'output' }] } } } });
    }
    if (route === '/queue') { if (options.method === 'POST') { active = false; return json({}); } return json({ queue_running: active ? [[0,id]] : [], queue_pending: [] }); }
    if (route === '/interrupt') { active = false; return json({}); }
    if (route === '/free') return new Response(null,{status:200});
    if (route === '/system_stats') return json({ devices: [{ torch_vram_total: 0, torch_vram_free: 0 }] });
    if (route === '/view') { const input = prompt['4'].inputs, bytes = fixturePng(input.width, input.height); if (corrupt) bytes[bytes.length - 1] ^= 1; return new Response(bytes, { headers: { 'content-type': 'image/png' } }); }
    throw Error('Unexpected fixture call: ' + route);
  };
  return { fetchImpl, calls, fail() { failNext = true; }, get loads() { return loads; } };
}
