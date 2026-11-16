#!/usr/bin/env node
// Character versions — improvements replace the current character; every old version is archived
// forever so it can always be restored. Run from the project root.
//   node character_version.js archive <id>   → snapshot current (entry + glb + photo) into characters/history/<id>/vN.*
//   node character_version.js undo <id>      → restore the most recent snapshot (current is archived too, so undo is undoable)
//   node character_version.js list <id>
const fs = require('fs'), path = require('path');
const ROOT = process.cwd(), LIBF = path.join(ROOT, 'characters', 'library.json');
const [cmd, id] = process.argv.slice(2);
const lib = JSON.parse(fs.readFileSync(LIBF, 'utf8')); lib.history ??= {};
if (!['archive', 'undo', 'list'].includes(cmd)) { console.error('usage: character_version.js archive|undo|list <id>'); process.exit(1); }
const cur = lib.characters[id]; if (!cur && cmd !== 'list') { console.error('unknown character ' + id); process.exit(1); }
const hdir = path.join(ROOT, 'characters', 'history', id || '_'); const save = () => fs.writeFileSync(LIBF, JSON.stringify(lib, null, 2) + '\n');
const glbOf = (e) => e.file ? path.join(ROOT, e.file) : null, thumb = path.join(ROOT, 'characters', 'thumbs', id + '.jpg');
function snapshot() {
  fs.mkdirSync(hdir, { recursive: true }); const v = cur.version || 1, tag = 'v' + v + '-' + Date.now().toString(36);
  const snap = { version: v, entry: JSON.parse(JSON.stringify(cur)), archivedAt: new Date().toISOString(), tag };
  const g = glbOf(cur); if (g && fs.existsSync(g)) { fs.copyFileSync(g, path.join(hdir, tag + '.glb')); snap.glb = path.relative(ROOT, path.join(hdir, tag + '.glb')); }
  if (fs.existsSync(thumb)) { fs.copyFileSync(thumb, path.join(hdir, tag + '.jpg')); snap.thumb = path.relative(ROOT, path.join(hdir, tag + '.jpg')); }
  (lib.history[id] ??= []).push(snap); return snap;
}
if (cmd === 'archive') {
  const s = snapshot(); cur.version = (cur.version || 1) + 1; save();
  console.log(`archived ${id} v${s.version} → now editing v${cur.version}`);
} else if (cmd === 'undo') {
  const hist = lib.history[id] || []; if (!hist.length) { console.error('nothing to undo for ' + id); process.exit(1); }
  const prev = hist.pop(); const currentSnap = snapshot();   // keep the current one too (undo can be undone)
  const restored = prev.entry; restored.version = Math.max(currentSnap.version, prev.version) + 1; restored.restoredFrom = 'v' + prev.version;
  lib.characters[id] = restored;
  if (prev.glb && restored.file && fs.existsSync(path.join(ROOT, prev.glb))) fs.copyFileSync(path.join(ROOT, prev.glb), path.join(ROOT, restored.file));
  if (prev.thumb && fs.existsSync(path.join(ROOT, prev.thumb))) fs.copyFileSync(path.join(ROOT, prev.thumb), thumb);
  save(); console.log(`restored ${id} to its v${prev.version} look (saved as v${restored.version}); the replaced look stays in history`);
} else if (cmd === 'list') {
  for (const [cid, h] of Object.entries(lib.history)) if (!id || cid === id) console.log(cid + ': ' + h.map((s) => 'v' + s.version + ' (' + s.archivedAt.slice(0, 10) + ')').join(', '));
} else { console.error('usage: character_version.js archive|undo|list <id>'); process.exit(1); }
