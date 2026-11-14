---
name: character-collection
description: The user's cast of reusable 3D characters — show the collection as a photo gallery before every video so the user picks who stars, and create new characters from a reference photo and add them to the collection. Use at the start of any video/short request (unless the user already named the cast), when the user asks to see characters/models/cast, or asks for a new character, person, actor or model.
---

> **Tool policy:** Three.js in Chrome, Node, ffmpeg only. Never Blender/Python unless the user said "Blender/Python allowed".
> **Efficiency:** one gallery image, one short question, no essays.

# Character collection

The collection lives in the project repo so it persists across sessions:
- `characters/library.json` — every character: `name, actor | file, about, height, skin, hair, wardrobe {top,bottom,shoes}, build {width, head}, ref`
- `characters/thumbs/<id>.jpg` — photo card (portrait + full body)
- `characters/gallery.jpg` — the whole cast on one sheet
- `references/characters/<id>.jpg` — the reference photo a character was made from

## Before every video (unless the user already chose)
1. If any character lacks a card, render it: `node ${CLAUDE_PLUGIN_ROOT}/scripts/character_card.js <id> --fast`
2. Build the sheet: `node ${CLAUDE_PLUGIN_ROOT}/scripts/character_gallery.js`
3. Show `characters/gallery.jpg` to the user (send the file / view it) and ask in ONE line:
   "Who's in this video? Reply with names — or say **new character** and send a reference photo."
4. Use the picks in CAST as `{ character: '<id>' }` (cast entries can still override wardrobe etc.).
   If the user doesn't answer and the request must proceed, pick the best fit and say who you chose.

## New character from a reference image
1. Ask for exactly one thing: "Send a clear photo of the person (face + outfit)." Then wait.
2. When it arrives: save it to `references/characters/<id>.jpg`, view it, and measure colors:
   crop the face/hair/top/bottom regions with ffmpeg and run `node ${CLAUDE_PLUGIN_ROOT}/scripts/analyze_reference.js crop.jpg --colors 3`.
3. Decide the closest match and write a new entry in `characters/library.json`:
   - `actor`: `jake` (slim/average man) or `marcus` (big/heavy man) — or `file` if the user uploaded a GLB/FBX of the person
   - `skin` (sampled hex), `hair` (sampled hex), `wardrobe.top/bottom/shoes` (sampled from their outfit), `height` (estimate),
     `build.width` (0.92 slim … 1.15 broad), `about` (5–8 words), `name` (user's or a fitting one), `ref`.
4. Render its card, rebuild the gallery, show the new card, then commit + push `characters/` and `references/characters/`
   so it's saved for every future video.
5. Be honest in one line: built characters match skin, hair color, clothes, height and build; the face and hairstyle come
   from the base actor. For an exact face, the user can upload a 3D model of the person (`characters/<id>.glb`, e.g. from Avaturn) and the entry uses `file`.

## Rules
- Only fully clothed outfits. Never build people, clothes or hair from primitives.
- Keep the collection tidy: lowercase ids, no duplicates; update a character instead of making near-copies.
