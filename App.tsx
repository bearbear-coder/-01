import React, { useState, Suspense } from 'react';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';
import { TreeState } from './types';
import { Loader } from '@react-three/drei';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);

  return (
    <div className="w-full h-screen bg-black relative font-sans text-white overflow-hidden selection:bg-yellow-500/30">
      
      <Suspense fallback={null}>
        <Experience treeState={treeState} />
      </Suspense>

      <Overlay treeState={treeState} setTreeState={setTreeState} />
      
      <Loader 
        containerStyles={{ background: '#020603' }}
        innerStyles={{ width: '200px', height: '2px', background: '#333' }}
        barStyles={{ background: '#FFD700', height: '2px' }}
        dataInterpolation={(p) => `Loading Arix Signature Experience ${p.toFixed(0)}%`}
        dataStyles={{ color: '#FFD700', fontFamily: 'serif', letterSpacing: '2px', fontSize: '12px' }}
      />
    </div>
  );
};

export default App;