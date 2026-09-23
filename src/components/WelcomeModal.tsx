import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Pause,
  Play,
  RotateCcw,
  Square,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  X,
  Globe,
  Heart,
  Eye,
} from 'lucide-react';
import { LanguageCode, SUPPORTED_LANGUAGES } from '../i18n/translations';
import { useTranslation } from '../i18n/I18nContext';
import { voiceService, VoicePlaybackState } from '../services/voiceService';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  // Optional legacy props for compatibility
  onContinueAsPatient?: () => void;
  onContinueAsHelper?: () => void;
  onContinueAsResearcher?: () => void;
}

interface OnboardingContent {
  title: string;
  whatTitle: string;
  whatDesc: string;
  whyTitle: string;
  whyDesc: string;
  howTitle: string;
  forPatientsTitle: string;
  patientPoints: string[];
  disclaimerTitle: string;
  disclaimerText: string;
  readAloudPrompt: string;
  playBtn: string;
  pauseBtn: string;
  stopBtn: string;
  replayBtn: string;
  continueBtn: string;
  playingStatus: string;
  pausedStatus: string;
  readyStatus: string;
}

const ONBOARDING_CONTENT: Record<LanguageCode, OnboardingContent> = {
  en: {
    title: 'Welcome to RetinaGuard',
    whatTitle: 'WHAT IS RETINAGUARD?',
    whatDesc:
      'RetinaGuard is an AI-assisted retinal screening support platform that helps people understand retinal screening, organize screening information, find screening services, and stay connected with follow-up care.',
    whyTitle: 'WHY DOES SCREENING MATTER?',
    whyDesc:
      'Some retinal conditions can develop without obvious symptoms, and screening can help identify people who may need further professional evaluation.',
    howTitle: 'HOW CAN RETINAGUARD HELP?',
    forPatientsTitle: 'For patients:',
    patientPoints: [
      'Understand retinal screening',
      'Upload supported retinal images/reports',
      'Receive screening-support information',
      'Find screening centers',
      'Book appointments',
      'Access reports and follow-up information',
    ],
    disclaimerTitle: 'Important Disclaimer',
    disclaimerText:
      'RetinaGuard provides AI-assisted screening support. It does not replace professional medical evaluation and does not provide a definitive diagnosis.',
    readAloudPrompt: 'Choose a language before listening. Listen to the complete explanation below:',
    playBtn: 'Play',
    pauseBtn: 'Pause',
    stopBtn: 'Stop',
    replayBtn: 'Replay',
    continueBtn: 'Continue to Sign In / Role Selection',
    playingStatus: 'Reading aloud in English...',
    pausedStatus: 'Audio paused',
    readyStatus: 'Ready to read aloud in English',
  },
  hi: {
    title: 'रेटिनागार्ड में आपका स्वागत है',
    whatTitle: 'रेटिनागार्ड क्या है?',
    whatDesc:
      'रेटिनागार्ड एक एआई-सहायता प्राप्त रेटिनल स्क्रीनिंग सहायता प्लेटफॉर्म है जो लोगों को रेटिनल स्क्रीनिंग समझने, स्क्रीनिंग जानकारी व्यवस्थित करने, स्क्रीनिंग सेवाएं खोजने और फॉलो-अप देखभाल से जुड़े रहने में मदद करता है।',
    whyTitle: 'स्क्रीनिंग क्यों जरूरी है?',
    whyDesc:
      'रेटिना की कुछ स्थितियां बिना किसी स्पष्ट लक्षण के विकसित हो सकती हैं, और स्क्रीनिंग से उन लोगों की पहचान करने में मदद मिल सकती है जिन्हें आगे पेशेवर चिकित्सा मूल्यांकन की आवश्यकता हो सकती है।',
    howTitle: 'रेटिनागार्ड कैसे मदद कर सकता है?',
    forPatientsTitle: 'मरीजों के लिए:',
    patientPoints: [
      'रेटिनल स्क्रीनिंग को समझें',
      'समर्थित रेटिना इमेज/रिपोर्ट अपलोड करें',
      'स्क्रीनिंग-सहायता जानकारी प्राप्त करें',
      'स्क्रीनिंग केंद्र खोजें',
      'अपॉइंटमेंट बुक करें',
      'रिपोर्ट और फॉलो-अप जानकारी प्राप्त करें',
    ],
    disclaimerTitle: 'महत्वपूर्ण अस्वीकरण',
    disclaimerText:
      'रेटिनागार्ड एआई-सहायता प्राप्त स्क्रीनिंग सहायता प्रदान करता है। यह पेशेवर चिकित्सा मूल्यांकन का स्थान नहीं लेता है और निश्चित निदान प्रदान नहीं करता है।',
    readAloudPrompt: 'सुनने से पहले भाषा चुनें। पूरा विवरण नीचे सुनें:',
    playBtn: 'शुरू करें (Play)',
    pauseBtn: 'रोकें (Pause)',
    stopBtn: 'बंद करें (Stop)',
    replayBtn: 'फिर से सुनें (Replay)',
    continueBtn: 'आगे बढ़ें (Continue)',
    playingStatus: 'हिंदी में पढ़ा जा रहा है...',
    pausedStatus: 'ऑडियो रुका हुआ है',
    readyStatus: 'हिंदी में सुनने के लिए तैयार',
  },
  kn: {
    title: 'ರೆಟಿನಾಗಾರ್ಡ್‌ಗೆ ಸುಸ್ವಾಗತ',
    whatTitle: 'ರೆಟಿನಾಗಾರ್ಡ್ ಎಂದರೇನು?',
    whatDesc:
      'ರೆಟಿನಾಗಾರ್ಡ್ ಎನ್ನುವುದು ಎಐ-ಬೆಂಬಲಿತ ರೆಟಿನಾ ತಪಾಸಣಾ ನೆರವು ವೇದಿಕೆಯಾಗಿದ್ದು, ಜನರಿಗೆ ರೆಟಿನಾ ತಪಾಸಣೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು, ತಪಾಸಣೆ ಮಾಹಿತಿಯನ್ನು ಸಂಘಟಿಸಲು, ತಪಾಸಣಾ ಸೇವೆಗಳನ್ನು ಹುಡುಕಲು ಮತ್ತು ಮುಂದಿನ ಆರೈಕೆಯೊಂದಿಗೆ ಸಂಪರ್ಕದಲ್ಲಿರಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
    whyTitle: 'ತಪಾಸಣೆ ಏಕೆ ಮುಖ್ಯ?',
    whyDesc:
      'ಕೆಲವು ರೆಟಿನಾ ತೊಂದರೆಗಳು ಯಾವುದೇ ಆರಂಭಿಕ ಲಕ್ಷಣಗಳಿಲ್ಲದೆ ಉಲ್ಬಣಿಸಬಹುದು, ಮತ್ತು ತಪಾಸಣೆಯು ಮುಂದಿನ ವೃತ್ತಿಪರ ವೈದ್ಯಕೀಯ ಮೌಲ್ಯಮಾಪನದ ಅಗತ್ಯವಿರುವ ವ್ಯಕ್ತಿಗಳನ್ನು ಗುರುತಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
    howTitle: 'ರೆಟಿನಾಗಾರ್ಡ್ ಹೇಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ?',
    forPatientsTitle: 'ರೋಗಿಗಳಿಗೆ:',
    patientPoints: [
      'ರೆಟಿನಾ ತಪಾಸಣೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ',
      'ಬೆಂಬಲಿತ ರೆಟಿನಾ ಚಿತ್ರಗಳು/ವರದಿಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      'ತಪಾಸಣಾ-ಬೆಂಬಲ ಮಾಹಿತಿಯನ್ನು ಪಡೆಯಿರಿ',
      'ತಪಾಸಣಾ ಕೇಂದ್ರಗಳನ್ನು ಹುಡುಕಿ',
      'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ',
      'ವರದಿಗಳು ಮತ್ತು ಮುಂದಿನ ಮಾಹಿತಿಯನ್ನು ಪ್ರವೇಶಿಸಿ',
    ],
    disclaimerTitle: 'ಪ್ರಮುಖ ಸೂಚನೆ',
    disclaimerText:
      'ರೆಟಿನಾಗಾರ್ಡ್ ಎಐ-ಸಹಾಯದ ತಪಾಸಣಾ ಬೆಂಬಲವನ್ನು ನೀಡುತ್ತದೆ. ಇದು ವೃತ್ತಿಪರ ವೈದ್ಯಕೀಯ ಮೌಲ್ಯಮಾಪನವನ್ನು ಬದಲಿಸುವುದಿಲ್ಲ ಮತ್ತು ಅಂತಿಮ ರೋಗನಿರ್ಣಯವನ್ನು ಒದಗಿಸುವುದಿಲ್ಲ.',
    readAloudPrompt: 'ಆಲಿಸುವ ಮೊದಲು ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಸಂಪೂರ್ಣ ವಿವರಣೆಯನ್ನು ಆಲಿಸಿ:',
    playBtn: 'ಪ್ಲೇ (Play)',
    pauseBtn: 'ವಿರಾಮ (Pause)',
    stopBtn: 'ನಿಲ್ಲಿಸಿ (Stop)',
    replayBtn: 'ಮತ್ತೊಮ್ಮೆ ಆಲಿಸಿ (Replay)',
    continueBtn: 'ಮುಂದುವರಿಯಿರಿ (Continue)',
    playingStatus: 'ಕನ್ನಡದಲ್ಲಿ ಓದಲಾಗುತ್ತಿದೆ...',
    pausedStatus: 'ಆಡಿಯೋ ವಿರಾಮದಲ್ಲಿದೆ',
    readyStatus: 'ಕನ್ನಡದಲ್ಲಿ ಆಲಿಸಲು ಸಿದ್ಧವಾಗಿದೆ',
  },
  ta: {
    title: 'ரெட்டினாகார்டுக்கு வரவேற்கிறோம்',
    whatTitle: 'ரெட்டினாகார்ட் என்றால் என்ன?',
    whatDesc:
      'ரெட்டினாகார்ட் என்பது ஒரு AI-உதவி விழித்திரை பரிசோதனை ஆதரவு தளமாகும், இது மக்கள் விழித்திரை பரிசோதனையைப் புரிந்து கொள்ளவும், பரிசோதனை தகவல்களை ஒழுங்கமைக்கவும், பரிசோதனை சேவைகளைக் கண்டறியவும், தொடர் கவனிப்புடன் இணைந்திருக்கவும் உதவுகிறது.',
    whyTitle: 'பரிசோதனை ஏன் முக்கியம்?',
    whyDesc:
      'சில விழித்திரை நிலைகள் வெளிப்படையான அறிகுறிகள் இல்லாமலேயே உருவாகலாம், மேலும் பரிசோதனை மூலம் கூடுதல் மருத்துவ மதிப்பீடு தேவைப்படும் நபர்களை அடையாளம் காண முடியும்.',
    howTitle: 'ரெட்டினாகார்ட் எவ்வாறு உதவுகிறது?',
    forPatientsTitle: 'நோயாளிகளுக்கு / பொது மக்களுக்கு:',
    patientPoints: [
      'விழித்திரை பரிசோதனையைப் புரிந்து கொள்ளுதல்',
      'ஆதரிக்கப்படும் விழித்திரை படங்கள்/அறிக்கைகளைப் பதிவேற்றுதல்',
      'பரிசோதனை-ஆதரவு தகவல்களைப் பெறுதல்',
      'பரிசோதனை மையங்களைக் கண்டறிதல்',
      'முன்பதிவு செய்தல்',
      'அறிக்கைகள் மற்றும் தொடர் தகவல்களைப் பெறுதல்',
    ],
    disclaimerTitle: 'முக்கிய அறிவிப்பு',
    disclaimerText:
      'ரெட்டினாகார்ட் AI-உதவி பரிசோதனை ஆதரவை வழங்குகிறது. இது தகுதிவாய்ந்த மருத்துவ மதிப்பீட்டிற்கு மாற்றாகாது மற்றும் திட்டவட்டமான நோயறிதலை வழங்காது.',
    readAloudPrompt: 'கேட்பதற்கு முன் மொழியைத் தேர்வுசெய்யவும். முழு விளக்கத்தையும் கேளுங்கள்:',
    playBtn: 'இயக்குக (Play)',
    pauseBtn: 'இடைநிறுத்து (Pause)',
    stopBtn: 'நிறுத்து (Stop)',
    replayBtn: 'மீண்டும் கேள் (Replay)',
    continueBtn: 'தொடரவும் (Continue)',
    playingStatus: 'தமிழில் வாசிக்கப்படுகிறது...',
    pausedStatus: 'ஆடியோ இடைநிறுத்தப்பட்டுள்ளது',
    readyStatus: 'தமிழில் கேட்க தயாராக உள்ளது',
  },
  te: {
    title: 'రెటినాగార్డ్‌కు స్వాగతం',
    whatTitle: 'రెటినాగార్డ్ అంటే ఏమిటి?',
    whatDesc:
      'రెటినాగార్డ్ అనేది AI-సహాయక రెటీనా స్క్రీనింగ్ మద్దతు ప్లాట్‌ఫారమ్, ఇది ప్రజలు రెటీనా స్క్రీనింగ్‌ను అర్థం చేసుకోవడానికి, స్క్రీనింగ్ సమాచారాన్ని నిర్వహించడానికి, స్క్రీనింగ్ సేవలను కనుగొనడానికి మరియు తదుపరి సంరక్షణతో కనెక్ట్ అవ్వడానికి సహాయపడుతుంది.',
    whyTitle: 'స్క్రీనింగ్ ఎందుకు ముఖ్యం?',
    whyDesc:
      'కొన్ని రెటీనా పరిస్థితులు స్పష్టమైన లక్షణాలు లేకుండానే అభివృద్ధి చెందుతాయి మరియు స్క్రీనింగ్ ద్వారా తదుపరి వైద్య మూల్యాంకనం అవసరమయ్యే వ్యక్తులను గుర్తించవచ్చు.',
    howTitle: 'రెటినాగార్డ్ ఎలా సహాయపడుతుంది?',
    forPatientsTitle: 'రోగులకు:',
    patientPoints: [
      'రెటీనా స్క్రీనింగ్‌ను అర్థం చేసుకోండి',
      'మద్దతు ఉన్న రెటీనా చిత్రాలు/నివేదికలను అప్‌లోడ్ చేయండి',
      'స్క్రీనింగ్-మద్దతు సమాచారాన్ని పొందండి',
      'స్క్రీనింగ్ కేంద్రాలను కనుగొనండి',
      'అపాయింట్‌మెంట్‌లను బుక్ చేయండి',
      'నివేదికలు మరియు తదుపరి సమాచారాన్ని యాక్సెస్ చేయండి',
    ],
    disclaimerTitle: 'ముఖ్యమైన గమనిక',
    disclaimerText:
      'రెటినాగార్డ్ AI-సహాయక స్క్రీనింగ్ మద్దతును అందిస్తుంది. ఇది వృత్తిపరమైన వైద్య మూల్యాంకనాన్ని భర్తీ చేయదు మరియు ఖచ్చితమైన రోగ నిర్ధారణను అందించదు.',
    readAloudPrompt: 'వినే ముందు భాషను ఎంచుకోండి. పూర్తి వివరణను వినండి:',
    playBtn: 'ప్లే (Play)',
    pauseBtn: 'పాజ్ (Pause)',
    stopBtn: 'ఆపు (Stop)',
    replayBtn: 'మళ్ళీ వినండి (Replay)',
    continueBtn: 'కొనసాగించండి (Continue)',
    playingStatus: 'తెలుగులో చదవబడుతోంది...',
    pausedStatus: 'ఆడియో పాజ్ చేయబడింది',
    readyStatus: 'తెలుగులో వినడానికి సిద్ధంగా ఉంది',
  },
  ml: {
    title: 'റെറ്റിനാഗാർഡിലേക്ക് സ്വാഗതം',
    whatTitle: 'എന്താണ് റെറ്റിനാഗാർഡ്?',
    whatDesc:
      'റെറ്റിന സ്ക്രീനിംഗ് മനസ്സിലാക്കുന്നതിനും സ്ക്രീനിംഗ് വിവരങ്ങൾ ക്രമീകരിക്കുന്നതിനും സ്ക്രീനിംഗ് സേവനങ്ങൾ കണ്ടെത്തുന്നതിനും തുടർ പരിചരണവുമായി ബന്ധം നിലനിർത്തുന്നതിനും ആളുകളെ സഹായിക്കുന്ന ഒരു AI-സഹായ സ്ക്രീനിംഗ് പ്ലാറ്റ്‌ഫോമാണ് റെറ്റിനാഗാർഡ്.',
    whyTitle: 'സ്ക്രീനിംഗ് പ്രധാനമായിരിക്കുന്നത് എന്തുകൊണ്ട്?',
    whyDesc:
      'ചില റെറ്റിന പ്രശ്നങ്ങൾ പ്രകടമായ ലക്ഷണങ്ങളില്ലാതെ ഉണ്ടാകാം, കൂടാതെ വിദഗ്ദ്ധ പരിശോധന ആവശ്യമുള്ളവരെ തിരിച്ചറിയാൻ സ്ക്രീനിംഗ് സഹായിക്കും.',
    howTitle: 'റെറ്റിനാഗാർഡ് എങ്ങനെ സഹായിക്കുന്നു?',
    forPatientsTitle: 'രോഗികൾക്കായി:',
    patientPoints: [
      'റെറ്റിനൽ സ്ക്രീനിംഗ് മനസ്സിലാക്കുക',
      'പിന്തുണയ്ക്കുന്ന റെറ്റിന ചിത്രങ്ങൾ/റിപ്പോർട്ടുകൾ അപ്‌ലോഡ് ചെയ്യുക',
      'സ്ക്രീനിംഗ് സഹായ വിവരങ്ങൾ നേടുക',
      'സ്ക്രീനിംഗ് കേന്ദ്രങ്ങൾ കണ്ടെത്തുക',
      'അപ്പോയിന്റ്മെന്റുകൾ ബുക്ക് ചെയ്യുക',
      'റിപ്പോർട്ടുകളും തുടർ വിവരങ്ങളും ആക്സസ് ചെയ്യുക',
    ],
    disclaimerTitle: 'പ്രധാന അറിയിപ്പ്',
    disclaimerText:
      'റെറ്റിനാഗാർഡ് AI-സഹായത്തോടെയുള്ള സ്ക്രീനിംഗ് വിവരങ്ങൾ നൽകുന്നു. ഇത് യഥാർത്ഥ വൈദ്യപരിശോധനയ്ക്ക് പകരമാവില്ല, അന്തിമ രോഗനിർണയം നൽകുന്നില്ല.',
    readAloudPrompt: 'കേൾക്കുന്നതിന് മുമ്പ് ഭാഷ തിരഞ്ഞെടുക്കുക. വിവരണം താഴെ കേൾക്കുക:',
    playBtn: 'പ്ലേ (Play)',
    pauseBtn: 'പോസ് (Pause)',
    stopBtn: 'നിർത്തുക (Stop)',
    replayBtn: 'വീണ്ടും കേൾക്കുക (Replay)',
    continueBtn: 'തുടരുക (Continue)',
    playingStatus: 'മലയാളത്തിൽ വായിക്കുന്നു...',
    pausedStatus: 'ഓഡിയോ താൽക്കാലികമായി നിർത്തി',
    readyStatus: 'മലയാളത്തിൽ കേൾക്കാൻ തയ്യാറാണ്',
  },
};

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  onContinueAsPatient,
}) => {
  const { language, setLanguage } = useTranslation();
  const [voiceState, setVoiceState] = useState<VoicePlaybackState>(voiceService.getState());

  useEffect(() => {
    const unsub = voiceService.subscribe((state) => {
      setVoiceState(state);
    });
    return () => {
      unsub();
    };
  }, []);

  // Ensure speech is stopped if modal is closed or unmounted
  useEffect(() => {
    if (!isOpen) {
      voiceService.stop();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const content = ONBOARDING_CONTENT[language] || ONBOARDING_CONTENT.en;

  // Build the complete speech text in the selected language
  const getFullSpeechText = (): string => {
    const pointsText = content.patientPoints.join('. ');
    return `${content.title}. ${content.whatTitle} ${content.whatDesc} ${content.whyTitle} ${content.whyDesc} ${content.howTitle} ${content.forPatientsTitle} ${pointsText}. ${content.disclaimerTitle}: ${content.disclaimerText}`;
  };

  const isSpeakingThis = voiceState.isPlaying && voiceState.speakingSectionId === 'welcome-modal';
  const isPausedThis = voiceState.isPaused && voiceState.speakingSectionId === 'welcome-modal';

  const handleLanguageChange = (newLang: LanguageCode) => {
    // If audio is playing or paused, stop it so user can trigger in the newly selected language
    if (voiceState.isPlaying || voiceState.isPaused) {
      voiceService.stop();
    }
    setLanguage(newLang);
  };

  const handlePlayVoice = () => {
    if (isPausedThis) {
      voiceService.resume();
    } else {
      voiceService.speak({
        text: getFullSpeechText(),
        title: content.title,
        lang: language,
        sectionId: 'welcome-modal',
      });
    }
  };

  const handlePauseVoice = () => {
    voiceService.pause();
  };

  const handleStopVoice = () => {
    voiceService.stop();
  };

  const handleReplayVoice = () => {
    voiceService.stop();
    voiceService.speak({
      text: getFullSpeechText(),
      title: content.title,
      lang: language,
      sectionId: 'welcome-modal',
    });
  };

  const handleModalContinue = () => {
    voiceService.stop();
    if (onContinue) {
      onContinue();
    } else if (onContinueAsPatient) {
      onContinueAsPatient();
    }
  };

  const handleModalClose = () => {
    voiceService.stop();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-6 animate-in fade-in duration-200"
    >
      <div className="bg-[#FFFDF9] rounded-3xl border border-[#EFE4DC] shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-[#2B2024] relative">
        {/* TOP HEADER: TITLE + CLOSE BUTTON */}
        <div className="px-6 py-4 sm:px-8 sm:py-5 border-b border-[#EFE4DC] bg-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFE5D8] border border-[#FED7AA] flex items-center justify-center text-[#F05A28] shadow-2xs">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#F05A28] uppercase tracking-wider block">
                RETINAGUARD ONBOARDING
              </span>
              <h1
                id="welcome-modal-title"
                className="font-serif font-bold text-xl sm:text-2xl text-[#2B2024] tracking-tight"
              >
                {content.title}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleModalClose}
            aria-label="Close welcome modal"
            className="p-2 rounded-xl text-[#9E8D91] hover:text-[#2B2024] hover:bg-[#FFE5D8]/50 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-left">
          {/* 1. LANGUAGE SELECTOR (User must choose language before reading) */}
          <div className="p-4 rounded-2xl bg-white border border-[#EFE4DC] shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#F05A28]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#6F6267]">
                  Select Language / भाषा चुनें
                </span>
              </div>
              <span className="text-[11px] text-[#9E8D91] font-medium hidden sm:inline">
                Choose before reading aloud
              </span>
            </div>

            {/* Language Selection Chips (English, Hindi, Kannada, Tamil, Telugu, Malayalam) */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all border ${
                      isSelected
                        ? 'bg-[#F05A28] text-white border-[#F05A28] shadow-xs'
                        : 'bg-[#FFFDF9] text-[#2B2024] hover:bg-[#FFE5D8]/40 border-[#EFE4DC]'
                    }`}
                  >
                    <span className="text-[12px]">{lang.nativeLabel}</span>
                    <span
                      className={`text-[9px] uppercase mt-0.5 ${
                        isSelected ? 'text-white/80' : 'text-[#9E8D91]'
                      }`}
                    >
                      {lang.code}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. 🔊 READ ALOUD CONTROLS BAR (Play, Pause, Stop, Replay - No autoplay) */}
          <div className="p-4 rounded-2xl bg-[#FFE5D8]/30 border border-[#FED7AA] shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#F05A28] text-white flex items-center justify-center shadow-xs">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#D84818] block">
                    🔊 Read Aloud
                  </span>
                  <span className="text-[11px] text-[#6F6267]">
                    {isSpeakingThis
                      ? content.playingStatus
                      : isPausedThis
                      ? content.pausedStatus
                      : content.readyStatus}
                  </span>
                </div>
              </div>

              {/* Audio Controls */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                {/* Play Button */}
                <button
                  type="button"
                  id="welcome-read-aloud-play"
                  onClick={handlePlayVoice}
                  disabled={isSpeakingThis}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                    isSpeakingThis
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : 'bg-[#F05A28] hover:bg-[#D84818] text-white active:scale-95'
                  }`}
                  title="Play"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{content.playBtn}</span>
                </button>

                {/* Pause Button */}
                <button
                  type="button"
                  id="welcome-read-aloud-pause"
                  onClick={handlePauseVoice}
                  disabled={!isSpeakingThis}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                    isSpeakingThis
                      ? 'bg-white hover:bg-stone-50 text-[#2B2024] border-[#EFE4DC]'
                      : 'bg-stone-100 text-stone-400 border-transparent cursor-not-allowed'
                  }`}
                  title="Pause"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{content.pauseBtn}</span>
                </button>

                {/* Stop Button */}
                <button
                  type="button"
                  id="welcome-read-aloud-stop"
                  onClick={handleStopVoice}
                  disabled={!isSpeakingThis && !isPausedThis}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                    isSpeakingThis || isPausedThis
                      ? 'bg-white hover:bg-stone-50 text-[#2B2024] border-[#EFE4DC]'
                      : 'bg-stone-100 text-stone-400 border-transparent cursor-not-allowed'
                  }`}
                  title="Stop"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">{content.stopBtn}</span>
                </button>

                {/* Replay Button */}
                <button
                  type="button"
                  id="welcome-read-aloud-replay"
                  onClick={handleReplayVoice}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#FFE5D8]/50 text-[#2B2024] border border-[#EFE4DC] transition-colors"
                  title="Replay from start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{content.replayBtn}</span>
                </button>
              </div>
            </div>

            {isSpeakingThis && (
              <div className="flex items-center gap-1.5 pt-1">
                <span className="w-2 h-2 rounded-full bg-[#F05A28] animate-ping" />
                <span className="text-[11px] font-semibold text-[#F05A28]">
                  {content.playingStatus}
                </span>
              </div>
            )}
          </div>

          {/* 3. WHAT IS RETINAGUARD? */}
          <div className="space-y-2 p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE4DC] shadow-2xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F05A28] flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>{content.whatTitle}</span>
            </h2>
            <p className="text-sm sm:text-base text-[#2B2024] leading-relaxed">
              {content.whatDesc}
            </p>
          </div>

          {/* 4. WHY DOES SCREENING MATTER? */}
          <div className="space-y-2 p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE4DC] shadow-2xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F05A28] flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" />
              <span>{content.whyTitle}</span>
            </h2>
            <p className="text-sm sm:text-base text-[#2B2024] leading-relaxed">
              {content.whyDesc}
            </p>
          </div>

          {/* 5. HOW CAN RETINAGUARD HELP? */}
          <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE4DC] shadow-2xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F05A28]">
              {content.howTitle}
            </h2>
            <div className="text-xs font-bold text-[#6F6267] uppercase tracking-wide">
              {content.forPatientsTitle}
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {content.patientPoints.map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs sm:text-sm text-[#2B2024] leading-snug"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#087F6A] shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 6. IMPORTANT DISCLAIMER */}
          <div className="p-4 rounded-2xl bg-[#FFE5D8]/50 border border-[#FED7AA] flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#F05A28] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#D84818] uppercase tracking-wider block">
                {content.disclaimerTitle}
              </span>
              <p className="text-xs sm:text-sm text-[#6F6267] leading-relaxed">
                "{content.disclaimerText}"
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="px-6 py-4 sm:px-8 sm:py-5 bg-white border-t border-[#EFE4DC] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleModalClose}
            className="text-xs font-semibold text-[#6F6267] hover:text-[#2B2024] px-3 py-2 rounded-xl hover:bg-stone-100 transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            id="welcome-onboarding-continue-btn"
            onClick={handleModalContinue}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#F05A28] hover:bg-[#D84818] active:bg-[#C23C10] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all ring-2 ring-[#F05A28]/25"
          >
            <span>{content.continueBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
