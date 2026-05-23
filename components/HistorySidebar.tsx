
import React from 'react';
import { GenerationBatch } from '../types';

interface HistorySidebarProps {
  history: GenerationBatch[];
  activeBatchId: string | null;
  onSelectBatch: (id: string) => void;
  onNewProject: () => void;
  onClose: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, activeBatchId, onSelectBatch, onNewProject, onClose }) => {
  return (
    <div className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-screen overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-2">
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
            title="Hide History"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Creations</h2>
        </div>
        <button 
          onClick={onNewProject}
          className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors text-white shadow-lg shadow-indigo-500/10"
          title="New Project"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-slate-900/20">
        {history.length === 0 ? (
          <div className="text-center py-10 px-4">
            <p className="text-[11px] text-slate-600 italic leading-relaxed">No past creations yet.<br/>Start a new project!</p>
          </div>
        ) : (
          history.map((batch) => {
            const firstImage = batch.variations.find(v => v.generatedImageUrl)?.generatedImageUrl;
            return (
              <button
                key={batch.id}
                onClick={() => onSelectBatch(batch.id)}
                className={`w-full text-left p-3 rounded-xl transition-all border group ${
                  activeBatchId === batch.id 
                    ? 'bg-indigo-600/10 border-indigo-500/50 ring-1 ring-indigo-500/20 shadow-lg' 
                    : 'bg-slate-800/30 border-transparent hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden flex-shrink-0 relative">
                    {firstImage ? (
                      <img src={firstImage} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800">
                        <span className="text-[10px] text-slate-600 font-bold">{batch.variations.length}</span>
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className={`text-[11px] font-bold truncate ${activeBatchId === batch.id ? 'text-indigo-300' : 'text-slate-300 group-hover:text-slate-100'}`}>
                      {batch.prompt}
                    </p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[10px] text-slate-500">
                        {new Date(batch.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {batch.style && (
                        <span className="text-[10px]">{batch.style.icon}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistorySidebar;
