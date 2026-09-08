import { ImageQualityAssessment, QualityStatus } from '../types';

/**
 * Image Quality Assessment Service (Mock Layer)
 * 
 * NOTE: This is a client-side simulated quality assessment service.
 * In a production deployment, this layer communicates with a dedicated 
 * quality-assurance deep neural network (e.g. EyeQ or MobileNetV3 QA model) 
 * running in the inference container. 
 * Real quality classification has NOT been implemented on the server yet; 
 * this service provides realistic clinical mock evaluations and step-by-step 
 * retake guidance for screeners.
 */

export interface QualityAssessmentRequest {
  fileName: string;
  imageDataUrl?: string | null;
  forcedPreset?: QualityStatus;
}

export const imageQualityService = {
  isSimulated: true,

  /**
   * Assess fundus image quality using simulated heuristics
   */
  async assessQuality(req: QualityAssessmentRequest): Promise<ImageQualityAssessment> {
    // Artificial latency to simulate neural inference
    await new Promise((resolve) => setTimeout(resolve, 380));

    // If forced preset is provided (e.g. screener testing edge cases)
    if (req.forcedPreset) {
      return this.getPreset(req.forcedPreset);
    }

    const name = (req.fileName || '').toLowerCase();

    // Check filename hints for demo simulations
    if (name.includes('blur') || name.includes('poor') || name.includes('shaky') || name.includes('defocus')) {
      return this.getPreset('UNCERTAIN');
    }

    if (
      name.includes('dark') ||
      name.includes('glare') ||
      name.includes('artifact') ||
      name.includes('cataract') ||
      name.includes('corneal') ||
      name.includes('black')
    ) {
      return this.getPreset('UNGRADABLE');
    }

    // Default to Good
    return this.getPreset('GOOD');
  },

  /**
   * Generate preset reports for each quality status
   */
  getPreset(status: QualityStatus): ImageQualityAssessment {
    switch (status) {
      case 'GOOD':
        return {
          status: 'GOOD',
          overallScore: 94,
          isSuitableForAi: true,
          retakeRecommended: false,
          primaryGuidance:
            'Image quality meets all ICDR diagnostic thresholds. Optic disc margin is sharp, retinal vascular arcades are well-focused, and macular reflex is unobstructed.',
          metrics: {
            sharpness: 92,
            illumination: 95,
            glareIndex: 8,
            fieldCoverage: 96,
            contrast: 91,
          },
          issues: [],
        };

      case 'UNCERTAIN':
        return {
          status: 'UNCERTAIN',
          overallScore: 64,
          isSuitableForAi: false,
          retakeRecommended: true,
          primaryGuidance:
            'Image sharpness is compromised by mild motion blur and uneven peripheral illumination. Subtle microaneurysms near the macula may be obscured. Recapture is strongly recommended.',
          metrics: {
            sharpness: 58,
            illumination: 70,
            glareIndex: 22,
            fieldCoverage: 84,
            contrast: 62,
          },
          issues: [
            {
              id: 'motion_blur',
              name: 'Sub-Optimal Sharpness (Motion Blur)',
              detected: true,
              severity: 'moderate',
              description: 'Terminal capillaries and foveal capillary network exhibit softening.',
              guidance:
                'Ask the patient to fixate steadily on the internal fixation LED target. Wait 2 seconds for saccadic eye movements to settle before triggering exposure.',
            },
            {
              id: 'shadow_falloff',
              name: 'Uneven Field Illumination',
              detected: true,
              severity: 'low',
              description: 'Nasal hemisphere shows approximately 25% illumination drop-off.',
              guidance:
                'Re-center the camera objective directly over the pupillary axis. Ensure the patient is firmly seated against the forehead rest.',
            },
          ],
        };

      case 'UNGRADABLE':
        return {
          status: 'UNGRADABLE',
          overallScore: 32,
          isSuitableForAi: false,
          retakeRecommended: true,
          primaryGuidance:
            'Image is clinically ungradable. A bright corneal reflection crescent and insufficient pupil diameter (<3.5mm) obscure over 45% of the posterior pole. Automated AI models cannot reliably assess this scan.',
          metrics: {
            sharpness: 34,
            illumination: 42,
            glareIndex: 68,
            fieldCoverage: 48,
            contrast: 38,
          },
          issues: [
            {
              id: 'specular_glare',
              name: 'Severe Specular Corneal Reflection',
              detected: true,
              severity: 'high',
              description: 'A large white reflection crescent obscures the macular lutea region.',
              guidance:
                'Tilt or slightly rotate the fundus camera by 3°–5° to shift the corneal reflection ring outside the central imaging field.',
            },
            {
              id: 'small_pupil',
              name: 'Pupil Undersized / Peripheral Vignetting',
              detected: true,
              severity: 'high',
              description: 'Circumferential black vignetting caused by pupillary constriction.',
              guidance:
                'Darken ambient room lighting to allow natural physiological mydriasis (wait 3–5 minutes). If permitted by protocol, administer 1 drop of 0.5% Tropicamide.',
            },
            {
              id: 'tear_film',
              name: 'Tear Film Breakup / Blinking Artifact',
              detected: true,
              severity: 'moderate',
              description: 'Upper eyelid lash shadows visible along superior arcade.',
              guidance:
                'Ask patient to take a full complete blink, then hold eyes wide open for 3 seconds while capturing.',
            },
          ],
        };
    }
  },

  /**
   * Actionable retake guidance steps based on detected status
   */
  getRetakeInstructions(status: QualityStatus): string[] {
    if (status === 'GOOD') {
      return [
        'Image quality is verified and ready for deep learning model pipeline.',
      ];
    }

    if (status === 'UNCERTAIN') {
      return [
        'Instruct patient: "Keep both eyes open and stare at the green blinking light."',
        'Ensure patient forehead is firmly pressed against the curved forehead band.',
        'Wait 2 full seconds after blinking before pressing the camera capture button.',
        'If peripheral shadow persists, nudge camera 2mm toward the nasal side.',
      ];
    }

    return [
      'Dim or switch off examination room lights to facilitate natural pupil dilation (≥4.0mm).',
      'Ask patient to blink firmly 2–3 times to refresh the corneal tear film.',
      'Adjust the optical alignment joystick until the split-lamp infrared dots merge into a single sharp point.',
      'Tilt camera lens 3°–5° to displace specular corneal glare arcs away from the macula.',
      'Clean objective lens front glass using a lint-free optical lens wipe if smudges or dust are visible.',
    ];
  },
};
