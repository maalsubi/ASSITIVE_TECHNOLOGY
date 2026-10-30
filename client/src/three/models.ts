import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export interface Part { object: THREE.Object3D; origin: THREE.Vector3; travel: THREE.Vector3; }
export interface HardwareModel { root: THREE.Group; parts: Part[]; anchors: Record<string, THREE.Object3D>; }
const mat=(color:number,metalness=.4,roughness=.4)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
export function materials(){return {shell:mat(0x25282c,.65,.3),edge:mat(0x596069,.8,.25),dark:mat(0x101216,.35,.5),gold:mat(0xc3a36b,.8,.3),board:mat(0x173e43,.38,.36),red:mat(0xe5232b,.5,.3),strap:mat(0x24262b,.05,.85),orange:mat(0xd3592c,.05,.8),glass:new THREE.MeshPhysicalMaterial({color:0xb9d6d8,metalness:0,roughness:.12,transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide})};}
type Materials=ReturnType<typeof materials>;
function mesh(geometry:THREE.BufferGeometry,material:THREE.Material,parent:THREE.Object3D,x=0,y=0,z=0){const o=new THREE.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(parent:THREE.Object3D,m:THREE.Material,w:number,h:number,d:number,x=0,y=0,z=0,r=.04){return mesh(new RoundedBoxGeometry(w,h,d,2,r),m,parent,x,y,z)}
function cylinder(parent:THREE.Object3D,m:THREE.Material,r:number,h:number,x:number,y:number,z:number){return mesh(new THREE.CylinderGeometry(r,r,h,20),m,parent,x,y,z)}
function part(model:HardwareModel,name:string,travel:[number,number,number],y=0){const object=new THREE.Group();object.name=name;object.position.y=y;model.root.add(object);model.parts.push({object,origin:object.position.clone(),travel:new THREE.Vector3(...travel)});model.anchors[name]=object;return object;}
function empty():HardwareModel{return {root:new THREE.Group(),parts:[],anchors:{}}}
function outline(w:number,h:number,r:number){const s=new THREE.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;}
function frame(parent:THREE.Object3D,m:THREE.Material,w:number,d:number,height:number,wall:number){const shape=outline(w,d,.22);const hole=outline(w-wall*2,d-wall*2,.16);shape.holes.push(new THREE.Path(hole.getPoints()));const geo=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.025,bevelThickness:.025});geo.rotateX(-Math.PI/2);return mesh(geo,m,parent)}
function fastener(parent:THREE.Object3D,m:Materials,x:number,z:number,y:number){cylinder(parent,m.edge,.075,.055,x,y,z);box(parent,m.dark,.09,.008,.015,x,y+.03,z,.003);}
// Positions reproduce visible package groupings in the supplied CAD screenshot.
// Package identity, electrical routing and underside details are not asserted.
export function createBoard(m:Materials){const root=new THREE.Group();root.name='reference-board';box(root,m.board,2.02,.075,2.66,0,0,0,.12);
 const carriers=new THREE.Group();root.add(carriers);
 box(carriers,m.gold,1.13,.06,1.16,.29,.08,.55,.025);
 const chip=box(carriers,m.dark,.47,.1,.47,.18,.17,.6,.015);chip.rotation.y=Math.PI/4;
 box(carriers,m.dark,.38,.09,.42,.53,.14,-.67,.012);
 box(carriers,m.edge,.44,.17,.82,-.73,.15,-.7,.025);
 box(carriers,m.dark,.32,.04,.12,-.73,.25,-.93,.015);
 box(carriers,m.dark,.32,.04,.12,-.73,.25,-.52,.015);
 box(carriers,m.gold,.38,.045,.49,.72,.14,.5,.01);
 for(let i=0;i<4;i++)box(carriers,m.dark,.32,.01,.015,.72,.17,.32+i*.12,.002);
 for(let row=0;row<2;row++)for(let i=0;i<6;i++){const x=-.42+i*.23,z=row?1.03:.02;cylinder(carriers,m.gold,.068,.025,x,.14,z);cylinder(carriers,m.dark,.036,.029,x,.16,z);}
 for(let i=0;i<3;i++){box(carriers,m.dark,.15,.07,.19,-.76,.13,.34+i*.33,.008);for(let side=-1;side<=1;side+=2)for(let pin=0;pin<3;pin++)box(carriers,m.edge,.055,.025,.024,-.76+side*.1,.11,.28+i*.33+pin*.06,.002);}
 for(const [x,z] of [[-.35,-.94],[-.11,-.74],[-.34,-.09],[-.1,.08],[.16,.02],[-.25,.61],[0,.8],[.25,.94]])cylinder(carriers,m.edge,.075,.09,x,.16,z);
 for(const [x,z] of [[.42,-1.1],[.6,-1.1],[.45,-.92],[.62,-.92],[.87,-.72],[.87,-.5],[-.88,-.15]])box(carriers,m.gold,.06,.04,.09,x,.11,z,.006);
 for(const x of [-.83,.83])for(const z of [-1.12,1.12]){cylinder(root,m.gold,.08,.011,x,.043,z);cylinder(root,m.dark,.052,.013,x,.05,z)}
 return {root,carriers,chip};}
export function createWatch(m:Materials){const model=empty();model.root.name='watch-reconstruction';
 const lower=part(model,'enclosure',[0,-1.12,0]);box(lower,m.shell,2.32,.18,2.96,0,-.27,0,.18);frame(lower,m.shell,2.32,2.96,.48,.16).position.y=-.24;
 for(const z of [-1.72,1.72]){box(lower,m.shell,1.7,.27,.5,0,-.08,z,.06);cylinder(lower,m.edge,.085,.12,-1.18,0,-.7);}
 const straps=part(model,'strap',[0,-1.12,0]);for(const sign of [-1,1]){box(straps,m.strap,1.48,.13,1.4,0,-.22,sign*2.42,.06);for(let i=0;i<22;i++)box(straps,m.edge,.012,.008,1.24,-.69+i*.065,-.148,sign*2.42,.003);for(let i=0;i<12;i++)box(straps,m.dark,1.42,.012,.012,0,-.14,sign*2.42-.6+i*.1,.003)}box(straps,m.orange,1.49,.04,.42,0,-.12,2.8,.025);
 const board=part(model,'pcb',[0,.35,0],.06);const built=createBoard(m);board.add(built.root);model.anchors.packages=built.chip;
 const lid=part(model,'cover',[0,1.65,0],.39);box(lid,m.glass,2.04,.055,2.68,0,.06,0,.1);frame(lid,m.edge,2.2,2.85,.055,.07);
 const screws=part(model,'fasteners',[0,2.15,0],.49);for(const x of [-.92,.92])for(const z of [-1.22,1.22])fastener(screws,m,x,z,0);
 return model;}
function handleShape(){const s=new THREE.Shape();s.moveTo(-2.68,.38);s.quadraticCurveTo(-2.82,.36,-2.83,.22);s.lineTo(-2.8,-.3);s.lineTo(-1.95,-.43);s.quadraticCurveTo(-1.68,-.46,-1.8,-.68);s.lineTo(-2.93,-2.03);s.lineTo(-2.35,-2.51);s.lineTo(-.43,-.97);s.bezierCurveTo(.25,-.55,1.15,-.5,2.67,-.4);s.lineTo(2.67,.39);s.closePath();return s;}
function handleMesh(parent:THREE.Object3D,m:THREE.Material,depth:number,y:number,scale=1){const geo=new THREE.ExtrudeGeometry(handleShape(),{depth,bevelEnabled:true,bevelSegments:3,bevelSize:.06,bevelThickness:.04,steps:1,curveSegments:20});geo.rotateX(-Math.PI/2);const o=mesh(geo,m,parent,0,y,-.6);o.scale.setScalar(scale);return o;}
export function createModule(m:Materials,withShaft=true){const model=empty();model.root.name='assistive-module-concept';
 const back=part(model,'rear-shell',[0,-.85,0]);handleMesh(back,m.shell,.25,-.2);const top=part(model,'front-shell',[0,1.8,0]);handleMesh(top,m.dark,.2,.12);
 // The red mark is typography, not an invented sensor or electronic part.
 for(const [x,z] of [[-2.5,-.72],[2.45,-.74],[-2.4,1.36]])fastener(top,m,x,z,.38);
 const accent=box(top,m.red,.78,.025,.23,-.6,.36,-.22,.01);accent.rotation.y=-.15;
 const board=part(model,'concept-board',[0,.6,0]);box(board,m.board,2.4,.07,.56,.55,.1,-.56,.06);for(const x of [-.5,1.6]){cylinder(board,m.gold,.07,.02,x,.15,-.56);cylinder(board,m.dark,.04,.03,x,.17,-.56)}
 // Unpopulated conceptual carrier: no unverified battery, motor, sensor or IC is fabricated.
 const support=part(model,'carrier',[0,-.25,0]);box(support,m.edge,2.56,.035,.7,.55,-.06,-.56,.06);
 if(withShaft){const shaft=part(model,'shaft',[0,-.85,0]);const tube=cylinder(shaft,m.edge,.12,3.4,-2.55,-.2,2.75);tube.rotation.x=Math.PI/2;tube.rotation.z=-.62;tube.position.x=-3.05;const grip=box(shaft,m.dark,.35,.3,.45,-2.58,-.12,1.65,.06);grip.rotation.y=-.62;}
 return model;}
export function explode(model:HardwareModel,amount:number){for(const p of model.parts)p.object.position.copy(p.origin).addScaledVector(p.travel,amount)}
export function disposeModel(root:THREE.Object3D){const geometries=new Set<THREE.BufferGeometry>();const mats=new Set<THREE.Material>();root.traverse(o=>{if(o instanceof THREE.Mesh){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m))}});geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());}
