import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';
import { SimulationState, PHYSICAL_CONSTANTS } from '../types';
import { usePhysics } from '../hooks/usePhysics';
import { GameHUD } from './GameHUD';
import { useGameLogic } from '../hooks/useGameLogic';
import { challenges } from '../gameData';
import { PartyPopper, CheckCircle2, ArrowRight, Trophy } from 'lucide-react';

interface SimulationProps {
  state: SimulationState;
  setState: React.Dispatch<React.SetStateAction<SimulationState>>;
}

export const SimCanvas: React.FC<SimulationProps> = ({ state, setState }) => {
  const { POLE_X, POLE_Y, CANVAS_WIDTH, CANVAS_HEIGHT } = PHYSICAL_CONSTANTS;
  const physics = usePhysics(state);
  const containerRef = useRef<SVGSVGElement>(null);
  const { nextChallenge } = useGameLogic(state, setState);

  const currentChallenge = challenges[state.gameStatus.currentChallengeIndex];

  // Coordinate Conversion helper
  const getSVGPoint = (clientX: number) => {
    if (!containerRef.current) return 0;
    const svg = containerRef.current;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = 0;
    const transformed = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return transformed.x;
  };

  // Handle Dragging with cross-platform support
  const [isDragging, setIsDragging] = useState(false);

  const startDrag = () => setIsDragging(true);
  const stopDrag = () => setIsDragging(false);

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      
      const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
      const svgX = getSVGPoint(clientX);
      const newDistance = POLE_X - svgX;
      
      // Constrain u based on textbook limits (small aperture/small distance)
      const constrainedDistance = Math.max(PHYSICAL_CONSTANTS.MIN_OBJECT_DISTANCE, Math.min(PHYSICAL_CONSTANTS.MAX_OBJECT_DISTANCE, newDistance));
      setState((prev) => ({ ...prev, objectDistance: constrainedDistance }));
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('touchmove', handleGlobalMove);
      window.addEventListener('touchend', stopDrag);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('touchend', stopDrag);
    };
  }, [isDragging]);

  // Ray Calculation
  const getRaysData = () => {
    const { objPos, imgPos, objectHeight, imageHeight, isInfinite, isVirtual, isInverted } = physics;
    const objTop = { x: objPos.x, y: objPos.y - objectHeight };
    const imgTop = { x: imgPos.x, y: POLE_Y + (isInverted ? imageHeight : -imageHeight) };

    const focalX = state.mode === 'mirror' ? (state.mirrorType === 'convex' ? POLE_X + state.focalLength : POLE_X - state.focalLength) : 0;
    const rays: any[] = [];
    let exactImgTop = { ...imgTop };
    let exactImgPos = { ...imgPos };
    let exactIsVirtual = isVirtual;
    let exactIsInfinite = isInfinite;

    if (state.mode === 'mirror') {
      const R = state.focalLength * 2;
      const xC = state.mirrorType === 'concave' ? POLE_X - R : POLE_X + R;

      if (state.mirrorType === 'plane') {
        const dyRel = POLE_Y - objTop.y;
        
        exactImgTop.x = POLE_X + (POLE_X - objTop.x);
        exactImgTop.y = objTop.y;
        exactImgPos = { x: exactImgTop.x, y: POLE_Y };
        exactIsVirtual = true;
        exactIsInfinite = false;

        // Ray 1: Parallel to axis
        const midPoint1 = { x: (objTop.x + POLE_X)/2, y: objTop.y };
        const reflectedMid1 = { x: POLE_X - 400, y: objTop.y };
        rays.push({
          type: 'ray1',
          color: '#3b82f6',
          points: [{ x: objTop.x, y: objTop.y }, midPoint1, { x: POLE_X, y: objTop.y }],
          reflected: [{ x: POLE_X, y: objTop.y }, reflectedMid1, { x: -800, y: objTop.y }],
          virtual: [{ x: POLE_X, y: objTop.y }, exactImgTop]
        });
        
        // Ray 2: Towards Pole
        const midPoint2 = { x: (objTop.x + POLE_X)/2, y: (objTop.y + POLE_Y)/2 };
        const m2_reflect = -dyRel / (POLE_X - objTop.x);
        const reflectedEnd2 = { x: POLE_X - 1000, y: POLE_Y + m2_reflect * (-1000 - POLE_X) };
        const reflectedMid2 = { x: (POLE_X + reflectedEnd2.x)/2, y: (POLE_Y + reflectedEnd2.y)/2 };
        rays.push({
          type: 'ray2',
          color: '#f59e0b',
          points: [{ x: objTop.x, y: objTop.y }, midPoint2, { x: POLE_X, y: POLE_Y }],
          reflected: [{ x: POLE_X, y: POLE_Y }, reflectedMid2, reflectedEnd2],
          virtual: [{ x: POLE_X, y: POLE_Y }, exactImgTop]
        });
      } else {
        // Curved Mirrors
        const getMid = (p1: any, p2: any) => ({ x: (p1.x + p2.x)/2, y: (p1.y + p2.y)/2 });
        const isConvex = state.mirrorType === 'convex';
        
        // Ray 1 (Parallel) Geometry
        const dy1 = objTop.y - POLE_Y;
        const dx1 = Math.sqrt(Math.max(0, R * R - dy1 * dy1));
        const hitX1 = isConvex ? xC - dx1 : xC + dx1;
        const hitY1 = objTop.y;
        
        // Ray 2 (Through C) Geometry
        // Prevent Division by Zero if object is exactly at C
        const denom2 = Math.abs(xC - objTop.x) < 0.0001 ? 0.0001 : (xC - objTop.x);
        const slope2 = (POLE_Y - objTop.y) / denom2;
        const dx2 = R / Math.sqrt(1 + slope2 * slope2);
        const hitX2 = isConvex ? xC - dx2 : xC + dx2;
        const hitY2 = slope2 * (hitX2 - xC) + POLE_Y;

        // Exact Intersection Algorithm (True Raytracing to avoid Paraxial disjoints)
        const denom1 = Math.abs(focalX - hitX1) < 0.0001 ? 0.0001 : (focalX - hitX1);
        const m1 = (POLE_Y - hitY1) / denom1;
        const m2 = slope2;
        
        if (Math.abs(m1 - m2) > 0.0001) {
            exactImgTop.x = (m1 * focalX - m2 * xC) / (m1 - m2);
            exactImgTop.y = m1 * (exactImgTop.x - focalX) + POLE_Y;
            exactIsInfinite = false;
        } else {
            exactIsInfinite = true;
            exactImgTop.x = isConvex ? 10000 : -10000;
            exactImgTop.y = POLE_Y;
        }
        
        exactImgPos = { x: exactImgTop.x, y: POLE_Y };
        exactIsVirtual = exactImgTop.x > POLE_X;

        // Calculate Ray 1 Paths
        const angleFromHitToF = Math.atan2(POLE_Y - hitY1, focalX - hitX1);
        const reflectionAngle1 = isConvex ? angleFromHitToF + Math.PI : angleFromHitToF;
        
        const reflectedDest1 = { 
          x: hitX1 + Math.cos(reflectionAngle1) * 2000, 
          y: hitY1 + Math.sin(reflectionAngle1) * 2000 
        };

        const reflectedPath1 = isConvex 
          ? [ { x: hitX1, y: hitY1 }, getMid({x: hitX1, y: hitY1}, reflectedDest1), reflectedDest1 ]
          : [ { x: hitX1, y: hitY1 }, getMid({x: hitX1, y: hitY1}, exactImgTop), exactImgTop, reflectedDest1 ];
          
        const virtualPath1 = exactIsVirtual ? [{ x: hitX1, y: hitY1 }, exactImgTop] : [];

        rays.push({
          type: 'ray1',
          color: '#3b82f6', // Vadadi (Blue)
          points: [{ x: objTop.x, y: objTop.y }, getMid(objTop, {x: hitX1, y: hitY1}), { x: hitX1, y: hitY1 }],
          reflected: reflectedPath1,
          virtual: virtualPath1,
          normal: [{x: xC, y: POLE_Y}, {x: hitX1, y: hitY1}]
        });

        // Calculate Ray 2 Paths
        const angleBack2 = Math.atan2(objTop.y - hitY2, objTop.x - hitX2);
        const reflectedDest2 = { 
            x: hitX2 + Math.cos(angleBack2) * 2000, 
            y: hitY2 + Math.sin(angleBack2) * 2000 
        };

        const reflectedPath2 = isConvex 
          ? [ { x: hitX2, y: hitY2 }, getMid({x: hitX2, y: hitY2}, reflectedDest2), reflectedDest2 ]
          : [ { x: hitX2, y: hitY2 }, getMid({x: hitX2, y: hitY2}, exactImgTop), exactImgTop, reflectedDest2 ];

        rays.push({
          type: 'ray2',
          color: '#f59e0b', // Amber/Yellow
          points: [{ x: objTop.x, y: objTop.y }, getMid(objTop, {x: hitX2, y: hitY2}), { x: hitX2, y: hitY2 }],
          reflected: reflectedPath2,
          virtual: exactIsVirtual ? [{x: hitX2, y: hitY2}, exactImgTop] : [],
          normal: [{x: xC, y: POLE_Y}, {x: hitX2, y: hitY2}]
        });
      }
    } else {
      // Lens Rays - Simplified for clarity
      const getMid = (p1: any, p2: any) => ({ x: (p1.x + p2.x)/2, y: (p1.y + p2.y)/2 });
      const hitX = POLE_X;
      const hitY = objTop.y;
      
      // Ray 1: Parallel
      const reflectedDest1 = { x: imgTop.x + (imgTop.x - hitX)*2, y: imgTop.y + (imgTop.y - hitY)*2 };
      rays.push({
        type: 'ray1',
        color: '#3b82f6',
        points: [{ x: objTop.x, y: objTop.y }, getMid(objTop, {x: hitX, y: hitY}), { x: hitX, y: hitY }],
        reflected: [{ x: hitX, y: hitY }, getMid({x: hitX, y: hitY}, imgTop), reflectedDest1],
        virtual: isVirtual ? [{x: hitX, y: hitY}, {x: imgTop.x, y: imgTop.y}] : []
      });

      // Ray 2: Through Center O
      const reflectedDest2 = { x: imgTop.x + (imgTop.x - POLE_X)*2, y: imgTop.y + (imgTop.y - POLE_Y)*2 };
      rays.push({
        type: 'ray2',
        color: '#f59e0b',
        points: [{ x: objTop.x, y: objTop.y }, getMid(objTop, {x: POLE_X, y: POLE_Y}), { x: POLE_X, y: POLE_Y }],
        reflected: [{ x: POLE_X, y: POLE_Y }, getMid({x: POLE_X, y: POLE_Y}, imgTop), reflectedDest2],
        virtual: isVirtual ? [{x: POLE_X, y: POLE_Y}, {x: imgTop.x, y: imgTop.y}] : []
      });
    }

    return { rays, exactImgTop, exactImgPos, exactIsVirtual, exactIsInfinite };
  };

  const { rays, exactImgTop, exactImgPos, exactIsVirtual, exactIsInfinite } = getRaysData();

  // Mirror/Lens Path
  const getComponentPath = () => {
    const r = state.focalLength * 2;
    const span = 150;
    const sagitta = Math.abs(r - Math.sqrt(r * r - span * span));

    if (state.mode === 'mirror') {
      if (state.mirrorType === 'plane') {
        return `M ${POLE_X} ${POLE_Y - span} L ${POLE_X} ${POLE_Y + span}`;
      }
      if (state.mirrorType === 'concave') {
        return `M ${POLE_X - sagitta} ${POLE_Y - span} A ${r} ${r} 0 0 1 ${POLE_X - sagitta} ${POLE_Y + span}`;
      } else {
        return `M ${POLE_X + sagitta} ${POLE_Y - span} A ${r} ${r} 0 0 0 ${POLE_X + sagitta} ${POLE_Y + span}`;
      }
    } else {
      // Lens
      if (state.lensType === 'convex') {
        return `M ${POLE_X} ${POLE_Y - span} 
                A ${r} ${r} 0 0 1 ${POLE_X} ${POLE_Y + span}
                A ${r} ${r} 0 0 1 ${POLE_X} ${POLE_Y - span}`;
      } else {
        return `M ${POLE_X - 10} ${POLE_Y - span} 
                L ${POLE_X + 10} ${POLE_Y - span}
                A ${r} ${r} 0 0 0 ${POLE_X + 10} ${POLE_Y + span}
                L ${POLE_X - 10} ${POLE_Y + span}
                A ${r} ${r} 0 0 0 ${POLE_X - 10} ${POLE_Y - span}`;
      }
    }
  };

  const renderPoints = () => {
    if (state.mode === 'mirror' && state.mirrorType === 'plane') return null;
    
    // For Mirror: P, F, C on one side
    // For Lens: O, F1, 2F1, F2, 2F2 on both sides (PDF page 150)
    const focalX = state.mode === 'mirror' ? 
                   (state.mirrorType === 'concave' ? POLE_X - state.focalLength : POLE_X + state.focalLength) : 
                   state.focalLength;
    
    return (
      <g className="text-[12px] fill-slate-400 font-medium italic">
           <circle cx={POLE_X} cy={POLE_Y} r="3" fill="#94a3b8" />
           <text x={POLE_X} y={POLE_Y + 18} textAnchor="middle">P</text>
           
           {state.mode === 'mirror' ? (
             state.mirrorType !== 'plane' && (
              <>
                <circle cx={POLE_X - state.focalLength * (state.mirrorType === 'concave' ? 1 : -1)} cy={POLE_Y} r="3" fill="#fbbf24" />
                <text x={POLE_X - state.focalLength * (state.mirrorType === 'concave' ? 1 : -1)} y={POLE_Y + 18} textAnchor="middle" fill="#fbbf24">F</text>
                <circle cx={POLE_X - 2 * state.focalLength * (state.mirrorType === 'concave' ? 1 : -1)} cy={POLE_Y} r="3" fill="#ef4444" />
                <text x={POLE_X - 2 * state.focalLength * (state.mirrorType === 'concave' ? 1 : -1)} y={POLE_Y + 18} textAnchor="middle" fill="#ef4444">C</text>
              </>
             )
            ) : (
              <>
                <circle cx={POLE_X - state.focalLength} cy={POLE_Y} r="3" fill="#fbbf24" />
                <text x={POLE_X - state.focalLength} y={POLE_Y + 18} textAnchor="middle" fill="#fbbf24">F1</text>
                <circle cx={POLE_X - 2 * state.focalLength} cy={POLE_Y} r="3" fill="#ef4444" />
                <text x={POLE_X - 2 * state.focalLength} y={POLE_Y + 18} textAnchor="middle" fill="#ef4444">2F1</text>
                
                <circle cx={POLE_X + state.focalLength} cy={POLE_Y} r="3" fill="#fbbf24" />
                <text x={POLE_X + state.focalLength} y={POLE_Y + 18} textAnchor="middle" fill="#fbbf24">F2</text>
                <circle cx={POLE_X + 2 * state.focalLength} cy={POLE_Y} r="3" fill="#ef4444" />
                <text x={POLE_X + 2 * state.focalLength} y={POLE_Y + 18} textAnchor="middle" fill="#ef4444">2F2</text>
              </>
            )}
      </g>
    );
  };

  const renderGraphic = (type: string, height: number, color: string, isImage: boolean = false) => {
    switch (type) {
      case 'candle':
        return (
          <g>
            <rect x="-10" y={height > 0 ? 0 : height} width="20" height={Math.abs(height)} fill={color} opacity={isImage ? 0.6 : 0.9} rx="2" />
            <path d={`M-4 ${height > 0 ? height : 0} L4 ${height > 0 ? height : 0} L0 ${height > 0 ? height + 10 : -10} Z`} fill="#f59e0b" />
            {!isImage && <circle cx="0" cy={height > 0 ? height + 10 : -10} r="6" fill="#fbbf24" filter="url(#glow)" />}
          </g>
        );
      case 'person':
        return (
          <g transform={`scale(${Math.abs(height)/80})`}>
            <circle cx="0" cy={height > 0 ? 90 : -90} r="10" fill={color} />
            <line x1="0" y1={height > 0 ? 80 : -80} x2="0" y2={height > 0 ? 30 : -30} stroke={color} strokeWidth="4" />
            <line x1="0" y1={height > 0 ? 60 : -60} x2="-15" y2={height > 0 ? 40 : -40} stroke={color} strokeWidth="4" />
            <line x1="0" y1={height > 0 ? 60 : -60} x2="15" y2={height > 0 ? 40 : -40} stroke={color} strokeWidth="4" />
            <line x1="0" y1={height > 0 ? 30 : -30} x2="-10" y2="0" stroke={color} strokeWidth="4" />
            <line x1="0" y1={height > 0 ? 30 : -30} x2="10" y2="0" stroke={color} strokeWidth="4" />
          </g>
        );
      default: // Arrow
        return (
          <>
            <line x1="0" y1="0" x2="0" y2={height} stroke={color} strokeWidth="4" strokeLinecap="round" />
            <path d={`M-8 ${height + (height > 0 ? -8 : 8)} L0 ${height} L8 ${height + (height > 0 ? -8 : 8)}`} fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" />
          </>
        );
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 lab-grid overflow-hidden relative cursor-crosshair select-none">
      {/* Legend / Key */}
      <div className={`absolute right-4 z-40 bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700/50 p-3 shadow-lg max-w-[200px] pointer-events-none transition-all duration-500 ${state.appMode === 'game' ? 'top-36' : 'top-4'}`}>
        <h3 className="text-white text-xs font-black tracking-widest mb-2 opacity-70 border-b border-slate-700 pb-1">Legend</h3>
        <ul className="space-y-1.5 text-[11px]">
          {state.mode === 'mirror' ? (
            <>
              <li className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-400">P</span>
                <span className="text-slate-300">= Pole (Center of Mirror)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-400">F</span>
                <span className="text-slate-300">= Principal Focus</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-mono font-bold text-rose-400">C</span>
                <span className="text-slate-300">= Center of Curvature</span>
              </li>
            </>
          ) : (
            <>
              <li className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-400">O</span>
                <span className="text-slate-300">= Optical Center</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-400">F</span>
                <span className="text-slate-300">= Principal Focus</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-mono font-bold text-rose-400">2F</span>
                <span className="text-slate-300">= Center of Curvature</span>
              </li>
            </>
          )}
        </ul>
      </div>

      <GameHUD state={state} setState={setState} />

      <AnimatePresence>
        {state.gameStatus.isLevelComplete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ y: 50, scale: 0.9, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              className="bg-white p-8 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-w-sm w-full text-center border-t-[12px] border-indigo-600 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <PartyPopper className="w-24 h-24" />
              </div>

              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500 shadow-inner relative z-10">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              
              <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter">Level complete!</h2>
              <p className="text-slate-500 font-bold mb-10 leading-relaxed px-4 text-sm">
                {currentChallenge.successMessage}
              </p>
              
              <button 
                onClick={nextChallenge}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 group translate-y-2"
              >
                Next Challenge <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        )}

        {state.gameStatus.isGameFinished && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl transition-all"
          >
            <motion.div 
              initial={{ y: 100, scale: 0.8, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              className="bg-white p-10 rounded-[48px] max-w-md w-full text-center border-b-[16px] border-emerald-500 relative shadow-[0_0_100px_rgba(16,185,129,0.2)]"
            >
              <div className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600 shadow-lg ring-8 ring-emerald-50">
                <Trophy className="w-14 h-14" />
              </div>
              
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Optics Master!</h2>
              <p className="text-slate-500 font-bold mb-10 leading-relaxed text-lg">
                You've mastered all the challenges in Light Lab. Your understanding of ray optics is exceptional!
              </p>
              
              <button 
                onClick={() => setState(prev => ({ ...prev, appMode: 'practice', gameStatus: { ...prev.gameStatus, isGameFinished: false } }))}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-6 rounded-[28px] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                Finish Lab session
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <svg 
        ref={containerRef}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} 
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="mirrorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <radialGradient id="simGlow">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
           <filter id="imgGlow">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
          
          {/* Ray Arrows */}
          <marker id="arrowhead-ray1" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polyline points="0 0, 8 3, 0 6" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
          </marker>
          <marker id="arrowhead-ray2" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polyline points="0 0, 8 3, 0 6" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
          </marker>
        </defs>

        {/* Background Glow */}
        <circle cx={POLE_X} cy={POLE_Y} r="300" fill="url(#simGlow)" pointerEvents="none" />

        {/* Principal Axis */}
        <line x1="0" y1={POLE_Y} x2={CANVAS_WIDTH} y2={POLE_Y} stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />

        {/* Points markings */}
        {renderPoints()}

        {/* Rays with Flow Animation */}
        {state.showRays && rays.map((ray, i) => (
          <g key={i}>
            {/* Normals (Passive) */}
            {ray.normal && (
              <line 
                x1={ray.normal[0].x} y1={ray.normal[0].y} 
                x2={ray.normal[1].x} y2={ray.normal[1].y} 
                stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" 
              />
            )}
            
            {/* Incident Ray (Moving towards mirror) */}
            <polyline 
              points={ray.points.map((p: any) => `${p.x},${p.y}`).join(' ')} 
              stroke={ray.color || "#fde047"} strokeWidth="2.2" fill="none" 
              markerMid={`url(#arrowhead-${ray.type || 'ray1'})`}
            />
            
            {/* Hit Pulse at Mirror */}
            <motion.circle 
              cx={ray.points[ray.points.length-1].x} 
              cy={ray.points[ray.points.length-1].y} 
              r="3" 
              fill={ray.color || "#fde047"}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            
            {/* Reflected/Refracted Ray (Moving away from mirror) */}
            <polyline 
              points={ray.reflected.map((p: any) => `${p.x},${p.y}`).join(' ')} 
              stroke={ray.color || "#fbbf24"} strokeWidth="2.2" fill="none" 
              markerMid={`url(#arrowhead-${ray.type || 'ray1'})`}
            />
            
            {/* Virtual Extensions (Static/Backwards) */}
            {ray.virtual && ray.virtual.length > 0 && (
              <polyline 
                points={ray.virtual.map((p: any) => `${p.x},${p.y}`).join(' ')} 
                stroke="#e2e8f0" strokeWidth="1" fill="none" 
                strokeDasharray="4 4" opacity="0.4" 
              />
            )}
          </g>
        ))}

        {/* Mirror/Lens */}
        <g>
          {state.mode === 'mirror' && state.mirrorType === 'plane' ? (
            <g>
              <line x1={POLE_X} y1={POLE_Y - 150} x2={POLE_X} y2={POLE_Y + 150} stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" filter="url(#glow)" strokeOpacity="0.9"/>
              {/* Hatched back surface for Plane Mirror standard notation */}
              {Array.from({ length: 15 }).map((_, i) => (
                 <line key={`hatch-${i}`} x1={POLE_X + 3} y1={POLE_Y - 140 + i * 20} x2={POLE_X + 15} y2={POLE_Y - 130 + i * 20} stroke="#64748b" strokeWidth="2" strokeOpacity="0.8" />
              ))}
            </g>
          ) : (
            <path d={getComponentPath()} fill="none" stroke="url(#mirrorGrad)" strokeWidth="8" strokeLinecap="round" opacity="0.9" filter="url(#glow)" />
          )}
        </g>

        {/* Image */}
        {!exactIsInfinite && (
          <g
            transform={`translate(${exactImgPos.x}, ${exactImgPos.y})`}
            style={{ opacity: exactIsInfinite ? 0 : 0.7 }}
          >
             <g filter="url(#imgGlow)" transform={state.mirrorType === 'plane' ? 'scale(-1, 1)' : ''}>
                {renderGraphic(state.objectType, exactImgTop.y - POLE_Y, exactIsVirtual ? "#818cf8" : "#f43f5e", true)}
             </g>
             <text y={exactImgTop.y - POLE_Y + (exactImgTop.y > POLE_Y ? 15 : -10)} textAnchor="middle" fill="#94a3b8" className="text-[10px] font-bold">Image</text>
          </g>
        )}

        {/* Object (Draggable Handle) */}
        <g
          onPointerDown={startDrag}
          transform={`translate(${physics.objPos.x}, ${physics.objPos.y})`}
          className="cursor-ew-resize group"
        >
          {/* Large Invisible Hit Area */}
          <rect x="-30" y="-120" width="60" height="200" fill="transparent" />
          
          {/* Visible Object */}
          <g className="group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all">
             {renderGraphic(state.objectType, -physics.objectHeight, "#fbbf24")}
          </g>

          <text y="-95" textAnchor="middle" fill="#fbbf24" className="text-[10px] font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Drag to move
          </text>
        </g>

        {/* Zone Markers / Highlights */}
        {state.mirrorType === 'concave' && (
          <g opacity="0.1" pointerEvents="none">
             <rect x="0" y={POLE_Y - 150} width={POLE_X - 2*state.focalLength} height="300" fill={physics.zone === "Beyond C" ? "#22c55e" : "transparent"} />
             <rect x={POLE_X - 2*state.focalLength} y={POLE_Y - 150} width={state.focalLength} height="300" fill={physics.zone === "Between C and F" ? "#22c55e" : "transparent"} />
             <rect x={POLE_X - state.focalLength} y={POLE_Y - 150} width={state.focalLength} height="300" fill={physics.zone === "Between F and P" ? "#22c55e" : "transparent"} />
          </g>
        )}
      </svg>
      
      {/* Floating Zone Indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-800/80 backdrop-blur-md rounded-full border border-slate-700 pointer-events-none transition-all duration-300">
         <span className="text-slate-300 text-xs font-mono tracking-widest">Region: </span>
         <span className="text-white font-bold">{physics.zone}</span>
      </div>
    </div>
  );
};
