import { useEffect, useRef } from "react";

const HERO_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cinematic Network Earth Shatter - Realistic</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      background: transparent;
      color: white;
      font-family: "Segoe UI", sans-serif;
      overflow: hidden;
    }

    #webgl-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 5;
      pointer-events: none;
    }

    .scroll-indicator {
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 12px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.74);
      z-index: 30;
      animation: pulse 2s infinite;
      pointer-events: none;
    }

    .hero-overlay {
      position: fixed;
      inset: 0;
      z-index: 25;
      pointer-events: none;
    }

    .nav-bar {
      position: absolute;
      inset: 0 auto auto 0;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 24px;
      box-sizing: border-box;
      pointer-events: auto;
    }

    .brand {
      text-decoration: none;
      color: #f4ecdf;
      display: grid;
      gap: 2px;
      font-weight: 700;
      letter-spacing: 0.08em;
    }

    .brand small {
      font-size: 11px;
      opacity: 0.84;
      letter-spacing: 0.04em;
      font-weight: 500;
    }

    .nav-links {
      display: flex;
      gap: 14px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .nav-links a {
      color: rgba(255, 255, 255, 0.88);
      text-decoration: none;
    }

    .hero-title-wrap {
      position: absolute;
      inset: 0;
      display: grid;
      align-content: center;
      gap: 0.9rem;
      z-index: 26;
      pointer-events: none;
    }

    .hero-title {
      margin: 0;
      color: #f4ecdf;
      font-size: clamp(54px, 14vw, 210px);
      line-height: 0.8;
      text-transform: uppercase;
      font-weight: 900;
      letter-spacing: 0;
      text-shadow: 0 18px 60px rgba(0, 0, 0, 0.42);
    }

    .hero-title-left { padding-left: clamp(18px, 5vw, 70px); }
    .hero-title-right { justify-self: end; padding-right: clamp(18px, 5vw, 70px); }

    .hero-side {
      position: absolute;
      top: 44%;
      left: clamp(16px, 4vw, 56px);
      z-index: 27;
      display: grid;
      gap: 7px;
      writing-mode: vertical-rl;
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(244, 236, 223, 0.74);
      pointer-events: none;
    }

    .hero-side strong { color: #f4ecdf; font-size: 12px; }
    .hero-side-right { left: auto; right: clamp(16px, 4vw, 56px); }

    .hero-copy {
      position: absolute;
      right: clamp(18px, 5vw, 70px);
      bottom: clamp(26px, 9vh, 90px);
      width: min(440px, calc(100vw - 36px));
      z-index: 28;
      pointer-events: auto;
    }

    .hero-eyebrow {
      display: block;
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(244, 236, 223, 0.86);
      margin-bottom: 10px;
      font-weight: 700;
    }

    .hero-copy p {
      margin: 0 0 18px;
      font-size: clamp(14px, 1.3vw, 18px);
      line-height: 1.6;
      color: rgba(244, 236, 223, 0.82);
    }

    .hero-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      padding: 0 18px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.36);
      color: #f4ecdf;
      text-decoration: none;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-size: 11px;
      background: rgba(255, 255, 255, 0.09);
      backdrop-filter: blur(2px);
      pointer-events: auto;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.3; transform: translateX(-50%) translateY(0); }
      50% { opacity: 1; transform: translateX(-50%) translateY(5px); }
    }
  </style>
</head>
<body>
  <div class="hero-overlay">
    <div class="nav-bar">
      <a class="brand" href="#top"><span>DL</span><small>Digital Links</small></a>
      <div class="nav-links">
        <a href="#systems">Systems</a>
        <a href="#lab">Lab</a>
        <a href="#proof">Proof</a>
        <a href="#booking">Contact</a>
      </div>
    </div>
    <div class="hero-side"><span>Private builds</span><strong>Apps. Web. Cloud.</strong></div>
    <div class="hero-side hero-side-right"><span>Deployment desk</span><strong>+91 / Global</strong></div>
    <div class="hero-title-wrap">
      <h1 class="hero-title hero-title-left">Digital</h1>
      <h1 class="hero-title hero-title-right">Links</h1>
    </div>
    <div class="hero-copy">
      <span class="hero-eyebrow">Luxury software command center</span>
      <p>Premium web platforms, mobile apps, automation systems, and cloud operations engineered with the precision of a production command stack.</p>
      <a class="hero-btn" href="#booking">Book the Build</a>
    </div>
  </div>

  
  <canvas id="webgl-canvas"></canvas>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script>
    const canvas = document.getElementById("webgl-canvas");
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030408, 0.035);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 10.7);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0x203040, 1.2);
    scene.add(ambientLight);
    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);
    const rimLight = new THREE.DirectionalLight(0x44aaff, 4.0);
    rimLight.position.set(-8, -2, -5);
    scene.add(rimLight);

    const masterGroup = new THREE.Group();
    scene.add(masterGroup);
    const animatedParts = [];
    const EARTH_RADIUS = 2.4;
    const NET_RADIUS = 2.62;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    const realEarthMap = textureLoader.load("https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg");
    realEarthMap.colorSpace = THREE.SRGBColorSpace;
    realEarthMap.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const earthMaterial = new THREE.MeshPhysicalMaterial({
      map: realEarthMap,
      color: 0x88b0ff,
      metalness: 0.1,
      roughness: 0.3,
      transmission: 0.45,
      transparent: true,
      opacity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.2,
      side: THREE.DoubleSide
    });

    const silverMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.15
    });

    const earthGeo = new THREE.SphereGeometry(EARTH_RADIUS, 24, 24);
    const nonIndexed = earthGeo.toNonIndexed();
    nonIndexed.computeVertexNormals();
    const pos = nonIndexed.attributes.position.array;
    const uv = nonIndexed.attributes.uv.array;
    const norm = nonIndexed.attributes.normal.array;

    for (let i = 0; i < pos.length; i += 18) {
      const chunkPos = [];
      const chunkUv = [];
      const chunkNorm = [];
      const baseVertexIndex = i / 3;

      for (let v = 0; v < 6; v++) {
        const pIdx = i + v * 3;
        const uvIdx = (baseVertexIndex + v) * 2;
        if (pos[pIdx] !== undefined) {
          chunkPos.push(pos[pIdx], pos[pIdx + 1], pos[pIdx + 2]);
          chunkNorm.push(norm[pIdx], norm[pIdx + 1], norm[pIdx + 2]);
          if (uv[uvIdx] !== undefined) chunkUv.push(uv[uvIdx], uv[uvIdx + 1]);
          else chunkUv.push(0, 0);
        }
      }

      let cx = 0, cy = 0, cz = 0;
      let count = chunkPos.length / 3;
      for (let k = 0; k < count; k++) {
        cx += chunkPos[k * 3]; cy += chunkPos[k * 3 + 1]; cz += chunkPos[k * 3 + 2];
      }
      cx /= count; cy /= count; cz /= count;
      const center = new THREE.Vector3(cx, cy, cz);

      const localPos = new Float32Array(chunkPos.length);
      for (let k = 0; k < count; k++) {
        localPos[k * 3] = chunkPos[k * 3] - cx;
        localPos[k * 3 + 1] = chunkPos[k * 3 + 1] - cy;
        localPos[k * 3 + 2] = chunkPos[k * 3 + 2] - cz;
      }

      const panelGeo = new THREE.BufferGeometry();
      panelGeo.setAttribute("position", new THREE.BufferAttribute(localPos, 3));
      panelGeo.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(chunkNorm), 3));
      panelGeo.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(chunkUv), 2));

      const panelMesh = new THREE.Mesh(panelGeo, earthMaterial);
      panelMesh.position.copy(center);
      const explodeDist = 3 + Math.random() * 5;
      const targetPos = center.clone().normalize().multiplyScalar(explodeDist);
      const targetRot = new THREE.Euler(Math.random() * 5, Math.random() * 5, Math.random() * 5);
      animatedParts.push({ mesh: panelMesh, targetPos: targetPos, targetRot: targetRot });
      masterGroup.add(panelMesh);
    }

    const netGeo = new THREE.IcosahedronGeometry(NET_RADIUS, 2);
    const netPos = netGeo.attributes.position.array;
    const uniqueVertices = [];
    const vertexMap = new Map();
    for (let i = 0; i < netPos.length; i += 3) {
      const x = Math.round(netPos[i] * 100) / 100;
      const y = Math.round(netPos[i + 1] * 100) / 100;
      const z = Math.round(netPos[i + 2] * 100) / 100;
      const key = x + "_" + y + "_" + z;
      if (!vertexMap.has(key)) {
        const vv = new THREE.Vector3(netPos[i], netPos[i + 1], netPos[i + 2]);
        vertexMap.set(key, vv);
        uniqueVertices.push(vv);
      }
    }

    const nodeGeo = new THREE.SphereGeometry(0.035, 16, 16);
    uniqueVertices.forEach((v) => {
      const nodeMesh = new THREE.Mesh(nodeGeo, silverMaterial);
      nodeMesh.position.copy(v);
      const explodeDist = 5.5 + Math.random() * 6;
      const targetPos = v.clone().normalize().multiplyScalar(explodeDist);
      animatedParts.push({ mesh: nodeMesh, targetPos: targetPos, targetRot: new THREE.Euler() });
      masterGroup.add(nodeMesh);
    });

    const edgeGeo = new THREE.EdgesGeometry(netGeo);
    const edgePos = edgeGeo.attributes.position.array;
    for (let i = 0; i < edgePos.length; i += 6) {
      const v1 = new THREE.Vector3(edgePos[i], edgePos[i + 1], edgePos[i + 2]);
      const v2 = new THREE.Vector3(edgePos[i + 3], edgePos[i + 4], edgePos[i + 5]);
      const distance = v1.distanceTo(v2);
      const center = v1.clone().lerp(v2, 0.5);

      const linkGeo = new THREE.CylinderGeometry(0.012, 0.012, distance, 6);
      const linkMesh = new THREE.Mesh(linkGeo, silverMaterial);
      linkMesh.position.copy(center);
      linkMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v2.clone().sub(v1).normalize());
      const explodeDist = 4.5 + Math.random() * 7;
      const targetPos = center.clone().normalize().multiplyScalar(explodeDist);
      const targetRot = new THREE.Euler(linkMesh.rotation.x + Math.random() * 6, linkMesh.rotation.y + Math.random() * 6, linkMesh.rotation.z + Math.random() * 6);
      animatedParts.push({ mesh: linkMesh, targetPos: targetPos, targetRot: targetRot });
      masterGroup.add(linkMesh);
    }

    const tl = gsap.timeline({ paused: true });
    let targetProgress = 0;
    tl.to("#scroll-text", { opacity: 0, duration: 0.1 }, 0);
    tl.to(".hero-title-left", { x: "-34vw", autoAlpha: 0, filter: "blur(18px)", scale: 0.92 }, 0);
    tl.to(".hero-title-right", { x: "34vw", autoAlpha: 0, filter: "blur(18px)", scale: 0.92 }, 0);
    tl.to(".hero-copy", { y: -90, autoAlpha: 0, filter: "blur(12px)" }, 0.04);
    tl.to(".hero-side", { x: -80, autoAlpha: 0 }, 0.02);
    tl.to(".hero-side-right", { x: 80, autoAlpha: 0 }, 0.02);

    animatedParts.forEach((part) => {
      tl.to(part.mesh.position, { x: part.targetPos.x, y: part.targetPos.y, z: part.targetPos.z, duration: 4, ease: "power2.inOut" }, 0);
      tl.to(part.mesh.rotation, { x: part.targetRot.x, y: part.targetRot.y, z: part.targetRot.z, duration: 4, ease: "power2.inOut" }, 0);
    });
    tl.to(masterGroup.rotation, { y: Math.PI * 1.5, x: Math.PI * 0.2, duration: 4, ease: "power1.inOut" }, 0);

    let idleTime = 0;
    let heroActive = true;
    let animationFrameId = 0;
    let sleepTimerId = 0;
    let lastRenderedProgress = -1;

    function scheduleRenderLoop() {
      window.clearTimeout(sleepTimerId);
      if (heroActive || Math.abs(targetProgress - lastRenderedProgress) > 0.0005) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      sleepTimerId = window.setTimeout(() => {
        animationFrameId = requestAnimationFrame(animate);
      }, 650);
    }

    function animate() {
      if (heroActive || Math.abs(targetProgress - lastRenderedProgress) > 0.0005) {
        idleTime += 0.001;
        tl.progress(targetProgress);
        masterGroup.rotation.z = Math.sin(idleTime) * 0.1;
        renderer.render(scene, camera);
        lastRenderedProgress = targetProgress;
      }
      scheduleRenderLoop();
    }
    scheduleRenderLoop();

    function setProgress(p) {
      const progress = Math.max(0, Math.min(1, Number(p) || 0));
      targetProgress = progress;
    }

    window.addEventListener("message", (ev) => {
      if (!ev || !ev.data || ev.data.type !== "heroProgress") return;
      setProgress(ev.data.progress);
      heroActive = ev.data.active !== false;
    });

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.render(scene, camera);
    });
  </script>
</body>
</html>`;

export default function Hero() {
  const sectionRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    if (!section || !frame) return undefined;

    let rawProgress = 0;
    let smoothProgress = 0;
    let isHeroInView = false;
    let rafId = 0;
    let sleepTimerId = 0;
    let lastPostedProgress = -1;
    let lastPostedActive = null;

    const computeProgress = () => {
      const rect = section.getBoundingClientRect();
      const total = Math.max(section.offsetHeight - window.innerHeight, 1);
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      rawProgress = scrolled / total;
      isHeroInView = rect.bottom > 0 && rect.top < window.innerHeight;
    };

    const postProgress = (progress, active) => {
      if (!frame.contentWindow) return;
      const progressChanged = Math.abs(progress - lastPostedProgress) > 0.0005;
      const activeChanged = active !== lastPostedActive;
      if (!progressChanged && !activeChanged) return;

      frame.contentWindow.postMessage({ type: "heroProgress", progress, active }, "*");
      lastPostedProgress = progress;
      lastPostedActive = active;
    };

    const schedulePush = () => {
      window.clearTimeout(sleepTimerId);
      if (isHeroInView || Math.abs(rawProgress - smoothProgress) > 0.001) {
        rafId = requestAnimationFrame(pushProgress);
        return;
      }

      sleepTimerId = window.setTimeout(pushProgress, 350);
    };

    const pushProgress = () => {
      // Drive everything from one RAF clock to avoid bursty wheel/touch event jitter.
      computeProgress();
      const target = rawProgress;

      // Hard-sync when hero is out of view so re-entry does not carry stale chase momentum.
      if (!isHeroInView) {
        smoothProgress = target;
      } else {
        // Fixed-rate chase makes manual wheel/touch feel closer to constant auto-scroll speed.
        const delta = target - smoothProgress;
        const absDelta = Math.abs(delta);
        if (absDelta > 0.0005) {
          const step = Math.min(absDelta, 0.0065);
          smoothProgress += Math.sign(delta) * step;
        } else {
          smoothProgress = target;
        }
      }

      // Prevent tiny oscillation near ends where manual wheels can jitter.
      if (smoothProgress < 0.002) smoothProgress = 0;
      if (smoothProgress > 0.998) smoothProgress = 1;

      smoothProgress = Math.max(0, Math.min(1, smoothProgress));
      postProgress(smoothProgress, isHeroInView);
      schedulePush();
    };

    const syncNow = () => {
      computeProgress();
      postProgress(rawProgress, isHeroInView);
    };

    frame.addEventListener("load", syncNow);
    computeProgress();
    pushProgress();
    window.addEventListener("resize", syncNow);
    window.addEventListener("focus", syncNow);

    return () => {
      frame.removeEventListener("load", syncNow);
      window.removeEventListener("resize", syncNow);
      window.removeEventListener("focus", syncNow);
      cancelAnimationFrame(rafId);
      window.clearTimeout(sleepTimerId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero"
      data-section="01"
      style={{
        minHeight: "180vh",
        background:
          "radial-gradient(circle at 50% 42%, rgba(68, 170, 255, 0.24), transparent 30rem), linear-gradient(180deg, #08203a 0%, #0a2f56 58%, #0c3f73 100%)",
      }}
    >
      <iframe
        ref={frameRef}
        title="Hero Earth Shatter"
        srcDoc={HERO_HTML}
        scrolling="no"
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          height: "100vh",
          border: "0",
          display: "block",
          overflow: "hidden",
          background: "transparent",
          pointerEvents: "none",
        }}
      />
      <div
        aria-label="Hero navigation links"
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          marginTop: "-100vh",
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        <a
          href="#top"
          aria-label="Digital Links"
          style={{
            position: "absolute",
            top: 14,
            left: 18,
            width: 190,
            height: 48,
            pointerEvents: "auto",
          }}
        />
        <a
          href="#systems"
          aria-label="Systems"
          style={{
            position: "absolute",
            top: 18,
            right: 276,
            width: 72,
            height: 34,
            pointerEvents: "auto",
          }}
        />
        <a
          href="#lab"
          aria-label="Lab"
          style={{
            position: "absolute",
            top: 18,
            right: 218,
            width: 44,
            height: 34,
            pointerEvents: "auto",
          }}
        />
        <a
          href="#proof"
          aria-label="Proof"
          style={{
            position: "absolute",
            top: 18,
            right: 146,
            width: 58,
            height: 34,
            pointerEvents: "auto",
          }}
        />
        <a
          href="#booking"
          aria-label="Contact"
          style={{
            position: "absolute",
            top: 18,
            right: 62,
            width: 70,
            height: 34,
            pointerEvents: "auto",
          }}
        />
        <a
          href="#booking"
          aria-label="Book the Build"
          style={{
            position: "absolute",
            right: "clamp(18px, 5vw, 70px)",
            bottom: "clamp(26px, 9vh, 90px)",
            width: 160,
            height: 48,
            pointerEvents: "auto",
          }}
        />
      </div>
    </section>
  );
}

