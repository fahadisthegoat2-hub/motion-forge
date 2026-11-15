// The quality-review check bank (full text: skills/quality-review/SKILL.md). Effort level = how many checks + rounds.
// Standard = C01–C10 · High = C01–C25 · Maximum = C01–C35.
const CHECKS = [
  ['C01', 'Auto gates (qa_check + av_check PASS)'], ['C02', 'Length & format'], ['C03', 'Narration ↔ picture (every line shown)'],
  ['C04', 'Narration audio (clarity, pace, level)'], ['C05', 'SFX sync (±1 frame, nothing random)'], ['C06', 'Feet & ground contact'],
  ['C07', 'Hands & right action'], ['C08', 'Framing & readability'], ['C09', 'Motion graphics & captions (timing, ease, spelling)'],
  ['C10', 'Story, hook & pacing'],
  ['C11', 'Lighting & color'], ['C12', 'Smoothness (motion strips)'], ['C13', 'Camera craft'], ['C14', 'Edit & cuts'],
  ['C15', 'Acting, face & eyes'], ['C16', 'Weight, anticipation & secondary motion'], ['C17', 'Mix balance (voice/music/sfx)'],
  ['C18', 'Dead air & room tone'], ['C19', 'Music structure (drops, phrasing, endings)'], ['C20', 'Motion-graphics design system'],
  ['C21', 'VFX quality'], ['C22', 'Continuity across cuts'], ['C23', 'Sound-off clarity'], ['C24', 'Facts, numbers & text accuracy'],
  ['C25', 'Every shot at full res, twice'],
  ['C26', 'Frame-by-frame key actions'], ['C27', 'Hands macro (every hand, every shot)'], ['C28', 'Face macro'],
  ['C29', 'Audio forensic (every sound soloed)'], ['C30', 'Narration performance (per line)'], ['C31', 'Word-level caption/lip sync'],
  ['C32', 'Second-by-second retention audit'], ['C33', 'Alternate takes of key shots'], ['C34', 'Final master file check'],
  ['C35', 'Fresh-eyes full watch (sound on + muted)'],
];
const TIERS = { standard: { checks: 10, rounds: 2 }, high: { checks: 25, rounds: 4 }, maximum: { checks: 35, rounds: 6 } };
const tierOf = (e) => { e = String(e || 'standard').toLowerCase(); return e.startsWith('max') ? 'maximum' : e.startsWith('high') ? 'high' : 'standard'; };
module.exports = { CHECKS, TIERS, tierOf, checksFor: (e) => CHECKS.slice(0, TIERS[tierOf(e)].checks) };
