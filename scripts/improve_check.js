#!/usr/bin/env node
// "Make it better" gate: a revision must be a real, visible change — not the same video with two numbers nudged.
// Usage: node improve_check.js old_scene.html new_scene.html      (keep the old version as <scene>.prev.html before editing)
const fs = require('fs'), [a, b] = process.argv.slice(2);
if (!a || !b || !fs.existsSync(a) || !fs.existsSync(b)) { console.error('usage: improve_check.js old_scene.html new_scene.html'); process.exit(1); }
const dir = (f) => { const s = fs.readFileSync(f, 'utf8'), i = s.indexOf('const CONFIG = {'), j = s.indexOf('END DIRECTION'); return i >= 0 && j > i ? s.slice(i, j) : s; };
const A = dir(a), B = dir(b), fails = [];
const section = (s, name) => { const i = s.indexOf('const ' + name + ' = '); if (i < 0) return ''; const rest = s.slice(i + 6), j = rest.search(/\nconst [A-Z_]+ = /); return rest.slice(0, j < 0 ? undefined : j); };
const diff = (x, y) => { const X = x.split('\n').map((l) => l.trim()).filter(Boolean), m = new Map(); X.forEach((l) => m.set(l, (m.get(l) || 0) + 1)); let ch = 0; const Y = y.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const l of Y) { const n = m.get(l) || 0; if (n) m.set(l, n - 1); else ch++; } return { ch, total: Math.max(1, Y.length) }; };
const all = diff(A, B), parts = ['SHOTS', 'TITLES', 'CAPTIONS', 'CAST'].map((n) => [n, diff(section(A, n), section(B, n))]);
const numOnly = (x, y) => x.replace(/-?\d+(\.\d+)?/g, '#') === y.replace(/-?\d+(\.\d+)?/g, '#');
if (A === B) fails.push('the direction is identical — nothing was changed');
else {
  if (all.ch < 8 && all.ch / all.total < 0.15) fails.push(`only ${all.ch} line(s) of the direction changed — that is a tweak, not an improvement. Rebuild the 3 weakest things (skills/taste → make-it-better protocol)`);
  if (numOnly(A, B)) fails.push('only numbers changed (same shots, same acting, same graphics) — change the approach, not the values');
  if (parts[0][1].ch === 0) fails.push('SHOTS are untouched — the picture itself (staging, acting, camera) did not get better');
}
console.log(parts.map(([n, d]) => `${n} ${d.ch}/${d.total} lines changed`).join(' · '));
console.log(fails.length ? 'IMPROVE FAIL:\n- ' + fails.join('\n- ') : 'IMPROVE PASS — now compare before/after frames yourself: the difference must be obvious in 2 seconds');
process.exit(fails.length ? 1 : 0);
