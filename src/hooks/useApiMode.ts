/**
 * Custom Hook: Inspect & Query API Mode (Mock vs Real FastAPI backend)
 */

import { useState } from 'react';
import { APP_CONFIG, isMockMode, isRealApiMode } from '../config/appConfig';
import { screeningApi } from '../api';

export function useApiMode() {
  const [apiMode] = useState<'mock' | 'real'>(screeningApi.getApiMode());

  return {
    apiMode,
    isMock: isMockMode(),
    isReal: isRealApiMode(),
    baseUrl: APP_CONFIG.apiBaseUrl,
    supabaseEnabled: APP_CONFIG.supabase.enabled,
    models: APP_CONFIG.models,
  };
}
