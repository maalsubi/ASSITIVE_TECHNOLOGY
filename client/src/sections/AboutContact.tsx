import { lazy, Suspense } from "react";
import { Brand } from "../components/Brand";
import "../styles/about-contact.css";

const Contact = lazy(() => import("./Contact"));
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

export function AboutContact() {
  return <section id="about-contact" className="about-contact">
    <div className="about-contact__intro">
      <div className="about-contact__brand"><Brand large /><span>IDEAS. ENGINEERING. IMPACT.</span></div>
      <div>
        <span className="eyebrow"><b>05</b> / ABOUT TSI & CONTACT</span>
        <h2>ENGINEERING FOR A MORE <em>ACCESSIBLE WORLD.</em></h2>
        <p>Techo Spark Industries develops assistive and intelligent electronic solutions around human needs. This product concept brings a sensing module and two matching wearables together in an intended directional-alert system.</p>
      </div>
    </div>
    <div className="about-contact__specs">
      <div>
        <span className="eyebrow">TECHNICAL SPECIFICATIONS</span>
        <h3>DETAILS NEED <em>EVIDENCE.</em></h3>
        <p>Only the supplied CAD geometry has been inspected. Electrical and performance values await engineering documentation.</p>
      </div>
      <table>
        <caption className="sr-only">TSI product specifications pending verification</caption>
        <thead><tr><th scope="col">PARAMETER</th><th scope="col">SPECIFICATION</th></tr></thead>
        <tbody>{specs.map((item) => <tr key={item}><th scope="row">{item}</th><td>Pending verification</td></tr>)}</tbody>
      </table>
    </div>
    <Suspense fallback={<div className="about-contact__loading">Loading contact form…</div>}><Contact /></Suspense>
  </section>;
}
