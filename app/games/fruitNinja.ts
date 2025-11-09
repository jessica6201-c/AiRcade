import { BaseGame, GameContext, PoseData } from "@/app/types/game";

// Example game state (not implemented yet)
interface Fruit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: "apple" | "orange" | "watermelon";
  sliced: boolean;
}

let fruits: Fruit[] = [];
let score = 0;

export const fruitNinjaGame: BaseGame = {
  metadata: {
    id: "fruit-ninja",
    name: "Fruit Ninja",
    description: "Hand Slicing",
    splashArt: "/fruit-ninja-2020-08-31.jpg"
  },

  onInit: (context: GameContext) => {
    // Initialize game state
    fruits = [];
    score = 0;
    console.log("Fruit Ninja initialized");

    // TODO: Set up fruit spawning interval
    // TODO: Load fruit sprites/images
    // TODO: Set up particle systems for slicing effects
  },

  onFrame: (context: GameContext, poseData: PoseData | null) => {
    const { ctx, canvas } = context;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = "#87CEEB"; // Sky blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // TODO: Update fruit positions (physics)
    // TODO: Detect hand positions from poseData
    // TODO: Check collisions between hands and fruits
    // TODO: Draw fruits
    // TODO: Draw slicing effects
    // TODO: Update and draw score

    // Example: Draw placeholder text
    ctx.fillStyle = "#000000";
    ctx.font = "48px sans-serif";
    ctx.fillText("Fruit Ninja (Not Implemented)", canvas.width / 2 - 300, canvas.height / 2);
    ctx.font = "24px sans-serif";
    ctx.fillText("Score: " + score, 20, 40);

    // Example: Track hand positions if available
    if (poseData && poseData.landmarks.length > 0) {
      const firstPose = poseData.landmarks[0];

      // Right wrist (index 16)
      const rightWrist = firstPose[16];
      if (rightWrist) {
        const x = (1 - rightWrist.x) * canvas.width;
        const y = rightWrist.y * canvas.height;

        // Draw hand indicator
        ctx.fillStyle = "#FF0000";
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      // Left wrist (index 15)
      const leftWrist = firstPose[15];
      if (leftWrist) {
        const x = (1 - leftWrist.x) * canvas.width;
        const y = leftWrist.y * canvas.height;

        // Draw hand indicator
        ctx.fillStyle = "#0000FF";
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },

  onCleanup: () => {
    // Clean up intervals, reset state
    fruits = [];
    score = 0;
    console.log("Fruit Ninja cleanup");
  }
};
