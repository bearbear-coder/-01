import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { ParticleData, TreeState } from '../types';
import { generateTreeData } from '../utils/math';
import { THEME } from '../constants';

interface InteractiveTreeProps {
  treeState: TreeState;
}

const tempObject = new THREE.Object3D();
const tempVec3 = new THREE.Vector3();
const tempColor = new THREE.Color();

// Custom Star
const createStarGeometry = () => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1;
    const innerRadius = 0.4;
    for(let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.1 });
};

export const InteractiveTree: React.FC<InteractiveTreeProps> = ({ treeState }) => {
  const needleRef = useRef<THREE.InstancedMesh>(null);
  const sphereRef = useRef<THREE.InstancedMesh>(null); // Baubles
  const bellRef = useRef<THREE.InstancedMesh>(null); // Bells (Cones)
  const diamondRef = useRef<THREE.InstancedMesh>(null); // Snowflakes/Diamonds
  const lightRef = useRef<THREE.InstancedMesh>(null); // Fairy Lights
  const ribbonRef = useRef<THREE.InstancedMesh>(null); // Ribbon
  const giftRef = useRef<THREE.InstancedMesh>(null); // Gifts
  const starRef = useRef<THREE.InstancedMesh>(null); // Star
  
  const groupRef = useRef<THREE.Group>(null);

  const starGeo = useMemo(() => createStarGeometry(), []);
  
  const { 
    needles, 
    ornamentSpheres, 
    ornamentBells, 
    ornamentDiamonds, 
    lights, 
    ribbon, 
    gifts, 
    star 
  } = useMemo(() => generateTreeData(), []);

  // --- Initial Color Assignment ---
  useLayoutEffect(() => {
    // Needles
    if (needleRef.current) {
        const c1 = new THREE.Color(THEME.colors.deepGreen);
        const c2 = new THREE.Color(THEME.colors.emerald);
        for (let i = 0; i < needles.length; i++) {
            tempColor.copy(Math.random() > 0.6 ? c2 : c1).multiplyScalar(0.7 + Math.random() * 0.5);
            needleRef.current.setColorAt(i, tempColor);
        }
        needleRef.current.instanceColor!.needsUpdate = true;
    }

    // Generic Color Applier
    const applyColors = (ref: React.RefObject<THREE.InstancedMesh>, data: ParticleData[]) => {
        if (ref.current) {
            data.forEach((d, i) => {
                if (d.color) ref.current!.setColorAt(i, new THREE.Color(d.color));
            });
            ref.current.instanceColor!.needsUpdate = true;
        }
    };

    applyColors(sphereRef, ornamentSpheres);
    applyColors(bellRef, ornamentBells);
    applyColors(diamondRef, ornamentDiamonds);
    applyColors(lightRef, lights);
    applyColors(ribbonRef, ribbon);
    applyColors(giftRef, gifts);

  }, [needles, ornamentSpheres, ornamentBells, ornamentDiamonds, lights, ribbon, gifts]);

  // Animation State
  const currentStateRef = useRef(0);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const target = treeState === TreeState.TREE_SHAPE ? 1 : 0;
    currentStateRef.current = THREE.MathUtils.damp(currentStateRef.current, target, 2.5, delta);
    const t = currentStateRef.current;

    if (groupRef.current) {
        groupRef.current.rotation.y += (0.05 + (1 - t) * 0.1) * delta;
    }

    // --- Transform Logic ---
    const updateMesh = (ref: React.RefObject<THREE.InstancedMesh>, data: ParticleData[], type: 'needle'|'ornament'|'light'|'ribbon'|'star'|'gift') => {
        if (!ref.current) return;

        for(let i=0; i<data.length; i++) {
            const d = data[i];
            
            // Position
            tempVec3.lerpVectors(d.scatterPosition, d.treePosition, t);
            
            // Scatter Swirl
            if (t < 0.99 && t > 0.01) {
                const swirl = (1 - t) * Math.PI * 3;
                const r = Math.sqrt(tempVec3.x * tempVec3.x + tempVec3.z * tempVec3.z);
                const ang = Math.atan2(tempVec3.z, tempVec3.x) + swirl;
                tempVec3.x = r * Math.cos(ang);
                tempVec3.z = r * Math.sin(ang);
            }

            // Floating Noise
            const float = (1 - t) * 1.5 + 0.05;
            tempVec3.x += Math.sin(time * d.speed + d.id) * float;
            tempVec3.y += Math.cos(time * d.speed * 0.9 + d.id) * float * 0.5;
            tempVec3.z += Math.sin(time * d.speed * 0.5 + d.id) * float;

            tempObject.position.copy(tempVec3);

            // Scale & Rotation
            if (type === 'light') {
                tempObject.rotation.set(0,0,0);
                // Twinkle
                const flicker = 0.5 + 0.5 * Math.sin(time * (10 + d.id % 5) + d.id);
                const s = d.scale * t * (0.8 + 0.4 * flicker); 
                tempObject.scale.set(s,s,s);
            } 
            else if (type === 'ribbon') {
                // If tree, align to spiral (stored in d.rotation), if scatter, tumble
                if (t > 0.8) {
                   tempObject.rotation.copy(d.rotation);
                   // Face out
                   tempObject.rotateX(Math.PI / 2);
                } else {
                   tempObject.rotation.set(time + d.id, time*0.5, d.id);
                }
                const s = t; 
                tempObject.scale.set(0.15 * s, 1 * s, 0.02 * s); // Box stretched to look like ribbon segment
            }
            else if (type === 'star') {
                tempObject.rotation.set(0, time * 0.5, 0);
                const s = d.scale * t;
                tempObject.scale.set(s,s,s);
            }
            else if (type === 'gift') {
                tempObject.rotation.copy(d.rotation);
                const s = d.scale * t;
                tempObject.scale.set(s,s,s);
            }
            else {
                // Ornaments & Needles
                tempObject.rotation.copy(d.rotation);
                if (type === 'ornament') {
                     // Subtle sway for ornaments
                     tempObject.rotation.z += Math.sin(time * 1 + d.id) * 0.1;
                }
                const s = d.scale * (type === 'needle' ? (0.6 + 0.4 * t) : (0.2 + 0.8 * t));
                tempObject.scale.set(s,s,s);
            }

            tempObject.updateMatrix();
            ref.current.setMatrixAt(i, tempObject.matrix);
        }
        ref.current.instanceMatrix.needsUpdate = true;
    };

    updateMesh(needleRef, needles, 'needle');
    updateMesh(sphereRef, ornamentSpheres, 'ornament');
    updateMesh(bellRef, ornamentBells, 'ornament');
    updateMesh(diamondRef, ornamentDiamonds, 'ornament');
    updateMesh(lightRef, lights, 'light');
    updateMesh(ribbonRef, ribbon, 'ribbon');
    updateMesh(giftRef, gifts, 'gift');
    updateMesh(starRef, star, 'star');
    
  });

  return (
    <group ref={groupRef}>
      {/* 1. Needles */}
      <instancedMesh ref={needleRef} args={[undefined, undefined, needles.length]} castShadow receiveShadow>
        <coneGeometry args={[0.08, 0.45, 5]} />
        <meshStandardMaterial roughness={0.8} metalness={0.1} />
      </instancedMesh>

      {/* 2. Baubles (Spheres) */}
      <instancedMesh ref={sphereRef} args={[undefined, undefined, ornamentSpheres.length]} castShadow receiveShadow>
        <sphereGeometry args={[0.18, 20, 20]} />
        <meshStandardMaterial roughness={0.15} metalness={0.7} envMapIntensity={2} />
      </instancedMesh>

      {/* 3. Bells (Cones) */}
      <instancedMesh ref={bellRef} args={[undefined, undefined, ornamentBells.length]} castShadow receiveShadow>
        <coneGeometry args={[0.12, 0.25, 12]} />
        <meshStandardMaterial roughness={0.2} metalness={0.9} color={THEME.colors.gold} />
      </instancedMesh>

      {/* 4. Diamonds/Snowflakes (Octahedron) */}
      <instancedMesh ref={diamondRef} args={[undefined, undefined, ornamentDiamonds.length]} castShadow receiveShadow>
        <octahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial roughness={0.1} metalness={0.8} emissive={THEME.colors.silver} emissiveIntensity={0.2} />
      </instancedMesh>

      {/* 5. Fairy Lights */}
      <instancedMesh ref={lightRef} args={[undefined, undefined, lights.length]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial 
            emissiveIntensity={2} 
            toneMapped={false} 
            color="#ffffff" // base color, instance color will tint
        />
      </instancedMesh>

      {/* 6. Ribbon (Flattened Boxes) */}
      <instancedMesh ref={ribbonRef} args={[undefined, undefined, ribbon.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} /> 
        <meshStandardMaterial 
            color={THEME.colors.brightRed} 
            roughness={0.4} 
            metalness={0.3} 
            side={THREE.DoubleSide} 
        />
      </instancedMesh>

      {/* 7. Gift Boxes */}
      <instancedMesh ref={giftRef} args={[undefined, undefined, gifts.length]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial roughness={0.2} metalness={0.1} />
      </instancedMesh>

      {/* 8. Star */}
      <instancedMesh ref={starRef} args={[starGeo, undefined, 1]}>
        <meshStandardMaterial 
            color={THEME.colors.gold} 
            emissive={THEME.colors.gold} 
            emissiveIntensity={3} 
            metalness={0.5} 
            roughness={0.2} 
        />
      </instancedMesh>

      <Sparkles count={80} scale={12} size={3} speed={0.4} opacity={0.3} color={THEME.colors.gold} />
    </group>
  );
};
