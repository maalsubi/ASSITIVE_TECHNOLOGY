"""Build a grouped web GLB and studio preview from all 98 source watch solids."""
import bpy
import json
from pathlib import Path
from mathutils import Vector

root = Path(__file__).resolve().parents[2]
meshdir = root / "blender/cad/watch-meshes"
manifest = json.loads((meshdir / "manifest.json").read_text())
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

def material(name, color, metal=0.1, rough=0.5):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Metallic"].default_value = metal
    bsdf.inputs["Roughness"].default_value = rough
    return mat

shell = material("STEP enclosure / graphite", (.055, .065, .075), .22, .38)
form = material("STEP board mounted form / graphite", (.035, .04, .045), .08, .68)
board = material("STEP PCB / blue", (.025, .11, .19), .14, .52)
metal = material("STEP large visible detail / metal", (.34, .39, .43), .65, .32)
details = material("STEP electronics / dark", (.035, .045, .05), .2, .52)

groups = manifest["webGrouping"]
index_group = {index: name for name, ids in groups.items() for index in ids}
objects = []
for i in range(manifest["solidCount"]):
    if str(i) in manifest["duplicateSourceSolids"]:
        continue
    bpy.ops.wm.stl_import(filepath=str(meshdir / f"solid-{i:03}.stl"))
    obj = bpy.context.object
    obj.name = f"STEP watch solid {i:03}"
    obj.scale = (.01, .01, .01)
    obj.data.materials.clear()
    group = index_group[i]
    obj.data.materials.append(board if group == "board" else form if group == "board-mounted-form" else shell if group == "enclosure" else metal if group.startswith("large") else details)
    objects.append(obj)

bpy.context.view_layer.update()
low = Vector((1e9, 1e9, 1e9))
high = Vector((-1e9, -1e9, -1e9))
for obj in objects:
    for corner in obj.bound_box:
        point = obj.matrix_world @ Vector(corner)
        low = Vector(min(low[j], point[j]) for j in range(3))
        high = Vector(max(high[j], point[j]) for j in range(3))
center = (low + high) / 2
for obj in objects:
    obj.location -= center

for name, ids in groups.items():
    if len(ids) == 1:
        bpy.data.objects[f"STEP watch solid {ids[0]:03}"].name = f"WATCH {name}"
        continue
    bpy.ops.object.select_all(action="DESELECT")
    selected = [bpy.data.objects[f"STEP watch solid {i:03}"] for i in ids]
    for obj in selected:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = selected[0]
    bpy.ops.object.join()
    selected[0].name = f"WATCH {name}"

bpy.context.view_layer.update()
web_objects = [obj for obj in bpy.data.objects if obj.type == "MESH"]
assert len(web_objects) == len(groups), len(web_objects)
bpy.ops.object.select_all(action="DESELECT")
for obj in web_objects:
    obj.select_set(True)
bpy.ops.export_scene.gltf(
    filepath=str(root / "client/public/assets/tsi-watch-cad.glb"),
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_yup=True,
)

def area(location, power, size, color):
    bpy.ops.object.light_add(type="AREA", location=location)
    obj = bpy.context.object
    obj.data.energy = power
    obj.data.shape = "DISK"
    obj.data.size = size
    obj.data.color = color
    obj.rotation_euler = (-obj.location).to_track_quat("-Z", "Y").to_euler()

area((1.6, -2.2, 2.8), 650, 3.5, (1, 1, 1))
area((-1.8, 1.6, 2.1), 420, 2.5, (1, .22, .25))
area((2.1, 1.4, .8), 280, 2.4, (.5, .7, 1))
bpy.ops.object.camera_add(location=(1.4, -2.1, 1.3))
camera = bpy.context.object
camera.rotation_euler = (-camera.location).to_track_quat("-Z", "Y").to_euler()
camera.data.type = "ORTHO"
camera.data.ortho_scale = 1.4
scene = bpy.context.scene
scene.camera = camera
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = str(root / "client/public/assets/tsi-watch-cad-preview.png")
scene.world.color = (.018, .018, .022)
scene.view_settings.view_transform = "AgX"
bpy.ops.wm.save_as_mainfile(filepath=str(root / "blender/watch-cad-product.blend"))
bpy.ops.render.render(write_still=True)
print("SOURCE BOUNDS", tuple(low), tuple(high), "CENTER", tuple(center), flush=True)
print("WEB PARTS", [obj.name for obj in web_objects], flush=True)
