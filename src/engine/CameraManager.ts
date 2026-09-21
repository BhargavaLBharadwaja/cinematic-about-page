import * as THREE from 'three';
import type { ScrollState } from './types';

export interface CameraPose {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  fov: number;
}

const poses: Record<string, CameraPose> = {
  connector: { position: new THREE.Vector3(0, 0, 8), rotation: new THREE.Euler(0, 0, 0), fov: 38 },
  particles: { position: new THREE.Vector3(0, 0, 9), rotation: new THREE.Euler(0, 0, 0), fov: 42 },
  atmosphere: { position: new THREE.Vector3(0, -0.15, 10), rotation: new THREE.Euler(-0.02, 0, 0), fov: 45 },
  contact: { position: new THREE.Vector3(0, 0, 11), rotation: new THREE.Euler(0, 0, 0), fov: 48 },
  editorial: { position: new THREE.Vector3(0, 0, 10), rotation: new THREE.Euler(0, 0, 0), fov: 45 },
  expertise: { position: new THREE.Vector3(0, 0, 9), rotation: new THREE.Euler(0, 0, 0), fov: 43 },
  data: { position: new THREE.Vector3(0, 0, 10), rotation: new THREE.Euler(0, 0, 0), fov: 45 },
  brands: { position: new THREE.Vector3(0, 0, 10), rotation: new THREE.Euler(0, 0, 0), fov: 45 },
  team: { position: new THREE.Vector3(0, 0, 8.5), rotation: new THREE.Euler(0, 0, 0), fov: 40 },
  projects: { position: new THREE.Vector3(0, 0, 11), rotation: new THREE.Euler(0, 0, 0), fov: 48 },
};

export class CameraManager {
  private target = new THREE.Vector3();
  private targetRotation = new THREE.Euler();
  private targetFov = 42;

  constructor(private camera: THREE.PerspectiveCamera) {}

  update(state: ScrollState, pointer: THREE.Vector2, reducedMotion: boolean, delta: number) {
    const current = state.sections[state.activeSection]?.scene || 'connector';
    const next = state.sections[Math.min(state.activeSection + 1, state.sections.length - 1)]?.scene || current;
    const from = poses[current] || poses.connector;
    const to = poses[next] || from;
    const blend = state.sections[state.activeSection]?.progress > 0.72 ? (state.sections[state.activeSection].progress - 0.72) / 0.28 : 0;
    this.target.lerpVectors(from.position, to.position, blend);
    this.targetRotation.set(
      THREE.MathUtils.lerp(from.rotation.x, to.rotation.x, blend),
      THREE.MathUtils.lerp(from.rotation.y, to.rotation.y, blend),
      THREE.MathUtils.lerp(from.rotation.z, to.rotation.z, blend),
    );
    this.targetFov = THREE.MathUtils.lerp(from.fov, to.fov, blend);
    const ease = 1 - Math.pow(0.001, Math.min(delta, 0.05));
    this.camera.position.lerp(this.target, ease);
    this.camera.rotation.x = THREE.MathUtils.lerp(this.camera.rotation.x, this.targetRotation.x, ease);
    this.camera.rotation.y = THREE.MathUtils.lerp(this.camera.rotation.y, this.targetRotation.y, ease);
    this.camera.rotation.z = THREE.MathUtils.lerp(this.camera.rotation.z, this.targetRotation.z, ease);
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, this.targetFov, ease);
    if (!reducedMotion) {
      this.camera.position.x += (pointer.x * 0.08 - this.camera.position.x) * 0.015;
      this.camera.position.y += (-pointer.y * 0.05 - this.camera.position.y) * 0.015;
    }
    this.camera.updateProjectionMatrix();
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
  }
}
