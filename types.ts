import * as THREE from 'three';

export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface ParticleData {
  id: number;
  scatterPosition: THREE.Vector3;
  treePosition: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  speed: number;
  color?: string; // Optional specific color override
}

export interface ArixTheme {
  colors: {
    emerald: string;
    gold: string;
    deepGreen: string;
    highlight: string;
  }
}