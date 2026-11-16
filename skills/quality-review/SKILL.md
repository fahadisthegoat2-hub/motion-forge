---
name: quality-review
description: Mandatory deep quality pass before delivering any 3D scene, animation, motion graphic, short or script. Inspects every part (code, frames, timing, story, audio sync, metadata), finds what's wrong, fixes it and re-checks. Use before showing results to the user, or when the user asks to check, review, fix, or polish something.
---

> **Tool policy:** Use only built-in tools — Three.js/HTML/JS in the user's Chrome, Node, ffmpeg. The scripts auto-download what they need (playwright-core, ffmpeg) on first run — don't install these by hand. **Do NOT install or run Blender or Python** unless the user said "Blender/Python allowed".

# Quality Review — take your time, find everything, fix it

Be your own harshest critic. Do not tell the user it's done until it passes. Never deliver a first draft.

## EFFORT LEVEL = HOW MANY CHECKS + HOW MANY ROUNDS (enforced by script)
| Effort (CONFIG.effort) | Checks | Full rounds (min) |
|---|---|---|
| **Standard** | C01–C10 (10) | 2 |
| **High** | C01–C25 (25) | 4 |
| **Maximum** | C01–C35 (35) | 6 |

A **round** = render → run gates → LOOK/LISTEN to every check of the tier → fix every FAIL → re-render. Every round re-checks ALL checks of
the tier (a fix breaks other things). The gate is mechanical — the video cannot ship until it passes:
```
node ${CLAUDE_PLUGIN_ROOT}/scripts/review_log.js scene.html --init            # once; reads CONFIG.effort, lists the tier's checks
# each round:
node ${CLAUDE_PLUGIN_ROOT}/scripts/qa_check.js scene.html --target <s>        # scene gate (feet, hands, framing, light, hook, pacing…)
node ${CLAUDE_PLUGIN_ROOT}/scripts/render_video.js scene.html prev.mp4 --fast --width 540 --height 960
node ${CLAUDE_PLUGIN_ROOT}/scripts/av_check.js prev.mp4 --out scene_qa [--holds "a-b"]   # sound + picture forensics → av.json, wave.png
node ${CLAUDE_PLUGIN_ROOT}/scripts/review_log.js scene.html --round           # snapshots THIS render into scene_qa/rN/
#   → capture your proof into scene_qa/rN/ (hand/face crops, 12 fps strips, frame grabs, listening notes), fill every check, fix every FAIL
node ${CLAUDE_PLUGIN_ROOT}/scripts/review_log.js scene.html --verify          # MUST print REVIEW PASS — pack_scene.js refuses otherwise
```
## PROOF OF WORK — the gate rejects box-ticking, and counts every honest check
Fill checks with the tool (never hand-edit review.json): `review_log.js scene.html --check C05 --status PASS|FAIL --evidence "…" --proof rN/file.png [--fix "…"]`.
`review_log.js scene.html --status` shows the counter (counted per round + what is still open).
- **The review must find real problems**: ≥ 3 FAILs (Standard) · ≥ 6 (High) · ≥ 10 (Maximum) in total over all rounds.
- **Every FAIL needs a real fix**: the `fix` names exactly what changed (shot, key, value from → to), and the scene must change before the
  next round. `--round` refuses while FAILs are unfixed.
- **Reports match the scene**: qa_check / render_video + av_check record the scene version; after any scene edit re-run them (then a new round).
  The delivered scene must be the last reviewed one.
- **Every check has its own proof**: ≥ 1 file in this round's `rN/` (crop, strip, grab, note), listed in `proof`. An unchanged shot may give
  the same picture again; a check that FAILED last round must show a new one.
- **Evidence names what, where and the value** (`"shot 3 @7.4s f222: SFX impact onset 7.41s vs fist contact 7.40s, +1f"`); "ok", "same",
  "looks good" are rejected. Repeating a measurement that did not change is fine; copying a whole round after the scene changed is not.
A check that cannot apply (e.g. no in-scene dialogue) is PASS with evidence of why (`"0 dialogue lines in SHOTS (grep dialogue:true = 0)"`).
Long-form: wherever a check says "every shot", do every shot — chapters are reviewed one by one, never sampled.

## THE CHECK BANK — method + pass bar for each
### STANDARD (C01–C10) — the essentials across picture, narration, sound, graphics, story
- **C01 Auto gates** — `qa_check` PASS and `av_check` PASS on the current render (both newer than the last scene edit). Zero tolerance.
- **C02 Length & format** — duration within ±5% of what Sir asked (≤ 30 s if Sir named no length); aspect/resolution/fps = CONFIG.quality;
  no letterbox/pillarbox mistakes; first and last frame are deliberate (not a half-loaded scene, not a black tail).
- **C03 Narration ↔ picture** — build the table *VO line → time → shot → what is literally on screen*. Every line shows its subject while it is
  spoken (5-word test: describe the frame in 5 words; it must match the line). No line over an unrelated or reused shot. Visual lands on or
  ≤ 0.2 s before the key word, never after.
- **C04 Narration audio** — every word intelligible on phone speakers; no clipped first/last syllables, no breaths cut mid-word, no double
  words or TTS glitches (listen to every line); pace 145–175 wpm shorts, 130–160 wpm long-form; voice sits on top: music ≥ 8 dB under the
  voice while it speaks (ducking), sfx never mask a word.
- **C05 SFX sync** — list every SFX with its time and the on-screen event it belongs to; onset within ±1 frame of the visible contact/hit/
  transition (read it off the 12 fps strip and wave.png). Every impact/whoosh/title/transition has a sound; no sound without a visible cause.
- **C06 Feet & ground** — feet planted in every shot: no float (> 2 cm), sink, or skate (planted foot moves < 1 cm while weight is on it);
  walk ≈ 1.45 m/s, run ≈ 2.57 m/s stride matches speed; contact shadows present.
- **C07 Hands & right action** — every touch/hold/point lands on its target (`reach` IK, ≤ 3 cm); props seated in the palm, fingers wrapped;
  no arm through body/prop; every clip fits the moment (sit = sit), no random moves, nobody lip-syncs the narrator.
- **C08 Framing & readability** — focal subject + the thing discussed in frame every shot; faces never cropped/covered; eyes near the upper
  third; all text inside the safe area (shorts: top 12% / bottom 20% / sides 6% clear of UI); text ≥ 4% of frame height, legible at phone size.
- **C09 Motion graphics & captions** — every title/caption/graphic eases in AND out (no linear, no pop-on/pop-off, no 1-frame flashes);
  on screen ≥ 0.4 s + 0.3 s per word; caption text = spoken words exactly (spelling, numbers, names); caption timing ±2 frames of the word;
  never two graphics fighting for the eye at once.
- **Taste (inside C08–C10)** — no machine tells (skills/taste §3), nothing against SIR'S TASTE (.motion-forge/state.md); for a revision `improve_check.js` PASS.
- **C10 Story, hook & pacing** — shorts: payoff image + hook words by 0.3 s, a beat every 2–3 s, escalation, fair twist (clue planted), loop
  ending, comment question. Long-form: cold-open hook ≤ 10 s, chapter promise kept, re-hook every 30–60 s, ending pays off the opening.
  Motion Forge only — no photos, no logos; publish pack honest.

### HIGH adds (C11–C25) — every department, every shot, deeper
- **C11 Lighting & color** — face luma 70–200 and readable in every shot; key/fill ratio fits mood; light direction consistent within a
  location; white balance consistent shot to shot; ≤ 2 saturated accent colors; skin hue natural (no grey/orange skin); no banding in gradients.
- **C12 Smoothness** — 12 fps motion strip (1–2 s) around EVERY key action and camera move: arcs (not straight lines), eases, no pops between
  consecutive frames, no frozen frames (av_check), no jitter on holds.
- **C13 Camera craft** — every move motivated and eased in/out; no unintended horizon tilt; camera never clips into geometry or a body;
  180° rule and screen direction held across cuts; lens/size fits the beat (wide for space, close for emotion).
- **C14 Edit & cuts** — cut on action; eyeline/matching action across cuts; no jump cut unless styled; no two consecutive shots with the same
  size + angle; shot lengths vary (not a metronome); transitions serve the story, max one transition style per section.
- **C15 Acting, face & eyes** — expression matches each line's emotion; blinks 8–20/min; look targets change every 1–3 s (no dead stare);
  breathing/idle micro-motion in every hold; mouth closed when not speaking.
- **C16 Weight & secondary motion** — anticipation before big actions, follow-through and settle after; landings compress; hair/cloth/props
  overlap and lag; heavy things move heavy, light things light.
- **C17 Mix balance** — av_check: integrated -14 LUFS ±1.5, true peak ≤ -1 dBTP, LRA ≤ 15 LU. By ear: voice > sfx > music in dialogue;
  low end not muddy, no harsh highs, nothing louder than the climax hit.
- **C18 Dead air & room tone** — no hole below -50 dB > 0.4 s unless a marked deliberate silence (`--holds`); ambience/room tone under every
  scene; scene changes change the ambience with the picture.
- **C19 Music structure** — music on frame 1 (or a deliberate silence-then-hit); drop/accent lands on the twist/climax within ±2 frames;
  big cuts on bar lines; mood changes follow the story beats; ending resolves (final hit or clean loop), never a hard cut-off (fade ≥ 0.3 s).
- **C20 Motion-graphics design system** — ≤ 2 typefaces, consistent sizes/weights/colors from the style bible; graphics aligned to one grid;
  consistent animation language (same ease family, same in/out style); graphics never cover faces or the focal action; icons/arrows point
  at the right thing.
- **C21 VFX quality** — every effect layered (core + smoke/sparks/debris + light on the scene + shake + character reaction); timed with
  its sound; smoke dissipates slowly; no white-out > 2 frames; no flat 2D-looking shapes.
- **C22 Continuity** — props, costume, hair, positions, damage, time of day consistent across cuts; a character's left/right hand stays the
  same hand for the same prop.
- **C23 Sound-off clarity** — watch muted: the story is understood from picture + captions alone; then audio-only (eyes closed): the narration
  + sound tell the story alone.
- **C24 Facts & text accuracy** — every claim in narration and graphics is true and sourced (story-research); numbers, units, dates, names,
  spelling checked twice; no misleading title/thumbnail.
- **C25 Every shot at full res, twice** — view every shot at final resolution (not 540p) at 3 points (20/50/85%), in two different rounds.

### MAXIMUM adds (C26–C35) — forensic, frame by frame
- **C26 Frame-by-frame key actions** — step every frame of every key action at final fps: no 1-frame pops, IK flips, interpenetration,
  limb snaps, texture flicker, z-fighting, shadow pops.
- **C27 Hands macro** — crop every visible hand in every shot at 3 times: 5 fingers, natural curl, wrist ≤ 80°, contact on target, prop seated.
- **C28 Face macro** — crop every face: eye direction correct, catchlights, no eye/teeth clipping through lids/lips, no mesh tears, skin not
  plastic, expression transitions smooth (no snapping blendshapes).
- **C29 Audio forensic** — listen to every sound soloed/in isolation: no clicks/pops at clip boundaries (5 ms fades), no identical sample
  repeated within 3 s (vary pitch/sample), no rumble < 30 Hz, no harsh sibilance, stereo balanced; every sound's tail ends cleanly.
- **C30 Narration performance** — per line: emphasis on the key word, emotion matches the beat, natural pauses (150–350 ms at commas,
  400–700 ms at beats), consistent voice character, no monotone run > 2 lines. Re-take every failing line.
- **C31 Word-level sync** — every caption word appears within ±1 frame of its spoken onset (take.words); any in-scene dialogue: visemes match
  the phonemes (closed lips on m/b/p).
- **C32 Retention audit** — shorts: one written verdict per second ("why would a viewer stay here?"); long-form: one per 10 s. Any "meh"
  second gets a beat (cut, punch-in, graphic, sound hit) and the check is redone.
- **C33 Alternate takes** — hook, twist, climax and ending each built in ≥ 2 variations (camera, timing or action); pick the winner from a
  side-by-side contact sheet; log which and why.
- **C34 Final master file** — on the actual delivered file: `av_check final.mp4 --quality <choice>` PASS; constant fps; AAC 48 kHz; A/V drift
  < 1 frame at the end; no compression blocking/banding on gradients and dark areas; thumbnail frame chosen.
- **C35 Fresh-eyes full watch** — watch the whole final start to end at real speed twice (once with sound, once muted) as a viewer about to
  swipe. Any flinch → fix → redo every check that the fix touches → another full watch.

Retention target: 80–87% stayed to watch — judge every second as a viewer about to swipe.
Never show Sir a video until `review_log.js --verify` prints REVIEW PASS.
**All review material is internal**: proof files, sheets, strips, crops, waveforms and previews are for YOUR eyes only (Read them) —
never send them to Sir (no SendUserFile, no file cards, no links), never message mid-review. Sir gets only the finished video.

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
Fix every FAIL, worst first. Re-render, re-run qa_check + av_check, log a new round (`review_log.js --round`) and re-check
EVERY check of the tier (a fix can break another). Repeat until `review_log.js --verify` prints REVIEW PASS — no round cap; if something truly
cannot pass, tell Sir in one line what and why.

## 4. Report (short)
Nothing in chat. The review is internal — never paste the checklist, the fixes or a "what's new" list into the final message.
