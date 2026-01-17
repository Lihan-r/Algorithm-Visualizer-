
import { TraceStep, StepType } from '../types';

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

export const generateQuickSortTrace = (inputArray: number[]): TraceStep[] => {
  const buffer = new VisualizerBuffer();
  const arr = [...inputArray];
  const partition = (low: number, high: number): number => {
    const pivot = arr[high];
    buffer.addStep(StepType.MARK_PIVOT, [high], `Picked pivot ${pivot}`, pivot, 1);
    let i = low - 1;
    for (let j = low; j < high; j++) {
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        buffer.addStep(StepType.SWAP, [i, j], `Swapping ${arr[i]} and ${arr[j]}`, null, 4);
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    buffer.addStep(StepType.SWAP, [i + 1, high], `Final pivot placement`, null, 5);
    return i + 1;
  };
  const quickSort = (low: number, high: number) => {
    if (low < high) {
      const p = partition(low, high);
      quickSort(low, p - 1);
      quickSort(p + 1, high);
    }
  };
  quickSort(0, arr.length - 1);
  return buffer.getSteps();
};

export const generateBubbleSortTrace = (inputArray: number[]): TraceStep[] => {
  const buffer = new VisualizerBuffer();
  const arr = [...inputArray];
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      buffer.addStep(StepType.COMPARE, [j, j+1], `Comparing ${arr[j]} and ${arr[j+1]}`, null, 2);
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        buffer.addStep(StepType.SWAP, [j, j + 1], `Swapping ${arr[j]} and ${arr[j+1]}`, null, 3);
      }
    }
  }
  return buffer.getSteps();
};

export const generateSelectionSortTrace = (inputArray: number[]): TraceStep[] => {
  const buffer = new VisualizerBuffer();
  const arr = [...inputArray];
  for (let i = 0; i < arr.length; i++) {
    let min = i;
    for (let j = i + 1; j < arr.length; j++) {
      buffer.addStep(StepType.COMPARE, [min, j], `Comparing ${arr[min]} with ${arr[j]}`, null, 0);
      if (arr[j] < arr[min]) min = j;
    }
    if (i !== min) {
      [arr[i], arr[min]] = [arr[min], arr[i]];
      buffer.addStep(StepType.SWAP, [i, min], `Swapping min element ${arr[min]} to index ${i}`, null, 0);
    }
  }
  return buffer.getSteps();
};

export const generateInsertionSortTrace = (inputArray: number[]): TraceStep[] => {
  const buffer = new VisualizerBuffer();
  const arr = [...inputArray];
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      buffer.addStep(StepType.UPDATE_VALUE, [j + 1], `Shifting element at ${j}`, arr[j], 0);
      j--;
    }
    arr[j + 1] = key;
    buffer.addStep(StepType.UPDATE_VALUE, [j + 1], `Inserting key ${key}`, key, 0);
  }
  return buffer.getSteps();
};

export const generateMergeSortTrace = (inputArray: number[]): TraceStep[] => {
  const buffer = new VisualizerBuffer();
  const arr = [...inputArray];
  const merge = (l: number, m: number, r: number) => {
    const L = arr.slice(l, m + 1);
    const R = arr.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < L.length && j < R.length) {
      buffer.addStep(StepType.COMPARE, [l + i, m + 1 + j], `Comparing ${L[i]} with ${R[j]}`, null, 0);
      if (L[i] <= R[j]) {
        arr[k] = L[i++];
      } else {
        arr[k] = R[j++];
      }
      buffer.addStep(StepType.UPDATE_VALUE, [k], `Placing ${arr[k]} at index ${k}`, arr[k], 0);
      k++;
    }
    while (i < L.length) {
      arr[k] = L[i++];
      buffer.addStep(StepType.UPDATE_VALUE, [k], `Placing remaining ${arr[k]}`, arr[k], 0);
      k++;
    }
    while (j < R.length) {
      arr[k] = R[j++];
      buffer.addStep(StepType.UPDATE_VALUE, [k], `Placing remaining ${arr[k]}`, arr[k], 0);
      k++;
    }
  };
  const sort = (l: number, r: number) => {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    sort(l, m);
    sort(m + 1, r);
    merge(l, m, r);
  };
  sort(0, arr.length - 1);
  return buffer.getSteps();
};

export const generateHeapSortTrace = (inputArray: number[]): TraceStep[] => {
  const buffer = new VisualizerBuffer();
  const arr = [...inputArray];
  const heapify = (n: number, i: number) => {
    let largest = i, l = 2*i+1, r = 2*i+2;
    if (l < n) {
      buffer.addStep(StepType.COMPARE, [largest, l], `Comparing ${arr[largest]} with left child ${arr[l]}`, null, 0);
      if (arr[l] > arr[largest]) largest = l;
    }
    if (r < n) {
      buffer.addStep(StepType.COMPARE, [largest, r], `Comparing ${arr[largest]} with right child ${arr[r]}`, null, 0);
      if (arr[r] > arr[largest]) largest = r;
    }
    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      buffer.addStep(StepType.SWAP, [i, largest], `Heapify: swapping ${arr[largest]} with ${arr[i]}`, null, 0);
      heapify(n, largest);
    }
  };
  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) heapify(arr.length, i);
  for (let i = arr.length - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    buffer.addStep(StepType.SWAP, [0, i], `Extracting max ${arr[i]}`, null, 0);
    heapify(i, 0);
  }
  return buffer.getSteps();
};

export const generateBinarySearchTrace = (inputArray: number[], target: number): TraceStep[] => {
  const buffer = new VisualizerBuffer();
  const arr = [...inputArray].sort((a, b) => a - b);
  let l = 0, r = arr.length - 1;
  while (l <= r) {
    const m = Math.floor((l + r) / 2);
    buffer.addStep(StepType.COMPARE, [m], `Binary search middle: ${arr[m]}`, null, 0);
    if (arr[m] === target) {
      buffer.addStep(StepType.FOUND, [m], `Found target!`, null, 0);
      return buffer.getSteps();
    }
    if (arr[m] < target) l = m + 1;
    else r = m - 1;
  }
  return buffer.getSteps();
};
