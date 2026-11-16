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
let _ff;
function ffmpeg() {
  if (_ff) return _ff;
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return (_ff = 'ffmpeg'); } catch {}
  let p = tryReq('ffmpeg-static');
  if (!p) { npmInstall(['ffmpeg-static@5']); p = tryReq('ffmpeg-static'); }
  if (!p) throw new Error('Could not set up ffmpeg.');
  return (_ff = p);
}

// Local three.js copy so cloud sessions render even if the CDN is blocked.
function threeDir() {
  const find = () => [process.cwd(), DEPS, globalRoot()].filter(Boolean)
    .map((r) => path.join(r, r.endsWith('node_modules') ? 'three' : 'node_modules/three')).find((p) => fs.existsSync(p));
  let p = find();
  if (!p) { try { npmInstall(['three@0.170.0']); p = find(); } catch {} }
  return p;
}

// three.js sample assets (models) from git when the CDN is unreachable.
function threeRepoFile(tag, rel) {
  const dir = path.join(DEPS, 'three-src-' + tag), f = path.join(dir, rel);
  if (fs.existsSync(f)) return f;
  try {
    if (!fs.existsSync(path.join(dir, '.git'))) {
      log('fetching three.js sample assets (one time)…'); fs.mkdirSync(DEPS, { recursive: true });
      execFileSync('git', ['clone', '-q', '--depth', '1', '--filter=blob:none', '--sparse', '--branch', tag, 'https://github.com/mrdoob/three.js', dir],
        { stdio: 'ignore', env: { ...process.env, GIT_LFS_SKIP_SMUDGE: '1' } });
    }
    const buf = execFileSync('git', ['-C', dir, 'show', 'HEAD:' + rel], { maxBuffer: 256 * 1024 * 1024 });
    fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, buf); return f;
  } catch { return null; }
}

// Tiny local static server (127.0.0.1 only) so scenes can load relative assets (characters/, assets/, …).
function startStaticServer() {
  const http = require('http'), TYPES = { '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript', '.json': 'application/json', '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json', '.fbx': 'application/octet-stream', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.bin': 'application/octet-stream' };
  const srv = http.createServer((req, res) => {
    const p = decodeURIComponent(req.url.split('?')[0]);
    fs.stat(p, (err, st) => { if (err || !st.isFile()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(p).toLowerCase()] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*' }); fs.createReadStream(p).pipe(res); });
  });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok({ origin: 'http://127.0.0.1:' + srv.address().port, close: () => srv.close() })));
}

// Route CDN asset URLs to local copies (cloud sessions often block CDNs): three.js modules, three.js sample models, plugin repo files.
async function routeAssets(page) {
  const path = require("path"), localThree = threeDir();
  if (localThree) await page.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\/(.*)/, (route) => {
    const f = path.join(localThree, route.request().url().match(/three@[^/]+\/(.*)/)[1]);
    fs.existsSync(f) ? route.fulfill({ path: f, contentType: "application/javascript" }) : route.continue();
  });
  await page.route(/cdn\.jsdelivr\.net\/gh\/mrdoob\/three\.js@([^/]+)\/(.+)$/, async (route) => {
    const [, tag, rel] = route.request().url().match(/three\.js@([^/]+)\/(.+)$/);
    try { const resp = await route.fetch({ timeout: 8000 }); if (resp.ok()) return route.fulfill({ response: resp }); } catch {}
    const f = threeRepoFile(tag, rel); return f ? route.fulfill({ path: f }) : route.abort();
  });
  await page.route(/cdn\.jsdelivr\.net\/gh\/[^/]+\/motion-forge@[^/]+\/(.+)$/, (route) => {
    const f = path.join(__dirname, "..", "..", decodeURIComponent(route.request().url().match(/motion-forge@[^/]+\/(.+)$/)[1]).split("?")[0]);
    return fs.existsSync(f) ? route.fulfill({ path: f }) : route.continue();
  });
}

module.exports = { launchBrowser, ffmpeg, threeDir, threeRepoFile, startStaticServer, routeAssets, DEPS };
