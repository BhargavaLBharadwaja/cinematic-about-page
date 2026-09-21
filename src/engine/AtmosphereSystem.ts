import * as THREE from 'three';
import type { ScrollState } from './types';

const atmosphereVertex = `
uniform float uTime;
uniform float uIntensity;
uniform vec2 uPointer;
attribute float aSeed;
varying float vAlpha;
void main(){
  vec3 p=position;
  p.x += sin(uTime*.11+p.z*.4+aSeed*6.0)*.28*uIntensity + uPointer.x*.08;
  p.y += cos(uTime*.14+p.x*.3+aSeed*8.0)*.22*uIntensity - uPointer.y*.06;
  p.z += sin(uTime*.08+aSeed*9.0)*.35*uIntensity;
  vec4 mv=modelViewMatrix*vec4(p,1.0);
  gl_PointSize=(1.0+aSeed*2.5)*(5.0/max(-mv.z,.5))*(.5+uIntensity);
  gl_Position=projectionMatrix*mv;
  vAlpha=(.12+aSeed*.5)*uIntensity;
}`;
const atmosphereFragment = `
varying float vAlpha;
void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float glow=smoothstep(.5,.02,d);gl_FragColor=vec4(.25,.42,1.0,glow*vAlpha*.38);}`;

export class AtmosphereSystem {
  readonly root = new THREE.Group();
  private readonly fog = new THREE.FogExp2(0x080b18, .018);
  private readonly haze: THREE.Mesh;
  private readonly motes: THREE.Points;
  private readonly material: THREE.ShaderMaterial;
  private readonly pointer = new THREE.Vector2();
  private time = 0;
  private intensity = 0;

  constructor(private readonly quality: { particleScale: number }) {
    const hazeMaterial = new THREE.MeshBasicMaterial({ color: 0x213f9a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    this.haze = new THREE.Mesh(new THREE.SphereGeometry(3.8, 32, 18), hazeMaterial);
    this.haze.scale.set(1.8, .72, 1.05); this.haze.position.set(0, -.8, -4.2); this.root.add(this.haze);
    const count = Math.max(160, Math.floor(1200 * quality.particleScale));
    const positions = new Float32Array(count * 3); const seeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) { positions[i * 3] = (Math.random() - .5) * 14; positions[i * 3 + 1] = (Math.random() - .5) * 9; positions[i * 3 + 2] = -Math.random() * 12; seeds[i] = Math.random(); }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    this.material = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uIntensity: { value: 0 }, uPointer: { value: this.pointer } }, vertexShader: atmosphereVertex, fragmentShader: atmosphereFragment });
    this.motes = new THREE.Points(geometry, this.material); this.motes.frustumCulled = false; this.root.add(this.motes);
  }

  update(state: ScrollState, delta: number, pointer: THREE.Vector2, reducedMotion: boolean) {
    this.time += delta;
    const section = state.sections[state.activeSection];
    const active = ['particles', 'atmosphere', 'editorial', 'data', 'brands', 'team'].includes(section?.scene ?? '');
    const target = active ? THREE.MathUtils.smoothstep(section?.progress ?? 0, .02, .88) : 0;
    this.intensity = THREE.MathUtils.damp(this.intensity, reducedMotion ? target * .35 : target, 3.5, delta);
    this.pointer.lerp(pointer, 1 - Math.exp(-4 * delta));
    this.material.uniforms.uTime.value = this.time;
    this.material.uniforms.uIntensity.value = this.intensity;
    this.material.uniforms.uPointer.value = this.pointer;
    const hazeMaterial = this.haze.material as THREE.MeshBasicMaterial;
    hazeMaterial.opacity = this.intensity * .2;
    this.haze.rotation.y += delta * (reducedMotion ? .006 : .025 + Math.abs(state.velocity) * .003);
    this.haze.scale.x = 1.8 + this.intensity * .35;
    this.root.visible = this.intensity > .004;
  }

  setFog(scene: THREE.Scene, enabled: boolean) { scene.fog = enabled ? this.fog : null; }
  updateFog(scene: THREE.Scene, color: THREE.ColorRepresentation, density: number) { this.fog.color.set(color); this.fog.density = density; scene.fog = density > .001 ? this.fog : null; }
  dispose() { this.root.traverse((object) => { const mesh = object as THREE.Mesh; if (mesh.geometry) mesh.geometry.dispose(); if (mesh.material) mesh.material.dispose(); }); }
}
