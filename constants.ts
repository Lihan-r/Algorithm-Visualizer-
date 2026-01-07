import { AlgorithmMetadata, AlgorithmCategory, GraphData } from './types';

export const ALGORITHMS: AlgorithmMetadata[] = [
  {
    id: 'quicksort',
    name: 'Quick Sort',
    category: AlgorithmCategory.SORTING,
    description: 'Divide-and-conquer algorithm that partitions an array around a pivot.',
    complexity: { time: 'O(n log n)', space: 'O(log n)' },
    pseudoCode: [
      'quickSort(arr, low, high):',
      '  if low < high:',
      '    p = partition(arr, low, high)',
      '    quickSort(arr, low, p - 1)',
      '    quickSort(arr, p + 1, high)'
    ]
  },
  {
    id: 'bubblesort',
    name: 'Bubble Sort',
    category: AlgorithmCategory.SORTING,
    description: 'Repeatedly steps through the list, compares adjacent elements and swaps them.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
    pseudoCode: [
      'for i from 0 to n-1:',
      '  for j from 0 to n-i-1:',
      '    if arr[j] > arr[j+1]: swap(arr[j], arr[j+1])'
    ]
  },
  {
    id: 'selectionsort',
    name: 'Selection Sort',
    category: AlgorithmCategory.SORTING,
    description: 'Repeatedly selects the minimum element from the unsorted part and puts it at the beginning.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
    pseudoCode: [
      'for i from 0 to n-1:',
      '  min_idx = i',
      '  for j from i+1 to n:',
      '    if arr[j] < arr[min_idx]: min_idx = j',
      '  swap(arr[min_idx], arr[i])'
    ]
  },
  {
    id: 'insertionsort',
    name: 'Insertion Sort',
    category: AlgorithmCategory.SORTING,
    description: 'Builds the final sorted array one item at a time by inserting each new element into its correct position.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
    pseudoCode: [
      'for i from 1 to n:',
      '  key = arr[i]',
      '  j = i - 1',
      '  while j >= 0 and arr[j] > key:',
      '    arr[j+1] = arr[j]',
      '    j = j - 1',
      '  arr[j+1] = key'
    ]
  },
  {
    id: 'mergesort',
    name: 'Merge Sort',
    category: AlgorithmCategory.SORTING,
    description: 'Recursively divides the array into halves, sorts them, and merges them.',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    pseudoCode: [
      'mergeSort(arr):',
      '  if n > 1:',
      '    mid = n / 2',
      '    L = mergeSort(left)',
      '    R = mergeSort(right)',
      '    merge(L, R)'
    ]
  },
  {
    id: 'heapsort',
    name: 'Heap Sort',
    category: AlgorithmCategory.SORTING,
    description: 'Comparison-based sorting algorithm that uses a binary heap data structure.',
    complexity: { time: 'O(n log n)', space: 'O(1)' },
    pseudoCode: [
      'buildMaxHeap(arr)',
      'for i from n-1 down to 1:',
      '  swap(arr[0], arr[i])',
      '  maxHeapify(arr, 0, i)'
    ]
  },
  {
    id: 'binarysearch',
    name: 'Binary Search',
    category: AlgorithmCategory.SEARCH,
    description: 'Finds the position of a target value within a sorted array by repeatedly dividing the search interval in half.',
    complexity: { time: 'O(log n)', space: 'O(1)' },
    pseudoCode: [
      'binarySearch(arr, target):',
      '  low = 0, high = n-1',
      '  while low <= high:',
      '    mid = (low + high) / 2',
      '    if arr[mid] == target: return mid',
      '    if arr[mid] < target: low = mid + 1',
      '    else: high = mid - 1'
    ]
  },
  {
    id: 'bfs',
    name: 'BFS',
    category: AlgorithmCategory.PATHFINDING,
    description: 'Breadth-First Search: Explores all neighbor nodes at the present depth level.',
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    pseudoCode: [
      'BFS(graph, start):',
      '  Q = [start]',
      '  while Q not empty:',
      '    v = Q.dequeue()',
      '    for each neighbor w of v:',
      '      if not visited: Q.enqueue(w)'
    ]
  },
  {
    id: 'dfs',
    name: 'DFS',
    category: AlgorithmCategory.PATHFINDING,
    description: 'Depth-First Search: Explores as far as possible along each branch before backtracking.',
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    pseudoCode: [
      'DFS(graph, start):',
      '  S = [start]',
      '  while S not empty:',
      '    v = S.pop()',
      '    if not visited: DFS_visit(v)'
    ]
  },
  {
    id: 'dijkstra',
    name: "Dijkstra's",
    category: AlgorithmCategory.PATHFINDING,
    description: "Finds the shortest path in a weighted directed graph.",
    complexity: { time: 'O(V²)', space: 'O(V)' },
    pseudoCode: [
      'Dijkstra(Graph, start):',
      '  dist[start] = 0',
      '  while Q is not empty:',
      '    u = vertex with min dist[u]',
      '    for each neighbor v of u:',
      '      relax(u, v, weight)'
    ]
  },
  {
    id: 'astar',
    name: "A* Search",
    category: AlgorithmCategory.PATHFINDING,
    description: "Heuristic search algorithm that finds the shortest path by estimating distance to goal.",
    complexity: { time: 'O(E)', space: 'O(V)' },
    pseudoCode: [
      'AStar(start, goal):',
      '  fScore[start] = h(start, goal)',
      '  while openSet not empty:',
      '    u = node with min fScore',
      '    for each neighbor v of u:',
      '      if tentative_g < gScore[v]: update(v)'
    ]
  }
];

export const INITIAL_ARRAY_SIZE = 25;

export const DEFAULT_GRAPH: GraphData = {
  nodes: [
    { id: 'A', x: 100, y: 200 },
    { id: 'B', x: 250, y: 100 },
    { id: 'C', x: 250, y: 300 },
    { id: 'D', x: 450, y: 100 },
    { id: 'E', x: 450, y: 300 },
    { id: 'F', x: 600, y: 200 },
    { id: 'G', x: 350, y: 200 },
    { id: 'H', x: 520, y: 200 }
  ],
  edges: [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'C', weight: 2 },
    { from: 'B', to: 'D', weight: 5 },
    { from: 'B', to: 'G', weight: 3 },
    { from: 'C', to: 'G', weight: 1 },
    { from: 'C', to: 'E', weight: 8 },
    { from: 'G', to: 'D', weight: 6 },
    { from: 'G', to: 'E', weight: 2 },
    { from: 'D', to: 'F', weight: 3 },
    { from: 'E', to: 'F', weight: 1 },
    { from: 'G', to: 'H', weight: 4 },
    { from: 'H', to: 'F', weight: 2 }
  ]
};
