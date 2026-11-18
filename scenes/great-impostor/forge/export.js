// Builds each spec with the Forge 3D Studio engine (modelforge/studio.html) headlessly → <id>.glb + <id>.png preview
const { launchBrowser, startStaticServer, routeAssets } = require('/home/user/motion-forge/scripts/lib/deps');
const fs = require('fs'), path = require('path');
const ids = process.argv.slice(2);
(async () => {
  let src = fs.readFileSync('/home/user/motion-forge/modelforge/studio.html', 'utf8');
  src = src.replace('window.__forge = { showSpec, DEMO };', `window.__forge = { showSpec, DEMO, glb: () => new Promise((res, rej) => { const m = model.clone(); m.scale.setScalar(1); m.position.set(0,0,0); m.traverse(o=>{o.matrixAutoUpdate=true;}); m.updateMatrixWorld(true); new GLTFExporter().parse(m, (b) => res(Array.from(new Uint8Array(b))), rej, { binary: true }); }), shot: () => { renderer.render(scene, camera); return renderer.domElement.toDataURL('image/png'); } };`);
  const tmp = path.join(__dirname, '_studio.html'); fs.writeFileSync(tmp, src);
  const b = await launchBrowser(), p = await b.newPage(); await routeAssets(p); const s = await startStaticServer();
  p.on('console', (m) => /rror/.test(m.text()) && console.error('console', m.text())); p.on('pageerror', (e) => console.error('pageerror', e.message)); p.on('requestfailed', (r) => console.error('fail', r.url()));
  await p.setViewportSize({ width: 900, height: 900 });
  console.error('goto'); await p.goto(s.origin + tmp); console.error('loaded'); await p.waitForFunction(() => window.__forge, null, { timeout: 120000 });
  for (const id of ids) {
    const spec = JSON.parse(fs.readFileSync(path.join(__dirname, id + '.json'), 'utf8'));
    const ok = await p.evaluate((sp) => window.__forge.showSpec(sp), spec); await p.waitForTimeout(800);
    const png = await p.evaluate(() => window.__forge.shot()); fs.writeFileSync(path.join(__dirname, id + '.png'), Buffer.from(png.split(',')[1], 'base64'));
    const arr = await p.evaluate(() => window.__forge.glb()); fs.writeFileSync(path.join(__dirname, id + '.glb'), Buffer.from(arr));
    console.log(id, ok, (arr.length / 1024).toFixed(0) + ' KB');
  }
  fs.rmSync(tmp); await b.close(); process.exit(0);
})();
