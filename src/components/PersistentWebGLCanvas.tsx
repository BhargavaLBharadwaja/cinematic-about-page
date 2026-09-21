import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CameraManager } from '../engine/CameraManager';
import { QualityManager } from '../engine/QualityManager';
import { SceneManager } from '../engine/SceneManager';
import { ScrollController } from '../engine/ScrollController';
import { DEFAULT_SCROLL_STATE, type ScrollState } from '../engine/types';
import { DomWebGLSync } from '../engine/DomWebGLSync';

export function PersistentWebGLCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<ScrollState>(DEFAULT_SCROLL_STATE);
  const pointer = useRef(new THREE.Vector2());
  const domSync = useRef(new DomWebGLSync());
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const quality = new QualityManager();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
    const manager = new SceneManager(quality.value); const cameraManager = new CameraManager(camera);
    scene.add(manager.root, new THREE.AmbientLight(0xffffff, 1.25)); const key = new THREE.DirectionalLight(0x9ba8ff, 2.5); key.position.set(2, 3, 5); scene.add(key);
    manager.atmosphere.setFog(scene, true);
    const scroll = new ScrollController(); const unsubscribe = scroll.subscribe((state) => { stateRef.current = state; });
    const onPointer = (event: PointerEvent) => pointer.current.set((event.clientX / innerWidth - .5) * 2, (event.clientY / innerHeight - .5) * 2);
    const resize = () => { const width = innerWidth; const height = innerHeight; const dpr = quality.update().dpr; renderer.setPixelRatio(dpr); renderer.setSize(width, height, false); cameraManager.resize(width, height); manager.resize(dpr); scroll.onResize(); };
    addEventListener('pointermove', onPointer, { passive: true }); addEventListener('resize', resize); resize();
    let frame = 0; let previous = performance.now();
    const render = (now: number) => { const delta = Math.min((now - previous) / 1000, .05); previous = now; const state = stateRef.current; manager.update(state, delta, pointer.current, quality.isReducedMotion); cameraManager.update(state, pointer.current, quality.isReducedMotion, delta); const active = state.sections[state.activeSection]?.scene; renderer.setClearColor(active === 'contact' || active === 'expertise' ? 0x1550eb : active === 'connector' || active === 'projects' ? 0xf1f0ec : 0x08090b, 1); renderer.render(scene, camera); frame = requestAnimationFrame(render); };
    frame = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(frame); unsubscribe(); scroll.destroy(); manager.dispose(); renderer.dispose(); removeEventListener('pointermove', onPointer); removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="webgl" aria-hidden="true" />;
}
