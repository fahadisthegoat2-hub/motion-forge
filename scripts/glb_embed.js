#!/usr/bin/env node
// Embed external textures into a GLB (and optionally drop nodes) so it loads standalone in scenes/artifacts.
// Usage: node glb_embed.js in.glb out.glb --tex-dir <dir> [--drop name1,name2]
const fs = require('fs'), path = require('path');
const [inp, out] = process.argv.slice(2), arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const texDir = arg('--tex-dir') || path.dirname(inp), drop = (arg('--drop') || '').split(',').filter(Boolean);
const b = fs.readFileSync(inp), jl = b.readUInt32LE(12), J = JSON.parse(b.slice(20, 20 + jl).toString());
let bin = b.slice(28 + jl, 28 + jl + b.readUInt32LE(20 + jl));
for (const img of J.images || []) if (img.uri && !img.uri.startsWith('data:')) {
  const data = fs.readFileSync(path.join(texDir, path.basename(img.uri))), pad = (4 - bin.length % 4) % 4;
  bin = Buffer.concat([bin, Buffer.alloc(pad)]); J.bufferViews.push({ buffer: 0, byteOffset: bin.length, byteLength: data.length }); bin = Buffer.concat([bin, data]);
  img.bufferView = J.bufferViews.length - 1; img.mimeType = /\.jpe?g$/i.test(img.uri) ? 'image/jpeg' : 'image/png'; delete img.uri;
}
if (drop.length) { const ids = new Set(J.nodes.map((n, i) => drop.includes(n.name) ? i : -1).filter((i) => i >= 0));
  for (const n of J.nodes) if (n.children) n.children = n.children.filter((c) => !ids.has(c));
  for (const s of J.scenes) s.nodes = s.nodes.filter((c) => !ids.has(c)); }
bin = Buffer.concat([bin, Buffer.alloc((4 - bin.length % 4) % 4)]); J.buffers[0].byteLength = bin.length;
let js = Buffer.from(JSON.stringify(J)); js = Buffer.concat([js, Buffer.alloc((4 - js.length % 4) % 4, 0x20)]);
const h = Buffer.alloc(12); h.write('glTF'); h.writeUInt32LE(2, 4); h.writeUInt32LE(12 + 8 + js.length + 8 + bin.length, 8);
const c = (buf, type) => { const x = Buffer.alloc(8); x.writeUInt32LE(buf.length, 0); x.write(type, 4); return Buffer.concat([x, buf]); };
fs.writeFileSync(out, Buffer.concat([h, c(js, 'JSON'), c(bin, 'BIN\0')])); console.log('wrote', out, fs.statSync(out).size);
