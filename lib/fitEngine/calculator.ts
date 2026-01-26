// lib/fitEngine/calculator.ts
import type { FitZone, FitResult } from '../types/fit';
import type { SizeChart } from '../types/clothing';
import { calculateFitZones, calculateConfidence } from '../utils/measurements';

/**
 * Fit calculation input
 */
export interface FitInput {
  userMeasurements: {
    height: number;
    chest: number;
    waist: number;
    shoulder: number;
  };
  sizeChart: SizeChart[];
  preferredFit?: 'slim' | 'regular' | 'relaxed';
}

/**
 * Detailed fit analysis for a specific size
 */
export interface SizeFitAnalysis {
  size: string;
  score: number;           // 0-100, higher is better
  fitZones: FitZone[];
  recommendationType: 'perfect' | 'good' | 'acceptable' | 'not-recommended';
  explanation: string;
}

/**
 * Calculate fit score for a specific size
 * Returns 0-100 score (higher is better)
 */
const calculateFitScore = (
  userMeasurements: { chest: number; waist: number; shoulder: number },
  garmentsSize: { chest: number; waist?: number; shoulder: number },
  preferredFit: 'slim' | 'regular' | 'relaxed' = 'regular'
): number => {
  let score = 100;

  // Ideal ease allowances (in cm)
  const easeTargets = {
    slim: { chest: 3, shoulder: 1, waist: 4 },
    regular: { chest: 5, shoulder: 2, waist: 6 },
    relaxed: { chest: 8, shoulder: 3, waist: 10 },
  };

  const ease = easeTargets[preferredFit];

  // Check chest fit (most important - 40% weight)
  const chestDiff = garmentsSize.chest - userMeasurements.chest;
  const chestDeviation = Math.abs(chestDiff - ease.chest);
  score -= chestDeviation * 4;

  // Check shoulder fit (30% weight)
  const shoulderDiff = garmentsSize.shoulder - userMeasurements.shoulder;
  const shoulderDeviation = Math.abs(shoulderDiff - ease.shoulder);
  score -= shoulderDeviation * 6;

  // Check waist fit (30% weight) if available
  if (garmentsSize.waist) {
    const waistDiff = garmentsSize.waist - userMeasurements.waist;
    const waistDeviation = Math.abs(waistDiff - ease.waist);
    score -= waistDeviation * 3;
  }

  return Math.max(0, Math.min(100, score));
};

/**
 * Analyze fit for all sizes and return detailed results
 */
export const analyzeFitForAllSizes = (input: FitInput): SizeFitAnalysis[] => {
  const { userMeasurements, sizeChart, preferredFit = 'regular' } = input;

  return sizeChart.map((size) => {
    // Calculate fit zones
    const fitZones = calculateFitZones(
      {
        chest: userMeasurements.chest,
        waist: userMeasurements.waist,
        shoulder: userMeasurements.shoulder,
      },
      {
        chest: size.chest,
        waist: size.waist,
        shoulder: size.shoulder,
        length: size.length,
      }
    );

    // Calculate fit score
    const score = calculateFitScore(
      userMeasurements,
      {
        chest: size.chest,
        waist: size.waist,
        shoulder: size.shoulder,
      },
      preferredFit
    );

    // Determine recommendation type
    let recommendationType: 'perfect' | 'good' | 'acceptable' | 'not-recommended';
    if (score >= 85) recommendationType = 'perfect';
    else if (score >= 70) recommendationType = 'good';
    else if (score >= 50) recommendationType = 'acceptable';
    else recommendationType = 'not-recommended';

    // Generate explanation
    const tightZones = fitZones.filter((z) => z.status === 'tight');
    const looseZones = fitZones.filter((z) => z.status === 'loose');

    let explanation = '';
    if (recommendationType === 'perfect') {
      explanation = `Perfect fit! All measurements align well with your ${preferredFit} fit preference.`;
    } else if (recommendationType === 'good') {
      explanation = `Good fit with minor adjustments. ${
        tightZones.length > 0
          ? `Slightly tight at ${tightZones.map((z) => z.area).join(', ')}.`
          : ''
      } ${
        looseZones.length > 0
          ? `Slightly loose at ${looseZones.map((z) => z.area).join(', ')}.`
          : ''
      }`;
    } else if (recommendationType === 'acceptable') {
      explanation = `Acceptable fit but not ideal. Consider trying a different size for better comfort.`;
    } else {
      explanation = `Not recommended. ${
        tightZones.length > 0
          ? `Too tight at ${tightZones.map((z) => z.area).join(', ')}.`
          : `Too loose at ${looseZones.map((z) => z.area).join(', ')}.`
      }`;
    }

    return {
      size: size.size,
      score: Math.round(score),
      fitZones,
      recommendationType,
      explanation,
    };
  });
};

/**
 * Get best size recommendation
 */
export const getBestSize = (input: FitInput): SizeFitAnalysis => {
  const analyses = analyzeFitForAllSizes(input);
  
  // Sort by score (highest first)
  analyses.sort((a, b) => b.score - a.score);
  
  return analyses[0];
};

/**
 * Generate complete fit result for storage
 */
export const generateFitResult = (
  userId: string,
  clothingItemId: string,
  input: FitInput
): Omit<FitResult, 'createdAt'> => {
  const bestFit = getBestSize(input);
  const confidence = calculateConfidence(bestFit.fitZones);

  return {
    id: `fit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    clothingItemId,
    recommendedSize: bestFit.size,
    fitZones: bestFit.fitZones,
    confidenceScore: confidence,
    explanation: bestFit.explanation,
  };
};