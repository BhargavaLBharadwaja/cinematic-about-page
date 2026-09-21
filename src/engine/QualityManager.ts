export interface QualitySettings {
  dpr: number;
  particleScale: number;
  postProcessing: boolean;
  mobile: boolean;
}

export class QualityManager {
  private settings: QualitySettings;
  private reducedMotion: boolean;

  constructor() {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 700px)').matches || navigator.maxTouchPoints > 1;
    const dprLimit = mobile ? 1.25 : 1.75;
    this.settings = {
      dpr: Math.min(window.devicePixelRatio || 1, dprLimit),
      particleScale: mobile ? 0.45 : 1,
      postProcessing: !mobile && !this.reducedMotion,
      mobile,
    };
  }

  get value(): QualitySettings { return this.settings; }
  get isReducedMotion(): boolean { return this.reducedMotion; }

  update(): QualitySettings {
    const mobile = window.matchMedia('(max-width: 700px)').matches || navigator.maxTouchPoints > 1;
    this.settings = {
      ...this.settings,
      mobile,
      dpr: Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75),
      postProcessing: !mobile && !this.reducedMotion,
      particleScale: mobile ? 0.45 : 1,
    };
    return this.settings;
  }
}
