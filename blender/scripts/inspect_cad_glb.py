import bpy
from mathutils import Vector

bpy.ops.import_scene.gltf(filepath='/Users/maal/M.Tech/TechoSpark/client/public/assets/tsi-rev3-cad.glb')
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        bounds = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
        lo = tuple(round(min(v[i] for v in bounds), 4) for i in range(3))
        hi = tuple(round(max(v[i] for v in bounds), 4) for i in range(3))
        print('CAD', obj.name, len(obj.data.vertices), 'bounds', lo, hi)
