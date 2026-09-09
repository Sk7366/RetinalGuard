import React, { useState } from "react";
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
  Sparkles,
  Heart,
  Eye,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Search,
  Check,
  Type,
  Sun,
  Layers,
  Building,
  Tent,
  AlertCircle
} from "lucide-react";
import { useTranslation } from "../i18n/I18nContext";
import { voiceService } from "../services/voiceService";
import { MOCK_SCREENING_CENTERS } from "../mock/mockData";
import { ScreeningCenter } from "../types";

interface SimplifiedPatientHomeProps {
  onGoToSampleCheck?: () => void;
  onSwitchToProviderPortal?: () => void;
  textSizeClass?: string;
  isHighContrast?: boolean;
  onToggleHighContrast?: () => void;
  onSetTextSize?: (size: "standard" | "large" | "xl") => void;
  currentTextSize?: "standard" | "large" | "xl";
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

  // Active topic accordion
  const [activeTopic, setActiveTopic] = useState<string>("q1");

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
    } else {
      voiceService.speak({
        text,
        title,
        lang: language,
        sectionId,
      });
    }
  };

  const scrollToFindScreening = () => {
    const el = document.getElementById("find-screening-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToLearn = () => {
    const el = document.getElementById("learn-screening-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const currentLangObj = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  return (
    <div className={`space-y-10 pb-20 ${textSizeClass} ${isHighContrast ? "font-sans font-medium" : ""}`}>
      
      {/* 1. TOP ACCESSIBILITY & MULTILINGUAL BAR */}
      <section
        aria-label="Language and accessibility settings"
        className="rounded-2xl p-3 sm:p-4 border shadow-2xs bg-white/80 backdrop-blur-sm border-stone-200/80 flex flex-wrap items-center justify-between gap-3"
      >
        {/* Language selector chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mr-1 hidden sm:inline">
            Language:
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
                    ? "bg-stone-900 text-white shadow-2xs"
                    : "bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/70"
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
          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200/80">
            <button
              onClick={() => onSetTextSize && onSetTextSize("standard")}
              title="Standard text"
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentTextSize === "standard" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              A
            </button>
            <button
              onClick={() => onSetTextSize && onSetTextSize("large")}
              title="Large text"
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentTextSize === "large" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              A+
            </button>
            <button
              onClick={() => onSetTextSize && onSetTextSize("xl")}
              title="Extra large text"
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentTextSize === "xl" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-800"
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
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-stone-500" />
            <span>{t("highContrast", "High Contrast")}</span>
          </button>
        </div>
      </section>

      {/* 2. PATIENT-FIRST WELCOMING HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-stone-200/80 shadow-xs p-7 sm:p-10 lg:p-14">
        <div className="max-w-4xl space-y-6">
          {/* Community Trust Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50/80 text-orange-900 border border-orange-200/60">
              <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
              {t("badgePainless", "100% Painless • No Needles")}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200/80">
              <Heart className="w-3.5 h-3.5 text-[#DB2777]" />
              {t("badgeCommunityCamps", "Community Centers & Eye Camps")}
            </span>
          </div>

          {/* Primary Big Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-stone-900 tracking-tight leading-[1.18]">
            {t("homeHeroHeadline", "Protect Your Sight from Diabetes.")}
          </h1>

          {/* Plain Language Reassuring Subtitle */}
          <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-3xl font-normal">
            {t(
              "homeHeroSubheadline",
              "A quick 3-minute eye photo detects diabetic retinopathy early — before your vision is affected. Free or low-cost at community centers near you."
            )}
          </p>

          {/* Large Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Primary Requested CTA: "Find Screening" */}
            <button
              id="hero-find-screening-btn"
              onClick={scrollToFindScreening}
              className="px-7 py-3.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-sm sm:text-base shadow-xs hover:shadow transition-all flex items-center justify-center gap-2.5 min-h-[48px]"
            >
              <MapPin className="w-4 h-4 text-white" />
              <span>{t("ctaFindScreening", "Find Screening")}</span>
            </button>

            {/* Learn About Screening CTA */}
            <button
              id="hero-learn-screening-btn"
              onClick={scrollToLearn}
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 hover:border-stone-300 font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2 min-h-[48px]"
            >
              <BookOpen className="w-4 h-4 text-stone-500" />
              <span>{t("ctaLearnAboutScreening", "Learn About Screening")}</span>
            </button>

            {/* Voice Read Aloud for Hero */}
            <button
              onClick={() =>
                handleSpeak(
                  `${t("homeHeroHeadline", "Protect Your Sight from Diabetes.")}. ${t(
                    "homeHeroSubheadline",
                    "A quick 3-minute eye photo detects diabetic retinopathy early."
                  )}`,
                  t("homeHeroHeadline", "Protect Your Sight"),
                  "hero"
                )
              }
              aria-label="Read hero instructions aloud"
              className="px-4 py-3.5 rounded-xl bg-stone-100 hover:bg-stone-200/70 text-stone-700 border border-stone-200/70 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Volume2 className="w-4 h-4 text-stone-500" />
              <span>{t("listenVoice", "Listen")}</span>
            </button>
          </div>

          {/* Quick reassurance strip */}
          <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-stone-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>No direct eye touch or painful drops</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Results ready in minutes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Over 90% of sight loss is preventable</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE SECTION: LEARN ABOUT SCREENING (THE 4 ESSENTIAL QUESTIONS) */}
      <section
        id="learn-screening-section"
        aria-labelledby="learn-heading"
        className="space-y-6 scroll-mt-20"
      >
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold mb-2">
              <BookOpen className="w-3 h-3 text-stone-500" />
              <span>{t("learnTitle", "Learn About Screening")}</span>
            </div>
            <h2 id="learn-heading" className="text-2xl sm:text-3xl font-serif font-semibold text-stone-900 tracking-tight">
              {t("learnTitle", "Learn About Screening")}
            </h2>
            <p className="text-sm text-stone-500 mt-1 max-w-2xl">
              {t(
                "learnSubtitle",
                "Clear, reassuring answers for patients and families. No confusing medical jargon."
              )}
            </p>
          </div>

          {/* Audio listen for entire guide */}
          <button
            onClick={() =>
              handleSpeak(
                `${t("q1Title")}: ${t("q1Answer")} ${t("q2Title")}: ${t("q2Answer")}`,
                t("learnTitle"),
                "full-learn"
              )
            }
            className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/70 border border-stone-200/70 text-stone-700 font-semibold text-xs flex items-center gap-2 shrink-0 min-h-[40px] transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5 text-stone-500" />
            <span>{t("listenGuideVoice", "Listen in " + currentLangObj.label)}</span>
          </button>
        </div>

        {/* The 4 Core Question Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Question 1: What is diabetic retinopathy? */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-7 shadow-2xs flex flex-col justify-between space-y-4 hover:border-stone-300 transition-all">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-xs font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
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
                  className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-lg sm:text-xl font-serif font-semibold text-stone-900">
                {t("q1Title", "What is diabetic retinopathy?")}
              </h3>

              <p className="text-sm text-stone-600 leading-relaxed font-normal">
                {t(
                  "q1Answer",
                  "Diabetic retinopathy is an eye condition that can happen to anyone with diabetes. When blood sugar stays high over many years, it slowly weakens the microscopic blood vessels in the back of your eye (called the retina). At first, you feel zero pain and your vision stays clear. But without regular checks, weakened vessels can leak fluid or bleed, which can permanently hurt your sight."
                )}
              </p>
            </div>

            {/* Key takeaway bullets */}
            <div className="space-y-2 pt-3 border-t border-stone-100">
              <div className="flex items-start gap-2 text-xs sm:text-sm text-stone-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>{t("q1Point1", "Affects the retina at the light-sensitive back of the eye.")}</span>
              </div>
              <div className="flex items-start gap-2 text-xs sm:text-sm text-stone-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>{t("q1Point2", "Starts with no pain, no redness, and no blurry vision.")}</span>
              </div>
              <div className="flex items-start gap-2 text-xs sm:text-sm text-stone-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>{t("q1Point3", "Can be safely managed if discovered during early checks.")}</span>
              </div>
            </div>
          </div>

          {/* Question 2: Why screening matters */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-7 shadow-2xs flex flex-col justify-between space-y-4 hover:border-stone-300 transition-all">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-xs font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
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
                  className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-lg sm:text-xl font-serif font-semibold text-stone-900">
                {t("q2Title", "Why screening matters")}
              </h3>

              <p className="text-sm text-stone-600 leading-relaxed font-normal">
                {t(
                  "q2Answer",
                  "You cannot feel diabetes harming your retina. By the time you notice blurriness, wavy lines, or dark floaters, damage may have already progressed. A simple annual eye photograph catches the earliest microscopic changes years before your daily sight is harmed. Over 90% of severe vision loss is preventable with timely screening and good diabetes care."
                )}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-stone-100">
              <div className="flex items-start gap-2 text-xs sm:text-sm text-stone-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>{t("q2Point1", "Detects warning signs years before your sight changes.")}</span>
              </div>
              <div className="flex items-start gap-2 text-xs sm:text-sm text-stone-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>{t("q2Point2", "Over 90% of severe vision loss is completely preventable.")}</span>
              </div>
              <div className="flex items-start gap-2 text-xs sm:text-sm text-stone-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>{t("q2Point3", "Takes less than 3 minutes once a year.")}</span>
              </div>
            </div>
          </div>

          {/* Question 3: What happens during screening? */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-7 shadow-2xs flex flex-col justify-between space-y-4 hover:border-stone-300 transition-all">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-xs font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
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
                  className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-lg sm:text-xl font-serif font-semibold text-stone-900">
                {t("q3Title", "What happens during screening?")}
              </h3>

              <p className="text-sm text-stone-600 leading-relaxed font-normal">
                {t(
                  "q3Answer",
                  "Screening is quick, safe, and 100% painless. You sit comfortably in a chair and look toward a gentle digital camera lens. The camera flashes softly and takes a photograph of the back of your eye. Nothing touches your eyeball. In most community camps and health centers, you do not even need stinging eye drops, and you can walk home or go back to work immediately."
                )}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-stone-100">
              <div className="flex items-start gap-2 text-xs sm:text-sm text-stone-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>{t("q3Point1", "Completely painless — zero needles and zero contact with your eye.")}</span>
              </div>
              <div className="flex items-start gap-2 text-xs sm:text-sm text-stone-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>{t("q3Point2", "Finished in under 3 minutes.")}</span>
              </div>
              <div className="flex items-start gap-2 text-xs sm:text-sm text-stone-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>{t("q3Point3", "No blurry drops needed in most checks — return to your day right away.")}</span>
              </div>
            </div>
          </div>

          {/* Question 4: What happens after a concerning result? */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-7 shadow-2xs flex flex-col justify-between space-y-4 hover:border-stone-300 transition-all">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-xs font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
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
                  className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-lg sm:text-xl font-serif font-semibold text-stone-900">
                {t("q4Title", "What happens after a concerning result?")}
              </h3>

              <p className="text-sm text-stone-600 leading-relaxed font-normal">
                {t(
                  "q4Answer",
                  "Please do not worry: being flagged does NOT mean you are losing your vision. It simply means the photo noticed early changes that need a careful look by an eye doctor (ophthalmologist). Our team helps schedule a priority appointment at a nearby clinic. Eye doctors have safe, proven treatments — like gentle medicines, lifestyle guidance, or painless laser therapy — that protect your eyesight for decades."
                )}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-stone-100">
              <div className="flex items-start gap-2 text-xs sm:text-sm text-stone-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>{t("q4Point1", "A flag is an early alert to help you see a doctor sooner, not a diagnosis of blindness.")}</span>
              </div>
              <div className="flex items-start gap-2 text-xs sm:text-sm text-stone-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>{t("q4Point2", "Proven treatments exist that halt progression and safeguard your vision.")}</span>
              </div>
              <div className="flex items-start gap-2 text-xs sm:text-sm text-stone-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>{t("q4Point3", "Our clinic team coordinates your specialist visit so you never feel lost.")}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. CORE SECTION: FIND SCREENING NEAR ME */}
      <section
        id="find-screening-section"
        aria-labelledby="find-screening-heading"
        className="space-y-6 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold mb-2">
              <MapPin className="w-3 h-3 text-[#EA580C]" />
              <span>{t("findScreeningTitle", "Find Screening Near Me")}</span>
            </div>
            <h2 id="find-screening-heading" className="text-2xl sm:text-3xl font-serif font-semibold text-stone-900 tracking-tight">
              {t("findScreeningTitle", "Find Screening Near Me")}
            </h2>
            <p className="text-sm text-stone-500 mt-1 max-w-2xl">
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
            className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors self-start sm:self-auto"
            title="Listen to section"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Location Bar with Clean Design */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  "searchPlaceholder",
                  "Enter your city, town, or PIN code (e.g. Bengaluru, 560060)..."
                )}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white min-h-[44px] transition-all"
              />
            </div>

            <button
              onClick={handleUseLocation}
              className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:text-stone-900 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shrink-0 min-h-[44px]"
            >
              <Navigation className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>{userLocationDetected ? "Bengaluru (Current Location)" : t("useLocationBtn", "Use My Location")}</span>
            </button>
          </div>

          {/* Quick Filter Buttons (All, Camps, Clinics, Hospitals) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mr-1">
              Filter:
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
                    ? "bg-stone-900 text-white shadow-2xs"
                    : "bg-stone-50 text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200/60"
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
                      ? "bg-stone-900 text-white font-semibold"
                      : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
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
                className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-stone-300 transition-all relative"
              >
                <div className="space-y-2.5">
                  {(center.type === "Camp" || center.isCampActive) && (
                    <div className="bg-amber-500/10 text-amber-900 border border-amber-200 text-[11px] font-semibold px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 mb-1">
                      <Tent className="w-3.5 h-3.5 text-amber-600" />
                      <span>{t("campActiveToday", "Free Eye Camp Today • Walk-in welcome")}</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200/60">
                      {center.type || (center.isCampActive ? "Camp" : "Primary Clinic")}
                    </span>
                    <span className="text-xs font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                      {center.distance || center.distanceKm || '2.5'} {t("distanceAway", "km away")}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-semibold text-stone-900 leading-snug">
                    {center.name}
                  </h4>

                  <p className="text-xs text-stone-500 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span>{center.address}, {center.city} - {center.pinCode}</span>
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span className="font-medium text-emerald-700">{center.hours || center.operatingHours || "8:30 AM – 5:00 PM"}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-3 border-t border-stone-100">
                  <button
                    onClick={() => {
                      setBookingCenter(center);
                      setBookingConfirmed(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-xs shadow-2xs transition-colors flex items-center justify-center gap-1.5 min-h-[42px]"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{t("ctaBookScreening", "Book Free Screening")}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${center.phone || center.contactPhone || "+91 80 2848 1122"}`}
                      className="py-2 px-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-medium text-xs flex items-center justify-center gap-1.5 min-h-[38px] transition-colors"
                    >
                      <Phone className="w-3 h-3 text-stone-400" />
                      <span>{t("ctaCallClinic", "Call")}</span>
                    </a>

                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(center.name + " " + center.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-medium text-xs flex items-center justify-center gap-1.5 min-h-[38px] transition-colors"
                    >
                      <Navigation className="w-3 h-3 text-stone-400" />
                      <span>{t("ctaGetDirections", "Directions")}</span>
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white p-10 rounded-2xl border border-stone-200/80 text-center space-y-3">
              <p className="text-sm text-stone-500">
                {t("noCentersFound", "No screening centers found for this search. Try selecting another city above.")}
              </p>
              <button
                onClick={() => {
                  setSelectedCity("All");
                  setSelectedType("All");
                  setSearchQuery("");
                }}
                className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 5. SAMPLE EYE CHECK & REASSURANCE BANNER */}
      <section className="rounded-2xl bg-stone-100/70 border border-stone-200/80 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-white text-stone-700 border border-stone-200">
            <Eye className="w-3 h-3 text-stone-500" />
            <span>Curious how it works?</span>
          </div>
          <h3 className="text-xl font-serif font-semibold text-stone-900">
            See a Sample Retinal Check
          </h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            Take a look at what an eye photograph looks like, how early changes are noticed, and what friendly advice is given to patients.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full sm:w-auto">
          {onGoToSampleCheck && (
            <button
              onClick={onGoToSampleCheck}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs flex items-center justify-center gap-2 min-h-[44px] shadow-2xs transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-stone-300" />
              <span>{t("ctaSeePracticeCheck", "See Sample Eye Check")}</span>
            </button>
          )}

          {onSwitchToProviderPortal && (
            <button
              onClick={onSwitchToProviderPortal}
              className="w-full sm:w-auto px-4 py-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs flex items-center justify-center gap-1.5 min-h-[44px] transition-colors"
            >
              <Building className="w-3.5 h-3.5 text-stone-400" />
              <span>Healthcare Staff Portal →</span>
            </button>
          )}
        </div>
      </section>

      {/* 6. BOOKING APPOINTMENT MODAL */}
      {bookingCenter && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-150">
            {!bookingConfirmed ? (
              <>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#EA580C]">
                      Free Screening Booking
                    </span>
                    <button
                      onClick={() => setBookingCenter(null)}
                      className="text-stone-400 hover:text-stone-700 p-1 rounded-lg text-sm font-semibold"
                    >
                      ✕
                    </button>
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-stone-900 mt-1">
                    {bookingCenter.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {bookingCenter.address}, {bookingCenter.city}
                  </p>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-800 block">
                      {t("patientNameInput", "Your Full Name")}
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:border-stone-400 min-h-[42px] transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-800 block">
                      {t("patientPhoneInput", "Mobile Number (for SMS confirmation)")}
                    </label>
                    <input
                      type="tel"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:border-stone-400 min-h-[42px] transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-800 block">
                      {t("preferredDateInput", "Preferred Day")}
                    </label>
                    <select
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:border-stone-400 min-h-[42px] transition-all"
                    >
                      <option>Tomorrow Morning (9:00 AM - 12:00 PM)</option>
                      <option>Tomorrow Afternoon (2:00 PM - 5:00 PM)</option>
                      <option>This Saturday Morning (9:00 AM - 1:00 PM)</option>
                      <option>Next Week (Center will call to confirm slot)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs text-stone-600">
                  Zero fee required. Retinal checks at community centers are 100% free of charge.
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    onClick={() => setBookingCenter(null)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs sm:text-sm min-h-[42px] hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setBookingConfirmed(true)}
                    className="flex-1 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-xs sm:text-sm min-h-[42px] shadow-2xs transition-colors"
                  >
                    {t("confirmBookingBtn", "Confirm Appointment")}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-5 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-stone-900">
                  {t("bookingConfirmedTitle", "Appointment Confirmed!")}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
                  {t(
                    "bookingConfirmedDesc",
                    "Your screening appointment has been scheduled. Please arrive 10 minutes early. Remember to bring your prescription glasses and any recent diabetes reports."
                  )}
                </p>
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/80 text-xs text-left space-y-1 text-stone-700">
                  <div><strong>Center:</strong> {bookingCenter.name}</div>
                  <div><strong>Slot:</strong> {preferredDate}</div>
                  <div><strong>Patient:</strong> {patientName || "Patient"}</div>
                </div>
                <button
                  onClick={() => setBookingCenter(null)}
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm min-h-[42px] transition-colors"
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
