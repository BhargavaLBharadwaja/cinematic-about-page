import * as THREE from 'three';
import type { ScrollState } from './types';

interface Fragment { mesh: THREE.Mesh; origin: THREE.Vector3; velocity: THREE.Vector3; spin: THREE.Vector3; }

export class GlassSystem {
  readonly root = new THREE.Group();
  private readonly surface: THREE.Mesh;
  private readonly fragments: Fragment[] = [];
  private readonly crackMaterial: THREE.LineBasicMaterial;
  private impact = 0;
  private time = 0;

  constructor(private readonly quality: { particleScale: number }) {
    const glassMaterial = new THREE.MeshPhysicalMaterial({ color: 0xaac8ff, transparent: true, opacity: 0.13, roughness: 0.04, transmission: 0.75, thickness: 0.1, side: THREE.DoubleSide, depthWrite: false });
    this.surface = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 7.2, 1, 1), glassMaterial);
    this.surface.position.set(0, 0, -0.4);
    this.root.add(this.surface);
    this.crackMaterial = new THREE.LineBasicMaterial({ color: 0xc9e1ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
    const crackGroup = new THREE.Group();
    for (let i = 0; i < 14; i += 1) {
      const center = new THREE.Vector3((Math.random() - 0.5) * 0.55, (Math.random() - 0.5) * 0.7, 0.03);
      const points = [center, new THREE.Vector3(center.x + (Math.random() - 0.5) * 1.5, center.y + (Math.random() - 0.5) * 2.2, 0.04)];
      crackGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), this.crackMaterial));
    }
    this.root.add(crackGroup);
    const count = Math.floor(38 * quality.particleScale);
    const material = new THREE.MeshPhysicalMaterial({ color: 0xaed0ff, transparent: true, opacity: 0.44, transmission: 0.5, roughness: 0.05, side: THREE.DoubleSide });
    for (let i = 0; i < count; i += 1) {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.16 + Math.random() * 0.32, 0.2 + Math.random() * 0.5), material);
      const origin = new THREE.Vector3((Math.random() - 0.5) * 4.6, (Math.random() - 0.5) * 6.8, -0.2 + Math.random() * 0.4);
      mesh.position.copy(origin); mesh.visible = false; this.root.add(mesh);
      this.fragments.push({ mesh, origin, velocity: new THREE.Vector3(), spin: new THREE.Vector3() });
    }
    this.root.visible = false;
  }

  update(progress: number, state: ScrollState, delta: number, reducedMotion: boolean) {
    this.time += delta;
    const scene = state.sections[state.activeSection]?.scene;
    const eligible = scene === 'atmosphere' || scene === 'team';
    const local = eligible ? progress : 0;
    const impactTarget = eligible ? THREE.MathUtils.smoothstep(local, 0.56, 0.78) : 0;
    this.impact = THREE.MathUtils.damp(this.impact, impactTarget, reducedMotion ? 3 : 5, delta);
    this.root.visible = eligible && this.impact > 0.01;
    this.surface.visible = this.impact < 0.72;
    this.crackMaterial.opacity = THREE.MathUtils.smoothstep(this.impact, 0.2, 0.5);
    this.root.scale.setScalar(0.75 + this.impact * 0.3);
    this.root.rotation.y = Math.sin(this.time * 0.4) * 0.03;
    this.fragments.forEach((fragment, index) => {
      const phase = THREE.MathUtils.smoothstep(this.impact, 0.68, 0.95);
      fragment.mesh.visible = phase > 0.01;
      if (!fragment.mesh.visible) return;
      const direction = fragment.origin.clone().normalize().add(new THREE.Vector3(0, 0, 0.7)).normalize();
      const distance = phase * (0.5 + (index % 7) * 0.18) * (reducedMotion ? 0.35 : 1);
      fragment.mesh.position.copy(fragment.origin).addScaledVector(direction, distance);
      fragment.mesh.position.y -= phase * phase * 1.5;
      fragment.mesh.rotation.x = phase * fragment.spin.x + this.time * 0.3;
      fragment.mesh.rotation.y = phase * fragment.spin.y + this.time * 0.2;
      fragment.mesh.rotation.z = phase * fragment.spin.z;
    });
  }

  dispose() { this.root.traverse((object) => { const mesh = object as THREE.Mesh; if (mesh.geometry) mesh.geometry.dispose(); if (mesh.material) mesh.material.dispose(); }); this.crackMaterial.dispose(); }
}
