// Forge 3D ULTRA specs (modelforge/model-spec.md) for "Beam Through His Head" — Soviet U-70 accelerator props.
const R = (v) => Math.round(v * 1000) / 1000;
const out = {};

// ---------- 1 · U-70 bending magnet (C-yoke dipole) with beam pipe ----------
{
  const L = 2.2, Y0 = 0.3, H = 1.0, gapY = Y0 + 0.4, gapH = 0.2, pipeZ = 0.3;
  const parts = [
    { n: 'plinth', t: 'box', m: 'concrete', s: [2.5, 0.16, 1.3], bevel: 0.02, p: [0, 0.08, 0], noise: { amp: 0.004, freq: 6, seed: 2 } },
    { n: 'foot', t: 'box', m: 'steel', s: [0.3, 0.14, 1.16], bevel: 0.01, p: [0.8, 0.23, 0], mirror: 'x' },
    { n: 'jack', t: 'cyl', m: 'chrome', s: [0.025, 0.025, 0.1], p: [0.8, 0.2, 0.46], mirror: 'x', repeat: { n: 2, step: [0, 0, -0.92] } },
    { n: 'yoke', t: 'extrude', m: 'paint', r: [0, 90, 0], p: [0, 0, 0], depth: L, bevel: 0.012,
      pts: [[-0.55, Y0], [0.55, Y0], [0.55, Y0 + H], [-0.55, Y0 + H], [-0.55, gapY + gapH], [-0.05, gapY + gapH], [-0.05, gapY], [-0.55, gapY]] },
    { n: 'lam_low', t: 'box', m: 'seam', s: [0.014, 0.406, 1.124], p: [-1.0, Y0 + 0.2, 0], repeat: { n: 21, step: [0.1, 0, 0] } },
    { n: 'lam_up', t: 'box', m: 'seam', s: [0.014, 0.406, 1.124], p: [-1.0, gapY + gapH + 0.2, 0], repeat: { n: 21, step: [0.1, 0, 0] } },
    { n: 'pole_low', t: 'box', m: 'pole', s: [L - 0.06, 0.03, 0.46], p: [0, gapY + 0.015, pipeZ - 0.02] },
    { n: 'pole_up', t: 'box', m: 'pole', s: [L - 0.06, 0.03, 0.46], p: [0, gapY + gapH - 0.015, pipeZ - 0.02] },
    { n: 'coil_low', t: 'box', m: 'copper', s: [0.16, 0.13, 1.18], bevel: 0.04, p: [1.18, gapY - 0.06, 0], mirror: 'x' },
    { n: 'coil_up', t: 'box', m: 'copper', s: [0.16, 0.13, 1.18], bevel: 0.04, p: [1.18, gapY + gapH + 0.06, 0], mirror: 'x' },
    { n: 'coil_wrap', t: 'box', m: 'tape', s: [0.17, 0.32, 0.05], bevel: 0.01, p: [1.18, gapY + 0.1, -0.35], mirror: 'x', repeat: { n: 3, step: [0, 0, 0.3] } },
    { n: 'beampipe', t: 'cyl', m: 'chrome', s: [0.045, 0.045, 2.9], r: [0, 0, 90], p: [0, gapY + 0.1, pipeZ] },
    { n: 'flange', t: 'cyl', m: 'steel', s: [0.085, 0.085, 0.03], bevel: 0.004, r: [0, 0, 90], p: [1.42, gapY + 0.1, pipeZ], mirror: 'x',
      children: [{ n: 'bolt', t: 'cyl', m: 'dark', s: [0.009, 0.009, 0.05], p: [0.068, 0, 0], repeat: { n: 8, axis: 'y' } }] },
    { n: 'bellows', t: 'torus', m: 'chrome', s: [0.052, 0.008], r: [0, 90, 0], p: [1.25, gapY + 0.1, pipeZ], mirror: 'x', repeat: { n: 6, step: [0.022, 0, 0] } },
    { n: 'pump', t: 'lathe', m: 'steel', p: [-0.0, gapY + gapH + 0.02, pipeZ + 0.62], pts: [[0, 0], [0.07, 0], [0.07, 0.02], [0.05, 0.03], [0.05, 0.18], [0.075, 0.2], [0.075, 0.24], [0, 0.24]], smooth: false },
    { n: 'pump_arm', t: 'tube', m: 'chrome', radius: 0.022, path: [[0, gapY + 0.1, pipeZ + 0.04], [0, gapY + 0.1, pipeZ + 0.35], [0, gapY + 0.15, pipeZ + 0.62]] },
    { n: 'hose', t: 'tube', m: 'rubber', radius: 0.018, mirror: 'x', repeat: { n: 4, step: [0, 0, -0.26] },
      path: [[1.27, gapY + 0.26, 0.4], [1.42, gapY + 0.5, 0.4], [1.3, Y0 + H + 0.18, 0.38], [1.0, Y0 + H + 0.14, 0.4]] },
    { n: 'manifold', t: 'cyl', m: 'blue', s: [0.035, 0.035, 2.3], r: [0, 0, 90], p: [0, Y0 + H + 0.1, 0.0] },
    { n: 'manifold_2', t: 'cyl', m: 'red', s: [0.035, 0.035, 2.3], r: [0, 0, 90], p: [0, Y0 + H + 0.1, -0.22] },
    { n: 'mf_clamp', t: 'box', m: 'steel', s: [0.04, 0.12, 0.42], p: [-0.9, Y0 + H + 0.05, -0.11], repeat: { n: 5, step: [0.45, 0, 0] } },
    { n: 'tray', t: 'box', m: 'galv', s: [2.0, 0.03, 0.26], p: [0, Y0 + H + 0.02, -0.4] },
    { n: 'cable', t: 'tube', m: 'cableBlk', radius: 0.012, repeat: { n: 5, step: [0, 0, 0.04] },
      path: [[-1.25, Y0 + H + 0.05, -0.48], [-0.4, Y0 + H + 0.05, -0.48], [0.4, Y0 + H + 0.05, -0.48], [1.25, Y0 + H + 0.05, -0.48], [1.4, Y0 + 0.6, -0.48]] },
    { n: 'topbolt', t: 'cyl', m: 'dark', s: [0.016, 0.016, 0.02], p: [-1.0, Y0 + H + 0.008, 0.45], repeat: { n: 11, step: [0.2, 0, 0] } },
    { n: 'sidebolt', t: 'cyl', m: 'dark', s: [0.016, 0.016, 0.02], r: [90, 0, 0], p: [-1.0, Y0 + 0.08, 0.555], repeat: { n: 11, step: [0.2, 0, 0] } },
    { n: 'hazard', t: 'box', m: 'yellow', s: [2.204, 0.06, 0.004], p: [0, Y0 + 0.05, 0.556] },
    { n: 'hazard_s', t: 'box', m: 'dark', s: [0.03, 0.062, 0.004], r: [0, 0, 35], p: [-1.05, Y0 + 0.05, 0.5575], repeat: { n: 22, step: [0.1, 0, 0] } },
    { n: 'tag', t: 'box', m: 'plate', s: [0.22, 0.12, 0.006], bevel: 0.002, p: [0.6, Y0 + H - 0.14, 0.556],
      children: [{ n: 'screw', t: 'cyl', m: 'chrome', s: [0.006, 0.006, 0.006], r: [90, 0, 0], p: [-0.095, 0.045, 0.004], mirror: 'x' }, { n: 'tagline', t: 'box', m: 'dark', s: [0.15, 0.008, 0.002], p: [0, 0, 0.004], repeat: { n: 3, step: [0, -0.025, 0] } }] },
    { n: 'lamp_base', t: 'cyl', m: 'dark', s: [0.05, 0.06, 0.04], p: [-0.8, Y0 + H + 0.02, 0.3] },
    { n: 'lamp', t: 'lathe', m: 'redglow', p: [-0.8, Y0 + H + 0.04, 0.3], pts: [[0, 0], [0.045, 0], [0.045, 0.06], [0.035, 0.1], [0, 0.11]] },
    { n: 'lamp_cage', t: 'torus', m: 'steel', s: [0.048, 0.004], r: [90, 0, 0], p: [-0.8, Y0 + H + 0.08, 0.3] },
    { n: 'pipe_stand', t: 'cyl', m: 'steel', s: [0.02, 0.02, gapY + 0.05], p: [1.55, (gapY + 0.05) / 2, pipeZ], mirror: 'x' },
  ];
  out.accel_magnet = { name: 'U-70 Bending Magnet', materials: {
    paint: { preset: 'paint', color: '#2d5f8a', rough: 0.45, tex: 'scratched' }, seam: { preset: 'iron', color: '#1d2a36', rough: 0.7 },
    pole: { preset: 'metal', color: '#8a9096', rough: 0.3, tex: 'brushed' }, copper: { preset: 'metal', color: '#b4683a', rough: 0.32, tex: 'brushed' },
    tape: { preset: 'fabric', color: '#d9cfa8', rough: 0.85 }, chrome: { preset: 'chrome' }, steel: { preset: 'metal', color: '#a5aab0', rough: 0.35 },
    dark: { preset: 'iron', color: '#2a2c30' }, rubber: { preset: 'rubber', color: '#191a1c' }, blue: { preset: 'paint', color: '#2f6fbf', rough: 0.4 },
    red: { preset: 'paint', color: '#b3352c', rough: 0.4 }, galv: { preset: 'metal', color: '#9ea4a8', rough: 0.55, tex: 'noise' }, cableBlk: { preset: 'rubber', color: '#232427' },
    yellow: { preset: 'paint', color: '#e2b324', rough: 0.5 }, plate: { preset: 'metal', color: '#c9c3b3', rough: 0.4 }, redglow: { preset: 'emissive', color: '#ff3020', glow: 4 },
    concrete: { preset: 'stone', color: '#8c8a84', rough: 0.9, tex: 'stone' } }, parts };
}

// ---------- 2 · accelerator tunnel segment (4 m, open toward +Z) ----------
{
  const W = 4, D = 5.4, H = 3.4, zb = -2.6;
  const parts = [
    { n: 'floor', t: 'box', m: 'floor', s: [W, 0.12, D], p: [0, -0.06, 0]},
    { n: 'floorline', t: 'box', m: 'yellow', s: [W, 0.004, 0.08], p: [0, 0.002, 1.3] },
    { n: 'floorline2', t: 'box', m: 'yellow', s: [W, 0.004, 0.08], p: [0, 0.002, -1.4] },
    { n: 'wall', t: 'box', m: 'wall', s: [W, H, 0.24], p: [0, H / 2, zb - 0.12]},
    { n: 'wainscot', t: 'box', m: 'wallpaint', s: [W, 1.2, 0.01], p: [0, 0.6, zb + 0.006] },
    { n: 'wainline', t: 'box', m: 'redstripe', s: [W, 0.06, 0.012], p: [0, 1.22, zb + 0.007] },
    { n: 'panelseam', t: 'box', m: 'seam', s: [0.012, H, 0.012], p: [-1.5, H / 2, zb + 0.004], repeat: { n: 3, step: [1.5, 0, 0] } },
    { n: 'ceiling', t: 'box', m: 'wall', s: [W, 0.25, D], p: [0, H + 0.125, 0] },
    { n: 'beam', t: 'box', m: 'wall', s: [0.3, 0.35, D], p: [-1.85, H - 0.17, 0], repeat: { n: 2, step: [3.7, 0, 0] } },
    { n: 'tray', t: 'box', m: 'galv', s: [W, 0.03, 0.4], p: [0, 2.2, zb + 0.22], repeat: { n: 3, step: [0, 0.38, 0] },
      children: [{ n: 'lip', t: 'box', m: 'galv', s: [W, 0.08, 0.01], p: [0, 0.04, 0.2] }] },
    { n: 'bracket', t: 'box', m: 'steel', s: [0.04, 0.9, 0.42], p: [-1.6, 2.55, zb + 0.22], repeat: { n: 3, step: [1.6, 0, 0] } },
    ...[0, 1, 2].map((lv) => ({ n: 'cables' + lv, t: 'tube', m: lv === 1 ? 'cableOr' : 'cableBlk', radius: 0.022, repeat: { n: 6, step: [0, 0, 0.055] },
      path: [[-W / 2, 2.24 + lv * 0.38, zb + 0.08], [-W / 6, 2.235 + lv * 0.38, zb + 0.08], [W / 6, 2.24 + lv * 0.38, zb + 0.08], [W / 2, 2.235 + lv * 0.38, zb + 0.08]] })),
    { n: 'waterpipe', t: 'cyl', m: 'bluepipe', s: [0.07, 0.07, W], r: [0, 0, 90], p: [0, 1.65, zb + 0.18] },
    { n: 'waterpipe2', t: 'cyl', m: 'greenpipe', s: [0.055, 0.055, W], r: [0, 0, 90], p: [0, 1.45, zb + 0.16] },
    { n: 'pipeclamp', t: 'torus', m: 'steel', s: [0.075, 0.012], r: [0, 90, 0], p: [-1.5, 1.65, zb + 0.18], repeat: { n: 3, step: [1.5, 0, 0] } },
    { n: 'valve', t: 'lathe', m: 'red', p: [0.7, 1.72, zb + 0.18], pts: [[0, 0], [0.04, 0], [0.04, 0.1], [0.015, 0.11], [0.015, 0.16], [0, 0.16]] },
    { n: 'valve_wheel', t: 'torus', m: 'red', s: [0.07, 0.01], r: [90, 0, 0], p: [0.7, 1.89, zb + 0.18] },
    { n: 'conduit_box', t: 'box', m: 'grey', s: [0.4, 0.5, 0.18], bevel: 0.01, p: [-0.9, 0.95, zb + 0.09],
      children: [{ n: 'lever', t: 'box', m: 'dark', s: [0.03, 0.14, 0.05], r: [20, 0, 0], p: [0.12, 0, 0.11] }, { n: 'pilot', t: 'sphere', m: 'greenglow', s: [0.018], p: [-0.1, 0.16, 0.095] }, { n: 'pilot2', t: 'sphere', m: 'redglow', s: [0.018], p: [-0.04, 0.16, 0.095] }] },
    { n: 'sign', t: 'extrude', m: 'yellow', p: [0.9, 1.0, zb + 0.012], depth: 0.008, pts: [[-0.17, -0.14], [0.17, -0.14], [0, 0.16]],
      children: [{ n: 'trefoil', t: 'cyl', m: 'dark', s: [0.03, 0.03, 0.006], r: [90, 0, 0], p: [0, -0.03, 0.006] },
        { n: 'blade', t: 'extrude', m: 'dark', p: [0, -0.03, 0.006], depth: 0.004, pts: [[0, 0], [0.09, 0.04], [0.09, -0.04]], r: [0, 0, 90], repeat: { n: 3, axis: 'z' } }] },
    { n: 'walllamp', t: 'box', m: 'grey', s: [0.7, 0.1, 0.16], bevel: 0.01, p: [-1.0, 3.0, zb + 0.08], repeat: { n: 2, step: [2.0, 0, 0] },
      children: [{ n: 'tube', t: 'capsule', m: 'lightglow', s: [0.025, 0.6], r: [0, 0, 90], p: [0, -0.06, 0.02] }] },
    { n: 'ceilamp', t: 'box', m: 'grey', s: [1.2, 0.08, 0.3], p: [0, H - 0.04, 0.4],
      children: [{ n: 'ceil_tube', t: 'capsule', m: 'lightglow', s: [0.028, 1.05], r: [0, 0, 90], p: [0, -0.05, 0.07], repeat: { n: 2, step: [0, 0, -0.14] } }] },
    { n: 'beacon_base', t: 'cyl', m: 'dark', s: [0.07, 0.08, 0.05], r: [90, 0, 0], p: [1.6, 2.0, zb + 0.03] },
    { n: 'beacon', t: 'lathe', m: 'redglow', r: [90, 0, 0], p: [1.6, 2.0, zb + 0.06], pts: [[0, 0], [0.06, 0], [0.06, 0.08], [0.045, 0.13], [0, 0.14]] },
    { n: 'extinguisher', t: 'lathe', m: 'red', p: [-1.75, 0.0, zb + 0.13], pts: [[0, 0], [0.08, 0], [0.085, 0.03], [0.085, 0.5], [0.06, 0.56], [0.02, 0.6], [0, 0.6]],
      children: [{ n: 'ext_head', t: 'box', m: 'dark', s: [0.04, 0.06, 0.08], p: [0, 0.63, 0] }, { n: 'ext_hose', t: 'tube', m: 'rubber', radius: 0.01, path: [[0, 0.63, 0.04], [0.06, 0.55, 0.09], [0.09, 0.3, 0.09]] }] },
    { n: 'rail', t: 'box', m: 'steel', s: [W, 0.05, 0.06], p: [0, 0.025, -0.6], repeat: { n: 2, step: [0, 0, 0.9] } },
    { n: 'sleeper', t: 'box', m: 'dark', s: [0.12, 0.03, 1.1], p: [-1.8, 0.015, -0.15], repeat: { n: 10, step: [0.4, 0, 0] } },
    { n: 'anchor', t: 'cyl', m: 'dark', s: [0.018, 0.018, 0.02], r: [90, 0, 0], p: [-1.9, 0.3, zb + 0.01], repeat: { n: 16, step: [0.25, 0, 0] } },
    { n: 'conduit', t: 'cyl', m: 'galv', s: [0.025, 0.025, 2.0], p: [-1.2, 1.0, zb + 0.06], repeat: { n: 3, step: [1.15, 0, 0] } },
    { n: 'jbox', t: 'box', m: 'grey', s: [0.22, 0.22, 0.1], bevel: 0.008, p: [-1.2, 2.02, zb + 0.06], repeat: { n: 3, step: [1.15, 0, 0] } },
    { n: 'grate', t: 'box', m: 'steel', s: [0.02, 0.012, 0.14], p: [-1.95, 0.004, zb + 0.2], repeat: { n: 40, step: [0.1, 0, 0] } },
    { n: 'numplate', t: 'box', m: 'plate', s: [0.3, 0.16, 0.008], p: [-0.2, 2.0, zb + 0.008], children: [{ n: 'digit', t: 'box', m: 'dark', s: [0.03, 0.09, 0.003], p: [-0.08, 0, 0.005], repeat: { n: 4, step: [0.05, 0, 0] } }] },
    { n: 'drain', t: 'box', m: 'dark', s: [W, 0.005, 0.14], p: [0, 0.0025, zb + 0.2] },
  ];
  out.accel_tunnel = { name: 'Accelerator Tunnel Segment', materials: {
    floor: { preset: 'stone', color: '#6f7069', rough: 0.75, tex: 'stone', texScale: 2 }, wall: { preset: 'stone', color: '#b9b5aa', rough: 0.92, tex: 'stone', texScale: 1.5 },
    wallpaint: { preset: 'paint', color: '#4f7a6c', rough: 0.6, tex: 'noise' }, redstripe: { preset: 'paint', color: '#9b2f28', rough: 0.55 }, seam: { preset: 'stone', color: '#58564f', rough: 1 },
    galv: { preset: 'metal', color: '#9ea4a8', rough: 0.55, tex: 'noise' }, steel: { preset: 'metal', color: '#7d8389', rough: 0.45, tex: 'scratched' },
    cableBlk: { preset: 'rubber', color: '#1e1f22' }, cableOr: { preset: 'rubber', color: '#9c4b1c' }, bluepipe: { preset: 'paint', color: '#2f5f9a', rough: 0.45 },
    greenpipe: { preset: 'paint', color: '#3f6b48', rough: 0.5 }, red: { preset: 'paint', color: '#b02a22', rough: 0.4 }, grey: { preset: 'paint', color: '#8d9192', rough: 0.55 },
    dark: { preset: 'iron', color: '#26282b' }, yellow: { preset: 'paint', color: '#e2b324', rough: 0.5 }, rubber: { preset: 'rubber' },
    lightglow: { preset: 'emissive', color: '#eaf6ff', glow: 5 }, redglow: { preset: 'emissive', color: '#ff2a18', glow: 5 }, greenglow: { preset: 'emissive', color: '#3cff6a', glow: 4 }, plate: { preset: 'metal', color: '#d6d0bd', rough: 0.4 } }, parts };
}

// ---------- 3 · Soviet control console (front faces +Z, operator stands at +Z) ----------
{
  const W = 2.0;
  const knobs = []; for (let i = 0; i < 9; i++) knobs.push({ n: 'knob' + i, t: 'lathe', m: i % 3 ? 'bakelite' : 'redknob', r: [90, 0, 0], p: [R(-0.85 + i * 0.2), 0.0, 0.01], pts: [[0, 0], [0.022, 0], [0.024, 0.008], [0.018, 0.03], [0, 0.032]] });
  const meters = []; for (let i = 0; i < 5; i++) meters.push({ n: 'meter' + i, t: 'cyl', m: 'bezel', s: [0.07, 0.07, 0.02], r: [90, 0, 0], p: [R(-0.8 + i * 0.4), 0.14, 0.01],
    children: [{ n: 'face', t: 'cyl', m: 'dial', s: [0.06, 0.06, 0.004], p: [0, 0.011, 0] }, { n: 'needle', t: 'box', m: 'redknob', s: [0.004, 0.003, 0.05], r: [0, R(-40 + i * 22), 0], p: [0, 0.014, -0.012] }, { n: 'glass', t: 'cyl', m: 'glass', s: [0.062, 0.062, 0.004], p: [0, 0.018, 0] }] });
  const parts = [
    { n: 'desk', t: 'box', m: 'cabinet', s: [W, 0.74, 0.8], bevel: 0.015, p: [0, 0.37, -0.1] },
    { n: 'kick', t: 'box', m: 'dark', s: [W - 0.04, 0.08, 0.02], p: [0, 0.04, 0.31] },
    { n: 'drawer', t: 'box', m: 'cabinet2', s: [0.5, 0.18, 0.012], bevel: 0.004, p: [-0.65, 0.58, 0.304], repeat: { n: 3, step: [0, -0.2, 0] },
      children: [{ n: 'handle', t: 'tube', m: 'chrome', radius: 0.006, path: [[-0.07, 0, 0.007], [-0.06, 0, 0.025], [0.06, 0, 0.025], [0.07, 0, 0.007]] }] },
    { n: 'doorpanel', t: 'box', m: 'cabinet2', s: [0.6, 0.6, 0.012], bevel: 0.004, p: [0.6, 0.38, 0.304], children: [{ n: 'louver', t: 'box', m: 'dark', s: [0.4, 0.01, 0.004], p: [0, 0.15, 0.008], repeat: { n: 8, step: [0, -0.04, 0] } }] },
    { n: 'top', t: 'box', m: 'formica', s: [W + 0.06, 0.035, 0.86], bevel: 0.01, p: [0, 0.757, -0.08] },
    { n: 'slant', t: 'extrude', m: 'cabinet', r: [0, 90, 0], p: [0, 0, 0], depth: W, bevel: 0.01, pts: [[-0.43, 0.775], [0.42, 0.775], [0.42, 1.3], [0.0, 1.3], [-0.43, 0.84]] },
    { n: 'panel', t: 'group', p: [0, 1.077, 0.223], r: [-43, 0, 0], children: [
      { n: 'plate', t: 'box', m: 'panelgrey', s: [W - 0.08, 0.5, 0.008], p: [0, 0.05, 0.003] }, ...knobs, ...meters,
      { n: 'toggle_row', t: 'group', p: [-0.9, -0.1, 0.01], repeat: { n: 12, step: [0.16, 0, 0] }, children: [
        { n: 'tbase', t: 'cyl', m: 'chrome', s: [0.012, 0.012, 0.01], r: [90, 0, 0] }, { n: 'tbat', t: 'capsule', m: 'chrome', s: [0.004, 0.03], r: [70, 0, 0], p: [0, 0.008, 0.02] }] },
      { n: 'btn_row', t: 'group', p: [-0.92, -0.17, 0.01], repeat: { n: 8, step: [0.24, 0, 0] }, children: [
        { n: 'btn_g', t: 'cyl', m: 'greenglow', s: [0.014, 0.014, 0.014], r: [90, 0, 0] }, { n: 'btn_a', t: 'cyl', m: 'amberglow', s: [0.014, 0.014, 0.014], r: [90, 0, 0], p: [0.06, 0, 0] }, { n: 'btn_w', t: 'cyl', m: 'whiteglow', s: [0.014, 0.014, 0.014], r: [90, 0, 0], p: [0.12, 0, 0] }] },
      { n: 'estop_ring', t: 'cyl', m: 'yellow', s: [0.05, 0.05, 0.01], r: [90, 0, 0], p: [0.85, -0.03, 0.01] },
      { n: 'estop', t: 'lathe', m: 'redknob', r: [90, 0, 0], p: [0.85, -0.03, 0.015], pts: [[0, 0], [0.03, 0], [0.034, 0.02], [0.03, 0.035], [0, 0.04]] },
      { n: 'label', t: 'box', m: 'plate', s: [0.1, 0.018, 0.003], p: [-0.85, 0.24, 0.006], repeat: { n: 10, step: [0.19, 0, 0] } } ] },
    { n: 'hood', t: 'box', m: 'cabinet', s: [W, 0.52, 0.3], bevel: 0.01, p: [0, 1.56, -0.27] },
    { n: 'crt_case', t: 'box', m: 'crtcase', s: [0.46, 0.38, 0.36], bevel: 0.03, p: [-0.45, 1.49, -0.08], children: [
      { n: 'screen', t: 'box', m: 'screen', s: [0.34, 0.26, 0.01], bevel: 0.02, p: [0, 0.01, 0.18] },
      { n: 'scan', t: 'box', m: 'greenglow', s: [0.3, 0.004, 0.002], p: [0, 0.02, 0.187], repeat: { n: 5, step: [0, -0.035, 0] } },
      { n: 'crt_knob', t: 'cyl', m: 'bakelite', s: [0.014, 0.014, 0.02], r: [90, 0, 0], p: [0.16, -0.15, 0.18], repeat: { n: 3, step: [-0.04, 0, 0] } }] },
    { n: 'scope', t: 'box', m: 'crtcase', s: [0.36, 0.3, 0.32], bevel: 0.02, p: [0.4, 1.45, -0.08], children: [
      { n: 'scope_scr', t: 'cyl', m: 'screen', s: [0.1, 0.1, 0.01], r: [90, 0, 0], p: [-0.05, 0.02, 0.165] },
      { n: 'wave', t: 'tube', m: 'greenglow', radius: 0.003, path: [[-0.13, 0.02, 0.172], [-0.09, 0.07, 0.172], [-0.05, -0.02, 0.172], [-0.01, 0.06, 0.172], [0.03, 0.01, 0.172]] },
      { n: 'scope_knob', t: 'cyl', m: 'bakelite', s: [0.016, 0.016, 0.02], r: [90, 0, 0], p: [0.11, 0.08, 0.165], repeat: { n: 4, step: [0, -0.05, 0] } }] },
    { n: 'warnlamp', t: 'lathe', m: 'redglow', p: [0.9, 1.82, -0.28], pts: [[0, 0], [0.05, 0], [0.05, 0.05], [0.035, 0.1], [0, 0.11]] },
    { n: 'warnlamp2', t: 'lathe', m: 'amberglow', p: [0.75, 1.82, -0.28], pts: [[0, 0], [0.05, 0], [0.05, 0.05], [0.035, 0.1], [0, 0.11]] },
    { n: 'phone', t: 'box', m: 'bakelite', s: [0.2, 0.08, 0.16], bevel: 0.03, p: [0.82, 0.81, -0.32], children: [
      { n: 'handset', t: 'tube', m: 'bakelite', radii: [0.025, 0.016, 0.016, 0.025], path: [[-0.09, 0.07, 0], [-0.04, 0.09, 0], [0.04, 0.09, 0], [0.09, 0.07, 0]] },
      { n: 'dial', t: 'cyl', m: 'chrome', s: [0.045, 0.045, 0.008], r: [-30, 0, 0], p: [0, 0.03, 0.07] }] },
    { n: 'logbook', t: 'box', m: 'paper', s: [0.28, 0.025, 0.2], bevel: 0.004, r: [0, 12, 0], p: [-0.85, 0.79, -0.3] },
    { n: 'pencil', t: 'cyl', m: 'yellow', s: [0.004, 0.004, 0.16], r: [0, 40, 90], p: [-0.7, 0.782, -0.33] },
    { n: 'mug', t: 'lathe', m: 'enamel', p: [-0.55, 0.775, -0.36], pts: [[0, 0], [0.04, 0], [0.042, 0.09], [0.038, 0.09], [0.036, 0.008], [0, 0.008]], children: [{ n: 'mughandle', t: 'torus', m: 'enamel', s: [0.025, 0.006], arc: 200, r: [0, 0, -100], p: [0.042, 0.045, 0] }] },
    { n: 'cablebundle', t: 'tube', m: 'cable', radius: 0.03, path: [[0.9, 0.0, -0.45], [0.95, 0.4, -0.55], [0.85, 1.1, -0.5], [0.7, 1.82, -0.45]] },
  ];
  out.control_console = { name: 'Soviet Accelerator Control Desk', materials: {
    cabinet: { preset: 'paint', color: '#7c8f86', rough: 0.5, tex: 'scratched' }, cabinet2: { preset: 'paint', color: '#6c7e75', rough: 0.55 }, panelgrey: { preset: 'paint', color: '#5c6560', rough: 0.45, tex: 'noise' },
    formica: { preset: 'plastic', color: '#c9c1a6', rough: 0.35 }, dark: { preset: 'iron', color: '#26282b' }, chrome: { preset: 'chrome' }, bakelite: { preset: 'plastic', color: '#1a1513', rough: 0.25 },
    redknob: { preset: 'plastic', color: '#b0221a', rough: 0.3 }, bezel: { preset: 'metal', color: '#2f3133', rough: 0.4 }, dial: { preset: 'ceramic', color: '#efe8d4', rough: 0.5 },
    glass: { preset: 'glass', opacity: 0.25 }, greenglow: { preset: 'emissive', color: '#52ff7a', glow: 3 }, amberglow: { preset: 'emissive', color: '#ffb12a', glow: 3 }, whiteglow: { preset: 'emissive', color: '#fff4dc', glow: 2 },
    redglow: { preset: 'emissive', color: '#ff2a18', glow: 5 }, yellow: { preset: 'paint', color: '#e2b324' }, plate: { preset: 'metal', color: '#d9d3c0', rough: 0.4 },
    crtcase: { preset: 'paint', color: '#b9b29a', rough: 0.45 }, screen: { preset: 'glass', color: '#0a2618', rough: 0.1, glow: 0.6, emissive: '#0c3a20', opacity: 1 },
    paper: { preset: 'fabric', color: '#d8cfb5', rough: 0.95 }, enamel: { preset: 'ceramic', color: '#e7e3d6', rough: 0.3 }, cable: { preset: 'rubber', color: '#202124' } }, parts };
}

// ---------- 4 · 1970s Moscow clinic bed with IV stand ----------
{
  const L = 2.0, Wd = 0.9, top = 0.62;
  const parts = [
    { n: 'frame_side', t: 'box', m: 'frame', s: [0.04, 0.05, L], bevel: 0.008, p: [Wd / 2, 0.45, 0], mirror: 'x' },
    { n: 'frame_end', t: 'box', m: 'frame', s: [Wd, 0.05, 0.04], bevel: 0.008, p: [0, 0.45, L / 2 - 0.02], repeat: { n: 2, step: [0, 0, -(L - 0.04)] } },
    { n: 'spring', t: 'box', m: 'mesh', s: [Wd - 0.06, 0.01, L - 0.06], p: [0, 0.46, 0] },
    { n: 'leg', t: 'cyl', m: 'frame', s: [0.02, 0.02, 0.4], p: [Wd / 2, 0.25, L / 2 - 0.03], mirror: 'x', repeat: { n: 2, step: [0, 0, -(L - 0.06)] } },
    { n: 'caster', t: 'group', p: [Wd / 2, 0.04, L / 2 - 0.03], mirror: 'x', repeat: { n: 2, step: [0, 0, -(L - 0.06)] }, children: [
      { n: 'fork', t: 'box', m: 'dark', s: [0.03, 0.05, 0.05], p: [0, 0.02, 0] }, { n: 'wheel', t: 'cyl', m: 'rubber', s: [0.038, 0.038, 0.025], r: [0, 0, 90], p: [0, -0.002, 0.01] }] },
    { n: 'head', t: 'group', p: [0, 0, -L / 2], children: [
      { n: 'post', t: 'cyl', m: 'frame', s: [0.022, 0.022, 1.05], p: [Wd / 2, 0.525, 0], mirror: 'x' },
      { n: 'cap', t: 'sphere', m: 'chrome', s: [0.03], p: [Wd / 2, 1.06, 0], mirror: 'x' },
      { n: 'rail', t: 'cyl', m: 'frame', s: [0.016, 0.016, Wd], r: [0, 0, 90], p: [0, 1.0, 0], repeat: { n: 2, step: [0, -0.4, 0] } },
      { n: 'board', t: 'box', m: 'panel', s: [Wd - 0.06, 0.34, 0.02], bevel: 0.01, p: [0, 0.8, 0] },
      { n: 'spindle', t: 'cyl', m: 'frame', s: [0.009, 0.009, 0.4], p: [-0.3, 0.8, 0.02], repeat: { n: 0 } }] },
    { n: 'foot', t: 'group', p: [0, 0, L / 2], children: [
      { n: 'fpost', t: 'cyl', m: 'frame', s: [0.022, 0.022, 0.85], p: [Wd / 2, 0.425, 0], mirror: 'x' },
      { n: 'fcap', t: 'sphere', m: 'chrome', s: [0.03], p: [Wd / 2, 0.86, 0], mirror: 'x' },
      { n: 'frail', t: 'cyl', m: 'frame', s: [0.016, 0.016, Wd], r: [0, 0, 90], p: [0, 0.8, 0] },
      { n: 'fspindle', t: 'cyl', m: 'frame', s: [0.009, 0.009, 0.3], p: [-0.36, 0.65, 0], repeat: { n: 9, step: [0.09, 0, 0] } },
      { n: 'chart', t: 'box', m: 'paper', s: [0.24, 0.3, 0.01], p: [0, 0.62, 0.035], r: [-6, 0, 0], children: [{ n: 'clip', t: 'box', m: 'chrome', s: [0.08, 0.03, 0.012], p: [0, 0.14, 0.004] }, { n: 'line', t: 'box', m: 'ink', s: [0.17, 0.006, 0.002], p: [0, 0.08, 0.006], repeat: { n: 7, step: [0, -0.03, 0] } }] }] },
    { n: 'mattress', t: 'box', m: 'ticking', s: [Wd - 0.04, 0.16, L - 0.06], bevel: 0.05, p: [0, 0.545, 0] },
    { n: 'sheet', t: 'box', m: 'sheet', s: [Wd - 0.01, 0.03, L - 0.03], bevel: 0.03, p: [0, top + 0.005, 0], noise: { amp: 0.01, freq: 4, seed: 3 } },
    { n: 'blanket', t: 'box', m: 'blanket', s: [Wd + 0.02, 0.05, 1.15], bevel: 0.025, p: [0, top + 0.03, 0.4], noise: { amp: 0.02, freq: 3, seed: 9 },
      children: [{ n: 'fold', t: 'box', m: 'sheet', s: [Wd + 0.025, 0.035, 0.18], bevel: 0.015, p: [0, 0.03, -0.52], noise: { amp: 0.02, freq: 4, seed: 4 } }, { n: 'stripe', t: 'box', m: 'blue', s: [Wd + 0.03, 0.052, 0.04], p: [0, 0, 0.3], repeat: { n: 2, step: [0, 0, 0.08] } }] },
    { n: 'tuft', t: 'cyl', m: 'ticking2', s: [0.012, 0.012, 0.01], p: [-0.3, 0.627, -0.85], repeat: { n: 7, step: [0, 0, 0.12] }, children: [{ n: 'tuft2', t: 'cyl', m: 'ticking2', s: [0.012, 0.012, 0.01], p: [0.3, 0, 0] }, { n: 'tuft3', t: 'cyl', m: 'ticking2', s: [0.012, 0.012, 0.01], p: [0.6, 0, 0] }] },
    { n: 'weld', t: 'sphere', m: 'frame', s: [0.03], p: [0.45, 0.45, 0.98], mirror: 'x', repeat: { n: 2, step: [0, 0, -1.96] } },
    { n: 'pillow', t: 'sphere', m: 'sheet', s: [0.3], sc: [1.15, 0.28, 0.6], p: [0, top + 0.07, -0.78], noise: { amp: 0.03, freq: 2, seed: 6 } },
    { n: 'iv', t: 'group', p: [0.65, 0, -0.6], children: [
      { n: 'base', t: 'cyl', m: 'chrome', s: [0.02, 0.02, 0.32], r: [0, 0, 90], p: [0, 0.04, 0], repeat: { n: 3, axis: 'y' } },
      { n: 'iwheel', t: 'sphere', m: 'rubber', s: [0.025], p: [0.16, 0.025, 0], repeat: { n: 6, axis: 'y' } },
      { n: 'pole', t: 'cyl', m: 'chrome', s: [0.012, 0.012, 1.9], p: [0, 1.0, 0] },
      { n: 'hook', t: 'tube', m: 'chrome', radius: 0.006, repeat: { n: 2, axis: 'y', angle: 180 }, path: [[0, 1.92, 0], [0.12, 1.94, 0], [0.15, 1.88, 0], [0.13, 1.85, 0]] },
      { n: 'bag', t: 'lathe', m: 'ivbag', p: [0.14, 1.58, 0], sc: [1, 1, 0.45], pts: [[0, 0], [0.025, 0.01], [0.06, 0.06], [0.065, 0.2], [0.05, 0.26], [0, 0.27]] },
      { n: 'drip', t: 'cyl', m: 'glass', s: [0.012, 0.012, 0.06], p: [0.14, 1.53, 0] },
      { n: 'line', t: 'tube', m: 'ivline', radius: 0.003, path: [[0.14, 1.5, 0], [0.18, 1.1, 0.1], [0.05, 0.8, 0.3], [-0.3, 0.72, 0.35]] }] },
    { n: 'nightstand', t: 'box', m: 'panel', s: [0.42, 0.62, 0.38], bevel: 0.01, p: [-0.75, 0.31, -0.7], children: [
      { n: 'ns_drawer', t: 'box', m: 'panel2', s: [0.36, 0.14, 0.01], bevel: 0.004, p: [0, 0.18, 0.19] }, { n: 'ns_knob', t: 'sphere', m: 'chrome', s: [0.012], p: [0, 0.18, 0.2] },
      { n: 'glass_cup', t: 'lathe', m: 'glass', p: [0.1, 0.31, 0], pts: [[0, 0], [0.03, 0], [0.034, 0.1], [0.031, 0.1], [0.027, 0.005], [0, 0.005]] },
      { n: 'pills', t: 'lathe', m: 'amber', p: [-0.08, 0.31, 0.04], pts: [[0, 0], [0.025, 0], [0.025, 0.07], [0.015, 0.08], [0, 0.08]] }] },
  ];
  out.hospital_bed = { name: '1970s Clinic Bed', materials: {
    frame: { preset: 'paint', color: '#d9ddd8', rough: 0.4, tex: 'scratched' }, chrome: { preset: 'chrome' }, dark: { preset: 'iron' }, rubber: { preset: 'rubber' },
    mesh: { preset: 'metal', color: '#7d8287', rough: 0.6 }, panel: { preset: 'paint', color: '#c7d3cf', rough: 0.45 }, panel2: { preset: 'paint', color: '#b6c3be', rough: 0.45 },
    ticking: { preset: 'fabric', color: '#cdc5b0', tex: 'fabric' }, ticking2: { preset: 'fabric', color: '#8a8270' }, sheet: { preset: 'fabric', color: '#ecebe4', rough: 0.9, tex: 'fabric', texScale: 2 },
    blanket: { preset: 'fabric', color: '#8d9a8a', rough: 0.95, tex: 'fabric' }, blue: { preset: 'fabric', color: '#45607d', rough: 0.95 }, paper: { preset: 'fabric', color: '#efe9d8', rough: 0.95 },
    ink: { preset: 'plastic', color: '#3a4a7a' }, ivbag: { preset: 'glass', color: '#e8f2f4', opacity: 0.55 }, glass: { preset: 'glass', opacity: 0.3 }, ivline: { preset: 'plastic', color: '#e8eeee', opacity: 0.6 },
    amber: { preset: 'glass', color: '#9a5a1a', opacity: 0.7 } }, parts };
}

// renderer-safe: ultra-thin repeated parts (seams, bolts, slats) speckle the hero in front of them — dropped
const DROP = { accel_magnet: ['lam_low', 'lam_up', 'hazard_s', 'topbolt', 'sidebolt', 'jack'], accel_tunnel: ['grate', 'anchor', 'panelseam', 'sleeper'] };
for (const [id, names] of Object.entries(DROP)) out[id].parts = out[id].parts.filter((p) => !names.includes(p.n));
if (require.main === module) { const fs = require('fs'); for (const [id, s] of Object.entries(out)) fs.writeFileSync(__dirname + '/' + id + '.json', JSON.stringify(s)); console.log(Object.keys(out).join(' ')); }
module.exports = out;
