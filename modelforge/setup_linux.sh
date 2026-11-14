#!/usr/bin/env bash
# Model Forge setup (Linux + NVIDIA). Run from the motion-forge folder:  bash modelforge/setup_linux.sh
# Needs: NVIDIA driver, python3.10-3.12 with venv, git, build-essential; CUDA toolkit 12.x for texture painting.
set -e
MF="$(cd "$(dirname "$0")" && pwd)"
nvidia-smi | head -15
[ -d "$MF/.venv" ] || python3 -m venv "$MF/.venv"
PY="$MF/.venv/bin/python"
"$PY" -m pip install --upgrade pip wheel setuptools
"$PY" -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124
[ -d "$MF/Hunyuan3D-2" ] || git clone --depth 1 https://github.com/Tencent/Hunyuan3D-2 "$MF/Hunyuan3D-2"
"$PY" -m pip install -r "$MF/Hunyuan3D-2/requirements.txt"
"$PY" -m pip install -e "$MF/Hunyuan3D-2"
( cd "$MF/Hunyuan3D-2/hy3dgen/texgen/custom_rasterizer" && "$PY" setup.py install && cd ../differentiable_renderer && "$PY" setup.py install ) \
  || echo "WARNING: texture painter not built (needs CUDA toolkit + build tools). Shapes still work."
"$PY" "$MF/forge.py" --check
