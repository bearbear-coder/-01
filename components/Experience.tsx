import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { InteractiveTree } from './InteractiveTree';
import { TreeState } from '../types';
import * as THREE from 'three';

interface ExperienceProps {
  treeState: TreeState;
}

const Rig = () => {
    useFrame((state) => {
       const t = state.clock.elapsedTime;
       state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 2 + Math.sin(t * 0.1) * 1.0, 0.02);
    });
    return null;
}

export const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ 
        antialias: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.9,
      }}
    >
      {/* Deep Warm Espresso Background for Warm Atmosphere */}
      <color attach="background" args={['#080402']} />
      
      <PerspectiveCamera makeDefault position={[0, 1, 20]} fov={30} />
      <Rig />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 2.5} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={12}
        maxDistance={30}
        autoRotate
        autoRotateSpeed={0.5}
        enableDamping
      />

      {/* 1. Base Ambient - Very Warm */}
      <ambientLight intensity={0.15} color="#331100" />
      
      {/* 2. Key Light - Golden Warmth */}
      <spotLight
        position={[15, 12, 15]}
        angle={0.4}
        penumbra={0.3}
        intensity={200}
        color="#ffcf8f" // Golden Amber
        castShadow
        shadow-bias={-0.0001}
      />
      
      {/* 3. Rim Light - Warm Rim instead of Cool */}
      <spotLight
        position={[-15, 15, -10]}
        angle={0.5}
        penumbra={1}
        intensity={100}
        color="#ffddaa" // Soft Gold Rim
      />

      {/* 4. Fill Light - Deep Red/Rose for richness */}
      <pointLight position={[0, -5, 8]} intensity={30} color="#b03010" distance={15} />

      <Environment preset="sunset" blur={0.8} />
      
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0.5} fade speed={0.5} />

      <group position={[0, -1.5, 0]}>
        <InteractiveTree treeState={treeState} />
      </group>

      <EffectComposer disableNormalPass>
        {/* Intense, Wide, Cinematic Glow */}
        <Bloom 
            luminanceThreshold={0.7} // Lower threshold to make gold/red glow
            mipmapBlur 
            intensity={1.2} // Stronger glow
            radius={0.8} // Wider halo
        />
        <Vignette eskil={false} offset={0.1} darkness={0.7} />
        <Noise opacity={0.04} />
      </EffectComposer>
    </Canvas>
  );
};