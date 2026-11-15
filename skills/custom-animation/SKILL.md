---
name: custom-animation
description: Design and code custom animations with real animator craft — keyframes, easing curves, springs, secondary motion, character/object rigs, procedural and 3D animation (Three.js, GSAP, CSS, Web Animations, canvas). Use when the user asks to animate something, make motion feel better, create an animation, or rig/move a 3D object or character.
---

> **Tool policy:** Use only built-in tools — Three.js/HTML/JS in the user's Chrome, Node, ffmpeg. The scripts auto-download what they need (playwright-core, ffmpeg) on first run — don't install these by hand. **Do NOT install or run Blender or Python** (no `pip`, no `bpy`, no `blender`) unless the user has explicitly said "Blender/Python allowed" in this conversation.
> **Efficiency:** Work silently — batch tool calls, no narration, no recaps. Preview at 540p / few frames (internal checks only). Final output is never below Good (1080×1920 @30fps) — the quality and effort level were asked at the start of the video (hooks/context.md). Message the user only when done or truly blocked. Before delivering, run the `quality-review` skill.

# Custom Animation — animator's craft in code

## Apply the 12 principles (translated to code)
| Principle | Implementation |
|---|---|
| Squash & stretch | Scale Y↓ X↑ on impact, preserve volume: `sx = 1/sqrt(sy)` |
| Anticipation | Small reverse move (5–15%) before the main action, 80–150ms |
| Staging | One focal motion at a time; dim/slow everything else |
| Straight-ahead vs pose-to-pose | Physics/procedural vs keyframed timelines |
| Follow-through & overlap | Children lag parents: offset 2–6 frames, or spring-follow |
| Slow in/out | Never linear except mechanical/looping rotation |
| Arcs | Interpolate paths on curves (`CatmullRomCurve3`, bezier), not straight lines |
| Secondary action | Breathing, blinks, hair/antenna springs, cloth wobble |
| Timing | Heavy = slow settle; light = quick, more overshoot |
| Exaggeration | Push poses 20–30% past "realistic" for clarity |
| Solid drawing | Keep volumes consistent across poses |
| Appeal | Clear silhouettes in every key pose |

## Easing vocabulary (pick by intent)
- Enter: `expo.out` / `cubic-bezier(0.16,1,0.3,1)` — fast arrival, soft settle
- Exit: `cubic-bezier(0.7,0,0.84,0)` (in) — exits accelerate away, shorter than enters
- Move on screen: `cubic-bezier(0.65,0,0.35,1)` (inOut)
- Playful: `back.out(1.7)` or a spring
- **Springs** for anything interactive (interruptible, physical):
  ```js
  // semi-implicit Euler; stiffness 120–300, damping 12–26
  v += (-k*(x - target) - c*v) * dt; x += v * dt;
  ```

## Timing defaults (60fps)
Micro UI 120–200ms · element enter 300–500ms · scene transition 600–900ms ·
stagger 30–80ms per item · hold key poses ≥ 6 frames so they read.

## Tools
- **GSAP** (`gsap@3.12.5`, cdnjs): timelines with labels, `"<"`/`">-0.2"` overlap,
  `CustomEase`-like bezier strings. Make timelines seekable: `tl.pause(); tl.seek(t)`.
- **Three.js characters**: use the studio template's system (`templates/SCENE_API.md`): clip
  scheduling with cross-fades, auto-retargeting, foot-locked locomotion, look-at springs,
  faces, posed gestures with fingers. Don't hand-roll mixers for characters.
- **CSS/WAAPI** for DOM UI motion; animate only `transform`/`opacity`.

## Never stiff — character checklist (apply to EVERY shot)
- **Never a single static clip for a whole shot.** Layer: body clip + `look` changes + `face`
  keys + a posed gesture or `hands` pose. Something meaningful changes every 0.8–1.5s.
- **Eyes lead, head follows, body last**: change `look` 0.1–0.2s before a turn (`rotY`) or
  clip change. Turns use `outCubic`/`inOutSine` over 0.4–0.7s, never instant.
- **Anticipation + overlap**: before a big reaction, a 0.1–0.2s counter-move (small `rotY` or
  `pos` dip) then the action; let faces settle *after* the body (`outBack` then ease down).
- **Cross-fade every clip change** (`fade` 0.25–0.45). Overlap clip windows by the fade.
- **Locomotion**: walk ≈ 1.45 m/s, run ≈ 2.57 m/s; feet are auto-locked to distance travelled.
  Ease into/out of walks (first/last 0.3s of `pos` keys `inOutSine`) — no instant starts/stops.
- **Expressions**: build → peak (`outBack`, 0.2s) → hold → relax to 30–50%, never snap to 0.
- **Acting, not talking**: the narrator is invisible — characters never mouth the voiceover or explain to the camera. They DO what the line says (clip + posed gesture + face + look target). `talk` only with `dialogue: true` for a real in-scene line.
- **Hands**: every held pose gets a finger pose (`hands: { right: 'fist' }` or the gesture's own); gestures come from the posed list (point · stop · shrug · think · headhold · gasp · hips · clap · thumbsup …) — they are IK-solved, so the hand lands where it should on any clip.
  A clip made for a prop (carry, push, phone, eat) is only used with that prop attached (`attach: 'hero.hands'` / `grip: true`). Check every hand in the QA sheet: no folded wrists, no hands inside the body or floating beside the thing they hold.
- **Camera is a character**: slow push-ins (2–5%/s), `handheld` 0.5–1.2, `shakes` on impacts,
  cut on action (start the next shot mid-movement).
- **Hold key poses** ≥ 0.4s so they read on a phone.

## Custom keyframed motion — never limited to the clip library
The clips are only a base layer. Build any action (jumps, falls, punches, dances, panic, sneaking, climbing, collapsing) with
`bones` keys per joint + root `pos`/`rotX`/`rotY`/`rotZ` keys (templates/SCENE_API.md → Custom animation). Block the key poses first,
then add anticipation (0.1–0.2s counter-move), overshoot (`outBack`), follow-through on arms/head 2–4 frames later, and a settle.
Check it with a --fast frame strip (8–12fps around the action) and fix pops, foot sliding and floaty timing.

## Motion library (Claude's private library — never show or mention it unless the user asks)
Every custom motion is saved and reused: `animations/custom/motions.json` via `node ${CLAUDE_PLUGIN_ROOT}/scripts/motion_library.js list|show|add|remove`.
1. **Before** authoring a motion, run `motion_library.js list` (optionally a tag) and reuse a match via `cast.<id>.motions = [{ name, start, speed, amount, loop, hold }]`.
2. **After** authoring a new one in a shot (bones / pos / rotX-Z / face keys), generalize it: times start at 0, `pos`/`rot` are offsets
   relative to the character, then save it with a clear verb-noun name, 3–6 tags, `dur` and a one-line `about`:
   write the JSON to a temp file → `motion_library.js add <name> motion.json`. Switch the shot to use it by name.
3. Improve motions in place (same name) when a shot needs a better version; commit + push `animations/custom/` with the video work.

## Auto-acting (template)
- Characters glance around on their own when idle (`acting: calm | big | none`). Body language is DIRECTED: one posed gesture or clip change per beat, matched to what the narrator says at that moment.
- Clips: idle · walk · jog · sprint · dance · crouch (Quaternius) + Xbot/Soldier/Michelle + `animations/*.fbx`.

## Body language toolkit (template)
- `gestures: [{ type, start, end, side: right|left|both, amount, to, fingers }]` — `point, handsup, shrug, armsout, fistpump, cheer,
  shield, think, facepalm, gasp, headhold, salute, wave, stop, thumbsup, scared, hips, clap, plead, beat, open, explain, present, count, lean, slump`.
  Each is an absolute pose (hand IK + finger pose) with anticipation, overshoot (`outBack`), a living hold and a soft settle; the body leads and the
  hand drags behind. They blend from any clip. One clear gesture per narrated beat — it must MEAN what the narrator is saying.
- Blasts/impacts (`explosion`, `shockwave`) automatically make nearby characters recoil
  (lean away + head whip + flinch + shock face). Add `shield`/`scared` gestures for the hold.
- Extra Mixamo motions: `animations/*.fbx` ("Without Skin") → retargeted onto everyone.

## Workflow
1. Write a **beat sheet**: time → action → easing → why (intent).
2. Block key poses (pose-to-pose), check silhouettes.
3. Add timing/spacing, then overlap + secondary motion.
4. Polish: arcs, settle, micro-holds. Respect `prefers-reduced-motion`.
5. Expose `window.__mf = {duration, fps, render(t)}` and render frames to check spacing
   (`scripts/render_video.js --frames-only`) — look at the frame strip like an animator's
   onion skin.
