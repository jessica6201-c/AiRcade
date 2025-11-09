"use client";

import { useEffect, useRef, useState } from "react";
import { usePoseDetection } from "@/app/hooks/usePoseDetection";
import { useCamera } from "@/app/hooks/useCamera";

interface GridCell {
  x: number;
  y: number;
  brightness: number;
}

interface InteractiveGridProps {
  onShowGames?: () => void;
}

export default function InteractiveGrid({ onShowGames }: InteractiveGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [gridCells, setGridCells] = useState<GridCell[][]>([]);
  const [isTracking, setIsTracking] = useState(false);

  const { detectPose, isReady: poseReady } = usePoseDetection({ modelType: "lite" });
  const { videoRef: cameraRef, isReady: cameraReady, error: cameraError } = useCamera({
    width: 640,
    height: 480
  });

  const gridSize = 20; // 20x20 grid
  const cellSize = 50;
  const maxDistance = 200; // Maximum distance for hand influence

  // Initialize grid cells
  useEffect(() => {
    const cells: GridCell[][] = [];
    for (let i = 0; i < gridSize; i++) {
      cells[i] = [];
      for (let j = 0; j < gridSize; j++) {
        cells[i][j] = {
          x: j * cellSize,
          y: i * cellSize,
          brightness: 0
        };
      }
    }
    setGridCells(cells);
  }, []);

  // Get hand landmark positions from pose data
  const getHandPositions = (poseData: any) => {
    const handPositions: { x: number; y: number }[] = [];

    if (poseData.landmarks && poseData.landmarks.length > 0) {
      poseData.landmarks.forEach((landmarks: any[]) => {
        // Right hand landmarks (indices 17-22: thumb, index, middle, ring, pinky)
        const rightHandIndex = landmarks[20]; // Index finger tip
        const leftHandIndex = landmarks[19];  // Left index finger tip

        if (rightHandIndex) {
          handPositions.push({
            x: (1 - rightHandIndex.x) * window.innerWidth,
            y: rightHandIndex.y * window.innerHeight
          });
        }

        if (leftHandIndex) {
          handPositions.push({
            x: (1 - leftHandIndex.x) * window.innerWidth,
            y: leftHandIndex.y * window.innerHeight
          });
        }
      });
    }

    return handPositions;
  };

  // Update grid brightness based on hand positions
  const updateGridBrightness = (handPositions: { x: number; y: number }[]) => {
    setGridCells(prevCells => {
      return prevCells.map((row, i) =>
        row.map((cell, j) => {
          let maxBrightness = 0;

          handPositions.forEach(hand => {
            const distance = Math.sqrt(
              Math.pow(hand.x - (cell.x + cellSize/2), 2) +
              Math.pow(hand.y - (cell.y + cellSize/2), 2)
            );

            // Calculate brightness based on distance (inverse relationship)
            const brightness = Math.max(0, 1 - (distance / maxDistance));
            maxBrightness = Math.max(maxBrightness, brightness);
          });

          return {
            ...cell,
            brightness: maxBrightness
          };
        })
      );
    });
  };

  // Animation loop
  const animate = () => {
    if (videoRef.current && poseReady && cameraReady) {
      const poseData = detectPose(videoRef.current, performance.now());

      if (poseData) {
        const handPositions = getHandPositions(poseData);
        updateGridBrightness(handPositions);
        setIsTracking(true);
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  // Start animation when ready
  useEffect(() => {
    if (poseReady && cameraReady && !cameraError) {
      videoRef.current = cameraRef.current;
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [poseReady, cameraReady, cameraError]);

  // Draw grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid cells
    gridCells.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell.brightness > 0) {
          // Create gradient effect based on brightness
          const intensity = Math.floor(cell.brightness * 255);
          const gradient = ctx.createRadialGradient(
            cell.x + cellSize/2, cell.y + cellSize/2, 0,
            cell.x + cellSize/2, cell.y + cellSize/2, cellSize/2
          );
          gradient.addColorStop(0, `rgba(255, 255, 255, ${cell.brightness})`);
          gradient.addColorStop(0.5, `rgba(200, 200, 255, ${cell.brightness * 0.5})`);
          gradient.addColorStop(1, `rgba(100, 100, 255, ${cell.brightness * 0.1})`);

          ctx.fillStyle = gradient;
          ctx.fillRect(cell.x, cell.y, cellSize, cellSize);
        }

        // Draw grid lines
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + cell.brightness * 0.3})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(cell.x, cell.y, cellSize, cellSize);
      });
    });

    // Draw status indicator
    if (isTracking) {
      ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
      ctx.fillRect(10, 10, 20, 20);
    } else if (cameraError) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.fillRect(10, 10, 20, 20);
    }
  }, [gridCells, isTracking, cameraError]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        width={gridSize * cellSize}
        height={gridSize * cellSize}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
      <video
        ref={cameraRef}
        className="hidden"
        playsInline
        muted
      />

      {/* Overlay content */}
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
        <div className="text-center text-white mb-8">
          <h1 className="text-6xl font-bold mb-4" style={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
            AirGame
          </h1>
          <p className="text-xl opacity-75" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
            Move your hands to light up the grid
          </p>
          {cameraError && (
            <p className="text-red-400 mt-4">
              Camera access denied. Enable camera to interact with the grid.
            </p>
          )}
        </div>
        {onShowGames && (
          <button
            onClick={onShowGames}
            className="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors border border-zinc-600 pointer-events-auto"
            style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}
          >
            Play Games →
          </button>
        )}
      </div>
    </div>
  );
}