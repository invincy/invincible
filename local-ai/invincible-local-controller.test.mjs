import test from 'node:test';
import assert from 'node:assert/strict';
import { executeLocalCommand, PANIPAT_STAGES } from './invincible-local-controller.mjs';

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
