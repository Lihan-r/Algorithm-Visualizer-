
import React from 'react';

interface TimelineProps {
  currentStepIndex: number;
  totalSteps: number;
  onSeek: (index: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ currentStepIndex, totalSteps, onSeek }) => {
  const progress = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

  return (
    <div className="relative group px-6 py-2 bg-zinc-900/50 backdrop-blur-md">
      <div className="flex justify-between text-[10px] text-zinc-500 mb-1 font-mono uppercase tracking-wider">
        <span>Step {Math.max(0, currentStepIndex + 1)} / {totalSteps}</span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
      <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden cursor-pointer">
        <input
          type="range"
          min="-1"
          max={totalSteps - 1}
          value={currentStepIndex}
          onChange={(e) => onSeek(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div 
          className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-100 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
