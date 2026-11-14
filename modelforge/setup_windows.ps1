# Model Forge setup (Windows + NVIDIA). Run from the motion-forge folder:  powershell -ExecutionPolicy Bypass -File modelforge\setup_windows.ps1
# Needs: NVIDIA driver, Python 3.10-3.12, Git. Texture painting also needs "Visual Studio Build Tools (C++)" + CUDA Toolkit 12.4.
$ErrorActionPreference = "Stop"
$MF = Split-Path -Parent $MyInvocation.MyCommand.Path
nvidia-smi | Select-Object -First 15
if (-not (Test-Path "$MF\.venv")) { py -3 -m venv "$MF\.venv" }
$PY = "$MF\.venv\Scripts\python.exe"
& $PY -m pip install --upgrade pip wheel setuptools
& $PY -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124
if (-not (Test-Path "$MF\Hunyuan3D-2")) { git clone --depth 1 https://github.com/Tencent/Hunyuan3D-2 "$MF\Hunyuan3D-2" }
& $PY -m pip install -r "$MF\Hunyuan3D-2\requirements.txt"
& $PY -m pip install -e "$MF\Hunyuan3D-2"
try {   # texture painter (optional; needs C++ build tools + CUDA toolkit)
  Push-Location "$MF\Hunyuan3D-2\hy3dgen\texgen\custom_rasterizer"; & $PY setup.py install; Pop-Location
  Push-Location "$MF\Hunyuan3D-2\hy3dgen\texgen\differentiable_renderer"; & $PY setup.py install; Pop-Location
} catch { Pop-Location; Write-Warning "Texture painter not built (install VS Build Tools C++ + CUDA 12.4, then rerun). Shapes still work." }
& $PY "$MF\forge.py" --check
