#!/usr/bin/env node
// Forge 3D Studio page (prompt / reference image -> realistic 3D model, library, .glb export). STATIC page: models live in its
// database (collection "models"), so Claude adds models as DATA without republishing. Republish only when modelforge/studio.html changes.
// Run from the project root: node scripts/forge_studio_page.js  -> prints {page, files, hash, changed, url}
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = process.cwd(), OUT = path.join(ROOT, '.motion-forge', 'forge-studio');
const SRC = path.join(__dirname, '..', 'modelforge', 'studio.html');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const html = fs.readFileSync(SRC, 'utf8');
fs.writeFileSync(path.join(OUT, 'index.html'), html);
const hash = crypto.createHash('sha256').update(html).digest('hex').slice(0, 16);
let saved = {}; try { saved = JSON.parse(fs.readFileSync(path.join(ROOT, 'characters', 'forge-studio.json'), 'utf8')); } catch {}
console.log(JSON.stringify({ page: path.relative(ROOT, path.join(OUT, 'index.html')), files: {}, hash, changed: !saved.url || saved.page !== hash, url: saved.url || null,
  capabilities: { sample: { images: true }, db: {}, user: {}, downloads: true } }, null, 1));
