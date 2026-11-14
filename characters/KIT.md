# Character recipe kit (MakeHuman CC0 — builds offline with scripts/build_character.js)

A recipe is the `make` object of a character in `characters/library.json`.

## Body & face (0..1 sliders, 0.5 = average)
| key | effect |
|---|---|
| `gender` | 0 female · 1 male (in-between allowed) |
| `age` | 0.25 ≈ teen · 0.4 ≈ 20s · 0.5 ≈ 25–30 · 0.66 ≈ 45 · 0.8 ≈ 65 · 0.9 ≈ 80 |
| `weight` | thin ↔ heavy (rounder face, fuller cheeks/jaw) |
| `muscle` | soft ↔ muscular (sharper jaw, broader shoulders) |
| `height` | short ↔ tall (also set `height` in metres on the entry) |
| `proportions` | stylized ↔ realistic proportions |
| `african` · `asian` · `caucasian` | ancestry mix (they're normalized) — the biggest lever on **head shape, eyes, nose, lips, cheekbones** |
| `tone` | skin 0 lightest ↔ 1 darkest · `redness` 0..1 |
| `irisColour` | `#hex` eye color |
| `chestDepth` · `pecs` · `waist` | torso shape |

Face-shape requests → combine: "rounder face" = weight +0.1–0.2; "sharper jaw / defined" = muscle +0.2, weight −0.1;
"older" = age +; "different eyes / nose / lips" = shift the ancestry mix; "bigger head" = entry `build.head` 1.05.

## Wardrobe (fully clothed only)
- `outfit` (full): `male_casualsuit01` denim shirt + jeans · `02` long-sleeve tee + trousers · `03` · `04` tee + jeans · `05` field jacket + shirt + jeans · `06`
  · `male_elegantsuit01` black suit + tie · `male_worksuit01` work overalls · `toigo_suit_with_dinner_jacket`
  · `female_casualsuit01` · `female_casualsuit02` · `female_elegantsuit01`
- separates (set `outfit: "none"`): `top` = `toigo_fisherman_sweater` · `elvs_crude_t-shirt_male` · `joepal_crude_t-shirt_female`;
  `bottom` = `toigo_wool_pants` · `cortu_cargo_pants` · `cortu_jeans_shorts`
- `shoes`: `shoes01`–`shoes06` · `toigo_mj_cloth_shoes` · `toigo_flats` · `cortu_t-bar`
- `hat`: `fedora01` · `fedora_cocked` · `aethelraed_unraed_cloche_hat` · `gloves`: `toigo_gloves_short`
- Colors: recolor any outfit at scene level with the entry's `wardrobe { top, bottom, shoes }` (keeps fabric folds).

## Hair & brows
- `hair`: `short01` slick · `short02` classic · `short03` fringe · `short04` crop · `afro01` · `bob01` · `bob02` · `braid01` · `long01` · `ponytail01`
- `brows`: `eyebrow001` … `eyebrow012` (001 soft, 003 bold, 006 straight, 010 thick, 012 thin)
- Hair color: entry `hair: '#hex'` (scene-level tint).
- Beards: none in the licence-checked set yet — say so if asked.
