import React from 'react';
import { CheckCircle2, XCircle, Sun, Eye, Layers, Maximize2, Sparkles, HelpCircle } from 'lucide-react';
import { ModalityType } from '../types';
import { MODALITY_PHOTO_GUIDES } from '../data/sampleImages';

interface PhotoGuideProps {
  modality: ModalityType;
  compact?: boolean;
}

export const PhotoGuide: React.FC<PhotoGuideProps> = ({ modality, compact = false }) => {
  const guide = MODALITY_PHOTO_GUIDES[modality];
  const [showFullSample, setShowFullSample] = React.useState(false);

  return (
    <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
      {/* Header bar */}
      <div className="px-4 py-3 bg-white border-b border-slate-200/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <HelpCircle className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Sample Guide: How to take your {guide.title} picture
            </h4>
            <p className="text-[11px] text-slate-500">
              Follow this visual sample for accurate screening results
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFullSample(true)}
          className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/80 px-2.5 py-1 rounded-lg border border-teal-200/80 flex items-center gap-1 transition-colors"
        >
          <Maximize2 className="w-3 h-3" />
          <span>Enlarge Sample</span>
        </button>
      </div>

      <div className={`p-4 sm:p-5 ${compact ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-12 gap-5'}`}>
        {/* Visual Sample Graphic */}
        <div className={compact ? 'w-full' : 'md:col-span-5 flex flex-col'}>
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white aspect-4/3 flex items-center justify-center shadow-xs group">
            <img
              src={guide.dataUrl}
              alt={guide.sampleName}
              className="w-full h-full object-contain p-2"
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-semibold flex items-center gap-1 backdrop-blur-xs">
              <CheckCircle2 className="w-3 h-3 text-teal-400" />
              <span>Sample Reference</span>
            </div>
            <button
              type="button"
              onClick={() => setShowFullSample(true)}
              className="absolute inset-0 bg-slate-900/10 hover:bg-slate-900/25 transition-colors flex items-center justify-center text-white opacity-0 group-hover:opacity-100"
            >
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 text-xs font-medium backdrop-blur-xs">
                Click to view sample
              </span>
            </button>
          </div>
          <span className="text-[11px] text-center text-slate-500 mt-2 font-medium">
            {guide.subtitle}
          </span>
        </div>

        {/* Guidance and Checklist */}
        <div className={compact ? 'space-y-3' : 'md:col-span-7 space-y-3'}>
          {/* Instructions pills */}
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider text-teal-700">
                1. Positioning
              </span>
              <p className="text-slate-600 mt-0.5 leading-relaxed text-xs">
                {guide.positioning}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider text-teal-700">
                2. Lighting &amp; Distance
              </span>
              <p className="text-slate-600 mt-0.5 leading-relaxed text-xs">
                {guide.lighting} • Distance: {guide.distance}.
              </p>
            </div>
          </div>

          {/* Do's and Don'ts checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 space-y-1.5">
              <span className="font-bold flex items-center gap-1 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Do:
              </span>
              <ul className="space-y-1 text-[11px] text-emerald-900 leading-snug">
                {guide.dos.map((d, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/80 text-rose-950 space-y-1.5">
              <span className="font-bold flex items-center gap-1 text-rose-800">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                Don't:
              </span>
              <ul className="space-y-1 text-[11px] text-rose-900 leading-snug">
                {guide.donts.map((d, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Enlarged Sample Modal */}
      {showFullSample && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {guide.sampleName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFullSample(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 aspect-4/3 flex items-center justify-center">
              <img
                src={guide.dataUrl}
                alt={guide.sampleName}
                className="w-full h-full object-contain p-2"
              />
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              <p>
                <strong>Proper Alignment:</strong> {guide.positioning}
              </p>
              <p>
                <strong>Lighting:</strong> {guide.lighting} ({guide.distance})
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowFullSample(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
            >
              Got It, Continue to Capture
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
