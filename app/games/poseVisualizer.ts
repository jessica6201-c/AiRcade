import { BaseGame, GameContext, PoseData } from "@/app/types/game";
import { PoseLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";

export const poseVisualizerGame: BaseGame = {
  metadata: {
    id: "pose-visualizer",
    name: "2048",
    description: "Real-time Detection",
    splashArt: "/2048-stockimg.png"
  },

  onInit: (context: GameContext) => {
    console.log("Pose Visualizer initialized");
  },

  onFrame: (context: GameContext, poseData: PoseData | null) => {
    const { ctx, canvas } = context;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video background (optional - could draw from video element)
    // For now just a dark background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw landmarks if detected
    if (poseData && poseData.landmarks.length > 0) {
      const drawingUtils = new DrawingUtils(ctx);

      for (const landmark of poseData.landmarks) {
        // Mirror landmarks on x-axis
        const mirroredLandmarks = landmark.map(lm => ({
          ...lm,
          x: 1 - lm.x
        }));

        drawingUtils.drawLandmarks(mirroredLandmarks, {
          radius: 4,
          color: "#00FF00",
          fillColor: "#FF0000"
        });
        drawingUtils.drawConnectors(
          mirroredLandmarks,
          PoseLandmarker.POSE_CONNECTIONS,
          { color: "#00FF00", lineWidth: 2 }
        );
      }
    }
  },

  onCleanup: () => {
    console.log("Pose Visualizer cleanup");
  }
};
