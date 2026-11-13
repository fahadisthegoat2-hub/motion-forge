---
name: viral-3d-shorts
description: Produce vertical 3D-animated story/explainer shorts (TikTok, YouTube Shorts, Reels) in the popular clean semi-realistic CG style — "what happens if", body/medical cutaways, POV stories, survival scenarios, weird facts. Use when the user asks for a 3D short, viral 3D video, Zack D. Films-style / 3D explainer-style content, or a 3D story video.
---

> **Tool policy:** Use only built-in tools — Three.js/HTML/JS in the user's Chrome, Node, ffmpeg. The scripts auto-download what they need (playwright-core, ffmpeg) on first run — don't install these by hand. **Do NOT install or run Blender or Python** (no `pip`, no `bpy`, no `blender`) unless the user has explicitly said "Blender/Python allowed" in this conversation.
> **Efficiency:** Work silently — batch tool calls, no narration, no recaps. Preview at 540p / few frames (internal checks only). Final output is never below Good (1080×1920 @30fps) — always ask the user Good, High or Epic before the final render. Message the user only when done or truly blocked. Before delivering, run the `quality-review` skill.


> **Reference images are for STUDY ONLY.** Never use a reference image (or a crop of it) as a texture,
> decal, shirt print, poster, background plate or any other image inside the scene, and never copy
> text, logos or names from it onto clothing or props. Recreate the *look* from scratch with
> materials, colors, lighting and shapes. Clothing = plain solid colors (or a simple original
> pattern) unless the user explicitly asks for a print.

# Viral 3D Shorts — the clean semi-real CG look

Capture the **genre look**, but make original characters, names and branding. Never
copy a creator's logo, name, intro, or recurring characters onto shirts or titles.

## The look (style bible — save to `.motion-forge/styles/clean-cg-shorts.md`)
- **Characters**: semi-realistic CG humans (Character Creator / Daz / MPFB2 level),
  smooth clean skin with soft SSS, short neat hair or bald, slightly idealized proportions.
- **Wardrobe**: bold solid colors (lime, red, cobalt, color-block tees), plain jeans or
  check trousers, white/red sneakers. One saturated hero color per character.
- **Sets**: seamless gradient studio (sky-cyan → deeper blue, or light grey) OR simple
  clean real locations (bathroom, street, hospital, plane). Low clutter.
- **Lighting**: big soft key at 45° front, gentle fill, cool rim on the shoulders; soft
  contact shadow on the floor. Bright, high-key, low noise.
- **Expressions/poses**: exaggerated and readable at thumbnail size — worried brows,
  wide eyes, hands on hips, recoil, crouch. Hold each pose ≥ 0.5s.
- **Cutaways**: X-ray/inside-the-body shots (translucent skin shell + glowing organs),
  macro close-ups, slow-mo for the climax moment.

## Edit grammar
- 9:16, 1080×1920, 30–60s, **new shot every 1.5–3s**.
- Camera: slow push-ins, orbit reveals, snap zooms on the twist, POV shots.
- Narration: fast, clear, second person ("you"), ~2.5–3 words/sec.
- Captions: bold sans, 1–3 words at a time, centered lower third, key word highlighted.
- Sound: whooshes on cuts, low boom on the twist, subtle riser into climax.

## Production pipeline
1. Script with the `story-writing` skill (hook → escalation → climax → twist).
2. Turn the script into a **shot list** (shot #, duration, framing, camera move, action,
   expression, VO line, SFX).
3. Build sets + characters with `realistic-humans` from `templates/studio_scene.html`
   (Three.js) — reuse one base rig; one HTML file per shot, each exposing `window.__mf`.
4. Animate: Mixamo body clips + keyed facial expressions + `custom-animation` principles.
5. Render each shot with `node ${CLAUDE_PLUGIN_ROOT}/scripts/render_video.js shotN.html shotN.mp4`,
   then assemble with ffmpeg (concat + VO + music). Captions: draw them in the HTML scene
   (word-by-word, timed to `t`) so no extra tools are needed.
6. Run `quality-review` (contact sheet of frames, fix everything, max 3 rounds).
7. **Device render (default for final quality):** build the whole short as ONE HTML with a
   shot timeline (`shots=[{start,end,setup(),update(t)}]`, one `window.__mf` for the full
   duration, captions drawn in-scene), include `templates/device_render_panel.html` before
   </body>, and publish it with the Artifact tool if available, else open it with
   `node ${CLAUDE_PLUGIN_ROOT}/scripts/open_in_chrome.js short.html`. The user clicks **Render MP4** and it renders on their own GPU at the tier their
   specs support. Custom GLB models must be fetchable URLs or base64-embedded.
8. Run `viral-growth` → write `publish.md` (titles, description, tags, hashtags, pinned
   comment, cover frame). Final message: artifact link/MP4 path + publish pack, nothing else.
