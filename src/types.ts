export type OpticalComponent = 'mirror' | 'lens';
export type MirrorType = 'concave' | 'convex' | 'plane';
export type LensType = 'convex' | 'concave';
export type ObjectType = 'arrow' | 'candle' | 'person';

export interface Point {
  x: number;
  y: number;
}

export interface Challenge {
  id: string;
  level: number;
  title: string;
  description: string;
  targetCriteria: (physics: any, state: SimulationState) => boolean;
  hint: string;
  successMessage: string;
  setup?: Partial<SimulationState>;
}

export interface GameStatus {
  currentLevel: number;
  currentChallengeIndex: number;
  stars: number[];
  isLevelComplete: boolean;
  isGameFinished: boolean; // Added
  startTime: number | null;
  attempts: number;
}

export interface SimulationState {
  mode: OpticalComponent;
  mirrorType: MirrorType;
  lensType: LensType;
  objectType: ObjectType;
  objectDistance: number;
  showRays: boolean;
  focalLength: number;
  appMode: 'practice' | 'game';
  gameStatus: GameStatus;
}

export const PHYSICAL_CONSTANTS = {
  CANVAS_WIDTH: 1200,
  CANVAS_HEIGHT: 600,
  POLE_X: 550, 
  POLE_Y: 300,
  DEFAULT_FOCAL_LENGTH: 100,
  MIN_OBJECT_DISTANCE: 10,
  MAX_OBJECT_DISTANCE: 530, // Prevent object from going off left edge (550 - 530 = 20)
};
