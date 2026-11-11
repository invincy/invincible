import { useEffect, useState } from 'react';
import { checkLocalServices } from './services/aiService';

const services = [
  ['whisper', 'Whisper transcription'],
  ['qwen', 'Qwen3 4B'],
  ['images', 'Image generator'],
];

export function ServiceConnections({ accountId, imageConnection, imageConnectionRef }) {
  const [check, setCheck] = useState({ attempt: 0, pending: true, results: null });
  const { attempt, pending, results } = check;

  useEffect(() => {
    if (!accountId) return;
    let current = true;
    const localCheck = checkLocalServices().catch(() => null);
    const imageRefresh = attempt ? imageConnectionRef.current?.refresh() : undefined;
    Promise.allSettled([localCheck, imageRefresh]).then(([local]) => {
      if (current) setCheck({ attempt, pending: false, results: local.value ?? null });
    });
    return () => { current = false; };
  }, [accountId, attempt, imageConnectionRef]);

  return <section className="ai-service-connections" aria-label="Service connections">
    {services.map(([id, label]) => {
      const image = id === 'images';
      const connected = results?.[id] === true && (!image || (imageConnection?.connected && !imageConnection.remote));
      const checking = accountId && (pending || (image && (!imageConnection || imageConnection.state === 'checking')));
      let status = 'Sign in to check';
      if (accountId) {
        if (checking) status = 'Checking…';
        else if (connected) status = 'Connected';
        else if (image && imageConnection?.connected && imageConnection.remote) status = 'Relay connected · engine unverified';
        else if (image && imageConnection?.connected && results === null) status = 'Laptop connected · engine unverified';
        else if (results?.[id] === false || (image && !imageConnection?.connected)) status = 'Unavailable';
        else status = 'Check from a connected laptop';
      }
      return <article key={id} className="ai-service-card">
        <h2>{label}</h2>
        <p role="status">{connected && !checking && <span aria-hidden="true">✓ </span>}{status}</p>
        {accountId && !connected && !checking &&
          <button type="button" aria-label={'Refresh ' + label} onClick={() => setCheck({ attempt: attempt + 1, pending: true, results: null })}>Refresh</button>}
      </article>;
    })}
  </section>;
}
