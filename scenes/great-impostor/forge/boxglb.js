// Minimal Forge-spec → GLB writer for box-only specs (no rotation except y-ish ignored; repeats supported). usage: node boxglb.js spec.json out.glb
const fs = require('fs'); const sp = JSON.parse(fs.readFileSync(process.argv[2]));
const mats = Object.keys(sp.materials), boxes = [];
for (const p of sp.parts) { if (p.t !== 'box') continue; const n = p.repeat?.n || 1, st = p.repeat?.step || [0, 0, 0];
  for (let i = 0; i < n; i++) boxes.push({ m: mats.indexOf(p.m), s: p.s, c: [p.p[0] + st[0] * i, p.p[1] + st[1] * i, p.p[2] + st[2] * i] }); }
const pos = [], nor = [], idx = []; const prims = mats.map(() => []);
const F = [[[1,0,0],[0,1,0],[0,0,1]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,1,0],[0,0,1],[1,0,0]],[[0,-1,0],[0,0,-1],[1,0,0]],[[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[-1,0,0],[0,1,0]]];
const groups = mats.map(() => ({ pos: [], nor: [], idx: [] }));
for (const b of boxes) { const g = groups[b.m]; const h = b.s.map((v) => v / 2);
  for (const [n, u, v] of F) { const base = g.pos.length / 3;
    for (const [a, c] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { for (let k = 0; k < 3; k++) g.pos.push(b.c[k] + n[k] * h[k] + u[k] * a * h[k] + v[k] * c * h[k]); g.nor.push(...n); }
    g.idx.push(base, base + 1, base + 2, base, base + 2, base + 3); } }
const bufs = [], json = { asset: { version: '2.0', generator: 'Forge 3D' }, scenes: [{ nodes: [0] }], scene: 0, nodes: [{ mesh: 0 }], meshes: [{ primitives: [] }], accessors: [], bufferViews: [], buffers: [], materials: [] };
let off = 0; const view = (arr, Type, target) => { const b = Buffer.from(new Type(arr).buffer); const pad = (4 - b.length % 4) % 4; bufs.push(b, Buffer.alloc(pad)); json.bufferViews.push({ buffer: 0, byteOffset: off, byteLength: b.length, target }); off += b.length + pad; return json.bufferViews.length - 1; };
mats.forEach((k, i) => { const m = sp.materials[k], c = (m.color || '#cccccc').match(/\w\w/g).map((x) => (parseInt(x, 16) / 255) ** 2.2);
  json.materials.push({ name: k, pbrMetallicRoughness: { baseColorFactor: [...c, 1], metallicFactor: m.metal ?? 0, roughnessFactor: m.rough ?? 0.9 } });
  const g = groups[i]; if (!g.idx.length) return; const P = g.pos; const mn = [0, 1, 2].map((k) => Math.min(...P.filter((_, j) => j % 3 === k))), mx = [0, 1, 2].map((k) => Math.max(...P.filter((_, j) => j % 3 === k)));
  json.accessors.push({ bufferView: view(P, Float32Array, 34962), componentType: 5126, count: P.length / 3, type: 'VEC3', min: mn, max: mx });
  json.accessors.push({ bufferView: view(g.nor, Float32Array, 34962), componentType: 5126, count: g.nor.length / 3, type: 'VEC3' });
  json.accessors.push({ bufferView: view(g.idx, Uint32Array, 34963), componentType: 5125, count: g.idx.length, type: 'SCALAR' });
  const a = json.accessors.length; json.meshes[0].primitives.push({ attributes: { POSITION: a - 3, NORMAL: a - 2 }, indices: a - 1, material: i }); });
const bin = Buffer.concat(bufs); json.buffers.push({ byteLength: bin.length });
let js = Buffer.from(JSON.stringify(json)); js = Buffer.concat([js, Buffer.alloc((4 - js.length % 4) % 4, 0x20)]);
const h = Buffer.alloc(12); h.write('glTF'); h.writeUInt32LE(2, 4); h.writeUInt32LE(28 + js.length + bin.length, 8);
const ch = (l, t) => { const b = Buffer.alloc(8); b.writeUInt32LE(l); b.write(t, 4); return b; };
fs.writeFileSync(process.argv[3], Buffer.concat([h, ch(js.length, 'JSON'), js, ch(bin.length, 'BIN\0'), bin])); console.log('ok', boxes.length, 'boxes');
