export const particleFragmentShader = `
uniform vec3 uColor;
uniform float uState;
varying float vAlpha;
varying float vDepth;
varying float vEnergy;

void main() {
  vec2 uv = gl_PointCoord - .5;
  float radius = length(uv);
  if (radius > .5) discard;
  float soft = smoothstep(.5, .02, radius);
  float core = smoothstep(.2, .0, radius);
  vec3 color = mix(uColor, vec3(.8, .92, 1.0), core * .7 + vDepth * .28 + vEnergy * .15);
  float stateGlow = .72 + min(uState, 8.0) * .025;
  gl_FragColor = vec4(color, soft * vAlpha * stateGlow * .78);
}
`;
