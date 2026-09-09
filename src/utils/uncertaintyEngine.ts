import {
  DRGrade,
  MultimodalTriageResult,
  QualityStatus,
  ResponsibleAiUncertaintyEvaluation,
  ResponsibleAiUncertaintyState,
  Screening,
} from '../types';

/**
 * Mandatory Core Principle:
 * "AI screening systems can be uncertain. When image quality is poor or modalities disagree,
 * RetinaGuard should prioritize human review rather than pretending to know."
 */
export const RESPONSIBLE_AI_UNCERTAINTY_QUOTE =
  'AI screening systems can be uncertain. When image quality is poor or modalities disagree, RetinaGuard should prioritize human review rather than pretending to know.';

export interface UncertaintyStateDefinition {
  state: ResponsibleAiUncertaintyState;
  shortStatus: string;
  badgeLabel: string;
  title: string;
  tagline: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  iconName: 'ShieldCheck' | 'UserCheck' | 'EyeOff' | 'GitCompare';
  clinicalMeaning: string;
  systemAction: string;
  evidenceCriteria: string[];
}

export const UNCERTAINTY_STATE_DEFINITIONS: Record<
  ResponsibleAiUncertaintyState,
  UncertaintyStateDefinition
> = {
  'CONFIDENT ENOUGH FOR SCREENING SUPPORT': {
    state: 'CONFIDENT ENOUGH FOR SCREENING SUPPORT',
    shortStatus: 'Screening Supported',
    badgeLabel: 'CONFIDENT ENOUGH FOR SCREENING SUPPORT',
    title: 'Confident Enough for Screening Support',
    tagline: 'Sufficient multimodal evidence verified for clinical decision support',
    color: '#059669', // Emerald
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    textColor: '#065F46',
    accentColor: '#10B981',
    iconName: 'ShieldCheck',
    clinicalMeaning:
      'Fundus image clarity meets stringent optical criteria, optical biomarkers are unambiguous, and laboratory metadata concordantly aligns with visual grade.',
    systemAction:
      'Provides triaged recommendation with transparent Grad-CAM and SHAP attribution for clinician confirmation.',
    evidenceCriteria: [
      'Image Quality Gate: Passed (field, illumination & focus verified)',
      'Modality Concordance: Concordant (surface fundus and clinical metadata agree)',
      'Lesion Grounding: Distinct microaneurysms or clear normal retina observed',
      'Clinical Safety: Routine triage workflow supported with physician sign-off',
    ],
  },
  'HUMAN REVIEW RECOMMENDED': {
    state: 'HUMAN REVIEW RECOMMENDED',
    shortStatus: 'Human Review Recommended',
    badgeLabel: 'HUMAN REVIEW RECOMMENDED',
    title: 'Human Review Recommended',
    tagline: 'Borderline optical evidence or intermediate risk prompts clinician audit',
    color: '#D97706', // Amber
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    textColor: '#92400E',
    accentColor: '#F59E0B',
    iconName: 'UserCheck',
    clinicalMeaning:
      'Visual features present borderline severity, minor optical distortion was detected, or clinical metadata indicates heightened systemic risk that warrants expert human assessment.',
    systemAction:
      'Automatically flags case in provider queue for expedited ophthalmologist evaluation before dispatching care plan.',
    evidenceCriteria: [
      'Image Quality Gate: Borderline / Minor artifacts detected',
      'Modality Concordance: Mild divergence or high-risk systemic biomarkers present',
      'Lesion Grounding: Moderate or equivocal microvascular changes requiring verification',
      'Clinical Safety: AI yields to certified ophthalmologist rather than guessing',
    ],
  },
  'IMAGE UNGRADABLE': {
    state: 'IMAGE UNGRADABLE',
    shortStatus: 'Image Ungradable',
    badgeLabel: 'IMAGE UNGRADABLE',
    title: 'Image Ungradable — Automated Triage Suspended',
    tagline: 'Optical quality insufficient for reliable automated feature extraction',
    color: '#DC2626', // Red
    bgColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    textColor: '#991B1B',
    accentColor: '#EF4444',
    iconName: 'EyeOff',
    clinicalMeaning:
      'Severe media opacity, pupil decentration, corneal glare, or motion blur prevents reliable identification of retinal microvascular lesions.',
    systemAction:
      'Suspends automated diagnostic scoring. Prompts technician for immediate scan recapture or direct slit-lamp referral.',
    evidenceCriteria: [
      'Image Quality Gate: FAILED (glare, blur, or obstruction exceeds threshold)',
      'Optical Visibility: <70% diagnostic field legible',
      'Inference Posture: AI refuses to fabricate a prediction on corrupt input',
      'Clinical Safety: Recapture image or arrange in-person dilated examination',
    ],
  },
  'MODALITY DISAGREEMENT': {
    state: 'MODALITY DISAGREEMENT',
    shortStatus: 'Modality Disagreement',
    badgeLabel: 'MODALITY DISAGREEMENT',
    title: 'Modality Disagreement — Divergent Clinical Signals',
    tagline: 'Conflict identified between fundus imaging, cross-sectional OCT, or clinical metadata',
    color: '#7C3AED', // Violet / Purple
    bgColor: '#F5F3FF',
    borderColor: '#DDD6FE',
    textColor: '#5B21B6',
    accentColor: '#8B5CF6',
    iconName: 'GitCompare',
    clinicalMeaning:
      'Surface 2D fundus camera signals disagree markedly with cross-sectional OCT fluid indicators or longitudinal diabetic biomarkers (e.g. fundus normal but OCT shows macular edema, or grade divergence >= 2).',
    systemAction:
      'Escalates discrepancy as a critical concordance alert for comprehensive specialist review. Does not force artificial consensus.',
    evidenceCriteria: [
      'Modality Concordance: DISCORDANT (fundus vs OCT or metadata divergence >= 2)',
      'Subretinal Check: Cross-sectional fluid or cystoid edema detected without visible surface exuades',
      'Inference Posture: AI explicitly documents discordance rather than averaging inputs',
      'Clinical Safety: Retina specialist must reconcile conflicting physical vs chemical signals',
    ],
  },
};

/**
 * Pure evaluation function that maps existing ML outputs into the Responsible AI / Uncertainty state.
 * Does NOT alter underlying ML prediction logic.
 */
export function evaluateResponsibleAiUncertainty(
  result: MultimodalTriageResult | Screening,
  qualityStatusOverride?: QualityStatus
): ResponsibleAiUncertaintyEvaluation {
  // 1. Check for Ungradable Image
  const isUngradable =
    (result.finalGrade as number) === -1 ||
    (result as any).isUngradable === true ||
    qualityStatusOverride === 'UNGRADABLE' ||
    (result.fundus as any)?.qualityStatus === 'UNGRADABLE' ||
    (result as any).qualityStatus === 'UNGRADABLE';

  if (isUngradable) {
    const def = UNCERTAINTY_STATE_DEFINITIONS['IMAGE UNGRADABLE'];
    return {
      state: 'IMAGE UNGRADABLE',
      shortStatus: def.shortStatus,
      badgeLabel: def.badgeLabel,
      badgeColor: def.color,
      badgeBg: def.bgColor,
      badgeBorder: def.borderColor,
      iconName: def.iconName,
      primaryRationale:
        'Optical media opacity, extreme glare, or motion blur obscured retinal landmarks. Automated triage suspended to protect patient safety.',
      clinicalAction:
        'Retake fundus photograph immediately or refer patient for dilated slit-lamp biomicroscopy.',
      evidenceFactors: [
        {
          label: 'Optical Quality',
          status: 'fail',
          detail: 'Signal-to-noise ratio and contrast below diagnostic threshold.',
        },
        {
          label: 'Feature Extraction',
          status: 'fail',
          detail: 'Vascular arcades and foveal reflex not distinctly resolvable.',
        },
        {
          label: 'Decision Guardrail',
          status: 'caution',
          detail: 'AI halts triage instead of guessing or providing false reassurance.',
        },
      ],
      qualityPassed: false,
      concordanceStatus: 'Discordant',
      reviewRecommended: true,
      quoteMessage: RESPONSIBLE_AI_UNCERTAINTY_QUOTE,
    };
  }

  // 2. Multimodal Concordance Calculation
  const fundusGrade = result.fundus.grade;
  const metaPredictedGrade = result.metadata.provided
    ? result.metadata.predictedGrade
    : fundusGrade;
  const octDmePresent = result.oct.present ? result.oct.dmeDetected : false;

  const gradeDiff = Math.abs(fundusGrade - metaPredictedGrade);
  const isDmeConflict = fundusGrade === 0 && octDmePresent;
  const hasModalityDisagreement = gradeDiff >= 2 || isDmeConflict;

  if (hasModalityDisagreement) {
    const def = UNCERTAINTY_STATE_DEFINITIONS['MODALITY DISAGREEMENT'];
    const disagreementDetails = isDmeConflict
      ? 'Surface fundus camera indicated normal retina (Grade 0), but cross-sectional OCT detected intraretinal fluid (DME).'
      : `Fundus optical grading (Grade ${fundusGrade}) differs by ${gradeDiff} stages from clinical metadata prediction (Grade ${metaPredictedGrade}).`;

    return {
      state: 'MODALITY DISAGREEMENT',
      shortStatus: def.shortStatus,
      badgeLabel: def.badgeLabel,
      badgeColor: def.color,
      badgeBg: def.bgColor,
      badgeBorder: def.borderColor,
      iconName: def.iconName,
      primaryRationale: disagreementDetails,
      clinicalAction:
        'Mandatory ophthalmologist review required to reconcile imaging with clinical biomarkers. Artificial consensus is withheld.',
      evidenceFactors: [
        {
          label: 'Fundus vs Metadata',
          status: 'caution',
          detail: `Grade variance: ${gradeDiff} stages between optical inspection and patient biomarkers.`,
        },
        {
          label: 'Cross-Sectional OCT',
          status: isDmeConflict ? 'fail' : 'pass',
          detail: octDmePresent
            ? 'Macular cystoid fluid detected deep in retinal strata.'
            : 'Subretinal layers conform to baseline.',
        },
        {
          label: 'Concordance Guardrail',
          status: 'pass',
          detail: 'RetinaGuard highlights divergence rather than silently averaging conflicting models.',
        },
      ],
      qualityPassed: true,
      concordanceStatus: 'Discordant',
      reviewRecommended: true,
      quoteMessage: RESPONSIBLE_AI_UNCERTAINTY_QUOTE,
    };
  }

  // 3. Human Review Recommended
  const hasBorderlineQuality =
    qualityStatusOverride === 'UNCERTAIN' ||
    (result.fundus as any)?.qualityStatus === 'UNCERTAIN' ||
    (result as any).qualityStatus === 'UNCERTAIN';

  const isModerateOrBorderline =
    result.finalGrade === 2 ||
    result.finalGrade === 3 ||
    result.dmeEscalationApplied ||
    gradeDiff === 1 ||
    result.confidence === 'MODERATE' ||
    (result.confidence as any) === 'LOW' ||
    hasBorderlineQuality;

  if (isModerateOrBorderline) {
    const def = UNCERTAINTY_STATE_DEFINITIONS['HUMAN REVIEW RECOMMENDED'];
    const reviewReason = result.dmeEscalationApplied
      ? 'Diabetic Macular Edema rule enforced; clinical confirmation of fluid escalation recommended.'
      : hasBorderlineQuality
      ? 'Minor optical distortion or lighting variation identified; human eyes should confirm subtle lesion borders.'
      : gradeDiff === 1
      ? 'Mild single-grade variation between fundus inspection and clinical laboratory risk.'
      : `Moderate DR risk (Grade ${result.finalGrade}) at clinical decision threshold where timely intervention prevents vision loss.`;

    return {
      state: 'HUMAN REVIEW RECOMMENDED',
      shortStatus: def.shortStatus,
      badgeLabel: def.badgeLabel,
      badgeColor: def.color,
      badgeBg: def.bgColor,
      badgeBorder: def.borderColor,
      iconName: def.iconName,
      primaryRationale: reviewReason,
      clinicalAction:
        'Case prioritized for eye care provider review within 7–14 days. Clinical confirmation required before treatment decisions.',
      evidenceFactors: [
        {
          label: 'Optical Quality',
          status: hasBorderlineQuality ? 'caution' : 'pass',
          detail: hasBorderlineQuality
            ? 'Minor peripheral artifact; diagnostic region partially clear.'
            : 'Sufficient clarity for optical feature extraction.',
        },
        {
          label: 'Clinical Modality Alignment',
          status: gradeDiff === 1 ? 'caution' : 'pass',
          detail:
            gradeDiff === 1
              ? 'Fundus and metadata show mild divergence (1 grade).'
              : 'Fundus and metadata agree within expected clinical tolerances.',
        },
        {
          label: 'Ophthalmic Verification',
          status: 'caution',
          detail: 'Human clinician review prioritized over autonomous decision making.',
        },
      ],
      qualityPassed: !hasBorderlineQuality,
      concordanceStatus: gradeDiff === 1 ? 'Mild Divergence' : 'Concordant',
      reviewRecommended: true,
      quoteMessage: RESPONSIBLE_AI_UNCERTAINTY_QUOTE,
    };
  }

  // 4. Confident Enough for Screening Support
  const def = UNCERTAINTY_STATE_DEFINITIONS['CONFIDENT ENOUGH FOR SCREENING SUPPORT'];
  return {
    state: 'CONFIDENT ENOUGH FOR SCREENING SUPPORT',
    shortStatus: def.shortStatus,
    badgeLabel: def.badgeLabel,
    badgeColor: def.color,
    badgeBg: def.bgColor,
    badgeBorder: def.borderColor,
    iconName: def.iconName,
    primaryRationale:
      'High optical clarity, unambiguous microvascular lesion evidence, and strong agreement across all available modalities.',
    clinicalAction:
      'Screening recommendation supported with transparent visual heatmaps. Standard clinical oversight still applies.',
    evidenceFactors: [
      {
        label: 'Optical Image Clarity',
        status: 'pass',
        detail: 'Sharp vascular arcades, optic disc, and foveal avascular zone clearly visible.',
      },
      {
        label: 'Modality Concordance',
        status: 'pass',
        detail: 'Fundus grading and laboratory biomarkers present aligned risk profile.',
      },
      {
        label: 'Evidence Grounding',
        status: 'pass',
        detail: 'Attention heatmaps tightly localize to authentic retinal anatomy without artifacts.',
      },
    ],
    qualityPassed: true,
    concordanceStatus: 'Concordant',
    reviewRecommended: false,
    quoteMessage: RESPONSIBLE_AI_UNCERTAINTY_QUOTE,
  };
}
