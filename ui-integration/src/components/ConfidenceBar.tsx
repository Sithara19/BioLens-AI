import React from 'react';
import { RiskLevel } from '../types';

interface ConfidenceBarProps {
  confidence: number; // 0 to 1 or 0 to 100
  riskLevel?: RiskLevel;
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const ConfidenceBar: React.FC<ConfidenceBarProps> = ({
  confidence,
  riskLevel = 'moderate',
  showLabel = true,
  className = '',
  size = 'md',
}) => {
  const percentage = confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence);

  const getBarColor = () => {
    switch (riskLevel) {
      case 'high':
        return 'bg-amber-500';
      case 'moderate':
        return 'bg-teal-500';
      case 'low':
      default:
        return 'bg-cyan-500';
    }
  };

  const barHeight = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500">Model Confidence</span>
          <span className="font-bold text-slate-800">{percentage}%</span>
        </div>
      )}
      <div className={`w-full ${barHeight} bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor()}`}
          style={{ width: `${Math.min(100, Math.max(5, percentage))}%` }}
        />
      </div>
    </div>
  );
};
