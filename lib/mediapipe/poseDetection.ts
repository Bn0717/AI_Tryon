// lib/mediapipe/poseDetection.ts
import { PoseLandmarker, FilesetResolver, PoseLandmarkerResult } from "@mediapipe/tasks-vision";

/**
 * Extracted body measurements from pose detection
 */
export interface BodyMeasurements {
  height: number;      // in cm
  shoulder: number;    // in cm
  chest: number;       // estimated in cm
  waist: number;       // estimated in cm
  torsoRatio: number;  // torso/height ratio
  confidence: number;  // 0-1
}

const calculateDistance = (
  point1: { x: number; y: number; z?: number },
  point2: { x: number; y: number; z?: number }
): number => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const dz = (point2.z || 0) - (point1.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

/**
 * Extract body measurements from Tasks-Vision results
 */
export const extractMeasurements = (
  results: PoseLandmarkerResult,
  imageWidth: number,
  imageHeight: number,
  userHeightCm?: number
): BodyMeasurements | null => {
  if (!results.landmarks || results.landmarks.length === 0) return null;

  const rawLandmarks = results.landmarks[0];

  // SCALE normalized coordinates to actual pixel coordinates
  const landmarks = rawLandmarks.map(lm => ({
    x: lm.x * imageWidth,
    y: lm.y * imageHeight,
    z: lm.z * imageWidth // Approximate depth scaling
  }));

  const NOSE = 0;
  const LEFT_SHOULDER = 11;
  const RIGHT_SHOULDER = 12;
  const LEFT_HIP = 23;
  const RIGHT_HIP = 24;
  const LEFT_ANKLE = 27;
  const RIGHT_ANKLE = 28;

  try {
    // 1. Calculate shoulder width in pixels
    const shoulderWidthPx = calculateDistance(landmarks[LEFT_SHOULDER], landmarks[RIGHT_SHOULDER]);

    // 2. Calculate body height in pixels (Nose to average of ankles)
    const leftHeightPx = calculateDistance(landmarks[NOSE], landmarks[LEFT_ANKLE]);
    const rightHeightPx = calculateDistance(landmarks[NOSE], landmarks[RIGHT_ANKLE]);
    const bodyHeightPx = (leftHeightPx + rightHeightPx) / 2;

    // 3. Determine Ratio (cm per pixel)
    // Use user-provided height or estimate based on average (170cm)
    const referenceHeight = (userHeightCm && userHeightCm > 50) ? userHeightCm : 170;
    const cmPerPixel = referenceHeight / bodyHeightPx;

    // 4. Convert pixels to CM
    const heightCm = referenceHeight;
    const shoulderCm = shoulderWidthPx * cmPerPixel;
    
    // Estimates for chest/waist (Standard tailoring ratios)
    const chestCm = shoulderCm * 2.15;
    const waistCm = shoulderCm * 1.9;

    // 5. Calculate torso ratio
    const shoulderMid = {
      x: (landmarks[LEFT_SHOULDER].x + landmarks[RIGHT_SHOULDER].x) / 2,
      y: (landmarks[LEFT_SHOULDER].y + landmarks[RIGHT_SHOULDER].y) / 2,
    };
    const hipMid = {
      x: (landmarks[LEFT_HIP].x + landmarks[RIGHT_HIP].x) / 2,
      y: (landmarks[LEFT_HIP].y + landmarks[RIGHT_HIP].y) / 2,
    };
    const torsoPx = calculateDistance(shoulderMid, hipMid);
    const torsoRatio = torsoPx / bodyHeightPx;

    return {
      height: Math.round(heightCm),
      shoulder: Math.round(shoulderCm),
      chest: Math.round(chestCm),
      waist: Math.round(waistCm),
      torsoRatio: parseFloat(torsoRatio.toFixed(2)),
      confidence: 1.0, // tasks-vision landmarks are generally high confidence if returned
    };
  } catch (error) {
    console.error('Error extracting measurements:', error);
    return null;
  }
};

/**
 * Initialize MediaPipe Pose Landmarker (Tasks-Vision)
 */
export const initializePoseLandmarker = async (): Promise<PoseLandmarker> => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  
  return await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task`,
      delegate: "GPU"
    },
    runningMode: "IMAGE",
    numPoses: 1
  });
};

/**
 * Process image and extract measurements
 */
export const processImage = async (
  imageElement: HTMLImageElement,
  userHeightCm?: number
): Promise<BodyMeasurements | null> => {
  try {
    const poseLandmarker = await initializePoseLandmarker();
    
    // Use naturalWidth/Height to get the real pixel dimensions of the photo
    const width = imageElement.naturalWidth;
    const height = imageElement.naturalHeight;

    const result = poseLandmarker.detect(imageElement);
    const measurements = extractMeasurements(result, width, height, userHeightCm);
    
    poseLandmarker.close();
    return measurements;
  } catch (error) {
    console.error("Pose detection failed:", error);
    return null;
  }
};