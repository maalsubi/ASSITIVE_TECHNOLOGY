import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createCadModel } from "../../three/cad";
import {
  createWatch,
  createModule,
  createBoard,
  materials,
  explode,
  disposeModel,
  type HardwareModel,
} from "../../three/models";
export type SceneMode =
  "watch" | "module" | "electronics" | "ecosystem" | "assembly" | "demo";
export interface SceneState {
  progress: number;
  focus: number;
  manual: number | null;
  paused: boolean;
  zoom?: number;
  spinAngle?: number;
}
export default function EngineeringScene({
  mode,
  state,
  className = "",
  onReady,
}: {
  mode: SceneMode;
  state: React.RefObject<SceneState>;
  className?: string;
  onReady?: () => void;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const ready = useRef(onReady);
  ready.current = onReady;
  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let cleanup: (() => void) | undefined;
    let disposed = false;
    let visible = false;
    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (visible && !cleanup && !disposed) {
          try {
            cleanup = initialize();
          } catch (e) {
            console.error("3D scene could not initialize", e);
            setError(true);
          }
        }
      },
      { rootMargin: "250px" },
    );
    observer.observe(host);
    function initialize() {
      let dirty = true;
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.setClearColor(0x080808, 0);
      host!.appendChild(renderer.domElement);
      renderer.domElement.setAttribute("aria-hidden", "true");
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      const pmrem = new THREE.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      const environment = pmrem.fromScene(room, 0.04);
      scene.environment = environment.texture;
      scene.environmentIntensity = 0.7;
      room.dispose();
      pmrem.dispose();
      scene.add(new THREE.HemisphereLight(0xe8f1ff, 0x181018, 2));
      const key = new THREE.DirectionalLight(0xffffff, 4);
      key.position.set(-4, 7, 5);
      key.castShadow = true;
      key.shadow.mapSize.set(512, 512);
      key.shadow.camera.left = -7;
      key.shadow.camera.right = 7;
      key.shadow.camera.top = 7;
      key.shadow.camera.bottom = -7;
      key.shadow.normalBias = 0.035;
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xe5232b, 5);
      rim.position.set(4, 2, -3);
      scene.add(rim);
      const fill = new THREE.DirectionalLight(0x8ca9bc, 2);
      fill.position.set(-4, 0, -2);
      scene.add(fill);
      const stage = new THREE.Group();
      scene.add(stage);
      const m = materials();
      const models: HardwareModel[] = [];
      let referenceTexture: THREE.Texture | undefined;
      let board: ReturnType<typeof createBoard> | undefined;
      const signals: THREE.Mesh[] = [];
      const paths: THREE.QuadraticBezierCurve3[] = [];
      let demo:
        | {
            module: THREE.Group;
            person: THREE.Group;
            mixer?: THREE.AnimationMixer;
            hand?: THREE.Bone;
            left: THREE.Group;
            right: THREE.Group;
            obstacle: THREE.Mesh;
            obstacleRight: THREE.Mesh;
            waves: THREE.Group;
            beam: THREE.Group;
            stick: THREE.Group;
          }
        | undefined;
      if (mode === "watch") {
        const model = createWatch(m);
        stage.add(model.root);
        models.push(model);
      } else if (mode === "module" || mode === "assembly") {
        const model = createModule(m);
        stage.add(model.root);
        models.push(model);
      } else if (mode === "demo") {
        const person = new THREE.Group();
        stage.add(person);
        person.position.set(-0.75, -2.1, 0);
        person.scale.setScalar(2.2);
        const watchAt = () => {
          const group = new THREE.Group();
          person.add(group);
          const w = createWatch(m);
          w.root.scale.setScalar(0.045);
          w.root.rotation.x = -0.4;
          group.add(w.root);
          for (let ringIndex = 0; ringIndex < 2; ringIndex++) {
            const ring = new THREE.Mesh(
              new THREE.TorusGeometry(0.065 + ringIndex * 0.03, 0.005, 6, 30),
              new THREE.MeshBasicMaterial({
                color: 0xe5232b,
                transparent: true,
                opacity: 0.75,
              }),
            );
            ring.name = "haptic-ring";
            ring.rotation.x = Math.PI / 2;
            group.add(ring);
          }
          models.push(w);
          return group;
        };
        const left = watchAt(), right = watchAt();
        new GLTFLoader().load(
          "/assets/tsi-human-walk.glb",
          (gltf) => {
            if (disposed) return;
            gltf.scene.traverse((object) => {
              if (object.name === "Phone" || object.name === "Icosphere") object.visible = false;
              if (object instanceof THREE.Mesh) object.castShadow = true;
            });
            person.add(gltf.scene);
            const bones: Record<string, THREE.Bone> = {};
            gltf.scene.traverse((object) => {
              if (object instanceof THREE.Bone) bones[object.name] = object;
            });
            for (const [watch, bone] of [[left, bones.hand_l], [right, bones.hand_r]] as const) {
              if (!bone) continue;
              bone.add(watch);
              watch.position.set(0, 0, 0);
              watch.rotation.set(0, 0, 0);
            }
            if (demo) {
              demo.hand = bones.hand_r;
              demo.mixer = new THREE.AnimationMixer(gltf.scene);
              const walk = gltf.animations.find((clip) => clip.name === "Walk_Carry") ?? gltf.animations[0];
              if (walk) demo.mixer.clipAction(walk).play();
            }
            host!.dataset.humanSource = "Innerscene Sam / CC0 rigged walk";
            dirty = true;
          },
          undefined,
          (cause) => console.error("Rigged walking character could not load", cause),
        );
        const stick = new THREE.Group();
        stage.add(stick);
        const shaft = new THREE.Mesh(
          new THREE.CylinderGeometry(0.045, 0.06, 2.45, 18),
          m.edge,
        );
        shaft.position.set(0, -1.22, 0);
        shaft.castShadow = true;
        stick.add(shaft);
        const module = createModule(m, false);
        module.root.scale.setScalar(0.28);
        module.root.position.set(0, 0, 0);
        module.root.rotation.y = 0.38;
        stick.add(module.root);
        models.push(module);
        const obstacle = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 1.1, 0.8),
          m.dark,
        );
        obstacle.position.set(2.5, -1.55, 0.2);
        obstacle.castShadow = true;
        stage.add(obstacle);
        obstacle.position.x = -2.4;
        const obstacleRight = obstacle.clone();
        obstacleRight.position.x = 2.4;
        stage.add(obstacleRight);
        const waves = new THREE.Group();
        stage.add(waves);
        for (let i = 0; i < 3; i++) {
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.23 + i * 0.18, 0.012, 5, 32),
            m.red,
          );
          ring.position.set(1.1 + i * 0.29, 1.35, 0.45);
          ring.rotation.y = Math.PI / 2;
          waves.add(ring);
        }
        const beam = new THREE.Group();
        stage.add(beam);
        for (let i = 0; i < 2; i++) {
          const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
            new THREE.LineBasicMaterial({ color: 0xe5232b, transparent: true, opacity: 0.8 }),
          );
          beam.add(line);
        }
        demo = {
          module: module.root,
          person,
          left,
          right,
          obstacle,
          obstacleRight,
          waves,
          beam,
          stick,
        };
      } else if (mode === "electronics") {
        board = createBoard(m);
        stage.add(board.root);
        board.root.scale.setScalar(1.45);
        referenceTexture = new THREE.TextureLoader().load(
          "/assets/circuit-board.jpg",
          (texture) => {
            if (disposed) texture.dispose();
            dirty = true;
          },
        );
        referenceTexture.colorSpace = THREE.SRGBColorSpace;
        referenceTexture.repeat.set(269 / 672, 335 / 785);
        referenceTexture.offset.set(122 / 672, 1 - 476 / 785);
        const surface = new THREE.Mesh(
          new THREE.PlaneGeometry(2.02, 2.66),
          new THREE.MeshStandardMaterial({
            map: referenceTexture,
            roughness: 0.6,
            metalness: 0.1,
          }),
        );
        surface.rotation.x = -Math.PI / 2;
        surface.position.y = 0.042;
        board.root.add(surface);
      } else {
        const module = createModule(m, false);
        module.root.scale.setScalar(0.7);
        module.root.position.set(0.1, 0, 0.25);
        stage.add(module.root);
        models.push(module);
        for (const [i, x] of [-3.4, 3.4].entries()) {
          const watch = createWatch(m);
          watch.root.scale.setScalar(0.53);
          watch.root.position.set(x, 0.3, i === 0 ? -0.45 : 0.85);
          watch.root.rotation.y = i === 0 ? -0.28 : 0.35;
          stage.add(watch.root);
          models.push(watch);
          const path = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(0, 0.5, 0),
            new THREE.Vector3(x * 0.5, 1.35, -0.5),
            watch.root.position.clone(),
          );
          paths.push(path);
          const tube = new THREE.Mesh(
            new THREE.TubeGeometry(path, 32, 0.012, 5, false),
            new THREE.MeshBasicMaterial({ color: 0x69252a }),
          );
          stage.add(tube);
          const pulse = new THREE.Mesh(
            new THREE.SphereGeometry(0.055, 10, 8),
            new THREE.MeshBasicMaterial({ color: 0xff5a5a }),
          );
          signals.push(pulse);
          stage.add(pulse);
        }
      }
      if (mode === "module" || mode === "assembly" || mode === "ecosystem" || mode === "demo") {
        const cadIndex = mode === "demo" ? 2 : 0;
        const placeholder = models[cadIndex];
        new GLTFLoader().load(
          "/assets/tsi-rev3-cad.glb",
          (gltf) => {
            if (disposed) {
              disposeModel(gltf.scene);
              return;
            }
            const cad = createCadModel(gltf.scene);
            if (cad.parts.length !== 7) {
              console.error("Unexpected STEP mesh hierarchy", cad.parts.length);
              disposeModel(cad.root);
              return;
            }
            host!.dataset.cadParts = String(cad.parts.length);
            const scale = mode === "demo" ? 0.28 : mode === "ecosystem" ? 2 : 3.2;
            cad.root.scale.setScalar(scale);
            cad.root.position.copy(placeholder.root.position);
            cad.root.rotation.copy(placeholder.root.rotation);
            (placeholder.root.parent ?? stage).add(cad.root);
            placeholder.root.visible = false;
            models[cadIndex] = cad;
            if (demo) demo.module = cad.root;
            host!.dataset.geometrySource = "TSI REV3.step";
            dirty = true;
          },
          undefined,
          (cause) => {
            console.error("CAD model could not load", cause);
            host!.dataset.geometrySource = "reference-reconstruction";
          },
        );
      }
      // Flat studio sweep provides a stable reference plane without decorative circles.
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.28 }),
      );
      floor.receiveShadow = true;
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -2.1;
      scene.add(floor);
      let width = 1,
        height = 1;
      const resize = () => {
        width = host!.clientWidth;
        height = host!.clientHeight;
        if (!width || !height) return;
        dirty = true;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host!);
      resize();
      const labels = [
        ...(host!
          .closest(".scene-space")
          ?.querySelectorAll<HTMLElement>(".scene-callout") ?? []),
      ];
      const labelPoint = new THREE.Vector3();
      const reduced = matchMedia("(prefers-reduced-motion: reduce)");
      let dragging = false;
      let lastX = 0;
      let userAngle = 0;
      let raf = 0;
      let lastTime = 0;
      let lastSignature = "";
      let currentZoom = 1,
        currentFocusX = 0;
      const down = (e: PointerEvent) => {
        dragging = true;
        lastX = e.clientX;
        host!.setPointerCapture(e.pointerId);
      };
      const move = (e: PointerEvent) => {
        if (dragging) {
          userAngle += (e.clientX - lastX) * 0.006;
          lastX = e.clientX;
        }
      };
      const up = () => {
        dragging = false;
      };
      host!.addEventListener("pointerdown", down);
      host!.addEventListener("pointermove", move);
      host!.addEventListener("pointerup", up);
      host!.addEventListener("pointercancel", up);
      const lost = (e: Event) => {
        e.preventDefault();
        setError(true);
      };
      renderer.domElement.addEventListener("webglcontextlost", lost);
      function render(time: number) {
        raf = requestAnimationFrame(render);
        if (!visible || document.hidden || time - lastTime < 32) return;
        lastTime = time;
        const s = state.current;
        const p = s.manual ?? s.progress;
        const t = reduced.matches || s.paused ? 0 : time * 0.001;
        if (board) {
          const targetZoom =
            state.current.focus === 1
              ? 1.28
              : state.current.focus === 2
                ? 1.15
                : 1;
          const targetX =
            state.current.focus === 1
              ? 0.25
              : state.current.focus === 2
                ? -0.35
                : 0;
          currentZoom = reduced.matches
            ? targetZoom
            : THREE.MathUtils.lerp(currentZoom, targetZoom, 0.13);
          currentFocusX = reduced.matches
            ? targetX
            : THREE.MathUtils.lerp(currentFocusX, targetX, 0.13);
          if (Math.abs(currentZoom - targetZoom) < 0.0001)
            currentZoom = targetZoom;
          if (Math.abs(currentFocusX - targetX) < 0.0001)
            currentFocusX = targetX;
        } else if (mode === "module" || mode === "assembly") {
          currentZoom = reduced.matches
            ? s.zoom ?? 1
            : THREE.MathUtils.lerp(currentZoom, s.zoom ?? 1, 0.13);
          if (Math.abs(currentZoom - (s.zoom ?? 1)) < 0.0001)
            currentZoom = s.zoom ?? 1;
        }
        const signature = `${p.toFixed(4)}|${s.focus}|${userAngle}|${(s.spinAngle ?? 0).toFixed(4)}|${width}|${height}|${currentZoom}|${currentFocusX}|${mode === "ecosystem" || mode === "demo" ? t : 0}`;
        if (signature === lastSignature && !dirty) return;
        dirty = false;
        lastSignature = signature;
        const separation =
          mode === "assembly"
            ? 1 - THREE.MathUtils.smoothstep(p, 0.15, 0.85)
            : Math.min(
                THREE.MathUtils.smoothstep(p, 0.1, 0.48),
                1 - THREE.MathUtils.smoothstep(p, 0.78, 1),
              );
        if (demo) {
          const step = Math.min(6, Math.floor(p * 7));
          demo.mixer?.setTime(step >= 2 && step <= 3 ? t * 0.7 : 0);
          demo.person.position.x = step >= 2 && step <= 3 ? -0.75 + Math.sin(t * 1.6) * 0.06 : -0.75;
          if (demo.hand) {
            const handPosition = new THREE.Vector3();
            demo.hand.getWorldPosition(handPosition);
            stage.worldToLocal(handPosition);
            demo.stick.position.copy(handPosition);
            demo.stick.position.x -= 0.04;
            demo.stick.position.y += 0.04;
            demo.stick.position.z += 0.24;
          } else {
            demo.stick.position.set(0.5, 0.1, 0.3);
          }
          demo.person.visible = step >= 1;
          demo.obstacle.visible = step >= 3 && s.focus !== 1;
          demo.obstacleRight.visible = step >= 3 && s.focus !== 0;
          demo.waves.visible = step === 3;
          demo.beam.visible = step === 4;
          stage.updateMatrixWorld(true);
          demo.beam.children.forEach((child, i) => {
            child.visible = s.focus === 2 || s.focus === i;
            const target = [demo.left, demo.right][i].getWorldPosition(new THREE.Vector3());
            const source = demo.module.getWorldPosition(new THREE.Vector3());
            stage.worldToLocal(target);
            stage.worldToLocal(source);
            (child as THREE.Line).geometry.setFromPoints([source, target]);
          });
          demo.stick.rotation.z = step >= 2 && step <= 3 ? Math.sin(t * 2) * 0.02 : 0;
          const vibrate = step === 5 || step === 4;
          const leftActive = vibrate && s.focus !== 1;
          const rightActive = vibrate && s.focus !== 0;
          demo.left.rotation.z = leftActive ? Math.sin(t * 55) * 0.13 : 0;
          demo.right.rotation.z = rightActive ? Math.sin(t * 55) * 0.13 : 0;
          demo.left.scale.setScalar(
            leftActive ? 1 + Math.sin(t * 25) * 0.13 : 1,
          );
          demo.right.scale.setScalar(
            rightActive ? 1 + Math.sin(t * 25) * 0.13 : 1,
          );
          for (const [i, wrist] of [demo.left, demo.right].entries())
            wrist.children.forEach((child) => {
              if (child.name === "haptic-ring") {
                child.visible = step === 5 && (s.focus === 2 || s.focus === i);
                child.scale.setScalar(1 + ((t * 1.5) % 1) * 0.8);
              }
            });
          host!.dataset.demoStep = String(step + 1);
          host!.dataset.alertLeft = String(
            step >= 4 && step <= 5 && s.focus !== 1,
          );
          host!.dataset.alertRight = String(
            step >= 4 && step <= 5 && s.focus !== 0,
          );
        }
        if (mode === "watch" || mode === "module" || mode === "assembly")
          explode(models[0], separation);
        if (mode === "module" || mode === "assembly") {
          const cover = models[0]?.parts.find((part) => part.object.name === "front-shell");
          cover?.object.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhysicalMaterial) {
              child.material.opacity = THREE.MathUtils.lerp(0.88, 0.34, separation);
            }
          });
        }
        stage.rotation.y =
          (mode === "demo"
            ? 0
            : mode === "module" || mode === "assembly"
              ? -0.3
              : -0.35) +
          userAngle +
          (s.spinAngle ?? 0) +
          (mode === "ecosystem" ? Math.sin(t * 0.13) * 0.045 : (p - 0.5) * 0.5);
        stage.rotation.z =
          mode === "watch" ? -0.12 : mode === "electronics" ? 0.08 : 0;
        const narrow = width / height < 0.9;
        const base =
          mode === "ecosystem"
            ? 15
            : mode === "demo"
              ? 8.8
              : mode === "module" || mode === "assembly"
                ? 14
                : 11;
        camera.position.set(
          3.2 + (p - 0.5) * 1.2,
          mode === "demo" ? 3.1 : 7.7 + (mode === "electronics" ? 1 : 0),
          (base * (narrow ? 1.3 : 1)) / currentZoom,
        );
        camera.lookAt(
          currentFocusX,
          mode === "watch" ? separation * 0.4 : mode === "demo" ? 0.3 : 0,
          0,
        );
        if (board) {
          board.root.scale.setScalar(1.45);
          board.carriers.position.y = separation * 0.1;
          (board.chip.material as THREE.MeshStandardMaterial).emissive.setHex(
            s.focus === 1 ? 0x7a1720 : 0x000000,
          );
          m.gold.emissive.setHex(s.focus === 2 ? 0x513210 : 0x000000);
        }
        if (mode === "ecosystem") {
          signals.forEach((o, i) => {
            const active = s.focus === 2 || s.focus === i;
            o.visible = active;
            o.position.copy(paths[i].getPoint((t * 0.32 + i * 0.45) % 1));
          });
          models.slice(1).forEach((w, i) => {
            const active = s.focus === 2 || s.focus === i;
            const pulse = (t * 0.32 + i * 0.45) % 1;
            w.root.rotation.z =
              active && !reduced.matches && pulse > 0.78 ? Math.sin(t * 85) * 0.025 : 0;
          });
          host!.dataset.alertLeft = String(s.focus !== 1);
          host!.dataset.alertRight = String(s.focus !== 0);
        }
        renderer.render(scene, camera);
        labels.forEach((label) => {
          const anchor = models[0]?.anchors[label.dataset.part!];
          if (!anchor) return;
          labelPoint
            .set(mode === "watch" ? 1.1 : 1, 0, 0)
            .applyMatrix4(anchor.matrixWorld)
            .project(camera);
          label.style.left = `${(labelPoint.x * 0.5 + 0.5) * width}px`;
          label.style.top = `${(-labelPoint.y * 0.5 + 0.5) * height}px`;
          label.style.opacity = separation > 0.35 ? "1" : "0";
        });
        host!.dataset.progress = p.toFixed(3);
        host!.dataset.explosion = separation.toFixed(3);
        host!.dataset.rendered = "true";
        host!.dataset.focus = String(s.focus);
        host!.dataset.rotation = stage.rotation.y.toFixed(3);
        host!.dataset.zoom = currentZoom.toFixed(3);
      }
      render(0);
      ready.current?.();
      return () => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        host!.removeEventListener("pointerdown", down);
        host!.removeEventListener("pointermove", move);
        host!.removeEventListener("pointerup", up);
        host!.removeEventListener("pointercancel", up);
        renderer.domElement.removeEventListener("webglcontextlost", lost);
        disposeModel(scene);
        Object.values(m).forEach((material) => {
          material.bumpMap?.dispose();
          material.dispose();
        });
        referenceTexture?.dispose();
        key.shadow.dispose();
        environment.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    }
    return () => {
      disposed = true;
      observer.disconnect();
      cleanup?.();
    };
  }, [mode, state]);
  return (
    <div
      ref={mount}
      className={`engineering-canvas ${className}`}
      role="img"
      aria-label={`${mode} interactive 3D engineering visualization. The assistive module uses geometry from TSI REV3.step. Drag to rotate; use the controls below to inspect assembly stages.`}
    >
      {error && (
        <div className="webgl-fallback">
          <strong>3D rendering is unavailable in this browser.</strong>
          <p>
            The component descriptions and original references remain available
            below.
          </p>
          <a href={mode === "watch" || mode === "electronics" ? "/assets/circuit-board.jpg" : "/assets/tsi-rev3-cad-preview.png"} target="_blank" rel="noreferrer">
            Open the supplied hardware reference ↗
          </a>
        </div>
      )}
    </div>
  );
}
