import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Eye,
  Smile,
  Layers,
  Hand,
  Sparkles,
  CheckCircle2,
  Loader2,
  SkipForward,
} from 'lucide-react';

import {
  ModalityType,
  ScreeningResult,
} from '../types';

import { api } from '../services/api';

interface AnalysisPageProps {
  images: Record<ModalityType, string>;
  onAnalysisComplete: (
    result: ScreeningResult
  ) => void;
}

type AnalysisPhase =
  | 'initializing'
  | 'processing'
  | 'fusion'
  | 'complete';

export const AnalysisPage: React.FC<
  AnalysisPageProps
> = ({
  images,
  onAnalysisComplete,
}) => {
  const [phase, setPhase] =
    useState<AnalysisPhase>('initializing');

  const [currentModalityIndex, setCurrentModalityIndex] =
    useState<number>(-1);

  const [progress, setProgress] =
    useState<number>(8);

  const [error, setError] =
    useState<string | null>(null);

  // =========================================================
  // MODALITY INFORMATION
  // =========================================================

  const modalityInfo: Record<
    ModalityType,
    {
      label: string;
      target: string;
      model: string;
      icon: React.ComponentType<{
        className?: string;
      }>;
    }
  > = {
    eye: {
      label: 'Eye',
      target:
        'Eye image screening for diabetes and jaundice',
      model:
        'ViT-Tiny — Diabetes + Jaundice',
      icon: Eye,
    },

    tongue: {
      label: 'Tongue',
      target:
        'Tongue surface visual finding detection',
      model:
        'YOLO11 Nano — Tongue Detection',
      icon: Smile,
    },

    nail: {
      label: 'Nail',
      target:
        'Fingernail and nail-bed visual screening',
      model:
        'ViT-Tiny — Nail Classification',
      icon: Layers,
    },

    palm: {
      label: 'Palm',
      target:
        'Palm image used in anemia screening',
      model:
        'ViT-Tiny — Anemia Fusion Input',
      icon: Hand,
    },

    skin: {
      label: 'Skin',
      target:
        'Skin image visual finding screening',
      model:
        'EfficientNet-B0 — Skin Classification',
      icon: Sparkles,
    },
  };

  // =========================================================
  // MODALITY ORDER
  // =========================================================

  const allModalities =
    useMemo(
      () =>
        [
          'eye',
          'tongue',
          'nail',
          'palm',
          'skin',
        ] as ModalityType[],
      []
    );

  // =========================================================
  // AVAILABLE / SKIPPED MODALITIES
  // =========================================================

  const availableModalities =
    useMemo(
      () =>
        allModalities.filter(
          (modality) =>
            Boolean(images[modality])
        ),
      [allModalities, images]
    );

  const skippedModalities =
    useMemo(
      () =>
        allModalities.filter(
          (modality) =>
            !images[modality]
        ),
      [allModalities, images]
    );

  const availableCount =
    availableModalities.length;

  // =========================================================
  // REAL ANALYSIS PIPELINE
  //
  // The frontend stages are visual progress indicators.
  // The actual model inference is performed by the FastAPI
  // backend through api.analyzeScreening().
  // =========================================================

  useEffect(() => {
    let isMounted = true;

    const wait = (
      milliseconds: number
    ) =>
      new Promise<void>(
        (resolve) =>
          setTimeout(
            resolve,
            milliseconds
          )
      );

    const runAnalysis = async () => {
      try {
        setError(null);
        setPhase('initializing');
        setCurrentModalityIndex(-1);
        setProgress(8);

        // -----------------------------------------------------
        // SAFETY CHECK
        // -----------------------------------------------------

        if (
          availableModalities.length ===
          0
        ) {
          throw new Error(
            'No images were provided for analysis. Please capture or upload at least one modality.'
          );
        }

        // -----------------------------------------------------
        // INITIALIZATION
        // -----------------------------------------------------

        await wait(450);

        if (!isMounted) return;

        // -----------------------------------------------------
        // VISUAL MODALITY STAGES
        //
        // These represent the modalities included in the
        // submitted request. Actual inference is performed
        // together by the backend API call below.
        // -----------------------------------------------------

        setPhase('processing');

        for (
          let index = 0;
          index <
          availableModalities.length;
          index++
        ) {
          if (!isMounted) return;

          setCurrentModalityIndex(index);

          const progressValue =
            15 +
            Math.round(
              ((index + 1) /
                availableModalities.length) *
                55
            );

          setProgress(
            progressValue
          );

          await wait(500);

          if (!isMounted) return;
        }

        // -----------------------------------------------------
        // BACKEND ANALYSIS / FUSION
        // -----------------------------------------------------

        if (!isMounted) return;

        setPhase('fusion');
        setCurrentModalityIndex(-1);
        setProgress(78);

        /*
         * This is the real model-serving call.
         *
         * api.analyzeScreening() sends the available images
         * to the FastAPI backend. The backend runs:
         *
         * Eye    -> Diabetes + Jaundice
         * Eye +
         * Nail +
         * Palm   -> Anemia fusion
         * Nail   -> Nail classifier
         * Skin   -> Skin classifier
         * Tongue -> Tongue detector
         *
         * Only supplied modalities are processed.
         */
        const result =
          await api.analyzeScreening(
            images
          );

        if (!isMounted) return;

        setProgress(94);

        await wait(500);

        if (!isMounted) return;

        // -----------------------------------------------------
        // COMPLETE
        // -----------------------------------------------------

        setPhase('complete');
        setProgress(100);

        await wait(650);

        if (!isMounted) return;

        onAnalysisComplete(
          result
        );
      } catch (err: any) {
        if (!isMounted) return;

        setError(
          err?.message ||
            'An error occurred during analysis.'
        );
      }
    };

    runAnalysis();

    return () => {
      isMounted = false;
    };
  }, [
    images,
    availableModalities,
    onAnalysisComplete,
  ]);

  // =========================================================
  // STATUS HELPERS
  // =========================================================

  const isProcessing =
    phase === 'processing';

  const isFusion =
    phase === 'fusion';

  const isComplete =
    phase === 'complete';

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8 animate-in fade-in duration-300">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="text-center max-w-2xl mx-auto space-y-3">

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold">

          {isComplete ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
          ) : (
            <Loader2 className="w-3.5 h-3.5 text-teal-600 animate-spin" />
          )}

          {isComplete
            ? 'Screening Complete'
            : 'BioLens Analysis Pipeline'}

        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">

          {isComplete
            ? 'Analysis Complete'
            : 'Analyzing Your Images'}

        </h2>

        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">

          BioLens processes only the image
          modalities you provided. Model
          outputs are screening results and
          visual findings, not medical diagnoses.

        </p>

        {/* =================================================
            MODALITY SUMMARY
        ================================================== */}

        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-[11px] font-bold">

            <CheckCircle2 className="w-3.5 h-3.5" />

            {availableCount}{' '}
            {availableCount === 1
              ? 'Modality'
              : 'Modalities'}{' '}
            Included

          </span>

          {skippedModalities.length >
            0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] font-bold">

              <SkipForward className="w-3.5 h-3.5" />

              {skippedModalities.length}{' '}
              Skipped

            </span>
          )}

        </div>

        {/* =================================================
            GLOBAL PROGRESS
        ================================================== */}

        <div className="w-full max-w-md mx-auto pt-2 space-y-1.5">

          <div className="flex items-center justify-between text-xs">

            <span className="font-semibold text-slate-500">
              Pipeline Progress
            </span>

            <span className="font-bold text-teal-700">
              {progress}%
            </span>

          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">

            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </div>

      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center">

          <p className="font-semibold mb-1">
            Analysis could not be completed
          </p>

          <p>
            {error}
          </p>

        </div>
      )}

      {/* =====================================================
          MODALITY CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {allModalities.map(
          (modality) => {
            const card =
              modalityInfo[
                modality
              ];

            const Icon =
              card.icon;

            const isAvailable =
              Boolean(
                images[modality]
              );

            const isSkipped =
              !isAvailable;

            const availableIndex =
              availableModalities.findIndex(
                (item) =>
                  item === modality
              );

            const isCurrent =
              isProcessing &&
              availableIndex >= 0 &&
              availableIndex ===
                currentModalityIndex;

            const isDone =
              isComplete ||
              (isProcessing &&
                availableIndex >= 0 &&
                availableIndex <
                  currentModalityIndex) ||
              isFusion;

            return (
              <div
                key={modality}
                className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                  isSkipped
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : isDone
                    ? 'bg-white border-teal-200 shadow-sm'
                    : isCurrent
                    ? 'bg-teal-50/40 border-teal-400 shadow-md ring-2 ring-teal-200/50'
                    : 'bg-slate-50/60 border-slate-200/70'
                }`}
              >

                {/* LEFT */}

                <div className="flex items-center gap-3.5 min-w-0">

                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      isSkipped
                        ? 'bg-slate-200 text-slate-400'
                        : isDone
                        ? 'bg-teal-100 text-teal-700'
                        : isCurrent
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >

                    {isSkipped ? (
                      <SkipForward className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}

                  </div>

                  <div className="min-w-0">

                    <h4 className="text-sm font-bold text-slate-900">
                      {card.label}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {card.target}
                    </p>

                    <span className="text-[10px] font-mono text-slate-400">
                      {card.model}
                    </span>

                  </div>

                </div>

                {/* RIGHT STATUS */}

                <div className="shrink-0 ml-3">

                  {isSkipped ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">

                      <SkipForward className="w-3 h-3" />

                      Skipped

                    </span>
                  ) : isDone ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">

                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />

                      Complete

                    </span>
                  ) : isCurrent ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-white px-2.5 py-1 rounded-full border border-teal-300 shadow-sm">

                      <Loader2 className="w-3 h-3 text-teal-600 animate-spin" />

                      Processing...

                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">
                      Queued
                    </span>
                  )}

                </div>

              </div>
            );
          }
        )}

      </div>

      {/* =====================================================
          SKIPPED MODALITIES
      ====================================================== */}

      {skippedModalities.length >
        0 && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">

          <SkipForward className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />

          <div className="space-y-1">

            <p className="text-xs font-bold text-slate-800">
              Skipped modalities are excluded
            </p>

            <p className="text-xs text-slate-500 leading-relaxed">

              {skippedModalities
                .map(
                  (modality) =>
                    modalityInfo[
                      modality
                    ].label
                )
                .join(', ')}{' '}

              {skippedModalities.length ===
              1
                ? 'was'
                : 'were'}{' '}

              not provided and will not be
              processed by the corresponding
              model.

            </p>

          </div>

        </div>
      )}

      {/* =====================================================
          ANALYSIS / FUSION STATUS
      ====================================================== */}

      <div
        className={`p-6 sm:p-7 rounded-3xl border transition-all duration-300 ${
          isFusion || isComplete
            ? 'bg-gradient-to-r from-teal-900 via-slate-900 to-cyan-950 text-white border-teal-500/50 shadow-xl'
            : 'bg-white border-slate-200 opacity-60 text-slate-800'
        }`}
      >

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div className="flex items-center gap-4">

            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isFusion || isComplete
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-400/30'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >

              <Sparkles className="w-6 h-6" />

            </div>

            <div>

              <div className="flex items-center gap-2">

                <h3 className="text-lg font-bold tracking-tight">
                  Model Analysis
                </h3>

                {(isFusion ||
                  isComplete) && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-400/20 text-teal-300 border border-teal-400/40">
                    ACTIVE
                  </span>
                )}

              </div>

              <p
                className={`text-xs mt-0.5 ${
                  isFusion ||
                  isComplete
                    ? 'text-slate-300'
                    : 'text-slate-500'
                }`}
              >

                {isComplete
                  ? 'Model outputs have been generated successfully.'
                  : 'Running the BioLens model pipeline on the submitted images.'}

              </p>

            </div>

          </div>

          <div className="flex-shrink-0">

            {isComplete ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500 text-slate-950 shadow-md">

                <CheckCircle2 className="w-4 h-4" />

                Analysis Complete

              </span>
            ) : isFusion ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-teal-200 border border-white/20">

                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-300" />

                Finalizing Results...

              </span>
            ) : (
              <span className="text-xs text-slate-400">
                Processing
              </span>
            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          SCREENING NOTICE
      ====================================================== */}

      <div className="text-center">

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200">

          Screening prototype • Model outputs are
          not medical diagnoses

        </span>

      </div>

    </div>
  );
};
