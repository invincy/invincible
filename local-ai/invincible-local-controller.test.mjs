import test from 'node:test';
import assert from 'node:assert/strict';
import { detectLocalIntent, executeLocalCommand, PANIPAT_STAGES } from './invincible-local-controller.mjs';

test('routes local chat, control, and creator intents', () => {
  assert.equal(detectLocalIntent('Hi').mode, 'chat');
  assert.equal(detectLocalIntent('Create a Panipat project').mode, 'control');
  assert.equal(detectLocalIntent('Export my video as MP3').mode, 'creator');
});

test('executes the model-selected create_project through the validated tool', async () => {
  let received;
  const output = await executeLocalCommand({
    message: 'Invincible, create a new Panipat project.',
    ask: async () => ({
      tool: 'create_project',
      arguments: { title: 'Panipat', description: 'Panipat test project', stages: PANIPAT_STAGES, current_stage: 'Research' },
    }),
    executeTool: async (tool, args) => {
      received = { tool, args };
      return { result: { id: 'test-project-1', title: args.title, steps: args.stages.map((title, i) => ({ id: String(i), title })) }, action: { status: 'completed' } };
    },
  });
  assert.equal(received.tool, 'create_project');
  assert.equal(received.args.title, 'Panipat');
  assert.equal(output.verified, true);
});

test('rejects an unapproved tool request', async () => {
  await assert.rejects(() => executeLocalCommand({ message: 'delete everything', ask: async () => ({ tool: 'delete_project', arguments: {} }), executeTool: async () => ({}) }), /allow-list/);
});

test('answers ordinary questions without invoking a tool', async () => {
  const output = await executeLocalCommand({ message: 'What is Panipat?', ask: async () => ({ kind: 'chat', text: 'Panipat is a historic city in Haryana.' }), executeTool: async () => { throw new Error('tool should not run'); } });
  assert.equal(output.conversational, true);
  assert.match(output.result.text, /Panipat/);
});

test('answers greetings immediately without calling Qwen or a tool', async () => {
  const output = await executeLocalCommand({ message: 'Hello!', ask: async () => { throw new Error('Qwen should not run'); }, executeTool: async () => { throw new Error('tool should not run'); } });
  assert.equal(output.result.text, 'Hello! What are we working on?');
});
