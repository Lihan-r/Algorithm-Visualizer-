
import React from 'react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  playbackSpeed,
  onSpeedChange
}) => {
  return (
    <div className="flex flex-wrap items-center gap-6 px-6 py-3 bg-zinc-900/50 border-t border-white/10 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <button
          onClick={onStepBackward}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Step Backward"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18V6h2v12H6zm3.5-6L18 18V6l-8.5 6z" />
          </svg>
        </button>
        <button
          onClick={onTogglePlay}
          className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-full transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <button
          onClick={onStepForward}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Step Forward"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6v12l8.5-6L6 6zm9 12h2V6h-2v12z" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-4 border-l border-white/10 pl-6 h-10">
        <span className="text-sm font-medium text-zinc-400">Speed</span>
        <input
          type="range"
          min="0.25"
          max="10"
          step="0.25"
          value={playbackSpeed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="w-32 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <span className="text-sm font-mono text-indigo-400 w-12">{playbackSpeed}x</span>
      </div>
    </div>
  );
};
