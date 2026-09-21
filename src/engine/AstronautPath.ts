import * as THREE from 'three';

export class AstronautPath {
  private readonly curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.1, -0.9, -1.2),
    new THREE.Vector3(-1.1, 0.2, -2.2),
    new THREE.Vector3(0.8, 0.8, -1.8),
    new THREE.Vector3(1.8, -0.2, -2.8),
    new THREE.Vector3(0.4, -1.0, -3.5),
    new THREE.Vector3(-1.3, -0.1, -4.2),
    new THREE.Vector3(1.5, 0.6, -5.0),
  ], false, 'centripetal', 0.5);

  positionAt(progress: number) { return this.curve.getPointAt(THREE.MathUtils.clamp(progress, 0, 1), new THREE.Vector3()); }
  tangentAt(progress: number) { return this.curve.getTangentAt(THREE.MathUtils.clamp(progress, 0, 1), new THREE.Vector3()).normalize(); }
}
