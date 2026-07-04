import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Flash overlay ────────────────────────────────────────────── */
export function FlashOverlay({ visible }: { visible: boolean }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[200]"
      style={{
        background: 'white',
        opacity: visible ? 0.92 : 0,
        transition: visible ? 'opacity 0s' : 'opacity 0.6s ease-out',
      }}
    />
  );
}

/* ─── Shutter sound simulation (visual pulse on lens) ─────────── */
function ShutterRing({ fired }: { fired: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!meshRef.current) return;
    const t = Date.now() / 1000;
    meshRef.current.scale.setScalar(fired ? 1 + Math.sin(t * 30) * 0.05 : 1);
  });
  return (
    <mesh ref={meshRef} position={[0, 0, 0.52]} rotation={[0, 0, 0]}>
      <ringGeometry args={[0.34, 0.38, 48]} />
      <meshBasicMaterial color={fired ? '#ffffff' : '#888888'} transparent opacity={fired ? 0.9 : 0.3} />
    </mesh>
  );
}

/* ─── Camera lens assembly ─────────────────────────────────────── */
function CameraLens({ firedOnce }: { firedOnce: boolean }) {
  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#0a0a1a',
    metalness: 0.1,
    roughness: 0.0,
    transmission: 0.95,
    thickness: 0.5,
    ior: 1.5,
    transparent: true,
    opacity: 0.95,
  }), []);

  const ringMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#d4af5a',
    metalness: 0.9,
    roughness: 0.15,
  }), []);

  const innerMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#1a2050',
    metalness: 0.3,
    roughness: 0.2,
    emissive: firedOnce ? new THREE.Color('#4080ff') : new THREE.Color('#000010'),
    emissiveIntensity: firedOnce ? 0.6 : 0.1,
  }), [firedOnce]);

  return (
    <group position={[0, 0, 0]}>
      {/* Outer gold ring */}
      <mesh>
        <cylinderGeometry args={[0.45, 0.45, 0.12, 64, 1, true]} />
        <primitive object={ringMat} />
      </mesh>
      {/* Lens barrel */}
      <mesh position={[0, 0, 0.18]}>
        <cylinderGeometry args={[0.40, 0.42, 0.35, 64, 1, true]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Front glass element */}
      <mesh position={[0, 0, 0.36]}>
        <circleGeometry args={[0.38, 64]} />
        <primitive object={glassMat} />
      </mesh>
      {/* Inner lens reflection */}
      <mesh position={[0, 0, 0.30]}>
        <circleGeometry args={[0.30, 64]} />
        <primitive object={innerMat} />
      </mesh>
      {/* Aperture blades (always visible inside lens) */}
      <ApertureBlades open={!firedOnce} />
      <ShutterRing fired={firedOnce} />
    </group>
  );
}

/* ─── Aperture blades ──────────────────────────────────────────── */
function ApertureBlades({ open }: { open: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#222222', side: THREE.DoubleSide }), []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.children.forEach((child, i) => {
      const blade = child as THREE.Mesh;
      const target = open ? i * (Math.PI / 4) : i * (Math.PI / 4) + 0.55;
      blade.rotation.z += (target - blade.rotation.z) * 0.08;
    });
  });

  const bladeShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(0.22, 0.06);
    s.lineTo(0.18, 0.22);
    s.lineTo(0, 0);
    return s;
  }, []);

  return (
    <group ref={ref} position={[0, 0, 0.25]}>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} rotation={[0, 0, i * (Math.PI / 4)]} material={mat}>
          <shapeGeometry args={[bladeShape]} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Full DSLR body ───────────────────────────────────────────── */
function DSLRBody({ animPhase, onShutterFired }: {
  animPhase: 'entry' | 'settle' | 'click' | 'photoReveal';
  onShutterFired: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const shutterBtnRef = useRef<THREE.Mesh>(null);
  const hasFiredRef = useRef(false);
  const firedOnce = animPhase === 'click' || animPhase === 'photoReveal';

  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#111111',
    metalness: 0.7,
    roughness: 0.3,
  }), []);

  const gripMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0a0a0a',
    metalness: 0.3,
    roughness: 0.8,
  }), []);

  const silverMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#888888',
    metalness: 0.9,
    roughness: 0.1,
  }), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    if (animPhase === 'entry') {
      // Camera flies in from far right-bottom
      groupRef.current.position.x += (0 - groupRef.current.position.x) * 0.04;
      groupRef.current.position.y += (0 - groupRef.current.position.y) * 0.04;
      groupRef.current.position.z += (0 - groupRef.current.position.z) * 0.04;
      groupRef.current.rotation.y += (-0.3 - groupRef.current.rotation.y) * 0.04;
      groupRef.current.rotation.x += (0.1 - groupRef.current.rotation.x) * 0.04;
    } else if (animPhase === 'settle') {
      // Gentle floating
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.05;
      groupRef.current.rotation.y = -0.3 + Math.sin(t * 0.5) * 0.05;
    } else if (animPhase === 'click') {
      // Shutter button pressed down
      if (shutterBtnRef.current) {
        shutterBtnRef.current.position.y = 0.42 - 0.04;
      }
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.05;
      groupRef.current.rotation.y = -0.3 + Math.sin(t * 0.5) * 0.05;
      if (!hasFiredRef.current) {
        hasFiredRef.current = true;
        onShutterFired();
      }
    } else if (animPhase === 'photoReveal') {
      // Slowly pull back and tilt
      groupRef.current.position.x += (-1.2 - groupRef.current.position.x) * 0.02;
      groupRef.current.rotation.y += (-0.8 - groupRef.current.rotation.y) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[4, -2, -3]} rotation={[0.1, -0.3, 0]}>
      {/* Main body */}
      <mesh position={[0, 0, 0]} material={bodyMat}>
        <boxGeometry args={[1.5, 1.0, 0.6]} />
      </mesh>
      {/* Grip */}
      <mesh position={[0.8, -0.1, 0]} material={gripMat}>
        <boxGeometry args={[0.35, 1.1, 0.62]} />
      </mesh>
      {/* Viewfinder hump */}
      <mesh position={[0, 0.6, 0]} material={bodyMat}>
        <boxGeometry args={[0.6, 0.3, 0.5]} />
      </mesh>
      {/* Viewfinder eyepiece */}
      <mesh position={[0, 0.72, -0.3]} material={silverMat}>
        <boxGeometry args={[0.22, 0.18, 0.08]} />
      </mesh>
      {/* Lens mount */}
      <mesh position={[0, 0, 0.31]} material={silverMat}>
        <cylinderGeometry args={[0.48, 0.48, 0.04, 64]} />
      </mesh>
      {/* Lens */}
      <group position={[0, 0, 0.32]} rotation={[Math.PI / 2, 0, 0]}>
        <CameraLens firedOnce={firedOnce} />
      </group>
      {/* Shutter button */}
      <mesh ref={shutterBtnRef} position={[0.62, 0.42, 0.28]} material={silverMat}>
        <cylinderGeometry args={[0.06, 0.07, 0.06, 24]} />
      </mesh>
      {/* Mode dial */}
      <mesh position={[0.38, 0.68, 0.2]} material={silverMat}>
        <cylinderGeometry args={[0.12, 0.12, 0.05, 32]} />
      </mesh>
      {/* Hot shoe */}
      <mesh position={[0, 0.77, 0.1]} material={silverMat}>
        <boxGeometry args={[0.35, 0.04, 0.25]} />
      </mesh>
      {/* LCD screen */}
      <mesh position={[-0.38, 0, -0.31]}>
        <boxGeometry args={[0.55, 0.42, 0.01]} />
        <meshStandardMaterial color="#0a1830" metalness={0.2} roughness={0.1} emissive="#0a1830" emissiveIntensity={0.4} />
      </mesh>
      {/* Neck strap lugs */}
      <mesh position={[-0.75, 0.4, 0]} material={silverMat}>
        <torusGeometry args={[0.04, 0.012, 12, 24]} />
      </mesh>
      <mesh position={[1.0, 0.4, 0]} material={silverMat}>
        <torusGeometry args={[0.04, 0.012, 12, 24]} />
      </mesh>
    </group>
  );
}

/* ─── Photo frame that emerges after shutter ───────────────────── */
function EmergedPhoto({ visible, imageUrl }: { visible: boolean; imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(imageUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [imageUrl]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    if (visible) {
      meshRef.current.scale.x += (1 - meshRef.current.scale.x) * 0.06;
      meshRef.current.scale.y += (1 - meshRef.current.scale.y) * 0.06;
      meshRef.current.position.y = Math.sin(t * 0.6) * 0.04;
    } else {
      meshRef.current.scale.x += (0.001 - meshRef.current.scale.x) * 0.12;
      meshRef.current.scale.y += (0.001 - meshRef.current.scale.y) * 0.12;
    }
  });

  return (
    <group position={[0.5, 0, 0.5]}>
      {/* White border (polaroid style) */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.35, 1.6]} />
        <meshStandardMaterial color="#f8f4ee" roughness={0.6} />
      </mesh>
      {/* Photo */}
      <mesh ref={meshRef} scale={[0.001, 0.001, 1]}>
        <planeGeometry args={[1.2, 1.3]} />
        <meshStandardMaterial map={texture} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ─── Particle burst on shutter click ─────────────────────────── */
function ClickParticles({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(180);
    for (let i = 0; i < 60; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 0.1;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    return arr;
  }, []);

  const velocities = useMemo(() => Array.from({ length: 60 }, () => ({
    x: (Math.random() - 0.5) * 0.04,
    y: (Math.random() - 0.5) * 0.04,
    z: (Math.random() - 0.5) * 0.04,
  })), []);

  const startTime = useRef(0);

  useFrame((state) => {
    if (!ref.current) return;
    if (active && startTime.current === 0) startTime.current = state.clock.elapsedTime;
    if (!active) { startTime.current = 0; return; }
    const elapsed = state.clock.elapsedTime - startTime.current;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < 60; i++) {
      (pos.array as Float32Array)[i * 3] += velocities[i].x;
      (pos.array as Float32Array)[i * 3 + 1] += velocities[i].y;
      (pos.array as Float32Array)[i * 3 + 2] += velocities[i].z;
    }
    pos.needsUpdate = true;
    if (ref.current.material instanceof THREE.PointsMaterial) {
      ref.current.material.opacity = Math.max(0, 1 - elapsed * 1.2);
    }
  });

  return (
    <points ref={ref} position={[0, 0, 0.5]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#ffdd88" transparent opacity={active ? 1 : 0} sizeAttenuation />
    </points>
  );
}

/* ─── Scene orchestrator ───────────────────────────────────────── */
function DSLRScene({ onFlash }: { onFlash: () => void }) {
  const [phase, setPhase] = useState<'entry' | 'settle' | 'click' | 'photoReveal'>('entry');
  const [particlesActive, setParticlesActive] = useState(false);

  useEffect(() => {
    // Entry → settle after 2.5s
    const t1 = setTimeout(() => setPhase('settle'), 2500);
    // settle → click after 4.5s
    const t2 = setTimeout(() => setPhase('click'), 4500);
    // click → photoReveal after 5.2s
    const t3 = setTimeout(() => setPhase('photoReveal'), 5200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  function handleShutterFired() {
    onFlash();
    setParticlesActive(true);
    setTimeout(() => setParticlesActive(false), 900);
  }

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={45} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={2.5} color="#fff8e7" castShadow />
      <directionalLight position={[-5, -2, -3]} intensity={0.8} color="#4060ff" />
      <pointLight position={[0, 0, 2]} intensity={1.2} color="#d4af5a" distance={6} />
      <spotLight position={[3, 4, 3]} intensity={3} angle={0.4} penumbra={0.6} color="#ffffff" castShadow />

      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3} enabled={phase !== 'entry'}>
        <DSLRBody animPhase={phase} onShutterFired={handleShutterFired} />
      </Float>

      <EmergedPhoto
        visible={phase === 'photoReveal'}
        imageUrl="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80"
      />

      <ClickParticles active={particlesActive} />

      <Sparkles count={80} scale={8} size={2.5} speed={0.3} opacity={0.25} color="#d4af5a" />
      <Sparkles count={50} scale={6} size={1.5} speed={0.5} opacity={0.15} color="#8ab4ff" />

      <ContactShadows position={[0, -2.2, 0]} opacity={0.4} scale={8} blur={2} />
    </>
  );
}

/* ─── Public export ────────────────────────────────────────────── */
export function HeroScene() {
  const [flash, setFlash] = useState(false);

  function handleFlash() {
    setFlash(true);
    setTimeout(() => setFlash(false), 80);
  }

  return (
    <>
      <FlashOverlay visible={flash} />
      <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl pointer-events-none">
        <Canvas shadows>
          <DSLRScene onFlash={handleFlash} />
        </Canvas>
      </div>
    </>
  );
}
