import { DR_GRADES } from '../data/benchmarks';
import {
  ClinicalMetadata,
  DRGrade,
  FundusAnalysis,
  MetadataAnalysis,
  MultimodalTriageResult,
  OCTAnalysis,
  SHAPContribution,
} from '../types';

/**
 * Predict clinical metadata risk using XGBoost surrogate logic
 * (Interpreted via SHAP feature attribution based on DCCT/UKPDS distributions)
 */
export function predictMetadataRisk(metadata: ClinicalMetadata): MetadataAnalysis {
  const {
    hba1c,
    diabetesDurationYears,
    systolicBp,
    serumCreatinine,
    age,
    insulinTherapy,
    priorLaser,
    visualAcuityLogMar,
  } = metadata;

  // Compute baseline log-odds of retinopathy
  let logOdds = -2.8;

  // HbA1c contribution (mean 8.2, sd 1.8)
  const hba1cDiff = hba1c - 7.0;
  const hba1cShap = +(hba1cDiff * 0.45).toFixed(2);
  logOdds += hba1cShap;

  // Duration contribution (approx 0.08 per year over 5)
  const durationDiff = diabetesDurationYears - 5;
  const durationShap = +(Math.max(-0.4, durationDiff * 0.07)).toFixed(2);
  logOdds += durationShap;

  // Systolic BP contribution
  const bpDiff = systolicBp - 130;
  const bpShap = +(bpDiff * 0.015).toFixed(2);
  logOdds += bpShap;

  // Serum creatinine (normal ~0.9, high >1.2)
  const crDiff = serumCreatinine - 1.0;
  const crShap = +(crDiff * 0.35).toFixed(2);
  logOdds += crShap;

  // Prior laser is a strong prior for Grade 3/4
  const laserShap = priorLaser ? 0.65 : -0.05;
  logOdds += laserShap;

  // Insulin use
  const insulinShap = insulinTherapy ? 0.25 : -0.10;
  logOdds += insulinShap;

  // Age & VA
  const vaShap = +(visualAcuityLogMar * 0.4).toFixed(2);
  logOdds += vaShap;

  // Map to probability
  const riskProb = 1 / (1 + Math.exp(-logOdds));

  // Determine predicted grade (0..4)
  let predictedGrade: DRGrade = 0;
  let probs: [number, number, number, number, number] = [0.9, 0.08, 0.02, 0.0, 0.0];

  if (riskProb < 0.20) {
    predictedGrade = 0;
    probs = [0.88, 0.09, 0.02, 0.01, 0.00];
  } else if (riskProb < 0.45) {
    predictedGrade = 1;
    probs = [0.12, 0.72, 0.12, 0.03, 0.01];
  } else if (riskProb < 0.70) {
    predictedGrade = 2;
    probs = [0.03, 0.15, 0.68, 0.12, 0.02];
  } else if (riskProb < 0.88) {
    predictedGrade = 3;
    probs = [0.01, 0.03, 0.14, 0.72, 0.10];
  } else {
    predictedGrade = 4;
    probs = [0.00, 0.01, 0.04, 0.18, 0.77];
  }

  // Generate explainable SHAP records
  const shapList: SHAPContribution[] = [
    {
      feature: `HbA1c (${hba1c}%)`,
      featureKey: 'hba1c',
      value: `${hba1c}%`,
      shapValue: hba1cShap,
      impact: hba1cShap > 0.05 ? 'increases_risk' : hba1cShap < -0.05 ? 'decreases_risk' : 'neutral',
      clinicalContext:
        hba1c > 8.0
          ? 'Glycemic toxicity accelerates basement membrane thickening and pericyte apoptosis'
          : 'Favorable glycemic control preserves retinal capillary wall integrity',
    },
    {
      feature: `Duration (${diabetesDurationYears} yrs)`,
      featureKey: 'diabetesDurationYears',
      value: `${diabetesDurationYears} yrs`,
      shapValue: durationShap,
      impact: durationShap > 0.05 ? 'increases_risk' : durationShap < -0.05 ? 'decreases_risk' : 'neutral',
      clinicalContext:
        diabetesDurationYears > 10
          ? 'Prolonged disease duration strongly compounds microvascular shear stress'
          : 'Short disease latency limits cumulative endothelial exposure',
    },
    {
      feature: `Systolic BP (${systolicBp} mmHg)`,
      featureKey: 'systolicBp',
      value: `${systolicBp} mmHg`,
      shapValue: bpShap,
      impact: bpShap > 0.05 ? 'increases_risk' : bpShap < -0.05 ? 'decreases_risk' : 'neutral',
      clinicalContext:
        systolicBp > 140
          ? 'Hypertension elevates hydrostatic perfusion pressure leading to exudation'
          : 'Controlled arterial pressure protects capillary lumen geometry',
    },
    {
      feature: `Serum Creatinine (${serumCreatinine} mg/dL)`,
      featureKey: 'serumCreatinine',
      value: `${serumCreatinine} mg/dL`,
      shapValue: crShap,
      impact: crShap > 0.05 ? 'increases_risk' : crShap < -0.05 ? 'decreases_risk' : 'neutral',
      clinicalContext:
        serumCreatinine > 1.2
          ? 'Renal microangiopathy correlates closely with breakdown of blood-retinal barrier'
          : 'Normal renal clearance reflects preserved microcirculatory beds',
    },
    {
      feature: `Prior Laser Photocoagulation`,
      featureKey: 'priorLaser',
      value: priorLaser ? 'Yes' : 'No',
      shapValue: laserShap,
      impact: laserShap > 0.05 ? 'increases_risk' : 'decreases_risk',
      clinicalContext: priorLaser
        ? 'History of laser confirms previous high-risk ischemic or proliferative DR'
        : 'No prior laser intervention documented',
    },
    {
      feature: `Insulin Therapy`,
      featureKey: 'insulinTherapy',
      value: insulinTherapy ? 'Yes (Insulin)' : 'Oral Meds Only',
      shapValue: insulinShap,
      impact: insulinShap > 0.05 ? 'increases_risk' : 'decreases_risk',
      clinicalContext: insulinTherapy
        ? 'Indicates significant pancreatic beta-cell deficit and extended diabetes severity'
        : 'Non-insulin dependent maintenance profile',
    },
  ];

  // Sort by absolute SHAP value for top risk drivers
  const topDrivers = [...shapList]
    .sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue))
    .slice(0, 3)
    .map((s) => `${s.feature}: ${s.shapValue > 0 ? '+' : ''}${s.shapValue} SHAP`);

  return {
    provided: true,
    predictedGrade,
    riskScore: +riskProb.toFixed(2),
    probabilities: probs,
    shapValues: shapList,
    top3RiskDrivers: topDrivers,
    inferenceMs: 16,
    syntheticMode: true,
  };
}

/**
 * Execute PRD Model 4 Late Fusion Logic:
 *
 * fundus_grade = argmax(fundus_softmax)
 * oct_dme_flag = oct_dme_probability > 0.5
 * metadata_grade = xgb_predicted_class
 *
 * raw_score = 0.55 * fundus_grade + 0.30 * metadata_grade + 0.15 * (2 if oct_dme_flag else 0)
 *
 * DME escalation rule (clinically motivated):
 * if oct_dme_flag and raw_score < 2: final_grade = 2
 * else: final_grade = round(raw_score)
 *
 * agreement = (fundus_grade == metadata_grade)
 * confidence = "HIGH" if agreement else "MODERATE"
 */
export function executeMultimodalFusion(params: {
  fundus: FundusAnalysis;
  oct?: OCTAnalysis;
  metadata?: MetadataAnalysis;
  clinicalInput: ClinicalMetadata;
  patientId: string;
  patientName?: string;
  fundusImageName: string;
  octImageName?: string;
  fundusImageUrl: string;
  fundusClaheUrl: string;
  fundusCamUrl: string;
  octImageUrl?: string;
  octCamUrl?: string;
}): MultimodalTriageResult {
  const {
    fundus,
    oct,
    metadata,
    clinicalInput,
    patientId,
    patientName,
    fundusImageName,
    octImageName,
    fundusImageUrl,
    fundusClaheUrl,
    fundusCamUrl,
    octImageUrl,
    octCamUrl,
  } = params;

  const fundusGrade = fundus.grade;
  const octDmeFlag = oct ? oct.dmeDetected && oct.dmeProbability > 0.5 : false;
  const metadataGrade = metadata && metadata.provided ? metadata.predictedGrade : fundusGrade;

  let rawFusionScore = 0;
  let dmeEscalationApplied = false;
  let finalGrade: DRGrade = fundusGrade;

  if (oct?.present && metadata?.provided) {
    // Full Tri-modal fusion
    rawFusionScore = 0.55 * fundusGrade + 0.30 * metadataGrade + 0.15 * (octDmeFlag ? 2 : 0);

    // Clinically motivated DME escalation rule:
    // Diabetic Macular Edema on OCT always warrants at least Grade 2 (Moderate DR / CSME)
    if (octDmeFlag && rawFusionScore < 2) {
      finalGrade = 2;
      dmeEscalationApplied = true;
    } else {
      finalGrade = Math.min(4, Math.max(0, Math.round(rawFusionScore))) as DRGrade;
    }
  } else if (oct?.present && !metadata?.provided) {
    // Fundus + OCT dual-stream (0.75 fundus + 0.25 OCT)
    rawFusionScore = 0.75 * fundusGrade + 0.25 * (octDmeFlag ? 2 : 0);
    if (octDmeFlag && rawFusionScore < 2) {
      finalGrade = 2;
      dmeEscalationApplied = true;
    } else {
      finalGrade = Math.min(4, Math.max(0, Math.round(rawFusionScore))) as DRGrade;
    }
  } else if (!oct?.present && metadata?.provided) {
    // Fundus + Metadata dual-stream (0.65 fundus + 0.35 metadata)
    rawFusionScore = 0.65 * fundusGrade + 0.35 * metadataGrade;
    finalGrade = Math.min(4, Math.max(0, Math.round(rawFusionScore))) as DRGrade;
  } else {
    // Fundus only
    rawFusionScore = fundusGrade;
    finalGrade = fundusGrade;
  }

  // Clinical agreement confidence
  const agreement = metadata?.provided ? fundusGrade === metadataGrade : true;
  const confidence: 'HIGH' | 'MODERATE' = agreement ? 'HIGH' : 'MODERATE';

  // Plain-language contributing factors
  const factors: string[] = [];

  // 1. Fundus factor
  if (fundusGrade === 0) {
    factors.push('Fundus: Grade 0 (Clear retinal vasculature, no microaneurysms detected)');
  } else if (fundusGrade === 1) {
    factors.push('Fundus: Grade 1 (Isolated microaneurysms detected in parafoveal arcade)');
  } else if (fundusGrade === 2) {
    factors.push('Fundus: Grade 2 (Exudates, blot hemorrhages in <4 quadrants, microaneurysms)');
  } else if (fundusGrade === 3) {
    factors.push('Fundus: Grade 3 (Satisfies 4:2:1 rule: deep hemorrhages in 4 quadrants & venous beading)');
  } else {
    factors.push('Fundus: Grade 4 (Neovascularization of disc NVD or preretinal vitreous hemorrhage)');
  }

  // 2. OCT factor
  if (oct?.present) {
    if (octDmeFlag) {
      factors.push(
        `OCT: DME detected (${(oct.dmeProbability * 100).toFixed(1)}% prob) — intraretinal cystoid fluid present in macular B-scan`
      );
    } else {
      factors.push(`OCT: Normal foveal architecture intact without macular cystoid fluid (${oct.predictedClass})`);
    }
  } else {
    factors.push('OCT: Scan not uploaded (OCT B-scan stream bypassed; recommendation based on Fundus + Metadata)');
  }

  // 3. Clinical metadata factor
  if (metadata?.provided) {
    const hba1cDesc =
      clinicalInput.hba1c >= 9.0
        ? 'severe glycemic toxicity'
        : clinicalInput.hba1c >= 7.5
        ? 'suboptimal glycemic control'
        : 'well-controlled glycemic state';
    factors.push(
      `Clinical: HbA1c ${clinicalInput.hba1c}% (${hba1cDesc}) over ${clinicalInput.diabetesDurationYears} yrs duration`
    );
  } else {
    factors.push('Clinical: Structured metadata not provided (using population standard baseline)');
  }

  // Triage Urgency & Recommendation
  let urgencyLevel: 'routine' | 'moderate' | 'urgent' = 'routine';
  let recommendation = '';

  switch (finalGrade) {
    case 0:
      urgencyLevel = 'routine';
      recommendation = DR_GRADES[0].action;
      break;
    case 1:
      urgencyLevel = 'routine';
      recommendation = DR_GRADES[1].action;
      break;
    case 2:
      urgencyLevel = 'moderate';
      recommendation = octDmeFlag
        ? 'Refer to Retina Specialist within 1 to 2 months. Clinically significant macular edema (CSME) confirmed on OCT warrants anti-VEGF / focal laser evaluation.'
        : DR_GRADES[2].action;
      break;
    case 3:
      urgencyLevel = 'urgent';
      recommendation = DR_GRADES[3].action;
      break;
    case 4:
      urgencyLevel = 'urgent';
      recommendation = DR_GRADES[4].action;
      break;
  }

  return {
    sessionId: `sess-${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    patientId,
    patientName: patientName || `Patient ${patientId}`,
    fundusImageName,
    octImageName,
    fundusImageUrl,
    fundusClaheUrl,
    fundusCamUrl,
    octImageUrl,
    octCamUrl,
    fundus,
    oct: oct || {
      present: false,
      predictedClass: 'Normal',
      dmeDetected: false,
      dmeProbability: 0,
      classProbabilities: { Normal: 1, DME: 0, CNV: 0, Drusen: 0 },
      inferenceMs: 0,
      retinalLayerFindings: ['OCT modality omitted for this screening session'],
    },
    metadata: metadata || {
      provided: false,
      predictedGrade: fundusGrade,
      riskScore: 0.2,
      probabilities: [0.2, 0.2, 0.2, 0.2, 0.2],
      shapValues: [],
      top3RiskDrivers: ['Clinical metadata omitted'],
      inferenceMs: 0,
      syntheticMode: true,
    },
    clinicalInput,
    rawFusionScore: +rawFusionScore.toFixed(2),
    finalGrade,
    gradeLabel: DR_GRADES[finalGrade].name,
    confidence,
    dmeEscalationApplied,
    recommendation,
    urgencyLevel,
    contributingFactors: factors,
    syntheticMode: true,
  };
}
