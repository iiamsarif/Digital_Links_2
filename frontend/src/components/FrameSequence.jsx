import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function drawCover(ctx, image, width, height) {
  const imageRatio = image.width / image.height;
  const canvasRatio = width / height;
  let drawWidth = width;
  let drawHeight = height;
  let x = 0;
  let y = 0;

  if (imageRatio > canvasRatio) {
    drawHeight = height;
    drawWidth = height * imageRatio;
    x = (width - drawWidth) / 2;
  } else {
    drawWidth = width;
    drawHeight = width / imageRatio;
    y = (height - drawHeight) / 2;
  }

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
}

function drawContain(ctx, image, width, height) {
  const imageRatio = image.width / image.height;
  const canvasRatio = width / height;
  let drawWidth = width;
  let drawHeight = height;
  let x = 0;
  let y = 0;

  if (imageRatio > canvasRatio) {
    drawWidth = width;
    drawHeight = width / imageRatio;
    y = (height - drawHeight) / 2;
  } else {
    drawHeight = height;
    drawWidth = height * imageRatio;
    x = (width - drawWidth) / 2;
  }

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
}

export default function FrameSequence({
  frames,
  fps = 24,
  playbackFps = 42,
  velocityThreshold = 8,
  speedSmoothing = 18,
  stopFriction = 10,
  className = "",
  mode = "auto",
  scrollTriggerRef,
  scrollStart = "top bottom",
  scrollEnd = "bottom top",
  scrollScrub = 0.45,
  loadRootMargin = "1400px 0px",
  maxConcurrentLoads = 2,
  paused = false,
  startFrame = 0,
  fit = "cover",
  loopDirectional = false,
  ariaLabel = "Animated product sequence",
}) {
  const canvasRef = useRef(null);
  const loadedRef = useRef([]);
  const visibleRef = useRef(false);
  const rafRef = useRef(null);
  const startTimeRef = useRef(0);
  const sizeRef = useRef({ width: 0, height: 0, ratio: 1 });
  const lastFrameRef = useRef(-1);
  const currentFrameRef = useRef(startFrame);
  const targetFrameRef = useRef(startFrame);
  const activeRef = useRef(!scrollTriggerRef);
  const sleepTimerRef = useRef(null);
  const [shouldLoadFrames, setShouldLoadFrames] = useState(false);
  const motionRef = useRef({
    currentSpeed: 0,
    targetSpeed: 0,
    direction: 1,
    lastInputTime: Number.NEGATIVE_INFINITY,
    lastWheelTime: Number.NEGATIVE_INFINITY,
    wheelDirection: 0,
    lastScrollY: 0,
    lastTickTime: performance.now(),
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.35);
      sizeRef.current = { width: rect.width, height: rect.height, ratio };
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      lastFrameRef.current = -1;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadFrames(true);
          observer.disconnect();
        }
      },
      { rootMargin: loadRootMargin, threshold: 0.01 },
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [loadRootMargin]);

  useEffect(() => {
    if (!shouldLoadFrames) return undefined;

    let cancelled = false;
    const timers = [];
    loadedRef.current = [];

    const loadImage = (src, index) =>
      new Promise((resolve) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => {
          if (!cancelled) loadedRef.current[index] = image;
          resolve();
        };
        image.onerror = resolve;
        image.src = src;
      });

    const orderedFrames = [
      startFrame,
      ...frames.map((_, index) => index).filter((index) => index !== startFrame),
    ];
    let queueIndex = 0;
    let activeLoads = 0;
    const loadLimit = Math.max(1, maxConcurrentLoads);
    const schedulePump = () => {
      const timer = window.setTimeout(pump, 36);
      timers.push(timer);
    };

    const pump = () => {
      if (cancelled) return;

      while (activeLoads < loadLimit && queueIndex < orderedFrames.length) {
        const index = orderedFrames[queueIndex];
        queueIndex += 1;
        activeLoads += 1;

        loadImage(frames[index], index).finally(() => {
          activeLoads -= 1;
          if (!cancelled) {
            lastFrameRef.current = -1;
            schedulePump();
          }
        });
      }
    };

    pump();

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [frames, maxConcurrentLoads, shouldLoadFrames, startFrame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) startTimeRef.current = performance.now();
      },
      { threshold: 0.08 },
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (mode !== "scroll" && mode !== "directional") return undefined;

    const trigger = scrollTriggerRef?.current || canvasRef.current;
    if (!trigger) return undefined;

    const updateDirection = (velocity = 0, scrollY = window.scrollY || window.pageYOffset || 0) => {
      const state = motionRef.current;
      const now = performance.now();
      const delta = scrollY - state.lastScrollY;
      state.lastScrollY = scrollY;

      let direction = 0;
      if (Math.abs(delta) > 0.1) {
        direction = Math.sign(delta);
      } else if (Math.abs(velocity) >= velocityThreshold) {
        direction = Math.sign(velocity);
      }

      if (direction !== 0) {
        const wheelDirectionIsFresh = now - state.lastWheelTime < 260;
        if (wheelDirectionIsFresh && state.wheelDirection && Math.sign(direction) !== state.wheelDirection) {
          direction = state.wheelDirection;
        }

        state.direction = direction;
        state.lastInputTime = now;
      }
    };

    const scrollTrigger = ScrollTrigger.create({
      trigger,
      start: mode === "directional" ? "top bottom" : scrollStart,
      end: mode === "directional" ? "bottom top" : scrollEnd,
      scrub: mode === "directional" ? false : scrollScrub,
      invalidateOnRefresh: true,
      onEnter: () => {
        activeRef.current = true;
      },
      onEnterBack: () => {
        activeRef.current = true;
      },
      onLeave: () => {
        if (mode === "directional") activeRef.current = false;
      },
      onLeaveBack: () => {
        if (mode === "directional") activeRef.current = false;
      },
      onUpdate: (self) => {
        if (mode === "scroll") {
          targetFrameRef.current = startFrame + self.progress * (frames.length - 1 - startFrame);
        } else {
          updateDirection(self.getVelocity(), self.scroll());
        }
      },
      onRefresh: (self) => {
        if (mode === "directional") {
          motionRef.current.lastScrollY = self.scroll();
          updateDirection(self.getVelocity(), self.scroll());
        }
      },
    });

    const onWheel = (event) => {
      if (mode !== "directional" || Math.abs(event.deltaY) <= 0.1) return;
      const state = motionRef.current;
      const now = performance.now();
      state.direction = Math.sign(event.deltaY);
      if (Math.sign(state.currentSpeed) !== state.direction) {
        state.currentSpeed = 0;
      }
      state.wheelDirection = state.direction;
      state.lastWheelTime = now;
      state.lastInputTime = now;
    };

    if (mode === "directional") {
      window.addEventListener("wheel", onWheel, { passive: true });
    }

    return () => {
      window.removeEventListener("wheel", onWheel);
      scrollTrigger.kill();
    };
  }, [frames.length, mode, scrollEnd, scrollScrub, scrollStart, scrollTriggerRef, startFrame, velocityThreshold]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false, desynchronized: true });
    if (!canvas || !ctx) return undefined;

    const findLoadedFrame = (target) => {
      if (loadedRef.current[target]) return target;
      for (let offset = 1; offset < frames.length; offset += 1) {
        const previous = (target - offset + frames.length) % frames.length;
        if (loadedRef.current[previous]) return previous;
        const next = (target + offset) % frames.length;
        if (loadedRef.current[next]) return next;
      }
      return -1;
    };

    const wrapDirectionalProgress = (value) => {
      const span = Math.max(1, frames.length - 1 - startFrame);
      const cycle = span * 2;
      const wrapped = ((value - startFrame) % cycle + cycle) % cycle;
      return startFrame + wrapped;
    };

    const getLoopedDirectionalFrame = (value) => {
      const maxFrame = frames.length - 1;
      const span = Math.max(1, maxFrame - startFrame);
      const offset = value - startFrame;
      return offset <= span ? startFrame + offset : maxFrame - (offset - span);
    };

    const queueNextTick = () => {
      const shouldStayHot = visibleRef.current || (mode === "directional" && activeRef.current);
      if (shouldStayHot) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      sleepTimerRef.current = window.setTimeout(() => {
        rafRef.current = requestAnimationFrame(tick);
      }, 900);
    };

    const tick = (time) => {
      if (!paused && visibleRef.current) {
        let frame;

        if (mode === "scroll") {
          const delta = targetFrameRef.current - currentFrameRef.current;
          currentFrameRef.current += delta * 0.24;

          if (Math.abs(delta) < 0.05) {
            currentFrameRef.current = targetFrameRef.current;
          }

          frame = Math.round(Math.min(frames.length - 1, Math.max(0, currentFrameRef.current)));
        } else if (mode === "directional") {
          const state = motionRef.current;
          const deltaTime = Math.min(0.08, Math.max(0, (time - state.lastTickTime) / 1000));
          state.lastTickTime = time;

          if (activeRef.current && deltaTime > 0) {
            const activeInputWindowMs = 420;
            const now = performance.now();
            const isUserScrolling = now - state.lastInputTime < activeInputWindowMs;
            const targetSpeed = isUserScrolling ? state.direction * Math.max(1, playbackFps) : 0;
            const smoothing = 1 - Math.exp(-Math.max(1, speedSmoothing) * deltaTime);

            state.currentSpeed += (targetSpeed - state.currentSpeed) * smoothing;

            if (!isUserScrolling) {
              state.currentSpeed *= Math.exp(-Math.max(1, stopFriction) * deltaTime);
              if (Math.abs(state.currentSpeed) < 0.015) state.currentSpeed = 0;
            }

            const nextFrame = currentFrameRef.current + state.currentSpeed * deltaTime;
            if (loopDirectional) {
              currentFrameRef.current = wrapDirectionalProgress(nextFrame);
            } else {
              currentFrameRef.current = Math.min(frames.length - 1, Math.max(0, nextFrame));

              if (
                (currentFrameRef.current <= 0 && state.currentSpeed < 0) ||
                (currentFrameRef.current >= frames.length - 1 && state.currentSpeed > 0)
              ) {
                state.currentSpeed = 0;
              }
            }
          }

          frame = Math.round(loopDirectional ? getLoopedDirectionalFrame(currentFrameRef.current) : currentFrameRef.current);
        } else {
          const elapsed = Math.max(0, time - startTimeRef.current) / 1000;
          frame = Math.floor(elapsed * fps + startFrame) % frames.length;
        }

        const loadedIndex = findLoadedFrame(frame);

        if (loadedIndex !== -1 && loadedIndex !== lastFrameRef.current) {
          const image = loadedRef.current[loadedIndex];
          const { width, height, ratio } = sizeRef.current;
          ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
          if (fit === "contain") {
            drawContain(ctx, image, width, height);
          } else {
            drawCover(ctx, image, width, height);
          }
          lastFrameRef.current = loadedIndex;
          canvas.dataset.frameIndex = String(loadedIndex);
        }
      }

      queueNextTick();
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(sleepTimerRef.current);
    };
  }, [fit, fps, frames.length, loopDirectional, mode, paused, playbackFps, speedSmoothing, startFrame, stopFriction]);

  return <canvas ref={canvasRef} className={`frame-sequence ${className}`} aria-label={ariaLabel} />;
}
