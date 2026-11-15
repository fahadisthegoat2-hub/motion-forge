// Medieval village street (Quaternius Medieval Village MegaKit, CC0) — composed by scripts/kit_compose.js.
// Acting area: open square around the origin; the street runs back along -z; houses line both sides.
const L = [], P = Math.PI, W = 2;   // wall module = 2 m wide, 3.12 m tall
const add = (piece, x, y, z, rotY = 0, scale) => L.push({ piece, pos: [x, y, z], rotY, ...(scale ? { scale } : {}) });
// house: centre (cx, cz), w × d modules (2 m), floors, which side faces the street ('+x' | '-x' | '+z')
function house(cx, cz, w, d, floors, style, seed) {
  const hw = w * W / 2, hd = d * W / 2, wall = style === 'brick' ? 'Wall_UnevenBrick' : 'Wall_Plaster';
  const pick = (i, f) => { const r = (Math.sin(seed * 91.7 + i * 12.9 + f * 7.3) * 43758.5) % 1, a = Math.abs(r);
    if (f === 0 && i === 1) return wall + '_Door_Round'; if (a < 0.35) return wall + '_Window_Wide_Round'; if (a < 0.55 && style !== 'brick') return 'Wall_Plaster_WoodGrid'; if (a < 0.7) return wall + '_Window_Thin_Round'; return wall + '_Straight'; };
  for (let f = 0; f < floors; f++) { const y = f * 3.12;
    for (let i = 0; i < w; i++) { const x = cx - hw + W / 2 + i * W; add(pick(i, f), x, y, cz + hd, 0); add(pick(i + 9, f), x, y, cz - hd, P); }
    for (let i = 0; i < d; i++) { const z = cz - hd + W / 2 + i * W; add(pick(i + 4, f), cx + hw, y, z, P / 2); add(pick(i + 13, f), cx - hw, y, z, -P / 2); }
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) add('Corner_Exterior_Wood', cx + sx * hw, y, cz + sz * hd, 0);
  }
  const top = floors * 3.12, roof = `Roof_RoundTiles_${w * 2}x${d * 2}`;
  add(roof, cx, top, cz, 0);
  add('Roof_Front_Brick' + (w * 2), cx, top, cz + hd, 0); add('Roof_Front_Brick' + (w * 2), cx, top, cz - hd, P);
  if (seed % 2) add('Prop_Chimney', cx + hw - 0.8, top + 1.2, cz - hd + 1.0, 0);
}
// left row (x < 0), right row (x > 0), back of the street closes the view
let s = 1;
for (const [cz, d, fl, st] of [[6, 3, 1, 'brick'], [-1, 3, 2, 'plaster'], [-8, 3, 1, 'brick'], [-15, 3, 2, 'plaster'], [-22, 3, 1, 'plaster'], [-29, 3, 2, 'brick']]) house(-5.7, cz, 2, d, fl, st, s++);
for (const [cz, d, fl, st] of [[4, 3, 2, 'plaster'], [-3, 3, 1, 'brick'], [-10, 3, 2, 'plaster'], [-17, 3, 1, 'plaster'], [-24, 3, 2, 'brick'], [-31, 3, 1, 'plaster']]) house(5.7, cz, 2, d, fl, st, s++);
house(0, -38, 3, 2, 2, 'plaster', 22);
// behind the camera side (seen in reverse/orbit shots)
for (const [cx, cz, fl] of [[-6, 9, 1], [0, 13, 2], [6, 10, 1]]) house(cx, cz, 2, 2, fl, fl > 1 ? 'plaster' : 'brick', s++);
// cobbled street down the middle (3 modules wide)
for (let z = -36; z <= 8; z += 2) for (const x of [-2, 0, 2]) add('Floor_UnevenBrick', x, 0.01, z, 0);
// props along the street
add('Prop_Wagon', 2.6, 0, -9, 0.1); add('Prop_Crate', -3.0, 0, -6.4, 0.3); add('Prop_Crate', -3.1, 0, -5.2, 1.1); add('Prop_Crate', -3.0, 1.06, -5.8, 0.7);
add('Prop_Crate', 3.0, 0, -15, 0.4); add('Prop_Crate', -3.0, 0, -19, 0.9);
for (let i = 0; i < 4; i++) add('Prop_WoodenFence_Single', -3.2, 0, -24 - i * 2.06, P / 2);
add('Prop_Wagon', -3.0, 0, 5.5, -0.4);
module.exports = L;
