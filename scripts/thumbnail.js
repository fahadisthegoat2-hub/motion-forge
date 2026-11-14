#!/usr/bin/env node
// Renders the scene's THUMBS (DIRECTION block) as YouTube thumbnails (1280×720) or vertical covers (--cover → 1080×1920).
// Usage: node thumbnail.js scene.html outDir [--fast] [--only N] [--cover]
//   Drafts: --fast → thumb_N.jpg for every variant + preview.jpg (all variants at phone size, to judge readability).
//   Final:  --only N (no --fast) → the single winner at full quality. Show the user ONLY that one.
const { launchBrowser, ffmpeg, startStaticServer, routeAssets } = require('./lib/deps');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2), flag = (n) => args.includes(n), opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const [input, outDir = 'thumbs'] = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] || '').match(/^--(only)$/));
if (!input) { console.error('usage: thumbnail.js scene.html outDir [--fast] [--only N] [--cover]'); process.exit(1); }
const [W, H] = flag('--cover') ? [1080, 1920] : [1280, 720];
(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await launchBrowser(), page = await browser.newPage();
  page.on('pageerror', (e) => console.error('page error:', e.message));
  await routeAssets(page); const server = await startStaticServer();
  await page.setViewportSize({ width: W, height: H });
  await page.goto(server.origin + path.resolve(input) + (flag('--fast') ? '?fast=1' : ''));
  await page.waitForFunction(() => window.__mf && window.__mfReady !== false, null, { timeout: 900000, polling: 1000 });
  const n = await page.evaluate(([w, h]) => { document.getElementById('mf-panel')?.remove(); window.__mfManual = true; window.__mf.setSize(w, h); return window.__mf.thumbs().length; }, [W, H]);
  if (!n) { console.error('No THUMBS in the scene. Add: const THUMBS = [{ shot, t, text, hi, accent, face, camera, arrow, circle }];'); process.exit(1); }
  const list = opt('--only') ? [+opt('--only')] : [...Array(n).keys()], out = [];
  for (const i of list) {
    await page.evaluate((i) => window.__mf.thumb(window.__mf.thumbs()[i]), i);
    const f = path.join(outDir, `thumb_${i}.png`); await page.locator('canvas').first().screenshot({ path: f }); out.push(f);
  }
  await browser.close(); server.close();
  for (const f of out) { execFileSync(ffmpeg(), ['-y', '-loglevel', 'error', '-i', f, '-q:v', '2', f.replace('.png', '.jpg')]); fs.rmSync(f); }
  if (out.length > 1) {   // what a viewer sees in the feed: every variant at phone size
    const jpgs = out.map((f) => f.replace('.png', '.jpg')), inputs = jpgs.flatMap((f) => ['-i', f]);
    const sw = flag('--cover') ? 120 : 196, filt = jpgs.map((_, i) => `[${i}]scale=${sw}:-1[s${i}]`).join(';') + ';' + jpgs.map((_, i) => `[s${i}]`).join('') + `hstack=${jpgs.length}`;
    execFileSync(ffmpeg(), ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', filt, path.join(outDir, 'preview.jpg')]);
  }
  console.log(out.map((f) => f.replace('.png', '.jpg')).join('\n') + (out.length > 1 ? '\n' + path.join(outDir, 'preview.jpg') : ''));
})().catch((e) => { console.error(e); process.exit(1); });
