import React, { useState } from 'react';
import {
  Eye,
  Smile,
  Layers,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  SkipForward,
  FileCheck2,
} from 'lucide-react';

import { ModalityType } from '../types';
import { ImageUploader } from '../components/ImageUploader';
import { CameraCapture } from '../components/CameraCapture';

interface ReviewPageProps {
  images: Record<ModalityType, string>;
  onRetakeModality: (modality: ModalityType) => void;
  onContinueToAnalysis: () => void;
  onUpdateImage: (
    modality: ModalityType,
    newUrl: string
  ) => void;
}

export const ReviewPage: React.FC<
  ReviewPageProps
> = ({
  images,
  onRetakeModality,
  onContinueToAnalysis,
  onUpdateImage,
}) => {
  const [
    replacingModality,
    setReplacingModality,
  ] = useState<ModalityType | null>(null);

  const [
    replacingMode,
    setReplacingMode,
  ] = useState<'upload' | 'camera'>(
    'upload'
  );

  // =========================================================
  // FOUR MODALITIES
  // =========================================================

  const modalities: {
    key: ModalityType;
    label: string;
    clinicalArea: string;
    icon: React.ComponentType<{
      className?: string;
    }>;
  }[] = [
    {
      key: 'eye',
      label: 'Eye',
      clinicalArea: 'Eye & Lower Eyelid',
      icon: Eye,
    },
    {
      key: 'tongue',
      label: 'Tongue',
      clinicalArea: 'Tongue Surface',
      icon: Smile,
    },
    {
      key: 'nail',
      label: 'Nail',
      clinicalArea: 'Fingernail',
      icon: Layers,
    },
    {
      key: 'skin',
      label: 'Skin',
      clinicalArea: 'Skin Area',
      icon: Layers,
    },
  ];

  // =========================================================
  // COUNTS
  // =========================================================

  const capturedCount =
    modalities.filter(
      (modality) =>
        Boolean(images[modality.key])
    ).length;

  const skippedCount =
    modalities.length - capturedCount;

  // =========================================================
  // IMAGE REPLACEMENT
  // =========================================================

  const handleInlineImageSelected = (
    url: string
  ) => {
    if (!replacingModality) return;

    onUpdateImage(
      replacingModality,
      url
    );

    setReplacingModality(null);
    setReplacingMode('upload');
  };

  const handleCloseReplacement = () => {
    setReplacingModality(null);
    setReplacingMode('upload');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="text-center max-w-2xl mx-auto space-y-2">

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold">
          <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
          Pre-Analysis Image Inspection
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Review Captured Images
        </h1>

        <p className="text-xs sm:text-sm text-slate-600">
          Verify the available images before submitting them to multimodal screening.
          Skipped modalities will not be analyzed.
        </p>

      </div>

      {/* =====================================================
          STATUS SUMMARY
      ====================================================== */}

      <div className="flex flex-wrap items-center justify-center gap-2">

        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4" />
          {capturedCount} Captured
        </div>

        {skippedCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold">
            <SkipForward className="w-4 h-4" />
            {skippedCount} Skipped
          </div>
        )}

      </div>

      {/* =====================================================
          INLINE REPLACEMENT MODAL
      ====================================================== */}

      {replacingModality && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 border border-slate-200 shadow-2xl">

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">

              <h3 className="text-base font-bold text-slate-900">
                Replace{' '}
                {replacingModality
                  .charAt(0)
                  .toUpperCase() +
                  replacingModality.slice(
                    1
                  )}{' '}
                Image
              </h3>

              <button
                type="button"
                onClick={
                  handleCloseReplacement
                }
                className="text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>

            </div>

            {replacingMode ===
            'camera' ? (
              <CameraCapture
                modality={
                  replacingModality
                }
                onCapture={
                  handleInlineImageSelected
                }
                onCancel={() =>
                  setReplacingMode(
                    'upload'
                  )
                }
              />
            ) : (
              <ImageUploader
                modality={
                  replacingModality
                }
                onImageSelected={
                  handleInlineImageSelected
                }
                onOpenLiveCamera={() =>
                  setReplacingMode(
                    'camera'
                  )
                }
              />
            )}

          </div>

        </div>
      )}

      {/* =====================================================
          MODALITY CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {modalities.map(
          (modality) => {
            const Icon =
              modality.icon;

            const imgUrl =
              images[
                modality.key
              ];

            const hasImage =
              Boolean(imgUrl);

            return (
              <div
                key={modality.key}
                className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  hasImage
                    ? 'border-slate-200/90'
                    : 'border-slate-200'
                }`}
              >

                <div>

                  {/* =========================================
                      IMAGE VIEWPORT
                  ========================================== */}

                  <div
                    className={`relative aspect-4/3 w-full overflow-hidden border-b border-slate-100 flex items-center justify-center ${
                      hasImage
                        ? 'bg-slate-900'
                        : 'bg-slate-100'
                    }`}
                  >

                    {hasImage ? (
                      <img
                        src={imgUrl}
                        alt={`${modality.label} review`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-slate-400 text-xs flex flex-col items-center gap-2">

                        <SkipForward className="w-6 h-6 text-slate-400" />

                        <span className="font-semibold">
                          Image Skipped
                        </span>

                        <span className="text-[10px] text-slate-400">
                          Not analyzed
                        </span>

                      </div>
                    )}

                    {/* =======================================
                        STATUS BADGE
                    ======================================== */}

                    <div
                      className={`absolute top-2.5 right-2.5 px-2 py-1 rounded-md backdrop-blur-sm text-[10px] font-mono font-bold flex items-center gap-1 border ${
                        hasImage
                          ? 'bg-slate-900/80 text-teal-300 border-white/10'
                          : 'bg-slate-700/80 text-slate-300 border-white/10'
                      }`}
                    >

                      {hasImage ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-teal-400" />
                          <span>CAPTURED</span>
                        </>
                      ) : (
                        <>
                          <SkipForward className="w-3 h-3 text-slate-300" />
                          <span>SKIPPED</span>
                        </>
                      )}

                    </div>

                  </div>

                  {/* =========================================
                      DETAILS
                  ========================================== */}

                  <div className="p-4 space-y-1">

                    <div className="flex items-center gap-2">

                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          hasImage
                            ? 'bg-teal-50 text-teal-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">
                        {modality.label}
                      </h3>

                    </div>

                    <p className="text-[11px] text-slate-500">
                      {modality.clinicalArea}
                    </p>

                    <p
                      className={`text-[10px] font-semibold pt-1 ${
                        hasImage
                          ? 'text-teal-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {hasImage
                        ? 'Included in analysis'
                        : 'Excluded from analysis'}
                    </p>

                  </div>

                </div>

                {/* =========================================
                    RETAKE / ADD IMAGE BUTTON
                ========================================== */}

                <div className="p-4 pt-0">

                  <button
                    type="button"
                    onClick={() => {
                      setReplacingModality(
                        modality.key
                      );
                      setReplacingMode(
                        'upload'
                      );
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors"
                  >

                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />

                    {hasImage
                      ? 'Retake Image'
                      : 'Add Image'}

                  </button>

                </div>

              </div>
            );
          }
        )}

      </div>

      {/* =====================================================
          SKIPPED MODALITY INFORMATION
      ====================================================== */}

      {skippedCount > 0 && (
        <div className="max-w-3xl mx-auto flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">

          <SkipForward className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />

          <div className="space-y-1">

            <p className="text-xs font-bold text-slate-800">
              Skipped images are excluded
            </p>

            <p className="text-xs text-slate-500 leading-relaxed">
              Any modality without an uploaded
              or captured image will not be sent
              to the AI analysis pipeline and will
              not contribute to multimodal fusion.
            </p>

          </div>

        </div>
      )}

      {/* =====================================================
          PRIMARY ACTION
      ====================================================== */}

      <div className="text-center pt-4">

        <button
          type="button"
          onClick={
            onContinueToAnalysis
          }
          disabled={
            capturedCount === 0
          }
          className={`w-full sm:w-auto px-10 py-4 rounded-2xl text-white font-extrabold text-sm inline-flex items-center justify-center gap-2.5 shadow-xl transition-all ${
            capturedCount > 0
              ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/25 hover:shadow-teal-600/35 transform hover:-translate-y-0.5'
              : 'bg-slate-300 cursor-not-allowed shadow-none'
          }`}
        >

          <span>
            Continue to Analysis
          </span>

          <ArrowRight className="w-4 h-4" />

        </button>

        <p className="text-[11px] text-slate-400 mt-2">

          {capturedCount > 0
            ? `${capturedCount} ${
                capturedCount === 1
                  ? 'modality'
                  : 'modalities'
              } will be submitted to the screening pipeline.`
            : 'At least one image is required to continue.'}

        </p>

      </div>

    </div>
  );
};
