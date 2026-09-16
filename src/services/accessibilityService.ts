export type TextSizeOption = 'standard' | 'large' | 'xl';
export type ColorVisionOption = 'default' | 'highContrast' | 'redGreen' | 'blueYellow' | 'monochrome';
export type ThemeModeOption = 'light' | 'dark' | 'system';

export interface AccessibilityConfig {
  textSize: TextSizeOption;
  highContrast: boolean;
  colorVision: ColorVisionOption;
  reduceMotion: boolean;
  readAloud: boolean;
  themeMode: ThemeModeOption;
}

const STORAGE_KEY = 'retinaguard_accessibility_v2';

const DEFAULT_CONFIG: AccessibilityConfig = {
  textSize: 'standard',
  highContrast: false,
  colorVision: 'default',
  reduceMotion: false,
  readAloud: true,
  themeMode: 'light',
};

class AccessibilityService {
  private config: AccessibilityConfig = DEFAULT_CONFIG;
  private listeners: Set<(config: AccessibilityConfig) => void> = new Set();

  constructor() {
    this.load();
  }

  public getConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  public subscribe(listener: (config: AccessibilityConfig) => void): () => void {
    this.listeners.add(listener);
    listener(this.getConfig());
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const current = this.getConfig();
    this.listeners.forEach((fn) => fn(current));
  }

  public load(): AccessibilityConfig {
    if (typeof window === 'undefined') return DEFAULT_CONFIG;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.config = { ...DEFAULT_CONFIG, ...parsed };
      }
    } catch {
      this.config = DEFAULT_CONFIG;
    }
    this.applyToDOM();
    return this.getConfig();
  }

  public update(partial: Partial<AccessibilityConfig>): void {
    this.config = { ...this.config, ...partial };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
      } catch {
        // ignore
      }
    }
    this.applyToDOM();
    this.notify();
  }

  public applyToDOM(): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // 1. Text scale
    root.classList.remove('font-scale-default', 'font-scale-large', 'font-scale-xl');
    if (this.config.textSize === 'large') {
      root.classList.add('font-scale-large');
    } else if (this.config.textSize === 'xl') {
      root.classList.add('font-scale-xl');
    } else {
      root.classList.add('font-scale-default');
    }

    // 2. High Contrast
    if (this.config.highContrast || this.config.colorVision === 'highContrast') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // 3. Color Vision
    root.classList.remove('color-vision-protan', 'color-vision-tritan', 'color-vision-mono');
    if (this.config.colorVision === 'redGreen') {
      root.classList.add('color-vision-protan');
    } else if (this.config.colorVision === 'blueYellow') {
      root.classList.add('color-vision-tritan');
    } else if (this.config.colorVision === 'monochrome') {
      root.classList.add('color-vision-mono');
    }

    // 4. Reduce Motion
    if (this.config.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // 5. Dark Mode
    const isSystemDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark =
      this.config.themeMode === 'dark' ||
      (this.config.themeMode === 'system' && isSystemDark);

    if (shouldBeDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}

export const accessibilityService = new AccessibilityService();
