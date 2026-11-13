# Studio scene API (templates/studio_scene.html)

Copy the template next to the project files (e.g. `scenes/my-short.html`) and edit only the
**DIRECTION** block. Everything is a pure function of time `t`, so previews, cloud renders and
on-device renders are identical.

## CONFIG
`width/height` (1080×1920 shorts · 1920×1080 long-form) · `fps` · `bgTop/bgBottom` (studio
gradient) · `grain` · `vignette` · `animations: [urls]` — clip libraries. Any Mixamo/humanoid
clip is **auto-retargeted** onto every character (world-space transfer + rest-pose calibration,
so T-pose and A-pose rigs both work).

Built-in clips: `idle, walk, run, agree, headshake, sad_pose, sneak_pose` (+ `tpose`).
User clips: Mixamo FBX in `animations/` → add `'animations/Waving.fbx'` → clip `waving`.

**look** (`CONFIG.look` or per-shot `shot.look`): `clean-cg · cinematic · warm-film · noir · neon-night ·
dreamy · horror · golden-hour` — light rig + split-tone grade + bloom + fog + chromatic aberration + grain.
**set** (`CONFIG.set` or per-shot `shot.set`): `studio` (gradient cyclorama) · `void` (dark glossy floor) ·
`outdoor` (grass, hills, sky with sun) · `interior` (wood floor, plaster walls, window + light shaft) ·
`street-night` (wet concrete, buildings with lit windows, street lamp + beam, dust) · `{ url, scale, pos, rotY }` GLB.

## CAST
```js
hero: { urls: ['characters/hero.glb', 'characters/hero.fbx', LIB + 'readyplayer.me.glb'],
        height: 1.80, wardrobe: { top: '#b6f22e', bottom: null, shoes: null } }
```
First URL that loads wins. Model auto-scaled to `height`, materials auto-upgraded (skin
sheen + warmth, glossy eyes, fabric sheen). `wardrobe` = plain solid clothing colors.

## SHOTS (play back-to-back)
```js
{ name, dur, chapter?, fadeIn?, fadeOut?, flash?,
  camera: { pos: keys, look: keys, fov: keys|number, handheld: 0..2, shakes: [{ t, amp, decay }] },
  cast: { hero: {
    pos: keys([x,y,z]), rotY: keys(radians),            // placement; omit a character to hide it
    clips: [{ clip, start, end, fade?, speed?, offset?, loop? }],
    look: keys([x,y,z] | 'camera'),                      // head+neck+spine+eyes, spring-smoothed
    face: { smile|shock|worried|sad|angry: keys(0..1) }, // ARKit/RPM morphs, auto-mapped
    talk: [[start, end], ...],                           // mouth flap + speech head-nods
    gestures: [{ type, start, end, side?, amount? }],    // point handsup shrug armsout fistpump shield think facepalm wave lean slump scared
  } },
  fx: [{ type, t | start/end, pos, scale, ... }],        // see skills/vfx — explosion fire smoke sparks magic lightning shockwave beam dust embers rain snow splash
  look?, set?, flash? }
```
**keys** = `[[time, value, ease?], ...]` in shot-local seconds. Eases: `linear inSine outSine
inOutSine inCubic outCubic inOutCubic outExpo inOutExpo outBack outElastic spring`.
A shot's `chapter: 'Name'` starts a render Part (long-form).

## Automatic life layer (always on — never disable)
Breathing (3.8s) · weight-shift sway · micro head noise · eyes lead the head with saccades
every 0.45–2s · spring-smoothed look-at (spine 15% / neck 35% / head 50%) · blinks every
2–5s (if the model has blink morphs) · talk mouth + nods · clip cross-fades · **foot-locked
locomotion**: when a walk/run clip plays while `pos` moves, the cycle phase follows distance
travelled, so feet never skate. Natural speeds: walk 1.45 m/s, run 2.57 m/s — plan `pos`
keys near those speeds.

## CAPTIONS
`[{ t, t1?, text, hi: ['WORD'] }]` — word-by-word pop-in, highlighted words in yellow, drawn
into the video (works in every render path).

## Rendering
- Preview / QA: `node ${CLAUDE_PLUGIN_ROOT}/scripts/render_video.js scene.html prev.mp4 --width 540 --height 960 --fps 4 --frames-only`
- Final (cloud): `--quality good|high|epic` (+ `--chapter N` for long-form parts)
- Final (device): open the page → Render on this device panel.
Sample models come from the three.js CDN; if blocked, the renderer fetches them via git automatically.
