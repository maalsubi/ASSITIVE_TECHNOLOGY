import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Brand } from "./Brand";
export const links = [
  ["home", "Home"],
  ["technology", "Technology"],
  ["how-it-works", "How it works"],
  ["product", "Product"],
  ["specifications", "Specifications"],
  ["about", "About us"],
  ["contact", "Contact"],
];
export function Navigation() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-15% 0px -60% 0px" },
    );
    links.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", fn);
      observer.disconnect();
    };
  }, []);
  return (
    <header className={`navigation ${scrolled ? "scrolled" : ""}`}>
      <a href="#home" aria-label="Techo Spark Industries home">
        <Brand />
      </a>
      <button
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="main-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      <nav
        id="main-nav"
        className={open ? "open" : ""}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        {links.map(([id, label]) => (
          <a
            href={`#${id}`}
            key={id}
            aria-current={active === id ? "location" : undefined}
            onClick={() => setOpen(false)}
          >
            {label}
          </a>
        ))}
      </nav>
      <a className="nav-cta" href="#technology">
        EXPLORE THE TECHNOLOGY <ArrowUpRight size={14} />
      </a>
    </header>
  );
}
