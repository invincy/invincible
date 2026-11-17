export const effects = [['none', 'None'], ['fade', 'Fade in'], ['rise', 'Rise in'], ['pop', 'Pop in']];
const defaults = {
  title: { x: 5, y: 3, width: 90 },
  artwork: { x: 7, y: 12, width: 86 },
  text: { x: 6, y: 70, width: 88 },
  amount: { x: 7, y: 82, width: 86 },
};
const choiceDefaults = [
  { x: 5, y: 66, width: 20 }, { x: 28, y: 69, width: 20 },
  { x: 52, y: 67, width: 20 }, { x: 75, y: 64, width: 20 },
];

export function placement(scene, key) {
  const index = Number(key.split(':')[1]);
  const fallback = defaults[key] ?? choiceDefaults[index] ?? { x: 8 + (index % 2) * 44, y: Math.min(88, 60 + Math.floor(index / 2) * 6), width: 40 };
  return { effect: 'none', delay: 0, ...fallback, ...scene.layout?.[key] };
}

export function constrain(value) {
  value.width = Math.round(Math.min(100, Math.max(10, value.width)));
  value.x = Math.round(Math.min(100 - value.width, Math.max(0, value.x)));
  value.y = Math.round(Math.min(92, Math.max(0, value.y)));
  return value;
}

export function place(node, value, editing, animate = true) {
  node.classList.add('placed-layer');
  node.style.left = value.x + '%';
  node.style.top = value.y + '%';
  node.style.width = value.width + '%';
  node.style.setProperty('--entrance-delay', value.delay + 's');
  node.dataset.entrance = editing || !animate ? 'none' : value.effect;
}

export function enableDrag(node, screen, value, select, change) {
  node.tabIndex = 0;
  node.addEventListener('click', event => { event.preventDefault(); select(); });
  node.addEventListener('keydown', event => {
    const delta = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
    if (!delta || event.target !== node) return;
    event.preventDefault();
    select();
    const step = event.shiftKey ? 5 : 1;
    change(constrain({ ...value, x: value.x + delta[0] * step, y: value.y + delta[1] * step }));
  });
  node.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    event.preventDefault();
    select();
    node.focus({ preventScroll: true });
    const area = screen.getBoundingClientRect();
    const original = { ...value };
    const x = event.clientX;
    const y = event.clientY;
    node.setPointerCapture(event.pointerId);
    const move = point => {
      if (point.pointerId !== event.pointerId) return;
      const maxY = Math.max(0, (1 - node.getBoundingClientRect().height / area.height) * 100);
      change(constrain({
        ...original,
        x: original.x + 100 * (point.clientX - x) / area.width,
        y: Math.min(maxY, original.y + 100 * (point.clientY - y) / area.height),
      }), false);
    };
    const stop = () => {
      node.removeEventListener('pointermove', move);
      node.removeEventListener('lostpointercapture', stop);
      change({ ...value });
    };
    node.addEventListener('pointermove', move);
    node.addEventListener('lostpointercapture', stop);
  });
}
