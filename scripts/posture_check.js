#!/usr/bin/env node
// Posture audit: plays EVERY library clip and every gesture on a character and measures the back (lean, lower/upper spine, kink, head).
// Bent-on-purpose moves (BENT in the template: crouch, fight, fall…) are skipped. Flags hunched / crooked / leaning-back spines. Run after any change to CLIP_TUNE, POSES, GESTURES or retargeting.
// Usage: node posture_check.js [character=jake] [--all] [--only kneel,carry]   (--all prints every row, not only the flagged ones)
const { launchBrowser, startStaticServer, routeAssets } = require('./lib/deps');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), tpl = fs.readFileSync(path.join(ROOT, 'templates', 'studio_scene.html'), 'utf8');
const who = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'jake', all = process.argv.includes('--all'), only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1].split(',') : null;
const A = 'const CAST = {', B = '/* ============================== END DIRECTION', D = 2.4;
const build = (shots) => tpl.slice(0, tpl.indexOf(A)) + `const CAST = { hero: { character: '${who}' } };\nconst SHOTS = ${JSON.stringify(shots)};\nconst CAPTIONS = [];\nconst TITLES = [];\n` + tpl.slice(tpl.indexOf(B));
const BENT = new RegExp(tpl.match(/const BENT = \/(.+)\/i;/)[1], 'i'), ALIAS = [...tpl.slice(tpl.indexOf('const CLIP_ALIAS')).split('};')[0].matchAll(/([a-z]+): '/g)].map((m) => m[1]);
const GEST = [...new Set([...tpl.slice(tpl.indexOf('const GESTURES')).split('\n};')[0].matchAll(/^  ([a-z]+):\s*\{/gm)].map((m) => m[1]))];
// a hunched or crooked back: chest folded over the hips, upper back bent hard against the lower back, head dropped forward, or the torso thrown back
const LEAN_OK = /sprint|jog|run|sneak|sittingenter|sitdown|driv|shieldbreak/;   // whole body leans with a straight back on purpose (speed, sitting down, a seat, a stagger)
const bad = (p, low, name) => [p.kink > 10 && 'KINK fwd', p.kink < -18 && 'KINK back', !low && !LEAN_OK.test(name) && p.lean > 16 && 'HUNCH', !LEAN_OK.test(name) && p.lean < -10 && 'LEAN back', p.head - p.upper > 16 && 'HEAD drop', p.upper - p.head > 25 && 'HEAD up'].filter(Boolean);
async function run(shots, fn) {
  const file = path.join(ROOT, 'scenes', '_posture.html'); fs.writeFileSync(file, build(shots));
  const browser = await launchBrowser(), page = await browser.newPage(); await routeAssets(page); const server = await startStaticServer();
  page.on('pageerror', (e) => console.error('ERROR', e.message.split('\n')[0]));
  await page.setViewportSize({ width: 90, height: 160 }); await page.goto(server.origin + file + '?fast=1');
  await page.waitForFunction(() => window.__mf && window.__mfReady !== false, null, { timeout: 900000, polling: 1000 });
  await page.evaluate(() => { document.getElementById('mf-panel')?.remove(); window.__mfManual = true; window.__mf.setSize(90, 160); });
  try { return await fn(page); } finally { await browser.close(); server.close(); fs.rmSync(file, { force: true }); }
}
(async () => {
  const clips = await run([{ name: 'x', dur: 1, cast: { hero: { clips: [{ clip: 'idle', start: 0, end: 1 }] } } }], (p) => p.evaluate(() => __mfDebug.clips()));
  const items = [...[...new Set([...clips, ...ALIAS])].filter((c) => !BENT.test(c)).map((c) => ({ kind: 'clip', name: c, cast: { clips: [{ clip: c, start: 0, end: D }] } })),
    ...GEST.map((g) => ({ kind: 'gesture', name: g, cast: { clips: [{ clip: 'idle', start: 0, end: D }], gestures: [{ type: g, start: 0, end: D }] } }))];
  if (only) items.splice(0, items.length, ...items.filter((it) => only.includes(it.name)));
  const shots = items.map((it, i) => ({ name: it.kind + ':' + it.name, dur: D, camera: { move: 'static', target: 'hero', size: 'ws' }, cast: { hero: it.cast } }));
  const rows = await run(shots, async (page) => { const out = [];
    for (let i = 0; i < items.length; i++) { const worst = { flags: [] };
      for (const f of [0.15, 0.3, 0.5, 0.7, 0.9]) { const t = i * D + f * D; await page.evaluate((t) => __mf.render(t), t);
        const p = await page.evaluate(() => __mfDebug.posture('hero')); if (!p) continue; const fl = bad(p, p.low < 0.8, items[i].name);
        if (fl.length > worst.flags.length || !worst.p) Object.assign(worst, { p, flags: fl, f }); }
      out.push({ ...items[i], ...worst }); }
    return out; });
  let n = 0;
  for (const r of rows) { if (r.flags.length) n++; if (r.flags.length || all) console.log(`${r.flags.length ? '✗' : '✓'} ${r.kind.padEnd(7)} ${r.name.padEnd(22)} lean ${r.p?.lean} lower ${r.p?.lower} upper ${r.p?.upper} kink ${r.p?.kink} head ${r.p?.head} low ${r.p?.low} @${r.f}  ${r.flags.join(' ')}`); }
  console.log(n ? `POSTURE FAIL: ${n}/${rows.length} (${who})` : `POSTURE PASS: ${rows.length} clips + gestures (${who})`); process.exit(n ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
