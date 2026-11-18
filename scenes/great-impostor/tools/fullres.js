// full-res (1080x1920, final shaders) frame grabs at given shot fractions → r<N>/full_*.jpg
const { launchBrowser, startStaticServer, routeAssets, ffmpeg } = require('/home/user/motion-forge/scripts/lib/deps');
const path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
(async () => { const N = process.argv[2], frac = +(process.argv[3] || 0.5), dir = path.join(__dirname, '../great-impostor_qa/r' + N);
  const b = await launchBrowser(), p = await b.newPage(); p.setDefaultTimeout(0); await routeAssets(p); const s = await startStaticServer();
  await p.setViewportSize({ width: 1080, height: 1920 });
  await p.goto(s.origin + path.resolve(__dirname, '../great-impostor.html') + '?preview');
  await p.waitForFunction(() => window.__mf && window.__mfReady !== false, null, { timeout: 900000 });
  await p.evaluate(() => { document.getElementById('mf-panel')?.remove(); window.__mfManual = true; __mf.setSize(1080, 1920); });
  let shots = await p.evaluate(() => __mfDebug.shots()); if (process.env.ONLY) shots = shots.filter((s) => process.env.ONLY.split(",").includes(s.name));
  for (const sh of shots) { await p.evaluate((t) => __mf.render(t), sh.start + sh.dur * frac);
    const f = path.join(dir, `full_${String(sh.i).padStart(2, '0')}.png`); await p.locator('canvas').first().screenshot({ path: f });
    execFileSync(ffmpeg(), ['-loglevel', 'error', '-y', '-i', f, '-q:v', '3', f.replace('.png', '.jpg')]); fs.rmSync(f); }
  await b.close(); process.exit(0); })();
