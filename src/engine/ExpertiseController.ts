import * as THREE from 'three';

export interface ExpertiseVisualState { index: number; accent: THREE.Color; energy: number; }

export class ExpertiseController {
  readonly state: ExpertiseVisualState = { index: 0, accent: new THREE.Color('#8ea4ff'), energy: 0 };
  private targetIndex = 0;
  private targetEnergy = 0;
  private readonly palettes = [new THREE.Color('#8ea4ff'), new THREE.Color('#d69aff'), new THREE.Color('#63e6d7'), new THREE.Color('#ffb46b')];

  setIndex(index: number) { this.targetIndex = THREE.MathUtils.clamp(Math.round(index), 0, 3); this.targetEnergy = 1; }
  update(delta: number, reducedMotion: boolean) {
    this.state.index = THREE.MathUtils.damp(this.state.index, this.targetIndex, reducedMotion ? 8 : 4, delta);
    this.state.energy = THREE.MathUtils.damp(this.state.energy, this.targetEnergy, reducedMotion ? 8 : 3, delta);
    this.state.accent.lerp(this.palettes[this.targetIndex], 1 - Math.exp(-(reducedMotion ? 8 : 4) * delta));
    this.targetEnergy = Math.max(0, this.targetEnergy - delta * .32);
    return this.state;
  }
}
