/**
 * Screening API Interface Contract
 * Enables zero-friction switching between MOCK MODE and REAL API MODE (FastAPI + Cloud Run)
 */

import {
  BatchScreeningItem,
  ImageQualityAssessment,
  Referral,
  ReferralStatus,
  Screening,
  ScreeningCenter,
} from '../types';
import { TodayMetricsResponse } from './types';

export interface IScreeningApi {
  getApiMode(): 'mock' | 'real';
  isMockMode(): boolean;

  /**
   * Assess fundus image quality using deep learning/heuristics
   */
  checkImageQuality(
    imageName: string,
    imageGradeHint?: number
  ): Promise<ImageQualityAssessment>;

  /**
   * Fetch daily aggregated screening metrics for dashboard
   */
  getTodayMetrics(): Promise<TodayMetricsResponse>;

  /**
   * Fetch active referrals for ophthalmologist closed-loop management
   */
  getReferrals(): Promise<Referral[]>;

  /**
   * Update referral tracking state
   */
  updateReferralStatus(
    referralId: string,
    newStatus: ReferralStatus,
    notes?: string
  ): Promise<Referral | null>;

  /**
   * Create a new specialist referral record
   */
  createReferral(
    result: Screening,
    assignedClinic: string,
    notes: string
  ): Promise<Referral>;

  /**
   * Search nearby certified screening centers / camps
   */
  searchScreeningCenters(query?: string): Promise<ScreeningCenter[]>;

  /**
   * Fetch offline batch triage items
   */
  getBatchScreenings(): Promise<BatchScreeningItem[]>;
}
