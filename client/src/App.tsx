import { lazy, Suspense } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { Hero } from "./sections/Hero";
import {
  Introduction,
  Cinema,
  Technology,
  HowItWorks,
  Hardware,
  Wearables,
  Purpose,
  Specifications,
  About,
} from "./sections/Story";
import { useCinematic } from "./hooks/useCinematic";
const Contact = lazy(() => import("./sections/Contact"));
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
        <Introduction />
        <Cinema />
        <Technology />
        <HowItWorks />
        <Hardware />
        <Wearables />
        <Purpose />
        <Specifications />
        <About />
        <Suspense
          fallback={
            <section id="contact" className="section">
              Loading contact form…
            </section>
          }
        >
          <Contact />
        </Suspense>
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
