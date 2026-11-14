# Model Forge

Claude's AI 3D model generator for Motion Forge. Free and unlimited, it runs on your own NVIDIA PC (Tencent Hunyuan3D-2).

- Setup (once): Windows `powershell -ExecutionPolicy Bypass -File modelforge\setup_windows.ps1` · Linux `bash modelforge/setup_linux.sh`
- Make a model: `modelforge/.venv/Scripts/python modelforge/forge.py "a red fire hydrant" --id hydrant --height 0.8 --publish`
- Web UI: `modelforge/.venv/Scripts/python modelforge/forge.py --serve` → http://localhost:7861

Needs an NVIDIA GPU with 6 GB+ VRAM (12 GB+ for high quality). Models: Tencent Hunyuan 3D Community License.
