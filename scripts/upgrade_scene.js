#!/usr/bin/env node
// Put the latest engine under an existing scene: keeps the scene's DIRECTION block (CONFIG · CAST · SHOTS · CAPTIONS · TITLES · THUMBS)
// and replaces everything else with templates/studio_scene.html — so engine fixes reach old scenes.
// Usage: node upgrade_scene.js scene.html [out.html]   (default: overwrites scene.html, the old file is kept as scene.html.bak)
const fs = require('fs'), path = require('path');
const [input, output] = process.argv.slice(2);
if (!input) { console.error('usage: upgrade_scene.js scene.html [out.html]'); process.exit(1); }
const A = 'const CONFIG = {', B = '/* ============================== END DIRECTION';
const tpl = fs.readFileSync(path.join(__dirname, '..', 'templates', 'studio_scene.html'), 'utf8'), old = fs.readFileSync(input, 'utf8');
const cut = (s) => { const a = s.indexOf(A), b = s.indexOf(B); if (a < 0 || b < 0 || b < a) throw new Error('DIRECTION block not found (needs "const CONFIG = {" … "END DIRECTION")'); return [s.slice(0, a), s.slice(a, b), s.slice(b)]; };
const [head, , tail] = cut(tpl), [, direction] = cut(old);
const title = (old.match(/<title>([^<]*)<\/title>/) || [])[1];
let out = head + direction + tail; if (title) out = out.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
if (!output) fs.copyFileSync(input, input + '.bak');
fs.writeFileSync(output || input, out);
console.log(`upgraded → ${output || input}${output ? '' : ' (old version: ' + input + '.bak)'} — now run qa_check.js on it and look at the sheet (framing rules changed: check titles vs faces)`);
