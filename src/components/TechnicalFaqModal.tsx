import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  Cpu,
  FileQuestion,
  HelpCircle,
  Microscope,
  Search,
  ShieldCheck,
  Stethoscope,
  X,
} from 'lucide-react';

interface TechnicalFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FaqItem {
  id: string;
  category: 'architecture' | 'clinical' | 'deployment';
  question: string;
  shortAnswer: string;
  inDepthAnswer: string[];
  keyTakeaway: string;
}

export const TechnicalFaqModal: React.FC<TechnicalFaqModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeCategory, setActiveCategory] = useState<'all' | 'architecture' | 'clinical' | 'deployment'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string>('faq-1');

  const faqs: FaqItem[] = [
    {
      id: 'faq-1',
      category: 'architecture',
      question: '1. Why late fusion instead of early (feature-level) fusion for multimodal DR triage?',
      shortAnswer:
        'Late rule-based fusion preserves unimodal interpretability, handles missing modalities gracefully, and allows deterministic clinical safety guardrails.',
      inDepthAnswer: [
        'In clinical medicine, early joint embeddings (concatenating CNN feature vectors before classification) create an opaque "black-box" where it is impossible to determine whether an escalation was triggered by fundus microvascular lesions or a lab metadata artifact.',
        'By contrast, late fusion keeps each specialized unimodal model independent (EfficientNet-B4 for Fundus, ResNet-50 for OCT B-scans, XGBoost for Clinical Metadata). This provides three immense operational benefits:',
        '1. Missing Modalities: Primary health centers rarely possess OCT scanners. With late fusion, if OCT is absent, the system dynamically recalculates normalized weights without catastrophic model failure.',
        '2. Modality Attribution: Clinicians can inspect the exact contribution of each stream (e.g., Fundus 55%, Metadata 30%, OCT 15%).',
        '3. Deterministic Clinical Guardrails: Clinically mandated override rules (such as DME forcing minimum Grade 2) can be enforced without fear of neural network hallucination.',
      ],
      keyTakeaway:
        'Late fusion guarantees full auditability, transparent attribution, and graceful degradation when expensive scans (like OCT) are unavailable.',
    },
    {
      id: 'faq-2',
      category: 'architecture',
      question: '2. How does the system handle missing OCT scans in rural and community settings?',
      shortAnswer:
        'RetinaGuard applies dynamic weight redistribution, reallocating the 15% OCT weight across fundus and metadata streams.',
      inDepthAnswer: [
        'OCT machines cost $40,000–$90,000 USD, making them virtually nonexistent in rural community screening camps and mobile vans. Requiring OCT as a hard input would cripple global health utility.',
        'When OCT is marked absent, RetinaGuard shifts from its 3-way distribution (Fundus 55%, Metadata 30%, OCT 15%) to an adjusted 2-way distribution (Fundus 65%, Metadata 35%).',
        'If metadata is also absent (such as an anonymous rapid walk-in with no recent blood tests), the system operates in pure optical fundus mode (Fundus 100%) with an explicit caveat on missing systemic context.',
      ],
      keyTakeaway:
        'Fundus photography remains the compulsory screening backbone; OCT is treated as an optional booster for macular fluid confirmation.',
    },
    {
      id: 'faq-3',
      category: 'clinical',
      question: '3. Why does Diabetic Macular Edema (DME) trigger an override to at least Grade 2 (Moderate DR)?',
      shortAnswer:
        'Macular fluid directly threatens 20/20 central visual acuity, requiring urgent ophthalmological evaluation regardless of peripheral vessel appearance.',
      inDepthAnswer: [
        'Diabetic Macular Edema can manifest even in eyes with minimal apparent non-proliferative changes on 2D color fundus photographs (e.g. Grade 1 Mild NPDR with isolated microaneurysms).',
        'However, if cross-sectional OCT reveals intraretinal cystoid spaces or subretinal fluid involving or threatening the foveal avascular zone (FAZ), the patient is at imminent risk of severe central vision loss.',
        'International clinical guidelines (ETDRS, ICO, and AIOS) mandate that clinically significant macular edema warrants specialized evaluation and potentially anti-VEGF injection therapy or focal laser photocoagulation.',
        'Therefore, the fusion rule deterministically enforces: max(Fundus_Grade, 2) whenever DME is confirmed by OCT.',
      ],
      keyTakeaway:
        'Foveal fluid is sight-threatening. Machine learning models must never downgrade an eye with active DME to routine annual follow-up.',
    },
    {
      id: 'faq-4',
      category: 'architecture',
      question: '4. How does Grad-CAM compute saliency on the EfficientNet-B4 fundus backbone?',
      shortAnswer:
        'Grad-CAM calculates the gradient of the predicted DR class score with respect to the final convolutional feature maps, followed by ReLU pooling.',
      inDepthAnswer: [
        'Let y^c be the unnormalized class score (logit) for diabetic retinopathy grade c (e.g., Grade 3 Severe NPDR), and let A^k be the k-th feature map of the final convolutional layer in EfficientNet-B4.',
        'The neuron importance weight α_k^c is computed via global average pooling of the gradients: α_k^c = (1/Z) ∑_i ∑_j (∂y^c / ∂A_{i,j}^k).',
        'The Grad-CAM heat localization map L_{Grad-CAM}^c is obtained by computing the rectified linear combination: ReLU( ∑_k α_k^c A^k ).',
        'The ReLU ensures the heatmap highlights only visual patterns that positively contribute to the target class grade, suppressing features that favor rival classes.',
      ],
      keyTakeaway:
        'Grad-CAM highlights spatial activations in the deep convolutional layers, giving clinicians an intuitive window into where the network focused.',
    },
    {
      id: 'faq-5',
      category: 'clinical',
      question: '5. What is the fundamental difference between model attention and clinical lesion detection?',
      shortAnswer:
        'Heatmap warmth indicates statistical correlation and neural activation, NOT biological proof of a microaneurysm or hemorrhage.',
      inDepthAnswer: [
        'A common misconception among non-specialists is treating a red Grad-CAM hotspot as an automated biomarker bounding box.',
        'Convolutional attention reflects features that influenced the classifier weights—this can include valid pathology (exudates, cotton wool spots), but can also be influenced by vessel curvature, optic disc contrast, or lens artifacts.',
        'RetinaGuard explicitly trains healthcare workers to treat Grad-CAM as "exploratory attention" rather than diagnostic verification.',
      ],
      keyTakeaway:
        'Explainability maps guide the ophthalmologist\'s eye to high-entropy regions, but cannot replace verified clinical biomicroscopy.',
    },
    {
      id: 'faq-6',
      category: 'architecture',
      question: '6. How does the surrogate XGBoost model compute SHAP contributions for clinical metadata?',
      shortAnswer:
        'TreeSHAP computes the marginal contribution of each clinical feature (HbA1c, BP, duration) across all feature subsets using cooperative game theory.',
      inDepthAnswer: [
        'Relying solely on optical pixels ignores critical systemic biology. Two patients with identical fundus photos have radically different 12-month progression trajectories if Patient A has HbA1c 6.2% while Patient B has HbA1c 11.4% with nephropathy.',
        'The metadata model uses gradient boosted decision trees trained on systemic metrics. TreeSHAP assigns each feature an additive attribution value ϕ_i that sums to the difference between expected baseline risk E[f(x)] and actual patient risk f(x).',
        'In the UI, clinicians can see: "HbA1c (+0.42 risk)", "Diabetes Duration 14 yrs (+0.31 risk)", "Systolic BP 152 mmHg (+0.18 risk)".',
      ],
      keyTakeaway:
        'SHAP values transform black-box tree predictions into intuitive positive and negative risk bars aligned with medical intuition.',
    },
    {
      id: 'faq-7',
      category: 'clinical',
      question: '7. How do you prevent demographic, ethnic, and camera sensor bias in retinal AI?',
      shortAnswer:
        'Through multi-centric training sets, CLAHE image standardization, and rigorous sub-group parity audits.',
      inDepthAnswer: [
        'Retinal pigmentation varies significantly across ethnicities (e.g., darkly pigmented fundi in South Asian and African populations vs blond fundi in Caucasian populations). An algorithm trained solely on EyePACS (US/Latin America) degrades when applied to Indian rural cohorts.',
        'RetinaGuard utilizes: 1) Contrast Limited Adaptive Histogram Equalization (CLAHE) to normalize dynamic range across different optical sensors (Topcon, Zeiss, Forus 3nethra).',
        '2) Sub-group performance auditing: Tracking sensitivity and specificity across age brackets (>65 vs <45) and skin pigmentation categories.',
        '3) Image quality rejection gates: Blurry or poorly illuminated images are flagged as UNGRADABLE before inference, preventing low-confidence erroneous classifications.',
      ],
      keyTakeaway:
        'Ethical medical AI demands validation on the exact target demographic and camera hardware deployed in the field.',
    },
    {
      id: 'faq-8',
      category: 'clinical',
      question: '8. What are the regulatory and ethical boundaries of "clinical decision support" vs "autonomous diagnosis"?',
      shortAnswer:
        'RetinaGuard is strictly decision support for triage prioritization; it neither issues definitive diagnoses nor initiates therapy without a physician.',
      inDepthAnswer: [
        'Under US FDA (21 CFR 860) and Indian CDSCO medical device classifications, AI systems that issue autonomous diagnostic declarations without human oversight carry higher risk classification (Class III / high-risk SaMD).',
        'RetinaGuard operates within the SaMD Class II Clinical Decision Support (CDS) framework: It triages, flags urgency, ranks referral queues, and provides explainability maps to empower community workers and ophthalmologists.',
        'The user interface constantly emphasizes clinical humility: "No automated tool replaces a slit-lamp exam by an ophthalmologist."',
      ],
      keyTakeaway:
        'RetinaGuard does not replace the ophthalmologist. It helps more people reach the ophthalmologist at the right time.',
    },
    {
      id: 'faq-9',
      category: 'deployment',
      question: '9. How does closed-loop referral tracking mitigate screening program failure?',
      shortAnswer:
        'Screening without referral adherence saves zero vision. RetinaGuard tracks patients from village camp to verified clinic exam.',
      inDepthAnswer: [
        'Public health literature documents a tragic phenomenon: up to 60% of patients flagged during rural eye camps never attend their hospital follow-up due to lack of transport, fear, or communication breakdown.',
        'RetinaGuard incorporates closed-loop referral management: Every flagged screening generates a trackable referral token with urgency timeline (<48h for Grade 4, 1–2 weeks for Grade 3).',
        'Community health workers (ASHAs) and clinic coordinators update the status: Pending → Scheduled → Attended → Laser / Anti-VEGF / Follow-up Completed.',
      ],
      keyTakeaway:
        'A screening program only succeeds when the patient actually sits in the ophthalmologist\'s examination chair.',
    },
    {
      id: 'faq-10',
      category: 'deployment',
      question: '10. How is latency and memory constrained for edge deployment (offline tablets & mobile vans)?',
      shortAnswer:
        'EfficientNet-B4 quantized to INT8 with ONNX Runtime executes inference in under 180ms on standard mobile silicon.',
      inDepthAnswer: [
        'Rural screening camps frequently lack reliable 4G/5G mobile connectivity. Sending 25MB RAW TIFF images to cloud GPUs is infeasible.',
        'The fundus model backbone is optimized using Post-Training Quantization (PTQ) from FP32 to INT8, reducing weights footprint from 78MB to 19.5MB with <0.3% loss in quadratic weighted kappa (QWK).',
        'Local browser/tablet inference via WebAssembly/ONNX Runtime enables zero-network screening, caching records in IndexedDB until internet connectivity is restored.',
      ],
      keyTakeaway:
        'Real-world global health AI must function flawlessly on an offline battery-powered tablet under a tent.',
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCat = activeCategory === 'all' || faq.category === activeCategory;
    const matchesQuery =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.shortAnswer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.keyTakeaway.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-[#EFE4DC] shadow-xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#EFE4DC] flex items-center justify-between bg-gradient-to-r from-[#FFF7ED]/80 to-[#FDF2F8]/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#EA580C] to-[#DB2777] flex items-center justify-center text-white">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#2E2628]">
                Technical & Engineering Architecture FAQ
              </h3>
              <p className="text-xs text-[#6E5C5F]">
                10 In-Depth Questions on Multimodal Triage, Grad-CAM Saliency, and Deployment Safety
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6E5C5F] hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="p-4 bg-[#FAF8F6] border-b border-[#EFE4DC] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeCategory === 'all'
                  ? 'bg-gradient-to-r from-[#EA580C] to-[#DB2777] text-white shadow-xs'
                  : 'bg-white border border-[#EFE4DC] text-[#6E5C5F] hover:text-[#2E2628]'
              }`}
            >
              All Topics (10)
            </button>
            <button
              onClick={() => setActiveCategory('architecture')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeCategory === 'architecture'
                  ? 'bg-gradient-to-r from-[#EA580C] to-[#DB2777] text-white shadow-xs'
                  : 'bg-white border border-[#EFE4DC] text-[#6E5C5F] hover:text-[#2E2628]'
              }`}
            >
              Architecture & Fusion
            </button>
            <button
              onClick={() => setActiveCategory('clinical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeCategory === 'clinical'
                  ? 'bg-gradient-to-r from-[#EA580C] to-[#DB2777] text-white shadow-xs'
                  : 'bg-white border border-[#EFE4DC] text-[#6E5C5F] hover:text-[#2E2628]'
              }`}
            >
              Clinical & Saliency
            </button>
            <button
              onClick={() => setActiveCategory('deployment')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeCategory === 'deployment'
                  ? 'bg-gradient-to-r from-[#EA580C] to-[#DB2777] text-white shadow-xs'
                  : 'bg-white border border-[#EFE4DC] text-[#6E5C5F] hover:text-[#2E2628]'
              }`}
            >
              Public Health & Edge
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#6E5C5F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search architecture concepts..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#EFE4DC] bg-white text-xs text-[#2E2628] focus:outline-none focus:border-[#EA580C]"
            />
          </div>
        </div>

        {/* Scrollable FAQ Accordion */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;

            return (
              <div
                key={faq.id}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isExpanded ? 'border-[#EA580C] shadow-xs bg-white' : 'border-[#EFE4DC] bg-[#FFFDFB] hover:border-[#FED7AA]'
                }`}
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer select-none flex items-start justify-between gap-3"
                  onClick={() => setExpandedId(isExpanded ? '' : faq.id)}
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#FAF8F6] text-[#C2410C] border border-[#EFE4DC] mb-1.5 inline-block">
                      {faq.category}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-[#2E2628]">
                      {faq.question}
                    </h4>
                    <p className="text-xs text-[#6E5C5F] mt-1 font-medium">
                      {faq.shortAnswer}
                    </p>
                  </div>

                  <span className="text-xs font-bold text-[#EA580C] shrink-0 mt-1">
                    {isExpanded ? '− Hide' : '+ Details'}
                  </span>
                </div>

                {/* Expanded Answer */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-[#FAF8F6] text-xs space-y-2.5 animate-in fade-in duration-150">
                    {faq.inDepthAnswer.map((para, i) => (
                      <p key={i} className="text-[#2E2628] leading-relaxed">
                        {para}
                      </p>
                    ))}

                    <div className="mt-3 p-3 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] text-[11px] text-[#C2410C] leading-relaxed">
                      <strong>Key Architectural Principle:</strong> {faq.keyTakeaway}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#EFE4DC] bg-[#FAF8F6] flex items-center justify-between text-xs text-[#6E5C5F] shrink-0">
          <span>Prepared for technical evaluators, clinicians, and ML system architects</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-[#EFE4DC] text-[#2E2628] font-semibold hover:bg-[#FAF8F6]"
          >
            Close Architecture FAQ
          </button>
        </div>
      </div>
    </div>
  );
};
