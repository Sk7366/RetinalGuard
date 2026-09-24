import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Cpu,
  Download,
  Eye,
  FileCheck,
  FileDown,
  FileText,
  HeartHandshake,
  HelpCircle,
  Info,
  Layers,
  Loader2,
  MapPin,
  Maximize2,
  Pause,
  Play,
  Printer,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Square,
  Stethoscope,
  Trash2,
  Upload,
  User,
  Users,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';
import { voiceService, VoicePlaybackState } from '../services/voiceService';
import { DR_GRADES } from '../data/benchmarks';
import {
  generateFundusSvg,
  generateOctSvg,
  PRESET_CASES,
  PresetPatientCase,
} from '../data/sampleCases';
import { MOCK_SCREENING_CENTERS } from '../mock/mockData';
import { screeningApi } from '../services/screeningApi';
import {
  ClinicalMetadata,
  DRGrade,
  FundusAnalysis,
  ImageQualityAssessment,
  MultimodalTriageResult,
  OCTAnalysis,
  ReferralRecord,
} from '../types';
import { executeMultimodalFusion, predictMetadataRisk } from '../utils/fusionEngine';
import { generateClinicalPdfReport } from '../utils/pdfGenerator';
import { ImageQualityStep } from './ImageQualityStep';
import { ImageUploader } from './ImageUploader';
import { RiskChip } from './RiskChip';
import { ScreeningVoiceGuide } from './ScreeningVoiceGuide';

export type ScreeningStepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

interface ScreeningFlowProps {
  onComplete: (result: MultimodalTriageResult) => void;
  initialPreset?: PresetPatientCase | null;
}

export const ScreeningFlow: React.FC<ScreeningFlowProps> = ({ onComplete, initialPreset }) => {
  const { language, t } = useTranslation();

  // Current active workflow step (1 to 9)
  const [currentStep, setCurrentStep] = useState<ScreeningStepNumber>(1);
  const [maxStepReached, setMaxStepReached] = useState<ScreeningStepNumber>(1);

  // Voice Guidance State
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState<boolean>(true);
  const [voiceState, setVoiceState] = useState<VoicePlaybackState>(voiceService.getState());

  useEffect(() => {
    const unsub = voiceService.subscribe((s) => setVoiceState(s));
    return () => unsub();
  }, []);

  // Localized Voice Instructions for each step
  const STEP_INSTRUCTIONS: Record<ScreeningStepNumber, Record<string, string>> = {
    1: {
      en: "Step 1: Please enter the patient and screening information to register the case.",
      hi: "चरण 1: कृपया रोगी और जांच की जानकारी दर्ज करें।",
      kn: "ಹಂತ 1: ದಯವಿಟ್ಟು ರೋಗಿಯ ಮತ್ತು ತಪಾಸಣೆಯ ಮಾಹಿತಿಯನ್ನು ನಮೂದಿಸಿ.",
      ta: "படி 1: நோயாளி மற்றும் பரிசோதனை விவரங்களை உள்ளிடவும்.",
      te: "దశ 1: దయచేసి రోగి మరియు స్క్రీనింగ్ వివరాలను నమోదు చేయండి.",
      ml: "ഘട്ടം 1: രോഗിയുടെയും പരിശോധനയുടെയും വിവരങ്ങൾ നൽകുക.",
    },
    2: {
      en: "Step 2: Now capture or upload the retinal fundus image.",
      hi: "चरण 2: अब रेटिना फंडस की तस्वीर लें या अपलोड करें।",
      kn: "ಹಂತ 2: ಈಗ ರೆಟಿನಾ ಫಂಡಸ್ ಚಿತ್ರವನ್ನು ಸೆರೆಹಿಡಿಯಿರಿ ಅಥವಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
      ta: "படி 2: விழித்திரை புகைப்படத்தை எடுக்கவும் அல்லது பதிவேற்றவும்.",
      te: "దశ 2: రెటీనా ఫండస్ చిత్రాన్ని తీయండి లేదా అప్‌లోడ్ చేయండి.",
      ml: "ഘട്ടം 2: റെറ്റിന ഫണ്ടസ് ചിത്രം എടുക്കുകയോ അപ്‌ലോഡ് ചെയ്യുകയോ ചെയ്യുക.",
    },
    3: {
      en: "Step 3: Image quality check. Ensure the retina is sharp and clearly illuminated.",
      hi: "चरण 3: छवि गुणवत्ता जांच। सुनिश्चित करें कि रेटिना स्पष्ट और पर्याप्त प्रकाश में है।",
      kn: "ಹಂತ 3: ಚಿತ್ರದ ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆ. ರೆಟಿನಾ ಸ್ಪಷ್ಟವಾಗಿದೆ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
      ta: "படி 3: படத்தின் தரம் சரிபார்ப்பு. விழித்திரை தெளிவாக உள்ளதா என்பதை உறுதிப்படுத்தவும்.",
      te: "దశ 3: చిత్ర నాణ్యత తనిఖీ. రెటీనా స్పష్టంగా ఉందని నిర్ధారించుకోండి.",
      ml: "ഘട്ടം 3: ചിത്രത്തിന്റെ ഗുണനിലവാരം പരിശോധിക്കുക. റെറ്റിന വ്യക്തമാണെന്ന് ഉറപ്പാക്കുക.",
    },
    4: {
      en: "Step 4: If an OCT scan is available, you can add it here, or proceed with fundus only.",
      hi: "चरण 4: यदि ओसीटी स्कैन उपलब्ध है, तो इसे जोड़ें, अन्यथा आगे बढ़ें।",
      kn: "ಹಂತ 4: ಒಸಿಟಿ ಸ್ಕ್ಯಾನ್ ಲಭ್ಯವಿದ್ದರೆ ಸೇರಿಸಿ, ಅಥವಾ ಮುಂದುವರಿಯಿರಿ.",
      ta: "படி 4: OCT ஸ்கேன் இருந்தால் சேர்க்கவும், அல்லது தொடரவும்.",
      te: "దశ 4: OCT స్కాన్ ఉంటే జోడించండి, లేదంటే కొనసాగండి.",
      ml: "ഘട്ടം 4: OCT സ്കാൻ ഉണ്ടെങ്കിൽ ചേർക്കുക, അല്ലെങ്കിൽ തുടരുക.",
    },
    5: {
      en: "Step 5: Review diabetes duration and clinical context to enhance prediction accuracy.",
      hi: "चरण 5: सटीकता बढ़ाने के लिए मधुमेह की अवधि और नैदानिक संदर्भ की समीक्षा करें।",
      kn: "ಹಂತ 5: ಮಧುಮೇಹದ ಅವಧಿ ಮತ್ತು ವೈದ್ಯಕೀಯ ಹಿನ್ನೆಲೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.",
      ta: "படி 5: துல்லியத்தை அதிகரிக்க நீரிழிவு காலம் மற்றும் மருத்துவ சூழலை மதிப்பாய்வு செய்யவும்.",
      te: "దశ 5: ఖచ్చితత్వం కోసం మధుమేహం వ్యవధి మరియు ఇతర వివరాలను సమీక్షించండి.",
      ml: "ഘട്ടം 5: കൃത്യത ഉറപ്പാക്കാൻ പ്രമേഹ വിവരങ്ങൾ പരിശോധിക്കുക.",
    },
    6: {
      en: "Step 6: RetinaGuard is analyzing the retinal images using multimodal deep learning.",
      hi: "चरण 6: रेटिनागार्ड बहुविध डीप लर्निंग मॉडल के साथ छवियों का विश्लेषण कर रहा है।",
      kn: "ಹಂತ 6: ರೆಟಿನಾಗಾರ್ಡ್ ಮಲ್ಟಿಮೋಡಲ್ ಡೀಪ್ ಲರ್ನಿಂಗ್ ಮೂಲಕ ಚಿತ್ರಗಳನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ.",
      ta: "படி 6: ரெட்டினாகார்ட் டீப் லேர்னிங் முறையில் படங்களை ஆய்வு செய்கிறது.",
      te: "దశ 6: రెటీనాగార్డ్ డీప్ లెర్నింగ్ ద్వారా చిత్రాలను విశ్లేషిస్తోంది.",
      ml: "ഘട്ടം 6: റെറ്റിനാഗാർഡ് ഡീപ് ലേണിംഗ് വഴി ചിത്രങ്ങൾ വിശകലനം ചെയ്യുന്നു.",
    },
    7: {
      en: "Step 7: Multimodal explanation ready. Inspect Grad-CAM heatmap and feature contributions.",
      hi: "चरण 7: बहुविध व्याख्या तैयार है। ग्रेड-कैम और सुविधाओं के योगदान का निरीक्षण करें।",
      kn: "ಹಂತ 7: ಗ್ರ್ಯಾಡ್-ಕ್ಯಾಮ್ ಮತ್ತು ವೈಶಿಷ್ಟ್ಯಗಳ ವಿವರಣೆ ಸಿದ್ಧವಾಗಿದೆ.",
      ta: "படி 7: விளக்க வரைபடம் தயார். முக்கிய அம்சங்களை ஆய்வு செய்யவும்.",
      te: "దశ 7: గ్రాడ్-క్యామ్ మరియు ముఖ్య ఫీచర్స్ వివరణ సిద్ధంగా ఉంది.",
      ml: "ഘട്ടം 7: വിശദീകരണങ്ങൾ തയ്യാറാണ്. പ്രധാന മാറ്റങ്ങൾ പരിശോധിക്കുക.",
    },
    8: {
      en: "Step 8: Triage assessment and clinical report generated.",
      hi: "चरण 8: ट्राइएज मूल्यांकन और नैदानिक रिपोर्ट तैयार है।",
      kn: "ಹಂತ 8: ತಪಾಸಣಾ ಮೌಲ್ಯಮಾಪನ ಮತ್ತು ವರದಿ ಸಿದ್ಧವಾಗಿದೆ.",
      ta: "படி 8: மதிப்பீட்டு முடிவு மற்றும் அறிக்கை உருவாக்கப்பட்டது.",
      te: "దశ 8: స్క్రీనింగ్ అంచనా మరియు రిపోర్ట్ రూపొందించబడింది.",
      ml: "ഘട്ടം 8: പരിശോധനാ ഫലവും റിപ്പോർട്ടും തയ്യാറായിക്കഴിഞ്ഞു.",
    },
    9: {
      en: "Step 9: Review referral recommendation, assign specialist clinic, and send patient summary.",
      hi: "चरण 9: रेफरल सिफारिश की समीक्षा करें और विशेषज्ञ क्लिनिक को सौंपें।",
      kn: "ಹಂತ 9: ರೆಫರಲ್ ಶಿಫಾರಸನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ತಜ್ಞರ ಆಸ್ಪತ್ರೆಗೆ ನಿಯೋಜಿಸಿ.",
      ta: "படி 9: பரிந்துரையை மதிப்பாய்வு செய்து சிறப்பு மருத்துவமனைக்கு அனுப்பவும்.",
      te: "దశ 9: రెఫరల్ సిఫార్సును సమీక్షించి స్పెషలిస్ట్ క్లినిక్‌ను ఎంచుకోండి.",
      ml: "ഘട്ടം 9: നിർദ്ദേശം പരിശോധിച്ച് തുടർചികിത്സയ്ക്കായി അയക്കുക.",
    },
  };

  const speakStepInstruction = (stepNum: ScreeningStepNumber) => {
    const langDict = STEP_INSTRUCTIONS[stepNum] || STEP_INSTRUCTIONS[1];
    const text = langDict[language] || langDict['en'];
    voiceService.speak({
      text,
      title: `Step ${stepNum}`,
      lang: language as any,
      sectionId: `screening-step-${stepNum}`,
    });
  };

  // Helper to change step and track progress
  const goToStep = (step: ScreeningStepNumber) => {
    setCurrentStep(step);
    if (step > maxStepReached) {
      setMaxStepReached(step);
    }
    if (voiceGuidanceEnabled) {
      speakStepInstruction(step);
    }
  };

  const handleToggleVoiceGuidance = () => {
    const nextVal = !voiceGuidanceEnabled;
    setVoiceGuidanceEnabled(nextVal);
    if (nextVal) {
      speakStepInstruction(currentStep);
    } else {
      voiceService.stop();
    }
  };

  /* =========================================================================
     01: REGISTER SCREENING STATE
     ========================================================================= */
  const [patientId, setPatientId] = useState<string>(
    initialPreset ? initialPreset.patientCode : `PT-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [patientName, setPatientName] = useState<string>(
    initialPreset ? initialPreset.name : 'Ramesh Patel'
  );
  const [patientAge, setPatientAge] = useState<number>(initialPreset?.clinicalMetadata.age || 58);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [selectedCenterId, setSelectedCenterId] = useState<string>(MOCK_SCREENING_CENTERS[0].id);
  const [encounterType, setEncounterType] = useState<string>('Routine Diabetic Eye Screening');
  const [operatorName, setOperatorName] = useState<string>('Dr. Ananya Sharma (Optometrist)');
  const [cameraDevice, setCameraDevice] = useState<string>('Forus 3nethra Classic (45° Non-Mydriatic)');

  /* =========================================================================
     02: FUNDUS STATE
     ========================================================================= */
  const [selectedFundusGrade, setSelectedFundusGrade] = useState<DRGrade>(
    initialPreset ? initialPreset.drGrade : 2
  );
  const [fundusImageName, setFundusImageName] = useState<string>(
    initialPreset ? initialPreset.expectedTriage.fundusImageName : 'aptos_2019_sample_021.png'
  );
  const [customFundusUrl, setCustomFundusUrl] = useState<string | null>(null);
  const [showingClaheFundus, setShowingClaheFundus] = useState<boolean>(false);
  const [selectedEye, setSelectedEye] = useState<'OD' | 'OS'>('OD');

  // Resolved Fundus URLs
  const activeFundusUrl = customFundusUrl || generateFundusSvg(selectedFundusGrade, 'normal');
  const activeClaheUrl = generateFundusSvg(selectedFundusGrade, 'clahe');

  /* =========================================================================
     03: IMAGE QUALITY STATE
     ========================================================================= */
  const [qualityReport, setQualityReport] = useState<ImageQualityAssessment | null>(null);

  /* =========================================================================
     04: OPTIONAL OCT STATE
     ========================================================================= */
  const [includeOct, setIncludeOct] = useState<boolean>(true);
  const [selectedOctType, setSelectedOctType] = useState<'Normal' | 'DME' | 'CNV' | 'Drusen'>(
    initialPreset ? initialPreset.octType : 'DME'
  );
  const [octImageName, setOctImageName] = useState<string>(
    initialPreset ? initialPreset.expectedTriage.octImageName || 'oct_bscan_kermany_084.png' : 'oct_bscan_kermany_084.png'
  );
  const [customOctUrl, setCustomOctUrl] = useState<string | null>(null);

  const activeOctUrl = customOctUrl || generateOctSvg(selectedOctType, 'scan');

  /* =========================================================================
     05: OPTIONAL CLINICAL CONTEXT STATE
     ========================================================================= */
  const [includeMetadata, setIncludeMetadata] = useState<boolean>(true);
  const [clinicalData, setClinicalData] = useState<ClinicalMetadata>(
    initialPreset
      ? initialPreset.clinicalMetadata
      : {
          hba1c: 8.6,
          diabetesDurationYears: 10,
          systolicBp: 142,
          diastolicBp: 86,
          serumCreatinine: 1.2,
          age: 58,
          bmi: 28.5,
          insulinTherapy: true,
          priorLaser: false,
          visualAcuityLogMar: 0.3, // 20/40 Snellen
        }
  );

  /* =========================================================================
     06: ANALYSIS & PIPELINE STATE
     ========================================================================= */
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStage, setProcessingStage] = useState<number>(0);
  const [triageResult, setTriageResult] = useState<MultimodalTriageResult | null>(null);

  const processingSteps = [
    'Applying CLAHE local illumination normalization & Ben Graham transform (512×512)...',
    'Executing EfficientNet-B4 ONNX inference (5-class ordinal DR prediction)...',
    'Computing fundus Grad-CAM class activation maps across retinal vascular arcades...',
    includeOct
      ? 'Running DenseNet-121 ONNX on cross-sectional OCT B-scan for DME fluid detection...'
      : 'Skipping OCT B-scan module (imaging omitted by screener)...',
    includeMetadata
      ? 'Evaluating XGBoost clinical metadata model & computing SHAP feature attributions...'
      : 'Skipping laboratory metadata module (context omitted by screener)...',
    'Synthesizing rule-based multimodal triage score & checking DME escalation criteria...',
  ];

  /* =========================================================================
     07: EXPLANATION VIEW STATE
     ========================================================================= */
  const [fundusCamMode, setFundusCamMode] = useState<'original' | 'clahe' | 'gradcam'>('gradcam');
  const [octCamMode, setOctCamMode] = useState<'scan' | 'gradcam'>('gradcam');
  const [camOpacity, setCamOpacity] = useState<number>(0.75);

  /* =========================================================================
     09: REFERRAL / FOLLOW-UP STATE
     ========================================================================= */
  const [referralUrgency, setReferralUrgency] = useState<string>('Priority Specialist Referral');
  const [assignedClinic, setAssignedClinic] = useState<string>(MOCK_SCREENING_CENTERS[1].name);
  const [referralNotes, setReferralNotes] = useState<string>(
    'Patient screened at community mobile unit. Multimodal review confirmed NPDR with DME risk.'
  );
  const [patientPhone, setPatientPhone] = useState<string>('+91 98450 12345');
  const [sendSmsNotification, setSendSmsNotification] = useState<boolean>(true);
  const [referralDispatched, setReferralDispatched] = useState<ReferralRecord | null>(null);
  const [isDispatchingReferral, setIsDispatchingReferral] = useState<boolean>(false);

  /* =========================================================================
     PRESET LOADER HANDLER
     ========================================================================= */
  const applyPreset = (preset: PresetPatientCase) => {
    setSelectedFundusGrade(preset.drGrade);
    setFundusImageName(preset.expectedTriage.fundusImageName);
    setCustomFundusUrl(null);

    setIncludeOct(true);
    setSelectedOctType(preset.octType);
    setOctImageName(preset.expectedTriage.octImageName || 'oct_scan.png');
    setCustomOctUrl(null);

    setIncludeMetadata(true);
    setPatientId(preset.patientCode);
    setPatientName(preset.name);
    setPatientAge(preset.clinicalMetadata.age);
    setClinicalData(preset.clinicalMetadata);
  };

  /* =========================================================================
     ANALYSIS EXECUTION (STEP 06)
     ========================================================================= */
  const handleExecuteAnalysis = async () => {
    setIsProcessing(true);
    setProcessingStage(0);
    goToStep(6);

    for (let i = 0; i < processingSteps.length; i++) {
      setProcessingStage(i);
      await new Promise((r) => setTimeout(r, 400));
    }

    // Compute Fundus Analysis
    const fundusGrade = selectedFundusGrade;
    const probs: [number, number, number, number, number] = [0, 0, 0, 0, 0];
    probs[fundusGrade] = 0.86;
    if (fundusGrade > 0) probs[fundusGrade - 1] = 0.09;
    if (fundusGrade < 4) probs[fundusGrade + 1] = 0.05;

    const fundusAnalysis: FundusAnalysis = {
      grade: fundusGrade,
      gradeLabel: `Grade ${fundusGrade}`,
      probabilities: probs,
      inferenceMs: 142,
      camHotspots: [
        { x: 340, y: 230, radius: 45, label: 'Macular Hard Exudate Circinate Cluster', intensity: 0.88 },
        { x: 260, y: 190, radius: 35, label: 'Intraretinal Microaneurysms / Blot Hemorrhages', intensity: 0.76 },
      ],
      featuresDetected:
        fundusGrade === 0
          ? ['Normal optic disc rim', 'Foveal reflex sharp', 'Clear vascular arcades']
          : fundusGrade === 1
          ? ['Isolated microaneurysms in temporal arcade', 'No hard exudates']
          : fundusGrade === 2
          ? ['Microaneurysms in multiple quadrants', 'Hard exudate circinate ring', 'Blot hemorrhages']
          : fundusGrade === 3
          ? ['Intraretinal hemorrhages >20 in 4 quadrants', 'Definite venous beading', 'Cotton-wool spots']
          : ['Optic disc neovascularization (NVD)', 'Preretinal hemorrhage', 'Fibrovascular proliferation'],
    };

    // Compute OCT Analysis if requested
    let octAnalysis: OCTAnalysis | undefined = undefined;
    if (includeOct) {
      const isDme = selectedOctType === 'DME';
      octAnalysis = {
        present: true,
        predictedClass: selectedOctType,
        dmeDetected: isDme,
        dmeProbability: isDme ? 0.948 : 0.032,
        classProbabilities: {
          Normal: selectedOctType === 'Normal' ? 0.94 : 0.02,
          DME: selectedOctType === 'DME' ? 0.95 : 0.03,
          CNV: selectedOctType === 'CNV' ? 0.92 : 0.02,
          Drusen: selectedOctType === 'Drusen' ? 0.91 : 0.03,
        },
        inferenceMs: 96,
        retinalLayerFindings: isDme
          ? [
              'Intraretinal cystoid fluid spaces in outer nuclear layer',
              'Subretinal fluid detachment',
              'Central subfield thickness 398 µm (thickened)',
            ]
          : [
              'Normal foveal depression intact',
              'Preserved IS/OS ellipsoid zone band',
              'Normal central thickness 245 µm',
            ],
      };
    }

    // Compute Metadata Analysis if requested
    let metadataAnalysis = undefined;
    if (includeMetadata) {
      metadataAnalysis = predictMetadataRisk(clinicalData);
    }

    // Run Late-Fusion Decision Engine
    const result = executeMultimodalFusion({
      fundus: fundusAnalysis,
      oct: octAnalysis,
      metadata: metadataAnalysis,
      clinicalInput: clinicalData,
      patientId,
      patientName,
      fundusImageName,
      octImageName: includeOct ? octImageName : undefined,
      fundusImageUrl: activeFundusUrl,
      fundusClaheUrl: activeClaheUrl,
      fundusCamUrl: generateFundusSvg(selectedFundusGrade, 'gradcam'),
      octImageUrl: includeOct ? activeOctUrl : undefined,
      octCamUrl: includeOct ? generateOctSvg(selectedOctType, 'gradcam') : undefined,
    });

    setTriageResult(result);
    setIsProcessing(false);
    goToStep(7); // Advance directly to 07 Explanation
  };

  /* =========================================================================
     DISPATCH REFERRAL (STEP 09)
     ========================================================================= */
  const handleDispatchReferral = async () => {
    if (!triageResult) return;
    setIsDispatchingReferral(true);

    try {
      const created = await screeningApi.createReferral(
        triageResult,
        assignedClinic,
        referralNotes
      );
      setReferralDispatched(created);
    } catch (err) {
      console.warn('Failed to dispatch referral via API, fallback locally:', err);
    } finally {
      setIsDispatchingReferral(false);
    }
  };

  /* =========================================================================
     WORKFLOW STEPS DEFINITION FOR NAVIGATION BAR
     ========================================================================= */
  const stepsList = [
    { num: 1, title: t('step1RegisterShort', 'Register'), shortTitle: '01 Register' },
    { num: 2, title: t('step2FundusShort', 'Fundus'), shortTitle: '02 Fundus' },
    { num: 3, title: t('step3QualityShort', 'Quality'), shortTitle: '03 Quality' },
    { num: 4, title: t('step4OctShort', 'Optional OCT'), shortTitle: '04 OCT' },
    { num: 5, title: t('step5ContextShort', 'Optional Context'), shortTitle: '05 Context' },
    { num: 6, title: t('step6AnalysisShort', 'Analysis'), shortTitle: '06 Analysis' },
    { num: 7, title: t('step7ExplanationShort', 'Explanation'), shortTitle: '07 Explanation' },
    { num: 8, title: t('step8TriageShort', 'Triage'), shortTitle: '08 Triage' },
    { num: 9, title: t('step9ReferralShort', 'Referral'), shortTitle: '09 Referral' },
  ];

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto" id="screening-flow-container">
      {/* =====================================================================
          SCREENING VOICE GUIDE (SCREENING HELPER ROLE)
          Prominently placed, with OFF/ON control, Play, Pause, Repeat, Stop
          ===================================================================== */}
      <ScreeningVoiceGuide
        role="helper"
        currentStep={currentStep <= 7 ? currentStep : 7}
        totalSteps={9}
        stepContext={{
          hasImageUploaded: Boolean(customFundusUrl || activeFundusUrl),
          hasOctUploaded: Boolean(customOctUrl || (includeOct && activeOctUrl)),
          isAnalyzing: isProcessing,
          isComplete: Boolean(triageResult) || currentStep >= 7,
        }}
      />

      {/* =====================================================================
          STEPPER PROGRESS HEADER (9 STEPS)
          ===================================================================== */}
      <div className="bg-white rounded-3xl border border-[#EFE4DC] p-4 sm:p-5 shadow-xs">
        {/* Desktop / Tablet Stepper */}
        <div className="hidden lg:grid grid-cols-9 gap-1.5 items-center">
          {stepsList.map((s) => {
            const stepNum = s.num as ScreeningStepNumber;
            const isActive = currentStep === stepNum;
            const isCompleted = maxStepReached > stepNum || (triageResult && stepNum <= 6);
            const isClickable = stepNum <= maxStepReached || (triageResult !== null && stepNum <= 9);

            return (
              <button
                key={s.num}
                type="button"
                id={`stepper-btn-step-${s.num}`}
                disabled={!isClickable && !isActive}
                onClick={() => isClickable && setCurrentStep(stepNum)}
                className={`flex flex-col items-center text-center p-2 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-[#FFEDD5] text-[#EA580C] font-bold shadow-2xs'
                    : isCompleted
                    ? 'text-[#15803D] hover:bg-[#F0FDF4] cursor-pointer'
                    : isClickable
                    ? 'text-[#2E2628] hover:bg-[#FAF8F6] cursor-pointer'
                    : 'text-[#B0A3A6] opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                    isActive
                      ? 'bg-[#EA580C] text-white'
                      : isCompleted
                      ? 'bg-[#DCFCE7] text-[#15803D]'
                      : 'bg-[#F5F1ED] text-[#6E5C5F]'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span className="text-[11px] truncate w-full leading-tight font-medium">
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile / Compact Stepper Bar */}
        <div className="lg:hidden flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-[#EA580C] text-white font-bold text-xs flex items-center justify-center shrink-0">
              0{currentStep}
            </span>
            <div>
              <div className="text-xs font-bold text-[#2E2628]">
                {stepsList[currentStep - 1].title}
              </div>
              <div className="text-[10px] text-[#6E5C5F]">{t('step', 'Step')} {currentStep} {t('ofWord', 'of')} 09</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {currentStep > 1 && (
              <button
                type="button"
                id="btn-mobile-prev-step"
                onClick={() => goToStep((currentStep - 1) as ScreeningStepNumber)}
                className="p-1.5 rounded-xl border border-[#EFE4DC] text-[#2E2628] hover:bg-[#FAF8F6]"
                title={t('prevStep', 'Previous step')}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            {currentStep < 9 && (currentStep < maxStepReached || triageResult) && (
              <button
                type="button"
                id="btn-mobile-next-step"
                onClick={() => goToStep((currentStep + 1) as ScreeningStepNumber)}
                className="p-1.5 rounded-xl bg-[#EA580C] text-white hover:bg-[#C2410C]"
                title={t('nextStep', 'Next step')}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          STEP 01: REGISTER SCREENING
          ===================================================================== */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EFE4DC]">
            <div>
              <h2 className="text-xl font-bold text-[#2E2628]">{t('step01Title', 'Step 01: Register Screening Encounter')}</h2>
              <p className="text-xs text-[#6E5C5F] mt-0.5">
                {t('step01Sub', 'Record patient demographics, field camp location, and capture device parameters.')}
              </p>
            </div>

            {/* Benchmark Preset Quick Loader */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-[#6E5C5F]">{t('loadBenchmarkCase', 'Load Benchmark Case:')}</span>
              {PRESET_CASES.map((preset, idx) => (
                <button
                  key={preset.id}
                  type="button"
                  id={`btn-load-preset-${idx}`}
                  onClick={() => applyPreset(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                    patientId === preset.patientCode
                      ? 'bg-[#EA580C] text-white border-[#EA580C]'
                      : 'bg-[#FFFDFB] text-[#2E2628] border-[#EFE4DC] hover:border-[#EA580C]'
                  }`}
                  title={preset.description}
                >
                  {t('caseWord', 'Case')} {idx + 1} ({preset.drGrade === 0 ? t('normal', 'Normal') : `Gr.${preset.drGrade}`})
                </button>
              ))}
            </div>
          </div>

          {/* Registration Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {/* Patient MRN / Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2E2628] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>{t('patientMrnId', 'Patient MRN / ID')}</span>
              </label>
              <input
                type="text"
                id="input-patient-id"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] text-xs text-[#2E2628] focus:outline-none focus:border-[#EA580C] font-mono"
                placeholder="e.g. PT-8821"
              />
            </div>

            {/* Patient Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2E2628]">{t('fullName', 'Full Name')}</label>
              <input
                type="text"
                id="input-patient-name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] text-xs text-[#2E2628] focus:outline-none focus:border-[#EA580C]"
                placeholder="e.g. Ramesh Patel"
              />
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2E2628]">{t('ageYrs', 'Age (yrs)')}</label>
                <input
                  type="number"
                  id="input-patient-age"
                  value={patientAge}
                  onChange={(e) => setPatientAge(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#EFE4DC] text-xs text-[#2E2628] focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2E2628]">{t('gender', 'Gender')}</label>
                <select
                  id="select-patient-gender"
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as any)}
                  className="w-full px-2 py-2.5 rounded-xl border border-[#EFE4DC] text-xs text-[#2E2628] focus:outline-none focus:border-[#EA580C] bg-white"
                >
                  <option value="Male">{t('genderMale', 'Male')}</option>
                  <option value="Female">{t('genderFemale', 'Female')}</option>
                  <option value="Other">{t('genderOther', 'Other')}</option>
                </select>
              </div>
            </div>

            {/* Facility / Camp Center */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-[#2E2628] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>{t('screeningFacilityCamp', 'Screening Facility / Camp Site')}</span>
              </label>
              <select
                id="select-screening-facility"
                value={selectedCenterId}
                onChange={(e) => setSelectedCenterId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] text-xs text-[#2E2628] focus:outline-none focus:border-[#EA580C] bg-white"
              >
                {MOCK_SCREENING_CENTERS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city}, {c.state}) {c.isCampActive ? `— [${t('activeCamp', 'Active Camp')}]` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Encounter Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2E2628]">{t('encounterReason', 'Encounter Reason')}</label>
              <select
                id="select-encounter-reason"
                value={encounterType}
                onChange={(e) => setEncounterType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#EFE4DC] text-xs text-[#2E2628] focus:outline-none focus:border-[#EA580C] bg-white"
              >
                <option value="Routine Diabetic Eye Screening">{t('routineDiabeticEyeScreening', 'Routine Diabetic Eye Screening')}</option>
                <option value="Vision Change / Blurry Sight">{t('visionChangeBlurrySight', 'Vision Change / Blurry Sight')}</option>
                <option value="Camp Mass Community Outreach">{t('campMassCommunityOutreach', 'Camp Mass Community Outreach')}</option>
                <option value="Post-Laser Treatment Follow-up">{t('postLaserTreatmentFollowUp', 'Post-Laser Treatment Follow-up')}</option>
              </select>
            </div>

            {/* Operator / Screener */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2E2628]">{t('screenerTechnician', 'Screener / Technician')}</label>
              <input
                type="text"
                id="input-operator-name"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] text-xs text-[#2E2628] focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            {/* Camera Model */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-[#2E2628]">{t('cameraEquipment', 'Camera Equipment')}</label>
              <input
                type="text"
                id="input-camera-model"
                value={cameraDevice}
                onChange={(e) => setCameraDevice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] text-xs text-[#2E2628] focus:outline-none focus:border-[#EA580C]"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-[#EFE4DC] flex items-center justify-end">
            <button
              type="button"
              id="btn-register-continue"
              onClick={() => goToStep(2)}
              className="px-6 py-2.5 rounded-2xl bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C] transition-colors shadow-xs flex items-center gap-2"
            >
              <span>{t('saveContinueStep02', 'Save & Continue to Step 02 (Fundus Capture)')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 02: FUNDUS PHOTO (REQUIRED)
          ===================================================================== */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EFE4DC]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#2E2628]">{t('step02Title', 'Step 02: Fundus Photography')}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#DC2626]">
                  {t('requiredModality', 'Required Modality')}
                </span>
              </div>
              <p className="text-xs text-[#6E5C5F] mt-0.5">
                {t('step02Sub', 'Upload or capture a 45° macular-centered color fundus photograph. Drag and drop, replace, or retake as needed.')}
              </p>
            </div>

            {/* Eye Selection OD / OS */}
            <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F6] rounded-xl border border-[#EFE4DC]">
              <span className="text-[10px] font-bold text-[#6E5C5F] px-2 uppercase">{t('eyeExamined', 'Eye Examined:')}</span>
              <button
                type="button"
                id="btn-eye-od"
                onClick={() => setSelectedEye('OD')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  selectedEye === 'OD'
                    ? 'bg-[#EA580C] text-white shadow-2xs'
                    : 'bg-white text-[#2E2628] hover:bg-[#FFF7ED]'
                }`}
              >
                {t('odRightEye', 'OD (Right Eye)')}
              </button>
              <button
                type="button"
                id="btn-eye-os"
                onClick={() => setSelectedEye('OS')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  selectedEye === 'OS'
                    ? 'bg-[#EA580C] text-white shadow-2xs'
                    : 'bg-white text-[#2E2628] hover:bg-[#FFF7ED]'
                }`}
              >
                {t('osLeftEye', 'OS (Left Eye)')}
              </button>
            </div>
          </div>

          {/* Reusable Image Uploader with Drag/Drop, Preview, Replace, Remove, Retake */}
          <ImageUploader
            label={t('retinalSurfaceFundusPhoto', 'Retinal Surface Fundus Photograph')}
            sublabel={t('standardMacularFieldSub', 'Standard macular field centered between optic disc and fovea (512×512 Ben Graham normalized input)')}
            required={true}
            currentImageUrl={activeFundusUrl}
            currentImageName={fundusImageName}
            onImageChange={(url, name) => {
              setCustomFundusUrl(url);
              setFundusImageName(name || 'custom_fundus.png');
            }}
            onRetakePrompt={() => {
              setCustomFundusUrl(null);
            }}
            enableClaheToggle={true}
            claheUrl={activeClaheUrl}
            showingClahe={showingClaheFundus}
            onToggleClahe={() => setShowingClaheFundus(!showingClaheFundus)}
            presets={[
              {
                id: 'fundus-0',
                label: 'Normal (Gr.0)',
                description: 'Clear healthy fundus without vascular lesions',
                imageUrl: generateFundusSvg(0, 'normal'),
                fileName: 'aptos_norm_0491.png',
              },
              {
                id: 'fundus-1',
                label: 'Mild (Gr.1)',
                description: 'Microaneurysms only in temporal arcade',
                imageUrl: generateFundusSvg(1, 'normal'),
                fileName: 'aptos_mild_1022.png',
              },
              {
                id: 'fundus-2',
                label: 'Moderate (Gr.2)',
                description: 'Hard exudates circinate ring & blot hemorrhages',
                imageUrl: generateFundusSvg(2, 'normal'),
                fileName: 'aptos_mod_3391.png',
              },
              {
                id: 'fundus-3',
                label: 'Severe (Gr.3)',
                description: 'Intraretinal hemorrhages in 4 quadrants, venous beading',
                imageUrl: generateFundusSvg(3, 'normal'),
                fileName: 'aptos_sev_5901.png',
              },
              {
                id: 'fundus-4',
                label: 'PDR (Gr.4)',
                description: 'Neovascularization at disc (NVD) & preretinal hemorrhage',
                imageUrl: generateFundusSvg(4, 'normal'),
                fileName: 'aptos_pdr_8820.png',
              },
            ]}
            selectedPresetId={`fundus-${selectedFundusGrade}`}
            onSelectPreset={(presetId) => {
              const grade = Number(presetId.replace('fundus-', '')) as DRGrade;
              setSelectedFundusGrade(grade);
              setCustomFundusUrl(null);
              setFundusImageName(`aptos_benchmark_grade_${grade}.png`);
            }}
            retakeInstructions={[
              'Darken examination room to induce natural pupil dilation without eye drops.',
              'Instruct patient to look at the green fixation cross and blink twice.',
              'Adjust chin rest joystick so corneal reflection light dots coalesce into one point.',
              'Trigger camera shutter cleanly without shaking the unit.',
            ]}
            helperHint={t('fundusHelperHint', 'Fundus is required for deep learning feature extraction.')}
            idPrefix="fundus-uploader"
          />

          {/* Navigation Action Buttons */}
          <div className="pt-4 border-t border-[#EFE4DC] flex items-center justify-between">
            <button
              type="button"
              id="btn-fundus-back"
              onClick={() => goToStep(1)}
              className="px-5 py-2.5 rounded-2xl bg-white border border-[#EFE4DC] text-[#2E2628] text-xs font-bold hover:bg-[#FAF8F6] transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('backToStep01', 'Back to Step 01')}</span>
            </button>

            <button
              type="button"
              id="btn-fundus-continue"
              disabled={!activeFundusUrl}
              onClick={() => goToStep(3)}
              className="px-6 py-2.5 rounded-2xl bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C] transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              <span>{t('verifyImageQualityStep03', 'Verify Image Quality (Step 03)')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 03: IMAGE QUALITY (SEPARATE LAYER, GOOD/UNCERTAIN/UNGRADABLE)
          ===================================================================== */}
      {currentStep === 3 && (
        <ImageQualityStep
          fundusImageName={fundusImageName}
          fundusImageUrl={activeFundusUrl}
          onBackToFundus={() => goToStep(2)}
          onRetake={() => {
            setCustomFundusUrl(null);
            goToStep(2);
          }}
          onProceed={() => goToStep(4)}
          onQualityAssessed={(report) => setQualityReport(report)}
        />
      )}

      {/* =====================================================================
          STEP 04: OPTIONAL OCT (DRAG/DROP, PREVIEW, REPLACE, REMOVE, RETAKE)
          ===================================================================== */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EFE4DC]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#2E2628]">{t('step04Title', 'Step 04: Optical Coherence Tomography (OCT)')}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F5F1ED] text-[#6E5C5F]">
                  {t('optionalModality', 'Optional Modality')}
                </span>
              </div>
              <p className="text-xs text-[#6E5C5F] mt-0.5">
                {t('step04Sub', 'SD-OCT cross-sectional B-scan resolves sub-surface macular edema fluid pockets and central retinal thickness.')}
              </p>
            </div>

            {/* Toggle Switch to Include or Skip OCT */}
            <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC]">
              <input
                type="checkbox"
                id="toggle-include-oct"
                checked={includeOct}
                onChange={(e) => setIncludeOct(e.target.checked)}
                className="w-4 h-4 text-[#EA580C] rounded focus:ring-[#EA580C]"
              />
              <span className="text-xs font-bold text-[#2E2628]">
                {includeOct ? t('octScanIncluded', 'OCT Scan Included') : t('skipOctFundusOnly', 'Skip OCT (Fundus Only)')}
              </span>
            </label>
          </div>

          {includeOct ? (
            <div className="space-y-4">
              <ImageUploader
                label={t('foveaCenteredOctBScan', 'Fovea-Centered SD-OCT B-Scan')}
                sublabel={t('octBScanSublabel', 'Cross-sectional optical reflectance scan processed by DenseNet-121 for sub-retinal fluid detection')}
                required={false}
                currentImageUrl={activeOctUrl}
                currentImageName={octImageName}
                onImageChange={(url, name) => {
                  setCustomOctUrl(url);
                  setOctImageName(name || 'custom_oct.png');
                }}
                onRetakePrompt={() => {
                  setCustomOctUrl(null);
                }}
                aspectRatioClass="aspect-[16/9]"
                presets={[
                  {
                    id: 'oct-normal',
                    label: 'Normal Fovea',
                    description: 'Crisp foveal pit depression and intact photoreceptor IS/OS ellipsoid zone band',
                    imageUrl: generateOctSvg('Normal', 'scan'),
                    fileName: 'oct_kermany_normal_12.png',
                  },
                  {
                    id: 'oct-dme',
                    label: 'DME (Cystoid Fluid)',
                    description: 'Intraretinal cystoid hyporeflective fluid pockets causing central thickening',
                    imageUrl: generateOctSvg('DME', 'scan'),
                    fileName: 'oct_kermany_dme_44.png',
                  },
                  {
                    id: 'oct-cnv',
                    label: 'CNV (Neovascular)',
                    description: 'Sub-retinal pigment epithelial neovascular membrane disruption',
                    imageUrl: generateOctSvg('CNV', 'scan'),
                    fileName: 'oct_kermany_cnv_08.png',
                  },
                  {
                    id: 'oct-drusen',
                    label: 'Drusen Deposits',
                    description: 'Undulating convex sub-RPE nodular lipid deposits',
                    imageUrl: generateOctSvg('Drusen', 'scan'),
                    fileName: 'oct_kermany_drusen_91.png',
                  },
                ]}
                selectedPresetId={`oct-${selectedOctType.toLowerCase()}`}
                onSelectPreset={(presetId) => {
                  const type =
                    presetId === 'oct-normal'
                      ? 'Normal'
                      : presetId === 'oct-dme'
                      ? 'DME'
                      : presetId === 'oct-cnv'
                      ? 'CNV'
                      : 'Drusen';
                  setSelectedOctType(type);
                  setCustomOctUrl(null);
                  setOctImageName(`oct_benchmark_${type.toLowerCase()}.png`);
                }}
                retakeInstructions={[
                  'Ensure patient is positioned upright with chin firmly planted in OCT chin cup.',
                  'Align iris camera until pupil is centered within the capture circle.',
                  'Instruct patient to fixate steadily on the blue central fixation star.',
                  'Monitor real-time B-scan signal quality bar (aim for signal strength index ≥ 7/10).',
                ]}
                helperHint={t('octHelperHint', 'OCT is optional. When provided, automated DME escalation logic evaluates cystoid fluid.')}
                idPrefix="oct-uploader"
              />
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] text-center space-y-2">
              <Eye className="w-8 h-8 text-[#6E5C5F] mx-auto opacity-70" />
              <div className="text-sm font-bold text-[#2E2628]">{t('octCrossSectionSkipped', 'OCT Cross-Section Skipped')}</div>
              <p className="text-xs text-[#6E5C5F] max-w-md mx-auto leading-relaxed">
                {t('octSkippedNotice', 'The AI pipeline will triage diabetic retinopathy based on 2D fundus photography and clinical metadata. Macular edema risk will be estimated via 2D hard exudate proximity.')}
              </p>
            </div>
          )}

          {/* Navigation Action Buttons */}
          <div className="pt-4 border-t border-[#EFE4DC] flex items-center justify-between">
            <button
              type="button"
              id="btn-oct-back"
              onClick={() => goToStep(3)}
              className="px-5 py-2.5 rounded-2xl bg-white border border-[#EFE4DC] text-[#2E2628] text-xs font-bold hover:bg-[#FAF8F6] transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('backToStep03Quality', 'Back to Step 03 (Quality)')}</span>
            </button>

            <button
              type="button"
              id="btn-oct-continue"
              onClick={() => goToStep(5)}
              className="px-6 py-2.5 rounded-2xl bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C] transition-colors shadow-xs flex items-center gap-2"
            >
              <span>{t('continueToStep05Context', 'Continue to Step 05 (Clinical Context)')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 05: OPTIONAL CLINICAL CONTEXT
          ===================================================================== */}
      {currentStep === 5 && (
        <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EFE4DC]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#2E2628]">{t('step05Title', 'Step 05: Patient Clinical Context')}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F5F1ED] text-[#6E5C5F]">
                  {t('optionalModality', 'Optional Modality')}
                </span>
              </div>
              <p className="text-xs text-[#6E5C5F] mt-0.5">
                {t('step05Sub', 'Laboratory metrics (HbA1c, duration, renal labs) processed via XGBoost surrogate with SHAP feature attribution.')}
              </p>
            </div>

            {/* Toggle Switch */}
            <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC]">
              <input
                type="checkbox"
                id="toggle-include-metadata"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="w-4 h-4 text-[#EA580C] rounded focus:ring-[#EA580C]"
              />
              <span className="text-xs font-bold text-[#2E2628]">
                {includeMetadata ? t('clinicalLabsIncluded', 'Clinical Labs Included') : t('skipClinicalContext', 'Skip Clinical Context')}
              </span>
            </label>
          </div>

          {includeMetadata ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {/* HbA1c */}
              <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2E2628]">{t('glycatedHemoglobinHbA1c', 'Glycated Hemoglobin (HbA1c)')}</label>
                  <span className="text-xs font-bold text-[#EA580C] font-mono">{clinicalData.hba1c}%</span>
                </div>
                <input
                  type="range"
                  id="slider-hba1c"
                  min="5.0"
                  max="14.0"
                  step="0.1"
                  value={clinicalData.hba1c}
                  onChange={(e) =>
                    setClinicalData({ ...clinicalData, hba1c: parseFloat(e.target.value) })
                  }
                  className="w-full accent-[#EA580C]"
                />
                <div className="flex justify-between text-[10px] text-[#6E5C5F]">
                  <span>{t('normalLt57', 'Normal <5.7%')}</span>
                  <span>{t('targetLt70', 'Target <7.0%')}</span>
                  <span>{t('highGt85', 'High >8.5%')}</span>
                </div>
              </div>

              {/* Diabetes Duration */}
              <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2E2628]">{t('diabetesDurationLabel', 'Diabetes Duration')}</label>
                  <span className="text-xs font-bold text-[#EA580C] font-mono">
                    {clinicalData.diabetesDurationYears} {t('yrs', 'yrs')}
                  </span>
                </div>
                <input
                  type="range"
                  id="slider-duration"
                  min="1"
                  max="35"
                  value={clinicalData.diabetesDurationYears}
                  onChange={(e) =>
                    setClinicalData({
                      ...clinicalData,
                      diabetesDurationYears: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-[#EA580C]"
                />
                <div className="flex justify-between text-[10px] text-[#6E5C5F]">
                  <span>{t('lt5yrsLow', '<5 yrs (Low)')}</span>
                  <span>10-15 {t('yrs', 'yrs')}</span>
                  <span>{t('gt20yrsHighRisk', '>20 yrs (High Risk)')}</span>
                </div>
              </div>

              {/* Systolic BP */}
              <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2E2628]">{t('systolicBpLabel', 'Systolic BP (mmHg)')}</label>
                  <span className="text-xs font-bold text-[#EA580C] font-mono">
                    {clinicalData.systolicBp} mmHg
                  </span>
                </div>
                <input
                  type="range"
                  id="slider-bp"
                  min="90"
                  max="200"
                  value={clinicalData.systolicBp}
                  onChange={(e) =>
                    setClinicalData({ ...clinicalData, systolicBp: parseInt(e.target.value) })
                  }
                  className="w-full accent-[#EA580C]"
                />
                <div className="flex justify-between text-[10px] text-[#6E5C5F]">
                  <span>{t('normal120', 'Normal 120')}</span>
                  <span>{t('preHtn135', 'Pre-HTN 135')}</span>
                  <span>{t('stage2Gt140', 'Stage 2 >140')}</span>
                </div>
              </div>

              {/* Serum Creatinine */}
              <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2E2628]">{t('serumCreatinineLabel', 'Serum Creatinine')}</label>
                  <span className="text-xs font-bold text-[#EA580C] font-mono">
                    {clinicalData.serumCreatinine} mg/dL
                  </span>
                </div>
                <input
                  type="range"
                  id="slider-creatinine"
                  min="0.5"
                  max="3.5"
                  step="0.05"
                  value={clinicalData.serumCreatinine}
                  onChange={(e) =>
                    setClinicalData({ ...clinicalData, serumCreatinine: parseFloat(e.target.value) })
                  }
                  className="w-full accent-[#EA580C]"
                />
                <div className="flex justify-between text-[10px] text-[#6E5C5F]">
                  <span>{t('normalCreatinineRange', 'Normal 0.8–1.1')}</span>
                  <span>{t('renalStrainWarning', 'Renal Strain >1.3')}</span>
                </div>
              </div>

              {/* Insulin Therapy */}
              <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#2E2628]">{t('insulinTherapyLabel', 'Insulin Therapy')}</div>
                  <div className="text-[11px] text-[#6E5C5F]">{t('activeDailyInsulinRegimen', 'Active daily insulin regimen')}</div>
                </div>
                <button
                  type="button"
                  id="btn-toggle-insulin"
                  onClick={() =>
                    setClinicalData({
                      ...clinicalData,
                      insulinTherapy: !clinicalData.insulinTherapy,
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    clinicalData.insulinTherapy
                      ? 'bg-[#EA580C] text-white border-[#EA580C]'
                      : 'bg-white text-[#2E2628] border-[#EFE4DC]'
                  }`}
                >
                  {clinicalData.insulinTherapy ? t('yesInsulin', 'Yes (Insulin)') : t('oralOnly', 'Oral Only')}
                </button>
              </div>

              {/* Prior Laser */}
              <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#2E2628]">{t('priorLaserLabel', 'Prior Laser')}</div>
                  <div className="text-[11px] text-[#6E5C5F]">{t('photocoagulationHistory', 'Photocoagulation history')}</div>
                </div>
                <button
                  type="button"
                  id="btn-toggle-laser"
                  onClick={() =>
                    setClinicalData({
                      ...clinicalData,
                      priorLaser: !clinicalData.priorLaser,
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    clinicalData.priorLaser
                      ? 'bg-[#EA580C] text-white border-[#EA580C]'
                      : 'bg-white text-[#2E2628] border-[#EFE4DC]'
                  }`}
                >
                  {clinicalData.priorLaser ? t('yesLaser', 'Yes (Laser)') : t('noneLaser', 'None')}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] text-center space-y-2">
              <Stethoscope className="w-8 h-8 text-[#6E5C5F] mx-auto opacity-70" />
              <div className="text-sm font-bold text-[#2E2628]">{t('clinicalMetadataSkipped', 'Clinical Metadata Skipped')}</div>
              <p className="text-xs text-[#6E5C5F] max-w-md mx-auto leading-relaxed">
                {t('clinicalMetadataSkippedNotice', 'Retinopathy grading will proceed purely through optical deep learning models without laboratory risk adjustment.')}
              </p>
            </div>
          )}

          {/* Navigation Action Buttons */}
          <div className="pt-4 border-t border-[#EFE4DC] flex items-center justify-between">
            <button
              type="button"
              id="btn-context-back"
              onClick={() => goToStep(4)}
              className="px-5 py-2.5 rounded-2xl bg-white border border-[#EFE4DC] text-[#2E2628] text-xs font-bold hover:bg-[#FAF8F6] transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('backToStep04Oct', 'Back to Step 04 (OCT)')}</span>
            </button>

            <button
              type="button"
              id="btn-run-analysis"
              onClick={handleExecuteAnalysis}
              className="px-7 py-2.5 rounded-2xl bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C] transition-colors shadow-xs flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('runMultimodalAiPipeline', 'Run Multimodal AI Pipeline (Step 06)')}</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 06: ANALYSIS PIPELINE (ANIMATED INFERENCE)
          ===================================================================== */}
      {currentStep === 6 && (
        <div className="bg-white rounded-3xl border border-[#EFE4DC] p-8 sm:p-12 shadow-xs text-center space-y-8 max-w-2xl mx-auto">
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center mx-auto shadow-xs animate-pulse">
              <Cpu className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-[#2E2628]">{t('step06Title', 'Step 06: Executing Multimodal Inference')}</h2>
            <p className="text-xs text-[#6E5C5F]">
              {t('step06Sub', 'Fusing ResNet/EfficientNet fundus features, DenseNet-121 OCT fluid predictions, and XGBoost surrogate risk.')}
            </p>
          </div>

          {/* Processing Steps Checklist */}
          <div className="space-y-3 text-left">
            {processingSteps.map((stepText, idx) => {
              const isDone = processingStage > idx;
              const isCurrent = processingStage === idx;

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 text-xs ${
                    isDone
                      ? 'bg-[#F0FDF4] border-[#86EFAC] text-[#15803D]'
                      : isCurrent
                      ? 'bg-[#FFF7ED] border-[#FDBA74] text-[#EA580C] font-semibold shadow-2xs'
                      : 'bg-[#FAF8F6] border-[#EFE4DC] text-[#6E5C5F] opacity-60'
                  }`}
                >
                  <div className="shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-[#EA580C] animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#D1D5E0]" />
                    )}
                  </div>
                  <span className="leading-tight">{stepText}</span>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#FAF8F6] h-2 rounded-full overflow-hidden border border-[#EFE4DC]">
            <div
              className="h-full bg-[#EA580C] transition-all duration-300 rounded-full"
              style={{
                width: `${Math.min(100, ((processingStage + 1) / processingSteps.length) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 07: EXPLANATION (GRAD-CAM, HEATMAPS, SHAP)
          ===================================================================== */}
      {currentStep === 7 && triageResult && (
        <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EFE4DC]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#2E2628]">{t('step07Title', 'Step 07: Model Interpretability & Grad-CAM')}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#15803D]">
                  {t('attributionGenerated', 'Attribution Generated')}
                </span>
              </div>
              <p className="text-xs text-[#6E5C5F] mt-0.5">
                {t('step07Sub', 'Visualizing pixel activation hotspots (Grad-CAM) and clinical feature attributions (TreeSHAP).')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <RiskChip grade={triageResult.finalGrade} size="md" />
            </div>
          </div>

          {/* Visual Heatmaps Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fundus Grad-CAM */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2E2628] uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>{t('fundusGradCamHeatmap', 'Fundus Grad-CAM Heatmap')}</span>
                </span>

                <div className="flex items-center gap-1 bg-[#FAF8F6] p-1 rounded-xl border border-[#EFE4DC]">
                  <button
                    type="button"
                    onClick={() => setFundusCamMode('original')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      fundusCamMode === 'original'
                        ? 'bg-white text-[#EA580C] shadow-2xs font-bold'
                        : 'text-[#6E5C5F]'
                    }`}
                  >
                    {t('camOriginal', 'Original')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFundusCamMode('clahe')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      fundusCamMode === 'clahe'
                        ? 'bg-white text-[#EA580C] shadow-2xs font-bold'
                        : 'text-[#6E5C5F]'
                    }`}
                  >
                    {t('camClahe', 'CLAHE')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFundusCamMode('gradcam')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      fundusCamMode === 'gradcam'
                        ? 'bg-[#EA580C] text-white shadow-2xs font-bold'
                        : 'text-[#6E5C5F]'
                    }`}
                  >
                    {t('camGradCam', 'Grad-CAM')}
                  </button>
                </div>
              </div>

              {/* Fundus Visual Display */}
              <div className="rounded-2xl border border-[#EFE4DC] bg-[#181517] overflow-hidden aspect-square flex items-center justify-center p-2 shadow-inner relative">
                <img
                  src={
                    fundusCamMode === 'original'
                      ? triageResult.fundusImageUrl
                      : fundusCamMode === 'clahe'
                      ? triageResult.fundusClaheUrl
                      : triageResult.fundusCamUrl
                  }
                  alt="Fundus Explanation"
                  className="w-full h-full object-contain rounded-xl"
                  style={{
                    opacity: fundusCamMode === 'gradcam' ? camOpacity : 1,
                  }}
                />

                <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-xs text-[10px] font-mono text-white px-2.5 py-1 rounded border border-white/10 flex items-center gap-2">
                  <span>EfficientNet-B4 · Layer 4</span>
                  <span>·</span>
                  <span>{triageResult.fundus.inferenceMs} ms</span>
                </div>
              </div>

              {/* Hotspot Findings Chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-[#6E5C5F] uppercase tracking-wider block">
                  {t('identifiedRetinalMicroLesions', 'Identified Retinal Micro-Lesions:')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {triageResult.fundus.featuresDetected.map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF8F6] border border-[#EFE4DC] text-xs text-[#2E2628]"
                    >
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* OCT B-Scan Heatmap OR Clinical Context SHAP */}
            <div className="space-y-4">
              {triageResult.oct ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2E2628] uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span>{t('octBScanFluidActivation', 'OCT B-Scan Fluid Activation')}</span>
                    </span>

                    <div className="flex items-center gap-1 bg-[#FAF8F6] p-1 rounded-xl border border-[#EFE4DC]">
                      <button
                        type="button"
                        onClick={() => setOctCamMode('scan')}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          octCamMode === 'scan'
                            ? 'bg-white text-[#EA580C] shadow-2xs font-bold'
                            : 'text-[#6E5C5F]'
                        }`}
                      >
                        {t('octTabBScan', 'B-Scan')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOctCamMode('gradcam')}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          octCamMode === 'gradcam'
                            ? 'bg-[#EA580C] text-white shadow-2xs font-bold'
                            : 'text-[#6E5C5F]'
                        }`}
                      >
                        {t('octTabActivation', 'Activation')}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#EFE4DC] bg-[#181517] overflow-hidden aspect-[16/9] flex items-center justify-center p-2 shadow-inner relative">
                    <img
                      src={
                        octCamMode === 'scan'
                          ? triageResult.octImageUrl || ''
                          : triageResult.octCamUrl || ''
                      }
                      alt="OCT Explanation"
                      className="w-full h-full object-contain rounded-xl"
                    />

                    <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs text-[10px] font-mono text-white px-2 py-0.5 rounded border border-white/10">
                      DenseNet-121 · DME Prob: {(triageResult.oct.dmeProbability * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] text-xs text-[#2E2628] space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-[#EA580C]">
                      <Info className="w-3.5 h-3.5" />
                      <span>{t('layerStratificationFindings', 'Layer Stratification Findings:')}</span>
                    </div>
                    <ul className="list-disc list-inside text-[11px] text-[#6E5C5F] space-y-0.5">
                      {triageResult.oct.retinalLayerFindings.map((f, idx) => (
                        <li key={idx}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] text-xs text-[#6E5C5F] text-center space-y-1">
                  <div className="font-bold text-[#2E2628]">{t('octModalityNotProvided', 'OCT Modality Not Provided')}</div>
                  <p>{t('octNotProvidedNotice', 'Macular edema risk evaluated via fundus photography hard exudates.')}</p>
                </div>
              )}

              {/* SHAP Attributions (if metadata provided) */}
              {triageResult.metadata && (
                <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2E2628] uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span>{t('shapRiskAttributions', 'SHAP Risk Attributions')}</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#6E5C5F]">TreeSHAP</span>
                  </div>

                  <div className="space-y-2">
                    {triageResult.metadata.shapValues.slice(0, 4).map((shap, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#2E2628] font-medium">{shap.feature}</span>
                          <span
                            className={`font-mono font-bold ${
                              shap.shapValue > 0 ? 'text-[#DC2626]' : 'text-[#15803D]'
                            }`}
                          >
                            {shap.shapValue > 0 ? `+${shap.shapValue}` : shap.shapValue} SHAP
                          </span>
                        </div>
                        <div className="w-full bg-[#E5D7CE] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              shap.shapValue > 0 ? 'bg-[#DC2626]' : 'bg-[#15803D]'
                            }`}
                            style={{
                              width: `${Math.min(100, Math.abs(shap.shapValue) * 80)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="pt-4 border-t border-[#EFE4DC] flex items-center justify-between">
            <button
              type="button"
              id="btn-explanation-back"
              onClick={() => goToStep(5)}
              className="px-5 py-2.5 rounded-2xl bg-white border border-[#EFE4DC] text-[#2E2628] text-xs font-bold hover:bg-[#FAF8F6] transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('backToStep05', 'Back to Step 05')}</span>
            </button>

            <button
              type="button"
              id="btn-proceed-to-triage"
              onClick={() => goToStep(8)}
              className="px-6 py-2.5 rounded-2xl bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C] transition-colors shadow-xs flex items-center gap-2"
            >
              <span>{t('viewTriageDecisionStep08', 'View Triage Decision (Step 08)')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 08: TRIAGE DECISION (MULTIMODAL LATE FUSION)
          ===================================================================== */}
      {currentStep === 8 && triageResult && (
        <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EFE4DC]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#2E2628]">{t('step08Title', 'Step 08: Multimodal Late-Fusion Triage')}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#15803D]">
                  {t('concordanceEvaluated', 'Concordance Evaluated')}
                </span>
              </div>
              <p className="text-xs text-[#6E5C5F] mt-0.5">
                {t('step08Sub', 'Late-fusion arbitration synthesizing fundus probability vector, OCT DME flag, and XGBoost surrogate risk.')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6E5C5F]">{t('patientLabel', 'Patient:')}</span>
              <span className="text-xs font-bold text-[#2E2628] font-mono">{triageResult.patientId}</span>
            </div>
          </div>

          {/* Primary Result Card */}
          <div className="rounded-3xl border border-[#EFE4DC] bg-[#FAF8F6] p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-[#6E5C5F] uppercase tracking-wider">
                  {t('finalIcdrClassification', 'Final ICDR Retinopathy Classification')}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#2E2628] mt-1">
                  {t('gradePrefix', 'Grade')} {triageResult.finalGrade}: {triageResult.gradeLabel}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <RiskChip grade={triageResult.finalGrade} size="lg" />
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    triageResult.confidence === 'HIGH'
                      ? 'bg-[#DCFCE7] text-[#15803D]'
                      : 'bg-[#FEF3C7] text-[#B45309]'
                  }`}
                >
                  {t('confidenceLabel', 'Confidence:')} {triageResult.confidence}
                </span>
              </div>
            </div>

            {/* DME Escalation Alert Banner */}
            {triageResult.dmeEscalationApplied && (
              <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-start gap-3 text-xs text-[#991B1B]">
                <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-sm">
                    {t('dmeEscalationRuleTriggered', 'DME Escalation Rule Triggered (Grade 2 Override)')}
                  </span>
                  <p className="mt-0.5 leading-relaxed">
                    {t('dmeEscalationNotice', 'OCT cross-sectional analysis confirmed intraretinal cystoid fluid / subretinal detachment. In accordance with clinical safety protocols, patient classification was automatically elevated to Grade 2 (Moderate NPDR with DME) regardless of initial fundus grade.')}
                  </p>
                </div>
              </div>
            )}

            {/* Modality Concordance Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white border border-[#EFE4DC]">
                <span className="text-[10px] text-[#6E5C5F] uppercase font-bold block">
                  {t('fundus2dCnn', 'Fundus 2D CNN')}
                </span>
                <span className="text-sm font-bold text-[#2E2628]">
                  {t('gradePrefix', 'Grade')} {triageResult.fundus.grade} ({triageResult.fundus.gradeLabel})
                </span>
                <span className="text-[10px] text-[#15803D] block mt-0.5">
                  {(triageResult.fundus.probabilities[triageResult.fundus.grade] * 100).toFixed(1)}% {t('probShort', 'prob')}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#EFE4DC]">
                <span className="text-[10px] text-[#6E5C5F] uppercase font-bold block">
                  {t('octBScanCnn', 'OCT B-Scan CNN')}
                </span>
                <span className="text-sm font-bold text-[#2E2628]">
                  {triageResult.oct
                    ? `${triageResult.oct.predictedClass} (${
                        triageResult.oct.dmeDetected ? t('dmePositive', 'DME+') : t('noDme', 'No DME')
                      })`
                    : t('notCaptured', 'Not Captured')}
                </span>
                <span className="text-[10px] text-[#6E5C5F] block mt-0.5">
                  {triageResult.oct
                    ? `${(triageResult.oct.dmeProbability * 100).toFixed(1)}% ${t('fluidLikelihood', 'fluid likelihood')}`
                    : t('omittedByScreener', 'Omitted by screener')}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#EFE4DC]">
                <span className="text-[10px] text-[#6E5C5F] uppercase font-bold block">
                  {t('clinicalXGBoost', 'Clinical XGBoost')}
                </span>
                <span className="text-sm font-bold text-[#2E2628]">
                  {triageResult.metadata
                    ? `${t('gradePrefix', 'Grade')} ${triageResult.metadata.predictedGrade}`
                    : t('notCaptured', 'Not Captured')}
                </span>
                <span className="text-[10px] text-[#6E5C5F] block mt-0.5">
                  {triageResult.metadata
                    ? `${t('riskScoreLabel', 'Risk score:')} ${triageResult.metadata.riskScore}`
                    : t('omittedByScreener', 'Omitted by screener')}
                </span>
              </div>
            </div>

            {/* Rationale & Actionable Recommendation */}
            <div className="p-4 rounded-2xl bg-white border border-[#EFE4DC] space-y-2">
              <div className="text-xs font-bold text-[#2E2628] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                <span>{t('clinicalTriageRecommendation', 'Clinical Triage Recommendation')}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#2E2628] leading-relaxed">
                {triageResult.recommendation}
              </p>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="pt-4 border-t border-[#EFE4DC] flex items-center justify-between">
            <button
              type="button"
              id="btn-triage-back"
              onClick={() => goToStep(7)}
              className="px-5 py-2.5 rounded-2xl bg-white border border-[#EFE4DC] text-[#2E2628] text-xs font-bold hover:bg-[#FAF8F6] transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('backToStep07Explanation', 'Back to Step 07 (Explanation)')}</span>
            </button>

            <button
              type="button"
              id="btn-proceed-to-referral"
              onClick={() => goToStep(9)}
              className="px-6 py-2.5 rounded-2xl bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C] transition-colors shadow-xs flex items-center gap-2"
            >
              <span>{t('referralFollowUpStep09', 'Referral & Follow-up (Step 09)')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 09: REFERRAL / FOLLOW-UP
          ===================================================================== */}
      {currentStep === 9 && triageResult && (
        <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EFE4DC]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#2E2628]">{t('step09Title', 'Step 09: Referral & Closed-Loop Follow-up')}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFEDD5] text-[#EA580C]">
                  {t('finalStepBadge', 'Final Step')}
                </span>
              </div>
              <p className="text-xs text-[#6E5C5F] mt-0.5">
                {t('step09Sub', 'Generate specialist referrals, schedule clinic appointments, send patient SMS, and export clinical audit reports.')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-download-pdf-report"
                onClick={() => generateClinicalPdfReport(triageResult)}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-[#EFE4DC] text-[#2E2628] text-xs font-bold hover:bg-[#FAF8F6] transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>{t('exportClinicalPdf', 'Export Clinical PDF')}</span>
              </button>
            </div>
          </div>

          {/* Referral Dispatched Notification */}
          {referralDispatched && (
            <div className="p-5 rounded-2xl bg-[#F0FDF4] border border-[#86EFAC] space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#15803D]">
                <CheckCircle2 className="w-5 h-5 text-[#15803D]" />
                <span>{t('specialistReferralDispatchedSuccessfully', 'Specialist Referral Dispatched Successfully')}</span>
              </div>
              <p className="text-xs text-[#2E2628] leading-relaxed">
                {t('referralTokenLabel', 'Referral Token')} <strong>{referralDispatched.id}</strong> {t('hasBeenCreatedAndSynced', 'has been created and synced to the regional review queue for')} <strong>{referralDispatched.assignedClinic}</strong>. {t('followUpTimelineLabel', 'Follow-up timeline:')} <em>{referralDispatched.followUpTimeline}</em>.
              </p>
            </div>
          )}

          {/* Referral Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {/* Priority Urgency */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2E2628]">{t('referralPriorityLabel', 'Referral Priority')}</label>
              <select
                id="select-referral-urgency"
                value={referralUrgency}
                onChange={(e) => setReferralUrgency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] text-xs text-[#2E2628] focus:outline-none focus:border-[#EA580C] bg-white font-medium"
              >
                <option value="Routine Annual (12 months)">{t('urgencyRoutineAnnual', 'Routine Annual (12 months)')}</option>
                <option value="Review Recommended (6 months)">{t('urgencyReview6Months', 'Review Recommended (6 months)')}</option>
                <option value="Priority Specialist Referral (2–4 weeks)">
                  {t('urgencyPrioritySpecialist', 'Priority Specialist Referral (2–4 weeks)')}
                </option>
                <option value="Urgent Vitreoretinal (< 72 hours)">
                  {t('urgencyUrgentVitreoretinal', 'Urgent Vitreoretinal (< 72 hours)')}
                </option>
              </select>
            </div>

            {/* Assigned Clinic */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-[#2E2628]">{t('assignedEyeHospitalUnit', 'Assigned Eye Hospital / Unit')}</label>
              <select
                id="select-assigned-clinic"
                value={assignedClinic}
                onChange={(e) => setAssignedClinic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] text-xs text-[#2E2628] focus:outline-none focus:border-[#EA580C] bg-white"
              >
                {MOCK_SCREENING_CENTERS.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} — {c.city} ({c.hours})
                  </option>
                ))}
              </select>
            </div>

            {/* Patient Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2E2628]">{t('patientPhoneSms', 'Patient Phone (SMS / WhatsApp)')}</label>
              <input
                type="text"
                id="input-patient-phone"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] text-xs text-[#2E2628] focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            {/* Patient Notification Options */}
            <div className="space-y-1.5 sm:col-span-2 flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="chk-sms-notification"
                  checked={sendSmsNotification}
                  onChange={(e) => setSendSmsNotification(e.target.checked)}
                  className="w-4 h-4 text-[#EA580C] rounded focus:ring-[#EA580C]"
                />
                <span className="text-xs text-[#2E2628]">
                  {t('sendAutomatedSmsAlert', 'Send automated SMS appointment alert & directions in patient local language')}
                </span>
              </label>
            </div>

            {/* Clinical Hand-off Notes */}
            <div className="space-y-1.5 sm:col-span-3">
              <label className="text-xs font-bold text-[#2E2628]">{t('clinicalHandoffTriageNotes', 'Clinical Handoff & Triage Notes')}</label>
              <textarea
                id="textarea-referral-notes"
                rows={3}
                value={referralNotes}
                onChange={(e) => setReferralNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] text-xs text-[#2E2628] focus:outline-none focus:border-[#EA580C] leading-relaxed"
                placeholder={t('referralNotesPlaceholder', 'Include relevant clinical findings, systemic diabetes medications, or screener observations...')}
              />
            </div>
          </div>

          {/* Bottom Action Toolbar */}
          <div className="pt-5 border-t border-[#EFE4DC] flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              id="btn-referral-back"
              onClick={() => goToStep(8)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white border border-[#EFE4DC] text-[#2E2628] text-xs font-bold hover:bg-[#FAF8F6] transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('backToStep08Triage', 'Back to Step 08 (Triage)')}</span>
            </button>

            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                id="btn-dispatch-referral"
                disabled={isDispatchingReferral || referralDispatched !== null}
                onClick={handleDispatchReferral}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white border border-[#EA580C] text-[#EA580C] text-xs font-bold hover:bg-[#FFF7ED] transition-colors flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50"
              >
                {isDispatchingReferral ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {referralDispatched ? t('referralDispatched', 'Referral Dispatched') : t('dispatchSpecialistReferral', 'Dispatch Specialist Referral')}
                </span>
              </button>

              <button
                type="button"
                id="btn-complete-screening"
                onClick={() => onComplete(triageResult)}
                className="w-full sm:w-auto px-7 py-2.5 rounded-2xl bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C] transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('completeScreeningSaveEncounter', 'Complete Screening & Save Encounter')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
