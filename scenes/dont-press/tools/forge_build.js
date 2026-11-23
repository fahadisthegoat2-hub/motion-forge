// Forge 3D Studio core → GLB, offline in headless Chromium. usage: node forge_build.js specs.json outdir
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const html = fs.readFileSync(path.join(__dirname, '../../../modelforge/studio.html'), 'utf8').split('\n');
const core = html.slice(104, 522).join('\n');
const page = `<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script><script type="module">
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import * as BGU from 'three/addons/utils/BufferGeometryUtils.js';
${core}
window.build = (spec) => new Promise((res, rej) => { const ctx = { mat: matFactory(spec.materials), max: 600, res: 1 }; const root = buildModel(spec, ctx);
  root.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(root);
  new GLTFExporter().parse(root, buf => { let s=''; const u=new Uint8Array(buf); for (let i=0;i<u.length;i+=8192) s+=String.fromCharCode.apply(null,u.subarray(i,i+8192)); res({b64: btoa(s), h: b.max.y-b.min.y, errors: ctx.errors||0}); }, rej, { binary: true }); });
window.ready = true;
</script>`;
(async () => {
  const specs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), out = process.argv[3];
  const br = await chromium.launch(); const pg = await br.newPage();
  pg.on('pageerror', e => console.error('PAGEERR', e.message));
  await pg.setContent(page); await pg.waitForFunction('window.ready', null, { timeout: 60000 });
  for (const [id, spec] of Object.entries(specs)) {
    const r = await pg.evaluate((s) => window.build(s), spec);
    fs.writeFileSync(path.join(out, id + '.glb'), Buffer.from(r.b64, 'base64')); console.log(id, 'height', r.h.toFixed(2), 'errors', r.errors);
  }
  await br.close();
})();
