import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CameraManager } from '../engine/CameraManager';
import { QualityManager } from '../engine/QualityManager';
import { SceneManager } from '../engine/SceneManager';
import { ScrollController } from '../engine/ScrollController';
import { DEFAULT_SCROLL_STATE, type ScrollState } from '../engine/types';

export function PersistentWebGLCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<ScrollState>(DEFAULT_SCROLL_STATE);
  const pointer = useRef(new THREE.Vector2());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const quality = new QualityManager();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(quality.value.dpr);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    const cameraManager = new CameraManager(camera);
    const sceneManager = new SceneManager(quality.value);
    scene.add(sceneManager.root);
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const keyLight = new THREE.DirectionalLight(0x9ba8ff, 2.5);
    keyLight.position.set(2, 3, 5); scene.add(keyLight);
    const scroll = new ScrollController();
    const onState = (state: ScrollState) => { stateRef.current = state; };
    const unsubscribe = scroll.subscribe(onState);
    const onPointer = (event: PointerEvent) => { pointer.current.set((event.clientX / window.innerWidth - 0.5) * 2, (event.clientY / window.innerHeight - 0.5) * 2); };
    const resize = () => { const width = window.innerWidth; const height = window.innerHeight; renderer.setPixelRatio(quality.update().dpr); renderer.setSize(width, height, false); cameraManager.resize(width, height); scroll.onResize(); };
    window.addEventListener('resize', resize); window.addEventListener('pointermove', onPointer, { passive: true }); resize();
    let frame = 0; let previous = performance.now();
    const render = (now: number) => { const delta = Math.min((now - previous) / 1000, 0.05); previous = now; const state = stateRef.current; sceneManager.update(state, delta, pointer.current, quality.isReducedMotion); cameraManager.update(state, pointer.current, quality.isReducedMotion, delta); renderer.setClearColor(state.activeSection === 3 || state.activeSection === 5 ? 0x1550eb : state.activeSection === 0 || state.activeSection === 8 ? 0xf1f0ec : 0x08090b, 1); renderer.render(scene, camera); frame = requestAnimationFrame(render); };
    frame = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(frame); unsubscribe(); scroll.destroy(); sceneManager.dispose(); renderer.dispose(); window.removeEventListener('resize', resize); window.removeEventListener('pointermove', onPointer); };
  }, []);
  return <canvas ref={canvasRef} className="webgl" aria-hidden="true" />;
}
