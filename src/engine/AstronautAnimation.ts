import * as THREE from 'three';

export class AstronautAnimation {
  update(root: THREE.Group, time: number, velocity: number, reducedMotion: boolean) {
    const astronaut = root.children[0];
    if (!astronaut) return;
    const intensity = reducedMotion ? 0.12 : 1;
    astronaut.position.y += Math.sin(time * 1.15) * 0.0018 * intensity;
    astronaut.rotation.z = Math.sin(time * 0.7) * 0.045 * intensity;
    astronaut.rotation.y += (Math.sin(time * 0.45) * 0.001 + velocity * 0.0007) * intensity;
    const squash = 1 + Math.sin(time * 1.35) * 0.012 * intensity;
    astronaut.scale.y = squash;
    const leftArm = astronaut.children[4]; const rightArm = astronaut.children[5];
    if (leftArm && rightArm) { leftArm.rotation.x = Math.sin(time * 0.9) * 0.035 * intensity; rightArm.rotation.x = -Math.sin(time * 0.9) * 0.035 * intensity; }
  }
}
