export const IMAGE_PROMPT_TASK_PREFIX = 'invincible:image-prompt:v1:';

export async function requestImagePrompt(idea, { getAccountId, enqueue, subscribe, signal }) {
  const uid = getAccountId();
  if (!uid) throw Error('Sign in to draft an image prompt.');
  if (typeof idea !== 'string' || !idea.trim() || idea.length > 1500) throw Error('Enter an idea up to 1,500 characters.');
  signal?.throwIfAborted();
  const task = await enqueue({ command: IMAGE_PROMPT_TASK_PREFIX + idea.trim(), idempotencyKey: crypto.randomUUID() });
  if (getAccountId() !== uid) throw Error('Your account changed. Reopen the image panel.');
  if (!task?.id) throw Error('Could not send the prompt request to your laptop.');
  signal?.throwIfAborted();
  return new Promise((resolve, reject) => {
    const stop = subscribe(uid, task.id, data => {
      if (getAccountId() !== uid) return finish(reject, Error('Your account changed. Reopen the image panel.'));
      if (data?.status === 'failed') return finish(reject, Error(data.error || 'The laptop could not draft a prompt.'));
      if (data?.status !== 'completed') return;
      const prompt = data.result?.prompt;
      if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 1500) {
        return finish(reject, Error('No image prompt returned. Restart Invincible AI on your laptop and try again.'));
      }
      finish(resolve, { prompt });
    }, error => finish(reject, error));
    const timer = setTimeout(() => finish(reject, Error('The laptop did not return a prompt. Check the connection and try again.')), 120_000);
    const abort = () => finish(reject, signal.reason);
    signal?.addEventListener('abort', abort, { once: true });
    function finish(settle, value) {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      stop();
      settle(value);
    }
  });
}
