import React from 'react';
import {
  Eye,
  Hand,
  HeartPulse,
  Image as ImageIcon,
  Microscope,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Upload,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const modalities = [
  {
    number: '01',
    title: 'Eye',
    description:
      'Visual screening from eye images for diabetes and jaundice model outputs.',
    icon: Eye,
  },
  {
    number: '02',
    title: 'Tongue',
    description:
      'Visual analysis of the tongue surface for detected visual findings.',
    icon: HeartPulse,
  },
  {
    number: '03',
    title: 'Nail',
    description:
      'Visual screening of fingernails and nail beds using a dedicated classification model.',
    icon: ScanLine,
  },
  {
    number: '04',
    title: 'Palm',
    description:
      'Palm images provide an additional input to the anemia multimodal fusion model.',
    icon: Hand,
  },
  {
    number: '05',
    title: 'Skin',
    description:
      'Visual screening of submitted skin images using a dedicated classification model.',
    icon: Microscope,
  },
];

const workflow = [
  {
    number: '01',
    title: 'Capture',
    description:
      'Upload images from your gallery or capture them with your device camera.',
    icon: Upload,
  },
  {
    number: '02',
    title: 'Analyze',
    description:
      'Specialized vision models process each submitted anatomical region.',
    icon: ScanLine,
  },
  {
    number: '03',
    title: 'Fuse',
    description:
      'Eye, nail, and palm model features are combined by the anemia fusion model.',
    icon: Sparkles,
  },
  {
    number: '04',
    title: 'Review',
    description:
      'View model predictions, probabilities, detection confidence, and fusion contributions.',
    icon: ImageIcon,
  },
];

const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onLogin,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Academic Prototype Banner */}
      <div className="bg-amber-500/10 border-b border-amber-400/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-center">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
            <ShieldCheck size={14} />
          </span>
          <p className="text-xs sm:text-sm text-amber-100/90">
            <span className="font-semibold">Investigational Academic Prototype:</span>{' '}
            BioLens AI performs preliminary multimodal visual screening only.
            Not approved for clinical diagnostics.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
              <Stethoscope size={20} />
            </div>

            <div>
              <div className="font-semibold tracking-tight">BioLens</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
                AI
              </div>
            </div>
          </div>

          <button
            onClick={onLogin}
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition"
          >
            Login
          </button>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-16 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="absolute right-0 top-72 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 mb-7">
                <Sparkles size={14} />
                Academic Project Demonstration
              </div>

              <div className="mx-auto mb-7 h-16 w-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                <Stethoscope size={30} />
              </div>

              <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/80 mb-5">
                Multimodal Visual Screening Research Prototype
              </p>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight">
                BioLens AI
              </h1>

              <p className="mt-4 text-2xl sm:text-3xl text-slate-300 font-light">
                See Beyond the Surface.
              </p>

              <p className="mt-7 max-w-2xl mx-auto text-base sm:text-lg leading-8 text-slate-400">
                An AI-powered multimodal visual screening platform that analyzes
                submitted images from multiple body regions and provides
                preliminary model outputs for academic research and demonstration.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={onGetStarted}
                  className="w-full sm:w-auto rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-slate-950 hover:bg-slate-100 transition"
                >
                  Start Screening
                </button>

                <button
                  onClick={onLogin}
                  className="w-full sm:w-auto rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-medium text-white hover:bg-white/10 transition"
                >
                  Login to Account
                </button>
              </div>

              <p className="mt-5 text-xs text-slate-500">
                BioLens AI provides preliminary model outputs and does not replace
                professional medical evaluation.
              </p>
            </div>
          </div>
        </section>

        {/* Modalities */}
        <section className="border-y border-white/5 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="max-w-2xl mb-12">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">
                Multimodal Visual Sensor Framework
              </p>

              <h2 className="mt-3 text-3xl sm:text-4xl font-semibold">
                Five Screening Modalities
              </h2>

              <p className="mt-4 text-slate-400 leading-7">
                BioLens AI accepts images from five anatomical regions. Different
                specialized models process each modality, while Eye, Nail, and
                Palm inputs can participate in the anemia fusion pipeline.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {modalities.map((modality) => {
                const Icon = modality.icon;

                return (
                  <div
                    key={modality.title}
                    className="rounded-2xl border border-white/10 bg-slate-900/70 p-6"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {modality.number}
                      </span>

                      <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Icon size={19} />
                      </div>
                    </div>

                    <h3 className="mt-7 text-lg font-semibold">
                      {modality.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {modality.description}
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                      Dedicated Model
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section>
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="max-w-2xl mb-12">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">
                Analytical Workflow
              </p>

              <h2 className="mt-3 text-3xl sm:text-4xl font-semibold">
                How BioLens Works
              </h2>

              <p className="mt-4 text-slate-400 leading-7">
                A four-stage workflow taking submitted images from capture
                through model inference and result review.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {workflow.map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-semibold text-white/20">
                        {step.number}
                      </span>

                      <Icon size={20} className="text-slate-300" />
                    </div>

                    <h3 className="mt-7 text-lg font-semibold">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-white/5 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
              <ScanLine size={25} />
            </div>

            <h2 className="mt-6 text-3xl sm:text-4xl font-semibold">
              Start Your Preliminary Screening
            </h2>

            <p className="mt-4 text-slate-400 leading-7">
              Submit the available images, review the captured inputs, and
              examine the resulting model outputs.
            </p>

            <button
              onClick={onGetStarted}
              className="mt-8 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-slate-950 hover:bg-slate-100 transition"
            >
              Begin Screening
            </button>

            <div className="mt-10 rounded-2xl border border-amber-400/15 bg-amber-400/5 px-6 py-5 text-left">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 shrink-0 text-amber-300" size={18} />

                <div>
                  <h3 className="text-sm font-semibold text-amber-100">
                    Medical Disclaimer & Screening Notice
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm leading-6 text-amber-100/65">
                    BioLens AI is an AI-based preliminary health-risk screening
                    research prototype. Its outputs are model predictions and
                    visual findings, not medical diagnoses. They should not
                    replace professional medical advice, clinical examination,
                    laboratory testing, or treatment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-semibold">BioLens AI</div>
              <div className="mt-1 text-xs text-slate-500">
                See Beyond the Surface.
              </div>
            </div>

            <div className="text-xs text-slate-500 text-center sm:text-right">
              <div>
                Multimodal Visual Screening Research Prototype • Academic
                Healthcare AI/ML Demonstration
              </div>
              <div className="mt-1">
                © 2026 BioLens AI Research Team. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export { LandingPage };