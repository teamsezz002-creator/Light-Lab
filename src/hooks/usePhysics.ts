import { useMemo } from 'react';
import { MirrorType, SimulationState, PHYSICAL_CONSTANTS } from '../types';

export function usePhysics(state: SimulationState) {
  const { mode, mirrorType, lensType, objectDistance, focalLength } = state;
  const { POLE_X, POLE_Y } = PHYSICAL_CONSTANTS;

  const result = useMemo(() => {
    // Standard sign convention: Object is at -u (always left)
    const u = -objectDistance; 
    let f = 0;
    
    if (mode === 'mirror') {
      if (mirrorType === 'concave') f = -focalLength;
      else if (mirrorType === 'convex') f = focalLength;
      else f = Infinity;
    } else {
      // Convex lens: Converging (Positive f), Concave: Diverging (Negative f)
      // As per PDF page 155
      if (lensType === 'convex') f = focalLength;
      else f = -focalLength;
    }

    let v: number;
    let m: number;
    let isVirtual = false;
    let isInfinite = false;

    if (mode === 'mirror' && mirrorType === 'plane') {
      v = objectDistance; 
      m = 1;
      isVirtual = true;
    } else {
      const u_val = u;
      const f_val = f;

      if (mode === 'mirror') {
        // Mirror Formula: 1/v + 1/u = 1/f
        if (Math.abs(u_val - f_val) < 2) {
          isInfinite = true; v = -9999; m = 10;
        } else {
          v = (u_val * f_val) / (u_val - f_val);
          m = -v / u_val;
          isVirtual = v > 0;
        }
      } else {
        // Lens Formula: 1/v - 1/u = 1/f -> 1/v = 1/f + 1/u
        // Page 155 Section 9.3.7
        if (Math.abs(u_val + f_val) < 2) {
          isInfinite = true; v = 9999; m = 10;
        } else {
          v = (u_val * f_val) / (u_val + f_val);
          m = v / u_val;
          isVirtual = v < 0; // Virtual images in lenses are on the same side as object
        }
      }
    }

    const objectHeight = 60;
    const imageHeightRaw = objectHeight * Math.abs(m);
    const imageHeight = Math.min(imageHeightRaw, 400);
    
    const objPos = { x: POLE_X - objectDistance, y: POLE_Y };
    const imgPos = { x: POLE_X + v, y: POLE_Y };

    // Zone Detection
    let zone = "";
    if (mode === 'mirror' && mirrorType === 'concave') {
      if (objectDistance > 2*focalLength) zone = "Beyond C";
      else if (Math.abs(objectDistance - 2*focalLength) < 5) zone = "At C";
      else if (objectDistance > focalLength) zone = "Between C and F";
      else if (Math.abs(objectDistance - focalLength) < 5) zone = "At F";
      else zone = "Between F and P";
    } else if (mode === 'lens' && lensType === 'convex') {
      if (objectDistance > 2*focalLength) zone = "Beyond 2F1";
      else if (Math.abs(objectDistance - 2*focalLength) < 5) zone = "At 2F1";
      else if (objectDistance > focalLength) zone = "Between F1 and 2F1";
      else if (Math.abs(objectDistance - focalLength) < 5) zone = "At F1";
      else zone = "Between F1 and O";
    } else {
      zone = "In front";
    }

    return {
      u, v, f, m,
      isVirtual,
      isInfinite,
      objectHeight,
      imageHeight,
      objPos,
      imgPos,
      zone,
      isInverted: m < 0
    };
  }, [mode, mirrorType, lensType, objectDistance, focalLength, POLE_X, POLE_Y]);

  return result;
}
