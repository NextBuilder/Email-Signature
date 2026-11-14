import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const TABLER = path.join(ROOT, 'node_modules/@tabler/icons/icons');
const SIMPLE = path.join(ROOT, 'node_modules/simple-icons/icons');
const OUT = path.join(ROOT, 'icons');
const SIZE = 96;

const PALETTE = {
  graphite: '#6E7480', black: '#111318', slate: '#475569', white: '#FFFFFF',
  red: '#E8364A', orange: '#F97316', gold: '#CA8A04', green: '#16A34A',
  teal: '#0D9488', blue: '#2563EB', purple: '#7C3AED', pink: '#DB2777'
};

const tablerInner = (name, kind = 'outline') => {
  const file = path.join(TABLER, kind, `${name}.svg`);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8').match(/<path[\s\S]*?\/>/g).filter(p => !p.includes('stroke="none"')).join('');
};
const simplePath = slug => {
  const file = path.join(SIMPLE, `${slug}.svg`);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8').match(/d="([^"]+)"/)[1] : null;
};
const SIMPLE_DATA = (d => Array.isArray(d) ? d : d.icons)(JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules/simple-icons/data/simple-icons.json'), 'utf8')));
const simpleHex = slug => {
  const list = SIMPLE_DATA;
  const hit = list.find(i => (i.slug || i.title.toLowerCase().replace(/[^a-z0-9]/g, '')) === slug);
  return hit ? `#${hit.hex}` : null;
};

const hacksterH = simplePath('hackster').split(/(?=M)/).filter(s => !s.startsWith('M12 0')).join('');
const robot = simplePath('instructables');
const skull = simplePath('hackaday');

const knockout = (shape, inner, w = 2) => `<defs><mask id="k" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect width="24" height="24" fill="#fff"/><g fill="none" stroke="#000" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${inner}</g></mask></defs><path d="${shape}" fill="currentColor" mask="url(#k)"/>`;
const strokes = (inner, w, k = 1.35) => `<g transform="translate(12 12) scale(${k}) translate(-12 -12)" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`;
const IN = '<path d="M8 11v5"/><path d="M8 8v.01"/><path d="M12 16v-5"/><path d="M16 16v-3a2 2 0 1 0 -4 0"/>';
const MED = '<path d="M8 9h1l3 3l3 -3h1"/><path d="M8 15l2 0"/><path d="M14 15l2 0"/><path d="M9 9l0 6"/><path d="M15 9l0 6"/>';
const SQ = 'M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z';

const P = [
  ['youtube', 'YouTube', 'Social'], ['instagram', 'Instagram', 'Social'], ['x', 'X', 'Social'],
  ['linkedin', 'LinkedIn', 'Social', { hex: '#0A66C2', badgeInner: strokes(IN, 2, 1.45) }], ['facebook', 'Facebook', 'Social'], ['tiktok', 'TikTok', 'Social'],
  ['threads', 'Threads', 'Social'], ['bluesky', 'Bluesky', 'Social'], ['mastodon', 'Mastodon', 'Social'],
  ['pinterest', 'Pinterest', 'Social'], ['reddit', 'Reddit', 'Social'], ['snapchat', 'Snapchat', 'Social'], ['tumblr', 'Tumblr', 'Social'],
  ['github', 'GitHub', 'Build'], ['gitlab', 'GitLab', 'Build'], ['stackoverflow', 'Stack Overflow', 'Build'],
  ['codepen', 'CodePen', 'Build', { hex: '#111318' }], ['producthunt', 'Product Hunt', 'Build'], ['figma', 'Figma', 'Build'],
  ['dribbble', 'Dribbble', 'Build'], ['behance', 'Behance', 'Build'], ['notion', 'Notion', 'Build'],
  ['instructables', 'Instructables', 'Make', { outline: `<g transform="translate(12 12) scale(1.02) translate(-12 -12)"><path d="${robot}" fill="currentColor" stroke="currentColor" stroke-width=".42" stroke-linejoin="round"/></g>`, solidInner: `<path d="${robot}" fill="currentColor" stroke="currentColor" stroke-width=".42" stroke-linejoin="round"/>` }],
  ['hackster', 'Hackster', 'Make', { outline: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><g transform="translate(12 12) scale(.86) translate(-12 -12)"><path d="${hacksterH}" fill="currentColor"/></g>`, badgeInner: `<g transform="translate(12 12) scale(1.25) translate(-12 -12)"><path d="${hacksterH}" fill="currentColor"/></g>` }],
  ['hackaday', 'Hackaday', 'Make', { outline: `<g transform="translate(12 12) scale(.86) translate(-12 -12)"><path d="${skull}" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round"/></g>` }],
  ['printables', 'Printables', 'Make'], ['thingiverse', 'Thingiverse', 'Make', { outlineFrom: null }],
  ['arduino', 'Arduino', 'Make', { outlineTabler: 'infinity' }],
  ['whatsapp', 'WhatsApp', 'Chat'], ['telegram', 'Telegram', 'Chat'], ['discord', 'Discord', 'Chat'], ['signal', 'Signal', 'Chat'],
  ['twitch', 'Twitch', 'Create'], ['spotify', 'Spotify', 'Create'], ['soundcloud', 'SoundCloud', 'Create'], ['vimeo', 'Vimeo', 'Create'],
  ['medium', 'Medium', 'Create', { solidInner: knockout(SQ, MED, 1.7), badgeInner: strokes(MED, 1.8, 1.5) }], ['substack', 'Substack', 'Create', { outline: `<g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h14M5 8h14M5 12h14v8l-7-4-7 4z"/></g>` }],
  ['patreon', 'Patreon', 'Create'], ['kofi', 'Ko-fi', 'Create', { outlineTabler: 'coffee' }], ['gumroad', 'Gumroad', 'Create'],
  ['linktree', 'Linktree', 'Create'], ['unsplash', 'Unsplash', 'Create'],
  ['upwork', 'Upwork', 'Work'], ['fiverr', 'Fiverr', 'Work'], ['calendly', 'Calendly', 'Work', { outlineTabler: 'calendar' }],
  ['website', 'Website', 'Contact', { outlineTabler: 'world', solidTabler: 'world', hex: '#111318' }],
  ['email', 'Email', 'Contact', { outlineTabler: 'mail', solidTabler: 'mail', hex: '#EA4335' }],
  ['phone', 'Phone', 'Contact', { outlineTabler: 'phone', solidTabler: 'phone', hex: '#16A34A' }],
  ['location', 'Location', 'Contact', { outlineTabler: 'map-pin', solidTabler: 'map-pin', hex: '#E8364A' }]
];

const stroke = inner => `<g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`;

function spec([key, name, group, o = {}]) {
  const tOut = o.outlineTabler ? tablerInner(o.outlineTabler) : tablerInner(`brand-${key}`);
  let outline = o.outline || (tOut && stroke(tOut));
  const sp = simplePath(key);
  const tFill = tablerInner(o.solidTabler || `brand-${key}`, 'filled');
  let solid = o.solidInner || (sp ? `<path d="${sp}" fill="currentColor"/>` : tFill ? `<g fill="currentColor">${tFill}</g>` : null);
  if (!outline && sp) outline = `<g transform="translate(12 12) scale(.86) translate(-12 -12)"><path d="${sp}" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></g>`;
  if (!solid) solid = outline.replace(/stroke-width="1.5"/g, 'stroke-width="2.2"');
  const badge = o.badgeInner || solid;
  const hex = o.hex || simpleHex(key) || '#111318';
  return { key, name, group, outline, solid, badge, hex };
}

const svg = (inner, color, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="${color}" style="color:${color}">${bg ? `<circle cx="12" cy="12" r="12" fill="${bg}"/><g transform="translate(12 12) scale(.54) translate(-12 -12)">${inner}</g>` : inner}</svg>`;
const render = (s, file) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, new Resvg(s, { fitTo: { mode: 'width', value: SIZE } }).render().asPng());
};
const contrast = hex => {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) > 186 ? '#111318' : '#FFFFFF';
};

const specs = P.map(spec);
let count = 0;
for (const s of specs) {
  for (const [c, hex] of Object.entries(PALETTE)) {
    render(svg(s.outline, hex), `${OUT}/outline/${c}/${s.key}.png`);
    render(svg(s.solid, hex), `${OUT}/solid/${c}/${s.key}.png`);
    if (c !== 'white') render(svg(s.badge, contrast(hex), hex), `${OUT}/badge/${c}/${s.key}.png`);
    count += c === 'white' ? 2 : 3;
  }
  render(svg(s.outline, s.hex), `${OUT}/outline/brand/${s.key}.png`);
  render(svg(s.solid, s.hex), `${OUT}/solid/brand/${s.key}.png`);
  render(svg(s.badge, contrast(s.hex), s.hex), `${OUT}/badge/brand/${s.key}.png`);
  count += 3;
}

const manifest = {
  palette: { ...PALETTE, brand: null },
  platforms: specs.map(({ key, name, group, hex }) => ({ key, name, group, hex }))
};
fs.writeFileSync(path.join(ROOT, 'app/platforms.js'), `window.SS_DATA = ${JSON.stringify(manifest, null, 2)};\n`);

console.log(`${specs.length} platforms, ${count} icons`);
