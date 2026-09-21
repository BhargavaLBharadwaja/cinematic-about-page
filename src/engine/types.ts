import type { ScrollState } from './types';
export type ExpertiseIndex = 0 | 1 | 2 | 3;
export interface SectionProgress { id: string; scene: import('./types').SceneId; index: number; start: number; end: number; progress: number; isActive: boolean; }
export interface ScrollState { position: number; progress: number; velocity: number; direction: -1 | 0 | 1; viewportHeight: number; documentHeight: number; activeSection: number; sections: SectionProgress[]; expertiseIndex: ExpertiseIndex; }
export const DEFAULT_SCROLL_STATE: ScrollState = { position: 0, progress: 0, velocity: 0, direction: 0, viewportHeight: 0, documentHeight: 0, activeSection: 0, sections: [], expertiseIndex: 0 };
