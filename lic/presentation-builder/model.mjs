export const fields = ['age', 'term', 'cover'];
export const emptyTables = { premium: [], bonus: [] };

export function parseTable(source, type) {
  if (!['premium', 'bonus'].includes(type)) throw new Error('Unknown table type.');
  const headers = [...fields, 'amount', 'basis'];
  const lines = source.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  if (lines.shift()?.trim().toLowerCase() !== headers.join(',')) {
    throw new Error('Use the header age,term,cover,amount,basis.');
  }
  const allowed = type === 'premium' ? ['annual', 'monthly', 'quarterly', 'half-yearly'] : ['declared', 'illustrative'];
  const seen = new Set();
  const rows = lines.filter(line => line.trim()).map((line, index) => {
    const [age, term, cover, amount, basis, ...extra] = line.split(',').map(cell => cell.trim());
    if (extra.length || ![age, term, cover].every(value => /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0)
      || !/^\d+(\.\d{1,2})?$/.test(amount) || !Number.isSafeInteger(Math.round(Number(amount) * 100))
      || !allowed.includes(basis)) {
      throw new Error('Invalid values or basis on row ' + (index + 2) + '.');
    }
    const row = { age: Number(age), term: Number(term), cover: Number(cover), amount: Number(amount), basis };
    const key = [...fields.map(field => row[field]), basis].join('/');
    if (seen.has(key)) throw new Error('Duplicate profile and basis on row ' + (index + 2) + '.');
    seen.add(key);
    return row;
  });
  if (!rows.length) throw new Error('Add at least one data row.');
  return rows;
}

export function findAmount(rows, profile, basis) {
  return rows.find(row => row.basis === basis && fields.every(field => row[field] === profile[field]));
}

export function newScene(title = 'New scene') {
  return { id: crypto.randomUUID(), title, text: '', image: '', audio: '', reveal: 0, mode: 'end', target: '', choices: [], metric: '', basis: '' };
}

export function flowIssues(scenes) {
  const ids = new Set(scenes.map(scene => scene.id));
  const issues = [];
  for (const scene of scenes) {
    if (scene.mode === 'choice' && scene.choices.some(choice => !choice.label.trim() || !ids.has(choice.target))) {
      issues.push(scene.title + ' has an incomplete choice.');
    }
    if (scene.mode === 'choice' && !scene.choices.length) issues.push(scene.title + ' needs at least one choice.');
    if (['tap', 'audio'].includes(scene.mode) && !ids.has(scene.target)) issues.push(scene.title + ' needs a next scene.');
    if (scene.mode === 'audio' && !scene.audio) issues.push(scene.title + ' needs audio for automatic advance.');
  }
  const reachable = new Set();
  const queue = [scenes[0]?.id];
  while (queue.length) {
    const id = queue.pop();
    if (reachable.has(id)) continue;
    const scene = scenes.find(candidate => candidate.id === id);
    if (!scene) continue;
    reachable.add(id);
    if (scene.mode === 'choice') queue.push(...scene.choices.map(choice => choice.target));
    if (['tap', 'audio'].includes(scene.mode)) queue.push(scene.target);
  }
  if (reachable.size < scenes.length) issues.push('Some scenes are unreachable from the first scene.');
  return issues;
}

export function demo733() {
  const intro = newScene('Choose a goal');
  const profile = newScene('Choose age, term and cover');
  const premium = newScene('Premium');
  const branches = [
    ['Education', 'study', 'education'], ['Career', 'career', 'career'],
    ['Marriage', 'marriage', 'marriage'], ['Other', 'goals', 'other'],
  ].map(([label, image, audio]) => ({
    ...newScene(label), mode: 'audio', target: profile.id,
    image: '../jeevan-lakshya/assets/' + image + '.png',
    audio: '../jeevan-lakshya/audio/goal.' + audio + '.mp3',
  }));
  Object.assign(intro, {
    mode: 'choice', image: '../jeevan-lakshya/assets/dad%26daughter.png',
    audio: '../jeevan-lakshya/audio/goal.choose.mp3',
    choices: branches.map(({ title, id, image }) => ({ label: title, target: id, image })),
    layout: {
      artwork: { x: 3, y: 11, width: 94, effect: 'fade' },
      'choice:0': { x: 4, y: 62, width: 20, effect: 'pop', delay: .06 },
      'choice:1': { x: 28, y: 65, width: 20, effect: 'pop', delay: .18 },
      'choice:2': { x: 52, y: 64, width: 20, effect: 'pop', delay: .13 },
      'choice:3': { x: 76, y: 60, width: 19, effect: 'pop', delay: .26 },
    },
  });
  Object.assign(profile, { mode: 'tap', target: premium.id, audio: '../jeevan-lakshya/audio/profile.choose.mp3', profile: true });
  Object.assign(premium, { metric: 'premium', basis: 'annual' });
  return { title: 'Plan 733 preview', scenes: [intro, ...branches, profile, premium], tables: { ...emptyTables } };
}
