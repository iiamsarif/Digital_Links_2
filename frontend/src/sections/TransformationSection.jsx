import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TransformingDevice from "../models/TransformingDevice.jsx";
import { apiFetch } from "../utils/api.js";

gsap.registerPlugin(ScrollTrigger);

const defaultRevealText =
  "From autonomous agent to product cockpit. Strategy bots, design systems, dashboards, and deployment pipelines converge into one polished client-facing workspace.";

export default function TransformationSection() {
  const [revealText, setRevealText] = useState(defaultRevealText);
  const sectionRef = useRef(null);
  const pinRef = useRef(null);
  const progressRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    apiFetch("/api/content/transform")
      .then((result) => {
        if (!cancelled && result?.text) {
          setRevealText(result.text);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=420%",
        pin: pinRef.current,
        scrub: 0.85,
        anticipatePin: 1,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      });

      gsap.fromTo(
        ".architecture-card",
        { autoAlpha: 0, scale: 0.88, y: 80 },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }, sectionRef);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const letters = gsap.utils.toArray(".transform-reveal__char");

      gsap.set(letters, { color: "rgba(17, 16, 14, 0.15)" });

      gsap.to(letters, {
        color: "#14120f",
        stagger: 0.018,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "45% top",
          scrub: true,
        },
      });
    }, sectionRef);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, [revealText]);

  return (
    <section ref={sectionRef} className="transform-section" id="systems" data-section="02">
      <div ref={pinRef} className="transform-pin">
        <div className="transform-reveal" aria-label={revealText}>
          <span className="eyebrow">How We Works</span>
          <h2 aria-hidden="true">
            {revealText.split("").map((char, index) => (
              <span className="transform-reveal__char" key={`${char}-${index}`}>
                {char}
              </span>
            ))}
          </h2>
        </div>

        <div className="architecture-card" aria-label="Android unfolding into product architecture">
          <TransformingDevice progressRef={progressRef} />
          <div className="architecture-card__grid" />
          <div className="architecture-card__caption">
            <span>Top-view product architecture</span>
            <strong>System layout</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
