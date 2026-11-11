import { loadVoices } from '../tts-api.js';
import { createLocalImageClient } from '../../shared/local-image-client.js?v=2026111112';
import { checkStudioEncoding } from './export.js?v=2026111209';

const labels = {
  laptop: 'Laptop connector',
  whisper: 'Whisper',
  qwen: 'Qwen',
  voiceover: 'Google Voiceover',
  export: 'MP4 export',
};
const ready = { ready: true, detail: 'Ready' };
const unavailable = detail => ({ ready: false, detail });

export function selectProductionVoice(voices, accountId) {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('invincible.creator.tts.draft.v1.' + accountId)) || {}; } catch {}
  const supported = voices.filter(voice => voice?.capabilities?.supported && voice.languageCodes?.length);
  const hasGemini = supported.some(voice => voice.family === 'Gemini');
  const engine = saved.engine === 'classic' || !hasGemini ? 'classic' : 'gemini';
  const language = String(saved.language || 'hi-IN');
  const inFamily = supported.filter(voice => (voice.family === 'Gemini') === (engine === 'gemini'));
  const matching = inFamily.filter(voice => voice.languageCodes.includes(language));
  const candidates = matching.length ? matching : inFamily;
  const selected = candidates.find(voice => voice.name === saved.voice) || candidates[0];
  return { saved, engine, language, selected };
}

export function createProductionReadiness(getAccountId) {
  const worker = createLocalImageClient({ getAccountId, requireAccount: true });
  const request = route => worker.request(route, undefined, { timeoutMs: 8000 });

  async function localChecks() {
    const unknown = unavailable('Waiting for the laptop connector');
    const blocked = detail => ({ laptop: unavailable(detail), whisper: unknown, qwen: unknown });
    if (!worker.hasPairing()) return blocked('This browser has no saved laptop connection');
    try {
      const session = await request('/api/session');
      if (session.uid !== getAccountId()) return blocked('The saved connection belongs to a different account');
    } catch {
      return blocked('Start the Invincible laptop connector, then refresh');
    }
    try {
      const catalog = await request('/api/voiceover/catalog-status?check=production');
      if (catalog.automaticContext !== true) return blocked('Start the current version of the laptop connector');
      return { laptop: ready, whisper: ready, qwen: ready };
    } catch (error) {
      if (error.status === 404) return blocked('Start the current version of the laptop connector');
      // Older connectors report the first offline service during the production check.
      const detail = error.message || '';
      const whisperOffline = /whisper/i.test(detail);
      const qwenOffline = /ollama|qwen/i.test(detail);
      const services = await request('/api/service-status').catch(() => null);
      return {
        laptop: whisperOffline || qwenOffline ? ready : unavailable('Could not verify the laptop’s production catalog'),
        whisper: services?.whisper === true || qwenOffline ? ready :
          unavailable(whisperOffline || services?.whisper === false ? 'Start Whisper on the laptop' : 'Could not verify Whisper'),
        qwen: qwenOffline ? unavailable('Start Ollama with Qwen3 4B') : services?.qwen === true ? ready :
          unavailable(whisperOffline ? 'Refresh after Whisper starts to verify Qwen' : 'Could not verify Qwen'),
      };
    }
  }

  let checking;
  function check() {
    if (checking) return checking;
    checking = Promise.all([
      localChecks(),
      loadVoices().then(voices => Array.isArray(voices) ? voices : []).catch(() => []),
      checkStudioEncoding({ width: 1080, height: 1920, channels: 1 }).then(() => ready, error => unavailable(error.message)),
    ]).then(([local, voices, exporter]) => ({
      services: {
        ...local,
        voiceover: selectProductionVoice(voices, getAccountId()).selected ? ready : unavailable('Could not load supported Google voices'),
        export: exporter,
      },
      voices,
    })).finally(() => { checking = null; });
    return checking;
  }
  return { check, worker };
}

export function mountProductionReadiness(root, readiness) {
  const summary = root.querySelector('[data-readiness-summary]');
  const list = root.querySelector('[data-readiness-services]');
  const button = root.querySelector('[data-readiness-refresh]');
  let pending;

  function render(services) {
    const rows = Object.entries(labels).map(([id, label]) => {
      const row = document.createElement('li');
      const service = services?.[id];
      row.dataset.state = service ? (service.ready ? 'ready' : 'blocked') : 'checking';
      const name = document.createElement('strong');
      name.textContent = label;
      const detail = document.createElement('span');
      detail.textContent = service?.ready ? '✓ Ready' : service?.detail || 'Checking…';
      row.append(name, detail);
      return row;
    });
    list.replaceChildren(...rows);
    summary.textContent = !services ? 'Checking production services…' : Object.values(services).every(service => service.ready)
      ? 'Services ready for one-click video'
      : 'Action needed before generating video';
  }

  function refresh() {
    if (pending) return pending;
    button.disabled = true;
    render();
    pending = readiness.check().then(result => {
      render(result.services);
      return result;
    }).finally(() => { button.disabled = false; pending = null; });
    return pending;
  }
  button.addEventListener('click', refresh);
  void refresh();
  return { ...readiness, check: refresh };
}
