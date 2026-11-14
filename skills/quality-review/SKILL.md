---
name: quality-review
description: Mandatory deep quality pass before delivering any 3D scene, animation, motion graphic, short or script. Inspects every part (code, frames, timing, story, audio sync, metadata), finds what's wrong, fixes it and re-checks. Use before showing results to the user, or when the user asks to check, review, fix, or polish something.
---

> **Tool policy:** Use only built-in tools — Three.js/HTML/JS in the user's Chrome, Node, ffmpeg. The scripts auto-download what they need (playwright-core, ffmpeg) on first run — don't install these by hand. **Do NOT install or run Blender or Python** unless the user said "Blender/Python allowed".

# Quality Review — take your time, find everything, fix it

Be your own harshest critic. Do not tell the user it's done until it passes.
Never deliver a first draft. Rounds follow the user's effort level (Standard 2 · High 4 · Maximum 6+); always run
`node ${CLAUDE_PLUGIN_ROOT}/scripts/qa_check.js scene.html [--target <requested seconds>]` first and fix EVERY failure it lists (clips, feet,
hands, length, assets, errors), then look at its sheet.jpg. Speed is not a goal: minimum **2 full rounds** (render → view → fix → re-render) covering
at least one frame from EVERY shot plus motion strips of the key actions. A video made in 2 minutes was not reviewed.

## THE 10 CHECKS — all must PASS before the user gets the video (no exceptions)
1. **Auto check**: `scripts/qa_check.js scene.html --target <requested seconds>` exits PASS (no errors, missing assets or clips).
2. **Length**: exactly what the user asked (±5%). A "13-minute video" is 13 minutes, never a short.
3. **Feet**: on the ground in every shot (no floating, no sinking, no sliding).
4. **Hands & arms**: every touch/hold/point lands on its target (`reach` IK); no arms through bodies or props.
5. **Right action**: every clip fits its moment (sit when sitting, kneel when kneeling, talk when talking); no random moves.
6. **Framing**: subject and the thing discussed in frame; faces never cropped or covered.
7. **Lighting**: faces lit and readable, nothing too dark or blown out (auto LIGHT check + your eyes), matches the mood.
8. **Sound**: every effect lines up with a visible event on that exact frame; music under voice; no dead air; nothing random.
9. **Smoothness**: no stutter, pops, snaps or frozen frames; camera moves ease; cuts on action.
10. **Story & rules**: hook in 2 s, clear story, twist lands; Motion Forge only, no photos, no logos; publish pack ready.
Record PASS/FAIL for all 10 internally each round. Any FAIL → fix → re-run all 10. Never show the user a video with a FAIL.

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
**Composition**: eyes on the upper third · subject never cropped at the head in wide shots · titles/captions never over faces · FX inside the frame (use camera `with`) · nothing built from primitives where an actor/kit exists.
**Motion**: no stiff shots (something changes every ~1s; look/face/talk layered on clips) · no foot skating (walk ≈1.45 m/s, run ≈2.57 m/s) · no instant turns/snaps · eyes alive (look targets change) · no Xbot/mannequin used as a person · no linear easing on organic motion · no pops/snaps between frames · arcs ·
overlap/secondary motion · holds long enough to read · camera moves motivated.
**VFX**: every effect layered (core + smoke/sparks/debris + light + shake + reaction) · no
white-out frames (bloom not washing the screen) · no plain shapes · effects lit the scene ·
smoke dissipates slowly, never pops off.
**Taste**: look matches mood · motivated light + rim on hero · ≤2 saturated colors · framing
varies shot to shot · at least one signature touch · would pass as a studio short.
**Sound & edit**: soundtrack present (~-14 LUFS) · a sound on frame 1 · every transition/impact/title has its sound · music drop lands on the twist · no dead air · shots vary in length, pattern interrupt every 2–3s.
**Clarity** (visual-clarity skill): sound-off test passes · each shot passes the 5-word test (matches its line) · explainer graphics on ≥70% of shots for explainer topics · no random/unmotivated actions · no repeated set+framing+action · info shots held long enough to read · body part being discussed is in frame · panels never over the face.
**Story** (shorts): payoff/answer shown in the first 2s · hook in ≤2s · re-hook every 5–8s · climax lands · twist is fair
(clue planted) · ending loops to opening · captions match VO timing.
**Publish**: title/desc/tags present and honest (no misleading claims).

## 3. Fix → re-verify
Fix every FAIL, worst first. Re-render only the affected frames/shots. Repeat until all
PASS — at least 2 rounds, max 4; if something still fails, tell the user in one line what and why.

## 4. Report (short)
Nothing in chat. The review is internal — never paste the checklist, the fixes or a "what's new" list into the final message.
