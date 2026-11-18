// "He Ate a Plane" — Michel Lotito (true story, Cessna 150 eaten 1978–1980). Shot starts come from the voiceover word times.
const fs = require('fs'), path = require('path');
const P = Math.PI;
const VO = JSON.parse(fs.readFileSync(path.join(__dirname, 'vo.json'), 'utf8'));
const CUES = [
  ['payoff', 'this man'], ['toy', 'not a'], ['france', 'france'], ['saws', 'michel'], ['swallow', 'he swallows'], ['kilo', 'about a'],
  ['years', 'it takes'], ['worst', "but that's"], ['bikes', 'before the'], ['tvs', 'seven'], ['doctors', 'doctors'], ['stomach', 'stomach'],
  ['guinness', 'guinness'], ['ate', 'he ate that'], ['question', "what's"],
];
const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9' -]/g, '');
const words = VO.words.map((w) => ({ w: norm(w.w), start: w.start }));
function findCue(ph, after) { const p = ph.split(' ');
  for (let i = 0; i < words.length; i++) if (words[i].start >= after - 0.05 && p.every((x, k) => words[i + k] && words[i + k].w === x)) return words[i].start;
  throw new Error('cue ' + ph); }
const T = {}; let last = 0;
for (const [id, ph] of CUES) { T[id] = id === 'payoff' ? 0 : Math.max(0, findCue(ph, last) - (id === 'toy' ? 0.2 : 0.1)); last = T[id] + 0.1; }
const END = +(VO.duration + 0.6).toFixed(2);
const ids = CUES.map((c) => c[0]), dur = (id) => +((ids.indexOf(id) < ids.length - 1 ? T[ids[ids.indexOf(id) + 1]] : END) - T[id]).toFixed(3);
const at = (id, k = 0) => +(T[id] + k).toFixed(3);
const ACC = '#ffb020';

// ---------- cast ----------
const cast = { hero: { character: 'jake', wardrobe: { top: '#7f95ab', bottom: '#23252b', shoes: '#18140f' } } };   // stage performer: white shirt, black trousers

// ---------- sets & props ----------
const FORKUP = (d) => [{ hand: 'right', to: 'hero.chest', offset: [-0.1, 0.2, 0.3], start: 0.0, end: d }];
const SIP = (d) => [{ hand: 'right', to: [-0.07, 1.12, -0.32], start: 0.0, end: d }];
const FIELD = 'outdoor', ROOM = { type: 'interior', wall: '#9a8b76' };
const TABLE_Y = 0.756, SEAT = [0, 0, -0.62];
const M = (id, pos, o = {}) => ({ type: 'model', id, p: [[0, pos]], end: 99, ...o });
const PLANE = (o = {}) => M('cessna', [-1.6, 0, -6.5], { height: 2.68, rotY: 0.55, ...o });
const TABLESET = (o = {}) => [M('table', [0, 0, 0], { height: 0.99 }), M('chair', SEAT, { height: 1.03 }),
  M('plate', [0, TABLE_Y, -0.3], { height: 0.04 }), M('glass', [0.25, TABLE_Y, -0.22], { height: 0.13 }), ...(o.extra || [])];
const FORK = { type: 'model', id: 'fork', height: 0.21, end: 99, attach: 'hero.righthand', grip: true, rot: [0, 0, 0] };
const sit = (d) => [{ clip: 'sit', start: -1, end: d + 1 }];
const idle = (d) => [{ clip: 'idle', start: 0, end: d + 1 }];
const seated = (o = {}) => ({ pos: [[0, SEAT]], rotY: [[0, 0]], clips: sit(4), hands: { right: 'grip', left: 'soft' }, ...o });

const shots = [];
const S = (id, o) => shots.push({ name: id, dur: dur(id), ...o });

// 1 · PAYOFF — a dinner table in a field, a plane behind him, fork up. Crash-zoom in.
S('payoff', { role: 'payoff', set: FIELD, look: 'cinematic', punch: [0.45, 1.25],
  camera: { pos: [[0, [1.6, 2.2, 6.5]], [0.45, [0.55, 1.35, 2.3], 'outExpo'], [dur('payoff'), [0.4, 1.32, 1.75], 'inOutSine']], look: [[0, [-0.4, 1.5, -2.5]], [0.45, [-0.15, 1.25, -1.2], 'outExpo']], fov: 44, handheld: 0.6 },
  cast: { hero: seated({ reach: FORKUP(dur('payoff')),
    look: [[0, 'hero.righthand'], [0.9, [0.9, 1.35, 2.4], 'inOutSine']], bones: { spine: [[0, [-0.14, 0, 0]]], spine1: [[0, [-0.08, 0, 0]]], head: [[0, [-0.12, 0, 0]], [0.9, [-0.26, 0, 0], 'inOutSine']] }, face: { smile: [[0.3, 0], [0.9, 0.35]], squint: [[0, 0.2]] }, acting: 'none' }) },
  fx: [PLANE(), ...TABLESET(), FORK], sfx: [{ t: 0, type: 'impact', gain: 1 }, { t: 0.05, type: 'whoosh', gain: 0.7 }] });
// 2 · "Not a toy. A real Cessna." — low hero angle on the plane
S('toy', { cut: 'whip', set: FIELD, look: 'cinematic',
  camera: { pos: [[0, [6.5, 0.5, 7.5]], [dur('toy'), [5.6, 0.55, 6.6], 'inOutSine']], look: [[0, [0, 1.5, 0]]], fov: 42, handheld: 0.4 },
  fx: [M('cessna', [0, 0, 0], { height: 2.68, rotY: 0.2 })] });
// 3 · "France, 1978." — he walks up to the plane, saw in hand
S('france', { cut: 'dip', set: FIELD, look: 'warm-film',
  camera: { pos: [[0, [6.2, 1.3, 4.6]], [dur('france'), [5.6, 1.3, 4.1], 'inOutSine']], look: [[0, [2.6, 1.0, 2.8]], [dur('france'), [2.0, 1.0, 2.2], 'inOutSine']], fov: 44 },
  cast: { hero: { pos: [[0, [3.1, 0, 3.7]], [dur('france'), [3.1 - 0.95 * dur('france'), 0, 3.7 - 0.95 * dur('france')]]], rotY: [[0, -P * 0.75]],
    clips: [{ clip: 'walk', start: 0, end: 3, speed: 0.9 }], look: [[0, [0, 1.2, 0]]] } },
  fx: [M('cessna', [0, 0, 0], { height: 2.68, rotY: 0.2 }), { type: 'model', id: 'hacksaw', height: 0.17, attach: 'hero.righthand', grip: true, rot: [0, P / 2, 0] }] });
// 4 · "Michel Lotito saws it into tiny pieces." — he saws the tailplane, sparks
const TIP = [1.66, 1.21, -3.8];
S('saws', { cut: 'whip', set: FIELD, look: 'cinematic', punch: [1.6],
  camera: { pos: [[0, [2.25, 1.72, -2.25]], [dur('saws'), [2.1, 1.7, -2.5], 'inOutSine']], look: [[0, [1.74, 1.42, -4.15]]], fov: 46, handheld: 0.5 },
  cast: { hero: { pos: [[0, [1.74, 0, -4.32]]], rotY: [[0, 0]], clips: idle(4), look: [[0, TIP]], face: { squint: [[0, 0.7]] }, acting: 'none',
    reach: [{ hand: 'right', to: [TIP[0] - 0.02, TIP[1] + 0.07, TIP[2] - 0.08], start: 0.1, end: dur('saws') }, { hand: 'left', to: [TIP[0] + 0.2, TIP[1] + 0.06, TIP[2] - 0.02], start: 0.2, end: dur('saws') }],
    bones: { rightforearm: [[0.4, [0, 0, 0]], [0.65, [0, 0.15, 0]], [0.9, [0, -0.1, 0]], [1.15, [0, 0.15, 0]], [1.4, [0, -0.1, 0]], [1.65, [0, 0.15, 0]], [1.9, [0, -0.1, 0]], [2.15, [0, 0.15, 0]], [2.4, [0, 0, 0]]] }, hands: { left: 'grip' } } },
  fx: [M('cessna', [0, 0, 0], { height: 2.68 }), { type: 'model', id: 'hacksaw', height: 0.17, attach: 'hero.righthand', grip: true, rot: [0, P / 2, 0] },
    { type: 'sparks', start: 0.5, end: dur('saws'), pos: TIP, scale: 0.4 }],
  sfx: [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25].map((t) => ({ t, type: 'scratch', gain: 0.45 })) });
// 5 · "He swallows them with water." — at home, glass to his lips
S('swallow', { cut: 'zoom', set: ROOM, look: 'cinematic',
  camera: { move: 'push', target: 'hero', size: 'ms', az: -62 },
  cast: { hero: seated({ reach: SIP(dur('swallow')), look: [[0, 'hero.righthand']], hands: { right: 'grip', left: 'soft' },
    bones: { head: [[0.6, [0, 0, 0]], [1.0, [-0.25, 0, 0], 'inOutSine']] }, face: { squint: [[0.7, 0.6]] }, acting: 'none' }) },
  fx: [...TABLESET().filter((m) => m.id !== 'glass'), { type: 'model', id: 'glass', height: 0.13, attach: 'hero.righthand', grip: true, rot: [0, 0, 0] }] });
// 6 · "About a kilo a day." — overhead on the plate of scraps
S('kilo', { cut: 'whip', set: ROOM, look: 'cinematic',
  camera: { pos: [[0, [-0.28, 1.3, 0.0]], [dur('kilo'), [-0.24, 1.15, -0.08], 'inOutSine']], look: [[0, [0, TABLE_Y, -0.3]]], fov: 40, roll: 0.2 },
  fx: [...TABLESET(), M('fork', [0.17, TABLE_Y + 0.004, -0.32], { height: 0.21, tilt: [[0, [-P / 2, 0, 0]]] })] });
// 7 · "It takes him two years." — time-lapse: the plane shrinks behind him
S('years', { cut: 'dip', set: FIELD, look: 'cinematic', time: [[0, 0], [dur('years'), dur('years') * 3]],
  camera: { pos: [[0, [2.2, 1.7, 4.2]], [dur('years') * 3, [1.8, 1.6, 3.7], 'linear']], look: [[0, [-0.7, 1.1, -2.8]]], fov: 44 },
  cast: { hero: seated({ reach: FORKUP(9), look: [[0, 'hero.righthand']], acting: 'none' }) },
  fx: [PLANE({ scale: [[0, 1], [dur('years') * 1.2, 0.75, 'inOutSine'], [dur('years') * 2.2, 0.42, 'inOutSine'], [dur('years') * 3, 0.15, 'inOutSine']] }), ...TABLESET(), FORK] });
// 8 · "But that's not the worst part." — he stops, looks up
S('worst', { cut: 'zoom', set: ROOM, look: 'cinematic', punch: [0.5],
  camera: { move: 'dolly-in', target: 'hero', size: 'ms', az: -32 },
  cast: { hero: seated({ look: [[0, [0, 0.9, -0.3]], [0.35, [1.5, 1.2, 3], 'outCubic']], face: { smirk: [[0.4, 0], [0.9, 0.5]] }, acting: 'none' }) },
  fx: [...TABLESET(), FORK] });
// 9 · "Before the plane, he ate eighteen bicycles." — a row of bikes, he walks past
const BIKES = Array.from({ length: 7 }, (_, i) => M('bicycle', [-3.0 + i * 0.85, 0, -0.9], { height: 1.07, rotY: 0.95 + (i % 2 ? 0.06 : -0.05) }));
S('bikes', { cut: 'whip', set: { type: 'studio' }, look: 'clean-cg',
  camera: { pos: [[0, [-1.4, 1.45, 4.6]], [dur('bikes'), [0.3, 1.4, 4.3], 'linear']], look: [[0, [-1.4, 0.75, -0.5]], [dur('bikes'), [0.3, 0.75, -0.5], 'linear']], fov: 50 },
  cast: { hero: { pos: [[0, [-2.0, 0, 0.35]], [dur('bikes'), [-2.0 + 1.3 * dur('bikes'), 0, 0.35]]], rotY: [[0, P / 2]], clips: [{ clip: 'walk', start: 0, end: 4, speed: 0.9 }], look: [[0, [0, 0.9, -0.9]]] } },
  fx: BIKES });
// 10 · "Seven TVs. A coffin." — the pile
const TVS = [[-1.9, -1.0], [-1.2, -1.35], [-0.45, -1.5], [-1.55, -0.2], [-0.8, -0.55], [0.25, -1.6], [1.5, -1.0, 0.55]].map((p, i) => M('tv', [p[0], p[2] || 0, p[1]], { height: 0.88, rotY: [0.5, 0.25, 0.05, 0.7, 0.35, -0.1, -0.2][i] }));
S('tvs', { cut: 'zoom', set: { type: 'studio' }, look: 'clean-cg',
  camera: { pos: [[0, [1.9, 1.5, 4.1]], [dur('tvs'), [0.9, 1.45, 4.3], 'inOutSine']], look: [[0, [-0.2, 0.75, -0.9]]], fov: 46 },
  cast: { hero: { pos: [[0, [0.55, 0, 0.6]]], rotY: [[0, -2.6]], clips: idle(4), look: [[0, [-1.0, 0.4, -1.2]], [0.9, [1.5, 0.6, -1.0], 'inOutSine']], gestures: [{ type: 'hips', start: 0.3, end: dur('tvs') }] } },
  fx: [...TVS, M('coffin', [1.5, 0, -1.0], { height: 0.55, rotY: P / 2 - 0.15 })] });
// 11 · "Doctors found…" — x-ray
S('doctors', { cut: 'flash', set: 'void', look: 'neon-night',
  camera: { move: 'push', target: 'hero', size: 'mls', az: 0 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], clips: idle(4), xray: [[0, 0], [0.4, 0.8]], look: [[0, [0.4, 1.6, 3]]], acting: 'none' } } });
// 12 · "…his stomach lining was twice as thick."
S('stomach', { cut: 'zoom', set: 'void', look: 'neon-night',
  camera: { move: 'dolly-in', target: 'hero', size: 'ms', az: 15 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], clips: idle(4), xray: [[0, 0.8]], look: [[0, [0.4, 1.6, 3]]], acting: 'none' } } });
// 13 · "Guinness gave him a plaque."
S('guinness', { cut: 'whip', set: ROOM, look: 'cinematic',
  camera: { move: 'push', target: 'hero', size: 'ms', az: 35 },
  cast: { hero: seated({ look: [[0, [0, TABLE_Y + 0.15, -0.2]]], face: { smile: [[0.3, 0.5]] }, reach: [{ hand: 'left', to: [0.31, TABLE_Y + 0.25, -0.2], start: 0.25, end: dur('guinness') }], hands: { right: 'soft', left: 'soft' } }) },
  fx: [...TABLESET(), M('plaque', [0.3, TABLE_Y, -0.18], { height: 0.26, rotY: 0.55 })] });
// 14 · "He ate that too." — smash cut: the plate is empty, he smirks
S('ate', { cut: 'smash', set: ROOM, look: 'cinematic', punch: [0.3],
  camera: { pos: [[0, [0.65, 1.55, 0.75]], [dur('ate'), [0.6, 1.5, 0.65], 'inOutSine']], look: [[0, [0, 1.0, -0.45]]], fov: 42, handheld: 0.3 },
  cast: { hero: seated({ reach: FORKUP(dur('ate')), look: [[0, [0, TABLE_Y + 0.12, -0.3]], [0.35, [1.4, 1.2, 2.5], 'outCubic']], face: { smirk: [[0.35, 0], [0.6, 0.7]] }, bones: { head: [[0, [0.15, 0, 0]], [0.35, [-0.22, 0, 0], 'outCubic']] }, acting: 'none' }) },
  fx: [...TABLESET(), FORK] });
// 15 · "What's the weirdest thing you've eaten?" — back to the field (loop)
S('question', { cut: 'zoom', set: FIELD, look: 'cinematic',
  camera: { pos: [[0, [0.45, 1.3, 2.0]], [dur('question'), [1.4, 1.9, 5.6], 'inOutSine']], look: [[0, [-0.15, 1.25, -1.2]], [dur('question'), [-0.5, 1.4, -2.5], 'inOutSine']], fov: 44 },
  cast: { hero: seated({ reach: FORKUP(dur('question')), look: [[0, 'hero.righthand'], [1.0, [0.8, 1.2, 4], 'inOutSine']], face: { smile: [[0.6, 0.4]] }, bones: { spine: [[0, [-0.12, 0, 0]]], head: [[0, [-0.05, 0, 0]], [1.0, [-0.28, 0, 0], 'inOutSine']] }, acting: 'none' }) },
  fx: [PLANE(), ...TABLESET(), FORK] });

// ---------- motion graphics (one family: slam · place · wipe · counter · callout · kinetic) ----------
const titles = [
  { t: 0.05, t1: at('toy'), style: 'slam', text: 'HE ATE\nA PLANE', pos: [0.5, 0.1], size: 0.1, accent: ACC },
  { t: at('toy', 0.6), t1: at('france'), style: 'callout', at: [0, 1.6, 0.5], text: 'CESSNA 150', sub: 'REAL · 7 M LONG', icon: 'check', side: 1 },
  { t: at('france', 0.1), t1: at('saws'), style: 'place', text: 'GRENOBLE, FRANCE', sub: '1978', pos: [0.08, 0.08] },
  { t: at('saws', 0.05), t1: at('swallow', -0.1), style: 'wipe', text: 'MICHEL LOTITO', sub: '"MONSIEUR MANGETOUT"', pos: [0.5, 0.07] },
  { t: at('kilo', 0.1), t1: at('years'), style: 'counter', from: 0, to: 1, suffix: ' KG', sub: 'OF METAL · EVERY DAY', pos: [0.5, 0.13], dur: 0.5 },
  { t: at('years', 0.1), t1: at('worst'), style: 'slam', text: '2 YEARS\n1978 → 1980', pos: [0.5, 0.1], size: 0.08, accent: ACC },
  { t: at('bikes', 0.9), t1: at('tvs', -0.55), style: 'counter', from: 3, to: 18, suffix: ' BICYCLES', pos: [0.5, 0.12], dur: 0.9 },
  { t: at('tvs', 0.05), t1: at('doctors'), style: 'counter', from: 3, to: 7, suffix: ' TVs', sub: '+ 1 COFFIN', pos: [0.5, 0.12], dur: 0.4 },
  { t: at('doctors', 0.05), t1: at('stomach', 0.1), style: 'scan' },
  { t: at('stomach', 0.2), t1: at('guinness'), style: 'callout', at: 'hero.stomach', text: 'STOMACH LINING', sub: '2× THICKER', icon: 'warning', side: 1 },
  { t: at('stomach', 0.1), t1: at('guinness'), style: 'pulse', at: 'hero.stomach', beat: 70 },
  { t: at('guinness', 0.1), t1: at('ate'), style: 'wipe', text: 'GUINNESS RECORD', sub: 'STRANGEST DIET', pos: [0.5, 0.12] },
  { t: at('ate', 0.35), t1: at('question'), style: 'slam', text: 'HE ATE\nTHAT TOO', pos: [0.5, 0.1], size: 0.1, accent: ACC },
  { t: at('question', 0.1), t1: END, style: 'kinetic', text: "WEIRDEST THING|YOU'VE|EATEN?", hi: ['EATEN?'], pos: [0.5, 0.1], size: 0.09 },
];

module.exports = {
  title: 'He Ate a Plane', T, END,
  config: { targetDuration: END, set: FIELD, look: 'golden-hour', quality: 'good', effort: 'maximum', fps: 30, accent: ACC,
    sound: { music: { mood: 'mystery', bpm: 96, drops: [at('worst', 0.05), at('ate', 0.3)] }, sfx: true, ambience: true, voice: { url: 'vo.wav' } },
    captions: { style: 'pop', sync: VO.words.map((w) => [w.w, w.start, w.end]) }, letterbox: 0 },
  thumbs: [
    { shot: 0, t: 1.4, text: 'HE ATE\nA PLANE', hi: ['PLANE'], accent: ACC, face: { hero: { smile: 0.5 } }, size: 'ms', side: 'left' },
  ],
  cast, shots, captions: [], titles,
};
