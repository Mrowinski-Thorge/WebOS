import { Canvas, useFrame } from '@react-three/fiber';
import { Center, Float, Environment, MeshTransmissionMaterial } from '@react-three/drei';
import { useRef, memo } from 'react';
import * as THREE from 'three';
import { useOS } from '../../context/OSContext';

function LiquidBlob() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mesh = useRef<any>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if(mesh.current) {
        mesh.current.rotation.x = t * 0.2;
        mesh.current.rotation.y = t * 0.25;
    }
  });

  return (
    <mesh ref={mesh} scale={1.5}>
      <torusKnotGeometry args={[1, 0.3, 128, 32]} />
       {/*
          MeshTransmissionMaterial is key for "Liquid Glass"
          transmission: 1 = fully transparent like glass
          roughness: 0 = fully polished
          thickness: controls refraction
          ior: Index of Refraction (1.5 for glass, 1.33 for water)
          chromaticAberration: adds the rainbow edges
       */}
      <MeshTransmissionMaterial
        backside
        backsideThickness={1}
        samples={16}
        resolution={512}
        transmission={1}
        roughness={0.0}
        thickness={0.5}
        ior={1.5}
        chromaticAberration={0.1}
        anisotropy={1}
        distortion={0.5}
        distortionScale={0.5}
        temporalDistortion={0.2}
        color="#ffffff"
        background={new THREE.Color('#000000')}
      />
    </mesh>
  );
}

export const WelcomeScene = memo(function WelcomeScene() {
    const { theme } = useOS();
  return (
    <div className="w-full h-full absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Environment preset={theme === 'dark' ? "city" : "studio"} />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Center>
                <LiquidBlob />
            </Center>
        </Float>
      </Canvas>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <h1 className="text-6xl font-bold text-white/90 drop-shadow-lg mix-blend-overlay tracking-tighter">
          Welcome
        </h1>
      </div>
    </div>
  );
});
