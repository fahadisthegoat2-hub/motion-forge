// "DON'T PRESS IT" — direction (built by build.js). Shot starts come from the voiceover words.
const fs = require('fs'), path = require('path');
const P = Math.PI;
let VO = null; try { VO = JSON.parse(fs.readFileSync(path.join(__dirname, 'vo.json'), 'utf8')); } catch {}
const CUES = [
  ['hook', 'never press', 0], ['pressed', 'jake pressed', 1.74], ['mistake', 'big mistake', 2.95], ['shook', 'the lab', 4.13], ['vanished', 'the floor', 4.9],
  ['gravity', 'gravity quit', 6.05], ['space', "now hes", 7.28], ['air', 'thirty seconds', 9.12], ['quiet', 'no sound', 10.65], ['sees', 'then he', 12.35],
  ['another', 'another red', 13.63], ['dont', 'everything says', 15.15], ['nobody', 'nobody tells', 16.6], ['presses', 'jake presses', 18.75], ['boom', 'boom', 19.8],
  ['back', 'back in', 20.56], ['again', 'and there', 22.2], ['question', 'would you', 23.7],
];
const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9 ]/g, '');
const words = VO ? VO.words.map((w) => ({ w: norm(w.w), start: w.start })) : null;
function findCue(phrase, after) { const p = phrase.split(' '); for (let i = 0; i < words.length; i++) if (words[i].start >= after - 0.05 && p.every((x, k) => words[i + k] && words[i + k].w === x)) return words[i].start; return null; }
const T = {}; let last = 0;
for (const [id, ph, est] of CUES) { const t = words ? findCue(ph, last) : null; T[id] = id === 'hook' ? 0 : (t != null ? Math.max(0, t - 0.08) : est); last = T[id]; }
const END = VO ? VO.duration + 0.7 : 26;
const ids = CUES.map((c) => c[0]), dur = (id) => +((ids.indexOf(id) < ids.length - 1 ? T[ids[ids.indexOf(id) + 1]] : END) - T[id]).toFixed(3);
const at = (id, k = 0) => +(T[id] + k).toFixed(3);

const ACC = '#ff2d2d';
const cast = { hero: { character: 'jake', wardrobe: { top: '#eef1f5', bottom: '#2b3a55', shoes: '#f4f4f2' } } };   // lab coat vibe
const BTN = (o = {}) => ({ type: 'model', id: 'red_button', pos: [0, 0, 0], height: 1.17, solid: false, ...o });
const idle = (d) => [{ clip: 'idle', start: 0, end: d }];
// layout: button at the origin, Jake 0.62 m to its left, facing it (+x). Cameras sit in front (+z) and see both.
const HP = [-0.62, 0, 0], HR = P / 2, HOVER = [-0.12, 1.4, 0], PRESS = [-0.12, 1.2, 0];
const cam = (a, b, la, lb, fov, d, lock) => ({ pos: [[0, a], [d, b, 'inOutSine']], look: [[0, la], [d, lb, 'inOutSine']], fov, ...(lock ? { lock: true } : {}) });
const shots = [];
const S = (id, o) => shots.push({ name: id, dur: dur(id), ...o });
const hero0 = (d, extra = {}) => ({ pos: [[0, HP]], rotY: [[0, HR]], clips: idle(d), acting: 'none', ...extra });

S('hook', { role: 'payoff', set: 'lab', look: 'cinematic', punch: [0.1], impact: [0.05],
  camera: cam([0.5, 1.5, 4.0], [0.2, 1.5, 3.1], [-0.3, 1.25, 0], [-0.3, 1.35, 0], 38, dur('hook')),
  cast: { hero: hero0(2, { reach: [{ hand: 'right', to: HOVER, start: 0, end: dur('hook') }], hands: { right: 'point' }, look: [[0, [0, 1.2, 0]]], face: { squint: [[0, 0.5]], smirk: [[0.3, 0.2]] } }) },
  fx: [BTN({ pulse: 0.03 })], sfx: [{ t: 0.05, type: 'impact', gain: 1 }] });
S('pressed', { cut: 'zoom', set: 'lab', look: 'cinematic', punch: [0.55],
  camera: cam([-0.05, 1.55, 2.7], [-0.15, 1.5, 2.0], [-0.25, 1.4, 0], [-0.2, 1.38, 0], 40, dur('pressed')),
  cast: { hero: hero0(2, { reach: [{ hand: 'right', to: HOVER, start: 0, end: 0.5 }, { hand: 'right', to: PRESS, start: 0.5, end: dur('pressed') }], hands: { right: 'flat' }, look: [[0, [0, 1.2, 0]]], face: { smirk: [[0, 0.6]] } }) },
  fx: [BTN()], sfx: [{ t: 0.55, type: 'click', gain: 1 }, { t: 0.6, type: 'subdrop', gain: 0.8 }] });
S('mistake', { cut: 'smash', set: 'lab', look: 'horror', punch: [0.05], flash: 0.05,
  camera: { move: 'crash-zoom', target: 'hero', size: 'ms', at: 0.05, az: 25 },
  cast: { hero: hero0(2, { look: [[0, 'camera']], face: { shock: [[0, 0.3], [0.2, 1, 'outBack']], worried: [[0.5, 0.4]] } }) },
  fx: [BTN()], sfx: [{ t: 0.03, type: 'alarm', gain: 0.8 }] });
S('shook', { cut: 'glitch', set: 'lab', look: 'horror',
  camera: { move: 'static', target: 'hero', size: 'mls', az: 25, handheld: 3.2 },
  cast: { hero: hero0(2, { gestures: [{ type: 'scared', start: 0.1, end: dur('shook') }], look: [[0, [0, 3, 3]], [0.3, [0, 0.5, 3], 'inOutSine']], face: { scared: [[0, 1]] },
    bones: { spine: [[0, [0, 0, 0]], [0.15, [0.12, 0.1, 0.06]], [0.3, [-0.08, -0.1, -0.06]], [0.45, [0.1, 0.1, 0.05]], [0.6, [-0.06, -0.08, -0.05]]] } }) },
  fx: [BTN({ pos: [1.8, 0, -0.4] }), { type: 'sparks', t: 0.2, pos: [0.8, 2.4, 0.6], spread: 1, count: 120 }, { type: 'dust', count: 300 }], sfx: [{ t: 0.05, type: 'boom', gain: 0.8 }] });
S('vanished', { cut: 'smash', set: 'space', look: 'cinematic',
  camera: cam([0.5, 0.6, 6.4], [-0.4, 0.2, 5.4], [0, 0.1, 0], [0, -0.5, 0], 44, dur('vanished')),
  cast: { hero: { pos: [[0, [0, -0.4, 0]], [dur('vanished'), [0, -3.4, 0], 'inCubic']], rotY: [[0, 0]], rotX: [[0, 0], [dur('vanished'), -1.2, 'inCubic']], swimming: true, clips: idle(2),
    gestures: [{ type: 'handsup', start: 0.1, end: dur('vanished') }], face: { scream: [[0, 0.3], [0.2, 1, 'outBack']] }, look: [[0, 'camera']], acting: 'none' } },
  fx: [{ type: 'dust', count: 200 }], sfx: [{ t: 0.1, type: 'whoosh', gain: 0.9 }] });
S('gravity', { cut: 'flash', set: 'space', look: 'cinematic', punch: [0.05],
  camera: cam([-0.3, 0.9, 5.2], [0.3, 1.0, 4.6], [0.1, 1.0, 0], [0.25, 1.1, 0], 44, dur('gravity')),
  cast: { hero: { pos: [[0, [0, 0, 0]], [dur('gravity'), [0.3, 0.3, 0.2], 'outSine']], rotY: [[0, 0.4], [dur('gravity'), 1.3]], rotX: [[0, -0.3], [dur('gravity'), 0.9, 'inOutSine']], rotZ: [[0, 0], [dur('gravity'), 0.5, 'inOutSine']],
    swimming: true, clips: idle(2), gestures: [{ type: 'armsout', start: 0.1, end: dur('gravity') }], face: { shock: [[0, 1]] }, look: [[0, 'camera']], acting: 'none' } },
  fx: [{ type: 'dust', count: 150 }], sfx: [{ t: 0.05, type: 'boom', gain: 0.8 }] });
S('space', { cut: 'dip', set: 'space', look: 'cinematic',
  camera: cam([0, 0.5, 4.2], [0.2, 0.6, 6.2], [0.1, 0.3, 0], [0.2, 0.3, 0], 40, dur('space')),
  cast: { hero: { pos: [[0, [0, -0.3, 0]], [dur('space'), [0.2, 0, 0.2], 'linear']], rotY: [[0, 0.3], [dur('space'), 0.9]], rotX: [[0, 0.2], [dur('space'), 0.8]], rotZ: [[0, 0.1], [dur('space'), 0.3]],
    swimming: true, clips: idle(2), gestures: [{ type: 'armsout', start: 0, end: dur('space') }], face: { worried: [[0, 0.8]] }, look: [[0, 'camera']], acting: 'none' } } });
S('air', { cut: 'zoom', set: 'space', look: 'clean-cg',
  camera: { move: 'push', target: 'hero', size: 'mcu', az: 8, handheld: 0.6 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], swimming: true, clips: idle(2), look: [[0, 'camera']], face: { scared: [[0, 0.8]], worried: [[0, 0.9]], squint: [[0.4, 0.4]] }, acting: 'none' } },
  sfx: [{ t: 0.1, type: 'heartbeat', gain: 0.8 }] });
S('quiet', { cut: 'dip', set: 'space', look: 'cinematic',
  camera: { move: 'orbit', target: 'hero', size: 'ws', span: 40, az: -30 },
  cast: { hero: { pos: [[0, [0, 0, 0]], [dur('quiet'), [-0.5, 0.4, 0.4], 'linear']], rotY: [[0, 0.5], [dur('quiet'), 1.4]], rotX: [[0, 0.2], [dur('quiet'), 0.5]], swimming: true, clips: idle(2),
    gestures: [{ type: 'slump', start: 0.2, end: dur('quiet') }], face: { sad: [[0, 0.8]] }, look: [[0, [3, 0, 6]]], acting: 'none' } } });
S('sees', { cut: 'whip', set: 'space', look: 'clean-cg',
  camera: { move: 'push', target: 'hero', size: 'mcu', az: -25 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, -0.5]], swimming: true, clips: idle(2), look: [[0, [0, 1.5, 3]], [0.5, [6, 0.5, -4], 'outCubic']], face: { worried: [[0, 0.7]], shock: [[0.5, 0], [0.8, 0.8, 'outBack']] }, acting: 'none' } } });
S('another', { cut: 'whip', set: 'space', look: 'clean-cg', punch: [0.3],
  camera: cam([0.05, 1.3, 5.4], [0.05, 1.25, 4.6], [0.02, 1.2, 0], [0.05, 1.2, 0], 46, dur('another')),
  cast: { hero: { pos: [[0, [-0.55, 0.45, 0]]], rotY: [[0, HR]], swimming: true, clips: idle(2), look: [[0, [0.55, 1.4, 0]]], gestures: [{ type: 'point', start: 0.4, end: dur('another'), to: [0.5, 1.0, 0.3] }], face: { shock: [[0, 0.7]] }, acting: 'none' } },
  fx: [BTN({ pos: [0.55, 0.5, 0.3], height: 1.2, tilt: [[0, [0.15, 0, 0.25]], [dur('another'), [0.4, 0.5, 0.1]]] }), { type: 'magic', start: 0, end: dur('another'), pos: [0.55, 1.1, 0.3], scale: 0.7, color: ACC }], sfx: [{ t: 0.3, type: 'riser', gain: 0.7 }] });
S('dont', { cut: 'zoom', set: 'space', look: 'clean-cg',
  camera: { move: 'push', target: 'hero', size: 'mcu', az: 15 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], swimming: true, clips: idle(2), look: [[0, [5, 0.5, -4]], [0.8, 'camera', 'inOutSine']], gestures: [{ type: 'think', start: 0.3, end: dur('dont') }],
    face: { worried: [[0, 0.8]], squint: [[0.4, 0.6]], smirk: [[1.1, 0], [1.4, 0.4]] }, acting: 'none' } } });
S('nobody', { cut: 'smash', set: 'space', look: 'clean-cg', punch: [0.05],
  camera: cam([-0.3, 0.7, 4.6], [-0.2, 1.2, 3.9], [-0.35, 1.2, 0], [-0.3, 1.3, 0], 48, dur('nobody')),
  cast: { hero: { pos: [[0, [-1.1, 0.2, 0]], [dur('nobody'), [-0.8, 0.1, 0], 'inOutSine']], rotY: [[0, HR]], swimming: true, clips: [{ clip: 'swim', start: 0, end: 4 }], look: [[0, [1.2, 1.4, 0]]],
    face: { smirk: [[0, 0.3], [0.4, 1, 'outBack']], angry: [[0.2, 0.4]] }, acting: 'none' } },
  fx: [BTN({ pos: [0, 0, 0] })] });
S('presses', { cut: 'whip', set: 'space', look: 'clean-cg', punch: [0.9],
  camera: cam([-0.05, 1.55, 2.7], [-0.15, 1.5, 2.0], [-0.25, 1.4, 0], [-0.2, 1.38, 0], 40, dur('presses')),
  cast: { hero: hero0(2, { swimming: true, reach: [{ hand: 'right', to: HOVER, start: 0, end: 0.9 }, { hand: 'right', to: PRESS, start: 0.9, end: dur('presses') }], hands: { right: 'flat' }, look: [[0, [0, 1.2, 0]]], face: { smirk: [[0, 0.8]], squint: [[0, 0.4]] } }) },
  fx: [BTN()], sfx: [{ t: 0.9, type: 'click', gain: 1 }] });
S('boom', { cut: 'flash', set: 'space', look: 'cinematic', impact: [0.04], punch: [0.04],
  camera: { move: 'crash-zoom', target: 'hero', size: 'ms', at: 0.05, az: 20 },
  cast: { hero: { pos: [[0, HP], [dur('boom'), [-1.4, 0.3, 0.8], 'outCubic']], rotY: [[0, HR]], rotX: [[0, 0], [dur('boom'), -0.8, 'outCubic']], swimming: true, clips: idle(2), gestures: [{ type: 'handsup', start: 0.05, end: dur('boom') }], face: { scream: [[0, 1]] }, look: [[0, 'camera']], acting: 'none' } },
  fx: [{ type: 'explosion', t: 0.03, pos: [1.1, 0.9, -0.6], scale: 0.9 }, { type: 'shockwave', t: 0.04, pos: [1.1, 0.9, -0.6], scale: 1.0 }, { type: 'sparks', t: 0.05, pos: [1.1, 0.9, -0.6], spread: 1.2, count: 160 }],
  sfx: [{ t: 0.03, type: 'boom', gain: 1 }, { t: 0.03, type: 'impact', gain: 1 }] });
S('back', { cut: 'flash', set: 'lab', look: 'warm-film',
  camera: { move: 'crane-up', target: 'hero', size: 'ws', az: 30 },
  cast: { hero: { pos: [[0, [0, 0, 0.1]]], rotY: [[0, 0.3]], clips: idle(3), gestures: [{ type: 'slump', start: 0, end: 0.9 }, { type: 'headhold', start: 0.9, end: 1.5 }],
    face: { worried: [[0, 0.7], [1.0, 0]], smile: [[1.0, 0], [1.5, 0.6]] }, look: [[0, [0, 0, 3]], [1.3, 'camera', 'inOutSine']], acting: 'none' } },
  fx: [{ type: 'dust', count: 150 }] });
S('again', { cut: 'dip', set: 'lab', look: 'cinematic',
  camera: cam([0.6, 1.4, 4.2], [0.1, 1.35, 3.0], [-0.3, 1.1, 0], [-0.3, 1.2, 0], 36, dur('again')),
  cast: { hero: hero0(2, { look: [[0, 'camera'], [0.5, [0, 1.2, 0], 'inOutSine']], face: { smile: [[0, 0.5], [0.5, 0]], squint: [[0.6, 0.5]], smirk: [[1, 0], [1.4, 0.6]] } }) },
  fx: [BTN({ pulse: 0.05 })], sfx: [{ t: 0.1, type: 'ding', gain: 0.8 }] });
S('question', { set: 'lab', look: 'cinematic',
  camera: cam([-0.05, 1.55, 2.7], [-0.15, 1.5, 2.0], [-0.25, 1.4, 0], [-0.2, 1.38, 0], 40, dur('question')),
  cast: { hero: hero0(2, { reach: [{ hand: 'right', to: HOVER, start: 0.2, end: dur('question') }], hands: { right: 'point' }, look: [[0, [0, 1.2, 0]]], face: { smirk: [[0, 0.6]], squint: [[0.3, 0.5]] } }) },
  fx: [BTN({ pulse: 0.04 })], sfx: [{ t: dur('question') - 0.3, type: 'heartbeat', gain: 0.9 }] });

const titles = [
  { t: 0.05, t1: at('pressed'), style: 'slam', text: 'NEVER\nPRESS IT', pos: [0.5, 0.1], size: 0.1, accent: ACC },
  { t: at('mistake', 0.05), t1: at('shook'), style: 'stamp', text: 'BIG MISTAKE', pos: [0.5, 0.075], size: 0.09, accent: ACC },
  { t: at('vanished', 0.05), t1: at('vanished', 0.45), style: 'stamp', text: 'FLOOR: GONE', pos: [0.5, 0.1], size: 0.08, accent: ACC },
  { t: at('gravity', 0.1), t1: at('space'), style: 'slam', text: 'GRAVITY\nOFF', pos: [0.5, 0.1], size: 0.09, accent: ACC },
  { t: at('air', 0.1), t1: at('sees'), style: 'counter', from: 30, to: 0, suffix: 's', sub: 'OF AIR', pos: [0.5, 0.11], size: 0.1, dur: 3.1, accent: ACC },
  { t: at('another', 0.15), t1: at('dont'), style: 'callout', at: 'hero.head', text: 'ANOTHER ONE', sub: 'DO NOT PRESS', icon: 'warning', side: 1 },
  { t: at('dont', 0.2), t1: at('nobody'), style: 'stamp', text: "DON'T", pos: [0.5, 0.1], size: 0.1, accent: ACC },
  { t: at('presses', 0.1), t1: at('boom'), style: 'slam', text: 'JAKE\nPRESSES', pos: [0.5, 0.1], size: 0.08, accent: ACC },
  { t: at('back', 0.2), t1: at('again'), style: 'stamp', text: 'SAFE.', pos: [0.5, 0.09], size: 0.09, accent: '#1fa84f' },
  { t: at('question', 0.05), t1: END, style: 'kinetic', text: 'WOULD YOU|PRESS|IT?', hi: ['PRESS', 'IT?'], pos: [0.5, 0.12], size: 0.1, accent: ACC },
];

module.exports = {
  title: "Don't Press It", T, END,
  config: { targetDuration: +END.toFixed(2), set: 'lab', look: 'cinematic', quality: 'good', effort: 'high', fps: 30, accent: ACC,
    sound: { volume: 1.65, music: { mood: 'tension', bpm: 110, drops: [at('mistake'), at('boom')] }, sfx: true, ambience: true, ...(VO ? { voice: { url: 'vo.wav' } } : {}) },
    captions: { style: 'pop', ...(VO ? { sync: VO.words.map((w) => [w.w, w.start, w.end]) } : {}) }, letterbox: 0 },
  thumbs: [{ shot: 0, t: 0.8, text: 'NEVER\nPRESS IT', hi: ['PRESS'], accent: ACC, face: { hero: { smirk: 0.6 } }, size: 'mcu', side: 'left' }],
  cast, shots, captions: [], titles,
};
