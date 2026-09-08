import React, { useState, useRef, DragEvent } from 'react';
import {
  Camera,
  CheckCircle2,
  Eye,
  FileImage,
  HelpCircle,
  RefreshCw,
  RotateCcw,
  Trash2,
  UploadCloud,
  X,
  Zap,
} from 'lucide-react';

export interface ImageUploaderProps {
  label: string;
  sublabel?: string;
  required?: boolean;
  currentImageUrl: string | null;
  currentImageName: string;
  onImageChange: (url: string | null, name: string) => void;
  onRetakePrompt?: () => void;
  presets?: Array<{
    id: string;
    label: string;
    description: string;
    imageUrl: string;
    fileName: string;
  }>;
  selectedPresetId?: string;
  onSelectPreset?: (presetId: string) => void;
  aspectRatioClass?: string;
  enableClaheToggle?: boolean;
  claheUrl?: string | null;
  showingClahe?: boolean;
  onToggleClahe?: () => void;
  retakeInstructions?: string[];
  helperHint?: string;
  idPrefix?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  sublabel,
  required = false,
  currentImageUrl,
  currentImageName,
  onImageChange,
  onRetakePrompt,
  presets = [],
  selectedPresetId,
  onSelectPreset,
  aspectRatioClass = 'aspect-[4/3]',
  enableClaheToggle = false,
  claheUrl,
  showingClahe = false,
  onToggleClahe,
  retakeInstructions = [],
  helperHint,
  idPrefix = 'uploader',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showRetakeGuide, setShowRetakeGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process selected file
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, TIFF).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageChange(result, file.name);
      setShowRetakeGuide(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onImageChange(null, '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReplace = () => {
    fileInputRef.current?.click();
  };

  const handleRetake = () => {
    setShowRetakeGuide(true);
    if (onRetakePrompt) {
      onRetakePrompt();
    }
  };

  return (
    <div className="space-y-4" id={`${idPrefix}-root`}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        className="hidden"
        id={`${idPrefix}-file-input`}
      />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#2E2628]">{label}</h3>
            {required ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEE2E2] text-[#DC2626]">
                Required
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F5F1ED] text-[#6E5C5F]">
                Optional
              </span>
            )}
          </div>
          {sublabel && <p className="text-xs text-[#6E5C5F] mt-0.5">{sublabel}</p>}
        </div>

        {/* Quick Sample Presets (if available) */}
        {presets.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-medium text-[#6E5C5F] mr-1">Sample Scans:</span>
            {presets.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  id={`${idPrefix}-preset-${preset.id}`}
                  onClick={() => {
                    if (onSelectPreset) {
                      onSelectPreset(preset.id);
                    } else {
                      onImageChange(preset.imageUrl, preset.fileName);
                    }
                    setShowRetakeGuide(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                    isSelected
                      ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-xs'
                      : 'bg-[#FFFDFB] text-[#2E2628] border-[#EFE4DC] hover:border-[#EA580C] hover:bg-[#FFF7ED]'
                  }`}
                  title={preset.description}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Image Area: Preview OR Drag/Drop Zone */}
      {currentImageUrl ? (
        <div className="rounded-2xl border border-[#EFE4DC] bg-[#181517] overflow-hidden shadow-xs space-y-0">
          {/* Top Preview Bar */}
          <div className="px-4 py-2.5 bg-[#231F21] border-b border-[#3B3437] flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-2 truncate pr-2">
              <FileImage className="w-4 h-4 text-[#EA580C] shrink-0" />
              <span className="font-mono text-[11px] truncate text-[#EFE4DC]" title={currentImageName}>
                {currentImageName || 'Retinal Scan Upload'}
              </span>
            </div>

            {/* CLAHE Filter Toggle (for Fundus) */}
            {enableClaheToggle && claheUrl && (
              <button
                type="button"
                id={`${idPrefix}-clahe-toggle`}
                onClick={onToggleClahe}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  showingClahe
                    ? 'bg-[#EA580C] text-white'
                    : 'bg-[#2E2628] text-[#D1D5E0] hover:text-white border border-[#483F43]'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>{showingClahe ? 'CLAHE Enhanced' : 'Standard View'}</span>
              </button>
            )}
          </div>

          {/* Image Display */}
          <div className={`relative ${aspectRatioClass} w-full flex items-center justify-center p-3`}>
            <img
              src={showingClahe && claheUrl ? claheUrl : currentImageUrl}
              alt={label}
              className="w-full h-full object-contain rounded-lg"
            />

            {/* In-Image Watermark / Scale Badge */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-xs text-[10px] font-mono text-white/90 px-2 py-0.5 rounded border border-white/10">
              512×512 · Verified Optical Path
            </div>
          </div>

          {/* Action Toolbar: Replace, Remove, Retake */}
          <div className="p-3 bg-[#FAF8F6] border-t border-[#EFE4DC] flex flex-wrap items-center justify-between gap-2">
            <div className="text-[11px] text-[#6E5C5F] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
              <span>Image loaded and ready</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Retake Button */}
              <button
                type="button"
                id={`${idPrefix}-btn-retake`}
                onClick={handleRetake}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[#EFE4DC] text-[#2E2628] hover:bg-[#FFF7ED] hover:border-[#EA580C] hover:text-[#EA580C] transition-colors shadow-2xs"
                title="Initiate retake flow with camera positioning guidance"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              {/* Replace Button */}
              <button
                type="button"
                id={`${idPrefix}-btn-replace`}
                onClick={handleReplace}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[#EFE4DC] text-[#2E2628] hover:bg-[#FAF8F6] transition-colors shadow-2xs"
                title="Select a different file from disk"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>

              {/* Remove Button */}
              <button
                type="button"
                id={`${idPrefix}-btn-remove`}
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[#FEE2E2] text-[#DC2626] hover:bg-[#FEF2F2] transition-colors shadow-2xs"
                title="Remove image"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Drag and Drop Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          id={`${idPrefix}-dropzone`}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            isDragging
              ? 'border-[#EA580C] bg-[#FFF7ED]'
              : 'border-[#E5D7CE] bg-[#FAF8F6] hover:border-[#EA580C] hover:bg-[#FFFDFB]'
          }`}
        >
          <div className="mx-auto w-12 h-12 rounded-2xl bg-white border border-[#EFE4DC] flex items-center justify-center text-[#EA580C] shadow-2xs mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="text-sm font-bold text-[#2E2628]">
              Drag & drop retinal image here, or{' '}
              <span className="text-[#EA580C] underline decoration-[#EA580C]/40">browse file</span>
            </div>
            <p className="text-xs text-[#6E5C5F]">
              Supports standard fundus / OCT formats (PNG, JPG, DICOM-exported JPEG, TIFF up to 25MB)
            </p>
          </div>

          {helperHint && (
            <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-[#6E5C5F] bg-white px-3 py-1 rounded-full border border-[#EFE4DC]">
              <HelpCircle className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>{helperHint}</span>
            </div>
          )}
        </div>
      )}

      {/* Retake Guidance Drawer / Modal Panel */}
      {showRetakeGuide && (
        <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#FDBA74] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C] uppercase tracking-wider">
              <Camera className="w-4 h-4" />
              <span>Camera Operator Retake Checklist</span>
            </div>
            <button
              type="button"
              onClick={() => setShowRetakeGuide(false)}
              className="p-1 rounded-lg text-[#6E5C5F] hover:bg-[#F5F1ED]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#2E2628] leading-relaxed">
            Follow these optical alignment steps to capture a high-clarity image before re-triggering exposure:
          </p>

          <ul className="space-y-1.5 text-xs text-[#6E5C5F]">
            {(retakeInstructions.length > 0
              ? retakeInstructions
              : [
                  'Instruct patient to look directly at the green internal fixation target LED.',
                  'Align pupillary reflex: adjust joystick height until iris reflection is centered.',
                  'Allow 2 seconds after blinking for tear film stabilization before triggering capture.',
                  'If glare ring appears on temporal side, tilt camera head 3° toward the nasal bridge.',
                ]
            ).map((instruction, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#FFEDD5] text-[#EA580C] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{instruction}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#EFE4DC]">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C] transition-colors shadow-2xs"
            >
              Capture / Select New Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
