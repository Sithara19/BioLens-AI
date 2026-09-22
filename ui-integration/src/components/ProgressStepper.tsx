import React from 'react';
import {
  Check,
  Eye,
  Smile,
  Layers,
  Hand,
} from 'lucide-react';

import { ModalityType } from '../types';

interface ProgressStepperProps {
  currentModality: ModalityType;
  completedModalities: ModalityType[];
}

export const ProgressStepper: React.FC<
  ProgressStepperProps
> = ({
  currentModality,
  completedModalities,
}) => {
  // =========================================================
  // FIVE MODALITY STEPS
  //
  // Eye -> Tongue -> Nail -> Palm -> Skin
  // =========================================================

  const steps: {
    id: ModalityType;
    number: string;
    label: string;
    icon: React.ComponentType<{
      className?: string;
    }>;
  }[] = [
    {
      id: 'eye',
      number: '01',
      label: 'Eye',
      icon: Eye,
    },
    {
      id: 'tongue',
      number: '02',
      label: 'Tongue',
      icon: Smile,
    },
    {
      id: 'nail',
      number: '03',
      label: 'Nail',
      icon: Layers,
    },
    {
      id: 'palm',
      number: '04',
      label: 'Palm',
      icon: Hand,
    },
    {
      id: 'skin',
      number: '05',
      label: 'Skin',
      icon: Layers,
    },
  ];

  // =========================================================
  // CURRENT STEP
  // =========================================================

  const currentIndex = steps.findIndex(
    (step) => step.id === currentModality
  );

  // =========================================================
  // PROGRESS
  // =========================================================

  const progressPercentage =
    currentIndex <= 0
      ? 0
      : (currentIndex / (steps.length - 1)) * 100;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 px-2">

      <div className="relative flex items-center justify-between">

        {/* Background connecting line */}
        <div className="absolute left-5 right-5 top-1/2 z-0 h-0.5 -translate-y-1/2 bg-slate-200" />

        {/* Active progress line */}
        <div
          className="absolute left-5 top-1/2 z-0 h-0.5 -translate-y-1/2 bg-teal-500 transition-all duration-500"
          style={{
            width:
              progressPercentage === 0
                ? '0%'
                : `calc(${progressPercentage}% - 10px)`,
          }}
        />

        {/* Steps */}
        {steps.map((step) => {
          const isCurrent =
            step.id === currentModality;

          const isCompleted =
            completedModalities.includes(step.id);

          const StepIcon = step.icon;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center"
            >

              {/* Step circle */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold shadow-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-teal-600 text-white ring-4 ring-teal-100'
                    : isCurrent
                    ? 'border-2 border-teal-600 bg-white text-teal-700 ring-4 ring-teal-50'
                    : 'border border-slate-200 bg-white text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 stroke-[3]" />
                ) : (
                  <StepIcon className="h-4 w-4" />
                )}
              </div>

              {/* Label */}
              <div className="mt-2 text-center">
                <span
                  className={`block text-xs font-semibold transition-colors ${
                    isCurrent
                      ? 'text-teal-700'
                      : isCompleted
                      ? 'text-slate-700'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
};