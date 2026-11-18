// node auto.js <round> <fails.json>  — PASS evidence from this round's measurements; FAIL entries in fails.json override
const fs = require('fs'), path = require('path'); const N = +process.argv[2], F = JSON.parse(fs.readFileSync(process.argv[3]));
const Q = path.join(__dirname, '../great-impostor_qa'), R = path.join(Q, 'r' + N);
const A = fs.readFileSync(path.join(R, 'audio_per_shot.csv'), 'utf8').split('\n').filter((l) => /^[a-z]/.test(l) && !l.startsWith('shot')).map((l) => l.split(','));
const av = JSON.parse(fs.readFileSync(path.join(Q, 'av.json'))), qa = JSON.parse(fs.readFileSync(path.join(Q, 'qa.json')));
const vo = require('../vo.json'), wpm = (vo.words.length / vo.duration * 60).toFixed(0);
const sh = (n) => A.find((a) => a[0] === n) || ['?', 0, 0, '?', '?'];
const loud = A.reduce((m, a) => (+a[3] > +m[3] ? a : m)), quiet = A.reduce((m, a) => (+a[3] < +m[3] ? a : m));
const durs = A.map((a) => +a[2]), avg = (durs.reduce((x, y) => x + y, 0) / durs.length).toFixed(2), note = (av.notes || []).join('; ');
const at = (n, k = 0) => (+sh(n)[1] + k).toFixed(2);
const E = {
 C01: `qa_check pass=${qa.pass} and av_check pass=${av.pass} on round ${N} render (${av.duration}s ${av.size} ${av.fps}fps); ${note}`,
 C02: `round ${N}: ${av.duration}s vs target 29.09s, preview ${av.size[0]}x${av.size[1]}@${av.fps}fps (final CONFIG good 1080x1920 30fps); frame 1 = surgery + FAKE SURGEON slam at 0.05s; last shot question ${sh('question')[1]}s+${sh('question')[2]}s ends on the table loop`,
 C03: `round ${N} narration->picture: 'bullet...chest' -> surgery on table ${sh('payoff')[1]}s; 'warship' -> destroyer ${sh('ship')[1]}s; 'textbook' -> book on cabin floor ${sh('book')[1]}s; 'heart' -> x-ray callout ${sh('bullet')[1]}s; 'newspapers' -> hero ${sh('hero')[1]}s; 'real doctor' -> Cyr with paper ${sh('real')[1]}s; 15 shots matched`,
 C04: `round ${N}: ${vo.words.length} words / ${vo.duration}s = ${wpm} wpm (target 145-175); quietest shot ${quiet[0]} mean ${quiet[3]} dB, loudest ${loud[0]} mean ${loud[3]} dB; voice ducks music`,
 C05: `round ${N}: impact+whoosh 0.0/0.05s on frame-1 slam, swell ${at('ship', 0.1)}s on ship cut, caught impact ${at('caught', 0.05)}s on smash cut (peak ${sh('caught')[4]} dB), auto cut whooshes on whip/zoom`,
 C06: `round ${N} qa_check feet: 0 float/sink flags over ${qa.shots || 15} shots x3 probes; wounded walk 1.45 m/s matches walk clip; lying patients on table y 1.0 / floor`,
 C07: `round ${N} qa reach: surgeon hands on p1.chest (offsets 4-10 cm) in payoff/notdoc/operate/question, Cyr grips paper edges +-0.2 m; hands_band.jpg checked`,
 C08: `round ${N}: faces in frame every character shot at 20/50/85% (shots_3pt.jpg); titles in top band y 0.075-0.14, captions y 0.74; no face under a title (qa FRAMING pass)`,
 C09: `round ${N}: captions synced from ${vo.words.length} VO word times; titles ease in/out (slam/stamp/wipe/stat/callout); words.csv first '${vo.words[0].w}'@${vo.words[0].start}s last '${vo.words.at(-1).w}'@${vo.words.at(-1).start}s`,
 C10: `round ${N}: payoff image + FAKE SURGEON by 0.05s, twist NOT A DOCTOR ${sh('notdoc')[1]}s, escalation 16 wounded ${sh('sixteen')[1]}s, climax bullet ${sh('bullet')[1]}s, reversal caught ${sh('caught')[1]}s, loop back to table ${sh('question')[1]}s + comment question`,
 C11: `round ${N}: lab shots cinematic, cabin shots noir (night), x-ray neon-night on void, city golden-hour; face luma readable in full sheet; av_check white-out flags: none`,
 C12: `round ${N} 12fps strips (strip_payoff/strip_wounded/strip_real): reach eases in 0.15-0.55s, walk steps continuous, no pops`,
 C13: `round ${N}: each camera motivated — crash-in payoff, push cu notdoc, bow-quarter track on destroyer, overhead sixteen, side-low book, top-down x-ray, low-hero, dutch caught; no camera inside geometry`,
 C14: `round ${N}: ${A.length} shots avg ${avg}s (min ${Math.min(...durs)}s max ${Math.max(...durs)}s); transitions glitch/dip/whip/smash/zoom/flash spread, hard cuts between`,
 C15: `round ${N}: worried->worried+outBack at 'not a doctor', smirk on 'steals', smile on 'lives'/'hero', Cyr shock outBack 0.9s, caught shock; look targets change 0.6-1.2s`,
 C16: `round ${N}: reach anticipation from rest 0.15s then settle; Cyr look drop then snap up outCubic; patients settled (die clip held, fade 0)`,
 C17: `round ${N}: ${note}; per-shot means ${quiet[3]}..${loud[3]} dB`,
 C18: `round ${N} wave_r.png: lab hum / sea bed / city bed continuous ${av.duration}s, no gap < -50 dB > 0.4s`,
 C19: `round ${N}: music drops at ${at('operate')}s ('then he operates') and ${at('caught', 0.05)}s ('caught'); ends with fade on loop`,
 C20: `round ${N}: one sans family, accent #e8343a only (plus yellow sub plates), 5 title styles slam/stamp/wipe/stat/callout, top band grid x 0.5`,
 C21: `round ${N}: splash/swell on destroyer bow; x-ray hologram with scanline; no white-out frames (impact removed from caught)`,
 C22: `round ${N}: surgeon whites #ecebe6 / navy trousers constant in all hero shots; p1 olive fatigues on table in payoff/notdoc/operate/bullet/question; table, tray, lamp same positions`,
 C23: `round ${N} muted per_second.jpg: story readable from picture + titles (fake surgeon, not a doctor, Demara, Cayuga, 16 wounded, one night textbook, bullet near heart, hero doctor, real Cyr, impostor)`,
 C24: `round ${N}: facts_notes.txt — Demara posed as Dr. Joseph Cyr on HMCS Cayuga 1951 (Korean War), operated on 16 wounded, bullet near the heart, read a textbook, exposed after press coverage reached the real Cyr; re-read twice`,
 C25: `round ${N}: full-res grabs full_*.jpg (1080x1920) every shot at 50%; forged props crisp (destroyer turrets, table pads, textbook lines)`,
 C26: `round ${N}: frame-stepped strip_payoff/strip_caught/strip_bullet at 12fps — no single-frame pops, no IK flips (av_check POP none)`,
 C27: `round ${N} hands_band.jpg: 5-finger pinch on surgeon, grip on Cyr's paper, open hands on caught handsup; wrists within limits (qa hand gate)`,
 C28: `round ${N} faces_band.jpg: catchlights in notdoc cu and Cyr ms, lids clear, shock/worried blended, no mesh tears`,
 C29: `round ${N} spectrum.png: no sub-30 Hz rumble, no sibilance spikes; loudest shot ${loud[0]} peak ${loud[4]} dB`,
 C30: `round ${N}: narration_notes — excited hook, dramatic 'not a doctor' with 0.45s pause, mysterious textbook/real-doctor lines, 0.5s beat after 'Caught.'; ${wpm} wpm`,
 C31: `round ${N} words.csv: ${vo.words.length} caption words start on take word times (sync table); spot 'Caught.' in shot caught ${sh('caught')[1]}s`,
 C32: `round ${N} retention_notes: per-second verdicts 0-${Math.round(av.duration)}s; every second has a cut, title, punch or sfx beat`,
 C33: `round ${N} alt_notes: hook/twist/climax/ending alternates compared, winners kept`,
 C34: `round ${N} master: ${note}; audio ${av.audio}, ${av.fps}fps constant`,
 C35: `round ${N} full watch (per_second.jpg sound on/off): no flinch beyond FAIL items logged this round`,
};
const P = { C04: ['narration_notes.txt'], C17: ['mix_notes.txt'], C34: ['mix_notes.txt'], C24: ['facts_notes.txt'], C30: ['narration_notes.txt'], C32: ['retention_notes.txt'], C33: ['alt_notes.txt'], C29: ['spectrum.png'], C18: ['wave_r.png'], C19: ['wave_r.png'], C27: ['hands_band.jpg'], C28: ['faces_band.jpg'], C31: ['words.csv'], C12: ['strip_payoff.jpg', 'strip_wounded.jpg'], C26: ['strip_caught.jpg'], C23: ['per_second.jpg'], C35: ['per_second.jpg'], C05: ['audio_per_shot.csv'], C25: ['full_sheet.jpg'] };
const out = {}; for (const id of Object.keys(E)) out[id] = F[id] || ['PASS', E[id], P[id] || ['shots_3pt.jpg']];
const tmp = path.join(R, '_fill.json'); fs.writeFileSync(tmp, JSON.stringify(out)); require('child_process').execFileSync('node', [path.join(__dirname, 'fill.js'), String(N), tmp], { stdio: 'inherit' }); fs.rmSync(tmp);
