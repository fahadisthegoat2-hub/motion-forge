// "Day 3 at Sea" — a crazy short story (built into crazy-short.html by build.js). Cues come from the voiceover word times.
const fs = require('fs'), path = require('path');
const P = Math.PI;
const VO = JSON.parse(fs.readFileSync(path.join(__dirname, 'vo.json'), 'utf8'));
const CUES = [['payoff', 'three days'], ['nofood', 'no land'], ['d1', 'day one'], ['barrel1', 'a barrel'], ['d2', 'day two'], ['same', 'the same'], ['d3', 'day three'],
  ['again', 'that barrel'], ['wait', 'wait'], ['behind', 'behind you'], ['crew', 'the crew'], ['question', 'would you']];
const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9' -]/g, '');
const words = VO.words.map((w) => ({ w: norm(w.w), start: w.start }));
function findCue(ph, after) { const p = ph.split(' ');
  for (let i = 0; i < words.length; i++) if (words[i].start >= after - 0.05 && p.every((x, k) => words[i + k] && words[i + k].w === x)) return words[i].start;
  throw new Error('cue ' + ph); }
const T = {}; let last = 0;
for (const [id, ph] of CUES) { T[id] = id === 'payoff' ? 0 : Math.max(0, findCue(ph, last) - 0.1); last = T[id] + 0.1; }
const END = +(VO.duration + 0.7).toFixed(2);
const ids = CUES.map((c) => c[0]), dur = (id) => +((ids.indexOf(id) < ids.length - 1 ? T[ids[ids.indexOf(id) + 1]] : END) - T[id]).toFixed(3);
const at = (id, k = 0) => +(T[id] + k).toFixed(3);

const cast = {
  hero: { character: 'jake', wardrobe: { top: '#e8e2d2', bottom: '#2b3a55', shoes: '#1d1a17' } },
  c1: { character: 'marcus', wardrobe: { top: '#d9d4c8', bottom: '#2f3a44', shoes: '#2a2018' } },
  c2: { character: 'luis', wardrobe: { top: '#c9b48a', bottom: '#3b4a5a', shoes: '#2a2018' } },
};
const DECK = 0.2;
const SEA = { type: 'ocean', id: 'sea', swell: 0.9, calm: 5 };
const RAFT = (o = {}) => ({ type: 'model', id: 'raft', height: 0.38, color: '#7d6449', flat: true, p: [[0, [0, DECK - 0.38, 0]]], ...o });
const SHIP = (o = {}) => ({ type: 'model', id: 'cargo_ship', height: 10, rotY: P / 2, p: [[0, [6, -1.2, -13]]], ...o });
const BARREL = (from, to, d) => ({ type: 'model', id: 'barrel', height: 1.0, color: '#c8372d', flat: true, bob: 0.05, p: [[0, from], [d, to, 'linear']] });
const PADDLE = { type: 'model', id: 'paddle', height: 0.95, attach: 'hero.righthand', grip: true, rot: [0, 0, -1.57] };
const kneel = (d) => [{ clip: 'kneel', start: -2, end: d + 1, loop: false }];
const onRaft = [[0, [0, DECK, 0]]];
// paddle strokes: lean + right-arm sweep, every `per` seconds
const stroke = (d, per = 0.8, amp = 0.28) => {
  const sp = [], ra = [];
  for (let t = 0; t < d; t += per) { sp.push([t, [0.1, 0, 0], 'inOutSine'], [t + per * 0.5, [0.1 + amp, 0, 0], 'inOutSine']); ra.push([t, [-0.2, 0, -0.5], 'inOutSine'], [t + per * 0.5, [0.5, 0, -0.9], 'inOutSine']); }
  return { spine: sp, rightarm: ra };
};
const shots = [];
const S = (id, o) => shots.push({ name: id, dur: dur(id), ...o });

// 1 · PAYOFF — Jake on the raft, a huge cargo ship right behind him (he doesn't know)
S('payoff', { role: 'payoff', set: SEA, look: 'cinematic', punch: [0.06],
  camera: { move: 'crash-zoom', target: 'hero', size: 'mls', at: 0.05, az: 14, height: 0.2, handheld: 0.9 },
  cast: { hero: { pos: onRaft, rotY: [[0, 0]], clips: kneel(2), look: [[0, [5, 1.2, 9]], [1.1, [-5, 1.2, 9], 'inOutSine']], face: { squint: [[0, 0.7]], worried: [[0, 0.5]] }, acting: 'none' } },
  fx: [RAFT(), SHIP({ p: [[0, [0, -1.2, -9]]] })], sfx: [{ t: 0, type: 'impact', gain: 1 }, { t: 0.05, type: 'whoosh', gain: 0.7 }] });
// 2 · "No land. No food."
S('nofood', { cut: 'zoom', set: SEA, look: 'warm-film',
  camera: { move: 'push', target: 'hero', size: 'mcu', az: -22, handheld: 0.7 },
  cast: { hero: { pos: onRaft, rotY: [[0, 0]], clips: kneel(2), look: [[0, [-4, 1.4, 8]], [0.9, [4, 1.4, 8], 'inOutSine']], face: { sad: [[0, 0.3], [0.8, 0.7]], squint: [[0, 0.6]] }, acting: 'none' } },
  fx: [RAFT()] });
// 3 · "Day one. You paddle east."
S('d1', { cut: 'whip', set: SEA, look: 'warm-film',
  camera: { move: 'orbit', target: 'hero', size: 'ws', az: 75, span: 24, handheld: 0.6 },
  cast: { hero: { pos: onRaft, rotY: [[0, 0]], clips: kneel(2), bones: stroke(dur('d1')), look: [[0, [0, 1.2, 9]]], face: { worried: [[0, 0.4]] }, acting: 'none' } },
  fx: [RAFT(), PADDLE] });
// 4 · "A barrel floats past." (clue #1)
S('barrel1', { cut: 'whip', set: SEA, look: 'warm-film',
  camera: { move: 'push', target: 'hero', size: 'ws', az: 40, handheld: 0.7 },
  cast: { hero: { pos: onRaft, rotY: [[0, 0]], clips: kneel(2), look: [[0, [1.4, 0.3, -2.3]], [dur('barrel1'), [-1.4, 0.3, -2.3], 'inOutSine']], face: { squint: [[0, 0.5]], worried: [[0.4, 0.3]] }, acting: 'none' } },
  fx: [RAFT(), BARREL([1.4, 0, -2.3], [-1.4, 0, -2.3], dur('barrel1'))] });
// 5 · "Day two. You paddle harder."
S('d2', { cut: 'whip', set: SEA, look: 'warm-film',
  camera: { move: 'low-hero', target: 'hero', size: 'ws', az: -75, handheld: 0.7 },
  cast: { hero: { pos: onRaft, rotY: [[0, 0]], clips: kneel(2), bones: stroke(dur('d2'), 0.62, 0.34), look: [[0, [0, 1.2, 9]]], face: { angry: [[0, 0.3]], squint: [[0, 0.5]] }, acting: 'none' } },
  fx: [RAFT(), PADDLE] });
// 6 · "The same barrel." (clue #2)
S('same', { cut: 'zoom', set: SEA, look: 'warm-film',
  camera: { move: 'push', target: 'hero', size: 'ws', az: 40, handheld: 0.7 },
  cast: { hero: { pos: onRaft, rotY: [[0, 0]], clips: kneel(2), look: [[0, [1.4, 0.3, -2.3]], [dur('same'), [-1.4, 0.3, -2.3], 'inOutSine']], face: { squint: [[0, 0.7]], worried: [[0.3, 0.5]] }, acting: 'none' } },
  fx: [RAFT(), BARREL([1.4, 0, -2.3], [-1.4, 0, -2.3], dur('same'))] });
// 7 · "Day three. You paddle faster."
S('d3', { cut: 'whip', set: SEA, look: 'warm-film',
  camera: { move: 'orbit', target: 'hero', size: 'ws', az: 60, span: 40, handheld: 0.8 },
  cast: { hero: { pos: onRaft, rotY: [[0, 0]], clips: kneel(2), bones: stroke(dur('d3'), 0.5, 0.4), look: [[0, [0, 1.2, 9]]], face: { angry: [[0, 0.5]], squint: [[0, 0.7]] }, acting: 'none' } },
  fx: [RAFT(), PADDLE] });
// 8 · "That barrel again." (clue #3)
S('again', { cut: 'smash', set: SEA, look: 'warm-film', punch: [0.15],
  camera: { move: 'crash-zoom', target: 'hero', size: 'mls', at: 0.1, az: 40, handheld: 0.9 },
  cast: { hero: { pos: onRaft, rotY: [[0, 0]], clips: kneel(2), look: [[0, [1.4, 0.3, -2.3]], [dur('again'), [-1.4, 0.3, -2.3], 'inOutSine']], face: { shock: [[0, 0.2], [0.3, 0.9, 'outBack']] }, acting: 'none' } },
  fx: [RAFT(), BARREL([1.4, 0, -2.3], [-1.4, 0, -2.3], dur('again'))], sfx: [{ t: 0.1, type: 'subdrop', gain: 0.8 }] });
// 9 · "Wait." — eyes narrow, dread
S('wait', { cut: 'dip', set: SEA, look: 'cinematic',
  camera: { move: 'push', target: 'hero', size: 'cu', az: 5, handheld: 0.4 },
  cast: { hero: { pos: onRaft, rotY: [[0, 0]], clips: kneel(2), look: [[0, 'camera']], face: { squint: [[0, 0.3], [0.5, 1]], worried: [[0, 0.4]] }, acting: 'none' } },
  fx: [RAFT()], sfx: [{ t: 0.05, type: 'heartbeat', gain: 0.8 }] });
// 10 · "Behind you. A cargo ship." — he whips around: the ship, the crew in a rowboat
S('behind', { cut: 'smash', set: SEA, look: 'cinematic', punch: [0.5],
  camera: { move: 'dolly-in', target: 'hero', size: 'ews', az: 170, height: 0.5, handheld: 0.9 },
  cast: { hero: { pos: onRaft, rotY: [[0, 0], [0.45, P, 'outBack']], clips: kneel(2), look: [[0, [0, 1.2, 9]], [0.5, [3, 3, -10], 'outCubic']], face: { shock: [[0.4, 0], [0.7, 1, 'outBack']] }, acting: 'none' } },
  fx: [RAFT(), SHIP({ p: [[0, [0, -1.2, -13]]] })], sfx: [{ t: 0.5, type: 'boom', gain: 0.9 }] });
// 11 · "The crew waved for three days." — bored crew in a rowboat beside the raft
S('crew', { cut: 'whip', set: SEA, look: 'warm-film',
  camera: { move: 'push', target: 'c1', size: 'ws', az: 20, with: [2.6, 0.6, -1.6], handheld: 0.6 },
  cast: { c1: { pos: [[0, [1.5, 0.12, -1.6]]], rotY: [[0, P / 2 + 0.5]], clips: [{ clip: 'sitdown', start: -2, end: 4, loop: false }], gestures: [{ type: 'wave', start: 0.2, end: dur('crew') }], look: [[0, [0, 1.2, 0.5]]], face: { smile: [[0, 0.4]], squint: [[0, 0.3]] } },
    c2: { pos: [[0, [2.6, 0.12, -1.6]]], rotY: [[0, P / 2 + 0.5]], clips: [{ clip: 'sitdown', start: -2, end: 4, loop: false }], look: [[0, [0, 1.2, 0.5]]], face: { smirk: [[0, 0.6]] } },
    hero: { pos: onRaft, rotY: [[0, P]], clips: kneel(2), look: [[0, [2.2, 1.2, -1.2]]], face: { shock: [[0, 0.8]] }, acting: 'none' } },
  fx: [RAFT(), { type: 'model', id: 'rowboat', height: 0.64, p: [[0, [2.1, 0, -1.6]]], rotY: P / 2 + 0.5 }, SHIP({ p: [[0, [3, -1.2, -14]]] })] });
// 12 · "Would you have looked back?" — facepalm, loop
S('question', { cut: 'dip', set: SEA, look: 'warm-film',
  camera: { move: 'dolly-out', target: 'hero', size: 'mcu', az: 15, handheld: 0.5 },
  cast: { hero: { pos: onRaft, rotY: [[0, P]], clips: kneel(2), gestures: [{ type: 'facepalm', start: 0.4, end: dur('question') }], look: [[0, [3, 3, -10]]], face: { sad: [[0.3, 0], [0.8, 0.8]] }, acting: 'none' } },
  fx: [RAFT(), SHIP({ p: [[0, [3, -1.2, -12]]] })] });

const titles = [
  { t: 0.05, t1: at('nofood', -0.25), style: 'slam', text: '3 DAYS\nLOST AT SEA', pos: [0.5, 0.075], size: 0.07 },
  { t: at('nofood', 0.1), t1: at('d1', -0.25), style: 'stamp', text: 'NO FOOD', pos: [0.5, 0.12], size: 0.08, accent: '#ff3b2f' },
  { t: at('d1', 0.1), t1: at('barrel1', -0.25), style: 'chapter', text: 'PADDLE EAST', sub: 'DAY 1', pos: [0.5, 0.11] },
  { t: at('barrel1', 0.45), t1: at('d2', -0.25), style: 'stamp', text: 'BARREL #1', pos: [0.5, 0.12], size: 0.08, accent: '#c8372d' },
  { t: at('d2', 0.1), t1: at('same', -0.25), style: 'chapter', text: 'PADDLE HARDER', sub: 'DAY 2', pos: [0.5, 0.11] },
  { t: at('same', 0.4), t1: at('d3', -0.25), style: 'stamp', text: 'BARREL #2', pos: [0.5, 0.12], size: 0.08, accent: '#c8372d' },
  { t: at('d3', 0.1), t1: at('again', -0.25), style: 'chapter', text: 'PADDLE FASTER', sub: 'DAY 3', pos: [0.5, 0.11] },
  { t: at('again', 0.3), t1: at('wait', -0.25), style: 'stamp', text: 'BARREL #3', pos: [0.5, 0.065], size: 0.06, accent: '#c8372d' },
  { t: at('crew', 0.15), t1: at('question'), style: 'counter', from: 0, to: 72, suffix: ' HRS', sub: 'CREW WAVING', pos: [0.5, 0.07], size: 0.07, dur: 1.5 },
  { t: at('question', 0.1), t1: END, style: 'kinetic', text: 'WOULD YOU|HAVE LOOKED|BACK?', hi: ['BACK?'], pos: [0.5, 0.13], size: 0.1 },
];

module.exports = {
  title: 'Day 3 at Sea', T, END,
  config: { targetDuration: +END.toFixed(2), set: SEA, look: 'warm-film', quality: 'good', effort: 'high', fps: 30, accent: '#ff5a3c',
    sound: { music: { mood: 'tension', bpm: 96, drops: [at('behind', 0.45)] }, sfx: true, ambience: true, voice: { url: 'vo.wav' } },
    captions: { style: 'pop', sync: VO.words.map((w) => [w.w, w.start, w.end]) }, letterbox: 0 },
  thumbs: [{ shot: 9, t: 0.8, text: 'DAY 3\nLOST AT SEA', hi: ['SEA'], accent: '#ff5a3c', face: { hero: { shock: 1 } }, size: 'mcu', side: 'left' }],
  cast, shots, captions: [], titles,
};
