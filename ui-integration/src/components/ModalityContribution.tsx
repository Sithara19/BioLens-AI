import React from 'react';
import {
  Eye,
  Layers,
  Smile,
  Sparkles,
} from 'lucide-react';
import {
  ModalityContributions,
  ModalityType,
} from '../types';

interface ModalityContributionProps {
  contributions: ModalityContributions;
  className?: string;
}

const MODALITIES: {
  key: ModalityType;
  label: string;
  color: string;
  textColor: string;
  lightBg: string;
  borderColor: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    key: 'eye',
    label: 'Eye',
    color: 'bg-teal-600',
    textColor: 'text-teal-700',
    lightBg: 'bg-teal-50',
    borderColor: 'border-teal-200',
    icon: Eye,
    description:
      'Visual analysis of submitted eye and lower-eyelid regions',
  },
  {
    key: 'tongue',
    label: 'Tongue',
    color: 'bg-rose-500',
    textColor: 'text-rose-700',
    lightBg: 'bg-rose-50',
    borderColor: 'border-rose-200',
    icon: Smile,
    description:
      'Visual analysis of submitted tongue surface and appearance',
  },
  {
    key: 'nail',
    label: 'Nail',
    color: 'bg-sky-600',
    textColor: 'text-sky-700',
    lightBg: 'bg-sky-50',
    borderColor: 'border-sky-200',
    icon: Layers,
    description:
      'Visual analysis of submitted fingernail and nail-bed region',
  },
  {
    key: 'skin',
    label: 'Skin',
    color: 'bg-blue-600',
    textColor: 'text-blue-700',
    lightBg: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Layers,
    description:
      'Visual analysis of submitted skin color and surface characteristics',
  },
];

export const ModalityContribution: React.FC<
  ModalityContributionProps
> = ({
  contributions,
  className = '',
}) => {
  /**
   * Clamp values to a safe display range.
   *
   * This prevents malformed backend/demo values from creating
   * invalid bar widths.
   */
  const getPercentage = (modality: ModalityType): number => {
    const value = Number(contributions[modality]);

    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(0, Math.min(100, value));
  };

  const totalContribution = MODALITIES.reduce(
    (total, modality) =>
      total + getPercentage(modality.key),
    0
  );

  const analyzedModalities = MODALITIES.filter(
    (modality) =>
      getPercentage(modality.key) > 0
  );

  const skippedModalities = MODALITIES.filter(
    (modality) =>
      getPercentage(modality.key) === 0
  );

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs ${className}`}
    >
      {/* ======================================================= */}
      {/* HEADER                                                  */}
      {/* ======================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-600" />
            AI Modality Contribution
          </h3>

          <p className="text-xs text-slate-500 mt-0.5">
            Contribution distribution across the modalities included
            in multimodal fusion
          </p>
        </div>

        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 self-start sm:self-auto">
          Dynamic Fusion Contribution
        </span>
      </div>

      {/* ======================================================= */}
      {/* SUBMITTED MODALITY SUMMARY                              */}
      {/* ======================================================= */}

      <div className="flex flex-wrap gap-2 mb-5">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 text-[11px] font-semibold">
          <Sparkles className="w-3 h-3" />
          {analyzedModalities.length}{' '}
          {analyzedModalities.length === 1
            ? 'modality'
            : 'modalities'}{' '}
          included
        </span>

        {skippedModalities.length > 0 && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-[11px] font-semibold">
            {skippedModalities.length}{' '}
            {skippedModalities.length === 1
              ? 'modality'
              : 'modalities'}{' '}
            skipped
          </span>
        )}
      </div>

      {/* ======================================================= */}
      {/* STACKED VISUALIZATION BAR                               */}
      {/* ======================================================= */}

      <div className="w-full h-4 rounded-xl overflow-hidden flex shadow-inner mb-6 p-0.5 bg-slate-100 border border-slate-200/70">
        {MODALITIES.map((item) => {
          const percentage =
            getPercentage(item.key);

          /**
           * Don't render a visible segment for 0%.
           * This makes skipped modalities contribute literally
           * nothing to the fusion bar.
           */
          if (percentage <= 0) {
            return null;
          }

          return (
            <div
              key={item.key}
              className={`${item.color} h-full transition-all duration-700 first:rounded-l-lg last:rounded-r-lg relative group`}
              style={{
                width: `${percentage}%`,
              }}
              title={`${item.label}: ${percentage}%`}
            />
          );
        })}
      </div>

      {/* ======================================================= */}
      {/* FOUR MODALITY CARDS                                     */}
      {/* ======================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {MODALITIES.map((item) => {
          const Icon = item.icon;
          const percentage =
            getPercentage(item.key);

          const isAnalyzed = percentage > 0;

          return (
            <div
              key={item.key}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-colors ${
                isAnalyzed
                  ? `${item.borderColor} ${item.lightBg}/40`
                  : 'border-slate-200 bg-slate-50/70'
              }`}
            >
              {/* Card header */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-semibold flex items-center gap-1.5 ${
                    isAnalyzed
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isAnalyzed
                        ? item.textColor
                        : 'text-slate-400'
                    }`}
                  />

                  {item.label.toUpperCase()}
                </span>

                <span
                  className={`text-sm font-extrabold ${
                    isAnalyzed
                      ? item.textColor
                      : 'text-slate-400'
                  }`}
                >
                  {percentage}%
                </span>
              </div>

              {/* Description */}
              <p
                className={`text-[11px] leading-snug ${
                  isAnalyzed
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }`}
              >
                {isAnalyzed
                  ? item.description
                  : 'Skipped — not analyzed and no fusion contribution'}
              </p>

              {/* Status */}
              <div className="mt-3">
                {isAnalyzed ? (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md ${item.lightBg} ${item.textColor} text-[10px] font-bold`}
                  >
                    ANALYZED
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px] font-bold">
                    NOT ANALYZED
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================= */}
      {/* CONTRIBUTION CHECK                                      */}
      {/* ======================================================= */}

      <div className="mt-5 flex items-center justify-between px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200/70">
        <span className="text-[11px] font-semibold text-slate-500">
          Total available contribution
        </span>

        <span
          className={`text-xs font-extrabold ${
            totalContribution === 100
              ? 'text-teal-700'
              : 'text-slate-600'
          }`}
        >
          {totalContribution}%
        </span>
      </div>

      {/* ======================================================= */}
      {/* SCIENTIFIC / ARCHITECTURE DISCLAIMER                    */}
      {/* ======================================================= */}

      <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 leading-relaxed">
        <strong className="text-slate-700">
          Important Architecture Note:
        </strong>{' '}
        These values represent the current prototype's
        computational contribution allocation. A skipped modality
        receives <strong>0%</strong> and does not participate in
        the multimodal fusion calculation.

        <br />
        <br />

        The current prototype may use normalized demonstration
        contributions. These values must{' '}
        <strong>not</strong> be interpreted as clinically validated
        medical importance or organ priority. Final fusion weights
        should be established using the trained models, validation
        experiments, calibration, and appropriate evaluation.
      </div>
    </div>
  );
};
