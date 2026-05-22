import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AdminPanel from "./admin/AdminPanel.jsx";
import SmoothScroll from "./components/SmoothScroll.jsx";
import Hero from "./sections/Hero.jsx";
import TransformationSection from "./sections/TransformationSection.jsx";
import LaptopSection from "./sections/LaptopSection.jsx";
import LuxuryReveal from "./sections/LuxuryReveal.jsx";
import TrainText from "./sections/TrainText.jsx";
import {
  AdvantageHighlights,
  BookingMiniCta,
  ClosingSection,
  FleetShowcase,
  ModelShowcaseSection,
  PackageSection,
  ProofStreamSection,
  StatsSection,
} from "./sections/StorySections.jsx";
import { useGsapReveal } from "./utils/useGsapReveal.js";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const appRef = useRef(null);
  useGsapReveal(appRef);
  const isAdmin = window.location.pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return undefined;
    const scope = appRef.current;
    if (!scope) return undefined;

    const tweens = [];
    const animateCount = (element) => {
      const target = Number(element.dataset.count);
      const value = { count: 0 };
      const tween = gsap.to(value, {
        count: target,
        duration: 1.8,
        ease: "power2.out",
        onUpdate: () => {
          element.textContent = `${Math.round(value.count)}${target === 99 ? "%" : "+"}`;
        },
        onComplete: () => {
          element.textContent = `${target}${target === 99 ? "%" : "+"}`;
        },
      });
      tweens.push(tween);
    };

    const countElements = gsap.utils.toArray("[data-count]", scope);
    if (!("IntersectionObserver" in window)) {
      countElements.forEach(animateCount);
      return () => tweens.forEach((tween) => tween.kill());
    }

    let hasAnimatedCounts = false;
    const statsSection = scope.querySelector(".stats-section") || countElements[0];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || hasAnimatedCounts) return;
          hasAnimatedCounts = true;
          observer.unobserve(entry.target);
          countElements.forEach(animateCount);
        });
      },
      { rootMargin: "0px 0px -18% 0px", threshold: 0.12 },
    );

    countElements.forEach((element) => {
      element.textContent = `0${Number(element.dataset.count) === 99 ? "%" : "+"}`;
    });
    if (statsSection) observer.observe(statsSection);

    return () => {
      observer.disconnect();
      tweens.forEach((tween) => tween.kill());
    };
  }, [isAdmin]);

  if (isAdmin) {
    return <AdminPanel />;
  }

  return (
    <main ref={appRef}>
      <SmoothScroll />
      <Hero />
      <TransformationSection />
      <LaptopSection />
      <LuxuryReveal />
      <TrainText />
      <FleetShowcase />
      <AdvantageHighlights />
      <ProofStreamSection />
      <PackageSection />
      <BookingMiniCta />
      <ModelShowcaseSection />
      <StatsSection />
      <ClosingSection />
    </main>
  );
}
