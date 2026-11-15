---
name: voiceover
description: AI voiceover for every video through the Voice Studio artifact (Kokoro voices, ElevenLabs-style tone tags per word or phrase — excited, calm, whisper, dramatic…). Writes the tagged VO script, gets the generated take back with word timings, and wires it into the scene (voice track, ducking, lip-sync, captions). Use for any short or long video with narration or dialogue, or when the user mentions voice, voiceover, narration or tones.
---

# Voiceover — Voice Studio

The Voice Studio artifact (url in `characters/voice-studio.json`) runs the Kokoro-82M voice model on the user's device.
You write scripts into it; the take comes back as audio + word timings. Never invent another TTS service (Motion Forge rule).

## 1. Write the tagged script (after story-writing, before building shots)
- Tone tags, ElevenLabs-style: `[excited]Thirty days[/]` — tones: excited · happy · calm · serious · sad · angry · whisper ·
  scared · dramatic · shout · mysterious. Untagged text is neutral. Tags can wrap one word or a whole line.
- `[pause 0.4]` for beats (before a reveal, after the hook). `[voice am_adam]` switches speaker (dialogue).
- Voices: narrators `am_michael` (default), `bm_george` (storyteller), `af_heart` (warm female), `am_adam` (deep), `af_bella` (bright),
  `am_puck` (playful), `bf_emma`, `am_onyx`, `am_fenrir` (gritty) … (full list in the page).
- Direct it like a voice director: hook line excited/shout, explanations calm/serious, the twist dramatic or whisper, a pause before it.
- Keep lines short (≤ 12 words) so captions and cuts land on them.

## 2. Send it to the studio
ArtifactData `set` on the Voice Studio url, collection `scripts`, doc id = project slug:
`{ title, voice, speed: 1, text, status: "queued", updatedAt: <ms> }`. The page generates queued scripts automatically when
the user has it open — tell the user in one line: "Open Voice Studio — your voiceover renders there." (Same first-reply link.)

## 3. Get the take back
ArtifactData `get` the doc → when `status` is "ready", `take` has `assetId`, `duration`, `words` [{w, start, end, tone}], `tones`.
Artifact `read` with the url and `path: <assetId>` saves the file: it is base64 text of a WAV → decode it to the project:
`node -e "fs=require('fs');fs.writeFileSync('voice/<slug>.wav',Buffer.from(fs.readFileSync('<saved>','utf8'),'base64'))"`.

## 4. Use it in the scene
- `CONFIG.sound.voice = { url: 'voice/<slug>.wav' }` → music ducks under it automatically.
- **The voice is the NARRATOR — invisible, never a character.** No character lip-syncs or "says" the voiceover; the cast acts out what the narrator describes (no `talk` on anyone).
- Captions land on the spoken words: `CONFIG.captions = { style: 'pop' | 'karaoke' | 'one' | 'box', sync: take.words }` (pass the take's word list as `[[word, start, end], …]` or `[{ w, start, end }]`).
  Write CAPTIONS as before (group 2–4 words, `t` = first word start, keywords in `hi`) — or leave `CAPTIONS = []` and they are written from the words automatically.
- Time shots to the words: cut on sentence starts, put graphics/punch-ins on the stressed word.
- For pack_scene / artifacts the WAV is packed like any other asset.

If the user hasn't opened the studio yet, keep building with the script timing estimate (≈ 2.6 words/s) and swap in the real take when it's ready.
