#!/usr/bin/env node
// Build a brand-new MakeHuman character (CC0) from a recipe → characters/<id>.glb (offline, no Blender/Python).
// Usage (project root): node build_character.js <id>          → uses characters/library.json  <id>.make
//                       node build_character.js <id> '<json>'  → recipe inline
// Recipe keys: gender 0..1 (0 female · 1 male) · age 0..1 (0.5 ≈ 25y, 0.75 ≈ 55y) · weight · muscle · height · proportions (0..1, 0.5 avg)
//   african · asian · caucasian (ancestry mix, face shape) · tone 0..1 (skin) · redness · irisColour '#hex'
//   outfit · shoes · hair · brows · beard · moustache · hat · glasses (pack proxy names — see characters/KIT.md)
const fs = require('fs'), path = require('path');
const { launchBrowser, startStaticServer } = require('./lib/deps');
const ROOT = process.cwd(), [id, inline] = process.argv.slice(2);
if (!id) { console.error('usage: build_character.js <id> [recipe-json]'); process.exit(1); }
const LIBF = path.join(ROOT, 'characters', 'library.json');
const lib = fs.existsSync(LIBF) ? JSON.parse(fs.readFileSync(LIBF, 'utf8')) : { characters: {} };
const recipe = inline ? JSON.parse(inline) : lib.characters[id]?.make;
if (!recipe) { console.error('no recipe: add characters.' + id + '.make to library.json or pass JSON'); process.exit(1); }
const ALLOWED_OUTFITS = /^(male_casualsuit0[1-6]|male_elegantsuit01|male_worksuit01|female_casualsuit0[12]|female_elegantsuit01|toigo_suit_with_dinner_jacket|none)$/;
if (recipe.outfit && !ALLOWED_OUTFITS.test(recipe.outfit)) { console.error('outfit not allowed (fully clothed outfits only): ' + recipe.outfit); process.exit(1); }
(async () => {
  const srv = await startStaticServer(), b = await launchBrowser(), p = await b.newPage();
  p.on('pageerror', (e) => console.error('page error:', e.message));
  await p.goto(srv.origin + path.join(__dirname, '..', 'templates', 'character_builder.html'));
  await p.waitForFunction(() => window.__builderReady === true, null, { timeout: 60000 });
  if ((recipe.top || recipe.bottom) && !recipe.outfit) recipe.outfit = 'none';   // separates replace the default full outfit
  const character = { name: lib.characters[id]?.name || id, settings: recipe, cloth: {}, tailor: [], garments: {} };
  const b64 = await p.evaluate((c) => window.buildGlb(c), character);
  const out = path.join(ROOT, 'characters', id + '.glb'); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, Buffer.from(b64, 'base64'));
  await b.close(); srv.close();
  console.log('built → ' + path.relative(ROOT, out) + ' (' + (fs.statSync(out).size / 1e6).toFixed(1) + ' MB)');
})().catch((e) => { console.error(e.message || e); process.exit(1); });
