"""Render transparent hero images from the editable STEP-derived Blender scenes."""
import bpy
from pathlib import Path

root = Path(__file__).resolve().parents[2]
for scene_file, output in (
    ("cad-product.blend", "tsi-module-hero.png"),
    ("watch-cad-product.blend", "tsi-watch-hero.png"),
):
    bpy.ops.wm.open_mainfile(filepath=str(root / "blender" / scene_file))
    scene = bpy.context.scene
    for material in bpy.data.materials:
        if not material.use_nodes:
            continue
        bsdf = material.node_tree.nodes.get("Principled BSDF")
        if not bsdf:
            continue
        if "shell" in material.name.lower() or "enclosure" in material.name.lower():
            bsdf.inputs["Base Color"].default_value = (.045, .055, .068, 1)
            bsdf.inputs["Alpha"].default_value = 1
    for obj in bpy.data.objects:
        if obj.type == "LIGHT" and obj.data.type == "AREA" and obj.data.color.g < .35:
            obj.data.energy *= .3
            obj.data.color = (1, .55, .58)
    scene.render.film_transparent = True
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.filepath = str(root / "client/public/assets" / output)
    bpy.ops.render.render(write_still=True)
    print("RENDERED", output, flush=True)
