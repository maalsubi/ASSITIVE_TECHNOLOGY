import { Routes, Route, Link } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { Hero } from "./sections/Hero";
import { ProductStory } from "./sections/ProductStory";
import { HowItWorks } from "./sections/HowItWorks";
import { AboutContact } from "./sections/AboutContact";
import { useCinematic } from "./hooks/useCinematic";
function Home() {
  useCinematic();
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="page-progress" />
      <Navigation />
      <main id="main">
        <Hero />
        <ProductStory kind="module" />
        <ProductStory kind="watch" />
        <HowItWorks />
        <AboutContact />
      </main>
      <Footer />
    </>
  );
}
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="*"
          element={
            <main className="not-found">
              <h1>Page not found.</h1>
              <Link className="button" to="/">
                RETURN HOME
              </Link>
            </main>
          }
        />
      </Routes>
    </MotionConfig>
  );
}
