#!/usr/bin/env node
// Compose a set GLB from a modular CC0 glTF kit (one .gltf + .bin per piece, shared PNG textures).
// Usage: node kit_compose.js <kitDir> <layout.js|json> <out.glb> [--tex 1024]
// layout = [{ piece, pos: [x,y,z], rotY (rad) | rot: [x,y,z] (Euler XYZ), scale }]  — pieces are re-used meshes, textures are shrunk to JPG with ffmpeg.
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const [kitDir, layoutFile, out] = process.argv.slice(2);
if (!kitDir || !layoutFile || !out) { console.error('usage: kit_compose.js <kitDir> <layout> <out.glb> [--tex 1024]'); process.exit(1); }
const TEX = +(process.argv[process.argv.indexOf('--tex') + 1] || 1024) || 1024;
const layout = layoutFile.endsWith('.js') ? require(path.resolve(layoutFile)) : JSON.parse(fs.readFileSync(layoutFile, 'utf8'));
let ffmpeg = 'ffmpeg'; try { ffmpeg = require('./lib/deps').ffmpeg() || 'ffmpeg'; } catch {}

const G = { asset: { version: '2.0', generator: 'motion-forge kit_compose' }, scene: 0, scenes: [{ nodes: [] }], nodes: [], meshes: [], materials: [], textures: [], images: [], samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }], accessors: [], bufferViews: [], buffers: [{ byteLength: 0 }] };
const chunks = []; let len = 0;
const push = (buf) => { const pad = (4 - (len % 4)) % 4; if (pad) { chunks.push(Buffer.alloc(pad)); len += pad; } const off = len; chunks.push(buf); len += buf.length; return off; };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-'));
const imgIdx = {}, matIdx = {}, meshIdx = {};
function image(uri, role) {
  const k = uri + role; if (imgIdx[k] != null) return imgIdx[k];
  const src = path.join(kitDir, uri), alpha = /Vine|Leaf/i.test(uri), size = role === 'base' ? TEX : TEX / 2;
  const dst = path.join(tmp, path.basename(uri, '.png') + (alpha ? '.png' : '.jpg'));
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', src, '-vf', `scale=${size}:${size}:flags=lanczos`, ...(alpha ? [] : ['-q:v', role === 'base' ? '3' : '4']), dst]);
  const buf = fs.readFileSync(dst), bv = G.bufferViews.push({ buffer: 0, byteOffset: push(buf), byteLength: buf.length }) - 1;
  G.images.push({ bufferView: bv, mimeType: alpha ? 'image/png' : 'image/jpeg', name: path.basename(uri, '.png') });
  return (imgIdx[k] = G.textures.push({ sampler: 0, source: G.images.length - 1 }) - 1);
}
function material(src, m) {
  if (matIdx[m.name] != null) return matIdx[m.name];
  const pbr = m.pbrMetallicRoughness || {}, tex = (ref, role) => (ref ? { index: image(src.images[src.textures[ref.index].source].uri, role) } : undefined);
  const out = { name: m.name, doubleSided: !!m.doubleSided, pbrMetallicRoughness: { metallicFactor: m.name === 'MI_MetalOrnaments' ? 0.6 : 0, roughnessFactor: 1,
    baseColorTexture: tex(pbr.baseColorTexture, 'base'), metallicRoughnessTexture: tex(pbr.metallicRoughnessTexture, 'rough') }, normalTexture: tex(m.normalTexture, 'normal') };
  if (pbr.baseColorFactor) out.pbrMetallicRoughness.baseColorFactor = pbr.baseColorFactor;
  if (m.alphaMode) { out.alphaMode = m.alphaMode; if (m.alphaCutoff != null) out.alphaCutoff = m.alphaCutoff; }
  if (/Glass/i.test(m.name)) { out.pbrMetallicRoughness.baseColorFactor = [0.12, 0.1, 0.08, 1]; out.pbrMetallicRoughness.roughnessFactor = 0.2; }
  return (matIdx[m.name] = G.materials.push(out) - 1);
}
function mesh(piece) {
  if (meshIdx[piece] != null) return meshIdx[piece];
  const file = path.join(kitDir, piece + '.gltf'), src = JSON.parse(fs.readFileSync(file, 'utf8'));
  const bin = fs.readFileSync(path.join(kitDir, src.buffers[0].uri)), accMap = {};
  const acc = (i) => { if (accMap[i] != null) return accMap[i]; const a = src.accessors[i], v = src.bufferViews[a.bufferView];
    const data = bin.subarray((v.byteOffset || 0), (v.byteOffset || 0) + v.byteLength);
    const bv = G.bufferViews.push({ buffer: 0, byteOffset: push(Buffer.from(data)), byteLength: v.byteLength, ...(v.byteStride ? { byteStride: v.byteStride } : {}), ...(v.target ? { target: v.target } : {}) }) - 1;
    return (accMap[i] = G.accessors.push({ ...a, bufferView: bv }) - 1); };
  const prims = src.meshes.flatMap((m) => m.primitives).map((p) => ({ attributes: Object.fromEntries(Object.entries(p.attributes).filter(([k]) => k !== 'TEXCOORD_1' || false).map(([k, v]) => [k, acc(v)])),
    ...(p.indices != null ? { indices: acc(p.indices) } : {}), ...(p.material != null ? { material: material(src, src.materials[p.material]) } : {}), mode: p.mode ?? 4 }));
  return (meshIdx[piece] = G.meshes.push({ name: piece, primitives: prims }) - 1);
}
for (const it of layout) {
  const [ex, ey, ez] = it.rot || [0, it.rotY || 0, 0], c1 = Math.cos(ex / 2), c2 = Math.cos(ey / 2), c3 = Math.cos(ez / 2), s1 = Math.sin(ex / 2), s2 = Math.sin(ey / 2), s3 = Math.sin(ez / 2);   // Euler XYZ → quaternion
  const n = { name: it.piece, mesh: mesh(it.piece), translation: it.pos || [0, 0, 0], rotation: [s1 * c2 * c3 + c1 * s2 * s3, c1 * s2 * c3 - s1 * c2 * s3, c1 * c2 * s3 + s1 * s2 * c3, c1 * c2 * c3 - s1 * s2 * s3] };
  if (it.scale) n.scale = Array.isArray(it.scale) ? it.scale : [it.scale, it.scale, it.scale];
  G.scenes[0].nodes.push(G.nodes.push(n) - 1);
}
const binBuf = Buffer.concat(chunks), binPad = Buffer.concat([binBuf, Buffer.alloc((4 - (binBuf.length % 4)) % 4)]);
G.buffers[0].byteLength = binPad.length;
let json = Buffer.from(JSON.stringify(G)); json = Buffer.concat([json, Buffer.alloc((4 - (json.length % 4)) % 4, 0x20)]);
const hdr = Buffer.alloc(12); hdr.writeUInt32LE(0x46546c67, 0); hdr.writeUInt32LE(2, 4); hdr.writeUInt32LE(12 + 8 + json.length + 8 + binPad.length, 8);
const ch = (type, b) => { const h = Buffer.alloc(8); h.writeUInt32LE(b.length, 0); h.writeUInt32LE(type, 4); return Buffer.concat([h, b]); };
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, Buffer.concat([hdr, ch(0x4e4f534a, json), ch(0x004e4942, binPad)]));
fs.rmSync(tmp, { recursive: true, force: true });
console.error(`${out}: ${layout.length} pieces, ${G.meshes.length} meshes, ${G.images.length} textures, ${(fs.statSync(out).size / 1e6).toFixed(1)} MB`);
