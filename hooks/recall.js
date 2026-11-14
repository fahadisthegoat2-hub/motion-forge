#!/usr/bin/env node
// UserPromptSubmit hook: before Claude answers, it re-reads the user's previous messages (default 3) so no order is missed.
// The user can change the number ("check the last 5 messages") → .motion-forge/recall.json { "count": 5 }.
const fs = require('fs'), path = require('path');
if (process.argv.includes('--project') && (() => { try { return fs.readdirSync(path.join(process.env.HOME || '', '.claude/plugins/cache')).some((m) => fs.existsSync(path.join(process.env.HOME, '.claude/plugins/cache', m, 'motion-video'))); } catch { return false; } })()) process.exit(0);
let input = ''; process.stdin.on('data', (d) => (input += d)).on('end', () => {
  let j = {}; try { j = JSON.parse(input); } catch {}
  let n = 3; try { n = JSON.parse(fs.readFileSync(path.join(j.cwd || process.cwd(), '.motion-forge', 'recall.json'), 'utf8')).count || 3; } catch {}
  const msgs = [];
  try {
    for (const line of fs.readFileSync(j.transcript_path, 'utf8').split('\n')) {
      let e; try { e = JSON.parse(line); } catch { continue; }
      if (e.type !== 'user' || e.isMeta || !e.message) continue;
      const c = e.message.content, t = typeof c === 'string' ? c : Array.isArray(c) ? c.filter((p) => p.type === 'text').map((p) => p.text).join(' ') : '';
      if (t && !/^<(command|local-command|system-reminder|task-notification)/.test(t.trim()) && !/^\[Request interrupted/.test(t.trim())) msgs.push(t.trim().slice(0, 1200));
    }
  } catch {}
  const prev = msgs.filter((t) => t !== (j.prompt || '').trim()).slice(-n);
  const out = ['ORDERS CHECK (Motion Forge): before answering, re-read the user\'s previous ' + n + ' message(s) below together with the new one.',
    'Every request in them must be done or still in progress — none forgotten, none contradicted. Do this check silently.'];
  prev.forEach((t, i) => out.push(`[${i + 1}] ${t}`));
  out.push('REPLY STYLE: absolute respect. Short and direct. No summaries, no recaps, no lists of what you did, no filler. Say only what the user must know or decide; deliver links/files.');
  console.log(out.join('\n'));
});
