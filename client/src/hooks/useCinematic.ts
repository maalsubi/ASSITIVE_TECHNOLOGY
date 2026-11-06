import { useEffect } from "react";

// Native scrolling owns page position. Earlier Lenis/GSAP reveal timelines could
// leave content at opacity 0 while the virtual scroll position and observer
// triggers disagreed, producing blank/flickering sections.
export function useCinematic() {
  useEffect(() => {
    const progress = document.querySelector<HTMLElement>(".page-progress");
    let frame = 0;
    const update = () => {
      frame = 0;
      const distance = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      if (progress) progress.style.transform = `scaleX(${Math.min(1, scrollY / distance)})`;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
}
