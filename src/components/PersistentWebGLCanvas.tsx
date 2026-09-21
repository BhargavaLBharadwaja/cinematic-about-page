import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CameraManager } from '../engine/CameraManager';
import { QualityManager } from '../engine/QualityManager';
import { SceneManager } from '../engine/SceneManager';
import { ScrollController } from '../engine/ScrollController';
import { DEFAULT_SCROLL_STATE, type ScrollState } from '../engine/types';
import { CursorSystem } from '../interaction/CursorSystem';
import { PostProcessing } from '../engine/PostProcessing';

export function PersistentWebGLCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<ScrollState>(DEFAULT_SCROLL_STATE);
  const pointer = useRef(new THREE.Vector2());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cursor = new CursorSystem();
    const unmountCursor = cursor.mount();
    const quality = new QualityManager();
    const settings = quality.value;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !settings.postProcessing, alpha: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = settings.shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x08090b, 1);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    const manager = new SceneManager(settings);
    const cameraManager = new CameraManager(camera);
    const post = new PostProcessing(renderer, scene, camera, settings.postProcessing, quality.isReducedMotion);
    scene.add(manager.root);
    scene.add(new THREE.AmbientLight(0xffffff, 1.25));
    const key = new THREE.DirectionalLight(0x9ba8ff, 2.5);
    key.position.set(2, 3, 5);
    key.castShadow = settings.shadows;
    key.shadow.mapSize.set(settings.shadowMapSize, settings.shadowMapSize);
    scene.add(key);
    manager.atmosphere.setFog(scene, true);
    const scroll = new ScrollController();
    const unsubscribe = scroll.subscribe((state) => { stateRef.current = state; });
    const onPointer = () => {
      const p = CursorSystem.getPointer();
      pointer.current.set(p.normalizedX, p.normalizedY);
    };
    const resize = () => {
      const width = innerWidth;
      const height = innerHeight;
      const next = quality.update();
      renderer.setPixelRatio(next.dpr);
      renderer.setSize(width, height, false);
      cameraManager.resize(width, height);
      manager.resize(next.dpr);
      post.resize(width, height, next.dpr);
      post.setEnabled(next.postProcessing);
      scroll.onResize();
    };
    addEventListener('pointermove', onPointer, { passive: true });
    addEventListener('resize', resize);
    resize();
    let frame = 0;
    let previous = performance.now();
    const render = (now: number) => {
      const delta = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      const state = stateRef.current;
      const current = quality.sample(delta);
      post.setEnabled(current.postProcessing);
      manager.update(state, delta, pointer.current, quality.isReducedMotion);
      const snapshot = CursorSystem.getPointer();
      cameraManager.update(state, pointer.current, quality.isReducedMotion, delta, snapshot);
      post.update(state, delta);
      const active = state.sections[state.activeSection]?.scene;
      renderer.setClearColor(active === 'contact' || active === 'expertise' ? 0x1550eb : active === 'connector' || active === 'projects' ? 0xf1f0ec : 0x08090b, 1);
      post.render();
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      unmountCursor();
      unsubscribe();
      scroll.destroy();
      post.dispose();
      manager.dispose();
      renderer.dispose();
      removeEventListener('pointermove', onPointer);
      removeEventListener('resize', resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="webgl" aria-hidden="true" />;
}
