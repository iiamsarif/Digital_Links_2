import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const smooth = (edge0, edge1, value) => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

const setTransform = (ref, from, to, t) => {
  if (!ref.current) return;
  const mesh = ref.current;
  mesh.position.set(
    THREE.MathUtils.lerp(from.position[0], to.position[0], t),
    THREE.MathUtils.lerp(from.position[1], to.position[1], t),
    THREE.MathUtils.lerp(from.position[2], to.position[2], t),
  );
  mesh.rotation.set(
    THREE.MathUtils.lerp(from.rotation[0], to.rotation[0], t),
    THREE.MathUtils.lerp(from.rotation[1], to.rotation[1], t),
    THREE.MathUtils.lerp(from.rotation[2], to.rotation[2], t),
  );
  mesh.scale.set(
    THREE.MathUtils.lerp(from.scale[0], to.scale[0], t),
    THREE.MathUtils.lerp(from.scale[1], to.scale[1], t),
    THREE.MathUtils.lerp(from.scale[2], to.scale[2], t),
  );
};

function AndroidArchitecture({ progressRef }) {
  const rootRef = useRef();
  const headRef = useRef();
  const torsoRef = useRef();
  const faceRef = useRef();
  const eyeLeftRef = useRef();
  const eyeRightRef = useRef();
  const antennaLeftRef = useRef();
  const antennaRightRef = useRef();
  const upperArmLeftRef = useRef();
  const forearmLeftRef = useRef();
  const upperArmRightRef = useRef();
  const forearmRightRef = useRef();
  const legLeftRef = useRef();
  const legRightRef = useRef();
  const lineGroupRef = useRef();
  const shadowRef = useRef();
  const smoothedProgressRef = useRef(0);

  const palette = useMemo(
    () => ({
      android: new THREE.Color("#8fbd21"),
      androidHighlight: new THREE.Color("#b6dc57"),
      layout: new THREE.Color("#e7e0d3"),
      layoutGreen: new THREE.Color("#b7c889"),
    }),
    [],
  );

  const materials = useMemo(
    () => ({
      body: new THREE.MeshPhysicalMaterial({
        color: "#8fbd21",
        roughness: 0.33,
        metalness: 0.05,
        clearcoat: 0.55,
        clearcoatRoughness: 0.24,
      }),
      highlight: new THREE.MeshPhysicalMaterial({
        color: "#b6dc57",
        roughness: 0.28,
        metalness: 0.04,
        clearcoat: 0.64,
        clearcoatRoughness: 0.2,
      }),
      face: new THREE.MeshStandardMaterial({
        color: "#82f3ff",
        emissive: "#2be8ff",
        emissiveIntensity: 1.45,
        roughness: 0.18,
      }),
      line: new THREE.MeshBasicMaterial({
        color: "#fbf7ee",
        transparent: true,
        opacity: 0,
      }),
      shadow: new THREE.MeshBasicMaterial({
        color: "#000000",
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      }),
    }),
    [],
  );

  const parts = useMemo(
    () => ({
      head: {
        from: { position: [0, 1.18, -0.02], rotation: [0.06, 0, 0], scale: [0.78, 0.48, 0.62] },
        to: { position: [0, 0.08, -0.92], rotation: [0, 0, 0], scale: [1.08, 0.08, 0.32] },
      },
      torso: {
        from: { position: [0, 0.32, 0], rotation: [0, 0, 0], scale: [0.76, 1.05, 0.55] },
        to: { position: [0, 0.1, 0], rotation: [0, 0, 0], scale: [0.92, 0.09, 1.28] },
      },
      face: {
        from: { position: [0, 1.03, 0.33], rotation: [0, 0, 0], scale: [0.1, 0.018, 0.018] },
        to: { position: [0, 0.17, -0.92], rotation: [-Math.PI / 2, 0, 0], scale: [0.82, 0.02, 0.02] },
      },
      eyeLeft: {
        from: { position: [-0.14, 1.13, 0.39], rotation: [0, 0, 0], scale: [0.045, 0.045, 0.045] },
        to: { position: [-0.26, 0.18, -1.12], rotation: [0, 0, 0], scale: [0.03, 0.03, 0.03] },
      },
      eyeRight: {
        from: { position: [0.14, 1.13, 0.39], rotation: [0, 0, 0], scale: [0.045, 0.045, 0.045] },
        to: { position: [0.26, 0.18, -1.12], rotation: [0, 0, 0], scale: [0.03, 0.03, 0.03] },
      },
      antennaLeft: {
        from: { position: [-0.24, 1.56, -0.03], rotation: [0.52, 0, -0.44], scale: [0.03, 0.34, 0.03] },
        to: { position: [-0.42, 0.16, -1.18], rotation: [0, 0, Math.PI / 2], scale: [0.02, 0.28, 0.02] },
      },
      antennaRight: {
        from: { position: [0.24, 1.56, -0.03], rotation: [0.52, 0, 0.44], scale: [0.03, 0.34, 0.03] },
        to: { position: [0.42, 0.16, -1.18], rotation: [0, 0, Math.PI / 2], scale: [0.02, 0.28, 0.02] },
      },
      upperArmLeft: {
        from: { position: [-0.63, 0.56, 0], rotation: [0, 0, -0.52], scale: [0.18, 0.52, 0.18] },
        to: { position: [-0.86, 0.09, -0.08], rotation: [0, 0, 0], scale: [0.22, 0.08, 0.94] },
      },
      forearmLeft: {
        from: { position: [-0.83, 0.12, 0], rotation: [0, 0, -0.22], scale: [0.16, 0.42, 0.16] },
        to: { position: [-1.22, 0.1, 0.18], rotation: [0, 0, 0], scale: [0.2, 0.08, 0.58] },
      },
      upperArmRight: {
        from: { position: [0.63, 0.56, 0], rotation: [0, 0, 0.52], scale: [0.18, 0.52, 0.18] },
        to: { position: [0.86, 0.09, -0.08], rotation: [0, 0, 0], scale: [0.22, 0.08, 0.94] },
      },
      forearmRight: {
        from: { position: [0.83, 0.12, 0], rotation: [0, 0, 0.22], scale: [0.16, 0.42, 0.16] },
        to: { position: [1.22, 0.1, 0.18], rotation: [0, 0, 0], scale: [0.2, 0.08, 0.58] },
      },
      legLeft: {
        from: { position: [-0.22, -0.6, 0], rotation: [0, 0, 0.08], scale: [0.18, 0.58, 0.18] },
        to: { position: [-0.3, 0.08, 0.98], rotation: [0, 0, 0], scale: [0.24, 0.08, 0.52] },
      },
      legRight: {
        from: { position: [0.22, -0.6, 0], rotation: [0, 0, -0.08], scale: [0.18, 0.58, 0.18] },
        to: { position: [0.3, 0.08, 0.98], rotation: [0, 0, 0], scale: [0.24, 0.08, 0.52] },
      },
    }),
    [],
  );

  useFrame(({ camera, clock }, delta) => {
    smoothedProgressRef.current = THREE.MathUtils.damp(smoothedProgressRef.current, progressRef.current || 0, 10, delta);
    const p = smoothedProgressRef.current;
    const layout = smooth(0.12, 0.86, p);
    const compression = smooth(0.16, 0.5, p);
    const topView = smooth(0.22, 0.9, p);
    const idleAmount = 1 - smooth(0.06, 0.28, p);
    const time = clock.elapsedTime;

    materials.body.color.copy(palette.android).lerp(palette.layoutGreen, layout);
    materials.highlight.color.copy(palette.androidHighlight).lerp(palette.layout, layout);
    materials.line.opacity = smooth(0.54, 0.94, p) * 0.66;

    if (rootRef.current) {
      rootRef.current.position.set(0.38, idleAmount * Math.sin(time * 1.2) * 0.035, 0);
      rootRef.current.rotation.set(
        THREE.MathUtils.lerp(0.16, 0, topView),
        idleAmount * Math.sin(time * 0.35) * 0.18 + THREE.MathUtils.lerp(-0.34, 0, topView),
        THREE.MathUtils.lerp(-0.03, 0, topView),
      );
    }

    setTransform(headRef, parts.head.from, parts.head.to, layout);
    setTransform(torsoRef, parts.torso.from, parts.torso.to, layout);
    setTransform(faceRef, parts.face.from, parts.face.to, layout);
    setTransform(eyeLeftRef, parts.eyeLeft.from, parts.eyeLeft.to, layout);
    setTransform(eyeRightRef, parts.eyeRight.from, parts.eyeRight.to, layout);
    setTransform(antennaLeftRef, parts.antennaLeft.from, parts.antennaLeft.to, layout);
    setTransform(antennaRightRef, parts.antennaRight.from, parts.antennaRight.to, layout);
    setTransform(upperArmLeftRef, parts.upperArmLeft.from, parts.upperArmLeft.to, layout);
    setTransform(forearmLeftRef, parts.forearmLeft.from, parts.forearmLeft.to, layout);
    setTransform(upperArmRightRef, parts.upperArmRight.from, parts.upperArmRight.to, layout);
    setTransform(forearmRightRef, parts.forearmRight.from, parts.forearmRight.to, layout);
    setTransform(legLeftRef, parts.legLeft.from, parts.legLeft.to, layout);
    setTransform(legRightRef, parts.legRight.from, parts.legRight.to, layout);

    if (torsoRef.current) {
      torsoRef.current.scale.x += compression * 0.18;
      torsoRef.current.scale.y *= 1 - compression * 0.22;
    }

    if (lineGroupRef.current) {
      lineGroupRef.current.visible = p > 0.48;
      lineGroupRef.current.position.y = 0.17;
    }

    if (shadowRef.current) {
      shadowRef.current.scale.setScalar(THREE.MathUtils.lerp(1.1, 1.55, layout));
      shadowRef.current.material.opacity = THREE.MathUtils.lerp(0.14, 0.08, layout);
    }

    camera.position.set(
      THREE.MathUtils.lerp(2.4, 0.38, topView),
      THREE.MathUtils.lerp(2.55, 7.2, topView),
      THREE.MathUtils.lerp(4.6, 0.04, topView),
    );
    camera.fov = THREE.MathUtils.lerp(38, 26, topView);
    camera.lookAt(0.38, 0.02, 0);
    camera.updateProjectionMatrix();
  });

  return (
    <group ref={rootRef}>
      <mesh ref={shadowRef} material={materials.shadow} position={[0, -0.98, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 64]} />
      </mesh>

      <mesh ref={torsoRef} material={materials.body}>
        <capsuleGeometry args={[0.5, 0.64, 16, 32]} />
      </mesh>
      <mesh ref={headRef} material={materials.highlight}>
        <sphereGeometry args={[0.5, 36, 24]} />
      </mesh>
      <mesh ref={faceRef} material={materials.face}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      <mesh ref={eyeLeftRef} material={materials.face}>
        <sphereGeometry args={[1, 16, 16]} />
      </mesh>
      <mesh ref={eyeRightRef} material={materials.face}>
        <sphereGeometry args={[1, 16, 16]} />
      </mesh>
      <mesh ref={antennaLeftRef} material={materials.body}>
        <cylinderGeometry args={[1, 1, 1, 16]} />
      </mesh>
      <mesh ref={antennaRightRef} material={materials.body}>
        <cylinderGeometry args={[1, 1, 1, 16]} />
      </mesh>

      <mesh ref={upperArmLeftRef} material={materials.body}>
        <capsuleGeometry args={[0.5, 0.5, 12, 24]} />
      </mesh>
      <mesh ref={forearmLeftRef} material={materials.body}>
        <capsuleGeometry args={[0.5, 0.5, 12, 24]} />
      </mesh>
      <mesh ref={upperArmRightRef} material={materials.body}>
        <capsuleGeometry args={[0.5, 0.5, 12, 24]} />
      </mesh>
      <mesh ref={forearmRightRef} material={materials.body}>
        <capsuleGeometry args={[0.5, 0.5, 12, 24]} />
      </mesh>
      <mesh ref={legLeftRef} material={materials.body}>
        <capsuleGeometry args={[0.5, 0.45, 12, 24]} />
      </mesh>
      <mesh ref={legRightRef} material={materials.body}>
        <capsuleGeometry args={[0.5, 0.45, 12, 24]} />
      </mesh>

      <group ref={lineGroupRef} visible={false}>
        <mesh material={materials.line} position={[0, 0, -0.06]}>
          <boxGeometry args={[0.025, 0.018, 2.34]} />
        </mesh>
        <mesh material={materials.line} position={[0, 0, -0.46]}>
          <boxGeometry args={[1.92, 0.018, 0.025]} />
        </mesh>
        <mesh material={materials.line} position={[0, 0, 0.54]}>
          <boxGeometry args={[1.72, 0.018, 0.025]} />
        </mesh>
        <mesh material={materials.line} position={[-0.7, 0, 0.12]}>
          <boxGeometry args={[0.025, 0.018, 0.94]} />
        </mesh>
        <mesh material={materials.line} position={[0.7, 0, 0.12]}>
          <boxGeometry args={[0.025, 0.018, 0.94]} />
        </mesh>
      </group>
    </group>
  );
}

export default function TransformingDevice({ progressRef }) {
  return (
    <Canvas
      camera={{ position: [2.4, 2.55, 4.6], fov: 38 }}
      dpr={[1, 1.65]}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#eee7dc"]} />
      <ambientLight intensity={0.78} />
      <directionalLight position={[3.5, 4.8, 4.2]} intensity={2.25} />
      <directionalLight position={[-3.4, 2.4, -2.6]} intensity={0.7} color="#bcecff" />
      <spotLight position={[0.3, 5, 2.2]} angle={0.42} penumbra={0.75} intensity={1.4} color="#fff6e6" />
      <AndroidArchitecture progressRef={progressRef} />
      <ContactShadows position={[0.38, -1.05, 0]} opacity={0.18} scale={5} blur={2.6} far={4} />
    </Canvas>
  );
}
