import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Square,
  Sparkles,
  Info,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  Microscope,
  User,
} from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';
import { voiceService, VoicePlaybackState } from '../services/voiceService';
import { LanguageCode } from '../i18n/translations';

export type VoiceGuideRole = 'patient' | 'helper' | 'researcher';

export interface ScreeningVoiceGuideProps {
  role: VoiceGuideRole;
  currentStep: number;
  totalSteps?: number;
  stepContext?: {
    stepKey?: string;
    hasImageUploaded?: boolean;
    hasOctUploaded?: boolean;
    hasReportUploaded?: boolean;
    isAnalyzing?: boolean;
    isComplete?: boolean;
    customNote?: string;
  };
  onToggleEnabled?: (enabled: boolean) => void;
  className?: string;
}

// Full multilingual instructional dictionary for Patient, Screening Helper, and Researcher
// English, Hindi, Kannada, Tamil, Telugu, Malayalam
const ROLE_INSTRUCTIONS: Record<
  VoiceGuideRole,
  Record<
    number,
    {
      default: Record<LanguageCode, string>;
      imageUploaded?: Record<LanguageCode, string>;
    }
  >
> = {
  patient: {
    1: {
      default: {
        en: 'Step 1 of 7. Please enter your age and general health background. This helps us personalize your screening support.',
        hi: 'चरण 1/7: कृपया अपनी आयु और सामान्य स्वास्थ्य जानकारी दर्ज करें। यह आपकी स्क्रीनिंग को सही बनाने में मदद करता है।',
        kn: 'ಹಂತ 1/7: ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಯಸ್ಸು ಮತ್ತು ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ. ಇದು ನಿಮ್ಮ ತಪಾಸಣೆಯನ್ನು ಕಸ್ಟಮೈಸ್ ಮಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
        ta: 'படி 1/7: உங்கள் வயது மற்றும் பொதுவான உடல்நல விவரங்களை உள்ளிடவும். இது உங்கள் பரிசோதனைக்கு உதவும்.',
        te: 'దశ 1/7: దయచేసి మీ వయస్సు మరియు సాధారణ ఆరోగ్య సమాచారాన్ని నమోదు చేయండి. ఇది స్క్రీనింగ్‌కు సహాయపడుతుంది.',
        ml: 'ഘട്ടം 1/7: ദയവായി നിങ്ങളുടെ പ്രായവും ആരോഗ്യ വിവരങ്ങളും നൽകുക. ഇത് പരിശോധനയ്ക്ക് സഹായിക്കും.',
      },
    },
    2: {
      default: {
        en: 'Step 2 of 7. Please upload a clear fundus image.',
        hi: 'चरण 2/7: कृपया अपनी रेटिना की स्पष्ट फंडस छवि अपलोड करें।',
        kn: 'ಹಂತ 2/7: ದಯವಿಟ್ಟು ಸ್ಪಷ್ಟವಾದ ಫಂಡಸ್ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
        ta: 'படி 2/7: தயவுசெய்து தெளிவான ஃபண்டஸ் படத்தை பதிவேற்றவும்.',
        te: 'దశ 2/7: దయచేసి స్పష్టమైన ఫండస్ చిత్రాన్ని అప్‌లోడ్ చేయండి.',
        ml: 'ഘട്ടം 2/7: വ്യക്തമായ ഫണ്ടസ് ചിത്രം അപ്‌ലോഡ് ചെയ്യുക.',
      },
      imageUploaded: {
        en: 'Your image has been uploaded. Please review the image.',
        hi: 'आपकी छवि अपलोड हो गई है। कृपया छवि की समीक्षा करें।',
        kn: 'ನಿಮ್ಮ ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ. ದಯವಿಟ್ಟು ಚಿತ್ರವನ್ನು ಪರಿಶೀಲಿಸಿ.',
        ta: 'உங்கள் படம் பதிவேற்றப்பட்டது. தயவுசெய்து படத்தை சரிபார்க்கவும்.',
        te: 'మీ చిత్రం అప్‌లోడ్ చేయబడింది. దయచేసి చిత్రాన్ని సమీక్షించండి.',
        ml: 'നിങ്ങളുടെ ചിത്രം അപ്‌ലോഡ് ചെയ്തു. ദയവായി ചിത്രം പരിശോധിക്കുക.',
      },
    },
    3: {
      default: {
        en: 'Step 3 of 7. If you have an OCT scan, you can add it now.',
        hi: 'चरण 3/7: यदि आपके पास ओसीटी स्कैन है, तो आप इसे अभी जोड़ सकते हैं।',
        kn: 'ಹಂತ 3/7: ನಿಮ್ಮ ಬಳಿ ಓಸಿಟಿ ಸ್ಕ್ಯಾನ್ ಇದ್ದರೆ, ನೀವು ಅದನ್ನು ಈಗ ಸೇರಿಸಬಹುದು.',
        ta: 'படி 3/7: உங்களிடம் ஓசிடி ஸ்கேன் இருந்தால், இப்போது சேர்க்கலாம்.',
        te: 'దశ 3/7: మీ వద్ద ఓసీటీ స్కాన్ ఉంటే, మీరు ఇప్పుడు జోడించవచ్చు.',
        ml: 'ഘട്ടം 3/7: ഒസിടി സ്കാൻ ഉണ്ടെങ്കിൽ, ഇപ്പോൾ ചേർക്കാം.',
      },
    },
    4: {
      default: {
        en: 'Step 4 of 7. You can attach any past eye reports or health records here, or continue to the next step.',
        hi: 'चरण 4/7: आप अपनी पिछली रिपोर्ट या स्वास्थ्य रिकॉर्ड संलग्न कर सकते हैं, या आगे बढ़ सकते हैं।',
        kn: 'ಹಂತ 4/7: ನೀವು ಹಿಂದಿನ ಕಣ್ಣಿನ ವರದಿಗಳು ಅಥವಾ ದಾಖಲೆಗಳನ್ನು ಲಗತ್ತಿಸಬಹುದು ಅಥವಾ ಮುಂದಿನ ಹಂತಕ್ಕೆ ಮುಂದುವರಿಯಬಹುದು.',
        ta: 'படி 4/7: உங்கள் முந்தைய மருத்துவ அறிக்கைகளை இணைக்கலாம், அல்லது தொடரலாம்.',
        te: 'దశ 4/7: మీ పాత నివేదికలను జత చేయవచ్చు లేదా ముందుకు సాగవచ్చు.',
        ml: 'ഘട്ടം 4/7: മുൻ റിപ്പോർട്ടുകൾ ഉണ്ടെങ്കിൽ ഇവിടെ ചേർക്കാം, അല്ലെങ്കിൽ തുടരാം.',
      },
    },
    5: {
      default: {
        en: 'Step 5 of 7. Please review the screening input summary. Assessment will be based on the information provided.',
        hi: 'चरण 5/7: कृपया स्क्रीनिंग इनपुट सारांश की समीक्षा करें। मूल्यांकन प्रदान की गई जानकारी पर आधारित होगा।',
        kn: 'ಹಂತ 5/7: ದಯವಿಟ್ಟು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ. ಒದಗಿಸಿದ ಮಾಹಿತಿಯ ಆಧಾರದ ಮೇಲೆ ಮೌಲ್ಯಮಾಪನ ನಡೆಯುತ್ತದೆ.',
        ta: 'படி 5/7: பரிசோதனை விவரங்களை சரிபார்க்கவும். வழங்கப்பட்ட தகவலின் அடிப்படையில் மதிப்பீடு செய்யப்படும்.',
        te: 'దశ 5/7: వివరాలను సమీక్షించండి. అందించిన సమాచారం ఆధారంగానే స్క్రీనింగ్ నిర్వహించబడుతుంది.',
        ml: 'ഘട്ടം 5/7: വിവരങ്ങൾ പരിശോധിക്കുക. നൽകിയിട്ടുള്ള വിവരങ്ങളുടെ അടിസ്ഥാനത്തിലാണ് വിലയിരുത്തൽ.',
      },
    },
    6: {
      default: {
        en: 'Step 6 of 7. Your screening information is being prepared.',
        hi: 'चरण 6/7: आपकी स्क्रीनिंग जानकारी तैयार की जा रही है।',
        kn: 'ಹಂತ 6/7: ನಿಮ್ಮ ಸ್ಕ್ರೀನಿಂಗ್ ಮಾಹಿತಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ.',
        ta: 'படி 6/7: உங்கள் பரிசோதனை தகவல் தயாராகிறது.',
        te: 'దశ 6/7: మీ స్క్రీనింగ్ సమాచారం సిద్ధమవుతోంది.',
        ml: 'ഘട്ടം 6/7: നിങ്ങളുടെ സ്ക്രീനിംഗ് വിവരങ്ങൾ തയ്യാറാക്കുന്നു.',
      },
    },
    7: {
      default: {
        en: 'Step 7 of 7. The screening-support result is ready.',
        hi: 'चरण 7/7: स्क्रीनिंग-सहायता परिणाम तैयार है।',
        kn: 'ಹಂತ 7/7: ಸ್ಕ್ರೀನಿಂಗ್-ಬೆಂಬಲ ಫಲಿತಾಂಶ ಸಿದ್ಧವಾಗಿದೆ.',
        ta: 'படி 7/7: பரிசோதனை-ஆதரவு முடிவு தயாராக உள்ளது.',
        te: 'దశ 7/7: స్క్రీనింగ్-సహాయక ఫలితం సిద్ధంగా ఉంది.',
        ml: 'ഘട്ടം 7/7: സ്ക്രീനിംഗ് സപ്പോർട്ട് ഫലം തയ്യാറാണ്.',
      },
    },
  },

  helper: {
    1: {
      default: {
        en: 'Step 1: Patient Registration. Record demographics, diabetes onset duration, and target eye for baseline calibration.',
        hi: 'चरण 1: रोगी पंजीकरण। जनसांख्यिकी, मधुमेह की अवधि और आंख का चयन रिकॉर्ड करें।',
        kn: 'ಹಂತ 1: ರೋಗಿ ನೋಂದಣಿ. ರೋಗಿಯ ವಿವರ, ಮಧುಮೇಹದ ಅವಧಿ ಮತ್ತು ಕಣ್ಣಿನ ವಿವರ ದಾಖಲಿಸಿ.',
        ta: 'படி 1: நோயாளி பதிவு. வயது, நீரிழிவு காலம் மற்றும் பரிசோதிக்கப்படும் கண்ணைப் பதிவு செய்யவும்.',
        te: 'దశ 1: రోగి నమోదు. వయస్సు, మధుమేహం వ్యవధి మరియు కంటి వివరాలను నమోదు చేయండి.',
        ml: 'ഘട്ടം 1: രോഗി രജിസ്ട്രേഷൻ. രോഗിയുടെ വിവരങ്ങൾ, പ്രമേഹ ദൈർഘ്യം എന്നിവ രേഖപ്പെടുത്തുക.',
      },
    },
    2: {
      default: {
        en: 'Step 2: Fundus Acquisition. Capture non-mydriatic 45-degree field centered on macula and optic disc. Verify focus and illumination.',
        hi: 'चरण 2: फंडस अधिग्रहण। मैक्युला और ऑप्टिक डिस्क पर केंद्रित 45-डिग्री फील्ड कैप्चर करें। फोकस और रोशनी जांचें।',
        kn: 'ಹಂತ 2: ಫಂಡಸ್ ಸ್ವಾಧೀನ. ಮ್ಯಾಕುಲಾ ಮತ್ತು ಆಪ್ಟಿಕ್ ಡಿಸ್ಕ್ ಕೇಂದ್ರಿತ 45-ಡಿಗ್ರಿ ಫೀಲ್ಡ್ ಸೆರೆಹಿಡಿಯಿರಿ.',
        ta: 'படி 2: ஃபண்டஸ் படம் எடுத்தல். மேக்குலா மற்றும் ஆப்டிக் வட்டு மையப்படுத்தப்பட்ட 45 டிகிரி பார்வையை எடுக்கவும்.',
        te: 'దశ 2: ఫండస్ చిత్రం సేకరణ. మాక్యులా మరియు ఆప్టిక్ డిస్క్ కేంద్రీకృత 45-డిగ్రీల ఫీల్డ్ తీయండి.',
        ml: 'ഘട്ടം 2: ഫണ്ടസ് ചിത്രം എടുക്കൽ. മാക്കുലയും ഒപ്റ്റിക് ഡിസ്കും വ്യക്തമായി പകർത്തുക.',
      },
      imageUploaded: {
        en: 'Fundus acquisition complete. Automated clarity verification indicates adequate signal-to-noise ratio.',
        hi: 'फंडस अधिग्रहण पूरा हुआ। स्वचालित स्पष्टता सत्यापन पर्याप्त गुणवत्ता दर्शाता है।',
        kn: 'ಫಂಡಸ್ ಸ್ವಾಧೀನ ಪೂರ್ಣಗೊಂಡಿದೆ. ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆ ಸರಿಯಾಗಿದೆ ಎಂದು ತೋರಿಸುತ್ತದೆ.',
        ta: 'ஃபண்டஸ் படம் எடுக்கப்பட்டது. தெளிவுத் தரம் போதுமானதாக உள்ளது.',
        te: 'ఫండస్ చిత్రం పూర్తయింది. నాణ్యత తనిఖీ సరైన స్పష్టతను చూపుతోంది.',
        ml: 'ഫണ്ടസ് ചിത്രം ലഭ്യമായി. വ്യക്തത പരിശോധന വിജയകരമാണ്.',
      },
    },
    3: {
      default: {
        en: 'Step 3: OCT Modality. Optional cross-sectional B-scan for macular thickness. Proceed if device available or bypass to next phase.',
        hi: 'चरण 3: ओसीटी मोडैलिटी। मैक्युलर मोटाई के लिए वैकल्पिक बी-स्कैन। उपकरण उपलब्ध होने पर आगे बढ़ें या छोड़ दें।',
        kn: 'ಹಂತ 3: ಓಸಿಟಿ ಸ್ಕ್ಯಾನ್. ಮ್ಯಾಕುಲಾರ್ ದಪ್ಪ ಪರೀಕ್ಷೆಗೆ ಐಚ್ಛಿಕ. ಸಾಧನ ಲಭ್ಯವಿದ್ದರೆ ಮುಂದುವರಿಯಿರಿ ಅಥವಾ ಮುಂದಿನ ಹಂತಕ್ಕೆ ಹೋಗಿ.',
        ta: 'படி 3: ஓசிடி ஸ்கேன். மேக்குலர் தடிமனுக்கு விருப்பத்திற்குரியது. சாதனம் இருந்தால் இணைக்கவும்.',
        te: 'దశ 3: ఓసీటీ మోడాలిటీ. మాక్యులా మందాన్ని పరీక్షించడానికి ఐచ్ఛికం. అందుబాటులో ఉంటే జోడించండి.',
        ml: 'ഘട്ടം 3: ഒസിടി സ്കാൻ. ലഭ്യമാണെങ്കിൽ മാക്കുലാർ സ്കാൻ ചേർക്കുക, അല്ലെങ്കിൽ ഒഴിവാക്കുക.',
      },
    },
    4: {
      default: {
        en: 'Step 4: Clinical Biomarkers. Record systemic metrics: HbA1c, systolic blood pressure, and prior laser photocoagulation history.',
        hi: 'चरण 4: नैदानिक बायोमार्कर। प्रणालीगत मेट्रिक्स दर्ज करें: एचबीए1सी, सिस्टोलिक बीपी और पूर्व लेजर इतिहास।',
        kn: 'ಹಂತ 4: ಕ್ಲಿನಿಕಲ್ ವಿವರಗಳು. ರಕ್ತದ ಸಕ್ಕರೆ, ರಕ್ತದೊತ್ತಡ ಮತ್ತು ಹಿಂದಿನ ಚಿಕಿತ್ಸಾ ಇತಿಹಾಸ ದಾಖಲಿಸಿ.',
        ta: 'படி 4: மருத்துவக் குறிப்புகள். HbA1c, இரத்த அழுத்தம் மற்றும் முந்தைய லேசர் சிகிச்சை பதிவு செய்யவும்.',
        te: 'దశ 4: క్లినికల్ సూచికలు. HbA1c, రక్తపోటు మరియు మునుపటి చికిత్స వివరాలు నమోదు చేయండి.',
        ml: 'ഘട്ടം 4: ക്ലിനിക്കൽ സൂചകങ്ങൾ. രക്തത്തിലെ പഞ്ചസാരയുടെ അളവും ബിപിയും രേഖപ്പെടുത്തുക.',
      },
    },
    5: {
      default: {
        en: 'Step 5: Pre-computation Triage. Verify image quality index, vessel contrast, and confirm multimodal fusion pipeline.',
        hi: 'चरण 5: प्री-कंप्यूटेशन ट्राइएज। छवि गुणवत्ता सूचकांक, वेसल कंट्रास्ट और मल्टीमॉडल पाइपलाइन की पुष्टि करें।',
        kn: 'ಹಂತ 5: ಪರಿಶೀಲನಾ ಹಂತ. ಚಿತ್ರದ ಗುಣಮಟ್ಟ ಮತ್ತು ವಿಶ್ಲೇಷಣಾ ಪೈಪ್‌ಲೈನ್ ದೃಢೀಕರಿಸಿ.',
        ta: 'படி 5: முன் பரிசோதனை சரிபார்ப்பு. படத்தின் தரம் மற்றும் இணைவு செயல்முறையை உறுதிப்படுத்தவும்.',
        te: 'దశ 5: ప్రీ-కంప్యూటేషన్ సమీక్ష. చిత్రం నాణ్యత మరియు మోడల్ పైప్‌లైన్‌ను నిర్ధారించండి.',
        ml: 'ഘട്ടം 5: ഗുണനിലവാര പരിശോധന. ചിത്രത്തിന്റെ ഗുണനിലവാരവും പ്രക്രിയയും ഉറപ്പുവരുത്തുക.',
      },
    },
    6: {
      default: {
        en: 'Step 6: Executing inference. Running deep convolutional feature extraction and gradient attribution maps.',
        hi: 'चरण 6: अनुमान निष्पादित किया जा रहा है। डीप कन्वोल्यूशनल फीचर एक्सट्रैक्शन और ग्रेडिएंट मैप्स चल रहे हैं।',
        kn: 'ಹಂತ 6: ಎಐ ವಿಶ್ಲೇಷಣೆ ನಡೆಯುತ್ತಿದೆ. ಕನ್ವಲ್ಯೂಷನಲ್ ಫೀಚರ್ ಮತ್ತು ಗ್ರೇಡಿಯಂಟ್ ನಕ್ಷೆಗಳ ಪರಿಶೀಲನೆ.',
        ta: 'படி 6: ஏஐ பகுப்பாய்வு நடக்கிறது. ஆழமான கற்றல் மற்றும் வெப்ப வரைபடங்கள் கணக்கிடப்படுகின்றன.',
        te: 'దశ 6: ఏఐ విశ్లేషణ జరుగుతోంది. డీప్ లెర్నింగ్ ఫీచర్లు విశ్లేషించబడుతున్నాయి.',
        ml: 'ഘട്ടം 6: എഐ വിശകലനം പുരോഗമിക്കുന്നു. ഡീപ് ലേണിംഗ് പ്രക്രിയ നടക്കുന്നു.',
      },
    },
    7: {
      default: {
        en: 'Step 7: Screening triage complete. Review referral urgency tier, follow-up window, and export clinical PDF summary.',
        hi: 'चरण 7: स्क्रीनिंग ट्राइएज पूर्ण। रेफरल प्राथमिकता, फॉलो-अप अवधि की समीक्षा करें और नैदानिक पीडीएफ निर्यात करें।',
        kn: 'ಹಂತ 7: ತಪಾಸಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ. ಉಲ್ಲೇಖಿತ ಆದ್ಯತೆ ಮತ್ತು ಪಿಡಿಎಫ್ ವರದಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.',
        ta: 'படி 7: பரிசோதனை முடிவு முடிந்தது. பரிந்துரை அவசரம் மற்றும் மருத்துவ பிடிஎஃப் அறிக்கையைப் பார்க்கவும்.',
        te: 'దశ 7: స్క్రీనింగ్ పూర్తయింది. రెఫరల్ ప్రాధాన్యతను పరిశీలించి పిడిఎఫ్ రిపోర్టును డౌన్‌లోడ్ చేయండి.',
        ml: 'ഘട്ടം 7: പരിശോധന പൂർത്തിയായി. തുടർനടപടി നിർദ്ദേശങ്ങളും പിഡിഎഫ് റിപ്പോർട്ടും പരിശോധിക്കുക.',
      },
    },
  },

  researcher: {
    1: {
      default: {
        en: 'Step 1: Cohort Parameterization. Calibrating baseline risk covariates, tabular clinical vector, and demographic priors.',
        hi: 'चरण 1: कोहोर्ट पैरामीटराइजेशन। आधारभूत जोखिम सहसंयोजक और जनसांख्यिकीय वैक्टर को कैलिब्रेट किया जा रहा है।',
        kn: 'ಹಂತ 1: ಕೋಹಾರ್ಟ್ ಮಾಪನಾಂಕ ನಿರ್ಣಯ. ಮೂಲ ಅಪಾಯದ ಅಂಶಗಳು ಮತ್ತು ಜನಸಂಖ್ಯಾಶಾಸ್ತ್ರೀಯ ವೆಕ್ಟರ್ ಮಾಪನಾಂಕ.',
        ta: 'படி 1: ஆய்வுக் குழு அளவுருவாக்கம். அடிப்படை ஆபத்துக் காரணிகள் மற்றும் மருத்துவத் தரவை அளவீடு செய்தல்.',
        te: 'దశ 1: కోహోర్ట్ పారామిటరైజేషన్. బేస్‌లైన్ ప్రమాద కారకాలు మరియు క్లినికల్ వెక్టర్‌ను అమర్చడం.',
        ml: 'ഘട്ടം 1: പഠന ഗ്രൂപ്പ് വിവരങ്ങൾ. അടിസ്ഥാന അപകട ഘടകങ്ങളും വിവരങ്ങളും ക്രമീകരിക്കുന്നു.',
      },
    },
    2: {
      default: {
        en: 'Step 2: Fundus Tensor Input. Evaluating 512-by-512 fundus tensor. CLAHE normalization and feature backbone activation ready.',
        hi: 'चरण 2: फंडस टेंसर इनपुट। 512x512 फंडस टेंसर का मूल्यांकन। सीएलएएचई सामान्यीकरण और बैकबोन सक्रिय।',
        kn: 'ಹಂತ 2: ಫಂಡಸ್ ಟೆನ್ಸರ್ ಇನ್‌ಪುಟ್. 512x512 ಟೆನ್ಸರ್ ಮೌಲ್ಯಮಾಪನ ಮತ್ತು ಹಿನ್ನೆಲೆ ಮಾದರಿ ಸಕ್ರಿಯಗೊಳಿಸುವಿಕೆ.',
        ta: 'படி 2: ஃபண்டஸ் டென்சர் உள்ளீடு. 512x512 டென்சர் மதிப்பீடு மற்றும் அம்ச பின்னணி செயல்படுத்துதல்.',
        te: 'దశ 2: ఫండస్ టెన్సర్ ఇన్‌పుట్. 512x512 టెన్సర్ విశ్లేషణ మరియు ఫీచర్ బ్యాక్‌బోన్ సక్రియం.',
        ml: 'ഘട്ടം 2: ഫണ്ടസ് ടെൻസർ ഇൻപുട്ട്. 512x512 ടെൻസർ അപഗ്രഥനവും ഫീച്ചർ ആക്റ്റിവേഷനും.',
      },
      imageUploaded: {
        en: 'Primary fundus tensor initialized. DenseNet-121 feature embeddings extracted for late fusion stage.',
        hi: 'प्राथमिक फंडस टेंसर प्रारंभ। लेट फ्यूजन चरण के लिए डेंसनेट-121 फीचर एम्बेडिंग निकाली गई।',
        kn: 'ಪ್ರಾಥಮಿಕ ಫಂಡಸ್ ಟೆನ್ಸರ್ ಆರಂಭಗೊಂಡಿದೆ. ಲೇಟ್ ಫ್ಯೂಷನ್ ಹಂತಕ್ಕಾಗಿ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ಹೊರತೆಗೆಯಲಾಗಿದೆ.',
        ta: 'ஃபண்டஸ் டென்சர் தொடங்கப்பட்டது. லேட் ஃபியூஷன் நிலைக்கு அம்சங்கள் பிரித்தெடுக்கப்பட்டன.',
        te: 'ప్రైమరీ ఫండస్ టెన్సర్ ప్రారంభించబడింది. లేట్ ఫ్యూజన్ దశకు ఫీచర్లు సంగ్రహించబడ్డాయి.',
        ml: 'ഫണ്ടസ് ടെൻസർ ആരംഭിച്ചു. ലേറ്റ് ഫ്യൂഷൻ ഘട്ടത്തിനായി ഫീച്ചറുകൾ വേർതിരിച്ചു.',
      },
    },
    3: {
      default: {
        en: 'Step 3: OCT Volumetric Input. High-resolution cross-sectional scan ingestion for macular neuro-retinal layer segmentation.',
        hi: 'चरण 3: ओसीटी वॉल्यूमेट्रिक इनपुट। मैक्युलर न्यूरो-रेटिना लेयर सेगमेंटेशन के लिए हाई-रिज़ॉल्यूशन स्कैन इनपुट।',
        kn: 'ಹಂತ 3: ಓಸಿಟಿ ಪರಿಮಾಣಾತ್ಮಕ ಇನ್‌ಪುಟ್. ಮ್ಯಾಕುಲಾರ್ ಪದರಗಳ ವಿಭಜನೆಗಾಗಿ ಹೈ-ರೆಸಲ್ಯೂಶನ್ ಸ್ಕ್ಯಾನ್.',
        ta: 'படி 3: ஓசிடி தொகுதி உள்ளீடு. மேக்குலர் நரம்பு விழித்திரை அடுக்கு பிரிப்பிற்கான உயர் தெளிவுத்திறன் ஸ்கேன்.',
        te: 'దశ 3: ఓసీటీ వాల్యూమెట్రిక్ ఇన్‌పుట్. మాక్యులా పొరల విభజన కోసం హై-రిజల్యూషన్ స్కాన్.',
        ml: 'ഘട്ടം 3: ഒസിടി വോള്യൂമെട്രിക് ഇൻപുട്ട്. മാക്കുലാർ റെറ്റിന പാളികളുടെ വേർതിരിക്കൽ.',
      },
    },
    4: {
      default: {
        en: 'Step 4: Metadata Vector Ingestion. Tabular biomarker normalization: HbA1c, systolic BP, and logMAR visual acuity vectors.',
        hi: 'चरण 4: मेटाडेटा वेक्टर इनपुट। सारणीबद्ध बायोमार्कर सामान्यीकरण: एचबीए1सी, सिस्टोलिक बीपी और विजुअल तीक्ष्णता।',
        kn: 'ಹಂತ 4: ಮೆಟಾಡೇಟಾ ವೆಕ್ಟರ್ ಇನ್‌ಪುಟ್. ಜೈವಿಕ ಸೂಚಕಗಳ ಸಾಮಾನ್ಯೀಕರಣ: HbA1c, ರಕ್ತದೊತ್ತಡ ಮತ್ತು ದೃಷ್ಟಿ ತೀಕ್ಷ್ಣತೆ.',
        ta: 'படி 4: மெட்டாடேட்டா திசையன் உள்ளீடு. HbA1c, இரத்த அழுத்தம் மற்றும் பார்வைத் திறன் வழக்கமாக்கம்.',
        te: 'దశ 4: మెటాడేటా వెక్టర్ ఇన్‌పుట్. HbA1c, రక్తపోటు మరియు దృష్టి తీవ్రత సాధారణీకరణ.',
        ml: 'ഘട്ടം 4: മെറ്റാഡാറ്റ വെക്റ്റർ ഇൻപുട്ട്. HbA1c, ബിപി, കാഴ്ചാ തീവ്രത എന്നിവയുടെ ക്രമീകരണം.',
      },
    },
    5: {
      default: {
        en: 'Step 5: Model Architecture Verification. Cross-referencing visual encoder with cross-attention gating and entropy weights.',
        hi: 'चरण 5: मॉडल आर्किटेक्चर सत्यापन। क्रॉस-अटेंशन गेटिंग और एन्ट्रॉपी भार के साथ विजुअल एनकोडर का सत्यापन।',
        kn: 'ಹಂತ 5: ಮಾದರಿ ವಾಸ್ತುಶಿಲ್ಪ ಪರಿಶೀಲನೆ. ಅಟೆನ್ಷನ್ ಗೇಟಿಂಗ್ ಮತ್ತು ತೂಕಗಳೊಂದಿಗೆ ಎನ್‌ಕೋಡರ್ ಪರಿಶೀಲನೆ.',
        ta: 'படி 5: மாதிரி கட்டமைப்பு சரிபார்ப்பு. கவனக் கட்டுப்பாடுகள் மற்றும் எடைகளுடன் சரிபார்த்தல்.',
        te: 'దశ 5: మోడల్ ఆర్కిటెక్చర్ నిర్ధారణ. అటెన్షన్ గేటింగ్ మరియు వెయిట్లతో ఎన్‌కోడర్ సమీక్ష.',
        ml: 'ഘട്ടം 5: മോഡൽ ഘടനാ പരിശോധന. അറ്റൻഷൻ ഗേറ്റിംഗും വെയ്റ്റുകളും ഉറപ്പുവരുത്തൽ.',
      },
    },
    6: {
      default: {
        en: 'Step 6: Multimodal Fusion Execution. Evaluating late-fusion softmax layer, calculating Quadratic Weighted Kappa, and generating Grad-CAM heatmaps.',
        hi: 'चरण 6: मल्टीमॉडल फ्यूजन निष्पादन। लेट-फ्यूजन सॉफ्टमैक्स परत, क्वाड्रेटिक वेटेड कप्पा और ग्रैड-कैम का मूल्यांकन।',
        kn: 'ಹಂತ 6: ಮಲ್ಟಿಮೋಡಲ್ ಫ್ಯೂಷನ್ ಕಾರ್ಯಗತಗೊಳಿಸುವಿಕೆ. ಸಾಫ್ಟ್‌ಮ್ಯಾಕ್ಸ್ ಪದರ, ಕ್ವಾಡ್ರಾಟಿಕ್ ಕಪ್ಪಾ ಮತ್ತು ಗ್ರ್ಯಾಡ್-ಕ್ಯಾಮ್ ಮೌಲ್ಯಮಾಪನ.',
        ta: 'படி 6: மல்டிமாடல் ஃபியூஷன் செயல்பாடு. சாஃப்ட்மேக்ஸ் அடுக்கு, குவாட்ராடிக் கப்பா மற்றும் கிராட்-கேம் கணக்கீடு.',
        te: 'దశ 6: మల్టీమోడల్ ఫ్యూజన్ నిర్వహణ. సాఫ్ట్‌మ్యాక్స్ లేయర్, క్వాడ్రాటిక్ వెయిటెడ్ కప్పా మరియు గ్రాడ్-క్యామ్ జనరేషన్.',
        ml: 'ഘട്ടം 6: മൾട്ടിമോഡൽ ഫ്യൂഷൻ എക്സിക്യൂഷൻ. സോഫ്റ്റ്‌മാക്സ് ലെയറും ഗ്രേഡ്-ക്യാം മാപ്പുകളും നിർമ്മിക്കുന്നു.',
      },
    },
    7: {
      default: {
        en: 'Step 7: Inference synthesis finalized. Multi-class probability distribution, SHAP feature importance, and diagnostic confidence intervals ready.',
        hi: 'चरण 7: निष्कर्ष संश्लेषण पूर्ण। बहु-वर्ग संभाव्यता वितरण, एसएचएपी फीचर महत्व और विश्वास अंतराल तैयार।',
        kn: 'ಹಂತ 7: ಫಲಿತಾಂಶ ಸಂಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ. ಬಹು-ವರ್ಗ ಸಂಭವನೀಯತೆ, SHAP ಪ್ರಾಮುಖ್ಯತೆ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹತೆ ಸಿದ್ಧವಾಗಿದೆ.',
        ta: 'படி 7: மாதிரி முடிவு இறுதி செய்யப்பட்டது. பல-வகுப்பு நிகழ்தகவு பகிர்வு, SHAP முக்கியத்துவம் மற்றும் நம்பிக்கை இடைவெளிகள் தயார்.',
        te: 'దశ 7: ఇన్ఫరెన్స్ సంశ్లేషణ పూర్తయింది. బహుళ-తరగతి సంభావ్యత పంపిణీ, SHAP ప్రాముఖ్యత మరియు విశ్వసనీయత సిద్ధం.',
        ml: 'ഘട്ടം 7: വിശകലന സംഗ്രഹം പൂർത്തിയായി. സാധ്യത വിതരണം, SHAP പ്രാധാന്യം എന്നിവ തയ്യാറാണ്.',
      },
    },
  },
};

// UI localized labels for the Voice Guide Card
const VOICE_GUIDE_UI_LABELS: Record<
  LanguageCode,
  {
    title: string;
    toggleOn: string;
    toggleOff: string;
    play: string;
    pause: string;
    repeat: string;
    stop: string;
    idleText: string;
    playingStatus: string;
    pausedStatus: string;
    readyStatus: string;
    disabledStatus: string;
    patientBadge: string;
    helperBadge: string;
    researcherBadge: string;
  }
> = {
  en: {
    title: 'Screening Voice Guide',
    toggleOn: 'ON',
    toggleOff: 'OFF',
    play: 'Play',
    pause: 'Pause',
    repeat: 'Repeat',
    stop: 'Stop',
    idleText: 'Voice Guide is enabled. Press Play to listen to current step guidance.',
    playingStatus: 'Speaking...',
    pausedStatus: 'Paused',
    readyStatus: 'Ready',
    disabledStatus: 'Voice Guide is OFF',
    patientBadge: 'Simple & Reassuring Guidance',
    helperBadge: 'Workflow Guidance',
    researcherBadge: 'Technical Workflow Guidance',
  },
  hi: {
    title: 'स्क्रीनिंग वॉयस गाइड',
    toggleOn: 'चालू (ON)',
    toggleOff: 'बंद (OFF)',
    play: 'चलाएं (Play)',
    pause: 'रोकें (Pause)',
    repeat: 'दोहराएं (Repeat)',
    stop: 'बंद करें (Stop)',
    idleText: 'वॉयस गाइड सक्षम है। वर्तमान चरण के निर्देश सुनने के लिए प्ले दबाएं।',
    playingStatus: 'बोल रहा है...',
    pausedStatus: 'रोका गया',
    readyStatus: 'तैयार',
    disabledStatus: 'वॉयस गाइड बंद है',
    patientBadge: 'सरल और आश्वस्तकारी मार्गदर्शन',
    helperBadge: 'कार्यप्रवाह मार्गदर्शन',
    researcherBadge: 'तकनीकी कार्यप्रवाह मार्गदर्शन',
  },
  kn: {
    title: 'ಸ್ಕ್ರೀನಿಂಗ್ ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ',
    toggleOn: 'ಆನ್ (ON)',
    toggleOff: 'ಆಫ್ (OFF)',
    play: 'ಪ್ಲೇ (Play)',
    pause: 'ವಿರಾಮ (Pause)',
    repeat: 'ಪುನರಾವರ್ತಿಸಿ (Repeat)',
    stop: 'ನಿಲ್ಲಿಸಿ (Stop)',
    idleText: 'ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ ಆನ್ ಆಗಿದೆ. ಪ್ರಸ್ತುತ ಹಂತದ ಸೂಚನೆಗಳನ್ನು ಕೇಳಲು ಪ್ಲೇ ಒತ್ತಿರಿ.',
    playingStatus: 'ಮಾತನಾಡುತ್ತಿದೆ...',
    pausedStatus: 'ವಿರಾಮಗೊಳಿಸಲಾಗಿದೆ',
    readyStatus: 'ಸಿದ್ಧವಾಗಿದೆ',
    disabledStatus: 'ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ ಆಫ್ ಆಗಿದೆ',
    patientBadge: 'ಸರಳ ಮತ್ತು ಭರವಸೆಯ ಮಾರ್ಗದರ್ಶನ',
    helperBadge: 'ಕಾರ್ಯಪ್ರವಾಹ ಮಾರ್ಗದರ್ಶನ',
    researcherBadge: 'ತಾಂತ್ರಿಕ ಕಾರ್ಯಪ್ರವಾಹ ಮಾರ್ಗದರ್ಶನ',
  },
  ta: {
    title: 'பரிசோதனை குரல் வழிகாட்டி',
    toggleOn: 'ஆன் (ON)',
    toggleOff: 'ஆஃப் (OFF)',
    play: 'இயக்கு (Play)',
    pause: 'இடைநிறுத்து (Pause)',
    repeat: 'மீண்டும் செய் (Repeat)',
    stop: 'நிறுத்து (Stop)',
    idleText: 'குரல் வழிகாட்டி ஆன் செய்யப்பட்டுள்ளது. வழிமுறைகளைக் கேட்க பிளே அழுத்தவும்.',
    playingStatus: 'பேசுகிறது...',
    pausedStatus: 'இடைநிறுத்தப்பட்டது',
    readyStatus: 'தயார்',
    disabledStatus: 'குரல் வழிகாட்டி ஆஃப் செய்யப்பட்டுள்ளது',
    patientBadge: 'எளிய மற்றும் உறுதியான வழிகாட்டல்',
    helperBadge: 'பணிப்பாய்வு வழிகாட்டல்',
    researcherBadge: 'தொழில்நுட்ப பணிப்பாய்வு வழிகாட்டல்',
  },
  te: {
    title: 'స్క్రీనింగ్ వాయిస్ గైడ్',
    toggleOn: 'ఆన్ (ON)',
    toggleOff: 'ఆఫ్ (OFF)',
    play: 'ప్లే (Play)',
    pause: 'పాజ్ (Pause)',
    repeat: 'పునరావృతం (Repeat)',
    stop: 'ఆపు (Stop)',
    idleText: 'వాయిస్ గైడ్ ఆన్‌లో ఉంది. ప్రస్తుత దశ సూచనలను వినడానికి ప్లే నొక్కండి.',
    playingStatus: 'మాట్లాడుతోంది...',
    pausedStatus: 'పాజ్ చేయబడింది',
    readyStatus: 'సిద్ధంగా ఉంది',
    disabledStatus: 'వాయిస్ గైడ్ ఆఫ్ చేయబడింది',
    patientBadge: 'సులభమైన మరియు భరోసానిచ్చే మార్గదర్శకత్వం',
    helperBadge: 'వర్క్‌ఫ్లో మార్గదర్శకత్వం',
    researcherBadge: 'సాంకేతిక వర్క్‌ఫ్లో మార్గదర్శకత్వం',
  },
  ml: {
    title: 'സ്ക്രീനിംഗ് വോയ്‌സ് ഗൈഡ്',
    toggleOn: 'ഓൺ (ON)',
    toggleOff: 'ഓഫ് (OFF)',
    play: 'പ്ലേ (Play)',
    pause: 'പോസ് (Pause)',
    repeat: 'ആവർത്തിക്കുക (Repeat)',
    stop: 'നിർത്തുക (Stop)',
    idleText: 'വോയ്‌സ് ഗൈഡ് പ്രവർത്തനക്ഷമമാക്കി. ഘട്ട നിർദ്ദേശങ്ങൾ കേൾക്കാൻ പ്ലേ അമർത്തുക.',
    playingStatus: 'സംസാരിക്കുന്നു...',
    pausedStatus: 'താൽക്കാലികമായി നിർത്തി',
    readyStatus: 'തയ്യാറാണ്',
    disabledStatus: 'വോയ്‌സ് ഗൈഡ് ഓഫാണ്',
    patientBadge: 'ലളിതവും ധൈര്യം പകരുന്നതുമായ മാർഗ്ഗനിർദ്ദേശം',
    helperBadge: 'വർക്ക്ഫ്ലോ മാർഗ്ഗനിർദ്ദേശം',
    researcherBadge: 'സാങ്കേതിക വർക്ക്ഫ്ലോ മാർഗ്ഗനിർദ്ദേശം',
  },
};

export const ScreeningVoiceGuide: React.FC<ScreeningVoiceGuideProps> = ({
  role = 'patient',
  currentStep = 1,
  totalSteps = 7,
  stepContext,
  onToggleEnabled,
  className = '',
}) => {
  const { language } = useTranslation();
  const safeLang = (['en', 'hi', 'kn', 'ta', 'te', 'ml'].includes(language)
    ? language
    : 'en') as LanguageCode;

  // Manual ON/OFF state (defaults to false so speech NEVER autoplays without user consent)
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [voiceState, setVoiceState] = useState<VoicePlaybackState>(voiceService.getState());

  // Subscribe to voiceService
  useEffect(() => {
    const unsub = voiceService.subscribe(setVoiceState);
    return () => unsub();
  }, []);

  // Compute text for current step and context
  const currentGuidanceText = useMemo(() => {
    const roleMap = ROLE_INSTRUCTIONS[role] || ROLE_INSTRUCTIONS.patient;
    const stepObj = roleMap[currentStep] || roleMap[1];

    if (stepContext?.hasImageUploaded && stepObj.imageUploaded) {
      return stepObj.imageUploaded[safeLang] || stepObj.imageUploaded.en;
    }

    if (stepContext?.customNote) {
      return stepContext.customNote;
    }

    return stepObj.default[safeLang] || stepObj.default.en;
  }, [role, currentStep, stepContext?.hasImageUploaded, stepContext?.customNote, safeLang]);

  // Handle ON / OFF Toggle
  const handleToggle = (newEnabled: boolean) => {
    setIsEnabled(newEnabled);
    if (!newEnabled) {
      voiceService.stop();
    }
    if (onToggleEnabled) {
      onToggleEnabled(newEnabled);
    }
  };

  // Play Action (Speaks current text in active language)
  const handlePlay = useCallback(() => {
    if (!isEnabled) {
      setIsEnabled(true);
    }

    if (voiceState.isPaused) {
      voiceService.resume();
    } else {
      voiceService.speak({
        text: currentGuidanceText,
        title: `${ROLE_INSTRUCTIONS[role] ? role.toUpperCase() : 'SCREENING'} Voice Guide (Step ${currentStep}/${totalSteps})`,
        lang: safeLang,
      });
    }
  }, [isEnabled, voiceState.isPaused, currentGuidanceText, role, currentStep, totalSteps, safeLang]);

  // Pause Action
  const handlePause = useCallback(() => {
    voiceService.pause();
  }, []);

  // Repeat Action (Replays from start)
  const handleRepeat = useCallback(() => {
    if (!isEnabled) {
      setIsEnabled(true);
    }
    voiceService.stop();
    voiceService.speak({
      text: currentGuidanceText,
      title: `${role.toUpperCase()} Voice Guide (Step ${currentStep}/${totalSteps})`,
      lang: safeLang,
    });
  }, [isEnabled, currentGuidanceText, role, currentStep, totalSteps, safeLang]);

  // Stop Action
  const handleStop = useCallback(() => {
    voiceService.stop();
  }, []);

  // Stop speech if role or component unmounts
  useEffect(() => {
    return () => {
      voiceService.stop();
    };
  }, []);

  const uiLabels = VOICE_GUIDE_UI_LABELS[safeLang] || VOICE_GUIDE_UI_LABELS.en;

  // Language display name
  const langNameMap: Record<LanguageCode, string> = {
    en: 'English',
    hi: 'हिंदी (Hindi)',
    kn: 'ಕನ್ನಡ (Kannada)',
    ta: 'தமிழ் (Tamil)',
    te: 'తెలుగు (Telugu)',
    ml: 'മലയാളം (Malayalam)',
  };

  const isSpeaking = voiceState.isPlaying;
  const isPaused = voiceState.isPaused;

  return (
    <div
      role="region"
      aria-label="Screening Voice Guide"
      id="screening-voice-guide-card"
      className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-xs ${
        isEnabled
          ? 'bg-white dark:bg-[#1E191C] border-[#F05A28]/40 dark:border-[#F05A28]/50 ring-1 ring-[#F05A28]/20'
          : 'bg-[#FAF8F5] dark:bg-[#1A1618] border-[#EFE4DC] dark:border-[#382E32]'
      } ${className}`}
    >
      {/* Top Bar: Title, Role Badge, and OFF / ON Toggle Switch */}
      <div className="p-4 sm:p-5 border-b border-[#F2ECE7] dark:border-[#2C2428] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
              isEnabled
                ? isSpeaking
                  ? 'bg-[#F05A28] text-white shadow-sm animate-pulse'
                  : 'bg-[#FFE5D8] dark:bg-[#3D2619] text-[#F05A28]'
                : 'bg-[#EFE4DC] dark:bg-[#2C2428] text-[#8E7E81]'
            }`}
          >
            {isEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-[#1F181A] dark:text-white flex items-center gap-2">
                <span>{uiLabels.title}</span>
              </h3>

              {/* Role Badge */}
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                  role === 'patient'
                    ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] dark:bg-[#132A1F] dark:text-[#34D399] dark:border-[#1F4C36]'
                    : role === 'helper'
                    ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] dark:bg-[#172554] dark:text-[#60A5FA] dark:border-[#1E3A8A]'
                    : 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE] dark:bg-[#2E1065] dark:text-[#A78BFA] dark:border-[#4C1D95]'
                }`}
              >
                {role === 'patient' && <User className="w-3 h-3" />}
                {role === 'helper' && <Stethoscope className="w-3 h-3" />}
                {role === 'researcher' && <Microscope className="w-3 h-3" />}
                <span>
                  {role === 'patient'
                    ? uiLabels.patientBadge
                    : role === 'helper'
                    ? uiLabels.helperBadge
                    : uiLabels.researcherBadge}
                </span>
              </span>
            </div>

            <p className="text-xs text-[#7A696C] dark:text-[#9F8F92] mt-0.5 flex items-center gap-2">
              <span>
                Language: <strong className="font-semibold text-[#F05A28]">{langNameMap[safeLang]}</strong>
              </span>
              <span>•</span>
              <span>Step {currentStep} of {totalSteps}</span>
            </p>
          </div>
        </div>

        {/* OFF / ON Toggle Control as Requested */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <span className="text-xs font-bold text-[#6E5C5F] dark:text-[#A8989B]">
            🔊 Voice Guide
          </span>
          <div className="inline-flex items-center p-1 bg-[#EFE4DC] dark:bg-[#2C2428] rounded-xl border border-[#E5D7CD] dark:border-[#3E3438]">
            <button
              type="button"
              id="voice-guide-toggle-off"
              onClick={() => handleToggle(false)}
              className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${
                !isEnabled
                  ? 'bg-white dark:bg-[#1E191C] text-[#2E2628] dark:text-white shadow-2xs'
                  : 'text-[#8E7E81] hover:text-[#2E2628] dark:hover:text-white'
              }`}
            >
              {uiLabels.toggleOff}
            </button>
            <button
              type="button"
              id="voice-guide-toggle-on"
              onClick={() => handleToggle(true)}
              className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${
                isEnabled
                  ? 'bg-[#F05A28] text-white shadow-2xs'
                  : 'text-[#8E7E81] hover:text-[#F05A28]'
              }`}
            >
              {uiLabels.toggleOn}
            </button>
          </div>
        </div>
      </div>

      {/* Main Guidance Display & Action Buttons */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Spoken Text Card */}
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
            isEnabled
              ? 'bg-[#FFFDFB] dark:bg-[#252022] border-[#EFE4DC] dark:border-[#3E3438]'
              : 'bg-[#F4EFEA]/60 dark:bg-[#201A1D]/60 border-[#E5D7CD]/70 dark:border-[#332A2E]/70 opacity-75'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-[#F05A28] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step Instruction ({langNameMap[safeLang].split(' ')[0]})</span>
            </span>

            {/* Status indicator */}
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                !isEnabled
                  ? 'bg-[#EFE4DC] dark:bg-[#2C2428] text-[#8E7E81]'
                  : isSpeaking
                  ? 'bg-[#DCFCE7] text-[#15803D] animate-pulse dark:bg-[#143222] dark:text-[#4ADE80]'
                  : isPaused
                  ? 'bg-[#FEF3C7] text-[#B45309] dark:bg-[#36270E] dark:text-[#FBBF24]'
                  : 'bg-[#E0E7FF] text-[#4338CA] dark:bg-[#1E1B4B] dark:text-[#818CF8]'
              }`}
            >
              {!isEnabled
                ? uiLabels.disabledStatus
                : isSpeaking
                ? uiLabels.playingStatus
                : isPaused
                ? uiLabels.pausedStatus
                : uiLabels.readyStatus}
            </span>
          </div>

          <p className="text-sm sm:text-base font-medium text-[#1F181A] dark:text-white leading-relaxed">
            {isEnabled ? currentGuidanceText : uiLabels.idleText}
          </p>
        </div>

        {/* Required Step Controls: Play, Pause, Repeat, Stop */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* PLAY BUTTON */}
            <button
              type="button"
              id="voice-control-play"
              disabled={!isEnabled}
              onClick={handlePlay}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs ${
                isEnabled
                  ? 'bg-[#F05A28] hover:bg-[#D84818] text-white cursor-pointer active:scale-95'
                  : 'bg-[#EFE4DC] dark:bg-[#2C2428] text-[#8E7E81] cursor-not-allowed'
              }`}
              title="Listen to current step instruction"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{uiLabels.play}</span>
            </button>

            {/* PAUSE BUTTON */}
            <button
              type="button"
              id="voice-control-pause"
              disabled={!isEnabled || (!isSpeaking && !isPaused)}
              onClick={handlePause}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 border transition-all ${
                isEnabled && isSpeaking
                  ? 'bg-white dark:bg-[#252022] border-[#EFE4DC] dark:border-[#3E3438] text-[#2E2628] dark:text-white hover:border-[#F05A28] cursor-pointer'
                  : 'bg-[#FAF8F5] dark:bg-[#1A1618] border-[#E5D7CD] dark:border-[#332A2E] text-[#8E7E81] cursor-not-allowed opacity-60'
              }`}
              title="Pause audio playback"
            >
              <Pause className="w-4 h-4" />
              <span>{uiLabels.pause}</span>
            </button>

            {/* REPEAT BUTTON */}
            <button
              type="button"
              id="voice-control-repeat"
              disabled={!isEnabled}
              onClick={handleRepeat}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 border transition-all ${
                isEnabled
                  ? 'bg-white dark:bg-[#252022] border-[#EFE4DC] dark:border-[#3E3438] text-[#2E2628] dark:text-white hover:border-[#F05A28] cursor-pointer'
                  : 'bg-[#FAF8F5] dark:bg-[#1A1618] border-[#E5D7CD] dark:border-[#332A2E] text-[#8E7E81] cursor-not-allowed opacity-60'
              }`}
              title="Replay instruction from the beginning"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{uiLabels.repeat}</span>
            </button>

            {/* STOP BUTTON */}
            <button
              type="button"
              id="voice-control-stop"
              disabled={!isEnabled || (!isSpeaking && !isPaused)}
              onClick={handleStop}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 border transition-all ${
                isEnabled && (isSpeaking || isPaused)
                  ? 'bg-[#FEF2F2] dark:bg-[#2D1B1E] border-[#FECACA] dark:border-[#4C242A] text-[#DC2626] hover:bg-[#FEE2E2] cursor-pointer'
                  : 'bg-[#FAF8F5] dark:bg-[#1A1618] border-[#E5D7CD] dark:border-[#332A2E] text-[#8E7E81] cursor-not-allowed opacity-60'
              }`}
              title="Stop audio playback"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>{uiLabels.stop}</span>
            </button>
          </div>

          {/* Quick Notice: No Autoplay */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#7A696C] dark:text-[#9F8F92]">
            <Info className="w-3.5 h-3.5 text-[#F05A28] shrink-0" />
            <span>Audible speech only activates upon pressing Play or Repeat.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
