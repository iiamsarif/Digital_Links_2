import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function TrainText() {
  const sectionRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const lines = ["APP ENGINEERING", "WEB SYSTEMS", "CLOUD AUTOMATION", "AI OPERATIONS", "PRODUCT DESIGN"];
  const caption = "Momentum you can feel before the first sprint.";

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".train-reveal__char", {
        color: "#f4ecdf",
        stagger: 0.025,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 58%",
          end: "center center",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
      },
      { threshold: 0.15 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`train-section${isActive ? " is-active" : ""}`} data-section="04">
      <div className="train-perspective">
        {lines.map((line, index) => (
          <div className="train-line" style={{ "--delay": `${index * -1.4}s` }} key={line}>
            {line}
          </div>
        ))}
      </div>
      <div className="train-caption">
        <span className="eyebrow">Motion language</span>
        <h2 aria-label={caption}>
          {caption.split("").map((char, index) => (
            <span className="train-reveal__char" aria-hidden="true" key={`${char}-${index}`}>
              {char}
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}
