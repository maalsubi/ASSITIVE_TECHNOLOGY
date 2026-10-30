import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
gsap.registerPlugin(ScrollTrigger);
export function useCinematic() {
  useEffect(() => {
    const mm = gsap.matchMedia();
    let lenis: Lenis | undefined;
    let tick: ((time: number) => void) | undefined;
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      lenis = new Lenis({ duration: 1.05, anchors: true });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      const ctx = gsap.context(() => {
        gsap.from(".hero .hero-reveal", {
          y: 40,
          opacity: 0,
          duration: 1.15,
          stagger: 0.13,
          ease: "power3.out",
        });
        gsap.to(".hero .ecosystem", {
          y: 100,
          scale: 1.16,
          rotation: 3,
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
        gsap.utils
          .toArray<HTMLElement>(".reveal")
          .forEach((el) =>
            gsap.from(el, {
              y: 35,
              opacity: 0,
              duration: 0.8,
              scrollTrigger: { trigger: el, start: "top 92%", once: true },
            }),
          );
        gsap.to(".page-progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.2 },
        });
        gsap.to(".signal-dot", {
          offsetDistance: "100%",
          duration: 2.8,
          repeat: -1,
          ease: "none",
          stagger: 0.5,
        });
      });
      return () => {
        ctx.revert();
        if (tick) gsap.ticker.remove(tick);
        lenis?.destroy();
      };
    });
    mm.add(
      "(min-width: 1000px) and (prefers-reduced-motion: no-preference)",
      () => {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: ".cinema",
            start: "top top",
            end: "+=1400",
            pin: true,
            scrub: 1,
          },
        });
        timeline
          .to(
            ".cinema .central-product",
            { scale: 1.2, rotation: -8, y: -25 },
            0,
          )
          .fromTo(
            ".cinema .watch-left",
            { x: 130, opacity: 0.15 },
            { x: -35, opacity: 1, rotation: -10 },
            0.15,
          )
          .fromTo(
            ".cinema .watch-right",
            { x: -130, opacity: 0.15 },
            { x: 35, opacity: 1, rotation: 10 },
            0.15,
          )
          .to(".cinema .chapter-line", { scaleX: 1 }, 0)
          .from(".cinema .cinema-caption", { y: 40, opacity: 0 }, 0.3);
        return () => timeline.kill();
      },
    );
    return () => mm.revert();
  }, []);
}
