---
name: long-form
description: Plan, write and produce long-form 3D animated videos (YouTube 16:9, 3–20+ minutes) — documentary/explainer/story episodes with chapters, multiple twists and high average view duration; rendered in parts. Use when the user asks for a long video, long-form, a full YouTube video, an episode, a documentary, or anything longer than ~90 seconds.
---

> **Tool policy:** Use only built-in tools — Three.js/HTML/JS in the user's Chrome, Node, ffmpeg. The scripts auto-download what they need on first run. **Do NOT install or run Blender or Python** unless the user said "Blender/Python allowed".
> **Efficiency:** Work silently, batch tool calls, one final message. Quality + effort level are asked at the start of the video. Run `quality-review` (≥2 full rounds on every shot) before delivering. No review text in chat.


> **Reference images are for STUDY ONLY.** Never use a reference image (or a crop of it) as a texture,
> decal, shirt print, poster, background plate or any other image inside the scene, and never copy
> text, logos or names from it onto clothing or props. Recreate the *look* from scratch with
> materials, colors, lighting and shapes. Clothing = plain solid colors (or a simple original
> pattern) unless the user explicitly asks for a print.

# Long-Form 3D Videos

## Story structure (10-min example — scale proportionally)
| Part | Time | Job |
|---|---|---|
| **Cold open** | 0:00–0:30 | Most shocking moment or question first. Promise the payoff ("by the end you'll see why…"). No intro/logo. |
| **Title beat** | 0:30–0:40 | 3–5s title card, then straight in. |
| **Ch.1 Setup** | 0:40–2:30 | Character, world, the rule/goal. Plant 2–3 clues for later twists. End on a mini-cliffhanger. |
| **Ch.2 Escalation** | 2:30–5:00 | Stakes rise; **twist #1** at ~4:00 (midpoint shift). |
| **Ch.3 Complication** | 5:00–7:30 | Everything gets worse; reveal hidden info; **twist #2**. |
| **Ch.4 Climax** | 7:30–9:15 | Peak action, slow-mo, biggest set piece. |
| **Final twist + resolution** | 9:15–9:50 | The big reveal that reframes the whole video (fair — clues planted in Ch.1). |
| **End screen** | 9:50–10:00 | Tease the next episode; point to it on screen. |

## Retention rules (long-form specific)
- **Open loops**: start a question every chapter and close it in a later one; never have zero open loops.
- **Re-hook every 30–60s**: new visual, new info, a "but…", a countdown, a pattern break.
- **Chapter endings = mini-cliffhangers**; chapter starts = immediate payoff.
- **Visual variety**: a new shot every 3–6s (slower than shorts, never static >8s); alternate wide/medium/close/cutaway/diagram.
- **Narration**: ~150 words/min, conversational, "you"; cut filler. 10 min ≈ 1,400–1,500 words.
- Facts must be accurate; label dramatizations.

## Production
- Always apply `art-direction` (look brief, per-shot `look`/`set`; vary sets across chapters) and `vfx` for action beats; study `references/` (images + videos) with `reference-learning` first if present.
- **Format**: 16:9 — set `CONFIG.width = 1920, CONFIG.height = 1080` in
  `${CLAUDE_PLUGIN_ROOT}/templates/studio_scene.html` (Epic = 2560×1440). Use wider lenses
  for establishing shots, real environments (not only studio backdrop) — see `realistic-humans`.
- **Chapters**: build one HTML with a shot timeline and set
  `chapter: 'Name'` on the first shot of each story chapter (see `templates/SCENE_API.md`) (keep each ≤ ~2–3 min
  so iPads/phones don't run out of memory). The page renders every part by itself when it opens (one MP4 each, quality from `CONFIG.quality`) and lists them with Save buttons.
- If the scene file would get huge, split into one HTML per chapter (each with its own
  `window.__mf`), same style constants.
- **Cloud render alternative**: `node ${CLAUDE_PLUGIN_ROOT}/scripts/render_video.js long.html partN.mp4 --quality <choice> --chapter N`,
  then join: `ffmpeg -f concat -safe 0 -i parts.txt -c copy final.mp4`.
- **Joining on iPad/phone**: CapCut or iMovie → add parts in order → export at the same resolution.

## Deliver
1. Script doc: logline, chapter outline with timestamps, full narration, shot list per chapter,
   where each twist's clue is planted.
2. The scene file(s) / artifact with the render panel (run `scripts/pack_scene.js` first and publish with its files map).

Apply `visual-clarity` to every chapter: literal visual + explainer graphics per narration line, cameras by meaning, a `timeline` per chapter.
3. `viral-growth` long-form publish pack (title, description **with chapter timestamps**,
   tags, thumbnail concept, pinned comment, end-screen plan).
