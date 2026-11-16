#!/usr/bin/env node
// Automatic QA for a scene — run it on EVERY video before showing anything to Sir. Exit code 1 = must fix.
// It MEASURES, it does not guess. Two passes:
//  1) MOTION pass — every single frame of the video is posed and measured (no drawing, so it is fast): wrist skin pinch/tear on the real mesh,
//     wrist fold/twist, hands inside the body/arm/leg/head, hands off their reach targets, feet floating/sinking, bind-pose (T-pose) flashes,
//     pops (a joint teleporting between two frames), walking on the spot, sliding without walking, characters standing inside each other,
//     the camera inside a head or under the floor.
//  2) PICTURE pass — rendered frames of every shot (more per shot at higher effort): light on faces, dark/blown-out shots, faces cut off,
//     titles over faces, a shot where nothing moves, + a MACRO CROP OF EVERY HAND (hands.jpg) and the contact sheet (sheet.jpg) to look at.
//  + TEXT: caption speed/flash/overlap, titles off-frame, colliding or too short to read, doubled words · length vs asked length · hook/pacing rules.
// Effort (CONFIG.effort or --effort): standard = 1 frame + 1 hand crop per shot · high = 3 + 2 · maximum = 5 + 3, with tighter limits.
// Usage: node qa_check.js scene.html [--target <seconds>] [--out dir] [--effort standard|high|maximum]
const { launchBrowser, ffmpeg, startStaticServer, routeAssets } = require('./lib/deps');
const { tierOf } = require('./lib/review_checks');
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2), opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const input = args.find((a, i) => !a.startsWith('--') && !(args[i - 1] || '').match(/^--(target|out|effort)$/));
if (!input) { console.error('usage: qa_check.js scene.html [--target seconds] [--out dir] [--effort standard|high|maximum]'); process.exit(1); }
const out = opt('--out') || input.replace(/\.html?$/, '') + '_qa'; fs.mkdirSync(out, { recursive: true });
const src = fs.readFileSync(input, 'utf8'), effort = tierOf(opt('--effort') || (src.match(/\beffort\s*:\s*['"](\w+)['"]/) || [])[1]);
const TIER = { standard: { views: [0.5], hands: 1, squash: 0.42, stretch: 1.7, bend: 62, twist: 100 }, high: { views: [0.15, 0.5, 0.85], hands: 2, squash: 0.46, stretch: 1.6, bend: 60, twist: 90 },
  maximum: { views: [0.08, 0.3, 0.5, 0.7, 0.92], hands: 3, squash: 0.5, stretch: 1.55, bend: 58, twist: 85 } }[effort];
const luma = (p, vf = '') => { const o = spawnSync(ffmpeg(), ['-hide_banner', '-i', p, '-vf', vf + 'signalstats,metadata=print', '-f', 'null', '-']).stderr.toString(); return +((o.match(/YAVG=([\d.]+)/) || [])[1] || 128); };
const sheetOf = (files, dest, cols, cw, chh) => { if (files.length < 2) { if (files[0]) fs.copyFileSync(files[0], dest.replace(/\.jpg$/, '.png')); return; }
  const fil = files.map((_, i) => `[${i}]scale=${cw}:${chh}[s${i}]`).join(';') + ';' + files.map((_, i) => `[s${i}]`).join('') + `xstack=inputs=${files.length}:layout=` + files.map((_, i) => `${(i % cols) * cw}_${Math.floor(i / cols) * chh}`).join('|') + ':fill=black';
  execFileSync(ffmpeg(), ['-y', '-loglevel', 'error', ...files.flatMap((f) => ['-i', f]), '-filter_complex', fil, dest]); };
(async () => {
  const browser = await launchBrowser(), page = await browser.newPage(), errs = [], warns = [], notes = [];
  const F = new Map(), fail = (key, msg, score = 0) => { const o = F.get(key); if (!o || score > o.score) F.set(key, { msg, score }); };   // one line per problem: the worst moment
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { const t = m.text(); if (/missing|unknown fx|failed|not found/i.test(t) && !/favicon|ERR_FAILED|fonts|Failed to load resource/i.test(t)) warns.push(t); });
  await routeAssets(page); const server = await startStaticServer();
  await page.setViewportSize({ width: 270, height: 480 });
  await page.goto(server.origin + path.resolve(input) + '?fast=1');
  await page.waitForFunction(() => window.__mf && window.__mfReady !== false, null, { timeout: 900000, polling: 1000 });
  await page.evaluate(() => { document.getElementById('mf-panel')?.remove(); window.__mfManual = true; });
  const info = await page.evaluate(() => ({ dur: __mf.duration, fps: __mf.fps || 30, w: __mf.width, h: __mf.height, target: __mfDebug.pacing().target, shots: __mfDebug.shots(), text: __mfDebug.text ? __mfDebug.text() : null }));
  if (!info.text) fail('ENGINE', 'ENGINE: this scene runs an old engine (no hand/motion probes) — run scripts/upgrade_scene.js on it first', 9);
  const portrait = info.h > info.w, VW = portrait ? 270 : 480, VH = portrait ? 480 : 270;
  await page.setViewportSize({ width: VW, height: VH }); await page.evaluate(([w, h]) => window.__mf.setSize(w, h), [VW, VH]);
  const target = +(opt('--target') || info.target || 0);
  if (target && Math.abs(info.dur - target) / target > 0.05) fail('LENGTH', `LENGTH: video is ${info.dur.toFixed(1)}s but ${target}s was asked (must be within 5%)`);

  /* ---------- 1) MOTION pass: every frame ---------- */
  const dt = 1 / 30, worstHand = {}, stats = { frames: 0, squash: 1, stretch: 1, bend: 0, twist: 0 };
  const data = await page.evaluate(async ([shots, dt]) => { window.__mfNoDraw = true; const res = [];
    for (const sh of shots) { const fr = []; for (let t = sh.start + 1e-4; t < sh.start + sh.dur - 1e-4; t += dt) { const r = __mfDebug.probe(t); fr.push({ t, local: r.local, cam: r.cam, chars: r.chars }); } res.push(fr); }
    window.__mfNoDraw = false; return res; }, [info.shots, dt]);
  const d3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  data.forEach((frames, si) => { const sh = info.shots[si], S = `shot ${sh.i + 1} "${sh.name}"`, acc = {};
    frames.forEach((fr, fi) => { stats.frames++; const prev = frames[fi - 1], at = `@${fr.t.toFixed(2)}s`;
      for (const c of fr.chars) { const W = `${S} ${c.id}`, pc = prev?.chars.find((x) => x.id === c.id), A = (acc[c.id] ??= { spot: 0, slide: 0 });
        for (const m of c.missing) fail('CLIP' + W + m, `CLIP: ${W} uses "${m}" which doesn't exist (see SCENE_API clip list)`);
        if (c.bind) fail('BIND' + W, `T-POSE: ${W} ${at} is in the bind pose (arms straight out) — a clip is missing/has a gap, or a hold lost its pose`);
        if (c.footY !== null && !c.airborne && c.footY > 0.14) fail('FLOAT' + W, `FEET: ${W} ${at} floats ${(c.footY * 100).toFixed(0)} cm above the ground`, c.footY);
        if (c.footY !== null && c.footY < -0.06) fail('SINK' + W, `FEET: ${W} ${at} sinks ${(-c.footY * 100).toFixed(0)} cm into the ground`, -c.footY);
        for (const R of c.reach) if (R.err > 0.08) fail('REACH' + W + JSON.stringify(R.to), `HANDS: ${W} ${at} hand is ${(R.err * 100).toFixed(0)} cm from ${JSON.stringify(R.to)} (move the target or the character closer)`, R.err);
        for (const H of c.hands || []) { const HW = `${W} ${H.side} `, k = sh.i + '|' + c.id + '|' + H.side, sk = H.skin;
          if (sk) { stats.squash = Math.min(stats.squash, sk.squash); stats.stretch = Math.max(stats.stretch, sk.stretch); const bad = (1 - sk.squash) + (sk.stretch - 1) + sk.bad * 4; if (!worstHand[k] || bad > worstHand[k].bad) worstHand[k] = { bad, t: fr.t };
            if (sk.squash < TIER.squash || sk.bad > 0.05) fail('PINCH' + HW, `HANDS: ${HW}wrist skin is pinched ${at} (mesh squashed to ${Math.round(sk.squash * 100)}% of its rest size, ${Math.round(sk.bad * 100)}% of the wrist ring deformed) — the hand looks morphed; turn the hand less (gesture dir/palm, reach target) or change the clip`, 1 - sk.squash);
            if (sk.stretch > TIER.stretch) fail('TEAR' + HW, `HANDS: ${HW}wrist skin is stretched ${at} (${Math.round(sk.stretch * 100)}% of rest) — the wrist looks torn/twisted; change the gesture/clip`, sk.stretch); }
          stats.bend = Math.max(stats.bend, H.bend); stats.twist = Math.max(stats.twist, H.twist);
          if (H.bend > TIER.bend) fail('BEND' + HW, `HANDS: ${HW}wrist is folded ${H.bend}° ${at} (max ${TIER.bend}°) — change the gesture/clip or the hand direction`, H.bend);
          if (H.twist > TIER.twist) fail('TWIST' + HW, `HANDS: ${HW}wrist is twisted ${H.twist}° ${at} — the hand will look deformed; change the gesture/clip`, H.twist);
          if (H.inside) fail('INSIDE' + HW, `HANDS: ${HW}hand is inside the body ${at} — move it out (gesture, reach target or another clip)`);
          if (H.clip) fail('HCLIP' + HW + H.clip, `HANDS: ${HW}hand goes through ${H.clip} ${at} — move it out (another clip/gesture, or a custom bones offset on the arm)`);
          const pH = pc?.hands?.find((x) => x.side === H.side); if (pH && H.p && pH.p && fi > 1) { const v = d3(H.p, pH.p) / dt; if (v > 26) fail('POPH' + HW, `POP: ${HW}hand jumps ${(v * dt * 100).toFixed(0)} cm in one frame ${at} — a snap, not motion (overlapping clips/gestures, a key without ease)`, v); } }
        if (pc && fi > 1) { const vh = c.hips && pc.hips ? d3(c.hips, pc.hips) / dt : 0, vr = d3(c.root, pc.root) / dt;
          if (vh > 14 && vr < 14) fail('POPB' + W, `POP: ${W} body jumps ${(vh * dt * 100).toFixed(0)} cm in one frame ${at} — clips cut without a fade or a pose snap`, vh);
          const still = /sit|drive|swim|slide|roll|climb|jump|fall|die|death|knock|hit|lay|lie|dance|treadmill/i.test(c.clipName || '');
          if (!still && c.gait > 0.5 && vr < 0.12) A.spot += dt; if (!still && !c.airborne && c.gait < 0.2 && vr > 0.7 && vr < 14) A.slide += dt; }
        const hd = c.headP ? d3(c.headP, fr.cam) : 9; if (hd < 0.2) fail('CAMIN' + W, `CAMERA: ${S} ${at} the camera is inside ${c.id}'s head (${(hd * 100).toFixed(0)} cm) — move it back or change the size`);
        for (const o of fr.chars) if (o.id < c.id && o.hips && c.hips && d3(o.hips, c.hips) < 0.24) fail('OVERLAP' + S + o.id + c.id, `BLOCKING: ${S} ${at} ${o.id} and ${c.id} stand inside each other (${(d3(o.hips, c.hips) * 100).toFixed(0)} cm apart) — move one`);
      }
      if (fr.cam[1] < 0.02 && !/blood|fat|neurons|artery|space|void/.test(String(sh.set))) fail('CAMLOW' + S, `CAMERA: ${S} ${at} the camera is under the floor (y ${fr.cam[1]})`);
    });
    for (const [id, A] of Object.entries(acc)) { if (A.spot > 0.6) fail('SPOT' + S + id, `FEET: ${S} ${id} walks/runs on the spot for ${A.spot.toFixed(1)}s — give it pos keys (it travels) or use a standing clip`);
      if (A.slide > 0.5) fail('SLIDE' + S + id, `FEET: ${S} ${id} slides across the floor for ${A.slide.toFixed(1)}s without stepping — use walk/run while pos moves`); } });

  /* ---------- TEXT: captions + titles (readable, on screen, not colliding) ---------- */
  if (info.text) { const { captions: C, titles: T, captionY, total } = info.text;
    C.forEach((c, i) => { const end = c.t1 ?? C[i + 1]?.t ?? total, d = end - c.t, n = String(c.text || '').split(/\s+/).filter(Boolean).length, W = `caption ${i + 1} "${String(c.text).slice(0, 24)}" @${(+c.t).toFixed(1)}s`;
      if (d < 0.3 && n) fail('CAPF' + i, `CAPTIONS: ${W} is on screen for ${d.toFixed(2)}s — nobody can read that (≥ 0.35s)`);
      if (n / Math.max(d, 0.01) > 6.5 && n > 3) fail('CAPS' + i, `CAPTIONS: ${W} runs ${(n / d).toFixed(1)} words/s — max 6; split it or slow the line`);
      if (String(c.text).length > 34) fail('CAPL' + i, `CAPTIONS: ${W} is ${String(c.text).length} characters — split it (≤ 34, 2–4 words read best)`);
      if (/\b(\w+)\s+\1\b/i.test(c.text || '')) fail('CAPD' + i, `TEXT: ${W} has a doubled word`);
      if (c.t > total) fail('CAPO' + i, `CAPTIONS: ${W} starts after the video ends`); });
    const box = (t) => t.pos ? { x: t.pos[0], y: t.pos[1], h: (t.size || 0.08) * (String(t.text || '').split('\n').length + (t.sub ? 0.6 : 0)) } : null;
    T.forEach((t, i) => { const d = (t.t1 ?? t.t + 2) - t.t, txt = String(t.text || '').replace(/\|/g, ' '), W = `title ${i + 1} ${t.style || 'slam'} "${txt.slice(0, 20)}" @${(+t.t).toFixed(1)}s`, b = box(t), long = /timeline|speedlines|scan|pulse/.test(t.style || '');
      if (!long && d < 0.45) fail('TITF' + i, `TITLES: ${W} lasts ${d.toFixed(2)}s — too short to read (≥ 0.5s)`);
      if (!long && txt.length / Math.max(d, 0.01) > 26 && txt.length > 12) fail('TITS' + i, `TITLES: ${W} is ${txt.length} characters in ${d.toFixed(1)}s — hold it longer or cut words`);
      if (/\b(\w+)\s+\1\b/i.test(txt)) fail('TITD' + i, `TEXT: ${W} has a doubled word`);
      if (t.t >= total) fail('TITO' + i, `TITLES: ${W} starts after the video ends`);
      if (b && !t.at && (b.x < 0.06 || b.x > 0.94 || b.y < 0.035 || b.y > 0.965)) fail('TITP' + i, `TITLES: ${W} sits at [${t.pos}] — outside the safe area (keep 6% from every edge)`);
      if (b && !t.at && !long && portrait && Math.abs(b.y - captionY) < 0.07 && C.some((c, j) => c.t < (t.t1 ?? t.t + 2) && (c.t1 ?? C[j + 1]?.t ?? total) > t.t)) fail('TITC' + i, `TITLES: ${W} is drawn on top of the captions (y ${b.y} vs captions ${captionY}) — move it`);
      for (let j = 0; j < i; j++) { const o = T[j], ob = box(o); if (!b || !ob || t.at || o.at || /timeline|speedlines|scan/.test(o.style || '') || long) continue;
        if (t.t < (o.t1 ?? o.t + 2) - 0.15 && (t.t1 ?? t.t + 2) > o.t + 0.15 && Math.abs(b.x - ob.x) < 0.3 && Math.abs(b.y - ob.y) < Math.max(0.05, (b.h + ob.h) / 2)) fail('TITX' + i + '_' + j, `TITLES: ${W} overlaps title ${j + 1} "${String(o.text || '').slice(0, 16)}" (same place, same time) — move or retime one`); } }); }

  if (info.text && portrait) { const T = info.text.titles.filter((t) => !/timeline|speedlines|scan/.test(t.style || '')), total = info.text.total;   // MOTION GRAPHICS WORK HARD
    const edges = [0, ...T.flatMap((t) => [t.t, t.t1 ?? t.t + 2]), total].sort((a, b) => a - b); let cov = (x) => T.some((t) => x >= t.t && x <= (t.t1 ?? t.t + 2));
    for (let i = 1; i < edges.length; i++) { const a = edges[i - 1], b = edges[i]; if (b - a > 7 && !cov((a + b) / 2)) fail('MGGAP' + i, `MOTION GRAPHICS: no designed graphic between ${a.toFixed(1)}s and ${b.toFixed(1)}s — every beat gets one (stat, callout, marker, versus, steps, place…)`, b - a); }
    const by = {}; T.forEach((t) => (by[t.style || 'slam'] = (by[t.style || 'slam'] || 0) + 1)); const top = Object.entries(by).sort((a, b) => b[1] - a[1])[0];
    if (T.length >= 5 && top[1] / T.length > 0.6) fail('MGVAR', `MOTION GRAPHICS: ${top[1]} of ${T.length} graphics are "${top[0]}" — vary the styles (each beat its own designed graphic)`);
    if (total > 12 && T.length < Math.floor(total / 6)) fail('MGFEW', `MOTION GRAPHICS: only ${T.length} graphics in ${total.toFixed(0)}s — at least one every ~6s`); }

  /* ---------- 2) PICTURE pass: rendered frames of every shot ---------- */
  const frames = [], handShots = [];
  fs.mkdirSync(path.join(out, 'frames'), { recursive: true }); fs.mkdirSync(path.join(out, 'hands'), { recursive: true });
  for (const f of fs.readdirSync(path.join(out, 'hands'))) fs.unlinkSync(path.join(out, 'hands', f));
  for (const sh of info.shots) { const S = `shot ${sh.i + 1} "${sh.name}"`, bufs = [];
    for (const f of TIER.views) { const t = sh.start + sh.dur * f, r = await page.evaluate((t) => __mfDebug.probe(t), t);
      const p = path.join(out, 'frames', `shot${String(sh.i + 1).padStart(3, '0')}_${Math.round(f * 100)}.png`), buf = await page.locator('canvas').first().screenshot({ path: p }); bufs.push(buf);
      if (f === 0.5) { frames.push(p); fs.copyFileSync(p, path.join(out, `shot${String(sh.i).padStart(3, '0')}.png`));
        const y = luma(p); if (y < 38) fail('DARK' + S, `LIGHT: ${S} is too dark (avg ${y.toFixed(0)}/255)`); if (y > 215) fail('BRIGHT' + S, `LIGHT: ${S} is blown out (avg ${y.toFixed(0)}/255)`);
        for (const c of r.chars) if (c.face) { const fy = luma(p, `crop=iw*0.12:iw*0.12:iw*${Math.max(0, c.face[0] - 0.06)}:ih*${Math.max(0, c.face[1] - 0.04)},`);
          if (fy < 45) fail('FDARK' + S + c.id, `LIGHT: ${S} ${c.id}'s face is too dark (${fy.toFixed(0)}/255) — add a key/rim light or change the look`); if (fy > 225) fail('FHOT' + S + c.id, `LIGHT: ${S} ${c.id}'s face is blown out (${fy.toFixed(0)}/255)`); } }
      for (const c of r.chars) { const where = `${S} @${t.toFixed(1)}s ${c.id}`;
        if (c.face && c.face[1] < 0.1) fail('CUT' + S + c.id, `FRAMING: ${where} face is cut off at the top of the frame — wider size or lower camera`);
        if (c.face) for (const T of r.titles || []) if (Math.abs(T.pos[0] - c.face[0]) < 0.3 && Math.abs(T.pos[1] - c.face[1]) < 0.09) fail('TFACE' + S + c.id, `FRAMING: ${where} a ${T.style || 'slam'} title covers the face — move it to the top 25% or the other side`); } }
    if (bufs.length > 1 && sh.dur > 0.7 && !sh.hold && bufs.every((b) => b.equals(bufs[0]))) fail('STATIC' + S, `STATIC: ${S} — nothing moves at all between ${TIER.views.length} frames (camera, body, graphics); every shot moves`);
    // macro crop of every hand in this shot (worst-deformed moment first), seen from the shot camera's side
    for (const id of sh.cast) for (const side of ['left', 'right']) { const w = worstHand[sh.i + '|' + id + '|' + side], ts = [...new Set([w?.t ?? sh.start + sh.dur * 0.5, sh.start + sh.dur * 0.5, sh.start + sh.dur * 0.88].map((x) => +x.toFixed(3)))].slice(0, TIER.hands);
      for (const [n, t] of ts.entries()) { const ok = await page.evaluate(([t, id, side]) => { window.__mfCam = null; window.__mfNoDraw = true; __mf.render(t); window.__mfNoDraw = false;
          const ch = __mfDebug.characters[id], h = ch?.bones[side + 'hand']; if (!ch || !ch.root.visible || !h) return false; const V = h.position.constructor, m = ch.bones[side + 'handmiddle1'] || h;
          const c = h.getWorldPosition(new V()).lerp(m.getWorldPosition(new V()), 0.6), cam = __mfDebug.scene.getObjectByProperty('isPerspectiveCamera', true), cp = (cam ? cam.getWorldPosition(new V()) : new V(0, 1.5, 3)), d = cp.sub(c); d.y = Math.max(-0.2, Math.min(0.35, d.y / Math.max(d.length(), 1e-3))); const L = Math.hypot(d.x, d.z) || 1; d.x /= L; d.z /= L;
          window.__mfCam = { pos: [c.x + d.x * 0.5, c.y + d.y * 0.5 + 0.06, c.z + d.z * 0.5], look: [c.x, c.y, c.z], fov: 34 }; __mf.render(t); return true; }, [t, id, side]);
        if (!ok) continue; const p = path.join(out, 'hands', `shot${String(sh.i + 1).padStart(3, '0')}_${id}_${side}_${n}.png`);
        await page.locator('canvas').first().screenshot({ path: p, clip: { x: 0, y: Math.max(0, (VH - VW) / 2), width: Math.min(VW, VH), height: Math.min(VW, VH) } }); handShots.push(p); } }
    await page.evaluate(() => { window.__mfCam = null; });
  }
  const P = await page.evaluate(() => __mfDebug.pacing());
  await browser.close(); server.close();
  for (const n of P.narratorLips || []) fail('NARR' + n, `NARRATOR: ${n} lip-syncs to the voiceover — the narrator is never on screen. Remove talk (characters act the story out); only a real in-scene line may use dialogue: true`);
  if (P.portrait) {   // SHORTS retention rules
    const first = Math.min(P.firstCaption ?? 99, P.firstTitle ?? 99);
    if (first > 0.3) fail('HOOK1', `HOOK: no words on screen until ${first === 99 ? 'never' : first.toFixed(1) + 's'} — the hook line/title must be on screen by 0.3s`);
    if (P.durs[0] > 2.0) fail('HOOK2', `HOOK: first shot lasts ${P.durs[0]}s — the hook shot must be ≤ 2s`);
    if (!P.beats.some((b) => b <= 0.15)) fail('HOOK3', 'HOOK: nothing hits on frame 1 (sound, title or effect at 0s)');
    const avg = P.durs.reduce((x, y) => x + y, 0) / P.durs.length; if (avg > 2.4) fail('PACE0', `PACING: average shot is ${avg.toFixed(1)}s — shorts need ≤ 2.4s (new angle every 2–3s)`);
    P.durs.forEach((d, i) => { if (d > 4 && !P.holds[i]) fail('PACE' + i, `PACING: shot ${i + 1} lasts ${d}s (> 4s) — cut it or add beats (mark hold: true only for a deliberate hold)`); });
    for (let i = 1; i < P.beats.length; i++) if (P.beats[i] - P.beats[i - 1] > 2.6) fail('DEAD' + i, `PACING: dead stretch ${P.beats[i - 1].toFixed(1)}–${P.beats[i].toFixed(1)}s with no cut, title, caption, effect or hit (max 3s)`);
    if (P.beats.length && P.total - P.beats.at(-1) > 3) fail('DEADEND', `PACING: last ${(P.total - P.beats.at(-1)).toFixed(1)}s have no beat`);
    if (!P.voice && P.capCov < 0.8) fail('STORY', `STORY: no voiceover and captions cover only ${Math.round(P.capCov * 100)}% — a short needs a voice or wall-to-wall captions`);
    if (!target && (P.total < 25 || P.total > 35)) fail('LEN2', `LENGTH: short is ${P.total.toFixed(1)}s — shorts are 25–35s unless Sir asked otherwise`);
    if (!P.payoffFirst) fail('HOOK4', 'HOOK: shot 1 must show the payoff/twist image first (mark it role: "payoff"), then rewind');
    if (P.staticOpen) fail('HOOK5', 'HOOK: the first second is static — camera and subject must move on frame 1');
    if (!P.question) fail('ENGAGE', 'ENGAGEMENT: no comment question in the last captions (e.g. "Would you have survived?")');
  }
  for (const e of errs) fail('ERR' + e, 'ERROR: ' + e, 9);
  for (const w of new Set(warns)) fail('ASSET' + w, 'ASSET: ' + w);
  const sheet = path.join(out, 'sheet.jpg'), hands = path.join(out, 'hands.jpg'), cw = portrait ? 180 : 320, chh = portrait ? 320 : 180;
  try { sheetOf(frames, sheet, Math.min(8, frames.length), cw, chh); } catch { notes.push('contact sheet failed'); }
  try { sheetOf(handShots, hands, Math.min(8, handShots.length), 200, 200); } catch { notes.push('hand sheet failed'); }
  const fails = [...F.values()].sort((a, b) => b.score - a.score).map((x) => x.msg);
  const rep = { scene: input, effort, duration: +info.dur.toFixed(2), shots: info.shots.length, pass: fails.length === 0, measured: { frames: stats.frames, views: info.shots.length * TIER.views.length, handCrops: handShots.length,
    worstWristSquash: stats.squash, worstWristStretch: stats.stretch, worstWristBend: stats.bend, worstWristTwist: stats.twist }, fails, notes, sheet, hands };
  fs.writeFileSync(path.join(out, 'qa.json'), JSON.stringify(rep, null, 1));
  const head = `${effort} · ${stats.frames} frames measured · ${rep.measured.views} shot frames · ${handShots.length} hand crops · worst wrist ${Math.round(stats.squash * 100)}%/${Math.round(stats.stretch * 100)}%`;
  console.log(rep.pass ? `QA PASS · ${info.shots.length} shots · ${info.dur.toFixed(1)}s · ${head}\nnow LOOK at ${sheet} (every shot) and ${hands} (every hand) before delivering`
    : `QA FAIL (${fails.length}) · ${head} — fix all, then run again:\n- ` + fails.slice(0, 70).join('\n- ') + `\nlook at ${hands} and ${sheet}`);
  process.exit(rep.pass ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
