"use client";

import { useEffect, useRef } from "react";
import { BaseGame, GameContext } from "@/app/types/game";
import { usePoseDetection } from "@/app/hooks/usePoseDetection";
import { useHandDetection } from "@/app/hooks/useHandDetection";
import { useCamera } from "@/app/hooks/useCamera";
import { useLandmarkSmoothing } from "@/app/hooks/useLandmarkSmoothing";
import { usePoseInterpolation } from "@/app/hooks/usePoseInterpolation";

interface GameContainerProps {
  game: BaseGame;
}

export default function GameContainer({ game }: GameContainerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const detectionFrameRef = useRef<number | undefined>(undefined);
  const lastVideoTimeRef = useRef(-1);
  const gameInitializedRef = useRef(false);

  const useHands = game.metadata.useHandDetection || false;

  const { videoRef, isReady: cameraReady, error: cameraError } = useCamera();

  const { detectPose, isReady: poseReady, error: poseError } = usePoseDetection({
    modelType: "lite"
  });

  const { detectHands, isReady: handsReady, error: handsError } = useHandDetection({
    numHands: 2
  });

  const { smoothPoseData } = useLandmarkSmoothing();
  const { updatePoseData, getInterpolatedPose } = usePoseInterpolation();

  const error = cameraError || (useHands ? handsError : poseError);
  const isReady = cameraReady && (useHands ? handsReady : poseReady);

  // Initialize game
  useEffect(() => {
    if (!isReady || !canvasRef.current || !videoRef.current || gameInitializedRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context: GameContext = {
      canvas,
      ctx,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight
    };

    // Call game initialization
    game.onInit?.(context);
    gameInitializedRef.current = true;

    return () => {
      game.onCleanup?.();
      gameInitializedRef.current = false;
    };
  }, [isReady, game]);

  // Detection loop - runs when video frames update
  useEffect(() => {
    if (!isReady || !videoRef.current) return;

    const video = videoRef.current;

    function detectionLoop() {
      if (!video) return;

      const currentTime = video.currentTime;

      // Only detect when video time has changed
      if (currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = currentTime;

        let smoothedData;
        if (useHands) {
          // Detect hands (hand tracking already smooth, skip smoothing)
          const handData = detectHands(video, performance.now());
          smoothedData = handData ? {
            landmarks: handData.landmarks,
            worldLandmarks: handData.worldLandmarks,
            timestamp: performance.now()
          } : null;
        } else {
          // Detect pose and apply smoothing
          const rawPoseData = detectPose(video, performance.now());
          smoothedData = smoothPoseData(rawPoseData);
        }

        // Update interpolation with new data
        updatePoseData(smoothedData as any, performance.now());
      }

      detectionFrameRef.current = requestAnimationFrame(detectionLoop);
    }

    detectionLoop();

    return () => {
      if (detectionFrameRef.current) {
        cancelAnimationFrame(detectionFrameRef.current);
      }
    };
  }, [isReady, useHands, detectPose, detectHands, smoothPoseData, updatePoseData]);

  // Render loop - runs at 60fps
  useEffect(() => {
    if (!isReady || !canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    function renderLoop() {
      if (!canvas || !ctx) return;

      // Get interpolated pose data for current time
      const interpolatedPoseData = getInterpolatedPose(performance.now());

      // Create game context
      const context: GameContext = {
        canvas,
        ctx,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      };

      // Call game's frame handler with interpolated data
      game.onFrame(context, interpolatedPoseData);

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    }

    renderLoop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isReady, game, getInterpolatedPose]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="hidden"
        />
        <canvas
          ref={canvasRef}
          className="border-2 border-zinc-300 dark:border-zinc-700 rounded-lg max-w-full"
        />
      </div>
    </div>
  );
}
