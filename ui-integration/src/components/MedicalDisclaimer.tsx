import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface MedicalDisclaimerProps {
  variant?: 'banner' | 'card' | 'compact';
  className?: string;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({
  variant = 'card',
  className = '',
}) => {
  if (variant === 'compact') {
    return (
      <div className={`flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs leading-relaxed ${className}`}>
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p>
          <span className="font-semibold">Medical Notice:</span> BioLens AI provides preliminary screening information and does not replace professional clinical evaluation or medical diagnosis.
        </p>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`w-full bg-slate-900 text-slate-200 py-2.5 px-4 text-xs font-normal border-b border-slate-800 ${className}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold">!</span>
            <span>
              <strong>Investigational Academic Prototype:</strong> BioLens AI performs preliminary multimodal visual screening only. Not approved for clinical diagnostics.
            </span>
          </div>
          <span className="hidden md:inline text-slate-400 text-[11px]">
            Academic Project Demonstration
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-xs relative overflow-hidden ${className}`}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700 shadow-2xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 flex-1">
          <h4 className="text-sm font-bold text-amber-900 tracking-tight flex items-center gap-2">
            Medical Disclaimer &amp; Screening Notice
          </h4>
          <p className="text-xs text-amber-900/90 leading-relaxed">
            BioLens AI is an AI-based preliminary health-risk screening tool. Its results are <strong>not a medical diagnosis</strong> and should not replace professional medical advice, clinical examination, laboratory testing, or treatment. Always consult a qualified healthcare professional for appropriate medical evaluation and guidance.
          </p>
        </div>
      </div>
    </div>
  );
};
