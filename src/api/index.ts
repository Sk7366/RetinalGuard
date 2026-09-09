/**
 * API Package Index
 * Auto-selects MOCK MODE vs REAL API MODE (FastAPI + ONNX + XGBoost + Supabase/PostgreSQL + Cloud Run)
 */

import { APP_CONFIG } from '../config/appConfig';
import { mockScreeningApi } from './mockScreeningApi';
import { realScreeningApi } from './realScreeningApi';
import { IScreeningApi } from './screeningApiInterface';

export * from './client';
export * from './endpoints';
export * from './screeningApiInterface';
export * from './types';
export * from './mockScreeningApi';
export * from './realScreeningApi';

/**
 * Primary Screening API instance honoring environment configuration
 */
export const screeningApi: IScreeningApi =
  APP_CONFIG.apiMode === 'real' ? realScreeningApi : mockScreeningApi;
