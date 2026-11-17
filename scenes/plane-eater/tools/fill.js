// node fill.js <round> <entries.json>  — writes the round's check results into review.json
const fs = require('fs'), path = require('path'); const f = path.join(__dirname, '../plane-eater_qa/review.json');
const r = JSON.parse(fs.readFileSync(f)), n = +process.argv[2], E = JSON.parse(fs.readFileSync(process.argv[3]));
const rd = r.rounds[n - 1]; for (const [id, [status, evidence, proof, fix]] of Object.entries(E)) Object.assign(rd.checks[id], { status, evidence, proof: proof.map((p) => `r${n}/` + p), fix: fix || '' });
fs.writeFileSync(f, JSON.stringify(r, null, 1)); console.log('filled', Object.keys(E).length);
