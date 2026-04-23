import React from 'react';
import { Info, HelpCircle, Activity } from 'lucide-react';
import { SimulationState } from '../types';
import { usePhysics } from '../hooks/usePhysics';

interface InfoPanelProps {
  state: SimulationState;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ state }) => {
  const physics = usePhysics(state);
  
  const getValueColor = (val: string) => {
    if (val === 'Real' || val === 'Inverted') return 'text-rose-600';
    if (val === 'Virtual' || val === 'Erect') return 'text-indigo-600';
    return 'text-slate-900';
  };

  const getSizing = () => {
    if (physics.isInfinite) return 'Infinity';
    const m = Math.abs(physics.m);
    if (Math.abs(m - 1) < 0.05) return 'Same Size';
    if (m > 1) return 'Enlarged';
    return 'Diminished';
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 p-4 space-y-6 overflow-y-auto w-full md:w-64 shadow-inner">
      <div className="space-y-5">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider">
           Live analysis
        </label>
        
        <div className="grid grid-cols-1 gap-4">
          <DataCard 
            label="Image nature" 
            value={physics.isInfinite ? "Infinity" : (physics.isVirtual ? "Virtual" : "Real")} 
            color={physics.isInfinite ? "text-slate-400" : (physics.isVirtual ? "text-emerald-400" : "text-rose-400")}
          />
          <DataCard 
            label="Orientation" 
            value={physics.isInfinite ? "N/A" : (physics.isInverted ? "Inverted" : "Erect")} 
            color={physics.isInfinite ? "text-slate-400" : (physics.isInverted ? "text-rose-400" : "text-emerald-400")}
          />
        </div>
      </div>

      <div className="space-y-5">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider">
           Geometric data
        </label>
        <div className="space-y-2 font-mono">
           <ResultLine label={`u (Object dist from ${state.mode === 'mirror' ? 'P' : 'O'})`} value={`${state.objectDistance.toFixed(1)} cm`} />
           <ResultLine 
              label={`v (Image dist from ${state.mode === 'mirror' ? 'P' : 'O'})`} 
              value={physics.isInfinite ? "Distance is infinite" : `${Math.abs(physics.v).toFixed(1)} cm`} 
              subValue={state.mode === 'mirror' ? (physics.v > 0 ? "(Behind mirror)" : "(Front of mirror)") : (physics.v > 0 ? "(Right side)" : "(Left side)")}
           />
           {!(state.mode === 'mirror' && state.mirrorType === 'plane') && (
             <>
               <ResultLine label="f (Focal length)" value={`${state.focalLength} cm`} />
               <ResultLine label="m (Magnification)" value={physics.isInfinite ? "∞" : physics.m.toFixed(2)} />
             </>
           )}
        </div>
      </div>

      <div className="mt-auto p-4 bg-slate-800/80 rounded-xl border border-slate-700/50 shadow-lg">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
             <Info className="w-4 h-4" />
             <span className="text-[10px] font-bold text-indigo-400 tracking-wide">Concept note</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed italic">
             {state.mode === 'mirror' ? (
               state.mirrorType === 'concave' ? "Concave mirrors are converging. Real images form when object is beyond F." : "Convex mirrors always form virtual, erect and diminished images."
             ) : (
               state.lensType === 'convex' ? "Convex lenses are converging (like concave mirrors). They form real images beyond F1." : "Concave lenses are diverging and always form virtual, erect and diminished images."
             )}
          </p>
      </div>
    </div>
  );
};

const DataCard = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700/50 shadow-md">
    <div className="text-[10px] font-bold text-slate-400 mb-1 tracking-tight">{label}</div>
    <div className={`text-lg font-black ${color} tracking-tight`}>{value}</div>
  </div>
);

const ResultLine = ({ label, value, subValue }: { label: string, value: string, subValue?: string }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-slate-800/50 last:border-0 text-[11px]">
    <span className="text-slate-300 font-medium max-w-[110px] leading-tight">{label}</span>
    <div className="text-right flex flex-col items-end">
       <span className="text-white text-md font-black tracking-tighter leading-none">{value}</span>
       {subValue && <span className="text-[9px] text-indigo-400 font-bold tracking-tight mt-1">{subValue}</span>}
    </div>
  </div>
);
