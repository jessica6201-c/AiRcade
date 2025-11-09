import { NormalizedLandmark } from "@mediapipe/tasks-vision";

export interface Point {
  x: number;
  y: number;
}

export interface PinchState {
  isPinching: boolean;
  position: Point | null;
  distance: number;
}

export interface HandPinchStates {
  left: PinchState;
  right: PinchState;
}

const PINCH_THRESHOLD = 75; // Pixels, same as Air Canvas

export function calculateDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function getMidpoint(p1: Point, p2: Point): Point {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
  };
}

/**
 * Detects pinch gesture using MediaPipe Hand landmarks
 * Thumb tip (4) and index tip (8)
 * Matches Air Canvas implementation exactly
 */
export function detectHandPinch(
  landmarks: any[],
  canvasWidth: number,
  canvasHeight: number,
  mirror: boolean = true
): PinchState {
  if (!landmarks || landmarks.length < 9) {
    return {
      isPinching: false,
      position: null,
      distance: 0
    };
  }

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];

  if (!thumbTip || !indexTip) {
    return {
      isPinching: false,
      position: null,
      distance: 0
    };
  }

  // Convert to screen pixels (like Air Canvas)
  const thumbPoint: Point = {
    x: mirror ? (canvasWidth - thumbTip.x * canvasWidth) : (thumbTip.x * canvasWidth),
    y: thumbTip.y * canvasHeight
  };

  const indexPoint: Point = {
    x: mirror ? (canvasWidth - indexTip.x * canvasWidth) : (indexTip.x * canvasWidth),
    y: indexTip.y * canvasHeight
  };

  // Calculate distance in pixels
  const distance = calculateDistance(thumbPoint, indexPoint);
  const midpoint = getMidpoint(thumbPoint, indexPoint);

  // Adjust position slightly above midpoint (15px like Air Canvas)
  const adjustedPoint: Point = {
    x: midpoint.x,
    y: midpoint.y - 15
  };

  return {
    isPinching: distance < PINCH_THRESHOLD,
    position: adjustedPoint,
    distance
  };
}

/**
 * Detects pinch gesture for pose landmarks
 * MediaPipe Pose hand keypoints: 19 (L index), 20 (R index), 21 (L thumb), 22 (R thumb)
 */
export function detectPosePinch(
  thumb: NormalizedLandmark | undefined,
  index: NormalizedLandmark | undefined,
  canvasWidth: number,
  canvasHeight: number,
  mirror: boolean = true
): PinchState {
  if (!thumb || !index) {
    return {
      isPinching: false,
      position: null,
      distance: 0
    };
  }

  // Convert to screen pixels
  const thumbPoint: Point = {
    x: mirror ? (canvasWidth - thumb.x * canvasWidth) : (thumb.x * canvasWidth),
    y: thumb.y * canvasHeight
  };

  const indexPoint: Point = {
    x: mirror ? (canvasWidth - index.x * canvasWidth) : (index.x * canvasWidth),
    y: index.y * canvasHeight
  };

  // Calculate distance in pixels
  const distance = calculateDistance(thumbPoint, indexPoint);
  const midpoint = getMidpoint(thumbPoint, indexPoint);

  // Adjust position slightly above midpoint
  const adjustedPoint: Point = {
    x: midpoint.x,
    y: midpoint.y - 15
  };

  return {
    isPinching: distance < PINCH_THRESHOLD,
    position: adjustedPoint,
    distance
  };
}

/**
 * Detect pinch for both hands in a pose
 */
export function detectHandPinches(
  landmarks: NormalizedLandmark[],
  canvasWidth: number,
  canvasHeight: number,
  mirror: boolean = true
): HandPinchStates {
  if (!landmarks || landmarks.length < 23) {
    return {
      left: { isPinching: false, position: null, distance: 0 },
      right: { isPinching: false, position: null, distance: 0 }
    };
  }

  // Left hand: thumb (21) and index (19)
  const leftThumb = landmarks[21];
  const leftIndex = landmarks[19];

  // Right hand: thumb (22) and index (20)
  const rightThumb = landmarks[22];
  const rightIndex = landmarks[20];

  return {
    left: detectPosePinch(leftThumb, leftIndex, canvasWidth, canvasHeight, mirror),
    right: detectPosePinch(rightThumb, rightIndex, canvasWidth, canvasHeight, mirror)
  };
}
