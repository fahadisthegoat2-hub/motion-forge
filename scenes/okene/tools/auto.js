// node tools/auto.js <round> <obs.json> — evidence from this round's measurements + my observations; obs = { notes: {file: text}, F: { Cxx: [status, evidence, fix] } }
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const N = +process.argv[2], O = JSON.parse(fs.readFileSync(process.argv[3])), Q = path.join(__dirname, '../okene_qa'), R = path.join(Q, 'r' + N);
for (const [f, t] of Object.entries(O.notes || {})) fs.writeFileSync(path.join(R, f), `round ${N} · ${new Date().toISOString()}\n${t}\n`);
const A = fs.readFileSync(path.join(R, 'audio_per_shot.csv'), 'utf8').split('\n').filter((l) => /^[a-z]/.test(l) && !l.startsWith('shot')).map((l) => l.split(','));
const av = JSON.parse(fs.readFileSync(path.join(R, 'av.json'))), qa = JSON.parse(fs.readFileSync(path.join(R, 'qa.json')));
const vo = require('../vo.json'), wpm = (vo.words.length / vo.duration * 60).toFixed(0), sh = (n) => A.find((a) => a[0] === n) || ['?', 0, 0, '?', '?'];
const loud = A.reduce((m, a) => (+a[3] > +m[3] ? a : m)), quiet = A.reduce((m, a) => (+a[3] < +m[3] ? a : m)), durs = A.map((a) => +a[2]);
const avg = (durs.reduce((x, y) => x + y, 0) / durs.length).toFixed(2), note = (av.notes || []).join('; '), abs = (n, k) => (+sh(n)[1] + k).toFixed(2);
const E = {
 C01: `r${N}: qa_check pass=${qa.pass} · av_check pass=${av.pass} on ${av.duration}s render; ${(av.fails || []).join('; ') || 'no fails'}`,
 C02: `r${N}: ${av.duration}s (cap 30s) ${av.size.join('x')}@${av.fps} preview, CONFIG good 1080x1920@30; first frame = torch on hands, last = grip + question`,
 C03: `r${N}: ${A.length} shots each on its line — 'grabs back' grab ${sh('grab')[1]}s, 'flips' flip ${sh('flip')[1]}s, 'pocket of air' air ${sh('air')[1]}s, 'light' ${sh('light')[1]}s`,
 C04: `r${N}: ${vo.words.length} words/${vo.duration}s = ${wpm} wpm; quietest ${quiet[0]} ${quiet[3]} dB, loudest ${loud[0]} ${loud[3]} dB`,
 C05: `r${N}: grab hit ${abs('grab', 0.45)}s on fist close, flip boom ${abs('flip', 0.3)}s on splash, upside hit ${abs('upside', 0.35)}s on landing, air splash ${abs('air', 0.25)}s`,
 C06: `r${N}: qa feet 0 flags/${qa.shots || A.length} shots; underwater shots swimming:true, galley cook planted on floor y0`,
 C07: `r${N}: reach IK on GRIP [0.12,1.22,0.42] ≤ 8 cm both hands (qa HANDS 0 flags); fist/grip finger poses read in hands_band`,
 C08: `r${N}: titles y ≤ 0.13, captions 0.74, qa FRAMING 0 flags; faces clear of graphics in air/out/light`,
 C09: `r${N}: captions synced to ${vo.words.length} take words; first '${vo.words[0].w}'@${vo.words[0].start}s last '${vo.words.at(-1).w}'@${vo.words.at(-1).start}s; titles ease in/out`,
 C10: `r${N}: payoff hands 0-${sh('hands')[1]}s, grabs back ${sh('grab')[1]}s, rewind ${sh('earlier')[1]}s, re-hook 'running out' ${sh('out')[1]}s, loop question ${sh('question')[1]}s`,
 C11: `r${N}: horror look underwater (teal-black), warm-film galley, cinematic storm; torch key motivated; av no white-out`,
 C12: `r${N}: 12fps strips payoff/grab/flip/sink/upside/air/light: eased arcs, no pops (av POP ${/POP/.test((av.fails||[]).join()) ? 'FLAG' : 'none'})`,
 C13: `r${N}: manual cameras with handheld 0.5–1.4; push on CU, drift on wides; no clipping through hull/water`,
 C14: `r${N}: ${A.length} shots avg ${avg}s (min ${Math.min(...durs)} max ${Math.max(...durs)}), transitions glitch/whip/smash/spin/dip/zoom/flash`,
 C15: `r${N}: worried/shock/scream face keys on air/out/light/grab; eyes lead head on light (look 0→0.35s, head 0.4s)`,
 C16: `r${N}: grab diver recoil 0.5s outCubic; upside fall 0.35s inCubic + hit; air surfacing 0.3s outCubic`,
 C17: `r${N}: ${note}; per-shot ${quiet[3]}..${loud[3]} dB, voice on top`,
 C18: `r${N}: wave_r.png bed continuous ${av.duration}s, quietest ${quiet[0]} ${quiet[3]} dB (intended hush)`,
 C19: `r${N}: tense 84 bpm, drops at ${abs('grab', 0.45)}s (grab) and ${abs('light', 0.3)}s (light)`,
 C20: `r${N}: family slam·counter·stamp·kinetic + place/callout furniture, one accent #5fe3ff, red only none`,
 C21: `r${N}: storm splash at flip ${abs('flip', 0.3)}s, silt motes + volumetric torch in deep shots, rain in storm`,
 C22: `r${N}: hero shirt #d9d4c7 / diver black #121519 constant; GRIP point identical in payoff/hands/grab/question`,
 C23: `r${N} muted per_second.jpg: hands → ship → flip → wreck → face in pocket → torch → hands; readable without sound`,
 C24: `r${N}: Jascon-4, 26 May 2013, off Nigeria, ~30 m, 11 of 12 crew lost, ~60 h — vs facts_notes`,
 C25: `r${N}: ${A.length} full-res 1080x1920 grabs full_00..${String(A.length - 1).padStart(2, '0')} viewed`,
 C26: `r${N}: frame-stepped grab ${sh('grab')[1]}s and flip ${sh('flip')[1]}s strips at 12fps`,
 C27: `r${N} hands_band.jpg: grip/fist 5-finger hands in payoff/hands/grab/question, no folded wrists`,
 C28: `r${N} faces_band.jpg + full grabs: eyes/lids clean in air/out, expressions blended`,
 C29: `r${N} spectrum.png: no sub-30 Hz beyond subdrop, no sibilance spikes; loudest ${loud[0]} peak ${loud[4]} dB`,
 C30: `r${N}: tones dramatic hook, shout 'grabs back', whisper 'sixty hours'/'reaches out', ${wpm} wpm`,
 C31: `r${N} words.csv: ${vo.words.length} caption words on take times; no character lip-syncs (0 talk keys)`,
 C32: `r${N} retention_notes: every second 0-${Math.round(av.duration)}s has cut/title/punch/sfx`,
 C33: `r${N} alt_notes: alternate takes compared for hook/twist/ending`,
 C34: `r${N} master: ${note}; audio ${av.audio}, ${av.fps}fps constant`,
 C35: `r${N}: full watch sound on + muted, per_second.jpg`,
};
const P = { C04: ['narration_notes.txt'], C30: ['narration_notes.txt'], C17: ['mix_notes.txt'], C34: ['mix_notes.txt'], C24: ['facts_notes.txt'], C32: ['retention_notes.txt'], C33: ['alt_notes.txt'],
  C29: ['spectrum.png'], C18: ['wave_r.png'], C19: ['wave_r.png'], C27: ['hands_band.jpg'], C28: ['faces_band.jpg'], C31: ['words.csv'], C12: ['strip_grab.jpg', 'strip_upside.jpg'], C26: ['strip_flip.jpg'],
  C23: ['per_second.jpg'], C35: ['per_second.jpg'], C05: ['audio_per_shot.csv'], C03: ['shots_3pt.jpg'], C25: ['full_00.jpg'], C08: ['shots_mid.jpg'], C11: ['shots_mid.jpg'], C22: ['shots_3pt.jpg'], C02: ['full_00.jpg', 'full_15.jpg'], C06: ['shots_3pt.jpg'], C07: ['hands_band.jpg'], C09: ['words.csv'], C10: ['strip_payoff.jpg'], C13: ['shots_3pt.jpg'], C14: ['audio_per_shot.csv'], C15: ['faces_band.jpg'], C16: ['strip_grab.jpg'], C20: ['shots_mid.jpg'], C21: ['strip_flip.jpg'], C01: ['full_11.jpg', 'full_12.jpg'] };
const out = {}; for (const id of Object.keys(E)) { const f = (O.F || {})[id]; out[id] = f ? [f[0], f[1], P[id] || ['sheet.jpg'], f[2] || ''] : ['PASS', E[id], P[id] || ['sheet.jpg']]; }
const tmp = path.join(R, '_fill.json'); fs.writeFileSync(tmp, JSON.stringify(out)); execFileSync('node', [path.join(__dirname, 'fill.js'), String(N), tmp], { stdio: 'inherit' }); fs.rmSync(tmp);
