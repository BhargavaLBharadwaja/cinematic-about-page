import * as THREE from 'three';

export type CursorState = 'DEFAULT' | 'LINK' | 'BUTTON' | 'DRAG' | 'INTERACTIVE' | 'NEXT' | 'OPEN';

interface CursorElements { root: HTMLDivElement; dot: HTMLDivElement; label: HTMLSpanElement; }

export class CursorSystem {
  private readonly target = new THREE.Vector2();
  private readonly position = new THREE.Vector2();
  private readonly magnetic = new THREE.Vector2();
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private state: CursorState = 'DEFAULT';
  private frame = 0;
  private elements: CursorElements | null = null;
  private hovered: HTMLElement | null = null;

  mount() {
    if (this.elements || this.reducedMotion || !window.matchMedia('(pointer:fine)').matches) return () => undefined;
    const root = document.createElement('div'); root.className = 'cursor-system';
    const dot = document.createElement('div'); dot.className = 'cursor-dot';
    const label = document.createElement('span'); label.className = 'cursor-label';
    root.append(dot, label); document.body.appendChild(root); this.elements = { root, dot, label };
    const onMove = (event: PointerEvent) => { this.target.set(event.clientX, event.clientY); this.hovered = (event.target as HTMLElement)?.closest<HTMLElement>('a,button,[data-cursor]') ?? null; this.updateState(this.hovered); };
    const onLeave = () => { this.target.set(-100, -100); this.setState('DEFAULT'); };
    const onDown = () => { if (this.hovered) this.setState(this.hovered.dataset.cursor === 'drag' ? 'DRAG' : 'BUTTON'); };
    const onUp = () => this.updateState(this.hovered);
    window.addEventListener('pointermove', onMove, { passive: true }); window.addEventListener('pointerleave', onLeave); window.addEventListener('pointerdown', onDown); window.addEventListener('pointerup', onUp);
    const tick = () => { const ease = 1 - Math.pow(.001, 1 / 60); this.position.lerp(this.target, ease); let x = this.position.x; let y = this.position.y; if (this.hovered?.dataset.magnetic !== undefined) { const bounds = this.hovered.getBoundingClientRect(); const dx = bounds.left + bounds.width / 2 - this.position.x; const dy = bounds.top + bounds.height / 2 - this.position.y; this.magnetic.set(dx * .12, dy * .12); x += this.magnetic.x; y += this.magnetic.y; } root.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`; this.frame = requestAnimationFrame(tick); };
    this.frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(this.frame); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerleave', onLeave); window.removeEventListener('pointerdown', onDown); window.removeEventListener('pointerup', onUp); root.remove(); this.elements = null; };
  }

  private updateState(element: HTMLElement | null) { if (!element) return this.setState('DEFAULT'); const explicit = element.dataset.cursor?.toUpperCase() as CursorState | undefined; if (explicit && explicit !== 'DEFAULT') return this.setState(explicit); if (element.tagName === 'A') return this.setState('LINK'); if (element.tagName === 'BUTTON') return this.setState('BUTTON'); this.setState('INTERACTIVE'); }
  setState(state: CursorState) { this.state = state; const root = this.elements?.root; if (!root) return; root.dataset.state = state.toLowerCase(); const labels: Partial<Record<CursorState, string>> = { LINK: 'OPEN', BUTTON: 'CLICK', DRAG: 'DRAG', NEXT: 'NEXT', OPEN: 'OPEN' }; this.elements.label.textContent = labels[state] ?? ''; }
}
