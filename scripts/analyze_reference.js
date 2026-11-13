#!/usr/bin/env node
// Measure reference images (no Python): palette, values, contrast, saturation, temperature.
// Usage: node analyze_reference.js img1 [img2 ...] [--colors 8]
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(require('path').join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright'))); }
const fs = require('fs'), path = require('path');

const args = process.argv.slice(2);
let k = 8; const ci = args.indexOf('--colors');
if (ci >= 0) { k = +args[ci + 1]; args.splice(ci, 2); }
if (!args.length) { console.error('usage: analyze_reference.js img [img...] [--colors N]'); process.exit(1); }

const mime = (f) => ({ '.jpg': 'jpeg', '.jpeg': 'jpeg', '.webp': 'webp', '.gif': 'gif' }[path.extname(f).toLowerCase()] || 'png');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const out = [];
  for (const file of args) {
    const url = `data:image/${mime(file)};base64,` + fs.readFileSync(file).toString('base64');
    const r = await page.evaluate(async ({ url, k }) => {
      const img = new Image(); img.src = url; await img.decode();
      const s = Math.min(1, 200 / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      const x = c.getContext('2d'); x.drawImage(img, 0, 0, c.width, c.height);
      const d = x.getImageData(0, 0, c.width, c.height).data;
      const px = []; for (let i = 0; i < d.length; i += 4) px.push([d[i], d[i + 1], d[i + 2]]);
      // k-means (seeded by luminance spread)
      const lum = (p) => 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
      const sorted = [...px].sort((a, b) => lum(a) - lum(b));
      let cents = Array.from({ length: k }, (_, i) => [...sorted[Math.floor((i + 0.5) * sorted.length / k)]]);
      let assign = new Array(px.length).fill(0);
      for (let it = 0; it < 12; it++) {
        const sum = cents.map(() => [0, 0, 0, 0]);
        px.forEach((p, i) => {
          let b = 0, bd = 1e9;
          cents.forEach((c, j) => { const dd = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2; if (dd < bd) { bd = dd; b = j; } });
          assign[i] = b; sum[b][0] += p[0]; sum[b][1] += p[1]; sum[b][2] += p[2]; sum[b][3]++;
        });
        cents = cents.map((c, j) => sum[j][3] ? [sum[j][0] / sum[j][3], sum[j][1] / sum[j][3], sum[j][2] / sum[j][3]] : c);
      }
      const counts = cents.map((_, j) => assign.filter((a) => a === j).length);
      const hsl = ([r, g, b]) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, dd = mx - mn;
        let h = 0; if (dd) h = mx === r ? ((g - b) / dd) % 6 : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4;
        return { hue: Math.round((h * 60 + 360) % 360), light: +l.toFixed(2), sat: +(dd ? dd / (1 - Math.abs(2 * l - 1)) : 0).toFixed(2) }; };
      const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
      const palette = cents.map((c, j) => ({ hex: hex(c), pct: +(100 * counts[j] / px.length).toFixed(1), ...hsl(c) }))
        .filter((p) => p.pct > 0.5).sort((a, b) => b.pct - a.pct);
      const L = px.map(lum).sort((a, b) => a - b), mean = L.reduce((a, b) => a + b, 0) / L.length;
      const lo = Math.round(L[Math.floor(L.length * 0.02)]), hi = Math.round(L[Math.floor(L.length * 0.98)]);
      const avg = [0, 1, 2].map((i) => px.reduce((a, p) => a + p[i], 0) / px.length);
      const avgSat = px.reduce((a, p) => { const mx = Math.max(...p), mn = Math.min(...p); return a + (mx ? (mx - mn) / mx : 0); }, 0) / px.length;
      const warm = (avg[0] - avg[2]) / 255;
      const accent = palette.reduce((best, p) => (p.sat * (p.pct < 20 ? 1 : 0.3) > best.sat * (best.pct < 20 ? 1 : 0.3) ? p : best), palette[0]);
      return { palette, values: { black_point: lo, white_point: hi, mean: Math.round(mean), contrast_range: hi - lo,
          key: mean > 150 ? 'high-key' : mean < 90 ? 'low-key' : 'mid-key' },
        avg_saturation: +avgSat.toFixed(2), temperature: warm > 0.05 ? 'warm' : warm < -0.05 ? 'cool' : 'neutral', likely_accent: accent.hex };
    }, { url, k });
    out.push({ file, ...r });
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 2));
})().catch((e) => { console.error(e); process.exit(1); });
