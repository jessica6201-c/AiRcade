"use client";

import { useState, useEffect, useRef } from "react";
import GameContainer from "./components/GameContainer";
import GameSelection from "./components/GameSelection";
import { getAllGames } from "./games";
import { BaseGame } from "./types/game";
import { useHandDetection } from "@/app/hooks/useHandDetection";
import { useCamera } from "@/app/hooks/useCamera";

interface GridCell {
  x: number;
  y: number;
  brightness: number;
}

// MediaPipe hand landmark connections (hand skeleton)
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],           // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],           // Index
  [0, 9], [9, 10], [10, 11], [11, 12],      // Middle
  [0, 13], [13, 14], [14, 15], [15, 16],    // Ring
  [0, 17], [17, 18], [18, 19], [19, 20],    // Pinky
  [5, 9], [9, 13], [13, 17]                 // Palm
];

export default function Home() {
  const [selectedGame, setSelectedGame] = useState<BaseGame | null>(null);
  const games = getAllGames();

  // Hand tracking state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const { detectHands, isReady: handsReady } = useHandDetection({
    numHands: 2,
    minDetectionConfidence: 0.3,
    minTrackingConfidence: 0.3
  });
  const { videoRef: cameraRef, isReady: cameraReady, error: cameraError } = useCamera({
    width: 640,
    height: 480
  });

  const [gridSize, setGridSize] = useState({ cols: 0, rows: 0 });
  const cellSize = 50;
  const maxDistance = 200;

  // Initialize grid size
  useEffect(() => {
    const updateGridSize = () => {
      const cols = Math.ceil(window.innerWidth / cellSize);
      const rows = Math.ceil(window.innerHeight / cellSize);
      setGridSize({ cols, rows });
    };

    updateGridSize();
    window.addEventListener('resize', updateGridSize);
    return () => window.removeEventListener('resize', updateGridSize);
  }, []);

  // Animation loop - draw directly to canvas
  useEffect(() => {
    if (!handsReady || !cameraReady || cameraError || selectedGame) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const video = cameraRef.current;
    if (!video) return;

    videoRef.current = video;

    // Make sure video is playing
    video.play().catch(e => console.error('Video play error:', e));

    let frameCount = 0;

    const loop = () => {
      if (!video || selectedGame) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }

      frameCount++;
      if (frameCount % 60 === 0) {
        console.log('Loop running, frame:', frameCount, 'video ready:', video.readyState);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const handData = detectHands(video, performance.now());
      let points: { x: number; y: number }[] = [];
      let lines: { x1: number; y1: number; x2: number; y2: number }[] = [];

      if (handData && handData.landmarks && handData.landmarks.length > 0) {
        if (frameCount % 60 === 0) {
          console.log('Hand detected! Landmarks:', handData.landmarks.length);
        }

        for (const hand of handData.landmarks) {
          const screenPoints = hand.map((landmark: { x: number; y: number }) => ({
            x: (1 - landmark.x) * window.innerWidth,
            y: landmark.y * window.innerHeight
          }));

          points.push(...screenPoints);

          HAND_CONNECTIONS.forEach(([start, end]) => {
            lines.push({
              x1: screenPoints[start].x,
              y1: screenPoints[start].y,
              x2: screenPoints[end].x,
              y2: screenPoints[end].y
            });
          });
        }
      }

      // Draw grid
      const cols = Math.ceil(window.innerWidth / cellSize);
      const rows = Math.ceil(window.innerHeight / cellSize);

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const cellX = j * cellSize;
          const cellY = i * cellSize;
          const cellCenterX = cellX + cellSize / 2;
          const cellCenterY = cellY + cellSize / 2;

          let brightness = 0;

          if (points.length > 0) {
            let minDistanceToPoint = Infinity;
            let minDistanceToLine = Infinity;
            let pointInside = false;

            for (const point of points) {
              if (point.x >= cellX && point.x <= cellX + cellSize &&
                  point.y >= cellY && point.y <= cellY + cellSize) {
                pointInside = true;
                break;
              }

              const dist = Math.sqrt(
                Math.pow(point.x - cellCenterX, 2) +
                Math.pow(point.y - cellCenterY, 2)
              );
              minDistanceToPoint = Math.min(minDistanceToPoint, dist);
            }

            for (const line of lines) {
              const A = cellCenterX - line.x1;
              const B = cellCenterY - line.y1;
              const C = line.x2 - line.x1;
              const D = line.y2 - line.y1;

              const dot = A * C + B * D;
              const lenSq = C * C + D * D;
              let param = lenSq !== 0 ? dot / lenSq : -1;

              let xx, yy;
              if (param < 0) {
                xx = line.x1;
                yy = line.y1;
              } else if (param > 1) {
                xx = line.x2;
                yy = line.y2;
              } else {
                xx = line.x1 + param * C;
                yy = line.y1 + param * D;
              }

              const dx = cellCenterX - xx;
              const dy = cellCenterY - yy;
              const dist = Math.sqrt(dx * dx + dy * dy);
              minDistanceToLine = Math.min(minDistanceToLine, dist);
            }

            if (pointInside) {
              brightness = 1;
            } else {
              const minDistance = Math.min(minDistanceToPoint, minDistanceToLine);
              const normalizedDistance = Math.max(0, 1 - (minDistance / maxDistance));
              brightness = Math.pow(normalizedDistance, 1.5);
            }
          }

          // Draw cell
          if (brightness > 0.01) {
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            ctx.fillRect(cellX, cellY, cellSize, cellSize);
          }

          // Draw grid lines
          const lineOpacity = 0.15 + (brightness * 0.5);
          ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(cellX, cellY, cellSize, cellSize);
        }
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [handsReady, cameraReady, cameraError, selectedGame, detectHands]);

  const handleBackToMenu = () => {
    setSelectedGame(null);
  };

  const handleSelectGame = (game: BaseGame) => {
    setSelectedGame(game);
  };

  return (
    <div className="flex min-h-screen items-center justify-center font-sans relative bg-black overflow-hidden">
      {!selectedGame && (
        <canvas
          ref={canvasRef}
          width={gridSize.cols * cellSize}
          height={gridSize.rows * cellSize}
          className="absolute top-0 left-0 z-0"
        />
      )}
      <video
        ref={cameraRef}
        className="hidden"
        autoPlay
        playsInline
        muted
      />
      <main className="flex min-h-screen w-full flex-col items-center py-8 px-4 relative z-10">
        {selectedGame ? (
          <div className="w-full flex flex-col items-center gap-4">
            <button
              onClick={handleBackToMenu}
              className="self-start px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors border border-zinc-600"
            >
              ← Back to Menu
            </button>
            <GameContainer game={selectedGame} />
          </div>
        ) : (
          <GameSelection games={games} onSelectGame={handleSelectGame} />
        )}
      </main>
    </div>
  );
}
