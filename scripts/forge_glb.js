#!/usr/bin/env node
// Forge 3D Studio spec → .glb, headless (no GPU, no PC needed). Uses the studio's own builder (modelforge/studio.html CORE + materials).
// usage: node scripts/forge_glb.js spec.json <id> <height_m> [--register]   → assets/models/<id>.glb (+ models.json entry)
const fs = require('fs'), path = require('path');
const { launchBrowser, startStaticServer, routeAssets } = require('./lib/deps');
const [specFile, id, height] = process.argv.slice(2);
if (!specFile || !id) { console.error('usage: forge_glb.js spec.json id height [--register]'); process.exit(1); }
const ROOT = path.join(__dirname, '..'), src = fs.readFileSync(path.join(ROOT, 'modelforge/studio.html'), 'utf8');
const core = src.slice(src.indexOf('/*CORE-START*/'), src.indexOf('// ---------- viewer ----------'));
const html = `<!doctype html><script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}</script>
<script type="module">
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import * as BGU from 'three/addons/utils/BufferGeometryUtils.js';
${core}
window.forge = (spec) => new Promise((ok, bad) => {
  HIGH = true; const root = buildModel(spec, { mat: matFactory(spec.materials || {}), max: 600 });
  root.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(root), c = box.getCenter(new THREE.Vector3());
  const wrap = new THREE.Group(); wrap.add(root); root.position.set(-c.x, -box.min.y, -c.z); wrap.name = spec.name || 'model';
  new GLTFExporter().parse(wrap, (buf) => { const b = new Uint8Array(buf); let s = ''; for (let i = 0; i < b.length; i += 32768) s += String.fromCharCode.apply(null, b.subarray(i, i + 32768)); ok({ b64: btoa(s), size: box.getSize(new THREE.Vector3()).toArray(), errors: 0 }); }, bad, { binary: true });
});
window.preview = async (spec) => {
  HIGH = true; const R = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); R.setSize(1200, 600); R.toneMapping = THREE.ACESFilmicToneMapping; R.outputColorSpace = THREE.SRGBColorSpace;
  const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js'); const sc = new THREE.Scene(); sc.background = new THREE.Color('#9aa3ab');
  const pm = new THREE.PMREMGenerator(R); sc.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  const root = buildModel(spec, { mat: matFactory(spec.materials || {}), max: 600 }); root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root), c = box.getCenter(new THREE.Vector3()), r = box.getSize(new THREE.Vector3()).length() / 2; sc.add(root);
  const k = new THREE.DirectionalLight(0xfff1e0, 2.4); k.position.set(c.x + r * 2, c.y + r * 3, c.z + r * 2); sc.add(k);
  let i = 0; R.setScissorTest(true);
  for (const [ax, ay] of [[0.75, 0.3], [-2.3, 0.15]]) { const cam = new THREE.PerspectiveCamera(35, 1, r / 100, r * 20); const d = r / Math.sin(17.5 * Math.PI / 180) * 1.05;
    cam.position.set(c.x + Math.sin(ax) * d * Math.cos(ay), c.y + Math.sin(ay) * d, c.z + Math.cos(ax) * d * Math.cos(ay)); cam.lookAt(c);
    R.setViewport(i * 600, 0, 600, 600); R.setScissor(i * 600, 0, 600, 600); R.render(sc, cam); i++; }
  return R.domElement.toDataURL('image/png'); };
window.ready = true;
</script>`;
(async () => {
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'forge-')); fs.writeFileSync(path.join(tmp, 'index.html'), html);
  const srv = await startStaticServer(tmp), browser = await launchBrowser(), page = await browser.newPage();
  page.on('pageerror', (e) => console.error('page:', e.message)); await routeAssets(page);
  await page.goto(srv.origin + path.join(tmp, 'index.html')); await page.waitForFunction(() => window.ready, null, { timeout: 60000 });
  const r = await page.evaluate((s) => window.forge(s), JSON.parse(fs.readFileSync(specFile, 'utf8')));
  if (process.argv.includes('--preview')) { const png = await page.evaluate((sp) => window.preview(sp), JSON.parse(fs.readFileSync(specFile, 'utf8'))); fs.writeFileSync(specFile.replace(/\.json$/, '.png'), Buffer.from(png.split(',')[1], 'base64')); }
  const out = path.join(ROOT, 'assets/models', id + '.glb'); fs.writeFileSync(out, Buffer.from(r.b64, 'base64'));
  let parts = 0; const cnt = (a) => (a || []).forEach((p) => { parts += (p.mirror ? 2 : 1) * (p.repeat ? p.repeat.n : 1); cnt(p.children); }); cnt(JSON.parse(fs.readFileSync(specFile, 'utf8')).parts);
  console.log(id, 'parts~' + parts, 'size', r.size.map((v) => v.toFixed(2)).join('x'), (fs.statSync(out).size / 1024).toFixed(0) + ' KB');
  if (process.argv.includes('--register')) { const mf = path.join(ROOT, 'assets/models/models.json'), M = JSON.parse(fs.readFileSync(mf, 'utf8'));
    M.models[id] = { file: 'models/' + id + '.glb', height: +height || +r.size[1].toFixed(2), about: (JSON.parse(fs.readFileSync(specFile, 'utf8')).name || id) + ' (Forge 3D Studio spec, own work)', tags: [id] }; fs.writeFileSync(mf, JSON.stringify(M, null, 2)); }
  await browser.close(); srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
