import * as THREE from "three";
import type { HardwareModel, Part } from "./models";

// The major parts and merged small details are taken directly from TSI REV3.step.
// The labels describe geometry only; the STEP file does not establish the
// electrical role of every small solid.
const solids: Record<string, { label: string; travel: [number, number, number] }> = {
  "STEP solid 000": { label: "main-board", travel: [0, 0.5, 0.13] },
  "STEP solid 309": { label: "secondary-board", travel: [0, -0.35, -0.1] },
  "STEP solid 310": { label: "rear-shell", travel: [0, -0.65, 0] },
  "STEP solid 311": { label: "front-shell", travel: [0, 0.8, 0] },
  "STEP solid 312": { label: "cad-detail-a", travel: [0.18, 0.3, 0.16] },
  "STEP solid 313": { label: "cad-detail-b", travel: [-0.18, 0.3, -0.16] },
  "STEP solid electronics": { label: "electronic-details", travel: [0, 0.42, 0.08] },
};

export function createCadModel(source: THREE.Group): HardwareModel {
  const root = new THREE.Group();
  root.name = "TSI REV3 STEP-derived module";
  root.scale.setScalar(3.2);
  const parts: Part[] = [];
  const anchors: Record<string, THREE.Object3D> = {};
  for (const mesh of [...source.children]) {
    // GLTFLoader sanitizes Blender object names for animation bindings.
    const spec = solids[mesh.name.replaceAll("_", " ")];
    if (!spec) continue;
    const group = new THREE.Group();
    group.name = spec.label;
    group.add(mesh);
    root.add(group);
    mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (spec.label === "rear-shell") {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x171b20,
            metalness: 0.18,
            roughness: 0.62,
            side: THREE.DoubleSide,
          });
        } else if (spec.label === "front-shell") {
          child.material = new THREE.MeshPhysicalMaterial({
            color: 0x252b31,
            metalness: 0.22,
            roughness: 0.5,
            transparent: true,
            opacity: 0.88,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
        } else if (spec.label.includes("board")) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x0b5668,
            metalness: 0.12,
            roughness: 0.65,
            side: THREE.DoubleSide,
          });
        }
      }
    });
    const anchor = new THREE.Object3D();
    root.updateMatrixWorld(true);
    new THREE.Box3().setFromObject(mesh).getCenter(anchor.position);
    group.worldToLocal(anchor.position);
    group.add(anchor);
    anchors[spec.label] = anchor;
    parts.push({
      object: group,
      origin: group.position.clone(),
      travel: new THREE.Vector3(...spec.travel),
    });
  }
  return { root, parts, anchors };
}
