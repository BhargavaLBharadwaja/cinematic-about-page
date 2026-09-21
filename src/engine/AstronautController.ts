import * as THREE from 'three';
import type { ScrollState } from './types';
import { AstronautAnimation } from './AstronautAnimation';
import { AstronautInteraction } from './AstronautInteraction';
import { AstronautPath } from './AstronautPath';

export class AstronautController {
  readonly root = new THREE.Group();
  private readonly path = new AstronautPath();
  private readonly animation = new AstronautAnimation();
  private readonly interaction = new AstronautInteraction();
  private readonly model: THREE.Group;
  private readonly targetQuaternion = new THREE.Quaternion();
  private currentProgress = 0;
  private elapsed = 0;

  constructor() {
    this.model = this.createPlaceholderAstronaut();
    this.root.add(this.model);
    this.root.position.set(0, 0, -1.5);
  }

  private createPlaceholderAstronaut() {
    const astronaut = new THREE.Group();
    const suit = new THREE.MeshStandardMaterial({ color: 0xe8e9ed, roughness: 0.72 });
    const visor = new THREE.MeshStandardMaterial({ color: 0x17243f, roughness: 0.16, metalness: 0.65, emissive: 0x102a66, emissiveIntensity: 0.35 });
    const joint = new THREE.MeshStandardMaterial({ color: 0x323746, roughness: 0.5, metalness: 0.25 });
    const capsule = (radius: number, length: number, material: THREE.Material) => new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 8, 16), material);
    const body = capsule(0.34, 0.7, suit);
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.62, 0.2), joint); backpack.position.set(0, 0.03, -0.27);
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 14), suit); helmet.position.y = 0.68; helmet.scale.set(1, 1.05, 0.94);
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.255, 20, 12), visor); face.position.set(0, 0.69, 0.23); face.scale.set(1, 0.72, 0.35);
    const armL = capsule(0.11, 0.46, suit); armL.position.set(-0.44, 0.04, 0); armL.rotation.z = -0.24;
    const armR = capsule(0.11, 0.46, suit); armR.position.set(0.44, 0.04, 0); armR.rotation.z = 0.24;
    const legL = capsule(0.13, 0.46, suit); legL.position.set(-0.18, -0.63, 0);
    const legR = capsule(0.13, 0.46, suit); legR.position.set(0.18, -0.63, 0);
    const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.3), joint); bootL.position.set(-0.18, -0.94, 0.05);
    const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.3), joint); bootR.position.set(0.18, -0.94, 0.05);
    astronaut.add(body, backpack, helmet, face, armL, armR, legL, legR, bootL, bootR); astronaut.scale.setScalar(1.15);
    astronaut.traverse((node) => { if (node instanceof THREE.Mesh) { node.castShadow = true; node.receiveShadow = true; } });
    return astronaut;
  }

  update(state: ScrollState, delta: number, pointer: THREE.Vector2, reducedMotion: boolean) {
    this.elapsed += delta;
    const section = state.sections[state.activeSection];
    const count = Math.max(state.sections.length - 1, 1);
    const local = section?.progress ?? 0;
    const globalProgress = THREE.MathUtils.clamp((state.activeSection + local) / count, 0, 1);
    const astronautStart = 0.08;
    const astronautEnd = 0.86;
    const pathProgress = THREE.MathUtils.clamp((globalProgress - astronautStart) / (astronautEnd - astronautStart), 0, 1);
    const damping = reducedMotion ? 5 : 3.5 + Math.min(Math.abs(state.velocity) * 0.12, 3);
    this.currentProgress = THREE.MathUtils.damp(this.currentProgress, pathProgress, damping, delta);
    const point = this.path.positionAt(this.currentProgress);
    const tangent = this.path.tangentAt(this.currentProgress);
    this.root.position.lerp(point, 1 - Math.exp(-damping * delta));
    this.targetQuaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
    this.root.quaternion.slerp(this.targetQuaternion, 1 - Math.exp(-damping * 0.65 * delta));
    this.animation.update(this.model, this.elapsed, state.velocity, reducedMotion);
    this.interaction.update(this.model, pointer, reducedMotion, delta);
    this.root.visible = globalProgress >= astronautStart && globalProgress <= astronautEnd;
  }

  dispose() { this.root.traverse((node) => { if (node instanceof THREE.Mesh) { node.geometry.dispose(); if (Array.isArray(node.material)) node.material.forEach((material) => material.dispose()); else node.material.dispose(); } }); }
}
