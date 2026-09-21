import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ScrollState, SceneId, SectionProgress } from './types';

gsap.registerPlugin(ScrollTrigger);

export class ScrollController {
  readonly lenis: Lenis;
  state: ScrollState;
  private listeners = new Set<(state: ScrollState) => void>();
  private sections: HTMLElement[] = [];
  private lastPosition = 0;
  private raf = (time: number) => {
    this.lenis.raf(time * 1000);
    this.measure();
  };

  constructor() {
    this.state = { position: 0, progress: 0, velocity: 0, direction: 0, viewportHeight: window.innerHeight, documentHeight: document.documentElement.scrollHeight, activeSection: 0, sections: [] };
    this.lenis = new Lenis({ duration: 1.2, smoothWheel: true, syncTouch: true });
    this.lenis.on('scroll', (event: { scroll: number; velocity: number; direction: number }) => {
      this.state.position = event.scroll;
      this.state.velocity = event.velocity;
      this.state.direction = event.direction > 0 ? 1 : event.direction < 0 ? -1 : 0;
      this.emit();
      ScrollTrigger.update();
    });
    gsap.ticker.add(this.raf);
    gsap.ticker.lagSmoothing(0);
    this.refresh();
  }

  refresh() {
    this.sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]'));
    this.measure();
    ScrollTrigger.refresh();
  }

  private measure() {
    const docHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const sections: SectionProgress[] = this.sections.map((element, index) => {
      const start = Math.max(0, element.offsetTop);
      const end = start + Math.max(element.offsetHeight, window.innerHeight);
      const progress = Math.max(0, Math.min(1, (this.state.position - start) / Math.max(end - start, 1)));
      return { id: element.id, scene: element.dataset.scene as SceneId, index, start, end, progress, isActive: this.state.position >= start && this.state.position < end };
    });
    let active = sections.findIndex((section) => section.isActive);
    if (active < 0) active = this.state.position >= (sections[sections.length - 1]?.start || 0) ? sections.length - 1 : 0;
    this.state = { ...this.state, progress: Math.max(0, Math.min(1, this.state.position / docHeight)), viewportHeight: window.innerHeight, documentHeight: docHeight, activeSection: active, sections };
    this.emit();
  }

  private emit() { this.listeners.forEach((listener) => listener(this.state)); }
  subscribe(listener: (state: ScrollState) => void) { this.listeners.add(listener); listener(this.state); return () => this.listeners.delete(listener); }
  onResize() { this.refresh(); }
  destroy() { gsap.ticker.remove(this.raf); this.lenis.destroy(); this.listeners.clear(); }
}
