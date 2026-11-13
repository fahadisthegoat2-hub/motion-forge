---
name: reference-learning
description: Study reference images (screenshots, concept art, renders, film stills, UI shots) and distill them into a reusable "style bible" that drives later 3D, animation and motion work. Use whenever the user shares reference images, says "make it look like this", "match this style", "learn from these", or asks to analyze art direction.
---

> **Tool policy:** Use only built-in tools — Three.js/HTML/JS in the user's Chrome, Node, ffmpeg. The scripts auto-download what they need (playwright-core, ffmpeg) on first run — don't install these by hand. **Do NOT install or run Blender or Python** (no `pip`, no `bpy`, no `blender`) unless the user has explicitly said "Blender/Python allowed" in this conversation.
> **Efficiency:** Work silently — batch tool calls, no narration, no recaps. Preview at 540p / few frames (internal checks only). Final output is never below Good (1080×1920 @30fps) — always ask the user Good, High or Epic before the final render. Message the user only when done or truly blocked. Before delivering, run the `quality-review` skill.


> **Reference images are for STUDY ONLY.** Never use a reference image (or a crop of it) as a texture,
> decal, shirt print, poster, background plate or any other image inside the scene, and never copy
> text, logos or names from it onto clothing or props. Recreate the *look* from scratch with
> materials, colors, lighting and shapes. Clothing = plain solid colors (or a simple original
> pattern) unless the user explicitly asks for a print.

# Reference Learning — turn images into a reusable style

Goal: don't copy the reference. **Extract the rules that produced it**, then extrapolate
further than the reference shows (other angles, motion, states, lighting conditions).

## 1. Measure (objective)
Run the palette/value analyzer on every image:
```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/analyze_reference.js path/to/img1.png path/to/img2.jpg
```
It returns: dominant palette (hex + %), value range & contrast, average saturation,
warm/cool bias, and a key/fill split. Treat these numbers as ground truth over your impression.

## 2. Look (subjective) — view each image with the Read tool and note:
| Axis | Questions |
|---|---|
| Form language | Geometric vs organic? Bevel size? Chunky vs thin? Silhouette readability? |
| Lighting | Key direction, hardness, rim light? Ambient occlusion strength? Time of day? |
| Materials | Roughness range, metalness, subsurface, toon/cel, clay, glass? |
| Camera | Focal length feel (wide/tele), height, DoF, dutch angle? |
| Composition | Rule of thirds, centered, negative space, leading lines, depth layers? |
| Color script | Accent color usage %, complementary pairs, how color directs the eye |
| Detail density | Where detail clusters vs. rest areas (detail hierarchy) |
| Implied motion | What would move, how fast, and with what easing personality? |

## 3. Infer (go beyond the images)
Write the **rules**, not descriptions. Bad: "the cube is blue". Good: "accents are
saturated cyan used on ≤10% of frame, only on interactive/hero elements".
Then extrapolate: how would this style animate? What does it look like at night? What
is the hover/press/idle motion? What would break the style (anti-rules)?

## 4. Save the style bible (this is the "learning")
Write to `.motion-forge/styles/<style-name>.md` in the project:

```markdown
# Style: <name>
Sources: <files>
## Palette        (hex + role: bg / surface / key / accent / shadow tint)
## Values         (contrast ratio, shadow darkness, highlight clamp)
## Lighting rig   (key/fill/rim: color, intensity, angle; env map; fog)
## Materials      (per surface type: roughness, metalness, extras)
## Form rules     (bevels, proportions, silhouette)
## Camera         (fov, height, DoF, moves allowed)
## Motion personality (easing curves, durations, overshoot, stagger)
## Do / Don't     (anti-rules)
## Three.js preset (paste-ready code constants)
```
Before any later 3D/animation task, check `.motion-forge/styles/` and apply the
matching bible. When the user gives feedback, **update the bible** so the style improves
over time.
