// builds bugorski.html from the studio template + direction.js
const fs = require('fs'), path = require('path');
const tpl = fs.readFileSync(path.join(__dirname, '../../templates/studio_scene.html'), 'utf8');
const D = require(process.argv[2] ? path.resolve(process.argv[2]) : './direction.js');
const out = process.argv[3] || path.join(__dirname, 'bugorski.html');
let s = tpl.replace(/<title>[^<]*<\/title>/, `<title>${D.title}</title>`);
const a = s.indexOf('const CONFIG = {'), b = s.indexOf('const CAST = {'), e = s.indexOf('/* ============================== END DIRECTION');
let cfg = s.slice(a, b);
for (const [k, v] of Object.entries(D.config)) {
  const re = new RegExp(`(\\n\\s*)${k}:[^\\n]*?,(\\s*//[^\\n]*)?\\n`);
  if (re.test(cfg)) cfg = cfg.replace(re, `$1${k}: ${JSON.stringify(v)},\n`); else cfg = cfg.replace('const CONFIG = {', `const CONFIG = {\n  ${k}: ${JSON.stringify(v)},`);
}
const body = `const CAST = ${JSON.stringify(D.cast)};\nconst SHOTS = ${JSON.stringify(D.shots)};\nconst CAPTIONS = ${JSON.stringify(D.captions || [])};\nconst TITLES = ${JSON.stringify(D.titles || [])};\n${D.thumbs ? 'const THUMBS = ' + JSON.stringify(D.thumbs) + ';\n' : ''}\n`;
s = s.slice(0, a) + cfg + body + s.slice(e);
fs.writeFileSync(out, s); console.error('wrote', out);
