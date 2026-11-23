// fill.js N file.json → review_log --check per entry (ids: [status, evidence, proof[], fix?, severity?])
const { execFileSync } = require('child_process'); const fs = require('fs');
const N = process.argv[2], d = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const odd = Array.from({ length: 10 }, (_, i) => `r${N}/strip_${String(i * 2 + 1).padStart(2, '0')}.png`);
for (const [id, [st, ev, pr, fix, sev]] of Object.entries(d)) {
  const a = ['scripts/review_log.js', 'scenes/dont-press/dont-press.html', '--check', id, '--status', st, '--evidence', ev, '--proof', (pr === 'ODD' ? odd : pr.map((p) => p.startsWith('r') ? p : `r${N}/${p}`)).join(',')];
  if (fix) a.push('--fix', fix); if (sev) a.push('--severity', sev);
  try { execFileSync('node', a, { cwd: '/home/user/motion-forge', stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) { console.log(id, 'ERR', String(e.stdout) + String(e.stderr)); }
}
