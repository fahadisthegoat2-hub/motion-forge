#!/usr/bin/env node
// VFX Library artifact data: one doc per effect for the "effects" collection (ArtifactData batch set). Never republish the page for data.
// Usage: node vfx_data.js [--db dir]  → entries with needsVideo=true: upload fx/previews/<name>.mp4 (Artifact asset upload), put the url in doc.video.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..'), meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'fx', 'previews', 'index.json'), 'utf8'));
const dbArg = process.argv.indexOf('--db'), have = {};
if (dbArg > 0) for (const f of fs.readdirSync(process.argv[dbArg + 1])) { try { const d = JSON.parse(fs.readFileSync(path.join(process.argv[dbArg + 1], f), 'utf8')); have[path.basename(f, '.json')] = d.data || d; } catch {} }
let order = 0; const out = [];
for (const [id, m] of Object.entries(meta)) {
  const mp4 = path.join(ROOT, 'fx', 'previews', id + '.mp4'), videoKey = fs.existsSync(mp4) ? crypto.createHash('md5').update(fs.readFileSync(mp4)).digest('hex').slice(0, 10) : null;
  const doc = { name: id.replace(/-/g, ' '), about: m.about, kind: m.builtin ? 'built-in' : 'library', order: order++, videoKey }, prev = have[id];
  const needsVideo = !!videoKey && (!prev || prev.videoKey !== videoKey || !prev.video); if (prev?.video && !needsVideo) doc.video = prev.video;
  out.push({ id, changed: !prev || needsVideo || ['about', 'kind', 'order'].some((k) => prev[k] !== doc[k]), needsVideo, file: videoKey ? path.relative(process.cwd(), mp4) : null, doc });
}
console.log(JSON.stringify(out, null, 1));
