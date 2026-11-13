#!/usr/bin/env node
// Study a reference VIDEO (no Python): cuts & pacing, motion energy, audio hits, per-shot palette, keyframe contact sheet.
// Usage: node analyze_video.js ref.mp4 [--out dir]
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs'), path = require('path');
const { ffmpeg } = require('./lib/deps');

const args = process.argv.slice(2), input = args.find((a) => !a.startsWith('--'));
if (!input) { console.error('usage: analyze_video.js ref.mp4 [--out dir]'); process.exit(1); }
if (!fs.existsSync(input)) { console.error('file not found: ' + input); process.exit(1); }
const oi = args.indexOf('--out'), out = oi >= 0 ? args[oi + 1] : input.replace(/\.[^.]+$/, '') + '_study';
fs.mkdirSync(out, { recursive: true });
const FF = ffmpeg();
const run = (a) => spawnSync(FF, a, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }).stderr || '';

// 1) basics
const info = run(['-hide_banner', '-i', input]);
const dm = info.match(/Duration: (\d+):(\d+):([\d.]+)/), duration = dm ? +dm[1] * 3600 + +dm[2] * 60 + +dm[3] : 0;
const vm = info.match(/Video:.*?(\d{2,5})x(\d{2,5})/), fpsm = info.match(/([\d.]+) fps/);
const width = vm ? +vm[1] : 0, height = vm ? +vm[2] : 0, fps = fpsm ? +fpsm[1] : 0, hasAudio = /Audio:/.test(info);

// 2) cuts (scene change detection)
const cutLog = run(['-hide_banner', '-i', input, '-vf', "select='gt(scene,0.3)',showinfo", '-an', '-f', 'null', '-']);
const cuts = [...cutLog.matchAll(/pts_time:([\d.]+)/g)].map((m) => +m[1]).filter((t, i, a) => t > 0.2 && (i === 0 || t - a[i - 1] > 0.2));
const bounds = [0, ...cuts, duration], shots = bounds.slice(0, -1).map((s, i) => ({ start: +s.toFixed(2), end: +bounds[i + 1].toFixed(2), len: +(bounds[i + 1] - s).toFixed(2) }));
const lens = shots.map((s) => s.len), asl = lens.reduce((a, b) => a + b, 0) / Math.max(1, lens.length);

// 3) motion energy (frame difference, 4 samples/s)
const motLog = run(['-hide_banner', '-i', input, '-vf', 'fps=4,scale=160:-2,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG', '-an', '-f', 'null', '-']);
const mot = [...motLog.matchAll(/pts_time:([\d.]+)[\s\S]*?YAVG=([\d.]+)/g)].map((m) => [+m[1], +m[2]]);
const perSec = []; mot.forEach(([t, v]) => { const k = Math.floor(t); perSec[k] = Math.max(perSec[k] || 0, v); });
const motionCurve = Array.from(perSec, (v) => +(v || 0).toFixed(1));
shots.forEach((s) => { const vals = mot.filter(([t]) => t >= s.start && t < s.end).map(([, v]) => v); s.motion = +(vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length)).toFixed(1); });

// 4) audio hits (RMS peaks) → beat / impact timing
let audioPeaks = [], bpm = null;
if (hasAudio) {
  const aLog = run(['-hide_banner', '-i', input, '-vn', '-af', 'aresample=8000,asetnsamples=n=400:p=0,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level', '-f', 'null', '-']);
  const rms = [...aLog.matchAll(/pts_time:([\d.]+)[\s\S]*?RMS_level=(-?[\d.]+|-inf)/g)].map((m) => [+m[1], m[2] === '-inf' ? -90 : +m[2]]);
  if (rms.length > 4) {
    const mean = rms.reduce((a, [, v]) => a + v, 0) / rms.length, sd = Math.sqrt(rms.reduce((a, [, v]) => a + (v - mean) ** 2, 0) / rms.length);
    for (let i = 1; i < rms.length - 1; i++) { const [t, v] = rms[i]; if (v > mean + sd * 0.9 && v >= rms[i - 1][1] && v >= rms[i + 1][1] && (!audioPeaks.length || t - audioPeaks.at(-1) > 0.18)) audioPeaks.push(+t.toFixed(2)); }
    const iv = audioPeaks.slice(1).map((t, i) => t - audioPeaks[i]).filter((x) => x > 0.25 && x < 1.5).sort((a, b) => a - b);
    if (iv.length > 3) bpm = Math.round(60 / iv[Math.floor(iv.length / 2)]);
  }
}

// 5) keyframes per shot + contact sheet
shots.forEach((s, i) => { s.frame = path.join(out, `shot_${String(i + 1).padStart(2, '0')}.jpg`);
  run(['-hide_banner', '-y', '-ss', String((s.start + s.end) / 2), '-i', input, '-frames:v', '1', '-vf', 'scale=320:-2', s.frame]); });
const cols = Math.min(6, shots.length), rows = Math.ceil(shots.length / cols), sheet = path.join(out, 'contact_sheet.jpg');
if (shots.length) run(['-hide_banner', '-y', '-start_number', '1', '-i', path.join(out, 'shot_%02d.jpg'), '-vf', `scale=240:-2,tile=${cols}x${rows}:padding=4:color=black`, '-frames:v', '1', sheet]);

// 6) palette per keyframe (reuses the image analyzer)
let palettes = [];
try {
  const r = execFileSync(process.execPath, [path.join(__dirname, 'analyze_reference.js'), ...shots.map((s) => s.frame).filter((f) => fs.existsSync(f)), '--colors', '5'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
  palettes = JSON.parse(r);
  palettes.forEach((p, i) => { shots[i].palette = p.palette.slice(0, 4).map((c) => c.hex); shots[i].key = p.values.key; shots[i].temp = p.temperature; });
} catch {}

const study = {
  file: input, duration: +duration.toFixed(2), resolution: `${width}x${height}`, aspect: width && height ? (width / height).toFixed(3) : null, fps,
  shots: shots.length, averageShotLength: +asl.toFixed(2), cutsPerMinute: duration ? +(cuts.length / duration * 60).toFixed(1) : 0,
  shortestShot: lens.length ? Math.min(...lens) : 0, longestShot: lens.length ? Math.max(...lens) : 0,
  hookCutsFirst3s: cuts.filter((t) => t < 3).length, motionCurve, audioPeaks, estimatedBPM: bpm, shotList: shots, contactSheet: sheet,
};
fs.writeFileSync(path.join(out, 'study.json'), JSON.stringify(study, null, 2));
console.log(JSON.stringify({ ...study, shotList: study.shotList.map((s) => ({ start: s.start, len: s.len, motion: s.motion, key: s.key, palette: s.palette })) }, null, 1));
console.error(`\nstudy → ${path.join(out, 'study.json')}  ·  contact sheet → ${sheet}`);
