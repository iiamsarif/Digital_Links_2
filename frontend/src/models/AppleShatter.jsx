import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

export default function AppleShatter({ progressRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // --- 1. SETUP SCENE ---
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();

    // FIX 1: FOG REMOVED.
    // The black fog was covering the pieces in darkness against your orange background.

    const parentWidth = canvas.clientWidth;
    const parentHeight = canvas.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, parentWidth / parentHeight, 0.1, 100);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(parentWidth, parentHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- 2. 360-DEGREE LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x44aaff, 2.0);
    scene.add(hemiLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);

    // --- 3. BUILD THE SCENE ---
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    const animatedParts = [];
    const EARTH_RADIUS = 2.5;
    const NET_RADIUS = 2.65;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    const realEarthMap = textureLoader.load("https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg");
    realEarthMap.colorSpace = THREE.SRGBColorSpace;
    realEarthMap.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // FIX 2: LOCKED MATERIAL.
    // High emissive glow ensures it NEVER turns black, depthWrite false prevents overlapping black shadows.
    const earthMaterial = new THREE.MeshPhysicalMaterial({
      map: realEarthMap,
      color: 0x88b0ff,
      emissive: 0x4477ff,
      emissiveIntensity: 0.8,
      metalness: 0.1,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
      side: THREE.DoubleSide,
    });

    const silverMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.15,
    });

    // FIX 3: STUTTER FIX.
    // Reduced segments from (24, 24) to (12, 12).
    // This drops the shard count from 576 down to 144, keeping the scroll silky smooth.
    const earthGeo = new THREE.SphereGeometry(EARTH_RADIUS, 12, 12);
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
          if (uv[uvIdx] !== undefined) {
            chunkUv.push(uv[uvIdx], uv[uvIdx + 1]);
          } else {
            chunkUv.push(0, 0);
          }
        }
      }

      let cx = 0;
      let cy = 0;
      let cz = 0;
      let count = chunkPos.length / 3;
      for (let k = 0; k < count; k++) {
        cx += chunkPos[k * 3];
        cy += chunkPos[k * 3 + 1];
        cz += chunkPos[k * 3 + 2];
      }
      cx /= count;
      cy /= count;
      cz /= count;
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

    // NETWORK LOGIC (Nodes and Links)
    const netGeo = new THREE.IcosahedronGeometry(NET_RADIUS, 2);
    const netPos = netGeo.attributes.position.array;
    const uniqueVertices = [];
    const vertexMap = new Map();

    for (let i = 0; i < netPos.length; i += 3) {
      const x = Math.round(netPos[i] * 100) / 100;
      const y = Math.round(netPos[i + 1] * 100) / 100;
      const z = Math.round(netPos[i + 2] * 100) / 100;
      const key = `${x}_${y}_${z}`;
      if (!vertexMap.has(key)) {
        const v = new THREE.Vector3(netPos[i], netPos[i + 1], netPos[i + 2]);
        vertexMap.set(key, v);
        uniqueVertices.push(v);
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

    // --- 4. GSAP TIMELINE (Controlled by Hero.jsx) ---
    const tl = gsap.timeline({ paused: true });

    animatedParts.forEach((part) => {
      tl.to(part.mesh.position, { x: part.targetPos.x, y: part.targetPos.y, z: part.targetPos.z, duration: 4, ease: "power2.inOut" }, 0);
      tl.to(part.mesh.rotation, { x: part.targetRot.x, y: part.targetRot.y, z: part.targetRot.z, duration: 4, ease: "power2.inOut" }, 0);
    });

    tl.to(masterGroup.rotation, { y: Math.PI * 1.5, x: Math.PI * 0.2, duration: 4, ease: "power1.inOut" }, 0);

    // --- 5. RENDER LOOP ---
    let idleTime = 0;
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Sync the 3D timeline with the scroll progress from your Hero section
      if (progressRef && progressRef.current !== undefined) {
        tl.progress(progressRef.current);
      }

      idleTime += 0.001;
      masterGroup.rotation.z += Math.sin(idleTime) * 0.001;
      masterGroup.rotation.y += 0.002;

      renderer.render(scene, camera);
    };
    animate();

    // --- 6. RESPONSIVE ---
    const handleResize = () => {
      if (!canvasRef.current) return;
      const newWidth = canvasRef.current.clientWidth;
      const newHeight = canvasRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    // --- 7. CLEANUP ---
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      tl.kill();
      earthGeo.dispose();
      netGeo.dispose();
      edgeGeo.dispose();
      nodeGeo.dispose();
      earthMaterial.dispose();
      silverMaterial.dispose();
      realEarthMap.dispose();
      renderer.dispose();
    };
  }, [progressRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
}
