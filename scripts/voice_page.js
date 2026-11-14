#!/usr/bin/env node
// Builds the Voice Studio artifact (templates/voice_studio.html) into .motion-forge/voice/ and prints the Artifact `files` map.
//   node voice_page.js            → page + voices + config (small; use on every republish — published engine files are kept)
//   node voice_page.js --engine   → also the voice model + audio engine (first publish only; ~150 MB, printed in batches ≤ 60 MB)
// Artifact pages can't fetch other sites, so everything is shipped as same-origin files (binary → base64 .txt).
// The Kokoro-82M model (Apache-2.0) and ONNX Runtime wasm are checked against their published SHA-256 before use.
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..'), OUT = path.resolve('.motion-forge/voice'), CACHE = path.join(os.homedir(), '.motion-forge', 'voice-cache');
const KOKORO = path.join(ROOT, 'assets', 'voice', 'kokoro');
const MODEL = { name: 'model_quantized.onnx', bytes: 92361116, sha256: 'fbae9257e1e05ffc727e951ef9b9c98418e6d79f1c9b6b13bd59f5c9028a1478',
  urls: ['https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/onnx/model_quantized.onnx'] };
const ORT = { name: 'ort-wasm-simd-threaded.jsep.wasm', sha256: 'c46655e8a94afc45338d4cb2b840475f88e5012d524509916e505079c00bfa39', bytes: 21596019, tgz: 'https://registry.npmjs.org/@huggingface/transformers/-/transformers-3.5.1.tgz' };
const CHUNK = 15e6;   // base64 chars per file (artifact text files ≤ 16 MB)
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const rel = (f) => path.relative(process.cwd(), f);

function getModel() {
  const f = path.join(CACHE, MODEL.name);
  if (fs.existsSync(f) && sha(fs.readFileSync(f)) === MODEL.sha256) return f;
  fs.mkdirSync(CACHE, { recursive: true });
  for (const u of MODEL.urls) { try { execFileSync('curl', ['-sSL', '-m', '900', '-o', f, u], { stdio: 'inherit' }); if (sha(fs.readFileSync(f)) === MODEL.sha256) return f; } catch {} }
  // fallback: npm mirror (byte-identical shards), verified against the same hash
  const tgz = path.join(CACHE, 'shards.tgz'); execFileSync('curl', ['-sSL', '-m', '900', '-o', tgz, 'https://registry.npmjs.org/kokoro-q8-shards/-/kokoro-q8-shards-1.0.0.tgz']);
  execFileSync('tar', ['-xzf', tgz, '-C', CACHE]); const parts = fs.readdirSync(path.join(CACHE, 'package')).filter((x) => /part\d+\.bin$/.test(x)).sort((a, b) => +a.match(/\d+/)[0] - +b.match(/\d+/)[0]);
  const buf = Buffer.concat(parts.map((p) => fs.readFileSync(path.join(CACHE, 'package', p)))); if (sha(buf) !== MODEL.sha256) throw new Error('voice model failed its integrity check');
  fs.writeFileSync(f, buf); return f;
}
function getOrt() {
  const f = path.join(CACHE, ORT.name); if (fs.existsSync(f)) return f;
  fs.mkdirSync(CACHE, { recursive: true }); const tgz = path.join(CACHE, 'transformers.tgz');
  execFileSync('curl', ['-sSL', '-m', '600', '-o', tgz, ORT.tgz]); execFileSync('tar', ['-xzf', tgz, '-C', CACHE, 'package/dist/' + ORT.name]);
  fs.renameSync(path.join(CACHE, 'package', 'dist', ORT.name), f); return f;
}
function chunked(buf, dir, base, files) {
  const b64 = buf.toString('base64'), parts = [];
  for (let i = 0, k = 0; i < b64.length; i += CHUNK, k++) { const pub = `${dir}/${base}.${k}.txt`, src = path.join(OUT, pub); fs.writeFileSync(src, b64.slice(i, i + CHUNK)); files[pub] = rel(src); parts.push(pub); }
  return parts;
}

fs.rmSync(OUT, { recursive: true, force: true }); for (const d of ['voices', 'engine']) fs.mkdirSync(path.join(OUT, d), { recursive: true });
const small = {}, big = {}, engine = { voices: {}, files: {} };
fs.copyFileSync(path.join(ROOT, 'templates', 'voice_studio.html'), path.join(OUT, 'index.html'));
for (const v of fs.readdirSync(path.join(KOKORO, 'voices'))) { const id = v.replace('.bin', ''), pub = `voices/${id}.txt`;
  fs.writeFileSync(path.join(OUT, pub), fs.readFileSync(path.join(KOKORO, 'voices', v)).toString('base64')); small[pub] = rel(path.join(OUT, pub)); engine.voices[id] = pub; }
for (const f of ['config.json', 'tokenizer.json', 'tokenizer_config.json']) { const pub = `engine/${f}`; fs.copyFileSync(path.join(KOKORO, f), path.join(OUT, pub)); small[pub] = rel(path.join(OUT, pub)); engine.files[f] = pub; }
// engine.json always lists the model + wasm parts (they stay published from the first --engine publish)
const count = (n) => Math.ceil(Math.ceil(n / 3) * 4 / CHUNK);
if (process.argv.includes('--engine')) {
  const mbuf = fs.readFileSync(getModel()), wbuf = fs.readFileSync(getOrt()); if (sha(wbuf) !== ORT.sha256) throw new Error('audio engine failed its integrity check');
  engine.model = { sha256: MODEL.sha256, parts: chunked(mbuf, 'engine', 'model', big) };
  engine.wasm = { sha256: ORT.sha256, parts: chunked(wbuf, 'engine', 'ort', big) };
} else {
  engine.model = { sha256: MODEL.sha256, parts: [...Array(count(MODEL.bytes))].map((_, k) => `engine/model.${k}.txt`) };
  engine.wasm = { sha256: ORT.sha256, parts: [...Array(count(ORT.bytes))].map((_, k) => `engine/ort.${k}.txt`) };
}
fs.writeFileSync(path.join(OUT, 'engine.json'), JSON.stringify(engine)); small['engine.json'] = rel(path.join(OUT, 'engine.json'));
// batches that fit one publish each (≤ 60 MB)
const batches = [[]]; let size = Object.values(small).reduce((s, f) => s + fs.statSync(f).size, 0);
for (const [pub, src] of Object.entries(big)) { const n = fs.statSync(src).size; if (size + n > 60e6) { batches.push([]); size = 0; } batches.at(-1).push(pub); size += n; }
const html = fs.readFileSync(path.join(OUT, 'index.html')), hash = crypto.createHash('sha256').update(html).digest('hex').slice(0, 16);
let saved = {}; try { saved = JSON.parse(fs.readFileSync(path.resolve('characters/voice-studio.json'), 'utf8')); } catch {}
// changed=false → DON'T publish; just open saved.url. changed=true → publish page + files to saved.url, then save {url, page: hash}.
console.log(JSON.stringify({ page: rel(path.join(OUT, 'index.html')), hash, changed: !saved.url || saved.page !== hash, url: saved.url || null, files: small, engineBatches: batches.filter((b) => b.length).map((b) => Object.fromEntries(b.map((p) => [p, big[p]]))) }, null, 1));
