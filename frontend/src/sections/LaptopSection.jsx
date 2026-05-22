import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { apiFetch } from "../utils/api.js";

gsap.registerPlugin(ScrollTrigger);

const iframeDocument = `<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
*{box-sizing:border-box;scrollbar-width:none}*::-webkit-scrollbar{display:none;width:0;height:0}html,body{margin:0;min-height:100%;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;-ms-overflow-style:none}body{background:#090909;color:#f7efe2;font-family:Inter,Arial,sans-serif}
.hero{min-height:100vh;padding:42px;background:radial-gradient(circle at top right,#2f7faa55,transparent 35%),#090909}
.tag{font-size:11px;letter-spacing:.26em;text-transform:uppercase;color:#8bd8ff}.title{font-size:clamp(42px,8vw,86px);line-height:.9;margin:22px 0;letter-spacing:-.04em}
.grid{display:grid;gap:14px;margin-top:34px}.card{border:1px solid #ffffff1c;background:#ffffff0d;border-radius:18px;padding:20px;backdrop-filter:blur(14px)}
.light{min-height:84vh;background:#f3eadc;color:#111;padding:42px}.light h2{font-size:54px;line-height:.92;margin:0 0 20px}.pill{display:inline-block;border:1px solid currentColor;border-radius:99px;padding:10px 16px;margin:6px 6px 0 0}
</style>
</head>
<body>
<section class="hero"><div class="tag">Inside the client dashboard</div><div class="title">A live product system, not a static screen.</div><p>Scroll here to review dashboards, launch plans, product design, and production engineering layers.</p><div class="grid"><div class="card">Native-feeling web apps</div><div class="card">Mobile product flows</div><div class="card">Cloud automation runbooks</div><div class="card">Analytics and growth dashboards</div></div></section>
<section class="light"><h2>Build rooms for ambitious teams.</h2><p>Discovery, interface systems, backend architecture, API design, QA, release, and measured iteration.</p><span class="pill">React</span><span class="pill">Node</span><span class="pill">Cloud</span><span class="pill">AI workflows</span><span class="pill">Automation</span></section>
</body>
</html>`;

const blockedIframeDocument = `<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
*{box-sizing:border-box}html,body{margin:0;height:100%}body{display:grid;place-items:center;background:#090909;color:#f7efe2;font-family:Inter,Arial,sans-serif;padding:24px}
.wrap{max-width:560px;text-align:center}
.tag{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#8bd8ff}
h1{margin:12px 0 10px;font-size:clamp(24px,5vw,36px);line-height:1.05}
p{margin:0;color:#cfc8bb;line-height:1.5}
</style>
</head>
<body>
<div class="wrap">
<div class="tag">iframe restricted</div>
<h1>This site blocks embedding.</h1>
<p>Use another project link or a domain that allows iframe preview.</p>
</div>
</body>
</html>`;

const keyboardKeys = Array.from({ length: 54 }, (_, index) => index);

const normalizeProjectLink = (value) => {
  const link = String(value || "").trim();
  if (!link) return "";
  if (/^https?:\/\//i.test(link)) return link;
  return `https://${link}`;
};

export default function LaptopSection() {
  const sectionRef = useRef(null);
  const iframeRef = useRef(null);
  const mobileProjectIframeRef = useRef(null);
  const shieldRef = useRef(null);
  const mobileContentRef = useRef(null);
  const linksRef = useRef([]);
  const activeIndexRef = useRef(0);
  const showProjectActionsRef = useRef(false);
  const scrollStateRef = useRef({ target: 0, current: 0 });
  const pinTriggerRef = useRef(null);
  const [projectLinks, setProjectLinks] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const [showProjectActions, setShowProjectActions] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiFetch("/api/projects")
      .then((result) => {
        if (cancelled) return;
        const links = (result.links || []).map(normalizeProjectLink).filter(Boolean);
        linksRef.current = links;
        setProjectLinks(links);
        activeIndexRef.current = 0;
        setActiveIndex(0);
        setIframeBlocked(false);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!projectLinks.length) {
      activeIndexRef.current = 0;
      if (activeIndex !== 0) setActiveIndex(0);
      return;
    }
    if (activeIndex >= projectLinks.length) {
      activeIndexRef.current = 0;
      setActiveIndex(0);
    }
  }, [activeIndex, projectLinks.length]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const iframe = iframeRef.current;
      const section = sectionRef.current;
      if (!iframe || !section) return;
      const lid = section.querySelector(".laptop-lid");
      const screen = section.querySelector(".laptop-screen");
      const base = section.querySelector(".laptop-base");
      const hinge = section.querySelector(".laptop-hinge");
      const lip = section.querySelector(".laptop-front-lip");
      const shadow = section.querySelector(".laptop-shadow");
      const desktopQuery = window.matchMedia("(min-width: 641px)");
      const easeOpen = gsap.parseEase("power3.out");
      const easeClose = gsap.parseEase("power2.out");

      gsap.set(lid, { transformOrigin: "50% 100%", transformStyle: "preserve-3d" });
      gsap.set(base, { transformOrigin: "50% 0%", transformStyle: "preserve-3d" });
      gsap.set(".laptop-frame", { opacity: 1, y: 0 });
      const scrollState = scrollStateRef.current;
      let mobileResetApplied = false;
      let sectionActive = false;

      const applyLaptopState = (progress) => {
        const hasAnyLinks = linksRef.current.length > 0;
        if (desktopQuery.matches) {
          mobileResetApplied = false;
          const openIn = gsap.utils.clamp(0, 1, progress / 0.22);
          const closeOut = gsap.utils.clamp(0, 1, (1 - progress) / 0.18);
          const openAmount = hasAnyLinks
            ? easeOpen(openIn)
            : Math.min(easeOpen(openIn), easeClose(closeOut));
          gsap.set(lid, {
            rotateX: gsap.utils.interpolate(-88, 0, openAmount),
            y: gsap.utils.interpolate(18, 0, openAmount),
            z: gsap.utils.interpolate(24, 0, openAmount),
            scaleY: gsap.utils.interpolate(0.34, 1, openAmount),
          });
          gsap.set(screen, { autoAlpha: gsap.utils.interpolate(0, 1, gsap.utils.clamp(0, 1, (openAmount - 0.18) / 0.82)) });
          gsap.set(base, { rotateX: gsap.utils.interpolate(68, 64, openAmount), y: 0 });
          gsap.set([hinge, lip], { autoAlpha: gsap.utils.interpolate(0.28, 1, openAmount) });
          gsap.set(shadow, { scaleX: gsap.utils.interpolate(0.72, 1, openAmount), opacity: gsap.utils.interpolate(0.28, 1, openAmount) });
        } else {
          if (!mobileResetApplied) {
            gsap.set([lid, screen, base, hinge, lip, shadow], { clearProps: "transform,opacity,visibility" });
            mobileResetApplied = true;
          }
        }
      };

      applyLaptopState(0);

      const syncInternalScroll = () => {
        if (!sectionActive && Math.abs(scrollState.target - scrollState.current) < 0.001) return;

        const smoothing = 0.16;
        scrollState.current += (scrollState.target - scrollState.current) * smoothing;

        if (desktopQuery.matches) {
          try {
            const doc = iframe.contentDocument;
            const scroller = doc?.scrollingElement || doc?.documentElement;
            if (scroller) {
              const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
              const next = scrollState.current * maxScroll;
              if (Math.abs(scroller.scrollTop - next) > 0.35) {
                scroller.scrollTop = next;
              }
            }
          } catch {}
        } else {
          const mobileScroller = mobileContentRef.current;
          if (mobileScroller) {
            const maxScroll = Math.max(0, mobileScroller.scrollHeight - mobileScroller.clientHeight);
            const next = scrollState.current * maxScroll;
            if (Math.abs(mobileScroller.scrollTop - next) > 0.35) {
              mobileScroller.scrollTop = next;
            }
          }
        }
      };
      gsap.ticker.add(syncInternalScroll);

      // Pin the entire section and sync iframe scroll to scroll progress
      const st = ScrollTrigger.create({
        id: "laptop-pin",
        trigger: section,
        pin: true,
        start: "top top",
        end: "+=340%",
        anticipatePin: 1,
        onEnter: () => {
          sectionActive = true;
        },
        onEnterBack: () => {
          sectionActive = true;
        },
        onLeave: () => {
          sectionActive = false;
        },
        onLeaveBack: () => {
          sectionActive = false;
        },
        onUpdate: (self) => {
          scrollState.target = self.progress;
          const nextShowActions = linksRef.current.length > 0;
          if (showProjectActionsRef.current !== nextShowActions) {
            showProjectActionsRef.current = nextShowActions;
            setShowProjectActions(nextShowActions);
          }
          applyLaptopState(self.progress);
        },
        onRefresh: (self) => {
          scrollState.target = self.progress;
          scrollState.current = self.progress;
          applyLaptopState(self.progress);
          syncInternalScroll();
        },
        invalidateOnRefresh: true,
      });
      pinTriggerRef.current = st;

      return () => {
        gsap.ticker.remove(syncInternalScroll);
        st.kill();
        pinTriggerRef.current = null;
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const activeProjectLink = projectLinks[activeIndex] || "";
  const hasProjects = projectLinks.length > 0;
  const goToNextProject = () => {
    const nextIndex = projectLinks.length ? (activeIndex + 1) % projectLinks.length : 0;
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    setIframeBlocked(false);
    showProjectActionsRef.current = true;
    setShowProjectActions(true);
    scrollStateRef.current.target = 0;
    scrollStateRef.current.current = 0;
  };

  const goToPreviousProject = () => {
    const previousIndex = projectLinks.length
      ? (activeIndex - 1 + projectLinks.length) % projectLinks.length
      : 0;
    activeIndexRef.current = previousIndex;
    setActiveIndex(previousIndex);
    setIframeBlocked(false);
    showProjectActionsRef.current = true;
    setShowProjectActions(true);
    scrollStateRef.current.target = 0;
    scrollStateRef.current.current = 0;
  };

  return (
    <section ref={sectionRef} className="laptop-section" data-section="03">
      <div className="laptop-section__copy" data-reveal="up">
        <span className="eyebrow">Interactive cockpit</span>
        <h2>The product opens as a separate operating surface.</h2>
        <p>Browse the embedded system without leaving the page flow. The screen scroll is contained and invisible.</p>
      </div>

      <div className="laptop-rig">
        <div className="laptop-frame" aria-label="Scrollable website inside laptop">
          <div className={`mobile-app-shell${hasProjects ? " mobile-app-shell--project" : ""}`} aria-label="Mobile app showcase">
            <header className="mobile-app-header">
              <button className="mobile-icon-btn" type="button" aria-label="Theme">
                <span className="mobile-icon-glyph">◐</span>
              </button>
              <div className="mobile-app-logo">sofi</div>
              <button className="mobile-icon-btn" type="button" aria-label="Profile">
                <span className="mobile-icon-glyph">◎</span>
              </button>
            </header>

            <div ref={mobileContentRef} className="mobile-app-content">
              <div className="mobile-artwork-container">
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop"
                  alt="Passiflora abstract art"
                />
              </div>

              <h3 className="mobile-app-title">passiflora</h3>
              <p className="mobile-app-description">
                smooth and refreshing, helping with calm to achieve a better sleep
              </p>

              <div className="mobile-stats-row">
                <div className="mobile-stat-item">
                  <span className="mobile-stat-icon">◫</span>
                  <span>40 of 70</span>
                </div>
                <div className="mobile-stat-item">
                  <span className="mobile-stat-icon">❋</span>
                  <span>14,686</span>
                </div>
              </div>

              <button className="mobile-btn-primary" type="button">
                journal now
              </button>

              {hasProjects && (
                <section className="mobile-panel mobile-project-panel">
                  <iframe
                    ref={mobileProjectIframeRef}
                    key={`mobile-${activeProjectLink}`}
                    src={hasProjects && !iframeBlocked ? activeProjectLink : undefined}
                    srcDoc={hasProjects && iframeBlocked ? blockedIframeDocument : hasProjects ? undefined : iframeDocument}
                    title="Mobile project preview"
                    scrolling="yes"
                    onError={() => {
                      if (hasProjects) setIframeBlocked(true);
                    }}
                  />
                </section>
              )}

              <section className="mobile-panel">
                <h4>sleep programs</h4>
                <article className="mobile-row-card">
                  <span>deep restore</span>
                  <small>22 min</small>
                </article>
                <article className="mobile-row-card">
                  <span>night unwind</span>
                  <small>16 min</small>
                </article>
                <article className="mobile-row-card">
                  <span>focus reset</span>
                  <small>12 min</small>
                </article>
              </section>

              <section className="mobile-panel">
                <h4>today timeline</h4>
                <article className="mobile-timeline-item">
                  <span>08:00</span>
                  <p>breath sequence started</p>
                </article>
                <article className="mobile-timeline-item">
                  <span>12:30</span>
                  <p>stress check completed</p>
                </article>
                <article className="mobile-timeline-item">
                  <span>18:40</span>
                  <p>evening calm reminder</p>
                </article>
                <article className="mobile-timeline-item">
                  <span>22:10</span>
                  <p>sleep protocol queued</p>
                </article>
              </section>

              <section className="mobile-panel">
                <h4>signal notes</h4>
                <p className="mobile-note">
                  Keep room light low, reduce caffeine after 6pm, and maintain the same sleep window for seven days.
                </p>
                <p className="mobile-note">
                  Recovery score improves when evening breathing and journaling happen within 30 minutes of each other.
                </p>
              </section>

              <section className="mobile-panel">
                <h4>session library</h4>
                <div className="mobile-chip-grid">
                  <span className="mobile-chip">breath reset</span>
                  <span className="mobile-chip">quiet focus</span>
                  <span className="mobile-chip">deep sleep</span>
                  <span className="mobile-chip">mind cooling</span>
                  <span className="mobile-chip">pulse calm</span>
                  <span className="mobile-chip">night stretch</span>
                </div>
              </section>

              <section className="mobile-panel">
                <h4>weekly trend</h4>
                <div className="mobile-bar-list">
                  <div className="mobile-bar-item">
                    <span>mon</span>
                    <b style={{ "--fill": "72%" }} />
                  </div>
                  <div className="mobile-bar-item">
                    <span>tue</span>
                    <b style={{ "--fill": "64%" }} />
                  </div>
                  <div className="mobile-bar-item">
                    <span>wed</span>
                    <b style={{ "--fill": "81%" }} />
                  </div>
                  <div className="mobile-bar-item">
                    <span>thu</span>
                    <b style={{ "--fill": "58%" }} />
                  </div>
                  <div className="mobile-bar-item">
                    <span>fri</span>
                    <b style={{ "--fill": "76%" }} />
                  </div>
                </div>
              </section>

              <section className="mobile-panel">
                <h4>community feed</h4>
                <article className="mobile-feed-item">
                  <strong>sleep circle</strong>
                  <p>7 day challenge started, 320 members active tonight.</p>
                </article>
                <article className="mobile-feed-item">
                  <strong>focus room</strong>
                  <p>New ambient program uploaded for coding sprint sessions.</p>
                </article>
                <article className="mobile-feed-item">
                  <strong>coach update</strong>
                  <p>Hydration reminder now synced with evening calm schedule.</p>
                </article>
              </section>

              <section className="mobile-panel">
                <h4>recommended next</h4>
                <article className="mobile-row-card">
                  <span>sleep scan report</span>
                  <small>open</small>
                </article>
                <article className="mobile-row-card">
                  <span>daily journal prompt</span>
                  <small>start</small>
                </article>
                <article className="mobile-row-card">
                  <span>recovery analytics</span>
                  <small>view</small>
                </article>
              </section>

              <div className="mobile-chevron-up" aria-hidden="true">
                ^
              </div>
            </div>

            <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
              <a className="mobile-nav-item active" href="#booking" aria-label="Home">
                <svg className="mobile-home-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3 4 9v12h5v-7h6v7h5V9l-8-6Z" />
                </svg>
              </a>
              <a className="mobile-nav-item" href="#proof" aria-label="Journal">
                ▤
              </a>
              <a className="mobile-nav-item" href="#systems" aria-label="Insights">
                ◴
              </a>
              <a className="mobile-nav-item" href="#lab" aria-label="Explore">
                ◌
              </a>
            </nav>
          </div>

          <div className="laptop-lid">
            <span className="laptop-camera" />
            <div className="laptop-screen">
              <iframe
                key={activeProjectLink || "fallback-project"}
                ref={iframeRef}
                title="Embedded digital service website"
                src={hasProjects && !iframeBlocked ? activeProjectLink : undefined}
                srcDoc={hasProjects && iframeBlocked ? blockedIframeDocument : hasProjects ? undefined : iframeDocument}
                scrolling="yes"
                onError={() => {
                  if (hasProjects) setIframeBlocked(true);
                }}
              />
              <span ref={shieldRef} className="laptop-scroll-shield" aria-hidden="true" />
              <span className="screen-glare" />
            </div>
          </div>
          <div className="laptop-hinge">
            <span />
            <span />
          </div>
          <div className="laptop-base">
            <div className="keyboard-grid" aria-hidden="true">
              {keyboardKeys.map((key) => (
                <span className={key > 44 ? "key key--wide" : "key"} key={key} />
              ))}
            </div>
            <div className="trackpad" aria-hidden="true" />
          </div>
          <div className="laptop-front-lip" aria-hidden="true" />
          <div className="laptop-shadow" aria-hidden="true" />
        </div>
      </div>

      {hasProjects && showProjectActions && (
        <div className="laptop-project-actions" role="group" aria-label="Project loop actions">
          <button className="project-back-button" onClick={goToPreviousProject} type="button">
            Back
          </button>
          <button className="project-next-button" onClick={goToNextProject} type="button">
            Next {activeIndex + 1}/{projectLinks.length}
          </button>
          <button
            className="project-open-button"
            onClick={() => {
              if (activeProjectLink) window.open(activeProjectLink, "_blank", "noopener,noreferrer");
            }}
            type="button"
          >
            Open
          </button>
        </div>
      )}
    </section>
  );
}
