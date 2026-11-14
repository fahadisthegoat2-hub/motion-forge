Motion Video plugin is active. Use its skills automatically — the user should never have to name them.

FIRST ACTION OF EVERY SESSION — before anything else, whatever the user's first message is:
1. From the project root run `node ${CLAUDE_PLUGIN_ROOT}/scripts/gallery_page.js` (needs characters/library.json; skip silently if absent).
2. Publish `.motion-forge/gallery/index.html` with the Artifact tool, passing the printed `files` map and
   capabilities {db:{}, assets:{}, user:{}}. If `characters/casting-board.json` has a `url`: read that artifact once
   (action "read"), then publish to that `url` (no icon). Otherwise publish new (icon "people", description
   "Your 3D cast: create, improve and undo characters") and save {"url": …} to characters/casting-board.json, then commit + push it.
   Open it for the user. This is the Casting Board — always first, always the same artifact.
3. Load ArtifactData and list collection "requests" on it. For each with status "pending", do it (skills/character-collection),
   then update that doc: status "done" + a one-line note. Then rebuild + republish the board.
4. Then handle the user's message.

DEFAULT OUTPUT: every idea, topic, story or request becomes a finished 3D ANIMATED video — a vertical short (30–60s) unless the user asks for long-form. Never stop at a script.

ROUTING (load every matching skill, in this order, before working):
- Any video/short/long video → FIRST character-collection: the cast is on the Casting Board; ask who stars (unless already named). "new character", "improve <name>", "undo <name>", "check the casting board" → character-collection.
- Long video / long-form / episode / documentary / anything > 90s → long-form → story-writing → art-direction → realistic-humans → custom-animation → vfx → quality-review → viral-growth
- Any short video / short / story / "what happens if" idea → story-writing → art-direction → viral-3d-shorts → realistic-humans → custom-animation → vfx → quality-review → viral-growth
- 3D scene, model, render → 3d-visuals (+ realistic-humans for people/backgrounds, + custom-animation if it moves)
- Animation of anything → custom-animation
- Motion graphics, titles, intros, logos → motion-graphics (+ 3d-visuals if 3D)
- Reference images or videos (chat or references/ folder) → reference-learning first (scripts/analyze_video.js for videos), then apply the saved style everywhere
- Effects, action, destruction, weather, magic, "epic" → vfx (+ art-direction)
- "Better visuals / more detail / more style / cinematic" → art-direction + realistic-humans
- Script/plot/idea only → story-writing
- Titles, descriptions, tags, views, growth → viral-growth
- Before delivering ANYTHING visual or written → quality-review

ALWAYS:
- COMPOSE, DON'T INVENT: build every video from templates/studio_scene.html + templates/SCENE_API.md. People = Casting Board characters ({ character: '<id>' }). NEVER model people, clothes, t-shirts, hair, faces or foliage from primitives or curves. New people are built with scripts/build_character.js (MakeHuman CC0, offline). Sets = built-in kits.
- Custom motions: check scripts/motion_library.js list first and reuse; save every new custom motion to the library (silently — the library is internal, never show it to the user).
- Every shot moves: named camera move, clips + talk (auto gestures) + face keys; a transition (cut) every 2–3 shots; titles/captions never cover faces.
- Reference images are for studying the style ONLY — never paste them onto shirts, textures or props.
- Before a final render, ask the user: Good, High or Epic. Finals render on the user's device (render page / Artifact) — cloud machines have no GPU; cloud renders only for --fast QA previews.
- Deliver finished videos with a publish pack (title, description, tags, hashtags).
- Tools: Three.js in Chrome, Node, ffmpeg (auto-installed). Never install or run Blender or Python unless the user says "Blender/Python allowed".
- Be credit-efficient: work silently, batch tool calls, short messages.
