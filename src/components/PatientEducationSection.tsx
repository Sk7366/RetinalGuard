import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Heart,
  HelpCircle,
  Pause,
  Play,
  ShieldAlert,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface PatientEducationSectionProps {
  initialSimpleMode?: boolean;
}

interface EducationTopic {
  id: string;
  question: string;
  simpleAnswer: string;
  clinicalAnswer: string;
  keyPoints: string[];
}

export const PatientEducationSection: React.FC<PatientEducationSectionProps> = ({
  initialSimpleMode = true,
}) => {
  const [simpleLanguage, setSimpleLanguage] = useState(initialSimpleMode);
  const [expandedTopic, setExpandedTopic] = useState<string>('what-is-dr');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [currentAudioTopic, setCurrentAudioTopic] = useState<string | null>(null);

  const topics: EducationTopic[] = [
    {
      id: 'what-is-dr',
      question: 'What is diabetic retinopathy?',
      simpleAnswer:
        'Diabetic retinopathy is an eye condition that can happen to people with diabetes. High blood sugar over time can weaken the tiny blood vessels at the back of your eye (the retina). In the beginning, you might not notice any changes in your sight, which is why regular screening is so important.',
      clinicalAnswer:
        'Diabetic Retinopathy (DR) is a progressive microvascular complication of diabetes mellitus characterized by pericyte loss, capillary basement membrane thickening, microaneurysm formation, vascular leakage, and retinal ischemia. Left unmonitored, it can progress from non-proliferative stages (NPDR) to proliferative diabetic retinopathy (PDR) and diabetic macular edema (DME).',
      keyPoints: [
        'Affects the blood vessels inside the light-sensitive retina',
        'Often has zero symptoms in early stages',
        'Can be effectively managed if caught before advanced damage occurs',
      ],
    },
    {
      id: 'why-screening',
      question: 'Why does retinal screening matter so much?',
      simpleAnswer:
        'Because by the time you actually notice blurred vision, eye damage may have already progressed. A quick retinal photo looks deep inside your eye and catches small changes years before they harm your daily vision.',
      clinicalAnswer:
        'Visual acuity is a lagging indicator of diabetic microvascular damage. Macular involvement or peripheral neovascularization can develop while central vision remains temporarily preserved (20/20). Annual non-mydriatic fundus screening reduces the risk of severe vision impairment by over 90% through early triage and laser photocoagulation or anti-VEGF therapy.',
      keyPoints: [
        'Over 90% of severe vision loss is preventable with timely detection',
        'Takes less than 5 minutes at a community clinic or camp',
        'Provides early warning before any permanent sight loss happens',
      ],
    },
    {
      id: 'who-should-screen',
      question: 'Who should get their eyes screened?',
      simpleAnswer:
        'Anyone diagnosed with Type 1 or Type 2 diabetes should have their retina photographed at least once every year, or sooner if recommended by their eye specialist.',
      clinicalAnswer:
        'All individuals with Type 2 diabetes should undergo screening at the time of initial diagnosis and at least annually thereafter. Individuals with Type 1 diabetes should initiate screening within 5 years of diagnosis. Patients with elevated HbA1c (>8%), hypertension, or renal disease warrant closer monitoring.',
      keyPoints: [
        'Type 2 Diabetes: Screen immediately upon diagnosis and annually',
        'Type 1 Diabetes: Screen within 5 years of diagnosis',
        'Anyone with high HbA1c or high blood pressure needs strict monitoring',
      ],
    },
    {
      id: 'what-happens',
      question: 'What happens during retinal screening? Does it hurt?',
      simpleAnswer:
        'No, it does not hurt at all! You simply sit comfortably in front of a specialized digital camera. The camera takes a quick picture of the back of your eye using a gentle flash. Modern cameras often do not even need eye-dilating drops.',
      clinicalAnswer:
        'Digital fundus photography utilizes non-mydriatic optical sensors to capture a 45° to 50° field centered on the macula and optic disc. The procedure is non-contact, painless, and completed in under 2 minutes per eye without requiring pharmacological pupil dilation in over 85% of adult eyes.',
      keyPoints: [
        '100% painless and non-invasive',
        'No needles or direct eye contact',
        'Usually no blurry eye drops required for community screening',
      ],
    },
    {
      id: 'if-flagged',
      question: 'What happens if the screening flags a concern?',
      simpleAnswer:
        'Being flagged does NOT mean you are going blind. It simply means the camera noticed signs that need a careful look by an eye doctor (ophthalmologist). RetinaGuard helps make sure people who need specialist care are prioritized quickly.',
      clinicalAnswer:
        'A positive screening result (Grade 2, 3, 4, or DME detection) initiates structured triage. Patients are referred for a comprehensive dilated clinical exam and slit-lamp biomicroscopy by an ophthalmologist, who will formulate an individualized management plan.',
      keyPoints: [
        'A flag is decision support to help you see a specialist sooner',
        'Most early changes can be managed with better glucose control and routine checks',
        'Specialist confirmation is always required',
      ],
    },
    {
      id: 'why-followup',
      question: 'Why is closing the loop and attending follow-up essential?',
      simpleAnswer:
        'Screening only protects your sight if you follow up with the recommended doctor visit. That is why RetinaGuard tracks the journey from screening to appointment confirmation, ensuring no patient gets lost in the system.',
      clinicalAnswer:
        'Screening without referral adherence generates no clinical benefit. High attrition rates between initial community triage and tertiary ophthalmology clinics represent a primary barrier in public health programs. Closed-loop tracking ensures verified appointment completion and continuity of care.',
      keyPoints: [
        'Attending your referral appointment preserves your sight',
        'Community health workers can assist with transport and scheduling',
        'Regular tracking ensures you receive ongoing protective care',
      ],
    },
  ];

  // Web Speech Synthesis handler
  const handleListen = (topic: EducationTopic) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech audio is not supported in this browser.');
      return;
    }

    if (isPlayingAudio && currentAudioTopic === topic.id) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setCurrentAudioTopic(null);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = `${topic.question}. ${
      simpleLanguage ? topic.simpleAnswer : topic.clinicalAnswer
    }`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setCurrentAudioTopic(null);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setCurrentAudioTopic(null);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
    setCurrentAudioTopic(topic.id);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div id="patient-education" className="py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF7ED] border border-[#FED7AA] text-[#C2410C] text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Community Patient Education</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
            Understanding Retinal Screening
          </h2>
          <p className="text-sm text-[#6E5C5F] mt-2 leading-relaxed">
            Essential knowledge for diabetic patients, family members, and community workers. Clear, non-technical answers to how screening protects vision.
          </p>
        </div>

        {/* Simple vs Clinical Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#EFE4DC] shadow-xs shrink-0 self-start">
          <button
            onClick={() => setSimpleLanguage(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              simpleLanguage
                ? 'bg-gradient-to-r from-[#EA580C] to-[#DB2777] text-white shadow-xs'
                : 'text-[#6E5C5F] hover:text-[#2E2628]'
            }`}
          >
            Read in Simple Language
          </button>
          <button
            onClick={() => setSimpleLanguage(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !simpleLanguage
                ? 'bg-gradient-to-r from-[#EA580C] to-[#DB2777] text-white shadow-xs'
                : 'text-[#6E5C5F] hover:text-[#2E2628]'
            }`}
          >
            Clinical Detail
          </button>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {topics.map((topic) => {
          const isOpen = expandedTopic === topic.id;
          const isAudioCurrent = isPlayingAudio && currentAudioTopic === topic.id;

          return (
            <div
              key={topic.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                isOpen ? 'border-[#EA580C] shadow-xs' : 'border-[#EFE4DC] hover:border-[#FED7AA]'
              }`}
            >
              {/* Question Header */}
              <div
                className="p-5 flex items-center justify-between cursor-pointer select-none"
                onClick={() => setExpandedTopic(isOpen ? '' : topic.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                      isOpen
                        ? 'bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA]'
                        : 'bg-[#FAF8F6] text-[#6E5C5F]'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-[#2E2628]">
                    {topic.question}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleListen(topic);
                    }}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isAudioCurrent
                        ? 'bg-[#EA580C] text-white'
                        : 'border border-[#EFE4DC] text-[#6E5C5F] hover:text-[#EA580C] hover:bg-[#FFF7ED]'
                    }`}
                    title={isAudioCurrent ? 'Stop speaking' : 'Listen to this explanation'}
                    aria-label="Listen audio"
                  >
                    {isAudioCurrent ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Playing</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Listen</span>
                      </>
                    )}
                  </button>

                  <div className="p-1 rounded-md text-[#6E5C5F]">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Answer Content */}
              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-[#FAF8F6] animate-in fade-in duration-150">
                  <p className="text-xs sm:text-sm text-[#2E2628] leading-relaxed">
                    {simpleLanguage ? topic.simpleAnswer : topic.clinicalAnswer}
                  </p>

                  {/* Key Takeaways */}
                  <div className="mt-4 p-3.5 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#C2410C] block mb-2">
                      Key Takeaways
                    </span>
                    <ul className="space-y-1.5">
                      {topic.keyPoints.map((pt, i) => (
                        <li
                          key={i}
                          className="text-xs text-[#6E5C5F] flex items-start gap-2 leading-relaxed"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#EA580C] shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Medical disclaimer note */}
      <div className="mt-6 p-4 rounded-xl bg-[#FFF7ED]/50 border border-[#FED7AA]/60 text-xs text-[#6E5C5F] leading-relaxed flex items-start gap-2.5">
        <Heart className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
        <div>
          <strong>Educational Notice:</strong> All information provided is general health education reviewed against international ophthalmology guidelines. It does not replace individualized clinical counseling by your personal physician or eye specialist.
        </div>
      </div>
    </div>
  );
};
