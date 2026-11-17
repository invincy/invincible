import { demo733, emptyTables, fields, findAmount, flowIssues, newScene, parseTable } from './model.mjs?v=2';
import { constrain, effects, enableDrag, place, placement } from './layout.mjs?v=2';

const $ = id => document.getElementById(id);
const el = (tag, text) => {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  return node;
};
const status = message => { $('status').textContent = message; };
const audio = $('narration');
const screen = $('screen');
const profile = { age: 30, term: 25, cover: 200000 };
const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2, minimumFractionDigits: 0 });
const bases = { premium: ['annual', 'monthly', 'quarterly', 'half-yearly'], bonus: ['declared', 'illustrative'] };

const db = new Promise((resolve, reject) => {
  const request = indexedDB.open('invincible-lic-builder', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('drafts');
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
async function draftStore(mode, operation) {
  const database = await db;
  return new Promise((resolve, reject) => {
    const tx = database.transaction('drafts', mode);
    const request = operation(tx.objectStore('drafts'));
    tx.oncomplete = () => resolve(request.result);
    tx.onabort = () => reject(tx.error);
  });
}

let draft;
try {
  draft = await draftStore('readonly', store => store.get('current'));
} catch {
  status('Browser storage is unavailable. Changes cannot be saved.');
}
draft ??= { title: 'Untitled presentation', scenes: [newScene('Opening')], tables: { ...emptyTables } };
let selected = draft.scenes[0].id;
let urls = [];
let previewRun = 0;
let editingLayout = false;
let activeLayer = '';
let lastLayoutScene;
const layoutTools = $('layout-tools');


async function save() {
  try {
    await draftStore('readwrite', store => store.put(draft, 'current'));
    status('Draft saved on this browser.');
  } catch {
    status('Draft could not be saved. Keep this page open and check browser storage.');
  }
}

function button(label, action) {
  const node = el('button', label);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}
function label(text, input) {
  const node = el('label', text);
  node.append(input);
  return node;
}
function input(value, update, type = 'text') {
  const node = el('input');
  node.type = type;
  node.value = value;
  node.addEventListener('change', () => update(node.value));
  return node;
}
function select(value, options, update) {
  const node = el('select');
  for (const [key, caption] of options) {
    const option = el('option', caption);
    option.value = key;
    node.append(option);
  }
  node.value = value;
  node.addEventListener('change', () => update(node.value));
  return node;
}
function source(value) {
  if (!(value instanceof Blob)) return value;
  const url = URL.createObjectURL(value);
  urls.push(url);
  return url;
}
function upload(kind, scene, caption) {
  const node = el('input');
  node.type = 'file';
  node.accept = kind === 'audio' ? 'audio/*' : 'image/png,image/jpeg,image/webp,image/gif';
  node.addEventListener('change', () => {
    const file = node.files[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024 || !file.type.startsWith(kind + '/')) {
      status('Choose a valid ' + kind + ' file up to 25 MB.');
      return;
    }
    scene[kind] = file;
    updateEditor();
  });
  const field = label(caption ?? (kind === 'audio' ? 'Voiceover' : 'Artwork'), node);
  if (scene[kind]) {
    field.append(el('span', scene[kind].name ?? scene[kind].split('/').at(-1)));
  }
  return field;
}
function destinations(except) {
  return [['', 'Choose a scene'], ...draft.scenes.filter(scene => scene.id !== except).map(scene => [scene.id, scene.title])];
}
function updateEditor() {
  renderEditor();
  void save();
}
function renderEditor() {
  const list = $('scene-list');
  list.replaceChildren();
  for (const scene of draft.scenes) {
    const item = el('li');
    const pick = button(scene.title, () => { selected = scene.id; renderEditor(); });
    pick.setAttribute('aria-pressed', String(scene.id === selected));
    item.append(pick);
    list.append(item);
  }
  const index = draft.scenes.findIndex(scene => scene.id === selected);
  const scene = draft.scenes[index];
  const editor = $('editor');
  editor.replaceChildren();
  const change = (key, value) => { scene[key] = value; updateEditor(); };
  const text = el('textarea');
  text.value = scene.text;
  text.rows = 2;
  text.addEventListener('input', () => { scene.text = text.value; void save(); });
  const reveal = input(scene.reveal, value => { scene.reveal = Math.max(0, Number(value) || 0); void save(); }, 'number');
  reveal.min = '0';
  reveal.step = '0.1';

  const media = el('div');
  media.className = 'columns';
  media.append(upload('image', scene), upload('audio', scene));
  for (const kind of ['image', 'audio']) {
    if (scene[kind]) media.append(button('Remove ' + (kind === 'image' ? 'artwork' : 'voiceover'), () => change(kind, '')));
  }
  editor.append(label('Scene title', input(scene.title, value => {
    scene.title = value.trim() || 'Untitled scene';
    list.children[index].firstElementChild.textContent = scene.title;
    void save();
  })),
    label('On-screen text', text), media, label('Reveal text and amount after seconds', reveal),
    label('What happens next?', select(scene.mode, [['end', 'End presentation'], ['tap', 'Wait for Continue'], ['audio', 'Advance after voiceover'], ['choice', 'Wait for a choice']], value => change('mode', value))));
  if (['tap', 'audio'].includes(scene.mode)) {
    editor.append(label('Next scene', select(scene.target, destinations(scene.id), value => change('target', value))));
  }
  if (scene.mode === 'choice') {
    scene.choices.forEach((choice, choiceIndex) => {
      const row = el('div');
      row.className = 'choice-row';
      row.append(label('Choice ' + (choiceIndex + 1), input(choice.label, value => { choice.label = value; updateEditor(); })),
        label('Goes to', select(choice.target, destinations(scene.id), value => { choice.target = value; updateEditor(); })),
        button('Remove choice', () => {
          scene.choices.splice(choiceIndex, 1);
          if (scene.layout) {
            for (let i = choiceIndex; i < scene.choices.length; i++) {
              const next = scene.layout['choice:' + (i + 1)];
              delete scene.layout['choice:' + i];
              if (next) scene.layout['choice:' + i] = next;
            }
            delete scene.layout['choice:' + scene.choices.length];
          }
          updateEditor();
        }));
      editor.append(row, upload('image', choice, 'Choice ' + (choiceIndex + 1) + ' artwork'));
      if (choice.image) editor.append(button('Remove choice ' + (choiceIndex + 1) + ' artwork', () => {
        delete choice.image;
        updateEditor();
      }));
    });
    editor.append(button('Add choice', () => { scene.choices.push({ label: '', target: '' }); updateEditor(); }));
  }

  const collect = el('input');
  collect.type = 'checkbox';
  collect.checked = Boolean(scene.profile);
  collect.addEventListener('change', () => change('profile', collect.checked));
  const collectLabel = label('Ask for age, term and cover on this scene', collect);
  collectLabel.className = 'checkbox';
  editor.append(collectLabel, label('Show a table amount', select(scene.metric, [['', 'None'], ['premium', 'Premium'], ['bonus', 'Bonus']], value => {
    scene.metric = value;
    scene.basis = bases[value]?.[0] ?? '';
    updateEditor();
  })));
  if (scene.metric) editor.append(label('Amount basis', select(scene.basis, bases[scene.metric].map(basis => [basis, basis]), value => change('basis', value))));

  const actions = el('div');
  actions.className = 'toolbar';
  for (const [caption, delta] of [['Move earlier', -1], ['Move later', 1]]) {
    const to = index + delta;
    const move = button(caption, () => {
      [draft.scenes[index], draft.scenes[to]] = [draft.scenes[to], draft.scenes[index]];
      updateEditor();
    });
    move.disabled = !draft.scenes[to];
    actions.append(move);
  }
  const remove = button('Remove scene', () => {
    draft.scenes.splice(index, 1);
    selected = draft.scenes[Math.max(0, index - 1)].id;
    updateEditor();
  });
  remove.disabled = draft.scenes.length === 1;
  actions.append(remove);
  editor.append(actions);
  $('warnings').textContent = flowIssues(draft.scenes).join(' ');
  if (editingLayout) preview(selected, true);
}

function reviewTables() {
  $('table-review').replaceChildren();
  for (const type of ['premium', 'bonus']) {
    const rows = draft.tables[type];
    $(type + '-count').textContent = rows.length ? rows.length + ' rows loaded' : 'No table loaded';
    if (!rows.length) continue;
    const row = rows[0];
    $('table-review').append(el('p', type + ' sample · Age ' + row.age + ' · ' + row.term + ' years · ' + rupees.format(row.cover) + ' cover · ' + rupees.format(row.amount) + ' (' + row.basis + ')'));
  }
}

function showPlacementControls(node, key, scene, value, caption) {
  activeLayer = key;
  for (const layer of screen.querySelectorAll('.placed-layer')) {
    layer.dataset.selected = String(layer === node);
  }
  layoutTools.replaceChildren(el('strong', caption));
  const positionFields = el('div');
  positionFields.className = 'layout-values';
  const controls = {};
  const apply = (next, persist = true) => {
    Object.assign(value, next);
    place(node, value, true);
    for (const [field, control] of Object.entries(controls)) control.value = value[field];
    if (persist) {
      scene.layout ??= {};
      scene.layout[key] = { ...value };
      void save();
    }
  };
  for (const [field, name] of [['x', 'Left %'], ['y', 'Top %'], ['width', 'Width %']]) {
    const control = input(value[field], next => apply(constrain({ ...value, [field]: Number(next) || 0 })), 'number');
    control.min = '0';
    control.max = '100';
    controls[field] = control;
    positionFields.append(label(name, control));
  }
  const delay = input(value.delay, next => apply({ delay: Math.min(30, Math.max(0, Number(next) || 0)) }), 'number');
  delay.min = '0';
  delay.max = '30';
  delay.step = '0.05';
  const entrance = select(value.effect, effects, effect => apply({ effect }));
  entrance.id = 'layout-entrance';
  layoutTools.append(positionFields, label('Entrance', entrance), label('Entrance delay (seconds)', delay));
  return apply;
}

function preview(id, edit = false) {
  const scene = draft.scenes.find(item => item.id === id);
  if (!scene) return;
  const run = ++previewRun;
  const current = () => run === previewRun;
  audio.pause();
  audio.onended = audio.ontimeupdate = null;
  audio.removeAttribute('src');
  audio.load();
  for (const url of urls) URL.revokeObjectURL(url);
  urls = [];
  editingLayout = edit;
  $('edit-layout').setAttribute('aria-pressed', String(edit));
  layoutTools.hidden = !edit;
  layoutTools.replaceChildren(el('p', 'Drag an item on the phone. Use arrow keys or the position fields for fine adjustments.'));
  if (lastLayoutScene !== id) activeLayer = '';
  lastLayoutScene = id;
  const positioned = edit || Boolean(scene.layout);
  screen.classList.toggle('positioned', positioned);
  screen.classList.toggle('layout-mode', edit);
  screen.replaceChildren();
  function mount(node, key, caption, animate = true) {
    screen.append(node);
    if (!positioned) return;
    const value = placement(scene, key);
    place(node, value, edit, animate);
    if (!edit) return;
    let apply;
    const selectLayer = () => {
      if (!apply || activeLayer !== key) apply = showPlacementControls(node, key, scene, value, caption);
    };
    enableDrag(node, screen, value, selectLayer, (next, persist) => {
      selectLayer();
      apply(next, persist);
    });
    if (activeLayer === key) selectLayer();
  }
  mount(el('h3', scene.title), 'title', 'Scene title');
  if (scene.image) {
    const image = el('img');
    image.src = source(scene.image);
    image.alt = '';
    mount(image, 'artwork', 'Artwork');
  }
  const text = el('p', scene.text);
  const value = el('p');
  const updateAmount = () => {
    if (!scene.metric) return;
    const row = findAmount(draft.tables[scene.metric], profile, scene.basis);
    value.textContent = row ? (scene.metric === 'premium' ? 'Premium' : 'Bonus') + ' (' + row.basis + ') · ' + rupees.format(row.amount)
      : scene.metric === 'premium' ? 'LIC quote required' : 'Bonus figure unavailable';
  };
  if (scene.text) mount(text, 'text', 'On-screen text');
  if (scene.metric) {
    value.className = 'metric amount-layer';
    updateAmount();
    mount(value, 'amount', 'Table amount');
  }
  const reveal = hidden => {
    for (const node of [text, value]) {
      node.hidden = hidden;
      node.dataset.reveal = '';
    }
  };
  reveal(Boolean(!edit && scene.audio && scene.reveal > 0));
  if (scene.profile) {
    const group = el('div');
    group.className = 'preview-profile';
    fields.forEach((field, i) => {
      const control = input(profile[field], next => {
        profile[field] = Number(next);
        updateAmount();
      }, 'number');
      control.min = '1';
      group.append(label(['Age', 'Term (years)', 'Cover (INR)'][i], control));
    });
    screen.append(group);
  }
  const actions = el('div');
  actions.className = 'actions';
  const positionedChoices = [];
  const go = (caption, target) => {
    const control = button(caption, () => preview(target));
    control.disabled = !draft.scenes.some(candidate => candidate.id === target);
    actions.append(control);
  };
  const finish = () => {
    if (!current()) return;
    reveal(false);
    if (scene.mode === 'audio' && scene.target !== id && draft.scenes.some(candidate => candidate.id === scene.target)) {
      preview(scene.target);
    } else {
      actions.hidden = false;
      positionedChoices.forEach(({ control, target }) => {
        control.disabled = !draft.scenes.some(candidate => candidate.id === target);
      });
    }
  };
  if (scene.mode === 'choice') scene.choices.forEach((choice, index) => {
    const caption = choice.label || 'Untitled choice';
    if (!positioned) {
      go(caption, choice.target);
      return;
    }
    const control = button('', () => { if (!edit) preview(choice.target); });
    control.className = 'goal-layer' + (choice.image ? ' coin' : '');
    if (choice.image) {
      const image = el('img');
      image.src = source(choice.image);
      image.alt = '';
      image.draggable = false;
      control.append(image);
    }
    control.append(el('span', caption));
    control.disabled = !edit && (Boolean(scene.audio) || !draft.scenes.some(candidate => candidate.id === choice.target));
    positionedChoices.push({ control, target: choice.target });
    mount(control, 'choice:' + index, caption);
  });
  if (['tap', 'audio'].includes(scene.mode)) go('Continue', scene.target);
  screen.append(actions);
  if (edit) {
    actions.querySelectorAll('button').forEach(control => { control.disabled = true; });
    return;
  }
  if (!scene.audio) {
    reveal(false);
    return;
  }
  actions.hidden = true;
  const controls = el('div');
  controls.className = 'audio-controls';
  const play = button('Play narration', () => {
    audio.play().catch(() => { if (current()) skip.hidden = false; });
  });
  const skip = button('Continue without sound', () => { audio.pause(); controls.hidden = true; finish(); });
  controls.append(play, skip);
  controls.hidden = true;
  screen.append(controls);
  audio.src = source(scene.audio);
  audio.ontimeupdate = () => { if (current() && audio.currentTime >= scene.reveal) reveal(false); };
  audio.onended = () => { controls.hidden = true; finish(); };
  audio.onerror = () => { if (current()) controls.hidden = false; };
  audio.play().catch(() => { if (current()) controls.hidden = false; });
}

$('sample').addEventListener('click', () => {
  if (!confirm('Replace the current local draft with the Plan 733 sample?')) return;
  editingLayout = false;
  layoutTools.hidden = true;
  $('edit-layout').setAttribute('aria-pressed', 'false');
  screen.classList.remove('positioned', 'layout-mode');
  draft = demo733();
  selected = draft.scenes[0].id;
  $('draft-title').value = draft.title;
  reviewTables();
  updateEditor();
  audio.pause();
  previewRun++;
  screen.replaceChildren(el('p', 'Select Play from start to preview the sample.'));
});
$('draft-title').value = draft.title;
$('draft-title').addEventListener('change', event => { draft.title = event.target.value; void save(); });
$('add-scene').addEventListener('click', () => {
  const scene = newScene();
  draft.scenes.push(scene);
  selected = scene.id;
  updateEditor();
});
for (const type of ['premium', 'bonus']) {
  $(type + '-file').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    const target = draft;
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('The CSV must be 5 MB or smaller.');
      const rows = parseTable(await file.text(), type);
      if (target !== draft || event.target.files[0] !== file) return;
      draft.tables[type] = rows;
      reviewTables();
      await save();
    } catch (error) {
      if (target === draft) status(error.message);
    } finally {
      if (event.target.files[0] === file) event.target.value = '';
    }
  });
}
$('start').addEventListener('click', () => preview(draft.scenes[0].id));
$('edit-layout').addEventListener('click', () => {
  if (editingLayout) preview(selected);
  else { activeLayer = ''; preview(selected, true); }
});
$('preview-scene').addEventListener('click', () => preview(selected));
renderEditor();
reviewTables();
screen.replaceChildren(el('p', 'Select Play from start or Play selected scene.'));
