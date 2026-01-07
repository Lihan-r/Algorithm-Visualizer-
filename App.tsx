
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  AlgorithmCategory, 
  AlgorithmMetadata, 
  StepType 
} from './types';
import { ALGORITHMS, INITIAL_ARRAY_SIZE, DEFAULT_GRAPH } from './constants';
import { 
  generateQuickSortTrace, 
  generateBubbleSortTrace,
  generateSelectionSortTrace,
  generateInsertionSortTrace,
  generateMergeSortTrace,
  generateHeapSortTrace,
  generateBinarySearchTrace,
  generateDijkstraTrace, 
  generateAStarTrace,
  generateBFSTrace,
  generateDFSTrace
} from './services/recorder';
import { useVisualizer } from './hooks/useVisualizer';
import { SortingVisualizer } from './components/SortingVisualizer';
import { GraphVisualizer } from './components/GraphVisualizer';
import { PlaybackControls } from './components/PlaybackControls';
import { Timeline } from './components/Timeline';

const App: React.FC = () => {
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmMetadata>(ALGORITHMS[0]);
  const [arraySize, setArraySize] = useState<number>(INITIAL_ARRAY_SIZE);
  const [inputArray, setInputArray] = useState<number[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isSortingOrSearch = useMemo(() => 
    selectedAlgo.category === AlgorithmCategory.SORTING || selectedAlgo.category === AlgorithmCategory.SEARCH,
    [selectedAlgo]
  );

  const generateTrace = useCallback((algo: AlgorithmMetadata, dataArr: number[]) => {
    switch (algo.id) {
      case 'quicksort': return generateQuickSortTrace(dataArr);
      case 'bubblesort': return generateBubbleSortTrace(dataArr);
      case 'selectionsort': return generateSelectionSortTrace(dataArr);
      case 'insertionsort': return generateInsertionSortTrace(dataArr);
      case 'mergesort': return generateMergeSortTrace(dataArr);
      case 'heapsort': return generateHeapSortTrace(dataArr);
      case 'binarysearch': return generateBinarySearchTrace(dataArr, dataArr[Math.floor(Math.random() * dataArr.length)]);
      case 'dijkstra': return generateDijkstraTrace(DEFAULT_GRAPH, 'A', 'F');
      case 'astar': return generateAStarTrace(DEFAULT_GRAPH, 'A', 'F');
      case 'bfs': return generateBFSTrace(DEFAULT_GRAPH, 'A', 'F');
      case 'dfs': return generateDFSTrace(DEFAULT_GRAPH, 'A', 'F');
      default: return [];
    }
  }, []);

  const initializeData = useCallback(() => {
    if (isSortingOrSearch) {
      // Create random values but maintain the count based on arraySize
      const newArr = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 1);
      const finalArr = selectedAlgo.id === 'binarysearch' ? [...newArr].sort((a,b) => a-b) : newArr;
      setInputArray(finalArr);
      setSteps(generateTrace(selectedAlgo, finalArr));
    } else {
      setSteps(generateTrace(selectedAlgo, []));
    }
    setAiInsight(null);
    setIsAiLoading(false);
  }, [selectedAlgo, arraySize, isSortingOrSearch, generateTrace]);

  useEffect(() => {
    initializeData();
  }, [selectedAlgo.id, arraySize]);

  const {
    currentStepIndex,
    isPlaying,
    playbackSpeed,
    togglePlay,
    stepForward,
    stepBackward,
    seek,
    setSpeed
  } = useVisualizer(steps);

  const analyzeStepWithAI = async () => {
    if (currentStepIndex < 0) return;
    setIsAiLoading(true);
    setAiInsight(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const currentStep = steps[currentStepIndex];
      const prompt = `Analyze this algorithm step for a technical visualization tool.
      Algorithm: ${selectedAlgo.name}
      Type: ${selectedAlgo.category}
      Action: ${currentStep.description}
      Targets: ${JSON.stringify(currentStep.targets)}
      Provide a concise 2-sentence technical explanation of what is happening in this specific state.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      if (isAiLoading) { // Check if we haven't manually cancelled
        setAiInsight(response.text || "Insight could not be generated.");
      }
    } catch (e) {
      if (isAiLoading) {
        setAiInsight("Error retrieving AI insights. Ensure your API key is valid.");
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const cancelInsight = () => {
    setIsAiLoading(false);
    setAiInsight(null);
  };

  const currentLine = useMemo(() => steps[currentStepIndex]?.lineReference ?? -1, [currentStepIndex, steps]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#050507] text-zinc-100">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 flex items-center justify-center bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Algorithm visualizer</h1>
        </div>

        <div className="flex items-center gap-4">
          <select 
            className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer hover:border-white/20"
            value={selectedAlgo.id}
            onChange={(e) => setSelectedAlgo(ALGORITHMS.find(a => a.id === e.target.value)!)}
          >
            {ALGORITHMS.map(algo => (
              <option key={algo.id} value={algo.id}>{algo.name}</option>
            ))}
          </select>
          <button 
            onClick={initializeData}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium rounded-xl border border-white/5 transition-all flex items-center gap-2 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Reset
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        <aside className="w-80 border-r border-white/5 bg-zinc-950/40 p-6 flex flex-col gap-8 overflow-y-auto shrink-0 scrollbar-hide">
          <section>
            <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">Specs</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Time</p>
                <p className="text-sm font-mono text-amber-400">{selectedAlgo.complexity.time}</p>
              </div>
              <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Space</p>
                <p className="text-sm font-mono text-indigo-400">{selectedAlgo.complexity.space}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed italic">"{selectedAlgo.description}"</p>
          </section>

          <section className="flex flex-col gap-6">
            <div>
              <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">Source</h2>
              <div className="bg-black/50 rounded-2xl border border-white/5 overflow-hidden font-mono text-[11px] p-4 relative group">
                 <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                   <span className="text-[8px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">Pseudo</span>
                 </div>
                 {selectedAlgo.pseudoCode.map((line, i) => (
                    <div key={i} className={`px-2 py-0.5 rounded transition-colors ${currentLine === i ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30' : 'text-zinc-600'}`}>
                      {line}
                    </div>
                 ))}
              </div>
            </div>

            {isSortingOrSearch && (
              <div className="p-5 bg-zinc-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex flex-col">
                    <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Array Size</h2>
                    <p className="text-[8px] text-zinc-500 font-medium">Element Count</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                    {arraySize}
                  </span>
                </div>
                <div className="relative group/slider h-8 flex items-center">
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="1"
                    value={arraySize}
                    onChange={(e) => setArraySize(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 group-hover/slider:accent-indigo-400 transition-all"
                  />
                </div>
                <div className="flex justify-between mt-1 px-1">
                  <span className="text-[8px] text-zinc-600 font-bold">5</span>
                  <span className="text-[8px] text-zinc-600 font-bold">100</span>
                </div>
              </div>
            )}
          </section>
        </aside>

        <section className="flex-1 relative flex flex-col bg-zinc-950 overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_60%)] pointer-events-none" />
            
            <div className="w-full max-w-5xl z-10 transition-transform duration-500">
              {isSortingOrSearch ? (
                <SortingVisualizer initialArray={inputArray} steps={steps} currentStepIndex={currentStepIndex} />
              ) : (
                <GraphVisualizer 
                  data={DEFAULT_GRAPH} 
                  steps={steps} 
                  currentStepIndex={currentStepIndex} 
                />
              )}
            </div>
          </div>

          <div className="shrink-0 border-t border-white/5 bg-zinc-950/80 backdrop-blur-md">
            <Timeline currentStepIndex={currentStepIndex} totalSteps={steps.length} onSeek={seek} />
            <PlaybackControls 
              isPlaying={isPlaying} onTogglePlay={togglePlay} 
              onStepForward={stepForward} onStepBackward={stepBackward} 
              playbackSpeed={playbackSpeed} onSpeedChange={setSpeed} 
            />
          </div>
        </section>

        <aside className="w-80 border-l border-white/5 bg-zinc-950/40 flex flex-col shrink-0">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/20">
            <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Insights</h2>
            <div className="flex items-center gap-2">
              {isAiLoading && (
                <button 
                  onClick={cancelInsight}
                  className="text-[9px] font-black text-zinc-500 hover:text-zinc-300 uppercase tracking-tighter transition-colors"
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={analyzeStepWithAI}
                disabled={isAiLoading || currentStepIndex < 0}
                className={`p-1.5 rounded-lg text-indigo-400 disabled:opacity-30 transition-all hover:bg-indigo-500/10 ${isAiLoading ? 'cursor-default' : 'active:scale-90'}`}
                title="Explain with AI"
              >
                <svg className={`w-5 h-5 ${isAiLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {(aiInsight || isAiLoading) && (
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl relative group/insight animate-in zoom-in-95 duration-300">
                {!isAiLoading && (
                  <button 
                    onClick={cancelInsight}
                    className="absolute top-2 right-2 p-1 text-indigo-400/50 hover:text-indigo-400 hover:bg-indigo-500/20 rounded transition-all opacity-0 group-hover/insight:opacity-100"
                    title="Clear insight"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${isAiLoading ? 'bg-zinc-500 animate-pulse' : 'bg-indigo-500'}`} />
                  <span className="text-[10px] font-black text-indigo-400/80 uppercase tracking-widest">
                    {isAiLoading ? 'Generating...' : 'Analysis'}
                  </span>
                </div>
                {isAiLoading ? (
                  <div className="space-y-2">
                    <div className="h-2 bg-indigo-500/5 rounded w-full animate-pulse" />
                    <div className="h-2 bg-indigo-500/5 rounded w-5/6 animate-pulse" />
                  </div>
                ) : (
                  <p className="text-xs text-indigo-100/90 leading-relaxed pr-2">{aiInsight}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-zinc-600 uppercase px-2 tracking-widest">Logs</h3>
              {steps.slice(0, currentStepIndex + 1).slice(-15).reverse().map((step) => (
                <div key={step.stepIndex} className="p-3 bg-zinc-900/30 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                   <div className="flex justify-between items-start mb-1">
                     <span className="text-[9px] font-bold text-indigo-500/70 uppercase group-hover:text-indigo-500 transition-colors">{step.type}</span>
                     <span className="text-[8px] font-mono text-zinc-700">#{step.stepIndex}</span>
                   </div>
                   <p className="text-[11px] text-zinc-400 leading-tight">{step.description}</p>
                </div>
              ))}
              {currentStepIndex === -1 && (
                <div className="p-8 text-center border border-dashed border-white/5 rounded-xl">
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Execution history empty</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </main>

      <footer className="px-6 py-2 bg-black border-t border-white/5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`} />
          <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
             {isSortingOrSearch ? 'Linear Array Environment' : 'Directed Graph Environment'}
          </div>
        </div>
        <div className="text-[9px] text-zinc-600 font-mono">
           SESSION: {Math.random().toString(36).substring(7).toUpperCase()}
        </div>
      </footer>
    </div>
  );
};

export default App;
