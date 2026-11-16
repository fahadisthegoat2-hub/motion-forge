#!/usr/bin/env node
// Automatic picture + sound forensics on a RENDERED video (with its soundtrack). Exit 1 = must fix.
// Checks: audio stream present · loudness (integrated LUFS) · true peak / clipping · loudness range · dead air (silence gaps) ·
// A/V length drift · black frames · frozen frames · white-out flashes · resolution/fps vs the scene's CONFIG.quality.
// Writes <out>/av.json and <out>/wave.png (waveform to LOOK at against the shot list).
// Usage: node av_check.js video.mp4 [--out dir] [--lufs -14] [--quality good|high|epic] [--holds "12.0-14.5,30-31"]
const { ffmpeg } = require('./lib/deps');
const { spawnSync, execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2), opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const input = args.find((a, i) => !a.startsWith('--') && !(args[i - 1] || '').match(/^--(out|lufs|quality|holds|scene)$/));
if (!input) { console.error('usage: av_check.js video.mp4 [--out dir] [--lufs -14] [--quality good|high|epic] [--holds "a-b,c-d"]'); process.exit(1); }
const out = opt('--out', input.replace(/\.[^.]+$/, '') + '_qa'); fs.mkdirSync(out, { recursive: true });
const LUFS = +opt('--lufs', -14), Q = opt('--quality', null);
const holds = (opt('--holds', '') || '').split(',').filter(Boolean).map((r) => r.split('-').map(Number));
const inHold = (a, b) => holds.some(([h0, h1]) => a >= h0 - 0.05 && b <= h1 + 0.05);
const run = (vf, af) => spawnSync(ffmpeg(), ['-hide_banner', '-nostats', '-i', input, ...(vf ? ['-vf', vf] : ['-vn']), ...(af ? ['-af', af] : ['-an']), '-f', 'null', '-'], { maxBuffer: 1 << 28 }).stderr.toString();
const fails = [], notes = [], f = (x) => x.toFixed(2);

const probe = spawnSync(ffmpeg(), ['-hide_banner', '-i', input]).stderr.toString();
const dur = (() => { const m = probe.match(/Duration: (\d+):(\d+):([\d.]+)/); return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : 0; })();
const vm = probe.match(/Video: .*?, (\d{2,5})x(\d{2,5})[^\n]*?([\d.]+) fps/), hasAudio = /Audio: /.test(probe);
const W = vm ? +vm[1] : 0, H = vm ? +vm[2] : 0, FPS = vm ? +vm[3] : 30;
if (Q) {   // final masters only: the file must match the quality Sir picked
  const want = { good: [1080, 30], high: [1080, 60], epic: [1440, 60] }[Q];
  if (want && Math.min(W, H) < want[0]) fails.push(`FORMAT: ${W}x${H} is below ${Q} (${want[0]}p)`);
  if (want && Math.abs(FPS - want[1]) > 0.5) fails.push(`FORMAT: ${FPS} fps but ${Q} is ${want[1]} fps`);
}
if (!hasAudio) fails.push('SOUND: the video has no audio track — every video needs voice/music/sfx');
else {
  const e = run(null, 'ebur128=peak=true'), sum = e.slice(e.lastIndexOf('Summary:'));
  const I = +((sum.match(/I:\s+(-?[\d.]+) LUFS/) || [])[1] ?? -99), LRA = +((sum.match(/LRA:\s+([\d.]+) LU/) || [])[1] ?? 0), TP = +((sum.match(/Peak:\s+(-?[\d.]+) dBFS/) || [])[1] ?? 0);
  notes.push(`loudness ${I} LUFS · LRA ${LRA} LU · true peak ${TP} dBTP`);
  if (Math.abs(I - LUFS) > 1.5) fails.push(`MIX: integrated loudness ${I} LUFS — target ${LUFS} ±1.5 (raise/lower the master, keep voice on top)`);
  if (TP > -1) fails.push(`MIX: true peak ${TP} dBTP — clipping risk, must be ≤ -1 dBTP (limit the master / lower the loudest hit)`);
  if (LRA > 15) fails.push(`MIX: loudness range ${LRA} LU — too uneven (quiet parts get lost on phones); compress/ride levels`);
  const s = run(null, 'silencedetect=n=-50dB:d=0.4');
  const st = [...s.matchAll(/silence_start: (-?[\d.]+)/g)].map((m) => +m[1]), en = [...s.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  st.forEach((a, i) => { const b = en[i] ?? dur; if (!inHold(a, b)) fails.push(`DEAD AIR: silence ${f(Math.max(0, a))}–${f(b)}s — add room tone/ambience/music (no hole below -50 dB longer than 0.4s)`); });
  const tm = [...spawnSync(ffmpeg(), ['-hide_banner', '-i', input, '-vn', '-f', 'null', '-']).stderr.toString().matchAll(/time=(\d+):(\d+):([\d.]+)/g)].pop();
  const ad = tm ? +tm[1] * 3600 + +tm[2] * 60 + +tm[3] : dur;
  if (Math.abs(ad - dur) > 1.5 / FPS) fails.push(`SYNC: audio is ${f(ad)}s but the video is ${f(dur)}s — A/V drift, re-render with the soundtrack trimmed to the picture`);
  try { execFileSync(ffmpeg(), ['-y', '-loglevel', 'error', '-i', input, '-filter_complex', 'aformat=channel_layouts=mono,showwavespic=s=1800x240:colors=0x4fd1c5,drawgrid=w=1800/' + Math.max(1, Math.round(dur)) + ':h=240:color=white@0.15', '-frames:v', '1', path.join(out, 'wave.png')]); } catch { notes.push('waveform failed'); }
}
const v = run('blackdetect=d=0.1:pix_th=0.08,freezedetect=n=0.003:d=0.5,signalstats,metadata=print:key=lavfi.signalstats.YAVG', null);
for (const m of v.matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)) if (!inHold(+m[1], +m[2])) fails.push(`BLACK: black frames ${f(+m[1])}–${f(+m[2])}s`);
const fs0 = [...v.matchAll(/freeze_start: ([\d.]+)/g)].map((m) => +m[1]), fe = [...v.matchAll(/freeze_end: ([\d.]+)/g)].map((m) => +m[1]);
fs0.forEach((a, i) => { const b = fe[i] ?? dur; if (!inHold(a, b)) fails.push(`FROZEN: picture frozen ${f(a)}–${f(b)}s — something must move every ~1s (camera drift, breathing, particles)`); });
const Y = [...v.matchAll(/YAVG=([\d.]+)/g)].map((m) => +m[1]); let run3 = 0;
Y.forEach((y, i) => { run3 = y > 232 ? run3 + 1 : 0; if (run3 === 3) fails.push(`WHITE-OUT: frames around ${f(i / FPS)}s are near-white for 3+ frames — bloom/flash washing the screen`); });
for (let i = 1; i < Y.length; i++) if (Math.abs(Y[i] - Y[i - 1]) > 90 && Y[i + 1] !== undefined && Math.abs(Y[i + 1] - Y[i - 1]) < 25) fails.push(`POP: one-frame flash at ${f(i / FPS)}s (luma ${Y[i - 1].toFixed(0)}→${Y[i].toFixed(0)}→${Y[i + 1].toFixed(0)}) — a single bad frame`);
let sceneHash; try { sceneHash = opt('--scene', null) ? require('./lib/review_checks').sceneHash(opt('--scene')) : JSON.parse(fs.readFileSync(input + '.scene.json', 'utf8')).sceneHash; } catch {}
const rep = { video: input, sceneHash, duration: +dur.toFixed(2), size: [W, H], fps: FPS, audio: hasAudio, pass: fails.length === 0, fails, notes, wave: path.join(out, 'wave.png') };
fs.writeFileSync(path.join(out, 'av.json'), JSON.stringify(rep, null, 1));
console.log(rep.pass ? `AV PASS · ${notes.join(' · ')} · now LOOK at ${rep.wave} against the shot times` : `AV FAIL (${fails.length}) — fix all, then re-render and run again:\n- ` + fails.slice(0, 60).join('\n- '));
process.exit(rep.pass ? 0 : 1);
