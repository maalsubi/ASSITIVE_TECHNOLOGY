import { Scene } from "../components/engineering/Scene";
import { Radio, ScanLine, Vibrate, Watch, Accessibility } from "lucide-react";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import type { SceneState } from "../components/engineering/EngineeringScene";
import { Brand } from "../components/Brand";
export function Heading({
  number,
  label,
  children,
}: {
  number: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="section-heading reveal">
      <span className="eyebrow">
        <span className="red">{number}</span> / {label}
      </span>
      <h2>{children}</h2>
    </div>
  );
}
const features = [
  {
    icon: ScanLine,
    title: "Smart obstacle detection",
    text: "The integrated sensing mechanism detects obstacles in the user’s surroundings.",
    tag: "DETECT",
  },
  {
    icon: Radio,
    title: "Wireless communication",
    text: "The assistive system communicates obstacle alerts to the wearable devices.",
    tag: "CONNECT",
  },
  {
    icon: Vibrate,
    title: "Haptic feedback",
    text: "The watch corresponding to the detected obstacle direction vibrates; both watches respond when obstacles are on both sides.",
    tag: "FEEL",
  },
  {
    icon: Watch,
    title: "Dual wearable assistance",
    text: "One watch on each wrist lets the intended design convey left, right or both-side alerts.",
    tag: "RESPOND",
  },
];
export function Technology() {
  return (
    <section id="technology" className="section technology">
      <Heading number="06" label="THE TECHNOLOGY">
        INTELLIGENCE
        <br />
        IN EVERY STEP<span className="red">.</span>
      </Heading>
      <div className="technology-layout">
        <div className="technical-visual reveal">
          <div className="crosshair" />
          <Scene mode="module" />
          <span className="technical-tag">INTEGRATED ASSISTIVE MODULE</span>
          <div className="scan-bar" />
        </div>
        <div>
          {features.map(({ icon: Icon, title, text, tag }, i) => (
            <article className="feature reveal" key={tag}>
              <span className="feature-no">0{i + 1}</span>
              <div>
                <span className="eyebrow red">{tag}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              <Icon size={26} strokeWidth={1} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
const steps = [
  [
    "DETECT",
    "The intended sensing system identifies an obstacle near the user.",
  ],
  ["IDENTIFY DIRECTION", "The alert is classified as left, right or both sides."],
  [
    "TRANSMIT",
    "The intended design routes an alert to the corresponding wristwatch.",
  ],
  ["HAPTIC FEEDBACK", "The corresponding watch vibrates; both watches respond for both-side obstacles."],
  ["RESPOND", "The user can respond to the alert while navigating."],
];
export function HowItWorks() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);
  const [paused, setPaused] = useState(false);
  const signal = useRef<SceneState>({ progress: 0, focus: 0, manual: null, paused: false });
  const results = ["LEFT WATCH", "RIGHT WATCH", "BOTH WATCHES"];
  return (
    <section id="how-it-works" className="section process">
      <Heading number="04" label="HOW IT WORKS">
        FROM DETECTION
        <br />
        TO DIRECTION<span className="red">.</span>
      </Heading>
      <p className="muted reveal">
        Explore the journey of an alert. Select a step to follow the signal.
      </p>
      <div className="step-tabs" role="tablist" aria-label="Alert process">
        {steps.map(([title], i) => (
          <button
            role="tab"
            id={`step-${i}`}
            aria-selected={active === i}
            aria-controls="step-panel"
            tabIndex={active === i ? 0 : -1}
            key={title}
            className={active === i ? "active" : ""}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              let next = i;
              if (e.key === "ArrowRight") next = (i + 1) % 5;
              else if (e.key === "ArrowLeft") next = (i + 4) % 5;
              else if (e.key === "Home") next = 0;
              else if (e.key === "End") next = 4;
              else return;
              e.preventDefault();
              setActive(next);
              document.getElementById(`step-${next}`)?.focus();
            }}
          >
            <span>0{i + 1}</span>
            {title}
            <i />
          </button>
        ))}
      </div>
      <div className="process-stage">
        <div className="process-simulator">
          <Scene mode="ecosystem" state={signal} />
          <div className="process-simulator-controls" role="group" aria-label="Obstacle direction simulator">
            {[
              ["LEFT OBSTACLE", "LEFT WATCH"],
              ["RIGHT OBSTACLE", "RIGHT WATCH"],
              ["BOTH SIDES", "BOTH WATCHES"],
            ].map(([label, result], i) => (
              <button key={label} aria-pressed={direction === i} onClick={() => { setDirection(i); signal.current.focus = i; }}>
                {label}<span>{result}</span>
              </button>
            ))}
            <button onClick={() => { signal.current.paused = !paused; setPaused(!paused); }}>{paused ? "PLAY SIGNAL" : "PAUSE SIGNAL"}</button>
          </div>
          <p className="process-alert-result" aria-live="polite">{results[direction]} RECEIVE{direction === 2 ? "" : "S"} THE ILLUSTRATIVE ALERT</p>
        </div>
        <motion.div
          key={active}
          initial={{ opacity: 0.5, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          id="step-panel"
          role="tabpanel"
          aria-labelledby={`step-${active}`}
          className="step-detail"
        >
          <span className="step-number">0{active + 1}</span>
          <h3>{steps[active][0]}</h3>
          <p>{steps[active][1]}</p>
          <span className="eyebrow red">ILLUSTRATIVE PROCESS</span>
        </motion.div>
      </div>
      <p className="model-disclosure">Directional response represents the intended design. Sensor position, firmware behavior and watch hardware require verification.</p>
    </section>
  );
}
export function Purpose() {
  return (
    <section id="why-it-matters" className="section purpose">
      <div className="purpose-symbol reveal">
        <Accessibility size={150} strokeWidth={0.6} />
        <span>
          TECHNOLOGY
          <br />
          WITH PURPOSE.
        </span>
      </div>
      <div>
        <Heading number="05" label="WHY IT MATTERS">
          DESIGNED AROUND
          <br />
          INDEPENDENT MOBILITY<span className="red">.</span>
        </Heading>
        <p className="reveal">
          Useful innovation begins with people. We are developing assistive
          technology that brings sensing and wearable feedback together to
          support mobility.
        </p>
        <div className="values reveal">
          <span>Accessibility</span>
          <span>Inclusive innovation</span>
          <span>Human-centered engineering</span>
        </div>
      </div>
    </section>
  );
}
const specs = [
  "Controller",
  "Obstacle detection sensors",
  "Wireless communication technology",
  "Watch communication module",
  "Vibration mechanism",
  "Power supply",
  "Battery",
  "Operating range",
  "Physical dimensions",
];
export function Specifications() {
  return (
    <section id="specifications" className="section specifications">
      <Heading number="06" label="TECHNICAL SPECIFICATIONS">
        THE DETAILS
        <br />
        BEHIND THE DESIGN<span className="red">.</span>
      </Heading>
      <p className="muted reveal">
        Confirmed technical specifications will be added as product
        documentation becomes available.
      </p>
      <table className="reveal">
        <caption className="sr-only">
          IoT-Based Blind People Assistive Module specifications
        </caption>
        <thead>
          <tr>
            <th scope="col">PARAMETER</th>
            <th scope="col">SPECIFICATION</th>
          </tr>
        </thead>
        <tbody>
          {specs.map((s) => (
            <tr key={s}>
              <th scope="row">{s}</th>
              <td>Pending verification</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
export function About() {
  return (
    <section id="about" className="section about">
      <div className="about-mark reveal">
        <Brand large />
        <span>IDEAS. ENGINEERING. IMPACT.</span>
      </div>
      <div>
        <Heading number="07" label="ABOUT TECHO SPARK INDUSTRIES">
          ENGINEERING TECHNOLOGY FOR A MORE ACCESSIBLE WORLD
          <span className="red">.</span>
        </Heading>
        <p className="reveal">
          Techo Spark Industries is an innovation-focused technology company
          developing assistive and intelligent electronic solutions. Our work
          connects thoughtful engineering with a clear purpose: creating
          technology around human needs.
        </p>
      </div>
    </section>
  );
}
