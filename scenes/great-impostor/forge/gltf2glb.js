// gltf (embedded data URIs) → glb. usage: node gltf2glb.js in.gltf out.glb
const fs = require('fs'); const g = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const dec = (u) => Buffer.from(u.split(',')[1], 'base64');
const parts = []; let off = 0; const pad4 = (n) => (n + 3) & ~3;
const add = (buf) => { const o = off; parts.push(buf); const p = pad4(buf.length) - buf.length; if (p) parts.push(Buffer.alloc(p)); off += pad4(buf.length); return o; };
const base = (g.buffers || []).map((b) => add(dec(b.uri)));
for (const bv of g.bufferViews || []) { bv.byteOffset = (bv.byteOffset || 0) + base[bv.buffer]; bv.buffer = 0; }
for (const im of g.images || []) if (im.uri && im.uri.startsWith('data:')) { const mime = im.uri.slice(5, im.uri.indexOf(';')); const b = dec(im.uri); const o = add(b);
  g.bufferViews = g.bufferViews || []; g.bufferViews.push({ buffer: 0, byteOffset: o, byteLength: b.length }); im.bufferView = g.bufferViews.length - 1; im.mimeType = mime; delete im.uri; }
const bin = Buffer.concat(parts); g.buffers = [{ byteLength: bin.length }];
let js = Buffer.from(JSON.stringify(g)); const jp = pad4(js.length) - js.length; js = Buffer.concat([js, Buffer.alloc(jp, 0x20)]);
const h = Buffer.alloc(12); h.write('glTF', 0); h.writeUInt32LE(2, 4); h.writeUInt32LE(12 + 8 + js.length + 8 + bin.length, 8);
const c = (len, type) => { const b = Buffer.alloc(8); b.writeUInt32LE(len, 0); b.write(type, 4); return b; };
fs.writeFileSync(process.argv[3], Buffer.concat([h, c(js.length, 'JSON'), js, c(bin.length, 'BIN\0'), bin]));
console.log(process.argv[3], (fs.statSync(process.argv[3]).size / 1024 | 0) + 'KB');
