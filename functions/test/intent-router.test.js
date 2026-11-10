const test = require('node:test');
const assert = require('node:assert/strict');
const { detectIntent } = require('../src/local-ai/intent-router');

test('routes greetings and informational questions to quick chat', () => {
  assert.equal(detectIntent('Hi!').mode, 'chat');
  assert.equal(detectIntent('Explain the Battle of Panipat').mode, 'chat');
});
test('routes application requests to control and media requests to creator', () => {
  assert.equal(detectIntent('Create a Panipat project').mode, 'control');
  assert.equal(detectIntent('Render my Panipat video as MP3').mode, 'creator');
});
