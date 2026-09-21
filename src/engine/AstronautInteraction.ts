import * as THREE from 'three';

export class AstronautInteraction {
  private target = new THREE.Vector3();
  private targetRotation = new THREE.Euler();
  update(model: THREE.Group, pointer: THREE.Vector2, reducedMotion: boolean, delta: number) {
    const amount = reducedMotion ? 0 : 1;
    this.target.set(pointer.x * 0.16 * amount, -pointer.y * 0.13 * amount, 0);
    model.position.lerp(this.target, 1 - Math.exp(-5 * delta));
    this.targetRotation.set(-pointer.y * 0.06 * amount, pointer.x * 0.1 * amount, pointer.x * 0.025 * amount);
    model.rotation.x = THREE.MathUtils.damp(model.rotation.x, this.targetRotation.x, 4, delta);
    model.rotation.y = THREE.MathUtils.damp(model.rotation.y, this.targetRotation.y, 4, delta);
    model.rotation.z = THREE.MathUtils.damp(model.rotation.z, this.targetRotation.z, 4, delta);
  }
}
