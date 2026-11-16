// "133 Days Alone" — Poon Lim (true story, 1942–43). Shot starts come from the voiceover word times.
const fs = require('fs'), path = require('path');
const P = Math.PI;
const VO = JSON.parse(fs.readFileSync(path.join(__dirname, 'vo.json'), 'utf8'));
const CUES = [
  ['payoff', 'he survived'], ['payoff2', 'days alone'], ['record', 'nobody has'], ['year', 'nineteen'], ['torpedo', 'a torpedo'], ['sinks', 'it sinks'], ['jump', 'he jumps'],
  ['swim', 'swims for'], ['raft', 'then he'], ['food', 'food for'], ['worst', "but that's"], ['ship', 'a ship'], ['going', 'and keeps'],
  ['out', 'the food'], ['hook', 'he bends'], ['rain', 'he drinks'], ['day', 'day one'], ['fisher', 'fishermen'], ['walk', 'he walks'], ['question', 'could you'],
];
const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9' -]/g, '');
const words = VO.words.map((w) => ({ w: norm(w.w), start: w.start }));
function findCue(ph, after) { const p = ph.split(' ');
  for (let i = 0; i < words.length; i++) if (words[i].start >= after - 0.05 && p.every((x, k) => words[i + k] && words[i + k].w === x)) return words[i].start;
  throw new Error('cue ' + ph); }
const T = {}; let last = 0;
for (const [id, ph] of CUES) { T[id] = id === 'payoff' ? 0 : Math.max(0, findCue(ph, last) - (id === 'payoff2' ? 0.25 : 0.1)); last = T[id] + 0.1; }
const END = +(VO.duration + 0.6).toFixed(2);
const ids = CUES.map((c) => c[0]), dur = (id) => +((ids.indexOf(id) < ids.length - 1 ? T[ids[ids.indexOf(id) + 1]] : END) - T[id]).toFixed(3);
const at = (id, k = 0) => +(T[id] + k).toFixed(3);

// ---------- cast ----------
const cast = {
  hero: { character: 'jake', wardrobe: { top: '#e6e0d0', bottom: '#2b2f38', shoes: '#1d1a17' } },   // ship steward: white shirt, dark trousers
  f1: { character: 'luis', wardrobe: { top: '#c9b48a', bottom: '#3b4a5a', shoes: '#2a2018' } },     // Brazilian fishermen
  f2: { character: 'marcus', wardrobe: { top: '#7a4a32', bottom: '#2f3a44', shoes: '#2a2018' } },
};
const DECK = 0.2;                                     // raft deck height above the calm sea
const SEA = { type: 'ocean', id: 'sea', swell: 1, calm: 4.5 };
const STORM = { type: 'ocean', id: 'storm', swell: 2.2, calm: 0, deep: '#0f2c3a', shallow: '#2a5d70' };
const STORM_NEAR = { ...STORM, id: 'storm-near', calm: 5 };   // same storm, flatter water around the jump/swim spot so the camera stays above the waves
const RAFT = (o = {}) => ({ type: 'model', id: 'raft', height: 0.38, color: '#7d6449', flat: true, p: [[0, [0, DECK - 0.38, 0]]], ...o });
const SHIP = (o = {}) => ({ type: 'model', id: 'cargo_ship', height: 10, rotY: P / 2, ...o });
const SUPPLIES = [{ type: 'model', id: 'crate', height: 0.42, p: [[0, [0.5, DECK, -0.68]]], rotY: 0.3, color: '#94795a', flat: true }, { type: 'model', id: 'barrel', color: '#7a5a3c', flat: true, height: 0.55, p: [[0, [-0.6, DECK, -0.85]]] }];
const kneel = (d) => [{ clip: 'kneel', start: -2, end: d + 1, loop: false }];
const idle = (d) => [{ clip: 'idle', start: 0, end: d + 1 }];
const onRaft = (x = 0, z = 0) => [[0, [x, DECK, z]]];

const shots = [];
const S = (id, o) => shots.push({ name: id, dur: dur(id), ...o });

// 1 · PAYOFF — a speck of a raft in an endless sea; crash-zoom down onto him
S('payoff', { role: 'payoff', set: SEA, look: 'cinematic', impact: [0.05], punch: [1.2],
  camera: { move: 'crash-zoom', target: 'hero', size: 'ws', at: 0.05, az: 35, height: 0.6, handheld: 0.9 },
  cast: { hero: { pos: onRaft(), rotY: [[0, 0]], clips: kneel(3), look: [[0, [6, 1, 9]], [1.2, [-6, 1.2, 9], 'inOutSine']], face: { squint: [[0, 0.7]], worried: [[0, 0.5]] }, acting: 'none' } },
  fx: [RAFT(), ...SUPPLIES], sfx: [{ t: 0, type: 'impact', gain: 1 }, { t: 0.05, type: 'whoosh', gain: 0.7 }] });
// 1b · "…days alone at sea." — snap to his sun-burnt face
S('payoff2', { set: SEA, look: 'cinematic', punch: [0.3],
  camera: { move: 'push', target: 'hero', size: 'mcu', az: 15, handheld: 0.8 },
  cast: { hero: { pos: onRaft(), rotY: [[0, 0]], clips: kneel(2), look: [[0, [-6, 1.2, 9]], [0.5, [-2, 1.2, 9], 'inOutSine']], face: { squint: [[0, 0.8]], worried: [[0, 0.6]] }, acting: 'none' } },
  fx: [RAFT(), ...SUPPLIES] });
// 2 · "Nobody has beaten it since."
S('record', { cut: 'zoom', set: SEA, look: 'cinematic',
  camera: { move: 'push', target: 'hero', size: 'mcu', az: -20, handheld: 0.6 },
  cast: { hero: { pos: onRaft(), rotY: [[0, 0]], clips: kneel(3), look: [[0, [-5, 1.5, 8]], [1.1, 'camera', 'inOutSine']], face: { squint: [[0, 0.8]], sad: [[0.6, 0], [1.2, 0.4]] }, acting: 'none' } },
  fx: [RAFT(), ...SUPPLIES] });
// 3 · "1942." — the ship at night in a rough sea
S('year', { cut: 'dip', set: STORM, look: 'horror',
  camera: { pos: [[0, [-16, 3, 22]], [dur('year'), [-12, 3.6, 19], 'inOutSine']], look: [[0, [0, 4, 0]]], fov: 34, handheld: 0.7 },
  fx: [SHIP({ p: [[0, [0, -1.2, 0]]], tilt: [[0, [0, 0, 0.02]], [dur('year') / 2, [0, 0, -0.03], 'inOutSine'], [dur('year'), [0, 0, 0.02], 'inOutSine']] }), { type: 'rain', count: 4000, opacity: 0.35 }],
  sfx: [{ t: 0.1, type: 'swell', gain: 0.6 }] });
// 4 · "A torpedo hits his ship."
S('torpedo', { cut: 'smash', set: STORM, look: 'horror', punch: [0.55],
  camera: { pos: [[0, [-13, 2.2, 15]]], look: [[0, [0, 3, 0]]], fov: 36, handheld: 1.4, shakes: [0.5] },
  fx: [SHIP({ p: [[0, [0, -1.2, 0]]], tilt: [[0, [0, 0, 0]], [0.5, [0, 0, 0]], [0.9, [0.05, 0, 0.12], 'outBack']] }),
    { type: 'explosion', t: 0.48, pos: [-1.2, 0.2, 1.4], scale: 1.1, seed: 3 }, { type: 'splash', t: 0.5, pos: [-1.2, 0, 1.6], dir: [0, 1, 0.3], scale: 1.6 },
    { type: 'rain', count: 4000, opacity: 0.35 }],
  sfx: [{ t: 0.48, type: 'boom', gain: 0.5 }, { t: 0.48, type: 'impact', gain: 0.35 }] });
// 5 · "It sinks in two minutes."
S('sinks', { cut: 'whip', set: STORM, look: 'horror', time: [[0, 0], [dur('sinks'), dur('sinks') * 2.5]],
  camera: { pos: [[0, [-18, 2, 14]], [dur('sinks'), [-17, 1.6, 13], 'linear']], look: [[0, [0, 2, 0]]], fov: 34, handheld: 0.6 },
  fx: [SHIP({ p: [[0, [0, -1.2, 0]], [dur('sinks') * 2.5, [0, -6, 0], 'inCubic']], tilt: [[0, [0.05, 0, 0.12]], [dur('sinks') * 2.5, [0.55, 0, 0.3], 'inCubic']] }),
    { type: 'smoke', start: 0, end: 6, pos: [-1.2, 1, 1.4], scale: 1.2, color: '#3a3836', opacity: 0.7 }, { type: 'fire', start: 0, end: 3, pos: [-1.2, 0.6, 1.4], scale: 0.9 }, { type: 'rain', count: 4000, opacity: 0.35 }],
  sfx: [{ t: 0.1, type: 'subdrop', gain: 0.8 }] });
// 6 · "He jumps."
S('jump', { cut: 'smash', set: STORM_NEAR, look: 'horror', time: [[0, 0], [0.3, 0.3], [dur('jump'), 0.75, 'outCubic']],
  camera: { move: 'static', target: 'hero', size: 'ws', az: 70, height: 0.3, handheld: 1.0 },
  cast: { hero: { pos: [[0, [0, 2.6, 0]], [0.25, [0, 2.8, 0.6], 'outCubic'], [0.9, [0, 0.0, 1.4], 'inCubic']], rotY: [[0, 0]], rotX: [[0, 0], [0.9, 0.9, 'inCubic']],
    clips: [{ clip: 'jump', start: -0.3, end: 1.5, loop: false }], face: { scream: [[0, 0.6], [0.3, 1]] }, gestures: [{ type: 'armsout', start: 0.1, end: 0.9 }], acting: 'none' } },
  fx: [SHIP({ p: [[0, [-5, -2.5, -7]]], tilt: [[0, [0.2, 0, 0.18]]] }), { type: 'smoke', start: 0, end: 2, pos: [-2, 2, -3], scale: 1.1, color: '#3a3836', opacity: 0.7 }, { type: 'splash', t: 0.88, pos: [0, 0, 1.4], dir: [0, 1, 0], scale: 1.2 }, { type: 'rain', count: 4000, opacity: 0.35 }],
  sfx: [{ t: 0.88, type: 'splash', gain: 1 }] });
// 7 · "Swims for two hours."
S('swim', { cut: 'whip', set: STORM_NEAR, look: 'cinematic',
  camera: { pos: [[0, [2.8, 2.3, -1.6]], [dur('swim'), [2.8, 2.3, 0.0], 'linear']], look: [[0, [0, -0.2, 0.6]], [dur('swim'), [0, -0.2, 2.2], 'linear']], fov: 42, handheld: 0.8 },
  cast: { hero: { pos: [[0, [0, -0.95, 0]], [dur('swim'), [0, -0.95, 1.6], 'linear']], rotY: [[0, 0]], clips: [{ clip: 'swim', start: 0, end: 3 }], swimming: true, face: { worried: [[0, 0.9]], squint: [[0, 0.6]] }, acting: 'none' } },
  fx: [{ type: 'rain', count: 4000, opacity: 0.35 }, { type: 'splash', t: 0.6, pos: [0, 0, 0.6], dir: [0, 1, 0.2], scale: 0.35 }, { type: 'splash', t: 1.3, pos: [0, 0, 1.3], dir: [0, 1, 0.2], scale: 0.35 }] });
// 8 · "Then he finds a raft." — dawn, he hauls himself on
S('raft', { cut: 'whip', set: SEA, look: 'warm-film', punch: [0.6],
  camera: { move: 'crane-up', target: 'hero', size: 'ws', az: 40, handheld: 0.5 },
  cast: { hero: { pos: [[0, [0, -0.7, 1.15]], [0.55, [0, DECK, 0.55], 'outCubic']], rotY: [[0, P]], swimming: true, clips: kneel(3), bones: { spine: [[0, [0.6, 0, 0]], [0.6, [0, 0, 0], 'outCubic']] },
    face: { worried: [[0, 0.8]], smile: [[0.8, 0], [1.1, 0.3]] }, acting: 'none' } },
  fx: [RAFT(), ...SUPPLIES, { type: 'splash', t: 0.15, pos: [0, 0, 1.15], dir: [0, 1, 0], scale: 0.4 }] });
// 9 · "Food for fifty days."
S('food', { cut: 'whip', set: SEA, look: 'golden-hour',
  camera: { move: 'orbit', target: 'hero', size: 'ws', span: 30, az: 140 },
  cast: { hero: { pos: onRaft(0.4, -0.3), rotY: [[0, P]], clips: kneel(3), reach: [{ hand: 'right', to: [0.5, DECK + 0.44, -0.6], start: 0.2, end: dur('food') }], hands: { right: 'soft' },
    look: [[0, [0.55, DECK + 0.4, -0.75]]], face: { smile: [[0.4, 0.35]] } } },
  fx: [RAFT(), ...SUPPLIES] });
// 10 · "But that's not the worst part."
S('worst', { cut: 'glitch', set: SEA, look: 'cinematic',
  camera: { move: 'dolly-in', target: 'hero', size: 'mcu', az: 10 },
  cast: { hero: { pos: onRaft(), rotY: [[0, 0]], clips: kneel(3), look: [[0, [0, 1, 6]], [0.6, [-3, 1.6, 12], 'outCubic']], face: { worried: [[0, 0.4], [0.5, 0.9, 'outBack']] }, acting: 'none' } },
  fx: [RAFT(), ...SUPPLIES] });
// 11 · "A ship sails right past him." — he stands and waves
S('ship', { set: SEA, look: 'cinematic',
  camera: { pos: [[0, [0.15, 1.8, -3.4]], [dur('ship'), [0.1, 1.75, -2.9], 'inOutSine']], look: [[0, [-1.6, 1.6, 30]]], fov: 42 },
  cast: { hero: { pos: onRaft(), rotY: [[0, -0.05]], clips: idle(3), gestures: [{ type: 'wave', start: 0.1, end: dur('ship'), side: 'right' }], look: [[0, [-4, 3, 30]]], face: { shock: [[0, 0.3]], smile: [[0.3, 0.4]] } } },
  fx: [RAFT(), ...SUPPLIES, SHIP({ height: 9, p: [[0, [-3, -1, 30]], [dur('ship'), [0, -1, 30], 'linear']], rotY: P / 2 })] });
// 12 · "And keeps going."
S('going', { cut: 'zoom', set: SEA, look: 'cinematic',
  camera: { pos: [[0, [-0.7, 1.45, -3.3]]], look: [[0, [1.2, 1.7, 30]]], fov: 40, handheld: 0.3 },
  cast: { hero: { pos: onRaft(), rotY: [[0, -0.1]], clips: idle(3), gestures: [{ type: 'slump', start: 0.2, end: dur('going') }], look: [[0, [0, 3, 31]]], face: { sad: [[0, 0.3], [0.6, 1, 'outBack']] }, acting: 'none' } },
  fx: [RAFT(), ...SUPPLIES, SHIP({ height: 9, p: [[0, [-2, -1, 30]], [dur('going'), [2, -1, 32], 'linear']], rotY: P / 2 })] });
// 13 · "The food runs out."
S('out', { cut: 'dip', set: SEA, look: 'warm-film', punch: [0.45],
  camera: { move: 'push', target: 'hero', size: 'mls', az: -35, height: 0.4 },
  cast: { hero: { pos: onRaft(), rotY: [[0, P]], clips: kneel(3), reach: [{ hand: 'left', to: 'hero.belly', offset: [0.09, 0.03, 0.06], start: 0.1, end: dur('out') }], look: [[0, [0.55, DECK + 0.3, -0.75]]],
    face: { worried: [[0, 0.8]], sad: [[0.3, 0.7]] }, acting: 'none' } },
  fx: [RAFT(), { type: 'model', id: 'crate', color: '#94795a', flat: true, height: 0.42, p: [[0, [0.5, DECK, -0.68]]], rotY: 0.3, tilt: [[0, [0, 0, 0]], [0.4, [0, 0, 1.4], 'outBack']] }, { type: 'model', id: 'barrel', color: '#7a5a3c', flat: true, height: 0.55, p: [[0, [-0.6, DECK, -0.85]]] }],
  sfx: [{ t: 0.4, type: 'hit', gain: 0.6 }] });
// 14 · "He bends a flashlight wire into a hook."
S('hook', { cut: 'whip', set: SEA, look: 'warm-film',
  camera: { move: 'push', target: 'hero', size: 'ws', az: 30 },
  cast: { hero: { pos: onRaft(), rotY: [[0, 0]], clips: [{ clip: 'fix', start: 0, end: 3 }], hands: { both: 'pinch' }, face: { squint: [[0, 0.8]] } } },
  fx: [RAFT(), ...SUPPLIES], sfx: [{ t: 0.6, type: 'tick', gain: 0.6 }, { t: 1.2, type: 'tick', gain: 0.6 }] });
// 15 · "He drinks the rain."
S('rain', { set: SEA, look: 'cinematic',
  camera: { move: 'push', target: 'hero', size: 'mls', az: 15 },
  cast: { hero: { pos: onRaft(), rotY: [[0, 0]], clips: kneel(3), look: [[0, [0, 10, 3]]], bones: { head: [[0, [-0.45, 0, 0]]] }, face: { squint: [[0, 0.6]], smile: [[0.5, 0], [1, 0.4]] }, acting: 'none',
    reach: [{ hand: 'left', to: 'hero.chest', offset: [0.07, 0.04, 0.24], start: 0.1, end: dur('rain') }, { hand: 'right', to: 'hero.chest', offset: [-0.07, 0.04, 0.24], start: 0.1, end: dur('rain') }], hands: { both: 'soft' } } },
  fx: [RAFT(), ...SUPPLIES, { type: 'rain', count: 7000, opacity: 0.5 }] });
// 16 · "Day one hundred thirty-three."
S('day', { cut: 'dip', set: SEA, look: 'golden-hour', time: [[0, 0], [dur('day'), dur('day') * 0.6]],
  camera: { move: 'crane-up', target: 'hero', size: 'ws', az: -40, handheld: 0.4 },
  cast: { hero: { pos: onRaft(), rotY: [[0, 0]], clips: kneel(3), look: [[0, [0, 1, 8]], [1, [6, 1.2, 9], 'inOutSine']], face: { sad: [[0, 0.5]], squint: [[0, 0.7]] }, acting: 'none' } },
  fx: [RAFT(), ...SUPPLIES] });
// 17 · "Fishermen spot him off Brazil."
S('fisher', { cut: 'whip', set: SEA, look: 'golden-hour', punch: [0.5],
  camera: { pos: [[0, [0.2, 1.5, -1.6]], [dur('fisher'), [0.15, 1.45, -2.4], 'inOutSine']], look: [[0, [0.3, 1.2, -6.4]]], fov: 44, handheld: 0.6 },
  cast: { f1: { pos: [[0, [-0.3, 0.22, -6]]], rotY: [[0, P]], clips: idle(3), gestures: [{ type: 'point', start: 0.15, end: dur('fisher'), to: [0, 1, 0] }], look: [[0, [0, 0.8, 0]]], face: { shock: [[0, 0.8]] } },
    f2: { pos: [[0, [0.95, 0.22, -6.9]]], rotY: [[0, P]], clips: idle(3), gestures: [{ type: 'gasp', start: 0.3, end: dur('fisher') }], look: [[0, [0, 0.8, 0]]], face: { shock: [[0, 1]] } } },
  fx: [{ type: 'model', id: 'rowboat', color: '#6b5340', flat: true, height: 0.75, p: [[0, [0, -0.25, -6.3]]], rotY: 0 }] });
// 18 · "He walks off the raft. On his own." — Brazilian shore
S('walk', { cut: 'dip', set: SEA, look: 'cinematic', punch: [1.4],
  camera: { pos: [[0, [3.6, 1.5, 2.2]], [dur('walk'), [3.4, 1.55, 3.2], 'inOutSine']], look: [[0, [0, 1.0, 0.9]], [dur('walk'), [0, 1.1, 2.4], 'inOutSine']], fov: 46 },
  cast: { hero: { pos: [[0, [0, DECK, 0.3]], [0.9, [0, DECK, 1.2]], [1.3, [0, 0.05, 1.6], 'inOutSine'], [dur('walk'), [0, 0.05, 0.3 + 1.0 * dur('walk')]]], rotY: [[0, 0]], clips: [{ clip: 'walk', start: 0, end: 4, speed: 0.7 }], face: { smile: [[0.6, 0], [1.4, 0.5]] }, look: [[0, [0, 1.6, 8]]] },
    f1: { pos: [[0, [1.6, DECK + 0.05, 3.4]]], rotY: [[0, -2.6]], clips: idle(3), gestures: [{ type: 'clap', start: 0.6, end: dur('walk') }], look: [[0, 'hero']] } },
  fx: [RAFT(), { type: 'model', id: 'sand_patch', height: 0.3, p: [[0, [0, -0.25, 5.0]]] }, { type: 'model', id: 'palm', height: 5, p: [[0, [-2.3, DECK, 5.6]]], rotY: 0.8 },
    { type: 'model', id: 'beach_rocks', height: 0.6, p: [[0, [2.6, DECK, 5.4]]] }] });
// 19 · "Could you last 133 days?" — back to the opening image (loop)
S('question', { cut: 'zoom', set: SEA, look: 'cinematic',
  camera: { move: 'dolly-out', target: 'hero', size: 'ws', az: 35 },
  cast: { hero: { pos: onRaft(), rotY: [[0, 0]], clips: kneel(6), look: [[0, 'camera'], [1.6, [6, 1, 9], 'inOutSine']], face: { squint: [[0, 0.6]], worried: [[0, 0.5]] }, acting: 'none' } },
  fx: [RAFT(), ...SUPPLIES] });

// ---------- motion graphics ----------
const titles = [
  { t: 0.05, t1: at('record'), style: 'slam', text: '133 DAYS\nALONE AT SEA', pos: [0.5, 0.09], size: 0.095, accent: '#ffb020' },
  { t: at('record', 0.1), t1: at('year'), style: 'stamp', text: 'WORLD RECORD', sub: 'STILL UNBEATEN', pos: [0.5, 0.11], size: 0.08, accent: '#ff3b2f' },
  { t: at('year', 0.15), t1: at('torpedo'), style: 'place', text: 'SOUTH ATLANTIC', sub: 'NOVEMBER 23, 1942', pos: [0.08, 0.08] },
  { t: at('torpedo', 0.5), t1: at('sinks'), style: 'burst', text: 'TORPEDO!', pos: [0.5, 0.13], size: 0.11 },
  { t: at('sinks', 0.05), t1: at('jump', -0.1), style: 'countdown', from: 2, step: 0.5, text: 'GONE', pos: [0.5, 0.12] },
  { t: at('jump', 0.05), t1: at('swim', 0.25), style: 'wipe', text: 'POON LIM', sub: 'SHIP STEWARD · AGE 24', pos: [0.5, 0.12] },
  { t: at('swim', 0.75), t1: at('raft', -0.1), style: 'stamp', text: '2 HOURS', sub: 'IN THE WATER', pos: [0.5, 0.2], size: 0.07, accent: '#7fd0ff' },
  { t: at('raft', 0.6), t1: at('food'), style: 'callout', at: [0, DECK + 0.3, 0], text: 'LIFE RAFT', sub: '2.4 M SQUARE', icon: 'check', side: 1 },
  { t: at('food', 0.2), t1: at('worst'), style: 'stat', value: 50, max: 133, suffix: ' DAYS', text: 'FOOD + WATER', pos: [0.5, 0.13] },
  { t: at('worst', 0.1), t1: at('ship'), style: 'glitch', text: 'THE WORST PART', pos: [0.5, 0.12], size: 0.08 },
  { t: at('ship', 0.3), t1: at('going'), style: 'arrow', path: ['hero.righthand', [-1.5, 4, 30]], text: 'SHIP' },
  { t: at('going', 0.1), t1: at('out'), style: 'stamp', text: 'IGNORED', pos: [0.5, 0.12], size: 0.1, accent: '#ff3b2f' },
  { t: at('out', 0.45), t1: at('hook'), style: 'tag', text: 'FOOD: 0', pos: [0.5, 0.11], accent: '#ff3b2f' },
  { t: at('hook', 0.3), t1: at('rain'), style: 'callout', at: 'hero.righthand', text: 'FLASHLIGHT WIRE', sub: '→ FISH HOOK', icon: 'bolt', side: -1 },
  { t: at('rain', 0.2), t1: at('day'), style: 'icon', icon: 'drop', pos: [0.5, 0.07], text: 'RAINWATER' },
  { t: at('day', 0.1), t1: at('fisher'), style: 'slam', text: 'DAY 133', pos: [0.5, 0.11], size: 0.13, accent: '#ffe14d' },
  { t: at('fisher', 0.1), t1: at('walk'), style: 'place', text: 'COAST OF BRAZIL', sub: 'APRIL 5, 1943', pos: [0.08, 0.08] },
  { t: at('walk', 1.4), t1: at('question'), style: 'stamp', text: 'WALKED OFF ALONE', sub: 'LOST JUST 9 KG', pos: [0.5, 0.135], size: 0.06, accent: '#1fa84f' },
  { t: at('question', 0.1), t1: END, style: 'kinetic', text: 'COULD YOU|LAST|133 DAYS?', hi: ['133', 'DAYS?'], pos: [0.5, 0.09], size: 0.1 },
  { t: at('raft'), t1: at('question'), style: 'timeline', pos: [0.5, 0.045], marks: [{ t: at('raft'), text: 'DAY 1' }, { t: at('out'), text: 'DAY 50' }, { t: at('day'), text: 'DAY 133' }] },
];

module.exports = {
  title: '133 Days Alone', T, END,
  config: { targetDuration: END, set: SEA, look: 'cinematic', quality: 'good', effort: 'maximum', fps: 30,
    sound: { music: { mood: 'epic', bpm: 90, drops: [at('torpedo', 0.48), at('day', 0.05)] }, sfx: true, ambience: true, voice: { url: 'vo.wav' } },
    captions: { style: 'pop', sync: VO.words.map((w) => [w.w, w.start, w.end]) }, letterbox: 0 },
  thumbs: [
    { shot: 1, t: 0.6, text: '133 DAYS\nALONE', hi: ['ALONE'], accent: '#ffb020', face: { hero: { worried: 1, squint: 0.7, sad: 0.5 } }, size: 'cu', side: 'left' },
    { shot: 12, t: 0.8, text: 'THEY\nIGNORED\nHIM', hi: ['IGNORED'], accent: '#ff3b2f', side: 'right', shift: 0 },
    { shot: 0, t: 1.2, text: 'NO FOOD.\nNO LAND.', hi: ['LAND.'], accent: '#ffe14d', face: { hero: { worried: 1, squint: 0.8 } }, size: 'ms', side: 'left' },
  ],
  cast, shots, captions: [], titles,
};
