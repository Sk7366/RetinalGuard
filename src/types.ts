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
