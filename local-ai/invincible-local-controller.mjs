const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434';

const PANIPAT_STAGES = ['Research', 'Script', '3D Scenes', 'Voiceover', 'Edit', 'Publish'];
const GREETING = /^(hi|hello|hey|good morning|good afternoon|good evening)\b[!.? ]*$/i;
const CREATOR_REQUEST = /\b(render|export|mp3|audio|video|json|scene|timeline|creator studio|storyboard)\b/i;
const CONTROL_REQUEST = /\b(create|add|update|change|open|show|list|move|set|delete|finish|start)\b/i;

export function detectLocalIntent(message) {
  const text = String(message || '').trim();
  if (/\b(generate|draw|paint|create|make)\b[\s\S]*\b(image|picture|illustration|artwork)\b/i.test(text)) return { mode: 'image', reason: 'image-generation-request' };
  if (GREETING.test(text)) return { mode: 'chat', reason: 'greeting' };
  if (CREATOR_REQUEST.test(text)) return { mode: 'creator', reason: 'creator-or-media-request' };
  if (CONTROL_REQUEST.test(text)) return { mode: 'control', reason: 'application-action-request' };
  return { mode: 'chat', reason: 'informational-or-conversational' };
}

function extractJson(value) {
  if (value && typeof value === 'object') return value;
  const text = String(value ?? '').trim();
  try { return JSON.parse(text); } catch {}
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) return JSON.parse(fenced[1]);
  throw new Error('Local model did not return valid JSON.');
}

export function buildLocalPrompt(message) {
  return [
    'You are Invincible Local AI. Return only a JSON object.',
    'For an ordinary informational question, return {"kind":"chat","text":"..."} and do not request a tool.',
    'For an Invincible action, return {"kind":"tool","tool":"create_project","arguments":{...}}.',
    'Allowed tools: create_project, generate_image.',
    'For a request to draw or generate an image, return {"kind":"tool","tool":"generate_image","arguments":{"prompt":"...","preset":"square"}}. Keep the requested visual details in prompt.',
    'generate_image arguments: prompt (1-1500 characters), preset (square, portrait, landscape), optional seed (integer 0-4294967295). Do not add any other fields. Default preset is square.',
    'create_project arguments: title (string), description (string or null), stages (array of strings), current_stage (string or null).',
    'Never claim success; the host application will execute and verify the tool.',
    `User instruction: ${message}`,
  ].join('\n');
}

export async function askOllama({ message, model = 'qwen3:4b', baseUrl = DEFAULT_OLLAMA_URL, fetchImpl = fetch, signal }) {
  const response = await fetchImpl(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    signal,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      think: false,
      format: 'json',
      messages: [{ role: 'user', content: buildLocalPrompt(message) }],
      options: { temperature: 0 },
    }),
  });
  if (!response.ok) throw new Error(`Ollama request failed (${response.status}).`);
  const payload = await response.json();
  return extractJson(payload?.message?.content);
}

export async function draftImagePrompt({ idea, fetchImpl = fetch, signal }) {
  const response = await fetchImpl(DEFAULT_OLLAMA_URL + '/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    signal,
    body: JSON.stringify({
      model: 'qwen3:4b', stream: false, think: false, keep_alive: 0,
      format: { type: 'object', properties: { prompt: { type: 'string' } }, required: ['prompt'], additionalProperties: false },
      messages: [
        { role: 'system', content: 'Write one precise, concise image prompt for Stable Diffusion 1.5. Preserve the supplied idea and historical details. Describe visible subject, action, setting, composition, lighting and style where relevant. Avoid invented factual details, commentary, and formatting. Return only a JSON object with a prompt field.' },
        { role: 'user', content: idea },
      ],
      options: { temperature: 0.2, num_predict: 260 },
    }),
  });
  if (!response.ok) throw Error('Local Qwen could not draft the image prompt.');
  const { prompt } = extractJson((await response.json()).message?.content);
  return imagePromptText(prompt);
}

export function imagePromptText(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > 1500 || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value)) {
    throw Error('Enter text between 1 and 1500 characters without control characters.');
  }
  return value.trim();
}

export async function executeLocalCommand({ message, ask = askOllama, executeTool }) {
  if (typeof executeTool !== 'function') throw new TypeError('executeTool is required.');
  const intent = detectLocalIntent(message);
  if (intent.mode === 'chat' && GREETING.test(String(message || '').trim())) return { command: { kind: 'chat', text: 'Hello! What are we working on?' }, result: { text: 'Hello! What are we working on?' }, verified: true, conversational: true, intent };
  if (intent.mode === 'creator') return { command: { kind: 'chat', text: 'Creator and media export tools are not enabled yet.' }, result: { text: 'Creator and media export tools are not enabled yet.' }, verified: true, conversational: true, intent, unsupported: true };
  const command = await ask({ message });
  if (command?.kind === 'chat') return { command, result: { text: String(command.text || '').slice(0, 4000) }, verified: true, conversational: true, intent };
  if (!['create_project', 'generate_image'].includes(command?.tool)) throw new Error('Local model requested a tool outside the allow-list.');
  const result = await executeTool(command.tool, command.arguments ?? {});
  return { command, result, verified: result?.action?.status === 'completed', intent };
}

export { DEFAULT_OLLAMA_URL, PANIPAT_STAGES };
