
import React, { useMemo, useState } from 'react';
import { TraceStep, GridState, StepType, GridNode } from '../types';

interface GridVisualizerProps {
  rows: number;
  cols: number;
  startNode: [number, number];
  endNode: [number, number];
  walls: Set<string>;
  steps: TraceStep[];
  currentStepIndex: number;
  onToggleWall: (id: string) => void;
}

export const GridVisualizer: React.FC<GridVisualizerProps> = ({ 
  rows, cols, startNode, endNode, walls, steps, currentStepIndex, onToggleWall
}) => {
  const [isMouseDown, setIsMouseDown] = useState(false);

  const state: GridState = useMemo(() => {
    // Added GridNode[][] type annotation to fix fCost property errors
    const gridNodes: GridNode[][] = Array(rows).fill(null).map((_, r) => 
      Array(cols).fill(null).map((_, c) => ({
        row: r,
        col: c,
        isWall: walls.has(`${r}-${c}`),
        isStart: r === startNode[0] && c === startNode[1],
        isEnd: r === endNode[0] && c === endNode[1],
        isVisited: false,
        isPath: false,
        distance: Infinity
      }))
    );

    const active = new Set<string>();

    for (let i = 0; i <= currentStepIndex; i++) {
      const step = steps[i];
      if (!step) continue;
      active.clear();
      step.targets.forEach(t => active.add(t as string));

      switch (step.type) {
        case StepType.VISIT:
          const [r, c] = (step.targets[0] as string).split('-').map(Number);
          gridNodes[r][c].isVisited = true;
          gridNodes[r][c].fCost = step.value?.f;
          break;
        case StepType.UPDATE_VALUE:
          const [ur, uc] = (step.targets[0] as string).split('-').map(Number);
          gridNodes[ur][uc].fCost = step.value?.f;
          break;
        case StepType.HIGHLIGHT:
          step.targets.forEach(t => {
            const [pr, pc] = (t as string).split('-').map(Number);
            gridNodes[pr][pc].isPath = true;
          });
          break;
      }
    }

    return { nodes: gridNodes, activeNodes: active };
  }, [rows, cols, startNode, endNode, walls, steps, currentStepIndex]);

  const handleMouseEnter = (id: string) => {
    if (isMouseDown) onToggleWall(id);
  };

  return (
    <div 
      className="grid gap-px bg-zinc-800 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl mx-auto w-fit select-none"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      onMouseDown={() => setIsMouseDown(true)}
      onMouseUp={() => setIsMouseDown(false)}
      onMouseLeave={() => setIsMouseDown(false)}
    >
      {state.nodes.flat().map((node) => {
        const id = `${node.row}-${node.col}`;
        const isActive = state.activeNodes.has(id);
        
        let bg = "bg-zinc-900";
        let shadow = "";
        if (node.isWall) {
          bg = "bg-zinc-600";
        } else if (node.isStart) {
          bg = "bg-sky-400";
          shadow = "shadow-[inset_0_0_15px_rgba(56,189,248,0.5)]";
        } else if (node.isEnd) {
          bg = "bg-rose-500";
          shadow = "shadow-[inset_0_0_15px_rgba(244,63,94,0.5)]";
        } else if (node.isPath) {
          bg = "bg-amber-400";
          shadow = "shadow-[inset_0_0_10px_rgba(251,191,36,0.6)] animate-pulse";
        } else if (node.isVisited) {
          bg = "bg-indigo-600/40";
        }

        return (
          <div 
            key={id}
            onMouseDown={() => onToggleWall(id)}
            onMouseEnter={() => handleMouseEnter(id)}
            className={`w-6 h-6 md:w-8 md:h-8 transition-all duration-300 relative flex items-center justify-center cursor-crosshair ${bg} ${shadow} ${isActive ? 'ring-2 ring-white z-20 scale-125 shadow-lg' : ''}`}
          >
             {node.fCost !== undefined && !node.isPath && !node.isStart && !node.isEnd && (
               <span className="text-[6px] md:text-[8px] font-mono text-white/40">{Math.round(node.fCost)}</span>
             )}
             {isActive && <div className="absolute inset-0 bg-white/20 animate-ping" />}
          </div>
        );
      })}
    </div>
  );
};
