---
description: Make a full vertical 3D story short — script, scenes, QA, on-device render, publish pack
argument-hint: <premise> [seconds]
---
Use `story-writing`, `art-direction`, `viral-3d-shorts`, `realistic-humans`, `custom-animation`, `vfx`,
`quality-review` and `viral-growth`. Premise: $ARGUMENTS

Tool policy: Three.js + Node + ffmpeg only; no Blender/Python unless I said
"Blender/Python allowed". Work silently, batch tool calls.

Steps: FIRST ask me video quality (Good/High/Epic) and effort level (Standard/High/Maximum) in one question → script with twist → visual plan table (`visual-clarity`: literal visual + explainer graphics per line) → single-HTML short from
`${CLAUDE_PLUGIN_ROOT}/templates/studio_scene.html` (set CONFIG.quality — the page renders itself on my device when it opens; the narrator is invisible, characters act and never lip-sync) →
540p preview + `quality-review` (effort tier: 10/25/35 checks × 2/4/6 rounds) until `review_log.js --verify` passes → (quality + effort asked at the start) → `scripts/pack_scene.js` → publish (with `capabilities: { downloads: true }`) as an Artifact (with the printed files map) for on-device
render (or MP4 via `scripts/render_video.js --quality <choice>`) → `viral-growth` publish pack.
One final message only: link/path + title, description, tags, hashtags.
