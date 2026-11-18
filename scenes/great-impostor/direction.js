// "The Fake Surgeon" — Ferdinand Waldo Demara aboard HMCS Cayuga, Korean War 1951 (true story). Shot starts come from the VO word times.
const fs = require('fs'), path = require('path');
const P = Math.PI;
const VO = JSON.parse(fs.readFileSync(path.join(__dirname, 'vo.json'), 'utf8'));
const CUES = [
  ['payoff', 'he pulled'], ['notdoc', 'he was'], ['year', 'nineteen'], ['steal', 'ferdinand'], ['ship', 'and joins'], ['wounded', 'then the'], ['sixteen', 'sixteen'],
  ['book', 'he locks'], ['operate', 'then he'], ['bullet', 'the bullet'], ['lives', 'every'], ['hero', 'newspapers'], ['real', 'the real'], ['caught', 'caught'], ['question', 'would you'],
];
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
const ACC = '#e8343a';

// ---------- cast ----------
const cast = {
  hero: { character: 'jake', wardrobe: { top: '#ecebe6', bottom: '#1d2533', shoes: '#141414' } },      // naval surgeon whites
  p1: { character: 'marcus', wardrobe: { top: '#5b6248', bottom: '#4a4f3a', shoes: '#2a2018' } },      // wounded soldiers, olive fatigues
  p2: { character: 'kofi', wardrobe: { top: '#646b4e', bottom: '#4a4f3a', shoes: '#2a2018' } },
  p3: { character: 'kwame', wardrobe: { top: '#5f664a', bottom: '#4a4f3a', shoes: '#2a2018' } },
  doc: { character: 'walt', wardrobe: { top: '#8a8f99', bottom: '#2f3440', shoes: '#1d1a17' } },      // the real Dr. Cyr
};
const SEA = { type: 'ocean', id: 'sea', swell: 1.2, calm: 0 };
const kneel = (d) => [{ clip: 'kneel', start: -2, end: d + 1, loop: false }];
const fix = (d) => [{ clip: 'fix', start: 0, end: d + 1 }];
const lie = (d) => [{ clip: 'die', start: -4, end: d + 1, loop: false }];
const idle = (d) => [{ clip: 'idle', start: 0, end: d + 1 }];
const at0 = (x, y, z) => [[0, [x, y, z]]];
// surgery layout: p1 lies on the operating table (long axis X, pad top 0.96 m); the impostor stands on its +Z side facing it
const TOP = 0.96;
const OR = (o = {}) => [{ type: 'model', id: 'operating_table', height: 0.97, p: [[0, [0, 0, 0]]] }, { type: 'model', id: 'instrument_tray', height: 1.07, p: [[0, [1.35, 0, 0.55]]], rotY: -0.4 },
  { type: 'model', id: 'surgical_lamp', height: 1.57, p: [[0, [0, 2.25, 0]]] }];
const PAT = (d, o = {}) => ({ pos: at0(0, TOP, 0), rotY: [[0, 0]], clips: lie(d), acting: 'none', face: { worried: [[0, 0.5]] }, ...o });
const SURG = (d, o = {}) => ({ pos: at0(0.05, 0, 0.62), rotY: [[0, P]], clips: idle(d), hands: { both: 'pinch' },
  reach: [{ hand: 'right', to: 'p1.chest', offset: [0.04, 0.06, 0.06], start: 0, end: d }, { hand: 'left', to: 'p1.chest', offset: [-0.1, 0.05, 0.08], start: 0, end: d }],
  look: [[0, 'p1.chest']], face: { squint: [[0, 0.6]], worried: [[0, 0.5]] }, acting: 'none', ...o });
const FLOOR = (d, o = {}) => ({ pos: at0(0, 0, 0), rotY: [[0, 0]], clips: lie(d), acting: 'none', face: { worried: [[0, 0.6]] }, ...o });

const shots = [];
const S = (id, o) => shots.push({ name: id, dur: dur(id), ...o });

// 1 · PAYOFF — mid-surgery in a ship's sickbay; crash-zoom in
S('payoff', { role: 'payoff', set: 'lab', look: 'cinematic', impact: [0.05], punch: [1.3],
  camera: { pos: [[0, [2.6, 2.3, 3.2]], [0.35, [1.5, 1.75, 2.2], 'outExpo'], [dur('payoff'), [1.3, 1.65, 1.95]]], look: [[0, [0, 1.0, 0]]], fov: 42, handheld: 0.8 },
  cast: { hero: SURG(dur('payoff')), p1: PAT(dur('payoff')) }, fx: OR(), sfx: [{ t: 0, type: 'impact', gain: 1 }, { t: 0.05, type: 'whoosh', gain: 0.7 }] });
// 2 · "He was not a doctor." — his face, sweat
S('notdoc', { cut: 'glitch', set: 'lab', look: 'cinematic',
  camera: { move: 'push', target: 'hero', size: 'cu', az: 25, handheld: 0.5 },
  cast: { hero: SURG(dur('notdoc'), { look: [[0, 'p1.chest'], [0.9, [-1.5, 1.6, 3], 'inOutSine']], face: { worried: [[0, 0.5], [0.8, 1, 'outBack']], squint: [[0, 0.4]] } }), p1: PAT(dur('notdoc')) }, fx: OR() });
// 3 · "1951." — a quiet room at night
S('year', { cut: 'dip', set: 'interior', look: 'noir',
  camera: { move: 'dolly-in', target: 'hero', size: 'mls', az: -30, handheld: 0.3 },
  cast: { hero: { pos: at0(0, 0, 0), rotY: [[0, 0.3]], clips: idle(dur('year')), look: [[0, [-2, 1.5, 2]], [0.8, [2, 1.5, 2], 'inOutSine']], face: { squint: [[0, 0.4]] } } } });
// 4 · "Ferdinand Demara steals a real doctor's name"
S('steal', { set: 'interior', look: 'noir', punch: [1.8],
  camera: { move: 'orbit', target: 'hero', size: 'ms', az: 20, span: 25 },
  cast: { hero: { pos: at0(0, 0, 0), rotY: [[0, 0.1]], clips: [{ clip: 'foldarms', start: 0, end: dur('steal') + 1 }], look: [[0, [1, 1.6, 3]], [1.2, 'camera', 'inOutSine'], [2.2, [-1.5, 1.5, 3], 'inOutSine']], face: { smirk: [[0.4, 0], [1.2, 0.8]] } } } });
// 5 · "and joins a warship as its surgeon."
S('ship', { cut: 'whip', set: SEA, look: 'cinematic',
  camera: { pos: [[0, [-10, 3, 34]], [dur('ship'), [-4, 3.5, 30], 'inOutSine']], look: [[0, [-4, 5, 0]], [dur('ship'), [3, 5, 0], 'inOutSine']], fov: 40, handheld: 0.4 },
  fx: [{ type: 'model', id: 'destroyer', height: 12, rotY: P / 2, p: [[0, [-6, -1.6, 0]], [dur('ship'), [2, -1.6, 0], 'linear']], tilt: [[0, [0, 0, 0.012]], [dur('ship'), [0, 0, -0.012], 'inOutSine']] }],
  sfx: [{ t: 0.1, type: 'swell', gain: 0.6 }] });
// 6 · "Then the wounded arrive."
S('wounded', { cut: 'smash', set: 'lab', look: 'cinematic', punch: [0.5],
  camera: { move: 'track', target: 'hero', size: 'mls', side: 'left', handheld: 0.6 },
  cast: { hero: { pos: [[0, [-2.4, 0, 1.2]], [dur('wounded'), [-2.4 + 1.45 * dur('wounded'), 0, 1.2]]], rotY: [[0, P / 2]], clips: [{ clip: 'walk', start: 0, end: dur('wounded') + 1 }], look: [[0, [1, 0.3, 0]]], face: { worried: [[0, 0.9]] } },
    p1: FLOOR(dur('wounded'), { pos: at0(0.6, 0, -0.8) }), p2: FLOOR(dur('wounded'), { pos: at0(-0.7, 0, -1.3), rotY: [[0, 0.4]] }) } });
// 7 · "Sixteen of them." — overhead on the bodies
S('sixteen', { set: 'lab', look: 'cinematic', punch: [0.1],
  camera: { move: 'overhead', target: 'p1', size: 'ws' },
  cast: { p1: FLOOR(dur('sixteen'), { pos: at0(0.6, 0, -0.8) }), p2: FLOOR(dur('sixteen'), { pos: at0(-0.7, 0, -1.3), rotY: [[0, 0.4]] }), p3: FLOOR(dur('sixteen'), { pos: at0(1.6, 0, 0.6), rotY: [[0, -0.3]] }) } });
// 8 · "He locks his door and speed-reads a surgery textbook."
S('book', { cut: 'zoom', set: 'interior', look: 'noir', time: [[0, 0], [dur('book'), dur('book') * 1.8]],
  camera: { pos: [[0, [0.9, 1.3, 1.4]], [dur('book'), [-0.6, 1.25, 1.5], 'inOutSine']], look: [[0, [0, 0.45, 0.35]]], fov: 42, handheld: 0.2 },
  cast: { hero: { pos: at0(0, 0, 0), rotY: [[0, 0]], clips: [{ clip: 'fix', start: 0, end: dur('book') * 2 }], hands: { both: 'soft' }, look: [[0, [0.08, 0.02, 0.5]], [1.2, [-0.1, 0.02, 0.5]], [2.4, [0.08, 0.02, 0.5]], [3.6, [-0.1, 0.02, 0.5]]], face: { squint: [[0, 0.8]] }, acting: 'none' } },
  fx: [{ type: 'model', id: 'textbook', height: 0.04, p: [[0, [0, 0, 0.5]]] }] });
// 9 · "Then he operates."
S('operate', { cut: 'whip', set: 'lab', look: 'cinematic', punch: [0.4],
  camera: { pos: [[0, [-1.5, 1.7, 1.7]], [dur('operate'), [-1.15, 1.6, 1.35], 'inOutSine']], look: [[0, [0, 1.05, 0.15]]], fov: 40, handheld: 0.5 },
  cast: { hero: SURG(dur('operate')), p1: PAT(dur('operate')) }, fx: OR() });
// 10 · "The bullet sits an inch from the heart." — x-ray
S('bullet', { cut: 'flash', set: 'lab', look: 'neon-night',
  camera: { pos: [[0, [0.2, 2.0, -1.5]], [dur('bullet'), [0.15, 1.75, -1.05], 'inOutSine']], look: [[0, [0, 1.0, 0]]], fov: 40 },
  cast: { hero: SURG(dur('bullet')), p1: PAT(dur('bullet'), { xray: [[0.1, 0], [0.5, 1]] }) }, fx: OR() });
// 11 · "Every patient lives."
S('lives', { cut: 'whip', set: 'lab', look: 'warm-film',
  camera: { move: 'dolly-out', target: 'hero', size: 'ws', az: 0 },
  cast: { hero: { pos: at0(0, 0, 0), rotY: [[0, 0]], clips: idle(dur('lives')), face: { smile: [[0.3, 0], [0.9, 0.6]] }, look: [[0, [1.2, 1.6, 0]], [0.6, [-1.2, 1.6, 0], 'inOutSine']] },
    p1: { pos: at0(1.2, 0, -0.5), rotY: [[0, -0.5]], clips: idle(dur('lives')), gestures: [{ type: 'thumbsup', start: 0.2, end: dur('lives') }], look: [[0, 'hero']], face: { smile: [[0, 0.7]] } },
    p2: { pos: at0(-1.2, 0, -0.5), rotY: [[0, 0.5]], clips: idle(dur('lives')), gestures: [{ type: 'clap', start: 0.1, end: dur('lives') }], look: [[0, 'hero']], face: { smile: [[0, 0.8]] } } } });
// 12 · "Newspapers call him a hero."
S('hero', { cut: 'zoom', set: 'city-day', look: 'golden-hour',
  camera: { move: 'low-hero', target: 'hero', size: 'mls', az: 15 },
  cast: { hero: { pos: at0(0, 0, 0), rotY: [[0, 0]], clips: idle(dur('hero')), gestures: [{ type: 'hips', start: 0.1, end: dur('hero') }], look: [[0, [2, 2, 5]]], face: { smile: [[0, 0.7]] } } } });
// 13 · "The real doctor sees the story."
S('real', { cut: 'dip', set: 'interior', look: 'warm-film',
  camera: { move: 'push', target: 'doc', size: 'ms', az: -15 },
  cast: { doc: { pos: at0(0, 0, 0), rotY: [[0, 0]], clips: idle(dur('real')), reach: [{ hand: 'right', to: [0.24, 1.2, 0.36], start: 0, end: dur('real') }, { hand: 'left', to: [-0.24, 1.2, 0.36], start: 0, end: dur('real') }], hands: { both: 'grip' }, look: [[0, [0, 1.25, 0.36]], [0.9, [0, 1.25, 0.36]], [1.1, [0.4, 1.6, 2], 'outCubic']], face: { shock: [[0.5, 0], [0.9, 1, 'outBack']] }, acting: 'none' } },
  fx: [{ type: 'model', id: 'newspaper', height: 0.42, p: [[0, [0, 1.0, 0.37]]], tilt: [[0, [-0.25, 0, 0]]] }] });
// 14 · "Caught."
S('caught', { cut: 'smash', set: 'lab', look: 'horror', punch: [0.05],
  camera: { move: 'dutch', target: 'hero', size: 'ms', az: 10, roll: 0.2, handheld: 1 },
  cast: { hero: { pos: at0(0, 0, 0), rotY: [[0, 0]], clips: idle(dur('caught')), gestures: [{ type: 'handsup', start: 0, end: dur('caught') }], look: [[0, 'camera']], face: { shock: [[0, 0.9]] }, acting: 'none' } },
  sfx: [{ t: 0.05, type: 'impact', gain: 1 }] });
// 15 · back to the surgery (loop)
S('question', { cut: 'zoom', set: 'lab', look: 'cinematic',
  camera: { pos: [[0, [1.3, 1.65, 1.95]], [dur('question'), [2.6, 2.2, 3.2], 'inOutSine']], look: [[0, [0, 1.0, 0]]], fov: 42 },
  cast: { hero: SURG(dur('question')), p1: PAT(dur('question')) }, fx: OR() });

// ---------- motion graphics (one system: slam · stamp · wipe · callout · stat) ----------
const titles = [
  { t: 0.05, t1: at('notdoc'), style: 'slam', text: 'FAKE\nSURGEON', pos: [0.5, 0.1], size: 0.1, accent: ACC },
  { t: at('notdoc', 0.6), t1: at('year'), style: 'stamp', text: 'NOT A DOCTOR', sub: 'ZERO MEDICAL TRAINING', pos: [0.5, 0.12], size: 0.075, accent: ACC },
  { t: at('year', 0.1), t1: at('steal'), style: 'wipe', text: 'CANADA', sub: '1951', pos: [0.5, 0.12] },
  { t: at('steal', 0.1), t1: at('steal', 1.6), style: 'wipe', text: 'FERDINAND DEMARA', sub: 'THE GREAT IMPOSTOR', pos: [0.5, 0.12] },
  { t: at('steal', 1.7), t1: at('ship'), style: 'stamp', text: 'DR. JOSEPH CYR', sub: 'A STOLEN NAME', pos: [0.5, 0.12], size: 0.07, accent: ACC },
  { t: at('ship', 0.2), t1: at('wounded'), style: 'wipe', text: 'HMCS CAYUGA', sub: 'WARSHIP · KOREAN WAR', pos: [0.5, 0.12] },
  { t: at('sixteen', 0.05), t1: at('book'), style: 'stat', value: 16, max: 16, suffix: '', text: 'WOUNDED', pos: [0.5, 0.14] },
  { t: at('book', 0.4), t1: at('operate'), style: 'callout', at: [0, 0.05, 0.5], text: 'SURGERY TEXTBOOK', sub: 'ONE NIGHT', side: 1 },
  { t: at('bullet', 0.5), t1: at('lives'), style: 'callout', at: 'p1.heart', text: 'BULLET', sub: '1 INCH FROM THE HEART', side: -1 },
  { t: at('lives', 0.1), t1: at('hero'), style: 'stamp', text: '16 / 16 LIVED', pos: [0.5, 0.12], size: 0.075, accent: '#2fbf5f' },
  { t: at('hero', 0.1), t1: at('real'), style: 'slam', text: 'HERO\nDOCTOR', pos: [0.5, 0.1], size: 0.1, accent: ACC },
  { t: at('real', 0.2), t1: at('caught'), style: 'wipe', text: 'THE REAL DR. CYR', sub: 'READS THE NEWS', pos: [0.5, 0.12] },
  { t: at('caught', 0.05), t1: at('question'), style: 'stamp', text: 'IMPOSTOR', pos: [0.5, 0.12], size: 0.11, accent: ACC },
  { t: at('question', 0.1), t1: END, style: 'slam', text: 'WOULD YOU\nLET HIM?', pos: [0.5, 0.1], size: 0.09, accent: ACC },
];

module.exports = {
  title: 'The Fake Surgeon', T, END,
  config: { targetDuration: END, set: 'lab', look: 'cinematic', quality: 'good', effort: 'maximum', fps: 30, accent: ACC,
    sound: { music: { mood: 'tense', bpm: 96, drops: [at('operate'), at('caught', 0.05)] }, sfx: true, ambience: true, voice: { url: 'vo.wav' } },
    captions: { style: 'pop', sync: VO.words.map((w) => [w.w, w.start, w.end]) }, letterbox: 0 },
  thumbs: [
    { shot: 1, t: 0.6, text: 'FAKE\nSURGEON', hi: ['SURGEON'], accent: ACC, face: { hero: { worried: 1, squint: 0.6 } }, size: 'cu', side: 'left' },
    { shot: 9, t: 1.2, text: 'NOT A\nDOCTOR', hi: ['DOCTOR'], accent: ACC, side: 'right' },
  ],
  cast, shots, captions: [], titles,
};
