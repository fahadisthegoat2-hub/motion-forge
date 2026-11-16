#!/usr/bin/env node
// Claude's VFX library (fx/library.json): list · show <name> · add <name> <file.json | inline JSON> · remove <name>
// An effect = { about, continuous?, layers: [emitter params…], light?, shake?, flash?, sfx? } — see skills/vfx "VFX library".
const fs = require('fs'), path = require('path');
const F = fs.existsSync('fx/library.json') ? 'fx/library.json' : path.join(__dirname, '..', 'fx', 'library.json');
const lib = JSON.parse(fs.readFileSync(F, 'utf8')), [cmd, name, src] = process.argv.slice(2);
if (cmd === 'list' || !cmd) for (const [k, v] of Object.entries(lib.effects)) console.log(k.padEnd(18), v.about || '');
else if (cmd === 'show') console.log(JSON.stringify(lib.effects[name], null, 1) || 'not found');
else if (cmd === 'add') { if (!name || !src) { console.error('usage: add <name> <file.json | inline JSON>'); process.exit(1); } const def = JSON.parse(fs.existsSync(src) ? fs.readFileSync(src, 'utf8') : src); if (!def.layers?.length) throw new Error('needs layers');
  lib.effects[name] = def; fs.writeFileSync(F, JSON.stringify(lib, null, 1)); console.log('saved', name); }
else if (cmd === 'remove') { delete lib.effects[name]; fs.writeFileSync(F, JSON.stringify(lib, null, 1)); console.log('removed', name); }
