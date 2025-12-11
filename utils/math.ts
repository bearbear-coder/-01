import * as THREE from 'three';
import { PARTICLE_COUNT, ORNAMENT_COUNT, BELL_COUNT, DIAMOND_COUNT, LIGHT_COUNT, RIBBON_SEGMENTS, GIFT_COUNT, TREE_HEIGHT, TREE_RADIUS, SCATTER_RADIUS, THEME } from '../constants';
import { ParticleData } from '../types';

export const getRandomSpherePoint = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  const x = r * sinPhi * Math.cos(theta);
  const y = r * sinPhi * Math.sin(theta);
  const z = r * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

export const generateTreeData = () => {
  const needles: ParticleData[] = [];
  const ornamentSpheres: ParticleData[] = [];
  const ornamentBells: ParticleData[] = [];
  const ornamentDiamonds: ParticleData[] = [];
  const lights: ParticleData[] = [];
  const ribbon: ParticleData[] = [];
  const gifts: ParticleData[] = [];
  const star: ParticleData[] = [];

  // 1. Needles (Green foliage)
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const yRatio = i / PARTICLE_COUNT; 
    const y = - (TREE_HEIGHT / 2) + yRatio * TREE_HEIGHT;
    const radiusAtHeight = TREE_RADIUS * (1 - yRatio);
    const theta = i * 2.39996; 
    const r = radiusAtHeight * Math.sqrt(Math.random()) * 0.9 + 0.1;
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);

    needles.push({
      id: i,
      treePosition: new THREE.Vector3(x, y, z),
      scatterPosition: getRandomSpherePoint(SCATTER_RADIUS),
      rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
      scale: 0.5 + Math.random() * 0.6,
      speed: 0.02 + Math.random() * 0.03
    });
  }

  // 2. Ornaments Helper
  const createOrnament = (arr: ParticleData[], count: number, colors: string[], scaleBase: number) => {
      for (let i = 0; i < count; i++) {
         const yRatio = Math.random();
         const y = - (TREE_HEIGHT / 2) + yRatio * TREE_HEIGHT;
         const radiusAtHeight = TREE_RADIUS * (1 - yRatio);
         const theta = Math.random() * Math.PI * 2;
         const x = radiusAtHeight * Math.cos(theta);
         const z = radiusAtHeight * Math.sin(theta);
         
         const treePos = new THREE.Vector3(x, y, z).multiplyScalar(1.05);

         arr.push({
            id: i,
            treePosition: treePos,
            scatterPosition: getRandomSpherePoint(SCATTER_RADIUS),
            rotation: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, 0),
            scale: scaleBase + Math.random() * 0.5,
            speed: 0.01 + Math.random() * 0.02,
            color: colors[Math.floor(Math.random() * colors.length)]
         });
      }
  };

  // Generate different ornament types
  createOrnament(ornamentSpheres, ORNAMENT_COUNT, [THEME.colors.rubyRed, THEME.colors.metallicGold, THEME.colors.royalBlue, THEME.colors.silver], 1.0);
  createOrnament(ornamentBells, BELL_COUNT, [THEME.colors.gold, THEME.colors.metallicGold], 0.8);
  createOrnament(ornamentDiamonds, DIAMOND_COUNT, [THEME.colors.silver, THEME.colors.rubyRed], 0.9);

  // 3. Fairy Lights (Spiral)
  for (let i = 0; i < LIGHT_COUNT; i++) {
    const t = i / LIGHT_COUNT;
    const y = - (TREE_HEIGHT / 2) + t * TREE_HEIGHT;
    const radiusAtHeight = TREE_RADIUS * (1 - t) + 0.15;
    const spiralTurns = 12;
    const theta = t * Math.PI * 2 * spiralTurns;
    
    const x = radiusAtHeight * Math.cos(theta);
    const z = radiusAtHeight * Math.sin(theta);

    lights.push({
        id: i,
        treePosition: new THREE.Vector3(x, y, z),
        scatterPosition: getRandomSpherePoint(SCATTER_RADIUS),
        rotation: new THREE.Euler(),
        scale: 0.6 + Math.random() * 0.4,
        speed: 0.05,
        color: THEME.fairyLights[Math.floor(Math.random() * THEME.fairyLights.length)]
    });
  }

  // 4. Ribbon (Confetti Spiral)
  for (let i = 0; i < RIBBON_SEGMENTS; i++) {
    const t = i / RIBBON_SEGMENTS;
    const y = - (TREE_HEIGHT / 2) + t * TREE_HEIGHT;
    const radiusAtHeight = TREE_RADIUS * (1 - t) + 0.35; // Further out than lights
    const spiralTurns = 6;
    const theta = t * Math.PI * 2 * spiralTurns + Math.PI; // Offset phase
    
    const x = radiusAtHeight * Math.cos(theta);
    const z = radiusAtHeight * Math.sin(theta);

    // Calculate tangent for rotation
    const tangent = new THREE.Vector3(
        -Math.sin(theta), 
        TREE_HEIGHT / (spiralTurns * 2 * Math.PI), 
        Math.cos(theta)
    ).normalize();
    
    const axis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, tangent);
    const euler = new THREE.Euler().setFromQuaternion(quaternion);

    ribbon.push({
        id: i,
        treePosition: new THREE.Vector3(x, y, z),
        scatterPosition: getRandomSpherePoint(SCATTER_RADIUS),
        rotation: euler, // Pre-calculated alignment
        scale: 1,
        speed: 0.03,
        color: THEME.colors.ribbon
    });
  }

  // 5. Gift Boxes
  for (let i = 0; i < GIFT_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 2.5 + 1.5;
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      const y = - (TREE_HEIGHT / 2) - 0.6; // On floor

      const giftColors = [THEME.colors.giftBox1, THEME.colors.giftBox2, THEME.colors.metallicGold, THEME.colors.rubyRed, THEME.colors.royalBlue];

      gifts.push({
          id: i,
          treePosition: new THREE.Vector3(x, y, z),
          scatterPosition: getRandomSpherePoint(SCATTER_RADIUS),
          rotation: new THREE.Euler(0, Math.random() * Math.PI, 0),
          scale: 1.2 + Math.random() * 1.5,
          speed: 0.02,
          color: giftColors[Math.floor(Math.random() * giftColors.length)]
      });
  }

  // 6. The Star
  star.push({
      id: 0,
      treePosition: new THREE.Vector3(0, TREE_HEIGHT / 2 + 0.2, 0), // Lowered slightly
      scatterPosition: getRandomSpherePoint(SCATTER_RADIUS),
      rotation: new THREE.Euler(0, 0, 0),
      scale: 0.6, // Reduced from 1.8 for better proportion
      speed: 0.01
  });

  return { needles, ornamentSpheres, ornamentBells, ornamentDiamonds, lights, ribbon, gifts, star };
};