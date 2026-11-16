import { KokoroTTS } from 'kokoro-js';
import { env as HF } from '@huggingface/transformers'; HF.localModelPath = process.env.KOKORO_MODELS || '/tmp/claude-0/kok/models/'; HF.allowRemoteModels = false;
import fs from 'fs';
const TONES = { neutral: [1, 1], excited: [1.1, 1.15], calm: [0.9, 0.88], serious: [0.95, 1], sad: [0.86, 0.8], whisper: [0.93, 0.6], scared: [1.12, 0.9], dramatic: [0.86, 1.08], shout: [1.04, 1.3], mysterious: [0.88, 0.85] };
// Cloud voiceover (Kokoro, needs kokoro-js + the model in KOKORO_MODELS). Usage: node vo_cloud.mjs <outDir> <lines.json> [--voice am_michael] [--speed 1.15]
// lines.json = [["text", "tone", pauseAfterSeconds], …] · tones: neutral excited calm serious sad whisper scared dramatic shout mysterious
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
if (!process.argv[2] || !process.argv[3]) { console.error('usage: vo_cloud.mjs <outDir> <lines.json> [--voice id] [--speed n]'); process.exit(1); }
const BASE = +arg('--speed', 1.15), VOICE = arg('--voice', 'am_michael');
const S = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')).map((l) => Array.isArray(l) ? [l[0], l[1] || 'neutral', l[2] ?? 0.1] : [l.text, l.tone || 'neutral', l.pause ?? 0.1]);
const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device: 'cpu' });
let out = [], sr = 24000, t = 0.05, words = [];
out.push(new Float32Array(Math.round(sr * 0.05)));
for (const [text, tone, pause] of S) {
  const [sp, gain] = TONES[tone] || TONES.neutral;
  const a = await tts.generate(text, { voice: VOICE, speed: BASE * sp }); sr = a.sampling_rate; let x = a.audio;
  // trim silence
  const thr = 0.012; let i0 = 0, i1 = x.length - 1; while (i0 < x.length && Math.abs(x[i0]) < thr) i0++; while (i1 > i0 && Math.abs(x[i1]) < thr) i1--;
  i0 = Math.max(0, i0 - Math.round(sr * 0.02)); i1 = Math.min(x.length, i1 + Math.round(sr * 0.06)); x = x.slice(i0, i1).map((v) => v * gain);
  const d = x.length / sr, ws = text.split(/\s+/), wt = ws.map((w) => Math.max(2, w.replace(/[^A-Za-z0-9]/g, '').length) + (/[.,?!:]$/.test(w) ? 2 : 0)), tot = wt.reduce((p, c) => p + c, 0);
  let acc = 0; for (let k = 0; k < ws.length; k++) { const s0 = t + d * acc / tot; acc += wt[k]; words.push({ w: ws[k], start: +s0.toFixed(3), end: +(t + d * acc / tot).toFixed(3), tone }); }
  out.push(x); t += d; out.push(new Float32Array(Math.round(sr * pause))); t += pause;
}
const N = out.reduce((p, c) => p + c.length, 0), all = new Float32Array(N); let o = 0; for (const c of out) { all.set(c, o); o += c.length; }
let peak = 0; for (const v of all) peak = Math.max(peak, Math.abs(v)); const k = 0.89 / (peak || 1);
const pcm = Buffer.alloc(N * 2); for (let i = 0; i < N; i++) pcm.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(all[i] * k * 32767))), i * 2);
const h = Buffer.alloc(44); h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8); h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(sr, 24); h.writeUInt32LE(sr * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
const dir = process.argv[2]; fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(dir + '/vo.wav', Buffer.concat([h, pcm]));
fs.writeFileSync(dir + '/vo.json', JSON.stringify({ voice: VOICE, duration: +(N / sr).toFixed(3), words }, null, 1));
console.log('duration', (N / sr).toFixed(2), 'words', words.length);
