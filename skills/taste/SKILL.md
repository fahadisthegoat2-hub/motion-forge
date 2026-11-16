---
name: taste
description: Human taste and the "make it better" protocol — what separates work a person with an eye made from machine-made filler, Sir's personal taste log, and the rule that every "improve it / make it better / again" produces a clearly visible upgrade. Use on EVERY video and every revision, and whenever the user says better, improve, more human, less AI, polish, again, or gives any feedback.
---

> **Efficiency:** apply silently. Never explain taste to Sir — show it in the work.

# Taste — it should feel made by a person who cares

## 1. Sir's taste log (read first, every session)
`.motion-forge/state.md` → section **SIR'S TASTE**. Every line there is a standing order for ALL future videos.
Whenever Sir reacts to anything ("I hate…", "I like…", "too…", "more…", "not like that"): add ONE line to that section the same turn
(what he said, in his words + what it means for the work). Never make him say the same thing twice.

## 2. Human choices (the difference between designed and generated)
- **One idea per video, one emotion per shot.** Decide the feeling first; everything in the frame serves it or leaves.
- **Restraint.** Fewer elements, done well. Empty space is a choice. If removing a thing changes nothing, remove it.
- **Specific beats generic.** Not "a man is scared" — his hand stops halfway to the cup. Give every shot one small true detail a person
  would notice (a glance back, a breath before the jump, a shoe that slips).
- **Rhythm breathes.** Not a metronome: quick-quick-HOLD. Let the biggest moment sit in near-silence for a beat before the hit.
  Shot lengths vary on purpose; the cut lands a frame or two *before* the action finishes.
- **Imperfection.** Nothing perfectly centred, symmetric or evenly spaced unless it means something. Slight handheld on emotional shots,
  off-centre framing with looking room, poses with weight on one leg, hands doing two different things.
- **Acting is thought, then movement.** Eyes move first, then the head, then the body. A reaction takes 4–8 frames to start. People
  hesitate, overshoot, settle, fidget. Nobody holds a frozen pose or moves both arms the same way at the same time.
- **Light and colour mean something.** One motivated key, real shadows, a restrained palette (two colours + neutrals), contrast where the
  eye should go. Never rainbow, never everything glowing.
- **Sound has taste too.** Fewer, better sounds; room tone; a moment of quiet; music that follows the story instead of sitting under it.
- **Words like a person talks.** Short, concrete, a little dry or funny. No hype words ("insane", "mind-blowing", "unleash"), no filler.
- **A signature touch.** One thing in every video nobody asked for that makes it feel authored (a visual motif, a callback, a tiny joke).

## 3. Machine tells — remove every one before delivering
Everything bouncing/popping at once · the same ease on everything · a graphic on every single beat · five title styles in one video ·
stock gestures that mean nothing (random pointing, shrugging) · characters staring at the camera for no reason · symmetric twin-arm
gestures · floating/sliding feet · bodies or limbs passing through each other · pose-to-pose blends that look like morphing ·
perfectly even shot lengths · glow, lens flare and particles as decoration · stamps, comic bursts and glitch text mixed together ·
generic lines ("little did he know") · music that never changes · an ending that just stops.

## 4. THE "MAKE IT BETTER" PROTOCOL (every time Sir asks to improve, redo, polish or "again")
A revision that looks almost the same as the last one is a failure. Each ask must produce an upgrade Sir can SEE in the first watch.
1. **Find the truth.** Watch the current version as a stranger (frames + strips). Write (internally) the 5 weakest things, worst first —
   honest ones: the dull shot, the stiff pose, the ugly graphic, the weak hook, the flat sound. Read SIR'S TASTE: anything violated goes first.
2. **Go big on the top 3.** Rebuild them — new staging, new acting, new graphic, new timing — not a value tweak. Then fix the other two.
   If Sir named something specific, that thing changes the most.
3. **Never the same answer twice.** If an approach was already tried and Sir still was not happy, it is banned: change the approach
   (different camera idea, different animation method, different design), not the numbers.
4. **Prove the change.** `node ${CLAUDE_PLUGIN_ROOT}/scripts/improve_check.js old_scene.html new_scene.html` must print IMPROVE PASS
   (keep the previous version as `<scene>.prev.html` before editing). Compare before/after frames side by side yourself: if you
   cannot point at the difference in 2 seconds, it is not better yet — keep going.
5. **Keep what worked.** Do not break or restyle the parts Sir did not complain about.
6. **Log it.** One line in SIR'S TASTE about what he wanted this time. Then the normal quality-review gate, then "Done, sir." + link.

Engine/plugin work follows the same rule: every "improve the plugin" ask must change real behaviour (a fix that is tested, a new
capability, a stricter gate) — not wording.
