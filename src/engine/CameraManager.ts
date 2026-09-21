import * as THREE from 'three';
import type { ScrollState } from './types';
import type { PointerSnapshot } from '../interaction/CursorSystem';

export interface CameraPose { position: THREE.Vector3; rotation: THREE.Euler; fov: number; }
const poses: Record<string, CameraPose> = { connector:{position:new THREE.Vector3(0,0,8),rotation:new THREE.Euler(),fov:38}, particles:{position:new THREE.Vector3(0,0,9),rotation:new THREE.Euler(),fov:42}, atmosphere:{position:new THREE.Vector3(0,-.15,10),rotation:new THREE.Euler(-.02,0,0),fov:45}, contact:{position:new THREE.Vector3(0,0,11),rotation:new THREE.Euler(),fov:48}, editorial:{position:new THREE.Vector3(0,0,10),rotation:new THREE.Euler(),fov:45}, expertise:{position:new THREE.Vector3(0,0,9),rotation:new THREE.Euler(),fov:43}, data:{position:new THREE.Vector3(0,0,10),rotation:new THREE.Euler(),fov:45}, brands:{position:new THREE.Vector3(0,0,10),rotation:new THREE.Euler(),fov:45}, team:{position:new THREE.Vector3(0,0,8.5),rotation:new THREE.Euler(),fov:40}, projects:{position:new THREE.Vector3(0,0,11),rotation:new THREE.Euler(),fov:48} };
export class CameraManager {
  private target = new THREE.Vector3(); private targetRotation = new THREE.Euler(); private targetFov = 42; private readonly parallax = new THREE.Vector2();
  constructor(private camera: THREE.PerspectiveCamera) {}
  update(state: ScrollState, pointer: THREE.Vector2, reducedMotion: boolean, delta: number, pointerVelocity?: THREE.Vector2 | PointerSnapshot) {
    const current = state.sections[state.activeSection]?.scene || 'connector'; const next = state.sections[Math.min(state.activeSection + 1, state.sections.length - 1)]?.scene || current; const from = poses[current] || poses.connector; const to = poses[next] || from; const progress = state.sections[state.activeSection]?.progress ?? 0; const blend = progress > .72 ? (progress - .72) / .28 : 0;
    this.target.lerpVectors(from.position, to.position, blend); this.targetRotation.set(THREE.MathUtils.lerp(from.rotation.x,to.rotation.x,blend),THREE.MathUtils.lerp(from.rotation.y,to.rotation.y,blend),THREE.MathUtils.lerp(from.rotation.z,to.rotation.z,blend)); this.targetFov = THREE.MathUtils.lerp(from.fov,to.fov,blend);
    const ease = 1 - Math.pow(.001, Math.min(delta,.05)); this.camera.position.lerp(this.target,ease); this.camera.rotation.x=THREE.MathUtils.lerp(this.camera.rotation.x,this.targetRotation.x,ease); this.camera.rotation.y=THREE.MathUtils.lerp(this.camera.rotation.y,this.targetRotation.y,ease); this.camera.rotation.z=THREE.MathUtils.lerp(this.camera.rotation.z,this.targetRotation.z,ease); this.camera.fov=THREE.MathUtils.lerp(this.camera.fov,this.targetFov,ease);
    if (!reducedMotion) { const px = pointerVelocity && 'normalizedX' in pointerVelocity ? pointerVelocity.normalizedX : pointer.x; const py = pointerVelocity && 'normalizedY' in pointerVelocity ? pointerVelocity.normalizedY : pointer.y; this.parallax.lerp(new THREE.Vector2(px, py), 1 - Math.exp(-3 * delta)); this.camera.position.x += this.parallax.x * .1 * ease; this.camera.position.y -= this.parallax.y * .06 * ease; this.camera.rotation.z = THREE.MathUtils.lerp(this.camera.rotation.z, -this.parallax.x * .008, .04); }
    this.camera.updateProjectionMatrix();
  }
  resize(width:number,height:number) { this.camera.aspect=width/Math.max(height,1); this.camera.updateProjectionMatrix(); }
}
