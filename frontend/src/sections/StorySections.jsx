import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FrameSequence from "../components/FrameSequence.jsx";
import SectionShell from "../components/SectionShell.jsx";
import MagneticButton from "../components/MagneticButton.jsx";
import ObjectShowcase from "../models/ObjectShowcase.jsx";
import { heroFrames } from "../utils/frames.js";
import { apiFetch, resolveAssetUrl } from "../utils/api.js";

gsap.registerPlugin(ScrollTrigger);

const fleet = ["SaaS portals", "Booking engines", "AI assistants", "Commerce systems"];
const advantages = [
  ["01", "Senior architecture", "Clean foundations before visual polish."],
  ["02", "Release discipline", "QA, staging, analytics, and rollback plans."],
  ["03", "Brand-grade UI", "Premium motion, typography, states, and responsive behavior."],
];
const stats = [
  ["48", "Launches guided"],
  ["12", "Core verticals"],
  ["99", "Performance focus"],
  ["24", "Hour support desk"],
];
const defaultPackageItems = [
  "Semantic\nSearch",
  "Stable &\nInnovative",
  "Cost-effective",
  "Plugins for\nFunctionalities",
  "Content\nUpdating",
];
const defaultPackagePrice = "Price 5000";
const packageCardMeta = [
  ["card-1", "fa-solid fa-magnifying-glass-chart"],
  ["card-2", "fa-solid fa-lightbulb"],
  ["card-3", "fa-solid fa-sack-dollar"],
  ["card-4", "fa-solid fa-window-restore"],
  ["card-5", "fa-solid fa-file-circle-check"],
];
const finalPhotos = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=70",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=70",
  "https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=500&q=70",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=500&q=70",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=500&q=70",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=70",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=500&q=70",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=500&q=70",
];
const finalPhotoLayout = [
  ["8%", "-8s", "24s", "-6deg"],
  ["22%", "-18s", "30s", "4deg"],
  ["38%", "-4s", "27s", "8deg"],
  ["54%", "-14s", "34s", "-3deg"],
  ["68%", "-22s", "29s", "7deg"],
  ["82%", "-10s", "32s", "-8deg"],
  ["14%", "-28s", "36s", "3deg"],
  ["74%", "-2s", "25s", "-5deg"],
];
import proofVideoSrc from "../assets/Video/6266247-hd_1280_720_25fps.mp4";
const proofMessages = [
  "Motion proof, interface fragments, build telemetry, and deployment signals moving in one controlled stream.",
  "Every frame is tuned for premium digital systems: dashboards, app flows, AI assistants, and launch operations.",
  "A compact live reel for the studio layer behind the product: technical, cinematic, and built to move.",
];

function FinalPhotoFlow() {
  const [serverPhotos, setServerPhotos] = useState([]);

  useEffect(() => {
    let cancelled = false;
    apiFetch("/api/photos")
      .then((result) => {
        if (cancelled) return;
        setServerPhotos((result.photos || []).map((photo) => resolveAssetUrl(photo.url)).filter(Boolean));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const flowPhotos = serverPhotos.length ? serverPhotos : finalPhotos;

  return (
    <div className="final-photo-flow" aria-hidden="true">
      {finalPhotoLayout.map(([left, delay, duration, rotation], index) => (
        <span
          className="final-photo-card"
          key={`${left}-${delay}`}
          style={{
            "--photo": `url(${flowPhotos[index % flowPhotos.length]})`,
            "--left": left,
            "--delay": delay,
            "--duration": duration,
            "--rotation": rotation,
          }}
        />
      ))}
    </div>
  );
}

function FinalFrameBackground({ triggerRef }) {
  return (
    <div className="final-frame-background" aria-hidden="true">
      <FrameSequence
        frames={heroFrames}
        mode="directional"
        playbackFps={36}
        fit="cover"
        scrollTriggerRef={triggerRef}
        className="final-frame-canvas"
      />
    </div>
  );
}

export function FleetShowcase() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        section.style.setProperty("--fleet-progress", self.progress.toFixed(4));
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <SectionShell
      ref={sectionRef}
      className="fleet-section"
      eyebrow="Product fleet"
      title="A private launch bay for digital services."
      body="Choose the build stream that matches your next leap, then let our studio assemble the full stack."
    >
      <svg className="fleet-smoke-filter" width="0" height="0" aria-hidden="true">
        <defs>
          <filter id="fleet-smokey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.015" numOctaves="4" result="smokeNoise" />
            <feDisplacementMap in="SourceGraphic" in2="smokeNoise" scale="92" xChannelSelector="R" yChannelSelector="G" result="displacedGraphic" />
            <feGaussianBlur in="displacedGraphic" stdDeviation="7" result="blurredEdges" />
            <feColorMatrix in="blurredEdges" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -10" />
          </filter>
        </defs>
      </svg>
      <div className="fleet-smoke" aria-hidden="true">
        <span className="fleet-blob fleet-blob--one" />
        <span className="fleet-blob fleet-blob--two" />
        <span className="fleet-blob fleet-blob--three" />
      </div>
      <div className="fleet-track">
        {fleet.map((item, index) => (
          <article className="fleet-card" data-reveal="left" key={item}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{item}</h3>
            <p>Research, interface, backend, deployment, and growth instrumentation in one guided lane.</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

export function AdvantageHighlights() {
  return (
    <SectionShell
      className="advantage-section"
      eyebrow="Operating advantage"
      title="Built for founders who expect calm execution."
      body="Your product gets a composed build team, precise communication, and technical choices that scale."
    >
      <div className="advantage-stack">
        {advantages.map(([number, title, body]) => (
          <article data-reveal="right" key={title}>
            <span>{number}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

export function ProofStreamSection() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const warmedAssetsRef = useRef(new Set());
  const [serverPhotos, setServerPhotos] = useState([]);
  const [isSectionActive, setIsSectionActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiFetch("/api/photos")
      .then((result) => {
        if (!cancelled) {
          setServerPhotos((result.photos || []).map((photo) => resolveAssetUrl(photo.url)).filter(Boolean));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const sectionElement = sectionRef.current;
    const textElement = textRef.current;
    if (!textElement || !sectionElement) return undefined;

    let timeoutId = 0;
    let messageIndex = 0;
    let typedText = "";
    let isDeleting = false;
    let isActive = false;

    const runNext = (delay) => {
      if (!isActive) return;
      timeoutId = window.setTimeout(typeMessage, delay);
    };

    const typeMessage = () => {
      if (!isActive) return;
      const activeMessage = proofMessages[messageIndex];
      const finishedTyping = typedText === activeMessage;
      const finishedDeleting = typedText === "";

      if (!isDeleting && !finishedTyping) {
        typedText = activeMessage.slice(0, typedText.length + 1);
        textElement.textContent = typedText;
        runNext(42);
        return;
      }

      if (!isDeleting && finishedTyping) {
        isDeleting = true;
        runNext(1350);
        return;
      }

      if (isDeleting && !finishedDeleting) {
        typedText = activeMessage.slice(0, typedText.length - 1);
        textElement.textContent = typedText;
        runNext(24);
        return;
      }

      isDeleting = false;
      messageIndex = (messageIndex + 1) % proofMessages.length;
      runNext(180);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isActive = entry.isIntersecting;
        if (isActive) {
          window.clearTimeout(timeoutId);
          typeMessage();
        } else {
          window.clearTimeout(timeoutId);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(sectionElement);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const sectionElement = sectionRef.current;
    if (!sectionElement) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionActive(entry.isIntersecting);
      },
      { threshold: 0.2 },
    );
    observer.observe(sectionElement);
    return () => observer.disconnect();
  }, []);

  const proofPhotos = useMemo(() => serverPhotos, [serverPhotos]);
  const leftPhotos = useMemo(() => proofPhotos.filter((_, index) => index % 2 === 0), [proofPhotos]);
  const rightPhotos = useMemo(() => proofPhotos.filter((_, index) => index % 2 === 1), [proofPhotos]);

  useEffect(() => {
    const sectionElement = sectionRef.current;
    if (!sectionElement) return undefined;
    const timers = [];
    const idleHandles = [];

    const scheduleIdle = (callback) => {
      if ("requestIdleCallback" in window) {
        const handle = window.requestIdleCallback(callback, { timeout: 1400 });
        idleHandles.push(handle);
        return;
      }

      const handle = window.setTimeout(callback, 1);
      timers.push(handle);
    };

    const warmAssets = () => {
      [...leftPhotos, ...rightPhotos].forEach((src, index) => {
        if (!src || warmedAssetsRef.current.has(src)) return;
        warmedAssetsRef.current.add(src);
        const timer = window.setTimeout(() => {
          scheduleIdle(() => {
            const image = new Image();
            image.decoding = "async";
            image.loading = "eager";
            image.src = src;
          });
        }, index * 120);
        timers.push(timer);
      });

    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          warmAssets();
          observer.disconnect();
        }
      },
      { rootMargin: "1600px 0px", threshold: 0.01 },
    );
    observer.observe(sectionElement);
    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
      if ("cancelIdleCallback" in window) {
        idleHandles.forEach((handle) => window.cancelIdleCallback(handle));
      }
    };
  }, [leftPhotos, rightPhotos]);

  return (
    <section
      ref={sectionRef}
      className={`proof-stream-section${isSectionActive ? " is-active" : ""}`}
      data-section="08"
    >
      <div className="proof-stream-container">
        <div className="proof-rail proof-rail--left" aria-hidden="true">
          {leftPhotos.map((src, index) => (
            <span className={`proof-stream-card proof-stream-card--${index + 1}`} key={src}>
              <img src={src} alt="" loading="lazy" decoding="async" fetchPriority="low" />
            </span>
          ))}
        </div>

        <div className="proof-stream-center">
          <div className="proof-video-shell">
            <div className="proof-video-copy">
              <span className="proof-video-label">Signal reel / live</span>
              <p className="proof-video-description">
                <span ref={textRef} />
                <span className="typing-caret" aria-hidden="true" />
              </p>
            </div>
          </div>
        </div>

        <div className="proof-rail proof-rail--right" aria-hidden="true">
          {rightPhotos.map((src, index) => (
            <span className={`proof-stream-card proof-stream-card--${index + 1}`} key={src}>
              <img src={src} alt="" loading="lazy" decoding="async" fetchPriority="low" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PackageSection() {
  const [packageItems, setPackageItems] = useState(defaultPackageItems);
  const [packagePriceText, setPackagePriceText] = useState(defaultPackagePrice);
  const [packageLogoUrl, setPackageLogoUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    apiFetch("/api/content/package")
      .then((result) => {
        if (cancelled) return;
        const items = (result.items || []).filter(Boolean);
        setPackageItems(items.length ? [...items, ...defaultPackageItems].slice(0, 5) : defaultPackageItems);
        setPackagePriceText(result.priceText || defaultPackagePrice);
        setPackageLogoUrl(resolveAssetUrl(result.logoUrl || ""));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="package-section" data-section="09">
      <div className="container">
        <div className="left-section">
          <div className="circle-outer">
            <div className="dot dot-1" />
            <div className="dot dot-2" />
            <div className="dot dot-3" />
            <div className="dot dot-4" />
            <div className="dot dot-5" />
          </div>
          <div className="circle-middle" />
          <div className="circle-inner">
            {packageLogoUrl ? (
              <img className="package-center-logo" src={packageLogoUrl} alt="Package logo" loading="lazy" decoding="async" />
            ) : (
              <i className="fa-brands fa-wordpress" />
            )}
          </div>
          <div className="package-price-tag">{packagePriceText || defaultPackagePrice}</div>
        </div>

        <div className="right-section">
          {packageItems.map((text, index) => {
            const [cardClass, iconClass] = packageCardMeta[index] || packageCardMeta[0];
            return (
              <div className="card-container" key={`${cardClass}-${text}`}>
                <div className={`feature-card ${cardClass}`}>
                  <div className="icon-wrapper">
                    <i className={iconClass} />
                  </div>
                  <div className="text-wrapper">
                    <h3>
                      {text.split("\n").map((line, lineIndex) => (
                        <span key={`${line}-${lineIndex}`}>
                          {line}
                          {lineIndex < text.split("\n").length - 1 && <br />}
                        </span>
                      ))}
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function BookingMiniCta() {
  return (
    <section className="mini-cta" data-section="10">
      <div data-reveal="up">
        <span className="eyebrow">Reserved engagement</span>
        <h2>One focused build room. One premium launch path.</h2>
        <MagneticButton light>Reserve a Strategy Call</MagneticButton>
      </div>
    </section>
  );
}

export function ModelShowcaseSection() {
  const sectionRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    let lastProgress = -1;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        const progress = Math.round(self.progress * 1000) / 1000;
        if (Math.abs(progress - lastProgress) < 0.003) return;
        lastProgress = progress;
        section.style.setProperty("--model-progress", progress.toFixed(3));
      },
    });

    return () => trigger.kill();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
      },
      { threshold: 0.12 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`model-showcase${isActive ? " is-active" : ""}`} data-section="11">
      <svg className="model-smoke-filter" width="0" height="0" aria-hidden="true">
        <defs>
          <filter id="model-smokey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.009 0.016" numOctaves="4" result="smokeNoise" />
            <feDisplacementMap in="SourceGraphic" in2="smokeNoise" scale="88" xChannelSelector="R" yChannelSelector="G" result="displacedGraphic" />
            <feGaussianBlur in="displacedGraphic" stdDeviation="7" result="blurredEdges" />
            <feColorMatrix in="blurredEdges" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -10" />
          </filter>
        </defs>
      </svg>
      <div className="model-smoke" aria-hidden="true">
        <span className="model-blob model-blob--one" />
        <span className="model-blob model-blob--two" />
        <span className="model-blob model-blob--three" />
      </div>
      <div className="model-copy" data-reveal="left">
        <span className="eyebrow">3D capability layer</span>
        <h2>Spatial interfaces for brands that need to be remembered.</h2>
        <p>Interactive product demos, configurators, immersive portfolios, and cinematic brand systems.</p>
      </div>
      <div className="object-canvas" data-reveal="right">
        <ObjectShowcase />
      </div>
    </section>
  );
}

export function StatsSection() {
  return (
    <section className="stats-section" id="proof" data-section="12">
      <div className="section-head" data-reveal="up">
        <span className="eyebrow">Proof stack</span>
        <h2>Measured polish, not decoration.</h2>
      </div>
      <div className="stats-grid">
        {stats.map(([value, label]) => (
          <article className="stat-card" key={label}>
            <strong data-count={value}>0</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export function TestimonialSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".testimonial-quote",
        {
          autoAlpha: 0,
          y: 130,
          z: -260,
          rotateX: 54,
          scale: 0.92,
        },
        {
          autoAlpha: 1,
          y: 0,
          z: 0,
          rotateX: 0,
          scale: 1,
          duration: 1.3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            end: "center center",
            scrub: 0.75,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="testimonial-section" data-section="13">
      <FinalPhotoFlow />
      <blockquote className="testimonial-quote">
        "Digital Links turned a messy service idea into a premium product system: brand, web app, automation, analytics, and
        launch flow all moving as one."
      </blockquote>
      <div data-reveal="right">
        <span className="eyebrow">Client narrative</span>
        <p>Founder, private SaaS launch</p>
      </div>
    </section>
  );
}

export function FinalCta() {
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} className="final-cta" id="booking" data-section="14">
      <FinalFrameBackground triggerRef={sectionRef} />
      <div data-reveal="up">
        <span className="eyebrow">Begin the launch</span>
        <h2>Your next digital product should feel impossible to ignore.</h2>
        <MagneticButton>Book the Build</MagneticButton>
      </div>
    </section>
  );
}

export function Footer() {
  const footerRef = useRef(null);

  return (
    <footer ref={footerRef} className="footer" data-section="15">
      <FinalFrameBackground triggerRef={footerRef} />
      <div>
        <strong>Digital Links</strong>
        <span>Premium app, web, cloud, AI, and automation studio.</span>
      </div>
      <nav>
        <a href="#systems">Systems</a>
        <a href="#lab">Lab</a>
        <a href="#proof">Proof</a>
        <a href="mailto:studio@aerion.digital">studio@aerion.digital</a>
      </nav>
    </footer>
  );
}

export function ClosingSection() {
  const sectionRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".testimonial-quote",
        {
          autoAlpha: 0,
          y: 130,
          z: -260,
          rotateX: 54,
          scale: 0.92,
        },
        {
          autoAlpha: 1,
          y: 0,
          z: 0,
          rotateX: 0,
          scale: 1,
          duration: 1.3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            end: "center center",
            scrub: 0.75,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
      },
      { threshold: 0.12 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`closing-stack${isActive ? " is-active" : ""}`}
      id="booking"
      data-section="13-15"
    >
      <FinalFrameBackground triggerRef={sectionRef} />
      <FinalPhotoFlow />

      <div className="closing-block final-cta">
        <div data-reveal="up">
          <span className="eyebrow">Begin the launch</span>
          <h2>Your next digital product should feel impossible to ignore.</h2>
          <MagneticButton>Book the Build</MagneticButton>
        </div>
      </div>

      <footer className="closing-block footer">
        <div>
          <strong>Digital Links</strong>
          <span>Premium app, web, cloud, AI, and automation studio.</span>
        </div>
        <nav>
          <a href="#systems">Systems</a>
          <a href="#lab">Lab</a>
          <a href="#proof">Proof</a>
          <a href="mailto:studio@aerion.digital">studio@aerion.digital</a>
        </nav>
      </footer>
    </section>
  );
}
