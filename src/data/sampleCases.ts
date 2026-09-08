import { ClinicalMetadata, DRGrade, MultimodalTriageResult } from '../types';

// Helper to create encoded SVG data URIs
function encodeSvg(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

/* =========================================================================
   SVG RETINAL & OCT RENDERERS
   ========================================================================= */

export function generateFundusSvg(grade: DRGrade, mode: 'normal' | 'clahe' | 'gradcam'): string {
  const bgBase = mode === 'clahe' ? '#6E1E09' : '#8A270D';
  const vesselColor = mode === 'clahe' ? '#4A0802' : '#5E0E04';
  const discColor = mode === 'clahe' ? '#FFE899' : '#FFDF70';
  const maculaColor = mode === 'clahe' ? '#3B0F05' : '#4E1608';

  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
      <defs>
        <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stop-color="${bgBase}" />
          <stop offset="96%" stop-color="#400A02" />
          <stop offset="100%" stop-color="#140200" />
        </radialGradient>
        <radialGradient id="opticDisc" cx="45%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#FFF5CC" />
          <stop offset="60%" stop-color="${discColor}" />
          <stop offset="100%" stop-color="#D99B30" />
        </radialGradient>
        <radialGradient id="fovea" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${maculaColor}" />
          <stop offset="80%" stop-color="${bgBase}" />
        </radialGradient>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <radialGradient id="camSpotRed" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(255, 30, 30, 0.85)" />
          <stop offset="40%" stop-color="rgba(255, 140, 0, 0.65)" />
          <stop offset="75%" stop-color="rgba(255, 230, 0, 0.35)" />
          <stop offset="100%" stop-color="rgba(0, 180, 255, 0)" />
        </radialGradient>
        <radialGradient id="camSpotMild" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(255, 120, 0, 0.75)" />
          <stop offset="50%" stop-color="rgba(255, 210, 0, 0.45)" />
          <stop offset="100%" stop-color="rgba(0, 150, 255, 0)" />
        </radialGradient>
      </defs>

      <!-- Background & Eyeball Fundus Aperture -->
      <circle cx="256" cy="256" r="250" fill="url(#vignette)" stroke="#220501" stroke-width="4"/>

      <!-- Choroidal underlying texture -->
      <g opacity="${mode === 'clahe' ? '0.35' : '0.18'}">
        <path d="M 50 180 Q 200 240 450 170" stroke="#FF7744" stroke-width="8" fill="none" filter="blur(6px)" />
        <path d="M 70 320 Q 240 280 430 350" stroke="#FF5522" stroke-width="12" fill="none" filter="blur(8px)" />
      </g>

      <!-- Optic Disc (Nasal side, approx x:160, y:250) -->
      <ellipse cx="165" cy="256" rx="34" ry="42" fill="url(#opticDisc)" filter="drop-shadow(0px 0px 4px rgba(0,0,0,0.3))"/>
      <!-- Physiological Cup -->
      <ellipse cx="162" cy="254" rx="14" ry="18" fill="#FFF9E0" opacity="0.85"/>

      <!-- Macula / Fovea Centralis (Temporal side, x:310, y:260) -->
      <circle cx="310" cy="260" r="45" fill="url(#fovea)" opacity="0.9"/>
      <circle cx="310" cy="260" r="6" fill="#250802" opacity="0.75"/>

      <!-- Retinal Vascular Arcades Emergence from Optic Disc -->
      <!-- Superior Temporal Arcade -->
      <path d="M 165 240 C 180 180, 230 130, 310 135 C 360 138, 410 160, 440 210" stroke="${vesselColor}" stroke-width="${mode === 'clahe' ? '5.5' : '4.5'}" fill="none" stroke-linecap="round"/>
      <path d="M 230 160 C 260 140, 290 125, 330 115" stroke="${vesselColor}" stroke-width="2.5" fill="none"/>
      <path d="M 310 135 C 335 150, 350 175, 360 210" stroke="${vesselColor}" stroke-width="2" fill="none"/>

      <!-- Inferior Temporal Arcade -->
      <path d="M 165 272 C 180 330, 230 380, 315 375 C 370 370, 415 335, 445 285" stroke="${vesselColor}" stroke-width="${mode === 'clahe' ? '5.5' : '4.5'}" fill="none" stroke-linecap="round"/>
      <path d="M 240 355 C 270 380, 310 395, 350 400" stroke="${vesselColor}" stroke-width="2.5" fill="none"/>
      <path d="M 315 375 C 335 350, 350 325, 355 295" stroke="${vesselColor}" stroke-width="2" fill="none"/>

      <!-- Nasal Vessels -->
      <path d="M 150 245 C 120 210, 95 180, 70 170" stroke="${vesselColor}" stroke-width="3" fill="none"/>
      <path d="M 150 268 C 120 295, 90 325, 65 340" stroke="${vesselColor}" stroke-width="3" fill="none"/>

      <!-- PATHOLOGY LAYERS BASED ON DR GRADE -->
      ${grade >= 1 ? `
        <!-- Grade 1: Microaneurysms (isolated tiny red dots) -->
        <g id="microaneurysms" fill="#3D0000" stroke="#700000" stroke-width="0.5">
          <circle cx="280" cy="220" r="2.5" />
          <circle cx="340" cy="235" r="2.8" />
          <circle cx="270" cy="285" r="2.2" />
          <circle cx="330" cy="305" r="3.0" />
          <circle cx="360" cy="270" r="2.4" />
        </g>
      ` : ''}

      ${grade >= 2 ? `
        <!-- Grade 2: Moderate DR (Hard exudates yellow waxy clusters + blot hemorrhages) -->
        <g id="hard-exudates" fill="#FFEA88" stroke="#D19C10" stroke-width="0.5" opacity="0.95">
          <polygon points="345,215 349,212 353,216 350,221 344,219"/>
          <polygon points="354,222 358,220 361,225 356,228"/>
          <polygon points="338,208 342,206 345,210 341,213"/>
          <polygon points="350,205 354,202 357,207 353,211"/>
          <!-- Macular circinate ring -->
          <circle cx="362" cy="235" r="2.5" />
          <circle cx="366" cy="245" r="3" />
          <circle cx="360" cy="255" r="2.5" />
        </g>
        <g id="blot-hemorrhages" fill="#420300" opacity="0.88">
          <ellipse cx="250" cy="180" rx="6" ry="4" />
          <ellipse cx="290" cy="340" rx="7" ry="5" />
          <ellipse cx="370" cy="320" rx="5" ry="4" />
        </g>
      ` : ''}

      ${grade >= 3 ? `
        <!-- Grade 3: Severe DR (4:2:1 Rule: Extensive flame/blot hemorrhages in all quadrants, venous beading) -->
        <g id="severe-hemorrhages" fill="#3B0000" opacity="0.92">
          <!-- Multi-quadrant deep intraretinal blot hemorrhages -->
          <ellipse cx="120" cy="160" rx="9" ry="6" />
          <ellipse cx="140" cy="350" rx="10" ry="7" />
          <ellipse cx="380" cy="150" rx="11" ry="8" />
          <ellipse cx="400" cy="350" rx="12" ry="7" />
          <ellipse cx="230" cy="230" rx="8" ry="6" />
          <ellipse cx="295" cy="190" rx="9" ry="7" />
          <!-- Cotton Wool Spots (soft infarctions) -->
          <ellipse cx="270" cy="155" rx="12" ry="8" fill="#FFF5E6" opacity="0.8" filter="blur(2px)"/>
          <ellipse cx="380" cy="280" rx="14" ry="9" fill="#FFF5E6" opacity="0.75" filter="blur(2px)"/>
        </g>
        <!-- Venous Beading (tortuous irregular vessel segments) -->
        <path d="M 230 160 Q 235 150 245 155 Q 255 165 265 150 Q 275 140 290 145" stroke="#4A0200" stroke-width="6.5" fill="none" stroke-linecap="round"/>
        <path d="M 240 355 Q 248 370 258 365 Q 268 355 280 370" stroke="#4A0200" stroke-width="6.5" fill="none" stroke-linecap="round"/>
      ` : ''}

      ${grade === 4 ? `
        <!-- Grade 4: Proliferative DR (Neovascularization fronds NVD/NVE + Preretinal hemorrhage) -->
        <!-- NVD at Optic Disc -->
        <g id="neovascularization-disc" stroke="#680000" stroke-width="1.8" fill="none" opacity="0.95">
          <path d="M 165 240 Q 175 225 185 235 Q 195 230 188 245 Q 198 250 185 258" />
          <path d="M 155 245 Q 140 230 135 240 Q 145 250 138 260" />
          <circle cx="180" cy="235" r="2" fill="#500000"/>
          <circle cx="188" cy="248" r="2.5" fill="#500000"/>
        </g>
        <!-- NVE in periphery -->
        <g id="neovascularization-elsewhere" stroke="#600000" stroke-width="1.6" fill="none">
          <path d="M 330 135 C 345 110 365 125 380 115 C 390 130 405 120 410 138" />
        </g>
        <!-- Preretinal Vitreous Hemorrhage / Boat-shaped D-hemorrhage -->
        <path d="M 340 290 Q 380 290 410 295 C 410 325 340 325 340 290 Z" fill="#2E0000" opacity="0.95" filter="drop-shadow(0px 2px 5px rgba(0,0,0,0.5))"/>
      ` : ''}

      <!-- GRAD-CAM THERMAL ACTIVATION MAP OVERLAY (When enabled) -->
      ${mode === 'gradcam' ? `
        <g id="gradcam-overlay" opacity="0.75" style="mix-blend-mode: screen;">
          ${grade === 0 ? `
            <!-- Low background attention on optic disc and macula -->
            <circle cx="165" cy="256" r="50" fill="url(#camSpotMild)" opacity="0.4" />
            <circle cx="310" cy="260" r="45" fill="url(#camSpotMild)" opacity="0.35" />
          ` : ''}
          ${grade === 1 ? `
            <circle cx="330" cy="235" r="60" fill="url(#camSpotMild)" opacity="0.75" />
            <circle cx="280" cy="250" r="55" fill="url(#camSpotMild)" opacity="0.65" />
          ` : ''}
          ${grade === 2 ? `
            <circle cx="350" cy="220" r="75" fill="url(#camSpotRed)" opacity="0.85" />
            <circle cx="270" cy="200" r="60" fill="url(#camSpotMild)" opacity="0.7" />
            <circle cx="310" cy="260" r="70" fill="url(#camSpotRed)" opacity="0.8" />
          ` : ''}
          ${grade === 3 ? `
            <circle cx="380" cy="160" r="95" fill="url(#camSpotRed)" opacity="0.9" />
            <circle cx="240" cy="160" r="80" fill="url(#camSpotRed)" opacity="0.85" />
            <circle cx="390" cy="340" r="90" fill="url(#camSpotRed)" opacity="0.88" />
            <circle cx="130" cy="340" r="75" fill="url(#camSpotRed)" opacity="0.8" />
          ` : ''}
          ${grade === 4 ? `
            <!-- Hotspot right on the Optic Disc NVD and Preretinal Hemorrhage -->
            <circle cx="170" cy="245" r="85" fill="url(#camSpotRed)" opacity="0.95" />
            <circle cx="375" cy="305" r="95" fill="url(#camSpotRed)" opacity="0.9" />
            <circle cx="360" cy="130" r="75" fill="url(#camSpotRed)" opacity="0.85" />
          ` : ''}
        </g>
      ` : ''}

      <!-- CLAHE Grid annotation (subtle medical coordinate overlay for scientific feel) -->
      ${mode === 'clahe' ? `
        <g stroke="#FFAA66" stroke-width="0.35" opacity="0.25">
          <line x1="128" y1="0" x2="128" y2="512"/>
          <line x1="256" y1="0" x2="256" y2="512"/>
          <line x1="384" y1="0" x2="384" y2="512"/>
          <line x1="0" y1="128" x2="512" y2="128"/>
          <line x1="0" y1="256" x2="512" y2="256"/>
          <line x1="0" y1="384" x2="512" y2="384"/>
          <text x="20" y="490" fill="#FFAA66" font-size="12" font-family="monospace">CLAHE · 512×512 · Ben Graham L*a*b</text>
        </g>
      ` : ''}
    </svg>
  `);
}

/* =========================================================================
   OCT SCAN B-SCAN SVG GENERATOR
   ========================================================================= */

export function generateOctSvg(octType: 'Normal' | 'DME' | 'CNV' | 'Drusen', mode: 'scan' | 'gradcam'): string {
  const hasDme = octType === 'DME';
  const hasDrusen = octType === 'Drusen';
  const hasCnv = octType === 'CNV';

  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 280" width="100%" height="100%">
      <defs>
        <radialGradient id="octCamThermal" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(255, 40, 20, 0.88)" />
          <stop offset="35%" stop-color="rgba(255, 170, 0, 0.7)" />
          <stop offset="70%" stop-color="rgba(0, 210, 255, 0.3)" />
          <stop offset="100%" stop-color="rgba(0, 80, 255, 0)" />
        </radialGradient>
      </defs>

      <!-- Vitreous Cavity (dark background) -->
      <rect width="512" height="280" fill="#0A0B0E"/>

      <!-- Vitreous speckle noise -->
      <g opacity="0.12" fill="#FFFFFF">
        <circle cx="60" cy="40" r="1"/>
        <circle cx="180" cy="55" r="1.5"/>
        <circle cx="320" cy="30" r="1"/>
        <circle cx="440" cy="65" r="1.2"/>
        <circle cx="260" cy="70" r="0.8"/>
      </g>

      <!-- INNER LIMITING MEMBRANE (ILM) & FOVEAL DEPRESSION -->
      <!-- In Normal: clean foveal pit. In DME: dome-shaped elevation with loss of foveal contour -->
      ${hasDme ? `
        <!-- Blunted, edematous thickened macula contour -->
        <path d="M 20 120 Q 150 115 256 95 Q 362 115 492 120" stroke="#E2E4EB" stroke-width="2.5" fill="none"/>
        <path d="M 20 125 Q 150 120 256 100 Q 362 120 492 125" stroke="#B0B5C2" stroke-width="4" fill="none" opacity="0.8"/>
      ` : hasDrusen ? `
        <!-- Wavy undulating ILM due to sub-RPE deposits -->
        <path d="M 20 125 Q 140 125 210 138 Q 256 142 302 138 Q 370 125 492 125" stroke="#E2E4EB" stroke-width="2.5" fill="none"/>
      ` : hasCnv ? `
        <!-- Disrupted sub-retinal elevation with fluid -->
        <path d="M 20 125 Q 160 120 230 110 Q 256 108 280 110 Q 360 120 492 125" stroke="#E2E4EB" stroke-width="2.5" fill="none"/>
      ` : `
        <!-- Normal sharp foveal depression -->
        <path d="M 20 125 Q 160 125 220 145 Q 256 160 292 145 Q 352 125 492 125" stroke="#E2E4EB" stroke-width="2.5" fill="none"/>
        <path d="M 20 130 Q 160 130 220 150 Q 256 164 292 150 Q 352 130 492 130" stroke="#B0B5C2" stroke-width="4" fill="none" opacity="0.8"/>
      `}

      <!-- RETINAL INNER LAYERS (Ganglion Cell, Inner Plexiform, Inner Nuclear) -->
      <g opacity="0.65" stroke="#7A8094" stroke-width="1.5" fill="none">
        ${hasDme ? `
          <path d="M 20 140 Q 150 135 256 118 Q 362 135 492 140"/>
          <path d="M 20 155 Q 150 150 256 135 Q 362 150 492 155"/>
          <path d="M 20 170 Q 150 168 256 155 Q 362 168 492 170"/>
        ` : `
          <path d="M 20 145 Q 160 145 220 160 Q 256 172 292 160 Q 352 145 492 145"/>
          <path d="M 20 160 Q 160 160 220 172 Q 256 182 292 172 Q 352 160 492 160"/>
        `}
      </g>

      <!-- CYSTOID FLUID SPACES (If DME) -->
      ${hasDme ? `
        <!-- Hypo-reflective fluid cysts in outer nuclear layer -->
        <g id="dme-cystoid-spaces" fill="#0A0B0E" stroke="#5F677E" stroke-width="1.5">
          <!-- Central intraretinal fluid cavity -->
          <ellipse cx="256" cy="142" rx="28" ry="18" />
          <ellipse cx="210" cy="150" rx="19" ry="12" />
          <ellipse cx="302" cy="148" rx="22" ry="14" />
          <ellipse cx="170" cy="158" rx="14" ry="9" />
          <ellipse cx="342" cy="156" rx="16" ry="10" />
        </g>
        <!-- Subretinal fluid accumulation -->
        <path d="M 225 188 Q 256 182 287 188 Q 256 195 225 188 Z" fill="#0A0B0E" stroke="#7A8094" stroke-width="1"/>
      ` : ''}

      ${hasDrusen ? `
        <!-- Sub-RPE nodular Drusen humps -->
        <g fill="#A8ADB8" opacity="0.9">
          <ellipse cx="210" cy="195" rx="16" ry="9" />
          <ellipse cx="256" cy="193" rx="22" ry="11" />
          <ellipse cx="305" cy="196" rx="18" ry="10" />
        </g>
      ` : ''}

      <!-- IS/OS JUNCTION (Ellipsoid Zone) - Bright hyper-reflective band -->
      <path d="M 20 188 Q 160 188 256 188 Q 352 188 492 188" stroke="#D1D5E0" stroke-width="2" fill="none" opacity="0.85"/>

      <!-- RETINAL PIGMENT EPITHELIUM (RPE) & BRUCH'S MEMBRANE (Brightest band) -->
      <path d="M 20 196 Q 160 196 256 196 Q 352 196 492 196" stroke="#FFFFFF" stroke-width="3.5" fill="none" filter="drop-shadow(0px 0px 2px #FFFFFF)"/>

      <!-- CHOROID & SCLERA (Dense speckled back-shadowing) -->
      <rect x="20" y="202" width="472" height="65" fill="#1A1C24" opacity="0.65"/>
      <g stroke="#3D4255" stroke-width="1" stroke-dasharray="4,6" opacity="0.5">
        <line x1="20" y1="220" x2="492" y2="220"/>
        <line x1="20" y1="240" x2="492" y2="240"/>
        <line x1="20" y1="260" x2="492" y2="260"/>
      </g>

      <!-- GRAD-CAM ACTIVATION ON OCT -->
      ${mode === 'gradcam' ? `
        <g id="oct-cam-heat" opacity="0.82" style="mix-blend-mode: screen;">
          ${hasDme ? `
            <!-- Dense activation centered right over intraretinal cystoid fluid -->
            <ellipse cx="256" cy="144" rx="65" ry="38" fill="url(#octCamThermal)" />
            <ellipse cx="215" cy="150" rx="40" ry="25" fill="url(#octCamThermal)" opacity="0.8" />
            <ellipse cx="300" cy="148" rx="45" ry="26" fill="url(#octCamThermal)" opacity="0.8" />
          ` : hasCnv ? `
            <ellipse cx="256" cy="180" rx="50" ry="28" fill="url(#octCamThermal)" />
          ` : hasDrusen ? `
            <ellipse cx="256" cy="195" rx="55" ry="20" fill="url(#octCamThermal)" />
          ` : `
            <!-- Normal: modest diffuse baseline check -->
            <ellipse cx="256" cy="170" rx="35" ry="18" fill="url(#octCamThermal)" opacity="0.3" />
          `}
        </g>
      ` : ''}

      <!-- Calibration Scale Bars -->
      <g stroke="#8CA8CC" stroke-width="1" opacity="0.75" font-family="monospace" font-size="9" fill="#8CA8CC">
        <!-- 200 um horizontal scale bar -->
        <line x1="430" y1="25" x2="480" y2="25"/>
        <line x1="430" y1="22" x2="430" y2="28"/>
        <line x1="480" y1="22" x2="480" y2="28"/>
        <text x="440" y="18">200µm</text>
        <text x="25" y="30">SD-OCT B-Scan · DenseNet-121</text>
      </g>
    </svg>
  `);
}

/* =========================================================================
   PRE-PACKAGED BENCHMARK CLINICAL PATIENT CASES
   ========================================================================= */

export interface PresetPatientCase {
  id: string;
  name: string;
  patientCode: string;
  demographics: string;
  drGrade: DRGrade;
  octType: 'Normal' | 'DME' | 'CNV' | 'Drusen';
  description: string;
  clinicalMetadata: ClinicalMetadata;
  expectedTriage: MultimodalTriageResult;
}

export const PRESET_CASES: PresetPatientCase[] = [
  {
    id: 'case-normal-01',
    name: 'Normal Retinal Screening (Control)',
    patientCode: 'PT-8802-NOR',
    demographics: '48yo Male, Type 2 DM (3 yrs), HbA1c 6.1%',
    drGrade: 0,
    octType: 'Normal',
    description: 'Routine screening. Crisp optic disc, sharp foveal depression on OCT, optimal glycemic control.',
    clinicalMetadata: {
      hba1c: 6.1,
      diabetesDurationYears: 3,
      systolicBp: 124,
      diastolicBp: 78,
      serumCreatinine: 0.85,
      age: 48,
      bmi: 24.2,
      insulinTherapy: false,
      priorLaser: false,
      visualAcuityLogMar: 0.0, // 20/20 Snellen
    },
    expectedTriage: {
      sessionId: 'sess-8802-norm',
      timestamp: new Date().toISOString(),
      patientId: 'PT-8802-NOR',
      patientName: 'Case 1 (Screening Control)',
      fundusImageName: 'aptos_norm_0491.png',
      octImageName: 'oct_kermany_normal_12.png',
      fundusImageUrl: generateFundusSvg(0, 'normal'),
      fundusClaheUrl: generateFundusSvg(0, 'clahe'),
      fundusCamUrl: generateFundusSvg(0, 'gradcam'),
      octImageUrl: generateOctSvg('Normal', 'scan'),
      octCamUrl: generateOctSvg('Normal', 'gradcam'),
      fundus: {
        grade: 0,
        gradeLabel: 'No Apparent DR',
        probabilities: [0.942, 0.045, 0.011, 0.002, 0.000],
        inferenceMs: 138,
        camHotspots: [
          { x: 165, y: 256, radius: 40, label: 'Optic Disc Rim (Normal Physiological Margin)', intensity: 0.28 },
          { x: 310, y: 260, radius: 35, label: 'Foveal Avascular Zone (Intact Reflex)', intensity: 0.24 },
        ],
        featuresDetected: ['Intact optic nerve margin', 'Sharp foveal avascular zone', 'Normal vascular caliber'],
      },
      oct: {
        present: true,
        predictedClass: 'Normal',
        dmeDetected: false,
        dmeProbability: 0.024,
        classProbabilities: { Normal: 0.962, DME: 0.024, CNV: 0.008, Drusen: 0.006 },
        inferenceMs: 92,
        retinalLayerFindings: ['Preserved foveal contour', 'Intact IS/OS ellipsoid zone', 'Normal central subfield thickness (242 µm)'],
      },
      metadata: {
        provided: true,
        predictedGrade: 0,
        riskScore: 0.08,
        probabilities: [0.91, 0.07, 0.02, 0.00, 0.00],
        shapValues: [
          { feature: 'HbA1c (6.1%)', featureKey: 'hba1c', value: '6.1%', shapValue: -0.42, impact: 'decreases_risk', clinicalContext: 'Near euglycemic range protects against microvascular basement membrane thickening' },
          { feature: 'Duration (3 yrs)', featureKey: 'diabetesDurationYears', value: '3 yrs', shapValue: -0.31, impact: 'decreases_risk', clinicalContext: 'Short disease latency minimizes cumulative hyperglycemic vascular shear' },
          { feature: 'Blood Pressure (124/78)', featureKey: 'systolicBp', value: '124/78 mmHg', shapValue: -0.18, impact: 'decreases_risk', clinicalContext: 'Normotensive pressures preserve capillary endothelial junctions' },
        ],
        top3RiskDrivers: ['Optimal HbA1c 6.1%', 'Short duration 3 yrs', 'Normotensive blood pressure'],
        inferenceMs: 14,
        syntheticMode: true,
      },
      clinicalInput: {
        hba1c: 6.1,
        diabetesDurationYears: 3,
        systolicBp: 124,
        diastolicBp: 78,
        serumCreatinine: 0.85,
        age: 48,
        bmi: 24.2,
        insulinTherapy: false,
        priorLaser: false,
        visualAcuityLogMar: 0.0,
      },
      rawFusionScore: 0.02,
      finalGrade: 0,
      gradeLabel: 'No Apparent DR',
      confidence: 'HIGH',
      dmeEscalationApplied: false,
      recommendation: 'Routine annual diabetic ophthalmic screening. Maintain target HbA1c < 7.0%.',
      urgencyLevel: 'routine',
      contributingFactors: [
        'Fundus: Grade 0 (No microaneurysms or vascular lesions detected)',
        'OCT: Normal foveal depression intact, no subretinal fluid or edema',
        'Clinical: HbA1c 6.1% — optimal glycemic control over 3-year disease history',
      ],
      syntheticMode: true,
    },
  },
  {
    id: 'case-mild-02',
    name: 'Mild Non-Proliferative DR',
    patientCode: 'PT-3190-MLD',
    demographics: '54yo Female, Type 2 DM (7 yrs), HbA1c 7.6%',
    drGrade: 1,
    octType: 'Normal',
    description: 'Isolated microaneurysms in temporal parafoveal region. OCT clear of fluid.',
    clinicalMetadata: {
      hba1c: 7.6,
      diabetesDurationYears: 7,
      systolicBp: 136,
      diastolicBp: 84,
      serumCreatinine: 0.95,
      age: 54,
      bmi: 27.8,
      insulinTherapy: false,
      priorLaser: false,
      visualAcuityLogMar: 0.05,
    },
    expectedTriage: {
      sessionId: 'sess-3190-mild',
      timestamp: new Date().toISOString(),
      patientId: 'PT-3190-MLD',
      patientName: 'Case 2 (Mild NPDR)',
      fundusImageName: 'aptos_mild_1028.png',
      octImageName: 'oct_kermany_normal_88.png',
      fundusImageUrl: generateFundusSvg(1, 'normal'),
      fundusClaheUrl: generateFundusSvg(1, 'clahe'),
      fundusCamUrl: generateFundusSvg(1, 'gradcam'),
      octImageUrl: generateOctSvg('Normal', 'scan'),
      octCamUrl: generateOctSvg('Normal', 'gradcam'),
      fundus: {
        grade: 1,
        gradeLabel: 'Mild Non-Proliferative DR',
        probabilities: [0.082, 0.825, 0.081, 0.010, 0.002],
        inferenceMs: 145,
        camHotspots: [
          { x: 330, y: 235, radius: 30, label: 'Parafoveal Microaneurysm Cluster', intensity: 0.72 },
          { x: 280, y: 250, radius: 25, label: 'Isolated Pericyte Loss Dilatation', intensity: 0.61 },
        ],
        featuresDetected: ['Isolated microaneurysms in temporal quadrant', 'No hard exudates or cotton-wool spots'],
      },
      oct: {
        present: true,
        predictedClass: 'Normal',
        dmeDetected: false,
        dmeProbability: 0.048,
        classProbabilities: { Normal: 0.925, DME: 0.048, CNV: 0.015, Drusen: 0.012 },
        inferenceMs: 95,
        retinalLayerFindings: ['Preserved foveal architecture', 'No intraretinal cystoid fluid', 'Central thickness 255 µm'],
      },
      metadata: {
        provided: true,
        predictedGrade: 1,
        riskScore: 0.28,
        probabilities: [0.15, 0.72, 0.11, 0.02, 0.00],
        shapValues: [
          { feature: 'HbA1c (7.6%)', featureKey: 'hba1c', value: '7.6%', shapValue: +0.22, impact: 'increases_risk', clinicalContext: 'Suboptimal glycemic exposure contributes to pericyte apoptosis' },
          { feature: 'Duration (7 yrs)', featureKey: 'diabetesDurationYears', value: '7 yrs', shapValue: +0.19, impact: 'increases_risk', clinicalContext: 'Moderately increased duration elevates cumulative microvascular risk' },
          { feature: 'Systolic BP (136)', featureKey: 'systolicBp', value: '136 mmHg', shapValue: +0.08, impact: 'increases_risk', clinicalContext: 'Stage 1 systolic pressure increases capillary hydrostatic wall tension' },
        ],
        top3RiskDrivers: ['HbA1c 7.6%', 'Diabetes duration 7 yrs', 'Elevated systolic BP 136 mmHg'],
        inferenceMs: 16,
        syntheticMode: true,
      },
      clinicalInput: {
        hba1c: 7.6,
        diabetesDurationYears: 7,
        systolicBp: 136,
        diastolicBp: 84,
        serumCreatinine: 0.95,
        age: 54,
        bmi: 27.8,
        insulinTherapy: false,
        priorLaser: false,
        visualAcuityLogMar: 0.05,
      },
      rawFusionScore: 0.98,
      finalGrade: 1,
      gradeLabel: 'Mild Non-Proliferative DR',
      confidence: 'HIGH',
      dmeEscalationApplied: false,
      recommendation: 'Repeat comprehensive dilated fundus examination in 6 to 12 months. Intensify glycemic and blood pressure management.',
      urgencyLevel: 'routine',
      contributingFactors: [
        'Fundus: Grade 1 (Isolated microaneurysms detected in temporal parafoveal zone)',
        'OCT: DME negative, foveal contour preserved without cystoid fluid',
        'Clinical: HbA1c 7.6% over 7-year history correlates with early pericyte dropout',
      ],
      syntheticMode: true,
    },
  },
  {
    id: 'case-moderate-dme-03',
    name: 'Moderate NPDR with Diabetic Macular Edema (DME)',
    patientCode: 'PT-4421-MOD',
    demographics: '61yo Male, Type 2 DM (11 yrs), HbA1c 8.8%',
    drGrade: 2,
    octType: 'DME',
    description: 'Hard exudates forming circinate ring. OCT confirms intraretinal cystoid fluid in outer nuclear layer.',
    clinicalMetadata: {
      hba1c: 8.8,
      diabetesDurationYears: 11,
      systolicBp: 144,
      diastolicBp: 88,
      serumCreatinine: 1.25,
      age: 61,
      bmi: 29.4,
      insulinTherapy: true,
      priorLaser: false,
      visualAcuityLogMar: 0.3, // ~20/40 Snellen
    },
    expectedTriage: {
      sessionId: 'sess-4421-mod-dme',
      timestamp: new Date().toISOString(),
      patientId: 'PT-4421-MOD',
      patientName: 'Case 3 (Moderate NPDR + DME)',
      fundusImageName: 'aptos_mod_2041.png',
      octImageName: 'oct_kermany_dme_074.png',
      fundusImageUrl: generateFundusSvg(2, 'normal'),
      fundusClaheUrl: generateFundusSvg(2, 'clahe'),
      fundusCamUrl: generateFundusSvg(2, 'gradcam'),
      octImageUrl: generateOctSvg('DME', 'scan'),
      octCamUrl: generateOctSvg('DME', 'gradcam'),
      fundus: {
        grade: 2,
        gradeLabel: 'Moderate Non-Proliferative DR',
        probabilities: [0.012, 0.125, 0.810, 0.048, 0.005],
        inferenceMs: 148,
        camHotspots: [
          { x: 350, y: 220, radius: 45, label: 'Macular Hard Exudate Circinate Ring', intensity: 0.89 },
          { x: 310, y: 260, radius: 40, label: 'Foveal Thickening & Lipid Infiltration', intensity: 0.84 },
          { x: 270, y: 200, radius: 30, label: 'Intraretinal Dot/Blot Hemorrhages', intensity: 0.73 },
        ],
        featuresDetected: ['Multiple microaneurysms', 'Hard exudate circinate ring', 'Blot hemorrhages in 2 quadrants'],
      },
      oct: {
        present: true,
        predictedClass: 'DME',
        dmeDetected: true,
        dmeProbability: 0.942,
        classProbabilities: { Normal: 0.018, DME: 0.942, CNV: 0.025, Drusen: 0.015 },
        inferenceMs: 104,
        retinalLayerFindings: ['Intraretinal cystoid fluid spaces in outer nuclear layer', 'Subretinal fluid detachment', 'Central subfield thickness increased to 395 µm'],
      },
      metadata: {
        provided: true,
        predictedGrade: 2,
        riskScore: 0.62,
        probabilities: [0.03, 0.14, 0.74, 0.08, 0.01],
        shapValues: [
          { feature: 'HbA1c (8.8%)', featureKey: 'hba1c', value: '8.8%', shapValue: +0.48, impact: 'increases_risk', clinicalContext: 'Substantial persistent hyperglycemia drives VEGF expression and breakdown of blood-retinal barrier' },
          { feature: 'Duration (11 yrs)', featureKey: 'diabetesDurationYears', value: '11 yrs', shapValue: +0.32, impact: 'increases_risk', clinicalContext: 'Cumulative exposure over a decade strongly elevates diabetic macular edema odds' },
          { feature: 'Serum Creatinine (1.25)', featureKey: 'serumCreatinine', value: '1.25 mg/dL', shapValue: +0.18, impact: 'increases_risk', clinicalContext: 'Renal microvascular compromise parallels retinal capillary hyperpermeability' },
        ],
        top3RiskDrivers: ['HbA1c 8.8% (elevated VEGF stimulus)', '11-year diabetes history', 'Serum creatinine 1.25 mg/dL'],
        inferenceMs: 18,
        syntheticMode: true,
      },
      clinicalInput: {
        hba1c: 8.8,
        diabetesDurationYears: 11,
        systolicBp: 144,
        diastolicBp: 88,
        serumCreatinine: 1.25,
        age: 61,
        bmi: 29.4,
        insulinTherapy: true,
        priorLaser: false,
        visualAcuityLogMar: 0.3,
      },
      rawFusionScore: 2.15,
      finalGrade: 2,
      gradeLabel: 'Moderate Non-Proliferative DR',
      confidence: 'HIGH',
      dmeEscalationApplied: true,
      recommendation: 'Refer to Retina Specialist within 1 to 2 months. Clinically significant macular edema (CSME) confirmed on OCT warrants anti-VEGF / focal laser evaluation.',
      urgencyLevel: 'moderate',
      contributingFactors: [
        'Fundus: Grade 2 (Lipid exudate circinate cluster threatening fovea)',
        'OCT: DME detected with 94.2% confidence (intraretinal cystoid fluid + central thickness 395 µm)',
        'Clinical: HbA1c 8.8% + insulin use corroborates severe systemic endothelial stress',
      ],
      syntheticMode: true,
    },
  },
  {
    id: 'case-severe-04',
    name: 'Severe Non-Proliferative DR (4:2:1 Rule)',
    patientCode: 'PT-7105-SEV',
    demographics: '58yo Female, Type 2 DM (14 yrs), HbA1c 9.9%',
    drGrade: 3,
    octType: 'DME',
    description: 'Extensive intraretinal blot hemorrhages in all 4 quadrants, definite venous beading, cotton-wool spots.',
    clinicalMetadata: {
      hba1c: 9.9,
      diabetesDurationYears: 14,
      systolicBp: 158,
      diastolicBp: 94,
      serumCreatinine: 1.55,
      age: 58,
      bmi: 31.2,
      insulinTherapy: true,
      priorLaser: false,
      visualAcuityLogMar: 0.48, // ~20/60 Snellen
    },
    expectedTriage: {
      sessionId: 'sess-7105-sev',
      timestamp: new Date().toISOString(),
      patientId: 'PT-7105-SEV',
      patientName: 'Case 4 (Severe NPDR)',
      fundusImageName: 'aptos_sev_3310.png',
      octImageName: 'oct_kermany_dme_192.png',
      fundusImageUrl: generateFundusSvg(3, 'normal'),
      fundusClaheUrl: generateFundusSvg(3, 'clahe'),
      fundusCamUrl: generateFundusSvg(3, 'gradcam'),
      octImageUrl: generateOctSvg('DME', 'scan'),
      octCamUrl: generateOctSvg('DME', 'gradcam'),
      fundus: {
        grade: 3,
        gradeLabel: 'Severe Non-Proliferative DR',
        probabilities: [0.001, 0.015, 0.082, 0.865, 0.037],
        inferenceMs: 152,
        camHotspots: [
          { x: 380, y: 160, radius: 55, label: 'Superior Quadrant Deep Intraretinal Hemorrhages', intensity: 0.92 },
          { x: 240, y: 160, radius: 45, label: 'Definite Venous Beading (Hypoxia Response)', intensity: 0.88 },
          { x: 390, y: 340, radius: 50, label: 'Inferior Temporal Microvascular Infarction', intensity: 0.85 },
        ],
        featuresDetected: ['Hemorrhages >20 in all 4 quadrants', 'Definite venous beading in 2+ quadrants', 'Cotton wool nerve fiber infarcts'],
      },
      oct: {
        present: true,
        predictedClass: 'DME',
        dmeDetected: true,
        dmeProbability: 0.968,
        classProbabilities: { Normal: 0.008, DME: 0.968, CNV: 0.018, Drusen: 0.006 },
        inferenceMs: 102,
        retinalLayerFindings: ['Extensive cystoid macular edema spanning central 1mm', 'Inner retinal disorganization (DRIL)', 'Central subfield thickness 440 µm'],
      },
      metadata: {
        provided: true,
        predictedGrade: 3,
        riskScore: 0.84,
        probabilities: [0.01, 0.04, 0.12, 0.78, 0.05],
        shapValues: [
          { feature: 'HbA1c (9.9%)', featureKey: 'hba1c', value: '9.9%', shapValue: +0.64, impact: 'increases_risk', clinicalContext: 'Severe chronic hyperglycemia causes extensive retinal capillary dropout and tissue ischemia' },
          { feature: 'Systolic BP (158)', featureKey: 'systolicBp', value: '158 mmHg', shapValue: +0.38, impact: 'increases_risk', clinicalContext: 'Uncontrolled hypertension accelerates capillary rupture and ischemic cotton-wool infarcts' },
          { feature: 'Serum Creatinine (1.55)', featureKey: 'serumCreatinine', value: '1.55 mg/dL', shapValue: +0.29, impact: 'increases_risk', clinicalContext: 'Overt diabetic nephropathy is a major systemic predictor of rapid retinopathy progression' },
        ],
        top3RiskDrivers: ['HbA1c 9.9% (high angiogenic drive)', 'Uncontrolled systolic BP 158 mmHg', 'Renal impairment (Creatinine 1.55 mg/dL)'],
        inferenceMs: 17,
        syntheticMode: true,
      },
      clinicalInput: {
        hba1c: 9.9,
        diabetesDurationYears: 14,
        systolicBp: 158,
        diastolicBp: 94,
        serumCreatinine: 1.55,
        age: 58,
        bmi: 31.2,
        insulinTherapy: true,
        priorLaser: false,
        visualAcuityLogMar: 0.48,
      },
      rawFusionScore: 2.95,
      finalGrade: 3,
      gradeLabel: 'Severe Non-Proliferative DR',
      confidence: 'HIGH',
      dmeEscalationApplied: false,
      recommendation: 'URGENT Retina Specialist Referral within 2 to 4 weeks. High risk of 1-year progression to Proliferative DR (~50%). Prompt anti-VEGF or PRP evaluation required.',
      urgencyLevel: 'urgent',
      contributingFactors: [
        'Fundus: Grade 3 (Satisfies 4:2:1 international consensus: multi-quadrant hemorrhages & venous beading)',
        'OCT: Severe DME detected with 96.8% confidence (central thickness 440 µm)',
        'Clinical: HbA1c 9.9% + BP 158/94 indicates severe systemic microvascular breakdown',
      ],
      syntheticMode: true,
    },
  },
  {
    id: 'case-pdr-05',
    name: 'Proliferative Diabetic Retinopathy (PDR)',
    patientCode: 'PT-9943-PDR',
    demographics: '64yo Male, Type 2 DM (19 yrs), HbA1c 11.2%',
    drGrade: 4,
    octType: 'DME',
    description: 'Neovascularization of the disc (NVD), preretinal boat-shaped hemorrhage, high risk of tractional detachment.',
    clinicalMetadata: {
      hba1c: 11.2,
      diabetesDurationYears: 19,
      systolicBp: 165,
      diastolicBp: 98,
      serumCreatinine: 1.85,
      age: 64,
      bmi: 28.6,
      insulinTherapy: true,
      priorLaser: true,
      visualAcuityLogMar: 0.7, // ~20/100 Snellen
    },
    expectedTriage: {
      sessionId: 'sess-9943-pdr',
      timestamp: new Date().toISOString(),
      patientId: 'PT-9943-PDR',
      patientName: 'Case 5 (High-Risk PDR)',
      fundusImageName: 'aptos_pdr_4882.png',
      octImageName: 'oct_kermany_dme_402.png',
      fundusImageUrl: generateFundusSvg(4, 'normal'),
      fundusClaheUrl: generateFundusSvg(4, 'clahe'),
      fundusCamUrl: generateFundusSvg(4, 'gradcam'),
      octImageUrl: generateOctSvg('DME', 'scan'),
      octCamUrl: generateOctSvg('DME', 'gradcam'),
      fundus: {
        grade: 4,
        gradeLabel: 'Proliferative DR (PDR)',
        probabilities: [0.000, 0.005, 0.025, 0.090, 0.880],
        inferenceMs: 156,
        camHotspots: [
          { x: 170, y: 245, radius: 55, label: 'Neovascularization of Disc (NVD) High-Risk Frond', intensity: 0.98 },
          { x: 375, y: 305, radius: 60, label: 'Preretinal Subhyaloid Hemorrhage', intensity: 0.94 },
          { x: 360, y: 130, radius: 45, label: 'Peripheral Retinal Neovascularization (NVE)', intensity: 0.87 },
        ],
        featuresDetected: ['Neovascularization of the optic disc (NVD)', 'Preretinal subhyaloid hemorrhage', 'Prior laser photocoagulation scars'],
      },
      oct: {
        present: true,
        predictedClass: 'DME',
        dmeDetected: true,
        dmeProbability: 0.982,
        classProbabilities: { Normal: 0.003, DME: 0.982, CNV: 0.012, Drusen: 0.003 },
        inferenceMs: 110,
        retinalLayerFindings: ['Vitreomacular traction with subretinal fluid', 'Cystoid macular edema', 'Disrupted inner limiting membrane'],
      },
      metadata: {
        provided: true,
        predictedGrade: 4,
        riskScore: 0.95,
        probabilities: [0.00, 0.01, 0.04, 0.15, 0.80],
        shapValues: [
          { feature: 'HbA1c (11.2%)', featureKey: 'hba1c', value: '11.2%', shapValue: +0.78, impact: 'increases_risk', clinicalContext: 'Extreme glycemic toxicity drives maximal angiogenic VEGF cascade causing fragile neovessel sprouting' },
          { feature: 'Duration (19 yrs)', featureKey: 'diabetesDurationYears', value: '19 yrs', shapValue: +0.45, impact: 'increases_risk', clinicalContext: 'Near two-decade disease exposure creates near-universal microvascular non-perfusion' },
          { feature: 'Prior Laser Treatment', featureKey: 'priorLaser', value: 'Yes (Laser)', shapValue: +0.35, impact: 'increases_risk', clinicalContext: 'Marker of pre-existing advanced proliferative pathology requiring rescue photocoagulation' },
        ],
        top3RiskDrivers: ['HbA1c 11.2% (extreme angiogenic drive)', '19-year disease duration', 'History of prior laser photocoagulation'],
        inferenceMs: 19,
        syntheticMode: true,
      },
      clinicalInput: {
        hba1c: 11.2,
        diabetesDurationYears: 19,
        systolicBp: 165,
        diastolicBp: 98,
        serumCreatinine: 1.85,
        age: 64,
        bmi: 28.6,
        insulinTherapy: true,
        priorLaser: true,
        visualAcuityLogMar: 0.7,
      },
      rawFusionScore: 3.75,
      finalGrade: 4,
      gradeLabel: 'Proliferative DR (PDR)',
      confidence: 'HIGH',
      dmeEscalationApplied: false,
      recommendation: 'IMMEDIATE Vitreoretinal Specialist Referral within 24 to 72 hours. Urgent panretinal photocoagulation (PRP) and/or intravitreal anti-VEGF injection indicated to prevent severe irreversible vision loss or tractional retinal detachment.',
      urgencyLevel: 'urgent',
      contributingFactors: [
        'Fundus: Grade 4 (High-risk neovascularization of optic disc NVD + preretinal hemorrhage)',
        'OCT: Concomitant diabetic macular edema and vitreomacular traction detected',
        'Clinical: HbA1c 11.2% over 19 years + renal impairment indicates severe systemic end-organ compromise',
      ],
      syntheticMode: true,
    },
  },
];
