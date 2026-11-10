const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434';

const PANIPAT_STAGES = ['Research', 'Script', '3D Scenes', 'Voiceover', 'Edit', 'Publish'];

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
    'Allowed tool: create_project.',
    'create_project arguments: title (string), description (string or null), stages (array of strings), current_stage (string or null).',
    'Never claim success; the host application will execute and verify the tool.',
    `User instruction: ${message}`,
  ].join('\n');
}

export async function askOllama({ message, model = 'qwen3:4b', baseUrl = DEFAULT_OLLAMA_URL, fetchImpl = fetch }) {
  const response = await fetchImpl(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
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

export async function executeLocalCommand({ message, ask = askOllama, executeTool }) {
  if (typeof executeTool !== 'function') throw new TypeError('executeTool is required.');
  const command = await ask({ message });
  if (command?.kind === 'chat') return { command, result: { text: String(command.text || '').slice(0, 4000) }, verified: true, conversational: true };
  if (command?.tool !== 'create_project') throw new Error('Local model requested a tool outside the Phase 1 allow-list.');
  const result = await executeTool(command.tool, command.arguments ?? {});
  return { command, result, verified: result?.action?.status === 'completed' };
}

export { DEFAULT_OLLAMA_URL, PANIPAT_STAGES };
