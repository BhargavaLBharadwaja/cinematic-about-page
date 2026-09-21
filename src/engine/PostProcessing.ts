import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import type { ScrollState } from './types';

const CinematicShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uGrain: { value: 0.018 },
    uVignette: { value: 0.22 },
    uChromatic: { value: 0 },
    uVelocity: { value: 0 },
    uProgress: { value: 0 },
  },
  vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime,uGrain,uVignette,uChromatic,uVelocity,uProgress;
    varying vec2 vUv;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
    void main(){
      vec2 centered=vUv-.5;
      float chroma=uChromatic*(.35+abs(uVelocity)*.18);
      vec2 shift=vec2(chroma*(.5-centered.y),0.0);
      float r=texture2D(tDiffuse,vUv+shift).r;
      float g=texture2D(tDiffuse,vUv).g;
      float b=texture2D(tDiffuse,vUv-shift).b;
      vec3 color=vec3(r,g,b);
      float grain=(hash(vUv*vec2(1920.0,1080.0)+uTime)-.5)*uGrain;
      float vignette=smoothstep(.92,.18,length(centered))*uVignette;
      color+=grain;
      color*=1.0-vignette;
      gl_FragColor=vec4(color,1.0);
    }`,
};

export class PostProcessing {
  readonly composer: EffectComposer;
  private readonly bloom: UnrealBloomPass;
  private readonly cinematic: ShaderPass;
  private readonly smaa: SMAAPass;
  private readonly renderPass: RenderPass;
  private readonly reducedMotion: boolean;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    enabled: boolean,
    reducedMotion: boolean,
  ) {
    this.reducedMotion = reducedMotion;
    this.composer = new EffectComposer(renderer);
    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.45, 0.7, 0.82);
    this.composer.addPass(this.bloom);
    this.cinematic = new ShaderPass(CinematicShader);
    this.composer.addPass(this.cinematic);
    this.smaa = new SMAAPass(1, 1);
    this.composer.addPass(this.smaa);
    this.setEnabled(enabled);
  }

  update(state: ScrollState, delta: number) {
    const section = state.sections[state.activeSection];
    const scene = section?.scene ?? 'connector';
    const progress = section?.progress ?? 0;
    const velocity = Math.min(Math.abs(state.velocity), 3);
    const atmospheric = scene === 'particles' || scene === 'atmosphere' || scene === 'team';
    const transition = scene === 'contact' || scene === 'expertise';
    const targetBloom = this.reducedMotion ? 0.16 : atmospheric ? 0.32 + progress * 0.2 : transition ? 0.24 : 0.12;
    const targetRadius = atmospheric ? 0.8 : transition ? 0.65 : 0.45;
    const targetThreshold = scene === 'connector' || scene === 'projects' ? 0.9 : 0.78;
    const targetChroma = this.reducedMotion ? 0 : Math.min(0.0018 + velocity * 0.0012 + (transition ? progress * 0.001 : 0), 0.008);
    const targetGrain = this.reducedMotion ? 0.008 : 0.012 + velocity * 0.006;
    const targetVignette = scene === 'connector' || scene === 'projects' ? 0.13 : 0.2 + progress * 0.08;
    const ease = 1 - Math.exp(-4 * delta);
    this.bloom.strength = THREE.MathUtils.lerp(this.bloom.strength, targetBloom, ease);
    this.bloom.radius = THREE.MathUtils.lerp(this.bloom.radius, targetRadius, ease);
    this.bloom.threshold = THREE.MathUtils.lerp(this.bloom.threshold, targetThreshold, ease);
    this.cinematic.uniforms.uTime.value += delta;
    this.cinematic.uniforms.uChromatic.value = THREE.MathUtils.lerp(this.cinematic.uniforms.uChromatic.value, targetChroma, ease);
    this.cinematic.uniforms.uGrain.value = THREE.MathUtils.lerp(this.cinematic.uniforms.uGrain.value, targetGrain, ease);
    this.cinematic.uniforms.uVignette.value = THREE.MathUtils.lerp(this.cinematic.uniforms.uVignette.value, targetVignette, ease);
    this.cinematic.uniforms.uVelocity.value = velocity;
    this.cinematic.uniforms.uProgress.value = progress;
  }

  setEnabled(enabled: boolean) {
    this.bloom.enabled = enabled && !this.reducedMotion;
    this.cinematic.enabled = enabled;
    this.smaa.enabled = enabled;
  }

  resize(width: number, height: number, dpr: number) {
    this.composer.setPixelRatio(dpr);
    this.composer.setSize(width, height);
    this.smaa.setSize(width * dpr, height * dpr);
  }

  render() { this.composer.render(); }
  dispose() { this.composer.dispose(); }
}
