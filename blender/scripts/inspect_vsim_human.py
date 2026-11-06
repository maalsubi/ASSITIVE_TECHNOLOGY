import bpy
import os
from mathutils import Vector

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=os.environ.get('TSI_HUMAN_FILE', '/Users/maal/M.Tech/TechoSpark/blender/models/vsim-human.glb'))
for obj in bpy.data.objects:
    print('OBJECT', obj.name, obj.type, 'dimensions', tuple(round(x, 3) for x in obj.dimensions))
    if obj.type == 'MESH':
        print('  VERTICES', len(obj.data.vertices), 'MATERIALS', [m.name for m in obj.data.materials])
    if obj.type == 'ARMATURE':
        print('  BONES', [(b.name, tuple(round(x, 3) for x in b.head_local)) for b in obj.data.bones])
print('ACTIONS', [(a.name, int(a.frame_range[0]), int(a.frame_range[1])) for a in bpy.data.actions])
print('ANIMATIONS', [(o.name, o.animation_data.action.name if o.animation_data and o.animation_data.action else None) for o in bpy.data.objects])

# A neutral visual check catches mesh, clothing and material issues before site integration.
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 24
scene.render.resolution_x = 900
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'AgX'
scene.frame_set(1)
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        for mat in obj.data.materials:
            if mat:
                mat.diffuse_color[3] = 1

bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, 0))
floor = bpy.context.object
floor.name = 'Inspection floor'
floor_mat = bpy.data.materials.new('Floor')
floor_mat.diffuse_color = (0.12, 0.13, 0.15, 1)
floor.data.materials.append(floor_mat)

def target_camera(location, target):
    bpy.ops.object.camera_add(location=location)
    camera = bpy.context.object
    camera.rotation_euler = (Vector(target) - camera.location).to_track_quat('-Z', 'Y').to_euler()
    scene.camera = camera
    return camera

target_camera((3, -5, 2.2), (0, 0, 1))
def area(name, location, energy, size):
    data = bpy.data.lights.new(name, 'AREA')
    data.energy = energy
    data.shape = 'DISK'
    data.size = size
    light = bpy.data.objects.new(name, data)
    scene.collection.objects.link(light)
    light.location = location
    light.rotation_euler = (Vector((0, 0, 1)) - light.location).to_track_quat('-Z', 'Y').to_euler()

area('Key', (3, -4, 5), 900, 4)
area('Fill', (-3, -2, 3), 400, 3)
scene.render.filepath = os.environ.get('TSI_INSPECTION_OUTPUT', '/Users/maal/M.Tech/TechoSpark/blender/renders/vsim-human-inspection.png')
bpy.ops.render.render(write_still=True)
