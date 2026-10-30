import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Ecosystem } from "../components/ProductVisual";
import { Brand } from "../components/Brand";
export function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-grid" />
      <div className="hero-topline hero-reveal">
        <span className="eyebrow">
          <i /> ENGINEERED FOR INDEPENDENCE
        </span>
        <span className="edition">TSI / ASSISTIVE TECHNOLOGY</span>
      </div>
      <div className="hero-copy">
        <h1 className="hero-reveal">
          SEE BEYOND
          <br />
          <span>SIGHT.</span>
        </h1>
        <h2 className="hero-reveal">MOVE WITH CONFIDENCE.</h2>
        <p className="hero-reveal">
          An intelligent assistive mobility ecosystem designed to transform the
          way visually impaired individuals navigate their surroundings.
        </p>
        <div className="hero-actions hero-reveal">
          <a className="button" href="#product">
            EXPLORE THE PRODUCT <ArrowUpRight size={17} />
          </a>
          <a className="text-link" href="#how-it-works">
            DISCOVER HOW IT WORKS <span>↗</span>
          </a>
        </div>
      </div>
      <div className="hero-stage hero-reveal">
        <span className="huge-tsi" aria-hidden="true">
          TSI
        </span>
        <Ecosystem />
        <div className="stage-label">
          <span>
            <i /> CONNECTED ASSISTIVE ECOSYSTEM
          </span>
          <small>ONE STICK. TWO WATCHES. A CONNECTED RESPONSE.</small>
        </div>
      </div>
      <div className="hero-bottom">
        <a href="#introduction">
          <ArrowDown size={15} /> SCROLL TO DISCOVER
        </a>
        <Brand />
        <span>HUMAN-CENTERED. TECHNOLOGY-DRIVEN.</span>
      </div>
    </section>
  );
}
