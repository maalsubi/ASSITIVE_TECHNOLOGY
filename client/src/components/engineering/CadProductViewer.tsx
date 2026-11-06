import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export type CadKind = "module" | "watch";
export type CadViewState = { progress: number; yaw: number; zoom: number };

type Part = { object: THREE.Group; travel: THREE.Vector3; materials: THREE.MeshStandardMaterial[] };
type Pose = { yaw: number; distance: number; rise: number; targetY: number; separation: number; board: number; detail: number; pair: number };
const poses: Record<CadKind, Pose[]> = {
  module: [
    { yaw: 0, distance: 12.8, rise: 6.3, targetY: 0, separation: 0, board: 0, detail: 0, pair: 0 },
    { yaw: 1.15, distance: 12.1, rise: 5.4, targetY: 0, separation: 0, board: 0, detail: 0, pair: 0 },
    { yaw: 0.55, distance: 13.2, rise: 7.1, targetY: 0, separation: 1, board: 0, detail: 0, pair: 0 },
    { yaw: 0.14, distance: 9.3, rise: 8, targetY: 0.35, separation: 1, board: 1, detail: 0, pair: 0 },
    { yaw: -0.25, distance: 8.3, rise: 7.3, targetY: 0.4, separation: 0.72, board: 0.7, detail: 1, pair: 0 },
    { yaw: 0, distance: 12.8, rise: 6.3, targetY: 0, separation: 0, board: 0, detail: 0, pair: 0 },
  ],
  watch: [
    { yaw: 0, distance: 9.4, rise: 5, targetY: 0, separation: 0, board: 0, detail: 0, pair: 0 },
    { yaw: 1.18, distance: 8.8, rise: 4.6, targetY: 0, separation: 0, board: 0, detail: 0, pair: 0 },
    { yaw: 0.4, distance: 10.2, rise: 5.7, targetY: 0, separation: 1, board: 0, detail: 0, pair: 0 },
    { yaw: 0.08, distance: 7.2, rise: 7.2, targetY: 0.3, separation: 1, board: 1, detail: 0, pair: 0 },
    { yaw: -0.18, distance: 6.5, rise: 7.4, targetY: 0.35, separation: 0.7, board: 0.6, detail: 1, pair: 0 },
    { yaw: 0, distance: 12.2, rise: 5.3, targetY: 0, separation: 0, board: 0, detail: 0, pair: 1 },
  ],
};

const travel: Record<CadKind, Record<string, number>> = {
  // Both assemblies are layered along the STEP board normal (CAD Z / Three Y).
  // Their source X/Z alignment is left untouched throughout the animation.
  module: {
    "STEP solid 000": 0.13,
    "STEP solid 309": -0.1,
    "STEP solid 310": -0.3,
    "STEP solid 311": 0.32,
    "STEP solid 312": 0.16,
    "STEP solid 313": 0.16,
    "STEP solid electronics": 0.14,
  },
  watch: {
    "WATCH board": 0.16,
    "WATCH board-mounted-form": 0.26,
    "WATCH electronic-details": 0.18,
    "WATCH enclosure": -0.27,
    "WATCH large-detail-a": 0.27,
    "WATCH large-detail-b": 0.31,
  },
};

function sample(kind: CadKind, progress: number): Pose {
  const keys = poses[kind];
  const index = Math.min(4, Math.floor(progress * 5));
  const raw = Math.min(1, Math.max(0, progress * 5 - index));
  const t = raw * raw * (3 - 2 * raw);
  const a = keys[index], b = keys[index + 1];
  return Object.fromEntries((Object.keys(a) as (keyof Pose)[]).map((key) => [key, THREE.MathUtils.lerp(a[key], b[key], t)])) as Pose;
}

function disposeScene(scene: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  scene.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    geometries.add(node.geometry);
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) materials.add(material);
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}

export default function CadProductViewer({ kind, state }: { kind: CadKind; state: React.RefObject<CadViewState> }) {
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let started = false;
    let visible = false;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !started) {
        started = true;
        try { cleanup = start(); } catch (error) { console.error("CAD viewer could not start", error); setStatus("error"); }
      }
    }, { rootMargin: "320px" });
    observer.observe(element);

    function start() {
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.5;
      element!.appendChild(renderer.domElement);
      renderer.domElement.setAttribute("aria-hidden", "true");
      const scene = new THREE.Scene();
      scene.add(new THREE.HemisphereLight(0xdde9ff, 0x101014, 3));
      const key = new THREE.DirectionalLight(0xffffff, 4.2);
      key.position.set(-5, 8, 8);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xd82b37, 2.7);
      rim.position.set(5, 2, -5);
      scene.add(rim);
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      const stage = new THREE.Group();
      scene.add(stage);
      const primary = new THREE.Group();
      stage.add(primary);
      let secondary: THREE.Group | undefined;
      let parts: Part[] = [];
      let loaded = false;
      let width = 1, height = 1;
      const resize = () => {
        width = element!.clientWidth;
        height = element!.clientHeight;
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(element!);
      resize();
      new GLTFLoader().load(`/assets/${kind === "module" ? "tsi-rev3-cad" : "tsi-watch-cad"}.glb`, (gltf) => {
        if (disposed) { disposeScene(gltf.scene); return; }
        if (kind === "watch") {
          secondary = gltf.scene.clone(true);
          secondary.scale.setScalar(5);
          stage.add(secondary);
          secondary.visible = false;
        }
        for (const child of [...gltf.scene.children]) {
          const name = child.name.replaceAll("_", " ");
          const amount = travel[kind][name];
          if (amount === undefined) continue;
          const group = new THREE.Group();
          group.name = name;
          group.add(child);
          primary.add(group);
          const owned: THREE.MeshStandardMaterial[] = [];
          group.traverse((node) => {
            if (!(node instanceof THREE.Mesh)) return;
            const materials = (Array.isArray(node.material) ? node.material : [node.material]).map((material) => {
              const copy = material.clone() as THREE.MeshStandardMaterial;
              owned.push(copy);
              return copy;
            });
            node.material = Array.isArray(node.material) ? materials : materials[0];
          });
          parts.push({ object: group, travel: new THREE.Vector3(0, amount, 0), materials: owned });
        }
        if (parts.length !== (kind === "module" ? 7 : 6)) {
          console.error("Unexpected CAD grouping", kind, parts.length);
          setStatus("error");
          return;
        }
        primary.scale.setScalar(kind === "module" ? 3.2 : 7);
        element!.dataset.source = kind === "module" ? "TSI REV3.step" : "TSI Wrist Band.step";
        element!.dataset.parts = String(parts.length);
        loaded = true;
        setStatus("ready");
      }, undefined, (error) => { console.error("CAD asset could not load", error); setStatus("error"); });

      let frame = 0;
      let last = 0;
      let display = state.current.progress;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      function render(time: number) {
        frame = requestAnimationFrame(render);
        if (!visible || document.hidden || !loaded || time - last < 30) return;
        last = time;
        const target = state.current.progress;
        display = reduced.matches ? target : THREE.MathUtils.lerp(display, target, 0.18);
        if (Math.abs(display - target) < 0.0005) display = target;
        const pose = sample(kind, display);
        for (const part of parts) {
          part.object.position.copy(part.travel).multiplyScalar(pose.separation);
          const board = part.object.name.includes("board") || part.object.name.includes("electronics");
          const detail = part.object.name.includes("detail");
          for (const material of part.materials) {
            if (!(material instanceof THREE.MeshStandardMaterial)) continue;
            if (kind === "module" && part.object.name === "STEP solid 311") {
              material.transparent = pose.separation > 0.01;
              material.opacity = THREE.MathUtils.lerp(1, 0.34, pose.separation);
              material.depthWrite = pose.separation < 0.01;
            }
            material.emissive.setHex(board ? 0x8d2028 : detail ? 0x7a3238 : 0x000000);
            material.emissiveIntensity = board ? pose.board * 0.35 : detail ? pose.detail * 0.24 : 0;
          }
        }
        const pair = kind === "watch" ? pose.pair : 0;
        primary.scale.setScalar(kind === "watch" ? THREE.MathUtils.lerp(7, 5, pair) : 3.2);
        primary.position.x = -1.65 * pair;
        if (secondary) {
          secondary.visible = pair > 0.01;
          secondary.position.x = 1.65 * pair;
          secondary.rotation.y = -0.18 - pose.yaw;
          secondary.scale.setScalar(5 * pair);
        }
        stage.rotation.y = -0.32 + pose.yaw + state.current.yaw;
        camera.position.set(2.3, pose.rise, pose.distance / state.current.zoom * (width / height < 0.8 ? 1.37 : 1));
        camera.lookAt(0, pose.targetY, 0);
        renderer.render(scene, camera);
        element!.dataset.progress = display.toFixed(3);
        element!.dataset.separation = pose.separation.toFixed(3);
        element!.dataset.yaw = stage.rotation.y.toFixed(3);
        element!.dataset.zoom = state.current.zoom.toFixed(2);
        element!.dataset.pair = pair.toFixed(3);
        element!.dataset.rendered = "true";
      }
      frame = requestAnimationFrame(render);
      return () => {
        cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        disposeScene(scene);
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    }
    return () => { disposed = true; observer.disconnect(); cleanup?.(); };
  }, [kind, state]);

  const label = kind === "module" ? "Assistive module" : "Wearable watch";
  return <div ref={host} className="cad-viewer" role="img" aria-label={`${label} from the supplied STEP assembly. Scroll through six stages or use the optional rotate and zoom controls.`}>
    {status !== "ready" && <div className="cad-viewer__placeholder"><img src={`/assets/${kind === "module" ? "tsi-module-hero" : "tsi-watch-hero"}.png`} alt="" /><span>{status === "loading" ? `PREPARING ${label.toUpperCase()} CAD` : "3D VIEW UNAVAILABLE · CAD PREVIEW SHOWN"}</span></div>}
  </div>;
}
