import { BaseGame, GameContext, PoseData } from "@/app/types/game";

interface Circle {
  x: number;
  y: number;
  radius: number;
  collected: boolean;
}

interface GameState {
  circles: Circle[];
  score: number;
  spawnInterval: number | null;
  lastSpawnTime: number;
}

const state: GameState = {
  circles: [],
  score: 0,
  spawnInterval: null,
  lastSpawnTime: 0
};

function spawnCircle(canvas: HTMLCanvasElement) {
  const padding = 100;
  const circle: Circle = {
    x: padding + Math.random() * (canvas.width - padding * 2),
    y: padding + Math.random() * (canvas.height - padding * 2),
    radius: 40,
    collected: false
  };
  state.circles.push(circle);
}

export const pinchCirclesGame: BaseGame = {
  metadata: {
    id: "circle-collect",
    name: "Circle Collect",
    description: "Move your hands over circles to collect them!",
    useHandDetection: false
  },

  onInit: (context: GameContext) => {
    state.circles = [];
    state.score = 0;
    state.lastSpawnTime = performance.now();

    for (let i = 0; i < 3; i++) {
      spawnCircle(context.canvas);
    }
  },

  onFrame: (context: GameContext, poseData: PoseData | null) => {
    const { ctx, canvas } = context;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const currentTime = performance.now();
    if (currentTime - state.lastSpawnTime > 2000 && state.circles.length < 5) {
      spawnCircle(canvas);
      state.lastSpawnTime = currentTime;
    }

    state.circles.forEach((circle) => {
      if (!circle.collected) {
        ctx.fillStyle = "#00ff88";
        ctx.strokeStyle = "#00cc66";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff44";
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    state.circles = state.circles.filter(c => !c.collected);

    if (poseData && poseData.landmarks.length > 0) {
      const firstPose = poseData.landmarks[0];
      const colors = ["#ff0088", "#0088ff"];

      // Right wrist (index 16)
      const rightWrist = firstPose[16];
      if (rightWrist) {
        const x = (1 - rightWrist.x) * canvas.width;
        const y = rightWrist.y * canvas.height;

        ctx.fillStyle = colors[0];
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();

        state.circles.forEach(circle => {
          if (!circle.collected) {
            const dist = Math.sqrt(
              Math.pow(x - circle.x, 2) + Math.pow(y - circle.y, 2)
            );
            if (dist < circle.radius + 20) {
              circle.collected = true;
              state.score++;
            }
          }
        });
      }

      // Left wrist (index 15)
      const leftWrist = firstPose[15];
      if (leftWrist) {
        const x = (1 - leftWrist.x) * canvas.width;
        const y = leftWrist.y * canvas.height;

        ctx.fillStyle = colors[1];
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();

        state.circles.forEach(circle => {
          if (!circle.collected) {
            const dist = Math.sqrt(
              Math.pow(x - circle.x, 2) + Math.pow(y - circle.y, 2)
            );
            if (dist < circle.radius + 20) {
              circle.collected = true;
              state.score++;
            }
          }
        });
      }
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText(`Score: ${state.score}`, 30, 50);

    ctx.font = "18px sans-serif";
    ctx.fillStyle = "#ffffff88";
    ctx.fillText("Move your hands over circles to collect them!", 30, canvas.height - 30);
  },

  onCleanup: () => {
    state.circles = [];
    state.score = 0;
    state.lastSpawnTime = 0;
  }
};
