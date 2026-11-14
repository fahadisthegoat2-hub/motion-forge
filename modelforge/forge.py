#!/usr/bin/env python3
"""Model Forge: local AI 3D model generator for Motion Forge (runs on your own NVIDIA PC, free, unlimited).

Text or a reference image -> a sculpted, textured GLB in assets/models/, listed in assets/models/models.json,
ready for scenes: fx: [{ type: 'model', id: '<id>', pos, height }].

  python modelforge/forge.py "a juicy cheeseburger" --id cheeseburger --height 0.12
  python modelforge/forge.py --image photo.png --id old_chair --height 0.9
  python modelforge/forge.py --serve            # web UI on http://localhost:7861
  python modelforge/forge.py --check            # GPU / install check

Engine: Tencent Hunyuan3D-2 (shape: Hunyuan3D-2mini by default, 2.0 with --quality high; texture: Hunyuan3D-Paint;
text-to-image: HunyuanDiT distilled). Model licence: Tencent Hunyuan 3D Community License.
"""
import argparse, base64, io, json, os, re, subprocess, sys, threading, time, traceback
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HERE = Path(__file__).resolve().parent
MODELS = ROOT / 'assets' / 'models'
CATALOG = MODELS / 'models.json'
sys.path.insert(0, str(HERE / 'Hunyuan3D-2'))   # repo cloned by the setup script

PROMPT_SUFFIX = ', single object, centered, full object in view, three-quarter view, soft studio lighting, plain white background, highly detailed, realistic materials, photorealistic'
_P = {}   # loaded pipelines (kept in memory by the server)


def vram_gb():
    import torch
    return torch.cuda.get_device_properties(0).total_memory / 2 ** 30 if torch.cuda.is_available() else 0.0


def check():
    try:
        import torch
    except ImportError:
        print('torch missing: run the setup script'); return 1
    print('CUDA:', torch.cuda.is_available(), '| GPU:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else '-', '| VRAM: %.1f GB' % vram_gb())
    try:
        import hy3dgen  # noqa: F401
        print('Hunyuan3D-2: installed')
    except ImportError:
        print('Hunyuan3D-2: missing (run the setup script)'); return 1
    try:
        from hy3dgen.texgen import Hunyuan3DPaintPipeline  # noqa: F401
        print('Texture painter: available')
    except Exception as e:
        print('Texture painter: unavailable (%s) -> models will be untextured' % e)
    return 0


def pipe(name, quality='fast'):
    """Lazy-load and cache each pipeline."""
    key = name + ':' + quality
    if key in _P:
        return _P[key]
    import torch
    if name == 't2i':
        from hy3dgen.text2image import HunyuanDiTPipeline
        _P[key] = HunyuanDiTPipeline('Tencent-Hunyuan/HunyuanDiT-v1.1-Diffusers-Distilled')
    elif name == 'rembg':
        from hy3dgen.rembg import BackgroundRemover
        _P[key] = BackgroundRemover()
    elif name == 'shape':
        from hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline
        if quality == 'high':
            _P[key] = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained('tencent/Hunyuan3D-2', subfolder='hunyuan3d-dit-v2-0', use_safetensors=True)
        else:
            _P[key] = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained('tencent/Hunyuan3D-2mini', subfolder='hunyuan3d-dit-v2-mini', use_safetensors=True)
    elif name == 'paint':
        from hy3dgen.texgen import Hunyuan3DPaintPipeline
        p = Hunyuan3DPaintPipeline.from_pretrained('tencent/Hunyuan3D-2')
        if vram_gb() < 16 and hasattr(p, 'enable_model_cpu_offload'):
            p.enable_model_cpu_offload()   # fits smaller GPUs, slower
        _P[key] = p
    return _P[key]


def slug(s):
    return re.sub(r'[^a-z0-9]+', '_', s.lower()).strip('_')[:40] or 'model'


def load_catalog():
    try:
        return json.loads(CATALOG.read_text(encoding='utf-8'))
    except Exception:
        return {'models': {}}


def generate(prompt=None, image=None, mid=None, height=1.0, quality='fast', texture=True, seed=1234, faces=40000, log=print):
    """prompt and/or image (PIL or path) -> assets/models/<id>.glb. Returns the catalog entry."""
    import torch, trimesh
    from PIL import Image
    from hy3dgen.shapegen import FaceReducer, FloaterRemover, DegenerateFaceRemover
    MODELS.mkdir(parents=True, exist_ok=True); (MODELS / 'thumbs').mkdir(exist_ok=True)
    mid = slug(mid or prompt or 'model'); t0 = time.time()
    if image is None:
        if not prompt:
            raise ValueError('give a prompt or an image')
        log('1/4 drawing the reference image…')
        image = pipe('t2i')(prompt + PROMPT_SUFFIX)
    elif isinstance(image, (str, Path)):
        image = Image.open(image)
    image = image.convert('RGBA')
    log('2/4 cutting out the object…')
    image = pipe('rembg')(image)
    image.save(MODELS / 'thumbs' / (mid + '.png'))
    log('3/4 sculpting the 3D shape…')
    mesh = pipe('shape', quality)(image=image, num_inference_steps=30 if quality == 'high' else 25, octree_resolution=380 if quality == 'high' else 256,
                                  num_chunks=20000, generator=torch.manual_seed(seed), output_type='trimesh')[0]
    mesh = FloaterRemover()(mesh); mesh = DegenerateFaceRemover()(mesh); mesh = FaceReducer()(mesh, max_facenum=faces)
    textured = False
    if texture:
        try:
            log('4/4 painting textures…')
            mesh = pipe('paint')(mesh, image=image); textured = True
        except Exception as e:
            log('texture painting failed (%s); keeping the untextured model' % e)
    # stand it on the ground (y=0), centered, real-world height in metres
    if isinstance(mesh, trimesh.Scene):
        mesh = mesh.dump(concatenate=True)
    lo, hi = mesh.bounds
    mesh.apply_translation([-(lo[0] + hi[0]) / 2, -lo[1], -(lo[2] + hi[2]) / 2])
    size = (hi - lo)[1] or 1.0
    mesh.apply_scale(float(height) / size)
    out = MODELS / (mid + '.glb'); mesh.export(out)
    cat = load_catalog()
    entry = {'name': (prompt or mid).strip()[:80], 'prompt': prompt, 'height': float(height), 'textured': textured, 'quality': quality,
             'engine': 'Hunyuan3D-2' + ('' if quality == 'high' else 'mini'), 'created': time.strftime('%Y-%m-%d %H:%M'), 'seconds': round(time.time() - t0)}
    cat.setdefault('models', {})[mid] = entry
    CATALOG.write_text(json.dumps(cat, indent=1), encoding='utf-8')
    log('done: %s (%ds)' % (out, entry['seconds']))
    return {'id': mid, **entry}


def publish(msg='Model Forge: new models'):
    """Commit + push new models so every Claude session (and the cloud renders) can use them."""
    subprocess.run(['git', 'add', 'assets/models'], cwd=ROOT, check=False)
    subprocess.run(['git', 'commit', '-m', msg], cwd=ROOT, check=False)
    return subprocess.run(['git', 'push'], cwd=ROOT, check=False).returncode == 0


# ---------------- local web UI ----------------
JOBS, LOCK = {}, threading.Lock()


def serve(port=7861):
    from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
    from PIL import Image

    def worker(jid, body):
        def log(m):
            JOBS[jid]['log'].append(m)
        try:
            img = None
            if body.get('image'):
                img = Image.open(io.BytesIO(base64.b64decode(body['image'].split(',')[-1])))
            with LOCK:   # one GPU job at a time
                JOBS[jid]['result'] = generate(body.get('prompt') or None, img, body.get('id'), float(body.get('height') or 1), body.get('quality', 'fast'), body.get('texture', True), int(body.get('seed') or 1234), log=log)
            JOBS[jid]['status'] = 'done'
        except Exception as e:
            JOBS[jid]['status'] = 'error'; JOBS[jid]['log'].append('error: %s' % e); traceback.print_exc()

    class H(BaseHTTPRequestHandler):
        def _send(self, code, data, ctype='application/json'):
            b = data if isinstance(data, bytes) else json.dumps(data).encode()
            self.send_response(code); self.send_header('Content-Type', ctype); self.send_header('Content-Length', str(len(b))); self.end_headers(); self.wfile.write(b)

        def do_GET(self):
            p = self.path.split('?')[0]
            if p in ('/', '/index.html'):
                return self._send(200, (HERE / 'ui.html').read_bytes(), 'text/html; charset=utf-8')
            if p == '/catalog':
                return self._send(200, load_catalog())
            if p.startswith('/job/'):
                return self._send(200, JOBS.get(p[5:], {'status': 'unknown', 'log': []}))
            if p.startswith('/models/'):
                f = (MODELS / p[8:]).resolve()
                if MODELS.resolve() in f.parents and f.exists():
                    return self._send(200, f.read_bytes(), 'model/gltf-binary' if f.suffix == '.glb' else 'image/png')
            self._send(404, {'error': 'not found'})

        def do_POST(self):
            body = json.loads(self.rfile.read(int(self.headers.get('Content-Length', 0))) or b'{}')
            if self.path == '/generate':
                jid = str(int(time.time() * 1000)); JOBS[jid] = {'status': 'running', 'log': []}
                threading.Thread(target=worker, args=(jid, body), daemon=True).start()
                return self._send(200, {'job': jid})
            if self.path == '/publish':
                return self._send(200, {'ok': publish()})
            self._send(404, {'error': 'not found'})

        def log_message(self, *a):
            pass

    print('Model Forge UI: http://localhost:%d' % port)
    ThreadingHTTPServer(('127.0.0.1', port), H).serve_forever()


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description='Model Forge: AI 3D models for Motion Forge')
    ap.add_argument('prompt', nargs='?')
    ap.add_argument('--image'); ap.add_argument('--id'); ap.add_argument('--height', type=float, default=1.0)
    ap.add_argument('--quality', choices=['fast', 'high'], default='fast'); ap.add_argument('--no-texture', action='store_true')
    ap.add_argument('--seed', type=int, default=1234); ap.add_argument('--faces', type=int, default=40000)
    ap.add_argument('--serve', action='store_true'); ap.add_argument('--port', type=int, default=7861)
    ap.add_argument('--check', action='store_true'); ap.add_argument('--publish', action='store_true')
    a = ap.parse_args()
    if a.check:
        sys.exit(check())
    if a.serve:
        serve(a.port)
    elif a.prompt or a.image:
        r = generate(a.prompt, a.image, a.id, a.height, a.quality, not a.no_texture, a.seed, a.faces)
        print(json.dumps(r))
        if a.publish:
            publish('Model Forge: ' + r['id'])
    else:
        ap.print_help()
