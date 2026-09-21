import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export type SplitMode = 'characters' | 'words';

export function splitText(element: HTMLElement, mode: SplitMode): HTMLElement[] {
  const source = element.textContent ?? '';
  const tokens = mode === 'words' ? source.split(/(\s+)/) : Array.from(source);
  element.setAttribute('aria-label', source);
  element.textContent = '';
  const nodes: HTMLElement[] = [];
  tokens.forEach((token, index) => {
    if (/^\s+$/.test(token)) { element.appendChild(document.createTextNode(token)); return; }
    const outer = document.createElement('span');
    const inner = document.createElement('span');
    outer.className = 'text-mask'; inner.className = 'text-unit';
    outer.dataset.index = String(index); inner.textContent = token;
    outer.appendChild(inner); element.appendChild(outer); nodes.push(inner);
  });
  return nodes;
}

export class TextAnimation {
  private readonly elements = new Map<HTMLElement, HTMLElement[]>();
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  register(element: HTMLElement, mode: SplitMode = 'words') {
    if (!element.dataset.textAnimated) {
      this.elements.set(element, splitText(element, mode));
      element.dataset.textAnimated = 'true';
    }
  }

  reveal(element: HTMLElement, options: { start?: string; y?: number; x?: number; scale?: number; blur?: number; stagger?: number } = {}) {
    const units = this.elements.get(element) ?? [];
    if (!units.length) return;
    const { start = 'top 82%', y = 105, x = 0, scale = .98, blur = 8, stagger = .035 } = options;
    gsap.set(units, { yPercent: this.reducedMotion ? 0 : y, xPercent: this.reducedMotion ? 0 : x, scale: this.reducedMotion ? 1 : scale, opacity: this.reducedMotion ? 1 : 0, filter: this.reducedMotion ? 'blur(0px)' : `blur(${blur}px)` });
    ScrollTrigger.create({ trigger: element, start, once: false, onEnter: () => gsap.to(units, { yPercent: 0, xPercent: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: this.reducedMotion ? .01 : 1.15, stagger: this.reducedMotion ? 0 : stagger, ease: 'power4.out' }), onLeaveBack: () => gsap.to(units, { yPercent: this.reducedMotion ? 0 : y * .65, opacity: this.reducedMotion ? 1 : 0, duration: this.reducedMotion ? .01 : .55, stagger: this.reducedMotion ? 0 : stagger * .4, ease: 'power2.in' }) });
  }

  destroy() { this.elements.clear(); ScrollTrigger.getAll().forEach((trigger) => trigger.kill()); }
}
