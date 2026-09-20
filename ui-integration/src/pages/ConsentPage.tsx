
import React from 'react';
import {
  Eye,
  Smile,
  Layers,
  Camera,
  ShieldCheck,
  ArrowRight,
  X,
} from 'lucide-react';

interface ConsentPageProps {
  onAcceptConsent: () => void;
  onCancel: () => void;
}

const modalities = [
  {
    number: '01',
    title: 'Eye',
    subtitle: 'Eye Image',
    description:
      'Capture or upload a photo of your eye and lower eyelid in good lighting.',
    icon: Eye,
  },
  {
    number: '02',
    title: 'Tongue',
    subtitle: 'Tongue Image',
    description:
      'Capture or upload a clear photo of the visible tongue surface in good, even lighting.',
    icon: Smile,
  },
  {
    number: '03',
    title: 'Nail',
    subtitle: 'Fingernail Image',
    description:
      'Capture or upload a photo of your fingernail against a plain background.',
    icon: Layers,
  },
  {
    number: '04',
    title: 'Skin',
    subtitle: 'Skin Area Image',
    description:
      'Capture or upload a photo of a clear area of skin in even lighting.',
    icon: Layers,
  },
];

export function ConsentPage({
  onAcceptConsent,
  onCancel,
}: ConsentPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-5xl">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-8 text-center">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50">
            <ShieldCheck
              className="h-7 w-7 text-teal-600"
              strokeWidth={1.8}
            />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Start Your BioLens Screening
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            BioLens analyzes images from multiple body regions
            and combines AI-generated predictions to provide
            preliminary health-risk screening information.
          </p>

        </div>

        {/* =====================================================
            MODALITY CAPTURE SEQUENCE
        ====================================================== */}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

          <div className="mb-6">

            <h2 className="text-lg font-semibold text-slate-900">
              Required Modality Capture Sequence
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              You will be guided through four sequential image
              captures. You may skip any modality during capture.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            {modalities.map((modality) => {
              const Icon = modality.icon;

              return (
                <div
                  key={modality.title}
                  className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition hover:border-teal-200 hover:bg-teal-50/30"
                >

                  {/* Step Number */}

                  <div className="absolute right-4 top-4 text-xs font-bold tracking-wider text-slate-300">
                    {modality.number}
                  </div>

                  {/* Icon */}

                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">

                    <Icon
                      className="h-5 w-5 text-teal-600"
                      strokeWidth={1.8}
                    />

                  </div>

                  {/* Text */}

                  <h3 className="text-base font-semibold text-slate-900">
                    {modality.title}
                  </h3>

                  <p className="mt-1 text-sm font-medium text-teal-700">
                    {modality.subtitle}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {modality.description}
                  </p>

                  {/* Camera / Upload */}

                  <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">

                    <Camera className="h-4 w-4" />

                    <span>
                      Camera or upload supported
                    </span>

                  </div>

                </div>
              );
            })}

          </div>

        </section>

        {/* =====================================================
            DATA HANDLING
        ====================================================== */}

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">

          <div className="flex gap-3">

            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />

            <div>

              <h3 className="text-sm font-semibold text-slate-800">
                Data Handling &amp; Privacy
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                All images submitted for this prototype remain
                processed within your active browser session or
                client-configured endpoint. No biometric identifiers
                are permanently shared with commercial advertisers.
              </p>

            </div>

          </div>

        </div>

        {/* =====================================================
            MEDICAL DISCLAIMER
        ====================================================== */}

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">

          <div className="flex gap-3">

            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

            <div>

              <h3 className="text-sm font-semibold text-slate-900">
                Medical Disclaimer &amp; Screening Notice
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                BioLens AI is an AI-based preliminary health-risk
                screening tool. Its results are{' '}
                <strong>not a medical diagnosis</strong> and should
                not replace professional medical advice, clinical
                examination, laboratory testing, or treatment.
                Always consult a qualified healthcare professional
                for appropriate medical evaluation and guidance.
              </p>

            </div>

          </div>

        </div>

        {/* =====================================================
            ACTION BUTTONS
        ====================================================== */}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">

          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <X className="h-4 w-4" />

            Cancel &amp; Return to Dashboard
          </button>

          <button
            type="button"
            onClick={onAcceptConsent}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
          >
            Continue to Eye Capture

            <ArrowRight className="h-4 w-4" />
          </button>

        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="mt-8 border-t border-slate-200 pt-5 text-center">

          <p className="text-sm font-semibold text-slate-700">
            BioLens AI
          </p>

          <p className="mt-1 text-xs italic text-slate-400">
            See Beyond the Surface.
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Multimodal Health-Risk Screening Research Prototype
          </p>

        </div>

      </div>

    </div>
  );
}
