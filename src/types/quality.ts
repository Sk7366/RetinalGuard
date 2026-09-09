/**
 * Image Quality Assessment Type Definitions
 */

export type QualityStatus = 'GOOD' | 'UNCERTAIN' | 'UNGRADABLE';

export interface QualityIssue {
  id: string;
  name: string;
  detected: boolean;
  severity: 'low' | 'moderate' | 'high';
  description: string;
  guidance: string;
}

export interface ImageQualityAssessment {
  status: QualityStatus;
  overallScore: number; // 0 to 100
  isSuitableForAi: boolean;
  issues: QualityIssue[];
  primaryGuidance: string;
  retakeRecommended: boolean;
  metrics: {
    sharpness: number; // 0-100
    illumination: number; // 0-100
    glareIndex: number; // 0-100 (lower is better)
    fieldCoverage: number; // 0-100
    contrast: number; // 0-100
  };
}
