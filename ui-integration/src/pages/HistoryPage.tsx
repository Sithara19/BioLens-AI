import React from 'react';
import {
  History,
  Calendar,
  FileText,
  Scan,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ScreeningHistoryItem, ScreeningResult } from '../types';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

interface HistoryPageProps {
  history: ScreeningHistoryItem[];
  onSelectResult: (result: ScreeningResult) => void;
  onStartNewScreening: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  history,
  onSelectResult,
  onStartNewScreening,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold mb-2">
            <History className="w-3.5 h-3.5 text-teal-600" />
            Screening Longitudinal Log
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Screening History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access past multimodal screening evaluations, observed risk summaries, and AI attention maps.
          </p>
        </div>

        <button
          onClick={onStartNewScreening}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Scan className="w-4 h-4" />
          Start New Screening
        </button>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Screening Records Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You have not performed any multimodal health screenings yet. Start a screening to analyze your eye, nail, and skin images.
            </p>
          </div>
          <button
            onClick={onStartNewScreening}
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            Start Your First Screening
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {history.map((item) => {
            return (
              <div
                key={item.sessionId}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-teal-300 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {item.sessionId}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {item.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {item.date}
                    </h3>

                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-teal-600" />
                      <span>{item.imageCount} images analyzed (Eye, Nail, Skin)</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() => onSelectResult(item.result)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-teal-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
                  >
                    <span>View Results</span>
                    <ChevronRight className="w-4 h-4 text-teal-600 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Medical Disclaimer */}
      <MedicalDisclaimer variant="card" />
    </div>
  );
};
