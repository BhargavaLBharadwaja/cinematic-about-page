import * as THREE from 'three';

export class PortalShader {
  readonly material: THREE.ShaderMaterial;

  constructor() {
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uIntensity: { value: 0 },
        uColor: { value: new THREE.Color('#6e7cff') },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uProgress;
        varying vec2 vUv;
        varying float vWave;
        void main() {
          vUv = uv;
          vec3 p = position;
          float wave = sin(uv.y * 24.0 + uTime * 2.2) * 0.035 * uProgress;
          p += normal * (wave + sin(uv.x * 18.0 - uTime) * 0.02 * uProgress);
          vWave = wave;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uProgress;
        uniform float uIntensity;
        uniform vec3 uColor;
        varying vec2 vUv;
        varying float vWave;
        void main() {
          vec2 centered = vUv - 0.5;
          float radius = length(centered * vec2(1.0, 1.5));
          float edge = smoothstep(0.5, 0.42, abs(radius - 0.34));
          float rings = 0.5 + 0.5 * sin(radius * 90.0 - uTime * 5.0 + vWave * 20.0);
          float centerFade = smoothstep(0.5, 0.08, radius);
          float alpha = edge * (0.3 + rings * 0.7) * uIntensity * centerFade;
          vec3 color = mix(uColor, vec3(0.7, 0.95, 1.0), rings * 0.45);
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
  }

  dispose() { this.material.dispose(); }
}
