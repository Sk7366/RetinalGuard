/**
 * API Request & Response Types for FastAPI Backend
 */

import {
  BatchScreeningItem,
  ClinicalMetadata,
  FundusResult,
  ImageQualityAssessment,
  MetadataResult,
  OCTResult,
  Referral,
  ReferralStatus,
  Screening,
  ScreeningCenter,
} from '../types';

export interface QualityCheckRequest {
  imageName: string;
  imageGradeHint?: number;
  imageBase64?: string;
}

export interface TodayMetricsResponse {
  totalScreened: number;
  lowConcern: number;
  reviewRecommended: number;
  priorityReferral: number;
  ungradable: number;
  syncPending: number;
  averageInferenceSeconds: number;
  activeCampName: string;
}

export interface FundusInferenceRequest {
  imageName: string;
  imageBase64?: string;
  clahePreprocess?: boolean;
}

export interface OCTInferenceRequest {
  imageName: string;
  imageBase64?: string;
}

export interface MetadataInferenceRequest {
  clinicalInput: ClinicalMetadata;
}

export interface ScreeningInferenceRequest {
  patientId: string;
  patientName?: string;
  fundusImageName: string;
  octImageName?: string;
  fundusImageUrl: string;
  octImageUrl?: string;
  clinicalInput: ClinicalMetadata;
}

export interface CreateReferralRequest {
  screeningId: string;
  patientCode: string;
  patientAge: number;
  initialGrade: number;
  priority: string;
  assignedClinic: string;
  clinicalNotes: string;
  dmePresent: boolean;
}

export interface UpdateReferralStatusRequest {
  status: ReferralStatus;
  notes?: string;
  actor?: string;
}
