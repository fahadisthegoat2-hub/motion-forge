---
name: editing
description: Cinema-grade, hyper-engagement editing and sound design for 3D shorts and long videos — cut rhythm, pattern interrupts, speed ramps, freeze-frames, punch-ins, transitions, music with drops, sound effects on every visual beat, ambience, voiceover with ducking, loudness mastering, loops. Use for EVERY video (always), and whenever the user mentions editing, pacing, sound, music, SFX, voiceover, retention or "make it more engaging".
---

> **Tool policy:** Three.js in Chrome, Node, ffmpeg only. Never Blender/Python unless the user said "Blender/Python allowed".
> **Efficiency:** plan the edit once in the script doc, build it in the scene, verify with one --fast render (frames + audio check).

> **Algorithm fit:** design from `youtube-algorithm` (what the feed measures, targets, length, safe zones, packaging) — its rules win over older numbers here.

# Editing & Sound — hyper engagement, cinema feel

The scene file IS the edit: `SHOTS` are the timeline, `CONFIG.sound` the soundtrack (see templates/SCENE_API.md).
Sound design is automatic: every transition, explosion, lightning, title, counter, punch-in, freeze, footstep and
saved-motion event already makes its sound, and each set has its ambience. Your job is the *rhythm* and the *moments*.

## The edit plan (write it before building, in the script doc)
`time | shot | size/move | cut-in | edit device | sound moment | caption/title` — one row per shot.

## Rhythm rules (shorts 30–60s)
- **0.0–1.0s hook:** strongest visual + a sound hit at frame 1 (slam title or `impact`) + a question. No silence, no logo.
- **Shot length 0.8–2.5s** (average ~1.5s); long-form 2–6s. Vary lengths — never 3 equal shots in a row.
- **Pattern interrupt every 2–3s:** new angle/size, a `punch` zoom, a title, a speed ramp, a transition or a big sound.
- **Cut on action** (mid-movement) and on the beat. Beat = 60 / bpm (tension 100 · epic 90 · mystery 84 · upbeat 120 ·
  sad 70 · horror 60 · action 140 · lofi 80) → make shot `dur`s multiples of the beat; put `drops` on the reveal/twist.
- **Transitions** every 2–3 cuts (`cut: whip|zoom|spin|glitch|flash|dip|smash`), hard cuts between. Glitch/flash for shocks, whip for energy, dip for time passing.
- **Silence is a weapon:** the music auto-ducks 0.25s before every `drop` — land the twist's impact on that drop.

## Edit devices
- **Speed ramp** (slow-mo at the peak): `time: [[0,0],[0.5,0.5],[1.7,0.85,'outCubic'],[2.6,1.75]]` (content time vs edit time).
- **Freeze-frame** on the twist/peak: `freeze: [[at, hold]]` — auto record-scratch + mono flash; add a `stamp`/`slam` title.
- **Punch-in zoom** on key words: `punch: [t, ...]` (edit time) — auto "whoomp".
- **Crash zoom** camera move for reveals; **letterbox** `letterbox: 0.06` (shorts) / `2.39` (long-form) for cinema moments.
- **J/L cuts:** start the next scene's sound (ambience/voice) before its picture by putting the sound on the previous shot's `sfx`.

## Sound
- `CONFIG.sound = { music: { mood, bpm?, key?, volume?, drops: [t] }, sfx: true, ambience: true, voice: { url }, track: { url } }`.
- Pick the mood from the story's emotion; change energy with `drops` (first drop = when the hook pays off).
- Extra sounds anywhere: `shot.sfx: [{ t, type, gain }]` — types: whoosh swoosh impact hit boom subdrop riser glitch pop tick ding
  stamp typing shimmer thunder footstep land bodyfall zap splash scratch punch heartbeat swell. Heartbeat under tension, riser into reveals.
- **Voiceover:** if the user gives a VO file (or uploads one), set `voice.url` — music ducks under it automatically. It is the invisible
  NARRATOR: no character lip-syncs it (no `talk`). Sync captions with `CONFIG.captions.sync` (word times). No VO? captions carry the story; keep music + SFX rich.
- **Own music:** `track: { url, volume }` replaces generated music (the user must own/license it).
- Mastered automatically to short-form loudness (~-14 LUFS, -1 dBFS ceiling).

## Endings
Loop the short: last shot's image/sound flows into the first (same angle/color, or the last line sets up the first).

## Verify (once, with --fast)
Render a low-res preview WITH sound (`render_video.js scene.html prev.mp4 --fast --width 270 --height 480 --fps 12`), then:
`ffmpeg -i prev.mp4 -af ebur128=framelog=quiet -f null -` (≈ -14 LUFS) and a waveform
(`ffmpeg -i prev.mp4 -filter_complex showwavespic=s=1200x160 -frames:v 1 wave.png`) — every planned sound moment must show
as a spike at its time, and there must be no dead silence except deliberate pre-drop gaps.
