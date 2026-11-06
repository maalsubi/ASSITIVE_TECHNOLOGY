"""Inspect the supplied watch STEP without changing its geometry."""
from OCP.STEPControl import STEPControl_Reader
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_SOLID
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
from OCP.BRepGProp import BRepGProp
from OCP.GProp import GProp_GProps
from pathlib import Path
import json
import re

root = Path(__file__).resolve().parents[2]
src = root / "blender/cad/TSI-Wrist-Band.step"
reader = STEPControl_Reader()
status = reader.ReadFile(str(src))
reader.TransferRoots()
shape = reader.OneShape()
explorer = TopExp_Explorer(shape, TopAbs_SOLID)
solids = []
while explorer.More():
    part = explorer.Current()
    box = Bnd_Box()
    BRepBndLib.Add_s(part, box)
    props = GProp_GProps()
    BRepGProp.VolumeProperties_s(part, props)
    bounds = [box.GetXMin(), box.GetYMin(), box.GetZMin(), box.GetXMax(), box.GetYMax(), box.GetZMax()]
    solids.append({"index": len(solids), "bounds": [round(v, 3) for v in bounds], "center": [round((bounds[i] + bounds[i + 3]) / 2, 3) for i in range(3)], "size": [round(bounds[i + 3] - bounds[i], 3) for i in range(3)], "volume": round(props.Mass(), 3)})
    explorer.Next()

text = src.read_text(errors="replace")
names = re.findall(r"PRODUCT\('([^']*)'", text)
result = {"source": src.name, "readStatus": str(status), "rootCount": reader.NbRootsForTransfer(), "solidCount": len(solids), "productNames": names[:100], "solids": solids}
out = root / "blender/cad/watch-inspection.json"
out.write_text(json.dumps(result, indent=2))
print("status", status, "roots", reader.NbRootsForTransfer(), "solids", len(solids), flush=True)
print("product names", names[:100], flush=True)
for item in sorted(solids, key=lambda x: x["volume"], reverse=True)[:35]:
    print(item, flush=True)
print("manifest", out, flush=True)
