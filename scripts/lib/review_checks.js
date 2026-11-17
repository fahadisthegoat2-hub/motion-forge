// The quality-review check bank (full text: skills/quality-review/SKILL.md). Effort level = how many checks + rounds.
// Standard = C01–C10 · High = C01–C25 · Maximum = C01–C35.
const CHECKS = [   // the things Sir sees FIRST come first: bodies, hands, props, animation, camera, motion graphics
  ['C01', 'Bodies & limbs (no crooked back, no morphing/twisting limbs)'], ['C02', 'Hands & fingers (pose, grip, nothing melts into held props)'],
  ['C03', 'Nothing passes through anything (props, bodies, floor)'], ['C04', 'Animation life — 12 principles (anticipation, follow-through, arcs, no robotic holds)'],
  ['C05', 'Camera life (every shot moves, motivated, engaging)'], ['C06', 'Motion graphics (designed, animated in/out, every beat)'],
  ['C07', 'Auto gates (qa_check + av_check PASS) + length & format'], ['C08', 'Narration ↔ picture + narration audio'],
  ['C09', 'SFX sync & sound (±1 frame, nothing random)'], ['C10', 'Story, hook, pacing & framing'],
  ['C11', 'Lighting & color'], ['C12', 'Smoothness (motion strips)'], ['C13', 'Camera craft'], ['C14', 'Edit & cuts'],
  ['C15', 'Acting, face & eyes'], ['C16', 'Feet & ground contact'], ['C17', 'Mix balance (voice/music/sfx)'],
  ['C18', 'Dead air & room tone'], ['C19', 'Music structure (drops, phrasing, endings)'], ['C20', 'Motion-graphics design system + caption timing'],
  ['C21', 'VFX quality'], ['C22', 'Continuity across cuts'], ['C23', 'Sound-off clarity'], ['C24', 'Facts, numbers & text accuracy'],
  ['C25', 'Every shot at full res, twice'],
  ['C26', 'Frame-by-frame key actions'], ['C27', 'Hands macro (every hand, every shot)'], ['C28', 'Face macro'],
  ['C29', 'Audio forensic (every sound soloed)'], ['C30', 'Narration performance (per line)'], ['C31', 'Word-level caption/lip sync'],
  ['C32', 'Second-by-second retention audit'], ['C33', 'Alternate takes of key shots'], ['C34', 'Final master file check'],
  ['C35', 'Fresh-eyes full watch (sound on + muted)'],
];
const TIERS = { standard: { checks: 10, rounds: 2 }, high: { checks: 25, rounds: 4 }, maximum: { checks: 35, rounds: 6 } };
const tierOf = (e) => { e = String(e || 'standard').toLowerCase(); return e.startsWith('max') ? 'maximum' : e.startsWith('high') ? 'high' : 'standard'; };
const sceneHash = (file) => require('crypto').createHash('sha1').update(require('fs').readFileSync(file, 'utf8')).digest('hex').slice(0, 16);
module.exports = { sceneHash, CHECKS, TIERS, tierOf, checksFor: (e) => CHECKS.slice(0, TIERS[tierOf(e)].checks) };
