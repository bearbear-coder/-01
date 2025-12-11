import React from 'react';
import { TreeState } from '../types';
import { Sparkles, Box, Maximize2, Minimize2 } from 'lucide-react';

interface OverlayProps {
  treeState: TreeState;
  setTreeState: (state: TreeState) => void;
}

export const Overlay: React.FC<OverlayProps> = ({ treeState, setTreeState }) => {
  const isTree = treeState === TreeState.TREE_SHAPE;

  const toggle = () => {
    setTreeState(isTree ? TreeState.SCATTERED : TreeState.TREE_SHAPE);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      {/* Header */}
      <header className="flex justify-between items-start">
        <div className="bg-black/30 backdrop-blur-md p-6 rounded-sm border-l-2 border-yellow-500/70 shadow-2xl">
          <h1 className="text-4xl md:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 tracking-wider">
            ARIX
          </h1>
          <p className="text-emerald-400 font-light tracking-[0.2em] text-sm mt-2 uppercase">
            Signature Collection
          </p>
        </div>
        
        <div className="hidden md:block text-right opacity-70">
           <p className="text-yellow-100/50 text-xs font-mono">XMAS-25-EXP</p>
           <p className="text-yellow-100/50 text-xs font-mono">LAT: 40.7128° N</p>
        </div>
      </header>

      {/* Footer Controls */}
      <footer className="flex items-end justify-between w-full">
        <div className="max-w-md text-yellow-100/60 text-sm font-light hidden md:block">
           <p>Experience the convergence of digital art and holiday tradition. <br/>
           Toggle the structural integrity to observe particle dualism.</p>
        </div>

        <div className="pointer-events-auto">
          <button
            onClick={toggle}
            className={`
              group relative flex items-center gap-4 px-8 py-4 
              transition-all duration-700 ease-out
              border border-yellow-500/30
              hover:border-yellow-400
              backdrop-blur-xl
              ${isTree ? 'bg-emerald-950/40' : 'bg-black/40'}
            `}
          >
            {/* Button Glow Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-yellow-400 blur-xl transition-opacity duration-700" />
            
            <div className="relative z-10 flex flex-col items-end">
                <span className="text-xs text-yellow-500/80 uppercase tracking-widest mb-1">
                    System State
                </span>
                <span className="text-2xl font-serif text-yellow-100 tracking-wide min-w-[140px] text-right">
                    {isTree ? 'ASSEMBLED' : 'SCATTERED'}
                </span>
            </div>

            <div className={`
                relative z-10 p-3 rounded-full border border-yellow-500/50
                transition-transform duration-700
                ${isTree ? 'rotate-0' : 'rotate-180'}
            `}>
                {isTree ? (
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                ) : (
                    <Box className="w-6 h-6 text-emerald-400" />
                )}
            </div>
          </button>
        </div>
      </footer>
    </div>
  );
};
