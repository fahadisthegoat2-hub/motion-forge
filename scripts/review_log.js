#!/usr/bin/env node
// The effort-level gate. It proves WORK, not ticks: every round is a fresh render snapshot, every check needs proof files made in that
// round, every FAIL needs a real fix in the scene, and copy-pasted rounds are rejected. Nothing ships until --verify passes.
//   node review_log.js scene.html --init     → <scene>_qa/review.json for the scene's CONFIG.effort (prints the checks)
//   node review_log.js scene.html --round    → snapshots the CURRENT render into <scene>_qa/rN/ (scene + qa.json + av.json + sheet + wave);
//                                               refuses unless qa_check + av_check were re-run on the current scene after the last round.
//                                               Then put your own proof in rN/ (crops, motion strips, frame grabs, notes) and fill the round.
//   node review_log.js scene.html --check C05 --status PASS|FAIL --evidence "…" --proof r1/a.png [--fix "…"]   → fill one check (safe: valid JSON, normalised ids/paths)
//   node review_log.js scene.html --status   → the counter: what is counted per round and what is still open
//   node review_log.js scene.html --verify   → exit 1 unless every rule below holds
// Per check, per round: status PASS/FAIL · evidence (what + where + value) · proof: ["rN/file.png", …] (files that exist in THIS round's
// folder and differ from last round's) · fix (what you changed, for every FAIL).
const { TIERS, tierOf, checksFor, sceneHash } = require('./lib/review_checks');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const args = process.argv.slice(2), VAL = /^--(effort|check|status|evidence|proof|fix|round-n)$/;
const input = args.find((a, i) => !a.startsWith('--') && !VAL.test(args[i - 1] || ''));
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
if (!input) { console.error('usage: review_log.js scene.html --init | --round | --check C05 --status PASS|FAIL --evidence "…" --proof r1/a.png[,r1/b.png] [--fix "…"] | --status | --verify [--effort standard|high|maximum]'); process.exit(1); }
if (!fs.existsSync(input)) { console.error(`scene not found: ${input}`); process.exit(1); }
const dir = input.replace(/\.html?$/, '') + '_qa', file = path.join(dir, 'review.json'); fs.mkdirSync(dir, { recursive: true });
const src = fs.readFileSync(input, 'utf8');
// CONFIG.effort is read from the DIRECTION block only (the engine below it also says "effort"); any wording works ("Maximum (35 checks × 6 rounds)")
const cfg = (() => { const a = src.indexOf('const CONFIG = {'), b = src.indexOf('END DIRECTION'); return a >= 0 ? src.slice(a, b > a ? b : a + 6000) : src; })();
const effort = tierOf(opt('--effort') || (cfg.match(/\beffort['"]?\s*[:=]\s*['"`]([^'"`]+)['"`]/) || [])[1]);
const T = TIERS[effort], list = checksFor(effort);
const MIN_FOUND = { standard: 3, high: 6, maximum: 10 }[effort];   // a real review finds real problems — counted over ALL rounds, so it is never unreachable
const hash = (b) => crypto.createHash('sha1').update(b).digest('hex').slice(0, 16), fhash = (p) => hash(fs.readFileSync(p));
const mt = (p) => fs.existsSync(p) ? fs.statSync(p).mtimeMs : 0;
const load = () => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { console.log(`REVIEW FAIL — ${file} is not valid JSON (${e.message}). Fix the syntax, or fill checks with --check so the file is always valid.`); process.exit(1); } };
const save = (r) => fs.writeFileSync(file, JSON.stringify(r, null, 1));
const changed = (a, b) => {   // lines added + removed between two scene versions
  const A = a.split('\n'), B = b.split('\n'), m = new Map(); A.forEach((l) => m.set(l, (m.get(l) || 0) + 1)); let add = 0;
  for (const l of B) { const n = m.get(l) || 0; if (n) m.set(l, n - 1); else add++; } return add + [...m.values()].reduce((x, y) => x + y, 0);
};
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9.]+/g, ' ').trim();
const statusOf = (c) => { const s = String(c?.status ?? '').trim().toUpperCase(); return /^(PASS|PASSED|OK|✓|TRUE)$/.test(s) ? 'PASS' : /^(FAIL|FAILED|✗|FALSE)$/.test(s) ? 'FAIL' : ''; };
const getCheck = (rd, id) => { const C = rd.checks || {}; if (Array.isArray(C)) return C.find((c) => String(c.id || '').toUpperCase() === id); return C[id] || C[id.toLowerCase()] || C['C' + +id.slice(1)]; };
const proofsOf = (c) => [].concat(c?.proof ?? []).flatMap((p) => typeof p === 'string' ? p.split(/\s*,\s*/) : [p?.file || p?.path || '']).map((p) => String(p).trim()).filter(Boolean);
// a proof may be written as "r2/x.png", "scene_qa/r2/x.png", "./r2/x.png", an absolute path or just "x.png" — all mean the same file
const proofRel = (p, n) => { p = String(p).replace(/\\/g, '/'); const m = p.match(/(?:^|\/)(r\d+\/[^/].*)$/); if (m) return m[1]; const b = path.basename(p); return fs.existsSync(path.join(dir, 'r' + n, b)) ? `r${n}/${b}` : p; };
const AUTO = /^(scene\.html|qa\.json|av\.json|sheet\.jpg|wave\.png)$/;
const qa = path.join(dir, 'qa.json'), av = path.join(dir, 'av.json');
// a report is fresh when it was made from exactly this scene (hash recorded by qa_check / render_video+av_check); old reports fall back to file times
const stale = (p) => { let rep = {}; try { rep = JSON.parse(fs.readFileSync(p, 'utf8')); } catch {} return rep.sceneHash ? rep.sceneHash !== hash(src) : mt(p) < mt(input) - 2000; };

if (args.includes('--init')) {
  if (fs.existsSync(file) && !args.includes('--force')) { const old = load(); if (old.rounds?.length && tierOf(old.effort) === effort) { console.log(`review already started (${old.rounds.length} round(s)) — kept. Use --init --force to start over.`); process.exit(0); } }
  if (!/\beffort['"]?\s*[:=]/.test(cfg)) console.log(`note: CONFIG.effort not set in ${input} — using "${effort}". Set CONFIG.effort to Sir's answer.`);
  save({ scene: input, effort, minRounds: T.rounds, minProblemsFound: MIN_FOUND, checks: list.map(([id]) => id), rounds: [] });
  console.log(`${effort.toUpperCase()}: ${list.length} checks × ≥${T.rounds} rounds · the review must find and fix ≥${MIN_FOUND} real problems in total → ${file}\n` +
    list.map(([id, n]) => `${id} ${n}`).join('\n') + '\nNext: qa_check + render + av_check --out ' + dir + ', then --round. Method per check: skills/quality-review/SKILL.md');
  process.exit(0);
}
if (!fs.existsSync(file)) { console.log(`REVIEW FAIL — no ${file}; run --init and do the ${effort} review`); process.exit(1); }
if (args.includes('--round')) {
  const r = load(), prev = r.rounds.at(-1), err = [];
  for (const [p, n] of [[qa, 'qa_check'], [av, 'av_check']]) {
    if (!fs.existsSync(p)) err.push(`${n} has not been run (${p} missing${n === 'av_check' ? ' — pass --out ' + dir : ''})`);
    else if (stale(p)) err.push(`${n} was run on an older version of the scene — re-render and re-run it on the current one`);
  }
  if (prev && prev.sceneHash === hash(src) && list.some(([id]) => statusOf(getCheck(prev, id)) === 'FAIL')) err.push(`round ${r.rounds.length} has FAILs but the scene is unchanged — fix them first`);
  if (prev) { const open = list.filter(([id]) => !statusOf(getCheck(prev, id))).map(([id]) => id); if (open.length) err.push(`round ${r.rounds.length} is not filled in yet: ${open.join(' ')}`); }
  if (err.length) { console.log('ROUND REFUSED:\n- ' + err.join('\n- ')); process.exit(1); }
  const n = r.rounds.length + 1, rd = path.join(dir, 'r' + n); fs.mkdirSync(rd, { recursive: true });
  fs.copyFileSync(input, path.join(rd, 'scene.html'));
  for (const f of ['qa.json', 'av.json', 'sheet.jpg', 'wave.png']) if (fs.existsSync(path.join(dir, f))) fs.copyFileSync(path.join(dir, f), path.join(rd, f));
  r.rounds.push({ n, at: new Date().toISOString(), sceneHash: hash(src), qaHash: fhash(qa), avHash: fhash(av),
    checks: Object.fromEntries(list.map(([id, name]) => [id, { name, status: '', evidence: '', proof: [], fix: '' }])) });
  save(r);
  console.log(`round ${n}/${r.minRounds} snapshot → ${rd}/ · put your proof files there (crops, strips, grabs), then fill every check:\n  review_log.js ${input} --check C02 --status PASS --evidence "…" --proof r${n}/file.png`);
  process.exit(0);
}
if (args.includes('--check')) {   // fill one check of the current (or --round-n) round — always valid JSON, ids/status/paths normalised
  const r = load(), n = +(opt('--round-n') || r.rounds.length), rd = r.rounds[n - 1];
  const id = (() => { const m = String(opt('--check') || '').toUpperCase().match(/^C?(\d+)$/); return m ? 'C' + m[1].padStart(2, '0') : ''; })();
  if (!rd) { console.log('no round yet — run --round first'); process.exit(1); }
  const entry = list.find(([x]) => x === id); if (!entry) { console.log(`unknown check "${opt('--check')}" for ${effort} (${list[0][0]}–${list.at(-1)[0]})`); process.exit(1); }
  const si = args.indexOf('--status', args.indexOf('--check')), st = statusOf({ status: si >= 0 ? args[si + 1] : '' });
  if (!st) { console.log('--status PASS or FAIL is required'); process.exit(1); }
  const c = (rd.checks[id] ??= { name: entry[1] }); c.status = st;
  if (opt('--evidence') !== undefined) c.evidence = opt('--evidence');
  if (opt('--proof') !== undefined) c.proof = opt('--proof').split(',').map((p) => proofRel(p.trim(), n)).filter(Boolean);
  if (opt('--fix') !== undefined) c.fix = opt('--fix');
  save(r); const done = list.filter(([x]) => statusOf(getCheck(rd, x))).length;
  console.log(`round ${n} ${id} ${st} saved · ${done}/${list.length} checks filled`);
  process.exit(0);
}

const fails = [], r = load(), R = r.rounds || [], tally = [];
if (tierOf(r.effort) !== effort) fails.push(`review.json is for "${r.effort}" but the scene's effort is "${effort}" — re-init`);
if (R.length < T.rounds) fails.push(`${R.length} round(s) — ${effort} needs ≥ ${T.rounds} full rounds`);
const vague = /^(ok|pass|good|fine|done|checked|looks good|all good|yes|n\/a|na|-|same|same as before|no change|unchanged|still good)\.?$/i;
const located = /(\d|frame|shot|every|all\b|none\b|no\s)/i;   // names a place or a value
const vagueFix = /^(tweak(s|ed)?|minor( tweaks| fixes)?|small( fixes)?|adjust(ed)? things|various( fixes)?|some fixes|polish(ed)?|improv(ed|ements?)|cleaned up|fixed( it)?)\.?$/i;
R.forEach((rd, i) => {
  const before = R[i - 1], n = i + 1, rdir = path.join(dir, 'r' + n), startFails = fails.length;
  if (!fs.existsSync(path.join(rdir, 'scene.html'))) fails.push(`round ${n}: no snapshot — rounds must be created with --round`);
  if (before) {
    const nFail = list.filter(([id]) => statusOf(getCheck(before, id)) === 'FAIL').length;
    if (nFail) {
      const rf = (k) => { const p = path.join(dir, 'r' + k, 'scene.html'); return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : ''; };
      if (changed(rf(i), rf(n)) < 1) fails.push(`round ${i}→${n}: ${nFail} FAILs but the scene did not change — the fixes were not made`);
    }
  }
  const seen = new Set();
  for (let k = 1; k <= i; k++) { const d = path.join(dir, 'r' + k); if (fs.existsSync(d)) for (const f of fs.readdirSync(d)) if (!AUTO.test(f) && fs.statSync(path.join(d, f)).isFile()) seen.add(fhash(path.join(d, f))); }
  const sinceT = before ? Date.parse(before.at) : 0;   // proof must come from this round's render: made after the previous round was opened
  let nf = 0, counted = 0, copied = 0;
  for (const [id] of list) {
    const c = getCheck(rd, id), where = `round ${n} ${id}`, st = statusOf(c), f0 = fails.length;
    if (!st) { fails.push(`${where}: no PASS/FAIL`); continue; }
    if (st === 'FAIL') nf++;
    const ev = String(c.evidence || '').trim();
    if (ev.length < 20 || vague.test(ev) || !located.test(ev)) fails.push(`${where}: evidence too thin ("${ev.slice(0, 40)}") — what you measured/looked at, where (shot/time/frame) and the value`);
    const pb = before && getCheck(before, id);
    if (pb && norm(pb.evidence) === norm(ev)) copied++;
    const proof = proofsOf(c).map((p) => proofRel(p, n));
    if (!proof.some((p) => !AUTO.test(path.basename(p))) && id !== 'C01') fails.push(`${where}: no proof file listed — save the crop/strip/frame grab/listening note you judged from into r${n}/ and list it (the auto snapshot files don't count)`);
    for (const p of proof) {
      const fp = path.join(dir, p);
      if (!p.startsWith('r' + n + '/')) { fails.push(`${where}: proof "${p}" is not in this round's folder r${n}/`); continue; }
      if (!fs.existsSync(fp) || !fs.statSync(fp).size) { fails.push(`${where}: proof "${p}" does not exist (looked for ${fp})`); continue; }
      if (AUTO.test(path.basename(p))) continue;
      // an unchanged shot renders the same picture again — that is fine; only a check that FAILED last round must show a new picture
      if (pb && statusOf(pb) === 'FAIL' && seen.has(fhash(fp))) fails.push(`${where}: this check failed in round ${i} but proof "${p}" is identical to an earlier file — capture it again from the fixed render`);
      if (sinceT && fs.statSync(fp).mtimeMs < sinceT - 1000) fails.push(`${where}: proof "${p}" is older than round ${i} — capture it from this round's render`);
    }
    if (st === 'FAIL') {
      const fx = String(c.fix || '').trim();
      if (fx.length < 15 || vagueFix.test(fx)) fails.push(`${where}: fix "${fx.slice(0, 40)}" is not a fix — name exactly what changed (which shot/key/value, from → to)`);
      if (i === R.length - 1) fails.push(`${where}: still FAIL in the last round — fix it, re-render, new round`);
    }
    if (fails.length === f0) counted++;
  }
  // measurements legitimately repeat (length, loudness…); a round that repeats most of the previous one word for word was not looked at
  if (before && rd.sceneHash !== before.sceneHash && copied > list.length * 0.6) fails.push(`round ${n}: ${copied}/${list.length} evidence texts are copied from round ${i} although the scene changed — look at THIS render`);
  tally.push(`round ${n}: ${counted}/${list.length} counted${nf ? ` · ${nf} FAIL` : ''}${fails.length > startFails ? ` · ${fails.length - startFails} issue(s)` : ''}`);
});
const totalFix = R.reduce((s, x) => s + list.filter(([id]) => statusOf(getCheck(x, id)) === 'FAIL').length, 0);
if (args.includes('--status') && !args.includes('--check')) {
  console.log(`${effort.toUpperCase()} · ${list.length} checks × ≥${T.rounds} rounds · ${R.length} round(s) logged · ${totalFix}/${MIN_FOUND} problems found\n${tally.join('\n') || 'no rounds yet'}` + (fails.length ? '\nopen:\n- ' + fails.slice(0, 60).join('\n- ') : ''));
  process.exit(0);
}
if (!args.includes('--verify')) { console.error('pass --init, --round, --check, --status or --verify'); process.exit(1); }
if (R.length >= T.rounds && totalFix < MIN_FOUND) fails.push(`only ${totalFix} problem(s) found over ${R.length} rounds — a ${effort} review finds and fixes ≥ ${MIN_FOUND}; look harder (another round)`);
const lastR = R.at(-1);
if (lastR && lastR.sceneHash !== hash(src)) fails.push('the scene changed after the last round — every edit needs a fresh render + a full round');
for (const [p, n] of [[qa, 'qa_check'], [av, 'av_check']]) {
  if (!fs.existsSync(p)) { fails.push(`${n} report missing (${p}) — run it`); continue; }
  let rep = {}; try { rep = JSON.parse(fs.readFileSync(p, 'utf8')); } catch {}
  if (!rep.pass) fails.push(`${n} last result is FAIL`);
  if (stale(p)) fails.push(`${n} was run on an older version of the scene — run it again`);
}
console.log((tally.length ? tally.join('\n') + '\n' : '') + (fails.length ? `REVIEW FAIL (${fails.length}) — ${effort}: ${list.length} checks × ≥${T.rounds} rounds:\n- ` + fails.slice(0, 80).join('\n- ')
  : `REVIEW PASS · ${effort} · ${list.length} checks × ${R.length} rounds · ${totalFix} problems found and fixed`));
process.exit(fails.length ? 1 : 0);
