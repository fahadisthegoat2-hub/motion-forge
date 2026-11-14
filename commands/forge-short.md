---
description: Make a full vertical 3D story short — script, scenes, QA, on-device render, publish pack
argument-hint: <premise> [seconds]
---
Use `story-writing`, `art-direction`, `viral-3d-shorts`, `realistic-humans`, `custom-animation`, `vfx`,
`quality-review` and `viral-growth`. Premise: $ARGUMENTS

Tool policy: Three.js + Node + ffmpeg only; no Blender/Python unless I said
"Blender/Python allowed". Work silently, batch tool calls.

Steps: FIRST ask me video quality (Good/High/Epic) and effort level (Standard/High/Maximum) in one question → script with twist → visual plan table (`visual-clarity`: literal visual + explainer graphics per line) → single-HTML short from
`${CLAUDE_PLUGIN_ROOT}/templates/studio_scene.html` (includes the device render panel) →
540p preview + `quality-review` (≥2 full rounds on every shot) until it passes → (quality + effort asked at the start) → `scripts/pack_scene.js` → publish as an Artifact (with the printed files map) for on-device
render (or MP4 via `scripts/render_video.js --quality <choice>`) → `viral-growth` publish pack.
One final message only: link/path + title, description, tags, hashtags.
