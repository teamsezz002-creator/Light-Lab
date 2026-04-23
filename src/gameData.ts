import { Challenge } from './types';

export const challenges: Challenge[] = [
  // LEVEL 1: EASY (Basics of Concave)
  {
    id: 'l1-1',
    level: 1,
    title: 'Beyond Curvature',
    description: 'Concave Mirror: Place the object Beyond C to form a real, inverted and diminished image.',
    setup: { mode: 'mirror', mirrorType: 'concave', objectDistance: 150, focalLength: 100 },
    targetCriteria: (physics, state) => state.mode === 'mirror' && state.mirrorType === 'concave' && physics.zone === 'Beyond C' && !physics.isVirtual && !physics.isInfinite,
    hint: 'Move the object further away from the mirror, past twice the focal length (C).',
    successMessage: 'Great job! At this position, rays converge to form a smaller inverted image.'
  },
  {
    id: 'l1-2',
    level: 1,
    title: 'The Mirror Image',
    description: 'Plane Mirror: Place the object at exactly 200cm distance.',
    setup: { mode: 'mirror', mirrorType: 'plane', objectDistance: 50 },
    targetCriteria: (physics, state) => state.mode === 'mirror' && state.mirrorType === 'plane' && Math.abs(state.objectDistance - 200) < 5,
    hint: 'Use the slider or drag the object to exactly 200cm.',
    successMessage: 'Perfect! In a plane mirror, object distance = image distance $(u=v)$.'
  },
  // LEVEL 2: MEDIUM (Converging properties)
  {
    id: 'l2-1',
    level: 2,
    title: 'At Center C',
    description: 'Concave Mirror: Find the exact position where the image size is exactly the same as the object size.',
    setup: { mode: 'mirror', mirrorType: 'concave', objectDistance: 350, focalLength: 100 },
    targetCriteria: (physics, state) => state.mode === 'mirror' && state.mirrorType === 'concave' && Math.abs(state.objectDistance - state.focalLength * 2) < 5,
    hint: 'This happens precisely at the Center of Curvature (C).',
    successMessage: 'Correct! At C, the magnification $(m)$ is exactly -1.'
  },
  {
    id: 'l2-2',
    level: 2,
    title: 'The Burning Point',
    description: 'Concave Mirror: Place the object at the Focus (F) to make reflected rays parallel.',
    setup: { mode: 'mirror', mirrorType: 'concave', objectDistance: 250, focalLength: 100 },
    targetCriteria: (physics, state) => state.mode === 'mirror' && state.mirrorType === 'concave' && physics.isInfinite,
    hint: 'Place the object exactly at the focal point.',
    successMessage: 'Spot on! At F, the image forms at infinity and light rays are parallel.'
  },
  // LEVEL 3: HARD (Virtual Images)
  {
    id: 'l3-1',
    level: 3,
    title: 'Makeup mirror',
    description: 'Concave mirror: Create a virtual, erect, and enlarged image. Perfect for seeing detail!',
    setup: { mode: 'mirror', mirrorType: 'concave', objectDistance: 200, focalLength: 100 },
    targetCriteria: (physics, state) => state.mode === 'mirror' && state.mirrorType === 'concave' && physics.isVirtual && Math.abs(physics.m) > 1,
    hint: 'Move the object between the focus (F) and the pole (P).',
    successMessage: 'Brilliant! Real-life makeup mirrors use exactly this configuration.'
  },
  {
    id: 'l3-2',
    level: 3,
    title: 'Safety first',
    description: 'Convex mirror: Place the object so it gives a magnification of 0.25 (1/4th size).',
    setup: { mode: 'mirror', mirrorType: 'convex', objectDistance: 50, focalLength: 100 },
    targetCriteria: (physics, state) => state.mode === 'mirror' && state.mirrorType === 'convex' && Math.abs(Math.abs(physics.m) - 0.25) < 0.05,
    hint: 'Experiment with moving the object further away.',
    successMessage: 'Well done! Convex mirrors have a wide field of view, good for blind spots.'
  },
  {
    id: 'l3-3',
    level: 3,
    title: 'The symmetry',
    description: 'Plane mirror: Match object distance to exactly 400.0cm.',
    setup: { mode: 'mirror', mirrorType: 'plane', objectDistance: 100 },
    targetCriteria: (physics, state) => state.mode === 'mirror' && state.mirrorType === 'plane' && Math.abs(state.objectDistance - 400) < 1,
    hint: 'Use the slider for fine-tuning the distance.',
    successMessage: 'Spot on! In a plane mirror, you and your reflection are equally distant.'
  },
  // LEVEL 4: EXPERT (Refraction)
  {
    id: 'l4-1',
    level: 4,
    title: 'The projector',
    description: 'Convex lens: Place object between F1 and 2F1 to create an enlarged, real image.',
    setup: { mode: 'lens', lensType: 'convex', objectDistance: 350, focalLength: 100 },
    targetCriteria: (physics, state) => state.mode === 'lens' && state.lensType === 'convex' && !physics.isVirtual && physics.zone === 'Between F1 and 2F1',
    hint: 'Look for the real image growing large on the right side.',
    successMessage: 'Excellent! This setup is used in projectors to cast a large image on a screen.'
  },
  {
    id: 'l4-2',
    level: 4,
    title: 'Reading glass',
    description: 'Convex lens: Form a virtual image that is at least 3x magnified.',
    setup: { mode: 'lens', lensType: 'convex', objectDistance: 300, focalLength: 100 },
    targetCriteria: (physics, state) => state.mode === 'lens' && state.lensType === 'convex' && physics.isVirtual && Math.abs(physics.m) >= 3,
    hint: 'Get very close to the lens (between F1 and O).',
    successMessage: 'Masterful! You have just simulated a powerful magnifying glass.'
  },
  {
    id: 'l4-3',
    level: 4,
    title: 'The Diverger',
    description: 'Concave lens: Observe how image is always diminished. Place u at 150cm.',
    setup: { mode: 'lens', lensType: 'concave', objectDistance: 50, focalLength: 100 },
    targetCriteria: (physics, state) => state.mode === 'lens' && state.lensType === 'concave' && Math.abs(state.objectDistance - 150) < 5,
    hint: 'Move the object to 150cm using the slider or drag.',
    successMessage: 'Correct! Concave lenses always produce virtual, erect, and diminished images.'
  }
];
