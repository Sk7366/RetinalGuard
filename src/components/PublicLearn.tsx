import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronDown,
  Eye,
  Heart,
  HelpCircle,
  Info,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { DR_GRADES } from '../data/benchmarks';

interface PublicLearnProps {
  onGetScreened: () => void;
  onOpenFaq?: () => void;
}

export const PublicLearn: React.FC<PublicLearnProps> = ({ onGetScreened, onOpenFaq }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const patientFaqs = [
    {
      q: 'How often should a person with diabetes have their eyes checked?',
      a: 'The American Diabetes Association (ADA) and International Council of Ophthalmology recommend: For Type 2 Diabetes, have a comprehensive screening at initial diagnosis and at least annually thereafter. For Type 1 Diabetes, screening should begin within 5 years of diagnosis and recur every 12 months.',
    },
    {
      q: 'Can I have Diabetic Retinopathy if my vision still feels completely normal?',
      a: 'Yes, absolutely. This is why it is called a "silent condition". Early diabetic retinopathy causes tiny microaneurysms and subtle capillary leakage that do not yet obscure your central vision. Waiting until vision becomes blurry often means the disease has already progressed to advanced or proliferative stages.',
    },
    {
      q: 'What is Diabetic Macular Edema (DME)?',
      a: 'The macula is the central part of your retina responsible for sharp, detailed, color vision used for reading and recognizing faces. When damaged blood vessels leak fluid and proteins directly into the macula, it swells like a sponge. This swelling is called Macular Edema, and it can occur at any stage of Diabetic Retinopathy.',
    },
    {
      q: 'How does artificial intelligence assist my eye doctor?',
      a: 'RetinaGuard AI acts as an expert digital second opinion and rapid triage filter. It evaluates microscopic features across millions of pixels in less than a second, generates heatmaps showing exactly where potential damage is located, and ensures anyone needing urgent specialist attention is fast-tracked.',
    },
    {
      q: 'Can eye damage from diabetes be reversed or prevented?',
      a: 'Tight control of blood sugar (HbA1c < 7.0%), blood pressure (< 130/80 mmHg), and serum cholesterol dramatically slows down or halts progression. If advanced disease is caught early, modern ophthalmology treatments such as anti-VEGF eye injections and focal laser photocoagulation can stabilize and even restore visual acuity.',
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-7 sm:p-10 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200/80">
          <BookOpen className="w-3.5 h-3.5 text-stone-500" />
          <span>Patient & Community Eye Health Guide</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-semibold text-stone-900 tracking-tight">
          Understanding Diabetic Retinopathy & Eye Health
        </h1>

        <p className="text-sm sm:text-base text-stone-600 max-w-3xl leading-relaxed">
          Diabetic eye disease occurs when chronically elevated blood glucose weakens the microscopic blood vessels nourishing the retina. Learn how early detection, regular screening, and multimodal imaging safeguard your eyesight.
        </p>
      </div>

      {/* The 5 International DR Grades Guide */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-900">
            The 5 Stages of Diabetic Retinopathy (ICDR Scale)
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Standard clinical stages defined by the International Council of Ophthalmology:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
          {Object.values(DR_GRADES).map((grade) => (
            <div
              key={grade.grade}
              className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between space-y-3 relative hover:border-stone-300 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: grade.color }}
                  >
                    Grade {grade.grade}
                  </span>
                  <span className="text-[10px] font-mono text-stone-500 font-medium">
                    {grade.shortName}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-stone-900">{grade.name}</h3>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  {grade.description}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-200/80 text-[11px]">
                <span className="text-stone-400 block text-[10px] uppercase font-medium tracking-wider">Action</span>
                <span className="font-medium text-stone-800">{grade.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warning Signs & Symptoms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-7 shadow-xs space-y-3.5">
          <div className="w-9 h-9 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700">
            <AlertCircle className="w-4 h-4 text-[#EA580C]" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-stone-900">Warning Symptoms to Never Ignore</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            If you experience any of these vision changes, do not wait for an annual screening—contact an eye doctor or hospital right away:
          </p>
          <ul className="space-y-2 text-xs text-stone-700 pt-1">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] mt-1.5 shrink-0" />
              <span>Sudden onset of dark spots or floating cobweb strings in your vision</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] mt-1.5 shrink-0" />
              <span>Blurriness or distortion where straight lines appear wavy or bent</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] mt-1.5 shrink-0" />
              <span>Fluctuating vision that changes dramatically between morning and evening</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] mt-1.5 shrink-0" />
              <span>Dark or empty patches in the very center of your visual field</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-7 shadow-xs space-y-3.5">
          <div className="w-9 h-9 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700">
            <Calendar className="w-4 h-4 text-stone-600" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-stone-900">Recommended Screening Schedule</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Clinical guidelines from the ADA, WHO, and AAO:
          </p>
          <div className="space-y-2.5 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
              <div className="font-semibold text-stone-900">Type 2 Diabetes</div>
              <div className="text-stone-600">First screening immediately at diagnosis; repeat annually thereafter.</div>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
              <div className="font-semibold text-stone-900">Type 1 Diabetes</div>
              <div className="text-stone-600">Initial screening within 5 years of diagnosis; repeat every 12 months.</div>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
              <div className="font-semibold text-stone-900">Pregnancy in Women with Pre-existing Diabetes</div>
              <div className="text-stone-600">Screening prior to conception or in first trimester; repeat every trimester.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Patient Questions (Accordion) */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-900">
            Frequently Asked Patient Questions
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Common questions about diabetes, diabetic retinopathy, and AI point-of-care screening:
          </p>
        </div>

        <div className="space-y-2.5">
          {patientFaqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="border border-stone-200 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full text-left p-4 sm:p-4.5 flex items-center justify-between gap-4 bg-stone-50/50 hover:bg-stone-50 transition-colors"
                >
                  <span className="font-medium text-xs sm:text-sm text-stone-900">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-stone-700' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-4.5 text-xs sm:text-sm text-stone-600 bg-white leading-relaxed border-t border-stone-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-7 sm:p-8 rounded-2xl bg-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm border border-stone-800">
        <div className="space-y-1.5 max-w-xl">
          <h3 className="text-lg sm:text-xl font-serif font-semibold text-white">
            Ready to perform a screening evaluation?
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Evaluate retinal photos with explainable multimodal AI or explore pre-loaded clinical cases.
          </p>
        </div>
        <button
          onClick={onGetScreened}
          className="bg-[#EA580C] hover:bg-[#C2410C] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition-all shrink-0 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>Get Screened Now</span>
        </button>
      </div>
    </div>
  );
};
