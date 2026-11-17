#!/usr/bin/env node
// SMP Shorts pipeline.
//  PLAN:   smp.js <video | CapCut project> [--len 45] [--srt subs.srt]            → out/edit.json + out/sheets/*.png (look at them)
//  FINISH: smp.js <video> --script script.json --lore lore.json --project "<CapCut name>" [--title HOOK] [--voice am_michael]
//          → lore check → voiceover (Kokoro, Voice Studio engine) → fit edit to the voice → motion graphics FIRST → sound mix
//          → edit LAST (short.mp4) → CapCut project → device-render artifact (out/artifact)
// common: [--out dir] [--layout blur|crop] [--accent #hex] [--no-capcut] [--fast]
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const { arg, flag, log } = require('./lib/util');
const { analyze, buildGraphics } = require('./highlights'), { renderGraphics } = require('./mograph'), { renderShort } = require('./render');
const { scan } = require('./scan'), { buildMix } = require('./mix'), { pack } = require('./pack'), { check } = require('./lore_check');
const cc = require('./capcut');

function fitEdit(edit, target) { // stretch/trim the clips so the edit ends ~1 s after the voice
  const src = edit.info.duration, body = edit.segments.filter((s) => s.role !== 'hook');
  for (let pass = 0; pass < 40; pass++) {
    const total = edit.segments.reduce((a, s) => a + s.out - s.in, 0), delta = target - total;
    if (Math.abs(delta) < 0.05) break;
    const step = delta / body.length;
    body.sort((a, b) => a.in - b.in).forEach((s, i) => {
      const prev = body[i - 1], next = body[i + 1];
      if (step > 0) { s.out = Math.min(src, next ? next.in - 0.1 : src, s.out + step * 0.6); s.in = Math.max(0, prev ? prev.out + 0.1 : 0, s.in - step * 0.4); }
      else { const room = Math.max(0, s.peak - 1.2 - s.in); s.in += Math.min(room, -step * 0.7); s.out = Math.max(s.peak + 1, s.out + step * 0.3); }
    });
    if (step > 0 && edit.segments.reduce((a, s) => a + s.out - s.in, 0) <= total + 0.01) break; // source exhausted
  }
  edit.segments.forEach((s) => { s.in = +s.in.toFixed(3); s.out = +s.out.toFixed(3); });
}
function voiceGraphics(edit, vo, script) {
  const g = edit.graphics;
  // karaoke captions, one graphic per 3-word group
  for (let i = 0; i < vo.words.length; i += 3) {
    const grp = vo.words.slice(i, i + 3), at = grp[0].start, end = Math.min(edit.duration, (vo.words[i + 3]?.start ?? grp[grp.length - 1].end + 0.3));
    g.push({ type: 'words', words: grp, at, dur: +(end - at).toFixed(3) });
  }
  // per-line designed graphics from the script (nametag / lore / stamp / counter / pop / marker / chapter / glitch)
  (script.lines || []).forEach((l, i) => {
    const ln = vo.lines[i]; if (!ln) return;
    for (const x of l.gfx || []) g.push({ dur: x.type === 'stamp' ? 1.4 : 2.4, ...x, at: +Math.max(2.3, ln.start + (x.offset || 0)).toFixed(3) }); // never under the hook title
    if (['shout', 'dramatic', 'angry'].includes(l.tone)) g.push({ type: 'flash', at: ln.start, dur: 0.4 });
  });
  g.sort((a, b) => a.at - b.at);
}
function voice(dir, scriptFile, v) {
  const env = { ...process.env }; if (fs.existsSync('/root/.ccr/ca-bundle.crt')) Object.assign(env, { NODE_USE_ENV_PROXY: '1', NODE_EXTRA_CA_CERTS: '/root/.ccr/ca-bundle.crt' });
  const r = spawnSync(process.execPath, [path.join(__dirname, 'voice.mjs'), dir, scriptFile, ...(v ? ['--voice', v] : [])], { env, encoding: 'utf8', maxBuffer: 1e8 });
  if (r.status !== 0) throw new Error('voiceover failed: ' + (r.stderr || '').slice(-600));
  return JSON.parse(fs.readFileSync(path.join(dir, 'vo.json'), 'utf8'));
}

(async () => {
  let input = process.argv[2];
  if (!input) { console.error('usage: smp.js <video | CapCut project> [--script s.json --lore l.json --project NAME]'); process.exit(1); }
  if (!fs.existsSync(input)) {
    const root = cc.draftsRoot(), p = cc.findProject(root, input), s = p && cc.sources(path.join(root, p));
    if (!s?.clips?.length) throw new Error(s?.note || `"${input}" is not a file or a readable CapCut project`);
    input = s.clips.sort((a, b) => b.duration - a.duration)[0].path; log(`using clip from CapCut project "${p}": ${input}`);
  }
  const name = arg('project', path.parse(input).name + ' SMP'), out = path.resolve(arg('out', path.join(path.dirname(path.resolve(input)), name.replace(/[\\/:*?"<>|]/g, '_'))));
  fs.mkdirSync(out, { recursive: true });
  const layout = arg('layout', 'blur'), scriptFile = arg('script');
  let edit = fs.existsSync(path.join(out, 'edit.json')) && scriptFile ? JSON.parse(fs.readFileSync(path.join(out, 'edit.json'), 'utf8'))
    : await analyze(input, { len: arg('len'), srt: arg('srt'), title: arg('title'), accent: arg('accent') });
  if (!scriptFile) { // PLAN
    fs.writeFileSync(path.join(out, 'edit.json'), JSON.stringify(edit, null, 2));
    const sheets = await scan(edit, path.join(out, 'sheets'));
    console.log(JSON.stringify({ step: 'plan', out, edit: path.join(out, 'edit.json'), sheets, segments: edit.segments.map((s, i) => ({ i, role: s.role, in: s.in, out: s.out, at: s.at })) }, null, 1));
    return;
  }
  const script = JSON.parse(fs.readFileSync(scriptFile, 'utf8'));
  if (!flag('no-lore')) {
    const lf = arg('lore'); if (!lf) throw new Error('--lore lore.json is required (real researched Unstable SMP lore)');
    const errs = check(script, JSON.parse(fs.readFileSync(lf, 'utf8'))); if (errs.length) throw new Error('LORE FAIL\n' + errs.join('\n'));
    log('lore check passed');
  }
  const vo = voice(path.join(out, 'voice'), scriptFile, arg('voice')); log(`voiceover ${vo.duration}s (${vo.voice})`);
  fitEdit(edit, Math.min(59, Math.max(8, vo.duration + 1.0)));
  const title = arg('title') || script.title || edit.graphics.find((g) => g.type === 'hook')?.text;
  Object.assign(edit, buildGraphics(edit.segments, [], title, true), { accent: arg('accent', edit.accent), vo: path.join(out, 'voice', 'vo.wav'), quality: arg('quality') });
  edit.graphics = edit.graphics.filter((g) => g.type !== 'pop' || !(script.lines || []).some((l) => (l.gfx || []).length)); // designed graphics replace generic pops
  voiceGraphics(edit, vo, script);
  await renderGraphics(edit, path.join(out, 'graphics'));                      // 1) motion graphics first
  edit.mix = await buildMix(edit, out, edit.vo);                               // 2) sound
  fs.writeFileSync(path.join(out, 'edit.json'), JSON.stringify(edit, null, 2));
  const mp4 = await renderShort(edit, path.join(out, 'short.mp4'), layout, flag('fast')); // 3) edit last
  const res = { step: 'finish', short: mp4, duration: edit.duration, graphics: edit.graphics.length };
  if (!flag('no-capcut')) res.capcut = cc.writeProject(edit, name, { overwrite: flag('overwrite'), layout });
  res.artifact = await pack(edit, path.join(out, 'artifact'), title, layout);
  console.log(JSON.stringify(res, null, 1));
})().catch((e) => { console.error(e.message); process.exit(1); });
