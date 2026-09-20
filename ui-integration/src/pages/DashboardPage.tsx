import React from 'react';
import {
  Scan,
  User,
  History,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  FileText,
  Eye,
  Layers,
  ChevronRight,
  ShieldCheck,
  Smile,
} from 'lucide-react';
import { UserProfile, ScreeningHistoryItem, ScreeningResult } from '../types';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

interface DashboardPageProps {
  user: UserProfile;
  history: ScreeningHistoryItem[];
  onStartScreening: () => void;
  onViewResult: (result: ScreeningResult) => void;
  onGoToProfile: () => void;
  onGoToHistory: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  history,
  onStartScreening,
  onViewResult,
  onGoToProfile,
  onGoToHistory,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle geometric circles */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-teal-500/10 pointer-events-none" />
        <div className="absolute right-32 -top-10 w-48 h-48 rounded-full bg-cyan-500/10 pointer-events-none" />

        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-semibold backdrop-blur-xs border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            BioLens AI Screening Portal
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user.name}
          </h1>

          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-normal">
            Your health-risk screening console. Capture eye, tongue, nail, and skin images to view preliminary risk indicators.
          </p>
        </div>

        <div className="relative z-10 flex-shrink-0">
          <button
            onClick={onStartScreening}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2.5 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all transform hover:-translate-y-0.5"
          >
            <Scan className="w-4 h-4 text-slate-950" />
            Start New Screening
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>

      {/* Main Grid: Profile Card & Quick Modality Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>

            {/* Profile Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">

                {/* BioLens Profile Logo */}
                <div className="w-11 h-11 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center overflow-hidden shadow-sm">
                  <img
                    src="/images/BioLens AI Healthcare Logo.png"
                    alt="BioLens AI Healthcare Logo"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-teal-600" />
                    User Profile
                  </h3>

                  <p className="text-[10px] text-slate-400 mt-0.5">
                    BioLens Account
                  </p>
                </div>
              </div>

              <button
                onClick={onGoToProfile}
                className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors"
              >
                Edit Settings
              </button>
            </div>

            <div className="py-5 space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Full Name</span>
                <span className="font-bold text-slate-800">{user.name}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Email Address</span>
                <span className="font-bold text-slate-800 truncate max-w-[180px]">
                  {user.email}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Age</span>
                <span className="font-bold text-slate-800">
                  {user.age ? `${user.age} years` : 'Not specified'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400 font-medium">Gender</span>
                <span className="font-bold text-slate-800">
                  {user.gender || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Records stored securely for academic evaluation</span>
            </div>
          </div>
        </div>

        {/* Screening Pipeline Quick Status Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Multimodal Sensor Checklist
                </h3>

                <p className="text-xs text-slate-500">
                  Four visual inspection modalities available for multimodal screening
                </p>
              </div>

              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
                Ready for Capture
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 py-6">
              {[
                {
                  title: 'Eye',
                  detail: 'Eye & Lower Eyelid',
                  icon: Eye,
                },
                {
                  title: 'Tongue',
                  detail: 'Tongue Surface',
                  icon: Smile,
                },
                {
                  title: 'Nail',
                  detail: 'Fingernail',
                  icon: Layers,
                },
                {
                  title: 'Skin',
                  detail: 'Skin Area',
                  icon: Layers,
                },
              ].map((mod, idx) => {
                const Icon = mod.icon;

                return (
                  <div
                    key={mod.title}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-center space-y-1.5"
                  >
                    <div className="w-8 h-8 mx-auto rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </div>

                    <div className="flex items-center justify-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-teal-600" />

                      <h4 className="font-bold text-xs text-slate-900">
                        {mod.title}
                      </h4>
                    </div>

                    <p className="text-[10px] text-slate-500">
                      {mod.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 bg-teal-50/50 rounded-2xl border border-teal-100/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-900">
              Ready to begin? The screening process takes approximately 2 minutes.
            </span>

            <button
              onClick={onStartScreening}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition-colors flex-shrink-0 ml-2"
            >
              Start
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Previous Screenings Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-teal-600" />
              Previous Screenings
            </h3>

            <p className="text-xs text-slate-500">
              Access completed multimodal screening reports and condition profiles
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={onGoToHistory}
              className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1 self-start sm:self-auto"
            >
              View All History ({history.length})
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center">
              <FileText className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">
                No Previous Screenings Recorded
              </h4>

              <p className="text-xs text-slate-500 leading-relaxed">
                You have not completed any health-risk screenings yet. Click below to begin your first multimodal screening session.
              </p>
            </div>

            <button
              onClick={onStartScreening}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Scan className="w-3.5 h-3.5" />
              Initiate First Screening
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.slice(0, 6).map((item) => (
              <div
                key={item.sessionId}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-teal-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-2xs">
                      {item.sessionId}
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.date}</span>
                  </div>

                  <p className="text-xs text-slate-500 mb-4">
                    Multimodal screening session with Eye, Tongue, Nail, and Skin inputs.
                  </p>
                </div>

                <button
                  onClick={() => onViewResult(item.result)}
                  className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-teal-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                  View Results
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mandatory Medical Disclaimer */}
      <MedicalDisclaimer variant="card" />
    </div>
  );
};