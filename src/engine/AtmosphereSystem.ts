import * as THREE from 'three';
import type { ScrollState } from './types';

export class AtmosphereSystem {
  readonly root = new THREE.Group();
  private readonly fog: THREE.FogExp2;
  private readonly haze: THREE.Mesh;
  private readonly motes: THREE.Points;
  private readonly moteMaterial: THREE.ShaderMaterial;
  private time = 0;

  constructor(private readonly quality: { particleScale: number }) {
    this.fog = new THREE.FogExp2(0x080b18, 0.035);
    const hazeMaterial = new THREE.MeshBasicMaterial({ color: 0x172a66, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false });
    this.haze = new THREE.Mesh(new THREE.SphereGeometry(3.8, 32, 16), hazeMaterial);
    this.haze.scale.set(1.7, .7, 1);
    this.haze.position.set(0, -.5, -4);
    this.root.add(this.haze);
    const count = Math.max(120, Math.floor(900 * quality.particleScale));
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) { positions[i * 3] = (Math.random() - .5) * 13; positions[i * 3 + 1] = (Math.random() - .5) * 8; positions[i * 3 + 2] = -Math.random() * 10; }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.moteMaterial = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uIntensity: { value: 0 } }, vertexShader: `uniform float uTime,uIntensity; varying float vA; void main(){vec3 p=position; p.x+=sin(uTime*.17+p.z)*.3*uIntensity; p.y+=cos(uTime*.2+p.x)*.2*uIntensity; vec4 mv=modelViewMatrix*vec4(p,1.); gl_PointSize=(1.0+uIntensity*2.)*(5./-mv.z); vA=uIntensity; gl_Position=projectionMatrix*mv;}`, fragmentShader: `varying float vA; void main(){float d=length(gl_PointCoord-.5); if(d>.5) discard; gl_FragColor=vec4(.35,.5,1.,(1.-d*2.)*vA*.25);}` });
    this.motes = new THREE.Points(geometry, this.moteMaterial); this.root.add(this.motes);
  }

  update(state: ScrollState, delta: number, reducedMotion: boolean) {
    this.time += delta;
    const section = state.sections[state.activeSection];
    const atmospheric = section?.scene === 'particles' || section?.scene === 'atmosphere' || section?.scene === 'editorial' || section?.scene === 'team';
    const intensity = atmospheric ? THREE.MathUtils.smoothstep(section?.progress ?? 0, .05, .8) : 0;
    this.moteMaterial.uniforms.uTime.value = this.time;
    this.moteMaterial.uniforms.uIntensity.value = reducedMotion ? intensity * .35 : intensity;
    this.haze.material instanceof THREE.MeshBasicMaterial && (this.haze.material.opacity = .06 + intensity * .18);
    this.haze.rotation.y += delta * (reducedMotion ? .01 : .04);
    this.root.visible = intensity > .005;
  }

  setFog(scene: THREE.Scene, enabled: boolean) { scene.fog = enabled ? this.fog : null; }
  dispose() { this.root.traverse((object) => { const mesh = object as THREE.Mesh; if (mesh.geometry) mesh.geometry.dispose(); if (mesh.material) mesh.material.dispose(); }); }
}
