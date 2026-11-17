---
name: smp-shorts
description: Edits Unstable SMP / Minecraft SMP footage (streams, VODs, recordings, CapCut projects) into viral vertical shorts — finds the moments worth keeping, renders its own motion graphics FIRST, cuts the edit LAST, and writes the result into a CapCut PC project by name. Use whenever the user mentions SMP, Unstable SMP, Minecraft clips/footage, a CapCut project, "edit this into a short", "find the best parts", or "add motion graphics to my clip".
---

# SMP Shorts — auto-editor + motion graphics + CapCut

Tools: Node, ffmpeg, Chrome (all auto-found). Scripts live in `${CLAUDE_PLUGIN_ROOT}/scripts`.

## Order of work (always)
1. **Find the keepers** — `highlights.js` scores every 0.25 s: loudness spikes over a rolling baseline (screams, kills, TNT),
   sudden jumps, scene-cut density, hype words from subtitles (`--srt`), and penalises dead air. Peaks become clips with
   ~3 s of setup and ~2 s of reaction, snapped to cuts, best ones kept up to `--len` (default 45, max 59).
2. **Story order** — frame 1 is a 1.6 s teaser of the best moment (hook), then the clips in real order, ending on the payoff.
3. **Motion graphics first** — `mograph.js` renders every graphic as a transparent 1080×1920 ProRes 4444 `.mov`:
   `hook` (slam title + shake) · `pop` (reaction word) · `flash` (impact frame + speed lines) · `marker` (circle + arrow) ·
   `chapter` ("MEANWHILE…" wipe) · `caption` (from SRT) · `counter` ("KILL #3") · `cta` (follow button + click).
   One design system: chunky block type, black outline, hard shadow, ONE accent (`--accent`, default gold #FFD23F).
4. **Edit last** — `render.js` cuts, makes 9:16 (`--layout blur` = blurred bg + big gameplay, `crop` = full-screen), alternates
   zoom every cut (pattern interrupt), overlays the graphics, masters to −14 LUFS → `short.mp4`.
5. **CapCut** — `capcut.js` writes the same timeline (gameplay track + one track per overlapping graphic) as a CapCut PC project.

## One command
```
node ${CLAUDE_PLUGIN_ROOT}/scripts/smp.js <video | CapCut project name> --project "<CapCut name>" --title "HOOK TEXT" [--srt subs.srt] [--len 45] [--layout blur|crop] [--accent #hex]
```
Output folder next to the video: `short.mp4`, `edit.json`, `graphics/*.mov`, plus the CapCut project.

## CapCut rules
- `capcut.js --list` lists projects; `capcut.js --sources "<name>"` shows the clips inside one (input can be a project name).
- An existing project is NEVER overwritten — the edit goes to "<name> - SMP edit" unless the user says overwrite (`--overwrite`, auto backup).
- Drafts folder is auto-found (Windows `%LOCALAPPDATA%\CapCut\User Data\Projects\com.lveditor.draft`, macOS `~/Movies/CapCut/...`); override with `--drafts` / `CAPCUT_DRAFTS`.
- Close CapCut before writing, reopen after. Newer CapCut builds encrypt drafts: if reading fails, ask for the raw clip path; if a
  written project doesn't open, `short.mp4` + `graphics/` are the fallback (drag the .movs onto overlay tracks).
- Runs on the user's own PC (CapCut lives there) — in a cloud session, request their computer folder first.

## Tuning
- Want more of a moment? Edit `edit.json` (segments in/out, graphics text/at) then rerun `mograph.js` → `render.js` → `capcut.js`.
- Better hook text beats everything: write `--title` as a curiosity gap ("HE BETRAYED THE WHOLE SERVER"), ≤ 6 words.
- Give subtitles (`--srt`, e.g. CapCut auto-captions exported) for smarter picks + synced captions.
