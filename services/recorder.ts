
import { TraceStep, StepType, GraphData, NodePosition } from '../types';

class VisualizerBuffer {
  private steps: TraceStep[] = [];
  private currentStep = 0;

  addStep(type: StepType, targets: (number | string)[], description: string, value?: any, lineReference?: number) {
    this.steps.push({
      stepIndex: this.currentStep++,
      type,
      targets,
      description,
      value,
      lineReference
    });
  }

  getSteps() {
    return this.steps;
  }
}

// --- Graph traversal Recorders ---

export const generateBFSTrace = (graph: GraphData, startId: string, endId: string): TraceStep[] => {
  const buffer = new VisualizerBuffer();
  const visited = new Set<string>();
  const queue: string[] = [startId];
  const prev = new Map<string, string>();
  
  visited.add(startId);
  buffer.addStep(StepType.MESSAGE, [startId], `Starting BFS from node ${startId}`, null, 0);

  while (queue.length > 0) {
    const u = queue.shift()!;
    buffer.addStep(StepType.VISIT, [u], `Dequeueing node ${u}`, null, 3);

    if (u === endId) {
      const path: string[] = [];
      let curr: string | undefined = u;
      while (curr) {
        path.push(curr);
        curr = prev.get(curr);
      }
      buffer.addStep(StepType.HIGHLIGHT, path.reverse(), "Target reached! Reconstructing path...", null, 0);
      return buffer.getSteps();
    }

    const neighbors = graph.edges.filter(e => e.from === u);
    for (const edge of neighbors) {
      if (!visited.has(edge.to)) {
        visited.add(edge.to);
        prev.set(edge.to, u);
        queue.push(edge.to);
        buffer.addStep(StepType.UPDATE_VALUE, [edge.to, `${u}-${edge.to}`], `Discovered node ${edge.to} from ${u}`, null, 5);
      }
    }
  }
  return buffer.getSteps();
};

export const generateDFSTrace = (graph: GraphData, startId: string, endId: string): TraceStep[] => {
  const buffer = new VisualizerBuffer();
  const visited = new Set<string>();
  const prev = new Map<string, string>();

  const visit = (u: string): boolean => {
    visited.add(u);
    buffer.addStep(StepType.VISIT, [u], `Visiting node ${u}`, null, 5);

    if (u === endId) return true;

    const neighbors = graph.edges.filter(e => e.from === u);
    for (const edge of neighbors) {
      if (!visited.has(edge.to)) {
        prev.set(edge.to, u);
        buffer.addStep(StepType.UPDATE_VALUE, [edge.to, `${u}-${edge.to}`], `Moving deeper from ${u} to ${edge.to}`, null, 7);
        if (visit(edge.to)) return true;
        buffer.addStep(StepType.MESSAGE, [u], `Backtracking from ${edge.to} to ${u}`, null, 4);
      }
    }
    return false;
  };

  if (visit(startId)) {
    const path: string[] = [];
    let curr: string | undefined = endId;
    while (curr) { path.push(curr); curr = prev.get(curr); }
    buffer.addStep(StepType.HIGHLIGHT, path.reverse(), "Path found via DFS!", null, 0);
  }
  return buffer.getSteps();
};

export const generateDijkstraTrace = (graph: GraphData, startId: string, endId: string): TraceStep[] => {
  const buffer = new VisualizerBuffer();
  const dist: Record<string, number> = {};
  const prev: Record<string, string> = {};
  const unvisited = new Set<string>();

  graph.nodes.forEach(n => {
    dist[n.id] = Infinity;
    unvisited.add(n.id);
  });
  dist[startId] = 0;

  buffer.addStep(StepType.MESSAGE, [startId], `Initializing distances. Distance to ${startId} is 0.`, null, 1);

  while (unvisited.size > 0) {
    let u = Array.from(unvisited).reduce((minNode, node) => 
      dist[node] < dist[minNode] ? node : minNode, Array.from(unvisited)[0]);

    if (dist[u] === Infinity) break;
    unvisited.delete(u);
    buffer.addStep(StepType.VISIT, [u], `Selected node ${u} with smallest distance (${dist[u]})`, dist[u], 3);

    if (u === endId) {
      const path: string[] = [];
      let curr: string | undefined = u;
      while (curr) { path.push(curr); curr = prev[curr]; }
      buffer.addStep(StepType.HIGHLIGHT, path.reverse(), "Shortest path found!", null, 0);
      return buffer.getSteps();
    }

    const neighbors = graph.edges.filter(e => e.from === u);
    for (const edge of neighbors) {
      const alt = dist[u] + edge.weight;
      buffer.addStep(StepType.COMPARE, [edge.to, `${u}-${edge.to}`], `Evaluating edge ${u} -> ${edge.to} (weight ${edge.weight})`, alt, 5);
      if (alt < dist[edge.to]) {
        dist[edge.to] = alt;
        prev[edge.to] = u;
        buffer.addStep(StepType.UPDATE_VALUE, [edge.to], `New shorter path to ${edge.to} found: ${alt}`, alt, 6);
      }
    }
  }
  return buffer.getSteps();
};

export const generateAStarTrace = (graph: GraphData, startId: string, endId: string): TraceStep[] => {
  const buffer = new VisualizerBuffer();
  const gScore: Record<string, number> = {};
  const fScore: Record<string, number> = {};
  const prev: Record<string, string> = {};
  const openSet = new Set<string>([startId]);

  const endNode = graph.nodes.find(n => n.id === endId)!;
  const h = (id: string) => {
    const n = graph.nodes.find(node => node.id === id)!;
    return Math.sqrt(Math.pow(n.x - endNode.x, 2) + Math.pow(n.y - endNode.y, 2)) / 50;
  };

  graph.nodes.forEach(n => {
    gScore[n.id] = Infinity;
    fScore[n.id] = Infinity;
  });

  gScore[startId] = 0;
  fScore[startId] = h(startId);

  while (openSet.size > 0) {
    const u = Array.from(openSet).reduce((minNode, node) => 
      fScore[node] < fScore[minNode] ? node : minNode, Array.from(openSet)[0]);

    if (u === endId) {
      const path: string[] = [];
      let curr: string | undefined = u;
      while (curr) { path.push(curr); curr = prev[curr]; }
      buffer.addStep(StepType.HIGHLIGHT, path.reverse(), "A* reached goal node!", null, 0);
      return buffer.getSteps();
    }

    openSet.delete(u);
    buffer.addStep(StepType.VISIT, [u], `Expanding node ${u} (f = ${fScore[u].toFixed(1)})`, fScore[u], 4);

    const neighbors = graph.edges.filter(e => e.from === u);
    for (const edge of neighbors) {
      const tentativeG = gScore[u] + edge.weight;
      if (tentativeG < gScore[edge.to]) {
        prev[edge.to] = u;
        gScore[edge.to] = tentativeG;
        fScore[edge.to] = gScore[edge.to] + h(edge.to);
        openSet.add(edge.to);
        buffer.addStep(StepType.UPDATE_VALUE, [edge.to, `${u}-${edge.to}`], `Updating fScore for ${edge.to}: ${fScore[edge.to].toFixed(1)}`, fScore[edge.to], 7);
      }
    }
  }
  return buffer.getSteps();
};

// --- Standard Sorting placeholders for re-export ---
export { 
  generateQuickSortTrace, generateBubbleSortTrace, 
  generateSelectionSortTrace, generateInsertionSortTrace, 
  generateMergeSortTrace, generateHeapSortTrace, 
  generateBinarySearchTrace 
} from './sorting';
