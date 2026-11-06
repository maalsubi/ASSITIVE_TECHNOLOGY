import "../styles/cad-film.css";

export function CadFilm() {
  return (
    <section className="cad-film-section" aria-labelledby="cad-film-title">
      <div className="cad-film-heading">
        <span className="eyebrow"><b>CAD / 01</b> — TSI REV3</span>
        <h2 id="cad-film-title">FORM, FROM THE <em>SOURCE.</em></h2>
        <p>
          A studio rotation rendered in Blender from the supplied STEP geometry.
          The enclosure profile, openings and selected internal solids remain in
          their source assembly positions.
        </p>
      </div>
      <div className="cad-film-frame">
        <video
          autoPlay
          muted
          loop
          playsInline
          controls
          preload="metadata"
          poster="/assets/tsi-rev3-cad-preview.png"
          aria-label="Rotating Blender render of the TSI REV3 assistive module"
        >
          <source src="/assets/tsi-rev3-turntable.mp4" type="video/mp4" />
          Your browser cannot play this product animation.
        </video>
        <span className="cad-film-index">ACTUAL STEP GEOMETRY / BLENDER RENDER</span>
      </div>
      <a href="#explore-product" className="cad-film-link">EXPLORE THE INTERACTIVE ASSEMBLY ↗</a>
    </section>
  );
}
