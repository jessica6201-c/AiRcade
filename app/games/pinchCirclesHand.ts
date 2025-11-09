import { BaseGame, GameContext, HandData } from "@/app/types/game";
import { detectHandPinch } from "@/app/utils/gestures";

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
    id: "pinch-circles",
    name: "Pinch Circles",
    description: "Pinch your fingers and move over circles to collect them!",
    useHandDetection: true
  },

  onInit: (context: GameContext) => {
    state.circles = [];
    state.score = 0;
    state.lastSpawnTime = performance.now();

    for (let i = 0; i < 3; i++) {
      spawnCircle(context.canvas);
    }
  },

  onFrame: (context: GameContext, handData: HandData | null) => {
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

    if (handData && handData.landmarks.length > 0) {
      const colors = ["#ff0088", "#0088ff"];

      for (let i = 0; i < handData.landmarks.length; i++) {
        const hand = handData.landmarks[i];
        const pinch = detectHandPinch(hand, canvas.width, canvas.height);

        if (pinch.position) {
          const handX = pinch.position.x;
          const handY = pinch.position.y;

          if (pinch.isPinching) {
            ctx.fillStyle = colors[i % colors.length];
            ctx.beginPath();
            ctx.arc(handX, handY, 20, 0, Math.PI * 2);
            ctx.fill();

            state.circles.forEach(circle => {
              if (!circle.collected) {
                const dist = Math.sqrt(
                  Math.pow(handX - circle.x, 2) + Math.pow(handY - circle.y, 2)
                );
                if (dist < circle.radius + 20) {
                  circle.collected = true;
                  state.score++;
                }
              }
            });
          } else {
            ctx.strokeStyle = "#ffffff88";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(handX, handY, 15, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText(`Score: ${state.score}`, 30, 50);

    ctx.font = "18px sans-serif";
    ctx.fillStyle = "#ffffff88";
    ctx.fillText("Pinch your fingers and move over circles!", 30, canvas.height - 30);
  },

  onCleanup: () => {
    state.circles = [];
    state.score = 0;
    state.lastSpawnTime = 0;
  }
};
