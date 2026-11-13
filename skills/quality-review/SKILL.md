---
name: quality-review
description: Mandatory deep quality pass before delivering any 3D scene, animation, motion graphic, short or script. Inspects every part (code, frames, timing, story, audio sync, metadata), finds what's wrong, fixes it and re-checks. Use before showing results to the user, or when the user asks to check, review, fix, or polish something.
---

> **Tool policy:** Use only built-in tools — Three.js/HTML/JS in the user's Chrome, Node, ffmpeg. The scripts auto-download what they need (playwright-core, ffmpeg) on first run — don't install these by hand. **Do NOT install or run Blender or Python** unless the user said "Blender/Python allowed".

# Quality Review — take your time, find everything, fix it

Be your own harshest critic. Do not tell the user it's done until it passes.

## 1. Gather evidence (cheap first)
- Re-read every file you wrote; check console errors (`page.on('pageerror')`).
- Render a **preview strip**: 540p, 8–12 evenly spaced frames + every shot boundary
  (`render_video.js scene.html prev.mp4 --width 540 --height 960 --fps 2 --frames-only`).
- For motion, also render 1–2s around each key action at 8–12fps and view as a strip (onion skin).
- Combine frames into one contact sheet to view in a single Read:
  `ffmpeg -i prev_frames/f%05d.png -vf "scale=180:-1,tile=6x2" sheet.png`

## 2. Inspect — checklist (write PASS/FAIL per line, internally)
**Technical**: no JS errors · assets loaded (no stand-in capsule left) · no black/blank
frames · no z-fighting, clipping through body/floor, floating feet · shadows present ·
no aliasing shimmer · correct aspect/resolution · loop seam clean (if looping).
**Visual**: NO reference image used as a texture/print and no copied logos or text on clothing · clear focal point every frame · readable silhouette · value contrast ·
colors match style bible · skin not plastic, eyes have catchlights · text inside safe area,
legible at phone size.
**Motion**: no stiff shots (something changes every ~1s; look/face/talk layered on clips) · no foot skating (walk ≈1.45 m/s, run ≈2.57 m/s) · no instant turns/snaps · eyes alive (look targets change) · no Xbot/mannequin used as a person · no linear easing on organic motion · no pops/snaps between frames · arcs ·
overlap/secondary motion · holds long enough to read · camera moves motivated.
**VFX**: every effect layered (core + smoke/sparks/debris + light + shake + reaction) · no
white-out frames (bloom not washing the screen) · no plain shapes · effects lit the scene ·
smoke dissipates slowly, never pops off.
**Taste**: look matches mood · motivated light + rim on hero · ≤2 saturated colors · framing
varies shot to shot · at least one signature touch · would pass as a studio short.
**Story** (shorts): hook in ≤2s · re-hook every 5–8s · climax lands · twist is fair
(clue planted) · ending loops to opening · captions match VO timing.
**Publish**: title/desc/tags present and honest (no misleading claims).

## 3. Fix → re-verify
Fix every FAIL, worst first. Re-render only the affected frames/shots. Repeat until all
PASS — max 3 rounds; if something still fails, tell the user exactly what and why.

## 4. Report (short)
One line: "QA passed — fixed N issues (x, y, z)." Nothing more unless asked.
