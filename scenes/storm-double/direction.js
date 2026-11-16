// "He Met Himself" — original fiction. Shot starts come from the voiceover word times.
const fs = require('fs'), path = require('path');
const P = Math.PI;
const VO = JSON.parse(fs.readFileSync(path.join(__dirname, 'vo.json'), 'utf8'));
const CUES = [['payoff', 'this man'], ['other', 'and the'], ['strike0', 'three nights'], ['wake', 'since then'], ['same', 'same street'], ['follow', 'then a'],
  ['face', 'same jacket'], ['worst', "but that's"], ['scream', 'his double'], ['run', 'run'], ['strike', 'lightning hits'], ['gone', 'the double'],
  ['jacket', 'then jake'], ['tomorrow', 'tomorrow'], ['question', 'would you']];
const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9' -]/g, '');
const words = VO.words.map((w) => ({ w: norm(w.w), start: w.start }));
function findCue(ph, after) { const p = ph.split(' ');
  for (let i = 0; i < words.length; i++) if (words[i].start >= after - 0.05 && p.every((x, k) => words[i + k] && words[i + k].w === x)) return words[i].start;
  throw new Error('cue ' + ph); }
const T = {}; let last = 0;
for (const [id, ph] of CUES) { T[id] = id === 'payoff' ? 0 : Math.max(0, findCue(ph, last) - 0.1); last = T[id] + 0.1; }
const END = +(VO.duration + 0.6).toFixed(2);
const ids = CUES.map((c) => c[0]), dur = (id) => +((ids.indexOf(id) < ids.length - 1 ? T[ids[ids.indexOf(id) + 1]] : END) - T[id]).toFixed(3);
const at = (id, k = 0) => +(T[id] + k).toFixed(3);

const ACC = '#7fc8ff';
const cast = {
  hero: { character: 'jake', wardrobe: { top: '#3b5373', bottom: '#22252b', shoes: '#18181a' } },        // Jake tonight
  dbl: { character: 'jake', wardrobe: { top: '#2a2420', bottom: '#1d1d20', shoes: '#18181a' } },         // Jake tomorrow — same jacket, burnt
};
const ST = 'street-night', RAIN = { type: 'rain', count: 6000, opacity: 0.45 };
const idle = (d) => [{ clip: 'idle', start: 0, end: d + 1 }];
const walk = (d, s = 1) => [{ clip: 'walk', start: 0, end: d + 1, speed: s }];
const burn = (who = 'dbl') => [{ type: 'smoke', start: 0, end: 9, attach: who + '.chest', scale: 0.45, color: '#3a3836', opacity: 0.7 }, { type: 'embers', start: 0, end: 9, attach: who + '.chest', scale: 0.5 }];
const shots = [];
const S = (id, o) => shots.push({ name: id, dur: dur(id), set: ST, look: 'neon-night', ...o });
const FACEOFF = (d, o = {}) => ({
  hero: { pos: [[0, [-0.4, 0, 0]]], rotY: [[0, P / 2]], clips: idle(d), look: [[0, 'dbl.head']], face: { shock: [[0, 0.5], [0.3, 0.9, 'outBack']] }, acting: 'none' },
  dbl: { pos: [[0, [0.4, 0, 0]]], rotY: [[0, -P / 2]], clips: idle(d), look: [[0, 'hero.head']], face: { scream: [[0, 0.8]], worried: [[0, 1]] },
    gestures: [{ type: 'plead', start: 0.05, end: d }], acting: 'none' }, ...o });

// 1 · PAYOFF — two Jakes face to face in the rain, lightning cracks behind
S('payoff', { role: 'payoff', look: 'cinematic', impact: [0.08], punch: [0.9],
  camera: { pos: [[0, [-4.2, 1.9, 2.8]], [0.4, [-2.4, 1.55, 1.5], 'outExpo'], [dur('payoff'), [-2.2, 1.55, 1.4], 'outSine']], look: [[0, [0, 1.45, 0]]], fov: 40, handheld: 0.9 },
  cast: FACEOFF(dur('payoff')),
  fx: [RAIN, { type: 'lightning', t: 0.06, pos: [-3, 14, -11], to: [-2, 0, -10], seed: 4 }], sfx: [{ t: 0, type: 'impact', gain: 1 }, { t: 0.05, type: 'whoosh', gain: 0.6 }] });
// 2 · "And the other one was terrified."
S('other', { cut: 'whip',
  camera: { move: 'push', target: 'dbl', size: 'cu', az: 25, handheld: 1.1 },
  cast: FACEOFF(dur('other'), {}),
  fx: [RAIN, ...burn()] });
// 3 · "Three nights ago, lightning hit his street."
S('strike0', { cut: 'smash', impact: [1.05], punch: [1.1],
  camera: { pos: [[0, [3.5, 1.4, 7]], [dur('strike0'), [3.0, 1.6, 6.2], 'inOutSine']], look: [[0, [0, 2.2, -2]]], fov: 40, handheld: 0.6, shakes: [1.1] },
  cast: { hero: { pos: [[0, [-0.6, 0, 0.6]], [dur('strike0'), [-0.6, 0, 0.6 + 1.45 * 0.8 * dur('strike0')]]], rotY: [[0, 0]], clips: walk(dur('strike0'), 0.8),
    look: [[0, [0, 1.6, 8]], [1.1, [1.6, 3, -3], 'outCubic']], face: { shock: [[1.05, 0], [1.25, 1, 'outBack']] }, gestures: [{ type: 'shield', start: 1.15, end: dur('strike0') }], acting: 'none' } },
  fx: [RAIN, { type: 'lightning', t: 1.0, pos: [2.5, 14, -4], to: [1.8, 4.2, -1.2], seed: 9 }, { type: 'sparks', t: 1.02, pos: [1.8, 4.2, -1.2], scale: 1.2 }, { type: 'smoke', start: 1.1, end: 6, pos: [1.8, 4.2, -1.2], scale: 0.6, color: '#4a4846', opacity: 0.6 }] });
// 4 · "Since then, he wakes up at 3:33." — dark room, eyes snap open
S('wake', { cut: 'dip', set: 'void', look: 'noir',
  camera: { move: 'dolly-in', target: 'hero', size: 'cu', az: -20, handheld: 0.3 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], clips: idle(dur('wake')), bones: { head: [[0, [0.35, 0, 0.1]], [0.9, [0.35, 0, 0.1]], [1.15, [-0.05, 0.1, 0], 'outBack']] },
    look: [[0, [0, 0.4, 1]], [1.0, [0, 0.4, 1]], [1.15, [-2, 1.7, 3], 'outCubic'], [2.0, [2, 1.6, 3], 'inOutSine']], face: { squint: [[0, 1], [1.0, 1], [1.12, 0]], shock: [[1.05, 0], [1.25, 0.8, 'outBack']] }, acting: 'none' } } });
// 5 · "Same street. Same rain."
S('same', { cut: 'whip', look: 'cinematic',
  camera: { pos: [[0, [-3.4, 1.5, 0.6]], [dur('same'), [-3.4, 1.5, 0.6 + 1.45 * dur('same')]]], look: [[0, [-1.9, 1.3, -1.6]], [dur('same'), [-1.9, 1.3, -1.6 + 1.45 * dur('same')]]], fov: 38, handheld: 0.4 },
  cast: { hero: { pos: [[0, [-1.9, 0, -2]], [dur('same'), [-1.9, 0, -2 + 1.45 * dur('same')]]], rotY: [[0, 0]], clips: walk(dur('same')), look: [[0, [0, 1.6, 6]], [0.9, [-3, 3.5, 4], 'inOutSine'], [1.5, [0, 1.6, 6], 'inOutSine']],
    face: { worried: [[0, 0.5]] }, acting: 'none' } },
  fx: [RAIN] });
// 6 · "Then a man starts following him." — wide from ahead, a figure under the lamp behind him
S('follow', { cut: 'zoom',
  camera: { pos: [[0, [0.6, 1.5, 5.5]], [dur('follow'), [0.5, 1.5, 5.0], 'inOutSine']], look: [[0, [0, 1.3, -1]]], fov: 38, handheld: 0.4 },
  cast: { hero: { pos: [[0, [-0.3, 0, 0.8]], [dur('follow'), [-0.3, 0, 0.8 + 1.45 * dur('follow')]]], rotY: [[0, 0]], clips: walk(dur('follow')),
      look: [[0, [0, 1.6, 8]], [0.9, [1, 1.5, -4], 'outCubic']], bones: { neck: [[0.8, [0, 0, 0]], [1.05, [0, -0.5, 0], 'outCubic']] }, face: { worried: [[0.9, 0.9]] }, acting: 'none' },
    dbl: { pos: [[0, [0.7, 0, -2.4]], [dur('follow'), [0.7, 0, -2.4 + 1.45 * dur('follow')]]], rotY: [[0, 0]], clips: walk(dur('follow')), look: [[0, 'hero.head']], acting: 'none' } },
  fx: [RAIN] });
// 7 · "Same jacket. Same face." — over his shoulder: the double steps into the lamp light
S('face', { cut: 'whip',
  camera: { move: 'over-shoulder', target: 'dbl', over: 'hero', size: 'mcu', handheld: 0.5 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, P]], clips: idle(dur('face')), look: [[0, 'dbl.head']], acting: 'none' },
    dbl: { pos: [[0, [0.3, 0, -2.6]], [0.8, [0.3, 0, -1.8], 'outCubic']], rotY: [[0, 0.1]], clips: [{ clip: 'walk', start: 0, end: 0.9 }, { clip: 'idle', start: 0.8, end: 4 }], look: [[0, 'hero.head']],
      face: { worried: [[0, 0.9]] }, acting: 'none' } },
  fx: [RAIN, ...burn()] });
// 8 · "But that's not the worst part."
S('worst', { cut: 'glitch', look: 'cinematic', punch: [0.55],
  camera: { move: 'dolly-in', target: 'hero', size: 'cu', az: 15 },
  cast: { hero: { pos: [[0, [-0.4, 0, 0.2]]], rotY: [[0, 1.2]], clips: idle(dur('worst')), look: [[0, [2, 1.6, 0]], [0.5, [1.5, 1.7, -2.5], 'outCubic']], face: { shock: [[0, 0.6], [0.5, 1, 'outBack']] }, acting: 'none' } },
  fx: [RAIN] });
// 9 · "His double is screaming one word." — the double lunges into frame
S('scream', { cut: 'smash',
  camera: { move: 'push', target: 'dbl', size: 'ms', az: 30, handheld: 1.2 },
  cast: { dbl: { pos: [[0, [0, 0, -1.2]], [0.5, [0, 0, -0.6], 'outCubic']], rotY: [[0, 0]], clips: idle(dur('scream')), look: [[0, [0, 1.6, 2]]],
      face: { scream: [[0.2, 0], [0.45, 1, 'outBack']] }, gestures: [{ type: 'stop', start: 0.3, end: dur('scream'), side: 'right' }], acting: 'none' },
    hero: { pos: [[0, [0.15, 0, 1.4]]], rotY: [[0, P]], clips: idle(dur('scream')), look: [[0, 'dbl.head']], acting: 'none' } },
  fx: [RAIN, ...burn()] });
// 10 · "Run!" — he bolts, slow-mo
S('run', { cut: 'flash', time: [[0, 0], [0.2, 0.2], [dur('run'), 0.45, 'outCubic']],
  camera: { move: 'low-hero', target: 'hero', size: 'ws', az: 40, handheld: 1 },
  cast: { hero: { pos: [[0, [0, 0, 0]], [dur('run'), [0, 0, 1.2]]], rotY: [[0, 0]], clips: [{ clip: 'run', start: 0, end: 2 }], face: { scream: [[0, 0.7]] }, look: [[0, [0, 1.5, 8]]], acting: 'none' } },
  fx: [RAIN] });
// 11 · "Lightning hits right where he stood."
S('strike', { cut: 'smash', impact: [0.12], punch: [0.15], afterimage: 0.6, time: [[0, 0], [dur('strike'), dur('strike') * 0.8]],
  camera: { pos: [[0, [3.2, 1.2, 4.5]], [dur('strike'), [3.6, 1.4, 5.2], 'outCubic']], look: [[0, [0, 1, 1.2]]], fov: 44, handheld: 1.2, shakes: [0.14] },
  cast: { hero: { pos: [[0, [0, 0, 1.6]], [dur('strike'), [0, 0, 1.6 + 2.6 * dur('strike') * 0.8]]], rotY: [[0, 0]], clips: [{ clip: 'run', start: 0, end: 3 }], face: { scream: [[0, 0.8]] }, acting: 'none' } },
  fx: [RAIN, { type: 'lightning', t: 0.1, pos: [0.3, 15, -0.5], to: [0, 0, 0], seed: 21 }, { type: 'shockwave', t: 0.12, pos: [0, 0.05, 0], scale: 1.2 }, { type: 'sparks', t: 0.12, pos: [0, 0.1, 0], scale: 1.4 },
    { type: 'smoke', start: 0.15, end: 5, pos: [0, 0.3, 0], scale: 0.9, color: '#4a4846', opacity: 0.6 }, { type: 'fire', start: 0.12, end: 1.2, pos: [0, 0.1, 0], scale: 0.5 }],
  sfx: [{ t: 0.12, type: 'boom', gain: 0.6 }] });
// 12 · "The double is gone." — he turns back: smoke, empty street
S('gone', { cut: 'whip',
  camera: { move: 'over-shoulder', target: 'hero', size: 'ws', az: 160, handheld: 0.4 },
  cast: { hero: { pos: [[0, [0, 0, 4.2]]], rotY: [[0, P]], clips: idle(dur('gone')), look: [[0, [0, 0.8, 0]]], face: { worried: [[0, 0.9]] }, acting: 'none' } },
  fx: [RAIN, { type: 'smoke', start: -3, end: 5, pos: [0, 0.3, 0], scale: 0.9, color: '#4a4846', opacity: 0.55 }, { type: 'embers', start: -3, end: 5, pos: [0, 0.1, 0], scale: 0.5 }] });
// 13 · "Then Jake sees his own jacket. Burnt." — he looks down: it's the double's jacket now
S('jacket', { cut: 'zoom', punch: [2.0],
  camera: { move: 'push', target: 'dbl', size: 'ms', az: 20, height: 0.3, handheld: 0.5 },
  cast: { dbl: { pos: [[0, [0, 0, 4.2]]], rotY: [[0, 0]], clips: idle(dur('jacket')), bones: { head: [[0, [0, 0, 0]], [0.4, [0.55, 0, 0], 'outCubic']] },
    look: [[0, [0, 1.6, 8]], [0.35, [0, 1.0, 4.5], 'outCubic']], reach: [{ hand: 'left', to: 'dbl.chest', offset: [0.08, 0, 0.12], start: 0.7, end: dur('jacket') }], hands: { left: 'soft' },
    face: { shock: [[1.9, 0], [2.1, 1, 'outBack']], worried: [[0, 0.6]] }, acting: 'none' } },
  fx: [RAIN, ...burn(), { type: 'fire', start: 0, end: 9, pos: [0.08, 1.25, 4.35], scale: 0.12 }, { type: 'smoke', start: -2, end: 9, pos: [0.08, 1.3, 4.35], scale: 0.35, color: '#3a3836', opacity: 0.8 }] });
// 14 · "Tomorrow at 3:33, he's the one screaming." — the loop closes
S('tomorrow', { cut: 'dip',
  camera: { move: 'crane-down', target: 'dbl', size: 'ms', az: -60, handheld: 0.6 },
  cast: { dbl: { pos: [[0, [-0.4, 0, 0.2]]], rotY: [[0, 1.2]], clips: idle(dur('tomorrow')), look: [[0, [1.6, 1.6, 0.9]]], face: { scream: [[1.2, 0], [1.5, 1, 'outBack']], worried: [[0, 1]] },
    gestures: [{ type: 'plead', start: 1.2, end: dur('tomorrow') }], acting: 'none' } },
  fx: [RAIN, ...burn(), { type: 'lightning', t: 1.25, pos: [3, 14, -11], to: [2, 0, -10], seed: 33 }] });
// 15 · "Would you run?" — back to the opening image (loop)
S('question', { cut: 'zoom', look: 'cinematic',
  camera: { pos: [[0, [-2.2, 1.55, 1.4]], [dur('question'), [-3.2, 1.75, 2.1], 'inOutSine']], look: [[0, [0, 1.45, 0]]], fov: 40, handheld: 0.4 },
  cast: FACEOFF(dur('question')),
  fx: [RAIN, burn()[1]] });

const titles = [
  { t: 0.05, t1: at('other'), style: 'slam', text: 'HE MET\nHIMSELF', pos: [0.5, 0.1], size: 0.1, accent: ACC },
  { t: at('strike0', 0.1), t1: at('wake'), style: 'place', text: '3 NIGHTS AGO', sub: 'ELM STREET · 3:33 AM', pos: [0.08, 0.08] },
  { t: at('wake', 1.15), t1: at('same'), style: 'stamp', text: '3:33 AM', pos: [0.5, 0.12], size: 0.1, accent: ACC },
  { t: at('face', 0.2), t1: at('worst'), style: 'stamp', text: 'SAME FACE', pos: [0.5, 0.12], size: 0.08, accent: ACC },
  { t: at('run', 0.05), t1: at('strike'), style: 'slam', text: 'RUN!', pos: [0.5, 0.12], size: 0.16, accent: ACC },
  { t: at('jacket', 1.95), t1: at('tomorrow'), style: 'stamp', text: 'BURNT', pos: [0.5, 0.12], size: 0.1, accent: '#ff6a3d' },
  { t: at('tomorrow', 0.8), t1: at('question'), style: 'place', text: 'TOMORROW', sub: '3:33 AM', pos: [0.08, 0.08] },
  { t: at('question', 0.1), t1: END, style: 'kinetic', text: 'WOULD YOU|RUN?', hi: ['RUN?'], pos: [0.5, 0.1], size: 0.1 },
];

module.exports = {
  title: 'He Met Himself', T, END,
  config: { targetDuration: END, set: ST, look: 'neon-night', quality: 'good', effort: 'high', fps: 30, accent: ACC,
    sound: { music: { mood: 'tense', bpm: 96, drops: [at('run'), at('strike', 0.12), at('jacket', 2.0)] }, sfx: true, ambience: true, voice: { url: 'vo.wav' } },
    captions: { style: 'pop', sync: VO.words.map((w) => [w.w, w.start, w.end]) }, letterbox: 0 },
  thumbs: [
    { shot: 0, t: 1.0, text: 'HE MET\nHIMSELF', hi: ['HIMSELF'], accent: ACC, side: 'left' },
    { shot: 8, t: 1.2, text: 'RUN.', hi: ['RUN.'], accent: ACC, size: 'cu', side: 'right' },
    { shot: 12, t: 2.4, text: 'WHOSE\nJACKET?', hi: ['JACKET?'], accent: '#ff6a3d', side: 'left' },
  ],
  cast, shots, captions: [], titles,
};
