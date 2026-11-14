# Credits & licences of bundled assets

- **Characters** (`assets/characters/jake, marcus`): built from MakeHuman CC0 data via
  [Dramatis](https://github.com/tonioloewald/dramatis3d) sample exports. MakeHuman assets are CC0.
  Skin tones interpolate the *Monk Skin Tone Scale by Dr. Ellis Monk and Google (https://skintone.google),
  licensed under CC BY 4.0* — keep this line in any published credits.
- **Animations** (`assets/animations/ual-starter.glb`): Universal Animation Library by
  [Quaternius](https://quaternius.com) — CC0.
- Sample clips/models loaded at runtime from the three.js repository (Xbot, Soldier, Michelle) remain
  under their original terms.

- **MakeHuman data pack** (`assets/makehuman/hm08/`): MakeHuman hm08 base mesh, targets, skeleton and system/checked assets
  (CC0 1.0), packed by tosijs-3d/Dramatis. Eye art (`assets/makehuman/eyes/`) from the same project. Only licence-checked
  assets can be exported (the builder refuses the rest).
- **Character builder** (`vendor/dramatis-builder.mjs`): bundled from Dramatis (Apache-2.0), tosijs-3d (Apache-2.0) and
  fflate (MIT) — licences in `vendor/`.
- Built characters in `characters/*.glb` carry their asset licences inside the file (`asset.extras.dramatis.licences`).
