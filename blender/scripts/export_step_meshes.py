from OCP.STEPControl import STEPControl_Reader
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_SOLID
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.StlAPI import StlAPI_Writer
from pathlib import Path
import json
root=Path(__file__).resolve().parents[2];src=root/'blender/cad/TSI-REV3.step';out=root/'blender/cad/meshes';out.mkdir(exist_ok=True)
r=STEPControl_Reader();r.ReadFile(str(src));r.TransferRoots();exp=TopExp_Explorer(r.OneShape(),TopAbs_SOLID);solids=[]
while exp.More():solids.append(exp.Current());exp.Next()
selected=list(range(len(solids)))
for i in selected:
 shape=solids[i];BRepMesh_IncrementalMesh(shape,0.35,False,0.25,True).Perform()
 path=out/f'solid-{i:03}.stl';writer=StlAPI_Writer();writer.ASCIIMode=False;print(i,writer.Write(shape,str(path)),path.stat().st_size,flush=True)
(out/'manifest.json').write_text(json.dumps({'source':'TSI-REV3.step','units':'millimetres','solidCount':len(solids),'exported':selected},indent=2))
