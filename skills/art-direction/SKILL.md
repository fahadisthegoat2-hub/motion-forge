---
name: art-direction
description: Give every 3D video its own taste instead of generic "AI slop" — look/grade choice, color script, composition, lenses, lighting motivation, production design detail and signature touches. Use for every 3D scene, short or long video, and whenever the user asks for better visuals, more style, more detail, or "make it look professional/cinematic".
---

> **Efficiency:** Decide fast, apply directly in the scene file, no essays to the user.

# Art Direction — make it look *designed*

Before building, write a 5-line **look brief** in the script doc (not in chat):
1. **Mood word** (e.g. "dread", "wonder", "chaos", "cozy").
2. **Look** — pick from `clean-cg · cinematic · warm-film · noir · neon-night · dreamy · horror · golden-hour`
   (per shot via `shot.look`) — or the saved style bible from `.motion-forge/styles/`.
3. **Color script** — one dominant hue + one accent; how color shifts across the story
   (e.g. warm safety → cold danger → red climax → warm relief).
4. **Signature** — one recurring visual idea unique to this video (a color, a prop, a camera
   move, a light shape) that makes it memorable.
5. **Set per beat** — `studio · void · outdoor · interior · street-night · custom GLB`.

## Anti-slop rules
- **Motivated light**: every light has a story source (window, lamp, fire, screen, sun).
  Rim light separates the hero from the background in every shot.
- **Value structure**: subject brightest/most contrasty; background 1–2 stops darker.
  Squint test — the focal point must still read.
- **Composition**: rule of thirds or strong deliberate center; leading lines; foreground
  element for depth in at least 1 of every 3 shots; never the same framing twice in a row.
- **Lens language**: wide (fov 40–50) = world/isolation, normal (30–36) = story,
  tight (20–26) = emotion. Low angle = power, high = vulnerability, dutch only for unease.
- **Shot variety**: alternate wide/medium/close/insert; cut on action; 1.5–3s shots
  (shorts), 3–6s (long-form).
- **Detail density**: hero zone detailed (face, hands, props), rest calm. Add `dust` or
  `embers` for depth in most shots; texture beats flat color.
- **Restraint**: max 2 saturated colors on screen; let darkness exist; no rainbow grading.
- **Characters**: distinct silhouettes and wardrobe colors per person; heights vary;
  expressions pushed 20–30%; never default T-pose or mannequins.

## Signature touches (pick 1–2 per video)
Slow push-in on every reveal · color shift on the twist (`shot.look` change) · single
hard light beam (`beam`) in key scenes · smash-cut to `void` set for inner thoughts ·
freeze-frame + caption on the climax · recurring motif prop.

## Self-check (in quality-review)
Could this frame be from a real studio's short? If it looks like a default render,
change: look, angle, light direction, foreground depth, color accent — then re-render.
