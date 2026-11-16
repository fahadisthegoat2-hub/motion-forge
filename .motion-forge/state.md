# Motion Forge state
- Last video: "The Hand Grabbed Back" (Harrison Okene true story, 2013) — scenes/okene (direction.js → build.js → okene.html). Artifact: https://claude.ai/artifact/8TBqrzTJUkRpgJKjYhFuDb · star Jake, diver Marcus · good/maximum · 25.6s · VO Kokoro am_michael speed 1.05 (cloud: kokoro-js + HF model in /tmp/claude-0/kok). Review tools in scenes/okene/tools (round.sh, auto.js).
- Sir picks the story himself: offer story options via AskUserQuestion before writing.
- Last video: "133 Days Alone" (Poon Lim true story) — scenes/poon-lim (direction.js → build.js → poon-lim.html). Artifact: https://claude.ai/artifact/WC3n76taM98jg4KYbpLuav · star Jake, fishermen Luis + Marcus · good/maximum · 34.5s · VO Kokoro am_michael (BASE 1.05).
- New (approved by Sir): ocean set, sea ambience, model tilt/flat, cast swimming flag, Kenney Pirate Kit CC0 sea models, scripts/glb_embed.js; render mux 48 kHz + alimiter (true peak ≤ -1 dBTP).
- Sir's orders: SILENT/PRIVATE — no progress messages, no photos/image reads shown.
- Last video: "You vs the Middle Ages" — scenes/middle-ages (direction.js → build.js → middle-ages.html). Artifact: https://claude.ai/artifact/SRtSFqeZwoowBiShFac8jP
  Quality good · effort maximum · 34s · star Jake. Voiceover: Kokoro am_michael generated in-cloud (scenes/middle-ages/vo.wav + vo.json). Artifact declares downloads capability (MP4 save button).
- New: `medieval` set (assets/sets/medieval-village.glb, Quaternius CC0, approved by Sir), prop medieval_stake, scripts/kit_compose.js.
- Standing orders: address as sir; no summaries; ask quality+effort per video; outside assets need AskUserQuestion approval.

## SIR'S TASTE (standing orders for every video — add a line for every reaction)
- Every video ≤ 30 s unless Sir names a longer length.
- Hates things morphing into each other: no bodies/limbs through each other, no pose-blend "morphs", no dissolves — change posture on a cut.
- Hates the mixed "old AI + new AI" look: one design system per video (one accent, one caption style, 3–4 title styles), clean type, small overshoot.
- Motion graphics were "terrible": fewer, cleaner, designed; never a style salad.
- Animation felt raw: weight, settle, thought-before-movement, no stiff holds.
- Wants human taste and a clearly visible upgrade EVERY time he asks to improve — never a near-identical redo.
- The review counter must count honest checks (use review_log.js --check / --status).
- Brief replies, no summaries; time is money.

- Sir wants to CHOOSE the story: always offer 3–4 crazy true story options in the question box before building.
- Wants the publish pack pasted automatically in the final message of every video (never ask).
