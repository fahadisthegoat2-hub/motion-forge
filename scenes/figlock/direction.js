// "Twice" — Joseph Figlock (true story, Detroit 1937/1938; Time, Oct 17 1938). Shot starts from VO word times.
const fs = require('fs'), path = require('path');
const P = Math.PI;
const VO = JSON.parse(fs.readFileSync(path.join(__dirname, 'vo.json'), 'utf8'));
const CUES = [['hook', 'a baby'], ['hook2', 'onto this'], ['twice', 'twice'], ['detroit', 'detroit'], ['walks', 'street sweeper'], ['window', 'four floors up'], ['lands', 'it lands'],
  ['survive', 'both survive'], ['later', 'one year'], ['working', 'joseph is'], ['another', 'another window'], ['david', 'two-year-old'], ['lands2', 'lands on'],
  ['survive2', 'both survive'], ['question', 'would you']];
const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9' -]/g, '');
const words = VO.words.map((w) => ({ w: norm(w.w), start: w.start }));
function findCue(ph, after) { const p = ph.split(' ');
  for (let i = 0; i < words.length; i++) if (words[i].start >= after - 0.05 && p.every((x, k) => words[i + k] && words[i + k].w === x)) return words[i].start;
  throw new Error('cue ' + ph); }
const T = {}; let last = 0;
for (const [id, ph] of CUES) { T[id] = id === 'hook' ? 0 : Math.max(0, findCue(ph, last) - 0.1); last = T[id] + 0.1; }
const END = +(VO.duration + 0.6).toFixed(2);
const ids = CUES.map((c) => c[0]), dur = (id) => +((ids.indexOf(id) < ids.length - 1 ? T[ids[ids.indexOf(id) + 1]] : END) - T[id]).toFixed(3);
const at = (id, k = 0) => +(T[id] + k).toFixed(3);

// ---------- cast ----------
const cast = {
  hero: { character: 'jake', wardrobe: { top: '#8a8f86', bottom: '#2e3138', shoes: '#1d1a17' }, hair: '#2a1b12' },   // street sweeper: grey work shirt
  baby: { character: 'tot', wardrobe: { top: '#ece6d6', bottom: '#7d93b0' } },                                        // 1937 baby
  kid: { character: 'tot', wardrobe: { top: '#b8432f', bottom: '#3a4660' }, hair: '#4a2c16' },                       // David Thomas, 1938
};
const W = 0.15, X = 8.15;                     // sidewalk top · Joseph's lane (facade at x = 9)
const STREET = { type: 'city-day' };
const walkZ = (z0, d, v = 1.25) => [[0, [X, W, z0]], [d, [X, W, z0 + v * d], 'linear']];
const walk = (d, s = 0.85) => [{ clip: 'walk', start: 0, end: d + 1, speed: s }];
const idle = (d) => [{ clip: 'idle', start: 0, end: d + 1 }];
const kneel = (d) => [{ clip: 'kneel', start: -2, end: d + 1, loop: false }];
const tumble = (d, n = 1.6) => [[0, 0.3], [d, 0.3 + n, 'linear']];

const shots = [];
const S = (id, o) => shots.push({ name: id, dur: dur(id), ...o });

// 1 · HOOK — from the pavement, looking up: a baby tumbling down toward him
S('hook', { role: 'payoff', set: STREET, look: 'warm-film',
  camera: { pos: [[0, [5.6, 0.7, 3.9]], [dur('hook'), [5.9, 0.7, 3.4], 'inOutSine']], look: [[0, [X, 3.5, 0.3]], [dur('hook'), [X, 3.2, 0.3], 'inOutSine']], fov: 50, handheld: 0.9 },
  cast: { hero: { pos: [[0, [X, W, 0.3]]], rotY: [[0, -0.5]], clips: idle(3), look: [[0, [X + 0.3, 6, 0.3]]], bones: { head: [[0, [-0.35, 0, 0]]] },
      gestures: [{ type: 'shield', start: 0.6, end: dur('hook') }], face: { shock: [[0, 0.5], [0.5, 1, 'outBack']] }, acting: 'none' },
    baby: { pos: [[0, [X + 0.2, 4.7, 0.3]], [dur('hook'), [X + 0.15, 4.05, 0.3], 'inQuad']], rotY: [[0, -P / 2]], rotX: tumble(dur('hook'), 1.2), clips: idle(3),
      gestures: [{ type: 'armsout', start: 0, end: dur('hook') }], face: { shock: [[0, 0.8]] }, acting: 'none' } },
  sfx: [{ t: 0, type: 'impact', gain: 0.9 }, { t: 0.1, type: 'whoosh', gain: 0.7 }] });
// 1b · "…onto this man." — he throws his arms up; freeze before contact
S('hook2', { cut: 'smash', set: STREET, look: 'warm-film', freeze: [[dur('hook2') - 0.4, 0.3]], punch: [0.1],
  camera: { pos: [[0, [6.3, 1.1, 2.7]], [dur('hook2'), [6.5, 1.15, 2.4], 'inOutSine']], look: [[0, [X, 2.7, 0.3]]], fov: 50, handheld: 0.9 },
  cast: { hero: { pos: [[0, [X, W, 0.3]]], rotY: [[0, -0.4]], clips: idle(3), look: [[0, [X + 0.2, 5, 0.3]]], gestures: [{ type: 'handsup', start: 0, end: dur('hook2') }], face: { shock: [[0, 1]] }, acting: 'none' },
    baby: { pos: [[0, [X + 0.15, 4.0, 0.3]], [dur('hook2'), [X + 0.12, 2.9, 0.3], 'inQuad']], rotY: [[0, -P / 2]], rotX: [[0, 1.3], [dur('hook2'), 1.7, 'linear']], clips: idle(3),
      gestures: [{ type: 'armsout', start: 0, end: dur('hook2') }], face: { shock: [[0, 1]] }, acting: 'none' } },
  sfx: [{ t: 0, type: 'whoosh', gain: 0.6 }] });
// 2 · "Twice."
S('twice', { cut: 'smash', set: STREET, look: 'warm-film', punch: [0.15],
  camera: { move: 'push', target: 'hero', size: 'cu', az: -12 },
  cast: { hero: { pos: [[0, [X, W, 0.3]]], rotY: [[0, -0.5]], clips: idle(2), look: [[0, [X + 0.3, 3.6, 1.6]]], face: { shock: [[0, 1]] }, acting: 'none' } } });
// 3 · "Detroit, 1937." — wide street, crane down
S('detroit', { cut: 'dip', set: STREET, look: 'warm-film',
  camera: { pos: [[0, [5.6, 4.5, 7]], [dur('detroit'), [5.8, 2.4, 6], 'inOutSine']], look: [[0, [X, 1.2, -5.5]]], fov: 42 },
  cast: { hero: { pos: walkZ(-7, dur('detroit')), rotY: [[0, 0]], clips: walk(dur('detroit')), look: [[0, [X - 1, 1.6, 4]]] } } });
// 4 · "Street sweeper Joseph Figlock walks his alley."
S('walks', { set: STREET, look: 'warm-film',
  camera: { move: 'track', target: 'hero', size: 'ms', side: 'left' },
  cast: { hero: { pos: walkZ(-4.4, dur('walks')), rotY: [[0, 0]], clips: walk(dur('walks')), look: [[0, [X - 2, 1.5, 3]], [1.4, [X - 0.5, 1.6, 6], 'inOutSine']], face: { smile: [[0.4, 0.3]] } } } });
// 5 · "Four floors up, a baby slips from a window."
S('window', { cut: 'whip', set: STREET, look: 'warm-film',
  camera: { pos: [[0, [3.4, 1.6, -6.5]], [dur('window'), [3.6, 1.7, -6.0], 'inOutSine']], look: [[0, [8.6, 10.6, 0.3]], [dur('window'), [8.4, 8.8, 0.3], 'inOutSine']], fov: 34, handheld: 0.5 },
  cast: { baby: { pos: [[0, [8.75, 11.2, 0.3]], [0.9, [8.45, 11.0, 0.3], 'inOutSine'], [dur('window'), [8.35, 8.4, 0.3], 'inCubic']], rotY: [[0, -P / 2]],
      rotX: [[0, 0], [0.9, 0.5, 'inSine'], [dur('window'), 1.9, 'linear']], clips: idle(3), gestures: [{ type: 'armsout', start: 0.9, end: dur('window') }], face: { shock: [[0.7, 0], [1.0, 1]] }, acting: 'none' } },
  sfx: [{ t: 1.0, type: 'whoosh', gain: 0.6 }] });
// 6 · "It lands right on him." — freeze on contact
S('lands', { cut: 'smash', set: STREET, look: 'warm-film', freeze: [[0.55, 0.6]], punch: [0.55],
  camera: { pos: [[0, [6.3, 1.0, -1.6]]], look: [[0, [X, 2.0, 0.3]]], fov: 46, handheld: 1.0, shakes: [0.55] },
  cast: { hero: { pos: [[0, [X, W, 0.3]]], rotY: [[0, -0.4]], clips: idle(3), look: [[0, [X - 1, 1.6, 3]], [0.15, [X + 0.2, 5, 0.3], 'outCubic']],
      gestures: [{ type: 'handsup', start: 0.25, end: dur('lands') }], face: { shock: [[0.15, 0], [0.35, 1, 'outBack']] }, acting: 'none' },
    baby: { pos: [[0, [X + 0.15, 4.6, 0.3]], [0.55, [X + 0.1, 2.25, 0.3], 'inQuad']], rotY: [[0, -P / 2]], rotX: [[0, 1.2], [0.55, 1.75, 'linear']], clips: idle(3),
      gestures: [{ type: 'armsout', start: 0, end: dur('lands') }], face: { shock: [[0, 1]] }, acting: 'none' } },
  sfx: [{ t: 0.55, type: 'impact', gain: 1 }] });
// 7 · "Both survive." — dazed on the pavement, the baby beside him
S('survive', { cut: 'whip', set: STREET, look: 'warm-film',
  camera: { pos: [[0, [5.4, 1.3, 2.9]], [dur('survive'), [5.7, 1.2, 2.6], 'inOutSine']], look: [[0, [X - 0.3, 0.75, 0.6]]], fov: 44 },
  cast: { hero: { pos: [[0, [X, W, 0.3]]], rotY: [[0, -0.6]], clips: kneel(2), gestures: [{ type: 'headhold', start: 0.1, end: dur('survive'), side: 'right' }], look: [[0, 'baby']], face: { squint: [[0, 0.7]], smile: [[0.6, 0], [1.1, 0.35]] }, acting: 'none' },
    baby: { pos: [[0, [X - 0.55, W, 1.0]]], rotY: [[0, P - 0.5]], clips: idle(2), look: [[0, 'hero']], face: { smile: [[0.3, 0.6]] } } } });
// 8 · "One year later."
S('later', { cut: 'blur', set: STREET, look: 'golden-hour',
  camera: { move: 'overhead', target: 'hero', size: 'ews' },
  cast: { hero: { pos: walkZ(-3, dur('later')), rotY: [[0, 0]], clips: walk(dur('later')) } } });
// 9 · "Joseph is working again."
S('working', { cut: 'whip', set: STREET, look: 'golden-hour',
  camera: { move: 'track', target: 'hero', size: 'mls', side: 'right' },
  cast: { hero: { pos: walkZ(-1.6, dur('working')), rotY: [[0, 0]], clips: walk(dur('working')), look: [[0, [X - 1.5, 1.6, 6]]], face: { smile: [[0, 0.4]] } } } });
// 10 · "Another window. Another toddler."
S('another', { set: STREET, look: 'golden-hour',
  camera: { pos: [[0, [4.0, 1.5, 6.5]], [dur('another'), [3.9, 1.6, 6.0], 'inOutSine']], look: [[0, [8.6, 10.2, 1.2]], [dur('another'), [8.6, 10.35, 1.2]]], fov: 20, handheld: 0.5 },
  cast: { kid: { pos: [[0, [8.85, 10.25, 1.2]], [dur('another'), [8.7, 10.25, 1.2], 'inOutSine']], rotY: [[0, -P / 2]], rotX: [[0, 0], [dur('another'), 0.35, 'inSine']], clips: idle(3),
      look: [[0, [4, 0, 1.2]]], face: { smile: [[0, 0.4]], shock: [[1.3, 0], [1.8, 0.8]] }, acting: 'none' } } });
// 11 · "Two-year-old David Thomas." — he tips out and falls
S('david', { cut: 'zoom', set: STREET, look: 'golden-hour',
  camera: { pos: [[0, [5.6, 10.5, -1.5]], [dur('david'), [5.8, 5.4, -1.2], 'inCubic']], look: [[0, [8.5, 11.4, 1.2]], [dur('david'), [8.4, 6.0, 1.2], 'inCubic']], fov: 40, handheld: 0.7 },
  cast: { kid: { pos: [[0, [8.7, 10.25, 1.2]], [dur('david'), [8.4, 5.4, 1.2], 'inCubic']], rotY: [[0, -P / 2]], rotX: [[0, 0.35], [dur('david'), 2.2, 'inSine']], clips: idle(3),
      gestures: [{ type: 'armsout', start: 0, end: dur('david') }], face: { shock: [[0, 1]] }, acting: 'none' } },
  sfx: [{ t: 0.1, type: 'whoosh', gain: 0.7 }] });
// 12 · "Lands on Joseph. Again."
S('lands2', { cut: 'smash', set: STREET, look: 'golden-hour', freeze: [[0.5, 0.5]], punch: [0.5, 1.45],
  camera: { pos: [[0, [10.2, 1.1, 3.4]]], look: [[0, [X, 1.9, 1.2]]], fov: 46, handheld: 1.0, shakes: [0.5] },
  cast: { hero: { pos: [[0, [X, W, 1.2]]], rotY: [[0, P / 2 + 2.2]], clips: idle(3), look: [[0, [X, 1.6, 4]], [0.12, [X + 0.2, 5, 1.2], 'outCubic']],
      gestures: [{ type: 'handsup', start: 0.2, end: dur('lands2') }], face: { shock: [[0.12, 0], [0.3, 1, 'outBack']] }, acting: 'none' },
    kid: { pos: [[0, [X + 0.1, 4.3, 1.2]], [0.5, [X + 0.05, 2.25, 1.2], 'inQuad']], rotY: [[0, -P / 2]], rotX: [[0, 1.3], [0.5, 1.8, 'linear']], clips: idle(3),
      gestures: [{ type: 'armsout', start: 0, end: dur('lands2') }], face: { shock: [[0, 1]] }, acting: 'none' } },
  sfx: [{ t: 0.5, type: 'impact', gain: 1 }] });
// 13 · "Both survive. Again."
S('survive2', { cut: 'whip', set: STREET, look: 'warm-film',
  camera: { pos: [[0, [5.4, 1.3, 4.0]], [dur('survive2'), [5.7, 1.2, 3.7], 'inOutSine']], look: [[0, [X - 0.3, 0.75, 1.5]]], fov: 44 },
  cast: { hero: { pos: [[0, [X, W, 1.2]]], rotY: [[0, -1.0]], clips: kneel(2), gestures: [{ type: 'shrug', start: 0.9, end: dur('survive2') }], look: [[0, 'kid']], face: { squint: [[0, 0.6]], sad: [[0.9, 0.4]] }, acting: 'none' },
    kid: { pos: [[0, [X - 0.95, W, 1.5]]], rotY: [[0, -P / 2 + 0.3]], clips: idle(2), look: [[0, 'hero']], face: { smile: [[0.2, 0.7]] } } } });
// 14 · "Would you ever look up?" — back to the opening angle (loop)
S('question', { cut: 'zoom', set: STREET, look: 'warm-film',
  camera: { move: 'low-hero', target: 'hero', size: 'ms', az: 20 },
  cast: { hero: { pos: [[0, [X, W, 0.3]]], rotY: [[0, -0.4]], clips: idle(3), look: [[0, [X - 1.5, 1.6, 4]], [0.6, [X + 0.3, 6, 0.3], 'inOutSine']], face: { worried: [[0.5, 0], [1, 0.8]] }, acting: 'none' } } });

// ---------- motion graphics (one accent, 5 styles) ----------
const A = '#ffc531';
const titles = [
  { t: 0.05, t1: at('twice'), style: 'slam', text: 'A BABY FELL\nON THIS MAN', pos: [0.5, 0.09], size: 0.09, accent: A },
  { t: at('twice', 0.08), t1: at('detroit', -0.2), style: 'slam', text: 'TWICE.', pos: [0.5, 0.11], size: 0.14, accent: A },
  { t: at('detroit', 0.15), t1: at('walks'), style: 'place', text: 'DETROIT', sub: '1937', pos: [0.08, 0.08], size: 0.18 },
  { t: at('walks', 0.9), t1: at('window'), style: 'wipe', text: 'JOSEPH FIGLOCK', sub: 'STREET SWEEPER', pos: [0.5, 0.12] },
  { t: at('window', 0.2), t1: at('lands'), style: 'stamp', text: '4TH FLOOR', pos: [0.5, 0.12], size: 0.08, accent: A },
  { t: at('survive', 0.1), t1: at('later', -0.3), style: 'stamp', text: 'BOTH SURVIVE', pos: [0.5, 0.12], size: 0.07, accent: A },
  { t: at('later', 0.1), t1: at('working'), style: 'place', text: 'ONE YEAR LATER', sub: '1938', pos: [0.08, 0.08], size: 0.13 },
  { t: at('another', 0.2), t1: at('david'), style: 'stamp', text: '4TH FLOOR', sub: 'AGAIN', pos: [0.5, 0.12], size: 0.08, accent: A },
  { t: at('david', 0.25), t1: at('lands2'), style: 'wipe', text: 'DAVID THOMAS', sub: 'AGE 2', pos: [0.5, 0.12] },
  { t: at('lands2', 1.4), t1: at('survive2'), style: 'slam', text: 'AGAIN.', pos: [0.5, 0.11], size: 0.14, accent: A },
  { t: at('survive2', 0.1), t1: at('question', -0.3), style: 'stamp', text: 'BOTH SURVIVE', sub: 'AGAIN', pos: [0.5, 0.12], size: 0.07, accent: A },
  { t: at('question', 0.1), t1: END, style: 'kinetic', text: 'WOULD YOU|EVER|LOOK UP?', hi: ['LOOK', 'UP?'], pos: [0.5, 0.09], size: 0.1 },
];

module.exports = {
  title: 'Twice', T, END,
  config: { targetDuration: END, set: STREET, look: 'warm-film', quality: 'good', effort: 'high', fps: 30, accent: A,
    sound: { music: { mood: 'tension', bpm: 96, drops: [at('lands', 0.55), at('lands2', 0.5)] }, sfx: true, ambience: true, voice: { url: 'vo.wav' } },
    captions: { style: 'pop', sync: VO.words.map((w) => [w.w, w.start, w.end]) }, letterbox: 0 },
  thumbs: [
    { shot: 0, t: 1.8, text: 'A BABY\nFELL ON HIM', hi: ['TWICE'], accent: A, side: 'left' },
    { shot: 1, t: 0.6, text: 'TWICE?!', hi: ['TWICE?!'], accent: A, face: { hero: { shock: 1 } }, size: 'cu', side: 'right' },
    { shot: 11, t: 0.5, text: 'AGAIN.', hi: ['AGAIN.'], accent: A, side: 'left' },
  ],
  cast, shots, captions: [], titles,
};
