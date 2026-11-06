import { useRef, useState } from "react";
import gsap from "gsap";
import { RotateCcw, ArrowUpRight } from "lucide-react";
import { Scene } from "../components/engineering/Scene";
import type { SceneMode, SceneState } from "../components/engineering/EngineeringScene";
import "../styles/explore-product.css";

type View = "module" | "watch" | "electronics" | "film";
const views: { id: View; label: string; title: string; description: string }[] = [
  {
    id: "module",
    label: "01 / CAD ASSEMBLY",
    title: "Inside the module",
    description:
      "Rotate, zoom and separate the supplied TSI REV3 STEP assembly. All 314 source solids are represented; small details are grouped for web performance.",
  },
  {
    id: "electronics",
    label: "02 / PCB DETAIL",
    title: "Under the cover",
    description:
      "Inspect the visible board layout. Component identities and electrical functions need a schematic or bill of materials for verification.",
  },
  {
    id: "watch",
    label: "03 / WEARABLE",
    title: "The wrist interface",
    description:
      "Explore an illustrative reconstruction based on the supplied watch photograph and board reference. It is not manufacturing CAD.",
  },
  {
    id: "film",
    label: "04 / STUDIO FILM",
    title: "Form from the source",
    description:
      "A Blender-rendered turntable made from the supplied STEP geometry, with its source assembly positions preserved.",
  },
];

export function ExploreProduct() {
  const state = useRef<SceneState>({
    progress: 0,
    focus: 0,
    manual: 0,
    paused: false,
    spinAngle: 0,
    zoom: 1,
  });
  const tween = useRef<gsap.core.Tween | null>(null);
  const [view, setView] = useState<View>("module");
  const [assembly, setAssembly] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [boardFocus, setBoardFocus] = useState(0);
  const current = views.find((item) => item.id === view)!;
  function selectView(next: View) {
    tween.current?.kill();
    state.current.progress = 0;
    state.current.manual = 0;
    state.current.focus = 0;
    setAssembly(0);
    setBoardFocus(0);
    setView(next);
  }
  function inspect(value: number) {
    tween.current?.kill();
    tween.current = gsap.to(state.current, {
      manual: value,
      duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1,
      ease: "power2.inOut",
    });
    setAssembly(value);
  }
  function rotate() {
    gsap.to(state.current, {
      spinAngle: (state.current.spinAngle ?? 0) + Math.PI * 2,
      duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 4,
      ease: "power2.inOut",
    });
  }
  function adjustZoom(delta: number) {
    const next = Math.max(0.8, Math.min(1.55, zoom + delta));
    state.current.zoom = next;
    setZoom(next);
  }
  return (
    <section id="explore-product" className="explore-product" aria-labelledby="explore-title">
      <div className="explore-heading">
        <span className="eyebrow"><b>03</b> / EXPLORE THE PRODUCT</span>
        <h2 id="explore-title">ENGINEERING, <em>IN YOUR HANDS.</em></h2>
        <p>One place to inspect the supplied CAD, examine the reference electronics and view the studio render.</p>
      </div>
      <div className="explore-tabs" role="tablist" aria-label="Product exploration views">
        {views.map((item, i) => (
          <button
            key={item.id}
            id={`explore-tab-${item.id}`}
            role="tab"
            aria-selected={view === item.id}
            aria-controls="explore-panel"
            tabIndex={view === item.id ? 0 : -1}
            onClick={() => selectView(item.id)}
            onKeyDown={(event) => {
              const next = event.key === "ArrowRight" ? (i + 1) % views.length : event.key === "ArrowLeft" ? (i + views.length - 1) % views.length : null;
              if (next === null) return;
              event.preventDefault();
              selectView(views[next].id);
              document.getElementById(`explore-tab-${views[next].id}`)?.focus();
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div id="explore-panel" className="explore-panel" role="tabpanel" aria-labelledby={`explore-tab-${view}`}>
        <div className="explore-stage">
          {view === "film" ? (
            <video controls loop muted playsInline preload="metadata" poster="/assets/tsi-rev3-cad-preview.png" aria-label="Blender turntable of the TSI REV3 module">
              <source src="/assets/tsi-rev3-turntable.mp4" type="video/mp4" />
              Your browser cannot play this product animation.
            </video>
          ) : (
            <Scene key={view} mode={view as SceneMode} state={state} />
          )}
          <span className="explore-stage-tag">{view === "module" || view === "film" ? "TSI REV3 / STEP-DERIVED GEOMETRY" : "ILLUSTRATIVE REFERENCE STUDY"}</span>
        </div>
        <div className="explore-detail">
          <span className="eyebrow">{current.label}</span>
          <h3>{current.title}</h3>
          <p>{current.description}</p>
          {view === "module" && (
            <>
              <div className="explore-control-group" aria-label="CAD assembly controls">
                <button onClick={() => inspect(0)} aria-pressed={assembly === 0}>ASSEMBLED</button>
                <button onClick={() => inspect(0.55)} aria-pressed={assembly === 0.55}>EXPLODE VIEW</button>
                <button onClick={() => inspect(1)} aria-pressed={assembly === 1}><RotateCcw size={14} /> REASSEMBLE</button>
              </div>
              <div className="explore-control-group" aria-label="CAD viewing controls">
                <button onClick={rotate} aria-label="Rotate product 360 degrees">360° ROTATE</button>
                <button onClick={() => adjustZoom(-0.15)} aria-label="Zoom out">−</button>
                <button onClick={() => adjustZoom(0.15)} aria-label="Zoom in">+</button>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
            </>
          )}
          {view === "watch" && (
            <div className="explore-control-group" aria-label="Watch assembly controls">
              <button onClick={() => inspect(0)} aria-pressed={assembly === 0}>ASSEMBLED</button>
              <button onClick={() => inspect(0.55)} aria-pressed={assembly === 0.55}>EXPLODE VIEW</button>
              <button onClick={() => inspect(1)} aria-pressed={assembly === 1}>REASSEMBLE</button>
            </div>
          )}
          {view === "electronics" && (
            <>
              <div className="explore-control-group" aria-label="PCB viewing controls">
                {["Complete board", "Visible packages", "Contacts"].map((label, i) => (
                  <button key={label} aria-pressed={boardFocus === i} onClick={() => { setBoardFocus(i); state.current.focus = i; }}>{label}</button>
                ))}
              </div>
              <a className="explore-reference" href="/assets/circuit-board.jpg" target="_blank" rel="noreferrer">VIEW ORIGINAL CAD REFERENCE <ArrowUpRight size={14} /></a>
            </>
          )}
          <p className="model-disclosure">
            {view === "module" || view === "film"
              ? "Actual STEP-derived geometry. Exploded motion is illustrative; physical mounting to a stick has not been verified."
              : "Reference-based illustration. Dimensions, package identities and hardware behavior are pending verification."}
          </p>
        </div>
      </div>
    </section>
  );
}
