#!/usr/bin/env node
// Engine self-test: builds a throw-away scene that uses EVERY title style, caption style, camera move, cut, look, set and effect, renders
// frames across it and reports any page error / missing thing. Run after any change to templates/studio_scene.html.
// Usage: node selftest.js [--keep]
const { launchBrowser, startStaticServer, routeAssets } = require('./lib/deps');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), tplSrc = fs.readFileSync(path.join(ROOT, 'templates', 'studio_scene.html'), 'utf8');
const body = tplSrc.slice(tplSrc.indexOf('function drawTitles'));
const styles = [...new Set([...body.slice(0, body.indexOf('\n}\n')).matchAll(/^      case '([a-z0-9-]+)': \{/gm)].map((m) => m[1]))];
const looks = [...tplSrc.slice(tplSrc.indexOf('const LOOKS = {')).split('\n};')[0].matchAll(/^  '?([a-z-]+)'?:\s*\{/gm)].map((m) => m[1]);
const sets = ['studio', 'void', 'outdoor', 'medieval', 'interior', 'street-night', 'jungle', 'lab', 'city-day', 'space', 'blood', 'fat', 'neurons', 'artery'];
const moves = ['dolly-in', 'push', 'dolly-out', 'orbit', 'crane-up', 'crane-down', 'low-hero', 'overhead', 'crash-zoom', 'reveal', 'static', 'track', 'follow', 'over-shoulder', 'dutch', 'handheld'];
const cuts = ['whip', 'zoom', 'spin', 'glitch', 'flash', 'dip', 'smash', 'blur'];
const fx = ['explosion', 'fire', 'smoke', 'sparks', 'magic', 'lightning', 'shockwave', 'splash', 'embers', 'rain', 'snow', 'dust', ...Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, 'fx', 'library.json'), 'utf8')).effects)];
const gestures = ['point', 'shield', 'shrug', 'think', 'stop', 'thumbsup', 'headhold', 'gasp', 'clap'], caps = ['pop', 'karaoke', 'one', 'box'];
const N = Math.max(moves.length, sets.length, looks.length, Math.ceil(fx.length / 2)), D = 1.2  , shots = [];
for (let i = 0; i < N; i++) shots.push({ name: 's' + i, dur: D, cut: i ? cuts[i % cuts.length] : undefined, look: looks[i % looks.length], set: sets[i % sets.length],
  camera: { move: moves[i % moves.length], target: 'hero', size: ['cu', 'ms', 'ws'][i % 3] }, punch: i % 4 === 1 ? [0.3] : undefined, freeze: i % 5 === 2 ? [[0.4, 0.2]] : undefined,
  cast: { hero: { pos: i % 3 === 2 ? [[0, [0, 0, 0]], [D, [1, 0, 0]]] : undefined, clips: [{ clip: ['idle', 'walk', 'run', 'sit', 'kneel'][i % 5], start: 0, end: 0.7 }, { clip: 'idle', start: 0.6, end: D, loop: i % 2 ? false : undefined }],
    look: [[0, 'camera']], face: { shock: [[0, 0], [0.4, 1, 'outBack']] }, gestures: [{ type: gestures[i % gestures.length], start: 0.2, end: 1 }], hands: { right: 'fist' },
    reach: i % 6 === 3 ? [{ hand: 'right', to: [0.3, 1.2, 0.4], start: 0.2, end: 1 }] : undefined } },
  fx: [fx[2 * i], fx[2 * i + 1]].filter(Boolean).map((type, k) => ({ type, t: 0.1 + k * 0.2, pos: [0.6, 1, -0.5] })), sfx: [{ t: 0, type: 'impact' }] });
const total = N * D, tt = (i) => +(i * total / styles.length).toFixed(2);
const titles = styles.map((style, i) => ({ t: tt(i), t1: tt(i) + 0.9, style, text: 'TEST|ONE\nTWO', sub: 'sub', hi: ['ONE'], pos: [0.5, 0.2], at: 'hero.head', kind: 'blood', level: [[0, 0], [0.5, 1]],
  value: 42, max: 100, from: 3, to: 99, step: 0.3, items: ['a', 'b', 'c'], a: { text: 'A', value: 3 }, b: { text: 'B', value: 7 }, data: [3, 5, 2], labels: ['x', 'y', 'z'], in: ['pop', 'fade', 'up', 'down', 'left', 'right', 'zoom', 'drop', 'spin', 'blur'][i % 10], out: ['pop', 'fade', 'up', 'zoom', 'drop', 'spin', 'blur'][i % 7] }));
const captions = Array.from({ length: Math.floor(total / 0.8) }, (_, i) => ({ t: +(i * 0.8).toFixed(2), text: 'one two 3 four', hi: ['3'], style: caps[i % caps.length] }));
const A = 'const CAST = {', B = '/* ============================== END DIRECTION';
const scene = tplSrc.slice(0, tplSrc.indexOf(A)) + `const CAST = { hero: { character: 'jake' } };\nconst SHOTS = ${JSON.stringify(shots)};\nconst CAPTIONS = ${JSON.stringify(captions)};\nconst TITLES = ${JSON.stringify(titles)};\n` + tplSrc.slice(tplSrc.indexOf(B));
const file = path.join(ROOT, 'scenes', '_selftest.html'); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, scene);
(async () => {
  const browser = await launchBrowser(), page = await browser.newPage(), errs = new Map(); let now = 'load';
  const note = (m) => { if (!errs.has(m)) errs.set(m, now); };
  page.on('pageerror', (e) => note('ERROR ' + e.message.split('\n')[0]));
  page.on('console', (m) => { const t = m.text(); if ((m.type() === 'error' || /missing|unknown|not found/i.test(t)) && !/favicon|Failed to load resource|ERR_|fonts|GL Driver|WebGL|GPU stall/i.test(t)) note(m.type().toUpperCase() + ' ' + t.slice(0, 200)); });
  await routeAssets(page); const server = await startStaticServer();
  await page.setViewportSize({ width: 180, height: 320 });
  await page.goto(server.origin + file + '?fast=1');
  await page.waitForFunction(() => window.__mf && window.__mfReady !== false, null, { timeout: 900000, polling: 1000 });
  await page.evaluate(() => { document.getElementById('mf-panel')?.remove(); window.__mfManual = true; window.__mf.setSize(180, 320); });
  const dur = await page.evaluate(() => __mf.duration);
  for (let t = 0; t < dur; t += 0.15) { const i = Math.floor(t / D); now = `t=${t.toFixed(2)} shot ${i} (${shots[i]?.camera.move}/${shots[i]?.set}/${shots[i]?.look}/fx ${shots[i]?.fx.map((f) => f.type)}) title ${styles.filter((_, k) => t >= tt(k) && t <= tt(k) + 1.2)}`;
    try { await page.evaluate((t) => __mf.render(t), t); } catch (e) { note('ERROR render: ' + e.message.split('\n')[0]); } }
  now = 'probe/pacing/soundtrack';
  try { await page.evaluate(() => { __mfDebug.pacing(); __mfDebug.probe(1); __mfDebug.shots(); }); } catch (e) { note('ERROR debug: ' + e.message.split('\n')[0]); }
  try { await page.evaluate(() => window.__mf.soundtrackWav ? window.__mf.soundtrackWav(0, 3).then((x) => x.length) : 0); } catch (e) { note('ERROR soundtrack: ' + e.message.split('\n')[0]); }
  await browser.close(); server.close(); if (!process.argv.includes('--keep')) fs.rmSync(file, { force: true });
  console.log(`${styles.length} title styles · ${looks.length} looks · ${sets.length} sets · ${moves.length} moves · ${fx.length} effects · ${dur.toFixed(1)}s`);
  console.log(errs.size ? `SELFTEST FAIL (${errs.size}):\n- ` + [...errs].map(([m, w]) => `${m}   ← ${w}`).join('\n- ') : 'SELFTEST PASS');
  process.exit(errs.size ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
