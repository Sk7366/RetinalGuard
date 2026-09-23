import React, { useState } from 'react';
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { MultimodalTriageResult } from '../types';
import { useTranslation } from '../i18n/I18nContext';

interface ClinicalAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: MultimodalTriageResult;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const ClinicalAssistantModal: React.FC<ClinicalAssistantModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const { t } = useTranslation();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: t(
        'clinicalAssistantInitialMsg',
        `Hello. I am the RetinaGuard Clinical Decision Support Assistant. I can explain the AI model attributions, explain Grad-CAM heatmap regions, or clarify why Case ${result.patientId} was flagged as Grade ${result.finalGrade} (${result.gradeLabel}). How can I assist your review?`
      ),
      timestamp: t('justNowWord', 'Just now'),
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  if (!isOpen) return null;

  const suggestedQueries = [
    t('suggestedPromptMean', 'What does this screening result mean?'),
    t('suggestedPromptFlagged', 'Why was this case flagged by the models?'),
    t('suggestedPromptGradCam', 'What is Grad-CAM showing here?'),
    t('suggestedPromptDme', 'What does DME mean in this scan?'),
    t('suggestedPromptNextSteps', 'What are the recommended next steps?'),
  ];

  const handleSend = (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    setTimeout(() => {
      let reply = '';
      const lower = q.toLowerCase();

      // Guardrail against diagnostic / prescription queries
      if (
        lower.includes('prescribe') ||
        lower.includes('medicine') ||
        lower.includes('drug') ||
        lower.includes('dosage') ||
        lower.includes('diagnose me') ||
        lower.includes('cure')
      ) {
        reply = t(
          'assistantGuardrailPrescription',
          'RetinaGuard is a decision-support and screening platform, not a diagnostic or prescriptive medical device. It cannot provide clinical diagnoses, recommend medications, or alter medical treatment plans. Please consult a qualified ophthalmologist or physician for individualized clinical care.'
        );
      } else if (lower.includes('mean') || lower.includes('result')) {
        reply = t(
          'assistantMeanReply',
          `The preliminary assessment for Case ${result.patientId} is Grade ${result.finalGrade} (${result.gradeLabel}). The fundus model estimated a probability of ${(result.fundus.probabilities[result.finalGrade] * 100).toFixed(0)}% for this category based on detected lesions (${result.fundus.featuresDetected.join(', ')}). This indicates that the case warrants ${result.recommendation.toLowerCase()}.`
        );
      } else if (lower.includes('why') || lower.includes('flagged') || lower.includes('contribute')) {
        const dmePart = result.oct.dmeDetected
          ? t('dmeDetectedAssistantPart', 'OCT analysis detected intraretinal fluid / macular edema, triggering the clinical escalation rule.')
          : t('dmeNotDetectedAssistantPart', 'OCT showed no evident diabetic macular edema.');
        const shapPart = result.metadata.provided
          ? `${t('clinicalRiskFactorsWord', 'Clinical risk factors')} (HbA1c ${result.clinicalInput.hba1c}%, ${t('durationWord', 'duration')} ${result.clinicalInput.diabetesDurationYears} ${t('yearsWord', 'years')}) ${t('contributedWeightWord', 'contributed an additional risk weight of')} ${result.metadata.riskScore.toFixed(2)}.`
          : t('clinicalMetadataOmittedAssistantPart', 'Clinical metadata was omitted; screening relied on optical modalities.');
        reply = `${t('screeningPrioritizedPrefix', 'This screening was prioritized due to the following multimodal factors:')}\n1. ${t('fundusStreamLabelShort', 'Fundus')}: ${result.fundus.gradeLabel}.\n2. OCT: ${dmePart}\n3. ${t('clinicalContextLabel', 'Clinical Context:')} ${shapPart}\n${t('modelAgreementLabel', 'Model agreement is rated as')} ${result.confidence}.`;
      } else if (lower.includes('grad-cam') || lower.includes('cam') || lower.includes('heatmap') || lower.includes('look')) {
        reply = t(
          'gradCamAssistantReply',
          'Grad-CAM (Gradient-weighted Class Activation Mapping) visualizes the spatial gradients in the final convolutional layer of EfficientNet-B4. Warmer colors (red/orange) highlight areas where model neurons fired most strongly—in this image, focused around the temporal vascular arcade and macular exudate boundaries. Remember: model attention indicates mathematical saliency, not definitive clinical proof.'
        );
      } else if (lower.includes('dme') || lower.includes('edema')) {
        reply = t(
          'dmeExplanationAssistantReply',
          'DME stands for Diabetic Macular Edema, an accumulation of fluid within the central retina (macula). Because the macula is responsible for sharp central vision, DME is a major cause of vision loss and requires ophthalmology evaluation regardless of baseline non-proliferative grade.'
        );
      } else if (lower.includes('next') || lower.includes('step') || lower.includes('recommend')) {
        reply = `${t('recommendedPathwayPrefix', 'Recommended pathway for')} ${result.gradeLabel}:\n- ${t('urgencyLabel', 'Urgency')}: ${result.urgencyLevel.toUpperCase()}\n- ${t('pathwayLabel', 'Pathway')}: ${result.recommendation}\n- ${t('clinicalActionLabel', 'Clinical Action')}: ${t('completeStandardDilatedExam', 'Complete standard dilated slit-lamp examination by an ophthalmologist.')} ${result.oct.dmeDetected ? t('considerOctaOrAntiVegf', 'Consider optical coherence tomography angiography (OCTA) or anti-VEGF consultation.') : ''}`;
      } else {
        reply = `${t('regardingPrefix', 'Regarding')} "${q}": ${t('generalAssistantExplanation', 'RetinaGuard combines fundus photography, cross-sectional OCT, and clinical metadata through late rule-based fusion.')} ${t('theFinalGradeIs', 'The final grade')} (${result.gradeLabel}) ${t('intendedToHelpScreeningWorkers', 'is intended to help screening workers prioritize specialist review. All AI outputs must be validated by a clinician before patient management decisions are made.')}`;
      }

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsThinking(false);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#EFE4DC] shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#EFE4DC] flex items-center justify-between bg-gradient-to-r from-[#FFE5D8] to-[#FBE4EC] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F05A28] to-[#DB2777] flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif font-bold text-sm text-[#2B2024]">
                  {t('clinicalAssistantTitle', 'Clinical Decision Support Assistant')}
                </h3>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-white border border-[#EFE4DC] text-[#6F6267] font-semibold">
                  {t('controlledModelExplainerBadge', 'Controlled Model Explainer')}
                </span>
              </div>
              <p className="text-[11px] text-[#6F6267]">
                {t('groundedInOutputsForCase', `Grounded in structured model outputs for Case ${result.patientId}`)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6F6267] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Warning Banner */}
        <div className="bg-[#FFE5D8] px-4 py-2 border-b border-[#FED7AA] flex items-center gap-2 text-[11px] text-[#D84818] shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>
            {t('clinicalAssistantSafetyWarning', 'Decision support only. Assistant cannot prescribe or establish a clinical diagnosis.')}
          </span>
        </div>

        {/* Chat History */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${
                m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 ${
                  m.sender === 'user'
                    ? 'bg-[#2B2024]'
                    : 'bg-gradient-to-br from-[#F05A28] to-[#DB2777]'
                }`}
              >
                {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`p-3 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-line ${
                  m.sender === 'user'
                    ? 'bg-[#FFE5D8] text-[#2B2024] border border-[#FED7AA] rounded-tr-xs'
                    : 'bg-[#FAF8F6] text-[#2B2024] border border-[#EFE4DC] rounded-tl-xs'
                }`}
              >
                {m.text}
                <div className="text-[9px] text-[#9E8D91] mt-1 text-right">{m.timestamp}</div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 text-[#6F6267] text-xs p-2">
              <Bot className="w-4 h-4 text-[#F05A28] animate-pulse" />
              <span>{t('analyzingCaseParameters', 'Analyzing case parameters...')}</span>
            </div>
          )}
        </div>

        {/* Suggested Queries */}
        <div className="p-2.5 bg-[#FAF8F6] border-t border-[#EFE4DC] overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-[10px] font-bold text-[#6F6267] mr-1 uppercase">{t('quickPromptsLabel', 'Quick Prompts:')}</span>
            {suggestedQueries.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 rounded-full bg-white border border-[#EFE4DC] text-[11px] text-[#2B2024] hover:border-[#F05A28] hover:bg-[#FFE5D8] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[#EFE4DC] bg-white flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('askQuestionAssistantPlaceholder', 'Ask a question about this screening result...')}
            className="flex-1 px-3 py-2 rounded-xl border border-[#EFE4DC] text-xs text-[#2B2024] focus:outline-none focus:border-[#F05A28]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || isThinking}
            className="p-2 rounded-xl bg-gradient-to-r from-[#F05A28] to-[#DB2777] text-white disabled:opacity-40 hover:opacity-95 transition-opacity"
            aria-label={t('sendQueryAria', 'Send query')}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
