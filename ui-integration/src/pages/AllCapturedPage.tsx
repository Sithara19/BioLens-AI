import React from 'react';
import {
  CheckCircle2,
  ArrowRight,
  FileCheck,
  SkipForward,
  Eye,
  Smile,
  Layers,
  Hand,
} from 'lucide-react';

import { ModalityType } from '../types';

interface AllCapturedPageProps {
  images: Record<ModalityType, string>;
  onReviewImages: () => void;
  onContinueToAnalysis: () => void;
}

export const AllCapturedPage: React.FC<
  AllCapturedPageProps
> = ({
  images,
  onReviewImages,
  onContinueToAnalysis,
}) => {
  const modalityLabels: {
    key: ModalityType;
    label: string;
    icon: React.ComponentType<{
      className?: string;
    }>;
  }[] = [
    {
      key: 'eye',
      label: 'Eye',
      icon: Eye,
    },
    {
      key: 'tongue',
      label: 'Tongue',
      icon: Smile,
    },
    {
      key: 'nail',
      label: 'Nail',
      icon: Layers,
    },
    {
      key: 'palm',
      label: 'Palm',
      icon: Hand,
    },
    {
      key: 'skin',
      label: 'Skin',
      icon: Layers,
    },
  ];

  const availableModalities =
    modalityLabels.filter(
      (modality) =>
        Boolean(images[modality.key])
    );

  const skippedModalities =
    modalityLabels.filter(
      (modality) =>
        !images[modality.key]
    );

  const capturedCount =
    availableModalities.length;

  const skippedCount =
    skippedModalities.length;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8 animate-in fade-in zoom-in-95 duration-300">

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-7 sm:p-10 text-center space-y-7">

        <div className="w-20 h-20 rounded-3xl bg-teal-50 border border-teal-200 text-teal-600 mx-auto flex items-center justify-center shadow-sm">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="space-y-2">

          <span className="text-xs uppercase font-bold tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
            Image Acquisition Complete
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Images Ready for Analysis
          </h2>

          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            {capturedCount === 5
              ? 'All five requested images are available for multimodal screening.'
              : capturedCount > 0
              ? `${capturedCount} of 5 images are available for screening. Skipped modalities will not be analyzed.`
              : 'No images were provided. You can review your selections or return to capture images before continuing.'}
          </p>

        </div>

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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">

          {modalityLabels.map(
            (modality) => {
              const hasImage =
                Boolean(
                  images[
                    modality.key
                  ]
                );

              const ModalityIcon =
                modality.icon;

              return (
                <div
                  key={modality.key}
                  className={`p-2.5 rounded-2xl border text-center space-y-2 group transition-all ${
                    hasImage
                      ? 'bg-slate-50 border-slate-200/80'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >

                  <div
                    className={`aspect-square w-full rounded-xl overflow-hidden relative border shadow-inner ${
                      hasImage
                        ? 'bg-slate-200 border-slate-200'
                        : 'bg-slate-100 border-slate-200'
                    }`}
                  >

                    {hasImage ? (
                      <img
                        src={
                          images[
                            modality.key
                          ]
                        }
                        alt={`${modality.label} screening image`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">

                        <ModalityIcon className="w-7 h-7" />

                        <span className="text-xs font-semibold">
                          Skipped
                        </span>

                      </div>
                    )}

                    <div
                      className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full text-white flex items-center justify-center shadow-sm ${
                        hasImage
                          ? 'bg-teal-600'
                          : 'bg-slate-400'
                      }`}
                    >
                      {hasImage ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <SkipForward className="w-3.5 h-3.5" />
                      )}
                    </div>

                  </div>

                  <div>

                    <span className="text-xs font-bold text-slate-800 block">
                      {modality.label}
                    </span>

                    <span
                      className={`text-[10px] font-semibold ${
                        hasImage
                          ? 'text-teal-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {hasImage
                        ? 'Captured'
                        : 'Skipped — not analyzed'}
                    </span>

                  </div>

                </div>
              );
            }
          )}

        </div>

        {skippedCount > 0 && (
          <div className="flex items-start gap-3 text-left p-4 rounded-2xl bg-amber-50 border border-amber-200">

            <SkipForward className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />

            <div className="space-y-1">

              <p className="text-xs font-bold text-amber-800">
                Skipped modalities
              </p>

              <p className="text-xs text-amber-700 leading-relaxed">
                {skippedModalities
                  .map(
                    (modality) =>
                      modality.label
                  )
                  .join(', ')}{' '}
                {skippedCount === 1
                  ? 'was'
                  : 'were'}{' '}
                skipped. No AI analysis or
                contribution will be assigned
                to{' '}
                {skippedCount === 1
                  ? 'this modality'
                  : 'these modalities'}.
              </p>

            </div>

          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4 border-t border-slate-100">

          <button
            onClick={
              onReviewImages
            }
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <FileCheck className="w-4 h-4 text-slate-600" />
            Review Images
          </button>

          <button
            onClick={
              onContinueToAnalysis
            }
            disabled={
              capturedCount === 0
            }
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
              capturedCount > 0
                ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20 transform hover:-translate-y-0.5'
                : 'bg-slate-300 cursor-not-allowed shadow-none'
            }`}
          >
            Continue to Analysis
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

      </div>
    </div>
  );
};
