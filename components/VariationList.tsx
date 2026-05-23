
import React from 'react';
import { PromptVariation } from '../types';

interface VariationListProps {
  variations: PromptVariation[];
  onGenerateImage: (id: number) => void;
  onGenerateAll: () => void;
  isGeneratingAny: boolean;
}

const VariationList: React.FC<VariationListProps> = ({ variations, onGenerateImage, onGenerateAll, isGeneratingAny }) => {
  if (variations.length === 0) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-slate-900/60 p-6 rounded-[2.5rem] border border-slate-800/60 backdrop-blur-md flex items-center justify-between shadow-2xl">
        <div>
          <h3 className="text-xl font-black text-slate-100 uppercase tracking-tighter italic">Studio Output</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Consistency Collection (3 Frames)</p>
        </div>
        <button
          onClick={onGenerateAll}
          disabled={isGeneratingAny}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20"
        >
          {isGeneratingAny ? 'Processing...' : 'New Collection'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {variations.map((v) => (
          <div key={v.id} className="bg-slate-900/80 border border-slate-800 rounded-[2.5rem] p-5 flex flex-col gap-5 group hover:border-indigo-500/30 transition-all shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-black text-indigo-400">
                0{v.id}
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 italic">ID SECURE RENDER</span>
            </div>

            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800/50">
              {v.generatedImageUrl ? (
                <>
                  <img src={v.generatedImageUrl} alt={`Render ${v.id}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 gap-3">
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = v.generatedImageUrl!;
                        link.download = `preserv-render-${v.id}-${Date.now()}.png`;
                        link.click();
                      }}
                      className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white text-[10px] font-black uppercase px-4 py-4 rounded-2xl border border-white/20 transition-all shadow-2xl"
                    >
                      Export Frame
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center p-8 text-center bg-red-950/10">
                   <p className="text-red-400 text-[10px] font-black uppercase tracking-tighter">Render Error</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VariationList;
