---
name: character-collection
description: The user's cast of reusable 3D characters, managed on the Casting Board artifact — create genuinely new characters (MakeHuman CC0, different faces/bodies/hair/outfits) from a description and/or reference photo, improve existing ones (head shape, eyes, looks, clothes — all in one prompt), and undo improvements forever. Use at the start of every session (Casting Board), before any video (who stars), and whenever the user mentions characters, cast, models, actors, "new character", "improve", "undo" or "check the casting board".
---

> **Tool policy:** Three.js in Chrome, Node, ffmpeg only. Never Blender/Python unless the user said "Blender/Python allowed".
> **Efficiency:** batch tool calls, short messages; the Casting Board shows the results.

# Character collection (Casting Board)

Lives in the project repo (persists across sessions):
- `characters/library.json` — `characters.<id>` = current version: `name, about, height, version, file | actor, make (recipe), wardrobe, hair, skin, build, ref`;
  `history.<id>` = every older version (entry + glb + photo), kept forever for undo.
- `characters/<id>.glb` (built characters) · `characters/thumbs/<id>.jpg` (photo card) · `characters/history/<id>/…` · `references/characters/<id>.*`
- `characters/KIT.md` — every recipe option (body, face, hair, brows, outfits).
- `characters/casting-board.json` — the Casting Board artifact URL.

Scripts (run from the project root; `S=${CLAUDE_PLUGIN_ROOT}/scripts`):
`node $S/build_character.js <id>` · `node $S/character_card.js <id> --fast` · `node $S/character_version.js archive|undo|list <id>` ·
then update the board (below).

## Processing Casting Board requests (ArtifactData collection `requests`)
Each pending doc: `{ type: create|improve|undo, character?, text, ref?: {id,url} }`. After finishing one, `update` it with
`status: "done", note: "<one line>"`. Then update the board (below) and commit + push `characters/` (+ `references/`) to main: `git push origin HEAD:main`.

### create
1. Read `text`. If `ref` exists, fetch the photo from the board's assets (Artifact `read` with `path: ref.id`), save it as
   `references/characters/<id>.<ext>`, view it, and sample colors (crop face/hair/clothes with ffmpeg → `scripts/analyze_reference.js crop.jpg --colors 3`).
2. Write a recipe from KIT.md that matches: gender, age, weight, muscle, ancestry mix (face shape), tone (skin), iris color,
   hair + brows, outfit or separates, shoes. Pick a short lowercase `id` and a name. Fully clothed outfits only.
3. Add `characters.<id>` = `{ name, about (6–9 words), height (m), version: 1, file: "characters/<id>.glb", make, wardrobe?, hair?, ref? }`.
4. `build_character.js <id>` → `character_card.js <id> --fast` → mark done ("Created Nadia: …").

### improve (e.g. "rounder face, bigger green eyes, older, black jacket") — may include a reference photo
0. If `ref` exists: fetch it (Artifact `read` with `path: ref.id`), save it as `references/characters/<id>-v<next>.<ext>`, view it and sample its colors. The photo shows the target look: combine it with the text (text wins where they disagree).
1. `character_version.js archive <id>` (old version leaves the board but stays in history forever).
2. Apply ALL requested changes in one pass: edit `make` (face/body sliders, ancestry mix, irisColour, hair, brows, outfit),
   and/or `wardrobe`/`hair`/`build` (`build.head` for head size). Update `about`.
   Characters with `actor:` (jake, marcus) have no recipe: for face/body changes, convert them to a built character
   (write a `make` close to their look, set `file`, drop `actor`).
3. Rebuild (`build_character.js`) if `make` changed, then `character_card.js <id> --fast`, mark done with what changed.
4. If something can't be done (e.g. beards aren't in the licence-checked kit), do the rest and say so in the note.

### undo
`character_version.js undo <id>` → `character_card.js` not needed (the old photo is restored) → mark done. The replaced
version goes into history too, so an undo can itself be undone.

## Before every video
Ask who stars (names from the board) unless the user already named them. Use `{ character: '<id>' }` in CAST.

## Rules
- Never build people, clothes, hair or faces from primitives — only MakeHuman builds or uploaded models.
- Keep ids unique; improve instead of making near-duplicates.
- Be honest in notes about anything that couldn't be matched exactly.

## Update the board (live data — never republish the page)
The Casting Board page is static; its cards come from the board database (collection `cast`).
1. ArtifactData `list` collection `cast` with `out_dir: .motion-forge/castdb`.
2. `node $S/board_data.js --db .motion-forge/castdb/cast` → one entry per character (`changed`, `needsPhoto`, `thumb`, `doc`, or `remove`).
3. Entries with `needsPhoto`: upload all their `thumb` files in ONE Artifact call { url, asset: true, file_paths: [...] } and set each
   `doc.photo` to the returned url ("/_blob/<id>").
4. One ArtifactData `batch`: `set` cast/<id> with `doc` for every changed entry (`delete` for `remove`; pin `if_version` from step 1 for existing docs).
The open board updates by itself. No publish, no open.

## First board / first studio (only when characters/casting-board.json or voice-studio.json has no url)
Board: publish `.motion-forge/gallery/index.html` new with capabilities {db:{}, assets:{}, user:{}}, icon "people", then "Update the board".
Studio: `node $S/voice_page.js --engine` → publish `page` new with capabilities {db:{}, assets:{}, downloads:true}, icon "microphone",
files = files + engineBatches[0]; publish the same page again per remaining engineBatches entry. Save {url, page: hash} to the json.
