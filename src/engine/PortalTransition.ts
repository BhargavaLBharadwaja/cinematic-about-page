import * as THREE from 'three';

export class PortalTransition {
  private value = 0;
  update(target: number, delta: number, reducedMotion: boolean) {
    this.value = THREE.MathUtils.damp(this.value, target, reducedMotion ? 3 : 5, delta);
    return this.value;
  }
  get progress() { return this.value; }
  reset() { this.value = 0; }
}
