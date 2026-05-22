import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, Suspense, useState } from "react";
import * as THREE from "three";
import { Text3D, Center } from "@react-three/drei";

// Use a CDN font URL that's publicly available
const fontPath = "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json";

function FloatingSuite({ active }) {
  const groupRef = useRef();
  
  const blueMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: "#30B0FF",
      metalness: 0.1,
      roughness: 0.3,
    }),
    []
  );

  useFrame(({ clock, pointer }) => {
    if (!active) return;
    const t = clock.elapsedTime;
    if (!groupRef.current) return;
    groupRef.current.rotation.y = t * 0.5 + pointer.x * 0.1;
    groupRef.current.rotation.x = Math.sin(t * 0.8) * 0.05 - pointer.y * 0.05;
    groupRef.current.position.y = Math.sin(t * 1.2) * 0.08;
  });

  return (
    <group ref={groupRef}>
      <Suspense fallback={null}>
        <Center>
          <Text3D
            font={fontPath}
            size={1.5}
            height={0.5}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.05}
            bevelSize={0.05}
            bevelSegments={10}
            material={blueMaterial}
          >
            SEO
          </Text3D>
        </Center>
      </Suspense>
    </group>
  );
}

export default function ObjectShowcase() {
  const wrapperRef = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting);
      },
      { rootMargin: "220px 0px", threshold: 0.08 },
    );
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} style={{ width: "100%", height: "100%" }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 42 }} dpr={[1, 1.8]} frameloop={active ? "always" : "demand"} gl={{ alpha: true }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[2, 4, 5]} intensity={1.5} />
          <directionalLight position={[-3, 1, 2]} intensity={0.5} color="#d4e8ff" />
          <FloatingSuite active={active} />
        </Suspense>
      </Canvas>
    </div>
  );
}
