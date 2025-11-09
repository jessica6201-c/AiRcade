import { GameRegistry } from "@/app/types/game";
import { poseVisualizerGame } from "./poseVisualizer";
import { fruitNinjaGame } from "./fruitNinja";
import { pinchCirclesGame } from "./pinchCirclesHand";

export const GAMES: GameRegistry = {
  "pose-visualizer": poseVisualizerGame,
  "fruit-ninja": fruitNinjaGame,
  "pinch-circles": pinchCirclesGame
};

// Helper to get game by ID
export function getGame(id: string) {
  return GAMES[id];
}

// Get all games as array
export function getAllGames() {
  return Object.values(GAMES);
}
