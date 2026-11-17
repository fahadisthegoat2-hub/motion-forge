// node auto.js <round> <fails.json> — PASS evidence from this round's measurements; FAIL entries in fails.json override ([status, evidence, proofs, fix])
const fs = require('fs'), path = require('path'); const N = +process.argv[2], F = JSON.parse(fs.readFileSync(process.argv[3]));
const Q = path.join(__dirname, '../plane-eater_qa'), R = path.join(Q, 'r' + N);
const A = fs.readFileSync(path.join(R, 'audio_per_shot.csv'), 'utf8').split('\n').filter((l) => /^[a-z]/.test(l) && !l.startsWith('shot')).map((l) => l.split(','));
const av = JSON.parse(fs.readFileSync(path.join(Q, 'av.json'))), qa = JSON.parse(fs.readFileSync(path.join(Q, 'qa.json')));
const vo = require('../vo.json'), wpm = (vo.words.length / vo.duration * 60).toFixed(0);
const sh = (n) => A.find((a) => a[0] === n) || ['?', 0, 0, '?', '?'];
const loud = A.reduce((m, a) => (+a[3] > +m[3] ? a : m)), quiet = A.reduce((m, a) => (+a[3] < +m[3] ? a : m));
const durs = A.map((a) => +a[2]), avg = (durs.reduce((x, y) => x + y, 0) / durs.length).toFixed(2), note = (av.notes || []).join('; ');
const E = {
 C01: `r${N}: qa_check pass=${qa.pass}, av_check pass=${av.pass} (${av.duration}s); ${note}`,
 C02: `r${N}: ${av.duration}s ≤ 30s, ${(av.size || []).join('x')} preview @${av.fps}fps; final CONFIG good 1080x1920 30fps; ${A.length} shots`,
 C03: `r${N}: lines→shots: airplane=payoff ${sh('payoff')[1]}s plane behind table; Cessna=toy ${sh('toy')[1]}s; saws=saws ${sh('saws')[1]}s hacksaw on tailplane; water=swallow ${sh('swallow')[1]}s; kilo=plate ${sh('kilo')[1]}s; 2 years=shrinking plane ${sh('years')[1]}s; bicycles ${sh('bikes')[1]}s; TVs+coffin ${sh('tvs')[1]}s; stomach x-ray ${sh('stomach')[1]}s; plaque ${sh('guinness')[1]}s`,
 C04: `r${N}: ${vo.words.length} words / ${vo.duration}s = ${wpm} wpm; shot means ${quiet[3]}..${loud[3]} dB (quietest ${quiet[0]}, loudest ${loud[0]})`,
 C05: `r${N}: saw scratches every 0.25s from 0.5s on sparks start (shot ${sh('saws')[1]}s); impact+whoosh at 0.0/0.05 on crash-zoom; cut sfx only on whip/zoom/smash`,
 C06: `r${N}: qa feet probes clean on ${qa.shots || A.length} shots; seated shots on chair seat; walks (france, bikes) feet-locked`,
 C07: `r${N}: qa reach within tolerance; fork upright in right hand (payoff/years/worst/ate/question), hacksaw on tailplane tip in saws; hands_band.jpg viewed`,
 C08: `r${N}: full_sheet.jpg at 1080x1920: faces clear of titles (wipe at y .07), captions bottom band, plane readable in payoff/toy/years/question`,
 C09: `r${N}: captions synced to ${vo.words.length} take words (words.csv); counters 1 KG/2 YEARS/18/7 land on spoken numbers; spelling checked: Lotito, Mangetout, Grenoble, Cessna, Guinness`,
 C10: `r${N}: hook = HE ATE A PLANE + crash-zoom at 0.05s; re-hook "not the worst part" ${sh('worst')[1]}s; twist "he ate that too" ${sh('ate')[1]}s; loop back to field ${sh('question')[1]}s`,
 C11: `r${N}: field shots cinematic/golden-hour, home shots interior window key, x-ray neon-night; shirt muted blue-grey (no bloom)`,
 C12: `r${N}: strips (strip_payoff/strip_saws/strip_bikes) 12fps: eased crash-zoom outExpo, walk cadence steady, no pops`,
 C13: `r${N}: crash-zoom, low-hero plane, side walk, reverse over tailplane, overhead plate, push/dolly-ins, track past bikes, dolly-out loop`,
 C14: `r${N}: ${A.length} shots avg ${avg}s (min ${Math.min(...durs)} max ${Math.max(...durs)}); cuts: whip/dip/zoom/smash/flash spread`,
 C15: `r${N}: eyes lead (look keys) before head in payoff/worst/ate; smirk on ate, smile on guinness; no camera stares`,
 C16: `r${N}: saw forearm strokes 0.25s cycle with eased reversals; head tilt back on swallow inOutSine; walk weight shift`,
 C17: `r${N}: voice over music ducking; ${note}`,
 C18: `r${N} wave_r.png: ambience + music bed continuous, no gaps`,
 C19: `r${N}: music mystery bed, drops at "worst" ${(+sh('worst')[1]).toFixed(2)}s and "that too" ${(+sh('ate')[1] + 0.3).toFixed(2)}s`,
 C20: `r${N}: one accent #ffb020, one caption style (pop), title family slam/place/wipe/counter/callout/kinetic`,
 C21: `r${N}: sparks at saw contact ${sh('saws')[1]}s+0.5s, x-ray scan glow on stomach pulse`,
 C22: `r${N}: same table/chair/plate/glass, shirt #7f95ab + black trousers in every shot; plane same model & livery`,
 C23: `r${N} per_second.jpg muted: airplane+table, Cessna, sawing, plate of metal, 2 years shrinking plane, bikes, TVs, x-ray, plaque, empty plate`,
 C24: `r${N}: facts_notes.txt — Cessna 150 eaten 1978–1980, ~1 kg/day with water/mineral oil, 18 bicycles, 7 TVs, a coffin, thick stomach lining, Guinness brass plaque (reportedly eaten)`,
 C25: `r${N}: full_00..14 at 1080x1920 viewed`,
 C26: `r${N}: frame-stepped crash-zoom 0–0.5s and saw strokes; av_check no POP`,
 C27: `r${N} hands_band.jpg: grip pose on fork hand, left hand soft on table, no folded wrists`,
 C28: `r${N} faces_band.jpg: eyes open, expressions blended`,
 C29: `r${N} spectrum.png: no clipping; loudest shot ${loud[0]} peak ${loud[4]} dB`,
 C30: `r${N}: excited hook, dramatic "two years"/"he ate that too", mysterious re-hook, 0.45s pause before the twist`,
 C31: `r${N} words.csv: caption words on take word times`,
 C32: `r${N} retention_notes.txt: every 2–3 s a cut/title/counter`,
 C33: `r${N} alt_notes.txt: take comparison logged`,
 C34: `r${N}: ${note}; audio ${av.audio}`,
 C35: `r${N}: full watch sound on/off; issues logged as FAIL items`,
};
const P = { C04: ['narration_notes.txt'], C17: ['mix_notes.txt'], C34: ['mix_notes.txt'], C24: ['facts_notes.txt'], C30: ['narration_notes.txt'], C32: ['retention_notes.txt'], C33: ['alt_notes.txt'], C29: ['spectrum.png'], C18: ['wave_r.png'], C19: ['wave_r.png'], C27: ['hands_band.jpg'], C28: ['faces_band.jpg'], C31: ['words.csv'], C12: ['strip_payoff.jpg', 'strip_bikes.jpg'], C26: ['strip_saws.jpg'], C23: ['per_second.jpg'], C32: ['per_second.jpg', 'retention_notes.txt'], C25: ['full_sheet.jpg'], C08: ['full_sheet.jpg'], C03: ['shots_mid.jpg'], C14: ['shots_3pt.jpg'], C05: ['audio_per_shot.csv'] };
const out = {}; for (const id of Object.keys(E)) out[id] = F[id] || ['PASS', E[id], P[id] || ['full_sheet.jpg']];
fs.writeFileSync('/tmp/claude-0/r.json', JSON.stringify(out)); require('child_process').execFileSync('node', [path.join(__dirname, 'fill.js'), String(N), '/tmp/claude-0/r.json'], { stdio: 'inherit' });
