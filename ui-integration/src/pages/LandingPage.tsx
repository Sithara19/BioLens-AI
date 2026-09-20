import React from 'react';
import {
  Eye,
  Sparkles,
  Layers,
  ArrowRight,
  Camera,
  Cpu,
  GitMerge,
  FileCheck2,
  ChevronRight,
  CheckCircle,
  Smile,
} from 'lucide-react';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onLogin,
}) => {
  const modalities = [
    {
      title: 'Eye',
      subtitle: 'Visual screening from eye images.',
      detail: 'Analyzes eye and lower eyelid images for color and clarity.',
      icon: Eye,
      color: 'from-teal-500/10 to-teal-500/5',
      borderColor: 'border-teal-200/80',
      badgeColor: 'text-teal-700 bg-teal-50',
      accent: '#0d9488',
    },
    {
      title: 'Tongue',
      subtitle: 'Visual screening from tongue images.',
      detail:
        'Analyzes the visible tongue surface for color, coating, and visual patterns.',
      icon: Smile,
      color: 'from-rose-500/10 to-rose-500/5',
      borderColor: 'border-rose-200/80',
      badgeColor: 'text-rose-700 bg-rose-50',
      accent: '#e11d48',
    },
    {
      title: 'Nail',
      subtitle: 'Visual screening from fingernail images.',
      detail: 'Analyzes fingernail and nail bed color, tint, and shape.',
      icon: Layers,
      color: 'from-sky-500/10 to-sky-500/5',
      borderColor: 'border-sky-200/80',
      badgeColor: 'text-sky-700 bg-sky-50',
      accent: '#0284c7',
    },
    {
      title: 'Skin',
      subtitle: 'Visual screening from skin images.',
      detail: 'Analyzes skin patch color tone, texture, and balance.',
      icon: Layers,
      color: 'from-blue-500/10 to-blue-500/5',
      borderColor: 'border-blue-200/80',
      badgeColor: 'text-blue-700 bg-blue-50',
      accent: '#2563eb',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Capture',
      desc: 'Capture or upload photos of eye, tongue, nail, and skin using your device.',
      icon: Camera,
    },
    {
      num: '02',
      title: 'Analyze',
      desc: 'Specialized deep learning vision models process each anatomical region independently.',
      icon: Cpu,
    },
    {
      num: '03',
      title: 'Fuse',
      desc: 'Cross-attention multimodal fusion aggregates feature vectors into condition risk profiles.',
      icon: GitMerge,
    },
    {
      num: '04',
      title: 'Screen',
      desc: 'Receive preliminary risk classifications, confidence levels, and model explainability maps.',
      icon: FileCheck2,
    },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Academic Banner */}
      <MedicalDisclaimer variant="banner" />

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24 text-center">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* BioLens Healthcare Logo */}
          <div className="flex justify-center mb-2">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border border-slate-200 shadow-lg flex items-center justify-center overflow-hidden p-2">
              <img
                src="/images/BioLens AI Healthcare Logo.png"
                alt="BioLens AI Healthcare Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            Multimodal Health-Risk Screening Research Prototype
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            BioLens AI

            <span className="block text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mt-2">
              See Beyond the Surface.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
            An AI-powered multimodal health-risk screening platform that analyzes visible indicators across multiple body parts to provide preliminary risk indicators.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 hover:shadow-teal-600/30 transition-all transform hover:-translate-y-0.5"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onLogin}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm transition-all shadow-xs"
            >
              Login to Account
            </button>
          </div>

          {/* Academic disclaimer highlight */}
          <p className="text-xs text-slate-400 max-w-md mx-auto pt-2">
            BioLens AI provides preliminary screening information and does not replace professional medical diagnosis.
          </p>
        </div>
      </section>

      {/* 4 Modalities Grid */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200/70">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-teal-600">
            Multimodal Visual Sensor Framework
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Four Screening Modalities
          </h2>

          <p className="text-xs sm:text-sm text-slate-500">
            Combining non-invasive visual screening from eye, tongue, nail, and skin images.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {modalities.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className={`rounded-2xl border ${item.borderColor} bg-gradient-to-b ${item.color} p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center mb-5">
                    <Icon
                      className="w-6 h-6"
                      style={{ color: item.accent }}
                    />
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      {item.title}
                    </h3>

                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                    >
                      Modality
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-800 mb-2">
                    {item.subtitle}
                  </p>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.detail}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-200/60 flex items-center gap-1.5 text-xs font-semibold text-teal-800">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                  <span>Deep Feature Extraction</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How BioLens Works: 4 Simple Steps */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/70">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-cyan-600">
            Analytical Workflow
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How BioLens Works
          </h2>

          <p className="text-xs sm:text-sm text-slate-500">
            A seamless four-step pipeline transitioning from device image capture to multimodal neural fusion.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => {
            const Icon = s.icon;

            return (
              <div
                key={s.num}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-300 font-mono">
                      {s.num}
                    </span>

                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {s.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            Start Your Preliminary Screening
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Bottom Medical Disclaimer & Footer */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <MedicalDisclaimer variant="card" />

        <div className="mt-8 text-center text-xs text-slate-400 space-y-1">
          <p>
            © {new Date().getFullYear()} BioLens AI Research Team. All rights reserved.
          </p>

          <p>
            Built for academic healthcare AI/ML demonstration. Ready for FastAPI model serving backend.
          </p>
        </div>
      </section>
    </div>
  );
};