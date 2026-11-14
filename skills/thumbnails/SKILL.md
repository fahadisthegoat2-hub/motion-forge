---
name: thumbnails
description: High-CTR thumbnails and cover frames for every finished video, rendered from the real 3D scene (scripts/thumbnail.js). Makes many variants silently, judges them at phone size and delivers ONLY the single best one. Use when a video is finished, or the user asks for a thumbnail, cover, CTR or clicks.
---

# Thumbnails — many drafts, one winner, zero noise

**Silence rule:** make as many variants as you want, review and fix them privately. The user sees exactly ONE thumbnail:
the winner, at full quality. Never show drafts, comparisons, "here are 3 options" or a correction of an earlier thumbnail.

## 1. Write 4–6 variants into the scene (`const THUMBS = [...]` in the DIRECTION block)
`{ shot, t, text, hi, accent, sub, face: { hero: { shock: 1 } }, cast: { hero: { xray: 1 } }, set, look, size, az, camera, shift, side, arrow, circle, titles }`
- `titles`: body-anchored graphics drawn under the text, e.g. `[{ style: 'pulse', at: 'hero.heart', accent: '#ff3b5c' }]`.
- `shot` + `t`: the moment (any shot, any time); `face` / `cast` override the expression or state; `set` / `look` override the world.
- Framing defaults to a big face (`size: 'mcu'`), pushed to the side opposite the text (`side: 'left'` text, `shift` 0.2). Micro-world shots: `shift: 0`.
- `arrow` / `circle`: a body part (`'hero.heart'`) or 3D point. Red, one at most.
- Vary the IDEA between variants (different moment, emotion, text angle, world), not just colors.

## 2. CTR rules (score each variant 1–10 on each, keep the best total)
1. **One focal point**, huge: a face with an extreme emotion (shock, disgust, fear, joy) ≥ 35% of the height, or one striking 3D image (x-ray body, inside-the-body world, explosion).
2. **2–4 words**, ≤ 2 lines, that ADD to the title (curiosity gap), never repeat it. One accent word (`hi`). Numbers and "you/your" work.
3. **Readable at phone size**: check `preview.jpg` (every variant at ~200 px wide). If the words or the subject don't read there, it fails.
4. **Contrast**: subject separated from the background (rim light, dark vs bright, complementary colors); faces lit, never muddy.
5. **Curiosity**: show the moment BEFORE the payoff or the strange result, not the answer. Honest: it must happen in the video.
6. **Clean**: ≤ 3 elements (subject, text, one arrow/circle). No logos, no clutter, nothing in the bottom-right corner (YouTube timestamp).
7. **Shorts**: the cover is chosen in-app from the video. Make the first frame a strong cover too, and render a `--cover` 1080×1920 version.

## 3. Render → judge → final
- Drafts: `node ${CLAUDE_PLUGIN_ROOT}/scripts/thumbnail.js scene.html thumbs --fast` → view `thumbs/preview.jpg` + the full-size drafts, score, fix, repeat if nothing scores ≥ 8.
- Final: `node ${CLAUDE_PLUGIN_ROOT}/scripts/thumbnail.js scene.html thumbs --only <N>` (full quality) and `--cover` for Shorts.
- Deliver `thumbs/thumb_<N>.jpg` (+ cover) with the publish pack. One line, no scores.
