import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Eye,
  Smile,
  Layers,
  Cpu,
  GitMerge,
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
  images: Record<
    ModalityType,
    string
  >;
  onAnalysisComplete: (
    result: ScreeningResult
  ) => void;
}

export const AnalysisPage: React.FC<
  AnalysisPageProps
> = ({
  images,
  onAnalysisComplete,
}) => {
  // =========================================================
  // PHASE
  //
  // 0 = Initializing
  // 1 = First available modality
  // 2 = Second available modality
  // 3 = Third available modality
  // 4 = Fourth available modality
  // 5 = Multimodal Fusion
  // 6 = Completed
  // =========================================================

  const [phase, setPhase] =
    useState<number>(0);

  const [progress, setProgress] =
    useState<number>(10);

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
        'Eye and eyelid color & clarity analysis',
      model:
        'BioLens Vision Model (Eye)',
      icon: Eye,
    },

    tongue: {
      label: 'Tongue',
      target:
        'Tongue surface color & visual pattern analysis',
      model:
        'BioLens Vision Model (Tongue)',
      icon: Smile,
    },

    nail: {
      label: 'Nail',
      target:
        'Fingernail and nail bed color analysis',
      model:
        'BioLens Vision Model (Nail)',
      icon: Layers,
    },

    skin: {
      label: 'Skin',
      target:
        'Skin tone and surface analysis',
      model:
        'BioLens Vision Model (Skin)',
      icon: Layers,
    },
  };

  // =========================================================
  // DETERMINE WHICH MODALITIES ARE AVAILABLE
  //
  // IMPORTANT:
  // Empty string means skipped/not provided.
  // Those modalities are excluded from analysis.
  // =========================================================

  const availableModalities =
    useMemo(
      () =>
        (
          [
            'eye',
            'tongue',
            'nail',
            'skin',
          ] as ModalityType[]
        ).filter(
          (modality) =>
            Boolean(images[modality])
        ),
      [images]
    );

  const skippedModalities =
    useMemo(
      () =>
        (
          [
            'eye',
            'tongue',
            'nail',
            'skin',
          ] as ModalityType[]
        ).filter(
          (modality) =>
            !images[modality]
        ),
      [images]
    );

  const availableCount =
    availableModalities.length;

  // =========================================================
  // ANALYSIS PIPELINE
  // =========================================================

  useEffect(() => {
    let isMounted = true;

    const runAnalysis = async () => {
      try {
        setError(null);
        setPhase(0);
        setProgress(10);

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
        // PROCESS ONLY AVAILABLE MODALITIES
        // -----------------------------------------------------

        for (
          let index = 0;
          index <
          availableModalities.length;
          index++
        ) {
          const modality =
            availableModalities[
              index
            ];

          if (!isMounted) return;

          /*
           * Phase 1-4 represents the position
           * of the currently processed available
           * modality.
           */
          const modalityPhase =
            index + 1;

          setPhase(
            modalityPhase
          );

          /*
           * Reserve the first ~85% of the
           * progress bar for modality processing.
           */
          const modalityProgress =
            20 +
            Math.round(
              ((index + 1) /
                availableModalities.length) *
                65
            );

          setProgress(
            modalityProgress
          );

          /*
           * Placeholder delay for the current
           * frontend demo.
           *
           * Later this section will call the
           * corresponding trained model/API.
           */
          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                750
              )
          );

          if (!isMounted)
            return;

          console.log(
            `Processing modality: ${modality}`
          );
        }

        // -----------------------------------------------------
        // MULTIMODAL FUSION
        // -----------------------------------------------------

        if (!isMounted) return;

        setPhase(5);
        setProgress(92);

        /*
         * The API receives the complete image object.
         *
         * The backend/service layer is responsible for
         * considering only non-empty modalities.
         */
        const result =
          await api.analyzeScreening(
            images
          );

        /*
         * Small delay so the user can see the
         * fusion stage in the UI.
         */
        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              900
            )
        );

        if (!isMounted)
          return;

        // -----------------------------------------------------
        // COMPLETED
        // -----------------------------------------------------

        setPhase(6);
        setProgress(100);

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              400
            )
        );

        if (!isMounted)
          return;

        onAnalysisComplete(
          result
        );
      } catch (err: any) {
        if (isMounted) {
          setError(
            err?.message ||
              'An error occurred during analysis.'
          );
        }
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
  // CARD DATA
  //
  // ALL FOUR MODALITIES ARE DISPLAYED.
  // A skipped modality is visibly excluded.
  // =========================================================

  const cards: {
    key: ModalityType;
    label: string;
    target: string;
    model: string;
    icon: React.ComponentType<{
      className?: string;
    }>;
  }[] =
    (
      [
        'eye',
        'tongue',
        'nail',
        'skin',
      ] as ModalityType[]
    ).map((key) => ({
      key,
      ...modalityInfo[key],
    }));

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8 animate-in fade-in duration-300">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="text-center max-w-2xl mx-auto space-y-3">

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold">

          <Cpu className="w-3.5 h-3.5 text-teal-600 animate-spin" />

          Neural Pipeline Execution

        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Analyzing Your Images
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          BioLens is analyzing only the
          image modalities you provided.
          Skipped modalities are excluded
          from the screening pipeline.
        </p>

        {/* =================================================
            AVAILABLE MODALITY SUMMARY
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
            GLOBAL PROGRESS BAR
        ================================================== */}

        <div className="w-full max-w-md mx-auto pt-2 space-y-1.5">

          <div className="flex items-center justify-between text-xs">

            <span className="font-semibold text-slate-500">
              Pipeline Execution
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
          {error}
        </div>
      )}

      {/* =====================================================
          MODALITY PROCESSING CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {cards.map(
          (card, index) => {
            const Icon =
              card.icon;

            const isAvailable =
              Boolean(
                images[
                  card.key
                ]
              );

            /*
             * If skipped, it should never be
             * considered current or complete.
             */
            const isSkipped =
              !isAvailable;

            const availableIndex =
              availableModalities.findIndex(
                (modality) =>
                  modality ===
                  card.key
              );

            const cardPhase =
              availableIndex >= 0
                ? availableIndex + 1
                : -1;

            const isDone =
              isAvailable &&
              phase >
                cardPhase;

            const isCurrent =
              isAvailable &&
              phase ===
                cardPhase;

            return (
              <div
                key={card.key}
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

                {/* =================================================
                    LEFT SIDE
                ================================================== */}

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

                {/* =================================================
                    RIGHT STATUS
                ================================================== */}

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
          SKIPPED MODALITIES INFORMATION
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

              not provided.{' '}

              {skippedModalities.length ===
              1
                ? 'It will'
                : 'They will'}{' '}

              not be analyzed or contribute
              to multimodal fusion.

            </p>

          </div>

        </div>
      )}

      {/* =====================================================
          MULTIMODAL FUSION
      ====================================================== */}

      <div
        className={`p-6 sm:p-7 rounded-3xl border transition-all duration-300 ${
          phase >= 5
            ? 'bg-gradient-to-r from-teal-900 via-slate-900 to-cyan-950 text-white border-teal-500/50 shadow-xl'
            : 'bg-white border-slate-200 opacity-60 text-slate-800'
        }`}
      >

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div className="flex items-center gap-4">

            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                phase >= 5
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-400/30'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <GitMerge className="w-6 h-6" />
            </div>

            <div>

              <div className="flex items-center gap-2">

                <h3 className="text-lg font-bold tracking-tight">
                  Multimodal Fusion
                </h3>

                {phase >= 5 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-400/20 text-teal-300 border border-teal-400/40">
                    ACTIVE
                  </span>
                )}

              </div>

              <p
                className={`text-xs mt-0.5 ${
                  phase >= 5
                    ? 'text-slate-300'
                    : 'text-slate-500'
                }`}
              >
                Combining information only from the available visual modalities.
              </p>

            </div>

          </div>

          <div className="flex-shrink-0">

            {phase >= 6 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500 text-slate-950 shadow-md">

                <CheckCircle2 className="w-4 h-4" />

                Fusion Complete

              </span>
            ) : phase === 5 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-teal-200 border border-white/20">

                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-300" />

                Combining{' '}
                {availableCount}{' '}
                {availableCount === 1
                  ? 'Modality'
                  : 'Modalities'}
                ...

              </span>
            ) : (
              <span className="text-xs text-slate-400">
                Waiting for models
              </span>
            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          DEMO NOTICE
      ====================================================== */}

      <div className="text-center">

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">

          Demo Mode — AI models simulated locally
          (ready for FastAPI model serving backend)

        </span>

      </div>

    </div>
  );
};
