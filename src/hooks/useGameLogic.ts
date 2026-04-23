import React, { useEffect } from 'react';
import { SimulationState, GameStatus } from '../types';
import { challenges } from '../gameData';
import { usePhysics } from './usePhysics';

export const useGameLogic = (
  state: SimulationState, 
  setState: React.Dispatch<React.SetStateAction<SimulationState>>
) => {
  const physics = usePhysics(state);
  const currentChallengeIndex = state.gameStatus.currentChallengeIndex;
  const currentChallenge = challenges[currentChallengeIndex];

  useEffect(() => {
    if (state.appMode === 'game' && !state.gameStatus.isLevelComplete) {
      const isMet = currentChallenge.targetCriteria(physics, state);
      
      if (isMet) {
        // Small timeout to ensure the user sees the final state
        const timer = setTimeout(() => {
          // Double check criteria is still met
          if (currentChallenge.targetCriteria(physics, state)) {
            let starCount = 3;
            // Future: add time-based scoring
            
            const newStars = [...state.gameStatus.stars];
            newStars[currentChallengeIndex] = Math.max(newStars[currentChallengeIndex] || 0, starCount);

            setState(prev => ({
              ...prev,
              gameStatus: {
                ...prev.gameStatus,
                stars: newStars,
                isLevelComplete: true
              }
            }));
          }
        }, 800); // 800ms "lock-in" time

        return () => clearTimeout(timer);
      }
    }
  }, [physics, state.appMode, currentChallengeIndex]);

  const nextChallenge = () => {
    if (currentChallengeIndex < challenges.length - 1) {
      const nextIdx = currentChallengeIndex + 1;
      const nextChal = challenges[nextIdx];
      
      setState(prev => ({
        ...prev,
        ...(nextChal.setup || {}),
        gameStatus: {
          ...prev.gameStatus,
          currentChallengeIndex: nextIdx,
          isLevelComplete: false,
          currentLevel: nextChal.level
        }
      }));
    } else {
       // All levels complete!
       setState(prev => ({ 
         ...prev, 
         gameStatus: { ...prev.gameStatus, isLevelComplete: false, isGameFinished: true } 
       }));
    }
  };

  useEffect(() => {
    // Initial setup when entering game mode for the first time or index change
    if (state.appMode === 'game' && !state.gameStatus.isLevelComplete) {
       // Optional: apply setup if it's the very start of a level and we're not winning
       // To avoid looping, we check if we just arrived.
       // But it's better handled in the button click that triggers appMode: 'game'
    }
  }, [state.appMode, currentChallengeIndex]);

  return { nextChallenge };
};
