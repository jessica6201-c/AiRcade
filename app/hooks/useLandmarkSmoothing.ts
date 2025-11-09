"use client";

import { useRef } from "react";
import { PoseData, HandData } from "@/app/types/game";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";

interface SmoothingOptions {
  bufferSize?: number;
}

type LandmarkData = PoseData | HandData;

/**
 * Hook to smooth landmark positions using ring buffer averaging
 * Matches Air Canvas implementation: stores last N frames and averages them
 * Works with both pose and hand data
 */
export function useLandmarkSmoothing(options: SmoothingOptions = {}) {
  const { bufferSize = 5 } = options;

  const dataBuffer = useRef<LandmarkData[]>([]);

  const averageLandmarks = (
    landmarksBuffer: NormalizedLandmark[][]
  ): NormalizedLandmark[] => {
    if (landmarksBuffer.length === 0) return [];

    const numLandmarks = landmarksBuffer[0].length;
    const result: NormalizedLandmark[] = [];

    for (let i = 0; i < numLandmarks; i++) {
      let sumX = 0, sumY = 0, sumZ = 0;
      let lastVisibility = landmarksBuffer[landmarksBuffer.length - 1][i].visibility;

      for (const landmarks of landmarksBuffer) {
        sumX += landmarks[i].x;
        sumY += landmarks[i].y;
        sumZ += landmarks[i].z;
      }

      result.push({
        x: sumX / landmarksBuffer.length,
        y: sumY / landmarksBuffer.length,
        z: sumZ / landmarksBuffer.length,
        visibility: lastVisibility
      });
    }

    return result;
  };

  const smoothData = <T extends LandmarkData>(data: T | null): T | null => {
    if (!data) {
      dataBuffer.current = [];
      return null;
    }

    dataBuffer.current.push(data);
    if (dataBuffer.current.length > bufferSize) {
      dataBuffer.current.shift();
    }

    const smoothedLandmarks = data.landmarks.map((_, index) => {
      const landmarksAtIndex = dataBuffer.current
        .map(d => d.landmarks[index])
        .filter((landmarks): landmarks is NormalizedLandmark[] => landmarks !== undefined);

      if (landmarksAtIndex.length === 0) {
        return data.landmarks[index];
      }

      return averageLandmarks(landmarksAtIndex);
    });

    return {
      landmarks: smoothedLandmarks,
      worldLandmarks: data.worldLandmarks,
      timestamp: data.timestamp
    } as T;
  };

  const reset = () => {
    dataBuffer.current = [];
  };

  return {
    smoothData,
    smoothPoseData: smoothData,
    reset
  };
}
