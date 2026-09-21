import * as THREE from 'three';
import type { ScrollState } from './types';
import { PortalShader } from './PortalShader';

export class PortalSystem {
  readonly root = new THREE.Group();
  private readonly shader = new PortalShader();
  private readonly surface: THREE.Mesh;
  private readonly halo: THREE.Mesh;
  private readonly light: THREE.PointLight;
  private readonly particles: THREE.Points;
  private readonly particleMaterial: THREE.ShaderMaterial;
  private time = 0;
  private amount = 0;

  constructor(private readonly quality: { particleScale: number }) {
    const surfaceGeometry = new THREE.RingGeometry(0.72, 1.0, 96, 8);
    this.surface = new THREE.Mesh(surfaceGeometry, this.shader.material);
    this.surface.rotation.x = -Math.PI / 2;
    this.surface.rotation.z = 0.2;
    this.root.add(this.surface);

    const haloMaterial = new THREE.MeshBasicMaterial({ color: 0x536dff, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    this.halo = new THREE.Mesh(new THREE.RingGeometry(1.05, 1.22, 96), haloMaterial);
    this.halo.rotation.x = -Math.PI / 2;
    this.root.add(this.halo);
    this.light = new THREE.PointLight(0x6a83ff, 0, 5);
    this.light.position.z = 0.2;
    this.root.add(this.light);

    const count = Math.floor(900 * quality.particleScale);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.15 + Math.random() * 1.8;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.14;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      seeds[i] = Math.random();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    this.particleMaterial = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uAmount: { value: 0 } },
      vertexShader: `attribute float aSeed; uniform float uTime,uAmount; varying float vAlpha; void main(){vec3 p=position; float a=atan(p.z,p.x); float r=length(p.xz); a+=uTime*(.25+aSeed*.4)*uAmount; r-=uAmount*(.35+aSeed*.8); p.x=cos(a)*r; p.z=sin(a)*r; p.y+=sin(uTime*2.+aSeed*9.)*.15*uAmount; vAlpha=(.15+aSeed*.85)*uAmount; vec4 mv=modelViewMatrix*vec4(p,1.); gl_PointSize=(1.5+aSeed*3.)*(6./-mv.z); gl_Position=projectionMatrix*mv;}`,
      fragmentShader: `varying float vAlpha; void main(){float d=length(gl_PointCoord-.5); if(d>.5) discard; gl_FragColor=vec4(.5,.7,1.,(1.-d*2.)*vAlpha);}`,
    });
    this.particles = new THREE.Points(geometry, this.particleMaterial);
    this.root.add(this.particles);
    this.root.visible = false;
  }

  update(progress: number, state: ScrollState, delta: number, reducedMotion: boolean) {
    this.time += delta;
    const scene = state.sections[state.activeSection]?.scene;
    const sceneWeight = scene === 'atmosphere' || scene === 'team' ? 1 : 0;
    const target = sceneWeight * THREE.MathUtils.smoothstep(progress, 0.18, 0.88);
    this.amount = THREE.MathUtils.damp(this.amount, target, reducedMotion ? 2 : 4, delta);
    this.root.visible = this.amount > 0.005;
    this.shader.material.uniforms.uTime.value = this.time;
    this.shader.material.uniforms.uProgress.value = this.amount;
    this.shader.material.uniforms.uIntensity.value = this.amount;
    this.particleMaterial.uniforms.uTime.value = this.time;
    this.particleMaterial.uniforms.uAmount.value = this.amount;
    this.root.scale.setScalar(0.4 + this.amount * 2.4);
    this.root.rotation.y += delta * (0.12 + Math.abs(state.velocity) * 0.01) * (reducedMotion ? 0.1 : 1);
    this.halo.rotation.z -= delta * 0.2;
    this.light.intensity = this.amount * 5;
    this.root.position.x = Math.sin(this.time * 0.25) * 0.2;
    this.root.position.z = -2.2 + this.amount * 0.45;
  }

  dispose() {
    this.root.traverse((object) => { const mesh = object as THREE.Mesh; if (mesh.geometry) mesh.geometry.dispose(); });
    this.shader.dispose();
    this.particleMaterial.dispose();
  }
}
