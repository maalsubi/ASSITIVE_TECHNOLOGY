"""Render a looping turntable from the six STEP-derived solids."""
import bpy
import math
from pathlib import Path

root = Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(root / "blender/cad-product.blend"))
scene = bpy.context.scene
for name, color in (("CAD shell graphite", (0.008, 0.011, 0.016)), ("CAD rear shell", (0.014, 0.018, 0.024))):
    material = bpy.data.materials.get(name)
    if material:
        material.diffuse_color = (*color, 1)
        shader = material.node_tree.nodes["Principled BSDF"]
        shader.inputs["Base Color"].default_value = (*color, 1)
        shader.inputs["Alpha"].default_value = 1
for light in (o for o in scene.objects if o.type == "LIGHT"):
    if light.data.color.g < 0.5:
        light.data.color = (0.7, 0.82, 1)
        light.data.energy = 240
turntable = bpy.data.objects.new("TSI REV3 turntable animation", None)
scene.collection.objects.link(turntable)
for obj in scene.objects:
    if obj.type == "MESH":
        obj.parent = turntable

for name, lift in (("STEP solid 311", 0.48), ("STEP solid 000", 0.22), ("STEP solid electronics", 0.28), ("STEP solid 312", 0.27), ("STEP solid 313", 0.25)):
    part = bpy.data.objects.get(name)
    if part is None:
        continue
    z = part.location.z
    for frame, elevation in ((1, 0), (17, 0), (35, lift), (49, lift), (67, 0), (73, 0)):
        part.location.z = z + elevation
        part.keyframe_insert(data_path="location", frame=frame)

scene.frame_start = 1
scene.frame_end = 72
turntable.rotation_euler.z = 0
turntable.keyframe_insert(data_path="rotation_euler", frame=1)
turntable.rotation_euler.z = math.tau
turntable.keyframe_insert(data_path="rotation_euler", frame=73)
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 960
scene.render.resolution_y = 540
scene.render.resolution_percentage = 100
scene.render.fps = 24
scene.render.image_settings.color_mode = "RGB"
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = str(root / "blender/renders/turntable/frame-")
(root / "blender/renders/turntable").mkdir(parents=True, exist_ok=True)
scene.camera.data.ortho_scale = 3.0
scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=str(root / "blender/cad-turntable.blend"))
bpy.ops.render.render(animation=True)
