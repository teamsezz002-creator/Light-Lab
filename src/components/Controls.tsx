import React from 'react';
import { Settings, RefreshCcw, Eye, EyeOff, Layout, ListChecks } from 'lucide-react';
import { SimulationState, MirrorType } from '../types';
import { challenges } from '../gameData';

interface ControlsProps {
  state: SimulationState;
  setState: React.Dispatch<React.SetStateAction<SimulationState>>;
}

export const ControlPanel: React.FC<ControlsProps> = ({ state, setState }) => {
  const handleStartGame = () => {
    const firstChallenge = challenges[0];
    setState(prev => ({
      ...prev,
      appMode: 'game',
      ...(firstChallenge.setup || {}),
      gameStatus: {
        ...prev.gameStatus,
        currentChallengeIndex: 0,
        isLevelComplete: false,
        isGameFinished: false,
        currentLevel: firstChallenge.level
      }
    }));
  };
  const mirrorTypes: { id: MirrorType; label: string }[] = [
    { id: 'concave', label: 'Concave mirror' },
    { id: 'convex', label: 'Convex mirror' },
    { id: 'plane', label: 'Plane mirror' },
  ];

  const lensTypes: { id: any; label: string }[] = [
    { id: 'convex', label: 'Convex lens' },
    { id: 'concave', label: 'Concave lens' },
  ];

  const objectTypes: { id: any; label: string }[] = [
    { id: 'arrow', label: 'Arrow' },
    { id: 'candle', label: 'Candle' },
    { id: 'person', label: 'Person' },
  ];

  const reset = () => {
    setState(prev => ({
      ...prev,
      objectDistance: 300,
      focalLength: 100,
      mode: 'mirror',
      mirrorType: 'concave',
    }));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 p-4 space-y-5 overflow-y-auto w-full md:w-60 shadow-xl shadow-slate-200/50">
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-slate-400 tracking-wider">Simulation mode</label>
        <div className="flex bg-slate-200 p-1 rounded-xl">
          <button 
            onClick={() => setState(prev => ({ ...prev, appMode: 'practice' }))}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${state.appMode === 'practice' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
          >Practice</button>
          <button 
            onClick={handleStartGame}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${state.appMode === 'game' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
          >Game mode</button>
        </div>
      </div>

      <div className="flex bg-slate-200 p-1 rounded-xl">
        <button 
          onClick={() => setState(prev => ({ ...prev, mode: 'mirror' }))}
          disabled={state.appMode === 'game'}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${state.mode === 'mirror' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'} ${state.appMode === 'game' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >Reflection</button>
        <button 
           onClick={() => setState(prev => ({ ...prev, mode: 'lens' }))}
           disabled={state.appMode === 'game'}
           className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${state.mode === 'lens' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'} ${state.appMode === 'game' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >Refraction</button>
      </div>

      {state.appMode !== 'game' && (
        <>
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider">
               Component type
            </label>
            
            <div className="grid grid-cols-1 gap-2">
              {state.mode === 'mirror' ? mirrorTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setState(prev => ({ ...prev, mirrorType: type.id }))}
                  className={`px-3 py-3 rounded-xl border-2 text-[12px] font-black transition-all ${
                    state.mirrorType === type.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400'
                  }`}
                >
                  {type.label}
                </button>
              )) : lensTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setState(prev => ({ ...prev, lensType: type.id }))}
                  className={`px-3 py-3 rounded-xl border-2 text-[12px] font-black transition-all ${
                    state.lensType === type.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-800 tracking-tight">Object type</label>
        <div className="flex gap-1.5">
          {objectTypes.map((obj) => (
            <button
              key={obj.id}
              onClick={() => setState(prev => ({ ...prev, objectType: obj.id }))}
              className={`flex-1 px-1 py-2.5 rounded-lg border-2 text-[10px] font-black transition-all ${
                state.objectType === obj.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {obj.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-[13px] font-bold text-slate-800">Object distance (u)</label>
        <div className="space-y-2">
          <input
            type="range"
            min="20"
            max="600"
            value={state.objectDistance}
            onChange={(e) => setState(prev => ({ ...prev, objectDistance: Number(e.target.value) }))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs font-mono font-bold text-slate-500">
            <span>20 cm</span>
            <span className="text-indigo-600">{state.objectDistance.toFixed(0)} cm</span>
            <span>600 cm</span>
          </div>
        </div>
      </div>

      {!(state.mode === 'mirror' && state.mirrorType === 'plane') && (
        <div className="space-y-4">
          <label className="block text-[13px] font-bold text-slate-800">Focal length (f)</label>
          <div className="space-y-2">
            <input
              type="range"
              min="50"
              max="200"
              value={state.focalLength}
              onChange={(e) => setState(prev => ({ ...prev, focalLength: Number(e.target.value) }))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs font-mono font-bold text-slate-500">
              <span>50 cm</span>
              <span className="text-indigo-600">{state.focalLength} cm</span>
              <span>200 cm</span>
            </div>
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-slate-200 space-y-2">
        <button
          onClick={() => setState(prev => ({ ...prev, showRays: !prev.showRays }))}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all"
        >
          {state.showRays ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {state.showRays ? 'Hide rays' : 'Show rays'}
        </button>
        
        <button
          onClick={reset}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all"
        >
          <RefreshCcw className="w-3.5 h-3.5" /> Reset lab
        </button>
      </div>

      <div className="mt-auto p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
         <h4 className="flex items-center gap-2 text-xs font-bold text-indigo-900 mb-2">
            <Layout className="w-3 h-3" /> Pro tip
         </h4>
         <p className="text-[11px] text-indigo-700 leading-relaxed">
            Drag the yellow <b>Object</b> directly in the simulation area to see real-time formation changes.
         </p>
      </div>
    </div>
  );
};
