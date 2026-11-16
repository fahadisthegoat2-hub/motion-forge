// "The Molasses Flood" (Boston, 15 Jan 1919) — direction (built into molasses-flood.html by build.js)
const fs = require('fs'), path = require('path');
const P = Math.PI;
let VO = null; try { VO = JSON.parse(fs.readFileSync(path.join(__dirname, 'vo.json'), 'utf8')); } catch {}

const CUES = [
  ['hook', 'this wave', 0], ['molasses', "it's molasses", 1.5], ['boston', 'boston', 3.0], ['gallons', 'two million', 6.9], ['leak', "it's been leaking", 9.1],
  ['paint', 'paint it', 12.1], ['rivets', 'then at', 13.4], ['gun', 'like machine-gun', 15.9], ['burst', 'the tank bursts', 17.4], ['wave', 'a wave', 18.5], ['flatten', 'it flattens', 22.0],
  ['outrun', "you can't", 25.0], ['glue', 'and as it', 26.1], ['died', 'twenty-one', 29.2], ['harbor', 'the harbor', 31.0], ['sweet', 'and on hot', 33.0], ['smell', 'boston still', 34.9], ['question', 'would you', 37.0],
];
const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9' -]/g, '');
const words = VO ? VO.words.map((w) => ({ w: norm(w.w), start: w.start })) : null;
function findCue(ph, after) { const p = ph.split(' '); for (let i = 0; i < words.length; i++) if (words[i].start >= after - 0.05 && p.every((x, k) => words[i + k] && words[i + k].w === x)) return words[i].start; return null; }
const T = {}; let last = 0;
for (const [id, ph, est] of CUES) { const t = words ? findCue(ph, last) : null; T[id] = id === 'hook' ? 0 : (t != null ? Math.max(0, t - 0.08) : est); last = T[id]; }
const END = VO ? VO.duration + 0.7 : 39.2;
const ids = CUES.map((c) => c[0]), dur = (id) => +((ids.indexOf(id) < ids.length - 1 ? T[ids[ids.indexOf(id) + 1]] : END) - T[id]).toFixed(3);
const at = (id, k = 0) => +(T[id] + k).toFixed(3);
const wt = (w, after = 0) => { const i = words.findIndex((x) => x.start >= after && x.w.replace(/[^a-z0-9-]/g, '') === w); return words[i].start; };   // absolute time of a word

// ---------- cast (1919 clothes) ----------
const cast = {
  hero: { character: 'jake', wardrobe: { top: '#5a4634', bottom: '#2a2a2e', shoes: '#1c1612' } },
  boss: { character: 'walt', wardrobe: { top: '#1f2226', bottom: '#1b1c1f', shoes: '#141210' } },
  p1: { character: 'marcus', wardrobe: { top: '#3d4a5a', bottom: '#2c2a26', shoes: '#1a1612' } },
  p2: { character: 'kwame', wardrobe: { top: '#6a5a44', bottom: '#2e2a24', shoes: '#1a1612' } },
};
const SPRINT = 3.9;   // run clip at 1.5× speed (2.6 m/s × 1.5) — feet lock to it
const FLOOD = (o) => ({ type: 'flood', pos: [0, 0, 0], size: [19, 90], res: [90, 280], color: '#2a1306', glow: '#2a0f03', ...o });
const idle = (d) => [{ clip: 'idle', start: 0, end: d + 1 }];
const run = (d) => [{ clip: 'run', start: 0, end: d + 1, speed: 1.5 }];
const lookBack = (t0, t1) => ({ neck: [[t0, [0, 0, 0]], [t0 + 0.25, [0, 0.55, 0], 'outCubic'], [t1 - 0.2, [0, 0.6, 0]], [t1, [0, 0, 0], 'inOutSine']], spine2: [[t0, [0, 0, 0]], [t0 + 0.3, [0, 0.35, 0], 'outCubic'], [t1, [0, 0, 0], 'inOutSine']] });
const stuck = (d) => ({ spine: [[0, [0.05, 0, 0]], ...Array.from({ length: Math.floor(d / 0.45) }, (_, i) => [0.25 + i * 0.45, [0.08, (i % 2 ? 1 : -1) * 0.22, (i % 2 ? -1 : 1) * 0.07], 'inOutSine'])] });
const SUN = 'golden-hour';

const shots = [];
const S = (id, o) => shots.push({ name: id, dur: dur(id), ...o });
const hookShot = (id, extra = {}) => {
  const d = dur(id);
  return { set: 'city-day', look: 'cinematic', camera: { pos: [[0, [1.1, 0.75, 4.6]], [d, [1.1, 0.85, 4.6 + SPRINT * d * 0.97], 'linear']], look: [[0, [0, 2.9, -3]], [d, [0, 3.0, -3 + SPRINT * d], 'linear']], fov: 66, handheld: 1.2 },
    cast: { hero: { pos: [[0, [0, 0, 0]], [d, [0, 0, SPRINT * d], 'linear']], rotY: [[0, 0]], clips: run(d), bones: lookBack(0.15, d), face: { scream: [[0, 0.6]], scared: [[0, 1]] }, acting: 'none' } },
    fx: [FLOOD({ front: [[0, -4.5], [d, -4.5 + (SPRINT + 0.7) * d, 'linear']], crest: [[0, 7.4]], level: [[0, 0]] }), { type: 'molasses-burst', t: -0.4, pos: [0, 3, -7], scale: 0.8 }], ...extra };
};

// 1 · HOOK — sprinting at camera, a 7 m brown wave right behind him
S('hook', { ...hookShot('hook'), role: 'payoff', punch: [0.06], sfx: [{ t: 0.03, type: 'whoosh', gain: 0.7 }] });   // rushing air, no unmotivated impact
// 2 · "It's molasses." — close on the face, thick brown drops raining on him
S('molasses', { cut: 'smash', set: 'city-day', look: 'cinematic', punch: [0.35],
  camera: { move: 'crash-zoom', target: 'hero', size: 'cu', at: 0.05, az: 12, handheld: 1 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], clips: idle(dur('molasses')), look: [[0, [0, 6, -8]]], bones: { head: [[0, [-0.25, 0.3, 0]]] }, face: { shock: [[0, 1]], disgust: [[0.6, 0], [1.1, 0.5]] }, acting: 'none' } },
  fx: [FLOOD({ front: [[0, -4.2], [dur('molasses'), -2.6, 'linear']], crest: [[0, 7.4]], sprayCount: 1400 }), { type: 'molasses-burst', t: 0.15, pos: [0, 3.4, -2.2], scale: 0.45 }] });
// 3 · "Boston, 1919. A giant tank looms over the street." — calm before: walking, looks up
S('boston', { cut: 'dip', set: 'city-day', look: 'warm-film',
  camera: { move: 'crane-down', target: 'hero', size: 'ws', az: 24, handheld: 0.3 },
  cast: { hero: { pos: [[0, [0, 0, -4.5]], [2.2, [0, 0, -1.3], 'linear'], [2.6, [0, 0, -1.15], 'outSine']], rotY: [[0, 0]], clips: [{ clip: 'walk', start: 0, end: 2.4 }, { clip: 'idle', start: 2.3, end: 5, fade: 0.35 }],
      look: [[0, [0, 1.6, 4]], [2.2, [-2, 14, -3], 'inOutSine']], face: { smile: [[0, 0.3], [2.2, 0]], worried: [[2.4, 0], [3.2, 0.5]] } },
    p1: { pos: [[0, [3.4, 0, 6]], [dur('boston'), [3.4, 0, 6 - 1.45 * dur('boston')], 'linear']], rotY: [[0, P]], clips: [{ clip: 'walk', start: 0, end: 5 }] },
    p2: { pos: [[0, [-3.2, 0, -8]], [dur('boston'), [-3.2, 0, -8 + 1.45 * dur('boston')], 'linear']], rotY: [[0, 0]], clips: [{ clip: 'walk', start: 0, end: 5 }] } },
  fx: [{ type: 'dust', count: 220 }] });
// 4 · "Two million gallons of syrup inside."
S('gallons', { cut: 'whip', set: 'city-day', look: 'warm-film',
  camera: { move: 'low-hero', target: 'hero', size: 'mls', az: -20 },
  cast: { hero: { pos: [[0, [0, 0, -1.15]]], rotY: [[0, 0]], clips: idle(dur('gallons')), look: [[0, [-2, 14, -3]], [1.2, [2, 12, -4], 'inOutSine']], gestures: [{ type: 'think', start: 0.3, end: dur('gallons') }], face: { worried: [[0, 0.4]], squint: [[0.4, 0.5]] } } } });
// 5 · "It's been leaking for months. The company's fix?" — syrup drips beside him
S('leak', { set: 'city-day', look: 'warm-film', punch: [0.6],
  camera: { move: 'push', target: 'hero', size: 'mls', az: 40, with: [-0.9, 0.6, -0.4] },
  cast: { hero: { pos: [[0, [0, 0, -1.15]], [0.7, [0.25, 0, -0.85], 'outCubic']], rotY: [[0, 0], [0.7, -0.5, 'outCubic']], clips: idle(dur('leak')), look: [[0, [-0.9, 0.2, -1.1]], [1.8, [-0.9, 3, -1.2], 'inOutSine']],
      face: { disgust: [[0.3, 0], [0.7, 0.7, 'outBack']] } },
    boss: { pos: [[0, [-2.4, 0, 1.6]]], rotY: [[0, 2.2]], clips: idle(dur('leak')), look: [[0, [0, 1.6, -1]]], gestures: [{ type: 'shrug', start: 1.6, end: dur('leak') }], face: { smirk: [[1.6, 0], [2.0, 0.6]] } } },
  fx: [{ type: 'molasses-leak', start: 0, end: dur('leak'), pos: [-0.9, 4.5, -1.2] }, FLOOD({ size: [1.6, 1.6], res: [20, 20], pos: [-0.9, 0, -1.2], level: [[0, 0.015], [dur('leak'), 0.03]], flow: 0.3 })] });
// 6 · "Paint it brown."
S('paint', { cut: 'whip', set: 'city-day', look: 'warm-film', punch: [0.15],
  camera: { move: 'push', target: 'boss', size: 'mcu', az: -38 },   // key light falls across his face from this side
  cast: { boss: { pos: [[0, [-2.4, 0, 1.6]]], rotY: [[0, 2.2]], clips: idle(dur('paint')), look: [[0, 'camera']], gestures: [{ type: 'present', start: 0.05, end: dur('paint') }], face: { smirk: [[0, 0.8]], smile: [[0.3, 0.4]] } } } });
// 7 · "Then, at lunchtime, the rivets start popping. Like machine-gun fire."
const tR = dur('rivets'), pop0 = wt('popping', T.rivets) - T.rivets;
const rivetT = [pop0 - 0.2, pop0 + 0.15, pop0 + 0.4];
S('rivets', { cut: 'dip', set: 'city-day', look: 'warm-film', punch: [pop0 - 0.2],
  camera: { move: 'push', target: 'hero', size: 'ms', az: 20, handheld: 0.5 },
  cast: { hero: { pos: [[0, [0.25, 0, -0.85]]], rotY: [[0, 0]], clips: idle(tR), look: [[0, [0, 1.6, 4]], [pop0 - 0.15, [-1.5, 9, -9], 'outCubic']],
    motions: [{ name: 'startle', start: pop0 - 0.18 }], face: { smile: [[0, 0.3], [pop0 - 0.2, 0]], shock: [[pop0 - 0.2, 0], [pop0, 1, 'outBack']] }, acting: 'none' } },
  fx: rivetT.map((t, i) => ({ type: 'sparks', t, pos: [-1.5 + (i % 3) * 0.9, 8 + (i % 2) * 1.5, -9], count: 50, spread: 0.6 })),
  sfx: rivetT.map((t) => ({ t, type: 'rivet', gain: 0.9 })) });
// 7b · "Like machine-gun fire." — low angle up past him, rivets ripping in a line
const tG = dur('gun'), gunT = Array.from({ length: 10 }, (_, i) => 0.08 + i * 0.11);
S('gun', { cut: 'smash', set: 'city-day', look: 'cinematic',
  camera: { move: 'low-hero', target: 'hero', size: 'mls', az: -35, handheld: 0.8, shakes: gunT.map((t) => ({ t, amp: 0.22, decay: 0.1 })) },
  cast: { hero: { pos: [[0, [0.25, 0, -0.85]]], rotY: [[0, 0]], clips: idle(tG), look: [[0, [1.5, 9, -9]]], gestures: [{ type: 'shield', start: 0.05, end: tG }], face: { scared: [[0, 1]], shock: [[0, 0.7]] }, acting: 'none' } },
  fx: gunT.map((t, i) => ({ type: 'sparks', t, pos: [-2.5 + i * 0.55, 8.5 + (i % 2) * 0.6, -9], count: 45, spread: 0.6 })),
  sfx: gunT.map((t, i) => ({ t, type: 'rivet', gain: i % 2 ? 0.65 : 0.85 })) });
// 8 · "The tank bursts." — wall of syrup blasts out
S('burst', { cut: 'flash', set: 'city-day', look: 'cinematic', afterimage: 0.5,
  camera: { pos: [[0, [1.3, 1.5, 3.4]], [dur('burst'), [1.2, 1.6, 2.9], 'outCubic']], look: [[0, [0, 3.6, -12]]], fov: 62, handheld: 1.4 },
  cast: { hero: { pos: [[0, [0.25, 0, -0.85]]], rotY: [[0, 0]], clips: idle(dur('burst')), look: [[0, [0, 6, -12]]], gestures: [{ type: 'shield', start: 0, end: dur('burst') }], face: { scream: [[0.05, 1]] }, acting: 'none' } },
  fx: [{ type: 'molasses-burst', t: 0.05, pos: [0, 5, -14], scale: 2.1 }, FLOOD({ front: [[0, -15], [dur('burst'), -15 + 7 * dur('burst'), 'outCubic']], crest: [[0, 2], [dur('burst'), 7.6, 'outCubic']] })],
  sfx: [{ t: 0.05, type: 'thunder', gain: 0.6 }] });
// 9 · "A wave twenty-five feet high, moving thirty-five miles an hour." — the wave charges at camera
const dW = dur('wave');
S('wave', { cut: 'whip', set: 'city-day', look: 'cinematic', punch: [wt('twenty-five', T.wave) - T.wave],
  camera: { pos: [[0, [1.4, 1.0, 2]], [dW, [1.4, 1.2, 2 + SPRINT * dW], 'linear']], look: [[0, [0, 2.8, -9]], [dW, [0, 3.0, -9 + SPRINT * dW], 'linear']], fov: 64, handheld: 0.9 },
  cast: { hero: { pos: [[0, [0, 0, -5]], [dW, [0, 0, -5 + SPRINT * dW], 'linear']], rotY: [[0, 0]], clips: run(dW), bones: lookBack(0.4, 2.2), face: { scream: [[0, 0.8]], scared: [[0, 1]] }, acting: 'none' },
    p1: { pos: [[0, [3.6, 0, -1]], [dW, [3.6, 0, -1 + 5 * dW], 'linear']], rotY: [[0, 0]], clips: run(dW), face: { scared: [[0, 1]] } } },
  fx: [FLOOD({ front: [[0, -13], [dW, -13 + 5.6 * dW, 'linear']], crest: [[0, 7.6]] }), { type: 'dust', count: 260 }] });
// 10 · "It flattens buildings. It bends steel train tracks." — side-on as it sweeps through
const dF = dur('flatten'), bends = wt('bends', T.flatten) - T.flatten;
S('flatten', { cut: 'smash', set: 'city-day', look: 'cinematic', punch: [0.05, bends],
  camera: { pos: [[0, [-3.5, 10.5, 16]], [dF, [-3.0, 10, 14], 'inOutSine']], look: [[0, [3, 2, -5]], [dF, [3, 2, 0], 'inOutSine']], fov: 55, handheld: 1.3 },
  cast: {},
  fx: [FLOOD({ front: [[0, -6], [dF, -6 + 6 * dF, 'linear']], crest: [[0, 7.6]] }),
    { type: 'ground-slam', t: 0.05, pos: [8.5, 0.2, -5.6], scale: 1.2, color: '#5a3a1e' }, { type: 'molasses-burst', t: 0.4, pos: [8.6, 5, -6 + 6 * 0.4], scale: 1.3 }, { type: 'molasses-burst', t: 1.1, pos: [-8.6, 5, -6 + 6 * 1.1], scale: 1.3 }, { type: 'molasses-burst', t: bends, pos: [5.5, 5, -6 + 6 * bends], scale: 1.4 }, { type: 'ground-slam', t: bends, pos: [5.5, 0.2, -6 + 6 * bends], scale: 1.3, color: '#5a3a1e' },
    { type: 'sparks', t: bends + 0.05, pos: [5.3, 3, -6 + 6 * bends], count: 140, spread: 1 }],
  sfx: [{ t: 0.05, type: 'boom', gain: 0.8 }, { t: bends, type: 'impact', gain: 0.9 }, { t: bends + 0.08, type: 'scratch', gain: 0.7 }] });
// 11 · "You can't outrun it." — it swallows him
const dO = dur('outrun');
S('outrun', { cut: 'whip', set: 'city-day', look: 'cinematic', flash: [dO - 0.12],
  camera: { pos: [[0, [2.6, 1.2, 4.2]], [dO, [2.6, 1.3, 4.2 + SPRINT * dO * 0.9], 'linear']], look: [[0, [0, 2.4, -2.5]], [dO, [0, 2.4, -2.5 + SPRINT * dO], 'linear']], fov: 64, handheld: 1.2 },
  cast: { hero: { pos: [[0, [0, 0, 0]], [dO, [0, 0, SPRINT * dO], 'linear']], rotY: [[0, 0]], clips: run(dO), bones: lookBack(0.1, dO), face: { scream: [[0, 1]] }, acting: 'none' } },
  fx: [FLOOD({ front: [[0, -3.2], [dO, SPRINT * dO - 0.25, 'inCubic']], crest: [[0, 7.6]] })],
  sfx: [{ t: dO - 0.12, type: 'splash', gain: 1 }, { t: dO - 0.1, type: 'subdrop', gain: 0.8 }] });
// 12 · "And as it cools, it turns to glue. You're stuck." — waist-deep, can't move
const dG = dur('glue');
S('glue', { cut: 'dip', set: 'city-day', look: 'cinematic', punch: [wt('stuck', T.glue) - T.glue],
  camera: { move: 'push', target: 'hero', size: 'mls', az: 18, eye: 1.45, handheld: 0.5 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], clips: idle(dG), bones: stuck(dG), gestures: [{ type: 'plead', start: 0.6, end: dG }], look: [[0, [0, 0.9, 0.6]], [1.5, 'camera', 'inOutSine']],
    face: { worried: [[0, 0.8]], scared: [[1.2, 0.9]], sad: [[1.8, 0.5]] }, acting: 'none' } },
  fx: [FLOOD({ level: [[0, 1.05], [dG, 1.0]], flow: 0.5, rough: [[0, 0.18], [1.4, 0.18], [2.4, 0.75, 'inOutSine']] })] });
// 13 · "Twenty-one people died." — overhead, rescuers wading
const dD = dur('died');
S('died', { cut: 'dip', set: 'city-day', look: 'cinematic',
  camera: { pos: [[0, [2.6, 3.4, 4.4]], [dD, [2.3, 3.1, 3.8], 'inOutSine']], look: [[0, [0, 0.9, -0.3]]], fov: 50, handheld: 0.2 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], clips: idle(dD), bones: stuck(dD), look: [[0, [0.9, 1.5, 0.7]], [1.0, [-0.9, 1.5, -0.6], 'inOutSine']], face: { worried: [[0, 0.9]], sad: [[0.5, 0.6]] }, acting: 'none' },
    p1: { pos: [[0, [1.8, 0, 1.6]], [1.1, [0.52, 0, 0.32], 'outSine']], rotY: [[0, -2.4]], clips: [{ clip: 'walk', start: 0, end: 1.2, speed: 0.45 }, { clip: 'idle', start: 1.0, end: 3, fade: 0.3 }], reach: [{ hand: 'right', to: 'hero.leftarm', start: 1.1, end: dD }], look: [[0, [0, 1.5, 0]]], face: { worried: [[0, 0.7]] } },
    p2: { pos: [[0, [-1.9, 0, -1.4]], [1.2, [-0.58, 0, -0.36], 'outSine']], rotY: [[0, 0.95]], clips: [{ clip: 'walk', start: 0, end: 1.3, speed: 0.45 }, { clip: 'idle', start: 1.1, end: 3, fade: 0.3 }], reach: [{ hand: 'left', to: 'hero.rightarm', start: 1.2, end: dD }], look: [[0, [0, 1.5, 0]]], face: { worried: [[0, 0.7]] } } },
  fx: [FLOOD({ level: [[0, 0.95]], flow: 0.4, rough: 0.55 })] });
// 14 · "The harbor stayed brown for months." — the whole street a brown lake, sun going down
const dH = dur('harbor');
S('harbor', { set: 'city-day', look: 'warm-film',
  camera: { pos: [[0, [1.8, 1.5, 12]], [dH, [1.6, 2.4, 13], 'inOutSine']], look: [[0, [0, 1.0, -30]], [dH, [0, 0.8, -30], 'inOutSine']], fov: 55 },
  cast: { p1: { pos: [[0, [1.2, 0, 2]], [dH, [1.2, 0, 2 + 0.65 * dH], 'linear']], rotY: [[0, 0]], clips: [{ clip: 'walk', start: 0, end: 3, speed: 0.45 }], face: { sad: [[0, 0.6]] } },
    p2: { pos: [[0, [-1.4, 0, -1]], [dH, [-1.4, 0, -1 + 0.65 * dH], 'linear']], rotY: [[0, 0]], clips: [{ clip: 'walk', start: 0, end: 3, speed: 0.45 }], face: { sad: [[0, 0.5]] } } },
  fx: [FLOOD({ level: [[0, 0.7]], flow: 0.3, rough: 0.3, color: '#331706' })] });
// 15 · "And on hot days, locals swear Boston still smells sweet." — the same street today, a sniff
const dS = dur('sweet');
S('sweet', { cut: 'zoom', set: 'city-day', look: SUN,
  camera: { move: 'track', target: 'hero', size: 'ws', side: 'right' },
  cast: { hero: { pos: [[0, [0, 0, -2.6]], [dS, [0, 0, -2.6 + 1.45 * dS], 'linear']], rotY: [[0, 0]], clips: [{ clip: 'walk', start: 0, end: dS + 1 }], look: [[0, [0, 1.6, 6]], [1.0, [-6, 3, 2], 'inOutSine']], face: { smile: [[0, 0.3]] } },
    p1: { pos: [[0, [-3.4, 0, 4]], [dS, [-3.4, 0, 4 - 1.45 * dS], 'linear']], rotY: [[0, P]], clips: [{ clip: 'walk', start: 0, end: 4 }] } },
  fx: [{ type: 'dust', count: 200 }] });
// 15b · "Boston still smells sweet." — he stops, sniffs the air, smiles
const dM = dur('smell'), sniff = wt('smells', T.smell) - T.smell;
S('smell', { set: 'city-day', look: SUN,
  camera: { move: 'dolly-in', target: 'hero', size: 'mcu', az: 15 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], clips: idle(dM),
    bones: { head: [[0, [0, 0, 0]], [sniff - 0.1, [-0.28, 0, 0], 'outCubic'], [sniff + 0.25, [-0.22, 0, 0]], [sniff + 0.55, [-0.3, 0, 0], 'outCubic'], [dM, [-0.05, 0, 0], 'inOutSine']] },
    look: [[0, [0, 4, 4]], [sniff + 1, 'camera', 'inOutSine']], face: { squint: [[0, 0], [sniff, 0.8]], smile: [[sniff + 0.4, 0], [sniff + 0.9, 0.7, 'outBack']] } } },
  fx: [{ type: 'dust', count: 200 }] });
// 16 · "Would you have made it out?" — loop back to the wave
{ const q = hookShot('question'), dq = dur('question'); q.cast.hero.bones = lookBack(0.1, dq - 0.7); q.cast.hero.look = [[dq - 0.75, 'camera']]; q.cast.hero.face = { scared: [[0, 1], [dq - 0.6, 0.6]], worried: [[dq - 0.7, 0], [dq - 0.3, 0.9, 'outBack']] };
  S('question', { ...q, cut: 'glitch', flash: [] }); }   // ending: he snaps a look to us on the question

// ---------- motion graphics ----------
const titles = [
  { t: 0.05, t1: at('molasses'), style: 'slam', text: 'NOT WATER', pos: [0.5, 0.09], size: 0.1, accent: '#ffb020' },
  { t: at('molasses', 0.25), t1: at('boston'), style: 'stamp', text: 'MOLASSES', pos: [0.5, 0.12], size: 0.11, accent: '#c8742a' },
  { t: at('boston', 0.15), t1: at('gallons', -0.1), style: 'place', text: 'BOSTON, 1919', sub: 'JANUARY 15', pos: [0.08, 0.08] },
  { t: at('boston', 2.3), t1: at('gallons', -0.05), style: 'arrow', dir: 'up', text: '50-FT TANK', pos: [0.74, 0.08], size: 0.045 },
  { t: at('gallons', 0.1), t1: at('leak', -0.05), style: 'counter', from: 0, to: 2000000, suffix: '+', sub: 'GALLONS OF MOLASSES', pos: [0.5, 0.12], size: 0.08, dur: 1.4 },
  { t: at('leak', 0.6), t1: at('paint', -0.05), style: 'callout', at: [-0.9, 1.2, -1.2], text: 'LEAKING', sub: 'FOR MONTHS', icon: 'drop', side: -1 },
  { t: at('paint', 0.05), t1: at('rivets'), style: 'stamp', text: 'FIX: PAINT IT BROWN', pos: [0.5, 0.11], size: 0.07, accent: '#c8742a' },
  { t: at('rivets', 0.15), t1: at('burst', -0.1), style: 'place', text: '12:30 PM', sub: 'LUNCHTIME', pos: [0.08, 0.08] },
  { t: at('burst', 0.05), t1: at('wave'), style: 'burst', text: 'BOOM!', pos: [0.5, 0.13], size: 0.12 },
  { t: at('wave', 0.4), t1: at('wave', 1.9), style: 'stat', value: 25, max: 30, suffix: ' FT', text: 'HIGH', pos: [0.5, 0.13], size: 0.08 },
  { t: at('wave', 2.0), t1: at('flatten', -0.05), style: 'stat', value: 35, max: 40, suffix: ' MPH', text: 'FAST', pos: [0.5, 0.13], size: 0.08 },
  { t: at('flatten', bends + 0.05), t1: at('outrun', -0.05), style: 'tag', text: 'STEEL BENT', pos: [0.5, 0.1], accent: '#ff3b2f' },
  { t: at('glue', 1.2), t1: at('died', -0.05), style: 'callout', at: 'hero.hips', text: 'STUCK', sub: 'THICK AS GLUE', icon: 'warning', side: 1 },
  { t: at('died', 0.1), t1: at('harbor', -0.05), style: 'counter', from: 0, to: 21, sub: 'LIVES LOST', pos: [0.5, 0.085], size: 0.095, dur: 0.9 },
  { t: at('harbor', 0.2), t1: at('sweet', -0.05), style: 'tag', text: 'HARBOR: BROWN FOR MONTHS', pos: [0.5, 0.1], accent: '#c8742a' },
  { t: at('smell', sniff + 0.4), t1: at('question', -0.05), style: 'bubble', at: 'hero.head', offset: [0.16, -0.05], text: 'syrup...?', thought: true },
  { t: at('question', 0.1), t1: END, style: 'kinetic', text: 'WOULD YOU|MAKE IT|OUT?', hi: ['OUT?'], pos: [0.5, 0.12], size: 0.1 },
];

module.exports = {
  title: 'The Molasses Flood', T, END,
  config: { targetDuration: +END.toFixed(2), set: 'city-day', look: 'cinematic', quality: 'good', effort: 'maximum', fps: 30,
    sound: { music: { mood: 'tension', bpm: 104, drops: [at('burst', 0.05)] }, sfx: true, ambience: true, ...(VO ? { voice: { url: 'vo.wav' } } : {}) },
    captions: { style: 'pop', ...(VO ? { sync: VO.words.map((w) => [w.w, w.start, w.end]) } : {}) }, letterbox: 0 },
  thumbs: [
    { shot: 0, t: 0.5, text: 'DROWNED IN\nSYRUP', hi: ['SYRUP'], accent: '#ffb020', face: { hero: { scream: 0.9, scared: 1 } }, size: 'mls', side: 'left' },
    { shot: 11, t: 1.4, text: 'STUCK IN\nMOLASSES', hi: ['MOLASSES'], accent: '#c8742a', size: 'mcu', side: 'right' },
  ],
  cast, shots, captions: [], titles,
};
