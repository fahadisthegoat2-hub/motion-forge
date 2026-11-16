// Builds this round's proof files from the current preview render: per-shot frames (20/50/85%), face/hand crops sheets,
// 12 fps motion strips around key actions, per-second retention strip, audio solo stats per shot, caption/word timing table.
// usage: node proof.js <round> [prev.mp4]
const fs = require('fs'), path = require('path'), { execFileSync, spawnSync } = require('child_process');
const FF = require('/home/user/motion-forge/scripts/lib/deps').ffmpeg() || 'ffmpeg';
const N = process.argv[2], vid = process.argv[3] || path.join(__dirname, '../prev.mp4');
const D = require('../direction.js'), dir = path.join(__dirname, '../okene_qa/r' + N); fs.mkdirSync(dir, { recursive: true });
const ff = (a) => execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', ...a]);
let acc = 0; const shots = D.shots.map((s, i) => { const r = { i, name: s.name, start: acc, dur: s.dur }; acc += s.dur; return r; });
// 1 · per-shot frames at 20/50/85% → sheet
const tmp = fs.mkdtempSync('/tmp/claude-0/pf-');
shots.forEach((s) => [0.2, 0.5, 0.85].forEach((f, k) => ff(['-ss', (s.start + s.dur * f).toFixed(3), '-i', vid, '-frames:v', '1', path.join(tmp, `s${String(s.i).padStart(2, '0')}_${k}.png`)])));
ff(['-pattern_type', 'glob', '-i', path.join(tmp, 's*_1.png'), '-vf', 'scale=216:-1,tile=10x2', '-frames:v', '1', path.join(dir, 'shots_mid.jpg')]);
ff(['-pattern_type', 'glob', '-i', path.join(tmp, 's*_*.png'), '-vf', 'scale=144:-1,tile=15x4', '-frames:v', '1', path.join(dir, 'shots_3pt.jpg')]);
// 2 · center crops (faces / hands live in the middle band) of every mid frame
ff(['-pattern_type', 'glob', '-i', path.join(tmp, 's*_1.png'), '-vf', 'crop=iw*0.6:ih*0.35:iw*0.2:ih*0.2,scale=240:-1,tile=10x2', '-frames:v', '1', path.join(dir, 'faces_band.jpg')]);
ff(['-pattern_type', 'glob', '-i', path.join(tmp, 's*_2.png'), '-vf', 'crop=iw*0.7:ih*0.35:iw*0.15:ih*0.4,scale=240:-1,tile=10x2', '-frames:v', '1', path.join(dir, 'hands_band.jpg')]);
// 3 · 12 fps strips around key actions
const KEY = { payoff: [0, 1.2], grab: [0, 1.2], flip: [0, 1.0], sink: [0, 1.2], upside: [0, 1.0], air: [0, 1.2], light: [0, 1.0], question: [0, 1.2] };
for (const [n, [a, b]] of Object.entries(KEY)) { const s = shots.find((x) => x.name === n); if (!s) continue;
  ff(['-ss', (s.start + a).toFixed(3), '-t', (b - a).toFixed(3), '-i', vid, '-vf', 'fps=12,scale=135:-1,tile=12x1', '-frames:v', '1', path.join(dir, `strip_${n}.jpg`)]); }
// 4 · one frame per second (retention audit)
ff(['-i', vid, '-vf', 'fps=1,scale=108:-1,tile=11x3', '-frames:v', '1', path.join(dir, 'per_second.jpg')]);
// 5 · audio: per-shot loudness + waveform
const lines = ['shot,start,dur,mean_db,peak_db'];
for (const s of shots) { const r = spawnSync(FF, ['-hide_banner', '-ss', s.start.toFixed(3), '-t', s.dur.toFixed(3), '-i', vid, '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  lines.push([s.name, s.start.toFixed(2), s.dur.toFixed(2), (r.match(/mean_volume: ([-\d.]+)/) || [])[1], (r.match(/max_volume: ([-\d.]+)/) || [])[1]].join(',')); }
fs.writeFileSync(path.join(dir, 'audio_per_shot.csv'), lines.join('\n') + '\n# ' + new Date().toISOString() + '\n');
ff(['-i', vid, '-filter_complex', 'showwavespic=s=1600x200:split_channels=1', '-frames:v', '1', path.join(dir, 'wave_r.png')]);
ff(['-i', vid, '-lavfi', 'showspectrumpic=s=1200x300:legend=0', '-frames:v', '1', path.join(dir, 'spectrum.png')]);
// 6 · caption/word table
const W = require('../vo.json').words; fs.writeFileSync(path.join(dir, 'words.csv'), 'word,start,end,shot\n' + W.map((w) => [w.w, w.start, w.end, (shots.findLast((s) => s.start <= w.start) || {}).name].join(',')).join('\n') + '\n# ' + new Date().toISOString() + '\n');
fs.rmSync(tmp, { recursive: true, force: true });
console.log(JSON.stringify(shots.map((s) => [s.i, s.name, +s.start.toFixed(2), +s.dur.toFixed(2)])));
