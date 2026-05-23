
import React, { useState } from 'react';
import { ReferenceImage, GenerationState, PromptVariation, GenerationBatch } from './types';
import { ArtisticStyle, THEME_TEMPLATES } from './constants';
import { geminiService } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import VariationList from './components/VariationList';
import StyleSelector from './components/StyleSelector';
import HistorySidebar from './components/HistorySidebar';

const App: React.FC = () => {
  const [images, setImages] = useState<ReferenceImage[]>([]);
  const [userPrompt, setUserPrompt] = useState('');
  const [aiTwinDescription, setAiTwinDescription] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<ArtisticStyle | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState(0);

  const [state, setState] = useState<GenerationState>({
    isGeneratingVariations: false,
    isGeneratingImages: false,
    currentBatchId: null,
    history: [],
    error: null
  });

  const activeBatch = state.history.find(h => h.id === state.currentBatchId) || null;

  const handleGenerate = async () => {
    if (images.length === 0 && !aiTwinDescription.trim()) {
      setState(prev => ({ ...prev, error: "Please provide a subject identity via photos or description." }));
      return;
    }
    if (!userPrompt.trim()) {
      setState(prev => ({ ...prev, error: "Please describe the scene you want to create." }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isGeneratingVariations: true, 
      isGeneratingImages: true, 
      error: null,
      currentBatchId: null 
    }));
    setStatusMessage("Refining identity and composition...");
    setCurrentProgress(0);

    try {
      // Step 1: Generate 3 variations (prompts only)
      const refinedPrompts = await geminiService.generatePrompts(
        userPrompt, 
        images, 
        selectedStyle || undefined, 
        aiTwinDescription
      );
      
      const batchId = Math.random().toString(36).substring(2, 11);
      const variationsResults: PromptVariation[] = [];

      // Step 2: Generate 3 Images sequentially
      for (let i = 0; i < refinedPrompts.length; i++) {
        setCurrentProgress(i + 1);
        let success = false;
        let imageUrl = '';
        let retryCount = 0;

        while (!success) {
          try {
            setStatusMessage(`Rendering frame ${i + 1} of 3...`);
            imageUrl = await geminiService.generateImage(refinedPrompts[i], images, aiTwinDescription);
            success = true;
          } catch (err: any) {
            if (err.message === "QUOTA_REACHED") {
              retryCount++;
              const waitTime = Math.min(12, 2 + retryCount * 2);
              setStatusMessage(`Slot full. Adjusting environment... (${waitTime}s)`);
              await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            } else {
              if (retryCount > 1) throw err;
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        }

        variationsResults.push({
          id: i + 1,
          text: refinedPrompts[i],
          status: 'completed',
          generatedImageUrl: imageUrl
        });
        
        // Brief pause between requests
        if (i < refinedPrompts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      // Step 3: Update History
      const newBatch: GenerationBatch = {
        id: batchId,
        timestamp: Date.now(),
        prompt: userPrompt,
        style: selectedStyle || undefined,
        variations: variationsResults,
        referenceImages: [...images]
      };

      setState(prev => ({
        ...prev,
        history: [newBatch, ...prev.history],
        currentBatchId: batchId,
        isGeneratingVariations: false,
        isGeneratingImages: false,
        error: null
      }));
      setStatusMessage(null);

    } catch (err: any) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        isGeneratingVariations: false, 
        isGeneratingImages: false, 
        error: "We encountered an issue during the render process. Please try again." 
      }));
      setStatusMessage(null);
    }
  };

  const handleNewProject = () => {
    setImages([]);
    setUserPrompt('');
    setAiTwinDescription('');
    setSelectedStyle(null);
    setState(prev => ({ ...prev, currentBatchId: null, error: null }));
    setStatusMessage(null);
  };

  const selectBatch = (id: string) => {
    const batch = state.history.find(h => h.id === id);
    if (batch) {
      setImages(batch.referenceImages);
      setUserPrompt(batch.prompt);
      setSelectedStyle(batch.style || null);
      setState(prev => ({ ...prev, currentBatchId: id }));
    }
  };

  const applyTheme = (theme: typeof THEME_TEMPLATES[0]) => {
    if (theme.id === 'keep_outfit') {
      const base = userPrompt || "A professional high-end portrait";
      if (!userPrompt.includes("same clothing")) {
        setUserPrompt(`${base}. Same clothing and accessories as the reference photo.`);
      }
    } else {
      setUserPrompt(theme.prompt);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden selection:bg-indigo-500/30">
      {/* Creation History Sidebar */}
      <div className={`transition-all duration-500 ease-in-out border-r border-slate-800/40 bg-slate-900/60 backdrop-blur-2xl ${isSidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>
        <HistorySidebar 
          history={state.history} 
          activeBatchId={state.currentBatchId} 
          onSelectBatch={selectBatch} 
          onNewProject={handleNewProject}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar bg-gradient-to-br from-[#0a0f1e] via-[#0f172a] to-[#1e1b4b]/20">
        {!isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(true)} className="fixed top-8 left-8 z-50 p-3 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </button>
        )}

        <div className="max-w-6xl mx-auto w-full p-8 md:p-12 space-y-10">
          <header className="flex flex-col items-center text-center space-y-3 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="px-8 py-2.5 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 rounded-full shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] mb-2">
              <span className="text-3xl font-black text-white tracking-tighter uppercase italic">preSERV</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Identity Studio</h1>
            <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">Sequential 3-Photo Synthesis</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Control Panel */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-slate-900/50 border border-slate-800/50 p-8 rounded-[3rem] shadow-2xl backdrop-blur-3xl space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
                
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-7 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">Identity Source</h2>
                  </div>

                  {images.length > 0 || !aiTwinDescription ? (
                    <ImageUploader 
                      images={images} 
                      onImagesChange={(newImgs) => {
                        setImages(newImgs);
                        if (newImgs.length > 0) setAiTwinDescription('');
                      }} 
                    />
                  ) : null}

                  {images.length === 0 && (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Twin DNA</label>
                        <button onClick={() => setAiTwinDescription('')} className="text-[10px] text-indigo-400 font-black uppercase hover:text-indigo-300 transition-colors">Reset</button>
                      </div>
                      <textarea
                        value={aiTwinDescription}
                        onChange={(e) => setAiTwinDescription(e.target.value)}
                        placeholder="Define subject traits (e.g. 'Mid-30s woman, high cheekbones, dark emerald eyes, sharp jawline')."
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 min-h-[100px] resize-none"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-7 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">Composition</h2>
                  </div>
                  <textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Describe the scene, action, and lighting..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 min-h-[140px] resize-none"
                  />
                </div>

                <StyleSelector 
                  selectedStyleId={selectedStyle?.id || null} 
                  onStyleSelect={setSelectedStyle} 
                />

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rapid Templates</label>
                  <div className="flex flex-wrap gap-2">
                    {THEME_TEMPLATES.map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => applyTheme(theme)}
                        className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl text-[10px] font-bold text-slate-300 transition-all flex items-center gap-2"
                      >
                        <span>{theme.icon}</span>
                        {theme.name}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={state.isGeneratingImages}
                  className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-3xl font-black uppercase tracking-widest transition-all shadow-2xl shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {state.isGeneratingImages ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Render {currentProgress}/3
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Synthesize 3 Photos
                      </>
                    )}
                  </span>
                </button>

                {statusMessage && (
                  <p className="text-center text-[10px] font-bold text-indigo-400 uppercase tracking-widest animate-pulse">
                    {statusMessage}
                  </p>
                )}

                {state.error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider text-center">{state.error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Output Display */}
            <div className="lg:col-span-7">
              {activeBatch ? (
                <VariationList 
                  variations={activeBatch.variations} 
                  onGenerateImage={() => {}} 
                  onGenerateAll={handleGenerate}
                  isGeneratingAny={state.isGeneratingImages}
                />
              ) : (
                <div className="h-[600px] border-2 border-dashed border-slate-800/50 rounded-[3rem] flex flex-col items-center justify-center text-slate-700 gap-6 bg-slate-900/10">
                   <div className="w-20 h-20 rounded-full border-4 border-slate-800/50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                   </div>
                   <div className="text-center space-y-2">
                    <p className="text-xs font-black uppercase tracking-widest opacity-50">Awaiting Genetic Sequence</p>
                    <p className="text-[10px] font-bold opacity-30">A collection of 3 photos will manifest here</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
