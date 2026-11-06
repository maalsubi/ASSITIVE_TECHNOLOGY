import bpy
from pathlib import Path
root=Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(root/'blender/cad-product.blend'))
for o in list(bpy.data.objects):
 if o.type!='MESH':bpy.data.objects.remove(o,do_unlink=True)
for o in bpy.data.objects:
 if o.type=='MESH':
  o.select_set(True)
  print(o.name,tuple(round(x,3) for x in o.dimensions))
bpy.ops.export_scene.gltf(filepath=str(root/'client/public/assets/tsi-rev3-cad.glb'),export_format='GLB',use_selection=True,export_apply=True,export_yup=True)
