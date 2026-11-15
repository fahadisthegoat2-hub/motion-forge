#!/usr/bin/env node
// Renders a short looping preview (fx/previews/<name>.mp4) for every effect (built-ins + fx/library.json) that doesn't have one.
// All effects render in ONE scene (one shot each) → split into clips. Usage: node vfx_previews.js [--all] [--only name,name]
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), LIB = JSON.parse(fs.readFileSync(path.join(ROOT, 'fx', 'library.json'), 'utf8')).effects;
const OUT = path.join(ROOT, 'fx', 'previews'); fs.mkdirSync(OUT, { recursive: true });
const BUILTIN = { explosion: 'big fireball explosion with debris and shockwave', fire: 'volumetric fire with smoke column', smoke: 'billowing smoke column',
  sparks: 'spark shower', magic: 'magic sparkles', lightning: 'lightning strike', shockwave: 'shockwave dome + ground ring', splash: 'water splash',
  embers: 'floating embers', rain: 'rain', snow: 'snow', dust: 'floating dust motes' };
const POS = { explosion: [0.6, 0, -2], fire: [0.5, 0, -0.5], smoke: [0.5, 0, -1], sparks: [0.5, 1.2, 0], magic: [0.5, 1.1, 0], lightning: [0.8, 9, -3],
  shockwave: [0.4, 0.05, 0], splash: [0.6, 0, 0.3], 'punch-impact': [-0.55, 1.45, 0.25], 'ground-slam': [-1, 0.02, 0], 'speed-dash': [0.8, 0.1, 0],
  'power-aura': [-1, 0, 0], 'energy-beam': [-0.6, 1.3, 0.2], 'sonic-boom': [0.6, 1.5, -1], teleport: [-1, 0, 0], 'heal-glow': [-1, 0, 0], 'energy-charge': [-0.6, 1.15, 0.35],
  fireworks: [0.5, 6, -6], meteor: [2.5, 6, -6], 'black-hole': [0.6, 2.3, -3], portal: [0.6, 1.3, -1], 'muzzle-flash': [-0.55, 1.35, 0.4], confetti: [0, 0.3, 0.6],
  'falling-leaves': [0, 2, 0], sandstorm: [-4, 0, -2], bubbles: [0, 0, 0], 'poison-gas': [0.6, 0, -0.5], 'dust-burst': [0.2, 0.02, 0.4], 'blood-splash': [-0.5, 1.2, 0.2], 'ice-shatter': [0.4, 1.1, 0.3], 'electric-arc': [0.6, 1.0, 0.1] };
const args = process.argv.slice(2), only = args.includes('--only') ? (args[args.indexOf('--only') + 1] || '').split(',').filter(Boolean) : [];
const names = [...Object.keys(BUILTIN), ...Object.keys(LIB)].filter((n) => (only.length ? only.includes(n) : args.includes('--all') || !fs.existsSync(path.join(OUT, n + '.mp4'))));
if (!names.length) { console.log('all previews exist'); process.exit(0); }
const FPS = 30, D = 3, W = 1080, H = 720;   // HD 3:2 = the VFX Library card shape (nothing cropped), whole effect (D*FPS must be an integer → no clip drift)
const LONG = /explosion|meteor|black-hole|portal|fireworks|lightning|teleport|ground-slam|ice-shatter/;
const shots = names.map((n) => ({ name: n, dur: LONG.test(n) ? D + 1 : D, set: /rain|snow|lightning|fireworks|meteor|black-hole|portal/.test(n) ? 'street-night' : 'void', look: 'cinematic',
  camera: { pos: [[0, [0, 1.5, 6.2]]], look: [[0, [0, 1.3, 0]]], fov: 42 },
  cast: { hero: { pos: [[0, [-1, 0, 0]]], rotY: [[0, 0.5]], clips: [{ clip: 'idle', start: 0, end: 99 }] } },
  fx: [{ type: n, t: 0.15, start: 0, end: 99, pos: POS[n] || [0.5, 1, 0] }] }));
let tpl = fs.readFileSync(path.join(ROOT, 'templates', 'studio_scene.html'), 'utf8').split('\n');
const a = tpl.findIndex((l) => l.startsWith('const CAST = {')), b = tpl.findIndex((l) => l.includes('END DIRECTION'));
tpl.splice(a, b - a, "const CAST = { hero: { character: 'jake' } };\nconst SHOTS = " + JSON.stringify(shots) + ";\nconst CAPTIONS = []; const TITLES = [];");
const scene = path.join(ROOT, 'scenes', '_vfxprev.html'); fs.mkdirSync(path.dirname(scene), { recursive: true }); fs.writeFileSync(scene, tpl.join('\n'));
const tmp = path.join(ROOT, '.motion-forge', 'vfxprev'); fs.mkdirSync(tmp, { recursive: true });
execFileSync('node', [path.join(__dirname, 'render_video.js'), scene, path.join(tmp, 'all.mp4'), '--fast', '--width', String(W), '--height', String(H), '--fps', String(FPS), '--frames-only'], { stdio: 'inherit' });
const { ffmpeg } = require('./lib/deps'), fps = FPS; let at = 0;
names.forEach((n, i) => { const per = Math.round(shots[i].dur * fps), from = at; at += per; execFileSync(ffmpeg(), ['-y', '-loglevel', 'error', '-framerate', String(fps), '-start_number', String(from), '-i', path.join(tmp, 'all_frames', 'f%05d.png'), '-frames:v', String(per),
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'slow', '-movflags', '+faststart', path.join(OUT, n + '.mp4')]); });
fs.rmSync(tmp, { recursive: true, force: true }); fs.rmSync(scene, { force: true });
const meta = Object.fromEntries([...Object.entries(BUILTIN).map(([k, v]) => [k, { about: v, builtin: true }]), ...Object.entries(LIB).map(([k, v]) => [k, { about: v.about || '' }])]);
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(meta, null, 1));
console.log('previews:', names.join(', '));
