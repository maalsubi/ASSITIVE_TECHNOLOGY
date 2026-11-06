"""Seven inspected keyframes for the TSI human demonstration.

These are concept frames. The supplied STEP file does not establish a shaft
connector, sensor mounting point, or watch internals.
"""
import bpy
import math
import os
from pathlib import Path
from mathutils import Vector, Quaternion

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'blender/renders/cinematic-storyboard'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(ROOT / 'blender/models/innerscene-sam-carry.glb'))
rig = bpy.data.objects['Sam | anatomical body.rig']
human = [o for o in bpy.data.objects if o.type == 'MESH' and o.name not in {'Icosphere', 'Phone'}]
for unwanted in ('Icosphere', 'Phone'):
    o = bpy.data.objects.get(unwanted)
    if o:
        bpy.data.objects.remove(o, do_unlink=True)
bpy.ops.import_scene.gltf(filepath=str(ROOT / 'client/public/assets/tsi-rev3-cad.glb'))
cad = [o for o in bpy.data.objects if o.type == 'MESH' and o.name.startswith('STEP solid')]
cad_group = bpy.data.objects.new('Actual TSI REV3 STEP-derived assembly', None)
bpy.context.collection.objects.link(cad_group)
for obj in cad:
    obj.parent = cad_group
cad_group.scale = (.14, .14, .14)

def material(name, color, metallic=0, roughness=.5, emission=0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    if emission:
        bsdf.inputs['Emission Color'].default_value = (*color, 1)
        bsdf.inputs['Emission Strength'].default_value = emission
    return mat

dark = material('Deep charcoal', (.018, .022, .028), .25, .6)
shaft_mat = material('Anodized shaft', (.21, .24, .27), .75, .27)
red = material('TSI alert red', (.8, .018, .035), .3, .3, 1.8)
glass = material('Watch cover', (.13, .19, .22), .2, .17)
white = material('Floor charcoal', (.075, .085, .1), .05, .85)

def box(name, location, scale, mat, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    if bevel:
        mod = obj.modifiers.new('Soft edges', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        obj.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
    return obj

floor = box('Ground', (0, 0, -.04), (100, 100, .08), white)
obstacle_l = box('Left obstacle', (-1.3, -.5, .3), (.45, .6, .6), dark, .05)
obstacle_r = box('Right obstacle', (1.3, -.5, .3), (.45, .6, .6), dark, .05)
bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=.019, depth=1.05, location=(0, 0, .525))
shaft = bpy.context.object
shaft.name = 'Illustrative walking shaft; junction unverified'
shaft.data.materials.append(shaft_mat)
shaft.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')

watches = []
for side in ('l', 'r'):
    watch = box(f'{side.upper()} watch enclosure', (0,0,0), (.095, .065, .042), dark, .01)
    cover = box(f'{side.upper()} watch cover', (0,0,0), (.078, .053, .004), glass, .002)
    strap = box(f'{side.upper()} woven strap', (0,0,0), (.055, .15, .012), dark, .005)
    watches.append((watch, cover, strap))

beams = []
for side in ('l', 'r'):
    curve = bpy.data.curves.new(f'{side} directional signal', 'CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = .004
    curve.bevel_resolution = 2
    spline = curve.splines.new('POLY')
    spline.points.add(1)
    beam = bpy.data.objects.new(f'{side.upper()} alert path', curve)
    bpy.context.collection.objects.link(beam)
    curve.materials.append(red)
    beams.append(beam)

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.view_settings.view_transform = 'AgX'
scene.world.color = (.07, .08, .09)

def light(name, position, power, size, color):
    data = bpy.data.lights.new(name, 'AREA')
    data.energy = power
    data.shape = 'DISK'
    data.size = size
    data.color = color
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = position
    obj.rotation_euler = (Vector((0, 0, 1)) - obj.location).to_track_quat('-Z', 'Y').to_euler()

light('Key softbox', (2, -4, 5), 850, 4, (1, 1, 1))
light('Cool fill', (-4, -2, 3), 500, 3, (.63, .75, 1))
light('Red rim', (1, 3, 4), 350, 3, (1, .08, .1))
bpy.ops.object.camera_add(location=(2.7, -4.5, 2.1))
camera = bpy.context.object
scene.camera = camera
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 3

def aim(position, target, scale):
    camera.location = position
    camera.rotation_euler = (Vector(target) - camera.location).to_track_quat('-Z', 'Y').to_euler()
    camera.data.ortho_scale = scale

def bone_point(name):
    pose_bone = rig.pose.bones[name]
    return rig.matrix_world @ pose_bone.head

def put_watch(group, side):
    point = bone_point(f'hand_{side}')
    enclosure, cover, strap = group
    enclosure.location = point + Vector((0, 0, .015))
    cover.location = enclosure.location + Vector((0, -.036, 0))
    strap.location = enclosure.location + Vector((0, 0, 0))
    return point

only_scene = int(os.environ.get('TSI_ONLY_SCENE', '0'))
curl_axis = os.environ.get('TSI_CURL_AXIS', '')
for index in range(1, 8):
    if only_scene and index != only_scene:
        continue
    frame = [1, 1, 9, 13, 15, 18, 24][index - 1]
    scene.frame_set(frame)
    if curl_axis:
        axis = Vector({'X': (1,0,0), 'Y': (0,1,0), 'Z': (0,0,1)}[curl_axis])
        for finger in ('index', 'middle', 'ring', 'pinky'):
            for segment, amount in ((1, .35), (2, .75), (3, .8)):
                pbone = rig.pose.bones[f'{finger}_0{segment}_r']
                pbone.rotation_quaternion = pbone.rotation_quaternion @ Quaternion(axis, amount)
        for segment, amount in ((1, -.25), (2, -.45), (3, -.35)):
            pbone = rig.pose.bones[f'thumb_0{segment}_r']
            pbone.rotation_quaternion = pbone.rotation_quaternion @ Quaternion(axis, amount)
    bpy.context.view_layer.update()
    hand = bone_point('hand_r')
    grip = hand + Vector((-.02, -.11, .02))
    shaft.location = (grip.x, grip.y, grip.z / 2)
    shaft.dimensions.z = max(.3, grip.z - .02)
    cad_group.location = grip
    left_pt = put_watch(watches[0], 'l')
    right_pt = put_watch(watches[1], 'r')
    for beam, target in zip(beams, (left_pt, right_pt)):
        beam.data.splines[0].points[0].co = (*grip, 1)
        beam.data.splines[0].points[1].co = (*target, 1)
    for obj in human:
        obj.hide_render = index == 1
    for group in watches:
        for obj in group:
            obj.hide_render = index == 1
    obstacle_l.hide_render = index not in (4, 5, 6, 7)
    obstacle_r.hide_render = index not in (4, 5, 6, 7)
    beams[0].hide_render = index not in (5, 6)
    beams[1].hide_render = index not in (5, 6)
    if index == 1:
        aim((1.5, -2.6, 1.7), (grip.x, grip.y, .8), 1.75)
    elif index == 2:
        aim((1.9, -2.5, 1.7), (0, -.08, 1.15), 2.2)
    elif index == 6:
        aim((1.4, -2.2, 1.6), (0, -.1, 1.0), 2.2)
    else:
        aim((2.8, -4.5, 2.15), (0, 0, .9), 4.2)
    suffix = f'-{curl_axis.lower()}' if curl_axis else ''
    scene.render.filepath = str(OUT / f'scene-{index:02d}{suffix}.png')
    if index == 1 and not only_scene:
        bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / 'blender/tsi-cinematic-storyboard.blend'))
    bpy.ops.render.render(write_still=True)
    print('RENDERED', index, scene.render.filepath)
