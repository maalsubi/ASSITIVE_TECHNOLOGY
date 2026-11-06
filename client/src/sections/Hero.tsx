import { ArrowDown, ArrowUpRight } from "lucide-react";
import "../styles/home-products.css";

export function Hero() {
  return <section id="home" className="product-home">
    <div className="product-home__copy">
      <span className="eyebrow"><i /> TECHO SPARK INDUSTRIES / ASSISTIVE TECHNOLOGY</span>
      <h1>SEE BEYOND <em>SIGHT.</em></h1>
      <h2>MOVE WITH CONFIDENCE.</h2>
      <p>Intelligent assistive technology designed to help visually impaired individuals identify surrounding obstacles through directional haptic feedback.</p>
      <div className="product-home__actions">
        <a className="button" href="#assistive-module">EXPLORE MODULE <ArrowUpRight size={17} /></a>
        <a className="button secondary" href="#watches">EXPLORE WATCH <ArrowUpRight size={17} /></a>
      </div>
      <span className="product-home__source">TWO PRODUCTS. ACTUAL CAD. ONE CONNECTED VISION.</span>
    </div>
    <div className="product-home__visual" aria-label="STEP-derived assistive module and wearable watch product renderings">
      <div className="product-home__halo" />
      <img className="product-home__module" src="/assets/tsi-module-hero.png" alt="TSI assistive module rendered from the supplied STEP assembly" fetchPriority="high" />
      <img className="product-home__watch" src="/assets/tsi-watch-hero.png" alt="TSI wearable watch housing and PCB rendered from the supplied STEP assembly" fetchPriority="high" />
      <span className="product-home__module-label">01 / ASSISTIVE MODULE</span>
      <span className="product-home__watch-label">02 / WEARABLE WATCH</span>
    </div>
    <a className="product-home__scroll" href="#assistive-module"><ArrowDown size={15} /> SCROLL TO EXPLORE</a>
  </section>;
}
