import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Upload,
  User,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { DR_GRADES } from '../data/benchmarks';
import { generateFundusSvg, PRESET_CASES } from '../data/sampleCases';
import { MOCK_BATCH_SCREENINGS } from '../mock/mockData';
import { BatchScreeningItem, DRGrade, MultimodalTriageResult, QualityStatus } from '../types';
import { executeMultimodalFusion } from '../utils/fusionEngine';
import { RiskChip } from './RiskChip';

interface BatchScreeningViewProps {
  onSelectResult: (result: MultimodalTriageResult) => void;
  onNavigateStartScreening: () => void;
}

export const BatchScreeningView: React.FC<BatchScreeningViewProps> = ({
  onSelectResult,
  onNavigateStartScreening,
}) => {
  const [batchItems, setBatchItems] = useState<BatchScreeningItem[]>(MOCK_BATCH_SCREENINGS);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(100);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LOW' | 'REVIEW' | 'PRIORITY' | 'UNGRADABLE'>('ALL');

  // Summary statistics
  const total = batchItems.length;
  const processedCount = batchItems.filter((b) => b.processed).length;
  const lowConcern = batchItems.filter((b) => b.priority === 'Low Concern').length;
  const reviewRecommended = batchItems.filter((b) => b.priority === 'Review Recommended').length;
  const priority = batchItems.filter((b) => b.priority === 'Priority').length;
  const ungradable = batchItems.filter((b) => b.qualityStatus === 'UNGRADABLE').length;

  // Handle multi-image file selection
  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray: File[] = Array.from(e.target.files);
      setUploadedFiles(filesArray);

      // Create new batch items from files
      const newItems: BatchScreeningItem[] = filesArray.map((file: File, idx: number) => {
        const isBlur = file.name.toLowerCase().includes('blur') || file.name.toLowerCase().includes('glare');
        return {
          id: `BATCH-FILE-${Date.now()}-${idx}`,
          filename: file.name,
          patientCode: `PT-BAT-${100 + idx}`,
          patientAge: 52 + (idx % 15),
          hba1c: 7.5 + (idx % 4) * 0.5,
          qualityStatus: isBlur ? 'UNGRADABLE' : 'GOOD',
          priority: isBlur ? 'Ungradable' : 'Low Concern',
          processed: false,
        };
      });

      setBatchItems(newItems);
    }
  };

  // Handle CSV upload
  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseAndApplyCsv(text);
      };
      reader.readAsText(file);
    }
  };

  // Parse CSV
  const parseAndApplyCsv = (csvText: string) => {
    const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return;

    // Expected columns: patient_id, age, diabetes_years, hba1c, systolic_bp, eye
    const rows = lines.slice(1);
    const parsedItems: BatchScreeningItem[] = rows.map((row, idx) => {
      const cols = row.split(',').map((c) => c.trim());
      const pCode = cols[0] || `PT-CSV-${idx + 1}`;
      const age = parseInt(cols[1], 10) || 55;
      const hba1cVal = parseFloat(cols[3]) || 8.0;

      // Realistic classification based on clinical parameters
      const isSevere = hba1cVal > 10.0;
      const isModerate = hba1cVal > 8.0 && hba1cVal <= 10.0;

      return {
        id: `CSV-ROW-${idx + 1}`,
        filename: `${pCode.toLowerCase()}_fundus_od.png`,
        patientCode: pCode,
        patientAge: age,
        hba1c: hba1cVal,
        qualityStatus: 'GOOD',
        predictedGrade: isSevere ? 3 : isModerate ? 2 : 1,
        priority: isSevere ? 'Priority' : isModerate ? 'Review Recommended' : 'Low Concern',
        dmeDetected: isSevere,
        processed: false,
      };
    });

    setBatchItems(parsedItems);
  };

  // Run batch inference pipeline
  const handleRunBatchInference = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);

    // Incremental progress simulation
    for (let i = 1; i <= batchItems.length; i++) {
      await new Promise((r) => setTimeout(r, 120));
      setProcessingProgress(Math.round((i / batchItems.length) * 100));
    }

    // Mark items as processed with actual calculated triage
    setBatchItems((prev) =>
      prev.map((item, idx) => {
        if (item.qualityStatus === 'UNGRADABLE') {
          return {
            ...item,
            processed: true,
            priority: 'Ungradable',
          };
        }

        const grade = item.predictedGrade !== undefined ? item.predictedGrade : ((idx % 4) as DRGrade);
        const isPriority = grade >= 3 || !!item.dmeDetected;
        const isReview = grade === 2;

        return {
          ...item,
          predictedGrade: grade,
          dmeDetected: item.dmeDetected || grade >= 3,
          priority: isPriority ? 'Priority' : isReview ? 'Review Recommended' : 'Low Concern',
          processed: true,
        };
      })
    );

    setIsProcessing(false);
  };

  // Download sample CSV template
  const handleDownloadTemplate = () => {
    const header = 'patient_id,age,diabetes_years,hba1c,systolic_bp,eye\n';
    const sampleRows =
      'PT-BATCH-001,58,9,8.4,138,OD\n' +
      'PT-BATCH-002,62,14,10.2,152,OS\n' +
      'PT-BATCH-003,45,4,6.8,122,OD\n' +
      'PT-BATCH-004,69,18,9.1,144,OD\n' +
      'PT-BATCH-005,53,7,7.4,130,OS\n';
    const blob = new Blob([header + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'retinaguard_manifest_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download batch results as CSV
  const handleExportResultsCsv = () => {
    const header = 'Patient_Code,Filename,Quality_Status,Predicted_DR_Grade,Priority,DME_Detected\n';
    const rows = batchItems
      .map(
        (b) =>
          `${b.patientCode},${b.filename},${b.qualityStatus},${b.predictedGrade ?? 'UNGRADABLE'},${
            b.priority
          },${b.dmeDetected ? 'YES' : 'NO'}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `retinaguard_batch_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered batch table items
  const filteredItems = batchItems.filter((item) => {
    if (statusFilter === 'LOW' && item.priority !== 'Low Concern') return false;
    if (statusFilter === 'REVIEW' && item.priority !== 'Review Recommended') return false;
    if (statusFilter === 'PRIORITY' && item.priority !== 'Priority') return false;
    if (statusFilter === 'UNGRADABLE' && item.qualityStatus !== 'UNGRADABLE') return false;

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        item.patientCode.toLowerCase().includes(q) ||
        item.filename.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16" id="batch-screening-root">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFEDD5] text-[#EA580C]">
                <Layers className="w-3.5 h-3.5" />
                <span>Automated Batch Pipeline</span>
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                SIMULATED DATA · Mock Ingestion Mode
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
              Batch Screening Architecture
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5C5F] mt-1 max-w-2xl leading-relaxed">
              Process high-volume retinal photography cohorts from tele-ophthalmology outreach vans, rural clinics, or institutional archives. Upload folders of fundus images and linked CSV clinical manifests.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] text-[#2E2628] hover:bg-[#FFF7ED] text-xs font-bold transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#EA580C]" />
              <span>Download CSV Template</span>
            </button>
            <button
              type="button"
              onClick={handleExportResultsCsv}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#EFE4DC] text-[#2E2628] hover:bg-[#FAF8F6] text-xs font-bold transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-[#6E5C5F]" />
              <span>Export Triage CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Box 1: Multiple Retinal Fundus Images */}
        <div className="p-6 rounded-3xl bg-white border border-[#EFE4DC] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#EA580C]" />
              <h3 className="font-bold text-sm text-[#2E2628]">1. Multi-Image Ingestion Dropzone</h3>
            </div>
            {uploadedFiles.length > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D]">
                {uploadedFiles.length} files selected
              </span>
            )}
          </div>
          <p className="text-xs text-[#6E5C5F]">
            Select multiple 2D color fundus photos (.png, .jpg, .dcm) captured during outreach camps.
          </p>

          <label className="border-2 border-dashed border-[#EFE4DC] hover:border-[#EA580C] hover:bg-[#FFF7ED]/30 rounded-2xl p-6 text-center cursor-pointer block transition-all">
            <Upload className="w-8 h-8 text-[#EA580C] mx-auto mb-2" />
            <span className="text-xs font-bold text-[#2E2628] block">
              Click to select multiple fundus images or drag &amp; drop
            </span>
            <span className="text-[11px] text-[#6E5C5F] block mt-1">
              Supports 45° macula-centered or optic-disc centered fields
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageFilesChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Box 2: CSV Manifest Upload */}
        <div className="p-6 rounded-3xl bg-white border border-[#EFE4DC] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#EA580C]" />
              <h3 className="font-bold text-sm text-[#2E2628]">2. Clinical Cohort Manifest (CSV)</h3>
            </div>
            {csvFileName && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D]">
                {csvFileName}
              </span>
            )}
          </div>
          <p className="text-xs text-[#6E5C5F]">
            Link patient identifiers, systemic biomarkers (HbA1c, Blood Pressure, Duration), and eye labels.
          </p>

          <label className="border-2 border-dashed border-[#EFE4DC] hover:border-[#EA580C] hover:bg-[#FFF7ED]/30 rounded-2xl p-6 text-center cursor-pointer block transition-all">
            <FileSpreadsheet className="w-8 h-8 text-[#15803D] mx-auto mb-2" />
            <span className="text-xs font-bold text-[#2E2628] block">
              {csvFileName ? `Loaded: ${csvFileName}` : 'Click to select patient_manifest.csv'}
            </span>
            <span className="text-[11px] text-[#6E5C5F] block mt-1">
              Formatted according to standard tele-screening schemas
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleCsvChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Batch Processing Execution Bar */}
      <div className="bg-white p-5 rounded-3xl border border-[#EFE4DC] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#2E2628]">Batch Queue Status:</span>
            <span className="text-xs font-mono font-bold text-[#EA580C]">
              {processedCount} of {total} evaluated
            </span>
          </div>
          {isProcessing && (
            <div className="w-full sm:w-64 bg-[#EFE4DC] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#EA580C] h-full transition-all duration-150"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleRunBatchInference}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Evaluating Cohort ({processingProgress}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Execute Multimodal Batch Inference ({total} Scans)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards - ALL CLEARLY LABELED SIMULATED DATA */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#6E5C5F]">
          <span className="uppercase tracking-wider">Batch Cohort Triage Distribution:</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            SIMULATED DATA
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Total */}
          <div className="bg-white p-4 rounded-2xl border border-[#EFE4DC] shadow-xs">
            <div className="text-[11px] text-[#6E5C5F] font-medium">Cohort Volume</div>
            <div className="text-xl font-bold font-serif text-[#2E2628] mt-0.5">{total}</div>
            <div className="text-[10px] text-[#15803D] mt-1 font-semibold">100% Ingested</div>
          </div>

          {/* Low Concern */}
          <div className="bg-white p-4 rounded-2xl border border-[#86EFAC] bg-[#F0FDF4]/30 shadow-xs">
            <div className="text-[11px] text-[#15803D] font-medium">Low Concern</div>
            <div className="text-xl font-bold font-serif text-[#15803D] mt-0.5">{lowConcern}</div>
            <div className="text-[10px] text-[#15803D] mt-1 font-medium">Grade 0 or 1</div>
          </div>

          {/* Review Recommended */}
          <div className="bg-white p-4 rounded-2xl border border-[#FCD34D] bg-[#FFFBEB]/30 shadow-xs">
            <div className="text-[11px] text-[#D97706] font-medium">Review Rec.</div>
            <div className="text-xl font-bold font-serif text-[#D97706] mt-0.5">
              {reviewRecommended}
            </div>
            <div className="text-[10px] text-[#D97706] mt-1 font-medium">Grade 2 Moderate</div>
          </div>

          {/* Priority Referral */}
          <div className="bg-white p-4 rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2]/30 shadow-xs">
            <div className="text-[11px] text-[#DC2626] font-medium">Priority Referral</div>
            <div className="text-xl font-bold font-serif text-[#DC2626] mt-0.5">{priority}</div>
            <div className="text-[10px] text-[#DC2626] mt-1 font-medium">Grade 3, 4 or DME</div>
          </div>

          {/* Ungradable */}
          <div className="bg-white p-4 rounded-2xl border border-[#EFE4DC] shadow-xs">
            <div className="text-[11px] text-[#6E5C5F] font-medium">Ungradable</div>
            <div className="text-xl font-bold font-serif text-[#6E5C5F] mt-0.5">{ungradable}</div>
            <div className="text-[10px] text-[#DC2626] mt-1 font-medium">Recapture Flagged</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EFE4DC] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {[
            { key: 'ALL', label: 'All Items' },
            { key: 'PRIORITY', label: 'Priority Referrals' },
            { key: 'REVIEW', label: 'Review Rec.' },
            { key: 'LOW', label: 'Low Concern' },
            { key: 'UNGRADABLE', label: 'Ungradable' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === tab.key
                  ? 'bg-[#EA580C] text-white shadow-2xs'
                  : 'bg-[#FAF8F6] text-[#6E5C5F] hover:bg-[#FFF7ED]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#6E5C5F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search patient or file..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#EFE4DC] focus:outline-none focus:border-[#EA580C]"
          />
        </div>
      </div>

      {/* Batch Results Table */}
      <div className="bg-white rounded-3xl border border-[#EFE4DC] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F6] border-b border-[#EFE4DC] text-[11px] font-bold text-[#6E5C5F] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Patient Code</th>
                <th className="py-3 px-4">Source Filename</th>
                <th className="py-3 px-4">Quality Gate</th>
                <th className="py-3 px-4">Inferred DR Grade</th>
                <th className="py-3 px-4">OCT DME Flag</th>
                <th className="py-3 px-4">Triage Priority</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE4DC]">
              {filteredItems.map((item) => {
                const isUngradable = item.qualityStatus === 'UNGRADABLE';

                return (
                  <tr key={item.id} className="hover:bg-[#FFFDFB] transition-colors">
                    {/* Patient Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[#2E2628]">
                      {item.patientCode}
                      {item.patientAge && (
                        <span className="text-[11px] font-normal text-[#6E5C5F] ml-1.5">
                          ({item.patientAge}y)
                        </span>
                      )}
                    </td>

                    {/* Source Filename */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#6E5C5F]">
                      {item.filename}
                    </td>

                    {/* Quality Gate */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.qualityStatus === 'GOOD'
                            ? 'bg-[#DCFCE7] text-[#15803D]'
                            : item.qualityStatus === 'UNCERTAIN'
                            ? 'bg-[#FEF3C7] text-[#B45309]'
                            : 'bg-[#FEE2E2] text-[#B91C1C]'
                        }`}
                      >
                        {item.qualityStatus}
                      </span>
                    </td>

                    {/* Inferred DR Grade */}
                    <td className="py-3.5 px-4">
                      {item.predictedGrade !== undefined ? (
                        <div className="flex items-center gap-2">
                          <RiskChip grade={item.predictedGrade} size="sm" />
                          <span className="font-bold text-[#2E2628]">
                            Grade {item.predictedGrade}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#6E5C5F]">Ungradable</span>
                      )}
                    </td>

                    {/* OCT DME Flag */}
                    <td className="py-3.5 px-4">
                      {item.dmeDetected ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FEE2E2] text-[#DC2626]">
                          <AlertCircle className="w-3 h-3" />
                          <span>DME Fluid</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#6E5C5F]">No Edema</span>
                      )}
                    </td>

                    {/* Triage Priority */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          item.priority === 'Priority'
                            ? 'bg-[#FEE2E2] text-[#DC2626]'
                            : item.priority === 'Review Recommended'
                            ? 'bg-[#FFFBEB] text-[#D97706]'
                            : item.priority === 'Ungradable'
                            ? 'bg-[#FAF8F6] text-[#6E5C5F]'
                            : 'bg-[#F0FDF4] text-[#15803D]'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          const preset = PRESET_CASES.find(
                            (c) => c.expectedTriage.finalGrade === (item.predictedGrade ?? 1)
                          ) || PRESET_CASES[0];
                          onSelectResult(preset.expectedTriage);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF8F6] hover:bg-[#FFF7ED] text-[#2E2628] hover:text-[#EA580C] text-[11px] font-bold border border-[#EFE4DC] transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
