// "The Hand Grabbed Back" — Harrison Okene (true story, Jascon-4, off Nigeria, May 2013). Shot starts come from the voiceover word times.
const fs = require('fs'), path = require('path');
const P = Math.PI;
const VO = JSON.parse(fs.readFileSync(path.join(__dirname, 'vo.json'), 'utf8'));
const CUES = [
  ['payoff', 'a diver'], ['hands', "dead man's"], ['grab', 'the hand'], ['earlier', 'three days'], ['cook', 'harrison cooks'], ['flip', 'a wave'], ['sink', 'it sinks'], ['upside', 'upside down'],
  ['gone', 'eleven men'], ['air', 'harrison finds'], ['out', "but it's"], ['dark', 'sixty hours'], ['light', 'then'], ['divers', 'divers'], ['reach', 'he reaches'], ['question', 'would you'],
];
const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9' -]/g, '');
const words = VO.words.map((w) => ({ w: norm(w.w), start: w.start }));
function findCue(ph, after) { const p = ph.split(' ');
  for (let i = 0; i < words.length; i++) if (words[i].start >= after - 0.05 && p.every((x, k) => words[i + k] && words[i + k].w === x)) return words[i].start;
  throw new Error('cue ' + ph); }
const T = {}; let last = 0;
for (const [id, ph] of CUES) { T[id] = id === 'payoff' ? 0 : Math.max(0, findCue(ph, last) - 0.1); last = T[id] + 0.1; }
const END = +(VO.duration + 0.5).toFixed(2);
const ids = CUES.map((c) => c[0]), dur = (id) => +((ids.indexOf(id) < ids.length - 1 ? T[ids[ids.indexOf(id) + 1]] : END) - T[id]).toFixed(3);
const at = (id, k = 0) => +(T[id] + k).toFixed(3);

// ---------- cast ----------
const cast = {
  hero: { character: 'jake', wardrobe: { top: '#d9d4c7', bottom: '#2a2e36', shoes: '#1d1a17' } },   // ship's cook
  diver: { character: 'marcus', wardrobe: { top: '#121519', bottom: '#121519', shoes: '#0b0c0e' } }, // black wetsuit
};
const DEEP = { type: 'void', id: 'deep' };                                              // seabed in the dark
const POCKET = { type: 'ocean', id: 'pocket', swell: 0.15, calm: 3, deep: '#03080a', shallow: '#173634' }; // the air pocket: black still water
const DARKWATER = { type: 'ocean', id: 'darkwater', swell: 0.15, calm: 3, deep: '#010303', shallow: '#050b0b' };
const STORM = { type: 'ocean', id: 'storm', swell: 2.2, calm: 0, deep: '#0f2c3a', shallow: '#2a5d70' };
const GALLEY = { type: 'interior', id: 'galley', wall: '#b9b6ad' };
const TUG = (o = {}) => ({ type: 'model', id: 'cargo_ship', height: 8, rotY: P / 2, ...o });
const WRECK = (o = {}) => ({ type: 'model', id: 'ship_wreck', height: 8, color: '#3c4a48', flat: true, rotY: P / 2, tilt: [[0, [0, 0, P]]], ...o });
const SILT = (o = {}) => ({ type: 'dust', color: '#9fd0c0', opacity: 0.5, count: 700, shape: [4, 2.5, 4], ...o });
const TORCH = (from, to, o = {}) => ({ type: 'beam', pos: from, to, radius: 0.7, color: '#d8f4ff', intensity: 0.28, ...o });
const GRIP = [0.12, 1.22, 0.42];                                      // where the two hands meet
const float = (x, y, z, d, a = 0.03) => [[0, [x, y, z]], [d * 0.5, [x, y + a, z], 'inOutSine'], [d, [x, y, z], 'inOutSine']];
const idle = (d) => [{ clip: 'idle', start: 0, end: d + 1 }];

const shots = [];
const S = (id, o) => shots.push({ name: id, dur: dur(id), ...o });

// 1 · PAYOFF — a diver's torch finds a limp hand in black water; his glove closes on it
S('payoff', { role: 'payoff', set: DEEP, look: 'horror', punch: [0.1],
  camera: { pos: [[0, [1.25, 1.35, 1.05]], [dur('payoff'), [0.95, 1.25, 0.95], 'inOutSine']], look: [[0, [0.1, 1.15, 0.45]]], fov: 38, handheld: 0.9 },
  cast: { hero: { pos: float(0, 0, 0, 3), rotY: [[0, 0]], clips: idle(3), swimming: true, bones: { head: [[0, [0.35, 0.2, 0.1]]] }, face: { sad: [[0, 0.3]] }, acting: 'none',
            reach: [{ hand: 'right', to: GRIP, start: 0, end: dur('payoff') }], hands: { right: 'relaxed' } },
          diver: { pos: [[0, [0.18, 0, 0.8]]], rotY: [[0, P]], clips: idle(3), swimming: true, face: { worried: [[0, 0.5]] }, look: [[0, GRIP]], acting: 'none',
            reach: [{ hand: 'right', to: GRIP, start: -0.4, end: dur('payoff') + 1 }], hands: { right: 'soft' } } },
  fx: [TORCH([0.6, 1.9, 1.6], [0, 1.0, 0.2]), SILT()], sfx: [{ t: 0, type: 'subdrop', gain: 0.9 }] });
// 1b · "…dead man's hand." — close on the glove closing around limp fingers
S('hands', { set: DEEP, look: 'horror',
  camera: { pos: [[0, [0.75, 1.32, 0.75]], [dur('hands'), [0.62, 1.28, 0.66], 'inOutSine']], look: [[0, GRIP]], fov: 34, handheld: 0.7 },
  cast: { hero: { pos: float(0, 0, 0, 2), rotY: [[0, 0]], clips: idle(3), swimming: true, bones: { head: [[0, [0.35, 0.2, 0.1]]] }, acting: 'none',
            reach: [{ hand: 'right', to: GRIP, start: 0, end: dur('hands') + 1 }], hands: { right: 'relaxed' } },
          diver: { pos: [[0, [0.18, 0, 0.8]]], rotY: [[0, P]], clips: idle(3), swimming: true, look: [[0, GRIP]], face: { worried: [[0, 0.5]] }, acting: 'none',
            reach: [{ hand: 'right', to: GRIP, start: -0.5, end: dur('hands') + 1 }], hands: { right: [[0, 'soft'], [0.5, 'grip']] } } },
  fx: [TORCH([0.6, 1.9, 1.6], [0, 1.0, 0.2]), SILT()] });
// 2 · "The hand grabs back." — his fingers clamp; the diver jolts
S('grab', { set: DEEP, look: 'horror', punch: [0.45], freeze: [[0.5, 0.25]],
  camera: { pos: [[0, [0.85, 1.2, 0.75]], [0.45, [0.6, 1.16, 0.68], 'outExpo']], look: [[0, GRIP]], fov: 34, handheld: 1.2, shakes: [0.45] },
  cast: { hero: { pos: float(0, 0, 0, 2), rotY: [[0, 0]], clips: idle(3), swimming: true, bones: { head: [[0, [0.35, 0.2, 0.1]], [0.5, [0.1, 0.1, 0], 'outCubic']] }, acting: 'none',
            reach: [{ hand: 'right', to: GRIP, start: 0, end: dur('grab') }], hands: { right: [[0, 'relaxed'], [0.42, 'fist']] } },
          diver: { pos: [[0, [0.18, 0, 0.8]], [0.5, [0.18, 0, 0.84], 'outCubic']], rotY: [[0, P]], clips: idle(3), swimming: true, look: [[0, GRIP]], face: { shock: [[0.45, 0], [0.6, 1, 'outBack']] }, acting: 'none',
            reach: [{ hand: 'right', to: GRIP, start: 0, end: dur('grab') }], hands: { right: 'grip' } } },
  fx: [TORCH([0.6, 1.9, 1.6], [0, 1.0, 0.2]), SILT()], sfx: [{ t: 0.45, type: 'impact', gain: 1 }] });
// 3 · "Three days earlier." — the tug in a night swell
S('earlier', { cast: {}, cut: 'glitch', set: STORM, look: 'cinematic',
  camera: { pos: [[0, [-15, 3, 20]], [dur('earlier'), [-12, 3.4, 18], 'inOutSine']], look: [[0, [0, 3, 0]]], fov: 34, handheld: 0.6 },
  fx: [TUG({ p: [[0, [0, -1, 0]]], tilt: [[0, [0, 0, 0.04]], [dur('earlier') / 2, [0, 0, -0.05], 'inOutSine'], [dur('earlier'), [0, 0, 0.04], 'inOutSine']] }), { type: 'rain', count: 3000, opacity: 0.3 }],
  sfx: [{ t: 0.1, type: 'swell', gain: 0.6 }] });
// 4 · "Harrison cooks on a tugboat." — the galley rolls under him
S('cook', { cut: 'whip', set: GALLEY, look: 'warm-film',
  camera: { move: 'push', target: 'hero', size: 'ms', az: 30, handheld: 1.1, roll: 0.06 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0.3]], clips: [{ clip: 'fix', start: 0, end: 3 }], hands: { both: 'pinch' }, face: { squint: [[0, 0.3]], smile: [[0.3, 0.25]] },
    look: [[0, [0.3, 0.3, 0.7]]] } } });
// 5 · "A wave flips it over."
S('flip', { cast: {}, cut: 'smash', set: STORM, look: 'horror', punch: [0.35],
  camera: { pos: [[0, [-13, 2.2, 15]]], look: [[0, [0, 3, 0]]], fov: 36, handheld: 1.4, shakes: [0.35] },
  fx: [TUG({ p: [[0, [0, -1, 0]], [dur('flip'), [0, -1.8, 0], 'inCubic']], tilt: [[0, [0, 0, 0.05]], [0.25, [0, 0, -0.1], 'inOutSine'], [dur('flip'), [0, 0, 2.4], 'inCubic']] }),
    { type: 'splash', t: 0.3, pos: [-2, 0, 2], dir: [0.4, 1, 0.3], scale: 2.4 }, { type: 'rain', count: 3000, opacity: 0.3 }],
  sfx: [{ t: 0.3, type: 'boom', gain: 0.4 }] });
// 6 · "It sinks thirty meters." — the hull falls past us into the dark
S('sink', { cast: {}, cut: 'whip', set: DEEP, look: 'horror',
  camera: { pos: [[0, [-12, 4, 14]], [dur('sink'), [-12, 1.5, 13], 'outSine']], look: [[0, [0, 5, 0]], [dur('sink'), [0, 2.5, 0], 'outSine']], fov: 38, handheld: 0.5 },
  fx: [WRECK({ p: [[0, [0, 9, 0]], [dur('sink'), [0, 3.3, 0], 'outCubic']], tilt: [[0, [0.1, 0, P - 0.3]], [dur('sink'), [0, 0, P], 'outCubic']] }), SILT({ shape: [10, 6, 10], count: 900 }),
    TORCH([2, 16, 4], [0, 0, 0], { radius: 4, intensity: 0.2, color: '#7fb8c4' })],
  sfx: [{ t: 0.05, type: 'subdrop', gain: 0.8 }] });
// 7 · "Upside down." — the galley, rolled 180°; he tumbles onto the ceiling
S('upside', { cut: 'spin', set: GALLEY, look: 'cinematic',
  camera: { move: 'static', target: 'hero', size: 'mls', az: 25, roll: P, handheld: 0.8 },
  cast: { hero: { pos: [[0, [0, 0.5, 0]], [0.35, [0, 0, 0], 'inCubic']], rotY: [[0, 0.2]], rotZ: [[0, 0.5], [0.35, 0, 'outCubic']], clips: [{ clip: 'fix', start: 0, end: 3 }],
    face: { scream: [[0, 0.8]], worried: [[0.4, 0.9]] }, gestures: [{ type: 'shield', start: 0, end: 0.6 }], acting: 'none' } },
  sfx: [{ t: 0.35, type: 'hit', gain: 0.8 }] });
// 8 · "Eleven men are gone." — the wreck on the seabed, a cold shaft from far above
S('gone', { cast: {}, cut: 'dip', set: DEEP, look: 'horror', time: [[0, 0], [dur('gone'), dur('gone') * 0.6]],
  camera: { pos: [[0, [6, 0.35, 7.5]], [dur('gone'), [5.2, 0.35, 6.4], 'inOutSine']], look: [[0, [0, 3.4, 0]]], fov: 42 },
  fx: [WRECK({ p: [[0, [0, 3.3, 0]]], tilt: [[0, [0, 0, P]]] }), SILT({ shape: [10, 4, 10], count: 900 }), TORCH([2, 16, 4], [0, 0, 0], { radius: 4, intensity: 0.2, color: '#7fb8c4' })] });
// 9 · "Harrison finds a pocket of air." — his head breaks the black surface, a gasp
S('air', { cut: 'smash', set: POCKET, look: 'horror', punch: [0.15],
  camera: { pos: [[0, [0.8, 0.42, 1.7]], [dur('air'), [0.7, 0.38, 1.5], 'inOutSine']], look: [[0, [0, 0.1, 0.3]]], fov: 40, handheld: 0.9 },
  cast: { hero: { pos: [[0, [0, -1.35, 0]], [0.3, [0, -0.92, 0], 'outCubic'], [dur('air'), [0, -0.95, 0], 'inOutSine']], rotY: [[0, 0.5]], clips: [{ clip: 'swim', start: 0, end: 3, speed: 0.4 }], swimming: true,
    bones: { head: [[0, [-0.4, 0, 0]], [0.6, [-0.15, 0, 0], 'outCubic']] }, face: { scream: [[0.2, 0.8], [0.8, 0.3]], worried: [[0.5, 0.8]] }, acting: 'none' } },
  fx: [{ type: 'splash', t: 0.25, pos: [0, 0, 0], dir: [0, 1, 0], scale: 0.4 }, TORCH([0.4, 3, -1.5], [0, 0, 0.2], { radius: 0.9, intensity: 0.12, color: '#a8c8c8' })],
  sfx: [{ t: 0.25, type: 'splash', gain: 0.8 }] });
// 10 · "But it's running out." — tight on the face, each breath shorter
S('out', { cut: 'zoom', set: POCKET, look: 'horror',
  camera: { pos: [[0, [0.6, 0.32, 1.32]], [dur('out'), [0.52, 0.3, 1.18], 'inOutSine']], look: [[0, [0, 0.14, 0.3]]], fov: 36, handheld: 0.7 },
  cast: { hero: { pos: float(0, -0.95, 0, 2, 0.02), rotY: [[0, 0.5]], clips: [{ clip: 'swim', start: 0, end: 3, speed: 0.3 }], swimming: true,
    bones: { head: [[0, [-0.15, 0, 0]], [0.6, [-0.3, 0.15, 0], 'inOutSine']] }, look: [[0, [0, 2, 0]], [0.6, [-1, 2.2, -1], 'inOutSine']], face: { worried: [[0, 0.9]], squint: [[0.3, 0.6]] }, acting: 'none' } },
  fx: [TORCH([0.4, 3, -1.5], [0, 0, 0.2], { radius: 0.9, intensity: 0.12, color: '#a8c8c8' })] });
// 11 · "Sixty hours in total darkness." — pull far back: a speck of a face in a black void
S('dark', { cut: 'dip', set: DARKWATER, look: 'cinematic', time: [[0, 0], [dur('dark'), dur('dark') * 0.7]],
  camera: { pos: [[0, [1.2, 0.7, 2]], [dur('dark'), [2.6, 1.2, 4.6], 'inOutSine']], look: [[0, [0, 0.25, 0]]], fov: 40 },
  cast: { hero: { pos: float(0, -0.95, 0, 3, 0.02), rotY: [[0, 0.5]], clips: [{ clip: 'swim', start: 0, end: 4, speed: 0.25 }], swimming: true, face: { sad: [[0, 0.7]], worried: [[0, 0.5]] }, acting: 'none' } },
  fx: [{ type: 'beam', pos: [-0.5, 3, -1.5], to: [0, 0.2, 0.3], radius: 0.5, color: '#bfe6ff', intensity: 0.12 }] });
// 12 · "Then, a light." — a glow wakes under the water; his eyes go first
S('light', { set: POCKET, look: 'cinematic', punch: [0.6],
  camera: { pos: [[0, [0.6, 0.3, 1.3]], [dur('light'), [0.54, 0.29, 1.2], 'inOutSine']], look: [[0, [0, 0.14, 0.3]]], fov: 34, handheld: 0.5 },
  cast: { hero: { pos: float(0, -0.95, 0, 2, 0.02), rotY: [[0, 0.5]], clips: [{ clip: 'swim', start: 0, end: 3, speed: 0.3 }], swimming: true,
    look: [[0, [-1, 2, -1]], [0.4, [-0.6, 1.6, -0.4], 'outCubic']], face: { sad: [[0, 0.5], [0.4, 0]], shock: [[0.45, 0], [0.7, 0.8, 'outBack']] }, acting: 'none' } },
  fx: [{ type: 'beam', pos: [1.4, -0.9, 2.6], to: [0, 0.1, 0.2], radius: 1.2, color: '#d8f4ff', intensity: 0.45, start: 0.05 }, { type: 'beam', pos: [-0.5, 3, -1.5], to: [0, 0.2, 0.3], radius: 0.5, color: '#bfe6ff', intensity: 0.12 }],
  sfx: [{ t: 0.3, type: 'riser', gain: 0.6 }] });
// 13 · "Divers, sent for the bodies." — the diver glides through the wreck, torch sweeping
S('divers', { cut: 'whip', set: DEEP, look: 'cinematic',
  camera: { pos: [[0, [2.3, 1.3, 0.2]], [dur('divers'), [2.2, 1.3, 1.2], 'linear']], look: [[0, [0, 1.55, -0.2]], [dur('divers'), [0, 1.55, 0.9], 'linear']], fov: 40, handheld: 0.6 },
  cast: { diver: { pos: [[0, [0, 0.5, -0.9]], [dur('divers'), [0, 0.5, 0.7], 'linear']], rotY: [[0, 0]], rotX: [[0, 0.5]], clips: idle(3), swimming: true, gestures: [{ type: 'point', start: 0, end: dur('divers'), side: 'right', to: [0.4, 0.8, 4] }], face: { worried: [[0, 0.4]] }, acting: 'none',
    look: [[0, [0.8, 0.8, 3]], [1.2, [-0.6, 0.8, 3], 'inOutSine']] } },
  fx: [TORCH([-0.2, 1.4, 1.2], [0.6, 0.4, 4.5], { radius: 0.9, intensity: 0.35 }), TORCH([0, 6, 1], [0, 0, 0], { radius: 3, intensity: 0.25, color: '#7fb8c4' }), SILT(), WRECK({ height: 7, p: [[0, [-5.5, 3.0, -3]]] })] });
// 14 · "He reaches out." — his hand rises into the beam (hands off to the opening shot)
S('reach', { cut: 'zoom', set: DEEP, look: 'horror',
  camera: { pos: [[0, [0.75, 1.5, 1.7]], [dur('reach'), [0.68, 1.48, 1.5], 'inOutSine']], look: [[0, [0.05, 1.35, 0.3]]], fov: 38, handheld: 0.7 },
  cast: { hero: { pos: float(0, 0, 0, 2), rotY: [[0, 0]], clips: idle(3), swimming: true, bones: { head: [[0, [0.3, 0.15, 0.1]]] }, face: { sad: [[0, 0.4]], worried: [[0.3, 0.6]] }, acting: 'none',
    reach: [{ hand: 'right', to: GRIP, start: 0.15, end: dur('reach') + 1 }], hands: { right: [[0, 'relaxed'], [0.5, 'soft']] } } },
  fx: [TORCH([0.6, 1.9, 1.6], [0, 1.0, 0.2]), SILT()] });
// 15 · "Would you have held on?" — the grip again (loops into shot 1)
S('question', { cut: 'flash', set: DEEP, look: 'horror',
  camera: { pos: [[0, [1.05, 1.3, 1.0]], [dur('question'), [1.25, 1.35, 1.05], 'inOutSine']], look: [[0, [0.1, 1.15, 0.45]]], fov: 38, handheld: 0.6 },
  cast: { hero: { pos: float(0, 0, 0, 3), rotY: [[0, 0]], clips: idle(3), swimming: true, bones: { head: [[0, [0.15, 0.1, 0]]] }, face: { worried: [[0, 0.5]] }, acting: 'none',
            reach: [{ hand: 'right', to: GRIP, start: 0, end: dur('question') + 1 }], hands: { right: 'fist' } },
          diver: { pos: [[0, [0.18, 0, 0.84]]], rotY: [[0, P]], clips: idle(3), swimming: true, look: [[0, 'hero']], face: { shock: [[0, 0.6]] }, acting: 'none',
            reach: [{ hand: 'right', to: GRIP, start: 0, end: dur('question') + 1 }], hands: { right: 'grip' } } },
  fx: [TORCH([0.6, 1.9, 1.6], [0, 1.0, 0.2]), SILT()] });

// ---------- motion graphics: one accent (torch cyan), slam / stamp / place family ----------
const A = '#5fe3ff';
const titles = [
  { t: 0.05, t1: at('grab', 0.4), style: 'slam', text: 'HE WAS\nNOT DEAD', pos: [0.5, 0.1], size: 0.09, accent: A },
  { t: at('earlier', 0.1), t1: at('cook'), style: 'place', text: 'OFF NIGERIA', sub: 'MAY 26, 2013', pos: [0.08, 0.08] },
  { t: at('cook', 0.3), t1: at('flip'), style: 'stamp', text: 'HARRISON OKENE', sub: "SHIP'S COOK · AGE 29", pos: [0.5, 0.12], size: 0.065 },
  { t: at('sink', 0.15), t1: at('upside', -0.25), style: 'counter', from: 0, to: 30, suffix: ' M', text: 'DEPTH', pos: [0.5, 0.12] },
  { t: at('gone', 0.15), t1: at('air', -0.25), style: 'counter', from: 0, to: 11, suffix: ' OF 12', text: 'CREW LOST', pos: [0.5, 0.12] },
  { t: at('air', 0.5), t1: at('out'), style: 'callout', at: 'hero.head', text: 'AIR POCKET', sub: '1.2 M HIGH', side: 1 },
  { t: at('out', 0.15), t1: at('dark', -0.25), style: 'stamp', text: 'AIR RUNNING OUT', pos: [0.5, 0.12], size: 0.07 },
  { t: at('dark', 0.1), t1: at('light', -0.2), style: 'counter', from: 0, to: 60, suffix: ' HRS', text: 'IN THE DARK', pos: [0.5, 0.12] },
  { t: at('divers', 0.2), t1: at('reach'), style: 'stamp', text: 'RECOVERY TEAM', sub: 'SENT FOR BODIES', pos: [0.5, 0.12], size: 0.07 },
  { t: at('question', 0.1), t1: END, style: 'kinetic', text: 'WOULD YOU|HAVE|HELD ON?', hi: ['HELD', 'ON?'], pos: [0.5, 0.1], size: 0.1 },
];

module.exports = {
  title: 'The Hand Grabbed Back', T, END,
  config: { targetDuration: END, set: DEEP, look: 'horror', quality: 'good', effort: 'maximum', fps: 30, accent: A,
    sound: { music: { mood: 'tense', bpm: 84, drops: [at('grab', 0.45), at('light', 0.3)] }, sfx: true, ambience: true, voice: { url: 'vo.wav' } },
    captions: { style: 'pop', sync: VO.words.map((w) => [w.w, w.start, w.end]) }, letterbox: 0 },
  thumbs: [
    { shot: 1, t: 0.6, text: 'THE HAND\nGRABBED BACK', hi: ['BACK'], accent: A, side: 'left' },
    { shot: 8, t: 0.8, text: '60 HOURS\nUNDERWATER', hi: ['UNDERWATER'], accent: A, face: { hero: { worried: 1, scream: 0.4 } }, side: 'left' },
  ],
  cast, shots, captions: [], titles,
};
