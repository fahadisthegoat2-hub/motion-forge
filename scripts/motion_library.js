#!/usr/bin/env node
// Claude's private motion library (not shown to the user): every custom animation is saved here and reused by name.
// Run from the project root.
//   node motion_library.js list [tag]          → name · duration · tags · about
//   node motion_library.js show <name>
//   node motion_library.js add <name> <motion.json>   (overwrites: improve motions in place)
//   node motion_library.js remove <name>
// Motion JSON: { about, tags[], dur, loop?, bones: { joint: keys }, pos?: keys(offset xyz), rotX?/rotY?/rotZ?: keys(offset rad), face?: { expr: keys }, talk?: [[a,b]] }
// keys = [[t, value, ease?], ...] with t in seconds from the motion's start. Use in a scene: cast.<id>.motions = [{ name, start, speed?, amount?, loop? }]
const fs = require('fs'), path = require('path');
const F = path.join(process.cwd(), 'animations', 'custom', 'motions.json');
const lib = fs.existsSync(F) ? JSON.parse(fs.readFileSync(F, 'utf8')) : { motions: {} };
const save = () => { fs.mkdirSync(path.dirname(F), { recursive: true }); fs.writeFileSync(F, JSON.stringify(lib, null, 1) + '\n'); };
const [cmd, a, b] = process.argv.slice(2);
const isKeys = (k) => Array.isArray(k) && k.every((x) => Array.isArray(x) && typeof x[0] === 'number');
if (cmd === 'list') {
  for (const [n, m] of Object.entries(lib.motions).sort()) if (!a || (m.tags || []).includes(a)) console.log(`${n} · ${m.dur}s${m.loop ? ' loop' : ''} · [${(m.tags || []).join(', ')}] · ${m.about || ''}`);
  if (!Object.keys(lib.motions).length) console.log('(empty)');
} else if (cmd === 'show') { console.log(JSON.stringify(lib.motions[a] ?? null, null, 1)); }
else if (cmd === 'add') {
  if (!a || !b) { console.error('usage: add <name> <motion.json>'); process.exit(1); }
  const m = JSON.parse(fs.readFileSync(b, 'utf8')), errs = [];
  if (!(m.dur > 0)) errs.push('dur (seconds) required');
  for (const [j, k] of Object.entries(m.bones || {})) if (!isKeys(k)) errs.push('bones.' + j + ' must be keys');
  for (const f of ['pos', 'rotX', 'rotY', 'rotZ']) if (m[f] && !isKeys(m[f])) errs.push(f + ' must be keys');
  for (const [e, k] of Object.entries(m.face || {})) if (!isKeys(k)) errs.push('face.' + e + ' must be keys');
  if (errs.length) { console.error('invalid motion: ' + errs.join('; ')); process.exit(1); }
  const prev = lib.motions[a]; lib.motions[a] = { ...m, created: prev?.created || new Date().toISOString().slice(0, 10), updated: new Date().toISOString().slice(0, 10) };
  save(); console.log((prev ? 'updated ' : 'saved ') + a);
} else if (cmd === 'remove') { if (!lib.motions[a]) { console.error('no motion named ' + a); process.exit(1); } delete lib.motions[a]; save(); console.log('removed ' + a); }
else { console.error('usage: list|show|add|remove'); process.exit(1); }
