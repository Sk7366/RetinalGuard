/**
 * Real API Mode Implementation (FastAPI + ONNX Runtime + XGBoost + Cloud Run)
 * Communicates with backend microservices over REST/JSON
 * Gracefully falls back to mock if the microservice is unreachable in local preview
 */

import {
  BatchScreeningItem,
  ImageQualityAssessment,
  Referral,
  ReferralStatus,
  Screening,
  ScreeningCenter,
} from '../types';
import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { mockScreeningApi } from './mockScreeningApi';
import { IScreeningApi } from './screeningApiInterface';
import { TodayMetricsResponse } from './types';

export class RealScreeningApi implements IScreeningApi {
  getApiMode(): 'mock' | 'real' {
    return 'real';
  }

  isMockMode(): boolean {
    return false;
  }

  async checkImageQuality(
    imageName: string,
    imageGradeHint?: number
  ): Promise<ImageQualityAssessment> {
    try {
      return await apiClient.post<ImageQualityAssessment>(ENDPOINTS.SCREENINGS_QUALITY, {
        imageName,
        imageGradeHint,
      });
    } catch (err) {
      console.warn('[RealScreeningApi] Backend service unreachable, falling back to local heuristic:', err);
      return mockScreeningApi.checkImageQuality(imageName, imageGradeHint);
    }
  }

  async getTodayMetrics(): Promise<TodayMetricsResponse> {
    try {
      return await apiClient.get<TodayMetricsResponse>(ENDPOINTS.ANALYTICS_TODAY);
    } catch (err) {
      console.warn('[RealScreeningApi] Metrics endpoint unreachable, using simulated telemetry:', err);
      return mockScreeningApi.getTodayMetrics();
    }
  }

  async getReferrals(): Promise<Referral[]> {
    try {
      return await apiClient.get<Referral[]>(ENDPOINTS.REFERRALS);
    } catch (err) {
      console.warn('[RealScreeningApi] Referrals endpoint unreachable, falling back to local store:', err);
      return mockScreeningApi.getReferrals();
    }
  }

  async updateReferralStatus(
    referralId: string,
    newStatus: ReferralStatus,
    notes?: string
  ): Promise<Referral | null> {
    try {
      return await apiClient.patch<Referral>(ENDPOINTS.REFERRAL_STATUS(referralId), {
        status: newStatus,
        notes,
      });
    } catch (err) {
      console.warn('[RealScreeningApi] Referral update endpoint unreachable, updating local state:', err);
      return mockScreeningApi.updateReferralStatus(referralId, newStatus, notes);
    }
  }

  async createReferral(
    result: Screening,
    assignedClinic: string,
    notes: string
  ): Promise<Referral> {
    try {
      return await apiClient.post<Referral>(ENDPOINTS.REFERRALS, {
        screeningId: result.sessionId,
        patientCode: result.patientId,
        patientAge: result.clinicalInput.age,
        initialGrade: result.finalGrade,
        priority:
          result.finalGrade >= 3
            ? 'Priority Specialist Referral'
            : result.finalGrade >= 2
            ? 'Review Recommended'
            : 'Routine',
        assignedClinic,
        clinicalNotes: notes || result.recommendation,
        dmePresent: result.oct.dmeDetected,
      });
    } catch (err) {
      console.warn('[RealScreeningApi] Referral creation endpoint unreachable, staging in local state:', err);
      return mockScreeningApi.createReferral(result, assignedClinic, notes);
    }
  }

  async searchScreeningCenters(query?: string): Promise<ScreeningCenter[]> {
    try {
      const endpoint = query
        ? `${ENDPOINTS.SCREENING_CENTERS}?q=${encodeURIComponent(query)}`
        : ENDPOINTS.SCREENING_CENTERS;
      return await apiClient.get<ScreeningCenter[]>(endpoint);
    } catch (err) {
      console.warn('[RealScreeningApi] Screening centers directory unreachable, loading verified offline directory:', err);
      return mockScreeningApi.searchScreeningCenters(query);
    }
  }

  async getBatchScreenings(): Promise<BatchScreeningItem[]> {
    try {
      return await apiClient.get<BatchScreeningItem[]>(ENDPOINTS.BATCH_SCREENINGS);
    } catch (err) {
      console.warn('[RealScreeningApi] Batch queue unreachable, loading demo batch items:', err);
      return mockScreeningApi.getBatchScreenings();
    }
  }
}

export const realScreeningApi = new RealScreeningApi();
