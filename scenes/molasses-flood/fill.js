// node fill.js <round> <entries.js>  — writes the round's check results into review.json
const fs = require('fs'), path = require('path');
const [n, ef] = process.argv.slice(2), file = path.join(__dirname, 'molasses-flood_qa/review.json');
const r = JSON.parse(fs.readFileSync(file, 'utf8')), rd = r.rounds[+n - 1], E = require(path.resolve(ef));
for (const [id, [status, evidence, proof, fix]] of Object.entries(E)) {
  const c = rd.checks[id]; c.status = status; c.evidence = evidence; c.proof = [].concat(proof).map((p) => `r${n}/${p}`); c.fix = fix || '';
  for (const p of c.proof) if (!fs.existsSync(path.join(__dirname, 'molasses-flood_qa', p))) console.log('missing proof', id, p);
}
const miss = Object.entries(rd.checks).filter(([, c]) => !c.status).map(([k]) => k);
fs.writeFileSync(file, JSON.stringify(r, null, 1)); console.log('round', n, 'filled', miss.length ? 'MISSING ' + miss : 'all');
