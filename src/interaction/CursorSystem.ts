import * as THREE from 'three';

export type CursorState = 'DEFAULT' | 'LINK' | 'BUTTON' | 'DRAG' | 'INTERACTIVE' | 'NEXT' | 'OPEN';
export interface PointerSnapshot { x: number; y: number; normalizedX: number; normalizedY: number; velocityX: number; velocityY: number; speed: number; }
interface CursorElements { root: HTMLDivElement; dot: HTMLDivElement; label: HTMLSpanElement; }

const pointer: PointerSnapshot = { x: 0, y: 0, normalizedX: 0, normalizedY: 0, velocityX: 0, velocityY: 0, speed: 0 };

export class CursorSystem {
  static getPointer(): PointerSnapshot { return pointer; }
  private readonly target = new THREE.Vector2(); private readonly position = new THREE.Vector2(); private readonly magnetic = new THREE.Vector2();
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private state: CursorState = 'DEFAULT'; private frame = 0; private elements: CursorElements | null = null; private hovered: HTMLElement | null = null; private magneticElement: HTMLElement | null = null;
  private lastTime = performance.now(); private lastX = 0; private lastY = 0;

  mount() {
    if (this.elements || this.reducedMotion || !window.matchMedia('(pointer:fine)').matches) return () => undefined;
    const root = document.createElement('div'); root.className = 'cursor-system';
    const dot = document.createElement('div'); dot.className = 'cursor-dot'; const label = document.createElement('span'); label.className = 'cursor-label';
    root.append(dot, label); document.body.appendChild(root); this.elements = { root, dot, label };
    const onMove = (event: PointerEvent) => {
      const now = performance.now(); const dt = Math.max((now - this.lastTime) / 1000, 0.001); const dx = event.clientX - this.lastX; const dy = event.clientY - this.lastY;
      pointer.x = event.clientX; pointer.y = event.clientY; pointer.normalizedX = (event.clientX / innerWidth - .5) * 2; pointer.normalizedY = (event.clientY / innerHeight - .5) * 2; pointer.velocityX = THREE.MathUtils.clamp(dx / dt / 1200, -3, 3); pointer.velocityY = THREE.MathUtils.clamp(dy / dt / 1200, -3, 3); pointer.speed = Math.min(Math.hypot(pointer.velocityX, pointer.velocityY), 3);
      this.target.set(event.clientX, event.clientY); this.hovered = (event.target as HTMLElement)?.closest<HTMLElement>('a,button,[data-cursor]') ?? null; this.updateMagneticElement(this.hovered); this.updateState(this.hovered); this.lastX = event.clientX; this.lastY = event.clientY; this.lastTime = now;
    };
    const onLeave = () => { this.target.set(-100, -100); pointer.speed = 0; this.resetMagnetic(); this.setState('DEFAULT'); };
    const onDown = () => { if (this.hovered) this.setState(this.hovered.dataset.cursor === 'drag' ? 'DRAG' : 'BUTTON'); };
    const onUp = () => this.updateState(this.hovered);
    window.addEventListener('pointermove', onMove, { passive: true }); window.addEventListener('pointerleave', onLeave); window.addEventListener('pointerdown', onDown); window.addEventListener('pointerup', onUp);
    const tick = () => {
      const ease = 1 - Math.pow(.001, 1 / 60); this.position.lerp(this.target, ease); let x = this.position.x; let y = this.position.y;
      if (this.hovered?.dataset.magnetic !== undefined || this.hovered?.tagName === 'BUTTON') { const bounds = this.hovered.getBoundingClientRect(); this.magnetic.set((bounds.left + bounds.width / 2 - this.position.x) * .1, (bounds.top + bounds.height / 2 - this.position.y) * .1); x += this.magnetic.x; y += this.magnetic.y; }
      if (this.elements) this.elements.root.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
      pointer.velocityX *= .88; pointer.velocityY *= .88; pointer.speed *= .88; this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(this.frame); this.resetMagnetic(); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerleave', onLeave); window.removeEventListener('pointerdown', onDown); window.removeEventListener('pointerup', onUp); root.remove(); this.elements = null; };
  }

  private updateMagneticElement(element: HTMLElement | null) { if (this.magneticElement === element) return; this.resetMagnetic(); if (element && (element.dataset.magnetic !== undefined || element.tagName === 'BUTTON')) { this.magneticElement = element; element.style.willChange = 'transform'; } }
  private resetMagnetic() { if (this.magneticElement) { this.magneticElement.style.transform = ''; this.magneticElement.style.willChange = ''; this.magneticElement = null; } }
  private updateState(element: HTMLElement | null) { if (!element) return this.setState('DEFAULT'); const explicit = element.dataset.cursor?.toUpperCase() as CursorState | undefined; if (explicit) return this.setState(explicit); if (element.tagName === 'A') return this.setState('LINK'); if (element.tagName === 'BUTTON') return this.setState('BUTTON'); this.setState('INTERACTIVE'); }
  setState(state: CursorState) { this.state = state; const root = this.elements?.root; if (!root) return; root.dataset.state = state.toLowerCase(); const labels: Partial<Record<CursorState, string>> = { LINK: 'OPEN', BUTTON: 'CLICK', DRAG: 'DRAG', NEXT: 'NEXT', OPEN: 'OPEN' }; this.elements.label.textContent = labels[state] ?? ''; }
}
