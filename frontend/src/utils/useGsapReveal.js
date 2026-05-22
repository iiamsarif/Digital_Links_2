import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useGsapReveal(scopeRef) {
  useEffect(() => {
    if (!scopeRef.current) return undefined;

    const ctx = gsap.context(() => {
      gsap.utils.toArray("[data-reveal]").forEach((element, index) => {
        const direction = element.dataset.reveal || "up";
        const distance = 72;
        const fromVars = {
          autoAlpha: 0,
          y: direction === "up" ? distance : direction === "down" ? -distance : 0,
          x: direction === "left" ? distance : direction === "right" ? -distance : 0,
        };

        gsap.fromTo(element, fromVars, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          duration: 1.15,
          delay: (index % 4) * 0.04,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 84%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, scopeRef);

    return () => ctx.revert();
  }, [scopeRef]);
}
