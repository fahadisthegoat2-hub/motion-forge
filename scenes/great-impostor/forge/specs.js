// Forge 3D (Ultra) specs for "The Fake Surgeon" — written to modelforge/model-spec.md
const r3 = (v) => +v.toFixed(3);
const specs = {};

// ---------- 1 · WWII/Korea-era destroyer (front = +Z) ----------
{
  const L = 112, B = 11.4;
  // deck plan outline (x across, y = along length), bow pointed at +y
  const plan = [[0, 56], [1.6, 50], [3.6, 42], [5.0, 32], [5.6, 20], [5.7, 0], [5.6, -30], [5.2, -46], [4.4, -54], [2.8, -56], [-2.8, -56], [-4.4, -54], [-5.2, -46], [-5.6, -30], [-5.7, 0], [-5.6, 20], [-5.0, 32], [-3.6, 42], [-1.6, 50]];
  const scaleP = (k, dy = 0) => plan.map(([x, y]) => [r3(x * k), r3(y * (0.98 + 0.02 * k) + dy)]);
  const parts = [
    { n: 'hull_upper', t: 'extrude', m: 'hull', pts: scaleP(1), depth: 3.2, smooth: true, bevel: 0.15, p: [0, 4.4, 0], r: [-90, 0, 0] },
    { n: 'hull_mid', t: 'extrude', m: 'hull', pts: scaleP(0.94), depth: 2.4, smooth: true, bevel: 0.1, p: [0, 2.2, 0], r: [-90, 0, 0] },
    { n: 'hull_low', t: 'extrude', m: 'antifoul', pts: scaleP(0.8, -1), depth: 1.6, smooth: true, bevel: 0.1, p: [0, 0.6, 0], r: [-90, 0, 0] },
    { n: 'boot_top', t: 'extrude', m: 'boot', pts: scaleP(0.965), depth: 0.35, smooth: true, p: [0, 1.25, 0], r: [-90, 0, 0] },
    { n: 'deck', t: 'extrude', m: 'deck', pts: scaleP(0.985), depth: 0.12, smooth: true, p: [0, 6.05, 0], r: [-90, 0, 0] },
    { n: 'gunwale', t: 'extrude', m: 'paint', pts: scaleP(1.005), holes: [scaleP(0.975)], depth: 0.5, smooth: true, p: [0, 6.2, 0], r: [-90, 0, 0] },
    { n: 'portholes', t: 'cyl', m: 'glass', s: [0.22, 0.22, 0.1], p: [5.62, 4.6, 26], r: [0, 0, 90], mirror: 'x', repeat: { n: 14, step: [0, 0, -4.2] } },
    { n: 'port_rims', t: 'torus', m: 'brass', s: [0.24, 0.04], p: [5.66, 4.6, 26], r: [0, 90, 0], mirror: 'x', repeat: { n: 14, step: [0, 0, -4.2] } },
    { n: 'hull_seams', t: 'box', m: 'seam', s: [11.6, 0.03, 0.04], p: [0, 3.6, 30], repeat: { n: 9, step: [0, 0, -9] } },
    { n: 'anchor_l', t: 'group', p: [3.3, 5.0, 46], r: [0, -20, 0], mirror: 'x', children: [
      { n: 'shank', t: 'cyl', m: 'iron', s: [0.08, 0.08, 1.4] },
      { n: 'fluke', t: 'tube', m: 'iron', path: [[-0.5, -0.4, 0], [-0.25, -0.75, 0], [0, -0.8, 0], [0.25, -0.75, 0], [0.5, -0.4, 0]], radii: [0.02, 0.1, 0.12, 0.1, 0.02] },
      { n: 'hawse', t: 'torus', m: 'iron', s: [0.32, 0.07], r: [0, 90, 0], p: [0, 0.7, 0] }] },
    // forecastle break + superstructure
    { n: 'fwd_house', t: 'box', m: 'paint', s: [7.4, 2.6, 16], bevel: 0.2, p: [0, 7.4, 16] },
    { n: 'fwd_house_windows', t: 'box', m: 'glass', s: [0.05, 0.5, 0.9], p: [3.72, 7.9, 22], mirror: 'x', repeat: { n: 7, step: [0, 0, -2] } },
    { n: 'bridge_deck', t: 'box', m: 'paint2', s: [8.4, 0.25, 9], bevel: 0.08, p: [0, 8.8, 18] },
    { n: 'bridge', t: 'extrude', m: 'paint', pts: [[-3.2, 0], [3.2, 0], [3.0, 2.0], [2.2, 2.6], [-2.2, 2.6], [-3.0, 2.0]], depth: 6, bevel: 0.1, p: [0, 8.9, 18.5] },
    { n: 'bridge_windows', t: 'box', m: 'glass', s: [5.6, 0.7, 0.06], p: [0, 10.3, 21.53] },
    { n: 'window_mullions', t: 'box', m: 'paint2', s: [0.08, 0.72, 0.08], p: [-2.6, 10.3, 21.56], repeat: { n: 9, step: [0.65, 0, 0] } },
    { n: 'bridge_wings', t: 'box', m: 'paint2', s: [1.6, 0.18, 2.2], p: [4.6, 10.0, 19.6], mirror: 'x' },
    { n: 'wing_rails', t: 'cyl', m: 'paint2', s: [0.03, 0.03, 1.0], p: [5.3, 10.5, 18.6], mirror: 'x', repeat: { n: 5, step: [0, 0, 0.5] } },
    { n: 'mast', t: 'cyl', m: 'paint2', s: [0.2, 0.32, 13], p: [0, 15.5, 14] },
    { n: 'mast_legs', t: 'cyl', m: 'paint2', s: [0.14, 0.2, 10.5], p: [1.6, 14, 13], r: [0, 0, 9], mirror: 'x' },
    { n: 'yardarm', t: 'cyl', m: 'paint2', s: [0.08, 0.08, 6.5], p: [0, 18.5, 14], r: [0, 0, 90] },
    { n: 'radar_dish', t: 'lathe', m: 'metal', pts: [[0, 0], [0.9, 0.12], [1.5, 0.4], [1.55, 0.45], [0, 0.18]], p: [0, 21, 14], r: [80, 0, 0], sc: [1.4, 1, 0.8] },
    { n: 'radar_arm', t: 'box', m: 'metal', s: [0.2, 0.9, 0.2], p: [0, 20.5, 14] },
    { n: 'crows_nest', t: 'cyl', m: 'paint', s: [0.8, 0.7, 0.9], p: [0, 17, 14], bevel: 0.05 },
    { n: 'aft_house', t: 'box', m: 'paint', s: [6.6, 2.4, 30], bevel: 0.2, p: [0, 7.3, -14] },
    { n: 'aft_doors', t: 'box', m: 'paint2', s: [0.06, 1.7, 0.9], p: [3.32, 7.0, -4], mirror: 'x', repeat: { n: 3, step: [0, 0, -11] } },
    { n: 'funnel_fwd', t: 'lathe', m: 'paint', pts: [[0, 0], [1.6, 0], [1.75, 0.6], [1.7, 4.6], [1.45, 5.4], [0, 5.4]], sc: [1, 1, 1.45], p: [0, 8.4, 2], r: [-8, 0, 0] },
    { n: 'funnel_cap_fwd', t: 'cyl', m: 'soot', s: [1.47, 1.47, 0.5], sc: [1, 1, 1.45], p: [0, 13.95, 1.2], r: [-8, 0, 0] },
    { n: 'funnel_band_fwd', t: 'cyl', m: 'boot', s: [1.74, 1.74, 0.3], sc: [1, 1, 1.45], p: [0, 12.2, 1.45], r: [-8, 0, 0] },
    { n: 'funnel_aft', t: 'lathe', m: 'paint', pts: [[0, 0], [1.5, 0], [1.65, 0.6], [1.6, 4.2], [1.35, 5.0], [0, 5.0]], sc: [1, 1, 1.4], p: [0, 8.4, -10], r: [-8, 0, 0] },
    { n: 'funnel_cap_aft', t: 'cyl', m: 'soot', s: [1.37, 1.37, 0.5], sc: [1, 1, 1.4], p: [0, 13.55, -10.75], r: [-8, 0, 0] },
    { n: 'vents', t: 'tube', m: 'paint2', path: [[0, 0, 0], [0, 1.0, 0], [0, 1.4, 0.3]], radius: 0.25, p: [2.6, 8.5, 6], mirror: 'x', repeat: { n: 3, step: [0, 0, -5] } },
    { n: 'torpedo_tubes', t: 'group', p: [0, 8.6, -4], r: [0, 25, 0], children: [
      { n: 'mount', t: 'cyl', m: 'metal', s: [1.4, 1.5, 0.4] },
      { n: 'tubes', t: 'cyl', m: 'paint2', s: [0.27, 0.27, 7], r: [90, 0, 0], p: [-1.2, 0.5, 0], repeat: { n: 5, step: [0.6, 0, 0] } }] },
    { n: 'lifeboat', t: 'lathe', m: 'boat', pts: [[0, 0], [0.5, 0.1], [0.85, 0.4], [0.95, 0.9], [0.9, 1.0], [0, 1.0]], sc: [1, 0.6, 3.6], p: [4.0, 9.0, -12], r: [0, 0, 0], mirror: 'x' },
    { n: 'davits', t: 'tube', m: 'paint2', path: [[0, 0, 0], [0, 1.8, 0], [-0.6, 2.4, 0], [-1.0, 2.2, 0]], radius: 0.09, p: [4.9, 8.5, -10.6], mirror: 'x', repeat: { n: 2, step: [0, 0, -3] } },
    // guns: twin 4.5" style turrets fore and aft
    ...[[1, 34, 0], [1, 25, 1], [-1, -36, 0], [-1, -27, 1]].map(([dir, z, high], i) => ({ n: 'turret' + i, t: 'group', p: [0, 6.3 + high * 1.8, z], r: [0, dir > 0 ? 0 : 180, 0], children: [
      { n: 'barbette', t: 'cyl', m: 'paint2', s: [2.0, 2.2, 0.6 + high * 1.8], p: [0, -high * 0.9, 0], bevel: 0.05 },
      { n: 'shield', t: 'extrude', m: 'paint', pts: [[-2.1, 0], [2.1, 0], [2.0, 1.6], [1.4, 2.3], [-1.4, 2.3], [-2.0, 1.6]], depth: 4.2, bevel: 0.12, p: [0, 0.3, -0.4], r: [0, 0, 0] },
      { n: 'shield_roof_rivets', t: 'sphere', m: 'paint2', s: [0.05], p: [-1.2, 2.62, 1.2], repeat: { n: 7, step: [0.4, 0, 0] } },
      { n: 'barrels', t: 'lathe', m: 'gunmetal', pts: [[0, 0], [0.24, 0], [0.22, 1.0], [0.15, 5.5], [0.17, 5.8], [0.12, 5.9], [0, 5.9]], r: [88, 0, 0], p: [-0.6, 1.2, 1.6], mirror: 'x' },
      { n: 'sight', t: 'box', m: 'paint2', s: [0.4, 0.4, 0.8], p: [1.6, 2.5, 0.2], bevel: 0.05 }] })),
    { n: 'aa_guns', t: 'group', p: [3.4, 9.3, -22], mirror: 'x', children: [
      { n: 'tub', t: 'cyl', m: 'paint', s: [1.1, 1.1, 0.9] },
      { n: 'aa_barrels', t: 'cyl', m: 'gunmetal', s: [0.07, 0.07, 2.6], r: [-60, 0, 0], p: [-0.25, 0.9, 0.8], repeat: { n: 2, step: [0.5, 0, 0] } }] },
    { n: 'depth_charge_rack', t: 'group', p: [0, 6.6, -52], children: [
      { n: 'rails', t: 'box', m: 'metal', s: [0.12, 0.12, 4], p: [-1.6, 0, 0], mirror: 'x' },
      { n: 'charges', t: 'cyl', m: 'paint2', s: [0.33, 0.33, 0.6], r: [0, 0, 90], p: [-1.6, 0.35, -1.6], mirror: 'x', repeat: { n: 6, step: [0, 0, 0.62] } }] },
    { n: 'rail_posts', t: 'cyl', m: 'paint2', s: [0.025, 0.025, 1.0], p: [5.0, 6.95, 40], mirror: 'x', repeat: { n: 36, step: [0, 0, -2.5] } },
    { n: 'rail_wire', t: 'cyl', m: 'paint2', s: [0.015, 0.015, 90], r: [90, 0, 0], p: [5.2, 7.4, -5], mirror: 'x' },
    { n: 'jackstaff', t: 'cyl', m: 'wood', s: [0.05, 0.07, 3.5], p: [0, 8, 55] },
    { n: 'ensign_staff', t: 'cyl', m: 'wood', s: [0.05, 0.07, 3.5], p: [0, 8, -55] },
    { n: 'ensign', t: 'box', m: 'flag', s: [0.02, 1.0, 1.8], p: [0, 9.2, -55.9], noise: { amp: 0.15, freq: 3, seed: 2 } },
    { n: 'bollards', t: 'cyl', m: 'iron', s: [0.2, 0.22, 0.5], p: [4.3, 6.4, 38], mirror: 'x', repeat: { n: 4, step: [0, 0, -26] } },
    { n: 'capstan', t: 'lathe', m: 'iron', pts: [[0, 0], [0.6, 0], [0.45, 0.2], [0.42, 0.7], [0.55, 0.85], [0, 0.85]], p: [0, 6.1, 42] },
    { n: 'anchor_chain', t: 'tube', m: 'iron', path: [[0, 6.2, 42], [1.5, 6.2, 44.5], [3.2, 6.1, 46]], radius: 0.08, mirror: 'x' },
  ];
  specs.destroyer = { name: 'Destroyer', materials: {
    hull: { preset: 'paint', color: '#7d8590', rough: 0.55, tex: 'scratched', texScale: 6 }, paint: { preset: 'paint', color: '#8a929c', rough: 0.5, tex: 'scratched', texScale: 4 },
    paint2: { preset: 'paint', color: '#6b737d', rough: 0.55 }, antifoul: { preset: 'paint', color: '#6e2a24', rough: 0.7, tex: 'noise' }, boot: { preset: 'paint', color: '#1d1f22', rough: 0.6 },
    deck: { preset: 'wood', color: '#5c5952', rough: 0.85, tex: 'wood', texScale: 20 }, glass: { preset: 'glass', color: '#1e2a33', rough: 0.1 }, brass: { preset: 'gold', color: '#a8894e', rough: 0.4 },
    seam: { preset: 'paint', color: '#5f666e', rough: 0.6 }, iron: { preset: 'iron', color: '#2e3134', rough: 0.6 }, metal: { preset: 'metal', color: '#9aa1a8', rough: 0.4 },
    gunmetal: { preset: 'metal', color: '#3b3f44', rough: 0.35, tex: 'brushed' }, soot: { preset: 'paint', color: '#151515', rough: 0.9 }, boat: { preset: 'paint', color: '#d8d5cc', rough: 0.5 },
    wood: { preset: 'wood', color: '#6d5135' }, flag: { preset: 'fabric', color: '#b23a33', tex: 'fabric' } }, parts };
}

// ---------- 2 · 1950s operating table (front = +Z, long axis = X) ----------
specs.operating_table = { name: 'Operating table', materials: {
  steel: { preset: 'chrome', color: '#c9ccd0', rough: 0.25, tex: 'brushed' }, enamel: { preset: 'paint', color: '#d9ddd8', rough: 0.35, clearcoat: 0.6, tex: 'scratched' },
  pad: { preset: 'leather', color: '#3d5249', rough: 0.6, tex: 'leather' }, rubber: { preset: 'rubber', color: '#1a1a1a' }, sheet: { preset: 'fabric', color: '#e9e9e2', tex: 'fabric' },
  brass: { preset: 'gold', color: '#b39250', rough: 0.35 }, black: { preset: 'iron', color: '#222', rough: 0.5 } },
  parts: [
    { n: 'base', t: 'lathe', m: 'enamel', pts: [[0, 0], [0.34, 0], [0.36, 0.03], [0.3, 0.09], [0.16, 0.14], [0.12, 0.2], [0, 0.2]], sc: [1.6, 1, 1] },
    { n: 'feet', t: 'cyl', m: 'rubber', s: [0.05, 0.06, 0.03], p: [0.45, 0.015, 0.22], mirror: 'x', repeat: { n: 2, step: [0, 0, -0.44] } },
    { n: 'column', t: 'cyl', m: 'enamel', s: [0.1, 0.12, 0.5], p: [0, 0.45, 0], bevel: 0.01 },
    { n: 'column_sleeve', t: 'cyl', m: 'steel', s: [0.085, 0.085, 0.16], p: [0, 0.76, 0] },
    { n: 'column_bands', t: 'torus', m: 'steel', s: [0.115, 0.012], r: [90, 0, 0], p: [0, 0.32, 0], repeat: { n: 3, step: [0, 0.12, 0] } },
    { n: 'pump_pedal', t: 'tube', m: 'steel', path: [[0, 0.24, 0.1], [0, 0.18, 0.3], [0, 0.12, 0.42]], radius: 0.018 },
    { n: 'pedal_pad', t: 'box', m: 'rubber', s: [0.12, 0.025, 0.08], p: [0, 0.115, 0.44], bevel: 0.008 },
    { n: 'crank', t: 'tube', m: 'steel', path: [[0.12, 0.6, 0], [0.22, 0.6, 0], [0.24, 0.6, 0.06], [0.24, 0.66, 0.1]], radius: 0.01 },
    { n: 'crank_knob', t: 'cyl', m: 'black', s: [0.018, 0.018, 0.06], p: [0.24, 0.7, 0.1] },
    { n: 'frame', t: 'box', m: 'steel', s: [1.9, 0.06, 0.52], bevel: 0.015, p: [0, 0.85, 0] },
    { n: 'frame_rails', t: 'cyl', m: 'steel', s: [0.014, 0.014, 1.9], r: [0, 0, 90], p: [0, 0.86, 0.285], mirror: 'x' },
    { n: 'rail_mounts', t: 'box', m: 'steel', s: [0.03, 0.04, 0.04], p: [-0.7, 0.86, 0.27], repeat: { n: 3, step: [0.7, 0, 0] } },
    { n: 'pad_seg', t: 'box', m: 'pad', s: [0.6, 0.075, 0.5], bevel: 0.03, p: [-0.62, 0.92, 0], repeat: { n: 3, step: [0.62, 0, 0] } },
    { n: 'sheet', t: 'box', m: 'sheet', s: [1.5, 0.012, 0.56], p: [0.15, 0.962, 0], noise: { amp: 0.05, freq: 5, seed: 4 } },
    { n: 'sheet_drape', t: 'box', m: 'sheet', s: [1.5, 0.22, 0.012], p: [0.15, 0.86, 0.283], noise: { amp: 0.06, freq: 4, seed: 7 }, mirror: 'x' },
    { n: 'headrest', t: 'box', m: 'pad', s: [0.26, 0.06, 0.3], bevel: 0.025, p: [-1.08, 0.93, 0] },
    { n: 'headrest_arm', t: 'box', m: 'steel', s: [0.14, 0.03, 0.06], p: [-0.98, 0.87, 0] },
    { n: 'strap', t: 'box', m: 'black', s: [0.05, 0.085, 0.53], p: [0.55, 0.93, 0], bevel: 0.01 },
    { n: 'strap_buckle', t: 'box', m: 'brass', s: [0.05, 0.02, 0.03], p: [0.55, 0.9, 0.27] },
    { n: 'end_handles', t: 'tube', m: 'steel', path: [[0.95, 0.85, -0.2], [1.02, 0.85, -0.18], [1.03, 0.85, 0], [1.02, 0.85, 0.18], [0.95, 0.85, 0.2]], radius: 0.012, mirror: 'x' },
  ] };

// ---------- 3 · open surgery textbook (front = +Z, spine along Z) ----------
{
  const pageCurve = (sgn) => [[0, 0], [sgn * 0.02, 0.022], [sgn * 0.06, 0.03], [sgn * 0.12, 0.031], [sgn * 0.17, 0.027], [sgn * 0.19, 0.02], [sgn * 0.19, 0.0]];
  specs.textbook = { name: 'Surgery textbook (open)', materials: {
    cover: { preset: 'leather', color: '#5a1e1c', rough: 0.55, tex: 'leather', texScale: 3 }, pages: { preset: 'fabric', color: '#e8e0cc', rough: 0.9, tex: 'noise', texScale: 30 },
    edge: { preset: 'paint', color: '#cdbf9e', rough: 0.9, tex: 'noise', texScale: 60 }, gilt: { preset: 'gold', color: '#c9a54e', rough: 0.35 }, ink: { preset: 'paint', color: '#3a3833', rough: 0.95 },
    plate: { preset: 'paint', color: '#8c4a42', rough: 0.9 }, ribbon: { preset: 'fabric', color: '#7a1b22' } },
    parts: [
      { n: 'cover_l', t: 'box', m: 'cover', s: [0.205, 0.006, 0.275], bevel: 0.002, p: [-0.104, 0.003, 0], r: [0, 0, -4] },
      { n: 'cover_r', t: 'box', m: 'cover', s: [0.205, 0.006, 0.275], bevel: 0.002, p: [0.104, 0.003, 0], r: [0, 0, 4] },
      { n: 'spine', t: 'cyl', m: 'cover', s: [0.012, 0.012, 0.275], r: [90, 0, 0], p: [0, 0.004, 0], sc: [1, 1, 0.5] },
      { n: 'pages_l', t: 'extrude', m: 'pages', pts: pageCurve(-1), depth: 0.262, bevel: 0.001, smooth: true, p: [0, 0.008, 0] },
      { n: 'pages_r', t: 'extrude', m: 'pages', pts: pageCurve(1), depth: 0.262, bevel: 0.001, smooth: true, p: [0, 0.008, 0] },
      { n: 'page_edges', t: 'box', m: 'edge', s: [0.004, 0.018, 0.262], p: [0.19, 0.016, 0], mirror: 'x' },
      { n: 'text_lines_l', t: 'box', m: 'ink', s: [0.13, 0.0006, 0.003], p: [-0.105, 0.0392, 0.1], r: [0, 0, 0], repeat: { n: 22, step: [0, 0, -0.0085] } },
      { n: 'text_lines_r', t: 'box', m: 'ink', s: [0.13, 0.0006, 0.003], p: [0.105, 0.0392, 0.1], repeat: { n: 10, step: [0, 0, -0.0085] } },
      { n: 'diagram_plate', t: 'box', m: 'plate', s: [0.11, 0.0006, 0.09], p: [0.105, 0.0392, -0.06] },
      { n: 'diagram_heart', t: 'sphere', m: 'ribbon', s: [0.02], sc: [1, 0.05, 1.2], p: [0.105, 0.0396, -0.06] },
      { n: 'headband', t: 'cyl', m: 'gilt', s: [0.006, 0.006, 0.012], p: [0, 0.008, 0.134], r: [90, 0, 0], mirror: 'x' },
      { n: 'ribbon', t: 'tube', m: 'ribbon', path: [[0.002, 0.03, 0.12], [0.004, 0.02, 0.15], [0.01, 0.006, 0.175], [0.015, 0.002, 0.2]], radius: 0.003, sc: [1, 1, 1] },
      { n: 'corner_guards', t: 'box', m: 'gilt', s: [0.012, 0.007, 0.012], p: [0.2, 0.004, 0.131], mirror: 'x', repeat: { n: 2, step: [0, 0, -0.262] } },
    ] };
}

// ---------- 4 · Mayo instrument stand with tray ----------
specs.instrument_tray = { name: 'Instrument tray stand', materials: {
  steel: { preset: 'chrome', color: '#cfd3d6', rough: 0.2, tex: 'brushed' }, dark: { preset: 'iron', color: '#2b2d30', rough: 0.5 }, cloth: { preset: 'fabric', color: '#5d7f74', tex: 'fabric' },
  rubber: { preset: 'rubber', color: '#161616' }, blade: { preset: 'chrome', color: '#e8eaec', rough: 0.1 }, gauze: { preset: 'fabric', color: '#f1efe8', tex: 'fabric' }, glass: { preset: 'glass', color: '#9fb6c0', opacity: 0.5 } },
  parts: [
    { n: 'base', t: 'extrude', m: 'dark', pts: [[-0.3, -0.2], [0.3, -0.2], [0.3, -0.14], [-0.24, -0.14], [-0.24, 0.14], [0.3, 0.14], [0.3, 0.2], [-0.3, 0.2]], depth: 0.03, r: [-90, 0, 0], p: [0, 0.04, 0] },
    { n: 'casters', t: 'sphere', m: 'rubber', s: [0.03], p: [0.28, 0.03, 0.17], mirror: 'x', repeat: { n: 2, step: [0, 0, -0.34] } },
    { n: 'post', t: 'cyl', m: 'steel', s: [0.016, 0.016, 0.9], p: [-0.27, 0.5, 0] },
    { n: 'post_clamp', t: 'cyl', m: 'dark', s: [0.03, 0.03, 0.06], p: [-0.27, 0.72, 0] },
    { n: 'clamp_knob', t: 'tube', m: 'dark', path: [[-0.24, 0.72, 0], [-0.2, 0.72, 0.03]], radius: 0.008 },
    { n: 'arm', t: 'box', m: 'steel', s: [0.06, 0.02, 0.03], p: [-0.24, 0.94, 0] },
    { n: 'tray', t: 'extrude', m: 'steel', pts: [[-0.24, -0.16], [0.24, -0.16], [0.24, 0.16], [-0.24, 0.16]], holes: [[[-0.23, -0.15], [0.23, -0.15], [0.23, 0.15], [-0.23, 0.15]]], depth: 0.03, bevel: 0.003, r: [-90, 0, 0], p: [0, 0.965, 0] },
    { n: 'tray_floor', t: 'box', m: 'steel', s: [0.47, 0.004, 0.31], p: [0, 0.952, 0] },
    { n: 'towel', t: 'box', m: 'cloth', s: [0.42, 0.005, 0.27], p: [0, 0.957, 0], noise: { amp: 0.04, freq: 6, seed: 3 } },
    { n: 'scalpels', t: 'group', p: [-0.15, 0.962, 0.0], repeat: { n: 2, step: [0.03, 0, 0] }, children: [
      { n: 'handle', t: 'box', m: 'steel', s: [0.009, 0.004, 0.13], bevel: 0.001 },
      { n: 'scalpel_blade', t: 'extrude', m: 'blade', pts: [[0, 0], [0.007, 0.005], [0.006, 0.03], [0, 0.04], [-0.002, 0.03]], depth: 0.001, r: [-90, 0, 0], p: [0, 0.001, 0.065] }] },
    { n: 'forceps', t: 'group', p: [-0.04, 0.963, 0], r: [0, 10, 0], children: [
      { n: 'jaw', t: 'tube', m: 'steel', path: [[0, 0, -0.07], [0.01, 0, 0], [0.004, 0, 0.07]], radius: 0.003, mirror: 'x' },
      { n: 'rings', t: 'torus', m: 'steel', s: [0.012, 0.0025], r: [90, 0, 0], p: [0.016, 0, -0.08], mirror: 'x' }] },
    { n: 'clamps', t: 'group', p: [0.06, 0.963, 0], repeat: { n: 3, step: [0.035, 0, 0] }, children: [
      { n: 'shank', t: 'tube', m: 'steel', path: [[0, 0, -0.06], [0.004, 0, 0], [0, 0, 0.05]], radius: 0.0025, mirror: 'x' },
      { n: 'loops', t: 'torus', m: 'steel', s: [0.009, 0.002], r: [90, 0, 0], p: [0.009, 0, -0.068], mirror: 'x' }] },
    { n: 'gauze', t: 'box', m: 'gauze', s: [0.07, 0.015, 0.07], bevel: 0.006, p: [0.18, 0.967, 0.08], noise: { amp: 0.08, freq: 6, seed: 9 }, repeat: { n: 2, step: [0, 0.012, -0.01] } },
    { n: 'kidney_dish', t: 'lathe', m: 'steel', pts: [[0, 0], [0.04, 0], [0.05, 0.012], [0.052, 0.02], [0.046, 0.02], [0.044, 0.013], [0, 0.006]], sc: [1.6, 1, 0.9], p: [0.15, 0.957, -0.08] },
    { n: 'bullet', t: 'lathe', m: 'blade', pts: [[0, 0], [0.004, 0], [0.004, 0.008], [0.002, 0.013], [0, 0.014]], p: [0.15, 0.967, -0.08], r: [0, 0, 80], sc: [1, 1, 1] },
    { n: 'bottle', t: 'lathe', m: 'glass', pts: [[0, 0], [0.025, 0], [0.026, 0.06], [0.012, 0.08], [0.01, 0.095], [0, 0.095]], p: [0.2, 0.955, -0.12] },
    { n: 'bottle_cap', t: 'cyl', m: 'dark', s: [0.011, 0.011, 0.015], p: [0.2, 1.057, -0.12] },
  ] };

// ---------- 5 · hanging surgical lamp ----------
specs.surgical_lamp = { name: 'Surgical lamp', materials: {
  enamel: { preset: 'paint', color: '#e3e5e1', rough: 0.3, clearcoat: 0.5 }, steel: { preset: 'chrome', color: '#c4c8cc', rough: 0.25 }, glow: { preset: 'emissive', color: '#fff4dc', glow: 6 },
  inner: { preset: 'metal', color: '#f4f4f0', rough: 0.15, metal: 0.6 }, dark: { preset: 'iron', color: '#2a2a2a' } },
  parts: [
    { n: 'rod', t: 'cyl', m: 'steel', s: [0.02, 0.02, 1.2], p: [0, 0.95, 0] },
    { n: 'ceiling_plate', t: 'cyl', m: 'enamel', s: [0.14, 0.14, 0.03], p: [0, 1.55, 0] },
    { n: 'yoke', t: 'torus', m: 'steel', s: [0.42, 0.018], arc: 180, r: [0, 0, 180], p: [0, 0.38, 0] },
    { n: 'pivots', t: 'cyl', m: 'dark', s: [0.03, 0.03, 0.05], r: [0, 0, 90], p: [0.42, 0.38, 0], mirror: 'x' },
    { n: 'dome', t: 'lathe', m: 'enamel', pts: [[0, 0.42], [0.08, 0.41], [0.22, 0.36], [0.34, 0.26], [0.4, 0.16], [0.41, 0.14], [0.39, 0.14], [0, 0.32]], p: [0, 0, 0] },
    { n: 'reflector', t: 'lathe', m: 'inner', pts: [[0, 0.3], [0.2, 0.26], [0.33, 0.19], [0.385, 0.15]], p: [0, -0.005, 0] },
    { n: 'bulbs', t: 'sphere', m: 'glow', s: [0.05], p: [0.2, 0.2, 0], repeat: { n: 6, axis: 'y' } },
    { n: 'centre_bulb', t: 'sphere', m: 'glow', s: [0.07], p: [0, 0.22, 0] },
    { n: 'rim', t: 'torus', m: 'steel', s: [0.4, 0.012], r: [90, 0, 0], p: [0, 0.145, 0] },
    { n: 'handle', t: 'tube', m: 'steel', path: [[0, 0.28, 0], [0, 0.12, 0], [0, 0.06, 0]], radius: 0.015 },
    { n: 'handle_grip', t: 'cyl', m: 'dark', s: [0.025, 0.025, 0.06], p: [0, 0.05, 0] },
  ] };

// ---------- 6 · 1951 newspaper (held, front = +Z) ----------
specs.newspaper = { name: 'Newspaper', materials: {
  paper: { preset: 'fabric', color: '#e4dfd2', rough: 0.95, tex: 'noise', texScale: 40 }, ink: { preset: 'paint', color: '#2b2a28', rough: 0.95 }, photo: { preset: 'paint', color: '#6d6a64', rough: 0.9, tex: 'noise', texScale: 8 },
  grey: { preset: 'paint', color: '#8f8b82', rough: 0.95 } },
  parts: [
    { n: 'sheets', t: 'box', m: 'paper', s: [0.6, 0.42, 0.004], p: [0, 0.21, 0], noise: { amp: 0.02, freq: 3, seed: 5 } },
    { n: 'back_sheets', t: 'box', m: 'paper', s: [0.595, 0.415, 0.004], p: [0.003, 0.208, -0.006], r: [0, 4, 0] },
    { n: 'fold', t: 'box', m: 'grey', s: [0.003, 0.42, 0.006], p: [0, 0.21, 0.001] },
    { n: 'masthead', t: 'box', m: 'ink', s: [0.5, 0.045, 0.001], p: [0, 0.385, 0.0025] },
    { n: 'rule', t: 'box', m: 'ink', s: [0.56, 0.003, 0.001], p: [0, 0.355, 0.0025], repeat: { n: 2, step: [0, -0.01, 0] } },
    { n: 'headline', t: 'box', m: 'ink', s: [0.52, 0.035, 0.001], p: [0, 0.322, 0.0025] },
    { n: 'photo', t: 'box', m: 'photo', s: [0.2, 0.15, 0.001], p: [-0.16, 0.215, 0.0025] },
    { n: 'photo_frame', t: 'box', m: 'ink', s: [0.206, 0.156, 0.0008], p: [-0.16, 0.215, 0.002] },
    { n: 'columns', t: 'box', m: 'grey', s: [0.11, 0.003, 0.001], p: [0.04, 0.29, 0.0025], repeat: { n: 26, step: [0, -0.0095, 0] } },
    { n: 'columns2', t: 'box', m: 'grey', s: [0.11, 0.003, 0.001], p: [0.2, 0.29, 0.0025], repeat: { n: 26, step: [0, -0.0095, 0] } },
    { n: 'caption', t: 'box', m: 'grey', s: [0.2, 0.004, 0.001], p: [-0.16, 0.128, 0.0025], repeat: { n: 3, step: [0, -0.009, 0] } },
    { n: 'lower_cols', t: 'box', m: 'grey', s: [0.2, 0.003, 0.001], p: [-0.16, 0.09, 0.0025], repeat: { n: 7, step: [0, -0.0095, 0] } },
  ] };

module.exports = specs;
if (require.main === module) { const fs = require('fs'); for (const [k, v] of Object.entries(specs)) fs.writeFileSync(`${__dirname}/${k}.json`, JSON.stringify(v)); console.log(Object.keys(specs).join(' ')); }
