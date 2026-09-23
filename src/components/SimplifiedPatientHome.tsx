import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  BookOpen,
  Volume2,
  VolumeX,
  Calendar,
  CheckCircle2,
  Clock,
  Phone,
  Navigation,
  Heart,
  Eye,
  ArrowRight,
  Search,
  Check,
  Sun,
  Building,
  Tent,
  Play,
  Pause,
  RotateCcw,
  User,
  Camera,
  Cpu,
  ShieldCheck,
  Stethoscope,
  BellRing,
  HelpCircle
} from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";
import { voiceService } from "../services/voiceService";
import { MOCK_SCREENING_CENTERS } from "../mock/mockData";
import { ScreeningCenter } from "../types";
import { generateFundusSvg } from "../data/sampleCases";

interface SimplifiedPatientHomeProps {
  onGoToSampleCheck?: () => void;
  onSwitchToProviderPortal?: () => void;
  textSizeClass?: string;
  isHighContrast?: boolean;
  onToggleHighContrast?: () => void;
  onSetTextSize?: (size: "standard" | "large" | "xl") => void;
  currentTextSize?: "standard" | "large" | "xl";
}

interface JourneyStep {
  id: string;
  title: string;
  tagline: string;
  description: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  illustrationType: "person" | "fundus" | "ai" | "doctor" | "report" | "followup";
}

export const SimplifiedPatientHome: React.FC<SimplifiedPatientHomeProps> = ({
  onGoToSampleCheck,
  onSwitchToProviderPortal,
  textSizeClass = "text-base",
  isHighContrast = false,
  onToggleHighContrast,
  onSetTextSize,
  currentTextSize = "standard",
}) => {
  const { t, language, setLanguage, supportedLanguages } = useTranslation();

  // Search & Clinic filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [userLocationDetected, setUserLocationDetected] = useState(false);

  // Booking Modal State
  const [bookingCenter, setBookingCenter] = useState<ScreeningCenter | null>(null);
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("Tomorrow Morning (9:00 AM - 12:00 PM)");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Audio voice state
  const [isReadingHero, setIsReadingHero] = useState(false);

  // Animated Screening Journey state
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPlayingJourney, setIsPlayingJourney] = useState(true);
  const journeyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const journeySteps: JourneyStep[] = [
    {
      id: "step-person",
      title: "1. Person",
      tagline: "Comfortable Check-in",
      description: "You arrive at your local community center, clinic, or mobile eye camp. No needles, zero pain, and no stressful prep.",
      detail: "A friendly health worker greets you, records your basic diabetes history, and seats you in front of the gentle camera.",
      icon: User,
      accentColor: "#F05A28",
      illustrationType: "person",
    },
    {
      id: "step-image",
      title: "2. Retinal Image",
      tagline: "3-Minute Digital Scan",
      description: "A non-mydriatic fundus camera softly captures high-resolution digital photographs of your retina.",
      detail: "Nothing touches your eye. For most patients, no blurry dilating drops are required, allowing an immediate return to your day.",
      icon: Camera,
      accentColor: "#D94A78",
      illustrationType: "fundus",
    },
    {
      id: "step-analysis",
      title: "3. AI-Assisted Analysis",
      tagline: "Intelligent Triage",
      description: "Validated algorithms inspect microvascular structures for microscopic microaneurysms and fluid indicators.",
      detail: "Identifies early diabetic retinal changes years before symptoms appear, with continuous reliability and safety checks.",
      icon: Cpu,
      accentColor: "#F05A28",
      illustrationType: "ai",
    },
    {
      id: "step-doctor",
      title: "4. Professional Review",
      tagline: "Doctor Verification",
      description: "A qualified optometrist or ophthalmologist reviews the image findings to confirm clinical accuracy.",
      detail: "Ensures human clinical oversight and dual-modality safety on every case before medical recommendations are finalized.",
      icon: Stethoscope,
      accentColor: "#D94A78",
      illustrationType: "doctor",
    },
    {
      id: "step-next",
      title: "5. Clear Next Step",
      tagline: "Plain-Language Plan",
      description: "You receive an easy-to-read personal report with a clear plan tailored to your retinal health.",
      detail: "Either a reassuring all-clear for next year's annual check, or a fast-track appointment with a specialist doctor.",
      icon: ShieldCheck,
      accentColor: "#F05A28",
      illustrationType: "report",
    },
    {
      id: "step-followup",
      title: "6. Follow-up",
      tagline: "Continuous Care",
      description: "We help coordinate your specialist visit or set automated reminders for your next annual check.",
      detail: "Care navigators support you with SMS reminders, transportation guidance, and longitudinal health tracking.",
      icon: BellRing,
      accentColor: "#D94A78",
      illustrationType: "followup",
    },
  ];

  // Auto-play the screening journey
  useEffect(() => {
    if (isPlayingJourney) {
      journeyTimerRef.current = setInterval(() => {
        setActiveStepIndex((prev) => (prev + 1) % journeySteps.length);
      }, 4200);
    } else if (journeyTimerRef.current) {
      clearInterval(journeyTimerRef.current);
    }
    return () => {
      if (journeyTimerRef.current) clearInterval(journeyTimerRef.current);
    };
  }, [isPlayingJourney, journeySteps.length]);

  const activeStep = journeySteps[activeStepIndex];

  // Filter centers
  const cities = ["All", "Bengaluru", "Mumbai", "New Delhi", "Chennai", "Hyderabad"];

  const filteredCenters = MOCK_SCREENING_CENTERS.filter((center) => {
    const centerType = center.type || (center.isCampActive ? 'Camp' : center.name.includes('Hospital') ? 'Eye Hospital' : 'Primary Clinic');
    const matchesCity = selectedCity === "All" || center.city === selectedCity;
    const matchesType =
      selectedType === "All" ||
      (selectedType === "Camp" && (center.isCampActive || centerType === "Camp")) ||
      (selectedType === "Clinic" && (centerType === "Primary Clinic" || centerType === "Community Center")) ||
      (selectedType === "Hospital" && centerType === "Eye Hospital");

    const matchesQuery =
      searchQuery === "" ||
      center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.pinCode.includes(searchQuery) ||
      center.address.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCity && matchesType && matchesQuery;
  });

  const handleUseLocation = () => {
    setUserLocationDetected(true);
    setSelectedCity("Bengaluru");
  };

  const handleSpeak = (text: string, title: string, sectionId: string) => {
    const currentState = voiceService.getState();
    if (currentState.isPlaying && currentState.speakingSectionId === sectionId) {
      voiceService.stop();
      if (sectionId === "hero") setIsReadingHero(false);
    } else {
      voiceService.speak({
        text,
        title,
        lang: language,
        sectionId,
      });
      if (sectionId === "hero") setIsReadingHero(true);
    }
  };

  const scrollToFindScreening = () => {
    const el = document.getElementById("find-screening-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToHowScreeningWorks = () => {
    const el = document.getElementById("how-screening-works-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const currentLangObj = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  return (
    <div className={`space-y-12 pb-24 ${textSizeClass} text-[#2B2024]`}>
      
      {/* =========================================================================
          1. REFINED ACCESSIBILITY & MULTILINGUAL UTILITY BAR
          Clean warm ivory surface with subtle borders & accessible toggles
          ========================================================================= */}
      <section
        aria-label="Language and accessibility settings"
        className="rounded-2xl p-3 sm:p-3.5 border border-[#EFE4DC] bg-white shadow-xs flex flex-wrap items-center justify-between gap-3"
      >
        {/* Language selector chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6F6267] mr-1 hidden sm:inline">
            {t("languageLabel", "Language:")}
          </span>
          {supportedLanguages.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                aria-pressed={isSelected}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 min-h-[38px] flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#2B2024] text-white shadow-xs"
                    : "bg-[#FFFDF9] hover:bg-[#FFE5D8]/30 text-[#6F6267] hover:text-[#2B2024] border border-[#EFE4DC]"
                }`}
              >
                <span>{lang.nativeLabel}</span>
                {isSelected && <Check className="w-3 h-3 ml-0.5 text-stone-300" />}
              </button>
            );
          })}
        </div>

        {/* Font size & High Contrast toggles */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* Font size selector */}
          <div className="flex items-center bg-[#FFFDF9] p-0.5 rounded-xl border border-[#EFE4DC]">
            <button
              onClick={() => onSetTextSize && onSetTextSize("standard")}
              title={t("standardText", "Standard text")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentTextSize === "standard" ? "bg-white text-[#2B2024] shadow-xs" : "text-[#6F6267] hover:text-[#2B2024]"
              }`}
            >
              A
            </button>
            <button
              onClick={() => onSetTextSize && onSetTextSize("large")}
              title={t("largeText", "Large text")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentTextSize === "large" ? "bg-white text-[#2B2024] shadow-xs" : "text-[#6F6267] hover:text-[#2B2024]"
              }`}
            >
              A+
            </button>
            <button
              onClick={() => onSetTextSize && onSetTextSize("xl")}
              title={t("xlText", "Extra large text")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentTextSize === "xl" ? "bg-white text-[#2B2024] shadow-xs" : "text-[#6F6267] hover:text-[#2B2024]"
              }`}
            >
              A++
            </button>
          </div>

          {/* High Contrast Toggle */}
          <button
            onClick={onToggleHighContrast}
            aria-pressed={isHighContrast}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 min-h-[38px] transition-colors border ${
              isHighContrast
                ? "bg-[#2B2024] text-white border-[#2B2024]"
                : "bg-white text-[#2B2024] border-[#EFE4DC] hover:bg-[#FFFDF9]"
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-[#6F6267]" />
            <span>{t("highContrast", "High Contrast")}</span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          2. HERO SECTION: "Your eyes can change before you notice."
          Premium Healthcare Technology aesthetic with warm ivory backdrop,
          deep charcoal/plum typography (#2B2024), primary orange action (#F05A28),
          raspberry-pink secondary accents (#D94A78), and visual animated screening journey.
          ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-[#EFE4DC] shadow-xs p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Editorial Headline, Subtitle, Actions */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Subtle Reassurance Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#FFE5D8] text-[#D84818] border border-[#FED7AA]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F05A28]" />
                <span>Painless • 3-Minute Digital Scan</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#FBE4EC] text-[#BF3663] border border-[#FBCFE8]">
                <Heart className="w-3.5 h-3.5 text-[#D94A78]" />
                <span>Community Clinics & Free Camps</span>
              </span>
            </div>

            {/* Required Primary Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-[#2B2024] tracking-tight leading-[1.16]">
              Your eyes can change before you notice.
            </h1>

            {/* Required Supporting Text */}
            <p className="text-base sm:text-lg text-[#6F6267] leading-relaxed max-w-2xl font-normal">
              Learn about retinal screening, find screening services, and stay connected to your screening journey.
            </p>

            {/* Primary & Secondary CTAs + Read Aloud */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {/* Primary CTA: [ Find a Screening ] (Primary Orange: #F05A28) */}
              <button
                id="hero-find-screening-primary-btn"
                onClick={scrollToFindScreening}
                className="px-6 py-3.5 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white font-semibold text-sm sm:text-base shadow-xs transition-colors flex items-center justify-center gap-2.5 min-h-[48px]"
              >
                <MapPin className="w-4 h-4 text-white" />
                <span>Find a Screening</span>
                <ArrowRight className="w-4 h-4 text-white/90" />
              </button>

              {/* Secondary CTA: [ How Screening Works ] (Secondary Accent: #D94A78) */}
              <button
                id="hero-how-screening-works-btn"
                onClick={scrollToHowScreeningWorks}
                className="px-5 py-3.5 rounded-xl bg-[#FBE4EC] hover:bg-[#F8D7E3] text-[#D94A78] border border-[#FBCFE8] hover:border-[#D94A78] font-semibold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 min-h-[48px]"
              >
                <BookOpen className="w-4 h-4 text-[#D94A78]" />
                <span>How Screening Works</span>
              </button>

              {/* Read Aloud Button: 🔊 Read Aloud */}
              <button
                id="hero-read-aloud-btn"
                onClick={() =>
                  handleSpeak(
                    "Your eyes can change before you notice. Learn about retinal screening, find screening services, and stay connected to your screening journey.",
                    "Your eyes can change before you notice",
                    "hero"
                  )
                }
                aria-label="Read hero instructions aloud"
                className={`px-4 py-3.5 rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 min-h-[48px] border ${
                  isReadingHero
                    ? "bg-[#FFE5D8] text-[#D84818] border-[#FED7AA]"
                    : "bg-[#FFFDF9] hover:bg-[#FFE5D8]/30 text-[#2B2024] border-[#EFE4DC]"
                }`}
              >
                {isReadingHero ? (
                  <>
                    <VolumeX className="w-4 h-4 text-[#F05A28]" />
                    <span>Pause Audio</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-[#F05A28]" />
                    <span>🔊 Read Aloud</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Reassurance Row */}
            <div className="pt-4 border-t border-[#EFE4DC] flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#6F6267]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#087F6A] shrink-0" />
                <span>No painful eye drops needed for most checks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#087F6A] shrink-0" />
                <span>Results reviewed by certified eye professionals</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#087F6A] shrink-0" />
                <span>90%+ of severe diabetic sight loss is preventable</span>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Animated Screening Journey Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#EFE4DC] p-5 sm:p-6 space-y-4">
              
              {/* Card Header & Auto-play controller */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#EFE4DC]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D94A78]">
                    Patient Pathway
                  </span>
                  <h3 className="text-base font-serif font-semibold text-[#2B2024]">
                    Your Screening Journey
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsPlayingJourney(!isPlayingJourney)}
                    title={isPlayingJourney ? "Pause journey preview" : "Play journey preview"}
                    className="p-1.5 rounded-lg border border-[#EFE4DC] bg-white hover:bg-[#FFFDF9] text-[#6F6267] hover:text-[#2B2024] transition-colors"
                  >
                    {isPlayingJourney ? (
                      <Pause className="w-3.5 h-3.5 text-[#F05A28]" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-[#F05A28]" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveStepIndex(0)}
                    title="Restart journey from Step 1"
                    className="p-1.5 rounded-lg border border-[#EFE4DC] bg-white hover:bg-[#FFFDF9] text-[#6F6267] hover:text-[#2B2024] transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 6-Step Visual Timeline Selector */}
              <div className="grid grid-cols-6 gap-1 bg-white p-1 rounded-xl border border-[#EFE4DC]">
                {journeySteps.map((step, idx) => {
                  const isActive = idx === activeStepIndex;
                  const Icon = step.icon;
                  return (
                    <button
                      key={step.id}
                      onClick={() => {
                        setActiveStepIndex(idx);
                        setIsPlayingJourney(false);
                      }}
                      title={step.title}
                      className={`py-2 px-1 rounded-lg flex flex-col items-center justify-center transition-all ${
                        isActive
                          ? "bg-[#2B2024] text-white shadow-xs"
                          : "text-[#6F6267] hover:bg-[#FFFDF9] hover:text-[#2B2024]"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#FFE5D8]" : ""}`} />
                      <span className="text-[10px] font-bold mt-1 tracking-tight">
                        0{idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Step Visual Showcase */}
              <div className="bg-white rounded-xl border border-[#EFE4DC] p-4 space-y-3 relative overflow-hidden transition-all duration-300">
                
                {/* Active Step Badge & Audio */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-md"
                    style={{
                      backgroundColor: `${activeStep.accentColor}15`,
                      color: activeStep.accentColor,
                    }}
                  >
                    {activeStep.title} — {activeStep.tagline}
                  </span>

                  <button
                    onClick={() =>
                      handleSpeak(
                        `${activeStep.title}. ${activeStep.description}. ${activeStep.detail}`,
                        activeStep.title,
                        `journey-${activeStep.id}`
                      )
                    }
                    title="Listen to this step"
                    className="p-1 rounded-md text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFFDF9] transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Step Visual Preview */}
                <div className="rounded-xl border border-[#EFE4DC] bg-[#FFFDF9] p-3 flex items-center justify-center min-h-[140px] relative overflow-hidden">
                  
                  {activeStep.illustrationType === "person" && (
                    <div className="text-center space-y-2 py-2">
                      <div className="w-12 h-12 rounded-full bg-[#FFE5D8] border border-[#FED7AA] text-[#F05A28] flex items-center justify-center mx-auto shadow-xs">
                        <User className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-[#2B2024]">
                        Walk-in Welcome • No Doctor Referral Required
                      </p>
                      <p className="text-[11px] text-[#6F6267] max-w-xs mx-auto">
                        Community camps and partner clinics offer walk-in slots with zero preparation stress.
                      </p>
                    </div>
                  )}

                  {activeStep.illustrationType === "fundus" && (
                    <div className="flex flex-col items-center justify-center py-1">
                      <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-[#EFE4DC] shadow-xs">
                        <img
                          src={generateFundusSvg(0, "normal")}
                          alt="Retinal photograph demo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="mt-2 text-[10px] font-bold text-[#6F6267] bg-white border border-[#EFE4DC] px-2 py-0.5 rounded-md">
                        Illustrative Demo
                      </span>
                    </div>
                  )}

                  {activeStep.illustrationType === "ai" && (
                    <div className="flex flex-col items-center justify-center py-1">
                      <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-[#D94A78]/30 shadow-xs">
                        <img
                          src={generateFundusSvg(1, "normal")}
                          alt="AI-assisted microvascular feature analysis"
                          className="w-full h-full object-cover"
                        />
                        {/* Subtle focal indicator */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full border border-dashed border-[#F05A28] bg-[#F05A28]/10 animate-pulse" />
                        </div>
                      </div>
                      <span className="mt-2 text-[10px] font-bold text-[#6F6267] bg-white border border-[#EFE4DC] px-2 py-0.5 rounded-md">
                        Illustrative Demo
                      </span>
                    </div>
                  )}

                  {activeStep.illustrationType === "doctor" && (
                    <div className="text-center space-y-2 py-2">
                      <div className="w-12 h-12 rounded-full bg-[#FBE4EC] border border-[#FBCFE8] text-[#D94A78] flex items-center justify-center mx-auto shadow-xs">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div className="inline-flex items-center gap-1 text-xs font-bold text-[#087F6A] bg-[#E6F5F2] border border-[#CCEBE5] px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A]" />
                        <span>Verified by Ophthalmologist</span>
                      </div>
                      <p className="text-[11px] text-[#6F6267] max-w-xs mx-auto">
                        Every scan is calibrated and confirmed by trained human eye care specialists.
                      </p>
                    </div>
                  )}

                  {activeStep.illustrationType === "report" && (
                    <div className="text-center space-y-2 py-2">
                      <div className="w-12 h-12 rounded-full bg-[#FFE5D8] border border-[#FED7AA] text-[#F05A28] flex items-center justify-center mx-auto shadow-xs">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-[#2B2024]">
                        Clear, Actionable Next Steps
                      </p>
                      <p className="text-[11px] text-[#6F6267] max-w-xs mx-auto">
                        Simple language explanation: Routine 12-month recall or priority doctor review.
                      </p>
                    </div>
                  )}

                  {activeStep.illustrationType === "followup" && (
                    <div className="text-center space-y-2 py-2">
                      <div className="w-12 h-12 rounded-full bg-[#FBE4EC] border border-[#FBCFE8] text-[#D94A78] flex items-center justify-center mx-auto shadow-xs">
                        <BellRing className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-[#2B2024]">
                        Annual Recall & Care Reminders
                      </p>
                      <p className="text-[11px] text-[#6F6267] max-w-xs mx-auto">
                        SMS & WhatsApp reminders help keep your vision protected year after year.
                      </p>
                    </div>
                  )}

                </div>

                {/* Step Description & Detail */}
                <div className="space-y-1">
                  <p className="text-xs text-[#2B2024] font-medium leading-relaxed">
                    {activeStep.description}
                  </p>
                  <p className="text-[11px] text-[#6F6267] leading-relaxed">
                    {activeStep.detail}
                  </p>
                </div>

                {/* Step Navigation Controls */}
                <div className="pt-2 flex items-center justify-between border-t border-[#EFE4DC]">
                  <button
                    onClick={() => {
                      setActiveStepIndex((prev) => (prev > 0 ? prev - 1 : journeySteps.length - 1));
                      setIsPlayingJourney(false);
                    }}
                    className="text-xs font-semibold text-[#6F6267] hover:text-[#2B2024] py-1 px-2 rounded-lg hover:bg-[#FFFDF9] transition-colors"
                  >
                    ← Previous
                  </button>

                  <span className="text-[11px] font-bold text-[#6F6267]">
                    Step {activeStepIndex + 1} of {journeySteps.length}
                  </span>

                  <button
                    onClick={() => {
                      setActiveStepIndex((prev) => (prev + 1) % journeySteps.length);
                      setIsPlayingJourney(false);
                    }}
                    className="text-xs font-semibold text-[#F05A28] hover:text-[#D84818] py-1 px-2 rounded-lg hover:bg-[#FFE5D8]/40 transition-colors"
                  >
                    Next Step →
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          3. THE 4 CORE ANCHORS: WHAT IT IS • WHY IT MATTERS • WHAT TO DO • WHAT HAPPENS NEXT
          Clean ivory/white cards with dark typography (#2B2024)
          ========================================================================= */}
      <section aria-label="Essential screening information" className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D94A78]">
            Clear Understanding
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#2B2024] tracking-tight">
            Everything you need to know
          </h2>
          <p className="text-xs sm:text-sm text-[#6F6267]">
            Transparent, doctor-grounded guidance for every patient and family member.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. WHAT IT IS */}
          <div className="bg-white rounded-2xl border border-[#EFE4DC] p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D84818] bg-[#FFE5D8] px-2 py-0.5 rounded-md border border-[#FED7AA]">
                  What It Is
                </span>
                <Eye className="w-4 h-4 text-[#F05A28]" />
              </div>
              <h3 className="text-base font-serif font-semibold text-[#2B2024]">
                Digital Retinal Check
              </h3>
              <p className="text-xs text-[#6F6267] leading-relaxed">
                A non-contact eye photograph that looks at the delicate microscopic blood vessels at the back of your eye (the retina).
              </p>
            </div>
            <div className="pt-2 border-t border-[#EFE4DC] text-[11px] text-[#087F6A] flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] shrink-0" />
              <span>Takes under 3 minutes</span>
            </div>
          </div>

          {/* 2. WHY IT MATTERS */}
          <div className="bg-white rounded-2xl border border-[#EFE4DC] p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#BF3663] bg-[#FBE4EC] px-2 py-0.5 rounded-md border border-[#FBCFE8]">
                  Why It Matters
                </span>
                <Heart className="w-4 h-4 text-[#D94A78]" />
              </div>
              <h3 className="text-base font-serif font-semibold text-[#2B2024]">
                Changes Happen Silently
              </h3>
              <p className="text-xs text-[#6F6267] leading-relaxed">
                Diabetic retinopathy causes zero pain and zero blurriness in its earliest stages. Annual checks catch issues years before sight is lost.
              </p>
            </div>
            <div className="pt-2 border-t border-[#EFE4DC] text-[11px] text-[#087F6A] flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] shrink-0" />
              <span>90%+ preventable sight loss</span>
            </div>
          </div>

          {/* 3. WHAT THE USER SHOULD DO */}
          <div className="bg-white rounded-2xl border border-[#EFE4DC] p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D84818] bg-[#FFE5D8] px-2 py-0.5 rounded-md border border-[#FED7AA]">
                  What You Should Do
                </span>
                <Calendar className="w-4 h-4 text-[#F05A28]" />
              </div>
              <h3 className="text-base font-serif font-semibold text-[#2B2024]">
                Get Screened Yearly
              </h3>
              <p className="text-xs text-[#6F6267] leading-relaxed">
                Select a nearby community health clinic, free camp, or eye hospital below. Walk in or reserve a free preferred slot in seconds.
              </p>
            </div>
            <div className="pt-2 border-t border-[#EFE4DC]">
              <button
                onClick={scrollToFindScreening}
                className="text-[11px] font-bold text-[#F05A28] hover:text-[#D84818] flex items-center gap-1"
              >
                <span>Find screening locations</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 4. WHAT HAPPENS NEXT */}
          <div className="bg-white rounded-2xl border border-[#EFE4DC] p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#BF3663] bg-[#FBE4EC] px-2 py-0.5 rounded-md border border-[#FBCFE8]">
                  What Happens Next
                </span>
                <ShieldCheck className="w-4 h-4 text-[#D94A78]" />
              </div>
              <h3 className="text-base font-serif font-semibold text-[#2B2024]">
                Clear Guided Care
              </h3>
              <p className="text-xs text-[#6F6267] leading-relaxed">
                You receive a doctor-verified summary. If any changes are noticed, our team connects you directly to specialist care without delay.
              </p>
            </div>
            <div className="pt-2 border-t border-[#EFE4DC] text-[11px] text-[#087F6A] flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] shrink-0" />
              <span>Full follow-up support</span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. ELEGANT "HOW SCREENING WORKS" SECTION (5 CRISP STEPS)
          ========================================================================= */}
      <section
        id="how-screening-works-section"
        aria-labelledby="how-it-works-heading"
        className="space-y-6 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FFE5D8] border border-[#FED7AA] text-[#D84818] text-xs font-semibold mb-2">
              <BookOpen className="w-3 h-3 text-[#F05A28]" />
              <span>Procedure Guide</span>
            </div>
            <h2 id="how-it-works-heading" className="text-2xl sm:text-3xl font-serif font-semibold text-[#2B2024] tracking-tight">
              How Screening Works
            </h2>
            <p className="text-xs sm:text-sm text-[#6F6267] mt-1 max-w-2xl">
              From arrival to verified results, here is exactly what happens during your 3-minute eye screening.
            </p>
          </div>

          <button
            onClick={() =>
              handleSpeak(
                "How Screening Works in five steps. Step one: Walk in or reserve a slot. Step two: Sit comfortably in front of the gentle camera. Step three: Rapid three-minute photo capture. Step four: Doctor verification and AI triage. Step five: Plain language plan and follow-up support.",
                "How Screening Works",
                "how-screening-works"
              )
            }
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFFDF9] border border-[#EFE4DC] text-[#2B2024] font-semibold text-xs flex items-center gap-2 shrink-0 min-h-[40px] transition-colors shadow-xs"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#F05A28]" />
            <span>Listen to Guide</span>
          </button>
        </div>

        {/* 5 Elegant Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-[#EFE4DC] p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="font-mono text-xs font-bold text-[#F05A28] bg-[#FFE5D8] border border-[#FED7AA] px-2 py-0.5 rounded-md inline-block">
                01
              </span>
              <h3 className="text-base font-serif font-semibold text-[#2B2024]">
                Arrive or Book
              </h3>
              <p className="text-xs text-[#6F6267] leading-relaxed">
                Visit a free community camp or partner health clinic. No special doctor referral or complicated paperwork needed.
              </p>
            </div>
            <div className="text-[11px] text-[#087F6A] font-medium pt-2 border-t border-[#EFE4DC]">
              Zero fee at community camps
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-[#EFE4DC] p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="font-mono text-xs font-bold text-[#D94A78] bg-[#FBE4EC] border border-[#FBCFE8] px-2 py-0.5 rounded-md inline-block">
                02
              </span>
              <h3 className="text-base font-serif font-semibold text-[#2B2024]">
                Sit Comfortably
              </h3>
              <p className="text-xs text-[#6F6267] leading-relaxed">
                You sit in front of a modern digital camera and look into a gentle green fixation target. Nothing touches your eyeball.
              </p>
            </div>
            <div className="text-[11px] text-[#6F6267] pt-2 border-t border-[#EFE4DC]">
              No stinging drops needed
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-[#EFE4DC] p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="font-mono text-xs font-bold text-[#F05A28] bg-[#FFE5D8] border border-[#FED7AA] px-2 py-0.5 rounded-md inline-block">
                03
              </span>
              <h3 className="text-base font-serif font-semibold text-[#2B2024]">
                Soft Photo Flash
              </h3>
              <p className="text-xs text-[#6F6267] leading-relaxed">
                A brief, gentle flash takes a high-detail digital image of the light-sensitive retina and optic disc in under 3 minutes.
              </p>
            </div>
            <div className="text-[11px] text-[#6F6267] pt-2 border-t border-[#EFE4DC]">
              100% painless capture
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl border border-[#EFE4DC] p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="font-mono text-xs font-bold text-[#D94A78] bg-[#FBE4EC] border border-[#FBCFE8] px-2 py-0.5 rounded-md inline-block">
                04
              </span>
              <h3 className="text-base font-serif font-semibold text-[#2B2024]">
                Doctor Verification
              </h3>
              <p className="text-xs text-[#6F6267] leading-relaxed">
                Smart triage assists the review, while certified eye care specialists confirm all clinical findings for complete peace of mind.
              </p>
            </div>
            <div className="text-[11px] text-[#087F6A] font-medium pt-2 border-t border-[#EFE4DC]">
              Dual safety verification
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-white rounded-2xl border border-[#EFE4DC] p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="font-mono text-xs font-bold text-[#F05A28] bg-[#FFE5D8] border border-[#FED7AA] px-2 py-0.5 rounded-md inline-block">
                05
              </span>
              <h3 className="text-base font-serif font-semibold text-[#2B2024]">
                Clear Plan & Follow-up
              </h3>
              <p className="text-xs text-[#6F6267] leading-relaxed">
                You leave with clear, simple instructions: an all-clear for next year, or priority specialist referral scheduling.
              </p>
            </div>
            <div className="text-[11px] text-[#6F6267] pt-2 border-t border-[#EFE4DC]">
              Printed & digital report
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          5. CORE SECTION: FIND SCREENING NEAR ME
          ========================================================================= */}
      <section
        id="find-screening-section"
        aria-labelledby="find-screening-heading"
        className="space-y-6 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FFE5D8] border border-[#FED7AA] text-[#D84818] text-xs font-semibold mb-2">
              <MapPin className="w-3 h-3 text-[#F05A28]" />
              <span>{t("findScreeningTitle", "Find Screening Near Me")}</span>
            </div>
            <h2 id="find-screening-heading" className="text-2xl sm:text-3xl font-serif font-semibold text-[#2B2024] tracking-tight">
              {t("findScreeningTitle", "Find Screening Near Me")}
            </h2>
            <p className="text-xs sm:text-sm text-[#6F6267] mt-1 max-w-2xl">
              {t(
                "findScreeningSubtitle",
                "Locate verified eye clinics, community health centers, and free eye camps in your area."
              )}
            </p>
          </div>

          <button
            onClick={() =>
              handleSpeak(
                `${t("findScreeningTitle")}. ${t("findScreeningSubtitle")}`,
                t("findScreeningTitle"),
                "find-heading"
              )
            }
            className="p-2 rounded-lg text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFFDF9] transition-colors self-start sm:self-auto"
            title="Listen to section"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Location Bar with Premium Warm Styling */}
        <div className="bg-white rounded-2xl border border-[#EFE4DC] p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#6F6267] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  "searchPlaceholder",
                  "Enter your city, town, or PIN code (e.g. Bengaluru, 560060)..."
                )}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE4DC] bg-[#FFFDF9] text-sm text-[#2B2024] placeholder-[#6F6267] focus:outline-none focus:border-[#F05A28] focus:bg-white min-h-[44px] transition-all"
              />
            </div>

            <button
              onClick={handleUseLocation}
              className="px-4 py-2.5 rounded-xl border border-[#EFE4DC] bg-white text-[#2B2024] hover:bg-[#FFFDF9] font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shrink-0 min-h-[44px]"
            >
              <Navigation className="w-3.5 h-3.5 text-[#F05A28]" />
              <span>{userLocationDetected ? t("currentLocationDetected", "Bengaluru (Current Location)") : t("useLocationBtn", "Use My Location")}</span>
            </button>
          </div>

          {/* Quick Filter Buttons (All, Camps, Clinics, Hospitals) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#EFE4DC]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6F6267] mr-1">
              {t("filterLabel", "Filter:")}
            </span>
            {[
              { id: "All", label: t("filterAll", "All Centers") },
              { id: "Camp", label: t("filterFreeCamps", "Free Eye Camps") },
              { id: "Clinic", label: t("filterClinics", "Community Clinics") },
              { id: "Hospital", label: t("filterHospitals", "Eye Hospitals") },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedType(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${
                  selectedType === f.id
                    ? "bg-[#2B2024] text-white shadow-xs"
                    : "bg-[#FFFDF9] text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFE5D8]/20 border border-[#EFE4DC]"
                }`}
              >
                {f.label}
              </button>
            ))}

            {/* City selectors */}
            <div className="ml-auto flex items-center gap-1 overflow-x-auto py-1">
              {cities.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCity(c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCity === c
                      ? "bg-[#2B2024] text-white font-semibold"
                      : "text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFFDF9]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Centers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCenters.length > 0 ? (
            filteredCenters.map((center) => (
              <div
                key={center.id}
                className="bg-white rounded-2xl border border-[#EFE4DC] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#D9CBC2] transition-all relative"
              >
                <div className="space-y-2.5">
                  {(center.type === "Camp" || center.isCampActive) && (
                    <div className="bg-[#FFF8E6] text-[#B86B00] border border-[#FFF1CC] text-[11px] font-semibold px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 mb-1">
                      <Tent className="w-3.5 h-3.5 text-[#B86B00]" />
                      <span>{t("campActiveToday", "Free Eye Camp Today • Walk-in welcome")}</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFFDF9] text-[#6F6267] border border-[#EFE4DC]">
                      {center.type || (center.isCampActive ? "Camp" : "Primary Clinic")}
                    </span>
                    <span className="text-xs font-medium text-[#6F6267] bg-[#FFFDF9] px-2 py-0.5 rounded-md border border-[#EFE4DC]">
                      {center.distance || center.distanceKm || '2.5'} {t("distanceAway", "km away")}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-semibold text-[#2B2024] leading-snug">
                    {center.name}
                  </h4>

                  <p className="text-xs text-[#6F6267] flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#6F6267] shrink-0 mt-0.5" />
                    <span>{center.address}, {center.city} - {center.pinCode}</span>
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-[#6F6267]">
                    <Clock className="w-3 h-3 text-[#087F6A]" />
                    <span className="font-medium text-[#087F6A]">{center.hours || center.operatingHours || "8:30 AM – 5:00 PM"}</span>
                  </div>
                </div>

                {/* Action Buttons: Primary screening action is #F05A28 */}
                <div className="space-y-2 pt-3 border-t border-[#EFE4DC]">
                  <button
                    onClick={() => {
                      setBookingCenter(center);
                      setBookingConfirmed(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 min-h-[42px]"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{t("ctaBookScreening", "Book Free Screening")}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${center.phone || center.contactPhone || "+91 80 2848 1122"}`}
                      className="py-2 px-2.5 rounded-xl border border-[#EFE4DC] bg-white hover:bg-[#FFFDF9] text-[#2B2024] font-medium text-xs flex items-center justify-center gap-1.5 min-h-[38px] transition-colors"
                    >
                      <Phone className="w-3 h-3 text-[#6F6267]" />
                      <span>{t("ctaCallClinic", "Call")}</span>
                    </a>

                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(center.name + " " + center.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-2.5 rounded-xl border border-[#EFE4DC] bg-white hover:bg-[#FFFDF9] text-[#2B2024] font-medium text-xs flex items-center justify-center gap-1.5 min-h-[38px] transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#6F6267]" />
                      <span>{t("ctaGetDirections", "Directions")}</span>
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white p-10 rounded-2xl border border-[#EFE4DC] text-center space-y-3">
              <p className="text-sm text-[#6F6267]">
                {t("noCentersFound", "No screening centers found for this search. Try selecting another city above.")}
              </p>
              <button
                onClick={() => {
                  setSelectedCity("All");
                  setSelectedType("All");
                  setSearchQuery("");
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#FFFDF9] hover:bg-[#FFE5D8]/30 text-[#2B2024] font-semibold text-xs transition-colors border border-[#EFE4DC]"
              >
                {t("resetAllFilters", "Reset All Filters")}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          6. CORE QUESTIONS & REASSURING ANSWERS
          ========================================================================= */}
      <section
        id="learn-screening-section"
        aria-labelledby="learn-heading"
        className="space-y-6 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FFE5D8] border border-[#FED7AA] text-[#D84818] text-xs font-semibold mb-2">
              <HelpCircle className="w-3 h-3 text-[#F05A28]" />
              <span>{t("learnTitle", "Patient Knowledge Guide")}</span>
            </div>
            <h2 id="learn-heading" className="text-2xl sm:text-3xl font-serif font-semibold text-[#2B2024] tracking-tight">
              Essential Questions Answered
            </h2>
            <p className="text-xs sm:text-sm text-[#6F6267] mt-1 max-w-2xl">
              {t(
                "learnSubtitle",
                "Clear, reassuring answers for patients and families. No confusing medical jargon."
              )}
            </p>
          </div>

          <button
            onClick={() =>
              handleSpeak(
                `${t("q1Title")}: ${t("q1Answer")} ${t("q2Title")}: ${t("q2Answer")}`,
                t("learnTitle"),
                "full-learn"
              )
            }
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFFDF9] border border-[#EFE4DC] text-[#2B2024] font-semibold text-xs flex items-center gap-2 shrink-0 min-h-[40px] transition-colors shadow-xs"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#F05A28]" />
            <span>{t("listenGuideVoice", "Listen in " + currentLangObj.label)}</span>
          </button>
        </div>

        {/* The 4 Core Question Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Question 1: What is diabetic retinopathy? */}
          <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#D9CBC2] transition-all">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-xs font-bold text-[#F05A28] bg-[#FFE5D8] border border-[#FED7AA] px-2 py-0.5 rounded-md">
                  01
                </span>
                <button
                  onClick={() =>
                    handleSpeak(
                      `${t("q1Title")}. ${t("q1Answer")}`,
                      t("q1Title"),
                      "q1"
                    )
                  }
                  title="Listen to this explanation"
                  className="p-2 rounded-lg text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFFDF9] transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-lg sm:text-xl font-serif font-semibold text-[#2B2024]">
                {t("q1Title", "What is diabetic retinopathy?")}
              </h3>

              <p className="text-xs sm:text-sm text-[#6F6267] leading-relaxed font-normal">
                {t(
                  "q1Answer",
                  "Diabetic retinopathy is an eye condition that can happen to anyone with diabetes. When blood sugar stays high over many years, it slowly weakens the microscopic blood vessels in the back of your eye (called the retina). At first, you feel zero pain and your vision stays clear. But without regular checks, weakened vessels can leak fluid or bleed, which can permanently hurt your sight."
                )}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-[#EFE4DC]">
              <div className="flex items-start gap-2 text-xs text-[#2B2024]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] mt-0.5 shrink-0" />
                <span>{t("q1Point1", "Affects the retina at the light-sensitive back of the eye.")}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-[#2B2024]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] mt-0.5 shrink-0" />
                <span>{t("q1Point2", "Starts with no pain, no redness, and no blurry vision.")}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-[#2B2024]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] mt-0.5 shrink-0" />
                <span>{t("q1Point3", "Can be safely managed if discovered during early checks.")}</span>
              </div>
            </div>
          </div>

          {/* Question 2: Why screening matters */}
          <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#D9CBC2] transition-all">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-xs font-bold text-[#D94A78] bg-[#FBE4EC] border border-[#FBCFE8] px-2 py-0.5 rounded-md">
                  02
                </span>
                <button
                  onClick={() =>
                    handleSpeak(
                      `${t("q2Title")}. ${t("q2Answer")}`,
                      t("q2Title"),
                      "q2"
                    )
                  }
                  title="Listen to this explanation"
                  className="p-2 rounded-lg text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFFDF9] transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-lg sm:text-xl font-serif font-semibold text-[#2B2024]">
                {t("q2Title", "Why screening matters")}
              </h3>

              <p className="text-xs sm:text-sm text-[#6F6267] leading-relaxed font-normal">
                {t(
                  "q2Answer",
                  "You cannot feel diabetes harming your retina. By the time you notice blurriness, wavy lines, or dark floaters, damage may have already progressed. A simple annual eye photograph catches the earliest microscopic changes years before your daily sight is harmed. Over 90% of severe vision loss is preventable with timely screening and good diabetes care."
                )}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-[#EFE4DC]">
              <div className="flex items-start gap-2 text-xs text-[#2B2024]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] mt-0.5 shrink-0" />
                <span>{t("q2Point1", "Detects warning signs years before your sight changes.")}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-[#2B2024]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] mt-0.5 shrink-0" />
                <span>{t("q2Point2", "Over 90% of severe vision loss is completely preventable.")}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-[#2B2024]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] mt-0.5 shrink-0" />
                <span>{t("q2Point3", "Takes less than 3 minutes once a year.")}</span>
              </div>
            </div>
          </div>

          {/* Question 3: What happens during screening? */}
          <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#D9CBC2] transition-all">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-xs font-bold text-[#F05A28] bg-[#FFE5D8] border border-[#FED7AA] px-2 py-0.5 rounded-md">
                  03
                </span>
                <button
                  onClick={() =>
                    handleSpeak(
                      `${t("q3Title")}. ${t("q3Answer")}`,
                      t("q3Title"),
                      "q3"
                    )
                  }
                  title="Listen to this explanation"
                  className="p-2 rounded-lg text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFFDF9] transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-lg sm:text-xl font-serif font-semibold text-[#2B2024]">
                {t("q3Title", "What happens during screening?")}
              </h3>

              <p className="text-xs sm:text-sm text-[#6F6267] leading-relaxed font-normal">
                {t(
                  "q3Answer",
                  "Screening is quick, safe, and 100% painless. You sit comfortably in a chair and look toward a gentle digital camera lens. The camera flashes softly and takes a photograph of the back of your eye. Nothing touches your eyeball. In most community camps and health centers, you do not even need stinging eye drops, and you can walk home or go back to work immediately."
                )}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-[#EFE4DC]">
              <div className="flex items-start gap-2 text-xs text-[#2B2024]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] mt-0.5 shrink-0" />
                <span>{t("q3Point1", "Completely painless — zero needles and zero contact with your eye.")}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-[#2B2024]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] mt-0.5 shrink-0" />
                <span>{t("q3Point2", "Finished in under 3 minutes.")}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-[#2B2024]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] mt-0.5 shrink-0" />
                <span>{t("q3Point3", "No blurry drops needed in most checks — return to your day right away.")}</span>
              </div>
            </div>
          </div>

          {/* Question 4: What happens after a concerning result? */}
          <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#D9CBC2] transition-all">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-xs font-bold text-[#D94A78] bg-[#FBE4EC] border border-[#FBCFE8] px-2 py-0.5 rounded-md">
                  04
                </span>
                <button
                  onClick={() =>
                    handleSpeak(
                      `${t("q4Title")}. ${t("q4Answer")}`,
                      t("q4Title"),
                      "q4"
                    )
                  }
                  title="Listen to this explanation"
                  className="p-2 rounded-lg text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFFDF9] transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-lg sm:text-xl font-serif font-semibold text-[#2B2024]">
                {t("q4Title", "What happens after a concerning result?")}
              </h3>

              <p className="text-xs sm:text-sm text-[#6F6267] leading-relaxed font-normal">
                {t(
                  "q4Answer",
                  "Please do not worry: being flagged does NOT mean you are losing your vision. It simply means the photo noticed early changes that need a careful look by an eye doctor (ophthalmologist). Our team helps schedule a priority appointment at a nearby clinic. Eye doctors have safe, proven treatments — like gentle medicines, lifestyle guidance, or painless laser therapy — that protect your eyesight for decades."
                )}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-[#EFE4DC]">
              <div className="flex items-start gap-2 text-xs text-[#2B2024]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] mt-0.5 shrink-0" />
                <span>{t("q4Point1", "A flag is an early alert to help you see a doctor sooner, not a diagnosis of blindness.")}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-[#2B2024]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] mt-0.5 shrink-0" />
                <span>{t("q4Point2", "Proven treatments exist that halt progression and safeguard your vision.")}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-[#2B2024]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] mt-0.5 shrink-0" />
                <span>{t("q4Point3", "Our clinic team coordinates your specialist visit so you never feel lost.")}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          7. SAMPLE RETINAL CHECK DEMO & HEALTHCARE STAFF ACCESS BANNER
          ========================================================================= */}
      <section className="rounded-2xl bg-white border border-[#EFE4DC] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#FFE5D8] text-[#D84818] border border-[#FED7AA]">
            <Eye className="w-3 h-3 text-[#F05A28]" />
            <span>Interactive Retinal Demo</span>
          </div>
          <h3 className="text-xl font-serif font-semibold text-[#2B2024]">
            {t("sampleEyeCheckTitle", "See a Sample Retinal Check")}
          </h3>
          <p className="text-xs sm:text-sm text-[#6F6267] leading-relaxed">
            Take a look at what an eye photograph looks like, how early microvascular changes are identified, and what friendly advice is provided to patients.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full sm:w-auto">
          {onGoToSampleCheck && (
            <button
              onClick={onGoToSampleCheck}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#2B2024] hover:bg-[#1A1516] text-white font-semibold text-xs flex items-center justify-center gap-2 min-h-[44px] shadow-xs transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#FFE5D8]" />
              <span>{t("ctaSeePracticeCheck", "See Sample Eye Check")}</span>
            </button>
          )}

          {onSwitchToProviderPortal && (
            <button
              onClick={onSwitchToProviderPortal}
              className="w-full sm:w-auto px-4 py-3 rounded-xl border border-[#EFE4DC] bg-white hover:bg-[#FFFDF9] text-[#2B2024] font-semibold text-xs flex items-center justify-center gap-1.5 min-h-[44px] transition-colors"
            >
              <Building className="w-3.5 h-3.5 text-[#6F6267]" />
              <span>{t("healthcareStaffPortal", "Healthcare Staff Portal →")}</span>
            </button>
          )}
        </div>
      </section>

      {/* =========================================================================
          8. BOOKING APPOINTMENT MODAL
          ========================================================================= */}
      {bookingCenter && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#2B2024]/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-xl border border-[#EFE4DC] space-y-4 animate-in zoom-in-95 duration-150">
            {!bookingConfirmed ? (
              <>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#F05A28]">
                      {t("freeScreeningBooking", "Free Screening Booking")}
                    </span>
                    <button
                      onClick={() => setBookingCenter(null)}
                      className="text-[#6F6267] hover:text-[#2B2024] p-1 rounded-lg text-sm font-semibold"
                    >
                      ✕
                    </button>
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-[#2B2024] mt-1">
                    {bookingCenter.name}
                  </h3>
                  <p className="text-xs text-[#6F6267] mt-0.5">
                    {bookingCenter.address}, {bookingCenter.city}
                  </p>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#2B2024] block">
                      {t("patientNameInput", "Your Full Name")}
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] bg-[#FFFDF9] focus:bg-white focus:outline-none focus:border-[#F05A28] min-h-[42px] transition-all text-[#2B2024]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#2B2024] block">
                      {t("patientPhoneInput", "Mobile Number (for SMS confirmation)")}
                    </label>
                    <input
                      type="tel"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] bg-[#FFFDF9] focus:bg-white focus:outline-none focus:border-[#F05A28] min-h-[42px] transition-all text-[#2B2024]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#2B2024] block">
                      {t("preferredDateInput", "Preferred Day")}
                    </label>
                    <select
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] bg-[#FFFDF9] focus:bg-white focus:outline-none focus:border-[#F05A28] min-h-[42px] transition-all text-[#2B2024]"
                    >
                      <option>{t("slotTomorrowMorning", "Tomorrow Morning (9:00 AM - 12:00 PM)")}</option>
                      <option>{t("slotTomorrowAfternoon", "Tomorrow Afternoon (2:00 PM - 5:00 PM)")}</option>
                      <option>{t("slotSaturdayMorning", "This Saturday Morning (9:00 AM - 1:00 PM)")}</option>
                      <option>{t("slotNextWeek", "Next Week (Center will call to confirm slot)")}</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-[#FFFDF9] rounded-xl border border-[#EFE4DC] text-xs text-[#087F6A] font-medium">
                  {t("zeroFeeNotice", "Zero fee required. Retinal checks at community centers are 100% free of charge.")}
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    onClick={() => setBookingCenter(null)}
                    className="flex-1 py-2.5 rounded-xl border border-[#EFE4DC] text-[#2B2024] font-semibold text-xs sm:text-sm min-h-[42px] hover:bg-[#FFFDF9] transition-colors"
                  >
                    {t("cancelBtn", "Cancel")}
                  </button>
                  <button
                    onClick={() => setBookingConfirmed(true)}
                    className="flex-1 py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white font-semibold text-xs sm:text-sm min-h-[42px] shadow-xs transition-colors"
                  >
                    {t("confirmBookingBtn", "Confirm Appointment")}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-5 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E6F5F2] text-[#087F6A] flex items-center justify-center mx-auto border border-[#CCEBE5]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-[#2B2024]">
                  {t("bookingConfirmedTitle", "Appointment Confirmed!")}
                </h3>
                <p className="text-xs sm:text-sm text-[#6F6267] leading-relaxed max-w-sm mx-auto">
                  {t(
                    "bookingConfirmedDesc",
                    "Your screening appointment has been scheduled. Please arrive 10 minutes early. Remember to bring your prescription glasses and any recent diabetes reports."
                  )}
                </p>
                <div className="bg-[#FFFDF9] p-3.5 rounded-xl border border-[#EFE4DC] text-xs text-left space-y-1 text-[#2B2024]">
                  <div><strong>{t("centerLabel", "Center:")}</strong> {bookingCenter.name}</div>
                  <div><strong>{t("slotLabel", "Slot:")}</strong> {preferredDate}</div>
                  <div><strong>{t("patientLabel", "Patient:")}</strong> {patientName || t("patientDefault", "Patient")}</div>
                </div>
                <button
                  onClick={() => setBookingCenter(null)}
                  className="w-full py-2.5 rounded-xl bg-[#2B2024] hover:bg-[#1A1516] text-white font-semibold text-sm min-h-[42px] transition-colors"
                >
                  {t("closeBtn", "Close")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
