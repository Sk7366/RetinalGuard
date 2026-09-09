/**
 * RetinaGuard Domain Type Definitions
 * Typed interfaces for Screening, Fundus, OCT, Metadata, Fusion, Referral, User, AuditEvent
 * Ready for FastAPI + ONNX Runtime + XGBoost + Supabase/PostgreSQL
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

/**
 * Fundus Photography Analysis Result (ResNet50/DINOv2 ONNX Model)
 */
export interface FundusResult {
  grade: DRGrade;
  gradeLabel: string;
  probabilities: [number, number, number, number, number]; // Grade 0..4
  inferenceMs: number;
  camHotspots: Array<{ x: number; y: number; radius: number; label: string; intensity: number }>;
  featuresDetected: string[];
  modelArchitecture?: string; // e.g. "ResNet50-DINOv2 (ONNX Runtime)"
  modelVersion?: string;
  onnxExecutionProvider?: 'CPUExecutionProvider' | 'CUDAExecutionProvider' | 'TensorrtExecutionProvider';
}
export type FundusAnalysis = FundusResult;

export type OCTClass = 'Normal' | 'DME' | 'CNV' | 'Drusen';

/**
 * OCT Cross-Sectional Analysis Result (ConvNeXt-V2 ONNX Model)
 */
export interface OCTResult {
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
  modelArchitecture?: string; // e.g. "ConvNeXt-V2 (ONNX Runtime)"
  centralSubfieldThicknessUm?: number; // Macular thickness in microns
}
export type OCTAnalysis = OCTResult;

/**
 * Structured Clinical Laboratory & Metadata Input
 */
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

/**
 * Clinical Metadata Analysis Result (XGBoost + SHAP Explainer)
 */
export interface MetadataResult {
  provided: boolean;
  predictedGrade: DRGrade;
  riskScore: number; // 0 to 1
  probabilities: [number, number, number, number, number];
  shapValues: SHAPContribution[];
  top3RiskDrivers: string[];
  inferenceMs: number;
  syntheticMode: boolean;
  modelArchitecture?: string; // e.g. "XGBoost Classifier v2.1.0"
}
export type MetadataAnalysis = MetadataResult;

/**
 * Multimodal Fusion Result (Cross-Attention or Hierarchical Decision Matrix)
 */
export interface FusionResult {
  rawFusionScore: number;
  finalGrade: DRGrade;
  gradeLabel: string;
  confidence: 'HIGH' | 'MODERATE';
  dmeEscalationApplied: boolean;
  recommendation: string;
  urgencyLevel: 'routine' | 'moderate' | 'urgent';
  contributingFactors: string[];
  syntheticMode: boolean;
  fusionStrategy?: 'cross_attention_mlp' | 'hierarchical_rule_matrix';
  concordanceScore?: number;
}

/**
 * Complete Screening Encounter Record (Supabase/PostgreSQL schema ready)
 */
export interface Screening {
  id?: string; // Primary key (UUID in Supabase / PostgreSQL)
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

  // Modality inference outcomes
  fundus: FundusResult;
  oct: OCTResult;
  metadata: MetadataResult;
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

  // Cloud Run / Supabase metadata
  syncStatus?: 'synced' | 'local_only' | 'pending';
  createdAt?: string;
  updatedAt?: string;
}
export type MultimodalTriageResult = Screening;

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

/**
 * Audit Event for compliance and closed-loop provenance
 */
export interface AuditEvent {
  id: string;
  stage?: ReferralStage;
  title: string;
  timestamp: string;
  actor: string;
  role?: string;
  details: string;
  status?: 'completed' | 'current' | 'pending';
  action?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}
export type ReferralAuditEvent = AuditEvent;
export type AuditTrailItem = AuditEvent;

/**
 * Closed-Loop Referral Record (Supabase/PostgreSQL schema ready)
 */
export interface Referral {
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
  auditTrail?: AuditEvent[];
  isSimulated?: boolean;
}
export type ReferralRecord = Referral;

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

export interface ScreeningCenter {
  id: string;
  name: string;
  city: string;
  state: string;
  pinCode: string;
  address: string;
  distanceKm: number;
  distance?: string;
  hours: string;
  operatingHours?: string;
  phone: string;
  contactPhone?: string;
  type?: 'phc' | 'camp' | 'hospital' | string;
  services: string[];
  isCampActive: boolean;
  campDates?: string;
}

export interface BatchScreeningItem {
  id: string;
  filename: string;
  patientCode: string;
  patientAge: number;
  hba1c?: number;
  qualityStatus: 'GOOD' | 'UNCERTAIN' | 'UNGRADABLE';
  predictedGrade?: DRGrade;
  priority: 'Low Concern' | 'Review Recommended' | 'Priority' | 'Ungradable';
  dmeDetected?: boolean;
  processed: boolean;
}

export interface ReviewQueueItem {
  id: string;
  patientCode: string;
  patientName: string;
  patientAge: number;
  gender: string;
  encounterDate: string;
  facility: string;
  qualityStatus: 'GOOD' | 'UNCERTAIN' | 'UNGRADABLE';
  fundusGrade: DRGrade;
  finalGrade: DRGrade;
  dmeDetected: boolean;
  confidence: 'HIGH' | 'MODERATE' | 'LOW';
  status: 'Pending' | 'Approved' | 'Overridden' | 'Referred' | 'Retake Requested';
  reviewerNotes?: string;
  triageResult: Screening;
  uncertaintyState?: ResponsibleAiUncertaintyState;
}
export type QueueItem = ReviewQueueItem;

/**
 * Responsible AI / Uncertainty Capability
 * Communicates that AI does not always have sufficient evidence.
 * Explicitly avoids misleading numerical confidence percentages.
 */
export type ResponsibleAiUncertaintyState =
  | 'CONFIDENT ENOUGH FOR SCREENING SUPPORT'
  | 'HUMAN REVIEW RECOMMENDED'
  | 'IMAGE UNGRADABLE'
  | 'MODALITY DISAGREEMENT';

export interface UncertaintyEvidenceFactor {
  label: string;
  status: 'pass' | 'caution' | 'fail';
  detail: string;
}

export interface ResponsibleAiUncertaintyEvaluation {
  state: ResponsibleAiUncertaintyState;
  shortStatus: string;
  badgeLabel: string;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  iconName: 'ShieldCheck' | 'UserCheck' | 'EyeOff' | 'GitCompare';
  primaryRationale: string;
  clinicalAction: string;
  evidenceFactors: UncertaintyEvidenceFactor[];
  qualityPassed: boolean;
  concordanceStatus: 'Concordant' | 'Mild Divergence' | 'Discordant';
  reviewRecommended: boolean;
  quoteMessage: string;
}
