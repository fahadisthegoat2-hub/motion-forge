#!/usr/bin/env node
// Build one gallery image of the whole cast (photo cards + names) → characters/gallery.jpg
// Usage (from the project root): node character_gallery.js
const fs = require('fs'), path = require('path');
const { launchBrowser, startStaticServer } = require('./lib/deps');
const ROOT = process.cwd(), lib = JSON.parse(fs.readFileSync(path.join(ROOT, 'characters', 'library.json'), 'utf8')).characters || {};
const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const items = Object.entries(lib).map(([id, c]) => {
  const img = path.join(ROOT, 'characters', 'thumbs', id + '.jpg');
  return `<div class="c">${fs.existsSync(img) ? `<img src="${img}">` : '<div class="ph">no photo yet</div>'}<b>${esc(c.name || id)}</b><span>${esc(id)} · ${esc(c.about || '')}</span></div>`;
}).join('');
const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#0f1216;font:15px system-ui,sans-serif;color:#e8eef3;padding:22px}
h1{font-size:22px;margin:0 0 16px}.g{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.c{background:#1a1f26;border-radius:12px;padding:10px}
img,.ph{width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:8px;display:block;background:#2a313a}.ph{display:flex;align-items:center;justify-content:center;color:#7d8996}
b{display:block;font-size:18px;margin:8px 2px 2px}span{color:#9aa7b4;font-size:13px;margin:0 2px}</style>
<h1>Your cast — reply with the names you want (or "new character")</h1><div class="g">${items}</div>`;
const page = path.join(ROOT, '.motion-forge', 'gallery.html'); fs.mkdirSync(path.dirname(page), { recursive: true }); fs.writeFileSync(page, html);
(async () => {
  const srv = await startStaticServer(), b = await launchBrowser(), p = await b.newPage({ viewport: { width: 1100, height: 400 } });
  await p.goto(srv.origin + page.replace(/(<img src=")/g, '$1')); await p.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
  const html2 = (await p.content()).replace(/src="\//g, 'src="' + srv.origin + '/'); await p.setContent(html2); await p.waitForTimeout(400);
  const out = path.join(ROOT, 'characters', 'gallery.jpg'); await p.screenshot({ path: out, fullPage: true, type: 'jpeg', quality: 85 });
  await b.close(); srv.close(); console.log('gallery → characters/gallery.jpg');
})();
