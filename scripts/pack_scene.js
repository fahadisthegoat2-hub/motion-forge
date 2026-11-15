#!/usr/bin/env node
// Make a scene work as a claude.ai Artifact. Artifact pages can't load .glb/.fbx files or the GitHub CDN, so
// characters/animations would be missing. This loads the scene once, records every model/data file it uses and
// writes them as base64 .txt next to it; the template's loader reads them back (mf-pack.json).
// Usage: node pack_scene.js scene.html   → prints the Artifact `files` map to pass when publishing scene.html
const { launchBrowser, startStaticServer, routeAssets } = require('./lib/deps');
const fs = require('fs'), path = require('path');

const input = process.argv[2];
if (!input) { console.error('usage: pack_scene.js scene.html'); process.exit(1); }
const scene = path.resolve(input), sceneDir = path.dirname(scene), name = path.basename(scene).replace(/\.html?$/i, '');
const outDir = path.join(sceneDir, name + '.pack'), ASSET = /\.(glb|gltf|bin|fbx|json|png|jpe?g|webp|ktx2|hdr|mp3|wav|ogg|m4a)(\?|$)/i;

function keyOf(url, origin) {
  let m = url.match(/motion-forge@[^/]+\/(.+)$/) || url.match(/three\.js@[^/]+\/(.+)$/);
  if (m) return decodeURIComponent(m[1]);
  if (url.startsWith(origin)) { const rel = path.relative(sceneDir, decodeURIComponent(new URL(url).pathname)).split(path.sep).join('/'); return rel.replace(/^(\.\.?\/)+/, ''); }
  return null;   // other hosts (allowed CDNs) load fine from an artifact
}

(async () => {
  const browser = await launchBrowser(), page = await browser.newPage(), got = new Map();
  await routeAssets(page);
  page.on('response', async (resp) => {
    const url = resp.url().split('?')[0]; if (!ASSET.test(url) || resp.status() !== 200 || /\/mf-pack\.json$/.test(url)) return;
    try { got.set(url, await resp.body()); } catch {}
  });
  const server = await startStaticServer();
  await page.goto(server.origin + scene + '?fast=1');
  await page.waitForFunction(() => window.__mf && typeof window.__mf.render === 'function' && window.__mfReady !== false, null, { timeout: 900000, polling: 1000 });
  await page.evaluate(() => window.__mf.render(0.5));
  await new Promise((r) => setTimeout(r, 1500));
  await browser.close(); server.close();

  fs.rmSync(outDir, { recursive: true, force: true }); fs.mkdirSync(path.join(outDir, 'mfpack'), { recursive: true });
  const manifest = {}, files = {}; let i = 0, total = 0;
  for (const [url, buf] of got) {
    const k = keyOf(url, server.origin); if (!k || manifest[k]) continue;
    const pub = `mfpack/${i++}-${path.basename(k)}.txt`, b64 = buf.toString('base64');
    if (b64.length > 16e6) { console.error(`too big for an artifact (${(b64.length / 1e6).toFixed(1)} MB): ${k}`); continue; }
    fs.writeFileSync(path.join(outDir, pub), b64); manifest[k] = pub; files[pub] = path.relative(process.cwd(), path.join(outDir, pub)); total += b64.length;
  }
  // the MP4 writer ships with the page so the automatic on-device render never depends on a CDN
  const mux = path.join(__dirname, '..', 'vendor', 'mp4-muxer.mjs'); if (fs.existsSync(mux)) { fs.copyFileSync(mux, path.join(outDir, 'mp4-muxer.mjs')); files['mp4-muxer.mjs'] = path.relative(process.cwd(), path.join(outDir, 'mp4-muxer.mjs')); }
  fs.writeFileSync(path.join(outDir, 'mf-pack.json'), JSON.stringify(manifest, null, 1));
  files['mf-pack.json'] = path.relative(process.cwd(), path.join(outDir, 'mf-pack.json'));
  if (total > 60e6) console.error(`warning: ${(total / 1e6).toFixed(0)} MB total — publish in two calls (artifact limit 64 MB per publish)`);
  console.error(`packed ${Object.keys(manifest).length} files (${(total / 1e6).toFixed(1)} MB): ${Object.keys(manifest).join(', ')}`);
  console.log(JSON.stringify(files));
})().catch((e) => { console.error(e); process.exit(1); });
