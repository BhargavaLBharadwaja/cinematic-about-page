import * as THREE from 'three';
import type { ScrollState } from './types';
import { particleFragmentShader } from '../shaders/particles/fragment';
import { particleVertexShader } from '../shaders/particles/vertex';

export type ParticleState = 'IDLE' | 'FLOW' | 'VORTEX' | 'EXPLOSION' | 'ATTRACTION' | 'REPULSION' | 'DISSOLVE' | 'MORPH' | 'TRANSITION';

const stateValues: Record<ParticleState, number> = { IDLE: 0, FLOW: 1, VORTEX: 2, EXPLOSION: 3, ATTRACTION: 4, REPULSION: 5, DISSOLVE: 6, MORPH: 7, TRANSITION: 8 };

export class ParticleSystem {
  readonly root = new THREE.Group();
  readonly geometry: THREE.BufferGeometry;
  readonly material: THREE.ShaderMaterial;
  readonly points: THREE.Points;
  private readonly count: number;
  private readonly color = new THREE.Color();
  private time = 0;
  private stateValue = 0;
  private stateTarget = 0;
  private morphValue = 0;
  private morphTarget = 0;
  private readonly pointer = new THREE.Vector2();
  private readonly attractor = new THREE.Vector3(0, 0, -1.5);

  constructor(private readonly quality: { particleScale: number; dpr?: number }) {
    this.count = Math.max(700, Math.floor(9500 * quality.particleScale));
    const positions = new Float32Array(this.count * 3);
    const targets = new Float32Array(this.count * 3);
    const seeds = new Float32Array(this.count);
    const sizes = new Float32Array(this.count);
    for (let i = 0; i < this.count; i += 1) {
      const seed = Math.random();
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), .6) * 5.6;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * .7;
      const z = (Math.random() - .5) * 8;
      positions.set([x, y, z], i * 3);
      const tunnelAngle = angle + z * .22;
      const tunnelRadius = 1.1 + seed * 2.1;
      targets.set([Math.cos(tunnelAngle) * tunnelRadius, Math.sin(tunnelAngle) * tunnelRadius, z * 1.2], i * 3);
      seeds[i] = seed;
      sizes[i] = 1.1 + seed * 2.9;
    }
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('aTarget', new THREE.BufferAttribute(targets, 3));
    this.geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    this.material = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 }, uState: { value: 0 }, uProgress: { value: 0 }, uVelocity: { value: 0 }, uMorph: { value: 0 },
        uPixelRatio: { value: quality.dpr ?? 1 }, uPointer: { value: this.pointer }, uAttractor: { value: this.attractor }, uColor: { value: this.color },
      }, vertexShader: particleVertexShader, fragmentShader: particleFragmentShader,
    });
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.root.add(this.points);
  }

  setState(state: ParticleState) { this.stateTarget = stateValues[state]; }

  update(state: ScrollState, delta: number, pointer: THREE.Vector2, reducedMotion: boolean) {
    this.time += delta;
    const section = state.sections[state.activeSection];
    const scene = section?.scene ?? 'connector';
    const progress = section?.progress ?? 0;
    const active = scene !== 'connector' && scene !== 'projects';
    const velocity = reducedMotion ? 0 : state.velocity;
    const fast = Math.abs(velocity) > 1.2;
    if (!active) this.setState('DISSOLVE');
    else if (scene === 'contact' || scene === 'expertise') this.setState('TRANSITION');
    else if (scene === 'team') this.setState('ATTRACTION');
    else if (scene === 'atmosphere') this.setState(fast ? 'FLOW' : 'VORTEX');
    else if (scene === 'particles') this.setState(fast ? 'FLOW' : 'MORPH');
    else this.setState(fast ? 'FLOW' : 'IDLE');
    const targetMorph = scene === 'particles' || scene === 'atmosphere' ? THREE.MathUtils.smoothstep(progress, .12, .86) : 0;
    this.morphTarget = reducedMotion ? targetMorph * .25 : targetMorph;
    this.morphValue = THREE.MathUtils.damp(this.morphValue, this.morphTarget, 4, delta);
    this.stateValue = THREE.MathUtils.damp(this.stateValue, this.stateTarget, reducedMotion ? 2 : 5, delta);
    this.pointer.lerp(pointer, 1 - Math.exp(-5 * delta));
    this.attractor.set(pointer.x * .9, -pointer.y * .6, -1.5 - progress * 1.5);
    const intensity = active ? (reducedMotion ? progress * .35 : .35 + progress * .65) : 0;
    this.material.uniforms.uTime.value = this.time;
    this.material.uniforms.uState.value = this.stateValue;
    this.material.uniforms.uProgress.value = intensity;
    this.material.uniforms.uVelocity.value = velocity;
    this.material.uniforms.uMorph.value = this.morphValue;
    this.material.uniforms.uColor.value = this.color.set(scene === 'contact' || scene === 'expertise' ? '#b7c8ff' : '#93a7ff');
    this.root.visible = active || this.stateValue > .15;
    this.root.rotation.y += (reducedMotion ? .001 : .004 + Math.min(Math.abs(velocity), 3) * .002) * delta;
    this.root.position.y = THREE.MathUtils.damp(this.root.position.y, reducedMotion ? 0 : -velocity * .00012, 4, delta);
  }

  resize(dpr: number) { this.material.uniforms.uPixelRatio.value = dpr; }
  dispose() { this.geometry.dispose(); this.material.dispose(); }
}
