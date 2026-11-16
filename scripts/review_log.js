#!/usr/bin/env node
// The effort-level gate. It proves WORK, not ticks: every round is a fresh render snapshot, every check needs proof files made in that
// round, every FAIL needs a real fix in the scene, and copy-pasted rounds are rejected. Nothing ships until --verify passes.
//   node review_log.js scene.html --init     → <scene>_qa/review.json for the scene's CONFIG.effort (prints the checks)
//   node review_log.js scene.html --round    → snapshots the CURRENT render into <scene>_qa/rN/ (scene + qa.json + av.json + sheet + wave);
//                                               refuses unless qa_check + av_check were re-run on the current scene after the last round.
//                                               Then put your own proof in rN/ (crops, motion strips, frame grabs, notes) and fill the round.
//   node review_log.js scene.html --verify   → exit 1 unless every rule below holds
// Per check, per round: status PASS/FAIL · evidence (what + where + value) · proof: ["rN/file.png", …] (files that exist in THIS round's
// folder and differ from last round's) · fix (what you changed, for every FAIL).
const { TIERS, tierOf, checksFor } = require('./lib/review_checks');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const args = process.argv.slice(2), input = args.find((a) => !a.startsWith('--'));
if (!input) { console.error('usage: review_log.js scene.html --init | --round | --verify [--effort standard|high|maximum]'); process.exit(1); }
const dir = input.replace(/\.html?$/, '') + '_qa', file = path.join(dir, 'review.json'); fs.mkdirSync(dir, { recursive: true });
const src = fs.readFileSync(input, 'utf8'), ei = args.indexOf('--effort');
const effort = tierOf(ei >= 0 ? args[ei + 1] : (src.match(/\beffort\s*:\s*['"](\w+)['"]/) || [])[1]);
const T = TIERS[effort], list = checksFor(effort);
const FIRST_FAILS = { standard: 3, high: 6, maximum: 10 }[effort];   // a first draft always has problems — a reviewer who finds none didn't look
const hash = (b) => crypto.createHash('sha1').update(b).digest('hex').slice(0, 16), fhash = (p) => hash(fs.readFileSync(p));
const mt = (p) => fs.existsSync(p) ? fs.statSync(p).mtimeMs : 0;
const load = () => JSON.parse(fs.readFileSync(file, 'utf8')), save = (r) => fs.writeFileSync(file, JSON.stringify(r, null, 1));
const changed = (a, b) => {   // lines added + removed between two scene versions
  const A = a.split('\n'), B = b.split('\n'), m = new Map(); A.forEach((l) => m.set(l, (m.get(l) || 0) + 1)); let add = 0;
  for (const l of B) { const n = m.get(l) || 0; if (n) m.set(l, n - 1); else add++; } return add + [...m.values()].reduce((x, y) => x + y, 0);
};
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9.]+/g, ' ').trim();

if (args.includes('--init')) {
  if (!/\beffort\s*:/.test(src)) console.log(`note: CONFIG.effort not set in ${input} — using "${effort}". Set CONFIG.effort to Sir's answer.`);
  save({ scene: input, effort, minRounds: T.rounds, firstRoundMinFails: FIRST_FAILS, checks: list.map(([id]) => id), rounds: [] });
  console.log(`${effort.toUpperCase()}: ${list.length} checks × ≥${T.rounds} rounds · round 1 must find ≥${FIRST_FAILS} real problems → ${file}\n` +
    list.map(([id, n]) => `${id} ${n}`).join('\n') + '\nNext: qa_check + render + av_check --out ' + dir + ', then --round. Method per check: skills/quality-review/SKILL.md');
  process.exit(0);
}
const qa = path.join(dir, 'qa.json'), av = path.join(dir, 'av.json');
if (args.includes('--round')) {
  const r = load(), prev = r.rounds.at(-1), sceneT = mt(input), last = prev ? Date.parse(prev.at) : 0, err = [];
  for (const [p, n] of [[qa, 'qa_check'], [av, 'av_check']]) {
    if (!fs.existsSync(p)) err.push(`${n} has not been run (${p})`);
    else if (mt(p) < sceneT) err.push(`${n} is older than the scene — re-render and re-run it on the current version`);
    else if (mt(p) < last) err.push(`${n} was not re-run since round ${r.rounds.length} — a round needs a fresh render`);
  }
  if (fs.existsSync(qa)) { const q = JSON.parse(fs.readFileSync(qa, 'utf8')); if (!q.measured) err.push('qa.json was made by the old qa_check — run the current one (every-frame motion pass + hand crops)'); else if (tierOf(q.effort) !== effort) err.push(`qa_check ran at "${q.effort}" but the scene's effort is "${effort}" — run it again at the scene's effort`); }
  if (prev && prev.sceneHash === hash(src) && Object.values(prev.checks).some((c) => c.status === 'FAIL')) err.push(`round ${r.rounds.length} has FAILs but the scene is unchanged — fix them first`);
  if (prev && Object.values(prev.checks).some((c) => !/^(PASS|FAIL)$/.test(c.status))) err.push(`round ${r.rounds.length} is not filled in yet`);
  if (err.length) { console.log('ROUND REFUSED:\n- ' + err.join('\n- ')); process.exit(1); }
  const n = r.rounds.length + 1, rd = path.join(dir, 'r' + n); fs.mkdirSync(rd, { recursive: true });
  fs.copyFileSync(input, path.join(rd, 'scene.html'));
  for (const f of ['qa.json', 'av.json', 'sheet.jpg', 'hands.jpg', 'wave.png']) if (fs.existsSync(path.join(dir, f))) fs.copyFileSync(path.join(dir, f), path.join(rd, f));
  const Q = JSON.parse(fs.readFileSync(qa, 'utf8')), AVJ = JSON.parse(fs.readFileSync(av, 'utf8'));
  r.rounds.push({ n, at: new Date().toISOString(), sceneHash: hash(src), qaHash: fhash(qa), avHash: fhash(av), measured: { ...Q.measured, qaFails: Q.fails.length, avFails: AVJ.fails.length, av: AVJ.notes },
    checks: Object.fromEntries(list.map(([id, name]) => [id, { name, status: '', evidence: '', proof: [], fix: '' }])) });
  save(r);
  console.log(`round ${n}/${r.minRounds} snapshot → ${rd}/ · put your proof files there (crops, strips, grabs), then fill round ${n} in ${file}`);
  process.exit(0);
}
if (!args.includes('--verify')) { console.error('pass --init, --round or --verify'); process.exit(1); }

const fails = [];
if (!fs.existsSync(file)) { console.log(`REVIEW FAIL — no ${file}; run --init and do the ${effort} review`); process.exit(1); }
const r = load(), R = r.rounds;
if (tierOf(r.effort) !== effort) fails.push(`review.json is for "${r.effort}" but the scene's effort is "${effort}" — re-init`);
if (R.length < T.rounds) fails.push(`${R.length} round(s) — ${effort} needs ≥ ${T.rounds} full rounds, each a fresh render`);
const vague = /^(ok|pass|good|fine|done|checked|looks good|all good|yes|n\/a|na|-|same|same as before|no change|unchanged|still good)\.?$/i;
const located = /(\d+(\.\d+)?\s*s\b|@\s*\d|\bf\d+|frame|shot\s*\d|\d+\s*(ms|db|lufs|%|cm|°|wpm|fps|px))/i;
const fixWords = /(tweak|minor|small|adjust(ed)? things|various|some fixes|polish(ed)?|improv(ed|ements?)|cleaned up)\.?$/i;
R.forEach((rd, i) => {
  const before = R[i - 1], rdir = path.join(dir, 'r' + (i + 1));
  if (!fs.existsSync(path.join(rdir, 'scene.html'))) fails.push(`round ${i + 1}: no snapshot — rounds must be created with --round`);
  if (!rd.measured) fails.push(`round ${i + 1}: no measurements — it was made by the old gate; redo the round`);
  else if (i === R.length - 1 && (rd.measured.qaFails || rd.measured.avFails)) fails.push(`round ${i + 1}: the last round still had ${rd.measured.qaFails} qa_check + ${rd.measured.avFails} av_check failures when it started — the final round must start from a clean automatic pass`);
  if (!fs.existsSync(path.join(rdir, 'hands.jpg')) && !fs.existsSync(path.join(rdir, 'hands.png')) && rd.measured?.handCrops) fails.push(`round ${i + 1}: hands sheet missing from the snapshot`);
  if (before) {
    const nFail = Object.values(before.checks).filter((c) => c.status === 'FAIL').length;
    if (nFail) {
      const a = fs.existsSync(path.join(dir, 'r' + i, 'scene.html')) ? fs.readFileSync(path.join(dir, 'r' + i, 'scene.html'), 'utf8') : '';
      const b = fs.existsSync(path.join(rdir, 'scene.html')) ? fs.readFileSync(path.join(rdir, 'scene.html'), 'utf8') : '';
      const d = changed(a, b); if (d < nFail * 2) fails.push(`round ${i}→${i + 1}: ${nFail} FAILs but only ${d} scene line(s) changed — the fixes were not really made`);
    }
  }
  const AUTO = /^(scene\.html|qa\.json|av\.json|sheet\.jpg|hands\.jpg|wave\.png)$/, seen = new Set();
  for (let k = 1; k <= i; k++) { const d = path.join(dir, 'r' + k); if (fs.existsSync(d)) for (const f of fs.readdirSync(d)) if (!AUTO.test(f)) seen.add(fhash(path.join(d, f))); }
  let nf = 0;
  for (const [id] of list) {
    const c = rd.checks?.[id], where = `round ${i + 1} ${id}`;
    if (!c || !/^(PASS|FAIL)$/.test(c.status)) { fails.push(`${where}: no PASS/FAIL`); continue; }
    if (c.status === 'FAIL') nf++;
    const ev = String(c.evidence || '').trim();
    if (ev.length < 40 || vague.test(ev) || !located.test(ev)) fails.push(`${where}: evidence too thin ("${ev.slice(0, 40)}") — what you measured/looked at, where (shot/time/frame) and the value`);
    const pb = before?.checks?.[id];
    if (pb && norm(pb.evidence) === norm(ev)) fails.push(`${where}: evidence copied from round ${i} — look again at THIS render and write what you see now`);
    const proof = [].concat(c.proof || []);
    if (!proof.some((p) => !AUTO.test(path.basename(p))) && id !== 'C01') fails.push(`${where}: no proof of your own — save the crop/strip/frame grab/listening note you judged from into r${i + 1}/ and list it (the auto snapshot files don't count)`);
    for (const p of proof) {
      const fp = path.join(dir, p);
      if (!p.startsWith('r' + (i + 1) + '/')) { fails.push(`${where}: proof "${p}" is not in this round's folder r${i + 1}/`); continue; }
      if (!fs.existsSync(fp) || !fs.statSync(fp).size) { fails.push(`${where}: proof "${p}" does not exist`); continue; }
      if (AUTO.test(path.basename(p))) continue;
      if (seen.has(fhash(fp))) fails.push(`${where}: proof "${p}" is a copy of an earlier round's file — capture it again from THIS render`);
      if (fs.statSync(fp).mtimeMs < Date.parse(rd.at) - 1000) fails.push(`${where}: proof "${p}" was made before round ${i + 1} started`);
    }
    if (c.status === 'FAIL') {
      const fx = String(c.fix || '').trim();
      if (fx.length < 30 || fixWords.test(fx)) fails.push(`${where}: fix "${fx.slice(0, 40)}" is not a fix — name exactly what changed (which shot/key/value, from → to)`);
      if (i === R.length - 1) fails.push(`${where}: still FAIL in the last round — fix it, re-render, new round`);
    }
  }
  if (i === 0 && nf < FIRST_FAILS) fails.push(`round 1 found only ${nf} problem(s) — ${effort} round 1 must find and fix ≥ ${FIRST_FAILS}; no first draft is that clean, look harder`);
});
const lastR = R.at(-1);
if (lastR && lastR.sceneHash !== hash(src)) fails.push('the scene changed after the last round — every edit needs a fresh render + a full round');
for (const [p, n] of [[qa, 'qa_check'], [av, 'av_check']]) {
  if (!fs.existsSync(p)) { fails.push(`${n} report missing (${p}) — run it`); continue; }
  const J = JSON.parse(fs.readFileSync(p, 'utf8')); if (!J.pass) fails.push(`${n} last result is FAIL`);
  if (n === 'qa_check' && (!J.measured || tierOf(J.effort) !== effort)) fails.push(`qa_check must be the current version run at the scene's effort ("${effort}") — it measures every frame and crops every hand`);
  if (mt(p) < mt(input)) fails.push(`${n} is older than the last scene edit — run it again`);
}
const totalFix = R.reduce((s, x) => s + Object.values(x.checks).filter((c) => c.status === 'FAIL').length, 0);
console.log(fails.length ? `REVIEW FAIL (${fails.length}) — ${effort}: ${list.length} checks × ≥${T.rounds} rounds:\n- ` + fails.slice(0, 80).join('\n- ')
  : `REVIEW PASS · ${effort} · ${list.length} checks × ${R.length} rounds · ${totalFix} problems found and fixed`);
process.exit(fails.length ? 1 : 0);
