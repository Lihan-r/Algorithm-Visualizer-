
export enum AlgorithmCategory {
  SORTING = 'SORTING',
  PATHFINDING = 'PATHFINDING',
  SEARCH = 'SEARCH',
}

export enum StepType {
  COMPARE = 'COMPARE',
  SWAP = 'SWAP',
  VISIT = 'VISIT',
  MARK_PIVOT = 'MARK_PIVOT',
  UPDATE_VALUE = 'UPDATE_VALUE',
  HIGHLIGHT = 'HIGHLIGHT',
  MESSAGE = 'MESSAGE',
  FOUND = 'FOUND',
}

export interface TraceStep {
  stepIndex: number;
  type: StepType;
  targets: (number | string)[]; // indices or node IDs
  value?: any;
  description: string;
  lineReference?: number;
}

export interface AlgorithmMetadata {
  id: string;
  name: string;
  category: AlgorithmCategory;
  description: string;
  complexity: {
    time: string;
    space: string;
  };
  pseudoCode: string[];
}

export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
}

export interface GraphData {
  nodes: NodePosition[];
  edges: GraphEdge[];
}

export interface GraphState {
  visited: Set<string>;
  activeEdges: Set<string>; // "from-to"
  activeNodes: Set<string>;
  pathNodes: Set<string>;
  pathEdges: Set<string>;
  distances: Record<string, number>;
}

// Added missing VisualizerState for useVisualizer hook
export interface VisualizerState {
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  steps: TraceStep[];
  isLoaded: boolean;
}

// Added missing SortingState for SortingVisualizer component
export interface SortingState {
  array: number[];
  activeIndices: Set<number>;
  pivotIndex: number | null;
  sortedIndices: Set<number>;
  foundIndex: number | null;
}

// Added missing GridNode for GridVisualizer component
export interface GridNode {
  row: number;
  col: number;
  isWall: boolean;
  isStart: boolean;
  isEnd: boolean;
  isVisited: boolean;
  isPath: boolean;
  distance: number;
  fCost?: number;
}

// Added missing GridState for GridVisualizer component
export interface GridState {
  nodes: GridNode[][];
  activeNodes: Set<string>;
}
