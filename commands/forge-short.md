---
description: Make a full vertical 3D story short — script, scenes, QA, on-device render, publish pack
argument-hint: <premise> [seconds]
---
Use `story-writing`, `art-direction`, `viral-3d-shorts`, `realistic-humans`, `custom-animation`, `vfx`,
`quality-review` and `viral-growth`. Premise: $ARGUMENTS

Tool policy: Three.js + Node + ffmpeg only; no Blender/Python unless I said
"Blender/Python allowed". Work silently, batch tool calls.

Steps: script with twist → shot list → single-HTML short from
`${CLAUDE_PLUGIN_ROOT}/templates/studio_scene.html` (includes the device render panel) →
540p preview + `quality-review` until it passes → ask me: Good, High or Epic → publish as an Artifact for on-device
render (or MP4 via `scripts/render_video.js --quality <choice>`) → `viral-growth` publish pack.
One final message only: link/path + title, description, tags, hashtags.
