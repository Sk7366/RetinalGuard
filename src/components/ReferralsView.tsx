import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Shield,
  Sparkles,
  Stethoscope,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import { createDefaultAuditTrail, MOCK_REFERRAL_QUEUE } from '../mock/mockData';
import {
  DRGrade,
  MultimodalTriageResult,
  ReferralAuditEvent,
  ReferralRecord,
  ReferralStage,
  ReferralStatus,
} from '../types';
import { RiskChip } from './RiskChip';

interface ReferralsViewProps {
  history: MultimodalTriageResult[];
  onSelectResult?: (result: MultimodalTriageResult) => void;
  onNavigateStartScreening?: () => void;
}

const REFERRAL_STATUS_LIST: ReferralStatus[] = [
  'Pending',
  'Contacted',
  'Appointment Booked',
  'Specialist Reviewed',
  'Follow-up Due',
  'Completed',
];

const LIFECYCLE_STAGES: { stage: ReferralStage; label: string; description: string }[] = [
  {
    stage: 'Screened',
    label: '1. Screened',
    description: 'Fundus & OCT acquired at intake station',
  },
  {
    stage: 'Flagged',
    label: '2. Flagged',
    description: 'Multimodal AI grading & Grad-CAM attribution',
  },
  {
    stage: 'Referred',
    label: '3. Referred',
    description: 'Referral package dispatched to eye center',
  },
  {
    stage: 'Appointment',
    label: '4. Appointment',
    description: 'Consultation slot booked & confirmed',
  },
  {
    stage: 'Specialist Review',
    label: '5. Specialist Review',
    description: 'In-clinic biomicroscopy & treatment plan',
  },
  {
    stage: 'Follow-up',
    label: '6. Follow-up',
    description: 'Monitoring interval & closed-loop adherence',
  },
];

const SIMULATED_CLINICS = [
  'Victoria Hospital Retina Clinic (Simulated)',
  'Nethralaya Tertiary Vitreoretinal Center (Simulated)',
  'District Hospital Ophthalmology Unit (Simulated)',
  'Kengeri Community Eye Center (Simulated)',
  'Urban Primary Care Eye Unit (Simulated)',
];

export const ReferralsView: React.FC<ReferralsViewProps> = ({
  history,
  onSelectResult,
  onNavigateStartScreening,
}) => {
  const [referrals, setReferrals] = useState<ReferralRecord[]>(() => {
    const saved = localStorage.getItem('retinaguard_referral_queue_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved referrals', e);
      }
    }
    return MOCK_REFERRAL_QUEUE;
  });

  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReferral, setSelectedReferral] = useState<ReferralRecord | null>(referrals[0] || null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteActor, setNewNoteActor] = useState('Dr. Sarah Chen, MD');

  // New Referral Form state
  const [newPatientSource, setNewPatientSource] = useState<'existing' | 'manual'>('existing');
  const [selectedScreeningId, setSelectedScreeningId] = useState(history[0]?.sessionId || '');
  const [manualPatientCode, setManualPatientCode] = useState(`PT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [manualPatientName, setManualPatientName] = useState('');
  const [manualPatientAge, setManualPatientAge] = useState(58);
  const [manualPatientPhone, setManualPatientPhone] = useState('+91 98450 XXXXX');
  const [newGrade, setNewGrade] = useState<DRGrade>(3);
  const [newDme, setNewDme] = useState(true);
  const [newPriority, setNewPriority] = useState<ReferralRecord['priority']>('Priority Specialist Referral');
  const [newAssignedClinic, setNewAssignedClinic] = useState(SIMULATED_CLINICS[0]);
  const [newSpecialist, setNewSpecialist] = useState('Dr. Anand Raman, Vitreoretinal Consultant');
  const [newTimeline, setNewTimeline] = useState('Within 72–96 hours');
  const [newNotes, setNewNotes] = useState('Severe non-proliferative changes with macular edema. Fast-track evaluation indicated.');

  // Save to localStorage helper
  const saveReferrals = (updated: ReferralRecord[]) => {
    setReferrals(updated);
    try {
      localStorage.setItem('retinaguard_referral_queue_v2', JSON.stringify(updated));
    } catch (e) {
      console.warn('Unable to persist referrals to localStorage', e);
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status: ReferralStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]';
      case 'Contacted':
        return 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]';
      case 'Appointment Booked':
        return 'bg-[#FAF5FF] text-[#7E22CE] border-[#E9D5FF]';
      case 'Specialist Reviewed':
        return 'bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]';
      case 'Follow-up Due':
        return 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]';
      case 'Completed':
        return 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]';
      default:
        return 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]';
    }
  };

  // Calculate current stage index for the progression bar
  const getStageIndex = (stage?: ReferralStage) => {
    switch (stage) {
      case 'Screened':
        return 0;
      case 'Flagged':
        return 1;
      case 'Referred':
        return 2;
      case 'Appointment':
        return 3;
      case 'Specialist Review':
        return 4;
      case 'Follow-up':
        return 5;
      default:
        return 2;
    }
  };

  // Status filter counts
  const statusCounts = REFERRAL_STATUS_LIST.reduce(
    (acc, st) => {
      acc[st] = referrals.filter((r) => r.status === st).length;
      return acc;
    },
    {} as Record<ReferralStatus, number>
  );

  // Filtered referrals list
  const filteredReferrals = referrals.filter((r) => {
    const matchesStatus = selectedStatusFilter === 'All' || r.status === selectedStatusFilter;
    const matchesSearch =
      r.patientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.patientName && r.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.assignedClinic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.clinicalNotes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Handle status update and log into audit trail
  const handleUpdateStatus = (referralId: string, newStatus: ReferralStatus) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    let targetStage: ReferralStage = 'Referred';
    let auditTitle = `Status updated to ${newStatus}`;
    let auditDetails = `Care coordination status adjusted to ${newStatus}.`;

    if (newStatus === 'Contacted') {
      targetStage = 'Referred';
      auditTitle = 'Patient contacted';
      auditDetails = 'Outreach team established contact with patient; shared screening report and urgency instructions.';
    } else if (newStatus === 'Appointment Booked') {
      targetStage = 'Appointment';
      auditTitle = 'Appointment booked';
      auditDetails = `Simulated consultation confirmed with specialist at ${selectedReferral?.assignedClinic || 'assigned center'}.`;
    } else if (newStatus === 'Specialist Reviewed') {
      targetStage = 'Specialist Review';
      auditTitle = 'Specialist review completed';
      auditDetails = 'Vitreoretinal specialist examined optical findings and formulated clinical management plan.';
    } else if (newStatus === 'Follow-up Due') {
      targetStage = 'Follow-up';
      auditTitle = 'Follow-up interval scheduled';
      auditDetails = 'Interval follow-up protocol registered in tracking queue.';
    } else if (newStatus === 'Completed') {
      targetStage = 'Follow-up';
      auditTitle = 'Referral cycle completed & closed';
      auditDetails = 'Closed-loop referral objectives satisfied. Clinical findings archived to registry.';
    }

    const updated = referrals.map((r) => {
      if (r.id === referralId) {
        const newAuditEvent: ReferralAuditEvent = {
          id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          stage: targetStage,
          title: auditTitle,
          timestamp,
          actor: 'Dr. Sarah Chen, MD (Coordinator)',
          details: auditDetails,
          status: 'completed',
        };

        const updatedTrail = r.auditTrail ? [...r.auditTrail, newAuditEvent] : [newAuditEvent];

        return {
          ...r,
          status: newStatus,
          currentStage: targetStage,
          updatedAt: timestamp,
          auditTrail: updatedTrail,
        };
      }
      return r;
    });

    saveReferrals(updated);
    if (selectedReferral && selectedReferral.id === referralId) {
      setSelectedReferral(updated.find((r) => r.id === referralId) || null);
    }
  };

  // Handle adding a manual note to the audit trail
  const handleAddAuditNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReferral || !newNoteText.trim()) return;

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newAuditEvent: ReferralAuditEvent = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      stage: selectedReferral.currentStage || 'Referred',
      title: 'Clinical Audit Note',
      timestamp,
      actor: newNoteActor.trim() || 'Provider Note',
      details: newNoteText.trim(),
      status: 'completed',
    };

    const updated = referrals.map((r) => {
      if (r.id === selectedReferral.id) {
        const updatedTrail = r.auditTrail ? [...r.auditTrail, newAuditEvent] : [newAuditEvent];
        return {
          ...r,
          updatedAt: timestamp,
          auditTrail: updatedTrail,
        };
      }
      return r;
    });

    saveReferrals(updated);
    setSelectedReferral(updated.find((r) => r.id === selectedReferral.id) || null);
    setNewNoteText('');
    setIsAddNoteModalOpen(false);
  };

  // Handle creating a new referral
  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();

    let pCode = manualPatientCode.trim() || `PT-${Math.floor(1000 + Math.random() * 9000)}`;
    let pName = manualPatientName.trim() || 'Simulated Patient';
    let pAge = manualPatientAge;
    let sId = `SCR-${Date.now().toString().slice(-6)}`;

    if (newPatientSource === 'existing') {
      const existing = history.find((h) => h.sessionId === selectedScreeningId);
      if (existing) {
        pCode = existing.patientId || pCode;
        pName = existing.patientName || pName;
        pAge = existing.clinicalInput?.age || pAge;
        sId = existing.sessionId;
      }
    }

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newId = `REF-2026-${String(referrals.length + 87).padStart(3, '0')}`;

    // Generate initial 6-step audit trail
    const initialAuditTrail = createDefaultAuditTrail(pCode, sId, newGrade, newDme, 'Dr. Sarah Chen, MD');

    const newRecord: ReferralRecord = {
      id: newId,
      screeningId: sId,
      patientCode: pCode,
      patientName: pName,
      patientAge: pAge,
      patientPhone: manualPatientPhone,
      createdAt: timestamp,
      updatedAt: timestamp,
      initialGrade: newGrade,
      priority: newPriority,
      status: 'Pending',
      currentStage: 'Referred',
      dmePresent: newDme,
      assignedClinic: newAssignedClinic,
      specialistName: newSpecialist,
      clinicalNotes: newNotes,
      followUpTimeline: newTimeline,
      isSimulated: true,
      auditTrail: initialAuditTrail,
    };

    const updated = [newRecord, ...referrals];
    saveReferrals(updated);
    setSelectedReferral(newRecord);
    setIsCreateModalOpen(false);

    // Reset fields
    setManualPatientCode(`PT-${Math.floor(1000 + Math.random() * 9000)}`);
    setManualPatientName('');
    setNewNotes('Non-proliferative diabetic changes identified during tele-screening. Dilated evaluation requested.');
  };

  // Export CSV summary
  const handleExportCsv = () => {
    const headers = [
      'Referral ID',
      'Patient Code',
      'Patient Name',
      'Status',
      'Stage',
      'Priority',
      'Initial DR Grade',
      'DME Present',
      'Assigned Clinic',
      'Specialist',
      'Created At',
      'Updated At',
      'Audit Events Count',
    ];

    const rows = referrals.map((r) => [
      r.id,
      r.patientCode,
      r.patientName || '',
      r.status,
      r.currentStage || 'Referred',
      r.priority,
      r.initialGrade,
      r.dmePresent ? 'YES' : 'NO',
      `"${r.assignedClinic}"`,
      `"${r.specialistName || 'Unassigned'}"`,
      r.createdAt,
      r.updatedAt,
      r.auditTrail?.length || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RetinaGuard_Referral_Audit_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 sm:px-6">
      {/* DISCLAIMER BANNER */}
      <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-xl p-4 text-xs text-[#9A3412] flex items-start gap-3 shadow-xs">
        <Shield className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[11px]">
            <span>Simulated Referral Protocol · Demonstration Environment</span>
            <span className="bg-[#FFEDD5] text-[#C2410C] px-2 py-0.5 rounded text-[10px] font-mono border border-[#FED7AA]">
              MOCK CARE PIPELINE
            </span>
          </div>
          <p className="text-[#9A3412] leading-relaxed">
            This module models closed-loop clinical referral pathways, specialist triage escalations, and automated immutable audit logging for tele-ophthalmology screening camps. <strong>Do not imply integration with real hospitals, live EHRs, or active clinical appointment portals.</strong>
          </p>
        </div>
      </div>

      {/* HEADER */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDF2F8] text-[#DB2777] border border-[#FBCFE8] mb-2">
            <Send className="w-3.5 h-3.5" />
            <span>Closed-Loop Care Coordination & Audit Trail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight flex items-center gap-3">
            <span>Specialist Referral Registry</span>
            <span className="text-xs font-mono font-normal bg-[#FAF8F6] text-[#6E5C5F] px-2.5 py-1 rounded-md border border-[#EFE4DC]">
              /referrals
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5C5F] mt-1">
            Track patients through the 6-stage continuum: Screened → Flagged → Referred → Appointment → Specialist Review → Follow-up.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-[#EA580C] to-[#DB2777] hover:from-[#C2410C] hover:to-[#BE185D] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Referral</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="bg-white hover:bg-[#FAF8F6] text-[#2E2628] text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#6E5C5F]" />
            <span>Export CSV</span>
          </button>

          {onNavigateStartScreening && (
            <button
              onClick={onNavigateStartScreening}
              className="bg-[#FAF8F6] hover:bg-[#F5EBE1] text-[#6E5C5F] text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#EFE4DC] transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Start Screening</span>
            </button>
          )}
        </div>
      </div>

      {/* STATUS TABS STRIP */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-2 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedStatusFilter('All')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              selectedStatusFilter === 'All'
                ? 'bg-[#2E2628] text-white shadow-xs'
                : 'text-[#6E5C5F] hover:bg-[#FAF8F6] hover:text-[#2E2628]'
            }`}
          >
            <span>All Referrals</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              selectedStatusFilter === 'All' ? 'bg-white/20 text-white' : 'bg-[#EFE4DC] text-[#2E2628]'
            }`}>
              {referrals.length}
            </span>
          </button>

          {REFERRAL_STATUS_LIST.map((st) => {
            const isSelected = selectedStatusFilter === st;
            const count = statusCounts[st] || 0;
            return (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] shadow-xs'
                    : 'text-[#6E5C5F] hover:bg-[#FAF8F6] hover:text-[#2E2628]'
                }`}
              >
                <span>{st}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  isSelected ? 'bg-[#FED7AA] text-[#9A3412]' : 'bg-[#FAF8F6] border border-[#EFE4DC] text-[#6E5C5F]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKFLOW LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: FILTERABLE REFERRALS LIST (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* SEARCH BAR */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#9C8E91] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Patient Code, Name, Clinic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EFE4DC] rounded-xl text-xs sm:text-sm text-[#2E2628] focus:outline-hidden focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9C8E91] hover:text-[#2E2628]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* LIST */}
          <div className="space-y-3">
            {filteredReferrals.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-[#EFE4DC] p-8 text-center space-y-3">
                <Send className="w-8 h-8 text-[#9C8E91] mx-auto opacity-50" />
                <div className="text-xs font-bold text-[#2E2628]">No matching referrals</div>
                <p className="text-[11px] text-[#6E5C5F]">
                  Try changing your status filter or clearing your search term.
                </p>
                <button
                  onClick={() => {
                    setSelectedStatusFilter('All');
                    setSearchQuery('');
                  }}
                  className="text-xs text-[#EA580C] font-semibold hover:underline"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredReferrals.map((item) => {
                const isSelected = selectedReferral?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedReferral(item)}
                    className={`bg-white rounded-2xl border p-4 transition-all cursor-pointer text-left space-y-3 ${
                      isSelected
                        ? 'border-[#EA580C] ring-2 ring-[#EA580C]/10 shadow-sm bg-[#FFFDFB]'
                        : 'border-[#EFE4DC] hover:border-[#FED7AA] hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#2E2628]">{item.patientCode}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                        {item.patientName && (
                          <div className="text-xs text-[#6E5C5F] mt-0.5 font-medium">
                            {item.patientName} · {item.patientAge}y
                          </div>
                        )}
                      </div>

                      <RiskChip grade={item.initialGrade} size="sm" />
                    </div>

                    <div className="text-xs text-[#6E5C5F] line-clamp-2 leading-relaxed">
                      {item.clinicalNotes}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#FAF8F6] text-[#9C8E91]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#EA580C]" />
                        <span className="truncate max-w-[180px]">{item.assignedClinic.replace(' (Simulated)', '')}</span>
                      </span>
                      <span className="font-mono text-[10px]">{item.updatedAt}</span>
                    </div>

                    {/* MINI PROGRESS TRACKER */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-[10px] text-[#9C8E91] mb-1 font-semibold uppercase tracking-wider">
                        <span>Current Stage</span>
                        <span className="text-[#EA580C] font-bold">{item.currentStage || 'Referred'}</span>
                      </div>
                      <div className="grid grid-cols-6 gap-1 h-1.5 bg-[#FAF8F6] rounded-full overflow-hidden p-0.5 border border-[#EFE4DC]">
                        {LIFECYCLE_STAGES.map((s, idx) => {
                          const currentIdx = getStageIndex(item.currentStage);
                          const isDone = idx <= currentIdx;
                          return (
                            <div
                              key={s.stage}
                              className={`rounded-full transition-all ${
                                isDone ? 'bg-[#EA580C]' : 'bg-[#EFE4DC]'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SELECTED REFERRAL DETAIL & AUDIT TRAIL (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedReferral ? (
            <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 shadow-xs space-y-6">
              {/* DETAIL HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE4DC]">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-mono font-bold bg-[#FAF8F6] px-2.5 py-1 rounded-md text-[#2E2628] border border-[#EFE4DC]">
                      {selectedReferral.id}
                    </span>
                    <span className="text-lg font-serif font-bold text-[#2E2628]">
                      {selectedReferral.patientCode}
                    </span>
                    {selectedReferral.patientName && (
                      <span className="text-sm text-[#6E5C5F]">({selectedReferral.patientName})</span>
                    )}
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(selectedReferral.status)}`}>
                      {selectedReferral.status}
                    </span>
                  </div>
                  <div className="text-xs text-[#6E5C5F] mt-1.5 flex items-center gap-3">
                    <span>Age: <strong>{selectedReferral.patientAge} years</strong></span>
                    <span>•</span>
                    <span>DME: <strong>{selectedReferral.dmePresent ? 'Positive (Active Cysts)' : 'Negative'}</strong></span>
                    <span>•</span>
                    <span>Timeline: <strong>{selectedReferral.followUpTimeline}</strong></span>
                  </div>
                </div>

                {/* STATUS QUICK CHANGER */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#6E5C5F] hidden sm:inline">Status:</span>
                  <select
                    value={selectedReferral.status}
                    onChange={(e) => handleUpdateStatus(selectedReferral.id, e.target.value as ReferralStatus)}
                    className="bg-white border border-[#EFE4DC] text-xs font-bold text-[#2E2628] rounded-xl px-3 py-2 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C]"
                  >
                    {REFERRAL_STATUS_LIST.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SECTION: VISUAL REFERRAL PROGRESSION (6-STEP WORKFLOW) */}
              <div className="space-y-3 bg-[#FAF8F6] p-4 sm:p-5 rounded-xl border border-[#EFE4DC]">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#2E2628] uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>Referral & Follow-Up Lifecycle Continuum</span>
                  </div>
                  <span className="text-[10px] text-[#6E5C5F]">Stage {getStageIndex(selectedReferral.currentStage) + 1} of 6</span>
                </div>

                {/* VISUAL 6-STEP DIAGRAM */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
                  {LIFECYCLE_STAGES.map((s, idx) => {
                    const activeIdx = getStageIndex(selectedReferral.currentStage);
                    const isPassed = idx < activeIdx;
                    const isCurrent = idx === activeIdx;
                    return (
                      <div
                        key={s.stage}
                        className={`p-2.5 rounded-xl border transition-all text-center space-y-1 relative ${
                          isCurrent
                            ? 'bg-white border-[#EA580C] shadow-xs ring-2 ring-[#EA580C]/10'
                            : isPassed
                            ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                            : 'bg-white/60 border-[#EFE4DC] text-[#9C8E91]'
                        }`}
                      >
                        <div className="flex items-center justify-center">
                          {isPassed ? (
                            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                          ) : isCurrent ? (
                            <span className="w-4 h-4 rounded-full bg-[#EA580C] text-white text-[10px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-[#EFE4DC] text-[#9C8E91] text-[10px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] font-bold ${
                          isCurrent ? 'text-[#EA580C]' : isPassed ? 'text-[#065F46]' : 'text-[#6E5C5F]'
                        }`}>
                          {s.stage}
                        </div>
                        <div className="text-[9px] text-[#9C8E91] leading-tight line-clamp-2">
                          {s.description}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CASE DETAILS SUMMARY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-[#EFE4DC] space-y-2">
                  <div className="text-[#9C8E91] font-semibold uppercase text-[10px] tracking-wider">
                    Destination Eye Center
                  </div>
                  <div className="font-bold text-[#2E2628] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>{selectedReferral.assignedClinic}</span>
                  </div>
                  <div className="text-[#6E5C5F] text-[11px] flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-[#DB2777]" />
                    <span>Specialist: {selectedReferral.specialistName || 'Pending Allocation'}</span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#EFE4DC] space-y-2">
                  <div className="text-[#9C8E91] font-semibold uppercase text-[10px] tracking-wider">
                    Appointment & Priority
                  </div>
                  <div className="font-bold text-[#2E2628] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>{selectedReferral.appointmentDate || 'Awaiting Appointment Slot'}</span>
                  </div>
                  <div className="text-[11px] font-medium text-[#C2410C]">
                    Priority Tier: {selectedReferral.priority}
                  </div>
                </div>
              </div>

              {/* CLINICAL INDICATION NOTES */}
              <div className="bg-[#FAF8F6] p-4 rounded-xl border border-[#EFE4DC] space-y-1.5">
                <div className="text-[10px] font-bold text-[#9C8E91] uppercase tracking-wider">
                  Primary Clinical Reason & Findings
                </div>
                <p className="text-xs text-[#2E2628] leading-relaxed">
                  {selectedReferral.clinicalNotes}
                </p>
              </div>

              {/* SECTION: AUDIT TRAIL */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#2E2628] uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#EA580C]" />
                      <span>Immutable Clinical Audit Trail</span>
                    </h3>
                    <p className="text-[11px] text-[#6E5C5F]">
                      Chronological log of intake, AI inference, physician review, and referral milestones.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddNoteModalOpen(true)}
                    className="text-xs font-semibold text-[#EA580C] hover:text-[#C2410C] bg-[#FFF7ED] hover:bg-[#FFEDD5] px-3 py-1.5 rounded-lg border border-[#FED7AA] transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Audit Note</span>
                  </button>
                </div>

                {/* TIMELINE LIST */}
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EFE4DC]">
                  {selectedReferral.auditTrail && selectedReferral.auditTrail.length > 0 ? (
                    selectedReferral.auditTrail.map((ev, idx) => (
                      <div key={ev.id || idx} className="relative group">
                        {/* Bullet */}
                        <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-white border-2 border-[#EA580C] ring-4 ring-white" />

                        <div className="bg-[#FAF8F6] hover:bg-white p-3.5 rounded-xl border border-[#EFE4DC] transition-colors space-y-1 shadow-2xs">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-bold text-xs text-[#2E2628]">
                              {ev.title}
                            </span>
                            <span className="font-mono text-[10px] text-[#9C8E91]">
                              {ev.timestamp}
                            </span>
                          </div>

                          <div className="text-[11px] text-[#EA580C] font-semibold">
                            Actor: {ev.actor}
                          </div>

                          <p className="text-xs text-[#6E5C5F] leading-relaxed pt-0.5">
                            {ev.details}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[#9C8E91] italic pl-2">
                      No audit events recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-[#EFE4DC] p-12 text-center space-y-3">
              <Eye className="w-8 h-8 text-[#9C8E91] mx-auto opacity-50" />
              <div className="text-sm font-bold text-[#2E2628]">No Referral Selected</div>
              <p className="text-xs text-[#6E5C5F] max-w-sm mx-auto">
                Select a referral from the list on the left to view the 6-stage continuum, verify clinical notes, and review the audit trail.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE REFERRAL MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#EFE4DC] max-w-xl w-full p-6 space-y-5 shadow-xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE4DC]">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2E2628]">Create Specialist Referral</h3>
                <p className="text-xs text-[#6E5C5F]">Initiate a closed-loop tele-ophthalmology referral package</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-[#9C8E91] hover:text-[#2E2628] hover:bg-[#FAF8F6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReferral} className="space-y-4">
              {/* SOURCE SELECTOR */}
              <div className="flex items-center gap-2 p-1 bg-[#FAF8F6] rounded-xl border border-[#EFE4DC]">
                <button
                  type="button"
                  onClick={() => setNewPatientSource('existing')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    newPatientSource === 'existing'
                      ? 'bg-white text-[#EA580C] shadow-xs'
                      : 'text-[#6E5C5F]'
                  }`}
                >
                  From Screened Cohort
                </button>
                <button
                  type="button"
                  onClick={() => setNewPatientSource('manual')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    newPatientSource === 'manual'
                      ? 'bg-white text-[#EA580C] shadow-xs'
                      : 'text-[#6E5C5F]'
                  }`}
                >
                  Manual Patient Entry
                </button>
              </div>

              {/* PATIENT SELECTION */}
              {newPatientSource === 'existing' ? (
                <div>
                  <label className="block text-xs font-bold text-[#2E2628] mb-1">
                    Select Screened Patient
                  </label>
                  <select
                    value={selectedScreeningId}
                    onChange={(e) => setSelectedScreeningId(e.target.value)}
                    className="w-full bg-white border border-[#EFE4DC] rounded-xl px-3 py-2 text-xs font-semibold text-[#2E2628]"
                  >
                    {history.map((h) => (
                      <option key={h.sessionId} value={h.sessionId}>
                        {h.patientId || h.patientName} — Grade {h.finalGrade} ({h.gradeLabel})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#2E2628] mb-1">Patient ID / Code</label>
                    <input
                      type="text"
                      value={manualPatientCode}
                      onChange={(e) => setManualPatientCode(e.target.value)}
                      className="w-full bg-white border border-[#EFE4DC] rounded-xl px-3 py-2 text-xs text-[#2E2628]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2E2628] mb-1">Patient Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh S."
                      value={manualPatientName}
                      onChange={(e) => setManualPatientName(e.target.value)}
                      className="w-full bg-white border border-[#EFE4DC] rounded-xl px-3 py-2 text-xs text-[#2E2628]"
                    />
                  </div>
                </div>
              )}

              {/* SEVERITY & DME */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2E2628] mb-1">Triaged DR Severity</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(Number(e.target.value) as DRGrade)}
                    className="w-full bg-white border border-[#EFE4DC] rounded-xl px-3 py-2 text-xs font-semibold text-[#2E2628]"
                  >
                    <option value={0}>Grade 0 - No Apparent DR</option>
                    <option value={1}>Grade 1 - Mild NPDR</option>
                    <option value={2}>Grade 2 - Moderate NPDR</option>
                    <option value={3}>Grade 3 - Severe NPDR</option>
                    <option value={4}>Grade 4 - Proliferative DR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2E2628] mb-1">Macular Edema (DME)</label>
                  <select
                    value={newDme ? 'yes' : 'no'}
                    onChange={(e) => setNewDme(e.target.value === 'yes')}
                    className="w-full bg-white border border-[#EFE4DC] rounded-xl px-3 py-2 text-xs font-semibold text-[#2E2628]"
                  >
                    <option value="no">DME Negative</option>
                    <option value="yes">DME Positive (Active Cysts)</option>
                  </select>
                </div>
              </div>

              {/* PRIORITY & TIMELINE */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2E2628] mb-1">Referral Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as ReferralRecord['priority'])}
                    className="w-full bg-white border border-[#EFE4DC] rounded-xl px-3 py-2 text-xs font-semibold text-[#2E2628]"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Review Recommended">Review Recommended</option>
                    <option value="Priority Specialist Referral">Priority Specialist Referral</option>
                    <option value="Ungradable Retake">Ungradable Retake</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2E2628] mb-1">Follow-up Urgency</label>
                  <select
                    value={newTimeline}
                    onChange={(e) => setNewTimeline(e.target.value)}
                    className="w-full bg-white border border-[#EFE4DC] rounded-xl px-3 py-2 text-xs font-semibold text-[#2E2628]"
                  >
                    <option value="Urgent (< 48 hours)">Urgent (&lt; 48 hours)</option>
                    <option value="Within 72–96 hours">Within 72–96 hours</option>
                    <option value="Within 1–2 weeks">Within 1–2 weeks</option>
                    <option value="Within 1 month">Within 1 month</option>
                    <option value="Annual (12 months)">Annual (12 months)</option>
                  </select>
                </div>
              </div>

              {/* DESTINATION FACILITY */}
              <div>
                <label className="block text-xs font-bold text-[#2E2628] mb-1">
                  Destination Eye Facility (Simulated)
                </label>
                <select
                  value={newAssignedClinic}
                  onChange={(e) => setNewAssignedClinic(e.target.value)}
                  className="w-full bg-white border border-[#EFE4DC] rounded-xl px-3 py-2 text-xs text-[#2E2628]"
                >
                  {SIMULATED_CLINICS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* CLINICAL INDICATION */}
              <div>
                <label className="block text-xs font-bold text-[#2E2628] mb-1">
                  Clinical Indication & Notes
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-white border border-[#EFE4DC] rounded-xl p-2.5 text-xs text-[#2E2628]"
                  placeholder="Summarize reasons for referral..."
                  required
                />
              </div>

              {/* SUBMIT BUTTON */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EFE4DC]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6E5C5F] hover:bg-[#FAF8F6] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#EA580C] to-[#DB2777] text-white px-5 py-2 rounded-xl text-xs font-bold hover:opacity-90 shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Referral Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD AUDIT NOTE MODAL */}
      {isAddNoteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#EFE4DC] max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFE4DC]">
              <h3 className="font-serif font-bold text-base text-[#2E2628]">Add Note to Audit Trail</h3>
              <button
                onClick={() => setIsAddNoteModalOpen(false)}
                className="p-1 rounded-lg text-[#9C8E91] hover:text-[#2E2628]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAuditNote} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#2E2628] mb-1">Author / Actor</label>
                <input
                  type="text"
                  value={newNoteActor}
                  onChange={(e) => setNewNoteActor(e.target.value)}
                  className="w-full bg-white border border-[#EFE4DC] rounded-xl px-3 py-2 text-xs text-[#2E2628]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2E2628] mb-1">Clinical / Coordinator Note</label>
                <textarea
                  rows={3}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full bg-white border border-[#EFE4DC] rounded-xl p-2.5 text-xs text-[#2E2628]"
                  placeholder="e.g. Spoke with patient; appointment scheduled for next Tuesday..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EFE4DC]">
                <button
                  type="button"
                  onClick={() => setIsAddNoteModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#6E5C5F] hover:bg-[#FAF8F6] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#EA580C] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-[#C2410C]"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
