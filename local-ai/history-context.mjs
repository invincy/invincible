const source = 'https://github.com/Seshat-Global-History-Databank/cliopatria/releases/tag/v0.2.1';
const locators = [
  { name: 'Present-day Gujarat', aliases: ['Gujarat', 'गुजरात'], position: [71.75, 23], source: 'https://www.geonames.org/1270770/gujarat.html' },
  { name: 'Present-day Rajasthan', aliases: ['Rajasthan', 'राजस्थान'], position: [73.83333, 26.58333], source: 'https://www.geonames.org/1258899/state-of-rajasthan.html' },
  { name: 'Panipat · modern locator', aliases: ['Panipat', 'पानीपत'], position: [76.97, 29.39], source: 'https://panipat.gov.in/geographical-status/' }
];
const aliases = new Map([
  ['lodi dynasty', ['Lodi Dynasty', 'Lodi', 'Lodhi', 'लोदी']],
  ['delhi sultanate', ['Delhi Sultanate', 'दिल्ली सल्तनत']]
]);
const normalize = text => String(text).normalize('NFKC')
  .replace(/[०-९]/g, digit => String(digit.charCodeAt(0) - 0x966))
  .toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ').trim();
const contains = (text, name) => ` ${text} `.includes(` ${normalize(name)} `);
const yearsIn = text => [...new Set((text.match(/\b\d{3,4}\b/g) || []).map(Number))];

export function findSceneGeography(segmentText, direction, narration, records = []) {
  const segment = normalize(segmentText);
  const brief = normalize(direction);
  const localYears = yearsIn(segment);
  const sharedYears = yearsIn(normalize(narration + ' ' + direction));
  const years = localYears.length ? localYears : sharedYears;
  const matchingTerritories = text => years.length === 1 ? records.filter(row => {
    const names = aliases.get(normalize(row.name)) || [row.name];
    return row.start <= years[0] && years[0] <= row.end
      && names.some(name => contains(text, name))
      && Array.isArray(row.locator) && row.locator.length === 2 && row.locator.every(Number.isFinite)
      && Math.abs(row.locator[0]) <= 180 && Math.abs(row.locator[1]) <= 85;
  }) : [];
  const mentioned = matchingTerritories(segment);
  const territory = mentioned.length ? mentioned : matchingTerritories(brief);
  // If overlapping records disagree, leave the territory locator out.
  const counts = new Map();
  for (const row of territory) counts.set(row.name, (counts.get(row.name) || 0) + 1);
  const unique = territory.filter(row => counts.get(row.name) === 1)
    .map(row => ({name: row.name + ' · approximate locator', position: row.locator, source}));
  const places = locators.filter(place => place.aliases.some(name => contains(segment, name)));
  const briefPlaces = locators.filter(place => place.aliases.some(name => contains(brief, name)));
  return (places.length || unique.length ? [...places, ...unique] : briefPlaces).slice(0, 3);
}

export function contextMap(places, duration) {
  if (!places.length || duration < 1) return null;
  const bounds = [0, 1].map(axis => {
    const positions = places.map(place => place.position[axis]);
    return [Math.min(...positions), Math.max(...positions)];
  });
  const center = bounds.map(([low, high]) => (low + high) / 2);
  const span = Math.max(...bounds.map(([low, high]) => high - low));
  const zoom = Math.max(1, Math.min(5, Math.log2(85 / Math.max(1, span))));
  return {
    format: 'invincible-map-animation', version: 1, title: 'Geographic context',
    duration, aspectRatio: '9:16', basemap: 'terrain', terrain: false, overlayPreset: 'documentary',
    camera: [
      {time: 0, center, zoom, pitch: 0, bearing: 0, easing: 'smooth'},
      {time: duration, center, zoom: zoom + .12, pitch: 0, bearing: 0, easing: 'smooth'}
    ],
    assets: [],
    layers: places.map((place, index) => ({
      id: 'context-' + index, type: 'label', name: place.name,
      start: 0, end: duration, position: place.position, color: '#F4F5F7', scale: 1
    }))
  };
}
