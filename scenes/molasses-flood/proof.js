// proof capture for a review round: node proof.js <video> <roundDir>
// grabs every shot at 20/50/85 %, a contact sheet per shot, 12 fps motion strips around key actions,
// per-shot loudness notes and the caption/VO word table.
const { execSync } = require('child_process'), fs = require('fs'), path = require('path');
const [video, rd] = process.argv.slice(2), RN = +(rd.match(/r(\d+)\/?$/) || [0, 1])[1], J = 0.04 * (RN - 1);;   // each round samples different moments
fs.mkdirSync(rd, { recursive: true });
const D = require('./direction.js'), VO = require('./vo.json');
const sh = (c) => execSync(c, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
const ff = (args) => sh(`ffmpeg -loglevel error -y ${args}`);
let acc = 0; const shots = D.shots.map((s) => { const o = { name: s.name, t0: acc, t1: acc + s.dur }; acc += s.dur; return o; });
shots.forEach((s, i) => {
  const ts = [0.2 + J, 0.5 + J, 0.85 - J].map((k) => (s.t0 + (s.t1 - s.t0) * k).toFixed(3));
  ts.forEach((t, k) => ff(`-ss ${t} -i ${video} -frames:v 1 -q:v 3 ${rd}/s${String(i).padStart(2, '0')}_${s.name}_${'abc'[k]}.jpg`));
  ff(`-ss ${(s.t0 + J * 0.5).toFixed(3)} -t ${(s.t1 - s.t0).toFixed(3)} -i ${video} -vf "fps=12,scale=135:-1,tile=8x3" -frames:v 1 -q:v 4 ${rd}/strip${String(i).padStart(2, '0')}_${s.name}.jpg`);
});
const vol = shots.map((s) => { const o = sh(`ffmpeg -hide_banner -ss ${s.t0} -t ${s.t1 - s.t0} -i ${video} -af volumedetect -f null - 2>&1 || true`);
  return `${s.name} ${s.t0.toFixed(2)}-${s.t1.toFixed(2)}s mean ${(o.match(/mean_volume: (\S+)/) || [])[1]} dB max ${(o.match(/max_volume: (\S+)/) || [])[1]} dB`; });
fs.writeFileSync(`${rd}/audio_notes.txt`, vol.join('\n') + '\n');
const table = shots.map((s) => `${s.name} ${s.t0.toFixed(2)}-${s.t1.toFixed(2)}s: ` + VO.words.filter((w) => w.start >= s.t0 - 0.01 && w.start < s.t1).map((w) => `${w.w}@${w.start.toFixed(2)}`).join(' '));
fs.writeFileSync(`${rd}/vo_table.txt`, `round ${RN} · ${video} · ${fs.statSync(video).size} bytes\n` + table.map((l, i) => l + '  | ' + vol[i]).join('\n') + '\n');
ff(`-i ${video} -filter_complex "showwavespic=s=1600x300:split_channels=1" -frames:v 1 ${rd}/wave_full.png`);
ff(`-i ${video} -lavfi showspectrumpic=s=1200x400 ${rd}/spectrum.png`);
fs.writeFileSync(`${rd}/stats.txt`, sh(`ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,sample_rate,duration -of compact ${video}`) + sh(`ffmpeg -hide_banner -i ${video} -af ebur128=peak=true -f null - 2>&1 | tail -14 || true`));
console.log('proof ->', rd, fs.readdirSync(rd).length, 'files');
