import { useEffect, useState } from 'react';
import { checkLocalServices } from './services/aiService';

const services = [
  ['whisper', 'Whisper transcription'],
  ['qwen', 'Qwen3 4B'],
  ['images', 'Image generator'],
];

function getServiceStatus(id, accountId, pending, results, imageConnection) {
  if (!accountId) return ['idle', 'Sign in to check'];
  const image = id === 'images';
  if (pending || (image && (!imageConnection || imageConnection.state === 'checking'))) {
    return ['checking', 'Checking…'];
  }
  if (image && !imageConnection.connected) return ['offline', 'Unavailable'];
  if (image && imageConnection.remote) return ['partial', 'Relay connected', 'Engine status unknown'];
  if (results?.[id] === true) return ['ready', 'Connected'];
  if (results?.[id] === false) return ['offline', 'Unavailable'];
  if (image && results === null) return ['partial', 'Laptop connected', 'Engine status unknown'];
  return ['idle', 'Check on laptop'];
}

export function ServiceConnections({ accountId, imageConnection, imageConnectionRef }) {
  const [check, setCheck] = useState({ attempt: 0, pending: true, results: null });
  const { attempt, pending, results } = check;

  useEffect(() => {
    if (!accountId) return;
    let current = true;
    const localCheck = checkLocalServices();
    const imageRefresh = attempt ? imageConnectionRef.current?.refresh() : undefined;
    Promise.allSettled([localCheck, imageRefresh]).then(([local]) => {
      if (current) setCheck({ attempt, pending: false, results: local.value ?? null });
    });
    return () => { current = false; };
  }, [accountId, attempt, imageConnectionRef]);

  return <section className="ai-service-connections" aria-labelledby="ai-service-heading">
    <header className="ai-service-header">
      <h2 id="ai-service-heading">Local AI services</h2>
      {accountId && <button type="button" aria-disabled={pending} onClick={() => {
        if (!pending) setCheck({ attempt: attempt + 1, pending: true, results: null });
      }}>
        <span aria-hidden="true">↻</span> {pending ? 'Checking…' : 'Check all'}
      </button>}
    </header>
    <div className="ai-service-grid">
      {services.map(([id, label]) => {
        const [state, status, detail] = getServiceStatus(id, accountId, pending, results, imageConnection);
        return <article key={id} className="ai-service-card" data-state={state}>
          <h3>{label}</h3>
          <p role="status">
            <span className="ai-service-dot" aria-hidden="true" />
            <span>{status}{detail && <small>{detail}</small>}</span>
          </p>
        </article>;
      })}
    </div>
  </section>;
}
