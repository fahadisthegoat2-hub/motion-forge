#!/usr/bin/env node
// Frame-perfect renderer for pages exposing window.__mf = {duration, fps, width?, height?, render(t)}
// Usage: node render_video.js scene.html out.mp4 [--fast (QA preview shaders)] [--quality good|high|epic] [--chapter N | --start S --end E] [--fps 60] [--width 1920] [--height 1080] [--gif] [--frames-only]
const { launchBrowser, ffmpeg, startStaticServer, routeAssets } = require('./lib/deps');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const [input, output = 'out.mp4'] = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] || '').match(/^--(fps|width|height|quality|start|end|chapter)$/));
if (!input) { console.error('usage: render_video.js scene.html out.mp4 [--fps N] [--width W] [--height H] [--gif] [--frames-only]'); process.exit(1); }

(async () => {
  const browser = await launchBrowser();
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('page error:', e.message));
  await routeAssets(page);
  const server = await startStaticServer();
  await page.goto(server.origin + path.resolve(input) + (flag('--fast') ? '?fast=1' : ''));
  await page.waitForFunction(() => window.__mf && typeof window.__mf.render === 'function' && window.__mfReady !== false, null, { timeout: 900000, polling: 1000 });
  const mf = await page.evaluate(() => ({ duration: __mf.duration, fps: __mf.fps, width: __mf.width, height: __mf.height, chapters: __mf.chapters }));
  const ch = opt('--chapter') && mf.chapters ? mf.chapters[+opt('--chapter') - 1] : null;
  const T0 = ch ? ch.start : +opt('--start', 0), T1 = ch ? ch.end : +opt('--end', mf.duration);
  const Q = { good: [1, 30, 18], high: [1, 60, 16], epic: [4 / 3, 60, 14] }[opt('--quality', '')];
  const bw = mf.width || 1920, bh = mf.height || 1080;
  const fps = Q ? Q[1] : +opt('--fps', mf.fps || 60), crf = String(Q ? Q[2] : 16);
  const w = Q ? Math.round(bw * Q[0] / 2) * 2 : +opt('--width', bw), h = Q ? Math.round(bh * Q[0] / 2) * 2 : +opt('--height', bh);
  await page.setViewportSize({ width: w, height: h });
  await page.evaluate(([w, h]) => { document.getElementById('mf-panel')?.remove(); window.dispatchEvent(new Event('resize')); window.__mf.setSize?.(w, h); window.__mfManual = true; }, [w, h]);

  const dir = output.replace(/\.[^.]+$/, '') + '_frames';
  fs.mkdirSync(dir, { recursive: true });
  const total = Math.round((T1 - T0) * fps);
  for (let f = 0; f < total; f++) {
    await page.evaluate((t) => __mf.render(t), T0 + f / fps);
    await page.screenshot({ path: path.join(dir, `f${String(f).padStart(5, '0')}.png`) });
    if (f % fps === 0) process.stdout.write(`\rframe ${f}/${total}`);
  }
  let wav = null;   // the edit's soundtrack (music + sfx + ambience + voice), exactly this range
  if (!flag('--no-audio') && !flag('--gif') && !flag('--frames-only')) {
    const b64 = await page.evaluate(([a, b]) => window.__mf.soundtrackWav ? window.__mf.soundtrackWav(a, b) : null, [T0, T1]).catch((e) => { console.error('soundtrack failed:', e.message); return null; });
    if (b64) { wav = output.replace(/\.[^.]+$/, '') + '_sound.wav'; fs.writeFileSync(wav, Buffer.from(b64, 'base64')); }
  }
  await browser.close(); server.close();
  console.log(`\nframes -> ${dir}`);
  if (flag('--frames-only')) return;

  const pattern = path.join(dir, 'f%05d.png');

  if (flag('--gif')) {
    const gif = output.replace(/\.[^.]+$/, '.gif');
    execFileSync(ffmpeg(), ['-y', '-framerate', String(fps), '-i', pattern, '-vf',
      `fps=${Math.min(fps, 30)},scale=${Math.min(w, 720)}:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse`, gif], { stdio: 'inherit' });
    console.log('gif ->', gif);
  } else {
    execFileSync(ffmpeg(), ['-y', '-framerate', String(fps), '-i', pattern, ...(wav ? ['-i', wav, '-c:a', 'aac', '-b:a', '192k', '-shortest'] : []), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', crf, '-preset', 'slow', output], { stdio: 'inherit' });
    if (wav) fs.rmSync(wav, { force: true });
    console.log('video ->', output);
  }
  fs.rmSync(dir, { recursive: true, force: true });
})().catch((e) => { console.error(e); process.exit(1); });
