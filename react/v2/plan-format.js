export const planExample = `Project: Build LMV 3 model
Description: Complete and validate the final model.

1. Research
   Notes: Confirm dimensions before modelling.
   - Gather reference images
   - Verify measurements

2. Build the model
   - Create the base structure
   - Add details

3. Validate
   - Check dimensions
   - Run the final simulation`;

const titleText = text => text.trim().replace(/^\*\*(.*?)\*\*$/, '$1');

// A small, explicit grammar: no AI call, HTML interpretation or guessed hierarchy.
export function parseStructuredPlan(input, batchId = 'preview') {
  const result = {title: '', description: '', steps: [], errors: []};
  if (input.length > 100000) return {...result, errors: ['This plan is too long. Paste at most 100,000 characters.']};
  const lines = input.replace(/\r\n?/g, '\n').split('\n');
  const hasNumberedSteps = lines.some(line => /^\s*\d+[.)]\s+/.test(line));
  let step = null, child = null, noteTarget = null, childIndent = null, noteIndent = 0;
  for (let index = 0; index < lines.length; index++) {
    const raw = lines[index].replace(/\t/g, '    '), text = raw.trim();
    const indent = raw.length - raw.trimStart().length;
    if (!text || /^```(?:text|markdown|md)?$/i.test(text)) continue;
    let match;
    if ((match = text.match(/^(?:#{1,3}\s+)?(Project|Task|Description):\s*(.*)$/i))) {
      if (step) {result.errors.push(`Line ${index+1}: project details must come before the steps.`); continue;}
      const field = match[1].toLowerCase() === 'description' ? 'description' : 'title';
      if (result[field]) result.errors.push(`Line ${index+1}: use only one ${field === 'title' ? 'Project' : 'Description'} line.`);
      result[field] = titleText(match[2]); noteTarget = null; continue;
    }
    if ((match = text.match(/^(\d+)[.)]\s+(?:\[([ xX])\]\s*)?(.+)$/))) {
      if (indent > 1) {result.errors.push(`Line ${index+1}: use an indented checkbox for a substep.`); continue;}
      step = {id: `${batchId}_s${result.steps.length+1}`, title: titleText(match[3]), notes: '', done: /x/i.test(match[2] || ''), substeps: []};
      result.steps.push(step); child = null; childIndent = null; noteTarget = null; continue;
    }
    if (hasNumberedSteps && (match = text.match(/^[-*•]\s+(?:\[([ xX])\]\s+)?(.+)$/))) {
      if (!step) {result.errors.push(`Line ${index+1}: place this dash after a numbered step.`); continue;}
      if (childIndent !== null && childIndent !== indent) {result.errors.push(`Line ${index+1}: use one substep level with matching indentation.`); continue;}
      childIndent = indent;
      child = {id: `${step.id}_c${step.substeps.length+1}`, title: titleText(match[2]), notes: '', done: /x/i.test(match[1] || '')};
      step.substeps.push(child); noteTarget = null; continue;
    }
    if ((match = text.match(/^Notes:\s*(.*)$/i)) && step) {
      // Rich-text copy can flatten Markdown checkbox indentation. In that case,
      // a note immediately following a child still belongs to that child.
      noteTarget = child && (indent > childIndent || childIndent === 0) ? child : step;
      noteTarget.notes += (noteTarget.notes ? '\n' : '') + match[1]; noteIndent = indent; continue;
    }
    if (noteTarget && indent > noteIndent) {noteTarget.notes += '\n' + text; continue;}
    if (!hasNumberedSteps) {
      const flatTitle = titleText(text.replace(/^[-*•]\s+(?:\[[ xX]\]\s+)?/, '').replace(/^[☐☑✓]\s*/, ''));
      step = {id: `${batchId}_s${result.steps.length+1}`, title: flatTitle, notes: '', done: false, substeps: [], status: 'Not Started'};
      result.steps.push(step); child = null; noteTarget = null; continue;
    }
    result.errors.push(`Line ${index+1}: use Project:, Description:, numbered steps, Notes:, or dash substeps.`);
  }
  for (const entry of result.steps) {
    if (entry.substeps.length) entry.done = entry.substeps.every(item => item.done);
    entry.status = entry.done ? 'Done' : 'Not Started';
  }
  if (!result.steps.length) result.errors.push('No steps found. Add a numbered step such as “1. Research”.');
  if (result.steps.length > 200 || result.steps.reduce((count, entry) => count + entry.substeps.length, 0) > 1000) result.errors.push('Split this plan into smaller projects (up to 200 steps and 1,000 substeps).');
  return result;
}
