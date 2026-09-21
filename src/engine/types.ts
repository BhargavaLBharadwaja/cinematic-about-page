export type SceneId = 'connector' | 'particles' | 'atmosphere' | 'contact' | 'editorial' | 'expertise' | 'data' | 'brands' | 'team' | 'projects';

export interface SectionProgress {
  id: string;
  scene: SceneId;
  index: number;
  start: number;
  end: number;
  progress: number;
  isActive: boolean;
}

export interface ScrollState {
  position: number;
  progress: number;
  velocity: number;
  direction: -1 | 0 | 1;
  viewportHeight: number;
  documentHeight: number;
  activeSection: number;
  sections: SectionProgress[];
}

export const DEFAULT_SCROLL_STATE: ScrollState = {
  position: 0, progress: 0, velocity: 0, direction: 0,
  viewportHeight: 0, documentHeight: 0, activeSection: 0, sections: [],
};
