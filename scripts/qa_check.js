#!/usr/bin/env node
// Automatic QA for a scene — run it on EVERY video before showing anything to the user. Exit code 1 = must fix.
// Checks: page errors · missing clips/effects/models · length vs the requested length · feet floating/sinking · hands missing their
// reach targets · deformed wrists / hands inside the body · characters lip-syncing the narrator · sound effects with nothing on screen / too dense · a contact sheet of every shot to look at.
// Usage: node qa_check.js scene.html [--target <seconds>] [--out dir] [--effort standard|high|maximum]  (default: CONFIG.effort)
const { launchBrowser, ffmpeg, startStaticServer, routeAssets } = require('./lib/deps');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2), opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const input = args.find((a, i) => !a.startsWith('--') && !(args[i - 1] || '').match(/^--(target|out|effort)$/));
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
  const VW = await page.evaluate(() => ((__mf.width || 1080) >= (__mf.height || 1920) ? [480, 270] : [270, 480])), CW = VW[0] > VW[1] ? 320 : 180, CH = VW[0] > VW[1] ? 180 : 320;
  await page.setViewportSize({ width: VW[0], height: VW[1] });
  await page.evaluate(([w, h]) => { document.getElementById('mf-panel')?.remove(); window.__mfManual = true; window.__mf.setSize(w, h); }, VW);
  const info = await page.evaluate(() => ({ dur: __mf.duration, target: __mfDebug.pacing().target, effort: __mfDebug.pacing().effort, shots: __mfDebug.shots(), cam: __mfDebug.camMotion ? __mfDebug.camMotion() : [] }));
  // EFFORT = how hard the body/limb/hand/prop scan looks: standard every 0.25 s · high every 0.1 s · maximum EVERY FRAME (30 fps). Never 3 samples a shot.
  const STEP = { standard: 0.25, good: 0.25, high: 0.1, maximum: 1 / 30, max: 1 / 30 }[opt('--effort') || info.effort] ?? 0.25;
  const target = +(opt('--target') || info.target || 0);
  if (target && Math.abs(info.dur - target) / target > 0.05) fails.push(`LENGTH: video is ${info.dur.toFixed(1)}s but ${target}s was asked (must be within 5%)`);
  const frames = [], seenBody = new Set();
  for (const sh of info.shots) {
    const fs0 = [...new Set([0.5, ...Array.from({ length: Math.max(3, Math.ceil(sh.dur / STEP)) }, (_, k) => (k + 0.5) / Math.max(3, Math.ceil(sh.dur / STEP)))])].sort((a, b) => a - b);
    for (const f of fs0) {
      const t = sh.start + sh.dur * f, r = await page.evaluate((t) => __mfDebug.probe(t), t);
      if (f === 0.5) { const p = path.join(out, `shot${String(sh.i).padStart(3, '0')}.png`); await page.locator('canvas').first().screenshot({ path: p }); frames.push(p);
        for (const c of r.chars) if (c.face) { try { const o = require('child_process').spawnSync(ffmpeg(), ['-hide_banner', '-i', p, '-vf', `crop=iw*0.12:iw*0.12:iw*${Math.max(0, c.face[0] - 0.06)}:ih*${Math.max(0, c.face[1] - 0.04)},signalstats,metadata=print`, '-f', 'null', '-']).stderr.toString(), y = +((o.match(/YAVG=([\d.]+)/) || [])[1] || 128);
          if (y < 45) fails.push(`LIGHT: shot ${sh.i + 1} "${sh.name}" ${c.id}'s face is too dark (${y.toFixed(0)}/255) — add a key/rim light or change the look`); if (y > 225) fails.push(`LIGHT: shot ${sh.i + 1} "${sh.name}" ${c.id}'s face is blown out (${y.toFixed(0)}/255)`); } catch {} } }
      for (const c of await page.evaluate((t) => (__mfDebug.anatomy ? __mfDebug.anatomy(t) : []), t)) for (const p of c.problems) { const k = sh.i + c.id + p.replace(/[\d.]+°.*/, ''); if (!seenBody.has(k)) { seenBody.add(k); fails.push(`BODY: shot ${sh.i + 1} "${sh.name}" @${t.toFixed(1)}s ${c.id} — ${p} — a deformed body is never shipped: change the clip/gesture/custom keys`); } }
      for (const o of r.overlaps || []) fails.push(`OVERLAP: shot ${sh.i + 1} "${sh.name}" @${t.toFixed(1)}s ${o.a}'s ${o.part} is inside ${o.b} — bodies must never melt into each other; move them apart (pos) or change the pose`);
      for (const c of r.chars) {
        const where = `shot ${sh.i + 1} "${sh.name}" @${t.toFixed(1)}s ${c.id}`;
        if (c.face && c.face[1] < 0.1) fails.push(`FRAMING: ${where} face is cut off at the top of the frame — wider size or lower camera`);
        if (c.face) for (const T of r.titles || []) if (Math.abs(T.pos[0] - c.face[0]) < 0.3 && Math.abs(T.pos[1] - c.face[1]) < 0.09) fails.push(`FRAMING: ${where} a ${T.style || 'slam'} title covers the face — move it to the top 25% or the other side`);
        for (const m of c.missing) fails.push(`CLIP: ${where} uses "${m}" which doesn't exist (see SCENE_API clip list)`);
        if (c.footY !== null && !c.airborne && c.footY > 0.14) fails.push(`FEET: ${where} floats ${(c.footY * 100).toFixed(0)} cm above the ground`);
        if (c.footY !== null && c.footY < -0.06) fails.push(`FEET: ${where} sinks ${(-c.footY * 100).toFixed(0)} cm into the ground`);
        for (const x of c.solids || []) { const k = 'S' + sh.i + c.id + x.replace(/\d+ cm/, ''); if (!seenBody.has(k)) { seenBody.add(k); fails.push(`SOLID: ${where} ${x} — limbs never go through props: move the mark, the prop or change the clip`); } }
        for (const R of c.reach) if (R.err > 0.08) fails.push(`HANDS: ${where} hand is ${(R.err * 100).toFixed(0)} cm from ${JSON.stringify(R.to)} (move the target or the character closer)`);
        for (const H of c.hands || []) {   // deformed ("morphed") hands: a wrist folded or twisted past what a real one can do, or a hand sunk into the body
          if (H.bend > 88) fails.push(`HANDS: ${where} ${H.side} wrist is folded ${H.bend}° (max ~80°) — change the gesture/clip or the hand direction`);
          if (H.twist > 100) fails.push(`HANDS: ${where} ${H.side} wrist is twisted ${H.twist}° — the hand will look deformed; change the gesture/clip`);
          if (H.inside) fails.push(`HANDS: ${where} ${H.side} hand is inside the body — move it out (gesture, reach target or another clip)`);
        }
      }
    }
  }
  const P = await page.evaluate(() => __mfDebug.pacing());
  for (const c of info.cam || []) if (!c.lock && c.score < 4) fails.push(`CAMERA: shot ${c.i + 1} "${c.name}" — the camera barely moves (${c.score}°): every shot needs a named move (push, arc, orbit, dolly-in, crane, track, crash-zoom…) or hold: true for a deliberate still`);
  { const G2 = (P.titleSpans || []).filter((T) => !/^(timeline|tag|ticker)$/.test(T.style)).map((T) => T.t).sort((a, b) => a - b), gaps = [0, ...G2, P.total]; let worst = 0, at = 0; for (let i = 1; i < gaps.length; i++) if (gaps[i] - gaps[i - 1] > worst) { worst = gaps[i] - gaps[i - 1]; at = gaps[i - 1]; }
    if (P.portrait && P.total <= 90 && worst > 5) fails.push(`MOTION GRAPHICS: no designed graphic for ${worst.toFixed(1)}s from ${at.toFixed(1)}s — a short gets an animated graphic (kinetic · stat · marker · burst · countdown · steps · versus · callout…) at least every 4–5 s`);
    if (P.portrait && P.total <= 90 && G2.length < Math.floor(P.total / 5)) fails.push(`MOTION GRAPHICS: only ${G2.length} graphics in ${P.total.toFixed(0)}s — at least ${Math.floor(P.total / 5)} (one per beat)`); }
  for (const m of P.morphs || []) fails.push(`MORPH: ${m} blends two different postures into each other — change posture on a CUT (new shot) or use a real transition clip; never a pose blend`);
  // TASTE gates (skills/taste): rhythm that breathes, graphics with restraint, nobody staring down the lens, words inside the safe zone
  if (P.durs.length >= 6) { const m = P.durs.reduce((x, y) => x + y, 0) / P.durs.length, sd = Math.sqrt(P.durs.reduce((x, y) => x + (y - m) ** 2, 0) / P.durs.length);
    if (sd / m < 0.12) fails.push(`RHYTHM: every shot is about ${m.toFixed(1)}s (a metronome) — vary the lengths on purpose: quick-quick-HOLD, a longer beat before the big moment`); }
  const STRUCT = /^(timeline|tag|place|chapter|ticker|callout|pulse|arrow|ring|box|inset|scan|speedlines|bubble)$/, G = (P.titleSpans || []).filter((T) => !T.at && !STRUCT.test(T.style)).sort((a, b) => a.t - b.t);
  for (let i = 1; i < G.length; i++) if (Math.min(G[i].t1, G[i - 1].t1) - G[i].t > 0.3) fails.push(`GRAPHICS: "${G[i - 1].style}" (${G[i - 1].t}s) and "${G[i].style}" (${G[i].t}s) are on screen together — one graphic at a time; end the first before the next starts`);
  { let cov = 0, end = 0; for (const T of G) { cov += Math.max(0, T.t1 - Math.max(T.t, end)); end = Math.max(end, T.t1); } if (P.total > 8 && cov / P.total > 0.7) fails.push(`GRAPHICS: titles cover ${Math.round(cov / P.total * 100)}% of the video — restraint: let the picture carry beats too (≤ 70%)`); }
  { const st = (P.stare || []).filter(Boolean).length; if (P.durs.length >= 4 && st / P.durs.length > 0.5) fails.push(`ACTING: characters stare at the camera in ${st}/${P.durs.length} shots — they live the story: look at what they are doing/afraid of; camera looks only for the hook or a deliberate beat`); }
  if (P.portrait) { for (const T of P.titleSpans || []) if (T.pos && !T.at && (T.pos[1] > 0.78 || (T.pos[0] > 0.84 && T.pos[1] > 0.5))) fails.push(`SAFE ZONE: "${T.style}" title at [${T.pos}] (${T.t}s) sits under the YouTube buttons/caption area — keep words above 78% and left of 84% in the lower half`);
    if (P.capY != null && (P.capY > 0.78 || P.capY < 0.12)) fails.push(`SAFE ZONE: captions at y=${P.capY} — keep them between 0.12 and 0.78 (0.70–0.76 is best)`); }
  const fam = (P.styles || []).filter((x) => !/^(callout|pulse|arrow|ring|box|inset|timeline|tag|place|chapter|cta)$/.test(x));
  if (fam.length > 5) fails.push(`GRAPHICS: ${fam.length} different title styles (${fam.join(', ')}) — one design system per video: keep a family of ≤ 5 (skills/motion-graphics)`);
  if ((P.accents || []).length > 3) fails.push(`GRAPHICS: ${P.accents.length} accent colours (${P.accents.join(', ')}) — one accent (CONFIG.accent) + at most two meaning colours (danger/success)`);
  for (const n of P.narratorLips || []) fails.push(`NARRATOR: ${n} lip-syncs to the voiceover — the narrator is never on screen. Remove talk (characters act the story out); only a real in-scene line may use dialogue: true`);
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
    if (!P.payoffFirst) fails.push('HOOK: shot 1 must show the payoff/twist image first (mark it role: "payoff"), then rewind');
    if (P.staticOpen) fails.push('HOOK: the first second is static — camera and subject must move on frame 1');
    if (!P.question) fails.push('ENGAGEMENT: no comment question in the last captions (e.g. "Would you have survived?")');
  }
  if (!target && P.total > 30.5) fails.push(`LENGTH: ${P.total.toFixed(1)}s — every video is capped at 30 s unless Sir named a longer length (then set CONFIG.targetDuration to it)`);
  if (!target && P.portrait && P.total < 15) fails.push(`LENGTH: short is ${P.total.toFixed(1)}s — too short to tell a story (20–30 s)`);
  if (P.portrait && P.total > 180) fails.push(`LENGTH: ${P.total.toFixed(0)}s — a YouTube Short is at most 3 minutes`);
  if (!P.portrait && P.total > 90) {   // LONG-FORM retention rules (skills/youtube-algorithm)
    const first = Math.min(P.firstCaption ?? 99, P.firstTitle ?? 99), avg = P.durs.reduce((x, y) => x + y, 0) / P.durs.length, ch = await page.evaluate(() => (__mf.chapters || []).map((c) => c.end - c.start)).catch(() => []);
    if (first > 3) fails.push(`HOOK: no words on screen until ${first === 99 ? 'never' : first.toFixed(1) + 's'} — the cold open must confirm the title/thumbnail promise in the first 3 s (no intro, no logo)`);
    if (P.durs[0] > 6) fails.push(`HOOK: first shot lasts ${P.durs[0]}s — open on the most shocking moment, ≤ 6 s per shot in the cold open`);
    if (avg > 6) fails.push(`PACING: average shot is ${avg.toFixed(1)}s — long-form needs a new shot every 3–6 s`);
    P.durs.forEach((d, i) => { if (d > 8 && !P.holds[i]) fails.push(`PACING: shot ${i + 1} lasts ${d}s (> 8s) — cut it or mark hold: true for a deliberate hold`); });
    for (let i = 1; i < P.beats.length; i++) if (P.beats[i] - P.beats[i - 1] > 8) fails.push(`PACING: dead stretch ${P.beats[i - 1].toFixed(1)}–${P.beats[i].toFixed(1)}s with no cut, title, caption, effect or hit (max 8s)`);
    if (P.total > 180 && ch.length < 3) fails.push(`CHAPTERS: ${ch.length} chapter(s) — a ${Math.round(P.total / 60)}-minute video needs ≥ 3 (chapter: 'Name' on the first shot of each) for YouTube key moments`);
    ch.forEach((d, i) => { if (d < 10) fails.push(`CHAPTERS: chapter ${i + 1} is ${d.toFixed(0)}s — YouTube needs ≥ 10 s each`); });
    if (!P.voice && P.capCov < 0.8) fails.push(`STORY: no voiceover and captions cover only ${Math.round(P.capCov * 100)}%`);
  }
  const snd = await page.evaluate(() => { const S = window.__mfDebug; try { return (window.collectSoundForQA?.() || null); } catch { return null; } });
  await browser.close(); server.close();
  for (const e of errs) fails.push('ERROR: ' + e);
  for (const w of [...new Set(warns)]) fails.push('ASSET: ' + w);
  // contact sheet: every shot's middle frame, in order
  const sheet = path.join(out, 'sheet.jpg'), cols = Math.min(CW > 200 ? 5 : 8, frames.length), inputs = frames.flatMap((f) => ['-i', f]);
  if (frames.length === 1) { try { execFileSync(ffmpeg(), ['-y', '-loglevel', 'error', '-i', frames[0], sheet]); } catch {} }
  if (frames.length > 1) {
    const rows = Math.ceil(frames.length / cols), pads = cols * rows - frames.length, all = [...frames];
    const fil = all.map((_, i) => `[${i}]scale=${CW}:${CH}[s${i}]`).join(';') + ';' + all.map((_, i) => `[s${i}]`).join('') + `xstack=inputs=${all.length}:layout=` + all.map((_, i) => `${(i % cols) * CW}_${Math.floor(i / cols) * CH}`).join('|') + ':fill=black';
    try { execFileSync(ffmpeg(), ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', fil, sheet]); } catch { notes.push('contact sheet failed'); }
  }
  for (const [i, f] of frames.entries()) {   // lighting: too dark / blown out
    try { const o = require("child_process").spawnSync(ffmpeg(), ["-hide_banner", "-i", f, "-vf", "signalstats,metadata=print", "-f", "null", "-"]).stderr.toString(), y = +((o.match(/YAVG=([\d.]+)/) || [])[1] || 128);
      if (y < 38) fails.push(`LIGHT: shot ${i + 1} "${info.shots[i].name}" is too dark (avg ${y.toFixed(0)}/255)`); if (y > 215) fails.push(`LIGHT: shot ${i + 1} "${info.shots[i].name}" is blown out (avg ${y.toFixed(0)}/255)`); } catch {}
  }
  const rep = { scene: input, sceneHash: require('./lib/review_checks').sceneHash(input), duration: +info.dur.toFixed(2), shots: info.shots.length, pass: fails.length === 0, fails, notes, sheet };
  fs.writeFileSync(path.join(out, 'qa.json'), JSON.stringify(rep, null, 1));
  console.log(rep.pass ? `QA PASS · ${info.shots.length} shots · ${info.dur.toFixed(1)}s · now LOOK at ${sheet} (every shot) before delivering` : `QA FAIL (${fails.length}) — fix all, then run again:\n- ` + fails.slice(0, 60).join('\n- '));
  process.exit(rep.pass ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
