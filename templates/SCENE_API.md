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
    motions: [{ name, start, speed?, amount?, loop?, hold? }], // saved custom motions (animations/custom/motions.json)
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

## Editing & sound (see skills/editing)
`CONFIG.sound = { music: { mood, bpm?, key?, volume?, drops: [t] }, sfx: true, ambience: true, voice: { url }, track: { url } }` ·
`CONFIG.letterbox` · per shot: `time` (speed ramp keys), `freeze: [[at, hold]]`, `punch: [t]`, `letterbox`, `sfx: [{ t, type, gain }]`.
Sound effects are automatic for cuts, FX, titles, camera hits, footsteps and saved-motion events; sets add ambience.
Renders (device panel and render_video.js) mux the soundtrack into the MP4.

## Inside the body — real 3D (prefer these over 2D)
- Micro worlds: `set: 'blood' | 'fat' | 'neurons' | 'artery'` (camera flies forward automatically; characters hidden). `shot.micro = { level: keys 0..1, flow }`:
  blood = sugar crystals, fat = cell size, neurons = firing rate, artery = plaque (narrows and slows the flow).
- 3D lens: `{ style: 'inset', at: 'hero.belly', world: 'fat', level: [[0,1],[2,0.3]], text, sub }` → the real micro world inside a glass circle.
- X-ray body: cast `xray: [[0.3, 0], [0.9, 1]]` (+ `xrayColor`) → hologram body; add `scan` and `pulse` on organs. Dark sets/looks (void, neon-night) read best.

## Thumbnails (see skills/thumbnails)
`const THUMBS = [{ shot, t, text, hi, accent, sub, face, cast, set, look, size, az, shift, side, arrow, circle, titles, split, labels, boost }]` (default background: `set: 'thumb'` colorful glow studio) → `node scripts/thumbnail.js scene.html thumbs --fast` (drafts + preview.jpg), `--only N` (final), `--cover` (1080×1920).

## Explainer graphics (see skills/visual-clarity) — TITLES that explain
Any title can follow a body part or 3D point: `at: 'hero.heart'` (+ `offset: [dx, dy]`). Parts: head brain face eyes mouth throat chest heart lungs stomach liver belly fat gut hips lefthand righthand leftarm rightarm leftknee rightknee skin feet.
```js
{ t, t1, style: 'callout', at: 'hero.heart', text: 'HEART', sub: '-10 BPM', icon: 'heart', side?: 1|-1 }   // leader line + label
{ t, t1, style: 'pulse',   at: 'hero.belly', beat?: 70, text?, radius? }                         // glowing organ highlight
{ t, t1, style: 'inset',   at: 'hero.belly', kind: 'fat|blood|neurons|artery|cells', level: [[0,1],[2,0.3]], text, sub } // magnified inside view (auto-placed beside the part, away from the face)
{ t, t1, style: 'chart',   pos, text, points: [90,180,70], labels, marks: [{ i: 1, text: 'SPIKE' }], limit, limitText, box: [w,h] }
{ t, t1, style: 'bars',    pos, text, items: [{ label, value, color }], suffix }
{ t, t1, style: 'list',    pos, text, items: ['Clearer skin', { text: 'Cravings', icon: 'cross', strike: true }], gap }
{ t, t1, style: 'card',    pos, text, sub, icon, enter: 'left|right|up' }
{ t: 0, t1: TOTAL, style: 'timeline', pos: [0.5, 0.06], marks: [{ t: 0, text: 'DAY 1' }, { t: 9, text: 'WEEK 1' }] }
{ t, t1, style: 'arrow',   path: ['hero.mouth', 'hero.stomach'], text }  ·  { style: 'arrow', dir: 'up|down', text: 'ENERGY' }
{ t, t1, style: 'icon',    icon: 'heart|brain|bolt|flame|drop|sugar|warning|check|cross|clock|battery|star|eye|moon|up|down|plus|minus', beat?, text }
{ t, t1, style: 'bubble',  at: 'hero.head', text: 'just one more...', thought?: true }
{ t, t1, style: 'scan' }                                                                   // x-ray scan sweep
```
All get automatic sounds. Panels go where the face isn't (frame the hero `mls`/`ws` low in frame for data panels).

## CAPTIONS & TITLES (drawn into the video)
`CAPTIONS = [{ t, t1?, text, hi: ['WORD'] }]` — word-by-word pop, highlighted words yellow, at `captionY`.
`TITLES = [{ t, t1, style, text, pos:[x,y], size, color, accent, sub, from, to, prefix, suffix, value, radius }]`
styles: `slam` (hook titles, `\n` stacks lines, last line accent) · `stack` · `typewriter` · `counter`
· `glitch` · `lower-third` · `stamp` · `meter` · `ring` (highlight circle) · `tag` (pill label like "DAY 30").
Keep titles in the top 25% and captions in the bottom 30%; never cover the face.

## Rendering
- QA in the cloud (no GPU): `node ${CLAUDE_PLUGIN_ROOT}/scripts/render_video.js scene.html prev.mp4 --fast --width 405 --height 720 --fps 4 --frames-only`
- Artifact page: `node ${CLAUDE_PLUGIN_ROOT}/scripts/pack_scene.js scene.html` → publish scene.html with the printed JSON as `files` (artifacts can't load .glb or the GitHub CDN otherwise — no characters).
- Finals: on the user's device (open the page → Render panel), or cloud `--quality good|high|epic` only if asked (slow).
