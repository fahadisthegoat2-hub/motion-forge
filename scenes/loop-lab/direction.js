// "The 10-Second Lab" — direction (built into loop-lab.html by build.js). Shot starts come from the voiceover word times.
const fs = require('fs'), path = require('path');
const P = Math.PI;
let VO = null; try { VO = JSON.parse(fs.readFileSync(path.join(__dirname, 'vo.json'), 'utf8')); } catch {}
const CUES = [
  ['payoff', 'the lab explodes', 0.0], ['l47', 'loop forty-seven', 1.9], ['ten', 'ten seconds', 3.2], ['press', 'you smash', 4.7], ['boom', 'boom', 6.1],
  ['sprint', 'you sprint', 6.8], ['locked', 'locked', 8.3], ['worst', "but that's", 9.8], ['note', "there's a", 11.3], ['dont', "don't press", 13.2],
  ['never', 'you were never', 15.0], ['plug', 'you pull', 16.6], ['silence', 'silence', 18.0], ['door', 'the door', 19.4], ['itsyou', "it's you", 20.8],
  ['l48', 'loop forty-eight', 22.7], ['question', 'would you', 24.0],
];
const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9' -]/g, '');
const words = VO ? VO.words.map((w) => ({ w: norm(w.w), start: w.start })) : null;
const findCue = (ph, after) => { const p = ph.split(' '); for (let i = 0; i < words.length; i++) if (words[i].start >= after - 0.05 && p.every((x, k) => words[i + k] && words[i + k].w.replace(/'/g, '') === x.replace(/'/g, ''))) return words[i].start; return null; };
const T = {}; let last = 0;
for (const [id, ph, est] of CUES) { const t = words ? findCue(ph, last + 0.2) : null; T[id] = id === 'payoff' ? 0 : (t != null ? Math.max(0, t - 0.08) : est); last = T[id]; }
const END = VO ? VO.duration + 0.6 : 26.2;
const ids = CUES.map((c) => c[0]), dur = (id) => +((ids.indexOf(id) < ids.length - 1 ? T[ids[ids.indexOf(id) + 1]] : END) - T[id]).toFixed(3);
const at = (id, k = 0) => +(T[id] + k).toFixed(3);

const cast = {
  hero: { character: 'jake', wardrobe: { top: '#2e6bd6', bottom: '#23262d', shoes: '#f4f4f2' } },
  echo: { character: 'jake', wardrobe: { top: '#2e6bd6', bottom: '#23262d', shoes: '#f4f4f2' } },   // the next loop's you (same clothes — the clue)
};
const BOX = (o = {}) => ({ type: 'model', id: 'crate', pos: [0, 0, -1.4], height: 0.95, color: '#d62a2a', flat: true, ...o });
const idle = (d) => [{ clip: 'idle', start: 0, end: d }];
const shots = []; const S = (id, o) => shots.push({ name: id, dur: dur(id), ...o });
const BOOM = (t = 0.05, pos = [0, 1, -1.4], scale = 1.7) => ({ type: 'explosion', t, pos, scale });

S('payoff', { role: 'payoff', set: 'lab', look: 'cinematic', impact: [0.05], punch: [0.06],
  camera: { move: 'crash-zoom', target: 'hero', size: 'mls', at: 0.1, az: 20, handheld: 1.2 },
  cast: { hero: { pos: [[0, [0, 0, 0.6]]], rotY: [[0, 0]], clips: [{ clip: 'kneel', start: -2, end: 4, loop: false }], look: [[0, 'camera']], face: { scream: [[0, 0.8], [0.6, 0.2]], worried: [[0.3, 0.3], [0.9, 0.9, 'outBack']] }, acting: 'none' } },
  fx: [BOX({ color: '#2b2621' }), BOOM(0.02), { type: 'smoke', start: 0, end: 3, pos: [0, 0.5, -1.4], scale: 1.0, color: '#4a4744', opacity: 0.7 }, { type: 'embers', count: 160, pos: [0, 0.6, -1] }],
  sfx: [{ t: 0, type: 'impact', gain: 1 }, { t: 0.03, type: 'boom', gain: 1 }] });
S('l47', { cut: 'smash', set: 'lab', look: 'cinematic',
  camera: { move: 'push', target: 'hero', size: 'mcu', az: -14, handheld: 0.7 },
  cast: { hero: { pos: [[0, [0, 0, 0.6]]], rotY: [[0, 0]], clips: [{ clip: 'kneel', start: -2, end: 3, loop: false }], look: [[0, 'camera']], face: { worried: [[0, 0.7]], sad: [[0.3, 0.2], [0.8, 0.9, 'outBack']] }, acting: 'none' } },
  fx: [BOX({ color: '#2b2621' }), { type: 'smoke', start: 0, end: 2, pos: [0, 0.5, -1.4], scale: 0.8, color: '#4a4744', opacity: 0.5 }] });
S('ten', { cut: 'whip', set: 'lab', look: 'cinematic', punch: [0.2],
  camera: { move: 'orbit', target: 'hero', size: 'ms', span: 30, az: -25 },
  cast: { hero: { pos: [[0, [0, 0, 0.6]]], rotY: [[0, 0]], clips: idle(3), gestures: [{ type: 'scared', start: 0.1, end: dur('ten') }], look: [[0, [0.3, 1.2, -1.4]], [1, [0, 2.5, -3], 'inOutSine']], face: { shock: [[0, 0.3], [0.4, 0.9, 'outBack']] } } },
  fx: [BOX()], sfx: [{ t: 0.1, type: 'ding', gain: 0.7 }, { t: 0.7, type: 'ding', gain: 0.7 }] });
S('press', { cut: 'zoom', set: 'lab', look: 'cinematic',
  camera: { move: 'push', target: 'hero', size: 'ms', az: 40, handheld: 0.6 },
  cast: { hero: { pos: [[0, [0, 0, -1.07]]], rotY: [[0, P]], clips: idle(3), reach: [{ hand: 'right', to: [0, 1.0, -1.4], start: 0.2, end: 1.0 }], hands: { right: 'fist' }, look: [[0, [0, 1.0, -1.4]]], face: { angry: [[0, 0.6]], squint: [[0.2, 0.5]] } } },
  fx: [BOX()], sfx: [{ t: 0.9, type: 'impact', gain: 0.8 }] });
S('boom', { cut: 'smash', set: 'lab', look: 'cinematic', impact: [0.03], punch: [0.04],
  camera: { move: 'crash-zoom', target: 'hero', size: 'mcu', at: 0.05, az: 10 },
  cast: { hero: { pos: [[0, [0, 0, -0.95]]], rotY: [[0, P]], clips: idle(3), look: [[0, 'camera']], face: { scream: [[0, 1]] }, acting: 'none', secondary: 0, bones: { spine: [[0, [0.18, 0, 0]]], spine1: [[0, [0.12, 0, 0]]] } } },
  fx: [BOX(), BOOM(0.02, [0, 1, -3.4], 0.9), { type: 'shockwave', t: 0.02, pos: [0, 0.2, -1.4] }], sfx: [{ t: 0.02, type: 'boom', gain: 1 }] });
S('sprint', { cut: 'flash', set: 'lab', look: 'cinematic', afterimage: 0.5,
  camera: { move: 'track', target: 'hero', size: 'mls', side: 'left', az: 30, handheld: 0.8 },
  cast: { hero: { pos: [[0, [0, 0, 1.2]], [dur('sprint'), [0, 0, 1.2 - 2.6 * dur('sprint')], 'linear']], rotY: [[0, P]], clips: [{ clip: 'run', start: 0, end: 3 }], face: { scared: [[0, 0.9]] } } },
  fx: [BOX({ pos: [1.6, 0, -1.4] })] });
S('locked', { cut: 'whip', set: 'lab', look: 'cinematic', punch: [0.9], impact: [0.9],
  camera: { move: 'static', target: 'hero', size: 'ms', az: 160, handheld: 0.9 },
  cast: { hero: { pos: [[0, [0, 0, -3.15]]], rotY: [[0, P]], clips: idle(3), reach: [{ hand: 'right', to: [-0.12, 1.0, -3.4], start: 0.15, end: 0.7 }, { hand: 'left', to: [0.12, 1.0, -3.4], start: 0.5, end: 1.0 }], gestures: [{ type: 'scared', start: 1.0, end: dur('locked') }], face: { shock: [[0.7, 0], [1.1, 1, 'outBack']] } } },
  fx: [BOOM(0.95, [0, 1, -4.5], 0.5)], sfx: [{ t: 0.3, type: 'impact', gain: 0.6 }, { t: 0.95, type: 'boom', gain: 1 }] });
S('worst', { cut: 'glitch', set: 'lab', look: 'noir',
  camera: { move: 'dolly-in', target: 'hero', size: 'cu', az: 12 },
  cast: { hero: { pos: [[0, [0, 0, 0.6]]], rotY: [[0, 0]], clips: idle(3), look: [[0, 'camera'], [0.9, [-1.5, 1.0, -1.4], 'inOutSine']], face: { worried: [[0, 0.5], [0.6, 1, 'outBack']] } } } });
S('note', { cut: 'zoom', set: 'lab', look: 'clean-cg',
  camera: { move: 'push-tilt', target: 'hero', size: 'ms', az: -30 },
  cast: { hero: { pos: [[0, [0, 0, 0.6]]], rotY: [[0, 0]], clips: idle(3), gestures: [{ type: 'think', start: 0.2, end: dur('note') }], look: [[0, [0.2, 1.2, 0.33]]], face: { squint: [[0.2, 0.7]] } } } });
S('dont', { cut: 'whip', set: 'lab', look: 'cinematic', punch: [0.3],
  camera: { move: 'crash-zoom', target: 'hero', size: 'cu', at: 0.1, az: 8, handheld: 0.8 },
  cast: { hero: { pos: [[0, [0, 0, 0.6]]], rotY: [[0, 0]], clips: idle(3), look: [[0, [0.2, 1.2, 0.33]], [0.8, 'camera', 'inOutSine']], face: { shock: [[0, 0.4], [0.5, 1, 'outBack']] }, acting: 'none' } },
  sfx: [{ t: 0.1, type: 'subdrop', gain: 0.8 }] });
S('never', { cut: 'dip', set: 'lab', look: 'cinematic',
  camera: { move: 'orbit', target: 'hero', size: 'ms', span: 40, az: 35 },
  cast: { hero: { pos: [[0, [0, 0, 0.6]]], rotY: [[0, 0]], clips: idle(3), gestures: [{ type: 'think', start: 0.2, end: dur('never') }], look: [[0, [-1.2, 1.2, -2]], [0.8, [1.2, 1.0, -2.5], 'inOutSine']], face: { squint: [[0, 0.4]], worried: [[0.4, 0.2], [0.9, 0.7]] } } },
  fx: [BOX()] });
S('plug', { cut: 'zoom', set: 'lab', look: 'cinematic', punch: [0.9],
  camera: { move: 'push', target: 'hero', size: 'ms', az: 140, eye: 1.0 },
  cast: { hero: { pos: [[0, [0.6, 0, -0.95]]], rotY: [[0, P]], clips: [{ clip: 'kneel', start: -2, end: 4, loop: false }], reach: [{ hand: 'right', to: [0.6, 0.45, -1.2], start: 0.2, end: 1.0 }], hands: { right: 'grip' }, look: [[0, [0.6, 0.45, -1.2]]], face: { squint: [[0, 0.6]], smile: [[0.9, 0], [1.2, 0.5]] } } },
  fx: [BOX(), { type: 'sparks', t: 0.95, pos: [0.6, 0.4, -1.25], spread: 0.6, count: 120 }], sfx: [{ t: 0.95, type: 'impact', gain: 0.8 }] });
S('silence', { cut: 'bars', set: 'lab', look: 'dreamy', hold: true,
  camera: { move: 'dolly-in', target: 'hero', size: 'mcu', az: 14, hold: false },
  cast: { hero: { pos: [[0, [0.6, 0, -0.8]]], rotY: [[0, -0.2]], clips: idle(3), look: [[0, 'camera']], face: { worried: [[0, 0.4], [0.7, 0]], smile: [[0.5, 0], [1.2, 0.5]] } } } });
S('door', { cut: 'dip', set: 'lab', look: 'noir',
  camera: { move: 'reveal', target: 'echo', size: 'ws', az: 170 },
  cast: { hero: { pos: [[0, [0.6, 0, -0.8]]], rotY: [[0, P]], clips: idle(3), look: [[0, [0, 1.6, -6]]], face: { worried: [[0, 0.6]] } },
    echo: { pos: [[0, [0, 0, -6.5]], [dur('door'), [0, 0, -4.8], 'inOutSine']], rotY: [[0, 0]], clips: [{ clip: 'walk', start: 0, end: 3, speed: 0.9 }], look: [[0, [0, 1.6, 0]]], face: { smirk: [[0.6, 0], [1.2, 0.8]] }, acting: 'none' } },
  sfx: [{ t: 0.1, type: 'swoosh', gain: 0.6 }] });
S('itsyou', { cut: 'smash', set: 'lab', look: 'cinematic', punch: [0.05], impact: [0.04],
  camera: { move: 'crash-zoom', target: 'echo', size: 'mcu', at: 0.05, az: -10 },
  cast: { echo: { pos: [[0, [0, 0, -2.2]]], rotY: [[0, 0]], clips: idle(3), reach: [{ hand: 'right', to: [0.2, 1.15, -1.9], start: 0, end: dur('itsyou') }], hands: { right: 'fist' }, look: [[0, 'camera']], face: { smirk: [[0, 0.9]], squint: [[0, 0.4]] }, acting: 'none' },
    hero: { pos: [[0, [0.6, 0, 0.2]]], rotY: [[0, P]], clips: idle(3), face: { shock: [[0, 1]] } } },
  fx: [BOX({ pos: [0.2, 0, -1.9] })], sfx: [{ t: 0.04, type: 'subdrop', gain: 1 }] });
S('l48', { cut: 'flash', set: 'lab', look: 'cinematic', impact: [0.05], punch: [0.05],
  camera: { move: 'crash-zoom', target: 'echo', size: 'mcu', at: 0.05, az: 0 },
  cast: { echo: { pos: [[0, [0, 0, -2.2]]], rotY: [[0, 0]], clips: idle(3), look: [[0, 'camera']], face: { smirk: [[0, 1]] }, acting: 'none' } },
  fx: [BOX({ pos: [0.2, 0, -1.9] })], sfx: [{ t: 0.04, type: 'boom', gain: 1 }] });
S('question', { cut: 'whip', set: 'lab', look: 'cinematic',
  camera: { move: 'dolly-out', target: 'hero', size: 'mcu', az: 15 },
  cast: { hero: { pos: [[0, [0, 0, 0.6]]], rotY: [[0, 0]], clips: [{ clip: 'kneel', start: -2, end: 4, loop: false }], look: [[0, 'camera']], face: { worried: [[0, 0.7]], squint: [[0, 0.4]] }, acting: 'none' } },
  fx: [BOX({ color: '#2b2621' }), { type: 'smoke', start: 0, end: 3, pos: [0, 0.5, -1.4], scale: 0.8, color: '#4a4744', opacity: 0.5 }, BOOM(dur('question') - 0.12, [0, 1, -1.4], 1.4)] });

const A = '#ff3b2f';
const titles = [
  { t: 0.05, t1: 1.6, style: 'slam', text: 'AGAIN.', pos: [0.5, 0.08], size: 0.11 },
  { t: at('l47', 0.1), t1: at('ten'), style: 'kinetic', text: 'LOOP|47', hi: ['47'], pos: [0.5, 0.09], size: 0.09 },
  { t: at('ten', 0.05), t1: at('press'), style: 'tag', text: '10 SECONDS LEFT', pos: [0.5, 0.08], accent: A },
  { t: at('press', 0.1), t1: at('boom'), style: 'kinetic', text: 'THE RED|BUTTON', hi: ['RED'], pos: [0.5, 0.09], size: 0.08 },
  { t: at('boom', 0.04), t1: at('sprint'), style: 'burst', text: 'BOOM', pos: [0.5, 0.14], size: 0.13 },
  { t: at('locked', 0.9), t1: at('worst'), style: 'stamp', text: 'LOCKED', pos: [0.5, 0.1], size: 0.09 },
  { t: at('worst', 0.05), t1: at('note'), style: 'kinetic', text: "BUT THAT'S|NOT THE WORST", hi: ['WORST'], pos: [0.5, 0.13], size: 0.09 },
  { t: at('note', 0.2), t1: at('dont'), style: 'stamp', text: 'YOUR HANDWRITING', pos: [0.5, 0.08], size: 0.06 },
  { t: at('dont', 0.1), t1: at('never', -0.05), style: 'kinetic', text: "DON'T PRESS|THE RED BUTTON", hi: ['DON\'T'], pos: [0.5, 0.1], size: 0.08 },
  { t: at('never', 0.1), t1: at('plug'), style: 'kinetic', text: 'YOU WERE|NEVER STUCK', hi: ['NEVER', 'STUCK'], pos: [0.5, 0.1], size: 0.08 },
  { t: at('plug', 0.15), t1: at('plug', 1.0), style: 'kinetic', text: 'PULL|THE PLUG', hi: ['PLUG'], pos: [0.5, 0.09], size: 0.08 },
  { t: at('door', 0.1), t1: at('door', 1.0), style: 'tag', text: 'LAB 7 · 00:00', pos: [0.5, 0.08] },
  { t: at('itsyou', 0.1), t1: at('l48'), style: 'stamp', text: 'YOU', pos: [0.5, 0.1], size: 0.1 },
  { t: at('l48', 0.05), t1: at('question'), style: 'slam', text: 'LOOP 48', pos: [0.5, 0.13], size: 0.13 },
  { t: at('question', 0.05), t1: END, style: 'kinetic', text: 'WOULD YOU|PRESS IT?', hi: ['PRESS', 'IT?'], pos: [0.5, 0.13], size: 0.1 },
];

module.exports = {
  title: 'The 10-Second Lab', T, END,
  config: { targetDuration: +END.toFixed(2), set: 'lab', look: 'cinematic', quality: 'good', effort: 'high', fps: 30, accent: A,
    sound: { sfxVolume: 0.55, music: { mood: 'tension', bpm: 110, drops: [at('boom'), at('itsyou')] }, sfx: true, ambience: true, ...(VO ? { voice: { url: 'vo.wav' } } : {}) },
    captions: { style: 'pop', ...(VO ? { sync: VO.words.map((w) => [w.w, w.start, w.end]) } : {}) }, letterbox: 0 },
  thumbs: [{ shot: 0, t: 0.6, text: 'LOOP 47', hi: ['47'], accent: A, face: { hero: { scream: 0.9 } }, size: 'mcu', side: 'left' }],
  cast, shots, captions: [], titles,
};
