import { useEffect, useState } from 'react';
import { checkLocalServices } from './services/aiService';

const services = [
  ['whisper', 'Whisper'],
  ['qwen', 'Qwen3 4B'],
  ['images', 'Image generator'],
];

function getServiceStatus(id, accountId, pending, results, imageConnection) {
  if (!accountId) return ['idle', 'Sign in to check'];
  if (pending || (id === 'images' && imageConnection?.state === 'checking')) return ['checking', 'Checking'];
  if (results?.[id] === true) return ['online', 'Online'];
  if (results?.[id] === false || (id === 'images' && imageConnection?.state === 'offline')) return ['offline', 'Offline'];
  if (id === 'images' && imageConnection?.connected) return ['idle', 'Connection available · engine unverified'];
  return ['idle', 'Status unknown'];
}

export function ServiceConnections({ accountId, imageConnection, imageConnectionRef }) {
  const [check, setCheck] = useState({ attempt: 0, pending: true, results: null });
  const { attempt, pending, results } = check;
  const locallyPaired = Boolean(imageConnection?.connected && !imageConnection.remote);

  useEffect(() => {
    if (!accountId) return;
    let current = true;
    async function refresh() {
      if (attempt) await imageConnectionRef.current?.refresh().catch(() => {});
      const results = await checkLocalServices().catch(() => null);
      if (current) setCheck({ attempt, pending: false, results });
    }
    void refresh();
    return () => { current = false; };
  }, [accountId, attempt, imageConnectionRef, locallyPaired]);

  return <section className="ai-service-connections" aria-label="Local AI services">
    <ul>
      {services.map(([id, label]) => {
        const [state, status] = getServiceStatus(id, accountId, pending, results, imageConnection);
        return <li key={id} data-state={state} title={label + ' · ' + status}>
          <span className="ai-service-dot" aria-hidden="true">{state === 'online' ? '✓' : ''}</span>
          <span role="status">{label}<span className="ai-service-status"> · {status}</span></span>
        </li>;
      })}
    </ul>
    {accountId && <button type="button" aria-label="Refresh service status" title="Refresh service status" aria-disabled={pending} onClick={() => {
      if (!pending) setCheck({ attempt: attempt + 1, pending: true, results: null });
    }}>↻</button>}
  </section>;
}
