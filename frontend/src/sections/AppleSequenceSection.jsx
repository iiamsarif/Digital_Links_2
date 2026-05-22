import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FrameSequence from "../components/FrameSequence.jsx";
import { appleFrames } from "../utils/frames.js";

gsap.registerPlugin(ScrollTrigger);

const appleTitle = "Interfaces revealed with Apple-grade restraint.";

export default function AppleSequenceSection() {
  const ref = useRef(null);
  const stageRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".apple-title-word",
        {
          autoAlpha: 0,
          y: 90,
          z: -220,
          rotateX: 68,
          rotateY: -18,
        },
        {
          autoAlpha: 1,
          y: 0,
          z: 0,
          rotateX: 0,
          rotateY: 0,
          stagger: 0.075,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 78%",
            end: "top 28%",
            scrub: 0.55,
          },
        },
      );

      gsap.fromTo(
        ".apple-stage",
        { scale: 0.88, y: 86, rotateX: 10 },
        {
          scale: 1,
          y: 0,
          rotateX: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: stageRef.current,
            start: "top 88%",
            end: "center center",
            scrub: 0.55,
          },
        },
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="apple-section" id="lab" data-section="05">
      <div className="apple-sticky">
        <div className="apple-kinetic" aria-hidden="true">
          <span className="apple-kinetic__ring apple-kinetic__ring--one" />
          <span className="apple-kinetic__ring apple-kinetic__ring--two" />
          <span className="apple-kinetic__panel apple-kinetic__panel--one" />
          <span className="apple-kinetic__panel apple-kinetic__panel--two" />
          <span className="apple-kinetic__beam" />
        </div>
        <div className="apple-copy">
          <span className="eyebrow">Product demo mode</span>
          <h2 aria-label={appleTitle}>
            {appleTitle.split(" ").map((word, index) => (
              <span className="apple-title-word" aria-hidden="true" key={`${word}-${index}`}>
                {word}
              </span>
            ))}
          </h2>
        </div>
        <div ref={stageRef} className="apple-stage">
          <FrameSequence
            frames={appleFrames}
            mode="directional"
            scrollTriggerRef={stageRef}
            playbackFps={42}
            className="apple-canvas"
            ariaLabel="Premium product frame sequence"
          />
        </div>
      </div>
    </section>
  );
}
