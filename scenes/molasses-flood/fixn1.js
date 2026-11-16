const fs = require('fs'); let s = fs.readFileSync('direction.js', 'utf8');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('missing ' + a.slice(0, 80)); s = s.replace(a, b); };
// died: rescuers wade to him and grab his arms; closer 3/4 high camera so he reads above the caption
rep(`  camera: { pos: [[0, [3.2, 6.2, 5.4]], [dD, [2.9, 5.6, 4.8], 'inOutSine']], look: [[0, [0, 0.6, 0]]], fov: 50, handheld: 0.2 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], clips: idle(dD), bones: stuck(dD), acting: 'none' },
    p1: { pos: [[0, [2.5, 0, 2.5]], [dD, [1.6, 0, 1.6], 'linear']], rotY: [[0, -2.35]], clips: [{ clip: 'walk', start: 0, end: 3, speed: 0.45 }] },
    p2: { pos: [[0, [-2.8, 0, -2]], [dD, [-2.0, 0, -1.4], 'linear']], rotY: [[0, 0.95]], clips: [{ clip: 'walk', start: 0, end: 3, speed: 0.45 }] } },`,
`  camera: { pos: [[0, [2.6, 3.4, 4.4]], [dD, [2.3, 3.1, 3.8], 'inOutSine']], look: [[0, [0, 0.9, -0.3]]], fov: 50, handheld: 0.2 },
  cast: { hero: { pos: [[0, [0, 0, 0]]], rotY: [[0, 0]], clips: idle(dD), bones: stuck(dD), look: [[0, [0.9, 1.5, 0.7]], [1.0, [-0.9, 1.5, -0.6], 'inOutSine']], face: { worried: [[0, 0.9]], sad: [[0.5, 0.6]] }, acting: 'none' },
    p1: { pos: [[0, [1.8, 0, 1.6]], [1.1, [0.85, 0, 0.6], 'outSine']], rotY: [[0, -2.4]], clips: [{ clip: 'walk', start: 0, end: 1.2, speed: 0.45 }, { clip: 'idle', start: 1.0, end: 3, fade: 0.3 }], reach: [{ hand: 'right', to: 'hero.leftarm', start: 1.1, end: dD }], look: [[0, [0, 1.5, 0]]], face: { worried: [[0, 0.7]] } },
    p2: { pos: [[0, [-1.9, 0, -1.4]], [1.2, [-0.85, 0, -0.55], 'outSine']], rotY: [[0, 0.95]], clips: [{ clip: 'walk', start: 0, end: 1.3, speed: 0.45 }, { clip: 'idle', start: 1.1, end: 3, fade: 0.3 }], reach: [{ hand: 'left', to: 'hero.rightarm', start: 1.2, end: dD }], look: [[0, [0, 1.5, 0]]], face: { worried: [[0, 0.7]] } } },`);
// harbor: a long brown lake to the horizon, low over the surface, rescuers wading toward us
rep(`S('harbor', { set: 'city-day', look: SUN,
  camera: { pos: [[0, [5, 5, 12]], [dH, [5.5, 9, 14], 'inOutSine']], look: [[0, [0, 0.5, -8]], [dH, [0, 0, -14], 'inOutSine']], fov: 55 },
  cast: { p1: { pos: [[0, [1.0, 0, 3]], [dH, [1.0, 0, 3 - 0.6 * dH], 'linear']], rotY: [[0, P]], clips: [{ clip: 'walk', start: 0, end: 3, speed: 0.45 }] },
    p2: { pos: [[0, [-1.6, 0, 1.4]], [dH, [-1.6, 0, 1.4 - 0.6 * dH], 'linear']], rotY: [[0, P]], clips: [{ clip: 'walk', start: 0, end: 3, speed: 0.45 }] } },
  fx: [FLOOD({ level: [[0, 0.7]], flow: 0.3, rough: 0.3 })] });`,
`S('harbor', { set: 'city-day', look: 'warm-film',
  camera: { pos: [[0, [1.8, 1.5, 12]], [dH, [1.6, 2.4, 13], 'inOutSine']], look: [[0, [0, 1.0, -30]], [dH, [0, 0.8, -30], 'inOutSine']], fov: 55 },
  cast: { p1: { pos: [[0, [1.2, 0, 2]], [dH, [1.2, 0, 2 + 0.65 * dH], 'linear']], rotY: [[0, 0]], clips: [{ clip: 'walk', start: 0, end: 3, speed: 0.45 }], face: { sad: [[0, 0.6]] } },
    p2: { pos: [[0, [-1.4, 0, -1]], [dH, [-1.4, 0, -1 + 0.65 * dH], 'linear']], rotY: [[0, 0]], clips: [{ clip: 'walk', start: 0, end: 3, speed: 0.45 }], face: { sad: [[0, 0.5]] } } },
  fx: [FLOOD({ level: [[0, 0.7]], flow: 0.3, rough: 0.3, color: '#331706' })] });`);
// glue: hot glossy syrup turns matte as it cools
rep("fx: [FLOOD({ level: [[0, 1.05], [dG, 1.0]], flow: 0.5, rough: 0.28 })] });", "fx: [FLOOD({ level: [[0, 1.05], [dG, 1.0]], flow: 0.5, rough: [[0, 0.18], [1.4, 0.18], [2.4, 0.75, 'inOutSine']] })] });");
// burst: smaller syrup streaks, further back so they don't bury his face
rep("{ type: 'molasses-burst', t: 0.05, pos: [0, 5, -12], scale: 2.6 }", "{ type: 'molasses-burst', t: 0.05, pos: [0, 5, -14], scale: 2.1 }");
// counter matches the narration ("two million gallons")
rep("style: 'counter', from: 0, to: 2300000, suffix: '', sub: 'GALLONS OF MOLASSES'", "style: 'counter', from: 0, to: 2000000, suffix: '+', sub: 'GALLONS OF MOLASSES'");
rep("style: 'tag', text: 'BROWN FOR MONTHS'", "style: 'tag', text: 'HARBOR: BROWN FOR MONTHS'");
fs.writeFileSync('direction.js', s); console.log('ok');
