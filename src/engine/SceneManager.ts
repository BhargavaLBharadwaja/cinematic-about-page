import * as THREE from 'three';
import type { ScrollState } from './types';
import { AstronautController } from './AstronautController';

export class SceneManager {
  readonly root = new THREE.Group();
  readonly astronaut: AstronautController;
  private connectors = new THREE.Group();
  private particles: THREE.Points;
  private particleMaterial: THREE.ShaderMaterial;
  private elapsed = 0;

  constructor(private quality: { particleScale: number }) {
    this.root.add(this.connectors);
    this.astronaut = new AstronautController();
    this.root.add(this.astronaut.root);
    const connectorGeometry = new THREE.TorusGeometry(0.5, 0.13, 12, 32);
    const colors = [0x6b7cff, 0x17191f, 0xf4f3ef, 0x8d55ff];
    for (let i = 0; i < 40; i += 1) { const material = new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.28, metalness: 0.18 }); const mesh = new THREE.Mesh(connectorGeometry, material); mesh.position.set((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3); mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3); mesh.scale.setScalar(0.45 + Math.random() * 0.7); this.connectors.add(mesh); }
    const count = Math.floor(4200 * quality.particleScale); const positions = new Float32Array(count * 3); const seeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) { positions[i * 3] = (Math.random() - 0.5) * 9; positions[i * 3 + 1] = (Math.random() - 0.5) * 7; positions[i * 3 + 2] = (Math.random() - 0.5) * 6; seeds[i] = Math.random(); }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    this.particleMaterial = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uIntensity: { value: 0 } }, vertexShader: `attribute float aSeed; uniform float uTime,uIntensity; varying float vAlpha; void main(){vec3 p=position; p.z+=sin(uTime*.35+p.x*1.4+aSeed*8.)*.35*uIntensity; p.x+=sin(uTime*.2+p.y*2.)*.12*uIntensity; p.y+=cos(uTime*.27+p.z*1.7)*.14*uIntensity; vAlpha=.2+.8*(1.-smoothstep(0.,4.,length(p.xy))); vec4 mv=modelViewMatrix*vec4(p,1.); gl_PointSize=(2.+aSeed*3.)*(7./-mv.z); gl_Position=projectionMatrix*mv;}`, fragmentShader: `varying float vAlpha; void main(){float d=length(gl_PointCoord-.5); if(d>.5) discard; float glow=smoothstep(.5,0.,d); gl_FragColor=vec4(.65,.72,1.,glow*vAlpha*.72);}` });
    this.particles = new THREE.Points(geometry, this.particleMaterial); this.root.add(this.particles);
  }

  update(state: ScrollState, delta: number, pointer: THREE.Vector2, reducedMotion: boolean) {
    this.elapsed += delta; const section = state.sections[state.activeSection]; const scene = section?.scene || 'connector'; const dark = scene !== 'connector' && scene !== 'projects'; const particleStrength = dark ? 0.45 + (section?.progress ?? 0) * 0.55 : 0;
    this.particleMaterial.uniforms.uTime.value = this.elapsed; this.particleMaterial.uniforms.uIntensity.value = reducedMotion ? 0.15 : particleStrength;
    this.connectors.visible = scene === 'connector' || scene === 'atmosphere' || scene === 'team'; this.particles.visible = dark;
    if (!reducedMotion) { this.connectors.rotation.y += delta * 0.025 + pointer.x * delta * 0.01; this.connectors.rotation.x += delta * 0.01; this.particles.rotation.y += delta * 0.008; }
    this.root.position.y += ((-state.velocity * 0.00015) - this.root.position.y) * 0.04;
    this.astronaut.update(state, delta, pointer, reducedMotion);
  }

  dispose() { this.astronaut.dispose(); this.root.traverse((object) => { const mesh = object as THREE.Mesh; if (mesh.geometry) mesh.geometry.dispose(); if (Array.isArray(mesh.material)) mesh.material.forEach((material) => material.dispose()); else if (mesh.material) mesh.material.dispose(); }); }
}
