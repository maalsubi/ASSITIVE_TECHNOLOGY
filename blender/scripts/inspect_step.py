from OCP.STEPControl import STEPControl_Reader
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_SOLID
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
from pathlib import Path
src=Path(__file__).resolve().parents[1]/'cad/TSI-REV3.step'
r=STEPControl_Reader();status=r.ReadFile(str(src));print('read status',status,'roots',r.NbRootsForTransfer());r.TransferRoots();shape=r.OneShape();print('shape type',shape.ShapeType())
exp=TopExp_Explorer(shape,TopAbs_SOLID);solids=[]
while exp.More():
 sh=exp.Current(); b=Bnd_Box();BRepBndLib.Add_s(sh,b);solids.append((sh,(b.GetXMin(),b.GetYMin(),b.GetZMin(),b.GetXMax(),b.GetYMax(),b.GetZMax())));exp.Next()
print('solids',len(solids))
for i,(sh,b) in enumerate(solids):print(i,','.join(f'{x:.2f}' for x in b))
