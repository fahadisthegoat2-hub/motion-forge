#!/usr/bin/env node
// Cuts the edit LAST: keeps the chosen segments, makes it 9:16, overlays the pre-rendered graphics, masters audio → short.mp4
// usage: render.js edit.json [--out short.mp4] [--layout blur|crop] [--fast]
const fs = require('fs'), path = require('path');
const { run, arg, flag, log } = require('./lib/util');

async function renderShort(edit, out, layout = 'blur', fast = false) {
  const segs = edit.segments, f = [], W = 1080, H = 1920;
  const args = ['-y', '-hide_banner', '-loglevel', 'error', '-i', edit.source];
  segs.forEach((s, i) => {
    const z = s.zoom || (s.role === 'hook' ? 1.15 : 1);
    const v = `[0:v]trim=${s.in}:${s.out},setpts=PTS-STARTPTS,fps=30`;
    if (layout === 'crop') f.push(`${v},scale=-2:${Math.round(H * z)},crop=${W}:${H},setsar=1[v${i}]`);
    else f.push(`${v},split[a${i}][b${i}];[a${i}]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},boxblur=24:2,eq=brightness=-0.12[bg${i}];` +
      `[b${i}]scale=${Math.round(W * 1.0 * z * 1.25)}:-2,crop='min(iw,${W})':ih[fg${i}];[bg${i}][fg${i}]overlay=(W-w)/2:(H-h)/2,setsar=1[v${i}]`);
    f.push(edit.info.hasAudio ? `[0:a]atrim=${s.in}:${s.out},asetpts=PTS-STARTPTS[a_${i}]` : `anullsrc=r=48000:cl=stereo,atrim=0:${(s.out - s.in).toFixed(3)}[a_${i}]`);
  });
  f.push(`${segs.map((_, i) => `[v${i}][a_${i}]`).join('')}concat=n=${segs.length}:v=1:a=1[cv][ca]`);
  let last = 'cv';
  edit.graphics.filter((g) => g.file && fs.existsSync(g.file)).forEach((g, k) => {
    args.push('-i', g.file); const idx = k + 1;
    f.push(`[${idx}:v]setpts=PTS-STARTPTS+${g.at}/TB[g${k}]`, `[${last}][g${k}]overlay=0:0:eof_action=pass:enable='between(t,${g.at},${(g.at + g.dur).toFixed(3)})'[o${k}]`);
    last = `o${k}`;
  });
  f.push(`[ca]loudnorm=I=-14:TP=-1.0:LRA=9,aresample=48000[aout]`);
  args.push('-filter_complex', f.join(';'), '-map', `[${last}]`, '-map', '[aout]',
    '-c:v', 'libx264', '-preset', fast ? 'ultrafast' : 'slow', '-crf', fast ? '28' : '17', '-pix_fmt', 'yuv420p', '-r', '30',
    '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out);
  log(`rendering ${path.basename(out)} (${edit.duration.toFixed(1)} s, ${segs.length} cuts, ${edit.graphics.length} graphics)…`);
  await run(args);
  return out;
}
if (require.main === module) {
  const f = process.argv[2]; if (!f) { console.error('usage: render.js edit.json [--out short.mp4] [--layout blur|crop]'); process.exit(1); }
  const edit = JSON.parse(fs.readFileSync(f, 'utf8'));
  renderShort(edit, arg('out', path.join(path.dirname(f), 'short.mp4')), arg('layout', 'blur'), flag('fast'))
    .then((o) => console.log(JSON.stringify({ out: path.resolve(o) }))).catch((e) => { console.error(e.message); process.exit(1); });
}
module.exports = { renderShort };
