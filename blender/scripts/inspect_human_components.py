import bpy
import bmesh
from mathutils import Vector

bpy.ops.import_scene.gltf(filepath='/Users/maal/M.Tech/TechoSpark/blender/models/vsim-human.glb')
obj = bpy.data.objects['Human']
mesh = obj.data
bm = bmesh.new()
bm.from_mesh(mesh)
seen = set()
components = []
for v in bm.verts:
    if v in seen:
        continue
    queue = [v]
    seen.add(v)
    group = []
    while queue:
        current = queue.pop()
        group.append(current)
        for edge in current.link_edges:
            other = edge.other_vert(current)
            if other not in seen:
                seen.add(other)
                queue.append(other)
    coordinates = [x.co for x in group]
    lo = tuple(round(min(c[i] for c in coordinates), 3) for i in range(3))
    hi = tuple(round(max(c[i] for c in coordinates), 3) for i in range(3))
    components.append((len(group), lo, hi))
print('COMPONENTS', sorted(components, reverse=True)[:80])
print('MATERIAL', [(m.name, m.use_nodes, [(n.name,n.type) for n in m.node_tree.nodes]) for m in mesh.materials])
print('IMAGES', [(i.name, i.filepath, i.size[:], bool(i.packed_file)) for i in bpy.data.images])
