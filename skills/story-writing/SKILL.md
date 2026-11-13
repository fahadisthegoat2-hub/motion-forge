---
name: story-writing
description: Write gripping scripts for 3D animated stories and shorts that maximize retention — scroll-stopping hook, clear beginning, escalating tension, big climax and a strong plot twist every time. Use when the user asks for a script, story, plot, narration, idea, or concept for a 3D video/short/animation.
---

> **Tool policy:** Use only built-in tools — Three.js/HTML/JS in the browser, Node + Playwright, ffmpeg. **Do NOT install or run Blender or Python** (no `pip`, no `bpy`, no `blender`) unless the user has explicitly said "Blender/Python allowed" in this conversation.
> **Efficiency:** Work silently — batch tool calls, no narration, no recaps. Preview at 540p / few frames (internal checks only). Final output is never below Good (1080×1920 @30fps) — always ask the user Good, High or Epic before the final render. Message the user only when done or truly blocked. Before delivering, run the `quality-review` skill.

# Story Writing for 3D Shorts — retention first

## Non-negotiable structure (every script)
| Beat | Time (45s short) | Job |
|---|---|---|
| **Hook** | 0–2s | Impossible question, shocking visual or stakes. No intro, no "hey guys". |
| **Setup** | 2–8s | Who (relatable "you"/everyman), where, the ONE rule/goal. Plant the twist clue here. |
| **Escalation** | 8–30s | 3 rising steps, each worse/weirder than the last. Re-hook every 5–8s ("but that's not the worst part…"). |
| **Climax** | 30–38s | Peak danger/decision. Slow-mo, snap zoom, silence before impact. |
| **Twist** | 38–43s | Reversal that recontextualizes everything — must be set up by the planted clue. |
| **Button/Loop** | 43–45s | Final line that connects to the first line so the video loops. |

## Hook formulas
- "What happens if you ___?" / "This man ___ for 30 days."
- Start mid-action at the most visual moment, then rewind ("3 hours earlier").
- Open a loop the viewer must close: a mystery object, a countdown, a wrong-looking detail.

## Twist toolkit (choose one that fits, never random)
1. **Reversal** — the hunter is the hunted; the cure was the cause.
2. **Identity reveal** — the narrator/helper is who we feared.
3. **Hidden rule** — the "safe" choice was the deadly one (clue was on screen).
4. **Scale shift** — zoom out: it all happened inside something bigger/smaller.
5. **Consequence twist** — they survived the danger… but the fix creates a new one.
6. **Dramatic irony flip** — the viewer thought they knew more than the character; they didn't.
Rule: fair-play. The twist must be **surprising but inevitable** — re-watching shows the clue.

## Retention techniques
- Every line raises a question or answers one while opening another.
- Concrete numbers & specifics ("4 minutes", "37°C") beat vague words.
- Stakes ladder: discomfort → pain → danger → irreversible.
- Cut anything that doesn't move the plot. ~110–130 words per 45s.
- Visual verbs: every line must be filmable as a 3D shot.
- Keep facts accurate for science/medical stories; label dramatized parts as fiction.

## Output format
1. **Logline** (1 sentence) + **twist** (1 sentence) + where the clue is planted.
2. **Script table**: `time | VO line | on-screen action | shot & camera | expression | SFX`.
3. **3 alternate hooks** and **2 alternate twists**.
4. Self-score 1–10 on: hook, escalation, twist fairness, loop; rewrite anything < 8.
