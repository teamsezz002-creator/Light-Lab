import React, { useEffect, useState } from 'react';
import { Trophy, Star, Clock, Target, Zap } from 'lucide-react';
import { SimulationState } from '../types';
import { challenges } from '../gameData';
import { motion, AnimatePresence } from 'motion/react';

interface GameHUDProps {
  state: SimulationState;
  setState: React.Dispatch<React.SetStateAction<SimulationState>>;
}

export const GameHUD: React.FC<GameHUDProps> = ({ state, setState }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const currentChallenge = challenges[state.gameStatus.currentChallengeIndex];

  useEffect(() => {
    let interval: any;
    if (state.appMode === 'game' && !state.gameStatus.isLevelComplete) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.appMode, state.gameStatus.isLevelComplete]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (state.appMode !== 'game') return null;

  return (
    <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-slate-900/90 to-transparent pointer-events-none">
      <div className="max-w-4xl mx-auto flex flex-col gap-3">
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full shadow-lg">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white tracking-wide">Level {state.gameStatus.currentLevel}</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map(i => (
                <Star key={i} className={`w-5 h-5 ${i <= (state.gameStatus.stars[state.gameStatus.currentChallengeIndex] || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-300 font-mono text-sm font-bold bg-slate-800/50 px-4 py-1 rounded-full border border-slate-700/50 backdrop-blur-sm">
              <Clock className="w-4 h-4 text-indigo-400" />
              {formatTime(timeLeft)}
            </div>
            <button 
               onClick={() => setState(prev => ({ ...prev, appMode: 'practice' }))}
               className="text-[10px] font-bold text-slate-400 hover:text-white tracking-wide border border-slate-700 px-3 py-1 rounded-full transition-colors"
            >
               Quit game
            </button>
          </div>
        </div>

        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-indigo-600/20 backdrop-blur-md border border-indigo-500/30 p-3 rounded-2xl flex items-start gap-3 pointer-events-auto shadow-2xl shadow-indigo-500/10"
        >
          <div className="bg-indigo-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
             <div className="text-[10px] text-indigo-300 font-bold tracking-wide mb-0.5 flex items-center gap-2">
                Challenge {state.gameStatus.currentChallengeIndex + 1} of {challenges.length}
                <span className="w-1 h-1 bg-indigo-500 rounded-full" />
                {currentChallenge.title}
             </div>
             <p className="text-sm text-white font-bold tracking-tight line-clamp-2 leading-tight">
                {currentChallenge.description}
             </p>
          </div>
          <div className="flex items-center gap-2 relative">
             <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-[9px] text-slate-500 font-bold tracking-wide mb-1 text-right">Status</span>
                <span className={`text-[10px] font-bold tracking-tight ${state.gameStatus.isLevelComplete ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
                   {state.gameStatus.isLevelComplete ? 'Verified' : 'In progress'}
                </span>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
