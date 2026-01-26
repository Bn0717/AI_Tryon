// lib/utils/measurements.ts
import type { FitZone } from '../types/fit';

/**
 * Calculate torso ratio from height and torso length
 */
export const calculateTorsoRatio = (height: number, torsoLength: number): number => {
  return torsoLength / height;
};

/**
 * Estimate torso length from height (if not directly measured)
 * Average torso ratio is ~0.52 for adults
 */
export const estimateTorsoLength = (height: number): number => {
  return height * 0.52;
};

/**
 * Convert inches to centimeters
 */
export const inchesToCm = (inches: number): number => {
  return inches * 2.54;
};

/**
 * Convert centimeters to inches
 */
export const cmToInches = (cm: number): number => {
  return cm / 2.54;
};

/**
 * Recommend size based on measurements
 */
export const recommendSize = (
  userChest: number,
  userWaist: number,
  userShoulder: number,
  sizeChart: Array<{ size: string; chest: number; waist?: number; shoulder: number }>
): string => {
  let bestSize = sizeChart[0].size;
  let minDifference = Infinity;

  sizeChart.forEach(({ size, chest, waist, shoulder }) => {
    // Calculate total difference (weighted)
    const chestDiff = Math.abs(userChest - chest) * 2; // Chest is most important
    const shoulderDiff = Math.abs(userShoulder - shoulder) * 1.5;
    const waistDiff = waist ? Math.abs(userWaist - waist) : 0;

    const totalDiff = chestDiff + shoulderDiff + waistDiff;

    if (totalDiff < minDifference) {
      minDifference = totalDiff;
      bestSize = size;
    }
  });

  return bestSize;
};

/**
 * Calculate fit zones based on user measurements vs clothing measurements
 */
export const calculateFitZones = (
  userMeasurements: { chest: number; waist: number; shoulder: number },
  clothingMeasurements: { chest: number; waist?: number; shoulder: number; length: number }
): FitZone[] => {
  const fitZones: FitZone[] = [];

  // Chest fit (most important - allow 2-6cm ease)
  const chestDiff = clothingMeasurements.chest - userMeasurements.chest;
  fitZones.push({
    area: 'chest',
    status: chestDiff < -1 ? 'tight' : chestDiff > 6 ? 'loose' : 'good',
    difference: chestDiff,
  });

  // Shoulder fit (allow 1-4cm ease)
  const shoulderDiff = clothingMeasurements.shoulder - userMeasurements.shoulder;
  fitZones.push({
    area: 'shoulder',
    status: shoulderDiff < 0 ? 'tight' : shoulderDiff > 4 ? 'loose' : 'good',
    difference: shoulderDiff,
  });

  // Waist fit (if available - allow 3-8cm ease)
  if (clothingMeasurements.waist !== undefined) {
    const waistDiff = clothingMeasurements.waist - userMeasurements.waist;
    fitZones.push({
      area: 'waist',
      status: waistDiff < 0 ? 'tight' : waistDiff > 8 ? 'loose' : 'good',
      difference: waistDiff,
    });
  }

  // Length (placeholder - would require torso measurement for accuracy)
  fitZones.push({
    area: 'length',
    status: 'good',
    difference: 0,
  });

  return fitZones;
};

/**
 * Calculate confidence score for size recommendation
 */
export const calculateConfidence = (fitZones: FitZone[]): number => {
  if (fitZones.length === 0) return 0;
  
  const goodFits = fitZones.filter((zone) => zone.status === 'good').length;
  return goodFits / fitZones.length;
};