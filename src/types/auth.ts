/**
 * Authentication and User Role Type Definitions
 */

export type UserRole =
  | 'public'        // Public User / Patient
  | 'technician'    // Screening Technician
  | 'provider'      // Healthcare Provider / Ophthalmologist
  | 'admin'         // Administrator
  | 'researcher';   // Researcher

export type Permission =
  | 'SCREENING_READ'
  | 'SCREENING_CREATE'
  | 'SCREENING_BATCH'
  | 'REFERRAL_READ'
  | 'REFERRAL_UPDATE'
  | 'ANALYTICS_VIEW'
  | 'AUDIT_LOG_VIEW'
  | 'SETTINGS_MANAGE'
  | 'RESEARCH_ABLATION_VIEW';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  clinicId?: string;
  clinicName?: string;
  avatarUrl?: string;
  token?: string;
}

export interface AccessibilitySettings {
  largeText: boolean;
  highContrast: boolean;
  reduceMotion?: boolean;
  offlineMode?: boolean;
  textToSpeech?: boolean;
  liteMode?: boolean;
  language?: string;
}
