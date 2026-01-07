
import { useState, useEffect, useCallback, useRef } from 'react';
import { TraceStep, VisualizerState } from '../types';

export const useVisualizer = (steps: TraceStep[]) => {
  const [state, setState] = useState<VisualizerState>({
    currentStepIndex: -1,
    isPlaying: false,
    playbackSpeed: 1,
    steps: steps,
    isLoaded: steps.length > 0
  });

  const timerRef = useRef<number | null>(null);

  const stepForward = useCallback(() => {
    setState(prev => {
      if (prev.currentStepIndex >= prev.steps.length - 1) {
        return { ...prev, isPlaying: false };
      }
      return { ...prev, currentStepIndex: prev.currentStepIndex + 1 };
    });
  }, []);

  const stepBackward = useCallback(() => {
    setState(prev => {
      if (prev.currentStepIndex <= -1) return prev;
      return { ...prev, currentStepIndex: prev.currentStepIndex - 1 };
    });
  }, []);

  const togglePlay = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const seek = useCallback((index: number) => {
    setState(prev => ({ ...prev, currentStepIndex: index }));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setState(prev => ({ ...prev, playbackSpeed: speed }));
  }, []);

  useEffect(() => {
    if (state.isPlaying) {
      const delay = Math.max(20, 500 / state.playbackSpeed);
      timerRef.current = window.setInterval(() => {
        stepForward();
      }, delay);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isPlaying, state.playbackSpeed, stepForward]);

  useEffect(() => {
    setState(prev => ({ ...prev, steps, currentStepIndex: -1, isLoaded: steps.length > 0, isPlaying: false }));
  }, [steps]);

  return {
    ...state,
    togglePlay,
    stepForward,
    stepBackward,
    seek,
    setSpeed
  };
};
