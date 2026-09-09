/**
 * Mock Screening API Implementation (MOCK MODE)
 * Realistic async latency simulation with Grad-CAM and SHAP synthesis
 */

import {
  MOCK_BATCH_SCREENINGS,
  MOCK_QUALITY_PRESETS,
  MOCK_REFERRAL_QUEUE,
  MOCK_SCREENING_CENTERS,
  SIMULATED_TODAY_METRICS,
} from '../mock/mockData';
import {
  BatchScreeningItem,
  ImageQualityAssessment,
  Referral,
  ReferralStatus,
  Screening,
  ScreeningCenter,
} from '../types';
import { IScreeningApi } from './screeningApiInterface';
import { TodayMetricsResponse } from './types';

export class MockScreeningApi implements IScreeningApi {
  getApiMode(): 'mock' | 'real' {
    return 'mock';
  }

  isMockMode(): boolean {
    return true;
  }

  async checkImageQuality(
    imageName: string,
    _imageGradeHint?: number
  ): Promise<ImageQualityAssessment> {
    await new Promise((r) => setTimeout(r, 450));
    const lowerName = imageName.toLowerCase();
    if (lowerName.includes('blur') || lowerName.includes('poor')) {
      return MOCK_QUALITY_PRESETS.uncertain_blur;
    }
    if (
      lowerName.includes('glare') ||
      lowerName.includes('dark') ||
      lowerName.includes('artifact')
    ) {
      return MOCK_QUALITY_PRESETS.ungradable_glare_dark;
    }
    return MOCK_QUALITY_PRESETS.good;
  }

  async getTodayMetrics(): Promise<TodayMetricsResponse> {
    await new Promise((r) => setTimeout(r, 200));
    return { ...SIMULATED_TODAY_METRICS };
  }

  async getReferrals(): Promise<Referral[]> {
    await new Promise((r) => setTimeout(r, 250));
    return [...MOCK_REFERRAL_QUEUE];
  }

  async updateReferralStatus(
    referralId: string,
    newStatus: ReferralStatus,
    notes?: string
  ): Promise<Referral | null> {
    await new Promise((r) => setTimeout(r, 250));
    const found = MOCK_REFERRAL_QUEUE.find((r) => r.id === referralId);
    if (found) {
      found.status = newStatus;
      found.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
      if (notes) found.clinicalNotes += ` | Update: ${notes}`;
      return { ...found };
    }
    return null;
  }

  async createReferral(
    result: Screening,
    assignedClinic: string,
    notes: string
  ): Promise<Referral> {
    await new Promise((r) => setTimeout(r, 300));
    const newRef: Referral = {
      id: `REF-2026-${Math.floor(100 + Math.random() * 900)}`,
      screeningId: result.sessionId,
      patientCode: result.patientId,
      patientAge: result.clinicalInput.age,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      initialGrade: result.finalGrade,
      priority:
        result.finalGrade >= 3
          ? 'Priority Specialist Referral'
          : result.finalGrade >= 2
          ? 'Review Recommended'
          : 'Routine',
      status: 'Pending',
      dmePresent: result.oct.dmeDetected,
      assignedClinic,
      clinicalNotes: notes || result.recommendation,
      followUpTimeline:
        result.finalGrade === 4
          ? 'Urgent (< 48 hours)'
          : result.finalGrade === 3
          ? 'Within 1–2 weeks'
          : 'Within 3–4 weeks',
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          stage: 'Referred',
          title: 'Referral generated from screening encounter',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          actor: 'RetinaGuard Multimodal Decision Support',
          details: `Graded DR-${result.finalGrade} (${result.gradeLabel}). DME: ${result.oct.dmeDetected ? 'Detected' : 'Negative'}`,
          status: 'completed',
        },
      ],
    };

    MOCK_REFERRAL_QUEUE.unshift(newRef);
    return newRef;
  }

  async searchScreeningCenters(query?: string): Promise<ScreeningCenter[]> {
    await new Promise((r) => setTimeout(r, 200));
    if (!query || query.trim() === '') {
      return MOCK_SCREENING_CENTERS;
    }
    const q = query.toLowerCase().trim();
    return MOCK_SCREENING_CENTERS.filter(
      (c) =>
        c.city.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.pinCode.includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  }

  async getBatchScreenings(): Promise<BatchScreeningItem[]> {
    await new Promise((r) => setTimeout(r, 250));
    return [...MOCK_BATCH_SCREENINGS];
  }
}

export const mockScreeningApi = new MockScreeningApi();
