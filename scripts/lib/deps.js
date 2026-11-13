// Auto-setup: finds or installs what the scripts need. Uses the user's own Chrome.
// Never installs Blender or Python.
const { execSync, execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');

const DEPS = path.join(os.homedir(), '.motion-forge', 'deps');
const log = (m) => process.stderr.write(`[motion-forge] ${m}\n`);

let _g;
function globalRoot() {
  if (_g === undefined) { try { _g = execSync('npm root -g', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { _g = ''; } }
  return _g;
}
function tryReq(id) {
  try { return require(require.resolve(id, { paths: [process.cwd(), DEPS, __dirname, globalRoot()].filter(Boolean) })); } catch { return null; }
}
function npmInstall(pkgs) {
  fs.mkdirSync(DEPS, { recursive: true });
  const pj = path.join(DEPS, 'package.json');
  if (!fs.existsSync(pj)) fs.writeFileSync(pj, '{"name":"motion-forge-deps","private":true}');
  log(`first-time setup: downloading ${pkgs.join(', ')} (one time only)…`);
  execSync(`npm install --no-audit --no-fund --loglevel=error ${pkgs.join(' ')}`, { cwd: DEPS, stdio: 'inherit' });
}

function playwright() {
  let pw = tryReq('playwright') || tryReq('playwright-core');
  if (!pw) { npmInstall(['playwright-core@1']); pw = tryReq('playwright-core'); }
  if (!pw) throw new Error('Could not set up playwright-core. Is Node/npm installed?');
  return pw;
}

// Prefer the user's installed Chrome (real GPU), then Edge, then a private Chromium.
async function launchBrowser(opts = {}) {
  const { chromium } = playwright();
  const args = ['--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', ...(opts.args || [])];
  const headless = opts.headless ?? true;
  for (const channel of ['chrome', 'msedge']) {
    try { const b = await chromium.launch({ channel, args, headless }); log(`using ${channel}`); return b; } catch {}
  }
  try { return await chromium.launch({ args, headless }); } catch {}
  log('Chrome not found — downloading a private Chromium (one time)…');
  execSync('npx --yes playwright-core install chromium', { cwd: fs.existsSync(DEPS) ? DEPS : process.cwd(), stdio: 'inherit' });
  return chromium.launch({ args, headless });
}

// System ffmpeg if present, else a bundled static ffmpeg (auto-downloaded once).
function ffmpeg() {
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return 'ffmpeg'; } catch {}
  let p = tryReq('ffmpeg-static');
  if (!p) { npmInstall(['ffmpeg-static@5']); p = tryReq('ffmpeg-static'); }
  if (!p) throw new Error('Could not set up ffmpeg.');
  return p;
}

// Local three.js copy so cloud sessions render even if the CDN is blocked.
function threeDir() {
  const find = () => [process.cwd(), DEPS, globalRoot()].filter(Boolean)
    .map((r) => path.join(r, r.endsWith('node_modules') ? 'three' : 'node_modules/three')).find((p) => fs.existsSync(p));
  let p = find();
  if (!p) { try { npmInstall(['three@0.170.0']); p = find(); } catch {} }
  return p;
}

module.exports = { launchBrowser, ffmpeg, threeDir, DEPS };
