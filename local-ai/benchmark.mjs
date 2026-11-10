import { performance } from 'node:perf_hooks';

const model = process.env.OLLAMA_BENCHMARK_MODEL || 'qwen3:4b';
const prompt = 'Return only JSON with keys ok, action, title. Set ok=true, action=create_project, title=Panipat.';
const started = performance.now();
const response = await fetch('http://127.0.0.1:11434/api/generate', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ model, prompt, stream: false, think: false, format: 'json', options: { temperature: 0, num_predict: 64 } }),
});
if (!response.ok) throw new Error(`Ollama returned ${response.status}`);
const payload = await response.json();
const wallMs = performance.now() - started;
const evalSeconds = payload.eval_duration / 1e9;
console.log(JSON.stringify({
  model,
  wallMs: Math.round(wallMs),
  loadMs: Math.round(payload.load_duration / 1e6),
  promptEvalMs: Math.round(payload.prompt_eval_duration / 1e6),
  evalMs: Math.round(payload.eval_duration / 1e6),
  evalTokens: payload.eval_count,
  tokensPerSecond: Number((payload.eval_count / evalSeconds).toFixed(2)),
  response: payload.response,
}, null, 2));
