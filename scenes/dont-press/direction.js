// "DO NOT PRESS" — direction (built into dont-press.html by build.js). Shot starts come from the voiceover words.
const fs = require('fs'), path = require('path');
const P = Math.PI;
let VO = null; try { VO = JSON.parse(fs.readFileSync(path.join(__dirname, 'vo.json'), 'utf8')); } catch {}
const CUES = [
  ['payoff', 'he pressed it', 0], ['earlier', 'ten minutes', 1.3], ['lab', 'jake finds', 2.6], ['button', 'and a', 3.95], ['sign', 'the sign', 5.25],
  ['reads', 'jake does', 7.35], ['click', 'click', 9.5], ['gravity', 'gravity quits', 10.3], ['stuff', 'crates barrels', 11.45], ['roof', 'then the', 13.5],
  ['space', 'now hes', 14.8], ['alone', 'alone out', 16.1], ['another', 'then he', 17.75], ['home', 'press to', 19.35], ['press', 'he presses', 20.8],
  ['snap', 'everything snaps', 21.65], ['safe', 'jake is', 23.0], ['newsign', 'a new', 24.75], ['dont', 'do not', 26.3], ['final', 'jake does', 27.7],
];
const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9' -]/g, '').replace(/'/g, '');
const words = VO ? VO.words.map((w) => ({ w: norm(w.w), start: w.start })) : null;
function findCue(phrase, after) { const p = phrase.split(' '); for (let i = 0; i < words.length; i++) if (words[i].start >= after - 0.05 && p.every((x, k) => words[i + k] && words[i + k].w === x)) return words[i].start; return null; }
const T = {}; let last = 0;
for (const [id, ph, est] of CUES) { const t = words ? findCue(ph, last) : null; T[id] = id === 'payoff' ? 0 : (t != null ? Math.max(0, t - 0.08) : est); last = T[id]; }
const END = VO ? Math.min(VO.duration + 0.3, 29.95) : 29.9;
const ids = CUES.map((c) => c[0]), dur = (id) => +((ids.indexOf(id) < ids.length - 1 ? T[ids[ids.indexOf(id) + 1]] : END) - T[id]).toFixed(3);
const at = (id, k = 0) => +(T[id] + k).toFixed(3);

const ACC = '#ff3030';
const cast = { hero: { character: 'jake', wardrobe: { top: '#e9eef5', bottom: '#2b3a55', shoes: '#f4f4f2' } } };   // lab coat-white top
const idle = (d) => [{ clip: 'idle', start: 0, end: d }];
const BTN = (o = {}) => ({ solid: false, type: 'model', id: 'red_button', pos: [0, 0, 0.62], height: 0.95, ...o });
const SIGN = (o = {}) => ({ solid: false, type: 'model', id: 'warning_sign', pos: [0.75, 0, 0.55], height: 1.7, rotY: -0.35, ...o });
const CRATE = (pos, k, o = {}) => ({ solid: false, type: 'model', id: 'crate', pos, height: 0.7, p: [[0, [0, 0, 0]], [k, [0.2, 2.2, -0.3], 'inOutSine']], tilt: [[0, [0, 0, 0]], [k, [0.7, 0.5, 0.4]]], ...o });
const BARREL = (pos, k, o = {}) => ({ solid: false, type: 'model', id: 'barrel', pos, height: 0.9, p: [[0, [0, 0, 0]], [k, [-0.3, 2.6, 0.2], 'inOutSine']], tilt: [[0, [0, 0, 0]], [k, [0.4, 1, -0.6]]], ...o });
const float = (d, a = [0, 0, 0], b = [0.3, 1.4, 0.1]) => ({ pos: [[0, a], [d, b, 'inOutSine']], rotX: [[0, 0], [d, 0.3, 'inOutSine']], rotZ: [[0, 0]], solid: false, bones: { leftarm: [[0, [0, 0, 0.5]], [d / 2, [0, 0, 0.9], 'inOutSine'], [d, [0, 0, 0.5], 'inOutSine']], rightarm: [[0, [0, 0, -0.5]], [d / 2, [0, 0, -0.9], 'inOutSine'], [d, [0, 0, -0.5], 'inOutSine']], spine: [[0, [0.05, 0, 0]], [d, [0.15, 0.1, 0], 'inOutSine']] } });
const SP = (o) => ({ set: 'space', look: 'cinematic', ...o });

const shots = [];
const S = (id, o) => shots.push({ name: id, dur: dur(id), ...o });

// 1 · HOOK — Jake tumbling in space, screaming ("He pressed it.")
S('payoff', SP({ role: 'payoff', punch: [0.08],
  camera: { move: 'push', target: 'hero', size: 'ms', az: 0, handheld: 0.5 },
  cast: { hero: { ...float(dur('payoff'), [0, 1, 0], [0.05, 1.3, 0.1]), rotZ: [[0, 0]], rotX: [[0, 0], [dur('payoff'), 0.25]], clips: idle(3), face: { scream: [[0, 1]], shock: [[0, 0.6]] }, acting: 'none', look: [[0, 'camera']] } },
  fx: [BTN({ pos: [-1.1, 1.6, -0.5], p: [[0, [0, 0, 0]], [dur('payoff'), [0.3, 0.2, 0]]], tilt: [[0, [0, 0, 0]], [dur('payoff'), [0.9, 1.5, 0.4]]] }), { type: 'sparks', start: 0, end: 1.5, pos: [0, 1.2, 0.2], scale: 0.5 }],
  sfx: [{ t: 0, type: 'impact', gain: 1 }] }));
// 2 · "Ten minutes earlier."
S('earlier', { cut: 'dip', set: 'lab', look: 'clean-cg',
  camera: { move: 'crane-down', target: 'hero', size: 'ws', az: 25, handheld: 0.4 },
  cast: { hero: { pos: [[0, [0, 0, -3]], [dur('earlier'), [0, 0, -3 + 1.45 * dur('earlier')], 'linear']], rotY: [[0, 0]], clips: [{ clip: 'walk', start: 0, end: 3 }], look: [[0, [0, 1.6, 4]]] } } });
// 3 · "Jake finds a lab."
S('lab', { cut: 'whip', set: 'lab', look: 'clean-cg',
  camera: { move: 'track', target: 'hero', size: 'mls', side: 'right', az: 70 },
  cast: { hero: { pos: [[0, [0.2, 0, -1.8]], [dur('lab'), [0.2, 0, -1.8 + 1.45 * dur('lab')], 'linear']], rotY: [[0, 0]], clips: [{ clip: 'walk', start: 0, end: 3 }], look: [[0, [-2, 1.7, 1]], [0.7, [2, 1.7, 1], 'inOutSine']], face: { smile: [[0.3, 0.3]] } } },
  fx: [CRATE([-2, 0, 0.5], 0.01), BARREL([2.2, 0, 1.2], 0.01)] });
// 4 · "And a big red button."
S('button', { cut: 'zoom', set: 'lab', look: 'clean-cg', punch: [0.05],
  camera: { move: 'push', target: 'hero', size: 'mls', az: 35, with: [0, 0.6, 0.62] },
  cast: { hero: { pos: [[0, [-0.3, 0, -0.6]]], rotY: [[0, 0]], clips: idle(3), look: [[0, [0, 1.0, 0.62]]], face: { shock: [[0, 0], [0.25, 0.6, 'outBack']], smile: [[0.4, 0.5]] }, gestures: [{ type: 'point', start: 0.2, end: dur('button'), to: [0, 0.95, 0.62] }] } },
  fx: [BTN(), { type: 'sparks', start: 0.1, end: 1, pos: [0, 0.98, 0.62], scale: 0.3 }], sfx: [{ t: 0.1, type: 'ding', gain: 0.7 }] });
// 5 · "The sign says: do not press."
S('sign', { cut: 'whip', set: 'lab', look: 'clean-cg',
  camera: { move: 'push', target: 'hero', size: 'mls', az: -30, with: [0.5, 0.8, 0.55] },
  cast: { hero: { pos: [[0, [-0.6, 0, -0.3]]], rotY: [[0, 0.3]], clips: idle(3), look: [[0, [0.75, 1.5, 0.55]], [1, [0, 1.0, 0.62], 'inOutSine']], face: { worried: [[0.2, 0.4]] }, gestures: [{ type: 'think', start: 0.5, end: dur('sign') }] } },
  fx: [BTN(), SIGN()], sfx: [{ t: 0.1, type: 'ding', gain: 0.6 }] });
// 6 · "Jake does not read signs."
S('reads', { set: 'lab', look: 'clean-cg', punch: [1.2],
  camera: { move: 'orbit', target: 'hero', size: 'mcu', span: 25, az: -20 },
  cast: { hero: { pos: [[0, [-0.1, 0, 0.3]]], rotY: [[0, 0.1]], clips: idle(4), look: [[0, [0, 1.0, 0.62]]], face: { smirk: [[0.2, 0], [0.7, 0.9, 'outBack']], squint: [[0.8, 0.3]] },
    gestures: [{ type: 'shrug', start: 0.3, end: 1.2 }], reach: [{ hand: 'right', to: [0, 1.0, 0.62], start: 1.3, end: dur('reads') }] } },
  fx: [BTN(), SIGN({ pos: [0.9, 0, 0.3] })] });
// 7 · "Click."
S('click', { cut: 'smash', set: 'lab', look: 'cinematic', impact: [0.1], punch: [0.1], flash: 0.15,
  camera: { move: 'crash-zoom', target: 'hero', size: 'mcu', at: 0.08, az: 15, with: [0, 0.98, 0.55] },
  cast: { hero: { pos: [[0, [0, 0, 0.4]]], rotY: [[0, 0]], clips: idle(2), reach: [{ hand: 'right', to: [0, 0.97, 0.6], start: 0, end: 0.6 }], hands: { right: 'fist' }, look: [[0, [0, 0.95, 0.6]]], face: { squint: [[0, 0.7]], smirk: [[0, 0.6]] } } },
  fx: [BTN(), { type: 'shockwave', t: 0.1, pos: [0, 0.97, 0.62], scale: 1.2 }], sfx: [{ t: 0.1, type: 'impact', gain: 1 }, { t: 0.1, type: 'subdrop', gain: 0.8 }] });
// 8 · "Gravity quits."
S('gravity', { cut: 'flash', set: 'lab', look: 'cinematic', punch: [0.05],
  camera: { move: 'rise', target: 'hero', size: 'ws', az: 20, shakes: [0.05] },
  cast: { hero: { ...float(dur('gravity'), [0, 0, 0.1], [0, 1.1, 0.1]), clips: idle(3), rotX: [[0, 0], [dur('gravity'), 0.25]], pos: [[0, [0, 0, -0.3]], [dur('gravity'), [-0.2, 1.4, -0.3], 'inOutSine']], face: { shock: [[0, 1]] }, look: [[0, 'camera']], acting: 'none' } },
  fx: [BTN(), SIGN(), CRATE([-1.4, 0, 0.6], dur('gravity')), BARREL([1.5, 0, 1.0], dur('gravity')), { type: 'dust', count: 220 }] });
// 9 · "Crates. Barrels. Jake. All floating."
S('stuff', { cut: 'whip', set: 'lab', look: 'cinematic',
  camera: { move: 'orbit', target: 'hero', size: 'ws', span: 40, az: 30, handheld: 0.8 },
  cast: { hero: { ...float(dur('stuff'), [0, 1.1, 0.1], [0.3, 1.8, 0.2]), clips: idle(4), gestures: [{ type: 'armsout', start: 0.2, end: dur('stuff') }], face: { smile: [[0, 0.4]], shock: [[0.3, 0.5]] }, acting: 'none', look: [[0, [1, 2.5, 1]], [1.5, [-1, 3, 1], 'inOutSine']] } },
  fx: [CRATE([-1.4, 2.2, 0.4], dur('stuff'), { height: 0.7, p: [[0, [0, 0, 0]], [dur('stuff'), [0.3, 1.0, 0.2]]] }), BARREL([1.5, 2.6, 1.0], dur('stuff'), { p: [[0, [0, 0, 0]], [dur('stuff'), [-0.2, 0.9, 0.2]]] }), BTN({ pos: [1.2, 2.2, -1.6], p: [[0, [0, 0, 0]], [dur('stuff'), [0, 0.6, 0.3]]], tilt: [[0, [0, 0, 0]], [dur('stuff'), [1.2, 0.8, 0]]] })] });
// 10 · "Then the roof leaves."
S('roof', { cut: 'smash', set: 'lab', look: 'cinematic', punch: [0.05], impact: [0.04],
  camera: { move: 'low-hero', target: 'hero', size: 'ws', az: 10, shakes: [0.05, 0.6] },
  cast: { hero: { ...float(dur('roof'), [0, 2.2, 0.1], [0, 4.5, 0.1]), clips: idle(3), gestures: [{ type: 'scared', start: 0.05, end: dur('roof') }], face: { scream: [[0, 0.3], [0.3, 1, 'outBack']] }, acting: 'none', look: [[0, [0, 8, 0]]] } },
  fx: [CRATE([-1.4, 3.2, 0.4], dur('roof'), { p: [[0, [0, 0, 0]], [dur('roof'), [0, 3.5, 0]]] }), { type: 'lightning', t: 0.05, pos: [0, 12, 0], to: [0, 2, 0], seed: 2 }, { type: 'dust', count: 300 }],
  sfx: [{ t: 0.05, type: 'thunder', gain: 0.8 }] });
// 11 · "Now he's in space."
S('space', SP({ cut: 'smash', punch: [0.05],
  camera: { move: 'crash-zoom', target: 'hero', size: 'ws', at: 0.05, az: 25 },
  cast: { hero: { ...float(dur('space'), [0, 0.5, 0], [0.4, 1.2, -0.3]), clips: idle(3), gestures: [{ type: 'armsout', start: 0.1, end: dur('space') }], face: { shock: [[0, 1]], scream: [[0.3, 0.5]] }, acting: 'none', look: [[0, 'camera']] } },
  fx: [{ type: 'sparks', start: 0, end: 1, pos: [0, 1, 0], scale: 0.6 }], sfx: [{ t: 0.05, type: 'subdrop', gain: 0.9 }] }));
// 12 · "Alone. Out of ideas."
S('alone', SP({ look: 'clean-cg', cut: 'dip',
  camera: { move: 'static', target: 'hero', size: 'ws', az: 25 },
  cast: { hero: { ...float(dur('alone'), [0, 1.0, 0], [0.05, 1.3, 0.05]), rotX: [[0, 0.1], [dur('alone'), 0.3, 'inOutSine']], clips: idle(4), gestures: [{ type: 'slump', start: 0.2, end: dur('alone') }], face: { sad: [[0, 0.3], [0.6, 0.9]], worried: [[0.4, 0.4]] }, acting: 'none', look: [[0, [4, 2, 5]], [1.2, [-4, 1, 6], 'inOutSine']] } } }));
// 13 · "Then he sees another button."
S('another', SP({ look: 'clean-cg', cut: 'whip',
  camera: { move: 'push', target: 'hero', size: 'mls', az: 25 },
  cast: { hero: { ...float(dur('another'), [0, 1.2, 0], [0.1, 1.5, 0.1]), rotX: [[0, 0.4], [dur('another'), 0.1, 'outCubic']], clips: idle(3), face: { shock: [[0.3, 0.7, 'outBack']] }, acting: 'none', look: [[0, [4, 1, 5]], [0.8, [0.55, 2.75, 0.45], 'inOutSine']] } },
  fx: [BTN({ pos: [0.55, 2.5, 0.45], height: 0.5, p: [[0, [0, 0, 0]], [dur('another'), [-0.1, 0.1, -0.2]]], tilt: [[0, [0, 0, 0]], [dur('another'), [0.2, 1.2, 0]]], pulse: 0.05 }), { type: 'magic', start: 0, end: 3, pos: [0.55, 2.7, 0.45], scale: 1.2, color: '#ff5050' }, { type: 'sparks', start: 0, end: 3, pos: [0, 1.2, 0.5], scale: 0.8 }], sfx: [{ t: 0.4, type: 'ding', gain: 0.7 }] }));
// 14 · "Press to go home."
S('home', SP({ look: 'clean-cg', cut: 'zoom',
  camera: { move: 'push', target: 'hero', size: 'ms', az: 8 },
  cast: { hero: { pos: [[0, [0, 1.3, 0]], [dur('home'), [0.3, 1.5, 0.2], 'inOutSine']], rotX: [[0, 0.1]], rotY: [[0, 0.3]], solid: false, clips: idle(3), face: { smile: [[0.3, 0.8, 'outBack']] }, acting: 'none', look: [[0, [0.55, 2.75, 0.45]]], gestures: [{ type: 'present', start: 0.3, end: dur('home') }] } },
  fx: [BTN({ height: 0.5, pos: [0.55, 2.5, 0.45], p: [[0, [0, 0, 0]], [dur('home'), [0, 0.2, -0.2]]], tilt: [[0, [0, 0, 0]], [dur('home'), [0, 1, 0]]] }), SIGN({ pos: [-0.75, 2.4, 0.2], height: 0.8, p: [[0, [0, 0, 0]], [dur('home'), [0.2, 0.3, 0]]], tilt: [[0, [0, 0, 0]], [dur('home'), [0.4, 1.3, 0.3]]] })] }));
// 15 · "He presses it."
S('press', SP({ look: 'clean-cg', cut: 'smash', impact: [0.9], punch: [0.9],
  camera: { move: 'crash-zoom', target: 'hero', size: 'ms', at: 0.8, az: 12, with: [0, 2.3, 0.62] },
  cast: { hero: { pos: [[0, [0, 1.3, 0.28]]], rotX: [[0, 0]], solid: false, clips: idle(3), reach: [{ hand: 'right', to: [0, 2.27, 0.6], start: 0.2, end: 1.2 }], hands: { right: 'fist' }, look: [[0, [0, 2.27, 0.6]]], face: { squint: [[0, 0.6]], smile: [[0.5, 0.7]] }, acting: 'none' } },
  fx: [BTN({ pos: [0, 1.3, 0.62] }), { type: 'shockwave', t: 0.9, pos: [0, 2.3, 0.62], scale: 1.6 }], sfx: [{ t: 0.9, type: 'impact', gain: 1 }, { t: 0.9, type: 'subdrop', gain: 0.9 }] }));
// 16 · "Everything snaps back."
S('snap', { cut: 'flash', set: 'lab', look: 'clean-cg', punch: [0.1], impact: [0.1],
  camera: { move: 'crash-zoom', target: 'hero', size: 'ws', at: 0.08, az: 20, shakes: [0.1] },
  cast: { hero: { pos: [[0, [0, 3.5, 0.1]], [0.45, [0, 0, 0.1], 'inCubic']], rotX: [[0, 1.2], [0.4, 0, 'inCubic']], clips: [{ clip: 'land', start: 0.35, end: 2.5, loop: false }], gestures: [{ type: 'armsout', start: 0, end: 0.4 }], face: { scream: [[0, 1], [0.5, 0.2]], shock: [[0.5, 0.6]] }, acting: 'none', look: [[0, 'camera']] } },
  fx: [CRATE([-1.4, 0, 0.4], 0.45, { p: [[0, [0, 3, 0]], [0.45, [0, 0, 0], 'inCubic']], tilt: [[0, [0.7, 0.5, 0.4]], [0.45, [0, 0, 0]]] }), BARREL([1.5, 0, 1.0], 0.45, { p: [[0, [0, 3, 0]], [0.45, [0, 0, 0], 'inCubic']], tilt: [[0, [0.4, 1, -0.6]], [0.45, [0, 0, 0]]] }), { type: 'dust', t: 0.45, pos: [0, 0, 0.1], count: 300 }],
  sfx: [{ t: 0.45, type: 'impact', gain: 1 }] });
// 17 · "Jake is home. Safe."
S('safe', { cut: 'dip', set: 'lab', look: 'warm-film',
  camera: { move: 'push', target: 'hero', size: 'ms', az: 22, handheld: 0.5 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], clips: idle(4), gestures: [{ type: 'thumbsup', start: 1.0, end: dur('safe') }], face: { smile: [[0.2, 0.9, 'outBack']] }, look: [[0, 'camera']] } },
  fx: [CRATE([-1.4, 0, 0.4], 0.01, { p: [[0, [0, 0, 0]]], tilt: [[0, [0, 0, 0]]] }), BARREL([1.5, 0, 1.0], 0.01, { p: [[0, [0, 0, 0]]], tilt: [[0, [0, 0, 0]]] }), BTN({ pos: [0, 0, 1.2] })] });
// 18 · "A new sign appears."
S('newsign', { cut: 'whip', set: 'lab', look: 'cinematic', punch: [0.6],
  camera: { move: 'push', target: 'hero', size: 'ews', az: -30 },
  cast: { hero: { pos: [[0, [-0.4, 0, 0]]], rotY: [[0, 0.5]], clips: idle(4), look: [[0, 'camera'], [0.5, [1, 1.5, 1], 'inOutSine']], face: { worried: [[0.5, 0.7, 'outBack']] } } },
  fx: [SIGN({ pos: [1.0, 0, 1.0], height: 1.7, scale: [[0.5, 0], [0.8, 1, 'outBack']] }), BTN({ pos: [0, 0, 1.2] }), { type: 'sparks', t: 0.6, pos: [1, 1, 1], scale: 0.6 }], sfx: [{ t: 0.6, type: 'ding', gain: 0.8 }] });
// 19 · "Do not press." (whisper)
S('dont', { cut: 'zoom', set: 'lab', look: 'noir', punch: [0.1],
  camera: { move: 'push-tilt', target: 'hero', size: 'mcu', az: 10, with: [0, 0.98, 1.2] },
  cast: { hero: { pos: [[0, [0, 0, 0.5]]], rotY: [[0, 0]], clips: idle(3), look: [[0, [0, 0.98, 1.2]]], face: { squint: [[0, 0.5]], smirk: [[0.3, 0.2], [0.9, 0.9]] }, gestures: [{ type: 'think', start: 0.2, end: dur('dont') }] } },
  fx: [BTN({ pos: [0, 0, 1.2] })], sfx: [{ t: 0.1, type: 'heartbeat', gain: 0.7 }] });
// 20 · "Jake does not read signs." — loops back to the hook
S('final', { cut: 'smash', set: 'lab', look: 'cinematic', punch: [dur('final') - 0.35],
  camera: { move: 'crash-zoom', target: 'hero', size: 'mcu', at: dur('final') - 0.5, az: 15, with: [0, 0.98, 1.0] },
  cast: { hero: { pos: [[0, [0, 0, 0.9]]], rotY: [[0, 0]], clips: idle(3), reach: [{ hand: 'right', to: [0, 0.97, 1.12], start: 0.1, end: dur('final') }], hands: { right: 'fist' }, look: [[0, [0, 0.98, 1.0]]], face: { smirk: [[0, 0.9]], squint: [[0, 0.4]] } } },
  fx: [BTN({ pos: [0, 0, 1.2] })] });

// ---------- motion graphics: one accent, 5 title styles ----------
const titles = [
  { t: 0.05, t1: at('earlier'), style: 'slam', text: 'HE PRESSED IT', pos: [0.5, 0.07], size: 0.08, accent: ACC },
  { t: at('earlier', 0.1), t1: at('lab'), style: 'place', text: 'THE LAB', sub: '10 MINUTES EARLIER', pos: [0.08, 0.08] },
  { t: at('sign', 0.6), t1: at('reads'), style: 'stamp', text: 'DO NOT PRESS', pos: [0.5, 0.055], size: 0.075, accent: ACC },
  { t: at('reads', 0.9), t1: at('click'), style: 'stamp', text: 'JAKE: LOL', pos: [0.5, 0.07], size: 0.07, accent: '#ffd23f' },
  { t: at('click', 0.05), t1: at('gravity'), style: 'burst', text: 'CLICK!', pos: [0.5, 0.075], size: 0.1 },
  { t: at('gravity', 0.1), t1: at('stuff'), style: 'slam', text: 'GRAVITY: OFF', pos: [0.5, 0.07], size: 0.075, accent: ACC },
  { t: at('roof', 0.15), t1: at('space'), style: 'stamp', text: 'ROOF: GONE', pos: [0.5, 0.07], size: 0.08, accent: ACC },
  { t: at('space', 0.05), t1: at('alone'), style: 'burst', text: 'SPACE!', pos: [0.5, 0.075], size: 0.1 },
  { t: at('alone', 0.2), t1: at('another'), style: 'place', text: 'LOW EARTH ORBIT', sub: 'NO SIGNAL', pos: [0.08, 0.08] },
  { t: at('another', 0.3), t1: at('home'), style: 'slam', text: 'ANOTHER BUTTON?', pos: [0.5, 0.055], size: 0.065, accent: ACC },
  { t: at('snap', 0.05), t1: at('safe'), style: 'burst', text: 'SNAP!', pos: [0.5, 0.075], size: 0.1 },
  { t: at('safe', 0.4), t1: at('newsign'), style: 'stamp', text: 'SAFE', pos: [0.5, 0.07], size: 0.09, accent: '#2fbf5f' },
  { t: at('dont', 0.1), t1: at('final'), style: 'slam', text: 'DO NOT PRESS', pos: [0.5, 0.055], size: 0.07, accent: ACC },
];

module.exports = {
  title: 'DO NOT PRESS', T, END,
  config: { targetDuration: +END.toFixed(2), set: 'lab', look: 'cinematic', quality: 'good', effort: 'high', fps: 30, accent: ACC,
    sound: { music: { mood: 'tension', bpm: 128, volume: 1, drops: [at('click', 0.1), at('snap', 0.05)] }, sfx: true, ambience: true, ...(VO ? { voice: { url: 'vo.wav', volume: 1.6 } } : {}) },
    captions: { style: 'pop', ...(VO ? { sync: VO.words.map((w) => [w.w, w.start, w.end]) } : {}) }, letterbox: 0 },
  thumbs: [{ shot: 0, t: 0.6, text: 'DO NOT\nPRESS', hi: ['PRESS'], accent: ACC, face: { hero: { scream: 1, shock: 0.6 } }, size: 'mcu', side: 'left' }],
  cast, shots, titles, captions: [{ t: at('final', 0.2), t1: END, text: 'WOULD YOU PRESS IT?', hi: ['PRESS'] }],
};
