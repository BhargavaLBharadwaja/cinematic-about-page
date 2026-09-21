import * as THREE from 'three';

export class AstronautInteraction {
  private target = new THREE.Vector3();
  update(root: THREE.Group, pointer: THREE.Vector2, reducedMotion: boolean, delta: number) {
    if (reducedMotion) return;
    this.target.set(pointer.x * 0.12, -pointer.y * 0.1, 0);
    root.position.x += (this.target.x - root.position.x * 0.04) * delta * 1.8;
    root.position.y += (this.target.y - root.position.y * 0.04) * delta * 1.8;
  }
}
