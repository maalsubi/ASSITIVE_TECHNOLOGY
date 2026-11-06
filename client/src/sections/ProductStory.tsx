import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { CadKind, CadViewState } from "../components/engineering/CadProductViewer";
import "../styles/product-story.css";

const CadProductViewer = lazy(() => import("../components/engineering/CadProductViewer"));

const content = {
  module: {
    id: "assistive-module",
    number: "02",
    eyebrow: "ASSISTIVE MODULE / TSI REV3",
    title: <>ANATOMY OF AN <em>IDEA.</em></>,
    intro: "The supplied handle assembly, viewed from its exterior through its actual CAD layers.",
    count: "314 SOURCE SOLIDS · 7 WEB GROUPS",
    stages: [
      ["COMPLETE REVEAL", "The STEP-derived assistive module in its source assembly position."],
      ["EXTERIOR", "Rotate around the enclosure and inspect its openings, grip and visible fastener geometry."],
      ["ASSEMBLY", "The housing and boards separate along the board normal while retaining their original alignment."],
      ["PCB", "Move closer to the two boards and the electronic shapes present in the source file."],
      ["DETAIL", "Inspect the visible packages. Electrical roles require a schematic or bill of materials."],
      ["REASSEMBLED", "Each group returns to its exact source position."],
    ],
    note: "STEP geometry is authentic. Separation paths are presentation motions inferred from the layer orientation; they are not assembly instructions.",
  },
  watch: {
    id: "watches",
    number: "03",
    eyebrow: "WEARABLE WATCH / TSI WRIST BAND",
    title: <>A SIGNAL AT <em>THE WRIST.</em></>,
    intro: "A second, independent deep dive built from the supplied wearable STEP assembly.",
    count: "98 SOURCE SOLIDS · 6 WEB GROUPS",
    stages: [
      ["WATCH REVEAL", "The supplied housing and PCB are shown in their original assembly positions."],
      ["EXTERIOR", "Inspect the enclosure, visible openings and attachment lugs. No separate strap solid is present in this STEP file."],
      ["ASSEMBLY", "The actual enclosure and board geometry separate along their common assembly normal."],
      ["ELECTRONICS", "Move toward the source PCB and visible component geometry."],
      ["CLOSE-UP", "The STEP names include an ESP32-C3 SuperMini model, LEDs and passive packages. Their circuit behavior is unverified."],
      ["TWO WATCHES", "Two instances of this same CAD design represent the intended left and right wearables."],
    ],
    note: "One exact duplicate solid is represented once in the web mesh. The supplied watch STEP does not include a separate strap. Separation paths are illustrative.",
  },
} as const;

export function ProductStory({ kind }: { kind: CadKind }) {
  const info = content[kind];
  const section = useRef<HTMLElement>(null);
  const articles = useRef<(HTMLElement | null)[]>([]);
  const view = useRef<CadViewState>({ progress: 0, yaw: 0, zoom: 1 });
  const progressFill = useRef<HTMLSpanElement>(null);
  const userScrollUntil = useRef(0);
  const [active, setActive] = useState(0);
  const [zoomLabel, setZoomLabel] = useState(100);
  useEffect(() => {
    let scheduled = false;
    const update = () => {
      scheduled = false;
      const first = articles.current[0], last = articles.current[5];
      if (!first || !last) return;
      const midpoint = innerHeight * 0.5;
      const start = scrollY + first.getBoundingClientRect().top + first.offsetHeight / 2 - midpoint;
      const end = scrollY + last.getBoundingClientRect().top + last.offsetHeight / 2 - midpoint;
      const progress = Math.max(0, Math.min(1, (scrollY - start) / Math.max(1, end - start)));
      view.current.progress = progress;
      if (progressFill.current) progressFill.current.style.transform = `scaleX(${progress})`;
      setActive((current) => {
        const next = Math.min(5, Math.round(progress * 5));
        return current === next ? current : next;
      });
    };
    const onScroll = () => {
      // Manual offsets are temporary: real scrolling resumes the authored timeline.
      if (performance.now() < userScrollUntil.current) {
        view.current.yaw = 0;
        if (view.current.zoom !== 1) { view.current.zoom = 1; setZoomLabel(100); }
      }
      if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
    };
    const onScrollIntent = () => { userScrollUntil.current = performance.now() + 900; };
    const onScrollKey = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) onScrollIntent();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("wheel", onScrollIntent, { passive: true });
    window.addEventListener("touchmove", onScrollIntent, { passive: true });
    window.addEventListener("keydown", onScrollKey);
    update();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); window.removeEventListener("wheel", onScrollIntent); window.removeEventListener("touchmove", onScrollIntent); window.removeEventListener("keydown", onScrollKey); };
  }, []);
  const pointer = useRef<number | null>(null);
  const onPointerMove = (event: React.PointerEvent) => {
    if (pointer.current === null) return;
    view.current.yaw += (event.clientX - pointer.current) * 0.007;
    pointer.current = event.clientX;
  };
  return <section id={info.id} className={`product-story product-story--${kind}`} ref={section} aria-label={kind === "module" ? "Explore the assistive module" : "Explore the wearable watch"}>
    <div className="product-story__intro">
      <span className="eyebrow"><b>{info.number}</b> / {info.eyebrow}</span>
      <h2>{info.title}</h2>
      <p>{info.intro}</p>
      <span className="product-story__count">{info.count}</span>
    </div>
    <div className="product-story__layout">
      <div className="product-story__sticky">
        <div className="product-story__stage" onPointerDown={(event) => { if ((event.target as HTMLElement).closest(".product-story__controls")) return; pointer.current = event.clientX; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={onPointerMove} onPointerUp={() => { pointer.current = null; }} onPointerCancel={() => { pointer.current = null; }}>
          <Suspense fallback={<div className="cad-viewer__placeholder"><img src={`/assets/${kind === "module" ? "tsi-module-hero" : "tsi-watch-hero"}.png`} alt="" /><span>PREPARING CAD VIEW</span></div>}>
            <CadProductViewer kind={kind} state={view} />
          </Suspense>
          <div className="product-story__stage-index" aria-live="off">0{active + 1} <span>/ 06</span></div>
          <div className="product-story__controls" aria-label={`${kind} viewing controls`}>
            <button onClick={() => { view.current.yaw += Math.PI / 2; }} aria-label={`Rotate ${kind}`}>ROTATE ↻</button>
            <button onClick={() => { view.current.zoom = Math.max(0.75, view.current.zoom - 0.15); setZoomLabel(Math.round(view.current.zoom * 100)); }} aria-label={`Zoom out ${kind}`}>−</button>
            <button onClick={() => { view.current.zoom = Math.min(1.5, view.current.zoom + 0.15); setZoomLabel(Math.round(view.current.zoom * 100)); }} aria-label={`Zoom in ${kind}`}>+</button>
            <span>{zoomLabel}%</span>
          </div>
        </div>
        <div className="product-story__progress" aria-hidden="true"><span ref={progressFill} /></div>
        <p className="product-story__source">SOURCE / {kind === "module" ? "TSI REV3.step" : "TSI Wrist Band.step"}</p>
        <div className="product-story__mobile-copy" aria-live="polite">
          <span>0{active + 1} / 06</span>
          <h3>{info.stages[active][0]}</h3>
          <p>{info.stages[active][1]}</p>
        </div>
      </div>
      <div className="product-story__rail">
        {info.stages.map(([title, description], index) => <article key={title} ref={(node) => { articles.current[index] = node; }} className={active === index ? "is-active" : ""}>
          <span>0{index + 1} / 06</span>
          <h3>{title}</h3>
          <p>{description}</p>
        </article>)}
      </div>
    </div>
    <p className="product-story__note">{info.note}</p>
  </section>;
}
