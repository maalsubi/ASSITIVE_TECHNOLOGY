import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowUpRight, Pause, Play, RotateCcw } from "lucide-react";
import { Scene } from "../components/engineering/Scene";
import type {
  SceneMode,
  SceneState,
} from "../components/engineering/EngineeringScene";
import "../styles/engineering.css";
gsap.registerPlugin(ScrollTrigger);
const chapters = {
  watch: {
    id: "introduction",
    number: "01",
    eyebrow: "WEARABLE / HARDWARE EXPLORATION",
    title: (
      <>
        THE WATCH,
        <br />
        <em>REENGINEERED.</em>
      </>
    ),
    intro: "A closer look at the hardware you can feel.",
    note: "Reference-based 3D reconstruction. Geometry and separation are illustrative, not manufacturing CAD.",
    steps: [
      [
        "01",
        "A connected wearable",
        "The rectangular enclosure, transparent top cover and woven strap follow the supplied watch photograph.",
      ],
      [
        "02",
        "Open the enclosure",
        "The clear cover lifts away to reveal the board. Fasteners separate as part of this illustrative assembly sequence.",
      ],
      [
        "03",
        "Inside the wearable",
        "The PCB and visible package arrangement are reconstructed from your CAD reference. Component identities are not inferred.",
      ],
      [
        "04",
        "Back into place",
        "Cover, board and enclosure reunite. Scroll back to explore the assembly in reverse.",
      ],
    ],
    labels: [
      ["cover", "Transparent top cover"],
      ["pcb", "PCB · CAD reference"],
      ["enclosure", "Outer enclosure"],
    ],
  },
  module: {
    id: "product",
    number: "02",
    eyebrow: "ASSISTIVE MODULE / STRUCTURAL STUDY",
    title: (
      <>
        INSIDE THE
        <br />
        <em>ASSISTIVE MODULE.</em>
      </>
    ),
    intro: "The familiar silhouette. An entirely new perspective.",
    note: "The enclosure, boards and electronic details come from all 314 solids in the supplied TSI REV3.step. Small details are grouped for web performance; the exploded motion is illustrative.",
    steps: [
      [
        "01",
        "Designed around the grip",
        "The enclosure silhouette comes from the supplied STEP assembly, with its actual grip profile and openings.",
      ],
      [
        "02",
        "Beyond the surface",
        "Two separately exported enclosure solids move apart to reveal the board geometry inside.",
      ],
      [
        "03",
        "Room for the electronics",
        "Two board solids and the source electronic details are presented from the STEP file. Their electrical functions remain unverified.",
      ],
      [
        "04",
        "One complete module",
        "All displayed STEP geometry returns to its source assembly position.",
      ],
    ],
    labels: [
      ["front-shell", "Enclosure cover · STEP solid"],
      ["main-board", "Board · STEP solid"],
      ["secondary-board", "Second board · STEP solid"],
      ["electronic-details", "Electronic details · STEP geometry"],
      ["rear-shell", "Enclosure body · STEP solid"],
    ],
  },
  assembly: {
    id: "assembly",
    number: "05",
    eyebrow: "ASSEMBLY / FROM THE INSIDE OUT",
    title: (
      <>
        FROM COMPONENTS
        <br />
        <em>TO PRODUCT.</em>
      </>
    ),
    intro: "Separate parts. One purposeful assembly.",
    note: "CAD-derived assembly motion. All 314 source solids are included, with the small details grouped for web performance.",
    steps: [
      [
        "01",
        "Every layer, in view",
        "Begin with the STEP enclosure and selected board solids separated in space.",
      ],
      [
        "02",
        "A shared structure",
        "Each exported solid moves toward its original assembly position.",
      ],
      [
        "03",
        "Coming together",
        "The board solids settle between the two enclosure layers.",
      ],
      [
        "04",
        "Ready for the next step",
        "The module takes shape. Explore the ecosystem or talk to us about the technology.",
      ],
    ],
    labels: [
      ["front-shell", "Enclosure face"],
      ["main-board", "Board solid"],
      ["rear-shell", "Enclosure body"],
    ],
  },
};
type JourneyKind = keyof typeof chapters;
export function HardwareJourney({ kind }: { kind: JourneyKind }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const state = useRef<SceneState>({
    progress: 0,
    focus: 0,
    manual: null,
    paused: false,
    spinAngle: 0,
  });
  const [phase, setPhase] = useState(0);
  const [manual, setManual] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const c = chapters[kind];
  const phaseRef = useRef(-1);
  const manualTween = useRef<gsap.core.Tween | null>(null);
  const rotationTween = useRef<gsap.core.Tween | null>(null);
  useEffect(() => {
    const releaseManual = () => {
      if (state.current.manual === null) return;
      manualTween.current?.kill();
      state.current.manual = null;
      setManual(null);
    };
    window.addEventListener("wheel", releaseManual, { passive: true });
    window.addEventListener("touchmove", releaseManual, { passive: true });
    const mm = gsap.matchMedia();
    mm.add(
      {
        desktop: "(min-width: 1000px)",
        mobile: "(max-width: 999px)",
        reduce: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        if (context.conditions?.reduce) {
          state.current.progress = kind === "assembly" ? 0.3 : 0.55;
          setPhase(2);
          return;
        }
        const tween = gsap.fromTo(
          state.current,
          { progress: 0 },
          {
            progress: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section.current,
              start: context.conditions?.desktop ? "top top" : "top 70%",
              end: context.conditions?.desktop ? "+=1900" : "bottom 20%",
              pin: context.conditions?.desktop ? stage.current : false,
              scrub: 0.65,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (state.current.manual !== null) return;
                const next = Math.min(3, Math.floor(self.progress * 4));
                if (next !== phaseRef.current) {
                  phaseRef.current = next;
                  setPhase(next);
                }
              },
            },
          },
        );
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      },
    );
    return () => {
      manualTween.current?.kill();
      rotationTween.current?.kill();
      window.removeEventListener("wheel", releaseManual);
      window.removeEventListener("touchmove", releaseManual);
      mm.revert();
    };
  }, [kind]);
  function inspect(value: number) {
    manualTween.current?.kill();
    state.current.manual ??= state.current.progress;
    manualTween.current = gsap.to(state.current, {
      manual: value,
      duration: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : 1.15,
      ease: "power2.inOut",
    });
    setManual(value);
    setPhase(value === 0 ? 0 : value === 1 ? 3 : 2);
  }
  function rotate() {
    rotationTween.current?.kill();
    rotationTween.current = gsap.to(state.current, {
      spinAngle: (state.current.spinAngle ?? 0) + Math.PI * 2,
      duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 5,
      ease: "power2.inOut",
    });
  }
  function adjustZoom(delta: number) {
    const next = Math.max(0.8, Math.min(1.55, zoom + delta));
    state.current.zoom = next;
    setZoom(next);
  }
  return (
    <section
      ref={section}
      className={`hardware-journey journey-${kind}`}
      id={c.id}
    >
      <div ref={stage} className="journey-stage">
        <div className="journey-top">
          <span className="eyebrow">
            <b>{c.number}</b> / {c.eyebrow}
          </span>
          <span className="chapter-counter">TSI ENGINEERING / {c.number}</span>
        </div>
        <div className="journey-title">
          <h2>{c.title}</h2>
          <p>{c.intro}</p>
        </div>
        <div className="scene-space">
          <Scene mode={kind} state={state} />
          <div className="scene-callouts" aria-hidden="true">
            {c.labels.map(([part, label]) => (
              <span key={part} data-part={part} className="scene-callout">
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="journey-caption" aria-live="polite">
          <span className="caption-number">{c.steps[phase][0]}</span>
          <div>
            <h3>{c.steps[phase][1]}</h3>
            <p>{c.steps[phase][2]}</p>
          </div>
        </div>
        <div className="journey-controls">
          <div
            className="view-controls"
            aria-label={`${kind} assembly controls`}
          >
            <button onClick={() => inspect(0)} aria-pressed={manual === 0}>
              {kind === "assembly" ? "SEPARATED" : "ASSEMBLED"}
            </button>
            <button
              onClick={() => inspect(0.55)}
              aria-pressed={manual === 0.55}
            >
              EXPLORE LAYERS
            </button>
            <button onClick={() => inspect(1)} aria-pressed={manual === 1}>
              <RotateCcw size={12} /> REASSEMBLE
            </button>
          </div>
          {kind !== "watch" && (
            <div className="cad-controls" aria-label="CAD product viewer controls">
              <button type="button" onClick={rotate} aria-label="Rotate product 360 degrees">360°</button>
              <button type="button" onClick={() => adjustZoom(-0.15)} aria-label="Zoom out">−</button>
              <button type="button" onClick={() => adjustZoom(0.15)} aria-label="Zoom in">+</button>
            </div>
          )}
          <span className="drag-hint">
            DRAG TO ROTATE <span>↔</span>
          </span>
          <a
            href={
              kind === "watch"
                ? "#explore-product"
                : kind === "module"
                  ? "#how-it-works"
                  : "#contact"
            }
            className="journey-next"
          >
            {kind === "assembly" ? "LET’S TALK" : "NEXT CHAPTER"}{" "}
            <ArrowDown size={13} />
          </a>
        </div>
        <p className="model-disclosure">{c.note}</p>
        <div className="journey-progress" aria-hidden="true">
          {c.steps.map((_, i) => (
            <span key={i} className={phase >= i ? "passed" : ""} />
          ))}
        </div>
      </div>
    </section>
  );
}
const boardViews = [
  [
    "Complete PCB",
    "The supplied CAD view, placed on a dimensional board. It preserves the visible layout without assigning unverified electrical functions.",
  ],
  [
    "Visible packages",
    "Raised package geometry follows the visible component groupings. Controller and communication identities require a schematic or bill of materials.",
  ],
  [
    "Contacts & mounting",
    "The CAD reference shows contact pads and corner mounting locations. This view illustrates their arrangement, not measured dimensions.",
  ],
];
export function Electronics() {
  const state = useRef<SceneState>({
    progress: 0.5,
    focus: 0,
    manual: null,
    paused: false,
  });
  const [focus, setFocus] = useState(0);
  return (
    <section id="electronics" className="electronics-section">
      <div className="electronics-copy">
        <span className="eyebrow">
          <b>03</b> / UNDER THE COVER
        </span>
        <h2>
          THE
          <br />
          <em>ELECTRONICS.</em>
        </h2>
        <p>
          Small details.
          <br />A closer understanding.
        </p>
        <div
          className="board-selectors"
          role="tablist"
          aria-label="PCB inspection views"
        >
          {boardViews.map(([title], i) => (
            <button
              key={title}
              role="tab"
              id={`board-tab-${i}`}
              aria-controls="board-detail"
              aria-selected={i === focus}
              tabIndex={i === focus ? 0 : -1}
              onKeyDown={(event) => {
                const next =
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? 2
                      : ["ArrowRight", "ArrowDown"].includes(event.key)
                        ? (i + 1) % 3
                        : ["ArrowLeft", "ArrowUp"].includes(event.key)
                          ? (i + 2) % 3
                          : null;
                if (next === null) return;
                event.preventDefault();
                setFocus(next);
                state.current.focus = next;
                document.getElementById(`board-tab-${next}`)?.focus();
              }}
              onClick={() => {
                setFocus(i);
                state.current.focus = i;
              }}
            >
              <span>0{i + 1}</span>
              {title}
              <ArrowUpRight size={15} />
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id="board-detail"
          aria-labelledby={`board-tab-${focus}`}
        >
          <h3>{boardViews[focus][0]}</h3>
          <p>{boardViews[focus][1]}</p>
        </div>
        <a
          className="reference-link"
          href="/assets/circuit-board.jpg"
          target="_blank"
          rel="noreferrer"
        >
          VIEW ORIGINAL CAD REFERENCE <ArrowUpRight size={12} />
        </a>
      </div>
      <div className="electronics-stage">
        <Scene mode="electronics" state={state} />
        <div className="pcb-stamp">
          PCB / REFERENCE STUDY
          <span>Original CAD surface · reconstructed depth</span>
        </div>
      </div>
    </section>
  );
}
export function ConnectedEcosystem() {
  const state = useRef<SceneState>({
    progress: 0,
    focus: 0,
    manual: null,
    paused: false,
  });
  const [paused, setPaused] = useState(false);
  return (
    <section id="ecosystem" className="connected-section">
      <div className="connected-heading">
        <span className="eyebrow">
          <b>04</b> / DETECT. COMMUNICATE. FEEL.
        </span>
        <h2>
          ONE CONNECTED
          <br />
          <em>ECOSYSTEM.</em>
        </h2>
        <p>
          This view illustrates the both-side obstacle scenario, with alerts to
          both wrists.
          <br />
          The response becomes something you can feel.
        </p>
      </div>
      <div className="connected-stage">
        <Scene mode="ecosystem" state={state} />
        <span className="device-label device-one">01 / WEARABLE</span>
        <span className="device-label device-module">ASSISTIVE MODULE</span>
        <span className="device-label device-two">02 / WEARABLE</span>
      </div>
      <div className="ecosystem-bottom">
        <span>
          OBSTACLE DETECTION <i>→</i> WIRELESS ALERT <i>→</i> HAPTIC FEEDBACK
        </span>
        <button
          onClick={() => {
            state.current.paused = !paused;
            setPaused(!paused);
          }}
        >
          {paused ? <Play size={13} /> : <Pause size={13} />}{" "}
          {paused ? "PLAY SIGNAL" : "PAUSE SIGNAL"}
        </button>
      </div>
      <p className="model-disclosure">
        Two separately rendered 3D watch instances. Both-side scenario
        simulation; not connected to verified hardware.
      </p>
    </section>
  );
}
