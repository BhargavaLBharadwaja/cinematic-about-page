import * as THREE from 'three';
import type { ScrollState } from './types';

export type ParticleState = 'IDLE' | 'FLOW' | 'VORTEX' | 'EXPLOSION' | 'ATTRACTION' | 'REPULSION' | 'DISSOLVE' | 'MORPH' | 'TRANSITION';

const vertexShader = `
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  uniform float uState;
  uniform float uProgress;
  uniform float uVelocity;
  uniform vec2 uPointer;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vDepth;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  vec3 curlField(vec3 p, float t) {
    vec3 q = p;
    float n1 = sin(q.y * 1.7 + t) + cos(q.z * 1.3 - t * .7);
    float n2 = sin(q.z * 1.5 - t * .8) + cos(q.x * 1.8 + t);
    float n3 = sin(q.x * 1.2 + t * .6) + cos(q.y * 1.6 - t);
    return vec3(n1 - n2, n2 - n3, n3 - n1) * .22;
  }

  void main() {
    vec3 p = position;
    float seed = aSeed * 6.2831853;
    float t = uTime * (.18 + aSeed * .12);
    vec3 flow = curlField(p, t) * (0.45 + uProgress * .8);
    vec3 pointerForce = vec3(uPointer.x, -uPointer.y, 0.0) * (0.1 + aSeed * .12);
    float radius = length(p.xy);
    vec3 vortex = vec3(-p.y, p.x, 0.0) * (0.14 / (1.0 + radius)) * uProgress;
    float attract = smoothstep(4.5, 0.0, radius) * uProgress;
    vec3 attraction = -normalize(p + vec3(.001)) * attract * .28;
    float explosion = max(0.0, uState - 3.0) * .22;
    vec3 burst = normalize(p + vec3(.001)) * explosion * (0.4 + aSeed);
    p += flow + pointerForce + vortex + attraction + burst;
    p.z += sin(t * 1.7 + seed) * (.12 + abs(uVelocity) * .012);
    p.y += cos(t * 1.3 + seed * 1.4) * .1;
    float dissolve = smoothstep(6.5, 0.0, abs(p.z)) * (1.0 - min(uState, 1.0) * .2);
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    float depthScale = 7.0 / max(-mvPosition.z, 0.1);
    gl_PointSize = aSize * depthScale * uPixelRatio * (0.8 + uProgress * .45);
    gl_Position = projectionMatrix * mvPosition;
    vAlpha = dissolve * (.25 + aSeed * .75);
    vDepth = clamp(1.0 - (-mvPosition.z / 14.0), 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform float uState;
  uniform vec3 uColor;
  varying float vAlpha;
  varying float vDepth;
  void main() {
    vec2 point = gl_PointCoord - .5;
    float distanceToCenter = length(point);
    if (distanceToCenter > .5) discard;
    float soft = smoothstep(.5, .02, distanceToCenter);
    float core = smoothstep(.22, 0.0, distanceToCenter);
    vec3 color = mix(uColor, vec3(.7, .86, 1.0), core * .7 + vDepth * .25);
    float statePulse = 0.75 + sin(uState * 1.7) * .12;
    gl_FragColor = vec4(color, soft * vAlpha * statePulse * .7);
  }
`;

export class ParticleSystem {
  readonly root = new THREE.Group();
  readonly geometry: THREE.BufferGeometry;
  readonly material: THREE.ShaderMaterial;
  readonly points: THREE.Points;
  private readonly count: number;
  private time = 0;
  private currentState: ParticleState = 'IDLE';
  private stateValue = 0;
  private stateTarget = 0;

  constructor(private readonly quality: { particleScale: number; dpr?: number }) {
    this.count = Math.max(900, Math.floor(9000 * quality.particleScale));
    const positions = new Float32Array(this.count * 3);
    const seeds = new Float32Array(this.count);
    const sizes = new Float32Array(this.count);
    for (let i = 0; i < this.count; i += 1) {
      const radius = Math.pow(Math.random(), .58) * 5.5;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.sin(theta) * radius * .72;
      positions[i * 3 + 2] = (Math.random() - .5) * 8;
      seeds[i] = Math.random();
      sizes[i] = 1.1 + Math.random() * 2.8;
    }
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 }, uState: { value: 0 }, uProgress: { value: 0 }, uVelocity: { value: 0 },
        uPointer: { value: new THREE.Vector2() }, uPixelRatio: { value: quality.dpr ?? 1 }, uColor: { value: new THREE.Color('#93a7ff') },
      },
      vertexShader,
      fragmentShader,
    });
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.root.add(this.points);
  }

  setState(state: ParticleState) {
    this.currentState = state;
    this.stateTarget = ({ IDLE: 0, FLOW: 1, VORTEX: 2, EXPLOSION: 3, ATTRACTION: 4, REPULSION: 5, DISSOLVE: 6, MORPH: 7, TRANSITION: 8 } as Record<ParticleState, number>)[state];
  }

  update(state: ScrollState, delta: number, pointer: THREE.Vector2, reducedMotion: boolean) {
    this.time += delta;
    const section = state.sections[state.activeSection];
    const scene = section?.scene ?? 'connector';
    const active = scene !== 'connector' && scene !== 'projects';
    const progress = section?.progress ?? 0;
    const velocity = reducedMotion ? 0 : state.velocity;
    if (scene === 'contact' || scene === 'expertise') this.setState('TRANSITION');
    else if (Math.abs(velocity) > 1.2) this.setState('FLOW');
    else if (scene === 'team') this.setState('ATTRACTION');
    else if (scene === 'atmosphere') this.setState('VORTEX');
    else if (!active) this.setState('DISSOLVE');
    this.stateValue = THREE.MathUtils.damp(this.stateValue, this.stateTarget, reducedMotion ? 2 : 5, delta);
    this.material.uniforms.uTime.value = this.time;
    this.material.uniforms.uState.value = this.stateValue;
    this.material.uniforms.uProgress.value = active ? progress : 0;
    this.material.uniforms.uVelocity.value = velocity;
    this.material.uniforms.uPointer.value.lerp(pointer, 1 - Math.exp(-5 * delta));
    this.material.uniforms.uColor.value.set(scene === 'contact' || scene === 'expertise' ? '#b7c8ff' : '#93a7ff');
    this.root.visible = active || this.stateValue > 0.1;
    this.root.rotation.y += delta * (0.004 + Math.min(Math.abs(velocity), 3) * .002);
    this.root.position.y += (-velocity * .00012 - this.root.position.y) * .05;
  }

  resize(dpr: number) { this.material.uniforms.uPixelRatio.value = dpr; }
  dispose() { this.geometry.dispose(); this.material.dispose(); }
}
