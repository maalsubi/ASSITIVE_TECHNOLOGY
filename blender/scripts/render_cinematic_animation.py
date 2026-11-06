"""Render a seven-scene concept film from the inspected TSI storyboard.

The physical junction between the STEP handle and shaft is illustrative until
its mounting CAD or measured assembly reference is supplied.
"""
import bpy
import math
import os
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'blender/renders/cinematic-frames'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(ROOT / 'blender/tsi-cinematic-storyboard.blend'))
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
rig = bpy.data.objects['Sam | anatomical body.rig']
camera = scene.camera
cad = bpy.data.objects['Actual TSI REV3 STEP-derived assembly']
shaft = bpy.data.objects['Illustrative walking shaft; junction unverified']
obstacle_l = bpy.data.objects['Left obstacle']
obstacle_r = bpy.data.objects['Right obstacle']
beam_l = bpy.data.objects['L alert path']
beam_r = bpy.data.objects['R alert path']
human = [o for o in bpy.data.objects if o.type == 'MESH' and o.name in {
    'eyebrow001', 'eyelashes01', 'Hairline | fine scalp roots', 'low-poly',
    'male_casualsuit02', 'Original skinned ankle lining l', 'Original skinned ankle lining r',
    'Sam | anatomical body', 'shoes01', 'short01', 'teeth_base'}]
watches = [
    tuple(bpy.data.objects[f'{side} {part}'] for part in ('watch enclosure', 'watch cover', 'woven strap'))
    for side in ('L', 'R')
]
glass_materials = []
for side, group in zip(('L', 'R'), watches):
    copy = group[1].data.materials[0].copy()
    copy.name = f'{side} watch active glass'
    group[1].data.materials[0] = copy
    glass_materials.append(copy)
haptic_rings = []
red_material = bpy.data.materials['TSI alert red']
for side in ('L', 'R'):
    bpy.ops.mesh.primitive_torus_add(major_radius=.07, minor_radius=.003, location=(0,0,0), rotation=(math.pi/2,0,0))
    ring = bpy.context.object
    ring.name = f'{side} haptic pulse ring'
    ring.data.materials.append(red_material)
    haptic_rings.append(ring)

def bone_point(name):
    return rig.matrix_world @ rig.pose.bones[name].head

def aim(position, target, scale):
    camera.location = position
    camera.rotation_euler = (Vector(target) - camera.location).to_track_quat('-Z', 'Y').to_euler()
    camera.data.ortho_scale = scale

def put_watch(group, side):
    point = bone_point(f'hand_{side}')
    enclosure, cover, strap = group
    enclosure.location = point + Vector((0, 0, .015))
    cover.location = enclosure.location + Vector((0, -.036, 0))
    strap.location = enclosure.location
    return point

def glow(mat, active):
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Emission Color'].default_value = (.8, .018, .035, 1) if active else (.02, .03, .04, 1)
    bsdf.inputs['Emission Strength'].default_value = 2.5 if active else 0

FRAMES_PER_SCENE = 24
only_scene = int(os.environ.get('TSI_ONLY_SCENE', '0'))
for scene_no in range(1, 8):
    if only_scene and scene_no != only_scene:
        continue
    for local_frame in range(FRAMES_PER_SCENE):
        phase = local_frame / (FRAMES_PER_SCENE - 1)
        if scene_no in (3, 4, 7):
            source_frame = 1 + int(phase * 40)
        else:
            source_frame = [1, 1, 9, 13, 15, 18, 24][scene_no - 1]
        scene.frame_set(source_frame)
        bpy.context.view_layer.update()
        hand = bone_point('hand_r')
        grip = hand + Vector((-.02, -.11, .02))
        shaft.location = (grip.x, grip.y, grip.z / 2)
        shaft.dimensions.z = max(.3, grip.z - .02)
        cad.location = grip
        left = put_watch(watches[0], 'l')
        right = put_watch(watches[1], 'r')
        for beam, target in ((beam_l, left), (beam_r, right)):
            beam.data.splines[0].points[0].co = (*grip, 1)
            beam.data.splines[0].points[1].co = (*target, 1)
        for obj in human:
            obj.hide_render = scene_no == 1
        for group in watches:
            for obj in group:
                obj.hide_render = scene_no == 1
        # Each third of scenes 4–6 presents left, right, and both-side input.
        direction = min(2, local_frame // 8)
        show_left = direction in (0, 2)
        show_right = direction in (1, 2)
        obstacle_l.hide_render = scene_no not in (4, 5, 6, 7) or (scene_no in (4, 5, 6) and not show_left)
        obstacle_r.hide_render = scene_no not in (4, 5, 6, 7) or (scene_no in (4, 5, 6) and not show_right)
        beam_l.hide_render = scene_no != 5 or not show_left
        beam_r.hide_render = scene_no != 5 or not show_right
        glow(glass_materials[0], scene_no == 6 and show_left)
        glow(glass_materials[1], scene_no == 6 and show_right)
        for i, ring in enumerate(haptic_rings):
            ring.location = watches[i][1].location + Vector((0, -.02, 0))
            ring.scale = (1 + .16 * math.sin(local_frame * 1.2),) * 3
            ring.hide_render = scene_no != 6 or not (show_left if i == 0 else show_right)
        drift = .08 * math.sin(phase * math.pi)
        if scene_no == 1:
            aim((1.45 + drift, -2.6, 1.7), (grip.x, grip.y, .8), 1.8)
        elif scene_no == 2:
            aim((1.8 + drift, -2.5, 1.7), (0, -.08, 1.15), 2.25)
        elif scene_no == 6:
            target = left if direction == 0 else right if direction == 1 else (left + right) / 2
            aim((target.x + 1.0 + drift, target.y - 1.5, target.z + .55), target, 1.25 if direction < 2 else 1.9)
        else:
            aim((2.8 + drift, -4.5, 2.15), (0, 0, .9), 4.2)
        global_frame = (scene_no - 1) * FRAMES_PER_SCENE + local_frame
        scene.render.filepath = str(OUT / f'frame-{global_frame:04d}.png')
        bpy.ops.render.render(write_still=True)
    print('SCENE COMPLETE', scene_no, flush=True)
