export const particleVertexShader = `
attribute float aSeed;
attribute float aSize;
attribute vec3 aTarget;
uniform float uTime;
uniform float uState;
uniform float uProgress;
uniform float uVelocity;
uniform float uMorph;
uniform float uPixelRatio;
uniform vec2 uPointer;
uniform vec3 uAttractor;
varying float vAlpha;
varying float vDepth;
varying float vEnergy;

vec3 curlNoise(vec3 p, float t) {
  float n1 = sin(p.y * 1.7 + t) + cos(p.z * 1.35 - t * .7);
  float n2 = sin(p.z * 1.5 - t * .8) + cos(p.x * 1.8 + t * .9);
  float n3 = sin(p.x * 1.2 + t * .6) + cos(p.y * 1.6 - t);
  return vec3(n1 - n2, n2 - n3, n3 - n1) * .22;
}

void main() {
  vec3 base = position;
  vec3 p = mix(base, aTarget, smoothstep(0.0, 1.0, uMorph));
  float seed = aSeed * 6.2831853;
  float speed = .15 + aSeed * .18;
  float velocityEnergy = min(abs(uVelocity) * .045, .75);
  float motion = 0.25 + uProgress * .8 + velocityEnergy;
  vec3 curl = curlNoise(p * (.7 + aSeed * .3), uTime * speed) * motion;
  vec3 pointer = vec3(uPointer.x, -uPointer.y, 0.0) - p * .012;
  float pointerDistance = length(pointer.xy);
  vec3 pointerForce = normalize(pointer + vec3(.0001)) * smoothstep(2.8, .0, pointerDistance) * .16;
  vec3 toAttractor = uAttractor - p;
  float attraction = smoothstep(5.5, .15, length(toAttractor));
  vec3 pull = normalize(toAttractor + vec3(.0001)) * attraction * .16 * uProgress;
  vec3 vortex = vec3(-p.y, p.x, 0.0) * (.055 + uProgress * .16) / (1.0 + length(p.xy));
  vec3 burst = normalize(p + vec3(.001)) * max(uState - 2.7, 0.0) * .16;
  vec3 repulsion = normalize(p - uAttractor + vec3(.0001)) * max(0.0, 5.0 - uState) * .006;
  p += curl + pointerForce + pull + vortex + burst + repulsion;
  p.z += sin(uTime * speed * 2.0 + seed) * (.12 + velocityEnergy * 1.8);
  p.y += cos(uTime * speed * 1.4 + seed * 1.7) * (.08 + uProgress * .12);
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  float depth = clamp(1.0 - (-mvPosition.z / 16.0), 0.0, 1.0);
  gl_PointSize = aSize * uPixelRatio * (5.8 / max(-mvPosition.z, .5)) * (1.0 + uProgress * .35 + velocityEnergy);
  gl_Position = projectionMatrix * mvPosition;
  vDepth = depth;
  vEnergy = velocityEnergy + uProgress * .35;
  vAlpha = (0.2 + aSeed * .8) * (1.0 - smoothstep(7.0, 8.5, abs(p.z)));
}
`;
