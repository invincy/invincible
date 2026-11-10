const GREETING = /^(hi|hello|hey|good morning|good afternoon|good evening|thanks|thank you)\b[!.? ]*$/i;
const CONTROL = /\b(create|add|update|change|open|show|list|move|set|delete|finish|start)\b/i;
const CREATOR = /\b(render|export|mp3|audio|video|json|scene|timeline|creator studio|storyboard)\b/i;

function detectIntent(message) {
  const text = String(message || '').trim();
  if (GREETING.test(text)) return { mode: 'chat', reason: 'greeting' };
  if (CREATOR.test(text)) return { mode: 'creator', reason: 'creator-or-media-request' };
  if (CONTROL.test(text)) return { mode: 'control', reason: 'application-action-request' };
  return { mode: 'chat', reason: 'informational-or-conversational' };
}

module.exports = { detectIntent };
