---
description: Make a motion graphics piece and render it to MP4/GIF
argument-hint: <brief> [16:9|9:16|1:1] [seconds] [--gif]
---
Use the `motion-graphics` skill (plus `3d-visuals` if it needs 3D). Brief: $ARGUMENTS

Write a beat sheet first, build the HTML scene with `window.__mf`, render with
`node ${CLAUDE_PLUGIN_ROOT}/scripts/render_video.js`, inspect key frames, fix issues,
and deliver the video path.
