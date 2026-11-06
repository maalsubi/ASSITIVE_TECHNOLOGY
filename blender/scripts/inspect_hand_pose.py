import bpy
import os
from mathutils import Vector
bpy.ops.import_scene.gltf(filepath=os.environ.get('TSI_HUMAN_FILE','/Users/maal/M.Tech/TechoSpark/blender/models/innerscene-sam-walk.glb'))
rig=bpy.data.objects['Sam | anatomical body.rig']
for frame in (1, 9, 13, 24):
    bpy.context.scene.frame_set(frame)
    bpy.context.view_layer.update()
    print('FRAME',frame)
    for name in ('hand_r','index_01_r','index_02_r','middle_01_r','middle_02_r','thumb_01_r','thumb_02_r','hand_l','foot_l','foot_r'):
        p=rig.pose.bones[name]
        a=rig.matrix_world@p.head
        b=rig.matrix_world@p.tail
        print(name,'head',tuple(round(v,3) for v in a),'tail',tuple(round(v,3) for v in b),'mode',p.rotation_mode,'quat',tuple(round(v,3) for v in p.rotation_quaternion))
