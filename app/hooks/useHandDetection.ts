"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

interface UseHandDetectionOptions {
  numHands?: number;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
}

export interface HandLandmarks {
  landmarks: { x: number; y: number; z: number }[][];
  worldLandmarks: { x: number; y: number; z: number }[][];
  handedness: any[][];
  timestamp?: number;
}

export function useHandDetection(options: UseHandDetectionOptions = {}) {
  const {
    numHands = 2,
    minDetectionConfidence = 0.5,
    minTrackingConfidence = 0.5
  } = options;

  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [error, setError] = useState<string>("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initializeHandLandmarker() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands,
          minHandDetectionConfidence: minDetectionConfidence,
          minHandPresenceConfidence: minDetectionConfidence,
          minTrackingConfidence
        });

        setHandLandmarker(landmarker);
        setIsReady(true);
      } catch (err) {
        setError(`Failed to initialize hand detector: ${err}`);
        console.error(err);
      }
    }

    initializeHandLandmarker();

    return () => {
      handLandmarker?.close();
    };
  }, [numHands, minDetectionConfidence, minTrackingConfidence]);

  const detectHands = useCallback((video: HTMLVideoElement, timestamp: number): HandLandmarks | null => {
    if (!handLandmarker || !isReady) return null;

    try {
      const results = handLandmarker.detectForVideo(video, timestamp);

      return {
        landmarks: results.landmarks || [],
        worldLandmarks: results.worldLandmarks || [],
        handedness: results.handedness || [],
        timestamp
      };
    } catch (err) {
      console.error("Hand detection error:", err);
      return null;
    }
  }, [handLandmarker, isReady]);

  return {
    detectHands,
    isReady,
    error
  };
}
