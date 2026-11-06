import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/demo.css";
gsap.registerPlugin(ScrollTrigger);
const steps = [
  [
    "MOUNT",
    "The supplied STEP-derived handle is shown with an illustrative shaft connection. Its physical mounting requires a measured assembly reference.",
  ],
  ["WEAR", "One watch is secured on each wrist: left and right."],
  [
    "WALK",
    "The user holds the assembled stick while approaching the path ahead.",
  ],
  [
    "DETECT",
    "The film presents left, right and both-side obstacles in sequence. Sensor positions are not established by the supplied CAD.",
  ],
  [
    "TRANSMIT",
    "The alert travels to the wrist corresponding to the obstacle direction. Both paths activate only for obstacles on both sides.",
  ],
  [
    "VIBRATE",
    "Watch highlights illustrate left-only, right-only and both-side haptic alerts in sequence. Physical vibration remains unverified.",
  ],
  ["RESPOND", "The user slows or stops and decides how to move next."],
] as const;
export function ProductDemo() {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const manual = useRef(false);
  const userScrollUntil = useRef(0);
  const [step, setStep] = useState(0);
  const [scenario, setScenario] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const index = (p: number) => setStep(Math.min(6, Math.floor(p * 7)));
  useEffect(() => {
    const onUserScroll = () => {
      manual.current = false;
      userScrollUntil.current = performance.now() + 700;
    };
    window.addEventListener("wheel", onUserScroll, { passive: true });
    window.addEventListener("touchmove", onUserScroll, { passive: true });
    const onScrollKey = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) onUserScroll();
    };
    window.addEventListener("keydown", onScrollKey);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    if (section.current) observer.observe(section.current);
    const trigger = ScrollTrigger.create({
      trigger: section.current,
      start: "top 75%",
      end: "bottom 25%",
      onUpdate: (self) => {
        if ((video.current && !video.current.paused) || manual.current || performance.now() > userScrollUntil.current) return;
        const duration = video.current?.duration || 14;
        if (video.current) video.current.currentTime = Math.min(duration - 0.02, self.progress * duration);
        setProgress(self.progress);
        index(self.progress);
      },
    });
    return () => {
      observer.disconnect();
      window.removeEventListener("wheel", onUserScroll);
      window.removeEventListener("touchmove", onUserScroll);
      window.removeEventListener("keydown", onScrollKey);
      trigger.kill();
    };
  }, []);
  useEffect(() => {
    if (!visible && playing) {
      video.current?.pause();
      setPlaying(false);
    }
  }, [visible, playing]);
  function go(i: number, fraction = 0.01) {
    video.current?.pause();
    const p = (i + fraction) / 7;
    if (video.current) video.current.currentTime = p * (video.current.duration || 14);
    manual.current = true;
    setProgress(p);
    index(p);
    setPlaying(false);
  }
  function play() {
    if (step === 6) go(0);
    manual.current = false;
    void video.current?.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }
  function pause() {
    video.current?.pause();
    setPlaying(false);
  }
  return (
    <section id="demonstration" className="product-demo" ref={section}>
      <div className="demo-header">
        <span className="eyebrow">
          <b>02</b> / COMPLETE PRODUCT DEMONSTRATION
        </span>
        <h2>
          FROM ASSEMBLY
          <br />
          <em>TO ASSISTANCE.</em>
        </h2>
        <p>One stick. Two wrists. One connected assistive system.</p>
      </div>
      <div
        className="scenario-select"
        role="group"
        aria-label="Obstacle direction"
      >
        {[
          ["LEFT OBSTACLE", "LEFT WRIST ALERT"],
          ["RIGHT OBSTACLE", "RIGHT WRIST ALERT"],
          ["BOTH SIDES", "BOTH WRIST ALERTS"],
        ].map(([label, result], i) => (
          <button
            key={label}
            aria-pressed={scenario === i}
            onClick={() => {
              setScenario(i);
              go(step >= 3 && step <= 5 ? step : 3, i / 3 + 0.02);
            }}
          >
            {label}
            <span>{result}</span>
          </button>
        ))}
      </div>
      <div className="demo-stage">
        <video
          ref={video}
          playsInline
          muted
          preload="metadata"
          poster="/assets/tsi-cinematic-poster.png"
          aria-label="Seven-scene Blender concept film showing the assistive stick, two watches, walking, directional alerts and response"
          onTimeUpdate={(event) => {
            const element = event.currentTarget;
            const next = element.duration ? element.currentTime / element.duration : 0;
            setProgress(next);
            index(next);
          }}
          onEnded={() => setPlaying(false)}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
        >
          <source src="/assets/tsi-human-cinematic.mp4" type="video/mp4" />
          Your browser cannot play this demonstration film.
        </video>
        <div className="demo-progress" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Demonstration progress"><span style={{ width: `${progress * 100}%` }} /></div>
        <div className="demo-stage-label">
          {String(step + 1).padStart(2, "0")} / {steps[step][0]}
        </div>
      </div>
      <div className="demo-caption">
        <h3>{steps[step][0]}</h3>
        <p>{steps[step][1]}</p>
      </div>
      <div
        className="demo-steps"
        role="tablist"
        aria-label="Demonstration scenes"
      >
        {steps.map(([name], i) => (
          <button
            key={name}
            role="tab"
            aria-selected={step === i}
            tabIndex={step === i ? 0 : -1}
            onClick={() => go(i)}
            onKeyDown={(e) => {
              const next =
                e.key === "ArrowRight"
                  ? (i + 1) % 7
                  : e.key === "ArrowLeft"
                    ? (i + 6) % 7
                    : null;
              if (next !== null) {
                e.preventDefault();
                go(next);
                document.getElementById(`demo-step-${next}`)?.focus();
              }
            }}
            id={`demo-step-${i}`}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            {name}
          </button>
        ))}
      </div>
      <div className="demo-controls">
        <button onClick={playing ? pause : play}>
          {playing ? "PAUSE" : "PLAY FULL DEMONSTRATION"}
        </button>
        <button onClick={() => { go(0); play(); }}>REPLAY</button>
        <button onClick={() => go(Math.max(0, step - 1))} disabled={step === 0}>
          PREVIOUS SCENE
        </button>
        <button onClick={() => go(Math.min(6, step + 1))} disabled={step === 6}>
          NEXT SCENE
        </button>
      </div>
      <p className="model-disclosure">
        Product behavior simulation based on the intended directional-alert
        design; hardware implementation has not been verified.
      </p>
      <p className="model-disclosure">
        Blender concept film uses the supplied STEP geometry and a licensed rigged character.
        Watch appearance and shaft placement are illustrative. The shaft junction, sensor position
        and physical mounting require engineering references before they can be verified.
      </p>
    </section>
  );
}
