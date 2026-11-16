// snaps caption word onsets to real speech onsets: a word after a comma/period starts where the audio resumes (silencedetect on vo.wav)
const fs = require('fs'), { spawnSync } = require('child_process');
const v = JSON.parse(fs.readFileSync('vo.json', 'utf8'));
const log = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', 'vo.wav', '-af', 'silencedetect=n=-38dB:d=0.08', '-f', 'null', '-']).stderr.toString();
const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]), starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
let n = 0;
for (let i = 1; i < v.words.length; i++) {
  const p = v.words[i - 1]; if (!/[,.?!]$/.test(p.w)) continue;
  const e = ends.find((x) => x > p.end - 0.35 && x < p.end + 0.45); if (e == null || Math.abs(e - v.words[i].start) < 0.02) continue;
  const s = starts.filter((x) => x < e).pop(); if (s != null && s > p.start) p.end = +s.toFixed(3);
  v.words[i].start = +e.toFixed(3); n++;
}
fs.writeFileSync('vo.json', JSON.stringify(v, null, 1)); console.log('snapped', n, 'onsets');
