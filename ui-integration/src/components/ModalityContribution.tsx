import React from 'react';
import {
  Eye,
  Layers,
  Smile,
  Hand,
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

interface ModalityConfig {
  key: ModalityType;
  label: string;
  color: string;
  textColor: string;
  lightBg: string;
  borderColor: string;
  icon: React.ElementType;
  description: string;
  participatesInAnemiaFusion: boolean;
}

const MODALITIES: ModalityConfig[] = [
  {
    key: 'eye',
    label: 'Eye',
    color: 'bg-teal-600',
    textColor: 'text-teal-700',
    lightBg: 'bg-teal-50',
    borderColor: 'border-teal-200',
    icon: Eye,
    description:
      'Eye input used by the anemia fusion model.',
    participatesInAnemiaFusion: true,
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
      'Processed by the separate tongue detection model.',
    participatesInAnemiaFusion: false,
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
      'Nail input used by the anemia fusion model.',
    participatesInAnemiaFusion: true,
  },
  {
    key: 'palm',
    label: 'Palm',
    color: 'bg-amber-500',
    textColor: 'text-amber-700',
    lightBg: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: Hand,
    description:
      'Palm input used by the anemia fusion model.',
    participatesInAnemiaFusion: true,
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
      'Processed by the separate skin classification model.',
    participatesInAnemiaFusion: false,
  },
];

export const ModalityContribution: React.FC<
  ModalityContributionProps
> = ({
  contributions,
  className = '',
}) => {
  const getPercentage = (
    modality: ModalityType
  ): number => {
    const value = Number(
      contributions[modality]
    );

    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(
      0,
      Math.min(100, value)
    );
  };

  const fusionModalities =
    MODALITIES.filter(
      (modality) =>
        modality.participatesInAnemiaFusion
    );

  const totalContribution =
    fusionModalities.reduce(
      (total, modality) =>
        total +
        getPercentage(
          modality.key
        ),
      0
    );

  const hasFusionContribution =
    totalContribution > 0;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs ${className}`}
    >

      {/* =======================================================
          HEADER
      ======================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">

        <div>

          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">

            <Layers className="w-5 h-5 text-teal-600" />

            Anemia Fusion Contribution

          </h3>

          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">

            Ablation-based contribution of the Eye, Nail,
            and Palm inputs to the anemia fusion model.

          </p>

        </div>

        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 self-start">

          Model Analysis

        </span>

      </div>

      {/* =======================================================
          ARCHITECTURE SUMMARY
      ======================================================== */}

      <div className="flex flex-wrap gap-2 mb-5">

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 text-[11px] font-semibold">

          <Sparkles className="w-3 h-3" />

          Eye + Nail + Palm

        </span>

        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-[11px] font-semibold">

          Tongue + Skin use separate models

        </span>

      </div>

      {/* =======================================================
          CONTRIBUTION BAR
      ======================================================== */}

      {hasFusionContribution ? (
        <div className="mb-6">

          <div className="flex items-center justify-between mb-2">

            <span className="text-[11px] font-semibold text-slate-500">
              Anemia fusion contribution
            </span>

            <span className="text-[11px] font-bold text-slate-600">
              {Math.round(
                totalContribution
              )}%
            </span>

          </div>

          <div className="w-full h-4 rounded-xl overflow-hidden flex shadow-inner p-0.5 bg-slate-100 border border-slate-200/70">

            {fusionModalities.map(
              (item) => {
                const percentage =
                  getPercentage(
                    item.key
                  );

                if (
                  percentage <= 0
                ) {
                  return null;
                }

                return (
                  <div
                    key={item.key}
                    className={`${item.color} h-full transition-all duration-700 relative`}
                    style={{
                      width: `${percentage}%`,
                    }}
                    title={`${item.label}: ${percentage}%`}
                  />
                );
              }
            )}

          </div>

        </div>
      ) : (
        <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">

          No positive ablation contribution was returned
          for the anemia fusion inputs in this analysis.

        </div>
      )}

      {/* =======================================================
          FIVE MODALITY CARDS
      ======================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

        {MODALITIES.map(
          (item) => {
            const Icon =
              item.icon;

            const percentage =
              getPercentage(
                item.key
              );

            const hasContribution =
              item.participatesInAnemiaFusion &&
              percentage > 0;

            return (
              <div
                key={item.key}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-colors ${
                  item.participatesInAnemiaFusion
                    ? `${item.borderColor} ${item.lightBg}/40`
                    : 'border-slate-200 bg-slate-50/70'
                }`}
              >

                {/* CARD HEADER */}

                <div className="flex items-center justify-between gap-2 mb-2">

                  <span
                    className={`text-xs font-semibold flex items-center gap-1.5 ${
                      item.participatesInAnemiaFusion
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >

                    <Icon
                      className={`w-3.5 h-3.5 ${
                        item.participatesInAnemiaFusion
                          ? item.textColor
                          : 'text-slate-400'
                      }`}
                    />

                    {item.label.toUpperCase()}

                  </span>

                  <span
                    className={`text-sm font-extrabold ${
                      item.participatesInAnemiaFusion
                        ? item.textColor
                        : 'text-slate-400'
                    }`}
                  >

                    {item.participatesInAnemiaFusion
                      ? `${percentage}%`
                      : 'N/A'}

                  </span>

                </div>

                {/* DESCRIPTION */}

                <p
                  className={`text-[11px] leading-snug ${
                    item.participatesInAnemiaFusion
                      ? 'text-slate-500'
                      : 'text-slate-400'
                  }`}
                >

                  {item.description}

                </p>

                {/* STATUS */}

                <div className="mt-3">

                  {item.participatesInAnemiaFusion ? (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md ${
                        hasContribution
                          ? `${item.lightBg} ${item.textColor}`
                          : 'bg-slate-100 text-slate-500'
                      } text-[10px] font-bold`}
                    >

                      {hasContribution
                        ? 'CONTRIBUTION'
                        : '0% CONTRIBUTION'}

                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px] font-bold">

                      SEPARATE MODEL

                    </span>
                  )}

                </div>

              </div>
            );
          }
        )}

      </div>

      {/* =======================================================
          CONTRIBUTION CHECK
      ======================================================== */}

      <div className="mt-5 flex items-center justify-between px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200/70">

        <span className="text-[11px] font-semibold text-slate-500">

          Sum of reported anemia-fusion contributions

        </span>

        <span
          className={`text-xs font-extrabold ${
            Math.abs(
              totalContribution - 100
            ) < 0.01
              ? 'text-teal-700'
              : 'text-slate-600'
          }`}
        >

          {Math.round(
            totalContribution
          )}%

        </span>

      </div>

      {/* =======================================================
          SCIENTIFIC NOTE
      ======================================================== */}

      <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 leading-relaxed">

        <strong className="text-slate-700">
          How this is calculated:
        </strong>{' '}

        The anemia fusion module compares the full
        Eye + Nail + Palm prediction with predictions
        produced after removing one modality at a time.
        Positive changes in the anemia probability are
        normalized into the displayed contribution
        percentages.

        <br />
        <br />

        These values describe the model's computational
        behavior for this screening run. They do
        <strong> not </strong>
        represent clinical importance, diagnostic
        evidence, or medical priority.

        <br />
        <br />

        Tongue and Skin are intentionally marked as
        <strong> separate models </strong>
        because they are not inputs to the current
        anemia fusion model.

      </div>

    </div>
  );
};