
import React, { useMemo } from 'react';
import { TraceStep, SortingState, StepType } from '../types';

interface SortingVisualizerProps {
  initialArray: number[];
  steps: TraceStep[];
  currentStepIndex: number;
}

export const SortingVisualizer: React.FC<SortingVisualizerProps> = ({ initialArray, steps, currentStepIndex }) => {
  const state: SortingState = useMemo(() => {
    const arr = [...initialArray];
    const active = new Set<number>();
    let pivot = null;
    const sorted = new Set<number>();
    let foundIndex: number | null = null;

    for (let i = 0; i <= currentStepIndex; i++) {
      const step = steps[i];
      if (!step) continue;

      active.clear();
      
      switch (step.type) {
        case StepType.COMPARE:
          step.targets.forEach(t => active.add(t as number));
          break;
        case StepType.SWAP:
          const swapTargets = step.targets as number[];
          if (swapTargets.length === 2) {
            [arr[swapTargets[0]], arr[swapTargets[1]]] = [arr[swapTargets[1]], arr[swapTargets[0]]];
            active.add(swapTargets[0]);
            active.add(swapTargets[1]);
          } else if (swapTargets.length === 1) {
            active.add(swapTargets[0]);
          }
          break;
        case StepType.UPDATE_VALUE:
          const updateIdx = step.targets[0] as number;
          if (step.value !== undefined) {
            arr[updateIdx] = step.value;
            active.add(updateIdx);
          }
          break;
        case StepType.MARK_PIVOT:
          pivot = step.targets[0] as number;
          break;
        case StepType.HIGHLIGHT:
          step.targets.forEach(t => sorted.add(t as number));
          break;
        case StepType.FOUND:
          foundIndex = step.targets[0] as number;
          break;
      }
    }

    return { array: arr, activeIndices: active, pivotIndex: pivot, sortedIndices: sorted, foundIndex };
  }, [initialArray, steps, currentStepIndex]);

  const maxVal = initialArray.length > 0 ? Math.max(...initialArray) : 1;

  return (
    <div className="flex items-end justify-center gap-1 w-full h-[400px] px-4">
      {state.array.map((val, idx) => {
        let colorClass = "bg-zinc-700";
        if (state.foundIndex === idx) colorClass = "bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.8)] scale-110 z-10";
        else if (state.pivotIndex === idx) colorClass = "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)] scale-105";
        else if (state.activeIndices.has(idx)) colorClass = "bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]";
        else if (state.sortedIndices.has(idx)) colorClass = "bg-zinc-800 opacity-30 scale-95 transition-opacity"; // Highlight in Search often means "discarded"
        // For actual "sorted" in sorting algorithms, we use emerald
        if (state.sortedIndices.has(idx) && steps.some(s => s.type === StepType.SWAP || s.type === StepType.COMPARE)) {
           // Heuristic to detect if we are in a sort (sortedIndices = sorted) vs search (sortedIndices = discarded)
           // If any step is Found, it's a search.
           if (!steps.some(s => s.type === StepType.FOUND)) {
             colorClass = "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]";
           }
        }

        return (
          <div
            key={idx}
            className={`transition-all duration-200 rounded-t-sm w-full ${colorClass}`}
            style={{ height: `${(val / maxVal) * 100}%`, minWidth: '4px' }}
          >
            {initialArray.length < 20 && (
              <span className="text-[10px] text-zinc-400 block -translate-y-4 text-center">{val}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
