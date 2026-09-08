/**
 * RetinaGuard Type Definitions
 * Diabetic Retinopathy Multimodal AI Decision Support System
 */

export type DRGrade = 0 | 1 | 2 | 3 | 4;

export interface DRGradeInfo {
  grade: DRGrade;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  action: string;
}

export interface FundusAnalysis {
  grade: DRGrade;
  gradeLabel: string;
  probabilities: [number, number, number, number, number]; // Grade 0..4
  inferenceMs: number;
  camHotspots: Array<{ x: number; y: number; radius: number; label: string; intensity: number }>;
  featuresDetected: string[];
}

export type OCTClass = 'Normal' | 'DME' | 'CNV' | 'Drusen';

export interface OCTAnalysis {
  present: boolean;
  predictedClass: OCTClass;
  dmeDetected: boolean;
  dmeProbability: number;
  classProbabilities: {
    Normal: number;
    DME: number;
    CNV: number;
    Drusen: number;
  };
  inferenceMs: number;
  retinalLayerFindings: string[];
}

export interface ClinicalMetadata {
  hba1c: number; // % (mean 8.2, sd 1.8)
  diabetesDurationYears: number;
  systolicBp: number; // mmHg
  diastolicBp: number; // mmHg
  serumCreatinine: number; // mg/dL
  age: number;
  bmi: number;
  insulinTherapy: boolean;
  priorLaser: boolean;
  visualAcuityLogMar: number;
}

export interface SHAPContribution {
  feature: string;
  featureKey: keyof ClinicalMetadata;
  value: string;
  shapValue: number; // Positive pushes risk higher, negative lower
  impact: 'increases_risk' | 'decreases_risk' | 'neutral';
  clinicalContext: string;
}

export interface MetadataAnalysis {
  provided: boolean;
  predictedGrade: DRGrade;
  riskScore: number; // 0 to 1
  probabilities: [number, number, number, number, number];
  shapValues: SHAPContribution[];
  top3RiskDrivers: string[];
  inferenceMs: number;
  syntheticMode: boolean;
}

export interface MultimodalTriageResult {
  sessionId: string;
  timestamp: string;
  patientId: string;
  patientName?: string;
  fundusImageName: string;
  octImageName?: string;
  fundusImageUrl: string;
  fundusClaheUrl: string;
  fundusCamUrl: string;
  octImageUrl?: string;
  octCamUrl?: string;

  fundus: FundusAnalysis;
  oct: OCTAnalysis;
  metadata: MetadataAnalysis;
  clinicalInput: ClinicalMetadata;

  // Fusion outcomes
  rawFusionScore: number;
  finalGrade: DRGrade;
  gradeLabel: string;
  confidence: 'HIGH' | 'MODERATE';
  dmeEscalationApplied: boolean;
  recommendation: string;
  urgencyLevel: 'routine' | 'moderate' | 'urgent';
  contributingFactors: string[];
  syntheticMode: boolean;
}

export interface AblationExperiment {
  id: number;
  name: string;
  modalities: string;
  fundusIncluded: boolean;
  octIncluded: boolean;
  metadataIncluded: boolean;
  auc: number;
  qwk: number;
  aucDisplay?: string;
  qwkDisplay?: string;
  sensitivitySeverePdr: number;
  latencyMs: number;
  description: string;
}

export interface BenchmarkComparison {
  modelName: string;
  reference: string;
  auc: number;
  qwk: number;
  aucDisplay?: string;
  qwkDisplay?: string;
  dataset: string;
  notes: string;
  isPlaceholder?: boolean;
}

// User & Mode Types
export type AppMode = 'public' | 'provider';

// Image Quality Assessment Types
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

// Audit Trail Record
export interface AuditTrailItem {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  role: string;
  details: string;
}

// Referral Lifecycle Types
export type ReferralStatus =
  | 'Pending'
  | 'Contacted'
  | 'Appointment Booked'
  | 'Specialist Reviewed'
  | 'Follow-up Due'
  | 'Completed';

export type ReferralStage =
  | 'Screened'
  | 'Flagged'
  | 'Referred'
  | 'Appointment'
  | 'Specialist Review'
  | 'Follow-up';

export interface ReferralAuditEvent {
  id: string;
  stage: ReferralStage;
  title: string; // e.g. "Image uploaded", "Quality checked", "AI analysis completed", "Explanation generated", "Provider reviewed", "Referral created"
  timestamp: string;
  actor: string;
  details: string;
  status: 'completed' | 'current' | 'pending';
}

export interface ReferralRecord {
  id: string;
  screeningId: string;
  patientCode: string;
  patientName?: string;
  patientAge: number;
  patientPhone?: string;
  createdAt: string;
  updatedAt: string;
  initialGrade: DRGrade;
  priority: 'Routine' | 'Review Recommended' | 'Priority Specialist Referral' | 'Ungradable Retake';
  status: ReferralStatus;
  currentStage?: ReferralStage;
  dmePresent: boolean;
  assignedClinic: string;
  specialistName?: string;
  appointmentDate?: string;
  clinicalNotes: string;
  followUpTimeline: string;
  auditTrail?: ReferralAuditEvent[];
  isSimulated?: boolean;
}

// Verified Screening Centers
export interface ScreeningCenter {
  id: string;
  name: string;
  city: string;
  state: string;
  pinCode: string;
  address: string;
  distanceKm: number;
  hours: string;
  phone: string;
  services: string[];
  isCampActive: boolean;
  campDates?: string;
}

// Batch Screening Item
export interface BatchScreeningItem {
  id: string;
  filename: string;
  patientCode: string;
  patientAge: number;
  hba1c?: number;
  qualityStatus: QualityStatus;
  predictedGrade?: DRGrade;
  priority: 'Low Concern' | 'Review Recommended' | 'Priority' | 'Ungradable';
  dmeDetected?: boolean;
  processed: boolean;
}

// Accessibility & Platform Settings
export interface AccessibilitySettings {
  largeText: boolean;
  highContrast: boolean;
  reduceMotion?: boolean;
  offlineMode?: boolean;
  textToSpeech?: boolean;
  liteMode?: boolean;
  language?: string;
}

// User Roles in RetinaGuard
export type UserRole =
  | 'public'        // Public User
  | 'technician'    // Screening Technician
  | 'provider'      // Healthcare Provider
  | 'admin'         // Administrator
  | 'researcher';   // Researcher

// Public Navigation Routes
export type PublicRoute =
  | 'get-screened'        // "Get your retina screened"
  | 'find-screening'      // "Find Screening Near Me"
  | 'learn'               // "Learn About Screening"
  | 'explore-demo'        // "Explore Demo"
  | 'overview'
  | 'how-it-helps'
  | 'research';

// Provider Navigation Routes
export type ProviderRoute =
  | 'dashboard'           // Provider Dashboard
  | 'camp-mode'           // Screening Camp Mode
  | 'start-screening'     // Start Screening
  | 'review-queue'        // Review Queue
  | 'batch-screening'     // Batch Screening Architecture
  | 'referrals'           // Referrals
  | 'analytics'           // Analytics
  | 'screenings'
  | 'cases'
  | 'research'
  | 'technology'          // Tech & Research Architecture
  | 'settings';           // Workspace Settings


