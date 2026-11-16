---
name: viral-3d-shorts
description: Produce vertical 3D-animated story/explainer shorts (TikTok, YouTube Shorts, Reels) in the popular clean semi-realistic CG style — "what happens if", body/medical cutaways, POV stories, survival scenarios, weird facts. Use when the user asks for a 3D short, viral 3D video, Zack D. Films-style / 3D explainer-style content, or a 3D story video.
---

> **Tool policy:** Use only built-in tools — Three.js/HTML/JS in the user's Chrome, Node, ffmpeg. The scripts auto-download what they need (playwright-core, ffmpeg) on first run — don't install these by hand. **Do NOT install or run Blender or Python** (no `pip`, no `bpy`, no `blender`) unless the user has explicitly said "Blender/Python allowed" in this conversation.
> **Efficiency:** Work silently — batch tool calls, no narration, no recaps. Preview at 540p / few frames (internal checks only). Final output is never below Good (1080×1920 @30fps) — the quality and effort level were asked at the start of the video (hooks/context.md). Message the user only when done or truly blocked. Before delivering, run the `quality-review` skill.


> **Reference images are for STUDY ONLY.** Never use a reference image (or a crop of it) as a texture,
> decal, shirt print, poster, background plate or any other image inside the scene, and never copy
> text, logos or names from it onto clothing or props. Recreate the *look* from scratch with
> materials, colors, lighting and shapes. Clothing = plain solid colors (or a simple original
> pattern) unless the user explicitly asks for a print.

> **Algorithm fit:** design from `youtube-algorithm` (what the feed measures, targets, length, safe zones, packaging) — its rules win over older numbers here.

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
- 9:16, 1080×1920, 25–35 s by default (Shorts allow up to 3 min — only when every second earns it), **new shot every 1.5–3s**.
- Safe zone: no words in the top 8%, the bottom 22% or the right 15% of the lower half (YouTube UI).
- Camera: slow push-ins, orbit reveals, snap zooms on the twist, POV shots.
- Narration: fast, clear, second person ("you"), ~2.5–3 words/sec.
- Captions: bold sans, 1–3 words at a time, centered lower third, key word highlighted.
- Sound: whooshes on cuts, low boom on the twist, subtle riser into climax.

## Production
- Scene format: `${CLAUDE_PLUGIN_ROOT}/templates/SCENE_API.md` (CAST / SHOTS / CAPTIONS, auto life layer). pipeline
Always apply `art-direction` (look brief, per-shot `look`/`set`) and `vfx` for any action beat; study `references/` (images + videos) with `reference-learning` first if present.
1. Script with the `story-writing` skill (hook → escalation → climax → twist).
2. Turn the script into a **visual plan table** with `visual-clarity` (line → what the viewer must understand →
   literal visual + explainer graphic → camera by meaning → duration, expression, SFX).
3. Build sets + characters with `realistic-humans` from `templates/studio_scene.html`
   (Three.js) — reuse one base rig; one HTML file per shot, each exposing `window.__mf`.
4. Animate: Mixamo body clips + keyed facial expressions + `custom-animation` principles.
5. Render each shot with `node ${CLAUDE_PLUGIN_ROOT}/scripts/render_video.js shotN.html shotN.mp4`,
   then assemble with ffmpeg (concat + VO + music). Captions: draw them in the HTML scene
   (word-by-word, timed to `t`) so no extra tools are needed.
6. Run `quality-review` (contact sheet of every shot, fix everything, at least 2 full rounds).
7. **Device render (default for final quality):** build the whole short as ONE HTML with a
   shot timeline (`shots=[{start,end,setup(),update(t)}]`, one `window.__mf` for the full
   duration, captions drawn in-scene), include `templates/device_render_panel.html` before
   </body>, and pack it (`node ${CLAUDE_PLUGIN_ROOT}/scripts/pack_scene.js short.html` → pass the printed JSON as `files`, plus `capabilities: { downloads: true }` so the Download MP4 button works) and
   publish it with the Artifact tool if available, else open it with
   `node ${CLAUDE_PLUGIN_ROOT}/scripts/open_in_chrome.js short.html`. Set `CONFIG.quality` first: the page then renders the MP4 BY ITSELF on the user's GPU the moment it opens (reads the device's specs, no buttons) and shows the finished video with Save — never tell the user to click anything. Custom GLB models must be fetchable URLs or base64-embedded.
8. Run `viral-growth` → write `publish.md` (titles, description, tags, hashtags, pinned
   comment, cover frame). Final message: artifact link/MP4 path + publish pack, nothing else (no review text, no feature lists).

## SHORTS RETENTION FORMULA (mandatory — a short that feels like a documentary is a FAIL)
**Voice**: second person or a character in danger, present tense, urgent. Never "In this video…", "Did you know…", "Let's…",
calm narrator facts, history lessons or slow intros. Every line ≤ 10 words, every line is a NEW image or a NEW stake.

**0–2 s HOOK** (pick one, the scariest/strangest version of the premise, shown not told):
- Impossible situation: "You wake up and the whole city is a jungle."
- Countdown: "You have 60 seconds before your heart stops."
- Payoff first: show the crazy end state, then "here's how it happened."
- Direct threat: "If you're reading this, don't touch the water."
On screen by 0.3 s: hook title (slam) + caption + a hit sound + the most dramatic image. First shot ≤ 2 s.

**Beat map** (45 s example): 0–2 hook · 2–6 setup + plant the twist clue · 6–30 three escalations, each WORSE, each opened by a
re-hook line ("but that's not the worst part…", "then it moved.") · 30–38 climax (slow-mo/freeze/silence, then drop) ·
38–43 twist (smash cut, boom) · 43–45 loop line that leads back into the first frame.

**Rhythm**: shots 0.8–2.2 s (avg ≤ 2.4 s), a beat (cut, title, punch-in, effect, sound hit) at least every 2–3 s, speed ramps on action,
music drops on the twist, captions word-by-word the whole way. Voiceover at Voice Studio speed 1.1–1.2 with excited/dramatic tones on
the hook and twist. `qa_check.js` fails any short that breaks these numbers.

**Before building**: write 5 hooks, score each (stops the scroll? visual? curiosity gap?), keep the best. Read the script out loud in
your head at 1.15× — if any 3 seconds would let a viewer swipe, rewrite them.

## CHANNEL DATA (from Sir's analytics — these rules override older ones)
Best short: 43% stayed. Flops: 75–80% swiped in the first second, viewers gone by 0:13 because the payoff came too late,
34% stayed when the twist was slow. GOAL: 80–87% stayed to watch.
1. **0.0 s = motion + shock line on screen** — never a still face, a title card or a slow push. Camera AND subject move on frame 1.
2. **Payoff first, then rewind**: shot 1 shows the most shocking result / the twist image (mark it `role: 'payoff'`), then
   "3 days earlier…" and the story. The twist is teased in second 1 and paid off at the end.
3. **New angle or zoom every 2–3 s** (cut, punch-in or a camera move) — no exceptions.
4. **25–35 s** for shorts unless Sir asks for another length.
5. **Ending loops into the start** (the last line/image leads straight into shot 1).
6. **One comment question** at the end (caption + pinned comment), e.g. "Would you have survived?".
7. **Niche: crazy TRUE stories** (story-research) — same niche every day so the algorithm learns the audience.
