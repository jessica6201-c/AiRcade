import { NormalizedLandmark } from "@mediapipe/tasks-vision";

export interface GameMetadata {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  splashArt?: string;
  useHandDetection?: boolean;
}

export interface PoseData {
  landmarks: NormalizedLandmark[][];
  worldLandmarks?: NormalizedLandmark[][];
  timestamp: number;
}

export interface HandData {
  landmarks: any[][];
  worldLandmarks?: any[][];
  timestamp: number;
}

export interface GameContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  videoWidth: number;
  videoHeight: number;
}

export interface BaseGame {
  metadata: GameMetadata;

  // Called once when game starts
  onInit?: (context: GameContext) => void;

  // Called every frame with pose/hand data
  onFrame: (context: GameContext, data: PoseData | HandData | null) => void;

  // Called when game ends
  onCleanup?: () => void;
}

export interface GameRegistry {
  [key: string]: BaseGame;
}
