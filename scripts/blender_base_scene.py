"""Base scene for clean semi-real CG shorts. Run: blender -b -P blender_base_scene.py -- [--out DIR] [--character model.fbx|.glb] [--frames 1-120]
Sets up Cycles, AgX, 9:16 camera, soft key/fill/rim lights, gradient cyclorama backdrop.
Import or build characters after this (or pass --character)."""
import bpy, sys, os, math

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
def opt(name, default=None):
    return argv[argv.index(name) + 1] if name in argv else default

out = opt("--out", "//renders/")
character = opt("--character")
frames = opt("--frames", "1-1")

bpy.ops.wm.read_factory_settings(use_empty=True)
scn = bpy.context.scene
scn.render.engine = "CYCLES"
scn.cycles.samples = 192
scn.cycles.use_denoising = True
scn.render.resolution_x, scn.render.resolution_y = 1080, 1920
scn.render.fps = 30
scn.render.use_motion_blur = True
scn.view_settings.view_transform = "AgX"
scn.view_settings.look = "AgX - Medium High Contrast"
f0, f1 = (int(x) for x in frames.split("-"))
scn.frame_start, scn.frame_end = f0, f1

# World: soft blue ambient
world = bpy.data.worlds.new("World"); scn.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.35, 0.6, 0.8, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.3

# Cyclorama backdrop (curved floor->wall) with vertical gradient
bpy.ops.mesh.primitive_plane_add(size=1)
cyc = bpy.context.object; cyc.name = "Cyclorama"
cyc.scale = (12, 12, 1)
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.subdivide(number_cuts=24)
bpy.ops.object.mode_set(mode="OBJECT")
for v in cyc.data.vertices:
    y = v.co.y * 12
    if y > 1.5:  # bend back half upward
        a = min((y - 1.5) / 3.0, 1.0) * math.pi / 2
        r = 3.0
        v.co.y = (1.5 + r * math.sin(a) + max(0, y - 4.5) * 0) / 12
        v.co.z = (r - r * math.cos(a) + max(0, y - 4.5)) / 12 * 12 / 1
bpy.ops.object.shade_smooth()
mat = bpy.data.materials.new("CycMat"); mat.use_nodes = True
nt = mat.node_tree; bsdf = nt.nodes["Principled BSDF"]
bsdf.inputs["Roughness"].default_value = 0.8
tex = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ")
ramp = nt.nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].color = (0.45, 0.78, 0.93, 1)   # light cyan floor
ramp.color_ramp.elements[1].color = (0.05, 0.38, 0.68, 1)   # deeper blue top
ramp.color_ramp.elements[1].position = 0.9
nt.links.new(tex.outputs["Generated"], sep.inputs[0])
nt.links.new(sep.outputs["Z"], ramp.inputs[0])
nt.links.new(ramp.outputs[0], bsdf.inputs["Base Color"])
cyc.data.materials.append(mat)

def area(name, loc, rot, energy, size, color):
    bpy.ops.object.light_add(type="AREA", location=loc, rotation=[math.radians(r) for r in rot])
    l = bpy.context.object; l.name = name
    l.data.energy, l.data.size, l.data.color = energy, size, color
    return l

area("Key", (2.2, -2.5, 2.6), (55, 0, 40), 600, 2.5, (1.0, 0.97, 0.93))
area("Fill", (-2.8, -2.0, 1.6), (70, 0, -55), 180, 3.0, (0.9, 0.95, 1.0))
area("Rim", (-1.2, 2.2, 2.4), (-60, 0, -150), 400, 1.0, (0.7, 0.85, 1.0))

bpy.ops.object.camera_add(location=(0, -5.2, 1.0), rotation=(math.radians(90), 0, 0))
cam = bpy.context.object; scn.camera = cam
cam.data.lens = 50
cam.data.dof.use_dof = True
cam.data.dof.aperture_fstop = 4.0
cam.data.dof.focus_distance = 5.2

if character and os.path.exists(character):
    ext = os.path.splitext(character)[1].lower()
    if ext == ".fbx":
        bpy.ops.import_scene.fbx(filepath=character)
    elif ext in (".glb", ".gltf"):
        bpy.ops.import_scene.gltf(filepath=character)
    elif ext == ".obj":
        bpy.ops.wm.obj_import(filepath=character)

scn.render.filepath = os.path.join(out, "frame_")
if "--render" in argv:
    bpy.ops.render.render(animation=(f1 > f0), write_still=(f1 == f0))
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(os.path.join(bpy.path.abspath(out), "base_scene.blend")))
