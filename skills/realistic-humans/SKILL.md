---
name: realistic-humans
description: Create realistic or semi-realistic 3D humans and believable backgrounds/environments in Three.js (Blender only when allowed) — skin, eyes, hair, clothing, posing, facial expressions, lighting and sets. Use when the user asks for a realistic person, character, human model, crowd, realistic background, room, street, or cinematic 3D environment.
---

> **Tool policy:** Use only built-in tools — Three.js/HTML/JS in the user's Chrome, Node, ffmpeg. The scripts auto-download what they need (playwright-core, ffmpeg) on first run — don't install these by hand. **Do NOT install or run Blender or Python** (no `pip`, no `bpy`, no `blender`) unless the user has explicitly said "Blender/Python allowed" in this conversation.
> **Efficiency:** Work silently — batch tool calls, no narration, no recaps. Preview at 540p / few frames (internal checks only). Final output is never below Good (1080×1920 @30fps) — always ask the user Good, High or Epic before the final render. Message the user only when done or truly blocked. Before delivering, run the `quality-review` skill.


> **Reference images are for STUDY ONLY.** Never use a reference image (or a crop of it) as a texture,
> decal, shirt print, poster, background plate or any other image inside the scene, and never copy
> text, logos or names from it onto clothing or props. Recreate the *look* from scratch with
> materials, colors, lighting and shapes. Clothing = plain solid colors (or a simple original
> pattern) unless the user explicitly asks for a print.

# Realistic Humans & Sets

## Pipeline
1. **Three.js (DEFAULT)** — copy `${CLAUDE_PLUGIN_ROOT}/templates/studio_scene.html` and follow
   `${CLAUDE_PLUGIN_ROOT}/templates/SCENE_API.md`. It already does: auto-scale, material upgrade
   (warm skin sheen, glossy eyes with catchlights, fabric sheen), solid wardrobe colors, soft
   key/fill/rim + contact shadows, DoF, grain/vignette, auto-retargeted Mixamo clips and the
   always-on life layer (breathing, saccades, blinks, look-at, talk).
2. **Blender + Cycles (ONLY if user said "Blender/Python allowed")** —
   `blender -b -P ${CLAUDE_PLUGIN_ROOT}/scripts/blender_base_scene.py -- --out renders/ --character model.fbx --render`.

## Getting the human (never model a body from primitives, never use Xbot as a person)
| Priority | Source | Notes |
|---|---|---|
| 1 | `characters/*.glb|fbx` in the project | The user's own. Check this folder first, every time. |
| 2 | **Avaturn** GLB (free, iPad-friendly) | Realistic, ARKit face shapes → blinks + expressions |
| 3 | **Mixamo** FBX (free Adobe acct) | Good bodies, no face shapes |
| 4 | Sample `readyplayer.me.glb` (template default) | Placeholder semi-real man (hat, mustache) |
If the result needs a specific look the sample can't give (casual tee, woman, child), tell the
user once, in one line, how to add a character (see `characters/README.md`) — then continue with
the sample instead of blocking. Multiple people = multiple CAST entries (vary height 1.6–1.9,
wardrobe colors). Extra motions: Mixamo FBX "Without Skin" in `animations/`.

## Skin & face realism checklist
- Principled BSDF: Subsurface Weight 0.15–0.3, Radius (1.0, 0.35, 0.2), Scale ~0.01 m,
  Roughness 0.35–0.5 with a variation map (oilier T-zone), Specular IOR Level 0.5.
- Normal/pore detail map at low strength (0.2–0.4); slight redness on nose, ears, knuckles.
- **Eyes sell the shot**: separate cornea (glass, IOR 1.376), wet tear line, catchlight
  from the key light, 1–2mm eyelid shadow (AO).
- Hair: particle/curves hair or hair cards; bald heads need specular breakup + stubble.
- Micro-asymmetry (brows, mouth corners); never perfectly symmetric poses.
- Expression = brows + eyelids + mouth corners together. Push it 20–30% for comedy/drama.

## Detail pass (hair, brows, eyes — "sculpted", not plastic)
- The template auto-upgrades hair/brows/lashes/beards: anisotropic highlight band, soft
  sheen, alpha-to-coverage edges (no jagged cards). Pick characters whose hair is modelled
  in clumps (Avaturn styles) — clumped silhouettes read "sculpted".
- Eyes: glossy clearcoat cornea + catchlight from the key; keep key light in front-side so
  both eyes catch it; saccades + blinks are automatic.
- Faces read at phone size: light from 30–45° above/side (short-side lighting), rim on hair.
- Close-ups (fov 20–26): add `dust` in front for depth; bokeh focus is auto on the hero's head.

## Clothing
Fabric with sheen 0.3–0.6, weave normal map, cloth sim or sculpted folds at joints,
contact shadows where shirt meets body. Saturated solid colors read best on mobile.

## Backgrounds
- **Studio seamless (shorts look)**: curved cyclorama, vertical gradient
  (e.g. #7fd3f0 → #1e8fc7), soft floor shadow, slight vignette.
- **Environments**: HDRI from Poly Haven for light, real-scale geometry (doors 2.1 m,
  counters 0.9 m), bevel every edge, dirt/wear masks, volumetric haze through windows,
  foreground occluder for depth, shallow DoF (f/2.8–4) to hide background simplicity.

## Camera & framing
fov 38–45 wide/establishing, 30–34 medium, 22–28 close-up faces (vertical fov). Eye-line
slightly above lens for heroic, below for vulnerable. Always some `handheld` (0.5–1.2).
Blender mode only: Cycles 128–256 samples + denoise, AgX.

## Avoid the uncanny valley
Dead eyes (no catchlight), plastic skin (uniform roughness), floating feet, T-pose
leftovers, frozen face during dialogue — always add blinks (every 2–5s), breathing, and
micro head motion.
