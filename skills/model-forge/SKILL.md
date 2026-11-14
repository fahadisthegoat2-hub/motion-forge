---
name: model-forge
description: Model Forge — Claude's own AI 3D model generator (Tencent Hunyuan3D-2, runs free and unlimited on the user's NVIDIA PC). Creates real sculpted, textured 3D models of any prop, food, object, creature, vehicle or building from text or a reference image, saves them to assets/models and places them in scenes. Use whenever a video needs an object that isn't a Casting Board character or a real place, or the user asks for a 3D model, prop or asset.
---

# Model Forge — unlimited AI 3D models

User-approved: Python runs ONLY for Model Forge, ONLY on the user's own PC (never in the cloud container).
Everything else still follows the Motion Forge rules.

## Where it runs
- **Session on the user's PC** (Claude desktop app / `claude` in the motion-forge folder): run it directly.
- **Cloud session**: list_computer_folders → request_computer_folder for their motion-forge folder, then run the commands there
  (Bash with `_host`). If no computer can be reached, use models already in `assets/models/models.json`, and tell the user in one
  line that new models need a session on their PC.

## First-time setup (once per PC, ~20–40 min, ~15 GB download)
1. `nvidia-smi` → NVIDIA GPU with ≥ 6 GB VRAM required (12 GB+ for `--quality high`, 16 GB+ for fast texture painting).
   No NVIDIA GPU → stop and tell the user Model Forge can't run on this computer.
2. Python 3.10–3.12 + Git present (install from python.org / git-scm.com if missing, with the user's OK).
3. Windows: `powershell -ExecutionPolicy Bypass -File modelforge\setup_windows.ps1` · Linux: `bash modelforge/setup_linux.sh`.
   Texture painting needs VS Build Tools (C++) + CUDA Toolkit 12.4 on Windows; without them models are shape-only (still usable,
   recolor with `color`). 4. `modelforge/.venv/…/python modelforge/forge.py --check` must print CUDA True.

## Make a model
`<venv python> modelforge/forge.py "<object description>" --id <snake_id> --height <metres> [--image ref.png] [--quality high] --publish`
- Reuse first: check `assets/models/models.json`; only generate what's missing.
- Prompts: ONE object, what it's made of, its condition and colors ("a greasy double cheeseburger, sesame bun, melted cheddar").
  No scenes, no people, no text. For a specific look, pass `--image` (a clean product-style photo works best).
- Real height in metres (burger 0.12, chair 0.9, car 1.5, house 7). Try 2–3 seeds for hero props; keep the best.
- Check it: render a frame with the model in a scene (or open the UI) — no holes, no floating bits, believable materials.
- `--publish` commits + pushes `assets/models/` so cloud renders and other sessions get it.
- The user can also use the UI: `forge.py --serve` → http://localhost:7861 (prompt, image, gallery, 3D preview, send to Motion Forge).

## Use it in a scene
`fx: [{ type: 'model', id: 'cheeseburger', pos: [x, y, z], height: 0.12, rotY, spin, bob, pulse, p: keys, scale: keys, start, end, color }]`
Props sit on the ground at `pos` (y = surface height, e.g. 0.75 for a table). Pair with real places (`set: 'place:…'`).
