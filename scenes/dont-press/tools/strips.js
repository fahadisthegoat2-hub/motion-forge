// strips.js N → rN/strip_XX.png (8 frames per shot from prev_frames, 12 fps), rN/all_a.png / all_b.png (10 strips each) for looking
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const F = require('../../../scripts/lib/deps').ffmpeg();
const N = process.argv[2], D = require('../direction.js'), out = path.join(__dirname, '../dont-press_qa/r' + N), fr = path.join(__dirname, '../prev_frames');
let t = 0; const rows = [];
D.shots.forEach((s, i) => {
  const n = String(i + 1).padStart(2, '0'), f0 = Math.round(t * 12), f1 = Math.max(f0 + 1, Math.round((t + s.dur) * 12)), step = Math.max(1, (f1 - f0) / 8);
  const list = []; for (let k = 0; k < 8; k++) list.push(Math.min(358, 1 + Math.min(f1 - 1, Math.round(f0 + k * step))));
  const args = ['-y', '-loglevel', 'error']; list.forEach((x) => args.push('-i', path.join(fr, 'f' + String(x).padStart(5, '0') + '.png')));
  args.push('-filter_complex', list.map((_, k) => `[${k}:v]scale=135:240[v${k}]`).join(';') + ';' + list.map((_, k) => `[v${k}]`).join('') + 'hstack=inputs=8', path.join(out, `strip_${n}.png`));
  execFileSync(F, args); rows.push(path.join(out, `strip_${n}.png`)); t += s.dur;
});
for (const [name, a, b] of [['all_a', 0, 10], ['all_b', 10, 20]]) { const args = ['-y', '-loglevel', 'error']; rows.slice(a, b).forEach((r) => args.push('-i', r)); args.push('-filter_complex', rows.slice(a, b).map((_, k) => `[${k}:v]`).join('') + 'vstack=inputs=10', path.join(out, name + '.png')); execFileSync(F, args); }
console.log('strips ok', rows.length);
