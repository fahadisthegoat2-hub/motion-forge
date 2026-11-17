#!/usr/bin/env node
// One command: footage → highlights → motion graphics (first) → edit (last) → short.mp4 + CapCut project.
// usage: smp.js <video | CapCut project name> --project "<CapCut name>" [--title "HOOK"] [--len 45] [--srt subs.srt] [--layout blur|crop] [--out dir] [--no-capcut] [--fast]
const fs = require('fs'), path = require('path');
const { arg, flag, log } = require('./lib/util');
const { analyze } = require('./highlights'), { renderGraphics } = require('./mograph'), { renderShort } = require('./render');
const cc = require('./capcut');

(async () => {
  let input = process.argv[2];
  if (!input) { console.error('usage: smp.js <video | CapCut project name> --project "<name>" [--title TEXT] [--len 45] [--srt file]'); process.exit(1); }
  if (!fs.existsSync(input)) { // a CapCut project name: pull its longest clip
    const root = cc.draftsRoot(), p = cc.findProject(root, input), s = p && cc.sources(path.join(root, p));
    if (!s?.clips?.length) throw new Error(s?.note || `"${input}" is not a file or a readable CapCut project`);
    input = s.clips.sort((a, b) => b.duration - a.duration)[0].path; log(`using clip from CapCut project "${p}": ${input}`);
  }
  const name = arg('project', path.parse(input).name + ' SMP'), out = arg('out', path.join(path.dirname(path.resolve(input)), name.replace(/[\\/:*?"<>|]/g, '_')));
  fs.mkdirSync(out, { recursive: true });
  const edit = await analyze(input, { len: arg('len'), srt: arg('srt'), title: arg('title'), accent: arg('accent') });
  await renderGraphics(edit, path.join(out, 'graphics'));             // 1) motion graphics first
  fs.writeFileSync(path.join(out, 'edit.json'), JSON.stringify(edit, null, 2));
  const mp4 = await renderShort(edit, path.join(out, 'short.mp4'), arg('layout', 'blur'), flag('fast')); // 2) edit last
  const res = { short: path.resolve(mp4), edit: path.join(out, 'edit.json'), graphics: path.join(out, 'graphics'), duration: edit.duration };
  if (!flag('no-capcut')) res.capcut = cc.writeProject(edit, name, { overwrite: flag('overwrite'), layout: arg('layout', 'blur') });
  console.log(JSON.stringify(res, null, 1));
})().catch((e) => { console.error(e.message); process.exit(1); });
