# Studio scene API (templates/studio_scene.html)

Copy the template next to the project files (e.g. `scenes/my-short.html`) and edit only the
**DIRECTION** block (CONFIG · CAST · SHOTS · CAPTIONS · TITLES). Everything is a pure function of
time `t`, so previews, cloud renders and on-device renders are frame-identical.

**Golden rule: compose, don't invent.** Use the built-in actors, clips, sets, effects and titles.
Never model people, clothes, hair, faces or foliage from primitives — that is what looks cheap.

## CONFIG
`width/height` (1080×1920 shorts · 1920×1080 long-form) · `fps` · `look` · `set` · `captionY`
(0..1, default 0.74) · `animations` (clip libraries; any Mixamo/Unreal/MakeHuman clip is
auto-retargeted onto every actor).

**look** (`CONFIG.look` / per-shot `shot.look`): `clean-cg · cinematic · warm-film · noir · neon-night ·
dreamy · horror · golden-hour`.
**set** (`CONFIG.set` / per-shot `shot.set`): `studio · void · outdoor · interior · street-night ·
jungle · lab · city-day · space · { url, scale, pos, rotY }` (GLB).

## CAST — built-in CC0 actors (dressed, real hair, face rigs, lip-sync)
```js
hero: { actor: 'jake',            // jake (casual top + trousers) · marcus (big build, work overalls)
        height: 1.80,             // metres (0.3–3.2)
        wardrobe: { top: '#2e6bd6', bottom: '#20242c', shoes: null, print: false },  // keeps fabric shading
        skin: 'medium',           // pale · light · medium · tan · brown · dark · '#hex'
        hair: '#2a1b12' }         // hair color
```
From the collection: `{ character: 'leo' }` (characters/library.json — see skills/character-collection).
Your own characters: `urls: ['characters/name.glb']` (Avaturn GLB / Mixamo FBX) or a file named
`characters/<castId>.glb`. Several people = several cast entries (vary height, skin, hair, wardrobe).

## Clips
`idle · walk · jog · sprint · dance · crouch` (Quaternius CC0) · `run · agree · headshake · sad_pose ·
sneak_pose` (Xbot) · `sambadance` (Michelle) + anything in `animations/*.fbx`.
Walk ≈ 1.45 m/s, jog/run ≈ 2.6 m/s — feet lock to distance travelled.

## SHOTS (play back-to-back)
```js
{ name, dur, chapter?, look?, set?, cut?, fadeIn?, fadeOut?, flash?,
  camera: { move, target, size, az, height, span, side, at, with, fov, ease, handheld, roll, shakes }
          // or manual: { pos: keys, look: keys, fov }
  cast: { hero: {
    pos: keys([x,y,z]), rotY: keys(rad),
    clips: [{ clip, start, end, fade?, speed?, loop? }],
    look: keys([x,y,z] | 'camera'),
    face: { smile|smirk|shock|scream|worried|sad|angry|disgust|squint: keys(0..1) },
    talk: [[start, end], ...], talkRate?,      // syllable lip-sync + automatic hand gestures
    gestures: [{ type, start, end, side?, amount? }],
    acting: 'auto' | 'calm' | 'big' | 'none',  // auto talk gestures + idle glances (default auto)
    bones: { <joint>: keys([pitch, yaw, roll]) }, // CUSTOM animation: any joint, layered on the clip (see below)
    rotX: keys, rotZ: keys,                    // whole-body flips, falls, tumbles (with rotY)
  } },
  fx: [{ type, t | start/end, pos, scale, ... }] }
```
**keys** = `[[time, value, ease?], ...]` (shot-local seconds). Eases: `linear inSine outSine inOutSine
inCubic outCubic inOutCubic outExpo inOutExpo outBack outElastic spring`.

### Camera moves (auto-framed on the target's eye line; `az` is relative to the target's facing, 0 = their face)
`static · dolly-in · push · dolly-out · orbit (span°) · crane-up · crane-down · low-hero · overhead ·
crash-zoom (at) · reveal · track/follow (rides beside a walking character, side: left|right) ·
over-shoulder · dutch`.
**size**: `ecu · cu · mcu · ms · mls · ws · ews` (or metres). `with: [x,y,z]` pans toward a second
subject (e.g. an explosion) while keeping the actor in frame.

### Transitions (`shot.cut` = how this shot comes in)
`whip · zoom · spin · glitch · flash · dip · smash · blur` — motion-blurred camera moves across the cut.
Use one every 2–3 cuts; hard cuts are fine in between.

### Custom animation (not limited to the library)
Animate anything by keyframing joints: `bones: { rightarm: [[0,[0,0,0]], [0.4,[0,0,-2.4],'outBack'], [1.2,[0,0,0]]] }`.
Joints: hips spine spine1 spine2 neck head · leftshoulder leftarm leftforearm lefthand (+ right…) · leftupleg leftleg leftfoot lefttoebase (+ right…).
Values are radians in the character's own space: **pitch** + tips forward/down (legs swing forward, head nods down) · **yaw** + turns toward the character's left ·
**roll** − raises the RIGHT arm outward/up, + raises the LEFT arm (mirror for left/right). Crouch/land = lower the root with `pos` y −0.1…−0.3 while bending
`upleg` (+pitch) and `leg` (−pitch). Jumps = `pos` y up with outCubic, down with inCubic. Layer on top of a clip, add anticipation
before and overshoot/settle after (see skills/custom-animation). New reusable poses can be added to `GESTURES` in the scene file.

### Gestures (auto anticipation → overshoot → living hold → settle)
`point · handsup · shrug · armsout · fistpump · shield · think · facepalm · wave · lean · slump · scared ·
beat · explain · present · count`.

### Effects (`fx`) — see skills/vfx
`explosion · fire · smoke · sparks · magic · lightning · shockwave · beam · dust · embers · rain · snow · splash`.

## CAPTIONS & TITLES (drawn into the video)
`CAPTIONS = [{ t, t1?, text, hi: ['WORD'] }]` — word-by-word pop, highlighted words yellow, at `captionY`.
`TITLES = [{ t, t1, style, text, pos:[x,y], size, color, accent, sub, from, to, prefix, suffix, value, radius }]`
styles: `slam` (hook titles, `\n` stacks lines, last line accent) · `stack` · `typewriter` · `counter`
· `glitch` · `lower-third` · `stamp` · `meter` · `ring` (highlight circle) · `tag` (pill label like "DAY 30").
Keep titles in the top 25% and captions in the bottom 30%; never cover the face.

## Rendering
- QA in the cloud (no GPU): `node ${CLAUDE_PLUGIN_ROOT}/scripts/render_video.js scene.html prev.mp4 --fast --width 405 --height 720 --fps 4 --frames-only`
- Finals: on the user's device (open the page → Render panel), or cloud `--quality good|high|epic` only if asked (slow).
