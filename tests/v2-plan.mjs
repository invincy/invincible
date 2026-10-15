import test from 'node:test';
import assert from 'node:assert/strict';
import {parseStructuredPlan, planExample} from '../react/v2/plan-format.js';
import {compatibleStepFields, contentVersion, setStepDone, setSubstepDone, taskContent, validateContent} from '../react/v2/task-content.js';

test('custom GPT plan preserves project metadata, notes and nested checkbox substeps', () => {
  const result = parseStructuredPlan('```text\n'+planExample+'\n```', 'batch');
  assert.deepEqual(result.errors, []);
  assert.equal(result.title, 'Build LMV 3 model');
  assert.equal(result.description, 'Complete and validate the final model.');
  assert.equal(result.steps.length, 3);
  assert.equal(result.steps[0].notes, 'Confirm dimensions before modelling.');
  assert.equal(result.steps.reduce((count, step) => count + step.substeps.length, 0), 6);
  assert.equal(result.steps[1].substeps[0].title, 'Create the base structure');
  assert.equal(result.steps[1].substeps[0].id, 'batch_s2_c1');
  assert.deepEqual(parseStructuredPlan(planExample, 'batch').steps, result.steps);
  validateContent(result);
});
test('notes stay with their step or substep and checkbox progress is preserved', () => {
  const result = parseStructuredPlan('Project: Test\n1. Research\n   Notes: First line\n      Second line\n   - [x] Compare\n      Notes: Preserve this\n   - [ ] Review\n2. [x] Finished');
  assert.deepEqual(result.errors, []);
  assert.equal(result.steps[0].notes, 'First line\nSecond line');
  assert.equal(result.steps[0].substeps[0].notes, 'Preserve this');
  assert.equal(result.steps[0].done, false);
  assert.equal(result.steps[1].status, 'Done');
  const completed = setSubstepDone(result.steps[0], result.steps[0].substeps[1].id, true);
  assert.equal(completed.done, true);
  assert.equal(setSubstepDone(completed, completed.substeps[0].id, false).done, false);
  assert.ok(setStepDone(completed, false).substeps.every(child => !child.done));
});
test('malformed hierarchy and prose produce visible errors instead of flat invented steps', () => {
  for (const text of ['Plan something useful', '- [ ] Orphan', '1. Research\n   1. Nested numbered item', '1. Research\n   - [ ] Substep\n      - [ ] Too deep']) {
    assert.ok(parseStructuredPlan(text).errors.length, text);
  }
  assert.match(parseStructuredPlan('x'.repeat(100001)).errors[0], /too long/);
  assert.ok(parseStructuredPlan('Project: A\nProject: B\n1. Step').errors.length);
});
test('legacy mirrors and unknown nested step fields survive V2 content writes', () => {
  const current = {title: 'Existing', status: 'Today', steps: [{id: 's', title: 'Original', notes: 'Working notes', custom: {x: 1}, substeps: [{id: 'c', title: 'Child', done: false, custom: 'keep'}]}],
    subtasks: [{text: 'Original', done: false, legacyNotes: 'Keep', extension: {y: 2}}]};
  const content = taskContent(current);
  content.steps[0].title = 'Renamed';
  const fields = compatibleStepFields(content.steps, current);
  assert.equal(fields.steps[0].custom.x, 1);
  assert.equal(fields.stepSubsteps.s[0].custom, 'keep');
  assert.equal(fields.subtasks[0].legacyNotes, 'Keep');
  assert.equal(fields.subtasks[0].extension.y, 2);
  assert.equal(fields.subtasks[0].text, 'Renamed');
  assert.equal(current.steps[0].title, 'Original');
  const legacy = {subtasks: [{text: 'Old step', done: false, notes: 'Keep notes', custom: 3}]};
  const roundtrip = compatibleStepFields(taskContent(legacy).steps, legacy);
  assert.equal(roundtrip.subtasks[0].custom, 3);
  assert.equal(roundtrip.steps[0].notes, 'Keep notes');
  const legacyWrite = {...current, ...fields, steps: fields.steps.map(({id,title,done}) => ({id,title,done}))};
  assert.equal(taskContent(legacyWrite).steps[0].substeps[0].custom, 'keep','legacy writers can rewrite parent arrays without erasing child data');
});
test('content conflicts include nested edits and ignore unrelated lane changes', () => {
  const project = {title: 'Task', steps: [{id: 's', title: 'Step', substeps: [{id: 'c', title: 'Child', done: false}]}]};
  assert.equal(contentVersion(project), contentVersion({...project, status: 'Today', updatedAt: 123}));
  const edited = structuredClone(project); edited.steps[0].substeps[0].done = true;
  assert.notEqual(contentVersion(project), contentVersion(edited));
  assert.throws(() => validateContent({title: ' ', steps: []}), /title/);
  assert.throws(() => validateContent({title: 'Task', steps: [{id: 's', title: ''}]}), /title/);
  assert.throws(() => validateContent({title: 'Task', steps: [{id: 's', title: 'A', substeps: [{id: 's', title: 'B'}]}]}), /own ID/);
});
