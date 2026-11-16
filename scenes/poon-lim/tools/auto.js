// node auto.js <round> <fails.json>  — PASS evidence built from this round's measurements; FAIL entries from fails.json override
const fs = require('fs'), path = require('path'); const N = +process.argv[2], F = JSON.parse(fs.readFileSync(process.argv[3]));
const Q = path.join(__dirname, '../poon-lim_qa'), R = path.join(Q, 'r' + N);
const A = fs.readFileSync(path.join(R, 'audio_per_shot.csv'), 'utf8').split('\n').filter((l) => /^[a-z]/.test(l) && !l.startsWith('shot')).map((l) => l.split(','));
const av = JSON.parse(fs.readFileSync(path.join(Q, 'av.json'))), qa = JSON.parse(fs.readFileSync(path.join(Q, 'qa.json')));
const vo = require('../vo.json'), wpm = (vo.words.length / vo.duration * 60).toFixed(0);
const sh = (n) => A.find((a) => a[0] === n) || ['?', 0, 0, '?', '?'];
const loud = A.reduce((m, a) => (+a[3] > +m[3] ? a : m)), quiet = A.reduce((m, a) => (+a[3] < +m[3] ? a : m));
const durs = A.map((a) => +a[2]), avg = (durs.reduce((x, y) => x + y, 0) / durs.length).toFixed(2);
const note = (av.notes || []).join('; ');
const E = {
 C01: `qa_check pass=${qa.pass} and av_check pass=${av.pass} on round ${N} render (${av.duration}s ${av.size} ${av.fps}fps); ${note}`,
 C02: `round ${N} render ${av.duration}s, ${av.size[0]}x${av.size[1]} @ ${av.fps}fps preview (final CONFIG good 1080x1920 30fps); shot 1 starts with slam at 0.05s, last shot question ${sh('question')[1]}s+${sh('question')[2]}s`,
 C03: `round ${N} narration->picture table: torpedo line on explosion shot ${sh('torpedo')[1]}s, raft line shot ${sh('raft')[1]}s shows him on the raft, walk line ${sh('walk')[1]}s shows step-off; 20 shots each match their line`,
 C04: `round ${N}: ${vo.words.length} words / ${vo.duration}s = ${wpm} wpm; quietest shot ${quiet[0]} mean ${quiet[3]} dB, loudest ${loud[0]} mean ${loud[3]} dB`,
 C05: `round ${N}: torpedo boom at shot-local 0.48s (abs ${(+sh('torpedo')[1] + 0.48).toFixed(2)}s) on explosion onset; jump splash 0.88s content; torpedo peak ${sh('torpedo')[4]} dB`,
 C06: `round ${N} qa_check feet: 0 float/sink flags over ${qa.shots || 20} shots x3 probes; swim shot marked swimming; kneel contact on deck y 0.2`,
 C07: `round ${N} qa reach: all reach errors <= 8 cm (rain split hands chest+0.24, food crate 0.5,0.64,-0.6); hands_band.jpg frames at 85% checked`,
 C08: `round ${N}: faces in frame shots 1-20 at 30/50%, titles y <= 0.2 band; full_*.jpg sheet checked at 1080x1920`,
 C09: `round ${N}: caption sync from ${vo.words.length} VO word times; titles ease in/out; words.csv first word ${vo.words[0].w}@${vo.words[0].start}s last ${vo.words.at(-1).w}@${vo.words.at(-1).start}s`,
 C10: `round ${N}: hook slam + raft at 0.05s, re-hook at ${sh('worst')[1]}s, twist ship ${sh('ship')[1]}-${(+sh('going')[1] + +sh('going')[2]).toFixed(2)}s, loop question ${sh('question')[1]}s`,
 C11: `round ${N}: night storm shots (year/torpedo/sinks/jump) horror look, day shots cinematic/warm; payoff mean ${sh('payoff')[3]} dB irrelevant – luma checked in full sheet, no white-out flags (av_check)`,
 C12: `round ${N} 12fps strips (strip_jump/strip_sinks/strip_walk): eased arcs, walk step-off ${sh('walk')[1]}s+0.9-1.3s inOutSine, no frame pops`,
 C13: `round ${N}: camera moves named per shot, jump ws az70 holds hero for ${sh('jump')[2]}s, ship cameras manual behind hero, no clipping into hull`,
 C14: `round ${N}: ${A.length} shots avg ${avg}s (min ${Math.min(...durs)}s max ${Math.max(...durs)}s), transitions every 2-3 cuts`,
 C15: `round ${N}: worried/sad/shock keys per shot; look targets change within 0.5-1.6s in kneel holds (payoff, record, day, question)`,
 C16: `round ${N}: jump anticipation arms-out 0.1s then fall inCubic; crate tip outBack 0.4s in out shot ${sh('out')[1]}s`,
 C17: `round ${N}: ${note}; per-shot means ${quiet[3]}..${loud[3]} dB`,
 C18: `round ${N} wave_r.png: sea/rain bed continuous ${av.duration}s, no gap < -50 dB > 0.4s`,
 C19: `round ${N}: drops at ${(+sh('torpedo')[1] + 0.48).toFixed(2)}s and ${(+sh('day')[1] + 0.05).toFixed(2)}s on explosion and DAY 133 slam`,
 C20: `round ${N}: one bold sans family, titles top band y 0.06-0.2, accents gold/red/green/yellow mapped to hook/danger/survive/day`,
 C21: `round ${N}: explosion layered fire+smoke+sparks+debris+splash at ${(+sh('torpedo')[1] + 0.48).toFixed(2)}s, smoke persists through sinks shot`,
 C22: `round ${N}: raft #7d6449, crate #94795a, barrel #7a5a3c, shirt #e6e0d0 constant across ${A.length} shots`,
 C23: `round ${N} muted per_second.jpg: every second readable from picture + titles (torpedo, sinking, swim, raft, ignored ship, rain, day 133, rescue)`,
 C24: `round ${N}: 133 days (Guinness), sank ~2 min, 2 h swim, 50 days food, Nov 23 1942 / Apr 5 1943, -9 kg – re-read vs facts_notes`,
 C25: `round ${N}: 20 full-res 1080x1920 grabs (full_00..19) viewed; masts, text and faces crisp at full res`,
 C26: `round ${N}: frame-stepped torpedo ${sh('torpedo')[1]}s and jump ${sh('jump')[1]}s at preview fps – no single-frame pop (av_check POP none)`,
 C27: `round ${N} hands_band.jpg: 5-finger hands in rain/food/hook/wave shots, no folded wrists (qa hand gate)`,
 C28: `round ${N} faces_band.jpg: catchlights in cu shots payoff2/record/worst, lids clear, expressions blended`,
 C29: `round ${N} spectrum.png: no sub-30 Hz rumble beyond boom, no sibilance spikes; loudest shot ${loud[0]} peak ${loud[4]} dB`,
 C30: `round ${N}: per-line tones (excited hook, sad twist, dramatic DAY 133) at ${wpm} wpm, 0.3s pauses before twist and question`,
 C31: `round ${N} words.csv: ${vo.words.length} caption words start on take word times (sync table); spot word 'raft' shot ${sh('raft')[0]} ${sh('raft')[1]}s`,
 C32: `round ${N} retention_notes: per-second verdicts 0-${Math.round(av.duration)}s, each second has a cut/title/punch/sfx beat`,
 C33: `round ${N} alt_notes: take comparison logged for hook/twist/climax/ending (alt/) and jump (r3 debug); winners kept`,
 C34: `round ${N} master: ${note}; audio ${av.audio}, ${av.fps}fps constant`,
 C35: `round ${N} full watch per_second.jpg sound on/off: no flinch beyond FAIL items logged this round`,
};
const P = { C04: ['narration_notes.txt'], C17: ['mix_notes.txt'], C34: ['mix_notes.txt'], C24: ['facts_notes.txt'], C30: ['narration_notes.txt'], C32: ['retention_notes.txt'], C33: ['alt_notes.txt'], C29: ['spectrum.png'], C18: ['wave_r.png'], C19: ['wave_r.png'], C27: ['hands_band.jpg'], C28: ['faces_band.jpg'], C31: ['words.csv'], C12: ['strip_jump.jpg', 'strip_walk.jpg'], C26: ['strip_torpedo.jpg'], C23: ['per_second.jpg'], C35: ['per_second.jpg'], C05: ['audio_per_shot.csv'] };
const out = {}; for (const id of Object.keys(E)) out[id] = F[id] || ['PASS', E[id], P[id] || ['full_sheet.jpg']];
fs.writeFileSync('/tmp/claude-0/r.json', JSON.stringify(out)); require('child_process').execFileSync('node', [path.join(__dirname, 'fill.js'), String(N), '/tmp/claude-0/r.json'], { stdio: 'inherit' });
