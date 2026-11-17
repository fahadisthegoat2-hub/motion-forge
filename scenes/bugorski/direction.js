// "The Beam Through His Head" — Anatoli Bugorski (true story, Protvino, 13 July 1978). Shot starts come from the voiceover word times.
const fs = require('fs'), path = require('path');
const P = Math.PI;
const VO = JSON.parse(fs.readFileSync(path.join(__dirname, 'vo.json'), 'utf8'));
const CUES = [
  ['hook', 'a particle'], ['hook2', 'head'], ['work', 'and he went'], ['year', 'russia'], ['fix', 'anatoli'], ['ring', 'a giant'], ['failed', 'the safety'], ['leans', 'he leans'],
  ['flash', 'he sees'], ['nopain', 'no pain'], ['doctors', 'doctors'], ['swells', 'his face'], ['survives', 'then'], ['phd', 'he finishes'], ['back', 'and goes'], ['question', 'would you'],
];
const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9' -]/g, '');
const words = VO.words.map((w) => ({ w: norm(w.w), start: w.start }));
function findCue(ph, after) { const p = ph.split(' ');
  for (let i = 0; i < words.length; i++) if (words[i].start >= after - 0.05 && p.every((x, k) => words[i + k] && words[i + k].w === x)) return words[i].start;
  throw new Error('cue ' + ph); }
const T = {}; let last = 0;
for (const [id, ph] of CUES) { T[id] = id === 'hook' ? 0 : Math.max(0, findCue(ph, last) - 0.1); last = T[id] + 0.1; }
const END = +(VO.duration + 0.55).toFixed(2);
const ids = CUES.map((c) => c[0]), dur = (id) => +((ids.indexOf(id) < ids.length - 1 ? T[ids[ids.indexOf(id) + 1]] : END) - T[id]).toFixed(3);
const at = (id, k = 0) => +(T[id] + k).toFixed(3);
const wordAt = (wd, after = 0) => { const i = words.findIndex((x) => x.w === wd && x.start >= after); return words[i].start; };

// ---------- cast ----------
const LAB = { top: '#e4e6e1', bottom: '#3a3f47', shoes: '#1d1b19' };      // light work shirt, dark trousers
const GOWN = { top: '#a9bccb', bottom: '#a9bccb', shoes: '#cfcfcf' };
const cast = {
  hero: { character: 'jake', wardrobe: LAB },
  doc1: { character: 'walt', wardrobe: { top: '#f1f1ec', bottom: '#e3e3dd', shoes: '#3a3a3a' } },
  doc2: { character: 'marcus', wardrobe: { top: '#f1f1ec', bottom: '#e3e3dd', shoes: '#3a3a3a' } },
};

// ---------- the accelerator (Forge 3D Ultra models) ----------
const VOID = { type: 'void', id: 'tunnel' };
const MAG_H = 2.1, MS = MAG_H / 1.51;                 // magnet scale
const BEAM_Y = +(0.8 * MS).toFixed(3), BEAM_Z = +(-1.3 + 0.3 * MS).toFixed(3);   // beam line through the magnet gaps
const PIPE_END = +(4 - 1.45 * MS).toFixed(3);      // open beam section between the two magnets (x = ±PIPE_END)
const TUNNEL = [-12, -8, -4, 0, 4, 8, 12, 16, 20].map((x) => ({ type: 'model', id: 'accel_tunnel', height: 3.77, p: [[0, [x, 0.004, 0]]] }));
const MAGNETS = [-4, 4, 10.4, 16.8].map((x) => ({ type: 'model', id: 'accel_magnet', height: MAG_H, p: [[0, [x, 0.004, -1.3]]] }));
const ACCEL = [...TUNNEL, ...MAGNETS];
const CONSOLE = { type: 'model', id: 'control_console', height: 1.94, p: [[0, [-10.0, 0.004, -1.75]]] };
const beamHead = (t0, t1, o = {}) => ({ type: 'beam', attach: 'hero.head', start: t0, end: t1, pos: [-1.6, -0.1, 0], to: [1.6, -0.1, 0], radius: 0.09, color: '#9fe4ff', intensity: 1.3, ...o });
const beamFx = (t0, t1, o = {}) => ({ type: 'beam', start: t0, end: t1, pos: [-PIPE_END, BEAM_Y, BEAM_Z], to: [PIPE_END, BEAM_Y, BEAM_Z], radius: 0.07, color: '#9fe4ff', intensity: 1.6, ...o });
const HOSP = { type: 'interior', id: 'clinic', wall: '#cfd8d2' };
const BED = { type: 'model', id: 'hospital_bed', height: 1.95, p: [[0, [0.6, 0, -1.6]]] };
const HEAD_Z = BEAM_Z;           // kneels ON the beam line facing +X: the beam enters the back of his skull and exits by the nose                          // where he kneels so the lean puts his head on the beam line
const kneel = (d) => [{ clip: 'kneel', start: -2, end: d + 1, loop: false }];
const idle = (d) => [{ clip: 'idle', start: 0, end: d + 1 }];
const lean = (t0, a = 0.2) => ({ spine: [[0, [0, 0, 0]], [t0, [0, 0, 0]], [t0 + 0.9, [a * 0.5, 0, 0], 'inOutSine']], spine1: [[0, [0, 0, 0]], [t0, [0, 0, 0]], [t0 + 0.9, [a * 0.35, 0, 0], 'inOutSine']], neck: [[0, [0, 0, 0]], [t0 + 0.2, [0, 0, 0]], [t0 + 1.0, [-0.08, 0, 0], 'inOutSine']] });
const leaned = (a = 0.2) => ({ spine: [[0, [a * 0.5, 0, 0]]], spine1: [[0, [a * 0.35, 0, 0]]], neck: [[0, [-0.08, 0, 0]]] });

const shots = [];
const S = (id, o) => shots.push({ name: id, dur: dur(id), ...o });
const tHit = +(wordAt('through') - T.hook).toFixed(3);   // beam hits on "through"

// 1 · HOOK — the beam goes through his head (payoff first)
S('hook', { role: 'payoff', set: VOID, look: 'cinematic', impact: [tHit], punch: [tHit], afterimage: [[0, 0], [tHit, 0.8], [tHit + 0.5, 0]], time: [[0, 0], [tHit - 0.1, tHit - 0.1], [dur('hook'), tHit + (dur('hook') - tHit) * 0.45, 'outCubic']],
  camera: { pos: [[0, [3.4, 1.7, 4.2]], [tHit - 0.2, [1.15, 1.12, 0.25], 'outExpo']], look: [[0, [0.36, 1.06, -0.86]]], fov: 38, handheld: 0.9, shakes: [tHit] },
  cast: { hero: { pos: [[0, [0, 0.004, HEAD_Z]]], rotY: [[0, P / 2]], clips: kneel(3), bones: leaned(), look: [[0, [2, 1.35, BEAM_Z]]], face: { squint: [[0, 0.5], [tHit, 1, 'outBack']], shock: [[tHit, 0], [tHit + 0.25, 0.7]] }, acting: 'none' } },
  fx: [...ACCEL, beamHead(tHit - 0.04, 9), { type: 'sparks', t: tHit, attach: 'hero.head', pos: [0.14, -0.1, 0], scale: 0.5 }],
  sfx: [{ t: 0, type: 'impact', gain: 0.7 }, { t: tHit, type: 'zap', gain: 1 }, { t: tHit, type: 'boom', gain: 0.4 }] });
// 1b · "…head." — snap to the front: the beam still through him, the shock lands
S('hook2', { cut: 'smash', set: VOID, look: 'clean-cg', punch: [0.05],
  camera: { pos: [[0, [1.25, 1.1, -0.5]], [dur('hook2'), [1.12, 1.09, -0.56], 'outCubic']], look: [[0, [0.36, 1.06, -0.86]]], fov: 36, handheld: 1.0, shakes: [0.02] },
  cast: { hero: { pos: [[0, [0, 0.004, HEAD_Z]]], rotY: [[0, P / 2]], clips: kneel(2), bones: leaned(), look: [[0, [2, 1.35, BEAM_Z]]], face: { squint: [[0, 1]], shock: [[0, 0.7]] }, acting: 'none' } },
  fx: [...ACCEL, beamHead(0, 9), { type: 'sparks', t: 0.02, attach: 'hero.head', pos: [0.14, -0.1, 0], scale: 0.35 }] });
// 2 · "And he went back to work." — calm at the console, flips a switch
S('work', { cut: 'smash', set: VOID, look: 'cinematic',
  camera: { move: 'push', target: 'hero', size: 'mls', az: 95, handheld: 0.3 },
  cast: { hero: { pos: [[0, [-10.05, 0.004, -1.2]]], rotY: [[0, P]], clips: idle(3), reach: [{ hand: 'right', to: [-10.2, 1.04, -1.42], start: 0.25, end: dur('work') }], hands: { right: 'point' },
    look: [[0, [-10.25, 1.1, -1.4]]], face: { smirk: [[0.6, 0], [1.1, 0.25]] }, acting: 'none' } },
  fx: [...ACCEL, CONSOLE], sfx: [{ t: 0.85, type: 'tick', gain: 0.8 }] });
// 3 · "Russia. 1978." — the tunnel, magnets marching into the dark
S('year', { cut: 'dip', set: VOID, look: 'noir',
  camera: { pos: [[0, [14, 1.6, 1.8]], [dur('year'), [11.5, 1.5, 1.6], 'inOutSine']], look: [[0, [4, 1.1, -1.2]], [dur('year'), [2, 1.1, -1.2], 'inOutSine']], fov: 40, handheld: 0.4 },
  fx: [...ACCEL], sfx: [{ t: 0.2, type: 'swell', gain: 0.5 }] });
// 4 · "Anatoli Bugorski is fixing…" — kneeling at the open beam section, working
S('fix', { cut: 'whip', set: VOID, look: 'cinematic',
  camera: { pos: [[0, [1.7, 1.35, 0.8]], [dur('fix'), [1.0, 1.3, 1.15], 'inOutSine']], look: [[0, [0.2, 0.95, -0.85]]], fov: 46 },
  cast: { hero: { pos: [[0, [0, 0.004, HEAD_Z]]], rotY: [[0, P / 2]], clips: [{ clip: 'fix', start: 0, end: dur('fix') + 1 }], hands: { both: 'pinch' }, look: [[0, [0.7, BEAM_Y - 0.5, BEAM_Z]]], face: { squint: [[0, 0.6]] } } },
  fx: [...ACCEL], sfx: [{ t: 0.5, type: 'tick', gain: 0.5 }, { t: 1.1, type: 'tick', gain: 0.5 }] });
// 5 · "…a giant particle accelerator." — crane up and out: the machine dwarfs him
S('ring', { set: VOID, look: 'cinematic',
  camera: { pos: [[0, [1.2, 1.4, 2.4]], [dur('ring'), [3.5, 3.1, 4.8], 'inOutCubic']], look: [[0, [0, 0.9, -0.8]], [dur('ring'), [0.5, 0.8, -1], 'inOutCubic']], fov: 46 },
  cast: { hero: { pos: [[0, [0, 0.004, HEAD_Z]]], rotY: [[0, P / 2]], clips: [{ clip: 'fix', start: 0, end: dur('ring') + 1 }], hands: { both: 'pinch' }, acting: 'none' } },
  fx: [...ACCEL] });
// 6 · "The safety system has failed." — the console, warning lamps, nobody there
S('failed', { cut: 'glitch', set: VOID, look: 'horror', punch: [0.9],
  camera: { pos: [[0, [-9.2, 1.55, -0.3]], [dur('failed'), [-9.45, 1.5, -0.75], 'inOutSine']], look: [[0, [-9.7, 1.3, -1.6]]], fov: 38, handheld: 0.5 },
  fx: [...ACCEL, CONSOLE], sfx: [{ t: 0.9, type: 'glitch', gain: 0.6 }] });
// 7 · "He leans in. Right into the beam." — profile: the lean, the beam already there
S('leans', { cut: 'zoom', set: VOID, look: 'cinematic',
  camera: { move: 'static', target: 'hero', size: 'mls', az: -80, handheld: 0.4 },
  cast: { hero: { pos: [[0, [0, 0.004, HEAD_Z]]], rotY: [[0, P / 2]], clips: kneel(4), bones: lean(0.15), look: [[0, [1.5, BEAM_Y - 0.15, BEAM_Z]]], face: { squint: [[0, 0.5]] }, acting: 'none' } },
  fx: [...ACCEL, beamHead(1.05, 9, { intensity: 0.9, radius: 0.08 })], sfx: [{ t: 0.3, type: 'swell', gain: 0.4 }] });
// 8 · "He sees a flash brighter than a thousand suns." — eye ECU, white-out, slow motion
const tFlash = +(wordAt('flash') - T.flash).toFixed(3);
S('flash', { cut: 'smash', set: VOID, look: 'clean-cg', flash: tFlash, punch: [tFlash], time: [[0, 0], [tFlash, tFlash], [dur('flash'), tFlash + (dur('flash') - tFlash) * 0.35, 'outCubic']],
  camera: { pos: [[0, [1.15, 1.1, -0.62]], [dur('flash'), [1.02, 1.09, -0.68], 'inOutSine']], look: [[0, [0.4, 1.07, -0.88]]], fov: 26, handheld: 0.5, shakes: [tFlash] },
  cast: { hero: { pos: [[0, [0, 0.004, HEAD_Z]]], rotY: [[0, P / 2]], clips: kneel(4), bones: leaned(), look: [[0, [2, 1.35, BEAM_Z]]], face: { squint: [[0, 0.3], [tFlash, 1, 'outBack']], shock: [[tFlash, 0], [tFlash + 0.3, 0.5]] }, acting: 'none' } },
  fx: [...ACCEL, beamHead(tFlash - 0.05, 9, { intensity: 1.2 }), { type: 'sparks', t: tFlash, attach: 'hero.head', pos: [0.14, -0.1, 0], scale: 0.4 }],
  sfx: [{ t: tFlash, type: 'zap', gain: 1 }, { t: tFlash + 0.05, type: 'riser', gain: 0.5 }] });
// 9 · "No pain at all." — x-ray: the beam's path, back of the skull → nose
S('nopain', { cut: 'flash', set: VOID, look: 'neon-night',
  camera: { pos: [[0, [0.15, 1.18, 0.35]], [dur('nopain'), [0.62, 1.16, 0.28], 'inOutSine']], look: [[0, [0.28, 1.06, -0.85]]], fov: 40 },
  cast: { hero: { pos: [[0, [0, 0.004, HEAD_Z]]], rotY: [[0, P / 2]], clips: kneel(3), bones: leaned(0.3), xray: [[0, 0.4], [0.3, 1]], xrayColor: '#7fe0ff', look: [[0, [2, BEAM_Y, BEAM_Z + 0.3]]], face: { worried: [[0.4, 0.3]] }, acting: 'none' } },
  fx: [...ACCEL] });
// 10 · "Doctors give him days to live." — Moscow clinic
S('doctors', { cut: 'dip', set: HOSP, look: 'warm-film',
  camera: { pos: [[0, [2.7, 1.75, 0.7]], [dur('doctors'), [2.4, 1.65, 0.3], 'inOutSine']], look: [[0, [0.6, 0.85, -1.9]]], fov: 42 },
  cast: { hero: { pos: [[0, [0.6, 0.66, -1.75]]], rotY: [[0, 0]], clips: [{ clip: 'lie', start: 0, end: dur('doctors') + 1 }], wardrobe: GOWN, face: { sad: [[0, 0.3]] }, acting: 'none' },
    doc1: { pos: [[0, [-0.45, 0, -1.5]]], rotY: [[0, P / 2]], clips: idle(3), gestures: [{ type: 'think', start: 0.3, end: dur('doctors') }], look: [[0, 'hero']], face: { worried: [[0, 0.6]] } },
    doc2: { pos: [[0, [1.55, 0, -2.45]]], rotY: [[0, -P / 2 + 0.2]], clips: idle(3), gestures: [{ type: 'headhold', start: 0.6, end: dur('doctors') }], look: [[0, 'hero']], face: { sad: [[0, 0.5]] } } },
  fx: [BED] });
// 11 · "His face swells. His skin peels off." — close on his face, burned side glowing
S('swells', { cut: 'whip', set: HOSP, look: 'warm-film', punch: [+(wordAt('peels') - T.swells).toFixed(3)],
  camera: { pos: [[0, [1.55, 1.3, -1.75]], [dur('swells'), [1.4, 1.22, -1.95], 'inOutSine']], look: [[0, [0.6, 0.79, -2.36]]], fov: 34, handheld: 0.3 },
  cast: { hero: { pos: [[0, [0.6, 0.66, -1.75]]], rotY: [[0, 0]], clips: [{ clip: 'lie', start: 0, end: dur('swells') + 1 }], wardrobe: GOWN, face: { squint: [[0, 0.7]], sad: [[0, 0.4], [1, 0.8]], worried: [[0.5, 0.6]] }, acting: 'none' } },
  fx: [BED] });
// 12 · "Then… he survives." — he sits up, light through the window
S('survives', { cut: 'dip', set: HOSP, look: 'warm-film', punch: [+(wordAt('survives') - T.survives + 0.05).toFixed(3)],
  camera: { move: 'crane-up', target: 'hero', size: 'ms', az: 45 },
  cast: { hero: { pos: [[0, [0.6, 0.66, -1.95]]], rotY: [[0, 0]], clips: [{ clip: 'sit', start: -2, end: dur('survives') + 1, loop: false }], wardrobe: GOWN, look: [[0, [-3.5, 1.6, -0.6]]], face: { smile: [[0.6, 0], [1.3, 0.35]] }, acting: 'none' } },
  fx: [BED] });
// 13 · "He finishes his PhD." — back in his work clothes, a quiet win
S('phd', { cut: 'whip', set: HOSP, look: 'warm-film',
  camera: { move: 'low-hero', target: 'hero', size: 'ms', az: 20 },
  cast: { hero: { pos: [[0, [-1.2, 0, 0.4]]], rotY: [[0, 0.2]], clips: idle(3), gestures: [{ type: 'fistpump', start: 0.35, end: dur('phd'), side: 'right' }], look: [[0, [0, 1.6, 4]]], face: { smile: [[0.3, 0.2], [0.7, 0.55]] } } },
  fx: [] , sfx: [{ t: 0.45, type: 'hit', gain: 0.5 }] });
// 14 · "And goes back to the same machine." — walks into the tunnel
S('back', { cut: 'zoom', set: VOID, look: 'cinematic',
  camera: { move: 'track', target: 'hero', size: 'mls', side: 'left' },
  cast: { hero: { pos: [[0, [6.0, 0.004, 0.1]], [dur('back'), [6.0 - 1.4 * dur('back'), 0.004, 0.1], 'linear']], rotY: [[0, -P / 2]], clips: [{ clip: 'walk', start: 0, end: dur('back') + 1 }], look: [[0, [-4, 1.1, -0.9]]], face: { squint: [[0, 0.3]] } } },
  fx: [...ACCEL] });
// 15 · "Would you?" — back to the opening image (loop)
S('question', { cut: 'zoom', set: VOID, look: 'clean-cg',
  camera: { pos: [[0, [1.7, 1.28, 0.9]], [dur('question'), [1.05, 1.18, 0.2], 'inOutSine']], look: [[0, [0.36, 1.06, -0.86]]], fov: 40 },
  cast: { hero: { pos: [[0, [0, 0.004, HEAD_Z]]], rotY: [[0, P / 2]], clips: kneel(4), bones: leaned(0.3), look: [[0, [2, BEAM_Y - 0.1, BEAM_Z]], [0.5, 'camera', 'inOutSine']], face: { smirk: [[0.5, 0], [0.9, 0.2]] }, acting: 'none' } },
  fx: [...ACCEL, beamHead(0, 9, { intensity: 0.7, radius: 0.07 })] });

// ---------- motion graphics (one design system: cyan accent · slam · wipe · stamp · callout · kinetic) ----------
const A = '#5fd4ff';
const titles = [
  { t: 0.05, t1: at('work'), style: 'slam', text: 'A BEAM WENT\nTHROUGH HIS HEAD', pos: [0.5, 0.09], size: 0.085, accent: A },
  { t: at('work', 0.15), t1: at('year'), style: 'stamp', text: 'BACK TO WORK', pos: [0.5, 0.12], size: 0.08, accent: A },
  { t: at('year', 0.15), t1: at('fix'), style: 'wipe', text: 'PROTVINO, USSR', sub: 'JULY 13, 1978', pos: [0.5, 0.12] },
  { t: at('fix', 0.3), t1: at('ring'), style: 'wipe', text: 'ANATOLI BUGORSKI', sub: 'PARTICLE PHYSICIST · AGE 36', pos: [0.5, 0.12] },
  { t: at('ring', 0.5), t1: at('failed'), style: 'callout', at: [-4, MAG_H, -1.3], text: 'U-70 SYNCHROTRON', sub: '1.5 KM RING · 76 GeV', side: -1 },
  { t: at('failed', 0.85), t1: at('leans'), style: 'stamp', text: 'SAFETY FAILED', pos: [0.5, 0.12], size: 0.062, accent: '#ff3b2f' },
  { t: at('leans', 0.6), t1: at('flash'), style: 'callout', at: [-1.0, BEAM_Y + 0.06, BEAM_Z], text: 'PROTON BEAM', sub: 'NEAR LIGHT SPEED', side: -1 },
  { t: at('flash', tFlash + 0.1), t1: at('nopain'), style: 'kinetic', text: 'BRIGHTER THAN|1,000 SUNS', hi: ['1,000', 'SUNS'], pos: [0.5, 0.1], size: 0.085 },
  { t: at('nopain', 0.15), t1: at('doctors'), style: 'callout', at: 'hero.head', text: 'BACK OF SKULL → NOSE', sub: '2,000+ GRAY · 5 CAN KILL', side: 1 },
  { t: at('doctors', 0.3), t1: at('swells'), style: 'stamp', text: 'DAYS TO LIVE', pos: [0.5, 0.12], size: 0.08, accent: '#ff3b2f' },
  { t: at('swells', 0.3), t1: at('survives'), style: 'callout', at: 'hero.face', text: 'LEFT SIDE', sub: 'SWELLS · PEELS · PARALYSED', side: 1 },
  { t: at('survives', 0.65), t1: at('phd'), style: 'slam', text: 'HE\nSURVIVED', pos: [0.5, 0.1], size: 0.11, accent: A },
  { t: at('phd', 0.35), t1: at('back'), style: 'stamp', text: 'PhD ✓', pos: [0.5, 0.12], size: 0.09, accent: A },
  { t: at('back', 0.3), t1: at('question'), style: 'wipe', text: 'SAME MACHINE', sub: 'KEPT WORKING THERE FOR DECADES', pos: [0.5, 0.12] },
  { t: at('question', 0.05), t1: END, style: 'kinetic', text: 'WOULD|YOU?', hi: ['YOU?'], pos: [0.5, 0.1], size: 0.12 },
];

module.exports = {
  title: 'The Beam Through His Head', T, END, BEAM_Y, BEAM_Z, HEAD_Z,
  config: { targetDuration: END, set: VOID, look: 'cinematic', quality: 'good', effort: 'maximum', fps: 30, accent: A,
    sound: { music: { mood: 'tension', bpm: 96, drops: [tHit, at('flash', tFlash), at('survives', 0.65)] }, sfx: true, ambience: true, voice: { url: 'vo.wav' } },
    captions: { style: 'pop', sync: VO.words.map((w) => [w.w, w.start, w.end]) }, letterbox: 0 },
  thumbs: [
    { shot: 0, t: tHit + 0.1, text: 'BEAM\nTHROUGH\nHIS HEAD', hi: ['HEAD'], accent: A, face: { hero: { squint: 1, shock: 0.6 } }, size: 'cu', side: 'left' },
    { shot: 7, t: tFlash + 0.2, text: '1,000\nSUNS', hi: ['SUNS'], accent: A, side: 'right' },
  ],
  cast, shots, captions: [], titles,
};
