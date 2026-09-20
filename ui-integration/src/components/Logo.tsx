import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showTagline = false }) => {
  const [imgError, setImgError] = useState(false);

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {!imgError ? (
        <img
          src="/static/images/biolens-logo.png"
          alt="BioLens AI Logo"
          className={`${iconSizes[size]} object-contain rounded-lg`}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={`${iconSizes[size]} rounded-xl bg-gradient-to-tr from-teal-600 via-cyan-600 to-teal-400 p-0.5 shadow-sm flex items-center justify-center flex-shrink-0`}>
          <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center relative overflow-hidden">
            {/* Subtle medical aperture grid */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-cyan-50/50" />
            <svg
              className="w-3/5 h-3/5 text-teal-600 relative z-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Outer lens circle */}
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.85" />
              {/* Multimodal focus markers representing eye, nail, skin */}
              <circle cx="12" cy="6" r="1.5" fill="#0d9488" />
              <circle cx="18" cy="12" r="1.5" fill="#0891b2" />
              <circle cx="12" cy="18" r="1.5" fill="#0d9488" />
              <circle cx="6" cy="12" r="1.5" fill="#0891b2" />
              {/* Central optical sensor / iris */}
              <circle cx="12" cy="12" r="3.5" fill="none" stroke="#0f766e" strokeWidth="2" />
              <circle cx="12" cy="12" r="1.5" fill="#0f766e" />
            </svg>
          </div>
        </div>
      )}

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-bold tracking-tight text-slate-900 ${titleSizes[size]}`}>
            BioLens
          </span>
          <span className={`font-semibold text-teal-600 ${titleSizes[size]}`}>
            AI
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] font-medium text-slate-500 tracking-wide mt-0.5">
            See Beyond the Surface.
          </span>
        )}
      </div>
    </div>
  );
};
