// "Delete One Color" — direction (built into gravity-button.html by build.js). Shots land on voiceover word times.
const fs = require('fs'), path = require('path');
let VO = null; try { VO = JSON.parse(fs.readFileSync(path.join(__dirname, 'vo.json'), 'utf8')); } catch {}

const T = { payoff: 0, earlier: 1.95, find: 3.81, label: 5.17, fine: 7.77, pick: 10.05, sky: 11.53, ocean: 12.75, screens: 13.85, worst: 15.49, beeps: 17.29, ten: 19.41, count: 20.49, question: 22.12 };
const END = VO ? +(VO.duration + 0.7).toFixed(2) : 24.2;
const ids = Object.keys(T);
const dur = (id) => +((ids.indexOf(id) < ids.length - 1 ? T[ids[ids.indexOf(id) + 1]] : END) - T[id]).toFixed(3);
const at = (id, k = 0) => +(T[id] + k).toFixed(3);
const ACC = '#ff3b30';
const cast = { hero: { character: 'jake', wardrobe: { top: '#3fae5a', bottom: '#2b2f3a', shoes: '#d11a1a' } } };
const idle = (d) => [{ clip: 'idle', start: 0, end: d }];
const shots = [];
const S = (id, o) => shots.push({ name: id, dur: dur(id), ...o });
const REMOTE_HAND = { type: 'model', id: 'gravity_remote', attach: 'hero.righthand', grip: true, height: 0.09, solid: false };
const CRATE = [{ type: 'model', id: 'crate', pos: [0, 0, 0.9], height: 0.77 }, { type: 'model', id: 'gravity_remote', pos: [0, 0.77, 0.9], height: 0.09, rotY: 2.6, solid: false }];

// 1 · PAYOFF — the sky is gone (white void above a grey city)
S('payoff', { role: 'payoff', set: 'city-day', look: 'noir', impact: [0.05], punch: [0.1],
  camera: { move: 'low-hero', target: 'hero', size: 'mls', az: 10, handheld: 1.4 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], clips: idle(dur('payoff')), gestures: [{ type: 'handsup', start: 0, end: dur('payoff') }], look: [[0, [0, 30, 4]], [0.8, 'camera', 'inOutSine']],
    face: { shock: [[0, 1]], scared: [[0.3, 0.8]] }, acting: 'none' } },
  fx: [REMOTE_HAND], sfx: [{ t: 0, type: 'impact', gain: 1 }, { t: 0.05, type: 'boom', gain: 0.9 }] });

// 2 · "Ten seconds earlier."
S('earlier', { cut: 'whip', set: 'city-day', look: 'clean-cg',
  camera: { move: 'track', target: 'hero', size: 'ws', side: 'right', az: 70 },
  cast: { hero: { pos: [[0, [0.5, 0, -3.4]], [dur('earlier'), [0.3, 0, -1.95], 'linear']], rotY: [[0, 0]], clips: [{ clip: 'walk', start: 0, end: 3 }], look: [[0, [0, 1.2, 1]]], face: { smile: [[0, 0.2]] } } },
  fx: [...CRATE, { type: 'dust', count: 120 }] });

// 3 · "You find a red button."
S('find', { cut: 'zoom', set: 'city-day', look: 'clean-cg',
  camera: { move: 'push', target: 'hero', size: 'mls', az: 28, eye: 1.5 },
  cast: { hero: { pos: [[0, [0.3, 0, -1.9]]], rotY: [[0, 0.1]], clips: idle(dur('find')), look: [[0, [0, 1.6, 2]], [0.35, [0, 0.8, 0.9], 'outCubic']],
    bones: { spine: [[0, [0, 0, 0]], [0.5, [0.18, 0, 0], 'outCubic']], neck: [[0.3, [0, 0, 0]], [0.6, [0.2, 0, 0], 'outCubic']] }, face: { shock: [[0.3, 0], [0.6, 0.45, 'outBack']], smile: [[0.7, 0], [1.2, 0.3]] } } },
  fx: [...CRATE, { type: 'sparks', t: 0.35, pos: [0, 0.85, 0.9], spread: 0.15, count: 30 }] });

// macro product shots of the remote
const MACRO = (id, camA, camB, lookA, lookB, extra = {}) => S(id, { cut: extra.cut || 'zoom', set: 'void', look: 'cinematic',
  camera: { pos: [[0, camA], [dur(id), camB, 'inOutSine']], look: [[0, lookA], [dur(id), lookB, 'inOutSine']], fov: extra.fov || 32 },
  cast: {}, fx: [{ type: 'model', id: 'gravity_remote', pos: [0, 0, 0], height: 0.09, rotY: extra.rot ?? 0.3, solid: false }, ...(extra.fx || [])], sfx: extra.sfx });
// 4 · "The label says: delete one color."
MACRO('label', [0.3, 0.2, 0.36], [0.1, 0.11, 0.2], [0, 0.04, 0], [0, 0.045, 0.02], { rot: 0.1, sfx: [{ t: 0.2, type: 'ding', gain: 0.6 }] });
// 5 · "Fine print: next color, random." (the clue)
MACRO('fine', [0.0, 0.11, 0.2], [0.0, 0.07, 0.12], [0, 0.04, 0.05], [0, 0.047, 0.075], { rot: 0.0, cut: 'whip', sfx: [{ t: 0.9, type: 'heartbeat', gain: 0.7 }] });

// 6 · "You pick blue. You press it."
S('pick', { cut: 'zoom', set: 'city-day', look: 'clean-cg', punch: [0.9], impact: [0.9],
  camera: { move: 'push', target: 'hero', size: 'mcu', az: 28, eye: 1.4 },
  cast: { hero: { pos: [[0, [0.3, 0, -1.4]]], rotY: [[0, 0.1]], clips: idle(dur('pick')), look: [[0, [0.2, 1.3, 0.5]], [0.5, 'camera', 'inOutSine']], hands: { right: 'grip' }, gestures: [{ type: 'present', start: 0.05, end: dur('pick'), side: 'right' }],
    face: { squint: [[0, 0.4]], smirk: [[0.5, 0], [0.9, 0.8, 'outBack']] } } },
  fx: [REMOTE_HAND, { type: 'shockwave', t: 0.9, pos: [0.0, 1.0, -0.8], scale: 1.5, color: '#ff3b30' }], sfx: [{ t: 0.9, type: 'impact', gain: 0.9 }, { t: 0.9, type: 'riser', gain: 0.5 }] });

// 7 · "The sky turns white." — color drains
S('sky', { cut: 'flash', set: 'city-day', look: 'noir', punch: [0.1],
  camera: { move: 'low-hero', target: 'hero', size: 'ws', az: 18 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0.2]], clips: idle(dur('sky')), look: [[0, [0, 25, 6]]], gestures: [{ type: 'armsout', start: 0.2, end: dur('sky') }], face: { shock: [[0, 0.5]], smile: [[0.5, 0], [1.0, 0.5]] } } },
  fx: [REMOTE_HAND, { type: 'shockwave', t: 0.05, pos: [0, 1, 0], scale: 6, color: '#ffffff' }] });

// 8 · "The ocean? Gone."
S('ocean', { cut: 'whip', set: 'ocean', look: 'noir',
  camera: { move: 'orbit', target: 'hero', size: 'ws', span: 30, az: -25 },
  cast: { hero: { pos: [[0, [0, 0.43, 0]]], rotY: [[0, 0.5]], clips: idle(dur('ocean')), look: [[0, [0, 0, 8]], [0.6, [3, 0.5, 8], 'inOutSine']], gestures: [{ type: 'shrug', start: 0.2, end: dur('ocean') }], face: { worried: [[0, 0.6]] } } },
  fx: [{ type: 'model', id: 'raft', pos: [0, 0, 0], height: 0.43 }, REMOTE_HAND] });

// 9 · "Every blue screen? Dead."
S('screens', { cut: 'glitch', set: 'city-day', look: 'noir',
  camera: { move: 'push', target: 'hero', size: 'mcu', az: -22 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], clips: idle(dur('screens')), hands: { right: 'grip' }, gestures: [{ type: 'present', start: 0, end: dur('screens'), side: 'right' }], look: [[0, 'camera']], face: { worried: [[0, 0.6]], disgust: [[0.5, 0], [0.9, 0.4]] } } },
  fx: [REMOTE_HAND] });

// 10 · "But that's not the worst part."
S('worst', { cut: 'glitch', set: 'city-day', look: 'cinematic',
  camera: { move: 'dolly-in', target: 'hero', size: 'ms', az: 15 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], clips: idle(dur('worst')), hands: { right: 'grip' }, look: [[0, [0.2, 1.2, 0.4]], [0.9, 'camera', 'inOutSine']], gestures: [{ type: 'think', start: 0.2, end: dur('worst') }], face: { worried: [[0.2, 0.2], [1.2, 0.9, 'outBack']] } } },
  fx: [REMOTE_HAND] });

// 11 · "The button beeps. Next color: red." — macro, screen blinks
S('beeps', { cut: 'zoom', set: 'void', look: 'cinematic', impact: [dur('beeps') - 0.7],
  camera: { pos: [[0, [0.05, 0.08, 0.13]], [dur('beeps'), [0.03, 0.058, 0.09], 'inOutSine']], look: [[0, [0.03, 0.047, 0.075]]], fov: 28 },
  cast: {}, fx: [{ type: 'model', id: 'gravity_remote', pos: [0, 0, 0], height: 0.09, solid: false, rotY: 0 }, { type: 'sparks', t: 0.3, pos: [0.03, 0.05, 0.075], spread: 0.012, count: 20, color: '#ff3a2a' }, { type: 'sparks', t: 1.1, pos: [0.03, 0.05, 0.075], spread: 0.012, count: 20, color: '#ff3a2a' }],
  sfx: [{ t: 0.2, type: 'ding', gain: 0.8 }, { t: 0.5, type: 'ding', gain: 0.8 }, { t: 1.1, type: 'ding', gain: 0.9 }, { t: dur('beeps') - 0.7, type: 'subdrop', gain: 1 }] });

// 12 · "Ten seconds."
S('ten', { cut: 'smash', set: 'city-day', look: 'horror', punch: [0.05],
  camera: { move: 'crash-zoom', target: 'hero', size: 'mcu', at: 0.15, az: 12 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], clips: idle(dur('ten')), hands: { right: 'grip' }, look: [[0, 'camera']], face: { scared: [[0, 0.9]], worried: [[0, 0.8]] }, acting: 'none' } },
  fx: [REMOTE_HAND], sfx: [{ t: 0.05, type: 'subdrop', gain: 0.9 }] });

// 13 · "Three. Two. One."
S('count', { cut: 'dip', set: 'city-day', look: 'horror', punch: [0.55, 1.1],
  camera: { move: 'push', target: 'hero', size: 'ecu', az: 6, eye: 1.55 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], clips: idle(dur('count')), look: [[0, 'camera']], face: { scared: [[0, 1]], scream: [[1.0, 0], [1.4, 0.6, 'outBack']] }, acting: 'none' } },
  sfx: [{ t: 0.05, type: 'heartbeat', gain: 0.9 }, { t: 0.55, type: 'heartbeat', gain: 0.9 }, { t: 1.1, type: 'heartbeat', gain: 1 }, { t: dur('count') - 0.4, type: 'riser', gain: 0.7 }] });

// 14 · "Would you press it?" — back to the opening image (loop)
S('question', { cut: 'smash', set: 'city-day', look: 'noir', impact: [0.05],
  camera: { move: 'low-hero', target: 'hero', size: 'mls', az: 10, handheld: 1.4 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], clips: idle(dur('question')), gestures: [{ type: 'handsup', start: 0, end: dur('question') }], look: [[0, [0, 30, 4]], [0.8, 'camera', 'inOutSine']],
    face: { shock: [[0, 1]], scared: [[0.3, 0.8]] }, acting: 'none' } },
  fx: [REMOTE_HAND], sfx: [{ t: 0, type: 'impact', gain: 1 }, { t: 0.05, type: 'whoosh', gain: 1 }] });

// ---------- motion graphics: one design system — accent red, slam / place / stat / stamp / countdown ----------
const titles = [
  { t: 0.05, t1: at('earlier', -0.05), style: 'slam', text: 'THE SKY\nIS GONE', pos: [0.5, 0.11], size: 0.1, accent: ACC },
  { t: at('earlier', 0.15), t1: at('find', -0.05), style: 'place', text: 'DOWNTOWN', sub: '10 SECONDS EARLIER', pos: [0.08, 0.09] },
  { t: at('label', 0.1), t1: at('fine', -0.05), style: 'stat', value: 1, max: 1, suffix: ' COLOR', text: 'DELETE', pos: [0.5, 0.2], accent: ACC },
  { t: at('fine', 0.15), t1: at('pick', -0.05), style: 'stamp', text: 'NEXT: RANDOM', pos: [0.5, 0.2], size: 0.07, accent: ACC },
  { t: at('pick', 0.0), t1: at('sky'), style: 'stamp', text: 'BLUE', pos: [0.5, 0.12], size: 0.1, accent: '#2e6bd6' },
  { t: at('sky', 0.15), t1: at('ocean'), style: 'stat', value: 0, max: 100, suffix: '% BLUE', text: 'SKY', pos: [0.5, 0.1], accent: ACC },
  { t: at('ocean', 0.15), t1: at('screens'), style: 'stat', value: 0, max: 100, suffix: '% BLUE', text: 'OCEAN', pos: [0.5, 0.1], accent: ACC },
  { t: at('beeps', 1.2), t1: at('ten'), style: 'stamp', text: 'NEXT: RED', pos: [0.5, 0.2], size: 0.08, accent: ACC },
  { t: at('ten', 0.1), t1: at('count'), style: 'slam', text: '10 SECONDS', pos: [0.5, 0.11], size: 0.09, accent: ACC },
  { t: at('count', 0.0), t1: at('question'), style: 'countdown', from: 3, step: 0.55, pos: [0.5, 0.15], size: 0.07, accent: ACC },
  { t: at('question', 0.05), t1: END, style: 'slam', text: 'WOULD YOU\nPRESS IT?', pos: [0.5, 0.11], size: 0.1, accent: ACC },
];

module.exports = {
  title: 'Delete One Color', T, END,
  config: { targetDuration: END, set: 'city-day', look: 'cinematic', quality: 'good', effort: 'high', fps: 30, accent: ACC,
    sound: { music: { mood: 'mystery', bpm: 104, drops: [at('pick', 0.9), at('beeps', 1.1), at('question', 0)] }, sfx: true, ambience: true, ...(VO ? { voice: { url: 'vo.wav' } } : {}) },
    captions: { style: 'pop', ...(VO ? { sync: VO.words.map((w) => [w.w, w.start, w.end]) } : {}) }, letterbox: 0 },
  thumbs: [{ shot: 0, t: 0.9, text: 'THE SKY\nIS GONE', hi: ['GONE'], accent: ACC, face: { hero: { shock: 1, scared: 0.8 } }, size: 'mcu', side: 'left' }],
  cast, shots, captions: [], titles,
};
