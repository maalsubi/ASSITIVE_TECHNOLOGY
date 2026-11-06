import bpy,math,json
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[2]; meshdir=root/'blender/cad/meshes'
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def material(name,c,metal=.15,rough=.4,alpha=1):
 m=bpy.data.materials.new(name);m.diffuse_color=(*c,alpha);m.use_nodes=True;bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*c,alpha);bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough
 if alpha<1: m.surface_render_method='DITHERED';bs.inputs['Alpha'].default_value=alpha
 return m
shell=material('CAD shell graphite',(.055,.065,.075),.25,.42);inner=material('CAD rear shell',(.08,.09,.1),.28,.46,.45);board=material('PCB teal',(.025,.16,.18),.22,.5);metal=material('Machined metal',(.46,.51,.55),.75,.28);electronics=material('CAD electronic details',(.025,.03,.035),.2,.55)
indices=json.loads((meshdir/'manifest.json').read_text())['exported']
for i in indices:
 mat=board if i in (0,309) else shell if i==310 else inner if i==311 else metal if i in (312,313) else electronics
 bpy.ops.wm.stl_import(filepath=str(meshdir/f'solid-{i:03}.stl'))
 o=bpy.context.object;o.name=f'STEP solid {i:03}';o.scale=(.01,.01,.01);bpy.context.view_layer.update();o.data.materials.clear();o.data.materials.append(mat)
# CAD coordinates are retained in object geometry and a single presentation parent centers the assembly.
objects=[o for o in bpy.context.scene.objects if o.type=='MESH'];lo=Vector((1e9,)*3);hi=Vector((-1e9,)*3)
for o in objects:
 for corner in o.bound_box:
  v=o.matrix_world@Vector(corner);lo=Vector((min(lo[j],v[j]) for j in range(3)));hi=Vector((max(hi[j],v[j]) for j in range(3)))
center=(lo+hi)/2
for o in objects:o.location-=center
details=[o for o in objects if o.name.startswith('STEP solid ') and o.name[-3:].isdigit() and 1<=int(o.name[-3:])<=308]
if details:
 bpy.ops.object.select_all(action='DESELECT')
 for o in details:o.select_set(True)
 bpy.context.view_layer.objects.active=details[0]
 bpy.ops.object.join()
 details[0].name='STEP solid electronics'
 bpy.ops.object.select_all(action='DESELECT')
print('bounds',tuple(lo),tuple(hi),'center',tuple(center))
def area(loc,power,size,color):
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.data.color=color;o.rotation_euler=(-o.location).to_track_quat('-Z','Y').to_euler()
area((1,-3,4),650,4,(1,1,1));area((-2,2,3),450,3,(1,.2,.23));area((3,2,1),300,3,(.5,.7,1))
bpy.ops.object.camera_add(location=(2.2,-3.5,2.4));cam=bpy.context.object;cam.rotation_euler=(-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=3.1;bpy.context.scene.camera=cam
sc=bpy.context.scene;sc.render.engine='BLENDER_EEVEE';sc.render.resolution_x=1280;sc.render.resolution_y=720;sc.render.resolution_percentage=100;sc.render.image_settings.file_format='PNG';sc.render.filepath=str(root/'blender/renders/cad-preview.png');sc.world.color=(.02,.02,.025);sc.view_settings.view_transform='AgX'
bpy.ops.wm.save_as_mainfile(filepath=str(root/'blender/cad-product.blend'));bpy.ops.render.render(write_still=True)
