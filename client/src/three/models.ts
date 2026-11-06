import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export interface Part {
  object: THREE.Object3D;
  origin: THREE.Vector3;
  travel: THREE.Vector3;
}
export interface HardwareModel {
  root: THREE.Group;
  parts: Part[];
  anchors: Record<string, THREE.Object3D>;
}
const mat = (color: number, metalness = 0.4, roughness = 0.4) =>
  new THREE.MeshStandardMaterial({ color, metalness, roughness });
export function materials() {
  const noise = new Uint8Array(64 * 64 * 4);
  for (let i = 0; i < 64 * 64; i++) {
    const v = 115 + ((i * 73 + (i % 64) * 31) % 35);
    noise.set([v, v, v, 255], i * 4);
  }
  const grain = new THREE.DataTexture(noise, 64, 64, THREE.RGBAFormat);
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
  grain.repeat.set(7, 7);
  grain.needsUpdate = true;
  const shell = mat(0x25282c, 0.55, 0.44);
  shell.bumpMap = grain;
  shell.bumpScale = 0.035;
  return {
    shell,
    edge: mat(0x596069, 0.8, 0.25),
    dark: mat(0x101216, 0.35, 0.5),
    gold: mat(0xc3a36b, 0.8, 0.3),
    board: mat(0x173e43, 0.38, 0.36),
    red: mat(0xe5232b, 0.5, 0.3),
    strap: mat(0x24262b, 0.05, 0.85),
    orange: mat(0xd3592c, 0.05, 0.8),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xb9d6d8,
      metalness: 0,
      roughness: 0.12,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  };
}
type Materials = ReturnType<typeof materials>;
function mesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  parent: THREE.Object3D,
  x = 0,
  y = 0,
  z = 0,
) {
  const o = new THREE.Mesh(geometry, material);
  o.position.set(x, y, z);
  o.castShadow = true;
  o.receiveShadow = true;
  parent.add(o);
  return o;
}
function box(
  parent: THREE.Object3D,
  m: THREE.Material,
  w: number,
  h: number,
  d: number,
  x = 0,
  y = 0,
  z = 0,
  r = 0.04,
) {
  return mesh(new RoundedBoxGeometry(w, h, d, 2, r), m, parent, x, y, z);
}
function cylinder(
  parent: THREE.Object3D,
  m: THREE.Material,
  r: number,
  h: number,
  x: number,
  y: number,
  z: number,
) {
  return mesh(new THREE.CylinderGeometry(r, r, h, 20), m, parent, x, y, z);
}
function part(
  model: HardwareModel,
  name: string,
  travel: [number, number, number],
  y = 0,
) {
  const object = new THREE.Group();
  object.name = name;
  object.position.y = y;
  model.root.add(object);
  model.parts.push({
    object,
    origin: object.position.clone(),
    travel: new THREE.Vector3(...travel),
  });
  model.anchors[name] = object;
  return object;
}
function empty(): HardwareModel {
  return { root: new THREE.Group(), parts: [], anchors: {} };
}
function outline(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
}
function frame(
  parent: THREE.Object3D,
  m: THREE.Material,
  w: number,
  d: number,
  height: number,
  wall: number,
) {
  const shape = outline(w, d, 0.22);
  const hole = outline(w - wall * 2, d - wall * 2, 0.16);
  shape.holes.push(new THREE.Path(hole.getPoints()));
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.025,
    bevelThickness: 0.025,
  });
  geo.rotateX(-Math.PI / 2);
  return mesh(geo, m, parent);
}
function fastener(
  parent: THREE.Object3D,
  m: Materials,
  x: number,
  z: number,
  y: number,
) {
  cylinder(parent, m.edge, 0.075, 0.055, x, y, z);
  box(parent, m.dark, 0.09, 0.008, 0.015, x, y + 0.03, z, 0.003);
}
// Positions reproduce visible package groupings in the supplied CAD screenshot.
// Package identity, electrical routing and underside details are not asserted.
export function createBoard(m: Materials) {
  const root = new THREE.Group();
  root.name = "reference-board";
  box(root, m.board, 2.02, 0.075, 2.66, 0, 0, 0, 0.12);
  const carriers = new THREE.Group();
  root.add(carriers);
  box(carriers, m.gold, 1.13, 0.06, 1.16, 0.29, 0.08, 0.55, 0.025);
  const chip = box(carriers, m.dark, 0.47, 0.1, 0.47, 0.18, 0.17, 0.6, 0.015);
  chip.material = m.dark.clone();
  chip.rotation.y = Math.PI / 4;
  box(carriers, m.dark, 0.38, 0.09, 0.42, 0.53, 0.14, -0.67, 0.012);
  box(carriers, m.edge, 0.44, 0.17, 0.82, -0.73, 0.15, -0.7, 0.025);
  box(carriers, m.dark, 0.32, 0.04, 0.12, -0.73, 0.25, -0.93, 0.015);
  box(carriers, m.dark, 0.32, 0.04, 0.12, -0.73, 0.25, -0.52, 0.015);
  box(carriers, m.gold, 0.38, 0.045, 0.49, 0.72, 0.14, 0.5, 0.01);
  for (let i = 0; i < 4; i++)
    box(
      carriers,
      m.dark,
      0.32,
      0.01,
      0.015,
      0.72,
      0.17,
      0.32 + i * 0.12,
      0.002,
    );
  for (let row = 0; row < 2; row++)
    for (let i = 0; i < 6; i++) {
      const x = -0.42 + i * 0.23,
        z = row ? 1.03 : 0.02;
      cylinder(carriers, m.gold, 0.068, 0.025, x, 0.14, z);
      cylinder(carriers, m.dark, 0.036, 0.029, x, 0.16, z);
    }
  for (let i = 0; i < 3; i++) {
    box(
      carriers,
      m.dark,
      0.15,
      0.07,
      0.19,
      -0.76,
      0.13,
      0.34 + i * 0.33,
      0.008,
    );
    for (let side = -1; side <= 1; side += 2)
      for (let pin = 0; pin < 3; pin++)
        box(
          carriers,
          m.edge,
          0.055,
          0.025,
          0.024,
          -0.76 + side * 0.1,
          0.11,
          0.28 + i * 0.33 + pin * 0.06,
          0.002,
        );
  }
  for (const [x, z] of [
    [-0.35, -0.94],
    [-0.11, -0.74],
    [-0.34, -0.09],
    [-0.1, 0.08],
    [0.16, 0.02],
    [-0.25, 0.61],
    [0, 0.8],
    [0.25, 0.94],
  ])
    cylinder(carriers, m.edge, 0.075, 0.09, x, 0.16, z);
  for (const [x, z] of [
    [0.42, -1.1],
    [0.6, -1.1],
    [0.45, -0.92],
    [0.62, -0.92],
    [0.87, -0.72],
    [0.87, -0.5],
    [-0.88, -0.15],
  ])
    box(carriers, m.gold, 0.06, 0.04, 0.09, x, 0.11, z, 0.006);
  for (const x of [-0.83, 0.83])
    for (const z of [-1.12, 1.12]) {
      cylinder(root, m.gold, 0.08, 0.011, x, 0.043, z);
      cylinder(root, m.dark, 0.052, 0.013, x, 0.05, z);
    }
  return { root, carriers, chip };
}
export function createWatch(m: Materials) {
  const model = empty();
  model.root.name = "watch-reconstruction";
  const lower = part(model, "enclosure", [0, -1.12, 0]);
  box(lower, m.shell, 2.32, 0.18, 2.96, 0, -0.27, 0, 0.18);
  frame(lower, m.shell, 2.32, 2.96, 0.48, 0.16).position.y = -0.24;
  for (const z of [-1.72, 1.72]) {
    box(lower, m.shell, 1.7, 0.27, 0.5, 0, -0.08, z, 0.06);
    cylinder(lower, m.edge, 0.085, 0.12, -1.18, 0, -0.7);
  }
  const straps = part(model, "strap", [0, -1.12, 0]);
  for (const sign of [-1, 1]) {
    box(straps, m.strap, 1.48, 0.13, 1.4, 0, -0.22, sign * 2.42, 0.06);
    for (let i = 0; i < 22; i++)
      box(
        straps,
        m.edge,
        0.012,
        0.008,
        1.24,
        -0.69 + i * 0.065,
        -0.148,
        sign * 2.42,
        0.003,
      );
    for (let i = 0; i < 12; i++)
      box(
        straps,
        m.dark,
        1.42,
        0.012,
        0.012,
        0,
        -0.14,
        sign * 2.42 - 0.6 + i * 0.1,
        0.003,
      );
  }
  box(straps, m.orange, 1.49, 0.04, 0.42, 0, -0.12, 2.8, 0.025);
  const board = part(model, "pcb", [0, 0.35, 0], 0.06);
  const built = createBoard(m);
  board.add(built.root);
  model.anchors.packages = built.chip;
  model.parts.push({
    object: built.carriers,
    origin: built.carriers.position.clone(),
    travel: new THREE.Vector3(0, 0.28, 0),
  });
  const lid = part(model, "cover", [0, 1.65, 0], 0.39);
  box(lid, m.glass, 2.04, 0.055, 2.68, 0, 0.06, 0, 0.1);
  frame(lid, m.edge, 2.2, 2.85, 0.055, 0.07);
  const screws = part(model, "fasteners", [0, 2.15, 0], 0.49);
  for (const x of [-0.92, 0.92])
    for (const z of [-1.22, 1.22]) fastener(screws, m, x, z, 0);
  return model;
}
function handleShape() {
  const s = new THREE.Shape();
  s.moveTo(-2.68, 0.38);
  s.quadraticCurveTo(-2.82, 0.36, -2.83, 0.22);
  s.lineTo(-2.8, -0.3);
  s.lineTo(-1.95, -0.43);
  s.quadraticCurveTo(-1.68, -0.46, -1.8, -0.68);
  s.lineTo(-2.93, -2.03);
  s.lineTo(-2.35, -2.51);
  s.lineTo(-0.43, -0.97);
  s.quadraticCurveTo(-0.1, -0.65, 0.2, -0.64);
  s.quadraticCurveTo(0.48, -0.92, 0.73, -0.56);
  s.quadraticCurveTo(1, -0.79, 1.25, -0.51);
  s.quadraticCurveTo(1.52, -0.73, 1.77, -0.46);
  s.quadraticCurveTo(2, -0.63, 2.25, -0.42);
  s.lineTo(2.67, -0.4);
  s.lineTo(2.67, 0.39);
  s.closePath();
  return s;
}
function handleMesh(
  parent: THREE.Object3D,
  m: THREE.Material,
  depth: number,
  y: number,
  scale = 1,
) {
  const geo = new THREE.ExtrudeGeometry(handleShape(), {
    depth,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.06,
    bevelThickness: 0.04,
    steps: 1,
    curveSegments: 20,
  });
  geo.rotateX(-Math.PI / 2);
  const o = mesh(geo, m, parent, 0, y, -0.6);
  o.scale.setScalar(scale);
  return o;
}
export function createModule(m: Materials, withShaft = true) {
  const model = empty();
  model.root.name = "assistive-module-concept";
  const back = part(model, "rear-shell", [0, -0.85, 0]);
  handleMesh(back, m.shell, 0.4, -0.35);
  const top = part(model, "front-shell", [0, 1.8, 0]);
  handleMesh(top, m.dark, 0.27, 0.12);
  // The red mark is typography, not an invented sensor or electronic part.
  for (const [x, z] of [
    [-2.5, -0.72],
    [2.45, -0.74],
    [-2.4, 1.36],
  ])
    fastener(top, m, x, z, 0.45);
  // Raised TSI lettering on the photographed handle face.
  box(top, m.red, 0.36, 0.025, 0.06, -0.7, 0.43, -0.5, 0.008);
  box(top, m.red, 0.07, 0.025, 0.35, -0.7, 0.43, -0.34, 0.008);
  for (const z of [-0.5, -0.34, -0.18])
    box(top, m.red, 0.25, 0.025, 0.055, -0.28, 0.43, z, 0.008);
  box(top, m.red, 0.055, 0.025, 0.18, -0.39, 0.43, -0.43, 0.006);
  box(top, m.red, 0.055, 0.025, 0.18, -0.17, 0.43, -0.25, 0.006);
  box(top, m.red, 0.07, 0.025, 0.37, 0.12, 0.43, -0.34, 0.008);
  // The new cutaway render confirms a blue cell, three visible boards and the red button.
  const board = part(model, "main-board", [0, 0.85, 0.18]);
  box(board, m.board, 1.55, 0.07, 1.15, -0.9, 0.09, 0.13, 0.06);
  box(board, m.edge, 0.52, 0.055, 0.45, -1.12, 0.16, 0.23);
  for (const x of [-1.5, -1.1, -0.72, -0.35])
    box(board, m.dark, 0.09, 0.045, 0.12, x, 0.17, -0.28, 0.01);
  const cell = part(model, "battery", [0, 1.25, -0.25]);
  const blueCell = cylinder(
    cell,
    mat(0x174bb4, 0.3, 0.27),
    0.27,
    1.9,
    0.25,
    0.05,
    -0.92,
  );
  blueCell.rotation.z = Math.PI / 2;
  for (const x of [-0.77, 1.27]) {
    const end = cylinder(cell, m.edge, 0.23, 0.075, x, 0.05, -0.92);
    end.rotation.z = Math.PI / 2;
  }
  const tipBoard = part(model, "tip-board", [0, 0.75, 0.65]);
  box(tipBoard, m.board, 0.77, 0.07, 0.48, 1.94, 0.13, -0.95, 0.04);
  box(tipBoard, m.edge, 0.16, 0.1, 0.28, 2.24, 0.2, -0.95, 0.02);
  const smallBoard = part(model, "small-board", [0, 0.55, -0.55]);
  box(
    smallBoard,
    mat(0x392263, 0.2, 0.42),
    0.42,
    0.045,
    0.36,
    -2.39,
    0.13,
    -0.92,
    0.02,
  );
  const button = part(model, "red-button", [0, 0.35, 0.35]);
  cylinder(button, m.red, 0.17, 0.12, -1.94, 0.22, -0.22);
  const support = part(model, "carrier", [0, -0.25, 0]);
  box(support, m.edge, 2.56, 0.035, 0.7, 0.55, -0.06, -0.56, 0.06);
  if (withShaft) {
    const shaft = part(model, "shaft", [0, -0.85, 0]);
    const shaftDirection = new THREE.Vector3(-0.65, 0, 0.76).normalize();
    const tube = cylinder(shaft, m.edge, 0.12, 3.4, -2.58, -0.12, 1.65);
    tube.position.addScaledVector(shaftDirection, 1.55);
    tube.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      shaftDirection,
    );
    const grip = box(shaft, m.dark, 0.35, 0.3, 0.45, -2.58, -0.12, 1.65, 0.06);
    grip.rotation.y = -0.62;
  }
  return model;
}
export function explode(model: HardwareModel, amount: number) {
  for (const p of model.parts)
    p.object.position.copy(p.origin).addScaledVector(p.travel, amount);
}
export function disposeModel(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const mats = new Set<THREE.Material>();
  root.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      geometries.add(o.geometry);
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
        mats.add(m),
      );
    }
  });
  geometries.forEach((g) => g.dispose());
  const textures = new Set<THREE.Texture>();
  mats.forEach((m) => {
    for (const v of Object.values(m))
      if (v instanceof THREE.Texture) textures.add(v);
    m.dispose();
  });
  textures.forEach((t) => t.dispose());
}
