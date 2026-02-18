import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  colorClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, label, colorClass = "bg-emerald-500" }) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
        <span>{label || 'Progress'}</span>
        <span>{current} / {total} ({percentage}%)</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ease-out ${colorClass}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
