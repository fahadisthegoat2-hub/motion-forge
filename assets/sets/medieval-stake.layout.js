// Execution stake + log pyre from the Medieval Village MegaKit (CC0) Roof_Log, scaled down. Origin = foot of the stake.
// Roof_Log: 10.7 m long along z, centred at y ≈ 4.55. Scale k → length 10.7k, thickness 1.15k.
const L = [], P = Math.PI, add = (o) => L.push(o);
const log = (k, x, y, z, rot) => {   // place a scaled log whose centre ends up at (x, y, z)
  const c = [0, 4.55 * k, 0], [ax, ay, az] = rot;   // rotate the centre offset by the same Euler XYZ
  const rx = (v) => [v[0], v[1] * Math.cos(ax) - v[2] * Math.sin(ax), v[1] * Math.sin(ax) + v[2] * Math.cos(ax)];
  const ry = (v) => [v[0] * Math.cos(ay) + v[2] * Math.sin(ay), v[1], -v[0] * Math.sin(ay) + v[2] * Math.cos(ay)];
  const rz = (v) => [v[0] * Math.cos(az) - v[1] * Math.sin(az), v[0] * Math.sin(az) + v[1] * Math.cos(az), v[2]];
  const o = rz(ry(rx(c)));   // three.js 'XYZ' order applies X first → matrix = Rx·Ry·Rz … keep it simple: only one axis is non-zero below
  add({ piece: 'Roof_Log', pos: [x - o[0], y - o[1], z - o[2]], rot, scale: k });
};
log(0.30, 0, 1.6, -0.25, [P / 2, 0, 0]);           // the stake: upright, 3.2 m, behind the victim
for (let i = 0; i < 9; i++) { const a = (i / 9) * P * 2; log(0.15, Math.sin(a) * 0.75, 0.12, Math.cos(a) * 0.75 - 0.25, [0, a + P / 2, 0]); }   // ring of logs
for (let i = 0; i < 7; i++) { const a = (i / 7) * P * 2 + 0.3; log(0.13, Math.sin(a) * 0.45, 0.3, Math.cos(a) * 0.45 - 0.25, [0, a + P / 2, 0]); }   // inner ring, stacked
for (let i = 0; i < 6; i++) { const a = (i / 6) * P * 2; log(0.12, Math.sin(a) * 1.05, 0.08, Math.cos(a) * 1.05 - 0.25, [0, a, 0]); }   // outer spokes
module.exports = L;
