// "The Gravity Button" — direction (built into gravity-button.html by build.js). Shots land on voiceover word times.
const fs = require('fs'), path = require('path');
const P = Math.PI;
let VO = null; try { VO = JSON.parse(fs.readFileSync(path.join(__dirname, 'vo.json'), 'utf8')); } catch {}

// cue → start (seconds) of the spoken line, from the Kokoro take
const T = { payoff: 0, earlier: 1.95, find: 3.69, label: 5.05, ten: 6.85, batt: 7.78, press: 9.35, floats: 10.17, cars: 11.19, coffee: 11.93,
  best: 12.75, worst: 14.03, ends: 15.83, back: 16.88, fall: 18.01, again: 19.78, safe: 21.1, tenagain: 22.39, beeps: 23.96, question: 26.59 };
const END = VO ? +(VO.duration + 0.7).toFixed(2) : 29;
const ids = Object.keys(T);
const dur = (id) => +((ids.indexOf(id) < ids.length - 1 ? T[ids[ids.indexOf(id) + 1]] : END) - T[id]).toFixed(3);
const at = (id, k = 0) => +(T[id] + k).toFixed(3);

const ACC = '#ff3b30';
const cast = {
  hero: { character: 'jake', wardrobe: { top: '#2e6bd6', bottom: '#2b3a55', shoes: '#d11a1a' } },
};
const idle = (d) => [{ clip: 'idle', start: 0, end: d }];
const S = (id, o) => shots.push({ name: id, dur: dur(id), ...o });
const shots = [];

// ---- floating street props (rise on "press", drop on "gravity is back") ----
// base positions on the street; each rises by `up` over [0..rise] seconds with a lazy tumble
const PROPS = [
  { id: 'city_car', pos: [-2.2, 0, 3.2], rotY: 0.5, height: 1.5, up: 7, spin: 0.5 },
  { id: 'city_car', pos: [2.6, 0, 7.5], rotY: -0.3, height: 1.5, up: 9, spin: -0.4 },
  { id: 'traffic_cone', pos: [1.4, 0, 1.6], height: 0.71, up: 4.5, spin: 2.2 },
  { id: 'traffic_cone', pos: [-1.1, 0, 0.7], height: 0.71, up: 5.5, spin: -2.6 },
  { id: 'traffic_cone', pos: [0.4, 0, 3.4], height: 0.71, up: 6.5, spin: 1.8 },
  { id: 'crate', pos: [0.0, 0, 0.9], height: 0.77, up: 3, spin: 1.1 },
];
// rising phase: t∈[t0, t0+rise]; `lift` = how far through the lift the prop is at shot start (0..1)
const floatFx = (d, { lift0 = 0, lift1 = 1, drop = false, t0 = 0, tDrop = 0.3 } = {}) => PROPS.map((p, i) => {
  const y0 = p.up * lift0, y1 = p.up * lift1;
  const keys = drop ? [[0, [p.pos[0], y0, p.pos[2]]], [tDrop, [p.pos[0], y0, p.pos[2]]], [Math.min(d, tDrop + 0.85 + i * 0.05), [p.pos[0], 0, p.pos[2]], 'inCubic']]
    : [[0, [p.pos[0], y0, p.pos[2]]], [d, [p.pos[0], y1, p.pos[2]], 'outSine']];
  const sp = p.spin;
  return { type: 'model', id: p.id, pos: p.pos, height: p.height, rotY: p.rotY || 0, solid: false, p: keys,
    tilt: drop ? [[0, [0.25 * sp, 0, 0.2]], [d, [0, 0, 0], 'inCubic']] : [[0, [0.05 * sp * lift0, 0, 0.04]], [d, [0.3 * sp * (lift1 + 0.3), 0, 0.2 * sp], 'inOutSine']] };
});
const CLOUDS = (y, n = 6, scale = 9, seed = 1) => Array.from({ length: n }, (_, i) => ({ type: 'smoke', start: 0, end: 4, pos: [((i * 37 + seed * 11) % 26) - 13, y + ((i * 53 + seed * 7) % 40) - 20, ((i * 29 + seed * 5) % 24) - 12], scale, color: '#ffffff', opacity: 0.55 }));
const REMOTE_HAND = { type: 'model', id: 'gravity_remote', attach: 'hero.righthand', grip: true, height: 0.09, solid: false, rot: [0, 0, 0] };

// 1 · PAYOFF — falling forever
const RX = -0.35;
const FOLLOW = (d, y0, y1, offA, offB = offA, fov = 38, handheld = 1.2, lookUp = 1.35, ease = 'inOutSine') => ({ pos: [[0, [offA[0], y0 + offA[1], offA[2]]], [d, [offB[0], y1 + offB[1], offB[2]], ease]], look: [[0, [0, y0 + lookUp, 0]], [d, [0, y1 + lookUp, 0], 'linear']], fov, handheld });
const FALL_HERO = (d, y0 = 420, dy = 55) => ({ pos: [[0, [0, y0, 0]], [d, [0, y0 - dy, 0], 'linear']], rotX: [[0, RX], [d, RX * 0.85, 'inOutSine']], rotY: [[0, 0.4], [d, 0.9, 'inOutSine']],
  clips: idle(d), swimming: true, acting: 'none', gestures: [{ type: 'handsup', start: 0, end: d }], face: { scream: [[0, 0.95]], scared: [[0, 1]] }, look: [[0, 'camera']], hands: { both: 'claw' } });
S('payoff', { role: 'payoff', set: 'city-day', look: 'cinematic', impact: [0.05], punch: [0.1],
  camera: FOLLOW(dur('payoff'), 420, 365, [0.7, 1.1, 3.4], [-0.4, 0.8, 2.6], 40),
  cast: { hero: { ...FALL_HERO(dur('payoff')), hands: { both: 'claw' } } },
  fx: [REMOTE_HAND, ...CLOUDS(380, 6, 10, 1)], sfx: [{ t: 0, type: 'impact', gain: 1 }, { t: 0.05, type: 'boom', gain: 0.9 }] });

// 2 · "Ten seconds earlier."
S('earlier', { cut: 'whip', set: 'city-day', look: 'clean-cg',
  camera: { move: 'track', target: 'hero', size: 'ws', side: 'right', az: 70 },
  cast: { hero: { pos: [[0, [0.5, 0, -3.4]], [dur('earlier'), [0.3, 0, -1.95], 'linear']], rotY: [[0, 0]], clips: [{ clip: 'walk', start: 0, end: 3 }], look: [[0, [0, 1.2, 1]]], face: { smile: [[0, 0.2]] } } },
  fx: [{ type: 'model', id: 'crate', pos: [0, 0, 0.9], height: 0.77 }, { type: 'model', id: 'gravity_remote', pos: [0, 0.77, 0.9], height: 0.09, rotY: 2.6, solid: false }, { type: 'dust', count: 120 }] });

// 3 · "You find a red button."
S('find', { cut: 'zoom', set: 'city-day', look: 'clean-cg',
  camera: { move: 'push', target: 'hero', size: 'mls', az: 28, eye: 1.5 },
  cast: { hero: { pos: [[0, [0.3, 0, -1.9]]], rotY: [[0, 0.1]], clips: idle(dur('find')), look: [[0, [0, 1.6, 2]], [0.35, [0, 0.8, 0.9], 'outCubic']],
    bones: { spine: [[0, [0, 0, 0]], [0.5, [0.18, 0, 0], 'outCubic']], neck: [[0.3, [0, 0, 0]], [0.6, [0.2, 0, 0], 'outCubic']] }, face: { shock: [[0.3, 0], [0.6, 0.45, 'outBack']], smile: [[0.7, 0], [1.2, 0.3]] } } },
  fx: [{ type: 'model', id: 'crate', pos: [0, 0, 0.9], height: 0.77 }, { type: 'model', id: 'gravity_remote', pos: [0, 0.77, 0.9], height: 0.09, rotY: 2.6, solid: false, bob: 0.004 }, { type: 'sparks', t: 0.35, pos: [0, 0.85, 0.9], spread: 0.15, count: 30 }] });

// 4/5/6 · macro product shots of the remote (void set, studio light)
const MACRO = (id, camA, camB, lookA, lookB, extra = {}) => S(id, { cut: extra.cut || 'zoom', set: 'void', look: process.env.ML || 'cinematic', punch: extra.punch,
  camera: { pos: [[0, camA], [dur(id), camB, 'inOutSine']], look: [[0, lookA], [dur(id), lookB, 'inOutSine']], fov: extra.fov || 32 },
  cast: {}, fx: [{ type: 'model', id: 'gravity_remote', pos: [0, 0, 0], height: 0.09, rotY: extra.rot ?? 0.3, tilt: extra.tilt, spin: extra.spin ?? 0, solid: false }, ...(extra.fx || [])], sfx: extra.sfx });
MACRO('label', [0.3, 0.2, 0.36], [0.1, 0.11, 0.2], [0, 0.04, 0], [0, 0.045, 0.02], { rot: 0.1, sfx: [{ t: 0.2, type: 'ding', gain: 0.6 }] });
MACRO('ten', [0.0, 0.11, 0.2], [0.0, 0.085, 0.13], [0, 0.04, 0.05], [0, 0.047, 0.075], { rot: 0.0, cut: 'whip' });
MACRO('batt', [0.05, 0.08, 0.13], [0.035, 0.062, 0.1], [0.03, 0.047, 0.075], [0.03, 0.047, 0.075], { rot: 0.0, cut: 'zoom', fov: 28,
  fx: [{ type: 'sparks', t: 0.1, pos: [0.03, 0.05, 0.075], spread: 0.01, count: 14, color: '#ff3a2a' }], sfx: [{ t: 0.05, type: 'heartbeat', gain: 0.7 }, { t: 0.7, type: 'ding', gain: 0.5 }] });

// 7 · "You press it." — thumb on the button
S('press', { cut: 'smash', set: 'city-day', look: 'clean-cg', punch: [0.32], impact: [0.34],
  camera: { move: 'push', target: 'hero', size: 'mcu', az: 28, eye: 1.4 },
  cast: { hero: { pos: [[0, [0.3, 0, -1.4]]], rotY: [[0, 0.1]], clips: idle(dur('press')), look: [[0, [0.2, 1.3, 0.5]], [0.3, 'camera', 'inOutSine']], hands: { right: 'grip' }, gestures: [{ type: 'present', start: 0.05, end: dur('press'), side: 'right' }], bones: { head: [[0, [0.15, 0, 0]], [0.3, [0, 0, 0], 'outCubic']] },
    face: { squint: [[0, 0.5]], smirk: [[0.2, 0], [0.5, 0.8, 'outBack']] } } },
  fx: [REMOTE_HAND, { type: 'shockwave', t: 0.34, pos: [0.0, 1.0, -0.8], scale: 1.5, color: '#ff3b30' }], sfx: [{ t: 0.32, type: 'impact', gain: 0.9 }, { t: 0.34, type: 'riser', gain: 0.5 }] });

// 8 · "Everything floats."
S('floats', { cut: 'flash', set: 'city-day', look: 'golden-hour',
  camera: { move: 'orbit', target: 'hero', size: 'ws', span: 40, az: -25, height: 0.2 },
  cast: { hero: { pos: [[0, [0.3, 0, -0.9]], [dur('floats'), [0.3, 1.9, -0.9], 'outSine']], rotY: [[0, 0.4], [dur('floats'), 0.2]], rotX: [[0, 0], [dur('floats'), -0.3, 'inOutSine']], swimming: true, clips: idle(dur('floats')),
    gestures: [{ type: 'armsout', start: 0.2, end: dur('floats') }], look: [[0, 'camera']], face: { shock: [[0, 0.7]], smile: [[0.3, 0], [0.8, 0.9]] }, acting: 'none' } },
  fx: floatFx(dur('floats'), { lift0: 0, lift1: 0.3 }) });

// 9 · "Cars. Cones."
S('cars', { cut: 'whip', set: 'city-day', look: 'golden-hour',
  camera: { pos: [[0, [8, 1.2, 7]], [dur('cars'), [6, 2.6, 5], 'inOutSine']], look: [[0, [-2.2, 4.0, 3.2]], [dur('cars'), [-1.5, 5.2, 3.2], 'inOutSine']], fov: 42, handheld: 0.5 },
  cast: { hero: { pos: [[0, [-0.9, 3.0, 1.2]], [dur('cars'), [-0.9, 3.6, 1.2], 'linear']], rotY: [[0, 2.6]], rotX: [[0, -0.2], [dur('cars'), -0.45]], swimming: true, clips: idle(dur('cars')), acting: 'none',
    gestures: [{ type: 'cheer', start: 0, end: dur('cars') }], face: { smile: [[0, 0.8]] } } },
  fx: floatFx(dur('cars'), { lift0: 0.3, lift1: 0.6 }) });

// 10 · "Your coffee."
S('coffee', { cut: 'zoom', set: 'city-day', look: 'golden-hour',
  camera: { move: 'push', target: 'hero', size: 'mcu', az: 25 },
  cast: { hero: { pos: [[0, [0, 3.6, 0]], [dur('coffee'), [0, 3.75, 0], 'linear']], rotY: [[0, 0.1]], rotX: [[0, -0.25], [dur('coffee'), -0.35]], swimming: true, clips: idle(dur('coffee')), look: [[0, [0.3, 3.9, 0.9]], [0.4, 'camera', 'inOutSine']],
    hands: { right: 'grip' }, gestures: [{ type: 'beat', start: 0, end: dur('coffee'), side: 'right' }], acting: 'none', face: { smile: [[0, 0.7]], shock: [[0.1, 0], [0.4, 0.4]] } } },
  fx: [{ type: 'model', id: 'coffee_cup', attach: 'hero.righthand', grip: true, height: 0.13, solid: false }, { type: 'model', id: 'coffee_cup', pos: [-0.6, 4.0, 0.9], height: 0.13, solid: false, tilt: [[0, [0.3, 0, 0.5]], [dur('coffee'), [1.2, 0, 1.0], 'inOutSine']], p: [[0, [-0.6, 3.9, 0.9]], [dur('coffee'), [-0.8, 4.2, 1.1], 'linear']] },
    { type: 'splash', t: 0.2, pos: [-0.65, 4.0, 0.9], dir: [0, 1, 0.3], color: '#6b4226', scale: 0.12 }] });

// 11 · "Best day ever!" — backflip
S('best', { cut: 'whip', set: 'city-day', look: 'golden-hour', punch: [0.2],
  camera: FOLLOW(dur('best'), 4.5, 7.5, [1.6, 0.6, 4.6], [-1.2, 0.8, 4.2], 54, 0.6, 1.4),
  cast: { hero: { pos: [[0, [0, 4.5, 0]], [dur('best'), [0, 7.5, 0], 'outSine']], rotY: [[0, 0.3]], rotX: [[0, 0], [dur('best'), -6.28, 'inOutCubic']], swimming: true, clips: idle(dur('best')), acting: 'none',
    gestures: [{ type: 'cheer', start: 0, end: dur('best') }], face: { smile: [[0, 1]] }, look: [[0, 'camera']] } },
  fx: floatFx(dur('best'), { lift0: 0.6, lift1: 0.95 }) });

// 12 · "But that's not the worst part." — rising above the rooftops, smile fades
S('worst', { cut: 'glitch', set: 'city-day', look: 'cinematic',
  camera: { move: 'crane-down', target: 'hero', size: 'ms', az: 12, height: 0.3 },
  cast: { hero: { pos: [[0, [0, 12, 0]], [dur('worst'), [0, 40, 0], 'inSine']], rotY: [[0, 0.2]], rotX: [[0, -0.1], [dur('worst'), -0.2]], swimming: true, clips: idle(dur('worst')), acting: 'none',
    look: [[0, [0, 6, 9]], [0.8, 'camera', 'inOutSine']], gestures: [{ type: 'armsout', start: 0, end: dur('worst') }], face: { smile: [[0, 0.9], [0.9, 0, 'inOutSine']], worried: [[0.6, 0], [1.4, 0.95, 'outBack']] } } },
  fx: [REMOTE_HAND, ...CLOUDS(28, 5, 5, 2)] });

// 13 · "Ten seconds ends." — he looks at the remote: it's counting down
S('ends', { cut: 'zoom', set: 'city-day', look: 'cinematic', punch: [0.15],
  camera: FOLLOW(dur('ends'), 56, 58, [0.5, 1.45, 2.3], [0.3, 1.5, 1.8], 34, 0.6, 1.75),
  cast: { hero: { pos: [[0, [0, 56, 0]], [dur('ends'), [0, 58, 0], 'linear']], rotY: [[0, 0.1]], rotX: [[0, -0.1]], swimming: true, clips: idle(dur('ends')), acting: 'none', look: [[0, 'camera']],
    face: { worried: [[0, 0.9]], scared: [[0.4, 0], [0.9, 0.9, 'outBack']] } } },
  sfx: [{ t: 0.0, type: 'ding', gain: 0.5 }, { t: 0.33, type: 'ding', gain: 0.55 }, { t: 0.66, type: 'ding', gain: 0.6 }] });

// 14 · "Gravity is back." — everything drops
S('back', { cut: 'smash', set: 'city-day', look: 'cinematic', impact: [0.28], punch: [0.28],
  camera: { pos: [[0, [3.2, 37, 9]], [0.28, [3.2, 37, 9]], [dur('back'), [3.8, 18, 8], 'inCubic']], look: [[0, [0, 37, 0]], [0.28, [0, 37, 0]], [dur('back'), [0, 16, 0], 'inCubic']], fov: 50, handheld: 1.1 },
  cast: { hero: { pos: [[0, [0, 36, 0]], [0.28, [0, 36, 0]], [dur('back'), [0, 14, 0], 'inCubic']], rotY: [[0, 0.1]], rotX: [[0, -0.2], [dur('back'), -0.9, 'inCubic']], swimming: true, clips: idle(dur('back')), acting: 'none', look: [[0, 'camera']],
    gestures: [{ type: 'handsup', start: 0.28, end: dur('back') }], face: { scream: [[0.28, 0], [0.45, 1, 'outBack']], scared: [[0, 1]] } } },
  fx: [...floatFx(dur('back'), { lift0: 1, drop: true, tDrop: 0.28 }), { type: 'shockwave', t: 0.28, pos: [0, 36, 0], scale: 4, color: '#ffffff' }], sfx: [{ t: 0.28, type: 'boom', gain: 1 }, { t: 0.3, type: 'riser', gain: 0.4 }] });

// 15 · "You fall. Three kilometers."
S('fall', { cut: 'whip', set: 'city-day', look: 'golden-hour', impact: [0.05],
  camera: FOLLOW(dur('fall'), 400, 300, [0.9, 0.9, 2.6], [-0.5, 0.5, 2.1], 42, 1.8, 1.8, 'linear'),
  cast: { hero: { ...FALL_HERO(dur('fall'), 400, 100), rotY: [[0, 0.2], [dur('fall'), 0.7]] } },
  fx: [REMOTE_HAND, ...CLOUDS(370, 7, 10, 3)], sfx: [{ t: 0, type: 'whoosh', gain: 0.9 }] });

// 16 · "You press it again!" — thumb mashes the remote
S('again', { cut: 'smash', set: 'city-day', look: 'cinematic', punch: [0.2, 0.55, 0.9],
  camera: FOLLOW(dur('again'), 330, 280, [0.35, 1.3, 1.9], [0.3, 1.25, 1.5], 38, 1.8, 1.5, 'linear'),
  cast: { hero: { pos: [[0, [0, 330, 0]], [dur('again'), [0, 280, 0], 'linear']], rotX: [[0, -0.3]], rotY: [[0, 0.3]], swimming: true, clips: idle(dur('again')), acting: 'none',
    hands: { right: 'grip' }, gestures: [{ type: 'beat', start: 0, end: dur('again'), side: 'right' }], look: [[0, [0.2, 330.9, 0.7]], [0.5, 'camera']],
    face: { scream: [[0, 0.8]], shock: [[0.5, 0], [0.8, 0.5]] } } },
  fx: [REMOTE_HAND,
    { type: 'sparks', t: 0.2, pos: [0.25, 330.8, 0.7], spread: 0.1, count: 40, color: '#ff3b30' }],
  sfx: [{ t: 0.2, type: 'ding', gain: 0.8 }, { t: 0.55, type: 'ding', gain: 0.8 }, { t: 0.9, type: 'ding', gain: 0.8 }] });

// 17 · "You float. Safe." — floating calmly in the clouds
S('safe', { cut: 'flash', set: 'city-day', look: 'dreamy',
  camera: FOLLOW(dur('safe'), 300, 303, [-2.6, 1.2, 3.8], [2.2, 1.0, 3.6], 38, 0.4),
  cast: { hero: { pos: [[0, [0, 300, 0]], [dur('safe'), [0, 303, 0], 'inOutSine']], rotY: [[0, 0.3], [dur('safe'), 0.0, 'inOutSine']], rotX: [[0, -0.3], [dur('safe'), 0, 'inOutSine']], swimming: true, clips: idle(dur('safe')), acting: 'none',
    gestures: [{ type: 'armsout', start: 0.2, end: dur('safe') }], look: [[0, 'camera']], face: { worried: [[0, 0.8], [0.7, 0, 'inOutSine']], smile: [[0.5, 0], [1.0, 0.8, 'outBack']] } } },
  fx: [REMOTE_HAND, ...CLOUDS(285, 7, 9, 5)] });

// 18 · "Ten seconds. Again." — the loop begins to feel normal: floating, counting
S('tenagain', { cut: 'whip', set: 'city-day', look: 'dreamy',
  camera: FOLLOW(dur('tenagain'), 290, 293, [1.2, 0.8, 3.4], [0.6, 1.0, 3.0], 38, 0.4, 1.5),
  cast: { hero: { pos: [[0, [0, 290, 0]], [dur('tenagain'), [0, 293, 0], 'inOutSine']], rotY: [[0, -0.4]], rotX: [[0, 0.1], [dur('tenagain'), -0.15, 'inOutSine']], swimming: true, clips: idle(dur('tenagain')), acting: 'none',
    gestures: [{ type: 'thumbsup', start: 0.1, end: dur('tenagain') }], look: [[0, 'camera']], face: { smile: [[0, 0.7]], squint: [[0.9, 0], [1.4, 0.3]] } } },
  fx: [REMOTE_HAND, ...CLOUDS(275, 7, 9, 6)] });

// 19 · "The button beeps. Battery: zero." — macro, mirrors the battery shot
S('beeps', { cut: 'zoom', set: 'void', look: process.env.ML || 'cinematic', punch: [dur('beeps') - 0.8],
  camera: { pos: [[0, [0.05, 0.08, 0.13]], [dur('beeps'), [0.03, 0.058, 0.09], 'inOutSine']], look: [[0, [0.03, 0.047, 0.075]]], fov: 28 },
  cast: {}, fx: [{ type: 'model', id: 'gravity_remote', pos: [0, 0, 0], height: 0.09, solid: false, rotY: 0 }, { type: 'sparks', t: 0.25, pos: [0.03, 0.05, 0.075], spread: 0.012, count: 20, color: '#ff3a2a' }, { type: 'sparks', t: 1.2, pos: [0.03, 0.05, 0.075], spread: 0.012, count: 20, color: '#ff3a2a' }],
  sfx: [{ t: 0.2, type: 'ding', gain: 0.8 }, { t: 0.45, type: 'ding', gain: 0.8 }, { t: 1.15, type: 'ding', gain: 0.9 }, { t: dur('beeps') - 0.8, type: 'subdrop', gain: 1 }] });

// 20 · "Would you press it?" — back to the opening image (loop)
S('question', { cut: 'smash', set: 'city-day', look: 'cinematic', impact: [0.05],
  camera: FOLLOW(dur('question'), 420, 365, [0.7, 1.1, 3.4], [-0.4, 0.8, 2.6], 40),
  cast: { hero: { ...FALL_HERO(dur('question')), hands: { both: 'claw' } } },
  fx: [REMOTE_HAND, ...CLOUDS(380, 6, 10, 1)], sfx: [{ t: 0, type: 'impact', gain: 1 }, { t: 0.05, type: 'whoosh', gain: 1 }] });

// ---------- motion graphics: one design system — accent red, slam / place / stat / stamp / countdown ----------
const titles = [
  { t: 0.05, t1: at('earlier', -0.05), style: 'slam', text: 'YOU PRESSED\nIT', pos: [0.5, 0.11], size: 0.1, accent: ACC },
  { t: at('earlier', 0.15), t1: at('find', -0.05), style: 'place', text: 'DOWNTOWN', sub: '10 SECONDS EARLIER', pos: [0.08, 0.09] },
  { t: at('label', 0.1), t1: at('batt', -0.05), style: 'stat', value: 10, max: 10, suffix: 's', text: 'GRAVITY: OFF', pos: [0.5, 0.1], accent: ACC },
  { t: at('batt', 0.15), t1: at('press', -0.05), style: 'stat', value: 1, max: 100, suffix: '%', text: 'BATTERY', pos: [0.5, 0.1], accent: ACC },
  { t: at('best', 0.05), t1: at('worst'), style: 'stamp', text: 'BEST DAY EVER', pos: [0.5, 0.11], size: 0.085, accent: ACC },
  { t: at('ends', 0.0), t1: at('back'), style: 'countdown', from: 3, step: 0.34, pos: [0.5, 0.075], size: 0.05, accent: ACC },
  { t: at('back', 0.28), t1: at('fall'), style: 'speedlines', mode: 'radial', center: [0.5, 0.45], density: 1, color: '#ffffff' },
  { t: at('fall', 0.15), t1: at('again'), style: 'stat', value: 3, max: 3, suffix: ' KM', text: 'TO THE GROUND', pos: [0.5, 0.075], accent: ACC },
  { t: at('tenagain', 0.0), t1: at('beeps'), style: 'countdown', from: 10, step: 0.15, pos: [0.5, 0.075], size: 0.05, accent: ACC },
  { t: at('beeps', 1.35), t1: at('question'), style: 'stat', value: 0, max: 100, suffix: '%', text: 'BATTERY', pos: [0.5, 0.1], accent: ACC },
  { t: at('question', 0.05), t1: END, style: 'slam', text: 'WOULD YOU\nPRESS IT?', pos: [0.5, 0.11], size: 0.1, accent: ACC },
];

module.exports = {
  title: 'The Gravity Button', T, END,
  config: { targetDuration: END, set: 'city-day', look: 'cinematic', quality: 'good', effort: 'standard', fps: 30, accent: ACC,
    sound: { music: { mood: 'upbeat', bpm: 118, drops: [at('press', 0.34), at('back', 0.28), at('question', 0)] }, sfx: true, ambience: true, ...(VO ? { voice: { url: 'vo.wav' } } : {}) },
    captions: { style: 'pop', ...(VO ? { sync: VO.words.map((w) => [w.w, w.start, w.end]) } : {}) }, letterbox: 0 },
  thumbs: [
    { shot: 0, t: 0.9, text: 'FALLING\n3 KM', hi: ['3 KM'], accent: ACC, face: { hero: { scream: 0.9, scared: 1 } }, size: 'mcu', side: 'left' },
  ],
  cast, shots, captions: [], titles,
};
