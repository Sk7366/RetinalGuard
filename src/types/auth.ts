/**
 * Authentication and User Role Type Definitions
 */

export type UserRole =
  | 'public'        // Public User / Patient
  | 'patient'       // Common Person / Patient
  | 'helper'        // Screening Helper / Healthcare Team
  | 'technician'    // Screening Technician
  | 'provider'      // Healthcare Provider / Ophthalmologist
  | 'admin'         // Administrator
  | 'researcher';   // Researcher

export type HelperRoleTitle =
  | 'Community Health Worker'
  | 'Screening Technician'
  | 'Nurse'
  | 'Primary Care Provider'
  | 'Ophthalmic Assistant'
  | 'Healthcare Provider'
  | 'Program Coordinator';

export type VerificationStatus = 'verified' | 'pending' | 'rejected' | 'suspended';

export type UserExperience = 'patient' | 'helper' | 'researcher';

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
  experience?: UserExperience;
  helperRoleTitle?: HelperRoleTitle;
  organization?: string;
  location?: string;
  verificationStatus?: VerificationStatus;
  isDemoVerification?: boolean;
  permissions: Permission[];
  clinicId?: string;
  clinicName?: string;
  avatarUrl?: string;
  token?: string;
  voiceGuidanceEnabled?: boolean;
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
