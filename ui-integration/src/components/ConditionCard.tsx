import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
} from 'lucide-react';

import {
  Prediction,
  ModalityType,
} from '../types';

import { ConfidenceBar } from './ConfidenceBar';

interface ConditionCardProps {
  prediction: Prediction;
}

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

export const ConditionCard: React.FC<
  ConditionCardProps
> = ({
  prediction,
}) => {
  const [expanded, setExpanded] =
    useState(false);

  const supportingModalities =
    prediction.modalities.filter(
      (modality) =>
        modality in MODALITY_LABELS
    );

  /*
   * The frontend no longer interprets model probability
   * as clinical risk. The backend returns model probabilities
   * or detection confidence, depending on the module.
   */
  const isTonguePrediction =
    prediction.condition
      .toLowerCase()
      .includes('tongue');

  const probabilityLabel =
    isTonguePrediction
      ? 'Model Detection Confidence'
      : 'Model Probability';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden">

      {/* =========================================================
          MAIN CARD
      ========================================================== */}

      <div className="p-5 sm:p-6">

        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">

          <div>

            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
              Screening Category
            </span>

            <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
              {prediction.condition}
            </h3>

          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-teal-200 bg-teal-50 text-teal-700">

            <span className="w-2 h-2 rounded-full bg-teal-500" />

            Model Prediction

          </span>

        </div>

        {/* DESCRIPTION */}

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-4 text-xs sm:text-sm text-slate-700 leading-relaxed">

          {prediction.description}

        </div>

        {/* PROBABILITY */}

        <div className="mb-4">

          <div className="flex items-center justify-between mb-2">

            <span className="text-xs font-semibold text-slate-600">
              {probabilityLabel}
            </span>

            <span className="text-sm font-bold text-slate-900">
              {Math.round(
                prediction.probability * 100
              )}
              %
            </span>

          </div>

          <ConfidenceBar
            confidence={
              prediction.probability
            }
            riskLevel={
              prediction.riskLevel
            }
          />

          <p className="text-[10px] text-slate-400 mt-1.5">
            This value represents the model output for
            the submitted image(s), not a clinical probability
            or confirmed diagnosis.
          </p>

        </div>

        {/* SUPPORTING MODALITIES */}

        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">

          <span className="text-xs font-medium text-slate-500 mr-1 flex items-center gap-1">

            <Sparkles className="w-3.5 h-3.5 text-teal-600" />

            Input:

          </span>

          {supportingModalities.length >
          0 ? (
            supportingModalities.map(
              (modality) => (
                <span
                  key={modality}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50/80 border border-teal-200/60 text-teal-800 text-xs font-medium"
                >

                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />

                  {
                    MODALITY_LABELS[
                      modality
                    ]
                  }

                </span>
              )
            )
          ) : (
            <span className="text-xs text-slate-400">
              No modality data available
            </span>
          )}

          <button
            onClick={() =>
              setExpanded(!expanded)
            }
            className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 py-1 px-2 rounded-md hover:bg-teal-50 transition-colors"
          >

            {expanded
              ? 'Hide Details'
              : 'View Details'}

            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}

          </button>

        </div>

      </div>

      {/* =========================================================
          EXPANDABLE DETAILS
      ========================================================== */}

      {expanded && (
        <div className="bg-slate-50/80 border-t border-slate-200/70 p-5 space-y-4 text-xs text-slate-600 animate-fadeIn">

          {/* SCREENING RATIONALE */}

          {prediction.clinicalSignificance && (
            <div>

              <h5 className="font-semibold text-slate-800 mb-1 flex items-center gap-1">

                <Info className="w-3.5 h-3.5 text-slate-500" />

                Model Context

              </h5>

              <p className="leading-relaxed pl-4 border-l-2 border-teal-400">
                {prediction.clinicalSignificance}
              </p>

            </div>
          )}

          {/* OBSERVED FEATURES */}

          {prediction.observedFeatures &&
            prediction.observedFeatures.length >
              0 && (
              <div>

                <h5 className="font-semibold text-slate-800 mb-1.5">
                  Model Output Details
                </h5>

                <ul className="space-y-1.5 pl-4 list-disc text-slate-700">

                  {prediction.observedFeatures.map(
                    (
                      feature,
                      index
                    ) => (
                      <li
                        key={index}
                        className="leading-relaxed"
                      >
                        {feature}
                      </li>
                    )
                  )}

                </ul>

              </div>
            )}

          {/* DISCLAIMER */}

          <div className="pt-3 border-t border-slate-200/70">

            <p className="text-[10px] text-slate-400 leading-relaxed">

              BioLens provides model-based screening
              outputs from submitted images. These outputs
              are not medical diagnoses and should not be
              used alone to make treatment decisions.

            </p>

          </div>

        </div>
      )}

    </div>
  );
};