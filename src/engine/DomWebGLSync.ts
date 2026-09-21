import * as THREE from 'three';
import type { ScrollState } from './types';

export interface DomSyncSignal { active: boolean; progress: number; intensity: number; }

export class DomWebGLSync {
  readonly signal: DomSyncSignal = { active: false, progress: 0, intensity: 0 };
  private readonly rect = new DOMRect();

  measure(element: HTMLElement, viewportHeight = window.innerHeight): DomSyncSignal {
    const bounds = element.getBoundingClientRect();
    const progress = THREE.MathUtils.clamp((viewportHeight - bounds.top) / (viewportHeight + bounds.height), 0, 1);
    this.signal.progress = progress;
    this.signal.active = bounds.top < viewportHeight * .82 && bounds.bottom > viewportHeight * .18;
    this.signal.intensity = this.signal.active ? Math.sin(progress * Math.PI) : 0;
    return this.signal;
  }

  sectionProgress(state: ScrollState): number {
    return state.sections[state.activeSection]?.progress ?? 0;
  }

  viewportPosition(element: HTMLElement): THREE.Vector3 {
    const bounds = element.getBoundingClientRect();
    return new THREE.Vector3((bounds.left + bounds.width * .5) / window.innerWidth * 2 - 1, 1 - (bounds.top + bounds.height * .5) / window.innerHeight * 2, 0);
  }
}
