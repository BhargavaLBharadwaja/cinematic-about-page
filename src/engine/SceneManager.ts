import * as THREE from 'three';
import type { ScrollState } from './types';
import { AstronautController } from './AstronautController';
import { AtmosphereSystem } from './AtmosphereSystem';
import { GlassSystem } from './GlassSystem';
import { ParticleSystem } from './ParticleSystem';
import { PortalSystem } from './PortalSystem';

export class SceneManager {
  readonly root = new THREE.Group();
  readonly astronaut: AstronautController;
  readonly particleSystem: ParticleSystem;
  readonly atmosphere: AtmosphereSystem;
  readonly portal: PortalSystem;
  readonly glass: GlassSystem;
  private readonly connectors = new THREE.Group();
  private readonly connectorGeometry = new THREE.TorusGeometry(.5, .13, 12, 32);

  constructor(private quality: { particleScale: number; dpr?: number }) {
    this.root.add(this.connectors);
    this.astronaut = new AstronautController();
    this.particleSystem = new ParticleSystem(quality);
    this.atmosphere = new AtmosphereSystem(quality);
    this.portal = new PortalSystem(quality);
    this.glass = new GlassSystem(quality);
    this.root.add(this.atmosphere.root, this.particleSystem.root, this.portal.root, this.glass.root, this.astronaut.root);
    const colors = [0x6b7cff, 0x17191f, 0xf4f3ef, 0x8d55ff];
    for (let i = 0; i < 40; i += 1) { const mesh = new THREE.Mesh(this.connectorGeometry, new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: .28, metalness: .18 })); mesh.position.set((Math.random() - .5) * 5, (Math.random() - .5) * 4, (Math.random() - .5) * 3); mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3); mesh.scale.setScalar(.45 + Math.random() * .7); this.connectors.add(mesh); }
  }

  update(state: ScrollState, delta: number, pointer: THREE.Vector2, reducedMotion: boolean) {
    const section = state.sections[state.activeSection];
    const scene = section?.scene ?? 'connector';
    this.connectors.visible = scene === 'connector' || scene === 'atmosphere' || scene === 'team';
    if (!reducedMotion) { this.connectors.rotation.y += delta * .025 + pointer.x * delta * .01; this.connectors.rotation.x += delta * .01; }
    this.particleSystem.update(state, delta, pointer, reducedMotion);
    this.atmosphere.update(state, delta, pointer, reducedMotion);
    this.portal.update(section?.progress ?? 0, state, delta, reducedMotion);
    this.glass.update(section?.progress ?? 0, state, delta, reducedMotion);
    this.astronaut.update(state, delta, pointer, reducedMotion);
  }

  resize(dpr: number) { this.particleSystem.resize(dpr); }
  dispose() { this.astronaut.dispose(); this.particleSystem.dispose(); this.atmosphere.dispose(); this.portal.dispose(); this.glass.dispose(); this.connectorGeometry.dispose(); this.connectors.traverse((object) => { const mesh = object as THREE.Mesh; if (mesh.material) mesh.material.dispose(); }); }
}
