#!/usr/bin/env node
// Render photo cards for the character collection (portrait + full body) → characters/thumbs/<id>.jpg
// Usage (from the project root): node character_card.js [id ...] [--fast]
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { ffmpeg } = require('./lib/deps');
const ROOT = process.cwd(), LIBF = path.join(ROOT, 'characters', 'library.json');
if (!fs.existsSync(LIBF)) { console.error('no characters/library.json in ' + ROOT); process.exit(1); }
const lib = JSON.parse(fs.readFileSync(LIBF, 'utf8')).characters || {};
const args = process.argv.slice(2), fast = args.includes('--fast'), ids = args.filter((a) => !a.startsWith('--'));
const TPL = fs.readFileSync(path.join(__dirname, '..', 'templates', 'studio_scene.html'), 'utf8');
const swap = (s, a, b, txt) => { const i = s.indexOf(a), j = s.indexOf(b, i); return s.slice(0, i) + txt + s.slice(j); };
const tmp = path.join(ROOT, '.motion-forge', 'cards'); fs.mkdirSync(tmp, { recursive: true }); fs.mkdirSync(path.join(ROOT, 'characters', 'thumbs'), { recursive: true });
for (const id of ids.length ? ids : Object.keys(lib)) {
  if (!lib[id]) { console.error('unknown character ' + id); continue; }
  let s = swap(TPL, 'const CAST = {', '// Shots play back-to-back', `const CAST = { star: { character: ${JSON.stringify(id)}, acting: 'none' } };\n\n`);
  s = swap(s, 'const SHOTS = [', '// Word-by-word captions', `const SHOTS = [
  { name: 'portrait', dur: 1, set: 'studio', look: 'clean-cg', camera: { move: 'static', target: 'star', size: 'mcu', az: 14, handheld: 0 }, cast: { star: { look: [[0, 'camera']], face: { smile: [[0, 0.35]] } } } },
  { name: 'full', dur: 1, set: 'studio', look: 'clean-cg', camera: { move: 'static', target: 'star', size: 'ws', az: 18, handheld: 0 }, cast: { star: { look: [[0, 'camera']], face: { smile: [[0, 0.35]] } } } },
];\n\n`);
  s = swap(s, 'const CAPTIONS = [', '// Kinetic titles', 'const CAPTIONS = [];\n'); s = swap(s, 'const TITLES = [', '/* ===', 'const TITLES = [];\n');
  s = s.replace(/(const CONFIG = \{\s*\n\s*)width: \d+, height: \d+/, '$1width: 600, height: 800');
  const html = path.join(tmp, id + '.html'); fs.writeFileSync(html, s);
  const out = path.join(tmp, id + '.mp4'), frames = out.replace('.mp4', '_frames');
  fs.rmSync(frames, { recursive: true, force: true });
  for (const [t0, name] of [[0.5, 'a'], [1.5, 'b']]) {
    execFileSync(process.execPath, [path.join(__dirname, 'render_video.js'), html, out, '--start', String(t0), '--end', String(t0 + 0.03), '--fps', '30', '--width', '600', '--height', '800', '--frames-only', ...(fast ? ['--fast'] : [])], { stdio: ['ignore', 'ignore', 'inherit'] });
    fs.renameSync(path.join(frames, 'f00000.png'), path.join(tmp, id + '_' + name + '.png'));
  }
  const dst = path.join(ROOT, 'characters', 'thumbs', id + '.jpg');
  execFileSync(ffmpeg(), ['-loglevel', 'error', '-y', '-i', path.join(tmp, id + '_a.png'), '-i', path.join(tmp, id + '_b.png'), '-filter_complex', '[0][1]hstack,scale=900:-2', '-q:v', '4', dst]);
  console.log('card → ' + path.relative(ROOT, dst));
}
