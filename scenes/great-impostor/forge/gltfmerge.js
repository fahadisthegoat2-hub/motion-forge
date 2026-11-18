// merges several embedded .gltf files into one (scene roots side by side). usage: node gltfmerge.js out.gltf a.gltf b.gltf …
const fs = require('fs'); const [out, ...ins] = process.argv.slice(2);
const R = { asset: { version: '2.0', generator: 'Forge 3D' }, scenes: [{ nodes: [] }], scene: 0 };
const K = ['nodes', 'meshes', 'accessors', 'bufferViews', 'buffers', 'materials', 'textures', 'images', 'samplers'];
for (const f of ins) { const g = JSON.parse(fs.readFileSync(f, 'utf8')); const off = {}; for (const k of K) { off[k] = (R[k] || []).length; R[k] = (R[k] || []).concat(g[k] || []); }
  const s = (k, i) => i + off[k];
  for (const n of g.nodes || []) { if (n.children) n.children = n.children.map((i) => s('nodes', i)); if (n.mesh != null) n.mesh = s('meshes', n.mesh); }
  for (const m of g.meshes || []) for (const p of m.primitives) { for (const a in p.attributes) p.attributes[a] = s('accessors', p.attributes[a]); if (p.indices != null) p.indices = s('accessors', p.indices); if (p.material != null) p.material = s('materials', p.material); }
  for (const a of g.accessors || []) if (a.bufferView != null) a.bufferView = s('bufferViews', a.bufferView);
  for (const b of g.bufferViews || []) b.buffer = s('buffers', b.buffer);
  for (const t of g.textures || []) { if (t.source != null) t.source = s('images', t.source); if (t.sampler != null) t.sampler = s('samplers', t.sampler); }
  for (const im of g.images || []) if (im.bufferView != null) im.bufferView = s('bufferViews', im.bufferView);
  const fix = (o) => { if (!o || typeof o !== 'object') return; for (const k in o) { if (k === 'index' && typeof o[k] === 'number') o[k] = s('textures', o[k]); else fix(o[k]); } };
  for (const m of g.materials || []) fix(m);
  R.scenes[0].nodes.push(...g.scenes[g.scene || 0].nodes.map((i) => s('nodes', i)));
  if (g.extensionsUsed) R.extensionsUsed = [...new Set([...(R.extensionsUsed || []), ...g.extensionsUsed])]; }
fs.writeFileSync(out, JSON.stringify(R)); console.log(out);
