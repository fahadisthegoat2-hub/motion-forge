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
- Combine frames into one contact sheet to view in a single Read:
  `ffmpeg -i prev_frames/f%05d.png -vf "scale=180:-1,tile=6x2" sheet.png`

## 2. Inspect — checklist (write PASS/FAIL per line, internally)
**Technical**: no JS errors · assets loaded (no stand-in capsule left) · no black/blank
frames · no z-fighting, clipping through body/floor, floating feet · shadows present ·
no aliasing shimmer · correct aspect/resolution · loop seam clean (if looping).
**Visual**: clear focal point every frame · readable silhouette · value contrast ·
colors match style bible · skin not plastic, eyes have catchlights · text inside safe area,
legible at phone size.
**Motion**: no linear easing on organic motion · no pops/snaps between frames · arcs ·
overlap/secondary motion · holds long enough to read · camera moves motivated.
**Story** (shorts): hook in ≤2s · re-hook every 5–8s · climax lands · twist is fair
(clue planted) · ending loops to opening · captions match VO timing.
**Publish**: title/desc/tags present and honest (no misleading claims).

## 3. Fix → re-verify
Fix every FAIL, worst first. Re-render only the affected frames/shots. Repeat until all
PASS — max 3 rounds; if something still fails, tell the user exactly what and why.

## 4. Report (short)
One line: "QA passed — fixed N issues (x, y, z)." Nothing more unless asked.
