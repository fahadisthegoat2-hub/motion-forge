---
name: vfx
description: Cinema-grade visual and special effects for 3D videos — explosions, fire, smoke, sparks, magic/energy, lightning, shockwaves, rain, snow, dust, light shafts, splashes, debris, impacts and superpowers. Use whenever a scene needs any effect, action, destruction, weather, atmosphere, magic, sci-fi or "make it epic".
---

> **Tool policy:** Three.js in the user's Chrome, Node, ffmpeg only (scripts auto-install). Never Blender/Python unless the user said "Blender/Python allowed".
> **Efficiency:** Work silently, batch tool calls, one final message. Run `quality-review` before delivering.

# VFX — movie-level, never cheap

Engine: `${CLAUDE_PLUGIN_ROOT}/templates/studio_scene.html` → per-shot `fx: [...]` (see
`templates/SCENE_API.md`). Particles are GPU-analytic (seekable, frame-exact), noise-shaped
(no plain circles/quads), lit (smoke self-shadows, fire lights the scene), HDR + bloom.

## Built-in effects
| type | key params | what you get |
|---|---|---|
| `explosion` | `t, pos, scale, seed` | flash core, premultiplied fireball, lit smoke column, streak sparks with floor bounce, hot irregular debris, ground dust ring, shockwave ring, point light, camera shake, character recoil |
| `fire` | `start, end, pos, scale` | flame tongues (domain-warped teardrops), hot core, smoke, embers, flickering light |
| `smoke` | `start, end, pos, scale, color, opacity, wind` | billowing lit smoke column |
| `sparks` | `t, pos, dir, spread, count, color` | welding/impact sparks, motion streaks, bounce |
| `magic` | `start, end, pos, scale, color, color2` | swirling energy motes, glints, glow core, colored light |
| `lightning` | `t, pos(top), to(ground), seed` | branching bolt, triple flicker, scene flash, shake |
| `shockwave` | `t, pos, scale, color` | fresnel energy sphere + shake + recoil |
| `beam` | `pos, to, radius, color, intensity` | volumetric light shaft with drifting motes |
| `dust` / `embers` | `count, shape, color` | atmospheric depth (use in most shots) |
| `rain` / `snow` | `count, opacity` | camera-following weather volume |
| `splash` | `t, pos, dir, color` | liquid droplets with highlights |

## The 7 rules of rich effects
1. **Layer every effect** — primary (fireball/bolt) + secondary (smoke, sparks, debris) +
   tertiary (dust, embers, light on surroundings, camera shake, character reaction). One
   layer alone always looks cheap.
2. **Timing beats**: anticipation (0.1–0.3s glow/rumble/charge-up) → impact frame (1–2
   frames of flash) → fast expansion (`outExpo`) → hang time → slow dissipation (2–5s smoke).
3. **Scale cues**: bigger = slower. Large explosions: more smoke, slower rise, debris
   arcs > 1s, camera far + long lens. Small = fast, bright, few particles.
4. **Light interaction**: effects must light the world — the built-ins add point lights;
   add `flash`/look choices so faces and floor react. Dark looks (`cinematic`, `neon-night`,
   `horror`) make effects pop; bright studio washes them out.
5. **Color temperature**: fire white-yellow core → orange → deep red edges → grey-black
   smoke. Magic: two complementary hues max. Never pure white everything.
6. **Composition**: place effects off-center, partially occluded by foreground (character,
   set pieces) for depth; let the hero react (recoil is automatic within ~6m; add
   `gestures: shield/scared/handsup` + `face: shock`).
7. **Camera sells it**: `shakes` (auto on blasts), quick push-in or whip, slow-mo feel by
   stretching the shot and slowing clips (`speed: 0.4`).

## Recipes (stack effects)
- **Car/gas explosion**: `explosion` scale 1.5 + `fire` (start t+0.3) + `smoke` + `embers` + look `cinematic`.
- **Superhero landing**: `shockwave` + `sparks` (dir up, spread 1) + `smoke` low ring + strong shake.
- **Spell cast**: 0.4s `magic` charge (small scale) → `shockwave` (same color) → `magic` big + `beam` from hand.
- **Storm**: set `outdoor`, look `horror`, `rain`, `lightning` every 2–4s with different seeds, `dust` off.
- **Haunted room**: set `interior`, look `horror`, `beam` + `dust`, `smoke` low, flicker via lightning far away.
- **Meteor**: `magic` (orange colors, small) moving via several shots + `explosion` scale 2 on impact.

## Custom effects
Need something new (portal, tornado, blood-free impact, water jet)? Write a new preset in
`FXP` using `emitter({ mode: fire|smoke|spark|glow|mote|rain|liquid, count, t0, t1|burst, life, speed,
dir, spread, drag, gravity, buoy, turb, turbF, swirl, wind, shape, size, colA/colB/colC, hdr, opacity })`
plus meshes with custom shaders. Keep it deterministic (function of time, `hash()` for randomness).

## Never
Flat untextured spheres/cubes as effects · uniform particle sizes · everything additive white ·
linear fades · effects that don't light anything · no smoke after fire · effects without a
reaction from character/camera.

## VFX library (fx/library.json) — reuse, invent, save
`node ${CLAUDE_PLUGIN_ROOT}/scripts/vfx_library.js list` → ready effects: muzzle-flash · portal · fireworks · confetti · electric-arc · blood-splash ·
ice-shatter · poison-gas · heal-glow · black-hole · meteor · bubbles · falling-leaves · sandstorm · dust-burst · energy-charge (+ the built-ins).
Use like any effect: `fx: [{ type: 'portal', start, end, pos, scale, color, color2 }]` (bursts use `t`).
**Need something new?** Design it as layers (each layer = one particle emitter: mode fire|smoke|spark|glow|mote|rain|liquid, count, life, speed, dir,
spread, gravity, drag, buoy, turb, swirl, radial, shape, size [start,end], colA/colB/colC, hdr, opacity, stretch; `at`/`until` for timing inside a
burst, `continuous` + `pre` for running effects) + optional `light`, `shake`, `flash`, `sfx`. Render a test strip, fix it until it looks
premium, then save it with `vfx_library.js add <name> file.json` silently — it becomes reusable in every future video.
