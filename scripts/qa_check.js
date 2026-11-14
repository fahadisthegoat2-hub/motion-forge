#!/usr/bin/env node
// Automatic QA for a scene — run it on EVERY video before showing anything to the user. Exit code 1 = must fix.
// Checks: page errors · missing clips/effects/models · length vs the requested length · feet floating/sinking · hands missing their
// reach targets · sound effects with nothing on screen / too dense · a contact sheet of every shot to look at.
// Usage: node qa_check.js scene.html [--target <seconds>] [--out dir]
const { launchBrowser, ffmpeg, startStaticServer, routeAssets } = require('./lib/deps');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2), opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const input = args.find((a, i) => !a.startsWith('--') && !(args[i - 1] || '').match(/^--(target|out)$/));
if (!input) { console.error('usage: qa_check.js scene.html [--target seconds] [--out dir]'); process.exit(1); }
const out = opt('--out') || input.replace(/\.html?$/, '') + '_qa'; fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await launchBrowser(), page = await browser.newPage(), errs = [], warns = [], fails = [], notes = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { const t = m.text(); if (/missing|unknown fx|failed|not found/i.test(t) && !/favicon|ERR_FAILED|fonts|Failed to load resource/i.test(t)) warns.push(t); });
  await routeAssets(page); const server = await startStaticServer();
  await page.setViewportSize({ width: 270, height: 480 });
  await page.goto(server.origin + path.resolve(input) + '?fast=1');
  await page.waitForFunction(() => window.__mf && window.__mfReady !== false, null, { timeout: 900000, polling: 1000 });
  await page.evaluate(() => { document.getElementById('mf-panel')?.remove(); window.__mfManual = true; window.__mf.setSize(270, 480); });
  const info = await page.evaluate(() => ({ dur: __mf.duration, target: __mfDebug.pacing().target, shots: __mfDebug.shots() }));
  const target = +(opt('--target') || info.target || 0);
  if (target && Math.abs(info.dur - target) / target > 0.05) fails.push(`LENGTH: video is ${info.dur.toFixed(1)}s but ${target}s was asked (must be within 5%)`);
  const frames = [];
  for (const sh of info.shots) {
    for (const f of [0.2, 0.5, 0.85]) {
      const t = sh.start + sh.dur * f, r = await page.evaluate((t) => __mfDebug.probe(t), t);
      if (f === 0.5) { const p = path.join(out, `shot${String(sh.i).padStart(3, '0')}.png`); await page.locator('canvas').first().screenshot({ path: p }); frames.push(p);
        for (const c of r.chars) if (c.face) { try { const o = require('child_process').spawnSync(ffmpeg(), ['-hide_banner', '-i', p, '-vf', `crop=iw*0.12:iw*0.12:iw*${Math.max(0, c.face[0] - 0.06)}:ih*${Math.max(0, c.face[1] - 0.04)},signalstats,metadata=print`, '-f', 'null', '-']).stderr.toString(), y = +((o.match(/YAVG=([\d.]+)/) || [])[1] || 128);
          if (y < 45) fails.push(`LIGHT: shot ${sh.i + 1} "${sh.name}" ${c.id}'s face is too dark (${y.toFixed(0)}/255) — add a key/rim light or change the look`); if (y > 225) fails.push(`LIGHT: shot ${sh.i + 1} "${sh.name}" ${c.id}'s face is blown out (${y.toFixed(0)}/255)`); } catch {} } }
      for (const c of r.chars) {
        const where = `shot ${sh.i + 1} "${sh.name}" @${t.toFixed(1)}s ${c.id}`;
        if (c.face && c.face[1] < 0.1) fails.push(`FRAMING: ${where} face is cut off at the top of the frame — wider size or lower camera`);
        if (c.face) for (const T of r.titles || []) if (Math.abs(T.pos[0] - c.face[0]) < 0.3 && Math.abs(T.pos[1] - c.face[1]) < 0.09) fails.push(`FRAMING: ${where} a ${T.style || 'slam'} title covers the face — move it to the top 25% or the other side`);
        for (const m of c.missing) fails.push(`CLIP: ${where} uses "${m}" which doesn't exist (see SCENE_API clip list)`);
        if (c.footY !== null && !c.airborne && c.footY > 0.14) fails.push(`FEET: ${where} floats ${(c.footY * 100).toFixed(0)} cm above the ground`);
        if (c.footY !== null && c.footY < -0.06) fails.push(`FEET: ${where} sinks ${(-c.footY * 100).toFixed(0)} cm into the ground`);
        for (const R of c.reach) if (R.err > 0.08) fails.push(`HANDS: ${where} hand is ${(R.err * 100).toFixed(0)} cm from ${JSON.stringify(R.to)} (move the target or the character closer)`);
      }
    }
  }
  const P = await page.evaluate(() => __mfDebug.pacing());
  if (P.portrait) {   // SHORTS retention rules
    const first = Math.min(P.firstCaption ?? 99, P.firstTitle ?? 99);
    if (first > 0.3) fails.push(`HOOK: no words on screen until ${first === 99 ? "never" : first.toFixed(1) + "s"} — the hook line/title must be on screen by 0.3s`);
    if (P.durs[0] > 2.0) fails.push(`HOOK: first shot lasts ${P.durs[0]}s — the hook shot must be ≤ 2s`);
    if (!P.beats.some((b) => b <= 0.15)) fails.push("HOOK: nothing hits on frame 1 (sound, title or effect at 0s)");
    const avg = P.durs.reduce((x, y) => x + y, 0) / P.durs.length; if (avg > 2.4) fails.push(`PACING: average shot is ${avg.toFixed(1)}s — shorts need ≤ 2.4s (new angle every 2–3s)`);
    P.durs.forEach((d, i) => { if (d > 4 && !P.holds[i]) fails.push(`PACING: shot ${i + 1} lasts ${d}s (> 4s) — cut it or add beats (mark hold: true only for a deliberate hold)`); });
    for (let i = 1; i < P.beats.length; i++) if (P.beats[i] - P.beats[i - 1] > 2.6) fails.push(`PACING: dead stretch ${P.beats[i - 1].toFixed(1)}–${P.beats[i].toFixed(1)}s with no cut, title, caption, effect or hit (max 3s)`);
    if (P.beats.length && P.total - P.beats.at(-1) > 3) fails.push(`PACING: last ${(P.total - P.beats.at(-1)).toFixed(1)}s have no beat`);
    if (!P.voice && P.capCov < 0.8) fails.push(`STORY: no voiceover and captions cover only ${Math.round(P.capCov * 100)}% — a short needs a voice or wall-to-wall captions`);
    if (!target && (P.total < 25 || P.total > 35)) fails.push(`LENGTH: short is ${P.total.toFixed(1)}s — shorts are 25–35s unless Sir asked otherwise`);
    if (!P.payoffFirst) fails.push('HOOK: shot 1 must show the payoff/twist image first (mark it role: "payoff"), then rewind');
    if (P.staticOpen) fails.push('HOOK: the first second is static — camera and subject must move on frame 1');
    if (!P.question) fails.push('ENGAGEMENT: no comment question in the last captions (e.g. "Would you have survived?")');
  }
  const snd = await page.evaluate(() => { const S = window.__mfDebug; try { return (window.collectSoundForQA?.() || null); } catch { return null; } });
  await browser.close(); server.close();
  for (const e of errs) fails.push('ERROR: ' + e);
  for (const w of [...new Set(warns)]) fails.push('ASSET: ' + w);
  // contact sheet: every shot's middle frame, in order
  const sheet = path.join(out, 'sheet.jpg'), cols = Math.min(8, frames.length), inputs = frames.flatMap((f) => ['-i', f]);
  if (frames.length > 1) {
    const rows = Math.ceil(frames.length / cols), pads = cols * rows - frames.length, all = [...frames];
    const fil = all.map((_, i) => `[${i}]scale=180:-1[s${i}]`).join(';') + ';' + all.map((_, i) => `[s${i}]`).join('') + `xstack=inputs=${all.length}:layout=` + all.map((_, i) => `${(i % cols) * 180}_${Math.floor(i / cols) * 320}`).join('|') + ':fill=black';
    try { execFileSync(ffmpeg(), ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', fil, sheet]); } catch { notes.push('contact sheet failed'); }
  }
  for (const [i, f] of frames.entries()) {   // lighting: too dark / blown out
    try { const o = execFileSync(ffmpeg(), ["-hide_banner", "-i", f, "-vf", "signalstats,metadata=print", "-f", "null", "-"], { stdio: ["ignore", "pipe", "pipe"] }).toString(); } catch (e) {}
    try { const o = require("child_process").spawnSync(ffmpeg(), ["-hide_banner", "-i", f, "-vf", "signalstats,metadata=print", "-f", "null", "-"]).stderr.toString(), y = +((o.match(/YAVG=([\d.]+)/) || [])[1] || 128);
      if (y < 38) fails.push(`LIGHT: shot ${i + 1} "${info.shots[i].name}" is too dark (avg ${y.toFixed(0)}/255)`); if (y > 215) fails.push(`LIGHT: shot ${i + 1} "${info.shots[i].name}" is blown out (avg ${y.toFixed(0)}/255)`); } catch {}
  }
  const rep = { scene: input, duration: +info.dur.toFixed(2), shots: info.shots.length, pass: fails.length === 0, fails, notes, sheet };
  fs.writeFileSync(path.join(out, 'qa.json'), JSON.stringify(rep, null, 1));
  console.log(rep.pass ? `QA PASS · ${info.shots.length} shots · ${info.dur.toFixed(1)}s · now LOOK at ${sheet} (every shot) before delivering` : `QA FAIL (${fails.length}) — fix all, then run again:\n- ` + fails.slice(0, 60).join('\n- '));
  process.exit(rep.pass ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
