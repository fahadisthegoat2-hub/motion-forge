// builds alt takes of hook (payoff), twist (grab) and ending (question) into alt/okene-alt.html
const fs = require('fs'), path = require('path');
const D = require('../direction.js'), S = (n) => D.shots.find((s) => s.name === n);
S('payoff').camera = { pos: [[0, [0.3, 0.7, 1.4]]], look: [[0, [0.12, 1.25, 0.42]]], fov: 40, handheld: 0.9 };
S('grab').camera = { pos: [[0, [0.15, 2.0, 0.45]]], look: [[0, [0.12, 1.22, 0.42]]], fov: 40, handheld: 1.0 };
S('question').camera = { pos: [[0, [2.2, 1.6, 1.5]]], look: [[0, [0.1, 1.1, 0.4]]], fov: 40 };
fs.mkdirSync(path.join(__dirname, '../alt'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '../alt/direction.js'), 'module.exports = ' + JSON.stringify(D) + ';');
require('child_process').execFileSync('node', [path.join(__dirname, '../build.js'), path.join(__dirname, '../alt/direction.js'), path.join(__dirname, '../alt/okene-alt.html')]);
