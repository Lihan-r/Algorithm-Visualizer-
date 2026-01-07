
import React, { useMemo } from 'react';
import { GraphData, TraceStep, StepType, GraphState } from '../types';

interface GraphVisualizerProps {
  data: GraphData;
  steps: TraceStep[];
  currentStepIndex: number;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ data, steps, currentStepIndex }) => {
  const state: GraphState = useMemo(() => {
    const visited = new Set<string>();
    const activeNodes = new Set<string>();
    const activeEdges = new Set<string>();
    const pathNodes = new Set<string>();
    const pathEdges = new Set<string>();
    const distances: Record<string, number> = {};

    for (let i = 0; i <= currentStepIndex; i++) {
      const step = steps[i];
      if (!step) continue;

      activeNodes.clear();
      activeEdges.clear();

      switch (step.type) {
        case StepType.VISIT:
          const nodeId = step.targets[0] as string;
          visited.add(nodeId);
          activeNodes.add(nodeId);
          if (step.value !== undefined) distances[nodeId] = step.value;
          break;
        case StepType.UPDATE_VALUE:
          const targetNode = step.targets[0] as string;
          const edgeId = step.targets[1] as string;
          activeNodes.add(targetNode);
          if (edgeId) activeEdges.add(edgeId);
          if (step.value !== undefined) distances[targetNode] = step.value;
          break;
        case StepType.COMPARE:
          const compNode = step.targets[0] as string;
          const compEdge = step.targets[1] as string;
          activeNodes.add(compNode);
          if (compEdge) activeEdges.add(compEdge);
          break;
        case StepType.HIGHLIGHT:
          step.targets.forEach((t, idx) => {
            const nId = t as string;
            pathNodes.add(nId);
            if (idx > 0) {
              const prevId = step.targets[idx - 1] as string;
              pathEdges.add(`${prevId}-${nId}`);
            }
          });
          break;
      }
    }

    return { visited, activeNodes, activeEdges, pathNodes, pathEdges, distances };
  }, [data, steps, currentStepIndex]);

  return (
    <div className="w-full h-[500px] flex items-center justify-center bg-zinc-900/50 rounded-2xl border border-white/5 relative overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 700 400">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="19" refY="3.5" orientation="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#52525b" />
          </marker>
          <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="19" refY="3.5" orientation="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
          </marker>
          <marker id="arrowhead-path" markerWidth="10" markerHeight="7" refX="19" refY="3.5" orientation="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#fbbf24" />
          </marker>
        </defs>

        {/* Edges */}
        {data.edges.map((edge) => {
          const fromNode = data.nodes.find(n => n.id === edge.from)!;
          const toNode = data.nodes.find(n => n.id === edge.to)!;
          const edgeId = `${edge.from}-${edge.to}`;
          const isActive = state.activeEdges.has(edgeId);
          const isPath = state.pathEdges.has(edgeId);

          return (
            <g key={edgeId}>
              <line
                x1={fromNode.x} y1={fromNode.y}
                x2={toNode.x} y2={toNode.y}
                stroke={isPath ? "#fbbf24" : isActive ? "#6366f1" : "#27272a"}
                strokeWidth={isPath || isActive ? "3" : "2"}
                markerEnd={`url(#${isPath ? 'arrowhead-path' : isActive ? 'arrowhead-active' : 'arrowhead'})`}
                className="transition-all duration-300"
              />
              <text
                x={(fromNode.x + toNode.x) / 2}
                y={(fromNode.y + toNode.y) / 2 - 10}
                textAnchor="middle"
                className="text-[10px] font-bold fill-zinc-500 pointer-events-none"
              >
                {edge.weight}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {data.nodes.map((node) => {
          const isVisited = state.visited.has(node.id);
          const isActive = state.activeNodes.has(node.id);
          const isPath = state.pathNodes.has(node.id);
          const dist = state.distances[node.id];

          return (
            <g key={node.id} className="cursor-pointer">
              <circle
                cx={node.x} cy={node.y} r="18"
                className={`transition-all duration-300 ${
                  isPath ? 'fill-amber-400 stroke-amber-200' :
                  isActive ? 'fill-indigo-500 stroke-indigo-300 scale-110 shadow-lg shadow-indigo-500/50' :
                  isVisited ? 'fill-indigo-900 stroke-indigo-700' :
                  'fill-zinc-800 stroke-zinc-700'
                }`}
                strokeWidth="2"
              />
              <text
                x={node.x} y={node.y + 4}
                textAnchor="middle"
                className={`text-[12px] font-bold pointer-events-none ${
                  isPath || isActive ? 'fill-white' : 'fill-zinc-400'
                }`}
              >
                {node.id}
              </text>
              {dist !== undefined && dist !== Infinity && (
                <text
                  x={node.x} y={node.y - 25}
                  textAnchor="middle"
                  className="text-[10px] font-mono fill-indigo-400 font-bold"
                >
                  {typeof dist === 'number' ? dist.toFixed(1) : dist}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
