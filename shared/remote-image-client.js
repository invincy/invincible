export function createRemoteImageClient({ getAccountId, call, draftPrompt }) {
  async function request(action, data) {
    const uid = getAccountId();
    if (!uid) throw Error('Sign in to generate images.');
    try {
      const result = await call({ action, ...data });
      if (getAccountId() !== uid) throw Error('Your account changed. Reopen the image panel.');
      return result;
    } catch (error) {
      if (['functions/invalid-argument', 'functions/already-exists', 'functions/not-found'].includes(error.code)) error.definitive = true;
      throw error;
    }
  }
  return {
    origin: 'firebase-image-relay',
    remote: true,
    draftPrompt,
    pollInterval: 2500,
    async connect() {
      const uid = getAccountId();
      const { online } = await request('status');
      return { uid, capabilities: { draftPrompt: Boolean(draftPrompt) }, storage: { available: online, error: online ? '' : 'Laptop offline. Open Invincible Image Studio on your laptop.' } };
    },
    generate: (args, idempotencyKey) => request('enqueue', { arguments: args, idempotencyKey }),
    job: id => request('job', { id }),
    async image(id) {
      const { png } = await request('image', { id });
      return new Blob([Uint8Array.from(atob(png), character => character.charCodeAt(0))], { type: 'image/png' });
    },
  };
}
