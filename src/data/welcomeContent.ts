import { LanguageCode } from '../i18n/translations';

export interface WelcomeLanguageContent {
  title: string;
  chooseLanguageLabel: string;
  readAloudLabel: string;
  whatIsTitle: string;
  whatIsDesc: string;
  whyMattersTitle: string;
  whyMattersDesc: string;
  howCanHelpTitle: string;
  forPeopleTitle: string;
  forPeoplePoints: string[];
  forHelpersTitle: string;
  forHelpersPoints: string[];
  forResearchersTitle: string;
  forResearchersPoints: string[];
  disclaimerTitle: string;
  disclaimerText: string;
  continueButton: string;
  audioSpeechText: string;
}

export const WELCOME_CONTENT: Record<LanguageCode, WelcomeLanguageContent> = {
  en: {
    title: 'Welcome to RetinaGuard',
    chooseLanguageLabel: 'Choose Language',
    readAloudLabel: 'Read Aloud',
    whatIsTitle: 'WHAT IS RETINAGUARD?',
    whatIsDesc:
      'RetinaGuard is an AI-assisted retinal screening support platform designed to help people understand retinal screening and help screening teams organize and assess screening information.',
    whyMattersTitle: 'WHY DOES SCREENING MATTER?',
    whyMattersDesc:
      'Some retinal conditions may progress without obvious symptoms, and screening can help identify people who may need further professional evaluation.',
    howCanHelpTitle: 'HOW CAN RETINAGUARD HELP?',
    forPeopleTitle: 'For people',
    forPeoplePoints: [
      'Learn about retinal screening',
      'Find screening centers',
      'Understand screening information',
      'Upload an existing retinal image/report where supported',
      'Receive reports and follow-up information',
    ],
    forHelpersTitle: 'For screening helpers',
    forHelpersPoints: [
      'Capture/upload screening information',
      'Check image quality',
      'Organize cases',
      'Support referral workflows',
    ],
    forResearchersTitle: 'For researchers',
    forResearchersPoints: [
      'Explore models',
      'Evaluate AI systems',
      'Explore explainability and research data',
    ],
    disclaimerTitle: 'Important Notice',
    disclaimerText:
      'RetinaGuard provides AI-assisted screening support and does not replace professional medical evaluation or provide a definitive diagnosis.',
    continueButton: 'Continue',
    audioSpeechText:
      'Welcome to RetinaGuard. What is RetinaGuard? RetinaGuard is an AI-assisted retinal screening support platform designed to help people understand retinal screening and help screening teams organize and assess screening information. Why does screening matter? Some retinal conditions may progress without obvious symptoms, and screening can help identify people who may need further professional evaluation. How can RetinaGuard help? For people: Learn about retinal screening, find screening centers, understand screening information, upload an existing retinal image or report where supported, and receive reports and follow-up information. For screening helpers: Capture or upload screening information, check image quality, organize cases, and support referral workflows. For researchers: Explore models, evaluate AI systems, and explore explainability and research data. Important notice: RetinaGuard provides AI-assisted screening support and does not replace professional medical evaluation or provide a definitive diagnosis.',
  },

  hi: {
    title: 'रेटिनागार्ड में आपका स्वागत है',
    chooseLanguageLabel: 'भाषा चुनें',
    readAloudLabel: 'आवाज़ में सुनें',
    whatIsTitle: 'रेटिनागार्ड क्या है?',
    whatIsDesc:
      'रेटिनागार्ड एक एआई-सहायक रेटिनल स्क्रीनिंग सपोर्ट प्लेटफॉर्म है जिसे लोगों को रेटिना जांच समझाने और स्क्रीनिंग टीमों को जांच जानकारी व्यवस्थित और मूल्यांकन करने में मदद के लिए डिज़ाइन किया गया है।',
    whyMattersTitle: 'स्क्रीनिंग क्यों ज़रूरी है?',
    whyMattersDesc:
      'रेटिना की कुछ स्थितियां बिना किसी स्पष्ट लक्षण के बढ़ सकती हैं, और समय पर जांच उन लोगों की पहचान करने में मदद करती है जिन्हें आगे डॉक्टर से मूल्यांकन की आवश्यकता हो सकती है।',
    howCanHelpTitle: 'रेटिनागार्ड कैसे मदद कर सकता है?',
    forPeopleTitle: 'मरीज़ों और परिवारों के लिए',
    forPeoplePoints: [
      'रेटिनल स्क्रीनिंग के बारे में जानें',
      'नजदीकी स्क्रीनिंग केंद्र खोजें',
      'स्क्रीनिंग की जानकारी समझें',
      'जहां उपलब्ध हो, मौजूदा रेटिना फोटो या रिपोर्ट अपलोड करें',
      'स्पष्ट रिपोर्ट और फॉलो-अप जानकारी प्राप्त करें',
    ],
    forHelpersTitle: 'स्क्रीनिंग सहायकों के लिए',
    forHelpersPoints: [
      'स्क्रीनिंग जानकारी कैप्चर और अपलोड करें',
      'फोटो की गुणवत्ता जांचें',
      'मामलों को व्यवस्थित रखें',
      'रेफरल प्रक्रियाओं में सहायता करें',
    ],
    forResearchersTitle: 'शोधकर्ताओं के लिए',
    forResearchersPoints: [
      'एआई मॉडल्स का अन्वेषण करें',
      'एआई सिस्टम का मूल्यांकन करें',
      'स्पष्टीकरण और शोध डेटा देखें',
    ],
    disclaimerTitle: 'महत्वपूर्ण सुरक्षा सूचना',
    disclaimerText:
      'रेटिनागार्ड एआई-सहायक स्क्रीनिंग सहायता प्रदान करता है और यह किसी योग्य डॉक्टर के चिकित्सकीय मूल्यांकन या अंतिम निदान का विकल्प नहीं है।',
    continueButton: 'आगे बढ़ें',
    audioSpeechText:
      'रेटिनागार्ड में आपका स्वागत है। रेटिनागार्ड क्या है? रेटिनागार्ड एक एआई-सहायक रेटिनल स्क्रीनिंग सपोर्ट प्लेटफॉर्म है जिसे लोगों को रेटिना जांच समझाने और स्क्रीनिंग टीमों को जांच जानकारी व्यवस्थित और मूल्यांकन करने में मदद के लिए डिज़ाइन किया गया है। स्क्रीनिंग क्यों ज़रूरी है? रेटिना की कुछ स्थितियां बिना किसी स्पष्ट लक्षण के बढ़ सकती हैं, और समय पर जांच उन लोगों की पहचान करने में मदद करती है जिन्हें आगे डॉक्टर से मूल्यांकन की आवश्यकता हो सकती है। रेटिनागार्ड कैसे मदद कर सकता है? मरीज़ों और परिवारों के लिए: रेटिनल स्क्रीनिंग के बारे में जानें, नजदीकी स्क्रीनिंग केंद्र खोजें, स्क्रीनिंग जानकारी समझें, फोटो या रिपोर्ट अपलोड करें, और स्पष्ट रिपोर्ट प्राप्त करें। स्क्रीनिंग सहायकों के लिए: जानकारी कैप्चर और अपलोड करें, गुणवत्ता जांचें, मामले व्यवस्थित करें, और रेफरल में मदद करें। शोधकर्ताओं के लिए: मॉडल्स का अन्वेषण करें, मूल्यांकन करें, और शोध डेटा देखें। महत्वपूर्ण सूचना: रेटिनागार्ड एआई-सहायक स्क्रीनिंग सहायता प्रदान करता है और यह पेशेवर चिकित्सकीय मूल्यांकन या अंतिम निदान का विकल्प नहीं है।',
  },

  kn: {
    title: 'ರೆಟಿನಾಗಾರ್ಡ್‌ಗೆ ಸುಸ್ವಾಗತ',
    chooseLanguageLabel: 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    readAloudLabel: 'ಧ್ವನಿಯಲ್ಲಿ ಆಲಿಸಿ',
    whatIsTitle: 'ರೆಟಿನಾಗಾರ್ಡ್ ಎಂದರೇನು?',
    whatIsDesc:
      'ರೆಟಿನಾಗಾರ್ಡ್ ಎನ್ನುವುದು ಜನರಿಗೆ ರೆಟಿನಾ ತಪಾಸಣೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಮತ್ತು ತಪಾಸಣಾ ತಂಡಗಳಿಗೆ ಮಾಹಿತಿಯನ್ನು ಸಂಘಟಿಸಲು ಮತ್ತು ಮೌಲ್ಯಮಾಪನ ಮಾಡಲು ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಎಐ-ಸಹಾಯದ ರೆಟಿನಲ್ ತಪಾಸಣಾ ಬೆಂಬಲ ವೇದಿಕೆಯಾಗಿದೆ.',
    whyMattersTitle: 'ತಪಾಸಣೆ ಏಕೆ ಮುಖ್ಯ?',
    whyMattersDesc:
      'ಕೆಲವು ರೆಟಿನಾ ಸಮಸ್ಯೆಗಳು ಯಾವುದೇ ಆರಂಭಿಕ ಲಕ್ಷಣಗಳಿಲ್ಲದೆ ಉಲ್ಬಣಿಸಬಹುದು, ಮತ್ತು ತಪಾಸಣೆಯು ಮುಂದಿನ ವೃತ್ತಿಪರ ವೈದ್ಯಕೀಯ ಮೌಲ್ಯಮಾಪನದ ಅಗತ್ಯವಿರುವ ವ್ಯಕ್ತಿಗಳನ್ನು ಗುರುತಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
    howCanHelpTitle: 'ರೆಟಿನಾಗಾರ್ಡ್ ಹೇಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ?',
    forPeopleTitle: 'ಜನರಿಗೆ',
    forPeoplePoints: [
      'ರೆಟಿನಾ ತಪಾಸಣೆ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ',
      'ತಪಾಸಣಾ ಕೇಂದ್ರಗಳನ್ನು ಹುಡುಕಿ',
      'ತಪಾಸಣೆ ಮಾಹಿತಿಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ',
      'ಲಭ್ಯವಿರುವಲ್ಲಿ ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ರೆಟಿನಾ ಚಿತ್ರ/ವರದಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      'ವರದಿಗಳು ಮತ್ತು ಮುಂದಿನ ಸಲಹೆಗಳನ್ನು ಪಡೆಯಿರಿ',
    ],
    forHelpersTitle: 'ತಪಾಸಣಾ ಸಹಾಯಕರಿಗೆ',
    forHelpersPoints: [
      'ತಪಾಸಣಾ ಮಾಹಿತಿಯನ್ನು ದಾಖಲಿಸಿ ಮತ್ತು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      'ಚಿತ್ರದ ಗುಣಮಟ್ಟವನ್ನು ಪರಿಶೀಲಿಸಿ',
      'ಪ್ರಕರಣಗಳನ್ನು ಸಂಘಟಿಸಿ',
      'ರೆಫರಲ್ ಪ್ರಕ್ರಿಯೆಗಳನ್ನು ಬೆಂಬಲಿಸಿ',
    ],
    forResearchersTitle: 'ಸಂಶೋಧಕರಿಗೆ',
    forResearchersPoints: [
      'ಎಐ ಮಾದರಿಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
      'ಎಐ ವ್ಯವಸ್ಥೆಗಳನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ',
      'ವಿವರಣೆ ಮತ್ತು ಸಂಶೋಧನಾ ಡೇಟಾವನ್ನು ಅಧ್ಯಯನ ಮಾಡಿ',
    ],
    disclaimerTitle: 'ಪ್ರಮುಖ ಸೂಚನೆ',
    disclaimerText:
      'ರೆಟಿನಾಗಾರ್ಡ್ ಎಐ-ಸಹಾಯದ ತಪಾಸಣಾ ಬೆಂಬಲವನ್ನು ನೀಡುತ್ತದೆ ಮತ್ತು ವೃತ್ತಿಪರ ವೈದ್ಯಕೀಯ ಮೌಲ್ಯಮಾಪನ ಅಥವಾ ಅಂತಿಮ ರೋಗನಿರ್ಣಯವನ್ನು ಬದಲಿಸುವುದಿಲ್ಲ.',
    continueButton: 'ಮುಂದುವರಿಯಿರಿ',
    audioSpeechText:
      'ರೆಟಿನಾಗಾರ್ಡ್‌ಗೆ ಸುಸ್ವಾಗತ. ರೆಟಿನಾಗಾರ್ಡ್ ಎಂದರೇನು? ರೆಟಿನಾಗಾರ್ಡ್ ಜನರಿಗೆ ರೆಟಿನಾ ತಪಾಸಣೆ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಮತ್ತು ತಪಾಸಣಾ ತಂಡಗಳಿಗೆ ಸಹಾಯ ಮಾಡಲು ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಎಐ ಬೆಂಬಲ ವೇದಿಕೆಯಾಗಿದೆ. ತಪಾಸಣೆ ಏಕೆ ಮುಖ್ಯ? ಕೆಲವು ರೆಟಿನಾ ಸಮಸ್ಯೆಗಳು ಯಾವುದೇ ಲಕ್ಷಣಗಳಿಲ್ಲದೆ ಉಲ್ಬಣಿಸಬಹುದು, ಮತ್ತು ತಪಾಸಣೆಯು ಮುಂದಿನ ವೈದ್ಯಕೀಯ ಮೌಲ್ಯಮಾಪನ ಅಗತ್ಯವಿರುವವರನ್ನು ಗುರುತಿಸಲು ನೆರವಾಗುತ್ತದೆ. ರೆಟಿನಾಗಾರ್ಡ್ ಹೇಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ? ಜನರಿಗೆ: ರೆಟಿನಾ ತಪಾಸಣೆ ತಿಳಿಯಿರಿ, ಕೇಂದ್ರಗಳನ್ನು ಹುಡುಕಿ, ವರದಿಗಳನ್ನು ಪಡೆಯಿರಿ. ತಪಾಸಣಾ ಸಹಾಯಕರಿಗೆ: ಚಿತ್ರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ಪ್ರಕರಣಗಳನ್ನು ಸಂಘಟಿಸಿ, ರೆಫರಲ್‌ಗೆ ನೆರವಾಗಿ. ಸಂಶೋಧಕರಿಗೆ: ಮಾದರಿಗಳು ಮತ್ತು ಡೇಟಾವನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ. ಪ್ರಮುಖ ಸೂಚನೆ: ರೆಟಿನಾಗಾರ್ಡ್ ವೃತ್ತಿಪರ ವೈದ್ಯಕೀಯ ಮೌಲ್ಯಮಾಪನ ಅಥವಾ ರೋಗನಿರ್ಣಯಕ್ಕೆ ಬದಲಿಯಾಗಿಲ್ಲ.',
  },

  ta: {
    title: 'RetinaGuard உங்களை வரவேற்கிறது',
    chooseLanguageLabel: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    readAloudLabel: 'குரலில் கேட்கவும்',
    whatIsTitle: 'RETINAGUARD என்றால் என்ன?',
    whatIsDesc:
      'RetinaGuard என்பது விழித்திரை பரிசோதனை பற்றி மக்கள் புரிந்து கொள்ளவும், பரிசோதனை குழுக்கள் தகவல்களை ஒழுங்கமைக்கவும் மதிப்பீடு செய்யவும் வடிவமைக்கப்பட்ட AI-உதவி தளமாகும்.',
    whyMattersTitle: 'பரிசோதனை ஏன் முக்கியம்?',
    whyMattersDesc:
      'சில விழித்திரை குறைபாடுகள் வெளிப்படையான அறிகுறிகள் இல்லாமலேயே அதிகரிக்கலாம், மேலும் மருத்துவ மதிப்பீடு தேவைப்படும் நபர்களை முன்கூட்டியே கண்டறிய பரிசோதனை உதவுகிறது.',
    howCanHelpTitle: 'RETINAGUARD எவ்வாறு உதவும்?',
    forPeopleTitle: 'பொதுமக்களுக்கு',
    forPeoplePoints: [
      'விழித்திரை பரிசோதனை பற்றி அறியலாம்',
      'பரிசோதனை மையங்களை கண்டறியலாம்',
      'பரிசோதனை தகவல்களை புரிந்து கொள்ளலாம்',
      'விழித்திரை படங்கள் அல்லது அறிக்கைகளை பதிவேற்றலாம்',
      'தெளிவான அறிக்கைகள் மற்றும் அடுத்த கட்ட வழிகாட்டுதலை பெறலாம்',
    ],
    forHelpersTitle: 'பரிசோதனை உதவியாளர்களுக்கு',
    forHelpersPoints: [
      'பரிசோதனை தகவல்களை பதிவு செய்யவும் பதிவேற்றவும்',
      'படத்தின் தரத்தை சரிபார்க்கவும்',
      'வழக்குகளை ஒழுங்கமைக்கவும்',
      'பரிந்துரை நடைமுறைகளுக்கு உதவவும்',
    ],
    forResearchersTitle: 'ஆராய்ச்சியாளர்களுக்கு',
    forResearchersPoints: [
      'AI மாதிரிகளை ஆராயவும்',
      'AI அமைப்புகளை மதிப்பீடு செய்யவும்',
      'ஆராய்ச்சி தரவுகளை ஆய்வு செய்யவும்',
    ],
    disclaimerTitle: 'முக்கிய பாதுகாப்பு அறிவிப்பு',
    disclaimerText:
      'RetinaGuard AI-உதவி பரிசோதனை ஆதரவை மட்டுமே வழங்குகிறது; இது மருத்துவரின் தொழில்முறை மதிப்பீட்டையோ அல்லது உறுதியான நோயறிதலையோ மாற்றாது.',
    continueButton: 'தொடரவும்',
    audioSpeechText:
      'RetinaGuard உங்களை வரவேற்கிறது. RetinaGuard என்றால் என்ன? RetinaGuard என்பது விழித்திரை பரிசோதனை பற்றி மக்கள் புரிந்து கொள்ளவும், பரிசோதனை குழுக்கள் தகவல்களை ஒழுங்கமைக்கவும் வடிவமைக்கப்பட்ட AI உதவி தளமாகும். பரிசோதனை ஏன் முக்கியம்? சில விழித்திரை குறைபாடுகள் அறிகுறிகள் இல்லாமலேயே அதிகரிக்கலாம், மற்றும் மருத்துவ மதிப்பீடு தேவைப்படும் நபர்களை முன்கூட்டியே கண்டறிய பரிசோதனை உதவுகிறது. RetinaGuard எவ்வாறு உதவும்? மக்களுக்கு: பரிசோதனை பற்றி அறிய, மையங்களை கண்டறிய, அறிக்கைகளை பெற. உதவியாளர்களுக்கு: தகவல்களை பதிவு செய்ய, தரத்தை சரிபார்க்க, பரிந்துரைகளுக்கு உதவ. ஆராய்ச்சியாளர்களுக்கு: மாதிரிகளை ஆராய மற்றும் மதிப்பீடு செய்ய. முக்கிய அறிவிப்பு: RetinaGuard தொழில்முறை மருத்துவ மதிப்பீட்டையோ அல்லது நோயறிதலையோ மாற்றாது.',
  },

  te: {
    title: 'రెటినాగార్డ్‌కు స్వాగతం',
    chooseLanguageLabel: 'భాషను ఎంచుకోండి',
    readAloudLabel: 'వాయిస్‌లో వినండి',
    whatIsTitle: 'రెటినాగార్డ్ అంటే ఏమిటి?',
    whatIsDesc:
      'రెటినాగార్డ్ అనేది ప్రజలకు రెటీనా పరీక్షల గురించి అవగాహన కల్పించడానికి మరియు పరీక్ష బృందాలకు సమాచారాన్ని క్రమబద్ధీకరించడానికి మరియు అంచనా వేయడానికి రూపొందించబడిన AI-సహాయక స్క్రీనింగ్ మద్దతు వేదిక.',
    whyMattersTitle: 'స్క్రీనింగ్ ఎందుకు ముఖ్యం?',
    whyMattersDesc:
      'కొన్ని రెటీనా సమస్యలు ఎటువంటి ముందస్తు లక్షణాలు లేకుండానే పెరగవచ్చు, సకాలంలో పరీక్ష చేయించుకోవడం ద్వారా తదుపరి వైద్య పరీక్షలు అవసరమైన వారిని గుర్తించవచ్చు.',
    howCanHelpTitle: 'రెటినాగార్డ్ ఎలా సహాయపడుతుంది?',
    forPeopleTitle: 'ప్రజల కోసం',
    forPeoplePoints: [
      'రెటీనా స్క్రీనింగ్ గురించి తెలుసుకోండి',
      'స్క్రీనింగ్ కేంద్రాలను కనుగొనండి',
      'స్క్రీనింగ్ సమాచారాన్ని అర్థం చేసుకోండి',
      'రెటీనా చిత్రం లేదా నివేదికను అప్‌లోడ్ చేయండి',
      'నివేదికలు మరియు తదుపరి సమాచారాన్ని పొందండి',
    ],
    forHelpersTitle: 'స్క్రీనింగ్ సహాయకుల కోసం',
    forHelpersPoints: [
      'స్క్రీనింగ్ సమాచారాన్ని సంగ్రహించండి మరియు అప్‌లోడ్ చేయండి',
      'చిత్ర నాణ్యతను తనిఖీ చేయండి',
      'కేసులను క్రమబద్ధీకరించండి',
      'రెఫరల్ ప్రక్రియలకు మద్దతు ఇవ్వండి',
    ],
    forResearchersTitle: 'పరిశోధకుల కోసం',
    forResearchersPoints: [
      'AI నమూనాలను అన్వేషించండి',
      'AI సిస్టమ్‌లను మూల్యాంకనం చేయండి',
      'పరిశోధన డేటాను అధ్యయనం చేయండి',
    ],
    disclaimerTitle: 'ముఖ్యమైన భద్రతా గమనిక',
    disclaimerText:
      'రెటినాగార్డ్ AI-సహాయక స్క్రీనింగ్ మద్దతును అందిస్తుంది మరియు అర్హత కలిగిన వైద్యుల సంప్రదింపులకు లేదా ఖచ్చితమైన రోగ నిర్ధారణకు ప్రత్యామ్నాయం కాదు.',
    continueButton: 'కొనసాగించండి',
    audioSpeechText:
      'రెటినాగార్డ్‌కు స్వాగతం. రెటినాగార్డ్ అంటే ఏమిటి? రెటినాగార్డ్ అనేది ప్రజలకు రెటీనా పరీక్షల గురించి అవగాహన కల్పించడానికి మరియు పరీక్ష బృందాలకు సమాచారాన్ని క్రమబద్ధీకరించడానికి రూపొందించబడిన AI-సహాయక వేదిక. స్క్రీనింగ్ ఎందుకు ముఖ్యం? కొన్ని రెటీనా సమస్యలు ఎటువంటి ముందస్తు లక్షణాలు లేకుండానే పెరగవచ్చు, పరీక్ష ద్వారా తదుపరి వైద్య పరీక్షలు అవసరమైన వారిని గుర్తించవచ్చు. రెటినాగార్డ్ ఎలా సహాయపడుతుంది? ప్రజల కోసం: పరీక్షల గురించి తెలుసుకోండి, కేంద్రాలను కనుగొనండి, నివేదికలను పొందండి. సహాయకుల కోసం: సమాచారాన్ని నమోదు చేయండి, నాణ్యతను తనిఖీ చేయండి, రెఫరల్స్‌కు మద్దతు ఇవ్వండి. పరిశోధకుల కోసం: మోడల్స్ మరియు డేటాను విశ్లేషించండి. ముఖ్యమైన గమనిక: రెటినాగార్డ్ వైద్యుల సంప్రదింపులకు లేదా రోగ నిర్ధారణకు ప్రత్యామ్నాయం కాదు.',
  },

  ml: {
    title: 'റെറ്റിനാഗാർഡിലേക്ക് സ്വാഗതം',
    chooseLanguageLabel: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    readAloudLabel: 'ശബ്ദത്തിൽ കേൾക്കുക',
    whatIsTitle: 'എന്താണ് റെറ്റിനാഗാർഡ്?',
    whatIsDesc:
      'റെറ്റിന പരിശോധനകളെക്കുറിച്ച് ജനങ്ങൾക്ക് ലളിതമായി മനസ്സിലാക്കാനും, സ്ക്രീനിംഗ് വിവരങ്ങൾ ചിട്ടപ്പെടുത്താനും വിലയിരുത്താനും സഹായിക്കുന്ന AI-അധിഷ്ഠിത പ്ലാറ്റ്‌ഫോമാണ് റെറ്റിനാഗാർഡ്.',
    whyMattersTitle: 'എന്തുകൊണ്ട് പരിശോധന പ്രധാനം?',
    whyMattersDesc:
      'വ്യക്തമായ ലക്ഷണങ്ങളൊന്നുമില്ലാതെ തന്നെ ചില റെറ്റിന രോഗങ്ങൾ വഷളായേക്കാം. കൃത്യമായ പരിശോധനയിലൂടെ വിദഗ്ദ്ധ ചികിത്സ ആവശ്യമുള്ളവരെ നേരത്തെ കണ്ടെത്താൻ സാധിക്കും.',
    howCanHelpTitle: 'റെറ്റിനാഗാർഡ് എങ്ങനെ സഹായിക്കുന്നു?',
    forPeopleTitle: 'പൊതുജനങ്ങൾക്ക്',
    forPeoplePoints: [
      'റെറ്റിന പരിശോധനയെക്കുറിച്ച് അറിയുക',
      'സ്ക്രീനിംഗ് കേന്ദ്രങ്ങൾ കണ്ടെത്തുക',
      'പരിശോധനാ വിവരങ്ങൾ മനസ്സിലാക്കുക',
      'റെറ്റിന ചിത്രങ്ങളോ റിപ്പോർട്ടുകളോ അപ്‌ലോഡ് ചെയ്യുക',
      'വ്യക്തമായ റിപ്പോർട്ടുകളും തുടർ നിർദ്ദേശങ്ങളും ലഭ്യമാക്കുക',
    ],
    forHelpersTitle: 'സ്ക്രീനിംഗ് സഹായികൾക്ക്',
    forHelpersPoints: [
      'വിവരങ്ങൾ രേഖപ്പെടുത്താനും അപ്‌ലോഡ് ചെയ്യാനും',
      'ചിത്രത്തിന്റെ ഗുണനിലവാരം ഉറപ്പാക്കാൻ',
      'കേസുകൾ ചിട്ടപ്പെടുത്താൻ',
      'റഫറൽ നടപടികൾ ഏകോപിപ്പിക്കാൻ',
    ],
    forResearchersTitle: 'ഗവേഷകർക്ക്',
    forResearchersPoints: [
      'AI മോഡലുകൾ മനസ്സിലാക്കുക',
      'AI സിസ്റ്റങ്ങൾ വിലയിരുത്തുക',
      'ഗവേഷണ വിവരങ്ങൾ വിശകലനം ചെയ്യുക',
    ],
    disclaimerTitle: 'പ്രധാന മുന്നറിയിപ്പ്',
    disclaimerText:
      'റെറ്റിനാഗാർഡ് ഒരു AI-സഹായ സ്ക്രീനിംഗ് പിന്തുണ മാത്രമാണ് നൽകുന്നത്. ഇത് ഒരു ഡോക്ടറുടെ പരിശോധനയ്ക്കോ അന്തിമ രോഗനിർണ്ണയത്തിനോ പകരമാവില്ല.',
    continueButton: 'തുടരുക',
    audioSpeechText:
      'റെറ്റിനാഗാർഡിലേക്ക് സ്വാഗതം. എന്താണ് റെറ്റിനാഗാർഡ്? റെറ്റിന പരിശോധനകളെക്കുറിച്ച് ജനങ്ങൾക്ക് മനസ്സിലാക്കാനും വിവരങ്ങൾ ക്രമീകരിക്കാനും സഹായിക്കുന്ന AI പ്ലാറ്റ്‌ഫോമാണ് റെറ്റിനാഗാർഡ്. പരിശോധന എന്ത് കൊണ്ട് പ്രധാനം? ലക്ഷണങ്ങളൊന്നുമില്ലാതെ തന്നെ ചില റെറ്റിന രോഗങ്ങൾ വഷളായേക്കാം, പരിശോധനയിലൂടെ ഇവരെ നേരത്തെ കണ്ടെത്താം. എങ്ങനെ സഹായിക്കുന്നു? പൊതുജനങ്ങൾക്ക്: വിവരങ്ങൾ അറിയാൻ, കേന്ദ്രങ്ങൾ കണ്ടെത്താൻ, റിപ്പോർട്ടുകൾ ലഭിക്കാൻ. സഹായികൾക്ക്: വിവരങ്ങൾ രേഖപ്പെടുത്താൻ, ഗുണനിലവാരം ഉറപ്പാക്കാൻ, റഫറൽ നടത്താൻ. ഗവേഷകർക്ക്: മോഡലുകൾ വിശകലനം ചെയ്യാൻ. പ്രധാന മുന്നറിയിപ്പ്: റെറ്റിനാഗാർഡ് ഡോക്ടറുടെ പരിശോധനയ്ക്കോ രോഗനിർണ്ണയത്തിനോ പകരമാവില്ല.',
  },
};
