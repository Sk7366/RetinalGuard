import { APP_CONFIG } from '../config/appConfig';

export type TextSizeOption = 'standard' | 'large' | 'xl';
export type ColorVisionOption = 'default' | 'redGreen' | 'blueYellow' | 'monochrome';
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
const USER_STORAGE_KEY = 'retinaguard_auth_user';

export const TEXT_SIZE_SCALES: Record<TextSizeOption, { scale: number; rootPx: number; label: string }> = {
  standard: { scale: 1.0, rootPx: 16, label: 'Default' },
  large: { scale: 1.25, rootPx: 20, label: 'Large' },
  xl: { scale: 1.50, rootPx: 24, label: 'Extra Large' },
};

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
  private systemDarkListenerAttached = false;
  private systemMotionListenerAttached = false;

  constructor() {
    this.load();
    this.setupSystemListeners();
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

  /**
   * Load stored settings from localStorage and user profile
   */
  public load(): AccessibilityConfig {
    if (typeof window === 'undefined') return DEFAULT_CONFIG;
    try {
      // 1. Check guest / global accessibility storage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.config = { ...DEFAULT_CONFIG, ...parsed };
      }

      // 2. Check if authenticated user has saved accessibility preferences
      const rawUser = localStorage.getItem(USER_STORAGE_KEY);
      if (rawUser) {
        const user = JSON.parse(rawUser);
        if (user?.preferences?.accessibility) {
          this.config = { ...this.config, ...user.preferences.accessibility };
        }
      }

      // 3. Fallback to system preferences for motion if not previously set
      if (
        typeof window !== 'undefined' &&
        window.matchMedia &&
        !stored
      ) {
        const systemPrefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (systemPrefersReduced) {
          this.config.reduceMotion = true;
        }
      }
    } catch {
      this.config = DEFAULT_CONFIG;
    }

    this.applyToDOM();
    return this.getConfig();
  }

  /**
   * Update configuration and persist across guests & authenticated user profiles
   */
  public update(partial: Partial<AccessibilityConfig>): void {
    this.config = { ...this.config, ...partial };

    if (typeof window !== 'undefined') {
      // 1. Persist for guests in localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
      } catch {
        // ignore
      }

      // 2. Persist in authenticated user profile
      try {
        const rawUser = localStorage.getItem(USER_STORAGE_KEY);
        if (rawUser) {
          const user = JSON.parse(rawUser);
          user.preferences = {
            ...(user.preferences || {}),
            accessibility: this.config,
          };
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        }
      } catch {
        // ignore
      }

      // 3. Sync to Supabase user_preferences table if Supabase is enabled
      this.syncToSupabase(this.config);
    }

    this.applyToDOM();
    this.notify();
  }

  /**
   * Asynchronously sync preferences with Supabase backend table if configured
   */
  private async syncToSupabase(config: AccessibilityConfig): Promise<void> {
    try {
      if (
        typeof window === 'undefined' ||
        !APP_CONFIG?.supabase?.enabled ||
        !APP_CONFIG?.supabase?.url ||
        !APP_CONFIG?.supabase?.anonKey
      ) {
        return;
      }

      const rawUser = localStorage.getItem(USER_STORAGE_KEY);
      if (!rawUser) return;
      const user = JSON.parse(rawUser);
      if (!user?.id || user.id === 'guest-patient' || user.id === 'guest-public') return;

      const endpoint = `${APP_CONFIG.supabase.url}/rest/v1/user_preferences`;
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': APP_CONFIG.supabase.anonKey,
          'Authorization': `Bearer ${user.token || APP_CONFIG.supabase.anonKey}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          user_id: user.id,
          accessibility: config,
          updated_at: new Date().toISOString(),
        }),
      }).catch(() => {
        // Silent catch: Supabase may not have the table created yet in mock mode
      });
    } catch {
      // Ignore network / sync errors
    }
  }

  /**
   * Attach reactive OS-level media query listeners
   */
  private setupSystemListeners(): void {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    // Dark mode OS listener
    if (!this.systemDarkListenerAttached) {
      const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)');
      darkModeMedia.addEventListener('change', () => {
        if (this.config.themeMode === 'system') {
          this.applyToDOM();
          this.notify();
        }
      });
      this.systemDarkListenerAttached = true;
    }

    // Reduced motion OS listener
    if (!this.systemMotionListenerAttached) {
      const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
      motionMedia.addEventListener('change', (e) => {
        // Only react if user has not stored an explicit choice
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          this.config.reduceMotion = e.matches;
          this.applyToDOM();
          this.notify();
        }
      });
      this.systemMotionListenerAttached = true;
    }
  }

  /**
   * Apply all accessibility tokens and CSS variables to the document
   */
  public applyToDOM(): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // 1. Text Scale Token System (Default = 1, Large = 1.15, Extra Large = 1.30)
    const scaleMeta = TEXT_SIZE_SCALES[this.config.textSize] || TEXT_SIZE_SCALES.standard;
    root.style.setProperty('--font-scale', scaleMeta.scale.toString());
    root.style.setProperty('--font-scale-factor', scaleMeta.scale.toString());
    root.style.fontSize = `${scaleMeta.rootPx}px`;

    root.classList.remove('font-scale-default', 'font-scale-large', 'font-scale-xl');
    if (this.config.textSize === 'large') {
      root.classList.add('font-scale-large');
      root.setAttribute('data-text-size', 'large');
    } else if (this.config.textSize === 'xl') {
      root.classList.add('font-scale-xl');
      root.setAttribute('data-text-size', 'xl');
    } else {
      root.classList.add('font-scale-default');
      root.setAttribute('data-text-size', 'standard');
    }

    // 2. High Contrast
    if (this.config.highContrast) {
      root.classList.add('high-contrast');
      root.setAttribute('data-contrast', 'high');
    } else {
      root.classList.remove('high-contrast');
      root.removeAttribute('data-contrast');
    }

    // 3. Color Vision (Default, Red-Green Friendly, Blue-Yellow Friendly, Monochrome)
    root.classList.remove(
      'color-vision-default',
      'color-vision-protan',
      'color-vision-tritan',
      'color-vision-mono',
      'color-vision-redgreen',
      'color-vision-blueyellow'
    );

    if (this.config.colorVision === 'redGreen') {
      root.classList.add('color-vision-protan', 'color-vision-redgreen');
      root.setAttribute('data-color-vision', 'redGreen');
    } else if (this.config.colorVision === 'blueYellow') {
      root.classList.add('color-vision-tritan', 'color-vision-blueyellow');
      root.setAttribute('data-color-vision', 'blueYellow');
    } else if (this.config.colorVision === 'monochrome') {
      root.classList.add('color-vision-mono');
      root.setAttribute('data-color-vision', 'monochrome');
    } else {
      root.classList.add('color-vision-default');
      root.setAttribute('data-color-vision', 'default');
    }

    // 4. Reduce Motion
    if (this.config.reduceMotion) {
      root.classList.add('reduce-motion');
      root.setAttribute('data-reduce-motion', 'true');
    } else {
      root.classList.remove('reduce-motion');
      root.setAttribute('data-reduce-motion', 'false');
    }

    // 5. Dark Mode (Light, Dark, System)
    const isSystemDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark =
      this.config.themeMode === 'dark' ||
      (this.config.themeMode === 'system' && isSystemDark);

    if (shouldBeDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }
}

export const accessibilityService = new AccessibilityService();

