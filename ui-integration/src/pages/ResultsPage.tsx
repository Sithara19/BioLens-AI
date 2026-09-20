import React, { useMemo, useState } from 'react';
import {
  FileText,
  Calendar,
  HelpCircle,
  Eye,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  Info,
  CheckCircle2,
  CircleSlash2,
} from 'lucide-react';
import {
  ScreeningResult,
  ModalityType,
} from '../types';
import { ConditionCard } from '../components/ConditionCard';
import { ModalityContribution } from '../components/ModalityContribution';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';
import { AttentionModal } from '../components/AttentionModal';

interface ResultsPageProps {
  result: ScreeningResult;
  onNewScreening: () => void;
}

const ALL_MODALITIES: ModalityType[] = [
  'eye',
  'tongue',
  'nail',
  'skin',
];

const MODALITY_LABELS: Record<ModalityType, string> = {
  eye: 'Eye',
  tongue: 'Tongue',
  nail: 'Nail',
  skin: 'Skin',
};

export const ResultsPage: React.FC<ResultsPageProps> = ({
  result,
  onNewScreening,
}) => {
  const [attentionModalOpen, setAttentionModalOpen] =
    useState(false);

  const [targetAttentionModality, setTargetAttentionModality] =
    useState<ModalityType>('eye');

  /**
   * Determine which modalities actually contain images.
   *
   * Empty string means the user skipped that modality.
   */
  const availableModalities = useMemo(
    () =>
      ALL_MODALITIES.filter(
        (modality) =>
          typeof result.images[modality] === 'string' &&
          result.images[modality].trim().length > 0
      ),
    [result.images]
  );

  const skippedModalities = useMemo(
    () =>
      ALL_MODALITIES.filter(
        (modality) => !availableModalities.includes(modality)
      ),
    [availableModalities]
  );

  const hasPredictions = result.predictions.length > 0;

  /**
   * Pick the first modality that was actually analyzed.
   *
   * This prevents the attention button from opening an Eye map
   * when the user skipped Eye.
   */
  const firstAvailableModality =
    availableModalities[0] || 'eye';

  const handleOpenAttention = (
    modality: ModalityType = firstAvailableModality
  ) => {
    /**
     * Never open an attention map for a skipped modality.
     */
    if (!availableModalities.includes(modality)) {
      if (availableModalities.length === 0) {
        return;
      }

      setTargetAttentionModality(firstAvailableModality);
    } else {
      setTargetAttentionModality(modality);
    }

    setAttentionModalOpen(true);
  };

  const formattedDate = new Date(
    result.createdAt
  ).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const availableModalityNames = availableModalities.map(
    (modality) => MODALITY_LABELS[modality]
  );

  const skippedModalityNames = skippedModalities.map(
    (modality) => MODALITY_LABELS[modality]
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">

      {/* ========================================================= */}
      {/* DEMO MODE BANNER                                          */}
      {/* ========================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-md bg-amber-600 text-white font-black text-xs tracking-wider uppercase">
            DEMO RESULT
          </span>

          <span className="text-xs font-semibold">
            Demo Mode — deep learning models are simulated locally.
            These outputs are not clinical diagnostic inferences.
          </span>
        </div>

        <div className="text-[11px] font-mono text-amber-800/80">
          Session ID: {result.sessionId}
        </div>
      </div>

      {/* ========================================================= */}
      {/* PAGE HEADER                                                */}
      {/* ========================================================= */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
            Multimodal Neural Screening Report
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
            Your Screening Results
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>
              Screening Session completed on {formattedDate}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {availableModalities.length > 0 && (
            <button
              onClick={() =>
                handleOpenAttention(firstAvailableModality)
              }
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-2 shadow-2xs transition-colors"
            >
              <Eye className="w-4 h-4 text-teal-600" />
              View AI Attention
            </button>
          )}

          <button
            onClick={onNewScreening}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Screening
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUBMITTED / SKIPPED MODALITIES                            */}
      {/* ========================================================= */}

      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Images Included in Screening
            </h2>

            <p className="text-xs text-slate-500">
              Only submitted images were passed to the screening pipeline
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ALL_MODALITIES.map((modality) => {
            const isAvailable =
              availableModalities.includes(modality);

            return (
              <div
                key={modality}
                className={`rounded-2xl border p-4 ${
                  isAvailable
                    ? 'border-teal-200 bg-teal-50/40'
                    : 'border-slate-200 bg-slate-50/70'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-sm font-bold ${
                      isAvailable
                        ? 'text-teal-900'
                        : 'text-slate-500'
                    }`}
                  >
                    {MODALITY_LABELS[modality]}
                  </span>

                  {isAvailable ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  ) : (
                    <CircleSlash2 className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                <p
                  className={`text-[11px] mt-1 ${
                    isAvailable
                      ? 'text-teal-700'
                      : 'text-slate-500'
                  }`}
                >
                  {isAvailable
                    ? 'Analyzed'
                    : 'Skipped — not analyzed'}
                </p>
              </div>
            );
          })}
        </div>

        {skippedModalities.length > 0 && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <Info className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />

            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>
                {skippedModalityNames.join(', ')}
              </strong>{' '}
              {skippedModalityNames.length === 1
                ? 'was'
                : 'were'}{' '}
              skipped. These modalities were not analyzed and
              have no contribution to the multimodal result.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* OVERALL SCREENING SUMMARY                                 */}
      {/* ========================================================= */}

      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Overall Screening Summary
            </h2>

            <p className="text-xs text-slate-500">
              Aggregated assessment from the submitted modalities
            </p>
          </div>
        </div>

        {/* Neutral / No Significant Risk State */}
        {!hasPredictions ? (
          <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mt-0.5 shrink-0" />

              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-emerald-900">
                  No significant visual risk indicators identified
                </h3>

                <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                  {result.overallAssessment.summary}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-150 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
            <p className="font-medium text-slate-800">
              {result.overallAssessment.summary}
            </p>

            <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
              <span className="text-xs font-bold text-slate-600 block">
                Primary Observed Indicators Across Submitted Modalities:
              </span>

              <ul className="space-y-1 pl-4 list-disc text-xs text-slate-600">
                {result.overallAssessment.primaryObservedPatterns.map(
                  (pattern, index) => (
                    <li key={index}>{pattern}</li>
                  )
                )}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* CONDITION SCREENING PROFILES                              */}
      {/* ========================================================= */}

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Individual Condition Screening Profiles
            </h3>

            <p className="text-xs text-slate-500">
              Preliminary visual patterns identified from submitted images
            </p>
          </div>

          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
            {result.predictions.length}{' '}
            {result.predictions.length === 1
              ? 'Category'
              : 'Categories'}{' '}
            Analyzed
          </span>
        </div>

        {hasPredictions ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.predictions.map((prediction) => (
              <ConditionCard
                key={prediction.condition}
                prediction={prediction}
                onViewAttention={handleOpenAttention}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col items-center text-center max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <h4 className="text-base sm:text-lg font-bold text-slate-900">
                No significant visual risk patterns were flagged
              </h4>

              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                The submitted images did not produce a significant
                risk pattern in the current screening pipeline.
                This does not rule out a medical condition and
                should not be interpreted as a diagnosis.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODALITY CONTRIBUTION                                     */}
      {/* ========================================================= */}

      <ModalityContribution
        contributions={result.modalityContributions}
      />

      {/* ========================================================= */}
      {/* EXPLAINABILITY                                            */}
      {/* ========================================================= */}

      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-teal-600" />
              Why did BioLens generate this screening result?
            </h3>

            <p className="text-xs text-slate-500 mt-0.5">
              Experimental visual attention for submitted modalities
            </p>
          </div>

          {availableModalities.length > 0 && (
            <button
              onClick={() =>
                handleOpenAttention(firstAvailableModality)
              }
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100/70 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Eye className="w-4 h-4" />
              View AI Attention Maps
            </button>
          )}
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          BioLens evaluates visual features from the images that
          were actually submitted for screening. The multimodal
          layer combines information from the available modalities
          rather than treating skipped images as normal findings.
        </p>

        {availableModalityNames.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {availableModalityNames.map((name) => (
              <span
                key={name}
                className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 text-[11px] font-semibold"
              >
                ✓ {name} analyzed
              </span>
            ))}

            {skippedModalityNames.map((name) => (
              <span
                key={name}
                className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-[11px] font-semibold"
              >
                — {name} skipped
              </span>
            ))}
          </div>
        )}

        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <Info className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Attention maps shown in the current prototype are
            experimental visualizations. They should not be
            interpreted as proof that a particular anatomical
            region is medically abnormal.
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* NEXT STEPS                                                */}
      {/* ========================================================= */}

      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              What should you do next?
            </h3>

            <p className="text-xs text-slate-500">
              Guidance on interpreting screening results responsibly
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-100 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
          <p>
            {result.overallAssessment.recommendedFollowUp}
          </p>

          <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-600 pt-1">
            <li>
              <strong>
                Do not make treatment decisions
              </strong>{' '}
              or alter prescribed therapies based on BioLens
              screening results.
            </li>

            <li>
              <strong>
                Do not self-prescribe
              </strong>{' '}
              medications or high-dose nutritional supplements
              based on these results.
            </li>

            <li>
              If you have persistent symptoms or health concerns,
              discuss them with a qualified healthcare professional
              who can perform appropriate clinical evaluation and
              testing.
            </li>
          </ul>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MEDICAL DISCLAIMER                                        */}
      {/* ========================================================= */}

      <MedicalDisclaimer variant="card" />

      {/* ========================================================= */}
      {/* ATTENTION MAP MODAL                                       */}
      {/* ========================================================= */}

      <AttentionModal
        isOpen={attentionModalOpen}
        onClose={() => setAttentionModalOpen(false)}
        result={result}
        initialModality={targetAttentionModality}
      />
    </div>
  );
};
