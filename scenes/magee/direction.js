// "He Fell 20,000 Feet With No Parachute" — Alan Magee, 3 Jan 1943 (true story). Built into magee.html by build.js.
const fs = require('fs'), path = require('path');
const P = Math.PI;
let VO = null; try { VO = JSON.parse(fs.readFileSync(path.join(__dirname, 'vo.json'), 'utf8')); } catch {}

const CUES = [
  ['payoff', 'he fell twenty', 0], ['nochute', 'no parachute', 1.6], ['lived', 'and lived', 2.74], ['date', 'january', 3.77], ['bomber', 'a bomber over', 5.26],
  ['flak', 'flak rips', 7.38], ['fire', 'fire everywhere', 8.38], ['chute', 'his parachute', 9.54], ['shredded', 'shredded', 10.43], ['jump', 'so he jumps', 11.26],
  ['speed', 'a hundred and', 12.81], ['blackout', 'he blacks out', 14.8], ['glass', 'then', 15.94], ['station', 'a train station', 17.23],
  ['soldiers', 'soldiers cut him', 19.28], ['alive', 'alive', 20.88], ['question', 'would you have', 21.69],
];
const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9' -]/g, '');
const words = VO ? VO.words.map((w) => ({ w: norm(w.w), start: w.start, end: w.end })) : null;
function findCue(phrase, after) {
  const p = phrase.split(' ');
  for (let i = 0; i < words.length; i++) if (words[i].start >= after - 0.05 && p.every((x, k) => words[i + k] && words[i + k].w === x)) return words[i].start;
  return null;
}
const T = {}; let last = 0;
for (const [id, ph, est] of CUES) { const t = words ? findCue(ph, last) : null; T[id] = id === 'payoff' ? 0 : (t != null ? Math.max(0, t - 0.08) : est); last = T[id]; }
const END = 25.0;
const ids = CUES.map((c) => c[0]), dur = (id) => +((ids.indexOf(id) < ids.length - 1 ? T[ids[ids.indexOf(id) + 1]] : END) - T[id]).toFixed(3);
const at = (id, k = 0) => +(T[id] + k).toFixed(3);
const wordAt = (w, after = 0) => { const i = words.findIndex((x) => x.w === w && x.start >= after); return i < 0 ? null : words[i].start; };

// ---------- cast ----------
const cast = {
  hero: { character: 'jake', wardrobe: { top: '#5a3b26', bottom: '#4a4a36', shoes: '#2a2018' }, hair: '#3a2616' },   // A-2 leather flight jacket, olive trousers
  s1: { character: 'marcus', wardrobe: { top: '#5d6150', bottom: '#565a4a', shoes: '#151515' } },                    // soldiers in field grey (no insignia)
  s2: { character: 'ryan', wardrobe: { top: '#5d6150', bottom: '#565a4a', shoes: '#151515' } },
};

// ---------- reusable pieces ----------
const B17 = (o = {}) => ({ type: 'model', id: 'b17', pos: [0, 0, 0], p: [[0, [0, 0, 0]]], rotY: P, height: 5.8, ...o });   // nose → −z, clouds stream past it
// engine fire positions (world) for the bomber at the origin, rotY π, right wing outer engine
const ENG = [7.4, -0.05, -4.2];
const FALL_BONES = {   // skydiver arch (belly to earth): arms up and out, knees bent, head up
  leftupleg: [[0, [-0.1, 0, 0.12]]], rightupleg: [[0, [-0.1, 0, -0.12]]], leftleg: [[0, [-0.45, 0, 0]]], rightleg: [[0, [-0.45, 0, 0]]],
  spine: [[0, [-0.25, 0, 0]]], neck: [[0, [-0.35, 0, 0]]], head: [[0, [-0.3, 0, 0]]],
};
const flail = (d, a = 0.25) => ({ leftarm: Array.from({ length: Math.ceil(d / 0.3) + 1 }, (_, i) => [i * 0.3, [(i % 2 ? 1 : -1) * a, 0, 0], 'inOutSine']),
  rightarm: Array.from({ length: Math.ceil(d / 0.3) + 1 }, (_, i) => [i * 0.3 + 0.12, [(i % 2 ? -1 : 1) * a, 0, 0], 'inOutSine']) });
const HANG_ROOT = [2.0, 7.86, -3];            // feet end of the body; hips rest on the steel girder at x 3, y 7.5
const HANG = {                                 // draped face-down over the girder, limp
  rotY: [[0, P / 2]], rotX: [[0, P / 2]],
  bones: { leftupleg: [[0, [-1.15, 0, 0.08]]], rightupleg: [[0, [-1.0, 0, -0.1]]], leftleg: [[0, [0.35, 0, 0]]], rightleg: [[0, [0.55, 0, 0]]],
    spine: [[0, [0.35, 0, 0]]], spine1: [[0, [0.35, 0, 0]]], neck: [[0, [-0.48, 0.17, 0]]], head: [[0, [-0.8, 0.35, 0]]],
    leftarm: [[0, [-1.45, 0, 0.12]]], rightarm: [[0, [-1.35, 0, -0.15]]], spine2: [[0, [0.25, 0, 0]], [0.8, [0.29, 0, 0.03], 'inOutSine'], [1.6, [0.22, 0, -0.03], 'inOutSine'], [2.4, [0.27, 0, 0.02], 'inOutSine'], [3.2, [0.24, 0, 0], 'inOutSine']], leftforearm: [[0, [0, 0, 0.25]]], rightforearm: [[0, [0, 0, -0.2]]] },
};

const shots = [];
const S = (id, o) => shots.push({ name: id, dur: dur(id), ...o });

// 1 · PAYOFF — draped over the girders under the smashed glass roof
S('payoff', { role: 'payoff', set: 'station', look: 'cinematic', punch: [0.1], micro: { level: [[0, 0]] },
  camera: { pos: [[0, [7.5, 0.4, -5.4]], [dur('payoff'), [5.6, 5.2, -1.4], 'outCubic']], look: [[0, [3.3, 7.4, -3]], [dur('payoff'), [3.4, 7.1, -3], 'outCubic']], fov: [[0, 50], [dur('payoff'), 34, 'outExpo']], handheld: 0.6 },
  cast: { hero: { pos: [[0, HANG_ROOT]], ...HANG, clips: [{ clip: 'idle', start: 0, end: 3 }], face: { worried: [[0, 0.6]], squint: [[0, 0.7]] }, look: [[0, [0.5, 0, 0]]], acting: 'none' } },
  fx: [{ type: 'ice-shatter', t: 0.02, pos: [3, 10.4, -3], scale: 1.3 }, { type: 'beam', pos: [3, 11, -3], to: [2.6, 0, -1.5], radius: 1.4, color: '#eef4f8', intensity: 0.5 },
    { type: 'dust', count: 300, pos: [2.5, 7, -2] }],
  sfx: [{ t: 0, type: 'impact', gain: 1 }, { t: 0.02, type: 'glitch', gain: 0.5 }] });
// 2 · "No parachute." — freefall, clouds tearing past
S('nochute', { cut: 'whip', set: 'sky', look: 'clean-cg', micro: { level: [[0, 0]], flow: 1 }, afterimage: 0.2,
  camera: { pos: [[0, [1.9, -1.3, 2.4]], [dur('nochute'), [1.5, -1.0, 1.9], 'inOutSine']], look: [[0, [0, 0.45, 0.5]]], fov: [[0, 42]], handheld: 1.4 },
  cast: { hero: { pos: [[0, [0, 0, -0.9]]], rotX: [[0, 1.25], [dur('nochute'), 1.4, 'inOutSine']], rotZ: [[0, -0.25], [dur('nochute'), 0.2, 'inOutSine']], rotY: [[0, 0]],
    clips: [{ clip: 'jumploop', start: 0, end: 3 }], bones: { ...FALL_BONES, ...flail(dur('nochute'), 0.3) }, gestures: [{ type: 'armsout', start: 0, end: dur('nochute'), amount: 1 }],
    face: { scream: [[0, 0.6], [0.4, 0.9, 'outBack']], shock: [[0, 0.6]] }, look: [[0, 'camera']], acting: 'none' } },
  sfx: [{ t: 0, type: 'whoosh', gain: 0.9 }] });
// 3 · "And lived." — close on his face hanging in the girders, eyes open
S('lived', { cut: 'smash', set: 'station', look: 'cinematic', micro: { level: [[0, 0]] },
  camera: { pos: [[0, [5.0, 5.8, -1.5]], [dur('lived'), [4.8, 6.0, -1.7], 'inOutSine']], look: [[0, [3.7, 7.25, -3.0]]], fov: [[0, 32], [dur('lived'), 28, 'inOutSine']] },
  cast: { hero: { pos: [[0, HANG_ROOT]], ...HANG, clips: [{ clip: 'idle', start: 0, end: 3 }],
    face: { squint: [[0, 0.9], [0.45, 0.1, 'outCubic']], worried: [[0.3, 0], [0.7, 0.7, 'outBack']] }, look: [[0, [3.4, 0, -1]], [0.5, 'camera', 'inOutSine']], acting: 'none' } },
  fx: [{ type: 'dust', count: 260, pos: [3, 7, -2] }],
  sfx: [{ t: 0.05, type: 'heartbeat', gain: 0.8 }] });
// 4 · "January, 1943." — the bomber bursts out of the clouds
S('date', { cut: 'whip', set: 'sky', look: 'cinematic', micro: { level: [[0, 1]], flow: 0 },
  camera: { pos: [[0, [-17, -5, -24]], [dur('date'), [-15, -3, -19], 'inOutSine']], look: [[0, [0, 0, -2]], [dur('date'), [0, 0.5, 0], 'inOutSine']], fov: [[0, 34]] },
  cast: {}, fx: [B17({ rotZ: [[0, 0.06], [dur('date'), -0.02, 'inOutSine']] }), { type: 'flak', t: 1.1, pos: [-8, 6, -20], scale: 2.6 }] });
// 5 · "A bomber over France." — tracking alongside
S('bomber', { set: 'sky', look: 'cinematic', micro: { level: [[0, 1]], flow: 0 },
  camera: { pos: [[0, [-24, 2.5, 4]], [dur('bomber'), [-27, 2.2, -6], 'inOutSine']], look: [[0, [0, 0, 0]], [dur('bomber'), [0, 0, -2], 'inOutSine']], fov: [[0, 46]], handheld: 0.5 },
  cast: {}, fx: [B17({ rotZ: [[0, -0.03], [dur('bomber'), 0.04, 'inOutSine']] }),
    { type: 'flak', t: 0.35, pos: [-4, 6, -14], scale: 2.6 }, { type: 'flak', t: 1.1, pos: [7, -3, -9], scale: 2.6 }, { type: 'flak', t: 1.75, pos: [-2, 5, 8], scale: 2.4 }] });
// 6 · "Flak rips it open." — a shell bursts on the right wing
S('flak', { cut: 'flash', set: 'sky', look: 'cinematic', micro: { level: [[0, 1]], flow: 0 }, impact: [0.12], punch: [0.14],
  camera: { pos: [[0, [-6, 5.5, 13]], [dur('flak'), [-6.8, 6.2, 14.2], 'outCubic']], look: [[0, [4, 0, -3]]], fov: [[0, 38]], shakes: [[0.12, 1.2]] },
  cast: {}, fx: [B17({ rotZ: [[0, 0], [0.15, -0.12, 'outCubic'], [dur('flak'), -0.2, 'inOutSine']] }),
    { type: 'flak', t: 0.1, pos: [9.5, 1.2, -6], scale: 1.7 }, { type: 'explosion', t: 0.12, pos: ENG, scale: 0.55, seed: 3 },
    { type: 'fire', start: 0.15, end: 2, pos: ENG, scale: 0.9 }, { type: 'smoke', start: 0.2, end: 2, pos: ENG, scale: 0.8, color: '#1e1b18', opacity: 0.85, wind: [0, 0, 9] }],
  sfx: [{ t: 0.1, type: 'boom', gain: 1 }] });
// 7 · "Fire everywhere." — inside the waist of the bomber
S('fire', { cut: 'smash', set: 'void', look: 'cinematic', micro: { level: 1, flow: 0 },
  camera: { pos: [[0, [-0.3, 1.45, 2.6]], [dur('fire'), [-0.25, 1.4, 2.1], 'inOutSine']], look: [[0, [0.15, 1.2, -0.4]]], fov: [[0, 44]], handheld: 1.3, shakes: [[0.1, 0.6], [0.7, 0.5]] },
  cast: { hero: { pos: [[0, [0.05, 0, -0.6]], [0.35, [0.05, 0, -0.85], 'outCubic']], rotY: [[0, 0.35], [0.5, 0.0, 'outCubic']], bones: { spine: [[0, [0, 0, 0]], [0.15, [-0.15, 0, 0], 'outCubic'], [0.6, [-0.05, 0, 0], 'inOutSine']] }, clips: [{ clip: 'idle', start: 0, end: 3 }],
    gestures: [{ type: 'shield', start: 0.05, end: dur('fire') }], face: { shock: [[0, 0.5], [0.2, 1, 'outBack']], squint: [[0.4, 0.5]] }, look: [[0, [0.6, 1.4, -2.2]]] } },
  fx: [{ type: 'model', id: 'b17_cabin', pos: [0, 0, 0], height: 2.7, p: [[0, [0, -0.4, 0]]] }, { type: 'fire', start: 0, end: 2, pos: [0.55, 0.05, -2.3], scale: 0.7 }, { type: 'fire', start: 0.2, end: 2, pos: [-0.6, 0.05, -2.8], scale: 0.5 },
    { type: 'sparks', t: 0.12, pos: [0.4, 1.9, -1.4], dir: [0, -1, 0.5], spread: 0.7, count: 140 }, { type: 'smoke', start: 0, end: 2, pos: [0, 1.6, -2.4], scale: 0.5, color: '#2a2622', opacity: 0.6 }, { type: 'embers', count: 160, pos: [0, 1.2, -1] }],
  sfx: [{ t: 0.1, type: 'hit', gain: 0.7 }] });
// 8 · "His parachute?" — the chute pack on the floor, his hand reaching in
S('chute', { cut: 'zoom', set: 'void', look: 'cinematic', micro: { level: 1, flow: 0 },
  camera: { pos: [[0, [0.55, 1.4, 0.55]], [dur('chute'), [0.46, 1.34, 0.36], 'inOutSine']], look: [[0, [0.08, 1.12, -0.42]]], fov: [[0, 40]], handheld: 0.7 },
  cast: { hero: { pos: [[0, [0.05, 0, -0.8]]], rotY: [[0, 0.1]], clips: [{ clip: 'idle', start: 0, end: 3 }],
    reach: [{ hand: 'right', to: [0.2, 1.12, -0.42], start: 0, end: dur('chute') }, { hand: 'left', to: [-0.06, 1.1, -0.44], start: 0, end: dur('chute') }],
    hands: { both: 'grip' }, look: [[0, [0.08, 1.1, -0.42]]], face: { worried: [[0, 0.6], [0.4, 0.9, 'outBack']] } } },
  fx: [{ type: 'model', id: 'b17_cabin', pos: [0, 0, 0], height: 2.7, p: [[0, [0, -0.4, 0]]] }, { type: 'model', id: 'chute_pack', pos: [0.07, 0, -0.4], p: [[0, [0, 0.97, 0]], [dur('chute'), [0, 1.0, 0], 'inOutSine']], height: 0.28, rotY: 0 },
    { type: 'embers', count: 90, pos: [0.1, 1.2, -0.6] }, { type: 'fire', start: 0, end: 2, pos: [-0.7, 0.05, -2.6], scale: 0.4 }] });
// 9 · "Shredded." — his face as he understands
S('shredded', { cut: 'smash', set: 'void', look: 'cinematic', micro: { level: 1, flow: 0 }, punch: [0.08],
  camera: { pos: [[0, [1.0, 1.0, 0.4]], [dur('shredded'), [0.9, 1.0, 0.25], 'inOutSine']], look: [[0, [0.05, 0.95, -0.95]]], fov: [[0, 38]], handheld: 0.8 },
  cast: { hero: { pos: [[0, [0.05, 0, -0.95]]], rotY: [[0, 0.2]], clips: [{ clip: 'kneel', start: -2, end: 3, loop: false }], gestures: [{ type: 'headhold', start: 0.1, end: dur('shredded') }],
    face: { shock: [[0, 0.4], [0.15, 1, 'outBack']], sad: [[0.4, 0], [0.8, 0.6]] }, look: [[0, [0.2, 0.15, -0.2]], [0.4, [0.6, 1.2, 0.5], 'inOutSine']] } },
  fx: [{ type: 'model', id: 'b17_cabin', pos: [0, 0, 0], height: 2.7, p: [[0, [0, -0.4, 0]]] }, { type: 'embers', count: 120, pos: [0, 1, -0.6] }],
  sfx: [{ t: 0.08, type: 'subdrop', gain: 0.8 }] });
// 10 · "So he jumps anyway." — out of the waist window of the burning bomber
S('jump', { cut: 'whip', set: 'sky', look: 'cinematic', micro: { level: [[0, 1]], flow: 0 }, punch: [0.6],
  camera: { pos: [[0, [6.5, -1.2, 7.5]], [dur('jump'), [7.5, -3.8, 9.0], 'inOutSine']], look: [[0, [1.6, -0.4, 2.0]], [dur('jump'), [3.2, -3.6, 3.2], 'inOutSine']], fov: [[0, 46]], handheld: 0.9 },
  cast: { hero: { pos: [[0, [1.15, -0.55, 2.55]], [0.25, [1.6, -0.45, 2.65], 'outCubic'], [dur('jump'), [3.4, -4.6, 3.9], 'inQuad']],
    rotY: [[0, P / 2]], rotX: [[0, 0], [dur('jump'), 1.2, 'inCubic']], rotZ: [[0, 0], [dur('jump'), -0.5, 'inCubic']],
    clips: [{ clip: 'jump', start: 0, end: 0.4, loop: false }, { clip: 'jumploop', start: 0.3, end: 3, fade: 0.25 }], bones: flail(dur('jump'), 0.4), face: { scared: [[0, 0.6]], scream: [[0.4, 0.8]] }, acting: 'none' } },
  fx: [B17({ rotZ: [[0, -0.2]] }), { type: 'fire', start: 0, end: 2, pos: [3.6, -0.05, -4.6], scale: 0.9 }, { type: 'smoke', start: 0, end: 2, pos: [3.6, -0.05, -4.6], scale: 0.8, color: '#1e1b18', opacity: 0.85, wind: [0, 0, 9] }],
  sfx: [{ t: 0.15, type: 'swoosh', gain: 0.8 }] });
// 11 · "A hundred and twenty miles an hour." — speed counter, tumbling
S('speed', { cut: 'zoom', set: 'sky', look: 'clean-cg', micro: { level: [[0, 0]], flow: 1.2 }, afterimage: 0.2, punch: [1.1],
  camera: { pos: [[0, [0.8, -2.6, 2.8]], [dur('speed'), [0.5, -2.2, 2.3], 'inOutSine']], look: [[0, [0, 0, 0.2]]], fov: [[0, 46], [dur('speed'), 40, 'inOutSine']], handheld: 1.6 },
  cast: { hero: { pos: [[0, [0, 0, -0.9]]], rotX: [[0, 1.3]], rotY: [[0, 0], [dur('speed'), 0.15, 'inOutSine']], rotZ: [[0, 0.1], [dur('speed'), -0.15]],
    clips: [{ clip: 'jumploop', start: 0, end: 3 }], bones: { ...flail(dur('speed'), 0.35), leftleg: [[0, [-0.4, 0, 0]]], rightleg: [[0, [-0.3, 0, 0]]] },
    gestures: [{ type: 'armsout', start: 0, end: dur('speed') }], face: { scream: [[0, 0.2]], shock: [[0, 1]], squint: [[0, 0.5]] }, look: [[0, 'camera']], acting: 'none' } },
  sfx: [{ t: 0, type: 'riser', gain: 0.6 }] });
// 12 · "He blacks out." — face, eyes roll shut, world goes dark
S('blackout', { cut: 'smash', set: 'sky', look: 'cinematic', micro: { level: [[0, 0]], flow: 1.2 }, fadeOut: 0.3,
  camera: { pos: [[0, [0.25, -0.75, 1.3]], [dur('blackout'), [0.2, -0.6, 1.1], 'inOutSine']], look: [[0, [0.02, -0.12, 0.88]]], fov: [[0, 30]], handheld: 1.2 },
  cast: { hero: { pos: [[0, [0, 0, -0.9]]], rotX: [[0, 1.35]], rotZ: [[0, 0.15], [dur('blackout'), 0.05, 'inOutSine']], rotY: [[0, 0]],
    clips: [{ clip: 'jumploop', start: 0, end: 3 }], bones: { ...FALL_BONES, head: [[0, [-0.3, 0, 0]], [0.6, [0.15, 0.25, 0.2], 'inOutSine']] }, gestures: [{ type: 'armsout', start: 0, end: dur('blackout') }],
    face: { squint: [[0, 0.5], [0.55, 1, 'inOutSine']], sad: [[0.3, 0.4]] }, look: [[0, 'camera'], [0.5, [0, -6, 2], 'inOutSine']], acting: 'none' } },
  sfx: [{ t: 0.05, type: 'heartbeat', gain: 0.9 }, { t: 0.6, type: 'heartbeat', gain: 0.6 }] });
// 13 · "Then... glass." — black, then he smashes down through the station's glass roof
const GT = wordAt('glass.') ?? wordAt('glass') ?? 16.44, HIT = +(GT - at('glass')).toFixed(3);
S('glass', { cut: 'smash', set: 'station', look: 'cinematic', fadeIn: 0.15, freeze: [[HIT, 0.2]], punch: [HIT + 0.02], micro: { level: [[0, 1], [HIT - 0.01, 1], [HIT, 0]] },
  time: [[0, 0], [HIT - 0.05, HIT - 0.05], [HIT + 0.55, HIT + 0.2, 'outCubic'], [dur('glass'), dur('glass') - 0.1]],
  camera: { pos: [[0, [5.2, 3.4, -4.6]]], look: [[0, [3, 10.4, -3]], [HIT + 0.2, [3.1, 8.2, -3], 'outCubic']], fov: [[0, 44], [HIT + 0.3, 50, 'outExpo']], shakes: [[HIT, 1.4]] },
  cast: { hero: { pos: [[0, [2.0, 16, -3]], [HIT, [2.0, 10.2, -3], 'inQuad'], [HIT + 0.3, [2.0, 7.76, -3], 'inQuad'], [HIT + 0.45, [2.0, 7.92, -3], 'outCubic'], [HIT + 0.7, [2.0, 7.86, -3], 'inOutSine']], rotY: [[0, P / 2]], rotX: [[0, P / 2]],
    clips: [{ clip: 'jumploop', start: 0, end: 3 }], bones: { ...HANG.bones, leftarm: [[0, [-0.4, 0, 1.2]], [HIT + 0.3, [-1.75, 0, 0.3], 'outCubic'], [HIT + 0.7, [-1.45, 0, 0.12], 'inOutSine']], rightarm: [[0, [-0.4, 0, -1.2]], [HIT + 0.35, [-1.7, 0, -0.35], 'outCubic'], [HIT + 0.75, [-1.35, 0, -0.15], 'inOutSine']] },
    face: { squint: [[0, 1]] }, acting: 'none' } },
  fx: [{ type: 'ice-shatter', t: HIT, pos: [3, 10.6, -3], scale: 1.8 }, { type: 'ice-shatter', t: HIT + 0.05, pos: [3.4, 10.2, -2.4], scale: 1.2 }, { type: 'dust-burst', t: HIT + 0.3, pos: [3, 7.8, -3], scale: 0.8 },
    { type: 'beam', pos: [3, 11, -3], to: [2.6, 0, -1.5], radius: 1.4, color: '#eef4f8', intensity: 0.5, start: HIT }],
  sfx: [{ t: HIT, type: 'impact', gain: 1 }, { t: HIT + 0.3, type: 'land', gain: 0.9 }] });
// 14 · "A train station roof breaks his fall." — wide, glass still raining down, explainer callouts
S('station', { cut: 'whip', set: 'station', look: 'cinematic', micro: { level: [[0, 0]] }, punch: [1.6],
  camera: { pos: [[0, [8.2, 0.2, -5.4]], [dur('station'), [7.6, 0.6, -5.0], 'inOutSine']], look: [[0, [3.0, 7.0, -3]], [dur('station'), [3.1, 7.3, -3], 'inOutSine']], fov: [[0, 46]] },
  cast: { hero: { pos: [[0, HANG_ROOT]], ...HANG, clips: [{ clip: 'idle', start: 0, end: 3 }], face: { squint: [[0, 0.8]] }, acting: 'none' } },
  fx: [{ type: 'ice-shatter', t: 0.0, pos: [3, 10.2, -3], scale: 1.0 }, { type: 'beam', pos: [3, 11, -3], to: [2.6, 0, -1.5], radius: 1.4, color: '#eef4f8', intensity: 0.5 }, { type: 'dust', count: 300, pos: [2, 4, -2] }] });
// 15 · "Soldiers cut him down." — German soldiers below, reaching up
S('soldiers', { cut: 'zoom', set: 'station', look: 'cinematic', micro: { level: [[0, 0]] },
  camera: { pos: [[0, [9.6, -0.3, -3.8]], [dur('soldiers'), [9.2, -0.2, -3.6], 'inOutSine']], look: [[0, [2.6, 3.8, -3.0]]], fov: [[0, 64]], handheld: 0.6 },
  cast: { hero: { pos: [[0, HANG_ROOT]], ...HANG, clips: [{ clip: 'idle', start: 0, end: 3 }], acting: 'none' },
    s1: { pos: [[0, [2.6, 0, -1.9]]], rotY: [[0, P + 0.5]], clips: [{ clip: 'idle', start: 0, end: 3 }], gestures: [{ type: 'point', start: 0.1, end: dur('soldiers'), side: 'right', to: 'hero.head' }], look: [[0, 'hero.head']], face: { shock: [[0, 0.5]] } },
    s2: { pos: [[0, [1.4, 0, -4.0]]], rotY: [[0, 0.9]], clips: [{ clip: 'idle', start: 0, end: 3 }], gestures: [{ type: 'handsup', start: 0.25, end: dur('soldiers') }], look: [[0, 'hero.head']], face: { worried: [[0, 0.6]] } } },
  fx: [{ type: 'dust', count: 260, pos: [1.5, 3, -2] }] });
// 16 · "Alive." — on the platform, his eyes open
S('alive', { cut: 'smash', set: 'station', look: 'cinematic', micro: { level: [[0, 0]] }, punch: [0.1],
  camera: { pos: [[0, [0.9, 1.0, 0.9]], [dur('alive'), [0.8, 0.85, 0.75], 'inOutSine']], look: [[0, [0.1, 0.15, -0.6]]], fov: [[0, 34]] },
  cast: { hero: { pos: [[0, [0.2, 0, -1.6]]], rotY: [[0, P]], clips: [{ clip: 'die', start: -4, end: 3, loop: false }], face: { squint: [[0, 0.9], [0.35, 0.15, 'outCubic']], worried: [[0.3, 0.5]] }, look: [[0, 'camera']], acting: 'none' },
    s1: { pos: [[0, [-0.9, 0, -0.7]]], rotY: [[0, 2.2]], clips: [{ clip: 'kneel', start: -2, end: 3, loop: false }], look: [[0, 'hero.head']], face: { worried: [[0, 0.4]] } } },
  sfx: [{ t: 0.1, type: 'stamp', gain: 0.8 }] });
// 17 · "Would you have jumped?" — back up to the girders and the hole in the sky (loops into shot 1)
S('question', { cut: 'dip', set: 'station', look: 'cinematic', micro: { level: [[0, 0]] }, punch: [1.2], sfx: [{ t: 1.2, type: 'swoosh', gain: 0.6 }, { t: 2.0, type: 'shimmer', gain: 0.6 }],
  camera: { pos: [[0, [5.4, 5.4, -1.6]], [dur('question'), [7.6, 0.6, -5.2], 'inOutSine']], look: [[0, [3.4, 7.6, -3]], [dur('question'), [3.2, 7.8, -3], 'inOutSine']], fov: [[0, 40], [dur('question'), 46, 'inOutSine']] },
  cast: { hero: { pos: [[0, HANG_ROOT]], ...HANG, clips: [{ clip: 'idle', start: 0, end: 4 }], face: { worried: [[0, 0.6]], squint: [[0, 0.7]] }, acting: 'none' } },
  fx: [{ type: 'beam', pos: [3, 11, -3], to: [2.6, 0, -1.5], radius: 1.4, color: '#eef4f8', intensity: 0.55 }, { type: 'dust', count: 300, pos: [2.5, 7, -2] },
    { type: 'ice-shatter', t: 2.0, pos: [3.2, 10.3, -3], scale: 0.5 }],
  fadeOut: 0 });

// ---------- titles ----------
const titles = [
  { t: 0.03, t1: at('nochute') - 0.05, style: 'slam', text: '20,000 FT', pos: [0.5, 0.17], size: 0.1, accent: '#ffcc33' },
  { t: at('nochute', 0.1), t1: at('lived') - 0.05, style: 'stamp', text: 'NO PARACHUTE', pos: [0.5, 0.13], color: '#ff3b3b' },
  { t: at('date', 0.1), t1: at('flak') - 0.1, style: 'place', text: 'JAN 3, 1943', sub: 'SAINT-NAZAIRE, FRANCE', size: 0.07 },
  { t: at('flak', 0.2), t1: at('fire') - 0.05, style: 'tag', text: 'FLAK HIT', pos: [0.68, 0.2], accent: '#ff5a1a', size: 0.075 },
  { t: at('shredded', 0.05), t1: at('jump') - 0.05, style: 'stamp', text: 'SHREDDED', pos: [0.5, 0.18], color: '#ff3b3b' },
  { t: at('speed', 0.1), t1: at('blackout') - 0.05, style: 'counter', from: 0, to: 120, suffix: ' MPH', text: 'FALL SPEED', pos: [0.5, 0.17] },
  { t: at('glass') + HIT, t1: at('glass') + HIT + 0.45, style: 'speedlines', mode: 'radial', density: 0.8 },
  { t: at('station', 0.3), t1: at('soldiers') - 0.05, style: 'callout', at: [3.0, 10.5, -3], text: 'GLASS ROOF', side: 1, size: 0.07 },
  { t: at('station', 0.8), t1: at('soldiers') - 0.05, style: 'callout', at: [3.6, 7.55, -3], text: 'STEEL GIRDERS', side: -1, size: 0.07 },
  { t: at('alive', 0.08), t1: at('question') - 0.05, style: 'stamp', text: 'ALIVE', pos: [0.5, 0.18], color: '#39d353' },
  { t: at('question', 0.1), t1: END - 0.05, style: 'slam', text: 'WOULD YOU\nHAVE JUMPED?', pos: [0.5, 0.17], size: 0.075, accent: '#ffcc33' },
];

const thumbs = [
  { shot: 1, t: 0.6, text: 'NO\nPARACHUTE', hi: ['PARACHUTE'], accent: '#ff3b3b', face: { hero: { scream: 1, shock: 0.8 } } },
  { shot: 0, t: 1.2, text: '20,000 FT\nAND LIVED', hi: ['LIVED'], accent: '#ffcc33' },
  { shot: 12, t: 0.8, text: 'HE HIT\nTHE ROOF', hi: ['ROOF'], accent: '#ff3b3b' },
  { shot: 5, t: 0.5, text: 'NO WAY\nOUT', hi: ['OUT'], accent: '#ff5a1a' },
];

// sky shots float above y 0 (no ground up there; keeps the feet gate honest), plus motivated face lights
const lift = (sh, dy) => { const up = (k) => k && k.forEach((x) => { if (Array.isArray(x[1]) && x[1].length === 3) x[1] = [x[1][0], +(x[1][1] + dy).toFixed(3), x[1][2]]; });
  for (const c of Object.values(sh.cast || {})) up(c.pos); up(sh.camera.pos); up(sh.camera.look);
  for (const f of sh.fx || []) { if (f.pos) f.pos = [f.pos[0], f.pos[1] + dy, f.pos[2]]; else up(f.p); } };
for (const sh of shots) { if (['nochute', 'speed', 'blackout'].includes(sh.name)) lift(sh, 3); if (sh.name === 'jump') lift(sh, 6);
  if (['fire', 'shredded'].includes(sh.name)) sh.faceLight = { color: '#ffae6a', intensity: 4 };
  if (sh.name === 'chute') sh.faceLight = { color: '#ffae6a', intensity: 1.6 };
  if (['nochute', 'jump', 'speed', 'blackout'].includes(sh.name)) sh.faceLight = { color: '#fff1dc', intensity: 3 };
  if (['payoff', 'glass', 'station', 'soldiers', 'question'].includes(sh.name)) sh.faceLight = { color: '#dfe9f2', intensity: 3.5, dist: 0.7 };
  if (sh.name === 'lived') sh.faceLight = { color: '#dfe9f2', intensity: 2.2, dist: 1.0 }; }

module.exports = {
  title: 'He Fell 20,000 Feet',
  config: {
    targetDuration: 25, width: 1080, height: 1920, fps: 30, quality: 'good', effort: 'high', look: 'cinematic', set: 'station', captionY: 0.76,
    captions: { style: 'pop', sync: VO ? VO.words.map((w) => [w.w, w.start, w.end]) : undefined },
    sound: { music: { mood: 'tension', bpm: 100, drops: [0.02, +(at('glass') + HIT).toFixed(3)] }, sfx: true, ambience: true, voice: { url: 'vo.wav' } },
  },
  cast, shots, titles, captions: [], thumbs,
};
