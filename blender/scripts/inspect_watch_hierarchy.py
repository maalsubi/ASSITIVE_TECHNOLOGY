"""Read AP214 product names and assembly nesting from the watch STEP."""
from OCP.STEPCAFControl import STEPCAFControl_Reader
from OCP.TDocStd import TDocStd_Document
from OCP.TCollection import TCollection_ExtendedString
from OCP.XCAFDoc import XCAFDoc_DocumentTool, XCAFDoc_ShapeTool
from OCP.TDataStd import TDataStd_Name
from OCP.collections import Sequence_TDF_Label
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_SOLID
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
from pathlib import Path
import json

root = Path(__file__).resolve().parents[2]
source = root / "blender/cad/TSI-Wrist-Band.step"
document = TDocStd_Document(TCollection_ExtendedString("TSI watch"))
reader = STEPCAFControl_Reader()
reader.SetNameMode(True)
status = reader.ReadFile(str(source))
if str(status).split(".")[-1] != "IFSelect_RetDone":
    raise RuntimeError(status)
reader.Transfer(document)
tool = XCAFDoc_DocumentTool.ShapeTool_s(document.Main())
free = Sequence_TDF_Label()
tool.GetFreeShapes(free)

def name(label):
    attr = TDataStd_Name()
    if label.FindAttribute(TDataStd_Name.GetID_s(), attr):
        return attr.Get().ToExtString()
    return ""

def walk(label, depth=0):
    children = Sequence_TDF_Label()
    XCAFDoc_ShapeTool.GetComponents_s(label, children, False)
    shape = XCAFDoc_ShapeTool.GetShape_s(label)
    explorer = TopExp_Explorer(shape, TopAbs_SOLID)
    count = 0
    while explorer.More():
        count += 1
        explorer.Next()
    box = Bnd_Box()
    BRepBndLib.Add_s(shape, box)
    bounds = [round(v, 3) for v in (box.GetXMin(), box.GetYMin(), box.GetZMin(), box.GetXMax(), box.GetYMax(), box.GetZMax())]
    referred = label
    if XCAFDoc_ShapeTool.GetReferredShape_s(label, referred):
        ref_name = name(referred)
    else:
        ref_name = ""
    entry = {"depth": depth, "name": name(label), "referenceName": ref_name, "solidCount": count, "bounds": bounds, "children": []}
    for i in range(1, children.Length() + 1):
        entry["children"].append(walk(children.Value(i), depth + 1))
    return entry

tree = [walk(free.Value(i)) for i in range(1, free.Length() + 1)]
out = root / "blender/cad/watch-hierarchy.json"
out.write_text(json.dumps(tree, indent=2))
def report(entry):
    print("  " * entry["depth"], entry["name"], "→", entry["referenceName"], "solids", entry["solidCount"], "bounds", entry["bounds"], flush=True)
    for child in entry["children"]:
        report(child)
for item in tree:
    report(item)
print("SAVED", out, flush=True)
