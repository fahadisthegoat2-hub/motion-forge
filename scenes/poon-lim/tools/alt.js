// builds take-B variants of hook (payoff), twist (ship), climax (day) and ending (question) into alt/poon-lim-alt.html
const fs = require('fs'), path = require('path');
const D = require('../direction.js'), S = (n) => D.shots.find((s) => s.name === n);
S('payoff').camera = { move: 'orbit', target: 'hero', size: 'ws', span: 40, az: -30, height: 1.2, handheld: 0.9 };
S('ship').camera = { pos: [[0, [-2.2, 0.6, -1.0]]], look: [[0, [-1.0, 3.5, 30]]], fov: 44 };
S('day').camera = { move: 'overhead', target: 'hero', size: 'ws' };
S('question').camera = { move: 'crane-up', target: 'hero', size: 'ws', az: -20 };
fs.mkdirSync(path.join(__dirname, '../alt'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '../alt/direction.js'), 'module.exports = ' + JSON.stringify({ ...D, shots: D.shots }) + ';');
require('child_process').execFileSync('node', [path.join(__dirname, '../build.js'), path.join(__dirname, '../alt/direction.js'), path.join(__dirname, '../alt/poon-lim-alt.html')]);
