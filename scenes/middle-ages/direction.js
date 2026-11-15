// "You vs the Middle Ages" — direction (built into middle-ages.html by build.js)
// Shot starts come from the voiceover cue times (CUE) so the edit lands on the words.
const fs = require('fs'), path = require('path');
const P = Math.PI;
let VO = null; try { VO = JSON.parse(fs.readFileSync(path.join(__dirname, 'vo.json'), 'utf8')); } catch {}

// cue → [first words of the line, estimated start]
const CUES = [
  ['payoff', 'you survive the', 0.0], ['barely1', 'barely', 1.85], ['wake', 'six hours earlier', 2.7], ['nosignal', 'no signal', 5.5],
  ['watch', 'your watch beeps', 7.5], ['drink', "you're thirsty", 9.6], ['mistake', 'big mistake', 12.1], ['dysentery', 'dysentery', 13.2],
  ['worst', "but that's not", 15.0], ['doctor', "the doctor's cure", 16.5], ['sneakers', 'then they see', 19.4], ['witch', 'witch', 20.7],
  ['stake', 'they tie you', 21.9], ['fire', 'they light the', 23.3], ['clock', 'two fifty-nine', 24.7], ['storm', 'the storm hits', 26.6],
  ['rain', 'the rain kills', 27.7], ['run', 'they run', 29.1], ['survived', 'you survived', 30.4], ['question', 'would you last', 32.1],
];
const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9' -]/g, '');
const words = VO ? VO.words.map((w) => ({ w: norm(w.w), start: w.start, end: w.end })) : null;
function findCue(phrase, after) {
  const p = phrase.split(' ');
  for (let i = 0; i < words.length; i++) if (words[i].start >= after - 0.05 && p.every((x, k) => words[i + k] && words[i + k].w.replace(/'/g, '') === x.replace(/'/g, ''))) return words[i].start;
  return null;
}
const T = {}; let last = 0;
for (const [id, ph, est] of CUES) { const t = words ? findCue(ph, last) : null; T[id] = id === 'payoff' ? 0 : (t != null ? Math.max(0, t - 0.08) : est); last = T[id]; }
const END = VO ? VO.duration + 0.7 : 34.2;
const ids = CUES.map((c) => c[0]), dur = (id) => +((ids.indexOf(id) < ids.length - 1 ? T[ids[ids.indexOf(id) + 1]] : END) - T[id]).toFixed(3);
const at = (id, k = 0) => +(T[id] + k).toFixed(3);   // absolute edit time inside a cue

// ---------- cast ----------
const cast = {
  hero: { character: 'jake', wardrobe: { top: '#2e6bd6', bottom: '#2b3a55', shoes: '#f4f4f2' } },   // modern clothes + white sneakers (the clue)
  doc:  { character: 'walt', wardrobe: { top: '#24201c', bottom: '#1b1814', shoes: '#1a1612' } },     // the "doctor" in dark wool
  v1:   { character: 'marcus', wardrobe: { top: '#6b5a3e', bottom: '#4a3c2c', shoes: '#2a1f16' } },   // peasant (accuser)
  v2:   { character: 'ryan', wardrobe: { top: '#8a7a5e', bottom: '#4a3c2c', shoes: '#2a1f16' } },
  v3:   { character: 'kwame', wardrobe: { top: '#55603f', bottom: '#3d3226', shoes: '#2a1f16' } },
};
const STAKE = (o = {}) => ({ type: 'model', id: 'medieval_stake', pos: [0, 0, 0], p: [[0, [0, 0, -0.1]]], height: 3.2, ...o });
const RAIN = { type: 'rain', count: 7000, opacity: 0.55 };
const idle = (d) => [{ clip: 'idle', start: 0, end: d }];
// arms tied behind the post (custom pose, layered on idle)
const TIED = { leftarm: [[0, [0.75, 0, 0.12]]], rightarm: [[0, [0.75, 0, -0.12]]], leftforearm: [[0, [0, 0, -0.9]]], rightforearm: [[0, [0, 0, 0.9]]] };
const struggle = (d) => ({ spine: [[0, [0, 0, 0]], ...Array.from({ length: Math.floor(d / 0.35) }, (_, i) => [0.2 + i * 0.35, [0.05, (i % 2 ? 1 : -1) * 0.16, (i % 2 ? -1 : 1) * 0.06], 'inOutSine'])] });

const shots = [];
const S = (id, o) => shots.push({ name: id, dur: dur(id), ...o });

// 1 · PAYOFF — kneeling in the rain in front of the burnt, smoking stake
S('payoff', { role: 'payoff', set: 'medieval', look: 'cinematic', impact: [0.06], punch: [0.08],
  camera: { move: 'crash-zoom', target: 'hero', size: 'mls', at: 0.1, az: 22, height: -0.15, eye: 1.25, handheld: 1.1 },
  cast: { hero: { pos: [[0, [0, 0, 1.3]]], rotY: [[0, 0]], clips: [{ clip: 'kneel', start: -2, end: 4, loop: false }], look: [[0, [0, 9, 6]], [1.2, 'camera', 'inOutSine']],
    face: { scream: [[0, 0.7], [0.5, 0.2]], worried: [[0.3, 0.3], [0.9, 0.9, 'outBack']] }, acting: 'none' } },
  fx: [STAKE({ color: '#2b2621' }), { type: 'smoke', start: 0, end: 3, pos: [0, 0.3, -0.1], scale: 0.8, color: '#6d6a66', opacity: 0.6 }, RAIN,
    { type: 'lightning', t: 0.04, pos: [-3, 16, -14], to: [-2, 0, -12], seed: 4 }, { type: 'embers', count: 120, pos: [0, 0.6, -0.1] }],
  sfx: [{ t: 0, type: 'impact', gain: 1 }, { t: 0.04, type: 'thunder', gain: 0.9 }] });
// 2 · "Barely."
S('barely1', { set: 'medieval', look: 'cinematic', punch: [0.15],
  camera: { move: 'push', target: 'hero', size: 'mcu', az: -12, eye: 1.12, handheld: 0.8 },
  cast: { hero: { pos: [[0, [0, 0, 1.3]]], clips: [{ clip: 'kneel', start: -2, end: 3, loop: false }], look: [[0, 'camera']],
    face: { worried: [[0, 0.8]], sad: [[0.2, 0.2], [0.6, 0.9, 'outBack']], squint: [[0.3, 0], [0.7, 0.6]] }, acting: 'none' } },
  fx: [STAKE({ color: '#2b2621' }), RAIN, { type: 'smoke', start: 0, end: 2, pos: [0, 0.3, -0.1], scale: 0.7, color: '#6d6a66', opacity: 0.5 }] });
// 3 · "Six hours earlier. You wake up in 1348."
S('wake', { cut: 'dip', set: 'medieval', look: 'warm-film',
  camera: { move: 'crane-down', target: 'hero', size: 'ws', az: 28, handheld: 0.5 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0.3]], clips: [{ clip: 'wakeup', start: 0, end: 4, speed: 1.15, loop: false }], look: [[0, [0, 3, 2]], [1.4, [-3, 1.6, -4], 'inOutSine'], [2.2, [3, 1.6, -3], 'inOutSine']],
      face: { squint: [[0, 0.8], [1, 0.2]], worried: [[1.2, 0], [1.8, 0.8, 'outBack']] } },
    v2: { pos: [[0, [-2.4, 0, -9]], [dur('wake'), [-2.4, 0, -9 + 1.45 * dur('wake')], 'linear']], rotY: [[0, 0]], clips: [{ clip: 'walk', start: 0, end: 4 }], look: [[0, [0, 1.6, 0]]] } },
  fx: [{ type: 'smoke', start: 0, end: 4, pos: [-5.0, 7.6, -14.5], scale: 0.7, color: '#8d8a84', opacity: 0.5, wind: [0.4, 0, 0] }, { type: 'dust', count: 260 }] });
// 4 · "No signal. Just mud and smoke."
S('nosignal', { cut: 'whip', set: 'medieval', look: 'warm-film',
  camera: { move: 'orbit', target: 'hero', size: 'ms', span: 28, az: -30 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], clips: idle(3), look: [[0, [-3, 1.6, -4]], [0.7, [3, 1.5, -5], 'inOutSine'], [1.4, [0, 1.6, 4], 'inOutSine']],
      gestures: [{ type: 'armsout', start: 0.15, end: 1.5 }], face: { worried: [[0, 0.5], [0.4, 0.9, 'outBack']] } },
    v1: { pos: [[0, [2.2, 0, -6]], [dur('nosignal'), [2.2, 0, -6 + 1.45 * dur('nosignal')], 'linear']], rotY: [[0, 0]], clips: [{ clip: 'walk', start: 0, end: 3 }], look: [[0, [0, 1.6, 0]]], face: { disgust: [[0, 0.5]] } },
    v3: { pos: [[0, [-2.6, 0, -4.5]]], rotY: [[0, 0.5]], clips: [{ clip: 'foldarms', start: 0, end: 3 }], look: [[0, [0, 1.6, 0]]], face: { squint: [[0, 0.6]] } } },
  fx: [{ type: 'smoke', start: 0, end: 3, pos: [5.0, 4.5, -10.5], scale: 0.6, color: '#8d8a84', opacity: 0.5 }, { type: 'dust', count: 260 }] });
// 5 · "Your watch beeps: storm at three." (the clue)
S('watch', { set: 'medieval', look: 'warm-film', punch: [0.2],
  camera: { move: 'push', target: 'hero', size: 'ms', az: 18 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], clips: idle(3), reach: [{ hand: 'left', to: [0.1, 1.45, 0.36], start: 0.05, end: dur('watch') }], hands: { left: 'relaxed' },
    look: [[0, [0, 1.6, 3]], [0.15, [0.1, 1.45, 0.36], 'outCubic']], face: { squint: [[0.3, 0.5]], worried: [[0.8, 0], [1.3, 0.6]] } } },
  sfx: [{ t: 0.25, type: 'ding', gain: 0.8 }, { t: 0.45, type: 'ding', gain: 0.6 }] });
// 6 · "You're thirsty. You drink the ditch water."
S('drink', { cut: 'zoom', set: 'medieval', look: 'warm-film',
  camera: { move: 'push', target: 'hero', size: 'ms', az: 40, handheld: 0.6 },
  cast: { hero: { pos: [[0, [-1.2, 0, -2.6]]], rotY: [[0, 0]], clips: [{ clip: 'kneel', start: -2, end: 4, loop: false }],
    reach: [{ hand: 'left', to: 'hero.mouth', offset: [0.04, -0.06, 0.1], start: 0.9, end: 2.2 }, { hand: 'right', to: 'hero.mouth', offset: [-0.04, -0.06, 0.1], start: 0.9, end: 2.2 }], hands: { both: 'grip' }, look: [[0, [-1.2, 0, -1.8]], [0.9, [-1.2, 1.4, -1.4], 'inOutSine']], bones: { head: [[0.9, [0, 0, 0]], [1.3, [-0.25, 0, 0], 'outCubic']] },
    face: { disgust: [[1.2, 0], [1.6, 0.35]] } } },
  fx: [{ type: 'splash', t: 1.25, pos: [-1.2, 1.0, -2.4], dir: [0, -1, 0.2], color: '#7a6d58', scale: 0.35 }] });
// 7 · "Big mistake."
S('mistake', { cut: 'smash', set: 'medieval', look: 'cinematic', punch: [0.05],
  camera: { move: 'crash-zoom', target: 'hero', size: 'mcu', at: 0.05, az: 30 },
  cast: { hero: { pos: [[0, [-1.2, 0, -2.6]]], rotY: [[0, 0.5]], clips: [{ clip: 'kneel', start: -2, end: 3, loop: false }], look: [[0, 'camera']],
    reach: [{ hand: 'left', to: 'hero.belly', offset: [0.09, 0.03, 0.06], start: 0.1, end: 2 }, { hand: 'right', to: 'hero.belly', offset: [-0.09, -0.03, 0.06], start: 0.1, end: 2 }], face: { shock: [[0, 0.3], [0.2, 1, 'outBack']], disgust: [[0.5, 0], [1, 0.6]] } } },
  sfx: [{ t: 0.05, type: 'subdrop', gain: 0.8 }] });
// 8 · "Dysentery. Your gut is on fire."
S('dysentery', { set: 'medieval', look: 'horror',
  camera: { move: 'static', target: 'hero', size: 'mls', az: 10 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], clips: idle(3), reach: [{ hand: 'left', to: 'hero.belly', offset: [0.09, 0.03, 0.06], start: 0, end: 3 }, { hand: 'right', to: 'hero.belly', offset: [-0.09, -0.03, 0.06], start: 0, end: 3 }],
    bones: { spine: [[0, [0.25, 0, 0]], [0.8, [0.4, 0, 0], 'inOutSine'], [1.4, [0.3, 0, 0], 'inOutSine']], spine1: [[0, [0.2, 0, 0]]] },
    face: { disgust: [[0, 0.7]], scream: [[0.6, 0], [0.9, 0.6, 'outBack'], [1.4, 0.3]] }, look: [[0, [0, 0.5, 2]]] } },
  sfx: [{ t: 0.1, type: 'heartbeat', gain: 0.6 }] });
// 9 · "But that's not the worst part." — the doctor arrives
S('worst', { cut: 'glitch', set: 'medieval', look: 'warm-film',
  camera: { move: 'push', target: 'doc', size: 'mls', az: -45 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, P]], clips: idle(3), reach: [{ hand: 'right', to: 'hero.belly', offset: [0, 0, 0.02], start: 0, end: 3 }], look: [[0, [0.2, 1.55, -4.2]], [1.1, [0.15, 1.55, -2.6], 'inOutSine']], face: { worried: [[0, 0.7]] } },
    doc: { pos: [[0, [0.2, 0, -4.2]], [1.1, [0.15, 0, -2.6], 'inOutSine']], rotY: [[0, 0]], clips: [{ clip: 'walk', start: 0, end: 1.1 }, { clip: 'idle', start: 1.0, end: 3, fade: 0.3 }],
      look: [[0, [0, 1.6, 0]]], face: { smirk: [[0.6, 0], [1.1, 0.8, 'outBack']] }, gestures: [{ type: 'present', start: 1.0, end: dur('worst') }] } } });
// 10 · "The doctor's cure? Bleed you. A whole pint."
S('doctor', { set: 'medieval', look: 'warm-film', punch: [1.2],
  camera: { move: 'push', target: 'hero', size: 'ws', az: 20, eye: 1.75 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], clips: [{ clip: 'kneel', start: -2, end: 4, loop: false }], look: [[0, [0.85, 1.55, 0.35]], [0.8, [0.25, 0.95, 0.1], 'outCubic']],
      face: { worried: [[0, 0.6]], scream: [[0.9, 0], [1.2, 0.8, 'outBack'], [2, 0.4]] } },
    doc: { pos: [[0, [0.42, 0, 0.26]]], rotY: [[0, -P / 2]], clips: idle(4), reach: [{ hand: 'right', to: 'hero.leftarm', start: 0.5, end: dur('doctor') }], hands: { right: 'pinch' },
      look: [[0, [0.2, 0.95, 0.1]]], face: { smirk: [[0, 0.6]] } } } });
// 11 · "Then they see your sneakers."
S('sneakers', { cut: 'whip', set: 'medieval', look: 'warm-film',
  camera: { move: 'push', target: 'hero', size: 0.8, az: 55, eye: 0.15 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], clips: idle(3) },
    v1: { pos: [[0, [1.5, 0, -1.4]]], rotY: [[0, -2.4]], clips: idle(3), look: [[0, [0, 0.05, 0.15]]] } } });
// 12 · "WITCH!"
S('witch', { cut: 'smash', set: 'medieval', look: 'cinematic', punch: [0.05], impact: [0.04],
  camera: { move: 'crash-zoom', target: 'v1', size: 'mcu', at: 0.05, az: -15 },
  cast: { v1: { pos: [[0, [0, 0, -2]]], rotY: [[0, 0]], clips: idle(3), gestures: [{ type: 'point', start: 0, end: dur('witch'), to: 'hero.head' }], look: [[0, [0, 1.6, 0.8]]],
      face: { angry: [[0, 0.6], [0.1, 1, 'outBack']], scream: [[0.05, 0.9]] } },
    v2: { pos: [[0, [-1.3, 0, -3.2]]], rotY: [[0, 0.3]], clips: idle(3), look: [[0, [0, 1.6, 0.8]]], face: { angry: [[0, 0.8]] }, gestures: [{ type: 'point', start: 0.2, end: dur('witch'), to: 'hero.head' }] },
    hero: { pos: [[0, [0, 0, 0.8]]], rotY: [[0, P]], clips: idle(3), gestures: [{ type: 'handsup', start: 0.1, end: dur('witch') }], face: { shock: [[0, 1]] } } },
  sfx: [{ t: 0.04, type: 'impact', gain: 1 }] });
// 13 · "They tie you to a stake."
S('stake', { cut: 'dip', set: 'medieval', look: 'cinematic',
  camera: { move: 'low-hero', target: 'hero', size: 'ws', az: 14 },
  cast: { hero: { pos: [[0, [0, 0.22, 0.24]]], rotY: [[0, 0]], clips: idle(3), bones: { ...TIED, ...struggle(dur('stake')) }, look: [[0, [-2, 1.7, 3]], [0.7, [2, 1.7, 3], 'inOutSine']], face: { scared: [[0, 0.9]], worried: [[0, 0.8]] }, acting: 'none' },
    v1: { pos: [[0, [-2.2, 0, 2.6]]], rotY: [[0, 2.5]], clips: idle(3), look: [[0, [0, 1.85, 0.24]]], face: { angry: [[0, 0.7]] } },
    v2: { pos: [[0, [2.4, 0, 2.2]]], rotY: [[0, -2.3]], clips: [{ clip: 'foldarms', start: 0, end: 3 }], look: [[0, [0, 1.85, 0.24]]], face: { disgust: [[0, 0.6]] } },
    v3: { pos: [[0, [1.7, 0, 2.6]]], rotY: [[0, P - 0.6]], clips: idle(3), look: [[0, [0, 1.85, 0.24]]], face: { squint: [[0, 0.7]] } } },
  fx: [STAKE(), { type: 'dust', count: 200 }] });
// 14 · "They light the fire."
S('fire', { set: 'medieval', look: 'cinematic',
  camera: { move: 'static', target: 'hero', size: 'ws', az: 18, eye: 1.9, handheld: 0.9 },
  cast: { hero: { pos: [[0, [0, 0.22, 0.24]]], rotY: [[0, 0]], clips: idle(3), bones: { ...TIED, ...struggle(dur('fire')) }, look: [[0, [0, 0, 1]], [0.5, [0, 0.3, 0.8]]],
    face: { scream: [[0, 0.3], [0.4, 1, 'outBack']], scared: [[0, 1]] }, acting: 'none' } },
  fx: [STAKE(), { type: 'fire', start: 0.15, end: 3, pos: [0.45, 0.1, 0.55], scale: 0.75 }, { type: 'fire', start: 0.45, end: 3, pos: [-0.45, 0.1, 0.5], scale: 0.7 }, { type: 'embers', count: 200, pos: [0, 0.5, 0.2] }] });
// 15 · "Two fifty-nine… Three."
S('clock', { set: 'medieval', look: 'cinematic', time: [[0, 0], [dur('clock'), dur('clock') * 0.55]],
  camera: { move: 'dolly-in', target: 'hero', size: 'cu', az: 8, handheld: 0.4 },
  cast: { hero: { pos: [[0, [0, 0.22, 0.24]]], rotY: [[0, 0]], clips: idle(3), bones: TIED, look: [[0, [0, 1, 3]], [0.8, [0, 12, 4], 'inOutSine']],
    face: { scared: [[0, 0.9]], squint: [[0, 0.6]], worried: [[0.8, 1]] }, acting: 'none' } },
  fx: [STAKE(), { type: 'fire', start: 0, end: 3, pos: [0.4, 0.1, 0.5], scale: 0.7 }, { type: 'fire', start: 0, end: 3, pos: [-0.5, 0.1, 0.4], scale: 0.65 }, { type: 'embers', count: 200, pos: [0, 0.5, 0.2] }],
  sfx: [{ t: 0.05, type: 'heartbeat', gain: 0.8 }, { t: 0.9, type: 'heartbeat', gain: 0.9 }, { t: dur('clock') - 0.5, type: 'riser', gain: 0.7 }] });
// 16 · "The storm hits." — lightning strikes beside the pyre
S('storm', { cut: 'flash', set: 'medieval', look: 'cinematic', impact: [0.06], afterimage: 0.6,
  camera: { move: 'static', target: 'hero', size: 'ws', az: 30, with: [2.2, 3, -1.4], handheld: 1.3 },
  cast: { hero: { pos: [[0, [0, 0.22, 0.24]]], rotY: [[0, 0]], clips: idle(3), bones: TIED, face: { shock: [[0, 1]] }, acting: 'none' },
    v1: { pos: [[0, [-2.2, 0, 2.6]]], rotY: [[0, 2.5]], clips: idle(3), gestures: [{ type: 'shield', start: 0.1, end: dur('storm') }], face: { scared: [[0, 1]] } },
    v2: { pos: [[0, [2.4, 0, 2.2]]], rotY: [[0, -2.3]], clips: idle(3), gestures: [{ type: 'scared', start: 0.1, end: dur('storm') }], face: { scream: [[0.1, 1]] } } },
  fx: [STAKE(), { type: 'lightning', t: 0.05, pos: [2.6, 16, -3], to: [2.0, 0, -1.6], seed: 7 }, { type: 'sparks', t: 0.08, pos: [2.0, 0.1, -1.6], spread: 1, count: 160 },
    { type: 'dust', count: 200 }, { type: 'fire', start: 0, end: 3, pos: [0.4, 0.1, 0.5], scale: 0.7 }, { type: 'fire', start: 0, end: 3, pos: [-0.5, 0.1, 0.4], scale: 0.65 }, RAIN],
  sfx: [{ t: 0.05, type: 'thunder', gain: 1 }, { t: 0.05, type: 'boom', gain: 0.9 }] });
// 17 · "The rain kills the flames."
S('rain', { set: 'medieval', look: 'cinematic',
  camera: { move: 'crane-up', target: 'hero', size: 'ms', az: -16 },
  cast: { hero: { pos: [[0, [0, 0.22, 0.24]]], rotY: [[0, 0]], clips: idle(3), bones: TIED, look: [[0, [0, 10, 4]]], face: { worried: [[0, 0.8], [1, 0.3]], smile: [[0.9, 0], [1.4, 0.35]] }, acting: 'none' } },
  fx: [STAKE(), { type: 'fire', start: 0, end: 0.6, pos: [0.4, 0.1, 0.5], scale: 0.7 }, { type: 'fire', start: 0, end: 0.45, pos: [-0.5, 0.1, 0.4], scale: 0.65 },
    { type: 'smoke', start: 0.3, end: 3, pos: [0, 0.3, 0.4], scale: 1.0, color: '#b9b6b0', opacity: 0.4 }, RAIN],
  sfx: [{ t: 0.4, type: 'swoosh', gain: 0.6 }] });
// 18 · "They run. You crawl."
S('run', { cut: 'whip', set: 'medieval', look: 'cinematic',
  camera: { move: 'static', target: 'hero', size: 'ws', az: 0, height: -0.2 },
  cast: { hero: { pos: [[0, [0, 0, 0.4]], [dur('run'), [0, 0, 1.25], 'inOutSine']], rotY: [[0, 0]], clips: [{ clip: 'crouchwalk', start: 0, end: 3, speed: 0.75 }],
      face: { worried: [[0, 0.9]] }, look: [[0, [0, 0.4, 4]]] },
    v1: { pos: [[0, [-1.6, 0, -1.5]], [dur('run'), [-1.6, 0, -1.5 - 2.6 * dur('run')], 'linear']], rotY: [[0, P]], clips: [{ clip: 'run', start: 0, end: 3 }] },
    v2: { pos: [[0, [1.8, 0, -2.2]], [dur('run'), [1.8, 0, -2.2 - 2.6 * dur('run')], 'linear']], rotY: [[0, P]], clips: [{ clip: 'run', start: 0, end: 3 }] },
    v3: { pos: [[0, [0.4, 0, -3.4]], [dur('run'), [0.4, 0, -3.4 - 2.6 * dur('run')], 'linear']], rotY: [[0, P]], clips: [{ clip: 'run', start: 0, end: 3 }] } },
  fx: [STAKE({ color: '#2b2621' }), { type: 'smoke', start: 0, end: 3, pos: [0, 0.3, -0.1], scale: 0.8, color: '#9a9690', opacity: 0.6 }, RAIN] });
// 19 · "You survived. Barely." — back to the opening image (loop)
S('survived', { cut: 'dip', set: 'medieval', look: 'cinematic',
  camera: { move: 'dolly-in', target: 'hero', size: 'ms', az: 22, height: -0.15, eye: 1.3, handheld: 0.9 },
  cast: { hero: { pos: [[0, [0, 0, 1.3]]], rotY: [[0, 0]], clips: [{ clip: 'kneel', start: -2, end: 4, loop: false }], look: [[0, [0, 9, 6]], [1.1, 'camera', 'inOutSine']],
    face: { sad: [[0, 0.5]], worried: [[0, 0.8]], smile: [[1.0, 0], [1.4, 0.25]] }, acting: 'none' } },
  fx: [STAKE({ color: '#2b2621' }), { type: 'smoke', start: 0, end: 3, pos: [0, 0.3, -0.1], scale: 0.8, color: '#6d6a66', opacity: 0.6 }, RAIN] });
// 20 · "Would you last one day?"
S('question', { set: 'medieval', look: 'cinematic',
  camera: { move: 'dolly-out', target: 'hero', size: 'mcu', az: 15, eye: 1.12 },
  cast: { hero: { pos: [[0, [0, 0, 1.3]]], rotY: [[0, 0]], clips: [{ clip: 'kneel', start: -2, end: 4, loop: false }], look: [[0, 'camera'], [1.3, [0, 9, 6], 'inOutSine']],
    face: { worried: [[0, 0.7]], squint: [[0, 0.4]] }, acting: 'none' } },
  fx: [STAKE({ color: '#2b2621' }), RAIN, { type: 'lightning', t: dur('question') - 0.25, pos: [-3, 16, -14], to: [-2, 0, -12], seed: 4 }] });

// ---------- motion graphics ----------
const titles = [
  { t: 0.05, t1: at('barely1'), style: 'slam', text: 'YOU vs 1348', pos: [0.5, 0.075], size: 0.1, accent: '#ffb020' },
  { t: at('barely1', 0.1), t1: at('wake'), style: 'stamp', text: 'BARELY.', pos: [0.5, 0.12], size: 0.1, accent: '#ff3b2f' },
  { t: at('wake', 0.25), t1: at('nosignal', -0.1), style: 'place', text: 'ENGLAND, 1348', sub: '6 HOURS EARLIER', pos: [0.08, 0.08] },
  { t: at('nosignal', 0.15), t1: at('watch', -0.1), style: 'bubble', at: 'hero.head', text: 'NO SIGNAL' },
  { t: at('watch', 0.25), t1: at('drink', -0.05), style: 'callout', at: 'hero.lefthand', text: 'STORM · 3 PM', sub: 'WEATHER ALERT', icon: 'bolt', side: 1 },
  { t: at('drink', 1.3), t1: at('mistake'), style: 'callout', at: 'hero.mouth', text: 'DITCH WATER', icon: 'drop', side: 1 },
  { t: at('mistake', 0.05), t1: at('dysentery'), style: 'icon', icon: 'warning', pos: [0.5, 0.13], text: 'BIG MISTAKE' },
  { t: at('dysentery', 0.05), t1: at('worst'), style: 'pulse', at: 'hero.gut', beat: 100 },
  { t: at('dysentery', 0.1), t1: at('worst'), style: 'callout', at: 'hero.gut', text: 'DYSENTERY', sub: 'GUT ON FIRE', icon: 'flame', side: 1 },
  { t: at('worst', 0.1), t1: at('doctor'), style: 'wipe', text: 'THE DOCTOR', sub: 'NO MEDICAL SCHOOL', pos: [0.5, 0.12] },
  { t: at('doctor', 0.5), t1: at('sneakers'), style: 'pulse', at: 'hero.leftarm', beat: 120 },
  { t: at('doctor', 1.0), t1: at('sneakers'), style: 'counter', from: 0, to: 470, suffix: ' ml', sub: 'BLOOD DRAINED', pos: [0.5, 0.12], size: 0.09, dur: 1.2 },
  { t: at('sneakers', 0.2), t1: at('witch'), style: 'callout', at: 'hero.feet', text: 'SNEAKERS', sub: 'NOT INVENTED YET', icon: 'warning', side: -1 },
  { t: at('witch', 0.04), t1: at('stake'), style: 'burst', text: 'WITCH!', pos: [0.5, 0.14], size: 0.13 },
  { t: at('stake', 0.2), t1: at('fire'), style: 'tag', text: 'SENTENCE: BURN', pos: [0.5, 0.1], accent: '#ff3b2f' },
  { t: at('clock', 0.05), t1: at('clock', 1.15), style: 'slam', text: '2:59', pos: [0.5, 0.12], size: 0.12 },
  { t: at('clock', 1.2), t1: at('storm'), style: 'slam', text: '3:00', pos: [0.5, 0.12], size: 0.14, accent: '#ffe14d' },
  { t: at('storm', 0.06), t1: at('rain'), style: 'speedlines', mode: 'radial', center: [0.62, 0.35], density: 1 },
  { t: at('rain', 0.2), t1: at('run'), style: 'tag', text: 'FIRE: OUT', pos: [0.5, 0.1], accent: '#7fd0ff' },
  { t: at('survived', 0.1), t1: at('question'), style: 'stamp', text: 'SURVIVED', pos: [0.5, 0.075], size: 0.08, accent: '#1fa84f' },
  { t: at('question', 0.1), t1: END, style: 'kinetic', text: 'WOULD YOU|LAST|ONE DAY?', hi: ['ONE', 'DAY?'], pos: [0.5, 0.13], size: 0.1 },
  { t: 0, t1: END, style: 'timeline', pos: [0.5, 0.045], marks: [{ t: at('wake'), text: 'WAKE' }, { t: at('drink'), text: 'SICK' }, { t: at('witch'), text: 'WITCH' }, { t: at('storm'), text: '3 PM' }] },
];

module.exports = {
  title: 'You vs the Middle Ages', T, END,
  config: { targetDuration: +END.toFixed(2), set: 'medieval', look: 'cinematic', quality: 'good', effort: 'maximum', fps: 30,
    sound: { music: { mood: 'tension', bpm: 100, drops: [at('storm', 0.05)] }, sfx: true, ambience: true, ...(VO ? { voice: { url: 'vo.wav' } } : {}) },
    captions: { style: 'pop', ...(VO ? { sync: VO.words.map((w) => [w.w, w.start, w.end]) } : {}) }, letterbox: 0 },
  thumbs: [
    { shot: 14, t: 0.6, text: 'I SURVIVED\n1348', hi: ['1348'], accent: '#ffb020', face: { hero: { scream: 0.9, scared: 1 } }, size: 'mcu', side: 'left' },
    { shot: 0, t: 0.9, text: 'BARELY\nALIVE', hi: ['ALIVE'], accent: '#ff3b2f', face: { hero: { worried: 1, sad: 0.6 } }, size: 'mcu', side: 'left' },
    { shot: 11, t: 0.5, text: 'THEY CALLED\nME A WITCH', hi: ['WITCH'], accent: '#ffe14d', size: 'mcu', side: 'right' },
  ],
  cast, shots, captions: VO ? [] : [
    [0, "YOU SURVIVE THE MIDDLE AGES", ["SURVIVE"]], [1.85, "BARELY.", ["BARELY."]], [2.7, "SIX HOURS EARLIER", ["SIX"]], [3.9, "YOU WAKE UP IN 1348", ["1348"]],
    [5.5, "NO SIGNAL.", ["SIGNAL."]], [6.4, "JUST MUD AND SMOKE", ["MUD"]], [7.5, "YOUR WATCH BEEPS:", ["WATCH"]], [8.5, "STORM AT THREE", ["STORM"]],
    [9.6, "YOU'RE THIRSTY.", ["THIRSTY."]], [10.7, "YOU DRINK THE DITCH WATER", ["DITCH"]], [12.1, "BIG MISTAKE.", ["MISTAKE."]], [13.2, "DYSENTERY.", ["DYSENTERY."]],
    [14.0, "YOUR GUT IS ON FIRE", ["FIRE"]], [15.0, "BUT THAT'S NOT THE WORST PART", ["WORST"]], [16.5, "THE DOCTOR'S CURE?", ["CURE?"]], [17.6, "BLEED YOU. A WHOLE PINT.", ["BLEED", "PINT."]],
    [19.4, "THEN THEY SEE YOUR SNEAKERS", ["SNEAKERS"]], [20.7, "WITCH!", ["WITCH!"]], [21.9, "THEY TIE YOU TO A STAKE", ["STAKE"]], [23.3, "THEY LIGHT THE FIRE", ["FIRE"]],
    [24.7, "TWO FIFTY-NINE...", []], [25.9, "THREE.", ["THREE."]], [26.6, "THE STORM HITS", ["STORM"]], [27.7, "THE RAIN KILLS THE FLAMES", ["RAIN"]],
    [29.1, "THEY RUN. YOU CRAWL.", ["CRAWL."]], [30.4, "YOU SURVIVED.", ["SURVIVED."]], [31.3, "BARELY.", ["BARELY."]], [32.1, "WOULD YOU LAST ONE DAY?", ["ONE", "DAY?"]],
  ].map(([t, text, hi]) => ({ t, text, hi })), titles,
};
