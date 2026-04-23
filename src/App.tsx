/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Beaker, Layers, BookOpen } from 'lucide-react';
import { SimulationState } from './types.ts';
import { ControlPanel } from './components/Controls.tsx';
import { SimCanvas } from './components/Simulation.tsx';

export default function App() {
  const [state, setState] = useState<SimulationState>({
    mode: 'mirror',
    mirrorType: 'concave',
    lensType: 'convex',
    objectType: 'arrow',
    objectDistance: 300,
    showRays: true,
    focalLength: 100,
    appMode: 'practice',
    gameStatus: {
      currentLevel: 1,
      currentChallengeIndex: 0,
      stars: [],
      isLevelComplete: false,
      isGameFinished: false,
      startTime: null,
      attempts: 0
    }
  });

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tighter text-slate-900 leading-none">
              Light Lab
            </h1>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 border-b-2 border-indigo-600 py-4 px-1">
             <Beaker className="w-4 h-4" /> Experiment
          </button>
        </nav>

        <div className="flex items-center gap-2">
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: Controls */}
        <aside className="w-full md:w-60 shrink-0 h-auto md:h-full border-b md:border-b-0">
          <ControlPanel state={state} setState={setState} />
        </aside>

        {/* Center: Main Canvas */}
        <section className="flex-1 relative bg-slate-900 overflow-hidden">
          <SimCanvas state={state} setState={setState} />
        </section>
      </main>
    </div>
  );
}
