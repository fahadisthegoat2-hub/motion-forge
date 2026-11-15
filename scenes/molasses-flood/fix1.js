const fs = require('fs'); let s = fs.readFileSync('direction.js', 'utf8');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('missing ' + a.slice(0, 70)); s = s.replace(a, b); };
// hook: low camera ahead of him looking up past him at the crest + sky
rep("camera: { move: 'dolly-out', target: 'hero', size: 'ws', az: 6, handheld: 1.2 },",
  "camera: { pos: [[0, [1.1, 0.75, 4.6]], [d, [1.1, 0.85, 4.6 + SPRINT * d * 0.97], 'linear']], look: [[0, [0, 2.9, -3]], [d, [0, 3.0, -3 + SPRINT * d], 'linear']], fov: 66, handheld: 1.2 },");
rep("role: 'payoff', impact: [0.05], punch: [0.06],", "role: 'payoff', punch: [0.06],");
// molasses CU: drops falling between lens and face
rep("fx: [{ type: 'splash', t: 0.25, pos: [0.3, 2.2, -0.6], dir: [0, -1, 0.4], color: '#2e1607', scale: 0.6, count: 200 }, { type: 'splash', t: 0.7, pos: [-0.4, 2.4, -0.4], dir: [0, -1, 0.3], color: '#3a1b08', scale: 0.5 }] });",
  "fx: [{ type: 'molasses-leak', start: 0, end: 2, pos: [0.16, 2.3, 0.42] }, { type: 'molasses-leak', start: 0.3, end: 2, pos: [-0.2, 2.3, 0.5], seed: 4 }, { type: 'splash', t: 0.3, pos: [0.1, 1.75, 0.35], dir: [0, 1, 0.5], color: '#2e1607', scale: 0.4, count: 220 }] });");
// rivets / gun: no 'with' pan (hero was cropped at the frame edge)
rep("camera: { move: 'push', target: 'hero', size: 'ms', az: 20, with: [-1.5, 9, -9], handheld: 0.5 },", "camera: { move: 'push', target: 'hero', size: 'ms', az: 20, handheld: 0.5 },");
rep("size: 'mls', az: -35, with: [1.5, 9, -9], handheld: 0.8,", "size: 'mls', az: -35, handheld: 0.8,");
// burst: behind his shoulder, looking down the street at the blast
rep("S('burst', { cut: 'flash', set: 'city-day', look: 'cinematic', impact: [0.05], afterimage: 0.5,\n  camera: { move: 'static', target: 'hero', size: 'ws', az: 160, height: 0.3, with: [0, 6, -12], handheld: 1.4 },",
  "S('burst', { cut: 'flash', set: 'city-day', look: 'cinematic', afterimage: 0.5,\n  camera: { pos: [[0, [1.3, 1.5, 3.4]], [dur('burst'), [1.2, 1.6, 2.9], 'outCubic']], look: [[0, [0, 3.6, -12]]], fov: 62, handheld: 1.4 },");
rep("{ type: 'molasses-burst', t: 0.05, pos: [0, 6, -14], scale: 1.6 }, FLOOD({ front: [[0, -16], [dur('burst'), -16 + 11 * dur('burst'), 'outCubic']], crest: [[0, 2], [dur('burst'), 7.6, 'outCubic']] })],",
  "{ type: 'molasses-burst', t: 0.05, pos: [0, 5, -12], scale: 2.6 }, FLOOD({ front: [[0, -15], [dur('burst'), -15 + 7 * dur('burst'), 'outCubic']], crest: [[0, 2], [dur('burst'), 7.6, 'outCubic']] })],");
// flatten: no white impact frames
rep("impact: [0.05, bends], punch: [bends],", "punch: [0.05, bends],");
// outrun: camera ahead + to the side, looking back so the wave is in frame the whole time
rep("camera: { move: 'follow', target: 'hero', size: 'ws', side: 'left', handheld: 1.2 },",
  "camera: { pos: [[0, [2.6, 1.2, 4.2]], [dO, [2.6, 1.3, 4.2 + SPRINT * dO * 0.9], 'linear']], look: [[0, [0, 2.4, -2.5]], [dO, [0, 2.4, -2.5 + SPRINT * dO], 'linear']], fov: 64, handheld: 1.2 },");
rep("FLOOD({ front: [[0, -2.2], [dO, SPRINT * dO + 0.8, 'inCubic']], crest: [[0, 7.6]] })", "FLOOD({ front: [[0, -3.2], [dO, SPRINT * dO + 0.8, 'inCubic']], crest: [[0, 7.6]] })");
// died: readable, not crushed black
rep("S('died', { cut: 'dip', set: 'city-day', look: 'noir',\n  camera: { move: 'overhead', target: 'hero', size: 'ews', handheld: 0.2 },",
  "S('died', { cut: 'dip', set: 'city-day', look: 'cinematic',\n  camera: { move: 'overhead', target: 'hero', size: 'ws', handheld: 0.2 },");
// harbor: higher, wider — the whole district a brown lake
rep("camera: { move: 'crane-up', target: 'p1', size: 'ews', az: 200 },", "camera: { move: 'crane-up', target: 'p1', size: 14, az: 200 },");
fs.writeFileSync('direction.js', s); console.log('fixed');
