#!/usr/bin/env node
// Pose lab: every clip and every posed gesture on a character, measured for deformed anatomy (crooked spine, hyper-extended elbows/knees,
// folded/twisted wrists, hands inside the body, sunk/floating feet) + contact sheets to look at. Run after any change to poses, clips, IK or retargeting.
// Usage: node pose_lab.js [character=jake] [--out dir] [--only clips|gestures] [--sheet]   → prints POSE LAB PASS / FAIL
const { launchBrowser, ffmpeg, startStaticServer, routeAssets } = require('./lib/deps');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2), opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const who = args.find((a, i) => !a.startsWith('--') && !/^--(out|only)$/.test(args[i - 1] || '')) || 'jake', only = opt('--only');
const ROOT = path.join(__dirname, '..'), tplSrc = fs.readFileSync(path.join(ROOT, 'templates', 'studio_scene.html'), 'utf8');
const out = opt('--out') || path.join(ROOT, 'scenes', '_poselab_' + who); fs.mkdirSync(out, { recursive: true });
const grab = (name) => { const s = tplSrc.slice(tplSrc.indexOf(`const ${name} = {`)); return [...s.slice(0, s.indexOf('\n};') < 0 ? 4000 : s.indexOf('};')).matchAll(/(?:^|[ ,{])([a-z0-9]+):\s*['{\[]/gm)].map((m) => m[1]); };
const clips = [...new Set(['idle', 'walk', 'run', ...grab('CLIP_ALIAS')])];
const poses = [...new Set([...tplSrc.slice(tplSrc.indexOf('const POSES = {')).split('\n};')[0].matchAll(/^  ([a-z0-9]+):\s*\{ arm/gm)].map((m) => m[1]))].filter((p) => p !== 'kneelrest');
const D = 2, shots = [];
const cam = (az) => ({ move: 'static', target: 'hero', size: 2.6, az, eye: 1.5 });
if (only !== 'gestures') for (const c of clips) for (const az of [25, 90]) shots.push({ name: 'clip:' + c, dur: D, camera: cam(az), cast: { hero: { acting: 'none', clips: [{ clip: c, start: 0, end: D }] } } });
if (only !== 'clips') for (const base of ['idle', 'sit', 'walk', 'kneel']) for (const g of poses) for (const side of ['right', 'left']) shots.push({ name: `pose:${g}/${base}/${side}`, dur: D, camera: cam(side === 'right' ? 25 : -25),
  cast: { hero: { acting: 'none', clips: [{ clip: base, start: 0, end: D }], gestures: [{ type: g, start: 0.1, end: D, side }] } } });
const A = 'const CAST = {', B = '/* ============================== END DIRECTION';
const scene = tplSrc.slice(0, tplSrc.indexOf(A)) + `const CAST = { hero: { character: '${who}' } };\nconst SHOTS = ${JSON.stringify(shots)};\nconst CAPTIONS = [];\nconst TITLES = [];\n` + tplSrc.slice(tplSrc.indexOf(B));
const file = path.join(ROOT, 'scenes', `_poselab_${who}.html`); fs.writeFileSync(file, scene);
(async () => {
  const browser = await launchBrowser(), page = await browser.newPage(), errs = [];
  page.on('pageerror', (e) => errs.push(e.message.split('\n')[0]));
  await routeAssets(page); const server = await startStaticServer();
  await page.setViewportSize({ width: 240, height: 320 });
  await page.goto(server.origin + file + '?fast=1');
  await page.waitForFunction(() => window.__mf && window.__mfReady !== false, null, { timeout: 900000, polling: 1000 });
  await page.evaluate(() => { document.getElementById('mf-panel')?.remove(); window.__mfManual = true; window.__mf.setSize(240, 320); });
  const fails = [], rows = [], frames = [];
  for (const [i, sh] of shots.entries()) {
    const worst = {};
    for (const f of [0.3, 0.55, 0.8, 0.95]) {
      const a = await page.evaluate((t) => __mfDebug.anatomy(t), i * D + D * f);
      for (const c of a) for (const [k, v] of Object.entries(c.m)) if (typeof v === 'number') worst[k] = Math.max(worst[k] ?? -1e9, v);
      for (const c of a) for (const p of c.problems) if (!rows.some((r) => r === sh.name + ' ' + p.replace(/[\d.]+°.*/, ''))) { rows.push(sh.name + ' ' + p.replace(/[\d.]+°.*/, '')); fails.push(`${sh.name}: ${p}`); }
    }
    if (args.includes('--sheet') || fails.some((x) => x.startsWith(sh.name + ':'))) { await page.evaluate((t) => __mf.render(t), i * D + D * 0.6); const p = path.join(out, `f${String(i).padStart(3, '0')}.png`); await page.locator('canvas').first().screenshot({ path: p }); frames.push([p, sh.name]); }
  }
  await browser.close(); server.close(); fs.rmSync(file, { force: true });
  for (let s = 0; s * 24 < frames.length; s++) { const part = frames.slice(s * 24, s * 24 + 24), cols = Math.min(8, part.length), W = 240, H = 320;
    const esc = (t) => t.replace(/[:\\']/g, (m) => '\\' + m), fil = part.map(([, n], i) => `[${i}]scale=${W}:${H},drawtext=text='${esc(n)}':x=4:y=4:fontsize=13:fontcolor=white:box=1:boxcolor=black@0.6[s${i}]`).join(';') + ';' + part.map((_, i) => `[s${i}]`).join('') + (part.length > 1 ? `xstack=inputs=${part.length}:layout=` + part.map((_, i) => `${(i % cols) * W}_${Math.floor(i / cols) * H}`).join('|') + ':fill=black' : 'copy');
    try { execFileSync(ffmpeg(), ['-y', '-loglevel', 'error', ...part.flatMap(([f]) => ['-i', f]), '-filter_complex', fil, path.join(out, `sheet${s}.jpg`)]); } catch (e) { console.error('sheet failed', String(e.message).slice(0, 200)); } }
  for (const [f] of frames) fs.rmSync(f, { force: true });
  for (const e of [...new Set(errs)]) fails.push('ERROR ' + e);
  fs.writeFileSync(path.join(out, 'lab.json'), JSON.stringify({ who, shots: shots.length, fails }, null, 1));
  console.log(fails.length ? `POSE LAB FAIL (${fails.length}) · ${who} · sheets in ${out}\n- ` + fails.join('\n- ') : `POSE LAB PASS · ${who} · ${shots.length} poses`);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
