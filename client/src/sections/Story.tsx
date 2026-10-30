import {
  ArrowUpRight,
  Radio,
  ScanLine,
  Vibrate,
  Watch,
  Accessibility,
  MoveUpRight,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { ProductVisual, Ecosystem } from "../components/ProductVisual";
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
export function Introduction() {
  return (
    <section id="introduction" className="section intro">
      <Heading number="01" label="THE ECOSYSTEM">
        MORE THAN A<br />
        WALKING STICK<span className="red">.</span>
      </Heading>
      <div className="section-intro reveal">
        <h3>An intelligent assistive ecosystem.</h3>
        <p>
          The IoT-Based Blind People Assistive Module brings a smart assistive
          stick and two wearable watches together, translating obstacle
          detection into vibration feedback.
        </p>
      </div>
      <div className="component-grid">
        {[
          ["stick", "Smart Assistive Stick", "Detect & communicate"],
          ["watch", "Wearable Watch – 01", "Receive & alert"],
          ["watch", "Wearable Watch – 02", "Connected feedback"],
        ].map(([type, title, caption], i) => (
          <article className="component reveal" key={title}>
            <span className="component-index">
              0{i + 1} <ArrowUpRight size={16} />
            </span>
            <ProductVisual type={type as "stick" | "watch"} />
            <h3>{title}</h3>
            <p>{caption}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
export function Cinema() {
  return (
    <section className="cinema">
      <div className="cinema-heading">
        <span className="eyebrow">CONNECTED BY DESIGN</span>
        <h2>
          ONE SYSTEM.
          <br />
          <span className="outline">IN SYNC.</span>
        </h2>
      </div>
      <Ecosystem />
      <div className="cinema-caption">
        <span className="red">01 — 03</span>
        <p>
          Detection. Communication. Feedback.
          <br />
          Every component has a purpose.
        </p>
      </div>
      <div className="chapter-track">
        <div className="chapter-line" />
      </div>
    </section>
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
    text: "The watches deliver vibration feedback, making an alert something the user can feel.",
    tag: "FEEL",
  },
  {
    icon: Watch,
    title: "Dual wearable assistance",
    text: "Two watches form the wearable part of the assistive ecosystem.",
    tag: "RESPOND",
  },
];
export function Technology() {
  return (
    <section id="technology" className="section technology">
      <Heading number="02" label="THE TECHNOLOGY">
        INTELLIGENCE
        <br />
        IN EVERY STEP<span className="red">.</span>
      </Heading>
      <div className="technology-layout">
        <div className="technical-visual reveal">
          <div className="crosshair" />
          <ProductVisual type="rear" />
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
    "The assistive stick detects an obstacle using its sensing mechanism.",
  ],
  ["PROCESS", "The system processes the detection information."],
  ["TRANSMIT", "An alert is communicated to the wearable devices."],
  ["ALERT", "The watches provide vibration feedback to the user."],
  ["RESPOND", "The user can respond to the alert while navigating."],
];
export function HowItWorks() {
  const [active, setActive] = useState(0);
  return (
    <section id="how-it-works" className="section process">
      <Heading number="03" label="HOW IT WORKS">
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
        <Ecosystem />
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
    </section>
  );
}
export function Hardware() {
  const [expanded, setExpanded] = useState(false);
  return (
    <section id="product" className="section hardware">
      <Heading number="04" label="HARDWARE / INSIDE THE SYSTEM">
        PURPOSE IN
        <br />
        EVERY COMPONENT<span className="red">.</span>
      </Heading>
      <div className={`hardware-layout ${expanded ? "expanded" : ""}`}>
        <div className="hardware-art reveal">
          <div className="hardware-layer layer-back">
            <span>01 / OUTER ENCLOSURE</span>
          </div>
          <div className="hardware-layer layer-board">
            <ProductVisual type="board" />
          </div>
          <div className="hardware-layer layer-front">
            <span>02 / INTERNAL ELECTRONIC BOARD</span>
            <span>03 / EMBEDDED COMPONENTS</span>
          </div>
        </div>
        <div className="hardware-copy reveal">
          <span className="eyebrow red">ENGINEERED AS ONE</span>
          <h3>
            A closer look.
            <br />A connected whole.
          </h3>
          <p>
            The supplied CAD view reveals an electronic board within its
            enclosure. Explore this internal view alongside the assistive handle
            and wearable devices.
          </p>
          <button
            className="button secondary"
            onClick={() => setExpanded(!expanded)}
            aria-pressed={expanded}
          >
            {expanded ? "COLLAPSE LAYERS" : "EXPLORE THE LAYERS"}{" "}
            <MoveUpRight size={18} />
          </button>
          <small>
            Conceptual layer arrangement using the supplied internal CAD view.
            Component identities and dimensions remain to be specified.
          </small>
          <a href="#specifications" className="text-link">
            VIEW SPECIFICATIONS <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}
export function Wearables() {
  return (
    <section className="section wearables">
      <Heading number="05" label="THE WEARABLE EXPERIENCE">
        FEEL THE ALERT.
        <br />
        <span className="outline">KNOW WHEN TO RESPOND.</span>
      </Heading>
      <div className="wearable-stage reveal">
        <div className="haptic-watch">
          <div className="haptic-ring" />
          <div className="haptic-ring second" />
          <ProductVisual type="watch" />
          <span>WEARABLE 01</span>
        </div>
        <div className="transmission">
          <Radio size={36} />
          <div className="transmission-track">
            <i className="signal-dot" />
          </div>
          <span>ALERT TRANSMITTED</span>
        </div>
        <div className="haptic-watch">
          <div className="haptic-ring" />
          <div className="haptic-ring second" />
          <ProductVisual type="watch" />
          <span>WEARABLE 02</span>
        </div>
      </div>
      <div className="wearable-caption">
        <p>
          Obstacle detected <span>→</span> Alert transmitted <span>→</span>{" "}
          Watch vibration
        </p>
        <small>
          Visual explanation only. This website is not connected to the
          hardware.
        </small>
      </div>
    </section>
  );
}
export function Purpose() {
  return (
    <section className="section purpose">
      <div className="purpose-symbol reveal">
        <Accessibility size={150} strokeWidth={0.6} />
        <span>
          TECHNOLOGY
          <br />
          WITH PURPOSE.
        </span>
      </div>
      <div>
        <Heading number="06" label="WHY IT MATTERS">
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
      <Heading number="07" label="TECHNICAL SPECIFICATIONS">
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
              <td>To be specified</td>
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
        <Heading number="08" label="ABOUT TECHO SPARK INDUSTRIES">
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
