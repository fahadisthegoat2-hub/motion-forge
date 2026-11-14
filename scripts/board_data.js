#!/usr/bin/env node
// Casting Board data: prints one entry per character for the board's "cast" collection (ArtifactData batch set).
// The page shows changes live — never republish the page to update a character.
// Usage: node board_data.js [--db cast.json]   (cast.json = an ArtifactData list of "cast" saved with out_dir, optional)
// For each entry with needsPhoto=true: upload `thumb` with Artifact { url, asset: true, file_path } and put the returned url in doc.photo.
const fs = require('fs'), path = require('path');
const ROOT = process.cwd(), lib = JSON.parse(fs.readFileSync(path.join(ROOT, 'characters', 'library.json'), 'utf8'));
const dbArg = process.argv.indexOf('--db'), have = {};
if (dbArg > 0) { const p = process.argv[dbArg + 1]; const files = fs.statSync(p).isDirectory() ? fs.readdirSync(p).map((f) => path.join(p, f)) : [p];
  for (const f of files) { try { const d = JSON.parse(fs.readFileSync(f, 'utf8')); const id = d.id || path.basename(f, '.json'); have[id] = d.data || d; } catch {} } }
const out = []; let order = 0;
for (const [id, c] of Object.entries(lib.characters || {})) {
  const v = c.version || 1, hist = (lib.history || {})[id] || [], thumb = path.join('characters', 'thumbs', id + '.jpg'), photoKey = `${id}-v${v}`;
  const doc = { name: c.name || id, about: c.about || '', height: c.height || null, version: v, undoTo: hist.length ? hist[hist.length - 1].version : null, order: order++, photoKey };
  const prev = have[id], needsPhoto = fs.existsSync(path.join(ROOT, thumb)) && (!prev || prev.photoKey !== photoKey || !prev.photo);
  if (prev?.photo && !needsPhoto) doc.photo = prev.photo;
  const changed = !prev || ['name', 'about', 'height', 'version', 'undoTo', 'order', 'photoKey'].some((k) => prev[k] !== doc[k]);
  out.push({ id, changed: changed || needsPhoto, needsPhoto, thumb: fs.existsSync(path.join(ROOT, thumb)) ? thumb : null, doc });
}
for (const id of Object.keys(have)) if (!lib.characters?.[id]) out.push({ id, changed: true, remove: true });   // deleted characters
console.log(JSON.stringify(out, null, 1));
