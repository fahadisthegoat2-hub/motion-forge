---
name: motion-graphics
description: Produce polished motion graphics — kinetic typography, logo reveals, explainer sequences, title cards, transitions, data-driven motion, loops — and render them to MP4/GIF. Use when the user asks for motion graphics, an intro/outro, logo animation, animated title, promo video, social clip, or a looping animation.
---

> **Tool policy:** Use only built-in tools — Three.js/HTML/JS in the user's Chrome, Node, ffmpeg. The scripts auto-download what they need (playwright-core, ffmpeg) on first run — don't install these by hand. **Do NOT install or run Blender or Python** (no `pip`, no `bpy`, no `blender`) unless the user has explicitly said "Blender/Python allowed" in this conversation.
> **Efficiency:** Work silently — batch tool calls, no narration, no recaps. Preview at 540p / few frames (internal checks only). Final output is never below Good (1080×1920 @30fps) — the quality and effort level were asked at the start of the video (hooks/context.md). Message the user only when done or truly blocked. Before delivering, run the `quality-review` skill.

# Motion Graphics

Final renders: the quality was asked at the start (CONFIG.quality) — the published page renders itself on the user's device; never ask again.

Build as one HTML file (Canvas2D, SVG or Three.js + GSAP), driven by a single time `t`,
then render to video with the bundled renderer.

## Built-in kinetic titles (3D videos)
In the studio template use `TITLES` (see templates/SCENE_API.md). Pick the style by the job — never plain text that just appears:
- **Hook (first 0.3s):** `slam`, `kinetic` (phrase-by-phrase: `'HE DIED|7 TIMES'`), `burst`, `glitch`.
- **Emphasis on a word:** `marker` (highlighter swipe), `underline`, `letters`, `stamp` ("FAKE"/"TRUE"), `zoomthrough` across a cut.
- **Numbers:** `counter`, `stat` (number in a ring), `meter`, `versus` (A vs B), `countdown`, `chart`, `bars`.
- **Structure:** `chapter`, `place` (where/when), `steps`, `timeline`, `tag` ("DAY 30"), `lower-third`/`wipe` (who), `quote`, `ticker`.
- **Point at things:** `callout`, `ring`, `box`, `arrow`, `pulse`, `inset`.  **Ending:** `cta` (follow button that gets tapped) + the comment question.
Every title has an entrance AND an exit (`in` / `out`: pop fade up down left right zoom drop spin blur), lands on a beat or a spoken word, and lives 1–2.5s. One graphic per beat, never over the face.
**ONE DESIGN SYSTEM PER VIDEO (taste rule):** pick it once and keep it — one accent colour (`CONFIG.accent`, never per-title colours unless it means something: red = danger, green = success),
one caption style, and a small family of 3–4 title styles that share shapes and motion (e.g. `kinetic` + `marker` + `stat` + `callout`). Same in/out move family for the whole video.
No style salad: comic `burst`, `glitch`, `stamp`, speech `bubble` are special-occasion (max one, once) — never mixed in the same video. Less is more: white type, one accent, clean ease-out, small overshoot.
Captions: `CONFIG.captions.style` = pop · karaoke · one · box, synced to the voice with `sync: take.words`.

## Design rules
- **Grid & safe areas**: 1920×1080 (16:9), 1080×1920 (9:16), 1080×1080. Keep text inside
  90% title-safe.
- **Hierarchy over time**: one idea per beat (≈1.5–3s). Reading time ≈ 0.3s per word + 1s.
- **Typography**: max 2 families; heavy display weight for hero words; animate by line →
  word → char (split text) with 20–40ms char stagger, mask reveals (clip-path / overflow
  hidden) instead of plain fades.
- **Transitions with intent**: match cuts, mask wipes, shape morphs, zoom-through,
  whip-pan blur. Elements exit in the direction the next scene enters.
- **Polish layer**: motion blur (accumulate 4–8 sub-frames or directional blur on fast
  moves), subtle grain, vignette, parallax layers, light leaks/glows tied to beats.
- **Rhythm**: if there's music, place beats on BPM grid (`beat = 60/bpm`). Hits on
  downbeats, settles between.
- **Loops**: last frame = first frame. Use `t/duration` phase and periodic functions.
- **Color**: follow `.motion-forge/styles/` bible if present; otherwise 1 bg, 1 surface,
  1 accent, 1 text.

## Structure
```js
const scenes = [ {start:0, end:2.5, draw: introTitle}, {start:2.2, end:5, draw: reveal} ];
// overlap scenes 0.2–0.4s for transitions
window.__mf = { duration: 6, fps: 60, width: 1920, height: 1080, render(t) { ... } };
```

## Render
```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/render_video.js scene.html out.mp4
# options: --fps 60 --width 1920 --height 1080 --gif --frames-only
```
Deterministic: renderer calls `__mf.render(t)` per frame — no `requestAnimationFrame`
or `Date.now()` drift. Then check 4–6 key frames with Read before delivering.
