---
name: 3d-visuals
description: Build high-quality real-time 3D visuals with Three.js (or React Three Fiber) — scenes, hero renders, product shots, stylized worlds, shaders, particles and post-processing. Use when the user asks for 3D, a 3D scene, WebGL, Three.js, a 3D model/render, or a 3D effect.
---

> **Tool policy:** Use only built-in tools — Three.js/HTML/JS in the user's Chrome, Node, ffmpeg. The scripts auto-download what they need (playwright-core, ffmpeg) on first run — don't install these by hand. **Do NOT install or run Blender or Python** (no `pip`, no `bpy`, no `blender`) unless the user has explicitly said "Blender/Python allowed" in this conversation.
> **Efficiency:** Work silently — batch tool calls, no narration, no recaps. Preview at 540p / few frames (internal checks only). Final output is never below Good (1080×1920 @30fps) — the quality and effort level were asked at the start of the video (hooks/context.md). Message the user only when done or truly blocked. Before delivering, run the `quality-review` skill.


> **Reference images are for STUDY ONLY.** Never use a reference image (or a crop of it) as a texture,
> decal, shirt print, poster, background plate or any other image inside the scene, and never copy
> text, logos or names from it onto clothing or props. Recreate the *look* from scratch with
> materials, colors, lighting and shapes. Clothing = plain solid colors (or a simple original
> pattern) unless the user explicitly asks for a print.

# 3D Visuals

Default stack: single-file HTML + Three.js from a pinned CDN via importmap
(`https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js` and
`.../examples/jsm/`). Use R3F only if the project already uses React.

**First:** check `.motion-forge/styles/` for a style bible and follow it.

## Quality checklist (what separates pro from amateur)
1. **Color management**: `renderer.outputColorSpace = SRGBColorSpace`,
   `toneMapping = ACESFilmicToneMapping` (or AgX), tune `toneMappingExposure`.
2. **Lighting = 3 layers**: environment (`RoomEnvironment` via `PMREMGenerator`) for
   reflections + key light with soft shadows (`PCFSoftShadowMap`, shadow.radius, bias
   -0.0005) + rim light to separate silhouette. Never rely on AmbientLight alone.
3. **Materials**: `MeshStandardMaterial`/`MeshPhysicalMaterial`. Nothing is roughness 0 or
   1 — use 0.15–0.85. Add `clearcoat`, `sheen`, `transmission` where justified.
4. **Bevels catch light**: use `RoundedBoxGeometry`, `ExtrudeGeometry` with bevel. Hard
   90° edges look CG.
5. **Grounding**: contact shadow (shadow-catcher plane with `ShadowMaterial`) so objects
   don't float.
6. **Depth**: fog matching background, atmospheric perspective, foreground/mid/back layers.
7. **Post-processing** (`EffectComposer`): `RenderPass` → `UnrealBloomPass` (low strength,
   high threshold) → `OutputPass`. Optional: SMAA, vignette, subtle film grain via shader.
8. **Camera**: fov 30–45 for product/hero (less distortion), 60+ for immersive. Add subtle
   idle drift (sin-based, 0.5–2% of distance) so the frame breathes.
9. **Performance**: `setPixelRatio(Math.min(devicePixelRatio, 2))`, instancing for
   repeats (`InstancedMesh`), dispose on teardown, resize handler.
10. **Deterministic time**: drive all motion from one `t` (seconds) so
    `scripts/render_video.js` can render it frame-perfect. Expose:
    ```js
    window.__mf = { duration: 6, fps: 60, render: (t) => { update(t); composer.render(); } };
    ```
    In the live loop call `__mf.render(clock.getElapsedTime() % __mf.duration)`.

## Procedural toolbox
- Custom shaders: `onBeforeCompile` to patch standard materials (keeps PBR lighting).
- Noise: write a small simplex/fbm in GLSL for terrain, displacement, flowing gradients.
- Particles: `Points` + custom `ShaderMaterial`, size attenuation, additive blending.
- Models: `GLTFLoader` (+ `DRACOLoader`) for user assets; center & scale with `Box3`.

## Verify
Screenshot with Playwright (Chromium is preinstalled) at a few times `t`, view the PNGs
with Read, and critique: silhouette, value contrast, focal point, noise/aliasing.
Iterate at least once before showing the user.
