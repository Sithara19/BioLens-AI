import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import {
  Prediction,
  ModalityType,
  RiskLevel,
} from '../types';
import { ConfidenceBar } from './ConfidenceBar';

interface ConditionCardProps {
  prediction: Prediction;
  onViewAttention?: (modality: ModalityType) => void;
}

const MODALITY_LABELS: Record<ModalityType, string> = {
  eye: 'Eye',
  tongue: 'Tongue',
  nail: 'Nail',
  skin: 'Skin',
};

export const ConditionCard: React.FC<ConditionCardProps> = ({
  prediction,
  onViewAttention,
}) => {
  const [expanded, setExpanded] = useState(false);

  /**
   * Return the visual risk badge configuration.
   *
   * These labels describe the observed screening output.
   * They should not be interpreted as a medical diagnosis.
   */
  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'high':
        return {
          label: 'Higher Observed Risk',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          icon: AlertCircle,
        };

      case 'moderate':
        return {
          label: 'Moderate Observed Risk',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          icon: AlertCircle,
        };

      case 'low':
      default:
        return {
          label: 'Low Observed Risk',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          icon: CheckCircle2,
        };
    }
  };

  const badge = getRiskBadge(prediction.riskLevel);
  const BadgeIcon = badge.icon;

  /**
   * Only modalities supplied by the prediction are displayed.
   *
   * The API layer already removes skipped modalities from this list.
   */
  const supportingModalities = prediction.modalities.filter(
    (modality) =>
      modality in MODALITY_LABELS
  );

  /**
   * Safely choose a modality for the attention-map button.
   *
   * If the prediction has no supporting modality, don't attempt
   * to open an attention map.
   */
  const attentionModality =
    supportingModalities.length > 0
      ? supportingModalities[0]
      : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden">

      {/* ========================================================= */}
      {/* MAIN CARD                                                 */}
      {/* ========================================================= */}

      <div className="p-5 sm:p-6">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
              Screening Category
            </span>

            <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
              {prediction.condition}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${badge.dot}`}
              />

              <BadgeIcon className="w-3.5 h-3.5" />

              {badge.label}
            </span>
          </div>
        </div>

        {/* ======================================================= */}
        {/* DESCRIPTION                                              */}
        {/* ======================================================= */}

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-150 mb-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {prediction.description}
        </div>

        {/* ======================================================= */}
        {/* CONFIDENCE                                               */}
        {/* ======================================================= */}

        <div className="mb-4">
          <ConfidenceBar
            confidence={prediction.probability}
            riskLevel={prediction.riskLevel}
          />
        </div>

        {/* ======================================================= */}
        {/* SUPPORTING MODALITIES                                    */}
        {/* ======================================================= */}

        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">

          <span className="text-xs font-medium text-slate-500 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Supporting Modalities:
          </span>

          {supportingModalities.length > 0 ? (
            supportingModalities.map((modality) => (
              <span
                key={modality}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50/80 border border-teal-200/60 text-teal-800 text-xs font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />

                {MODALITY_LABELS[modality]}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400">
              No modality data available
            </span>
          )}

          {/* Expand button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 py-1 px-2 rounded-md hover:bg-teal-50 transition-colors"
          >
            {expanded
              ? 'Hide Details'
              : 'View Observed Features'}

            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* EXPANDABLE DETAILS                                        */}
      {/* ========================================================= */}

      {expanded && (
        <div className="bg-slate-50/80 border-t border-slate-200/70 p-5 space-y-3.5 text-xs text-slate-600 animate-fadeIn">

          {/* Screening rationale */}
          {prediction.clinicalSignificance && (
            <div>
              <h5 className="font-semibold text-slate-800 mb-1 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />

                Screening Rationale &amp; Biomarker Correlates
              </h5>

              <p className="leading-relaxed pl-4 border-l-2 border-teal-400">
                {prediction.clinicalSignificance}
              </p>
            </div>
          )}

          {/* Observed features */}
          {prediction.observedFeatures &&
            prediction.observedFeatures.length > 0 && (
              <div>
                <h5 className="font-semibold text-slate-800 mb-1.5">
                  Model Visual Feature Activations:
                </h5>

                <ul className="space-y-1.5 pl-4 list-disc text-slate-700">
                  {prediction.observedFeatures.map(
                    (feature, index) => (
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

          {/* Attention map */}
          {onViewAttention &&
            attentionModality && (
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                <span className="text-[11px] text-slate-400">
                  Experimental attention visualization available
                  for submitted input modalities.
                </span>

                <button
                  onClick={() =>
                    onViewAttention(attentionModality)
                  }
                  className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-teal-700 hover:bg-teal-50 font-medium text-xs shadow-2xs transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />

                  Inspect Attention Overlay
                </button>
              </div>
            )}

          {/* Prototype notice */}
          <div className="pt-2 border-t border-slate-200/70">
            <p className="text-[10px] text-slate-400 leading-relaxed">
              The current BioLens prototype uses simulated
              screening outputs and experimental attention
              visualizations. These results are not a medical
              diagnosis and should not be used to make treatment
              decisions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
