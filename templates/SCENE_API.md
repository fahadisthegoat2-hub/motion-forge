# Studio scene API (templates/studio_scene.html)

Copy the template next to the project files (e.g. `scenes/my-short.html`) and edit only the
**DIRECTION** block (CONFIG · CAST · SHOTS · CAPTIONS · TITLES). Everything is a pure function of
time `t`, so previews, cloud renders and on-device renders are frame-identical.

**Golden rule: compose, don't invent.** Use the built-in actors, clips, sets, effects and titles.
Never model people, clothes, hair, faces or foliage from primitives — that is what looks cheap.

## CONFIG
`targetDuration` (the length the user asked for, seconds) · `width/height` (1080×1920 shorts · 1920×1080 long-form) · `fps` · `look` · `set` · `captionY`
(0..1, default 0.74) · `quality` (good | high | epic — the page renders itself at this quality) · `captions` (see CAPTIONS) · `animations` (clip libraries; any Mixamo/Unreal/MakeHuman clip is
auto-retargeted onto every actor).

**look** (`CONFIG.look` / per-shot `shot.look`): `clean-cg · cinematic · warm-film · noir · neon-night ·
dreamy · horror · golden-hour`.
**set** (`CONFIG.set` / per-shot `shot.set`): `studio · void · outdoor · ocean (open sea swell + foam; `{ type: 'ocean', swell: 0..2, calm: m }` — calm patch at the origin for rafts) · medieval (village street, CC0 kit) · interior · street-night ·
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

## Clips (plain names: sit sitdown standup kneel fix crouch crouchwalk pickup push carry eat phone foldarms nod no thumbsup jump jumploop land roll climb punch hit die swim drive chop… — 89 real animations)
One-shot clips hold their LAST pose with `loop: false` (sitdown, die, pickup, jump…). `kneel` = upright on one knee, hand resting on it · `fix` = the same clip hunched over, working on the ground.
**Clips made for a prop need the prop:** `carry` → a model with `attach: 'hero.hands'` · `push` → something to push in front · `phone`/`eat` → a held model with `grip: true`. No prop = pick another clip.
**ONE NARRATOR, NEVER ON SCREEN:** the voiceover is an invisible narrator. Characters are the people in the story: they act it out and never mouth the narration (`talk` is ignored unless the cast entry has `dialogue: true` for a real in-scene line).
Hand IK: `reach: [{ hand: 'right'|'left'|'both', to: 'castId.part' | [x,y,z], offset, start, end }]` — hands land exactly on targets (within arm reach; qa_check measures it). Held models: fx model `attach: 'hero.righthand'`.

### Original clip list
`idle · walk · jog · sprint · dance · crouch` (Quaternius CC0) · `run · agree · headshake · sad_pose ·
sneak_pose` (Xbot) · `sambadance` (Michelle) + anything in `animations/*.fbx`.
Walk ≈ 1.45 m/s, jog/run ≈ 2.6 m/s — feet lock to distance travelled.

## SHOTS (play back-to-back)
```js
{ name, dur, chapter?, look?, set?, cut?, fadeIn?, fadeOut?, flash?,
  camera: { move, target, size, az, height, span, side, at, with, fov, ease, handheld, roll, shakes, eye }   // eye: exact eye-line height (auto-lowered for kneel/crouch/sit)
          // or manual: { pos: keys, look: keys, fov }
  cast: { hero: {
    pos: keys([x,y,z]), rotY: keys(rad),
    clips: [{ clip, start, end, fade?, speed?, loop? }],
    look: keys([x,y,z] | 'camera'),
    face: { smile|smirk|shock|scream|worried|sad|angry|disgust|squint: keys(0..1) },
    gestures: [{ type, start, end, side?: 'right'|'left'|'both', amount?, to?, fingers?, n? }],   // posed with IK + fingers (list below)
    hands: { right: 'fist' | keys, left, both },   // finger pose any time: relaxed open soft flat fist point peace thumbsup grip claw pinch count1…5
    dialogue: true, talk: [[start, end], ...], // ONLY for a real line spoken in the scene (never for the narrator's voiceover): lip-sync + talking gestures
    swimming: true,                            // in water (ocean set): feet/ground checks off
    acting: 'auto' | 'calm' | 'big' | 'none',  // idle glances (+ gestures while in dialogue)
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
**size**: `ecu · cu · mcu · ms · mls · ws · ews` (or metres = exact frame height). `with: [x,y,z]` pans toward a second
subject (e.g. an explosion) while keeping the actor in frame. In vertical video the eyes sit about a third down at every size, so the top fifth is free for titles.
`crash-zoom` starts wide and lands on the asked size · `reveal` slides the subject in from the frame edge · `over-shoulder` sits behind the other person's shoulder (`over: 'castId'`, default the nearest other cast member).

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

### Gestures — posed with hand IK and fingers (anticipation → overshoot → living hold → settle; the body leads, the hand drags behind)
`point · handsup · shrug · armsout · fistpump · cheer · shield · think · facepalm · gasp · headhold · salute · wave · stop · thumbsup · scared · hips · clap · plead ·
beat · open · explain · present · count · lean · slump`.
They are absolute poses blended from whatever the clip is doing, so they read the same on idle, sit, walk… `point` aims with `to: 'pal.head' | [x,y,z] | 'camera'`; `count` takes `n: 1–5`;
any gesture takes `fingers: 'fist'`. Wrists never fold or twist past real limits (qa_check fails deformed hands and hands inside the body). New poses: add to `POSES` in the scene file.

### Epic action (anime / superhero)
`shot.afterimage: 0.85` (or keys) = speed trails · `shot.impact: [t]` = anime impact frames (flash + hard B/W frames) ·
TITLES `{ style: 'speedlines', t, t1, mode: 'radial'|'horizontal', center, density, color }` · any fx `attach: 'hero.righthand'` rides on a body part.
Combos: punch = `punch-impact` at the fist + `impact` + radial speedlines + punch-in; dash = `speed-dash` + `afterimage` + horizontal speedlines;
power-up = `power-aura` (attach hips) + shake + rising music; landing = `ground-slam` + `impact`.

### Effects (`fx`) — see skills/vfx (all of them, with previews, in the VFX Library artifact)
`explosion · fire · smoke · sparks · magic · lightning · shockwave · beam · dust · embers · rain · snow · splash`.

## Editing & sound (see skills/editing)
`CONFIG.sound = { music: { mood, bpm?, key?, volume?, drops: [t] }, sfx: true, ambience: true, voice: { url }, track: { url } }` ·
`CONFIG.letterbox` · per shot: `time` (speed ramp keys), `freeze: [[at, hold]]`, `punch: [t]`, `letterbox`, `sfx: [{ t, type, gain }]`.
Sound effects are automatic for cuts, FX, titles, camera hits, footsteps and saved-motion events; sets add ambience.
Renders (device panel and render_video.js) mux the soundtrack into the MP4.

## 3D models (Model Forge, see skills/model-forge)
`fx: [{ type: 'model', id, pos, height, rotY, spin, bob, pulse, p: keys, scale: keys, tilt: keys([pitch,yaw,roll]), start, end, color, flat (true = drop the texture, pure color) }]` — any model in assets/models (models.json).
Held and carried things: `attach: 'hero.righthand'` (+ `grip: true` → follows the hand itself, `rot: [x,y,z]` to seat it) · `attach: 'hero.hands'` = between both hands (with the `carry` clip). They turn with the character.

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
`CAPTIONS = [{ t, t1?, text, hi: ['WORD'], w?: [start time of each word], style?, size?, y? }]` at `captionY`.
`CONFIG.captions = { style, size, color, hi, active, y, upper, sync, group }` — styles: `pop` (words pop in as spoken, default) · `karaoke` (a highlight box glides word to word) · `one` (one huge word at a time) · `box` (dark plate).
**Voice sync:** `sync: take.words` (the voiceover's word times) puts every caption word on its spoken word; with `CAPTIONS = []` the captions are written from the words automatically.

`TITLES = [{ t, t1, style, text, pos:[x,y], size, color, accent, sub, … }]` — every style also takes `in` / `out` moves: `pop · fade · up · down · left · right · zoom · drop · spin · blur · none`
(`inDur`, `outDur`), `rotate`, `float`. Long text shrinks to fit the frame by itself.
Hook & type: `slam` (`\n` stacks lines, last line accent) · `kinetic` (`text: 'THIS|CHANGES|EVERYTHING'`, `hi`, one phrase at a time, each with a different entrance) · `letters` (letter-by-letter rise, `hi`, `wave`)
· `marker` (highlighter swipes behind `hi` words) · `wipe` (bar reveals a name plate, `sub`) · `underline` · `stack` · `typewriter` · `glitch` · `stamp` · `burst` (comic starburst) · `zoomthrough` (word flies through the lens, on a cut) · `tag`.
Numbers & data: `counter` · `stat` (`value`, `max`, `suffix`, `text` — big number in a progress ring) · `meter` · `versus` (`a: { text, value }`, `b: {…}` — panels slam together, winner framed) · `countdown` (`from`, `step`, `text: 'GO!'`) · `steps` (`items`, active step grows).
Story furniture: `lower-third` · `place` (typed location/date stamp, `sub`) · `chapter` (line opens, title drops out, `sub: 'PART 2'`) · `quote` (word by word, `sub: '— Name'`) · `ticker` (news band, `label`) · `cta` (follow/subscribe button that gets tapped: `text`, `done`, `sub`, `icon: 'bell'|'like'|'heart'`)
· `ring` · `box` (frame draws itself around `at: 'hero.head'`, `box: [w,h]`).
Keep titles in the top 25% and captions in the bottom 30%; never cover the face.

## Rendering
- QA in the cloud (no GPU): `node ${CLAUDE_PLUGIN_ROOT}/scripts/render_video.js scene.html prev.mp4 --fast --width 405 --height 720 --fps 4 --frames-only`
- Artifact page: `node ${CLAUDE_PLUGIN_ROOT}/scripts/pack_scene.js scene.html` → publish scene.html with the printed JSON as `files` and `capabilities: { downloads: true }` (Download MP4 button) (artifacts can't load .glb or the GitHub CDN otherwise — no characters).
- Finals render THEMSELVES: set `CONFIG.quality` (good | high | epic), publish the page — the moment it opens it reads the device's specs and renders the MP4 on that device with sound (no buttons), then shows the finished video with Save.
  `CONFIG.autoRender = false` or `?preview` in the address turns that off. Cloud `--quality good|high|epic` only if asked (slow, no GPU).
- Old scenes get engine fixes with `node ${CLAUDE_PLUGIN_ROOT}/scripts/upgrade_scene.js scene.html` (keeps the DIRECTION block, swaps in the current engine; re-run qa_check after).
