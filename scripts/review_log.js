#!/usr/bin/env node
// The effort-level gate. Every review round is logged per check with real evidence; nothing ships until --verify passes.
//   node review_log.js scene.html --init                 → <scene>_qa/review.json for the scene's CONFIG.effort (prints the checks)
//   node review_log.js scene.html --round                → appends an empty round (every check of the tier: status + evidence) to fill in
//   node review_log.js scene.html --verify               → exit 1 unless: enough rounds · every check of the tier logged each round with
//                                                           evidence (times/frames/values) · last round all PASS · qa.json + av.json PASS and
//                                                           newer than the scene · every FAIL in a round has a fix noted
// Evidence must say WHAT was looked at and WHERE (e.g. "shot 4 @12.3s f370: R hand on cup, 1 cm"), never just "ok".
const { TIERS, tierOf, checksFor } = require('./lib/review_checks');
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2), input = args.find((a) => !a.startsWith('--'));
if (!input) { console.error('usage: review_log.js scene.html --init | --round | --verify [--effort standard|high|maximum]'); process.exit(1); }
const dir = input.replace(/\.html?$/, '') + '_qa', file = path.join(dir, 'review.json'); fs.mkdirSync(dir, { recursive: true });
const src = fs.readFileSync(input, 'utf8'), ei = args.indexOf('--effort');
const effort = tierOf(ei >= 0 ? args[ei + 1] : (src.match(/\beffort\s*:\s*['"](\w+)['"]/) || [])[1]);
const T = TIERS[effort], list = checksFor(effort);
const blank = () => ({ at: new Date().toISOString(), checks: Object.fromEntries(list.map(([id, name]) => [id, { name, status: '', evidence: '', fix: '' }])) });
const load = () => JSON.parse(fs.readFileSync(file, 'utf8'));

if (args.includes('--init')) {
  if (!/\beffort\s*:/.test(src)) console.log(`note: CONFIG.effort not set in ${input} — using "${effort}". Set CONFIG.effort to Sir's answer.`);
  const r = { scene: input, effort, minRounds: T.rounds, checks: list.map(([id]) => id), rounds: [blank()] };
  fs.writeFileSync(file, JSON.stringify(r, null, 1));
  console.log(`${effort.toUpperCase()}: ${list.length} checks × ≥${T.rounds} rounds → ${file}\n` + list.map(([id, n]) => `${id} ${n}`).join('\n') + '\nFull method for each: skills/quality-review/SKILL.md');
  process.exit(0);
}
if (args.includes('--round')) { const r = load(); r.rounds.push(blank()); fs.writeFileSync(file, JSON.stringify(r, null, 1)); console.log(`round ${r.rounds.length}/${r.minRounds} added → ${file}`); process.exit(0); }
if (!args.includes('--verify')) { console.error('pass --init, --round or --verify'); process.exit(1); }

const fails = [];
if (!fs.existsSync(file)) { console.log(`REVIEW FAIL — no ${file}; run --init and do the ${effort} review`); process.exit(1); }
const r = load(), mt = (p) => fs.existsSync(p) ? fs.statSync(p).mtimeMs : 0, sceneT = mt(input);
if (tierOf(r.effort) !== effort) fails.push(`review.json is for "${r.effort}" but the scene's effort is "${effort}" — re-init`);
if (r.rounds.length < T.rounds) fails.push(`${r.rounds.length} round(s) logged — ${effort} needs ≥ ${T.rounds} full rounds`);
const vague = /^(ok|pass|good|fine|done|checked|looks good|all good|yes|n\/a|na|-)\.?$/i, located = /(\d+(\.\d+)?\s*s\b|@\s*\d|\bf\d+|frame|shot\s*\d|\d+\s*(ms|db|lufs|%|cm|°|wpm|fps|px))/i;
r.rounds.forEach((rd, i) => {
  for (const [id] of list) {
    const c = rd.checks?.[id], where = `round ${i + 1} ${id}`;
    if (!c || !/^(PASS|FAIL)$/.test(c.status)) { fails.push(`${where}: no PASS/FAIL`); continue; }
    const ev = String(c.evidence || '').trim();
    if (ev.length < 25 || vague.test(ev) || !located.test(ev)) fails.push(`${where}: evidence too thin ("${ev.slice(0, 40)}") — say what you measured/looked at and where (time, frame, shot, value)`);
    if (c.status === 'FAIL' && String(c.fix || '').trim().length < 10) fails.push(`${where}: FAIL with no fix noted`);
    if (c.status === 'FAIL' && i === r.rounds.length - 1) fails.push(`${where}: still FAIL in the last round — fix and run another round`);
  }
});
const rt = r.rounds.map((x) => Date.parse(x.at) || 0); for (let i = 1; i < rt.length; i++) if (rt[i] - rt[i - 1] < 60000) fails.push(`round ${i + 1} started < 1 min after round ${i} — a round is render → look → fix → re-render, not a copy`);
const qa = path.join(dir, 'qa.json'), av = path.join(dir, 'av.json');
for (const [p, n] of [[qa, 'qa_check'], [av, 'av_check']]) {
  if (!fs.existsSync(p)) { fails.push(`${n} report missing (${p}) — run it`); continue; }
  if (!JSON.parse(fs.readFileSync(p, 'utf8')).pass) fails.push(`${n} last result is FAIL`);
  if (mt(p) < sceneT) fails.push(`${n} is older than the last scene edit — run it again`);
}
console.log(fails.length ? `REVIEW FAIL (${fails.length}) — ${effort}: ${list.length} checks × ≥${T.rounds} rounds:\n- ` + fails.slice(0, 80).join('\n- ') : `REVIEW PASS · ${effort} · ${list.length} checks × ${r.rounds.length} rounds`);
process.exit(fails.length ? 1 : 0);
