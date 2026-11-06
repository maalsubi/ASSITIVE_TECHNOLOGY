import { useState } from "react";
import "../styles/how-it-works.css";

const steps = [
  ["DETECT", "The intended sensing module identifies a nearby obstacle."],
  ["IDENTIFY DIRECTION", "The intended design distinguishes a left, right or both-side obstacle."],
  ["TRANSMIT", "A directional alert is intended to reach the corresponding wearable."],
  ["HAPTIC FEEDBACK", "The matching watch is intended to provide a tactile cue."],
  ["RESPOND", "The wearer can decide how to continue moving."],
] as const;

export function HowItWorks() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<0 | 1 | 2>(0);
  const left = direction !== 1, right = direction !== 0;
  return <section id="how-it-works" className="system-story" data-alert-left={left} data-alert-right={right}>
    <div className="system-story__intro">
      <span className="eyebrow"><b>04</b> / HOW IT WORKS</span>
      <h2>FROM DETECTION <em>TO DIRECTION.</em></h2>
      <p>One intended signal path. One clear direction at a time.</p>
    </div>
    <div className="system-story__steps" role="tablist" aria-label="Alert process">
      {steps.map(([title], index) => <button key={title} id={`system-step-${index}`} role="tab" aria-selected={step === index} aria-controls="system-step-panel" tabIndex={step === index ? 0 : -1} onClick={() => setStep(index)} onKeyDown={(event) => {
        const next = event.key === "ArrowRight" ? (index + 1) % 5 : event.key === "ArrowLeft" ? (index + 4) % 5 : null;
        if (next === null) return;
        event.preventDefault();
        setStep(next);
        document.getElementById(`system-step-${next}`)?.focus();
      }}><span>0{index + 1}</span>{title}</button>)}
    </div>
    <div className="system-story__body">
      <div className="system-story__visual" aria-label="Intended directional alert simulator using renderings of the actual CAD products">
        <div className={`system-story__watch system-story__watch--left ${left ? "is-active" : ""}`}>
          <img src="/assets/tsi-watch-hero.png" alt="Left wearable watch from the supplied STEP assembly" loading="lazy" />
          <span>LEFT WATCH</span>
        </div>
        <div className="system-story__module"><img src="/assets/tsi-module-hero.png" alt="Assistive module from the supplied STEP assembly" loading="lazy" /><span>ASSISTIVE MODULE</span></div>
        <div className={`system-story__watch system-story__watch--right ${right ? "is-active" : ""}`}>
          <img src="/assets/tsi-watch-hero.png" alt="Right wearable watch, a second instance of the same supplied CAD design" loading="lazy" />
          <span>RIGHT WATCH</span>
        </div>
        <div className={`system-story__signal system-story__signal--left ${left ? "is-active" : ""}`} />
        <div className={`system-story__signal system-story__signal--right ${right ? "is-active" : ""}`} />
      </div>
      <div className="system-story__interaction">
        <div id="system-step-panel" role="tabpanel" aria-labelledby={`system-step-${step}`} className="system-story__detail">
          <span className="eyebrow red">0{step + 1} / 05</span>
          <h3>{steps[step][0]}</h3>
          <p>{steps[step][1]}</p>
        </div>
        <div className="system-story__direction" role="group" aria-label="Obstacle direction simulator">
          {(["LEFT OBSTACLE", "RIGHT OBSTACLE", "BOTH SIDES"] as const).map((label, index) => <button key={label} aria-pressed={direction === index} onClick={() => setDirection(index as 0 | 1 | 2)}>{label}</button>)}
        </div>
        <p className="system-story__result" aria-live="polite">{direction === 0 ? "LEFT WATCH ACTIVE · RIGHT WATCH INACTIVE" : direction === 1 ? "RIGHT WATCH ACTIVE · LEFT WATCH INACTIVE" : "BOTH WATCHES ACTIVE"}</p>
      </div>
    </div>
    <p className="system-story__disclosure">Intended-behavior simulation. Sensor placement, wireless routing and physical haptic operation have not been verified.</p>
  </section>;
}
