---
name: story-writing
description: Write gripping scripts for 3D animated stories and shorts that maximize retention — scroll-stopping hook, clear beginning, escalating tension, big climax and a strong plot twist every time. Use when the user asks for a script, story, plot, narration, idea, or concept for a 3D video/short/animation.
---

> **Tool policy:** Use only built-in tools — Three.js/HTML/JS in the user's Chrome, Node, ffmpeg. The scripts auto-download what they need (playwright-core, ffmpeg) on first run — don't install these by hand. **Do NOT install or run Blender or Python** (no `pip`, no `bpy`, no `blender`) unless the user has explicitly said "Blender/Python allowed" in this conversation.
> **Efficiency:** Work silently — batch tool calls, no narration, no recaps. Preview at 540p / few frames (internal checks only). Final output is never below Good (1080×1920 @30fps) — the quality and effort level were asked at the start of the video (hooks/context.md). Message the user only when done or truly blocked. Before delivering, run the `quality-review` skill.

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

## SHORTS RETENTION FORMULA (mandatory — a short that feels like a documentary is a FAIL)
**Voice**: second person or a character in danger, present tense, urgent. Never "In this video…", "Did you know…", "Let's…",
calm narrator facts, history lessons or slow intros. Every line ≤ 10 words, every line is a NEW image or a NEW stake.

**0–2 s HOOK** (pick one, the scariest/strangest version of the premise, shown not told):
- Impossible situation: "You wake up and the whole city is a jungle."
- Countdown: "You have 60 seconds before your heart stops."
- Payoff first: show the crazy end state, then "here's how it happened."
- Direct threat: "If you're reading this, don't touch the water."
On screen by 0.3 s: hook title (slam) + caption + a hit sound + the most dramatic image. First shot ≤ 2 s.

**Beat map** (45 s example): 0–2 hook · 2–6 setup + plant the twist clue · 6–30 three escalations, each WORSE, each opened by a
re-hook line ("but that's not the worst part…", "then it moved.") · 30–38 climax (slow-mo/freeze/silence, then drop) ·
38–43 twist (smash cut, boom) · 43–45 loop line that leads back into the first frame.

**Rhythm**: shots 0.8–2.2 s (avg ≤ 2.4 s), a beat (cut, title, punch-in, effect, sound hit) at least every 2–3 s, speed ramps on action,
music drops on the twist, captions word-by-word the whole way. Voiceover at Voice Studio speed 1.1–1.2 with excited/dramatic tones on
the hook and twist. `qa_check.js` fails any short that breaks these numbers.

**Before building**: write 5 hooks, score each (stops the scroll? visual? curiosity gap?), keep the best. Read the script out loud in
your head at 1.15× — if any 3 seconds would let a viewer swipe, rewrite them.

## RETENTION ENGINE — 38% stayed today, the target is 70%+ (measured by qa_check, not hoped for)
"Stayed to watch" is decided in the FIRST SECOND; the rest of the curve is decided by whether every line opens a question the next line has not answered yet.
**The story (write it in this order, before any shot):**
1. **The stake in 5 words** — what will happen to YOU and by when ("BURNED ALIVE BY 3 PM"). No stake a 12-year-old can repeat = no video. This is the frame-1 title.
2. **The payoff image** — the single most extreme picture of the story, mid-action (not the start of it). It is shot 1 (`role: 'payoff'`, ≤ 1.7 s, camera + subject + an effect all moving on frame 1).
3. **The twist** — the last 30%, set up by a clue the viewer saw in the first 6 s. Decide it before writing the middle.
4. **The ladder** — ≥ 3 escalations, each one worse AND different in kind (discomfort → pain → danger → no way back). If two steps could swap places, one is filler: cut it.
5. **The loop** — the last line is the first half of the first line (or its question), so the replay answers it. The video ends on that word. No outro, no "follow for more" shot.
**Every line** (≤ 10 words, present tense, "you"): it either raises the stake or pays one off while opening the next. Join lines with BUT / SO / UNTIL — never "and then".
A line that only describes or explains is cut or turned into a picture. Numbers beat adjectives ("411 ml", "3 PM", "9 seconds").
**Re-hook every ≤ 7 s** — a line that makes leaving impossible ("but that's not what kills you", "then the door locks", a question). qa_check finds every gap.
**Every shot has a job** (`role`): payoff → setup (over by 6 s) → escalate ×3+ → climax → twist → loop. A shot with no role is cut. In every shot the character DOES the line
(acts, reaches, falls, runs — never stands and waits), every stake is SHOWN with an effect, a 3D prop, an x-ray or a micro world, and every cut is a new picture (another size, ≥ 30° another angle, or a cutaway).
**Self-test before building** (rewrite until all are yes): Would a stranger stop on frame 1 with the sound off? · Can the story be retold in one sentence? · Is second 6 more dangerous than second 2,
second 15 than second 6, second 25 than second 15? · Is there any 3-second stretch where nothing new is asked or shown? · Does the last word make shot 1 mean something new?
`qa_check.js` fails the short on: intro words, a hook with no you/number/question, no ≤ 5-word stake title on frame 1, a still or dark first 0.45 s, < 3 shots in 5 s, shots without a role, < 3 escalations,
late setup, early/missing twist, no climax, no loop, re-hook gaps, long lines, repeated pictures, < 4 sizes/moves, too few accents/effects, characters that only stand, a dead tail.

## CHANNEL DATA (from Sir's analytics — these rules override older ones)
Best short: 43% stayed. Flops: 75–80% swiped in the first second, viewers gone by 0:13 because the payoff came too late,
34% stayed when the twist was slow. Latest: 38% stayed. GOAL: 70%+ stayed to watch.
1. **0.0 s = motion + shock line on screen** — never a still face, a title card or a slow push. Camera AND subject move on frame 1.
2. **Payoff first, then rewind**: shot 1 shows the most shocking result / the twist image (mark it `role: 'payoff'`), then
   "3 days earlier…" and the story. The twist is teased in second 1 and paid off at the end.
3. **New angle or zoom every 2–3 s** (cut, punch-in or a camera move) — no exceptions.
4. **25–35 s** for shorts unless Sir asks for another length.
5. **Ending loops into the start** (the last line/image leads straight into shot 1).
6. **One comment question** at the end (caption + pinned comment), e.g. "Would you have survived?".
7. **Niche: crazy TRUE stories** (story-research) — same niche every day so the algorithm learns the audience.
