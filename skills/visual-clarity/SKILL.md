---
name: visual-clarity
description: Makes every 3D short or long video easy to understand and packed with explainer motion graphics — each narration line gets a literal visual (body callouts, magnified inside-the-body views, charts, checklists, timelines), cameras chosen by meaning, payoff-first hooks, no repeated or random scenes. Use for every video, especially "what happens if", health/body, science, facts and explainer topics.
---

# Visual clarity — the viewer must GET every shot

A shot that looks cool but says nothing is a failure. Random actions (backflips, dancing, spinning props)
that don't show what the line says make the video confusing and boring.

## 1. Visual plan BEFORE any code (write it as a table)
`# | VO / caption line | what the viewer must understand | literal visual (3D action + graphic) | camera (by meaning) | dur`
- One idea per shot. The visual shows EXACTLY what the line says.
  - "your fat cells shrink" → hero MS + `pulse` on `hero.belly` + `inset` kind `fat` with level going 1 → 0.3 + `callout` "FAT CELLS −30%".
  - "sugar spikes then crashes" → `chart` of blood sugar with SPIKE / CRASH marks + hero slumps (`slump` gesture, `sad` face).
  - "your heart rate drops" → `pulse` on `hero.heart` with `beat: 70` + `counter` 85 → 70 BPM.
  - "cravings fade" → `list` with a struck-through item, or a `meter` draining.
  - Time jumps ("Day 3", "Week 2") → one `timeline` across the whole video + a `tag`.
- If you can't name the literal visual for a line, rewrite the line.
- Each shot must add NEW information. Never repeat a set + framing + action combo.

## 2. Explainer graphics toolkit (TITLES — see SCENE_API.md)
Body-anchored (they follow the character and camera): `callout` · `pulse` · `inset` (micro view: fat · blood · neurons · artery · cells) · `bubble` · `arrow` (path between anchors).
Panels: `chart` (line graph that draws on) · `bars` (comparison) · `list` (checklist, ✓ / ✗ / strike) · `card` (icon + title + short text) · `timeline` (story progress) · `icon` · `counter` · `meter` · `arrow` with `dir: 'up' | 'down'` (trend).
Anchors: `at: 'hero.heart'` — parts: head brain face eyes mouth throat chest heart lungs stomach liver belly fat gut hips lefthand righthand leftarm rightarm leftknee rightknee skin feet.
Explainer topics need ≥1 explainer graphic in at least 70% of shots, and a graphic event (pop, draw-on, counter, mark) every 1–2s.

## 3. Camera by meaning (never pick a move just for variety)
| Beat | Camera |
|---|---|
| Body part / effect | `static` or slow `push`, `ms`/`mcu` with the part in frame; graphics need a steady frame to read |
| Data panel (chart, bars, list) | `mls`/`ws` so the character is small in the lower half; panel in the top 35%; never over the face |
| Emotion / reaction | `cu` on the face |
| New time or place | `ws` establishing + `timeline`/`tag` |
| Action / transformation | `track`, `orbit`, `crane-up` |
| Hook / twist | `crash-zoom`, `smash` cut, punch-in |
Never `overhead`, `dutch` or a fast `orbit` on an informational beat. The subject (and the body part being discussed) must always be in frame.

## 4. Pacing that keeps viewers AND is understood
- Payoff-first hook: the first 2s show the answer or result (end state, number, shocking visual), then explain how.
- Hold info shots long enough to read: dur ≥ 0.6s + 0.3s per on-screen word (usually 1.5–3s). Cut faster only in the hook and montages.
- Keep energy inside long shots with graphic beats (pop, draw-on, counter, push-in), not with extra cuts.
- ≤ 6 words on screen at once besides captions. Captions match the VO exactly.

## 5. Tests (before showing anything)
- **Sound-off test**: muted, every shot is understandable from visuals + captions.
- **5-word test**: describe each shot in ≤5 words that match its line. If you can't, fix the shot.
- **Random-action test**: every movement is motivated by the line; delete anything that isn't.
