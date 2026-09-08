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
  MultimodalTriageResult,
  ReferralRecord,
  ReferralStatus,
  ScreeningCenter,
} from '../types';

// Detect API Mode: 'mock' by default, or 'real' when configured
const API_MODE = ((import.meta as any).env?.VITE_API_MODE || 'mock').toLowerCase();

export const screeningApi = {
  getApiMode(): string {
    return API_MODE;
  },

  isMockMode(): boolean {
    return API_MODE === 'mock';
  },

  /**
   * Assess fundus image quality before running AI models
   */
  async checkImageQuality(
    imageName: string,
    imageGradeHint?: number
  ): Promise<ImageQualityAssessment> {
    if (!this.isMockMode()) {
      try {
        const res = await fetch('/api/v1/screenings/quality', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageName, imageGradeHint }),
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Fallback to mock quality check:', err);
      }
    }

    // Mock Quality Heuristic
    await new Promise((r) => setTimeout(r, 450));
    const lowerName = imageName.toLowerCase();
    if (lowerName.includes('blur') || lowerName.includes('poor')) {
      return MOCK_QUALITY_PRESETS.uncertain_blur;
    }
    if (lowerName.includes('glare') || lowerName.includes('dark') || lowerName.includes('artifact')) {
      return MOCK_QUALITY_PRESETS.ungradable_glare_dark;
    }
    return MOCK_QUALITY_PRESETS.good;
  },

  /**
   * Fetch today's screening statistics for healthcare providers
   */
  async getTodayMetrics() {
    if (!this.isMockMode()) {
      try {
        const res = await fetch('/api/v1/analytics/today');
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Fallback to simulated metrics:', err);
      }
    }
    await new Promise((r) => setTimeout(r, 200));
    return SIMULATED_TODAY_METRICS;
  },

  /**
   * Fetch active referral queue
   */
  async getReferrals(): Promise<ReferralRecord[]> {
    if (!this.isMockMode()) {
      try {
        const res = await fetch('/api/v1/referrals');
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Fallback to mock referrals:', err);
      }
    }
    await new Promise((r) => setTimeout(r, 250));
    return [...MOCK_REFERRAL_QUEUE];
  },

  /**
   * Update a referral's status in the closed-loop tracking pipeline
   */
  async updateReferralStatus(
    referralId: string,
    newStatus: ReferralStatus,
    notes?: string
  ): Promise<ReferralRecord | null> {
    if (!this.isMockMode()) {
      try {
        const res = await fetch(`/api/v1/referrals/${referralId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus, notes }),
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Fallback to local referral update:', err);
      }
    }

    const found = MOCK_REFERRAL_QUEUE.find((r) => r.id === referralId);
    if (found) {
      found.status = newStatus;
      found.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
      if (notes) found.clinicalNotes += ` | Update: ${notes}`;
      return { ...found };
    }
    return null;
  },

  /**
   * Create a new specialist referral
   */
  async createReferral(
    result: MultimodalTriageResult,
    assignedClinic: string,
    notes: string
  ): Promise<ReferralRecord> {
    const newRef: ReferralRecord = {
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
    };

    MOCK_REFERRAL_QUEUE.unshift(newRef);
    return newRef;
  },

  /**
   * Search nearby screening centers by location or query
   */
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
  },

  /**
   * Get batch screening demonstration list
   */
  async getBatchScreenings(): Promise<BatchScreeningItem[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...MOCK_BATCH_SCREENINGS];
  },
};
