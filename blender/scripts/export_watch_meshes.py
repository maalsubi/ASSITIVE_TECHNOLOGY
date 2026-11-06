"""Tessellate every solid in the supplied watch STEP at its source position."""
from OCP.STEPControl import STEPControl_Reader
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_SOLID
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.StlAPI import StlAPI_Writer
from pathlib import Path
import json
import struct

root = Path(__file__).resolve().parents[2]
src = root / "blender/cad/TSI-Wrist-Band.step"
out = root / "blender/cad/watch-meshes"
out.mkdir(exist_ok=True)
reader = STEPControl_Reader()
status = reader.ReadFile(str(src))
if str(status).split(".")[-1] != "IFSelect_RetDone":
    raise RuntimeError(f"STEP read failed: {status}")
reader.TransferRoots()
explorer = TopExp_Explorer(reader.OneShape(), TopAbs_SOLID)
solids = []
while explorer.More():
    solids.append(explorer.Current())
    explorer.Next()

if len(solids) != 98:
    raise RuntimeError(f"Expected 98 watch solids, found {len(solids)}")
writer = StlAPI_Writer()
writer.ASCIIMode = False
mesh_bounds = []
for i, shape in enumerate(solids):
    BRepMesh_IncrementalMesh(shape, 0.22, False, 0.25, True).Perform()
    path = out / f"solid-{i:03}.stl"
    if not writer.Write(shape, str(path)):
        raise RuntimeError(f"Could not export solid {i}")
    data = path.read_bytes()
    count = struct.unpack_from("<I", data, 80)[0]
    low = [float("inf")] * 3
    high = [float("-inf")] * 3
    for triangle in range(count):
        for vertex in range(3):
            point = struct.unpack_from("<fff", data, 84 + 50 * triangle + 12 + 12 * vertex)
            for axis in range(3):
                low[axis] = min(low[axis], point[axis])
                high[axis] = max(high[axis], point[axis])
    mesh_bounds.append({"index": i, "bounds": [round(v, 3) for v in low + high], "triangles": count})
    print(i, path.stat().st_size, flush=True)

inspection = json.loads((root / "blender/cad/watch-inspection.json").read_text())
manifest = {
    "source": src.name,
    "units": "millimetres",
    "solidCount": len(solids),
    "solidDetails": inspection["solids"],
    "tessellatedBoundsMm": mesh_bounds,
    "webGrouping": {
        "board": [0],
        "board-mounted-form": [32],
        "large-detail-a": [34],
        "large-detail-b": [35],
        "enclosure": [97],
        "electronic-details": list(range(1, 32)) + list(range(36, 97)),
    },
    "duplicateSourceSolids": {"33": 32},
    "note": "Solid 33 tessellates identically to solid 32 and is represented by the same web mesh. The supplied STEP has no separate strap solid. Grouping is based on geometry inspection, not a verified physical disassembly. Source positions are retained."
}
(out / "manifest.json").write_text(json.dumps(manifest, indent=2))
