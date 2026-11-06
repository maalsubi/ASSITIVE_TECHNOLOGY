import bpy, math
from mathutils import Vector
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
source=str(ROOT/'blender/models/human_base_meshes_bundle.blend')
with bpy.data.libraries.load(source,link=False) as (src,dst):
    dst.objects=['GEO-body_male_realistic']
body=dst.objects[0]; bpy.context.collection.objects.link(body)
body.location=(0,0,0)
# Matte fabric overlays keep the base mesh clothed in the preview.
def mat(name,color,metal=0,rough=.7):
 m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough
 return m
skin=mat('Warm skin study',(0.43,.29,.22)); jacket=mat('Graphite jacket',(.055,.067,.077)); pants=mat('Charcoal trousers',(.035,.041,.049)); black=mat('Textured black enclosure',(.018,.021,.024),.25,.49); red=mat('TSI red',(.68,.018,.035),.2,.3);metal=mat('Anodized shaft',(.25,.29,.34),.8,.25);orange=mat('Strap accent',(.78,.22,.055));
body.data.materials.clear();body.data.materials.append(skin)
def cube(name,loc,scale,material,bevel=.02):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material)
 if bevel: mod=o.modifiers.new('Soft manufactured edges','BEVEL');mod.width=bevel;mod.segments=3;o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 return o
def cyl(name,loc,r,depth,material,rot=(0,0,0)):
 bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=r,depth=depth,location=loc,rotation=rot);o=bpy.context.object;o.name=name;o.data.materials.append(material);o.modifiers.new('Weighted normals','WEIGHTED_NORMAL');return o
# Use the anatomical base mesh itself for fitted clothing regions.
body.data.materials.clear()
for material in [skin,jacket,pants]: body.data.materials.append(material)
for poly in body.data.polygons:
 center=poly.center
 poly.material_index=0 if center.z>1.48 or (abs(center.x)>.34 and .65<center.z<1.25) else 1 if center.z>.83 else 2
# Walking stick and its CAD-referenced attachment at the upper handle.
stick=cyl('Walking stick shaft',(.58,-.03,.29),.027,1.08,metal,rot=(0,.06,0))
module=cube('CAD referenced handle enclosure',(.58,-.03,.83),(.50,.16,.15),black,.055)
branch=cube('Angled stick grip connection',(.50,-.03,.74),(.15,.17,.23),black,.045);branch.rotation_euler[1]=-.55
button=cyl('Physical red button',(.50,-.14,.82),.055,.04,red,rot=(math.pi/2,0,0))
# Independent watch units, one on each wrist.
for side,x in [('Left',-.44),('Right',.44)]:
 cube(side+' watch enclosure',(x,-.13,0.92),(.12,.09,.065),black,.025)
 cube(side+' strap',(x,-.1,0.92),(.16,.035,.055),jacket,.01)
 cube(side+' orange strap tab',(x,-.155,0.92),(.035,.017,.055),orange,.008)
# Studio scene, a grounded walking-path cue and a restrained obstacle.
floor=mat('Ground graphite',(.035,.038,.043));cube('Floor',(0,0,-.045),(200,200,.06),floor,0)
cube('Low obstacle on route',(2.25,.1,.25),(.58,.55,.5),floor,.06)
world=bpy.context.scene.world;world.color=(.07,.07,.08)
def area(name,loc,power,size,color):
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.data.color=color;o.rotation_euler=(Vector((0,0,.9))-o.location).to_track_quat('-Z','Y').to_euler()
area('Large softbox',(-3,-4,5),700,5,(1,1,1));area('Red rim',(2,2,3),440,3,(1,.13,.16));area('Cool fill',(3,-3,3),350,4,(.55,.69,1))
bpy.ops.object.camera_add(location=(3.2,-5.7,2.1));cam=bpy.context.object;cam.rotation_euler=(Vector((.35,0,.9))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=3.25;bpy.context.scene.camera=cam
sc=bpy.context.scene;sc.render.engine='BLENDER_EEVEE';sc.render.resolution_x=1280;sc.render.resolution_y=720;sc.render.resolution_percentage=100;sc.render.image_settings.file_format='PNG';sc.render.filepath=str(ROOT/'blender/renders/scene03-preview.png');sc.render.film_transparent=False
sc.view_settings.view_transform='AgX';sc.render.image_settings.color_mode='RGBA'
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'blender/scene03-preview.blend'))
bpy.ops.render.render(write_still=True)
