export type QualityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';

export interface QualitySettings {
  level: QualityLevel;
  dpr: number;
  particleScale: number;
  postProcessing: boolean;
  shadows: boolean;
  shadowMapSize: number;
  shaderComplexity: 0 | 1 | 2;
  fluidResolution: number;
  physicsQuality: 0 | 1 | 2;
  mobile: boolean;
}

const levelSettings: Record<QualityLevel, Omit<QualitySettings, 'level' | 'mobile'>> = {
  LOW: { dpr: 0.85, particleScale: 0.28, postProcessing: false, shadows: false, shadowMapSize: 256, shaderComplexity: 0, fluidResolution: 32, physicsQuality: 0 },
  MEDIUM: { dpr: 1, particleScale: 0.5, postProcessing: false, shadows: false, shadowMapSize: 512, shaderComplexity: 1, fluidResolution: 64, physicsQuality: 1 },
  HIGH: { dpr: 1.5, particleScale: 0.78, postProcessing: true, shadows: true, shadowMapSize: 1024, shaderComplexity: 2, fluidResolution: 96, physicsQuality: 2 },
  ULTRA: { dpr: 1.75, particleScale: 1, postProcessing: true, shadows: true, shadowMapSize: 2048, shaderComplexity: 2, fluidResolution: 128, physicsQuality: 2 },
};

export class QualityManager {
  private settings: QualitySettings;
  private readonly reducedMotion: boolean;
  private frameAccumulator = 0;
  private frameCount = 0;
  private cooldown = 0;

  constructor() {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.settings = this.createSettings(this.detectLevel());
  }

  get value(): QualitySettings { return this.settings; }
  get isReducedMotion(): boolean { return this.reducedMotion; }

  private detectLevel(): QualityLevel {
    const mobile = window.matchMedia('(max-width: 700px)').matches || navigator.maxTouchPoints > 1;
    if (this.reducedMotion || mobile) return 'MEDIUM';
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const cores = navigator.hardwareConcurrency ?? 4;
    if (memory >= 8 && cores >= 8 && window.devicePixelRatio >= 1.5) return 'ULTRA';
    if (memory >= 4 && cores >= 4) return 'HIGH';
    return 'MEDIUM';
  }

  private createSettings(level: QualityLevel): QualitySettings {
    const mobile = window.matchMedia('(max-width: 700px)').matches || navigator.maxTouchPoints > 1;
    const base = levelSettings[level];
    const mobileScale = mobile ? 0.72 : 1;
    return {
      level,
      mobile,
      ...base,
      dpr: Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : base.dpr),
      particleScale: base.particleScale * mobileScale,
      postProcessing: base.postProcessing && !mobile && !this.reducedMotion,
      shadows: base.shadows && !mobile && !this.reducedMotion,
    };
  }

  update(): QualitySettings {
    const mobile = window.matchMedia('(max-width: 700px)').matches || navigator.maxTouchPoints > 1;
    if (mobile !== this.settings.mobile) this.settings = this.createSettings(mobile ? 'MEDIUM' : this.settings.level);
    this.settings.dpr = Math.min(window.devicePixelRatio || 1, this.settings.mobile ? 1.15 : levelSettings[this.settings.level].dpr);
    return this.settings;
  }

  sample(delta: number): QualitySettings {
    this.frameAccumulator += delta;
    this.frameCount += 1;
    this.cooldown = Math.max(0, this.cooldown - delta);
    if (this.frameAccumulator < 1 || this.frameCount < 20 || this.cooldown > 0) return this.settings;
    const fps = this.frameCount / this.frameAccumulator;
    this.frameAccumulator = 0;
    this.frameCount = 0;
    if (fps < 42 && this.settings.level !== 'LOW') {
      const next = this.settings.level === 'ULTRA' ? 'HIGH' : 'LOW';
      this.settings = this.createSettings(next);
      this.cooldown = 4;
    } else if (fps > 57 && !this.settings.mobile && this.settings.level === 'MEDIUM') {
      this.settings = this.createSettings('HIGH');
      this.cooldown = 8;
    }
    return this.settings;
  }
}
