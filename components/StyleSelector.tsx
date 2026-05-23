
import React from 'react';
import { ArtisticStyle, ARTISTIC_STYLES } from '../constants';

interface StyleSelectorProps {
  selectedStyleId: string | null;
  onStyleSelect: (style: ArtisticStyle | null) => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyleId, onStyleSelect }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-teal-500 rounded-full"></div>
          <label className="text-sm font-bold uppercase tracking-widest text-slate-300">Artistic Style</label>
        </div>
        {selectedStyleId && (
          <button 
            onClick={() => onStyleSelect(null)}
            className="text-[10px] text-teal-400 hover:text-teal-300 font-black uppercase"
          >
            Original
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {ARTISTIC_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onStyleSelect(style)}
            className={`flex flex-col items-center justify-center py-3 px-1 rounded-2xl border transition-all text-center gap-1.5 group ${
              selectedStyleId === style.id
                ? 'bg-teal-500/10 border-teal-500 shadow-lg shadow-teal-500/10'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className={`text-xl transition-transform ${selectedStyleId === style.id ? 'scale-110' : 'group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-50 group-hover:opacity-100'}`}>
              {style.icon}
            </span>
            <span className={`text-[9px] font-black uppercase tracking-tighter leading-none ${
              selectedStyleId === style.id ? 'text-teal-400' : 'text-slate-600'
            }`}>
              {style.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StyleSelector;
