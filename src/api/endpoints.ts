/**
 * FastAPI Backend API Route Endpoints
 * Microservice architecture ready for Cloud Run + ONNX Runtime + XGBoost + Supabase/PostgreSQL
 */

export const ENDPOINTS = {
  HEALTH: '/health',
  SCREENINGS: '/screenings',
  SCREENING_DETAIL: (id: string) => `/screenings/${id}`,
  SCREENINGS_QUALITY: '/screenings/quality',
  
  // Model Inference Endpoints
  MODELS: {
    FUNDUS_ONNX: '/models/fundus/onnx',
    OCT_ONNX: '/models/oct/onnx',
    METADATA_XGBOOST: '/models/metadata/xgboost',
    FUSION: '/models/fusion',
  },

  // Closed-Loop Referral Endpoints
  REFERRALS: '/referrals',
  REFERRAL_DETAIL: (id: string) => `/referrals/${id}`,
  REFERRAL_STATUS: (id: string) => `/referrals/${id}/status`,
  REFERRAL_AUDIT_LOG: (id: string) => `/referrals/${id}/audit-trail`,

  // Telemetry & Operations
  ANALYTICS_TODAY: '/analytics/today',
  SCREENING_CENTERS: '/screening-centers',
  BATCH_SCREENINGS: '/batch-screenings',
  AUDIT_EVENTS: '/audit-events',
} as const;
