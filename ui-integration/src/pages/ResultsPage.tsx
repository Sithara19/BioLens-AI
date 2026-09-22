import React, { useMemo } from 'react';

import {
  FileText,
  Calendar,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  Info,
  CheckCircle2,
  CircleSlash2,
  BarChart3,
} from 'lucide-react';

import {
  ScreeningResult,
  ModalityType,
} from '../types';

import { ConditionCard } from '../components/ConditionCard';
import { ModalityContribution } from '../components/ModalityContribution';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

interface ResultsPageProps {
  result: ScreeningResult;
  onNewScreening: () => void;
}

const ALL_MODALITIES: ModalityType[] = [
  'eye',
  'tongue',
  'nail',
  'palm',
  'skin',
];

const MODALITY_LABELS: Record<
  ModalityType,
  string
> = {
  eye: 'Eye',
  tongue: 'Tongue',
  nail: 'Nail',
  palm: 'Palm',
  skin: 'Skin',
};

export const ResultsPage: React.FC<
  ResultsPageProps
> = ({
  result,
  onNewScreening,
}) => {

  // =========================================================
  // AVAILABLE / SKIPPED MODALITIES
  // =========================================================

  const availableModalities =
    useMemo(
      () =>
        ALL_MODALITIES.filter(
          (modality) =>
            typeof result.images[
              modality
            ] === 'string' &&
            result.images[
              modality
            ].trim().length > 0
        ),
      [result.images]
    );

  const skippedModalities =
    useMemo(
      () =>
        ALL_MODALITIES.filter(
          (modality) =>
            !availableModalities.includes(
              modality
            )
        ),
      [availableModalities]
    );

  const hasPredictions =
    result.predictions.length > 0;

  const formattedDate =
    new Date(
      result.createdAt
    ).toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );

  const availableModalityNames =
    availableModalities.map(
      (modality) =>
        MODALITY_LABELS[
          modality
        ]
    );

  const skippedModalityNames =
    skippedModalities.map(
      (modality) =>
        MODALITY_LABELS[
          modality
        ]
    );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">

      {/* =========================================================
          HEADER
      ========================================================== */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">

        <div>

          <span className="text-xs uppercase font-bold tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">

            BioLens Screening Report

          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">

            Screening Results

          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">

            <Calendar className="w-4 h-4 text-slate-400" />

            <span>
              Analysis completed on {formattedDate}
            </span>

          </p>

        </div>

        <button
          onClick={
            onNewScreening
          }
          className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
        >

          <RotateCcw className="w-3.5 h-3.5" />

          New Screening

        </button>

      </div>

      {/* =========================================================
          SCREENING SCOPE
      ========================================================== */}

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

              Only submitted images were processed by
              the corresponding model pipelines.

            </p>

          </div>

        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">

          {ALL_MODALITIES.map(
            (modality) => {

              const isAvailable =
                availableModalities.includes(
                  modality
                );

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
                      {
                        MODALITY_LABELS[
                          modality
                        ]
                      }
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
            }
          )}

        </div>

        {skippedModalities.length >
          0 && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">

            <Info className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />

            <p className="text-xs text-slate-600 leading-relaxed">

              <strong>
                {
                  skippedModalityNames.join(
                    ', '
                  )
                }
              </strong>{' '}

              {skippedModalityNames.length ===
              1
                ? 'was'
                : 'were'}{' '}

              skipped and were not processed.

            </p>

          </div>
        )}

      </div>

      {/* =========================================================
          OVERALL SUMMARY
      ========================================================== */}

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

              A neutral summary of the generated model outputs.

            </p>

          </div>

        </div>

        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">

          <p className="font-medium text-slate-800">

            {result.overallAssessment.summary}

          </p>

          {result.overallAssessment
            .primaryObservedPatterns
            .length > 0 && (
            <div className="pt-3 border-t border-slate-200/70 space-y-1.5">

              <span className="text-xs font-bold text-slate-600 block">

                Model Output Highlights

              </span>

              <ul className="space-y-1 pl-4 list-disc text-xs text-slate-600">

                {result.overallAssessment
                  .primaryObservedPatterns
                  .map(
                    (
                      pattern,
                      index
                    ) => (
                      <li
                        key={index}
                      >
                        {pattern}
                      </li>
                    )
                  )}

              </ul>

            </div>
          )}

        </div>

      </div>

      {/* =========================================================
          CONDITION PROFILES
      ========================================================== */}

      <div className="space-y-4">

        <div className="flex items-center justify-between gap-4">

          <div>

            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">

              Individual Screening Outputs

            </h3>

            <p className="text-xs text-slate-500">

              Model predictions generated from the submitted images.

            </p>

          </div>

          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">

            {result.predictions.length}{' '}

            {result.predictions.length ===
            1
              ? 'Output'
              : 'Outputs'}

          </span>

        </div>

        {hasPredictions ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {result.predictions.map(
              (prediction) => (
                <ConditionCard
                  key={
                    prediction.condition
                  }
                  prediction={
                    prediction
                  }
                />
              )
            )}

          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">

            <div className="flex flex-col items-center text-center max-w-xl mx-auto">

              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center mb-4">

                <BarChart3 className="w-6 h-6" />

              </div>

              <h4 className="text-base sm:text-lg font-bold text-slate-900">

                No model outputs were generated

              </h4>

              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">

                The submitted images did not produce an
                output from the configured screening models.

              </p>

            </div>

          </div>
        )}

      </div>

      {/* =========================================================
          ANEMIA MODALITY CONTRIBUTION
      ========================================================== */}

      <ModalityContribution
        contributions={
          result.modalityContributions
        }
      />

      {/* =========================================================
          MODEL INTERPRETATION
      ========================================================== */}

      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">

            <BarChart3 className="w-5 h-5" />

          </div>

          <div>

            <h3 className="text-lg font-bold text-slate-900 tracking-tight">

              How to Read These Outputs

            </h3>

            <p className="text-xs text-slate-500">

              Model probabilities and detection confidence
              are not clinical measurements.

            </p>

          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">

            <p className="text-xs font-bold text-slate-800 mb-1">

              Model Prediction

            </p>

            <p className="text-[11px] text-slate-500 leading-relaxed">

              The class selected by the trained model for
              the submitted image or image set.

            </p>

          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">

            <p className="text-xs font-bold text-slate-800 mb-1">

              Model Probability

            </p>

            <p className="text-[11px] text-slate-500 leading-relaxed">

              A model-generated probability associated with
              the predicted class. It is not a medical probability.

            </p>

          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">

            <p className="text-xs font-bold text-slate-800 mb-1">

              Detection Confidence

            </p>

            <p className="text-[11px] text-slate-500 leading-relaxed">

              Tongue detection confidence indicates how strongly
              the detector scored a detected visual class.

            </p>

          </div>

        </div>

      </div>

      {/* =========================================================
          NEXT STEPS
      ========================================================== */}

      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">

            <Stethoscope className="w-5 h-5" />

          </div>

          <div>

            <h3 className="text-lg font-bold text-slate-900 tracking-tight">

              Next Steps

            </h3>

            <p className="text-xs text-slate-500">

              Responsible interpretation of screening outputs

            </p>

          </div>

        </div>

        <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-100 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">

          <p>

            {result.overallAssessment
              .recommendedFollowUp}

          </p>

          <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-600 pt-1">

            <li>
              <strong>
                Do not treat model outputs as a diagnosis.
              </strong>{' '}
              Clinical assessment requires appropriate
              examination and testing.
            </li>

            <li>
              <strong>
                Do not make treatment decisions
              </strong>{' '}
              based solely on BioLens results.
            </li>

            <li>
              If you have persistent symptoms or health
              concerns, discuss them with a qualified
              healthcare professional.
            </li>

          </ul>

        </div>

      </div>

      {/* =========================================================
          MEDICAL DISCLAIMER
      ========================================================== */}

      <MedicalDisclaimer
        variant="card"
      />

    </div>
  );
};