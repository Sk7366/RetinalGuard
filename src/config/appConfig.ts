/**
 * RetinaGuard Application & Environment Configuration
 * Supports Mock Mode vs Real API Mode (FastAPI + ONNX + XGBoost + Supabase/PostgreSQL + Cloud Run)
 */

export type ApiMode = 'mock' | 'real';

export interface AppConfig {
  apiMode: ApiMode;
  apiBaseUrl: string;
  supabase: {
    url: string;
    anonKey: string;
    enabled: boolean;
  };
  models: {
    fundusOnnx: string;
    octOnnx: string;
    metadataXGBoost: string;
    onnxExecutionProvider: string;
  };
  app: {
    name: string;
    version: string;
    environment: string;
    enableGradCam: boolean;
    enableShap: boolean;
    enableVoiceNarration: boolean;
  };
}

// Safely access client-side Vite environment variables
const env = (import.meta as any).env || {};

const rawApiMode = (env.VITE_API_MODE || 'mock').toLowerCase();
const apiMode: ApiMode = rawApiMode === 'real' ? 'real' : 'mock';

export const APP_CONFIG: AppConfig = {
  apiMode,
  apiBaseUrl: env.VITE_API_BASE_URL || '/api/v1',
  supabase: {
    url: env.VITE_SUPABASE_URL || '',
    anonKey: env.VITE_SUPABASE_ANON_KEY || '',
    enabled: Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY),
  },
  models: {
    fundusOnnx: 'fundus_resnet50_dr_v1.onnx',
    octOnnx: 'oct_convnext_v2_v1.onnx',
    metadataXGBoost: 'clinical_xgboost_v1.json',
    onnxExecutionProvider: 'CPUExecutionProvider', // or CUDAExecutionProvider in Cloud Run container with GPU
  },
  app: {
    name: 'RetinaGuard',
    version: '2.4.0',
    environment: env.MODE || 'production',
    enableGradCam: true,
    enableShap: true,
    enableVoiceNarration: true,
  },
};

export const isMockMode = (): boolean => APP_CONFIG.apiMode === 'mock';
export const isRealApiMode = (): boolean => APP_CONFIG.apiMode === 'real';
